USE [BIRO223];
GO

SET NOCOUNT ON;

IF NOT EXISTS
(
    SELECT 1
    FROM [dbo].[Klavzule]
    WHERE [Vrsta] = N'UvodDobropis'
)
BEGIN
    INSERT INTO [dbo].[Klavzule]
    (
        [CRM], [IOP], [KonecDobavnica], [KonecPredracun], [KonecRacun],
        [Naziv], [Sifra], [Sklic], [SklicPartner],
        [TextKlavzule], [UvodDobavnica], [UvodPredracun], [UvodRacun],
        [Vnasalec], [Vrsta]
    )
    VALUES
    (
        0, 0, 0, 0, 0, N'Uvodni tekst za dobropis', N'CN01', 0, 0,
        N'Izstavljamo vam dobropis:', 0, 0, 0, N'bureaucracy', N'UvodDobropis'
    );
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [dbo].[Klavzule]
    WHERE [Vrsta] = N'KonecDobropis'
)
BEGIN
    INSERT INTO [dbo].[Klavzule]
    (
        [CRM], [IOP], [KonecDobavnica], [KonecPredracun], [KonecRacun],
        [Naziv], [Sifra], [Sklic], [SklicPartner],
        [TextKlavzule], [UvodDobavnica], [UvodPredracun], [UvodRacun],
        [Vnasalec], [Vrsta]
    )
    VALUES
    (
        0, 0, 0, 0, 0, N'Končni tekst za dobropis', N'CN02', 0, 0,
        N'Hvala za zaupanje.', 0, 0, 0, N'bureaucracy', N'KonecDobropis'
    );
END;
GO
