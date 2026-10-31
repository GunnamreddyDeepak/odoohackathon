from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(
        String(150), nullable=False, index=True
    )

    description: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    product_code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )

    sales_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    cost_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    variants = relationship(
        "ProductVariant",
        back_populates="product",
        passive_deletes=True,
    )