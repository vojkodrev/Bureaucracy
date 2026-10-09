from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class Purchase:
    customer_code: str
    product_code: str
    service_date: date
    invoice_id: str
    invoice_number: str
    quantity: float
    net_amount: float
