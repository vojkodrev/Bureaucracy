import time
from datetime import timedelta


class ProgressTimer:
    def __init__(self) -> None:
        self._started_at = time.monotonic()
        self._previous_progress_at = self._started_at
        self._estimated_remaining_seconds: float | None = None

    def update(self, completed: int, total: int) -> tuple[timedelta, timedelta]:
        progress_at = time.monotonic()
        elapsed_seconds = progress_at - self._started_at
        raw_remaining_seconds = elapsed_seconds / completed * (total - completed)
        if self._estimated_remaining_seconds is None:
            self._estimated_remaining_seconds = raw_remaining_seconds
        else:
            time_since_progress = progress_at - self._previous_progress_at
            self._estimated_remaining_seconds = (
                0.2 * raw_remaining_seconds
                + 0.8
                * max(
                    self._estimated_remaining_seconds - time_since_progress,
                    0,
                )
            )
        self._previous_progress_at = progress_at
        return (
            timedelta(seconds=round(elapsed_seconds)),
            timedelta(seconds=round(self._estimated_remaining_seconds)),
        )
