
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BillingExecutionLog(Base):
    __tablename__ = "billing_execution_logs"

    __table_args__ = (
        UniqueConstraint(
            "execution_key",
            name="uq_billing_execution_key",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    execution_key: Mapped[str] = mapped_column(
        String(150), nullable=False
    )

    subscription_id: Mapped[int | None] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    billing_cycle_id: Mapped[int | None] = mapped_column(
        ForeignKey("billing_cycles.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20), nullable=False
    )

    message: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    subscription = relationship("Subscription")
    billing_cycle = relationship("BillingCycle")
