import os
from dataclasses import dataclass
from datetime import date
from pathlib import Path

from dotenv import load_dotenv


def _required(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise ValueError(f"{name} is required")
    return value


def _optional_date(name: str) -> date | None:
    value = os.getenv(name, "").strip()
    return date.fromisoformat(value) if value else None


@dataclass(frozen=True)
class AppConfig:
    mssql_host: str
    mssql_port: int
    mssql_database: str
    mssql_username: str
    mssql_password: str
    mssql_driver: str
    mssql_encrypt: str
    mssql_trust_server_certificate: str
    training_start_date: date
    training_end_date: date | None
    warmup_months: int
    cutoff_interval_days: int
    active_pair_months: int
    model_directory: Path
    model_iterations: int
    model_learning_rate: float
    model_depth: int
    model_random_seed: int

    @classmethod
    def from_environment(cls) -> "AppConfig":
        app_directory = Path(__file__).resolve().parent
        load_dotenv(
            app_directory / ".env",
            override=os.getenv("PURCHASE_PREDICTOR_LOAD_DOTENV_OVERRIDE", "").lower()
            == "true",
        )

        model_directory = Path(os.getenv("MODEL_DIRECTORY", "models"))
        if not model_directory.is_absolute():
            model_directory = app_directory / model_directory

        return cls(
            mssql_host=os.getenv("MSSQL_HOST", "localhost").strip(),
            mssql_port=int(os.getenv("MSSQL_PORT", "1433")),
            mssql_database=os.getenv("MSSQL_DATABASE", "Birokrat").strip(),
            mssql_username=_required("MSSQL_USERNAME"),
            mssql_password=_required("MSSQL_PASSWORD"),
            mssql_driver=os.getenv("MSSQL_DRIVER", "ODBC Driver 18 for SQL Server").strip(),
            mssql_encrypt=os.getenv("MSSQL_ENCRYPT", "yes").strip(),
            mssql_trust_server_certificate=os.getenv(
                "MSSQL_TRUST_SERVER_CERTIFICATE", "no"
            ).strip(),
            training_start_date=_optional_date("TRAINING_START_DATE") or date(2004, 1, 1),
            training_end_date=_optional_date("TRAINING_END_DATE"),
            warmup_months=int(os.getenv("WARMUP_MONTHS", "12")),
            cutoff_interval_days=int(os.getenv("CUTOFF_INTERVAL_DAYS", "7")),
            active_pair_months=int(os.getenv("ACTIVE_PAIR_MONTHS", "24")),
            model_directory=model_directory,
            model_iterations=int(os.getenv("MODEL_ITERATIONS", "500")),
            model_learning_rate=float(os.getenv("MODEL_LEARNING_RATE", "0.05")),
            model_depth=int(os.getenv("MODEL_DEPTH", "7")),
            model_random_seed=int(os.getenv("MODEL_RANDOM_SEED", "42")),
        )

    @property
    def connection_string(self) -> str:
        server = self.mssql_host
        if self.mssql_port:
            server = f"{server},{self.mssql_port}"
        return ";".join(
            [
                f"DRIVER={{{self.mssql_driver}}}",
                f"SERVER={server}",
                f"DATABASE={self.mssql_database}",
                f"UID={self.mssql_username}",
                f"PWD={self.mssql_password}",
                f"Encrypt={self.mssql_encrypt}",
                f"TrustServerCertificate={self.mssql_trust_server_certificate}",
            ]
        )

