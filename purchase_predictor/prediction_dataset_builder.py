from datetime import date

import pandas as pd
from dateutil.relativedelta import relativedelta
from injector import inject, singleton

from config import AppConfig
from domain import Purchase
from feature_builder import FeatureBuilder
from training_dataset_builder import TrainingDatasetBuilder


@singleton
class PredictionDatasetBuilder:
    @inject
    def __init__(self, config: AppConfig, feature_builder: FeatureBuilder):
        self._config = config
        self._feature_builder = feature_builder

    def build(self, purchases: list[Purchase], cutoff: date) -> pd.DataFrame:
        if not purchases:
            raise ValueError("No purchases were returned from MSSQL")

        purchase_lines = TrainingDatasetBuilder._purchase_lines(purchases)
        events = TrainingDatasetBuilder._events(purchase_lines)
        cutoff_timestamp = pd.Timestamp(cutoff)
        history = events[events["service_date"] <= cutoff_timestamp]
        invoice_history = purchase_lines[
            purchase_lines["service_date"] <= cutoff_timestamp
        ]
        active_since = cutoff_timestamp - relativedelta(
            months=self._config.active_pair_months
        )
        active_pairs = history[history["service_date"] >= active_since][
            ["customer_code", "product_code"]
        ].drop_duplicates()

        customer_groups = {
            key: value
            for key, value in invoice_history.groupby("customer_code", sort=False)
        }
        product_groups = {
            key: value for key, value in history.groupby("product_code", sort=False)
        }
        pair_groups = {
            key: value
            for key, value in history.groupby(
                ["customer_code", "product_code"], sort=False
            )
        }

        rows = []
        for customer_code, product_code in active_pairs.itertuples(index=False, name=None):
            rows.append(
                self._feature_builder.build(
                    cutoff=cutoff,
                    pair_history=pair_groups[(customer_code, product_code)],
                    customer_history=customer_groups[customer_code],
                    product_history=product_groups[product_code],
                )
            )
        return pd.DataFrame(rows, columns=self._feature_builder.feature_columns)
