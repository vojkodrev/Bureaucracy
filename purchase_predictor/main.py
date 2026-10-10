import argparse
import logging
from datetime import date

from injector import Injector

from app_module import AppModule
from training_service import TrainingService
from prediction_service import PredictionService


def main() -> None:
    parser = argparse.ArgumentParser(description="Customer product purchase predictor")
    subcommands = parser.add_subparsers(dest="command", required=True)
    subcommands.add_parser("train", help="Build training snapshots and publish models")
    predict_parser = subcommands.add_parser(
        "predict", help="Score active customer-product pairs and save the results"
    )
    predict_parser.add_argument(
        "--as-of",
        type=date.fromisoformat,
        default=date.today(),
        help="Prediction cutoff date in YYYY-MM-DD format (default: today)",
    )
    arguments = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    container = Injector([AppModule()])

    if arguments.command == "train":
        container.get(TrainingService).train()
    elif arguments.command == "predict":
        container.get(PredictionService).predict(arguments.as_of)


if __name__ == "__main__":
    main()

