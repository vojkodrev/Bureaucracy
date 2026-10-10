import math
from datetime import date, datetime, timezone

import pandas as pd
import pyodbc
from injector import inject, singleton

from config import AppConfig
from feature_builder import FeatureBuilder


@singleton
class PredictionRepository:
    _run_table = "[Bureaucracy].[dbo].[purchase_prediction_runs]"
    _row_table = "[Bureaucracy].[dbo].[purchase_prediction_rows]"

    @inject
    def __init__(self, config: AppConfig, feature_builder: FeatureBuilder):
        self._connection_string = config.connection_string
        self._feature_columns = feature_builder.feature_columns

    def save(self, as_of_date: date, model_version: str, frame: pd.DataFrame) -> int:
        created_at = datetime.now(timezone.utc).replace(tzinfo=None)
        with pyodbc.connect(self._connection_string) as connection:
            cursor = connection.cursor()
            try:
                existing = cursor.execute(
                    f"""
                    SELECT id FROM {self._run_table}
                    WHERE as_of_date = ? AND model_version = ?
                    """,
                    as_of_date,
                    model_version,
                ).fetchone()
                if existing:
                    raise ValueError(
                        f"Predictions already exist for {as_of_date} and model {model_version}"
                    )

                inserted = cursor.execute(
                    f"""
                    INSERT INTO {self._run_table}
                        (as_of_date, forecast_end_7_days, forecast_end_14_days,
                         forecast_end_30_days, model_version, row_count, created_at_utc)
                    OUTPUT INSERTED.id
                    VALUES (?, DATEADD(day, 7, ?), DATEADD(day, 14, ?),
                            DATEADD(day, 30, ?), ?, ?, ?)
                    """,
                    as_of_date,
                    as_of_date,
                    as_of_date,
                    as_of_date,
                    model_version,
                    len(frame),
                    created_at,
                ).fetchone()
                if inserted is None:
                    raise RuntimeError("Prediction run insert did not return an id")
                run_id = inserted[0]

                if not frame.empty:
                    columns = [
                        "run_id",
                        *self._feature_columns,
                        "score_7_days",
                        "score_14_days",
                        "score_30_days",
                    ]
                    column_sql = ", ".join(f"[{column}]" for column in columns)
                    placeholders = ", ".join("?" for _ in columns)
                    data_columns = [
                        *self._feature_columns,
                        "score_7_days",
                        "score_14_days",
                        "score_30_days",
                    ]
                    values = [
                        (run_id, *(self._database_value(value) for value in row))
                        for row in frame[data_columns].itertuples(index=False, name=None)
                    ]
                    cursor.fast_executemany = True
                    cursor.executemany(
                        f"INSERT INTO {self._row_table} ({column_sql}) VALUES ({placeholders})",
                        values,
                    )
                connection.commit()
                return int(run_id)
            except Exception:
                connection.rollback()
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
