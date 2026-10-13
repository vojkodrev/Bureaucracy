USE [Bureaucracy];
GO

CREATE TABLE [dbo].[storages]
(
    [code] nchar(1) NOT NULL,
    [description] nvarchar(100) NOT NULL,
    CONSTRAINT [PK_storages] PRIMARY KEY ([code]),
    CONSTRAINT [UQ_storages_description] UNIQUE ([description]),
    CONSTRAINT [CK_storages_code_not_blank]
        CHECK (LEN(LTRIM(RTRIM([code]))) = 1),
    CONSTRAINT [CK_storages_description_not_blank]
        CHECK (LEN(LTRIM(RTRIM([description]))) > 0)
);
GO

INSERT INTO [dbo].[storages] ([code], [description])
VALUES
    (N'K', N'Skladišče končnih izdelkov'),
    (N'B', N'Skladišče 27'),
    (N'S', N'Skladišče 33, 40 Srb'),
    (N'O', N'Skladišče ofset'),
    (N'Z', N'Skladišče zvitki');
GO
