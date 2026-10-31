from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


SubscriptionStatus = Literal[
    "DRAFT", "QUOTATION", "CONFIRMED", "ACTIVE", "PAUSED", "CLOSED"
]

BillingFrequency = Literal["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]
CreationSource = Literal["USER", "SYSTEM"]


class SubscriptionCreate(BaseModel):
    subscription_code: str = Field(min_length=2, max_length=50)
    customer_id: int = Field(gt=0)
    plan_id: int | None = Field(default=None, gt=0)

    start_date: date
    end_date: date | None = None
    next_billing_date: date | None = None

    plan_name: str | None = Field(default=None, min_length=2, max_length=150)
    plan_price: Decimal | None = Field(
        default=None, ge=0, max_digits=12, decimal_places=2
    )
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    billing_frequency: BillingFrequency | None = None

    created_by: int | None = Field(default=None, gt=0)
    creation_source: CreationSource = "USER"

    @model_validator(mode="after")
    def validate_subscription(self):
        if self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date cannot be before start_date")

        if self.next_billing_date and self.next_billing_date < self.start_date:
            raise ValueError("next_billing_date cannot be before start_date")

        if self.plan_id is None:
            if any(value is None for value in (
                self.plan_name,
                self.plan_price,
                self.currency,
                self.billing_frequency,
            )):
                raise ValueError(
                    "Plan snapshot fields are required when plan_id is not provided"
                )

        if self.currency is not None:
            self.currency = self.currency.upper()
            if not self.currency.isalpha():
                raise ValueError("Currency must contain three letters")

        self.subscription_code = self.subscription_code.strip().upper()
        return self


class SubscriptionUpdate(BaseModel):
    start_date: date | None = None
    end_date: date | None = None
    next_billing_date: date | None = None


class SubscriptionStatusUpdate(BaseModel):
    status: SubscriptionStatus


class SubscriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    subscription_code: str
    customer_id: int
    plan_id: int | None
    status: str
    start_date: date
    end_date: date | None
    next_billing_date: date | None
    plan_name: str
    plan_price: Decimal
    currency: str
    billing_frequency: str
    created_by: int | None
    creation_source: str
    created_at: datetime
    updated_at: datetime