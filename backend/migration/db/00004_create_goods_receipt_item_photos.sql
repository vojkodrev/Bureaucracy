USE [Bureaucracy];
GO

CREATE TABLE [dbo].[file_storage]
(
    [id] uniqueidentifier NOT NULL,
    [original_filename] nvarchar(255) NOT NULL,
    [content_type] nvarchar(100) NOT NULL,
    [byte_size] bigint NOT NULL,
    [file_data] varbinary(max) NOT NULL,
    [created_at] datetime2(7) NOT NULL
        CONSTRAINT [DF_file_storage_created_at] DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [PK_file_storage] PRIMARY KEY ([id]),
    CONSTRAINT [CK_file_storage_byte_size] CHECK ([byte_size] >= 0)
);
GO

CREATE TABLE [dbo].[goods_receipt_item_photos]
(
    -- The business-year ID used in BIRO database names (for example 22 in BIRO225).
    [business_year_id] int NOT NULL,
    [goods_receipt_item_id] int NOT NULL,
    [file_id] uniqueidentifier NOT NULL,
    [created_at] datetime2(7) NOT NULL
        CONSTRAINT [DF_goods_receipt_item_photos_created_at] DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [PK_goods_receipt_item_photos] PRIMARY KEY ([file_id]),
    CONSTRAINT [FK_goods_receipt_item_photos_file_storage]
        FOREIGN KEY ([file_id]) REFERENCES [dbo].[file_storage] ([id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_goods_receipt_item_photos_item]
    ON [dbo].[goods_receipt_item_photos] ([business_year_id], [goods_receipt_item_id]);
GO
