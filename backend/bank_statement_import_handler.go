package main

import (
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"bureaucracy/backend/graph/model"
	"github.com/gin-gonic/gin"
)

const (
	maxBankStatementImportSize = 100 << 20
	maxBankStatementFileSize   = 5 << 20
	maxBankStatementFiles      = 50
)

type camtDocument struct {
	Statements []camtStatement `xml:"BkToCstmrStmt>Stmt"`
}

type camtStatement struct {
	CreationDate string `xml:"CreDtTm"`
	Account      struct {
		IBAN string `xml:"Id>IBAN"`
	} `xml:"Acct"`
	Balances []struct {
		Code string `xml:"Tp>CdOrPrtry>Cd"`
		Date string `xml:"Dt>Dt"`
	} `xml:"Bal"`
	Entries []camtEntry `xml:"Ntry"`
}

type camtEntry struct {
	Amount    string `xml:"Amt"`
	Direction string `xml:"CdtDbtInd"`
	Details   struct {
		Transactions []camtTransaction `xml:"TxDtls"`
	} `xml:"NtryDtls"`
}

type camtTransaction struct {
	AmountDetails struct {
		TransactionAmount struct {
			Amount string `xml:"Amt"`
		} `xml:"TxAmt"`
	} `xml:"AmtDtls"`
	RelatedParties struct {
		Debtor   camtParty `xml:"Dbtr"`
		Creditor camtParty `xml:"Cdtr"`
	} `xml:"RltdPties"`
	RemittanceInformation struct {
		Unstructured []string `xml:"Ustrd"`
		Structured   []struct {
			CreditorReference               string   `xml:"CdtrRefInf>Ref"`
			AdditionalRemittanceInformation []string `xml:"AddtlRmtInf"`
		} `xml:"Strd"`
	} `xml:"RmtInf"`
}

type camtParty struct {
	Name string `xml:"Nm"`
}

type parsedBankStatement struct {
	FileName      string
	SourceOrder   int
	StatementDate string
	IBAN          string
	Entries       []*model.BankStatementEntryInput
}

type bankStatementImportResult struct {
	FileName         string   `json:"fileName"`
	StatementDate    *string  `json:"statementDate"`
	StatementNumber  *int     `json:"statementNumber"`
	BankAccount      *string  `json:"bankAccount"`
	TransactionCount *int     `json:"transactionCount"`
	Outflow          *float64 `json:"outflow"`
	Inflow           *float64 `json:"inflow"`
	Status           string   `json:"status"`
	Error            string   `json:"error,omitempty"`
}

type BankStatementImportHandler struct {
	statements *BankStatementRepository
}

func NewBankStatementImportHandler(statements *BankStatementRepository) *BankStatementImportHandler {
	return &BankStatementImportHandler{statements: statements}
}

