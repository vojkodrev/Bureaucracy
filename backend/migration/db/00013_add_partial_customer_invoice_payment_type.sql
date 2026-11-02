USE [BIRO221];
GO

IF NOT EXISTS
(
    SELECT 1
    FROM [dbo].[BankaZRVD]
    WHERE [IME] = N'Plačilo računa kupca - delni'
)
BEGIN
    DECLARE @nextCode smallint =
        CONVERT(smallint, ISNULL((SELECT MAX([NumSifra]) FROM [dbo].[BankaZRVD]), 0) + 1);

    INSERT INTO [dbo].[BankaZRVD]
        ([IME], [InfoKonto], [NumSifra], [SIFRA], [VRSTA])
    VALUES
        (N'Plačilo računa kupca - delni', N'1200', @nextCode,
         RIGHT(N'00' + CONVERT(nvarchar(3), @nextCode), 2), N'Priliv');
END;
GO
