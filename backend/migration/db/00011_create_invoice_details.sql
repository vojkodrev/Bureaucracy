USE [Bureaucracy];
GO

CREATE TABLE [dbo].[invoice_details]
(
    [business_year_id] int NOT NULL,
    [invoice_id] int NOT NULL,
    [invoice_number] nvarchar(50) NOT NULL,
    [furs_issue_date_time] datetime2(0) NULL,
    [zoi] varchar(32) NULL,
    [eor] varchar(50) NULL,
    [created_at] datetime2(7) NOT NULL
        CONSTRAINT [DF_invoice_details_created_at] DEFAULT SYSUTCDATETIME(),
    [updated_at] datetime2(7) NOT NULL
        CONSTRAINT [DF_invoice_details_updated_at] DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [PK_invoice_details]
        PRIMARY KEY ([business_year_id], [invoice_id])
);
GO

CREATE UNIQUE INDEX [UX_invoice_details_zoi]
    ON [dbo].[invoice_details] ([zoi]) WHERE [zoi] IS NOT NULL;
GO

CREATE UNIQUE INDEX [UX_invoice_details_eor]
    ON [dbo].[invoice_details] ([eor]) WHERE [eor] IS NOT NULL;
GO

CREATE INDEX [IX_invoice_details_invoice_number]
    ON [dbo].[invoice_details] ([business_year_id], [invoice_number]);
GO
