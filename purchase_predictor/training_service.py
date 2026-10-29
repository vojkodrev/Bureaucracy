import logging
from datetime import date

import pandas as pd
from catboost import CatBoostClassifier
from injector import inject, singleton
from sklearn.metrics import average_precision_score, log_loss, precision_score, recall_score

from config import AppConfig
from feature_builder import FeatureBuilder
from model_repository import FileModelRepository
from purchase_reader import MssqlPurchaseReader
from training_dataset_builder import TrainingDatasetBuilder


@singleton
class TrainingService:
    @inject
    def __init__(
        self,
        config: AppConfig,
        purchase_reader: MssqlPurchaseReader,
        dataset_builder: TrainingDatasetBuilder,
        feature_builder: FeatureBuilder,
        model_repository: FileModelRepository,
    ):
        self._config = config
        self._purchase_reader = purchase_reader
        self._dataset_builder = dataset_builder
        self._feature_builder = feature_builder
        self._model_repository = model_repository
        self._logger = logging.getLogger(type(self).__name__)

    def train(self) -> None:
        purchases = self._purchase_reader.read(
            self._config.training_start_date,
            self._config.training_end_date,
        )
        features = self._feature_builder.feature_columns
        categorical = self._feature_builder.categorical_columns

        for horizon in self._dataset_builder.horizons:
            dataset = self._dataset_builder.build(purchases, horizon)

            train, validation, test = self._chronological_split(dataset)
            target = "purchased_within_horizon"
            self._require_both_classes(train[target], f"training {horizon}-day target")
            self._require_both_classes(test[target], f"test {horizon}-day target")

            evaluation_model = self._new_model(self._config.model_iterations)
            evaluation_model.fit(
                train[features],
                train[target],
                cat_features=categorical,
                eval_set=(validation[features], validation[target]),
                early_stopping_rounds=50,
                use_best_model=True,
            )
            best_iteration = evaluation_model.get_best_iteration()
            selected_iterations = (
                best_iteration + 1
                if best_iteration >= 0
                else self._config.model_iterations
            )
            probability = evaluation_model.predict_proba(test[features])[:, 1]
            prediction = (probability >= 0.5).astype(int)
            metrics = {
                "average_precision": average_precision_score(test[target], probability),
                "log_loss": log_loss(test[target], probability),
                "precision_at_0_5": precision_score(test[target], prediction, zero_division=0),
                "recall_at_0_5": recall_score(test[target], prediction, zero_division=0),
                "positive_rate": float(test[target].mean()),
                "selected_iterations": selected_iterations,
            }

            final_model = self._new_model(selected_iterations)
            final_model.fit(
                dataset[features],
                dataset[target],
                cat_features=categorical,
            )
            dataset_metadata = {
                "training_start_date": dataset["cutoff_date"].min(),
                "training_end_date": dataset["cutoff_date"].max(),
                "row_count": len(dataset),
                "snapshot_interval_days": horizon,
                "split": {
                    "train": len(train),
                    "validation": len(validation),
                    "test": len(test),
                },
            }
            output = self._model_repository.publish(
                horizon,
                final_model,
                {
                    "feature_columns": features,
                    "categorical_columns": categorical,
                    "metrics": metrics,
                    "dataset": dataset_metadata,
                },
            )
            self._logger.info(
                "Published trained %d-day model to %s", horizon, output
            )
            del (
                dataset,
                train,
                validation,
                test,
                evaluation_model,
                probability,
                prediction,
                final_model,
            )

    def _new_model(self, iterations: int) -> CatBoostClassifier:
        return CatBoostClassifier(
            iterations=iterations,
            learning_rate=self._config.model_learning_rate,
            depth=self._config.model_depth,
            random_seed=self._config.model_random_seed,
            loss_function="Logloss",
            eval_metric="PRAUC",
            auto_class_weights="Balanced",
            verbose=50,
        )

    @staticmethod
    def _chronological_split(
        dataset: pd.DataFrame,
    ) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        dates = sorted(dataset["cutoff_date"].unique())
        if len(dates) < 10:
            raise ValueError("At least 10 cutoff dates are required")
        validation_index = max(1, int(len(dates) * 0.70))
        test_index = max(validation_index + 1, int(len(dates) * 0.85))
        validation_start = dates[validation_index]
        test_start = dates[test_index]
        return (
            dataset[dataset["cutoff_date"] < validation_start],
            dataset[
                (dataset["cutoff_date"] >= validation_start)
                & (dataset["cutoff_date"] < test_start)
            ],
            dataset[dataset["cutoff_date"] >= test_start],
        )

    @staticmethod
    def _require_both_classes(values: pd.Series, description: str) -> None:
        if values.nunique() < 2:
            raise ValueError(f"{description} must contain positive and negative examples")
