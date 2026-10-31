from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    product_code: str = Field(min_length=2, max_length=50)
    sales_price: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    cost_price: Decimal = Field(ge=0, max_digits=12, decimal_places=2)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = None
    sales_price: Decimal | None = Field(
        default=None, ge=0, max_digits=12, decimal_places=2
    )
    cost_price: Decimal | None = Field(
        default=None, ge=0, max_digits=12, decimal_places=2
    )
    is_active: bool | None = None


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    product_code: str
    sales_price: Decimal
    cost_price: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime