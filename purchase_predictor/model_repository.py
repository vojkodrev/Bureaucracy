import hashlib
import json
import os
import shutil
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from catboost import CatBoostClassifier
from injector import inject, singleton

from config import AppConfig
from feature_builder import FeatureBuilder


@singleton
class FileModelRepository:
    horizons = (7, 14, 30)

    @inject
    def __init__(self, config: AppConfig, feature_builder: FeatureBuilder):
        self._root = config.model_directory
        self._feature_builder = feature_builder

    def load_active(self) -> tuple[dict[int, str], dict[int, CatBoostClassifier]]:
        versions: dict[int, str] = {}
        models: dict[int, CatBoostClassifier] = {}
        for horizon in self.horizons:
            version, model = self._load_active_horizon(horizon)
            versions[horizon] = version
            models[horizon] = model
        return versions, models

    def is_current(self, horizon: int, training_end_date: object) -> bool:
        try:
            _, manifest = self._active_manifest(horizon)
        except (FileNotFoundError, KeyError, TypeError, ValueError, json.JSONDecodeError):
            return False
        dataset = manifest.get("dataset")
        return (
            int(manifest.get("horizon_days", 0)) == horizon
            and manifest.get("feature_columns")
            == list(self._feature_builder.feature_columns)
            and isinstance(dataset, dict)
            and dataset.get("training_end_date") == str(training_end_date)
        )

    def _load_active_horizon(self, horizon: int) -> tuple[str, CatBoostClassifier]:
        version_directory, manifest = self._active_manifest(horizon)
        version = version_directory.name
        manifest_path = version_directory / "manifest.json"

        expected_features = list(self._feature_builder.feature_columns)
        if manifest.get("feature_columns") != expected_features:
            raise ValueError(
                "The active model feature columns do not match the current feature builder"
            )

        if int(manifest.get("horizon_days", 0)) != horizon:
            raise ValueError(
                f"Active model manifest at {manifest_path} has the wrong horizon"
            )
        filename = str(manifest["model_file"])
        path = version_directory / filename
        actual_hash = hashlib.sha256(path.read_bytes()).hexdigest()
        if actual_hash != manifest["sha256"]:
            raise ValueError(f"Model artifact checksum does not match: {path}")
        model = CatBoostClassifier()
        model.load_model(path)
        return version, model

    def _active_manifest(self, horizon: int) -> tuple[Path, dict[str, object]]:
        horizon_root = self._horizon_root(horizon)
        active_path = horizon_root / "active.json"
        if not active_path.exists():
            raise FileNotFoundError(
                f"No active {horizon}-day model pointer exists at {active_path}"
            )
        active = json.loads(active_path.read_text(encoding="utf-8"))
        version_directory = horizon_root / str(active["version"])
        manifest_path = version_directory / "manifest.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        return version_directory, manifest

    def publish(
        self,
        horizon: int,
        model: CatBoostClassifier,
        manifest: dict[str, object],
    ) -> Path:
        if horizon not in self.horizons:
            raise ValueError(f"Unsupported prediction horizon: {horizon}")
        horizon_root = self._horizon_root(horizon)
        horizon_root.mkdir(parents=True, exist_ok=True)
        version = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        final_directory = horizon_root / version
        temporary_directory = Path(
            tempfile.mkdtemp(prefix=f".{version}-", dir=horizon_root)
        )

        try:
            filename = "model.cbm"
            path = temporary_directory / filename
            model.save_model(path)

            complete_manifest = {
                **manifest,
                "horizon_days": horizon,
                "version": version,
                "created_at_utc": datetime.now(timezone.utc).isoformat(),
                "model_file": filename,
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            }
            (temporary_directory / "manifest.json").write_text(
                json.dumps(complete_manifest, indent=2, default=str), encoding="utf-8"
            )
            temporary_directory.rename(final_directory)

            active_temp = horizon_root / ".active.json.tmp"
            active_temp.write_text(json.dumps({"version": version}, indent=2), encoding="utf-8")
            os.replace(active_temp, horizon_root / "active.json")
            return final_directory
        except Exception:
            shutil.rmtree(temporary_directory, ignore_errors=True)
            raise

    def _horizon_root(self, horizon: int) -> Path:
        return self._root / str(horizon)
