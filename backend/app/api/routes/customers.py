from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.models.customer import Customer
from app.models.user import User
from app.schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
)

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post(
    "",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    existing = db.query(Customer).filter(
        Customer.customer_code == data.customer_code
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Customer code already exists",
        )

    if data.email:
        existing_email = db.query(Customer).filter(
            Customer.email == data.email
        ).first()

        if existing_email:
            raise HTTPException(
                status_code=409,
                detail="Customer email already exists",
            )

    if data.user_id is not None:
        user = db.query(User).filter(User.id == data.user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        linked_customer = db.query(Customer).filter(
            Customer.user_id == data.user_id
        ).first()

        if linked_customer:
            raise HTTPException(
                status_code=409,
                detail="User is already linked to another customer",
            )

    customer = Customer(**data.model_dump())

    try:
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Customer conflicts with an existing record",
        )


@router.get("", response_model=list[CustomerResponse])
def list_customers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    if skip < 0 or limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Invalid pagination")

    return (
        db.query(Customer)
        .order_by(Customer.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return customer


@router.patch("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
):
    customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    updates = data.model_dump(exclude_unset=True)

    if "email" in updates and updates["email"] is not None:
        duplicate = db.query(Customer).filter(
            Customer.email == updates["email"],
            Customer.id != customer_id,
        ).first()

        if duplicate:
            raise HTTPException(
                status_code=409,
                detail="Customer email already exists",
            )

    for field, value in updates.items():
        setattr(customer, field, value)

    try:
        db.commit()
        db.refresh(customer)
        return customer
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Customer update conflicts with an existing record",
        )