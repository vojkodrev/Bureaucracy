USE [BIRO223];
GO

SET NOCOUNT ON;

IF NOT EXISTS
(
    SELECT 1
    FROM [dbo].[Klavzule]
    WHERE ISNULL([UvodDobropis], 0) <> 0
)
BEGIN
    INSERT INTO [dbo].[Klavzule]
    (
        [CRM], [IOP], [KonecDobavnica], [KonecPredracun], [KonecRacun],
        [KonecDobropis], [Naziv], [Sifra], [Sklic], [SklicPartner],
        [TextKlavzule], [UvodDobavnica], [UvodPredracun], [UvodRacun],
        [UvodDobropis], [Vnasalec], [Vrsta]
    )
    VALUES
    (
        0, 0, 0, 0, 0, 0, N'Uvodni tekst za dobropis', N'CN01', 0, 0,
        N'Izstavljamo vam dobropis:', 0, 0, 0, -1, N'bureaucracy', N'Dobropisi'
    );
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [dbo].[Klavzule]
    WHERE ISNULL([KonecDobropis], 0) <> 0
)
BEGIN
    INSERT INTO [dbo].[Klavzule]
    (
        [CRM], [IOP], [KonecDobavnica], [KonecPredracun], [KonecRacun],
        [KonecDobropis], [Naziv], [Sifra], [Sklic], [SklicPartner],
        [TextKlavzule], [UvodDobavnica], [UvodPredracun], [UvodRacun],
        [UvodDobropis], [Vnasalec], [Vrsta]
    )
    VALUES
    (
        0, 0, 0, 0, 0, -1, N'Končni tekst za dobropis', N'CN02', 0, 0,
        N'Hvala za zaupanje.', 0, 0, 0, 0, N'bureaucracy', N'Dobropisi'
    );
END;
GO
