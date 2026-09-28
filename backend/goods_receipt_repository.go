package main

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"strings"
	"time"

	"bureaucracy/backend/graph/model"
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
		SELECT d.RecNo, COALESCE(d.Stevilka, ''), d.Datum, NULLIF(LTRIM(RTRIM(d.Skladisce)), ''),
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
		if err := rows.Scan(&receipt.ID, &receipt.ReceiptNumber, &receipt.ReceiptDate, &receipt.Storage, &receipt.ReceivedBy, &mpo); err != nil {
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

func (repository *GoodsReceiptRepository) GetByNumber(ctx context.Context, businessYear string, receiptNumber string) (*GoodsReceipt, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	receiptNumber = strings.TrimSpace(receiptNumber)
	if receiptNumber == "" {
		return nil, fmt.Errorf("receiptNumber is required")
	}
	receiptDatabase := fmt.Sprintf("BIRO%s5", businessYear)
	inventoryDatabase := fmt.Sprintf("BIRO%s3", businessYear)
	receipt := &GoodsReceipt{Items: make([]*GoodsReceiptItem, 0)}
	var mpo *string
	err := repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT TOP 1 RecNo, COALESCE(Stevilka, ''), Datum, NULLIF(LTRIM(RTRIM(Skladisce)), ''),
		       COALESCE(NULLIF(LTRIM(RTRIM(Prevzemnik)), ''), NULLIF(LTRIM(RTRIM(Prevzel)), '')), MPO
		FROM [%s].[dbo].[Dobava] WHERE Stevilka=@receiptNumber ORDER BY RecNo DESC`, receiptDatabase),
		sql.Named("receiptNumber", receiptNumber)).Scan(&receipt.ID, &receipt.ReceiptNumber, &receipt.ReceiptDate, &receipt.Storage, &receipt.ReceivedBy, &mpo)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get goods receipt: %w", err)
	}
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT ds.RecNo, ds.Artikel, inventory.Opis, inventory.Enota, ds.Kolicina
		FROM [%s].[dbo].[DobavaSpecifikacija] ds
		LEFT JOIN [%s].[dbo].[ArtikelNabava] inventory ON inventory.Artikel=ds.Artikel
		WHERE ds.Stevilka=@receiptNumber AND ISNULL(ds.MPO, '')=ISNULL(@mpo, '') AND ISNULL(ds.Deleted, 0)=0
		ORDER BY ds.RecNo`, receiptDatabase, inventoryDatabase), sql.Named("receiptNumber", receiptNumber), sql.Named("mpo", mpo))
	if err != nil {
		return nil, fmt.Errorf("get goods receipt items: %w", err)
	}
	defer rows.Close()
	for rows.Next() {
		item := &GoodsReceiptItem{}
		if err := rows.Scan(&item.ID, &item.ProductCode, &item.ProductName, &item.Unit, &item.Quantity); err != nil {
			return nil, fmt.Errorf("scan goods receipt item: %w", err)
		}
		receipt.Items = append(receipt.Items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read goods receipt items: %w", err)
	}
	return receipt, nil
}

