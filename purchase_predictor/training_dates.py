from datetime import date, timedelta


def label_date_range(cutoff: date, horizon: int) -> tuple[date, date]:
    return cutoff + timedelta(days=1), cutoff + timedelta(days=horizon)
