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

	introductoryFlag, closingFlag, includePaymentReference, err := textTemplateColumns(documentType)
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
			 WHERE ISNULL(%s, 0) <> 0 ORDER BY RecNo),
			(SELECT TOP 1 %s FROM [%s].[dbo].[Klavzule]
			 WHERE ISNULL(%s, 0) <> 0 ORDER BY RecNo)`,
		databaseName, introductoryFlag, closingText, databaseName, closingFlag,
	)).Scan(&template.IntroductoryText, &template.ClosingText)
	if err != nil {
		return nil, fmt.Errorf("get %s text template: %w", documentType, err)
	}
	return template, nil
}

func textTemplateColumns(documentType string) (string, string, bool, error) {
	switch documentType {
	case "INVOICE":
		return "UvodRacun", "KonecRacun", true, nil
	case "PRICE_QUOTE":
		return "UvodPredracun", "KonecPredracun", true, nil
	case "DELIVERY_NOTE":
		return "UvodDobavnica", "KonecDobavnica", false, nil
	case "CREDIT_NOTE":
		return "UvodDobropis", "KonecDobropis", false, nil
	default:
		return "", "", false, fmt.Errorf("unsupported text template document type %q", documentType)
	}
}