func (handler *BankStatementImportHandler) Handle(context *gin.Context) {
	context.Request.Body = http.MaxBytesReader(context.Writer, context.Request.Body, maxBankStatementImportSize)
	if err := context.Request.ParseMultipartForm(maxBankStatementImportSize); err != nil {
		context.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "bank statement import must be at most 100 MiB"})
		return
	}
	if context.Request.MultipartForm != nil {
		defer context.Request.MultipartForm.RemoveAll()
	}
	businessYear := strings.TrimSpace(context.PostForm("businessYear"))
	if !businessYearPattern.MatchString(businessYear) {
		context.JSON(http.StatusBadRequest, gin.H{"error": "a valid business year is required"})
		return
	}
	files := context.Request.MultipartForm.File["files"]
	if len(files) == 0 {
		context.JSON(http.StatusBadRequest, gin.H{"error": "at least one XML file is required"})
		return
	}
	if len(files) > maxBankStatementFiles {
		context.JSON(http.StatusBadRequest, gin.H{"error": "at most 50 XML files are allowed"})
		return
	}

	parsed := make([]parsedBankStatement, 0, len(files))
	results := make([]bankStatementImportResult, 0, len(files))
	for fileIndex, header := range files {
		filename := safeUploadFilename(header.Filename)
		if header.Size > maxBankStatementFileSize {
			results = append(results, failedImportResult(filename, fmt.Sprintf("%s must be at most 5 MiB", filename)))
			continue
		}
		if !strings.HasSuffix(strings.ToLower(filename), ".xml") {
			results = append(results, failedImportResult(filename, fmt.Sprintf("%s is not an XML file", filename)))
			continue
		}
		file, err := header.Open()
		if err != nil {
			results = append(results, failedImportResult(filename, "Could not read the XML file"))
			continue
		}
		data, readErr := io.ReadAll(io.LimitReader(file, maxBankStatementFileSize+1))
		file.Close()
		if readErr != nil || len(data) > maxBankStatementFileSize {
			results = append(results, failedImportResult(filename, fmt.Sprintf("%s must be at most 5 MiB", filename)))
			continue
		}
		statements, parseErr := parseBankStatementXML(data, filename, fileIndex)
		if parseErr != nil {
			results = append(results, failedImportResult(filename, parseErr.Error()))
			continue
		}
		parsed = append(parsed, statements...)
	}

	sort.SliceStable(parsed, func(left, right int) bool {
		if parsed[left].StatementDate == parsed[right].StatementDate {
			return parsed[left].SourceOrder < parsed[right].SourceOrder
		}
		return parsed[left].StatementDate < parsed[right].StatementDate
	})
	latest, err := handler.statements.LatestNumber(context.Request.Context(), businessYear, nil)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "could not determine the next bank statement number"})
		return
	}
	nextNumber := 1
	if latest != nil {
		nextNumber = *latest + 1
	}

	for _, statement := range parsed {
		statementDate, _ := time.Parse("2006-01-02", statement.StatementDate)
		outflow, inflow := importEntryTotals(statement.Entries)
		transactionCount := len(statement.Entries)
		duplicate, duplicateErr := handler.statements.ExistsOnDate(
			context.Request.Context(), businessYear, statementDate,
		)
		if duplicateErr != nil || duplicate {
			message := fmt.Sprintf("A bank statement for %s already exists", statement.StatementDate)
			if duplicateErr != nil {
				message = duplicateErr.Error()
			}
			results = append(results, bankStatementImportResult{
				FileName: statement.FileName, StatementDate: &statement.StatementDate,
				TransactionCount: &transactionCount, Outflow: &outflow, Inflow: &inflow,
				Status: "Failed", Error: message,
			})
			continue
		}
		attemptedNumber := nextNumber
		saved, saveErr := handler.statements.Save(context.Request.Context(), businessYear, model.BankStatementInput{
			StatementNumber: attemptedNumber, StatementDate: statementDate,
			BankAccount: statement.IBAN, Entries: statement.Entries,
		})
		result := bankStatementImportResult{
			FileName: statement.FileName, StatementDate: &statement.StatementDate,
			StatementNumber: &attemptedNumber, TransactionCount: &transactionCount,
			Outflow: &outflow, Inflow: &inflow,
		}
		if saveErr != nil {
			result.Status = "Failed"
			result.Error = saveErr.Error()
			results = append(results, result)
			continue
		}
		result.Status = "Imported"
		result.StatementNumber = saved.StatementNumber
		result.BankAccount = saved.BankAccount
		results = append(results, result)
		nextNumber++
	}
	context.JSON(http.StatusOK, gin.H{"results": results})
}

func failedImportResult(filename, message string) bankStatementImportResult {
	return bankStatementImportResult{FileName: filename, Status: "Failed", Error: message}
}

func parseBankStatementXML(data []byte, filename string, fileIndex int) ([]parsedBankStatement, error) {
	var document camtDocument
	if err := xml.Unmarshal(data, &document); err != nil {
		return nil, fmt.Errorf("file is not valid XML: %w", err)
	}
	if len(document.Statements) == 0 {
		return nil, fmt.Errorf("no ISO 20022 bank statement was found")
	}
	statements := make([]parsedBankStatement, 0, len(document.Statements))
	for statementIndex, source := range document.Statements {
		date := strings.TrimSpace(source.CreationDate)
		for _, balance := range source.Balances {
			if strings.TrimSpace(balance.Code) == "CLBD" && strings.TrimSpace(balance.Date) != "" {
				date = balance.Date
				break
			}
		}
		if len(date) >= 10 {
			date = date[:10]
		}
		if _, err := time.Parse("2006-01-02", date); err != nil {
			return nil, fmt.Errorf("statement date is missing or invalid")
		}
		iban := normalizeBankAccountNumber(source.Account.IBAN)
		if !isIBAN(iban) {
			return nil, fmt.Errorf("statement IBAN is missing or invalid")
		}
		entries := make([]*model.BankStatementEntryInput, 0, len(source.Entries))
		for entryIndex, sourceEntry := range source.Entries {
			parsedEntries, err := parseCamtEntry(sourceEntry)
			if err != nil {
				return nil, fmt.Errorf("transaction %d: %w", entryIndex+1, err)
			}
			entries = append(entries, parsedEntries...)
		}
		statements = append(statements, parsedBankStatement{
			FileName: filename, SourceOrder: fileIndex*1000 + statementIndex,
			StatementDate: date, IBAN: iban, Entries: entries,
		})
	}
	return statements, nil
}

