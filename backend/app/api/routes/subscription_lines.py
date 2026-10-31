
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_staff
from app.models import (
    Product,
    ProductVariant,
    Subscription,
    SubscriptionLine,
    Customer,
    User,
)
from app.schemas.subscription_line import (
    SubscriptionLineCreate,
    SubscriptionLineUpdate,
    SubscriptionLineResponse,
)

router = APIRouter(prefix="/subscriptions", tags=["Subscription Lines"])


def verify_subscription_access(
    subscription: Subscription,
    current_user: User,
    db: Session,
):
    if current_user.role.name.upper() == "CUSTOMER":
        customer = db.query(Customer).filter(
            Customer.user_id == current_user.id
        ).first()

        if not customer or subscription.customer_id != customer.id:
            raise HTTPException(
                status_code=404,
                detail="Subscription not found",
            )


@router.post(
    "/{subscription_id}/lines",
    response_model=SubscriptionLineResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_subscription_line(
    subscription_id: int,
    data: SubscriptionLineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id
    ).first()

    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if subscription.status == "CLOSED":
        raise HTTPException(
            status_code=409,
            detail="Cannot add lines to a closed subscription",
        )

    product = db.query(Product).filter(
        Product.id == data.product_id,
        Product.is_active.is_(True),
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Active product not found")

    variant = None

    if data.product_variant_id is not None:
        variant = db.query(ProductVariant).filter(
            ProductVariant.id == data.product_variant_id,
            ProductVariant.product_id == data.product_id,
            ProductVariant.is_active.is_(True),
        ).first()

        if not variant:
            raise HTTPException(
                status_code=404,
                detail="Active variant not found for the selected product",
            )

    unit_price = product.sales_price

    if variant is not None:
        unit_price += variant.additional_price

    line = SubscriptionLine(
        subscription_id=subscription.id,
        product_id=product.id,
        product_variant_id=variant.id if variant else None,
        product_name=product.name,
        variant_name=variant.variant_name if variant else None,
        sku=variant.sku if variant else product.product_code,
        quantity=data.quantity,
        unit_price=unit_price,
        line_total=unit_price * data.quantity,
    )

    try:
        db.add(line)
        db.commit()
        db.refresh(line)
        return line
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Could not add subscription line",
        )


@router.get(
    "/{subscription_id}/lines",
    response_model=list[SubscriptionLineResponse],
)
def list_subscription_lines(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id
    ).first()

    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")

    verify_subscription_access(subscription, current_user, db)

    return (
        db.query(SubscriptionLine)
        .filter(SubscriptionLine.subscription_id == subscription_id)
        .order_by(SubscriptionLine.id)
        .all()
    )


@router.patch(
    "/{subscription_id}/lines/{line_id}",
    response_model=SubscriptionLineResponse,
)
def update_subscription_line(
    subscription_id: int,
    line_id: int,
    data: SubscriptionLineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id
    ).first()

    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if subscription.status == "CLOSED":
        raise HTTPException(
            status_code=409,
            detail="Cannot edit lines of a closed subscription",
        )

    line = db.query(SubscriptionLine).filter(
        SubscriptionLine.id == line_id,
        SubscriptionLine.subscription_id == subscription_id,
    ).first()

    if not line:
        raise HTTPException(status_code=404, detail="Subscription line not found")

    line.quantity = data.quantity
    line.line_total = line.unit_price * data.quantity

    try:
        db.commit()
        db.refresh(line)
        return line
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid subscription line update")
