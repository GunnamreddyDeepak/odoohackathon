
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Numeric,
    String,
    Boolean,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TaxRule(Base):
    __tablename__ = "tax_rules"

    __table_args__ = (
        CheckConstraint(
            "rate >= 0 AND rate <= 100",
            name="check_tax_rule_rate",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )

    rate: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    effective_from: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    effective_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
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
