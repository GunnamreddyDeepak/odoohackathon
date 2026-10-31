
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class DiscountUsage(Base):
    __tablename__ = "discount_usages"

    __table_args__ = (
        UniqueConstraint(
            "discount_id",
            "invoice_id",
            name="uq_discount_usage_invoice",
        ),
        CheckConstraint(
            "discount_amount >= 0",
            name="check_discount_usage_amount",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    discount_id: Mapped[int] = mapped_column(
        ForeignKey("discounts.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    invoice_id: Mapped[int] = mapped_column(
        ForeignKey("invoices.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    used_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    discount = relationship("Discount", back_populates="usages")
    invoice = relationship("Invoice")
    customer = relationship("Customer")
