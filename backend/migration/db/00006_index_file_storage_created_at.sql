USE [Bureaucracy];
GO

CREATE INDEX [IX_file_storage_created_at]
    ON [dbo].[file_storage] ([created_at]);
GO
