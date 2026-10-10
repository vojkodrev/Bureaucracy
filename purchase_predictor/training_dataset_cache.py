import hashlib
import logging
import math
from contextlib import contextmanager
from datetime import date
from typing import Generator

import pandas as pd
import pyodbc
from injector import inject, singleton

from config import AppConfig
from feature_builder import FeatureBuilder


@singleton
class TrainingDatasetCache:
    _schema_version = 1
    _horizons = (7, 14, 30)

    @inject
    def __init__(self, config: AppConfig, feature_builder: FeatureBuilder):
        self._connection_string = config.connection_string
        self._columns = [
            *feature_builder.feature_columns,
            "cutoff_date",
            *(f"purchased_within_{horizon}_days" for horizon in self._horizons),
        ]
        self._cache_key = self._make_cache_key(config, feature_builder)
        self._logger = logging.getLogger(type(self).__name__)

    @contextmanager
    def session(self) -> Generator["TrainingDatasetCacheSession", None, None]:
        with pyodbc.connect(self._connection_string) as connection:
            yield TrainingDatasetCacheSession(
                connection, self._cache_key, self._columns, self._logger
            )

    @classmethod
    def _make_cache_key(cls, config: AppConfig, feature_builder: FeatureBuilder) -> str:
        identity = "\n".join(
            [
                f"schema_version={cls._schema_version}",
                f"training_start_date={config.training_start_date.isoformat()}",
                f"warmup_months={config.warmup_months}",
                f"cutoff_interval_days={config.cutoff_interval_days}",
                f"active_pair_months={config.active_pair_months}",
                f"horizons={','.join(str(value) for value in cls._horizons)}",
                f"feature_columns={','.join(feature_builder.feature_columns)}",
            ]
        )
        encoded = identity.encode("utf-8")
        return hashlib.sha256(encoded).hexdigest()


class TrainingDatasetCacheSession:
    _snapshot_table = "[Bureaucracy].[dbo].[purchase_prediction_training_snapshots]"
    _row_table = "[Bureaucracy].[dbo].[purchase_prediction_training_rows]"

    def __init__(
        self,
        connection: pyodbc.Connection,
        cache_key: str,
        columns: list[str],
        logger: logging.Logger,
    ):
        self._connection = connection
        self._cache_key = cache_key
        self._columns = columns
        self._logger = logger

    def load(self, first_cutoff: date, final_cutoff: date) -> dict[date, pd.DataFrame]:
        snapshots = self._connection.cursor().execute(
            f"""
            SELECT cutoff_date, row_count
            FROM {self._snapshot_table}
            WHERE cache_key = ? AND cutoff_date BETWEEN ? AND ?
            ORDER BY cutoff_date
            """,
            self._cache_key,
            first_cutoff,
            final_cutoff,
        ).fetchall()

        result: dict[date, pd.DataFrame] = {}
        selected_columns = ", ".join(f"[{column}]" for column in self._columns)
        cached_rows = self._connection.cursor().execute(
            f"""
            SELECT {selected_columns}
            FROM {self._row_table}
            WHERE cache_key = ? AND cutoff_date BETWEEN ? AND ?
            ORDER BY cutoff_date, customer_code, product_code
            """,
            self._cache_key,
            first_cutoff,
            final_cutoff,
        ).fetchall()
        rows_by_cutoff: dict[date, list[object]] = {}
        cutoff_index = self._columns.index("cutoff_date")
        for row in cached_rows:
            rows_by_cutoff.setdefault(row[cutoff_index], []).append(row)

        for snapshot in snapshots:
            rows = rows_by_cutoff.get(snapshot.cutoff_date, [])
            if len(rows) != snapshot.row_count:
                raise ValueError(
                    f"Cached cutoff {snapshot.cutoff_date} contains {len(rows)} rows; "
                    f"expected {snapshot.row_count}"
                )
            frame = pd.DataFrame.from_records(rows, columns=self._columns)
            if not frame.empty:
                frame["cutoff_date"] = pd.to_datetime(frame["cutoff_date"]).dt.date
            result[snapshot.cutoff_date] = frame
            self._logger.info(
                "Loaded training snapshot for cutoff %s from MSSQL cache (%d rows)",
                snapshot.cutoff_date,
                len(frame),
            )

        if result:
            self._logger.info("Loaded %d training snapshots from MSSQL cache", len(result))
        return result

    def save(self, cutoff: date, frame: pd.DataFrame) -> None:
        cursor = self._connection.cursor()
        try:
            cursor.execute(
                f"""
                INSERT INTO {self._snapshot_table} (cache_key, cutoff_date, row_count)
                VALUES (?, ?, ?)
                """,
                self._cache_key,
                cutoff,
                len(frame),
            )
            if not frame.empty:
                database_columns = ["cache_key", *self._columns]
                column_sql = ", ".join(f"[{column}]" for column in database_columns)
                placeholders = ", ".join("?" for _ in database_columns)
                values = [
                    (self._cache_key, *(self._database_value(value) for value in row))
                    for row in frame[self._columns].itertuples(index=False, name=None)
                ]
                cursor.fast_executemany = True
                cursor.executemany(
                    f"INSERT INTO {self._row_table} ({column_sql}) VALUES ({placeholders})",
                    values,
                )
            self._connection.commit()
        except Exception:
            self._connection.rollback()
            raise

    @staticmethod
    def _database_value(value: object) -> object:
        if value is None or value is pd.NA or value is pd.NaT:
            return None
        if hasattr(value, "item"):
            value = value.item()
        if isinstance(value, float) and not math.isfinite(value):
            return None
        return value
