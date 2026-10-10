USE [Bureaucracy];
GO

CREATE TABLE [dbo].[purchase_prediction_runs]
(
    [id] bigint IDENTITY(1, 1) NOT NULL,
    [as_of_date] date NOT NULL,
    [forecast_end_7_days] date NOT NULL,
    [forecast_end_14_days] date NOT NULL,
    [forecast_end_30_days] date NOT NULL,
    [model_version] varchar(32) NOT NULL,
    [row_count] int NOT NULL,
    [created_at_utc] datetime2(7) NOT NULL,
    CONSTRAINT [PK_purchase_prediction_runs] PRIMARY KEY ([id]),
    CONSTRAINT [UQ_purchase_prediction_runs_date_model]
        UNIQUE ([as_of_date], [model_version]),
    CONSTRAINT [CK_purchase_prediction_runs_row_count]
        CHECK ([row_count] >= 0),
    CONSTRAINT [CK_purchase_prediction_runs_forecast_dates]
        CHECK (
            [forecast_end_7_days] = DATEADD(day, 7, [as_of_date])
            AND [forecast_end_14_days] = DATEADD(day, 14, [as_of_date])
            AND [forecast_end_30_days] = DATEADD(day, 30, [as_of_date])
        )
);
GO

CREATE TABLE [dbo].[purchase_prediction_rows]
(
    [id] bigint IDENTITY(1, 1) NOT NULL,
    [run_id] bigint NOT NULL,
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
    [score_7_days] float NOT NULL,
    [score_14_days] float NOT NULL,
    [score_30_days] float NOT NULL,
    CONSTRAINT [PK_purchase_prediction_rows] PRIMARY KEY ([id]),
    CONSTRAINT [FK_purchase_prediction_rows_run]
        FOREIGN KEY ([run_id]) REFERENCES [dbo].[purchase_prediction_runs] ([id])
        ON DELETE CASCADE,
    CONSTRAINT [UQ_purchase_prediction_rows_run_pair]
        UNIQUE ([run_id], [customer_code], [product_code]),
    CONSTRAINT [CK_purchase_prediction_rows_score_7]
        CHECK ([score_7_days] BETWEEN 0 AND 1),
    CONSTRAINT [CK_purchase_prediction_rows_score_14]
        CHECK ([score_14_days] BETWEEN 0 AND 1),
    CONSTRAINT [CK_purchase_prediction_rows_score_30]
        CHECK ([score_30_days] BETWEEN 0 AND 1)
);
GO

CREATE INDEX [IX_purchase_prediction_rows_customer]
    ON [dbo].[purchase_prediction_rows] ([customer_code], [run_id])
    INCLUDE ([product_code], [score_7_days], [score_14_days], [score_30_days]);
GO

CREATE INDEX [IX_purchase_prediction_rows_product]
    ON [dbo].[purchase_prediction_rows] ([product_code], [run_id]);
GO
