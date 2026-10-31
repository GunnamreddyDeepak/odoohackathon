
from datetime import datetime, time, timezone
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models import (
    Customer,
    Subscription,
    Invoice,
    InvoiceLine,
    TaxRule,
    Discount,
    DiscountUsage,
)
from app.services.billing_calculator import money, calculate_invoice


def calculate_invoice_lines(
    lines,
    tax_rate=0,
    discount_type=None,
    discount_value=0,
):
    if not lines:
        raise ValueError("Invoice must contain at least one line")

    normalized_lines = []
    subtotal = money(0)
    total_quantity = 0

    for item in lines:
        quantity = int(item["quantity"])
        unit_price = money(item["unit_price"])
        description = str(item["description"]).strip()

        if quantity <= 0:
            raise ValueError("Quantity must be greater than zero")

        if unit_price < 0:
            raise ValueError("Unit price cannot be negative")

        if not description:
            raise ValueError("Line description cannot be empty")

        line_total = money(unit_price * quantity)
        subtotal += line_total
        total_quantity += quantity

        normalized_lines.append({
            "description": description,
            "quantity": quantity,
            "unit_price": unit_price,
            "line_total": line_total,
        })

    subtotal = money(subtotal)

    totals = calculate_invoice(
        subtotal=subtotal,
        tax_rate=tax_rate,
        discount_type=discount_type,
        discount_value=discount_value,
    )

    return {
        "lines": normalized_lines,
        "total_quantity": total_quantity,
        **totals,
    }


def create_invoice(db: Session, data):
    """
    Create an invoice and its lines atomically.

    The caller must pass a validated InvoiceCreate schema.
    This function commits the transaction on success and rolls
    it back on failure.
    """

    try:
        # 1. Validate customer.
        customer = db.query(Customer).filter(
            Customer.id == data.customer_id,
            Customer.is_active.is_(True),
        ).first()

        if not customer:
            raise ValueError("Active customer not found")

        # 2. Validate optional subscription.
        if data.subscription_id is not None:
            subscription = db.query(Subscription).filter(
                Subscription.id == data.subscription_id,
                Subscription.customer_id == data.customer_id,
            ).first()

            if not subscription:
                raise ValueError(
                    "Subscription not found for this customer"
                )

        # Use the invoice issue date to evaluate effective rules.
        issue_datetime = datetime.combine(
            data.issue_date,
            time.min,
            tzinfo=timezone.utc,
        )

        # 3. Resolve tax rule.
        tax_rule = None
        tax_rate = money(0)

        if data.tax_rule_code:
            tax_rule = db.query(TaxRule).filter(
                TaxRule.code == data.tax_rule_code,
                TaxRule.is_active.is_(True),
            ).first()

            if not tax_rule:
                raise ValueError("Active tax rule not found")

            if (
                tax_rule.effective_from is not None
                and tax_rule.effective_from > issue_datetime
            ):
                raise ValueError("Tax rule is not effective yet")

            if (
                tax_rule.effective_until is not None
                and tax_rule.effective_until < issue_datetime
            ):
                raise ValueError("Tax rule has expired")

            tax_rate = tax_rule.rate

        # 4. Resolve discount with a row lock.
        discount = None
        discount_type = None
        discount_value = 0

        if data.discount_code:
            discount = (
                db.query(Discount)
                .filter(
                    Discount.code == data.discount_code,
                    Discount.is_active.is_(True),
                )
                .with_for_update()
                .first()
            )

            if not discount:
                raise ValueError("Active discount not found")

            if discount.applicability != "INVOICE":
                raise ValueError(
                    "Only invoice-wide discounts are supported"
                )

            if (
                discount.start_date is not None
                and discount.start_date > issue_datetime
            ):
                raise ValueError("Discount is not active yet")

            if (
                discount.end_date is not None
                and discount.end_date < issue_datetime
            ):
                raise ValueError("Discount has expired")

            if (
                discount.usage_limit is not None
                and discount.usage_count >= discount.usage_limit
            ):
                raise ValueError("Discount usage limit reached")

            discount_type = discount.discount_type
            discount_value = discount.discount_value

        # 5. Calculate all invoice amounts on the backend.
        line_items = [
            {
                "description": line.description,
                "quantity": line.quantity,
                "unit_price": line.unit_price,
            }
            for line in data.lines
        ]

        calculations = calculate_invoice_lines(
            lines=line_items,
            tax_rate=tax_rate,
            discount_type=discount_type,
            discount_value=discount_value,
        )

        if discount is not None:
            if calculations["subtotal"] < discount.minimum_purchase:
                raise ValueError(
                    "Invoice does not meet discount minimum purchase"
                )

            if (
                discount.minimum_quantity is not None
                and calculations["total_quantity"] < discount.minimum_quantity
            ):
                raise ValueError(
                    "Invoice does not meet discount minimum quantity"
                )

        # 6. Create invoice header.
        invoice = Invoice(
            invoice_number=f"INV-{uuid4().hex[:16].upper()}",
            customer_id=data.customer_id,
            subscription_id=data.subscription_id,
            discount_id=discount.id if discount else None,
            tax_rule_id=tax_rule.id if tax_rule else None,
            tax_rate=tax_rate,
            issue_date=data.issue_date,
            due_date=data.due_date,
            currency=data.currency,
            subtotal=calculations["subtotal"],
            discount_amount=calculations["discount"],
            tax_amount=calculations["tax_amount"],
            total=calculations["total"],
            status="DRAFT",
            payment_status="UNPAID",
        )

        db.add(invoice)
        db.flush()

        # 7. Create invoice lines.
        for line in calculations["lines"]:
            db.add(
                InvoiceLine(
                    invoice_id=invoice.id,
                    description=line["description"],
                    quantity=line["quantity"],
                    unit_price=line["unit_price"],
                    line_total=line["line_total"],
                )
            )

        # 9. Commit everything together.
        db.commit()
        db.refresh(invoice)

        # Load invoice lines for the response.
        _ = invoice.lines

        return invoice

    except Exception:
        db.rollback()
        raise
