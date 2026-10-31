
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.models import Customer, Subscription, SubscriptionPlan, User
from app.schemas.subscription import (
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionStatusUpdate,
    SubscriptionResponse,
)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

ALLOWED_TRANSITIONS = {
    "DRAFT": {"QUOTATION", "CONFIRMED", "CLOSED"},
    "QUOTATION": {"DRAFT", "CONFIRMED", "CLOSED"},
    "CONFIRMED": {"ACTIVE", "CLOSED"},
    "ACTIVE": {"PAUSED", "CLOSED"},
    "PAUSED": {"ACTIVE", "CLOSED"},
    "CLOSED": set(),
}


@router.post("", response_model=SubscriptionResponse,
             status_code=status.HTTP_201_CREATED)
def create_subscription(data: SubscriptionCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(
        Customer.id == data.customer_id,
        Customer.is_active.is_(True),
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Active customer not found")

    if data.created_by is not None:
        creator = db.query(User).filter(
            User.id == data.created_by,
            User.is_active.is_(True),
        ).first()
        if not creator:
            raise HTTPException(status_code=404, detail="Active creator not found")

    existing = db.query(Subscription).filter(
        Subscription.subscription_code == data.subscription_code
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Subscription code already exists")

    values = data.model_dump()

    if data.plan_id is not None:
        plan = db.query(SubscriptionPlan).filter(
            SubscriptionPlan.id == data.plan_id,
            SubscriptionPlan.is_active.is_(True),
        ).first()

        if not plan:
            raise HTTPException(status_code=404, detail="Active plan not found")

        values.update({
            "plan_name": plan.name,
            "plan_price": plan.base_price,
            "currency": plan.currency,
            "billing_frequency": plan.billing_frequency,
        })

    values["status"] = "DRAFT"
    subscription = Subscription(**values)

    try:
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        return subscription
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Subscription creation conflict")


@router.get("", response_model=list[SubscriptionResponse])
def list_subscriptions(skip: int = 0, limit: int = 100,
                       db: Session = Depends(get_db)):
    if skip < 0 or limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Invalid pagination")

    return (
        db.query(Subscription)
        .order_by(Subscription.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{subscription_id}", response_model=SubscriptionResponse)
def get_subscription(subscription_id: int, db: Session = Depends(get_db)):
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id
    ).first()

    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")

    return subscription


@router.patch("/{subscription_id}", response_model=SubscriptionResponse)
def update_subscription(subscription_id: int, data: SubscriptionUpdate,
                        db: Session = Depends(get_db)):
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id
    ).first()

    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if subscription.status == "CLOSED":
        raise HTTPException(status_code=409, detail="Closed subscription cannot be edited")

    updates = data.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No update fields provided")

    start = updates.get("start_date", subscription.start_date)
    end = updates.get("end_date", subscription.end_date)
    next_date = updates.get("next_billing_date", subscription.next_billing_date)

    if end is not None and end < start:
        raise HTTPException(status_code=400, detail="Invalid end date")

    if next_date is not None and next_date < start:
        raise HTTPException(status_code=400, detail="Invalid next billing date")

    for field, value in updates.items():
        setattr(subscription, field, value)

    try:
        db.commit()
        db.refresh(subscription)
        return subscription
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid subscription update")


@router.patch("/{subscription_id}/status",
              response_model=SubscriptionResponse)
def update_subscription_status(subscription_id: int,
                               data: SubscriptionStatusUpdate,
                               db: Session = Depends(get_db)):
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id
    ).first()

    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if data.status not in ALLOWED_TRANSITIONS[subscription.status]:
        raise HTTPException(
            status_code=409,
            detail=f"Transition from {subscription.status} to {data.status} is not allowed",
        )

    subscription.status = data.status
    db.commit()
    db.refresh(subscription)
    return subscription
