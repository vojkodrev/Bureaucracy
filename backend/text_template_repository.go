package main

import (
	"context"
	"database/sql"
	"fmt"
)

type TextTemplate struct {
	IntroductoryText *string `json:"introductoryText"`
	ClosingText      *string `json:"closingText"`
}

type TextTemplateRepository struct{ database *sql.DB }

func NewTextTemplateRepository(database *sql.DB) *TextTemplateRepository {
	return &TextTemplateRepository{database: database}
}

func (repository *TextTemplateRepository) Get(
	ctx context.Context,
	businessYear string,
	documentType string,
) (*TextTemplate, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}

	introductoryCondition, closingCondition, includePaymentReference, err := textTemplateConditions(documentType)
	if err != nil {
		return nil, err
	}
	closingText := "CAST(TextKlavzule AS nvarchar(max))"
	if includePaymentReference {
		closingText = `CASE WHEN ISNULL(Sklic, 0) <> 0
			THEN N'Pri plačilu se sklicujte na številko #ŠTEVILKA# !'
				+ NCHAR(13) + NCHAR(10) + COALESCE(CAST(TextKlavzule AS nvarchar(max)), N'')
			ELSE CAST(TextKlavzule AS nvarchar(max)) END`
	}

	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	template := &TextTemplate{}
	err = repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT
			(SELECT TOP 1 CAST(TextKlavzule AS nvarchar(max)) FROM [%s].[dbo].[Klavzule]
			 WHERE %s ORDER BY RecNo),
			(SELECT TOP 1 %s FROM [%s].[dbo].[Klavzule]
			 WHERE %s ORDER BY RecNo)`,
		databaseName, introductoryCondition, closingText, databaseName, closingCondition,
	)).Scan(&template.IntroductoryText, &template.ClosingText)
	if err != nil {
		return nil, fmt.Errorf("get %s text template: %w", documentType, err)
	}
	return template, nil
}

func textTemplateConditions(documentType string) (string, string, bool, error) {
	switch documentType {
	case "INVOICE":
		return "ISNULL(UvodRacun, 0) <> 0", "ISNULL(KonecRacun, 0) <> 0", true, nil
	case "PRICE_QUOTE":
		return "ISNULL(UvodPredracun, 0) <> 0", "ISNULL(KonecPredracun, 0) <> 0", true, nil
	case "DELIVERY_NOTE":
		return "ISNULL(UvodDobavnica, 0) <> 0", "ISNULL(KonecDobavnica, 0) <> 0", false, nil
	case "CREDIT_NOTE":
		return "Vrsta = N'UvodDobropis'", "Vrsta = N'KonecDobropis'", false, nil
	default:
		return "", "", false, fmt.Errorf("unsupported text template document type %q", documentType)
	}
}
