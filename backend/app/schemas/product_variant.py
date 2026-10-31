from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class ProductVariantCreate(BaseModel):
    variant_name: str = Field(min_length=1, max_length=100)
    sku: str = Field(min_length=1, max_length=100)
    additional_price: Decimal = Field(default=Decimal("0.00"), ge=0)


class ProductVariantResponse(BaseModel):
    id: int
    product_id: int
    variant_name: str
    sku: str
    additional_price: Decimal
    is_active: bool

    model_config = ConfigDict(from_attributes=True)