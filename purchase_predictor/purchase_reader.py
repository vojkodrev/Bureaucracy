import logging
import re
from datetime import date

import pyodbc
from injector import inject, singleton

from config import AppConfig
from domain import Purchase


@singleton
class MssqlPurchaseReader:
    _business_year_code = re.compile(r"^[A-Za-z0-9_]+$")

    @inject
    def __init__(self, config: AppConfig):
        self._config = config
        self._logger = logging.getLogger(type(self).__name__)

    def read(self, start_date: date, end_date: date | None) -> list[Purchase]:
        purchases: list[Purchase] = []
        with pyodbc.connect(self._config.connection_string) as connection:
            for code, year in self._read_business_years(connection, start_date, end_date):
                database = self._invoice_database(code)
                self._logger.info("Reading purchases from %s for business year %s", database, year)
                purchases.extend(
                    self._read_database(connection, database, start_date, end_date)
                )

        purchases.sort(key=lambda item: item.service_date)
        self._logger.info("Read %d purchase lines", len(purchases))
        return purchases

    def _read_business_years(
        self,
        connection: pyodbc.Connection,
        start_date: date,
        end_date: date | None,
    ) -> list[tuple[str, int]]:
        final_year = (end_date or date.today()).year
        cursor = connection.cursor()
        rows = cursor.execute(
            """
            SELECT LTRIM(RTRIM(Oznaka)), LetoPoslovanja
            FROM dbo.PoslovnaLeta
            WHERE Oznaka IS NOT NULL
              AND NULLIF(LTRIM(RTRIM(Oznaka)), '') IS NOT NULL
              AND LetoPoslovanja BETWEEN ? AND ?
            ORDER BY LetoPoslovanja, RecNo
            """,
            start_date.year,
            final_year,
        ).fetchall()
        return [(str(row[0]), int(row[1])) for row in rows]

    def _invoice_database(self, code: str) -> str:
        if not self._business_year_code.fullmatch(code):
            raise ValueError(f"Unsafe business-year code: {code!r}")
        return f"BIRO{code}5"

    @staticmethod
    def _read_database(
        connection: pyodbc.Connection,
        database: str,
        start_date: date,
        end_date: date | None,
    ) -> list[Purchase]:
        end_filter = " AND r.DatumDUR <= ?" if end_date is not None else ""
        query = f"""
            SELECT
                LTRIM(RTRIM(r.SifraPartnerja)) AS CustomerCode,
                LTRIM(RTRIM(rs.Artikel)) AS ProductCode,
                CAST(r.DatumDUR AS date) AS ServiceDate,
                LTRIM(RTRIM(r.Stevilka)) AS InvoiceNumber,
                CAST(COALESCE(rs.Kolicina, 0) AS float) AS Quantity,
                CAST(COALESCE(rs.ZnesekBrezDavka, 0) AS float) AS NetAmount
            FROM [{database}].[dbo].[Racuni] r
            INNER JOIN [{database}].[dbo].[RacuniSpecifikacija] rs
                ON rs.Stevilka = r.Stevilka
            WHERE r.DatumDUR >= ?
              {end_filter}
              AND NULLIF(LTRIM(RTRIM(r.SifraPartnerja)), '') IS NOT NULL
              AND NULLIF(LTRIM(RTRIM(rs.Artikel)), '') IS NOT NULL
              AND ISNULL(r.Storno, 0) = 0
              AND ISNULL(rs.Deleted, 0) = 0
              AND COALESCE(rs.Kolicina, 0) > 0
        """
        parameters = [start_date]
        if end_date is not None:
            parameters.append(end_date)
        rows = connection.cursor().execute(query, *parameters).fetchall()
        return [
            Purchase(
                customer_code=str(row.CustomerCode),
                product_code=str(row.ProductCode),
                service_date=row.ServiceDate,
                invoice_id=f"{database}:{row.InvoiceNumber}",
                invoice_number=str(row.InvoiceNumber),
                quantity=float(row.Quantity),
                net_amount=float(row.NetAmount),
            )
            for row in rows
        ]
