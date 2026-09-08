package main

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type AccountingExportRow struct {
	IssueDate       sql.NullTime
	ServiceDate     sql.NullTime
	DueDate         sql.NullTime
	InvoiceNumber   sql.NullString
	InvoiceGross    sql.NullFloat64
	InvoiceTax      sql.NullFloat64
	InvoiceNet      sql.NullFloat64
	ItemGross       sql.NullFloat64
	ItemTax         sql.NullFloat64
	ItemNet         sql.NullFloat64
	ItemDescription sql.NullString
	CustomerTaxID   sql.NullString
	CustomerName    sql.NullString
	ProductCode     sql.NullString
}

type AccountingExportRepository struct {
	database *sql.DB
}

func NewAccountingExportRepository(database *sql.DB) *AccountingExportRepository {
	return &AccountingExportRepository{database: database}
}

func (repository *AccountingExportRepository) List(
	ctx context.Context,
	businessYear string,
	month time.Month,
	year int,
) ([]AccountingExportRow, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	if month < time.January || month > time.December {
		return nil, fmt.Errorf("month must be between 1 and 12")
	}
	if year < 1 || year > 9999 {
		return nil, fmt.Errorf("year must be between 1 and 9999")
	}

	invoiceDatabaseName := fmt.Sprintf("BIRO%s5", businessYear)
	masterDataDatabaseName := fmt.Sprintf("BIRO%s3", businessYear)
	from := time.Date(year, month, 1, 0, 0, 0, 0, time.Local)
	to := from.AddDate(0, 1, 0)
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT
			rac.DatumIzstavitve,
			rac.DatumDUR,
			rac.DatumZapadlosti,
			rac.Stevilka,
			rac.Znesek,
			(rac.Znesek / 1.22) * 0.22,
			rac.Znesek / 1.22,
			racspec.Znesek,
			(racspec.ZnesekBrezDavka - (racspec.ZnesekBrezDavka * (racspec.Rabat / 100))) * 0.22,
			racspec.ZnesekBrezDavka - (racspec.ZnesekBrezDavka * (racspec.Rabat / 100)),
			art.Opis,
			par.IDStevilka,
			rac.ImePartnerja,
			racspec.Artikel
		FROM [%s].[dbo].[Racuni] rac
		LEFT JOIN [%s].[dbo].[RacuniSpecifikacija] racspec ON racspec.Stevilka = rac.Stevilka
		LEFT JOIN [%s].[dbo].[Partner] par ON rac.SifraPartnerja = par.Sifra
		LEFT JOIN [%s].[dbo].[Artikel] art ON art.Artikel = racspec.Artikel
		WHERE rac.DatumIzstavitve >= @from AND rac.DatumIzstavitve < @to
		ORDER BY rac.Stevilka`, invoiceDatabaseName, invoiceDatabaseName, masterDataDatabaseName, masterDataDatabaseName),
		sql.Named("from", from),
		sql.Named("to", to),
	)
	if err != nil {
		return nil, fmt.Errorf("query accounting export: %w", err)
	}
	defer rows.Close()

	result := make([]AccountingExportRow, 0)
	for rows.Next() {
		var row AccountingExportRow
		if err := rows.Scan(
			&row.IssueDate, &row.ServiceDate, &row.DueDate, &row.InvoiceNumber,
			&row.InvoiceGross, &row.InvoiceTax, &row.InvoiceNet,
			&row.ItemGross, &row.ItemTax, &row.ItemNet, &row.ItemDescription,
			&row.CustomerTaxID, &row.CustomerName, &row.ProductCode,
		); err != nil {
			return nil, fmt.Errorf("scan accounting export: %w", err)
		}
		result = append(result, row)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read accounting export: %w", err)
	}
	return result, nil
}

func accountingAccount(productCode string) string {
	code := strings.TrimSpace(productCode)
	if code == "0109" || code == "0377" {
		return "760100"
	}
	for _, specialCode := range strings.Split("0188,0030,0159,0133,0253,0005,0012,0026,0011,0341,0308,0309,0230,0130,0019,0268,0240,0241,0278,0370,0034,0239,0302,0288,0192,0259,0035,0261,0129,0387,0269,0333,0286,0339,0331,0248,0283,0094,0096,0091,0095,0119,0284,0346,0093,0042,0092,0371,0110,0260,0174,0170,0237,0020,0121,0161,0216,0006,0186,0184,0236,0307,0235,0183,0031,0033,0032,0231,0211", ",") {
		if code == specialCode {
			return "762000"
		}
	}
	return "760000"
}
