from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    __table_args__ = (
        CheckConstraint(
            "status IN ('DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED')",
            name="check_subscription_status",
        ),
        CheckConstraint(
            "billing_frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')",
            name="check_subscription_billing_frequency",
        ),
        CheckConstraint(
            "plan_price >= 0",
            name="check_subscription_plan_price",
        ),
        CheckConstraint(
            "creation_source IN ('USER', 'SYSTEM')",
            name="check_subscription_creation_source",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    subscription_code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )

    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    plan_id: Mapped[int | None] = mapped_column(
        ForeignKey("subscription_plans.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20), default="DRAFT", nullable=False
    )

    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    next_billing_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Historical snapshots: retain these if the plan changes later.
    plan_name: Mapped[str] = mapped_column(String(150), nullable=False)
    plan_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    billing_frequency: Mapped[str] = mapped_column(String(20), nullable=False)

    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    creation_source: Mapped[str] = mapped_column(
        String(10), default="USER", nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    customer = relationship("Customer", back_populates="subscriptions")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
    creator = relationship("User", foreign_keys=[created_by])
    lines = relationship(
        "SubscriptionLine",
        back_populates="subscription",
        passive_deletes=True,
    )