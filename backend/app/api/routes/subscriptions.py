
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_staff
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


@router.post(
    "",
    response_model=SubscriptionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_subscription(
    data: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    customer = db.query(Customer).filter(
        Customer.id == data.customer_id,
        Customer.is_active.is_(True),
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Active customer not found")

    if data.created_by is not None and data.created_by != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Cannot assign another user as creator",
        )

    values = data.model_dump()
    values["created_by"] = current_user.id

    existing = db.query(Subscription).filter(
        Subscription.subscription_code == data.subscription_code
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Subscription code already exists")

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
def list_subscriptions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if skip < 0 or limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Invalid pagination")

    query = db.query(Subscription)

    if current_user.role.name.upper() == "CUSTOMER":
        customer = db.query(Customer).filter(
            Customer.user_id == current_user.id
        ).first()

        if not customer:
            return []

        query = query.filter(Subscription.customer_id == customer.id)

    return (
        query.order_by(Subscription.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{subscription_id}", response_model=SubscriptionResponse)
def get_subscription(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Subscription).filter(
        Subscription.id == subscription_id
    )

    if current_user.role.name.upper() == "CUSTOMER":
        customer = db.query(Customer).filter(
            Customer.user_id == current_user.id
        ).first()

        if not customer:
            raise HTTPException(status_code=404, detail="Subscription not found")

        query = query.filter(Subscription.customer_id == customer.id)

    subscription = query.first()

    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")

    return subscription


@router.patch("/{subscription_id}", response_model=SubscriptionResponse)
def update_subscription(
    subscription_id: int,
    data: SubscriptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
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


@router.patch("/{subscription_id}/status", response_model=SubscriptionResponse)
def update_subscription_status(
    subscription_id: int,
    data: SubscriptionStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
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

    try:
        db.commit()
        db.refresh(subscription)
        return subscription
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid subscription status update")
