import logging
from datetime import date, timedelta

import pandas as pd
from dateutil.relativedelta import relativedelta
from injector import inject, singleton

from config import AppConfig
from domain import Purchase
from feature_builder import FeatureBuilder
from training_dataset_cache import TrainingDatasetCache


@singleton
class TrainingDatasetBuilder:
    horizons = (7, 14, 30)

    @inject
    def __init__(
        self,
        config: AppConfig,
        feature_builder: FeatureBuilder,
        dataset_cache: TrainingDatasetCache,
    ):
        self._config = config
        self._feature_builder = feature_builder
        self._dataset_cache = dataset_cache
        self._logger = logging.getLogger(type(self).__name__)

    def build(self, purchases: list[Purchase]) -> pd.DataFrame:
        purchase_lines = self._purchase_lines(purchases)
        events = self._events(purchase_lines)
        if events.empty:
            raise ValueError("No purchases were returned from MSSQL")

        latest_date = events["service_date"].max().date()
        configured_end = self._config.training_end_date or date.today()
        label_end = min(configured_end, latest_date)
        first_date = events["service_date"].min().date()
        cutoff = first_date + relativedelta(months=self._config.warmup_months)
        final_cutoff = label_end - timedelta(days=max(self.horizons))
        frames: list[pd.DataFrame] = []
        all_pair_groups = {
            key: value
            for key, value in events.groupby(
                ["customer_code", "product_code"], sort=False
            )
        }

        with self._dataset_cache.session() as cache:
            cached = cache.load(cutoff, final_cutoff)
            while cutoff <= final_cutoff:
                if cutoff in cached:
                    frames.append(cached[cutoff])
                else:
                    snapshot = self._build_snapshot(
                        cutoff, purchase_lines, events, all_pair_groups
                    )
                    cache.save(cutoff, snapshot)
                    frames.append(snapshot)
                cutoff += timedelta(days=self._config.cutoff_interval_days)

        dataset = pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()
        if dataset.empty:
            raise ValueError("Training rules produced no rows")
        self._logger.info("Built %d training rows", len(dataset))
        return dataset

    def _build_snapshot(
        self,
        cutoff: date,
        purchase_lines: pd.DataFrame,
        events: pd.DataFrame,
        all_pair_groups: dict[tuple[object, object], pd.DataFrame],
    ) -> pd.DataFrame:
        self._logger.info("Building training snapshot for cutoff %s", cutoff)
        history = events[events["service_date"] <= pd.Timestamp(cutoff)]
        invoice_history = purchase_lines[
            purchase_lines["service_date"] <= pd.Timestamp(cutoff)
        ]
        active_since = pd.Timestamp(cutoff) - relativedelta(
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

        rows: list[dict[str, object]] = []
        for customer_code, product_code in active_pairs.itertuples(index=False, name=None):
            pair_history = pair_groups[(customer_code, product_code)]
            features = self._feature_builder.build(
                cutoff=cutoff,
                pair_history=pair_history,
                customer_history=customer_groups[customer_code],
                product_history=product_groups[product_code],
            )
            next_dates = all_pair_groups[(customer_code, product_code)]["service_date"]
            next_dates = next_dates[next_dates > pd.Timestamp(cutoff)]
            next_date = next_dates.min() if not next_dates.empty else pd.NaT
            days_to_next = (
                (next_date - pd.Timestamp(cutoff)).days if pd.notna(next_date) else None
            )

            row = {**features, "cutoff_date": cutoff}
            for horizon in self.horizons:
                row[f"purchased_within_{horizon}_days"] = int(
                    days_to_next is not None and days_to_next <= horizon
                )
            rows.append(row)
        return pd.DataFrame(rows)

    @staticmethod
    def _purchase_lines(purchases: list[Purchase]) -> pd.DataFrame:
        frame = pd.DataFrame([purchase.__dict__ for purchase in purchases])
        frame["service_date"] = pd.to_datetime(frame["service_date"])
        return frame

    @staticmethod
    def _events(frame: pd.DataFrame) -> pd.DataFrame:
        return (
            frame.groupby(
                ["customer_code", "product_code", "service_date"], as_index=False
            )
            .agg(quantity=("quantity", "sum"), net_amount=("net_amount", "sum"))
            .assign(unit_price=lambda value: value["net_amount"] / value["quantity"])
            .sort_values("service_date")
            .reset_index(drop=True)
        )
