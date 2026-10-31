from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.models import Product, ProductVariant
from app.schemas.product_variant import (
    ProductVariantCreate,
    ProductVariantResponse,
)

router = APIRouter(prefix="/products", tags=["Product Variants"])


@router.post(
    "/{product_id}/variants",
    response_model=ProductVariantResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product_variant(
    product_id: int,
    variant_data: ProductVariantCreate,
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    if not product.is_active:
        raise HTTPException(
            status_code=400,
            detail="Cannot add variants to an inactive product",
        )

    existing_variant = db.query(ProductVariant).filter(
        ProductVariant.sku == variant_data.sku
    ).first()

    if existing_variant:
        raise HTTPException(
            status_code=409,
            detail="SKU already exists",
        )

    variant = ProductVariant(
        product_id=product_id,
        variant_name=variant_data.variant_name,
        sku=variant_data.sku,
        additional_price=variant_data.additional_price,
    )

    try:
        db.add(variant)
        db.commit()
        db.refresh(variant)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Could not create variant. Check whether the SKU already exists.",
        )

    return variant