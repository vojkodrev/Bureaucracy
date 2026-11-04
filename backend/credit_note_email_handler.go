package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type CreditNoteEmailHandler struct {
	print     *CreditNotePrintHandler
	customers *CustomerRepository
	sender    EmailSender
}

func NewCreditNoteEmailHandler(
	print *CreditNotePrintHandler,
	customers *CustomerRepository,
	sender EmailSender,
) *CreditNoteEmailHandler {
	return &CreditNoteEmailHandler{
		print:     print,
		customers: customers,
		sender:    sender,
	}
}

func (handler *CreditNoteEmailHandler) Send(context *gin.Context) {
	request, ok := parseDocumentEmailRequest(context)
	if !ok {
		return
	}
	note, year, ok := handler.print.load(context, true)
	if !ok {
		return
	}
	pdf, err := handler.print.generator.Generate(
		context.Request.Context(),
		creditNoteAsInvoice(note),
		year,
		CreditNotePrintDocument,
	)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{
			"error": "could not generate the credit note PDF",
		})
		return
	}

	storedRecipient := ""
	if customerCode := trimmedString(note.CustomerCode); customerCode != "" {
		customer, loadErr := handler.customers.GetByID(
			context.Request.Context(),
			context.PostForm("businessYear"),
			customerCode,
		)
		if loadErr != nil {
			context.JSON(http.StatusInternalServerError, gin.H{
				"error": "could not load credit note customer",
			})
			return
		}
		if customer != nil {
			storedRecipient = trimmedString(customer.Email)
		}
	}
	sendDocumentEmail(
		context,
		handler.sender,
		request,
		EmailAttachment{
			Filename:    creditNotePDFFilename(note, year),
			ContentType: "application/pdf",
			Data:        pdf,
		},
		storedRecipient,
	)
}
