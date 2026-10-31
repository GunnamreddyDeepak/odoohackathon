from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


BillingFrequency = Literal["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]


class SubscriptionPlanCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=500)
    plan_code: str = Field(min_length=2, max_length=50)
    billing_frequency: BillingFrequency
    base_price: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    currency: str = Field(min_length=3, max_length=3)
    is_active: bool = True

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, value: str) -> str:
        value = value.upper()
        if not value.isalpha():
            raise ValueError("Currency must contain three letters")
        return value

    @field_validator("plan_code")
    @classmethod
    def normalize_plan_code(cls, value: str) -> str:
        return value.strip().upper()


class SubscriptionPlanUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=500)
    billing_frequency: BillingFrequency | None = None
    base_price: Decimal | None = Field(
        default=None, ge=0, max_digits=12, decimal_places=2
    )
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    is_active: bool | None = None

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.upper()
        if not value.isalpha():
            raise ValueError("Currency must contain three letters")
        return value


class SubscriptionPlanResponse(BaseModel):
    id: int
    name: str
    description: str | None
    plan_code: str
    billing_frequency: str
    base_price: Decimal
    currency: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)