
from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


InvoiceStatus = Literal["DRAFT", "CONFIRMED", "CANCELLED"]
PaymentStatus = Literal["UNPAID", "PARTIALLY_PAID", "PAID", "OVERDUE"]


class InvoiceLineCreate(BaseModel):
    description: str = Field(min_length=1, max_length=255)
    quantity: int = Field(ge=1)
    unit_price: Decimal = Field(
        ge=0,
        max_digits=12,
        decimal_places=2,
    )

    @model_validator(mode="after")
    def validate_description(self):
        self.description = self.description.strip()
        if not self.description:
            raise ValueError("Description cannot be empty")
        return self


class InvoiceCreate(BaseModel):
    customer_id: int = Field(gt=0)
    subscription_id: int | None = Field(default=None, gt=0)

    issue_date: date
    due_date: date

    currency: str = Field(default="INR", min_length=3, max_length=3)

    tax_rule_code: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    discount_code: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    lines: list[InvoiceLineCreate] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_invoice(self):
        if self.due_date < self.issue_date:
            raise ValueError("Due date cannot be before issue date")

        self.currency = self.currency.strip().upper()
        if not self.currency.isalpha():
            raise ValueError("Currency must contain three letters")

        if self.tax_rule_code is not None:
            self.tax_rule_code = self.tax_rule_code.strip().upper()

        if self.discount_code is not None:
            self.discount_code = self.discount_code.strip().upper()

        return self


class InvoiceLineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    description: str
    quantity: int
    unit_price: Decimal
    line_total: Decimal


class InvoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    invoice_number: str
    customer_id: int
    subscription_id: int | None

    issue_date: date
    due_date: date
    currency: str

    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    total: Decimal

    status: str
    payment_status: str

    created_at: datetime
    updated_at: datetime

    lines: list[InvoiceLineResponse]

class InvoiceStatusUpdate(BaseModel):
    status: Literal["CONFIRMED", "CANCELLED"]
