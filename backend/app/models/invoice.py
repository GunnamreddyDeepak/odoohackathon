
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


class Invoice(Base):
    __tablename__ = "invoices"

    __table_args__ = (
        CheckConstraint(
            "status IN ('DRAFT', 'CONFIRMED', 'CANCELLED')",
            name="check_invoice_status",
        ),
        CheckConstraint(
            "payment_status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE')",
            name="check_invoice_payment_status",
        ),
        CheckConstraint("subtotal >= 0", name="check_invoice_subtotal"),
        CheckConstraint(
            "discount_amount >= 0",
            name="check_invoice_discount",
        ),
        CheckConstraint("tax_amount >= 0", name="check_invoice_tax"),
        CheckConstraint("total >= 0", name="check_invoice_total"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    invoice_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )

    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    subscription_id: Mapped[int | None] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    discount_id: Mapped[int | None] = mapped_column(
        ForeignKey("discounts.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    tax_rule_id: Mapped[int | None] = mapped_column(
        ForeignKey("tax_rules.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    tax_rate: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        default=Decimal("0.00"),
        nullable=False,
    )

    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)

    currency: Mapped[str] = mapped_column(String(3), nullable=False)

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )
    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00"), nullable=False
    )
    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00"), nullable=False
    )
    total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20), default="DRAFT", nullable=False
    )

    payment_status: Mapped[str] = mapped_column(
        String(20), default="UNPAID", nullable=False
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

    customer = relationship("Customer")
    subscription = relationship("Subscription")
    discount = relationship("Discount")
    tax_rule = relationship("TaxRule")

    lines = relationship(
        "InvoiceLine",
        back_populates="invoice",
        passive_deletes=True,
    )

    payments = relationship(
        "Payment",
        back_populates="invoice",
        passive_deletes=True,
    )
