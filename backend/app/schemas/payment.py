from datetime import datetime, timezone
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PaymentCreate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    payment_method: str = Field(min_length=2, max_length=30)
    payment_date: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    reference: str | None = Field(default=None, max_length=100)
    note: str | None = Field(default=None, max_length=500)

    @field_validator("payment_method")
    @classmethod
    def normalize_method(cls, value):
        value = value.strip().upper()
        if not value:
            raise ValueError("Payment method cannot be empty")
        return value

    @field_validator("reference", "note")
    @classmethod
    def normalize_optional_text(cls, value):
        if value is not None:
            value = value.strip()
            return value or None
        return value


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    invoice_id: int
    amount: Decimal
    payment_method: str
    payment_date: datetime
    reference: str | None
    note: str | None
    status: str
    created_at: datetime
    outstanding_balance: Decimal
