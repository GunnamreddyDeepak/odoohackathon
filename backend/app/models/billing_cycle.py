
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BillingCycle(Base):
    __tablename__ = "billing_cycles"

    __table_args__ = (
        UniqueConstraint(
            "subscription_id",
            "period_start",
            "period_end",
            name="uq_billing_cycle_subscription_period",
        ),
        CheckConstraint(
            "period_end >= period_start",
            name="check_billing_cycle_period",
        ),
        CheckConstraint(
            "status IN ('PENDING', 'INVOICED', 'FAILED', 'SKIPPED')",
            name="check_billing_cycle_status",
        ),
        CheckConstraint(
            "amount >= 0",
            name="check_billing_cycle_amount",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    subscription_id: Mapped[int] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    invoice_id: Mapped[int | None] = mapped_column(
        ForeignKey("invoices.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20), default="PENDING", nullable=False
    )

    processed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    subscription = relationship("Subscription")
    invoice = relationship("Invoice")
