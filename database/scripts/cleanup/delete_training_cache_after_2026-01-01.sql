USE [Bureaucracy];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @CutoffDate date = '2026-01-01';
DECLARE @DeletedSnapshots int;
DECLARE @DeletedRows int;

BEGIN TRANSACTION;

SELECT @DeletedRows = COUNT(*)
FROM [dbo].[purchase_prediction_training_rows]
WHERE [cutoff_date] > @CutoffDate;

DELETE FROM [dbo].[purchase_prediction_training_snapshots]
WHERE [cutoff_date] > @CutoffDate;

SET @DeletedSnapshots = @@ROWCOUNT;

COMMIT TRANSACTION;

SELECT
    @DeletedSnapshots AS [deleted_snapshots],
    @DeletedRows AS [deleted_rows];
GO
