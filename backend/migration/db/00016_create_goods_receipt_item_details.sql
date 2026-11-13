USE [Bureaucracy];
GO

CREATE TABLE [dbo].[goods_receipt_item_details]
(
    [business_year_id] int NOT NULL,
    [goods_receipt_item_id] int NOT NULL,
    [sequence] int NOT NULL,
    CONSTRAINT [PK_goods_receipt_item_details]
        PRIMARY KEY ([business_year_id], [goods_receipt_item_id]),
    CONSTRAINT [CK_goods_receipt_item_details_sequence]
        CHECK ([sequence] > 0)
);
GO
