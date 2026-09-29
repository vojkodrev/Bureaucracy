IF DB_ID(N'Bureaucracy') IS NULL
BEGIN
    EXEC(N'CREATE DATABASE [Bureaucracy]');
END;
GO

USE [Bureaucracy];
GO

IF OBJECT_ID(N'[dbo].[schema_migrations]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[schema_migrations]
    (
        [version] bigint NOT NULL,
        [name] nvarchar(255) NOT NULL,
        [applied_at] datetime2(7) NOT NULL
            CONSTRAINT [DF_schema_migrations_applied_at] DEFAULT SYSUTCDATETIME(),
        CONSTRAINT [PK_schema_migrations] PRIMARY KEY ([version])
    );
END;
GO
