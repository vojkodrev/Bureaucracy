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
    @inject
    def __init__(self, config: AppConfig):
        self._root = config.model_directory

    def load_active(
        self, feature_builder: FeatureBuilder
    ) -> tuple[str, dict[int, CatBoostClassifier]]:
        active_path = self._root / "active.json"
        if not active_path.exists():
            raise FileNotFoundError(f"No active model pointer exists at {active_path}")

        active = json.loads(active_path.read_text(encoding="utf-8"))
        version = str(active["version"])
        version_directory = self._root / version
        manifest_path = version_directory / "manifest.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

        expected_features = list(feature_builder.feature_columns)
        if manifest.get("feature_columns") != expected_features:
            raise ValueError(
                "The active model feature columns do not match the current feature builder"
            )

        models: dict[int, CatBoostClassifier] = {}
        for artifact in manifest.get("artifacts", []):
            horizon = int(artifact["horizon_days"])
            path = version_directory / str(artifact["file"])
            actual_hash = hashlib.sha256(path.read_bytes()).hexdigest()
            if actual_hash != artifact["sha256"]:
                raise ValueError(f"Model artifact checksum does not match: {path}")
            model = CatBoostClassifier()
            model.load_model(path)
            models[horizon] = model

        missing = {7, 14, 30} - models.keys()
        if missing:
            raise ValueError(f"Active model set is missing horizons: {sorted(missing)}")
        return version, models

    def publish(
        self,
        models: dict[int, CatBoostClassifier],
        manifest: dict[str, object],
    ) -> Path:
        self._root.mkdir(parents=True, exist_ok=True)
        version = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        final_directory = self._root / version
        temporary_directory = Path(tempfile.mkdtemp(prefix=f".{version}-", dir=self._root))

        try:
            artifacts = []
            for horizon, model in models.items():
                filename = f"model_{horizon}d.cbm"
                path = temporary_directory / filename
                model.save_model(path)
                artifacts.append(
                    {
                        "horizon_days": horizon,
                        "file": filename,
                        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                    }
                )

            complete_manifest = {
                **manifest,
                "version": version,
                "created_at_utc": datetime.now(timezone.utc).isoformat(),
                "artifacts": artifacts,
            }
            (temporary_directory / "manifest.json").write_text(
                json.dumps(complete_manifest, indent=2, default=str), encoding="utf-8"
            )
            temporary_directory.rename(final_directory)

            active_temp = self._root / ".active.json.tmp"
            active_temp.write_text(json.dumps({"version": version}, indent=2), encoding="utf-8")
            os.replace(active_temp, self._root / "active.json")
            return final_directory
        except Exception:
            shutil.rmtree(temporary_directory, ignore_errors=True)
            raise
