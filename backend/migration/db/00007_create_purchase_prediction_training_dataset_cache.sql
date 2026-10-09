USE [Bureaucracy];
GO

CREATE TABLE [dbo].[purchase_prediction_training_snapshots]
(
    [cache_key] char(64) NOT NULL,
    [cutoff_date] date NOT NULL,
    [row_count] int NOT NULL,
    [created_at] datetime2(7) NOT NULL
        CONSTRAINT [DF_purchase_prediction_training_snapshots_created_at]
        DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [PK_purchase_prediction_training_snapshots]
        PRIMARY KEY ([cache_key], [cutoff_date]),
    CONSTRAINT [CK_purchase_prediction_training_snapshots_row_count]
        CHECK ([row_count] >= 0)
);
GO

CREATE TABLE [dbo].[purchase_prediction_training_rows]
(
    [id] bigint IDENTITY(1, 1) NOT NULL,
    [cache_key] char(64) NOT NULL,
    [cutoff_date] date NOT NULL,
    [customer_code] nvarchar(255) NOT NULL,
    [product_code] nvarchar(255) NOT NULL,
    [cutoff_month] int NOT NULL,
    [cutoff_week] int NOT NULL,
    [days_since_pair_last_purchase] int NOT NULL,
    [pair_purchase_count_lifetime] int NOT NULL,
    [pair_purchase_count_90d] int NOT NULL,
    [pair_purchase_count_365d] int NOT NULL,
    [pair_mean_interval_days] float NULL,
    [pair_median_interval_days] float NULL,
    [pair_last_interval_days] float NULL,
    [pair_previous_interval_days] float NULL,
    [pair_third_previous_interval_days] float NULL,
    [pair_interval_std_days] float NULL,
    [pair_overdue_ratio] float NULL,
    [pair_mean_quantity] float NULL,
    [pair_last_quantity] float NULL,
    [pair_last_3_mean_quantity] float NULL,
    [pair_quantity_change_percent] float NULL,
    [pair_quantity_365d] float NULL,
    [pair_last_unit_price] float NULL,
    [pair_mean_unit_price] float NULL,
    [pair_unit_price_change_percent] float NULL,
    [customer_days_since_any_purchase] int NOT NULL,
    [customer_invoice_count_90d] int NOT NULL,
    [customer_invoice_count_365d] int NOT NULL,
    [product_purchase_count_90d] int NOT NULL,
    [product_purchase_count_365d] int NOT NULL,
    [product_mean_interval_days] float NULL,
    [product_median_interval_days] float NULL,
    [product_customer_count_90d] int NOT NULL,
    [product_customer_count_365d] int NOT NULL,
    [product_customer_count_lifetime] int NOT NULL,
    [purchased_within_7_days] bit NOT NULL,
    [purchased_within_14_days] bit NOT NULL,
    [purchased_within_30_days] bit NOT NULL,
    CONSTRAINT [PK_purchase_prediction_training_rows] PRIMARY KEY ([id]),
    CONSTRAINT [FK_purchase_prediction_training_rows_snapshot]
        FOREIGN KEY ([cache_key], [cutoff_date])
        REFERENCES [dbo].[purchase_prediction_training_snapshots]
            ([cache_key], [cutoff_date])
        ON DELETE CASCADE
);
GO

CREATE INDEX [IX_purchase_prediction_training_rows_snapshot]
    ON [dbo].[purchase_prediction_training_rows] ([cache_key], [cutoff_date]);
GO
