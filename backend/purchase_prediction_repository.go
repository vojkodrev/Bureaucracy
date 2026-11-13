package main

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"bureaucracy/backend/lib"
)

type PurchasePredictionRepository struct{ database *sql.DB }

func NewPurchasePredictionRepository(database *sql.DB) *PurchasePredictionRepository {
	return &PurchasePredictionRepository{database: database}
}

func (repository *PurchasePredictionRepository) Search(
	ctx context.Context,
	businessYear string,
	snapshotID *string,
	customerCode, customerName, productCode, productName *string,
	page, pageSize int,
) (*PurchasePredictionPage, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	if page < 1 || pageSize < 1 || pageSize > 10_000 {
		return nil, fmt.Errorf("invalid pagination")
	}

	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	trim := func(value *string) *string {
		if value == nil {
			return nil
		}
		trimmed := strings.TrimSpace(*value)
		if trimmed == "" {
			return nil
		}
		return &trimmed
	}
	customerCode, customerName = trim(customerCode), trim(customerName)
	productCode = trim(productCode)
	productNamePattern := lib.WordsLikePattern(productName)
	var runID *int64
	if snapshotID != nil && strings.TrimSpace(*snapshotID) != "" {
		parsed, err := strconv.ParseInt(strings.TrimSpace(*snapshotID), 10, 64)
		if err != nil || parsed < 1 {
			return nil, fmt.Errorf("invalid purchase prediction snapshot")
		}
		runID = &parsed
	}
	arguments := []any{
		sql.Named("runID", runID),
		sql.Named("customerCode", customerCode), sql.Named("customerName", customerName),
		sql.Named("productCode", productCode), sql.Named("productName", productNamePattern),
		sql.Named("offset", (page-1)*pageSize), sql.Named("pageSize", pageSize),
	}

	query := fmt.Sprintf(`
		DECLARE @resolvedRunID bigint = COALESCE(@runID, (
			SELECT TOP (1) id
			FROM [Bureaucracy].[dbo].[purchase_prediction_runs]
			ORDER BY as_of_date DESC, created_at_utc DESC, id DESC
		));
		WITH matching_customers AS (
			SELECT r.customer_code, MAX(r.score_7_days) highest_score_7_days
			FROM [Bureaucracy].[dbo].[purchase_prediction_rows] r
			LEFT JOIN [%s].[dbo].[Partner] c ON c.Sifra = r.customer_code
			LEFT JOIN [%s].[dbo].[Artikel] p ON p.Artikel = r.product_code
			WHERE r.run_id = @resolvedRunID
				AND (@customerCode IS NULL OR r.customer_code LIKE '%%' + @customerCode + '%%')
				AND (@customerName IS NULL OR c.Partner LIKE '%%' + @customerName + '%%')
				AND (@productCode IS NULL OR r.product_code LIKE '%%' + @productCode + '%%')
				AND (@productName = '' OR p.Opis LIKE @productName ESCAPE '\')
			GROUP BY r.customer_code
		), paged AS (
			SELECT customer_code FROM matching_customers
			ORDER BY highest_score_7_days DESC, customer_code
			OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
		)
		SELECT r.id, r.customer_code, c.Partner customer_name,
			r.product_code, p.Opis product_name,
			r.days_since_pair_last_purchase, r.pair_mean_interval_days,
			r.score_7_days, r.score_14_days, r.score_30_days
		FROM [Bureaucracy].[dbo].[purchase_prediction_rows] r
		INNER JOIN paged pg ON pg.customer_code = r.customer_code
		LEFT JOIN [%s].[dbo].[Partner] c ON c.Sifra = r.customer_code
		LEFT JOIN [%s].[dbo].[Artikel] p ON p.Artikel = r.product_code
		WHERE r.run_id = @resolvedRunID
		ORDER BY MAX(r.score_7_days) OVER (PARTITION BY r.customer_code) DESC,
			r.customer_code, r.score_7_days DESC, r.product_code`,
		databaseName,
		databaseName,
		databaseName,
		databaseName,
	)

	var totalCount int
	countQuery := fmt.Sprintf(`
		DECLARE @resolvedRunID bigint = COALESCE(@runID, (
			SELECT TOP (1) id
			FROM [Bureaucracy].[dbo].[purchase_prediction_runs]
			ORDER BY as_of_date DESC, created_at_utc DESC, id DESC));
		SELECT COUNT(DISTINCT r.customer_code)
		FROM [Bureaucracy].[dbo].[purchase_prediction_rows] r
		LEFT JOIN [%s].[dbo].[Partner] c ON c.Sifra = r.customer_code
		LEFT JOIN [%s].[dbo].[Artikel] p ON p.Artikel = r.product_code
		WHERE r.run_id = @resolvedRunID
			AND (@customerCode IS NULL OR r.customer_code LIKE '%%' + @customerCode + '%%')
			AND (@customerName IS NULL OR c.Partner LIKE '%%' + @customerName + '%%')
			AND (@productCode IS NULL OR r.product_code LIKE '%%' + @productCode + '%%')
			AND (@productName = '' OR p.Opis LIKE @productName ESCAPE '\')`, databaseName, databaseName)
	countRow := repository.database.QueryRowContext(
		ctx, countQuery, arguments...,
	)
	if err := countRow.Scan(&totalCount); err != nil {
		return nil, fmt.Errorf("count purchase prediction customers: %w", err)
	}

	rows, err := repository.database.QueryContext(ctx, query, arguments...)
	if err != nil {
		return nil, fmt.Errorf("search purchase predictions: %w", err)
	}
	defer rows.Close()
	predictions := make([]*PurchasePrediction, 0)
	for rows.Next() {
		prediction := &PurchasePrediction{}
		if err := rows.Scan(
			&prediction.ID, &prediction.CustomerCode, &prediction.CustomerName,
			&prediction.ProductCode, &prediction.ProductName,
			&prediction.DaysSinceLastOrder,
			&prediction.AverageOrderFrequencyDays,
			&prediction.Score7Days,
			&prediction.Score14Days, &prediction.Score30Days,
		); err != nil {
			return nil, fmt.Errorf("scan purchase prediction: %w", err)
		}
		predictions = append(predictions, prediction)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read purchase predictions: %w", err)
	}
	var resolvedRunID int64
	var asOfDate time.Time
	metadataRow := repository.database.QueryRowContext(ctx, `SELECT TOP (1) id, as_of_date
		FROM [Bureaucracy].[dbo].[purchase_prediction_runs]
		WHERE (@runID IS NULL OR id = @runID)
		ORDER BY as_of_date DESC, created_at_utc DESC, id DESC`, sql.Named("runID", runID))
	if err := metadataRow.Scan(&resolvedRunID, &asOfDate); err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("purchase prediction snapshot not found")
		}
		return nil, fmt.Errorf("read purchase prediction snapshot: %w", err)
	}
	return &PurchasePredictionPage{Predictions: predictions, SnapshotID: strconv.FormatInt(resolvedRunID, 10), SnapshotName: asOfDate.Format("2006-01-02"), TotalCount: totalCount,
		Page: page, PageSize: pageSize, TotalPages: int(math.Ceil(float64(totalCount) / float64(pageSize)))}, nil
}

func (repository *PurchasePredictionRepository) ListSnapshots(ctx context.Context) ([]*PurchasePredictionSnapshot, error) {
	rows, err := repository.database.QueryContext(ctx, `SELECT id, as_of_date
		FROM [Bureaucracy].[dbo].[purchase_prediction_runs]
		ORDER BY as_of_date DESC, created_at_utc DESC, id DESC`)
	if err != nil {
		return nil, fmt.Errorf("list purchase prediction snapshots: %w", err)
	}
	defer rows.Close()
	snapshots := make([]*PurchasePredictionSnapshot, 0)
	for rows.Next() {
		var id int64
		var asOfDate time.Time
		if err := rows.Scan(&id, &asOfDate); err != nil {
			return nil, fmt.Errorf("scan purchase prediction snapshot: %w", err)
		}
		snapshots = append(snapshots, &PurchasePredictionSnapshot{ID: strconv.FormatInt(id, 10), Name: asOfDate.Format("2006-01-02")})
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read purchase prediction snapshots: %w", err)
	}
	return snapshots, nil
}
