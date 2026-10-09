from datetime import date

import numpy as np
import pandas as pd
from injector import singleton


@singleton
class FeatureBuilder:
    feature_columns = [
        "customer_code",
        "product_code",
        "cutoff_month",
        "cutoff_week",
        "days_since_pair_last_purchase",
        "pair_purchase_count_lifetime",
        "pair_purchase_count_90d",
        "pair_purchase_count_365d",
        "pair_mean_interval_days",
        "pair_median_interval_days",
        "pair_last_interval_days",
        "pair_previous_interval_days",
        "pair_third_previous_interval_days",
        "pair_interval_std_days",
        "pair_overdue_ratio",
        "pair_mean_quantity",
        "pair_last_quantity",
        "pair_last_3_mean_quantity",
        "pair_quantity_change_percent",
        "pair_quantity_365d",
        "pair_last_unit_price",
        "pair_mean_unit_price",
        "pair_unit_price_change_percent",
        "customer_days_since_any_purchase",
        "customer_invoice_count_90d",
        "customer_invoice_count_365d",
        "product_purchase_count_90d",
        "product_purchase_count_365d",
        "product_mean_interval_days",
        "product_median_interval_days",
        "product_customer_count_90d",
        "product_customer_count_365d",
        "product_customer_count_lifetime",
    ]
    categorical_columns = ["customer_code", "product_code"]

    def build(
        self,
        cutoff: date,
        pair_history: pd.DataFrame,
        customer_history: pd.DataFrame,
        product_history: pd.DataFrame,
    ) -> dict[str, object]:
        cutoff_timestamp = pd.Timestamp(cutoff)
        pair_dates = pair_history["service_date"].sort_values()
        intervals = pair_dates.diff().dt.days.dropna()
        product_intervals = (
            product_history.sort_values(["customer_code", "service_date"])
            .groupby("customer_code")["service_date"]
            .diff()
            .dt.days
            .dropna()
        )
        last_quantity = self._number(pair_history.iloc[-1]["quantity"])
        previous_quantity = self._number(
            pair_history.iloc[-2]["quantity"] if len(pair_history) >= 2 else np.nan
        )
        last_unit_price = self._number(pair_history.iloc[-1]["unit_price"])
        previous_unit_price = self._number(
            pair_history.iloc[-2]["unit_price"] if len(pair_history) >= 2 else np.nan
        )
        median_interval = self._number(intervals.median())
        days_since_last = (cutoff_timestamp - pair_dates.max()).days

        return {
            "customer_code": str(pair_history.iloc[-1]["customer_code"]),
            "product_code": str(pair_history.iloc[-1]["product_code"]),
            "cutoff_month": cutoff.month,
            "cutoff_week": cutoff.isocalendar().week,
            "days_since_pair_last_purchase": days_since_last,
            "pair_purchase_count_lifetime": len(pair_history),
            "pair_purchase_count_90d": self._count_since(pair_history, cutoff_timestamp, 90),
            "pair_purchase_count_365d": self._count_since(pair_history, cutoff_timestamp, 365),
            "pair_mean_interval_days": self._number(intervals.mean()),
            "pair_median_interval_days": median_interval,
            "pair_last_interval_days": self._from_end(intervals, 1),
            "pair_previous_interval_days": self._from_end(intervals, 2),
            "pair_third_previous_interval_days": self._from_end(intervals, 3),
            "pair_interval_std_days": self._number(intervals.std()),
            "pair_overdue_ratio": self._ratio(days_since_last, median_interval),
            "pair_mean_quantity": self._number(pair_history["quantity"].mean()),
            "pair_last_quantity": last_quantity,
            "pair_last_3_mean_quantity": self._number(pair_history["quantity"].tail(3).mean()),
            "pair_quantity_change_percent": self._percentage_change(
                last_quantity, previous_quantity
            ),
            "pair_quantity_365d": self._sum_since(pair_history, cutoff_timestamp, 365, "quantity"),
            "pair_last_unit_price": last_unit_price,
            "pair_mean_unit_price": self._weighted_unit_price(pair_history),
            "pair_unit_price_change_percent": self._percentage_change(
                last_unit_price, previous_unit_price
            ),
            "customer_days_since_any_purchase": (
                cutoff_timestamp - customer_history["service_date"].max()
            ).days,
            "customer_invoice_count_90d": self._unique_since(
                customer_history, cutoff_timestamp, 90, "invoice_id"
            ),
            "customer_invoice_count_365d": self._unique_since(
                customer_history, cutoff_timestamp, 365, "invoice_id"
            ),
            "product_purchase_count_90d": self._count_since(product_history, cutoff_timestamp, 90),
            "product_purchase_count_365d": self._count_since(product_history, cutoff_timestamp, 365),
            "product_mean_interval_days": self._number(product_intervals.mean()),
            "product_median_interval_days": self._number(product_intervals.median()),
            "product_customer_count_90d": self._unique_since(
                product_history, cutoff_timestamp, 90, "customer_code"
            ),
            "product_customer_count_365d": self._unique_since(
                product_history, cutoff_timestamp, 365, "customer_code"
            ),
            "product_customer_count_lifetime": int(
                product_history["customer_code"].nunique()
            ),
        }

    @staticmethod
    def _recent(frame: pd.DataFrame, cutoff: pd.Timestamp, days: int) -> pd.DataFrame:
        return frame[frame["service_date"] >= cutoff - pd.Timedelta(days=days)]

    def _count_since(self, frame: pd.DataFrame, cutoff: pd.Timestamp, days: int) -> int:
        return len(self._recent(frame, cutoff, days))

    def _sum_since(
        self, frame: pd.DataFrame, cutoff: pd.Timestamp, days: int, column: str
    ) -> float:
        return float(self._recent(frame, cutoff, days)[column].sum())

    def _unique_since(
        self, frame: pd.DataFrame, cutoff: pd.Timestamp, days: int, column: str
    ) -> int:
        return int(self._recent(frame, cutoff, days)[column].nunique())

    @staticmethod
    def _number(value: object) -> float:
        return float(value) if pd.notna(value) else float("nan")

    def _from_end(self, values: pd.Series, position: int) -> float:
        if len(values) < position:
            return float("nan")
        return self._number(values.iloc[-position])

    @staticmethod
    def _ratio(numerator: float, denominator: float) -> float:
        if not np.isfinite(denominator) or denominator <= 0:
            return float("nan")
        return float(numerator / denominator)

    @staticmethod
    def _percentage_change(current: float, previous: float) -> float:
        if not np.isfinite(previous) or previous == 0 or not np.isfinite(current):
            return float("nan")
        return float((current - previous) / abs(previous) * 100)

    @staticmethod
    def _weighted_unit_price(frame: pd.DataFrame) -> float:
        quantity = frame["quantity"].sum()
        if quantity == 0:
            return float("nan")
        return float(frame["net_amount"].sum() / quantity)
