USE [Bureaucracy];
GO

CREATE TABLE [dbo].[furs_soap_requests]
(
    [id] bigint IDENTITY(1,1) NOT NULL,
    [business_year_id] int NOT NULL,
    [invoice_id] int NOT NULL,
    [invoice_number] nvarchar(50) NOT NULL,
    [request_url] nvarchar(500) NOT NULL,
    [soap_action] nvarchar(100) NOT NULL,
    [payload] nvarchar(max) NOT NULL,
    [created_at] datetime2(7) NOT NULL
        CONSTRAINT [DF_furs_soap_requests_created_at] DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [PK_furs_soap_requests] PRIMARY KEY ([id])
);
GO

CREATE INDEX [IX_furs_soap_requests_invoice]
    ON [dbo].[furs_soap_requests] ([business_year_id], [invoice_id], [created_at]);
GO
