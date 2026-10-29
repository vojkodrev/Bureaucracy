USE [Bureaucracy];
GO

INSERT INTO [dbo].[storages] ([code], [description])
SELECT N'R', N'Skladišče zrak'
WHERE NOT EXISTS
(
    SELECT 1
    FROM [dbo].[storages]
    WHERE [code] = N'R'
);
GO

USE [BIRO223];
GO

INSERT INTO [dbo].[Drzave] ([OznakaDrzave], [Drzava], [Deleted])
SELECT [source].[code], [source].[name], 0
FROM (VALUES
    (N'SLO', N'Slovenija'),
    (N'CRO', N'HRVAŠKA'),
    (N'SRB', N'SRBIJA'),
    (N'NEM', N'Nemčija'),
    (N'ZDA', N'Amerika')
) AS [source] ([code], [name])
WHERE NOT EXISTS
(
    SELECT 1
    FROM [dbo].[Drzave] AS [existing]
    WHERE [existing].[OznakaDrzave] = [source].[code]
);
GO
