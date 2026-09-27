package main

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type GoodsReceiptRepository struct{ database *sql.DB }

func NewGoodsReceiptRepository(database *sql.DB) *GoodsReceiptRepository {
	return &GoodsReceiptRepository{database: database}
}

func (repository *GoodsReceiptRepository) Search(
	ctx context.Context,
	businessYear string,
	productCode *string,
	productName *string,
	receivedFrom *time.Time,
	receivedTo *time.Time,
	sortBy *string,
	sortDirection *string,
	page int,
	pageSize int,
) (*GoodsReceiptPage, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	if page < 1 {
		return nil, fmt.Errorf("page must be at least 1")
	}
	if pageSize < 1 || pageSize > 10000 {
		return nil, fmt.Errorf("pageSize must be between 1 and 10000")
	}
	if receivedFrom != nil && receivedTo != nil && receivedFrom.After(*receivedTo) {
		return nil, fmt.Errorf("receivedFrom must not be after receivedTo")
	}
	orderBy, err := goodsReceiptOrderBy(sortBy, sortDirection)
	if err != nil {
		return nil, err
	}

	receiptDatabase := fmt.Sprintf("BIRO%s5", businessYear)
	inventoryDatabase := fmt.Sprintf("BIRO%s3", businessYear)
	arguments := []any{
		sql.Named("productCode", optionalLikePattern(productCode)),
		sql.Named("productName", optionalLikePattern(productName)),
		sql.Named("receivedFrom", nullableTime(receivedFrom)),
		sql.Named("receivedTo", nullableTime(receivedTo)),
	}
	filters := fmt.Sprintf(`
		WHERE (@receivedFrom IS NULL OR d.Datum >= @receivedFrom)
		  AND (@receivedTo IS NULL OR d.Datum < DATEADD(day, 1, @receivedTo))
		  AND ((@productCode = '' AND @productName = '') OR EXISTS (
		      SELECT 1
		      FROM [%s].[dbo].[DobavaSpecifikacija] ds
		      LEFT JOIN [%s].[dbo].[ArtikelNabava] inventory ON inventory.Artikel = ds.Artikel
		      WHERE ds.Stevilka = d.Stevilka
		        AND ISNULL(ds.MPO, '') = ISNULL(d.MPO, '')
		        AND ISNULL(ds.Deleted, 0) = 0
		        AND (@productCode = '' OR ds.Artikel LIKE @productCode ESCAPE '\')
		        AND (@productName = '' OR inventory.Opis LIKE @productName ESCAPE '\')
		  ))`, receiptDatabase, inventoryDatabase)

	var totalCount int
	err = repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT COUNT(*) FROM [%s].[dbo].[Dobava] d %s`, receiptDatabase, filters), arguments...).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("count goods receipts: %w", err)
	}

	arguments = append(arguments, sql.Named("offset", (page-1)*pageSize), sql.Named("pageSize", pageSize))
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT d.RecNo, COALESCE(d.Stevilka, ''), d.Datum,
		       COALESCE(NULLIF(LTRIM(RTRIM(d.Prevzemnik)), ''), NULLIF(LTRIM(RTRIM(d.Prevzel)), '')),
		       d.MPO
		FROM [%s].[dbo].[Dobava] d
		%s
		ORDER BY %s
		OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`, receiptDatabase, filters, orderBy), arguments...)
	if err != nil {
		return nil, fmt.Errorf("search goods receipts: %w", err)
	}
	defer rows.Close()

	type receiptKey struct {
		receipt *GoodsReceipt
		mpo     *string
	}
	receiptKeys := make([]receiptKey, 0)
	for rows.Next() {
		receipt := &GoodsReceipt{}
		var mpo *string
		if err := rows.Scan(&receipt.ID, &receipt.ReceiptNumber, &receipt.ReceiptDate, &receipt.ReceivedBy, &mpo); err != nil {
			return nil, fmt.Errorf("scan goods receipt: %w", err)
		}
		receipt.Items = make([]*GoodsReceiptItem, 0)
		receiptKeys = append(receiptKeys, receiptKey{receipt: receipt, mpo: mpo})
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read goods receipts: %w", err)
	}

	for _, key := range receiptKeys {
		itemRows, queryErr := repository.database.QueryContext(ctx, fmt.Sprintf(`
			SELECT ds.RecNo, ds.Artikel, inventory.Opis, inventory.Enota, ds.Kolicina
			FROM [%s].[dbo].[DobavaSpecifikacija] ds
			LEFT JOIN [%s].[dbo].[ArtikelNabava] inventory ON inventory.Artikel = ds.Artikel
			WHERE ds.Stevilka = @receiptNumber
			  AND ISNULL(ds.MPO, '') = ISNULL(@mpo, '')
			  AND ISNULL(ds.Deleted, 0) = 0
			ORDER BY ds.RecNo`, receiptDatabase, inventoryDatabase),
			sql.Named("receiptNumber", key.receipt.ReceiptNumber), sql.Named("mpo", key.mpo))
		if queryErr != nil {
			return nil, fmt.Errorf("get goods receipt items: %w", queryErr)
		}
		for itemRows.Next() {
			item := &GoodsReceiptItem{}
			if scanErr := itemRows.Scan(&item.ID, &item.ProductCode, &item.ProductName, &item.Unit, &item.Quantity); scanErr != nil {
				itemRows.Close()
				return nil, fmt.Errorf("scan goods receipt item: %w", scanErr)
			}
			key.receipt.Items = append(key.receipt.Items, item)
		}
		if rowsErr := itemRows.Err(); rowsErr != nil {
			itemRows.Close()
			return nil, fmt.Errorf("read goods receipt items: %w", rowsErr)
		}
		itemRows.Close()
	}

	receipts := make([]*GoodsReceipt, 0, len(receiptKeys))
	for _, key := range receiptKeys {
		receipts = append(receipts, key.receipt)
	}
	totalPages := 0
	if totalCount > 0 {
		totalPages = (totalCount + pageSize - 1) / pageSize
	}
	return &GoodsReceiptPage{GoodsReceipts: receipts, TotalCount: totalCount, Page: page, PageSize: pageSize, TotalPages: totalPages}, nil
}

func goodsReceiptOrderBy(sortBy *string, sortDirection *string) (string, error) {
	if sortBy == nil && sortDirection == nil {
		return "d.Datum DESC, d.RecNo DESC", nil
	}
	if sortBy == nil || sortDirection == nil {
		return "", fmt.Errorf("sortBy and sortDirection must be provided together")
	}
	columns := map[string]string{"receiptNumber": "d.Stevilka", "receiptDate": "d.Datum", "receivedBy": "d.Prevzemnik"}
	column, ok := columns[*sortBy]
	if !ok {
		return "", fmt.Errorf("invalid goods receipt sort column %q", *sortBy)
	}
	direction := strings.ToUpper(*sortDirection)
	if direction != "ASC" && direction != "DESC" {
		return "", fmt.Errorf("sortDirection must be asc or desc")
	}
	return column + " " + direction + ", d.RecNo " + direction, nil
}
