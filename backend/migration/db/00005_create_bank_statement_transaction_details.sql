USE [Bureaucracy];
GO

CREATE TABLE [dbo].[bank_statement_transaction_details]
(
    -- The business-year ID used in BIRO database names (for example 22 in BIRO225).
    [business_year_id] int NOT NULL,
    -- RecNo from the matching business year's dbo.BankaZR table.
    [bank_statement_transaction_id] int NOT NULL,
    -- ISO 20022 transaction-level end-to-end identification.
    [end_to_end_id] nvarchar(35) NULL,
    [created_at] datetime2(7) NOT NULL
        CONSTRAINT [DF_bank_statement_transaction_details_created_at] DEFAULT SYSUTCDATETIME(),
    [updated_at] datetime2(7) NOT NULL
        CONSTRAINT [DF_bank_statement_transaction_details_updated_at] DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [PK_bank_statement_transaction_details]
        PRIMARY KEY ([business_year_id], [bank_statement_transaction_id])
);
GO
