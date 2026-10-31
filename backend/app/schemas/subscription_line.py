from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class SubscriptionLineCreate(BaseModel):
    product_id: int = Field(gt=0)
    product_variant_id: int | None = Field(default=None, gt=0)
    quantity: int = Field(ge=1)


class SubscriptionLineUpdate(BaseModel):
    quantity: int = Field(ge=1)


class SubscriptionLineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    subscription_id: int
    product_id: int
    product_variant_id: int | None
    product_name: str
    variant_name: str | None
    sku: str | None
    quantity: int
    unit_price: Decimal
    line_total: Decimal