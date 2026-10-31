from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import get_db
from app.models import SubscriptionPlan
from app.schemas.subscription_plan import (
    SubscriptionPlanCreate,
    SubscriptionPlanUpdate,
    SubscriptionPlanResponse,
)

router = APIRouter(prefix="/plans", tags=["Subscription Plans"])


@router.post(
    "",
    response_model=SubscriptionPlanResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_plan(
    plan_data: SubscriptionPlanCreate,
    db: Session = Depends(get_db),
):
    existing_plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.plan_code == plan_data.plan_code
    ).first()

    if existing_plan:
        raise HTTPException(
            status_code=409,
            detail="Plan code already exists",
        )

    plan = SubscriptionPlan(**plan_data.model_dump())

    try:
        db.add(plan)
        db.commit()
        db.refresh(plan)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Could not create plan. The plan code may already exist.",
        )

    return plan


@router.get(
    "",
    response_model=list[SubscriptionPlanResponse],
)
def list_plans(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    if skip < 0 or limit < 1 or limit > 100:
        raise HTTPException(
            status_code=400,
            detail="skip must be non-negative and limit must be between 1 and 100",
        )

    return (
        db.query(SubscriptionPlan)
        .order_by(SubscriptionPlan.id)
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get(
    "/{plan_id}",
    response_model=SubscriptionPlanResponse,
)
def get_plan(
    plan_id: int,
    db: Session = Depends(get_db),
):
    plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.id == plan_id
    ).first()

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Subscription plan not found",
        )

    return plan


@router.patch(
    "/{plan_id}",
    response_model=SubscriptionPlanResponse,
)
def update_plan(
    plan_id: int,
    plan_data: SubscriptionPlanUpdate,
    db: Session = Depends(get_db),
):
    plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.id == plan_id
    ).first()

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Subscription plan not found",
        )

    update_data = plan_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No update fields provided",
        )

    for field, value in update_data.items():
        setattr(plan, field, value)

    try:
        db.commit()
        db.refresh(plan)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Could not update subscription plan",
        )

    return plan
subscriptions = relationship(
    "Subscription",
    back_populates="plan",
    passive_deletes=True,
)