func parseCamtEntry(source camtEntry) ([]*model.BankStatementEntryInput, error) {
	direction := strings.TrimSpace(source.Direction)
	if direction != "CRDT" && direction != "DBIT" {
		return nil, fmt.Errorf("unsupported direction %q", direction)
	}
	entryAmount, err := parseCamtAmount(source.Amount)
	if err != nil {
		return nil, err
	}
	transactions := source.Details.Transactions
	if len(transactions) == 0 {
		transactions = []camtTransaction{{}}
	}
	entries := make([]*model.BankStatementEntryInput, 0, len(transactions))
	for _, transaction := range transactions {
		amount := entryAmount
		if transactionAmount := strings.TrimSpace(transaction.AmountDetails.TransactionAmount.Amount); transactionAmount != "" {
			amount, err = parseCamtAmount(transactionAmount)
			if err != nil {
				return nil, err
			}
		} else if len(transactions) > 1 {
			return nil, fmt.Errorf("split transaction amount is missing")
		}
		name := strings.TrimSpace(transaction.RelatedParties.Creditor.Name)
		if direction == "CRDT" {
			name = strings.TrimSpace(transaction.RelatedParties.Debtor.Name)
		}
		name = truncateRunes(name, maxBankStatementCustomerNameLength)
		entry := &model.BankStatementEntryInput{}
		if name != "" {
			entry.CustomerName = &name
		}
		reference, purpose := camtRemittanceDetails(transaction)
		entry.Reference = reference
		entry.Purpose = purpose
		if direction == "CRDT" {
			entry.Inflow = &amount
		} else {
			entry.Outflow = &amount
		}
		entries = append(entries, entry)
	}
	return entries, nil
}

func camtRemittanceDetails(transaction camtTransaction) (*string, *string) {
	var reference string
	purposeParts := make([]string, 0)
	for _, value := range transaction.RemittanceInformation.Unstructured {
		if value = strings.TrimSpace(value); value != "" {
			purposeParts = append(purposeParts, value)
		}
	}
	for _, structured := range transaction.RemittanceInformation.Structured {
		if reference == "" {
			reference = strings.TrimSpace(structured.CreditorReference)
		}
		for _, value := range structured.AdditionalRemittanceInformation {
			if value = strings.TrimSpace(value); value != "" {
				purposeParts = append(purposeParts, value)
			}
		}
	}
	// BankaZR.Sklic stores the reference without the Slovenian country/model
	// prefix and is limited to 13 characters.
	if len(reference) >= 4 && strings.EqualFold(reference[:2], "SI") {
		if _, err := strconv.Atoi(reference[2:4]); err == nil {
			reference = reference[4:]
		}
	}
	reference = normalizeBankStatementReference(reference)
	var referenceValue, purposeValue *string
	if reference != "" {
		referenceValue = &reference
	}
	if purpose := strings.Join(purposeParts, " "); purpose != "" {
		purposeValue = &purpose
	}
	return referenceValue, purposeValue
}

func parseCamtAmount(value string) (float64, error) {
	amount, err := strconv.ParseFloat(strings.TrimSpace(value), 64)
	if err != nil || amount < 0 {
		return 0, fmt.Errorf("invalid amount %q", value)
	}
	return amount, nil
}

func importEntryTotals(entries []*model.BankStatementEntryInput) (float64, float64) {
	var outflow, inflow float64
	for _, entry := range entries {
		if entry.Outflow != nil {
			outflow += *entry.Outflow
		}
		if entry.Inflow != nil {
			inflow += *entry.Inflow
		}
	}
	return outflow, inflow
}
