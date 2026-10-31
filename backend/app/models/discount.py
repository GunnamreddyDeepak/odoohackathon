
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Boolean,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Discount(Base):
    __tablename__ = "discounts"

    __table_args__ = (
        CheckConstraint(
            "discount_type IN ('FIXED', 'PERCENTAGE')",
            name="check_discount_type",
        ),
        CheckConstraint(
            "discount_value >= 0",
            name="check_discount_value",
        ),
        CheckConstraint(
            "minimum_purchase >= 0",
            name="check_discount_minimum_purchase",
        ),
        CheckConstraint(
            "minimum_quantity IS NULL OR minimum_quantity >= 1",
            name="check_discount_minimum_quantity",
        ),
        CheckConstraint(
            "usage_limit IS NULL OR usage_limit >= 1",
            name="check_discount_usage_limit",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(120), nullable=False)

    code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )

    discount_type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )

    discount_value: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    minimum_purchase: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00"), nullable=False
    )

    minimum_quantity: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    usage_limit: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    usage_count: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )

    # PRODUCT, SUBSCRIPTION or INVOICE
    applicability: Mapped[str] = mapped_column(
        String(20), default="INVOICE", nullable=False
    )

    product_id: Mapped[int | None] = mapped_column(
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    start_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    end_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
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

    product = relationship("Product")
    usages = relationship("DiscountUsage", back_populates="discount")
