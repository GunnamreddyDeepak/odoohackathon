from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    ForeignKey,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SubscriptionLine(Base):
    __tablename__ = "subscription_lines"

    __table_args__ = (
        CheckConstraint("quantity >= 1", name="check_subscription_line_quantity"),
        CheckConstraint("unit_price >= 0", name="check_subscription_line_unit_price"),
        CheckConstraint("line_total >= 0", name="check_subscription_line_total"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    subscription_id: Mapped[int] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    product_variant_id: Mapped[int | None] = mapped_column(
        ForeignKey("product_variants.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Historical snapshots: do not rely on live product names or prices.
    product_name: Mapped[str] = mapped_column(String(150), nullable=False)
    variant_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    sku: Mapped[str | None] = mapped_column(String(100), nullable=True)

    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    line_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    subscription = relationship("Subscription", back_populates="lines")
    product = relationship("Product")
    product_variant = relationship("ProductVariant")