import argparse
import logging

from injector import Injector

from app_module import AppModule
from training_service import TrainingService


def main() -> None:
    parser = argparse.ArgumentParser(description="Customer product purchase predictor")
    subcommands = parser.add_subparsers(dest="command", required=True)
    subcommands.add_parser("train", help="Build training snapshots and publish models")
    arguments = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    container = Injector([AppModule()])

    if arguments.command == "train":
        container.get(TrainingService).train()


if __name__ == "__main__":
    main()

