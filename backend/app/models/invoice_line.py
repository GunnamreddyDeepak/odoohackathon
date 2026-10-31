
from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class InvoiceLine(Base):
    __tablename__ = "invoice_lines"

    __table_args__ = (
        CheckConstraint("quantity >= 1", name="check_invoice_line_quantity"),
        CheckConstraint(
            "unit_price >= 0",
            name="check_invoice_line_unit_price",
        ),
        CheckConstraint(
            "line_total >= 0",
            name="check_invoice_line_total",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    invoice_id: Mapped[int] = mapped_column(
        ForeignKey("invoices.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    description: Mapped[str] = mapped_column(
        String(255), nullable=False
    )

    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    line_total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    invoice = relationship("Invoice", back_populates="lines")
