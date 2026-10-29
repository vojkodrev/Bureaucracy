USE [Bureaucracy];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

DELETE FROM [dbo].[purchase_prediction_rows];
DELETE FROM [dbo].[purchase_prediction_runs];
DELETE FROM [dbo].[purchase_prediction_training_rows];
DELETE FROM [dbo].[purchase_prediction_training_snapshots];

DBCC CHECKIDENT ('[dbo].[purchase_prediction_rows]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[purchase_prediction_runs]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[purchase_prediction_training_rows]', RESEED, 0);

COMMIT TRANSACTION;
GO
