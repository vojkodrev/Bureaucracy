package main

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"bureaucracy/backend/graph/model"
	"github.com/google/uuid"
)

type GoodsReceiptRepository struct{ database *sql.DB }

func NewGoodsReceiptRepository(database *sql.DB) *GoodsReceiptRepository {
	return &GoodsReceiptRepository{database: database}
}

func (repository *GoodsReceiptRepository) ItemCounts(
	ctx context.Context,
	businessYear string,
	productCodes []string,
) ([]*InventoryItemGoodsReceiptCount, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}

	uniqueCodes := make([]string, 0, len(productCodes))
	seenCodes := make(map[string]struct{}, len(productCodes))
	for _, productCode := range productCodes {
		productCode = strings.TrimSpace(productCode)
		if productCode == "" {
			continue
		}
		if _, exists := seenCodes[productCode]; exists {
			continue
		}
		seenCodes[productCode] = struct{}{}
		uniqueCodes = append(uniqueCodes, productCode)
	}
	if len(uniqueCodes) == 0 {
		return []*InventoryItemGoodsReceiptCount{}, nil
	}
	if len(uniqueCodes) > 10000 {
		return nil, fmt.Errorf("productCodes must contain at most 10000 values")
	}

	parameters := make([]string, len(uniqueCodes))
	arguments := make([]any, len(uniqueCodes))
	for index, productCode := range uniqueCodes {
		parameterName := fmt.Sprintf("productCode%d", index)
		parameters[index] = "@" + parameterName
		arguments[index] = sql.Named(parameterName, productCode)
	}

	receiptDatabase := fmt.Sprintf("BIRO%s5", businessYear)
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT ds.Artikel, COUNT(DISTINCT d.RecNo)
		FROM [%s].[dbo].[DobavaSpecifikacija] ds
		INNER JOIN [%s].[dbo].[Dobava] d
			ON d.Stevilka = ds.Stevilka
			AND ISNULL(d.MPO, '') = ISNULL(ds.MPO, '')
		WHERE ds.Artikel IN (%s)
		  AND ISNULL(ds.Deleted, 0) = 0
		GROUP BY ds.Artikel`, receiptDatabase, receiptDatabase, strings.Join(parameters, ", ")), arguments...)
	if err != nil {
		return nil, fmt.Errorf("count inventory item goods receipts: %w", err)
	}
	defer rows.Close()

	counts := make([]*InventoryItemGoodsReceiptCount, 0, len(uniqueCodes))
	for rows.Next() {
		count := &InventoryItemGoodsReceiptCount{}
		if err := rows.Scan(&count.ProductCode, &count.GoodsReceiptCount); err != nil {
			return nil, fmt.Errorf("scan inventory item goods receipt count: %w", err)
		}
		counts = append(counts, count)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read inventory item goods receipt counts: %w", err)
	}
	return counts, nil
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
			item := &GoodsReceiptItem{Photos: make([]*GoodsReceiptItemPhoto, 0)}
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
		item := &GoodsReceiptItem{Photos: make([]*GoodsReceiptItemPhoto, 0)}
		if err := rows.Scan(&item.ID, &item.ProductCode, &item.ProductName, &item.Unit, &item.Quantity); err != nil {
			return nil, fmt.Errorf("scan goods receipt item: %w", err)
		}
		receipt.Items = append(receipt.Items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read goods receipt items: %w", err)
	}
	businessYearID, err := strconv.Atoi(businessYear)
	if err != nil {
		return nil, fmt.Errorf("invalid business year ID: %w", err)
	}
	if err := repository.loadItemPhotos(ctx, businessYearID, receipt.Items); err != nil {
		return nil, err
	}
	return receipt, nil
}

func (repository *GoodsReceiptRepository) loadItemPhotos(ctx context.Context, businessYearID int, items []*GoodsReceiptItem) error {
	for _, item := range items {
		rows, err := repository.database.QueryContext(ctx, `
			SELECT CONVERT(nvarchar(36), file_id) FROM [Bureaucracy].[dbo].[goods_receipt_item_photos]
			WHERE business_year_id=@businessYearID AND goods_receipt_item_id=@itemID
			ORDER BY created_at, file_id`, sql.Named("businessYearID", businessYearID), sql.Named("itemID", item.ID))
		if err != nil {
			return fmt.Errorf("get goods receipt item photos: %w", err)
		}
		for rows.Next() {
			photo := &GoodsReceiptItemPhoto{}
			if err := rows.Scan(&photo.FileID); err != nil {
				rows.Close()
				return fmt.Errorf("scan goods receipt item photo: %w", err)
			}
			item.Photos = append(item.Photos, photo)
		}
		if err := rows.Err(); err != nil {
			rows.Close()
			return fmt.Errorf("read goods receipt item photos: %w", err)
		}
		rows.Close()
	}
	return nil
}

func (repository *GoodsReceiptRepository) LatestInventoryItemPhotos(
	ctx context.Context,
	businessYear string,
	productCode string,
) ([]*GoodsReceiptItemPhoto, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	productCode = strings.TrimSpace(productCode)
	if productCode == "" {
		return nil, fmt.Errorf("productCode is required")
	}
	businessYearID, err := strconv.Atoi(businessYear)
	if err != nil {
		return nil, fmt.Errorf("invalid business year ID: %w", err)
	}
	receiptDatabase := fmt.Sprintf("BIRO%s5", businessYear)
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		WITH LatestReceipt AS (
			SELECT TOP (1) d.Stevilka, d.MPO
			FROM [Bureaucracy].[dbo].[goods_receipt_item_photos] candidatePhoto
			INNER JOIN [%s].[dbo].[DobavaSpecifikacija] candidateItem
				ON candidateItem.RecNo = candidatePhoto.goods_receipt_item_id
			INNER JOIN [%s].[dbo].[Dobava] d
				ON d.Stevilka = candidateItem.Stevilka
				AND ISNULL(d.MPO, '') = ISNULL(candidateItem.MPO, '')
			WHERE candidatePhoto.business_year_id = @businessYearID
			  AND ISNULL(candidateItem.Deleted, 0) = 0
			  AND candidateItem.Artikel = @productCode
			  AND candidateItem.Kolicina > 0
			ORDER BY d.Datum DESC, d.RecNo DESC
		)
		SELECT CONVERT(nvarchar(36), photo.file_id)
		FROM LatestReceipt receipt
		INNER JOIN [%s].[dbo].[DobavaSpecifikacija] item
			ON item.Stevilka = receipt.Stevilka
			AND ISNULL(item.MPO, '') = ISNULL(receipt.MPO, '')
		INNER JOIN [Bureaucracy].[dbo].[goods_receipt_item_photos] photo
			ON photo.business_year_id = @businessYearID
			AND photo.goods_receipt_item_id = item.RecNo
		WHERE ISNULL(item.Deleted, 0) = 0
		  AND item.Artikel = @productCode
		  AND item.Kolicina > 0
		ORDER BY photo.created_at, photo.file_id`,
		receiptDatabase, receiptDatabase, receiptDatabase),
		sql.Named("businessYearID", businessYearID),
		sql.Named("productCode", productCode))
	if err != nil {
		return nil, fmt.Errorf("get latest inventory item photos: %w", err)
	}
	defer rows.Close()

	photos := make([]*GoodsReceiptItemPhoto, 0)
	for rows.Next() {
		photo := &GoodsReceiptItemPhoto{}
		if err := rows.Scan(&photo.FileID); err != nil {
			return nil, fmt.Errorf("scan latest inventory item photo: %w", err)
		}
		photos = append(photos, photo)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read latest inventory item photos: %w", err)
	}
	return photos, nil
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
	input.Storage = trimmedProductString(input.Storage)
	input.ReceivedBy = strings.TrimSpace(input.ReceivedBy)
	if input.ReceiptNumber == "" || len([]rune(input.ReceiptNumber)) > 10 {
		return nil, fmt.Errorf("receiptNumber is required and must be at most 10 characters")
	}
	if input.Storage != nil && len([]rune(*input.Storage)) > 1 {
		return nil, fmt.Errorf("storage must be at most one character")
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
		if item.Quantity == 0 || math.IsNaN(item.Quantity) || math.IsInf(item.Quantity, 0) {
			return nil, fmt.Errorf("each item quantity must be a non-zero number")
		}
		seenPhotos := make(map[uuid.UUID]bool, len(item.PhotoFileIds))
		for _, fileID := range item.PhotoFileIds {
			parsedFileID, parseErr := uuid.Parse(fileID)
			if parseErr != nil {
				return nil, fmt.Errorf("invalid goods receipt photo file ID")
			}
			if seenPhotos[parsedFileID] {
				return nil, fmt.Errorf("duplicate goods receipt photo file ID")
			}
			seenPhotos[parsedFileID] = true
		}
	}
	businessYearID, err := strconv.Atoi(businessYear)
	if err != nil {
		return nil, fmt.Errorf("invalid business year ID: %w", err)
	}
	databaseName := fmt.Sprintf("BIRO%s5", businessYear)
	tx, err := repository.database.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin goods receipt save: %w", err)
	}
	defer tx.Rollback()
	var mpo *string
	oldReceiptNumber := input.ReceiptNumber
	if input.ID != nil && *input.ID > 0 {
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
	if _, err = tx.ExecContext(ctx, `CREATE TABLE #SavedGoodsReceiptItems (RecNo int NOT NULL PRIMARY KEY)`); err != nil {
		return nil, fmt.Errorf("prepare goods receipt items: %w", err)
	}
	if _, err = tx.ExecContext(ctx, `CREATE TABLE #SavedGoodsReceiptPhotos (FileID uniqueidentifier NOT NULL PRIMARY KEY)`); err != nil {
		return nil, fmt.Errorf("prepare goods receipt photos: %w", err)
	}
	for index, item := range input.Items {
		itemID := 0
		if item.ID != nil && *item.ID > 0 {
			itemID = *item.ID
			result, updateErr := tx.ExecContext(ctx, fmt.Sprintf(`UPDATE [%s].[dbo].[DobavaSpecifikacija]
				SET Stevilka=@number,MPO=@mpo,Artikel=@code,Datum=@date,Kolicina=@quantity,Deleted=0
				WHERE RecNo=@id AND Stevilka IN (@oldNumber,@number)`, databaseName),
				sql.Named("id", itemID), sql.Named("oldNumber", oldReceiptNumber), sql.Named("number", input.ReceiptNumber),
				sql.Named("mpo", mpo), sql.Named("code", item.ProductCode), sql.Named("date", input.ReceiptDate), sql.Named("quantity", item.Quantity))
			if updateErr != nil {
				return nil, fmt.Errorf("update goods receipt item %d: %w", index+1, updateErr)
			}
			affected, affectedErr := result.RowsAffected()
			if affectedErr != nil || affected != 1 {
				return nil, fmt.Errorf("goods receipt item RecNo %d was not found", itemID)
			}
		} else {
			err = tx.QueryRowContext(ctx, fmt.Sprintf(`INSERT INTO [%s].[dbo].[DobavaSpecifikacija]
				(Stevilka,MPO,Artikel,Datum,Kolicina,Deleted)
				OUTPUT INSERTED.RecNo VALUES (@number,@mpo,@code,@date,@quantity,0)`, databaseName),
				sql.Named("number", input.ReceiptNumber), sql.Named("mpo", mpo), sql.Named("code", item.ProductCode),
				sql.Named("date", input.ReceiptDate), sql.Named("quantity", item.Quantity)).Scan(&itemID)
			if err != nil {
				return nil, fmt.Errorf("insert goods receipt item %d: %w", index+1, err)
			}
		}
		if _, err = tx.ExecContext(ctx, `INSERT INTO #SavedGoodsReceiptItems (RecNo) VALUES (@id)`, sql.Named("id", itemID)); err != nil {
			return nil, fmt.Errorf("retain goods receipt item %d: %w", index+1, err)
		}
		for _, fileID := range item.PhotoFileIds {
			var available int
			err = tx.QueryRowContext(ctx, `SELECT COUNT(*)
				FROM [Bureaucracy].[dbo].[file_storage] stored
				LEFT JOIN [Bureaucracy].[dbo].[goods_receipt_item_photos] photo ON photo.file_id=stored.id
				WHERE stored.id=@fileID AND (
					photo.file_id IS NULL OR
					(photo.business_year_id=@businessYearID AND photo.goods_receipt_item_id=@itemID)
				)`, sql.Named("fileID", fileID), sql.Named("businessYearID", businessYearID), sql.Named("itemID", itemID)).Scan(&available)
			if err != nil {
				return nil, fmt.Errorf("check goods receipt photo file: %w", err)
			}
			if available != 1 {
				return nil, fmt.Errorf("goods receipt photo file %s was not found or belongs to another item", fileID)
			}
			if _, err = tx.ExecContext(ctx, `INSERT INTO [Bureaucracy].[dbo].[goods_receipt_item_photos]
				(business_year_id,goods_receipt_item_id,file_id)
				SELECT @businessYearID,@itemID,@fileID
				WHERE NOT EXISTS (SELECT 1 FROM [Bureaucracy].[dbo].[goods_receipt_item_photos] WHERE file_id=@fileID)`,
				sql.Named("businessYearID", businessYearID), sql.Named("itemID", itemID), sql.Named("fileID", fileID)); err != nil {
				return nil, fmt.Errorf("assign goods receipt item photo: %w", err)
			}
			if _, err = tx.ExecContext(ctx, `INSERT INTO #SavedGoodsReceiptPhotos (FileID) VALUES (@fileID)`, sql.Named("fileID", fileID)); err != nil {
				return nil, fmt.Errorf("retain goods receipt item photo: %w", err)
			}
		}
	}
	if input.ID != nil && *input.ID > 0 {
		if _, err = tx.ExecContext(ctx, fmt.Sprintf(`DELETE stored
			FROM [Bureaucracy].[dbo].[file_storage] stored
			INNER JOIN [Bureaucracy].[dbo].[goods_receipt_item_photos] photo ON photo.file_id=stored.id
			INNER JOIN [%s].[dbo].[DobavaSpecifikacija] item ON item.RecNo=photo.goods_receipt_item_id
			WHERE photo.business_year_id=@businessYearID AND item.Stevilka IN (@oldNumber,@number)
			  AND NOT EXISTS (SELECT 1 FROM #SavedGoodsReceiptPhotos saved WHERE saved.FileID=photo.file_id)`, databaseName),
			sql.Named("businessYearID", businessYearID), sql.Named("oldNumber", oldReceiptNumber), sql.Named("number", input.ReceiptNumber)); err != nil {
			return nil, fmt.Errorf("remove stale goods receipt item photos: %w", err)
		}
		if _, err = tx.ExecContext(ctx, fmt.Sprintf(`DELETE item FROM [%s].[dbo].[DobavaSpecifikacija] item
			WHERE item.Stevilka IN (@oldNumber,@number) AND ISNULL(item.MPO,'')=ISNULL(@mpo,'')
			  AND NOT EXISTS (SELECT 1 FROM #SavedGoodsReceiptItems saved WHERE saved.RecNo=item.RecNo)`, databaseName),
			sql.Named("oldNumber", oldReceiptNumber), sql.Named("number", input.ReceiptNumber), sql.Named("mpo", mpo)); err != nil {
			return nil, fmt.Errorf("remove stale goods receipt items: %w", err)
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
