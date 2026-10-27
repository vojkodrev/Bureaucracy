import logging
import os
from concurrent.futures import ProcessPoolExecutor
from dataclasses import dataclass
from datetime import date, timedelta
from types import SimpleNamespace

import pandas as pd
from dateutil.relativedelta import relativedelta
from injector import inject, singleton

from config import AppConfig
from domain import Purchase
from feature_builder import FeatureBuilder
from training_dataset_cache import TrainingDatasetCache
from training_dates import label_date_range


@dataclass(frozen=True)
class TrainingDataset:
    frame: pd.DataFrame
    new_snapshot_count: int


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

    def build(self, purchases: list[Purchase], horizon: int) -> TrainingDataset:
        if horizon not in self.horizons:
            raise ValueError(f"Unsupported prediction horizon: {horizon}")

        purchase_lines = self._purchase_lines(purchases)
        events = self._events(purchase_lines)
        if events.empty:
            raise ValueError("No purchases were returned from MSSQL")

        label_end = date.today()
        first_date = events["service_date"].min().date()
        first_cutoff = first_date + relativedelta(months=self._config.warmup_months)
        all_pair_groups = {
            key: value
            for key, value in events.groupby(
                ["customer_code", "product_code"], sort=False
            )
        }

        with self._dataset_cache.session() as cache:
            final_cutoff = label_end - timedelta(days=horizon)
            cached = cache.load(horizon, first_cutoff, final_cutoff)
            cutoffs = self._cutoffs(first_cutoff, final_cutoff, horizon)

            missing_cutoffs = [cutoff for cutoff in cutoffs if cutoff not in cached]
            built: dict[date, pd.DataFrame] = {}
            cache_before = date.today() - relativedelta(
                months=self._config.cache_exclude_recent_months
            )
            worker_count = min(os.cpu_count() or 1, len(missing_cutoffs) or 1)
            with ProcessPoolExecutor(
                max_workers=worker_count,
                initializer=_initialize_snapshot_worker,
                initargs=(
                    self._config.active_pair_months,
                    purchase_lines,
                    events,
                    all_pair_groups,
                ),
            ) as executor:
                snapshots = executor.map(
                    _build_snapshot_in_worker,
                    ((cutoff, horizon) for cutoff in missing_cutoffs),
                )
                for cutoff, snapshot in zip(missing_cutoffs, snapshots):
                    if cutoff < cache_before:
                        cache.save(horizon, cutoff, snapshot)
                    built[cutoff] = snapshot

            frames = [
                cached[cutoff] if cutoff in cached else built[cutoff]
                for cutoff in cutoffs
            ]
            new_snapshot_count = len(built)

        dataset = pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()
        if dataset.empty:
            raise ValueError(
                f"Training rules produced no rows for the {horizon}-day horizon"
            )
        self._logger.info(
            "Built %d training rows for the %d-day horizon",
            len(dataset),
            horizon,
        )
        return TrainingDataset(dataset, new_snapshot_count)

    @staticmethod
    def _cutoffs(first_cutoff: date, final_cutoff: date, horizon: int) -> list[date]:
        if horizon in (7, 14):
            if first_cutoff > final_cutoff:
                return []
            cutoff = final_cutoff - timedelta(days=(final_cutoff.weekday() + 1) % 7)
            cutoffs: list[date] = []
            while cutoff >= first_cutoff:
                cutoffs.append(cutoff)
                cutoff -= timedelta(days=horizon)
            return list(reversed(cutoffs))

        elif horizon == 30:
            if first_cutoff > final_cutoff:
                return []
            cutoff = date(final_cutoff.year, final_cutoff.month, 1)
            cutoffs: list[date] = []
            while cutoff >= first_cutoff:
                cutoffs.append(cutoff)
                cutoff -= relativedelta(months=1)
            return list(reversed(cutoffs))

        else:
            raise ValueError(f"Unsupported prediction horizon: {horizon}")

    def _build_snapshot(
        self,
        cutoff: date,
        horizon: int,
        purchase_lines: pd.DataFrame,
        events: pd.DataFrame,
        all_pair_groups: dict[tuple[object, object], pd.DataFrame],
    ) -> pd.DataFrame:
        label_from, label_to = label_date_range(cutoff, horizon)
        self._logger.info(
            "Building %d-day training snapshot for cutoff %s (label dates %s to %s)",
            horizon,
            cutoff,
            label_from,
            label_to,
        )
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
            label_dates = next_dates[
                (next_dates >= pd.Timestamp(label_from))
                & (next_dates <= pd.Timestamp(label_to))
            ]

            row = {
                **features,
                "cutoff_date": cutoff,
                "purchased_within_horizon": int(not label_dates.empty),
            }
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


_snapshot_worker: TrainingDatasetBuilder | None = None
_snapshot_purchase_lines: pd.DataFrame | None = None
_snapshot_events: pd.DataFrame | None = None
_snapshot_pair_groups: dict[tuple[object, object], pd.DataFrame] | None = None


def _initialize_snapshot_worker(
    active_pair_months: int,
    purchase_lines: pd.DataFrame,
    events: pd.DataFrame,
    all_pair_groups: dict[tuple[object, object], pd.DataFrame],
) -> None:
    global _snapshot_worker
    global _snapshot_purchase_lines
    global _snapshot_events
    global _snapshot_pair_groups

    logging.basicConfig(
        level=logging.INFO,
        format=(
            "%(asctime)s %(levelname)s %(processName)s %(name)s: %(message)s"
        ),
        force=True,
    )
    builder = TrainingDatasetBuilder.__new__(TrainingDatasetBuilder)
    builder._config = SimpleNamespace(active_pair_months=active_pair_months)
    builder._feature_builder = FeatureBuilder()
    builder._logger = logging.getLogger(TrainingDatasetBuilder.__name__)
    _snapshot_worker = builder
    _snapshot_purchase_lines = purchase_lines
    _snapshot_events = events
    _snapshot_pair_groups = all_pair_groups


def _build_snapshot_in_worker(arguments: tuple[date, int]) -> pd.DataFrame:
    if (
        _snapshot_worker is None
        or _snapshot_purchase_lines is None
        or _snapshot_events is None
        or _snapshot_pair_groups is None
    ):
        raise RuntimeError("Snapshot worker was not initialized")

    cutoff, horizon = arguments
    return _snapshot_worker._build_snapshot(
        cutoff,
        horizon,
        _snapshot_purchase_lines,
        _snapshot_events,
        _snapshot_pair_groups,
    )
