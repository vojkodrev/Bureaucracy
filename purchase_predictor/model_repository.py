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


@singleton
class FileModelRepository:
    @inject
    def __init__(self, config: AppConfig):
        self._root = config.model_directory

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
