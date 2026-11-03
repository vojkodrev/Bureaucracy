USE [BIRO223];
GO

SET NOCOUNT ON;

IF NOT EXISTS
(
    SELECT 1
    FROM [dbo].[Klavzule]
    WHERE ISNULL([UvodDobavnica], 0) <> 0
)
BEGIN
    INSERT INTO [dbo].[Klavzule]
    (
        [CRM],
        [IOP],
        [KonecDobavnica],
        [KonecPredracun],
        [KonecRacun],
        [Naziv],
        [Sifra],
        [Sklic],
        [SklicPartner],
        [TextKlavzule],
        [UvodDobavnica],
        [UvodPredracun],
        [UvodRacun],
        [Vnasalec],
        [Vrsta]
    )
    VALUES
    (
        0,
        0,
        0,
        0,
        0,
        N'Uvodni tekst za dobavnico',
        N'DN01',
        0,
        0,
        N'Dobavljamo vam:',
        -1,
        0,
        0,
        N'bureaucracy',
        N'Dobavnice'
    );
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [dbo].[Klavzule]
    WHERE ISNULL([KonecDobavnica], 0) <> 0
)
BEGIN
    INSERT INTO [dbo].[Klavzule]
    (
        [CRM],
        [IOP],
        [KonecDobavnica],
        [KonecPredracun],
        [KonecRacun],
        [Naziv],
        [Sifra],
        [Sklic],
        [SklicPartner],
        [TextKlavzule],
        [UvodDobavnica],
        [UvodPredracun],
        [UvodRacun],
        [Vnasalec],
        [Vrsta]
    )
    VALUES
    (
        0,
        0,
        -1,
        0,
        0,
        N'Končni tekst za dobavnico',
        N'DN02',
        0,
        0,
        N'Hvala za zaupanje.',
        0,
        0,
        0,
        N'bureaucracy',
        N'Dobavnice'
    );
END;
GO
