from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.models.product import Product
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(
        Product.product_code == data.product_code
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Product code already exists",
        )

    product = Product(**data.model_dump())

    try:
        db.add(product)
        db.commit()
        db.refresh(product)
        return product
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Product conflicts with an existing record",
        )


@router.get("", response_model=list[ProductResponse])
def list_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    if skip < 0 or limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Invalid pagination")

    return (
        db.query(Product)
        .order_by(Product.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    updates = data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(product, field, value)

    try:
        db.commit()
        db.refresh(product)
        return product
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Product update conflicts with an existing record",
        )