from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    customer_code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )

    full_name: Mapped[str] = mapped_column(
        String(150), nullable=False
    )

    email: Mapped[str | None] = mapped_column(
        String(255), unique=True, nullable=True, index=True
    )

    phone: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )

    address: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        unique=True,
        nullable=True,
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

    user = relationship("User", backref="customer_profile")

    __table_args__ = (
        Index("ix_customers_full_name", "full_name"),
    )
    subscriptions = relationship(
    "Subscription",
    back_populates="customer",
    passive_deletes=True,
)