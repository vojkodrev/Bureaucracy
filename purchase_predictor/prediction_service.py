import logging
from datetime import date, timedelta

from injector import inject, singleton

from config import AppConfig
from feature_builder import FeatureBuilder
from model_repository import FileModelRepository
from prediction_dataset_builder import PredictionDatasetBuilder
from prediction_repository import PredictionRepository
from purchase_reader import MssqlPurchaseReader


@singleton
class PredictionService:
    @inject
    def __init__(
        self,
        config: AppConfig,
        purchase_reader: MssqlPurchaseReader,
        dataset_builder: PredictionDatasetBuilder,
        feature_builder: FeatureBuilder,
        model_repository: FileModelRepository,
        prediction_repository: PredictionRepository,
    ):
        self._config = config
        self._purchase_reader = purchase_reader
        self._dataset_builder = dataset_builder
        self._feature_builder = feature_builder
        self._model_repository = model_repository
        self._prediction_repository = prediction_repository
        self._logger = logging.getLogger(type(self).__name__)

    def predict(self, as_of_date: date) -> int:
        purchases = self._purchase_reader.read(
            self._config.training_start_date, as_of_date
        )
        features = self._dataset_builder.build(purchases, as_of_date)
        model_version, models = self._model_repository.load_active(self._feature_builder)

        for horizon, model in sorted(models.items()):
            score_column = f"score_{horizon}_days"
            if features.empty:
                features[score_column] = []
            else:
                features[score_column] = model.predict_proba(
                    features[self._feature_builder.feature_columns]
                )[:, 1]

        run_id = self._prediction_repository.save(
            as_of_date, model_version, features
        )
        self._logger.info(
            "Saved prediction run %d using model %s for %d pairs (%s through %s)",
            run_id,
            model_version,
            len(features),
            as_of_date + timedelta(days=1),
            as_of_date + timedelta(days=30),
        )
        return run_id
