
"""add invoice tax and discount references

Revision ID: 6e00935f89d3
Revises: 0a0c6b59cd28
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "6e00935f89d3"
down_revision: Union[str, Sequence[str], None] = "0a0c6b59cd28"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add nullable foreign-key columns.
    op.add_column(
        "invoices",
        sa.Column("discount_id", sa.Integer(), nullable=True),
    )

    op.add_column(
        "invoices",
        sa.Column("tax_rule_id", sa.Integer(), nullable=True),
    )

    # Existing invoices receive a neutral 0% historical tax rate.
    op.add_column(
        "invoices",
        sa.Column(
            "tax_rate",
            sa.Numeric(5, 2),
            nullable=False,
            server_default=sa.text("0.00"),
        ),
    )

    # Remove the temporary database default.
    op.alter_column(
        "invoices",
        "tax_rate",
        server_default=None,
    )

    op.create_index(
        "ix_invoices_discount_id",
        "invoices",
        ["discount_id"],
        unique=False,
    )

    op.create_index(
        "ix_invoices_tax_rule_id",
        "invoices",
        ["tax_rule_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_invoices_discount_id_discounts",
        "invoices",
        "discounts",
        ["discount_id"],
        ["id"],
        ondelete="RESTRICT",
    )

    op.create_foreign_key(
        "fk_invoices_tax_rule_id_tax_rules",
        "invoices",
        "tax_rules",
        ["tax_rule_id"],
        ["id"],
        ondelete="RESTRICT",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_invoices_tax_rule_id_tax_rules",
        "invoices",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_invoices_discount_id_discounts",
        "invoices",
        type_="foreignkey",
    )

    op.drop_index("ix_invoices_tax_rule_id", table_name="invoices")
    op.drop_index("ix_invoices_discount_id", table_name="invoices")

    op.drop_column("invoices", "tax_rate")
    op.drop_column("invoices", "tax_rule_id")
    op.drop_column("invoices", "discount_id")