func (repository *GoodsReceiptRepository) ListStorages(ctx context.Context, businessYear string) ([]*Storage, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	receiptDatabase := fmt.Sprintf("BIRO%s5", businessYear)
	inventoryDatabase := fmt.Sprintf("BIRO%s3", businessYear)
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT DISTINCT code FROM (
			SELECT NULLIF(LTRIM(RTRIM(Skladisce)), '') code FROM [%s].[dbo].[Dobava]
			UNION SELECT NULLIF(LTRIM(RTRIM(Skladisce)), '') FROM [%s].[dbo].[ArtikelCene]
		) storages WHERE code IS NOT NULL ORDER BY code`, receiptDatabase, inventoryDatabase))
	if err != nil {
		return nil, fmt.Errorf("list goods receipt storages: %w", err)
	}
	defer rows.Close()
	storages := make([]*Storage, 0)
	for rows.Next() {
		storage := &Storage{}
		if err := rows.Scan(&storage.Code); err != nil {
			return nil, fmt.Errorf("scan goods receipt storage: %w", err)
		}
		storages = append(storages, storage)
	}
	return storages, rows.Err()
}

func (repository *GoodsReceiptRepository) Save(ctx context.Context, businessYear string, input model.GoodsReceiptInput) (*GoodsReceipt, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	input.ReceiptNumber = strings.TrimSpace(input.ReceiptNumber)
	input.Storage = strings.TrimSpace(input.Storage)
	input.ReceivedBy = strings.TrimSpace(input.ReceivedBy)
	if input.ReceiptNumber == "" || len([]rune(input.ReceiptNumber)) > 10 {
		return nil, fmt.Errorf("receiptNumber is required and must be at most 10 characters")
	}
	if input.Storage == "" || len([]rune(input.Storage)) > 1 {
		return nil, fmt.Errorf("storage is required and must be one character")
	}
	if input.ReceivedBy == "" || len([]rune(input.ReceivedBy)) > 30 {
		return nil, fmt.Errorf("receivedBy is required and must be at most 30 characters")
	}
	if len(input.Items) == 0 {
		return nil, fmt.Errorf("at least one goods receipt item is required")
	}
	for _, item := range input.Items {
		item.ProductCode = strings.TrimSpace(item.ProductCode)
		if item.ProductCode == "" || len([]rune(item.ProductCode)) > 25 {
			return nil, fmt.Errorf("each item must have a product code of at most 25 characters")
		}
		if item.Quantity <= 0 || math.IsNaN(item.Quantity) || math.IsInf(item.Quantity, 0) {
			return nil, fmt.Errorf("each item quantity must be greater than zero")
		}
	}
	databaseName := fmt.Sprintf("BIRO%s5", businessYear)
	tx, err := repository.database.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin goods receipt save: %w", err)
	}
	defer tx.Rollback()
	var mpo *string
	if input.ID != nil && *input.ID > 0 {
		var oldReceiptNumber string
		err = tx.QueryRowContext(
			ctx,
			fmt.Sprintf(`
				SELECT COALESCE(Stevilka, ''), MPO
				FROM [%s].[dbo].[Dobava]
				WHERE RecNo=@id`, databaseName),
			sql.Named("id", *input.ID),
		).Scan(&oldReceiptNumber, &mpo)
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("goods receipt RecNo %d was not found", *input.ID)
		}
		if err != nil {
			return nil, fmt.Errorf("get goods receipt before update: %w", err)
		}
		_, err = tx.ExecContext(
			ctx,
			fmt.Sprintf(`UPDATE [%s].[dbo].[Dobava]
				SET Stevilka=@number, Datum=@date,
				    Skladisce=@storage, Prevzemnik=@receivedBy
				WHERE RecNo=@id`, databaseName),
			sql.Named("number", input.ReceiptNumber),
			sql.Named("date", input.ReceiptDate),
			sql.Named("storage", input.Storage),
			sql.Named("receivedBy", input.ReceivedBy),
			sql.Named("id", *input.ID),
		)
		if err == nil {
			_, err = tx.ExecContext(
				ctx,
				fmt.Sprintf(`DELETE FROM [%s].[dbo].[DobavaSpecifikacija]
					WHERE Stevilka=@oldNumber
					  AND ISNULL(MPO,'')=ISNULL(@mpo,'')`, databaseName),
				sql.Named("oldNumber", oldReceiptNumber),
				sql.Named("mpo", mpo),
			)
		}
	} else {
		_, err = tx.ExecContext(
			ctx,
			fmt.Sprintf(`INSERT INTO [%s].[dbo].[Dobava]
				(Stevilka, Datum, Skladisce, Prevzemnik)
				VALUES (@number,@date,@storage,@receivedBy)`, databaseName),
			sql.Named("number", input.ReceiptNumber),
			sql.Named("date", input.ReceiptDate),
			sql.Named("storage", input.Storage),
			sql.Named("receivedBy", input.ReceivedBy),
		)
	}
	if err != nil {
		return nil, fmt.Errorf("save goods receipt header: %w", err)
	}
	for _, item := range input.Items {
		_, err = tx.ExecContext(
			ctx,
			fmt.Sprintf(`INSERT INTO [%s].[dbo].[DobavaSpecifikacija]
				(Stevilka,MPO,Artikel,Datum,Kolicina,Deleted)
				VALUES (@number,@mpo,@code,@date,@quantity,0)`, databaseName),
			sql.Named("number", input.ReceiptNumber),
			sql.Named("mpo", mpo),
			sql.Named("code", item.ProductCode),
			sql.Named("date", input.ReceiptDate),
			sql.Named("quantity", item.Quantity),
		)
		if err != nil {
			return nil, fmt.Errorf("save goods receipt item: %w", err)
		}
	}
	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit goods receipt: %w", err)
	}
	return repository.GetByNumber(ctx, businessYear, input.ReceiptNumber)
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
