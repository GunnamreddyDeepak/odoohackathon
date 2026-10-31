from calendar import monthrange
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models import (
    BillingCycle,
    BillingExecutionLog,
    Customer,
    Invoice,
    InvoiceLine,
    Subscription,
    SubscriptionLine,
)
from app.services.invoice_service import calculate_invoice_lines


def advance_billing_date(start: date, frequency: str) -> date:
    if frequency == "DAILY":
        return start + timedelta(days=1)

    if frequency == "WEEKLY":
        return start + timedelta(days=7)

    if frequency == "MONTHLY":
        # Preserve end-of-month billing dates.
        current_month_end = (
            date(start.year, start.month, 28) + timedelta(days=4)
        )
        current_month_end = current_month_end - timedelta(
            days=current_month_end.day
        )

        if start == current_month_end:
            next_month_first = (
                current_month_end + timedelta(days=1)
            )
            next_month_end = (
                date(next_month_first.year, next_month_first.month, 28)
                + timedelta(days=4)
            )
            return next_month_end - timedelta(days=next_month_end.day)

        next_month = start.month % 12 + 1
        next_year = start.year + (1 if start.month == 12 else 0)
        next_month_end = (
            date(next_year, next_month, 28) + timedelta(days=4)
        )
        last_day = (
            next_month_end - timedelta(days=next_month_end.day)
        ).day

        return date(next_year, next_month, min(start.day, last_day))

    if frequency == "YEARLY":
        try:
            return date(start.year + 1, start.month, start.day)
        except ValueError:
            return date(start.year + 1, start.month, 28)

    raise ValueError(f"Unsupported billing frequency: {frequency}")

def get_period_end(start: date, frequency: str) -> date:
    return advance_billing_date(start, frequency) - timedelta(days=1)


def _record_execution(
    db: Session,
    subscription_id: int,
    cycle_id: int | None,
    status: str,
    message: str | None = None,
) -> None:
    db.add(
        BillingExecutionLog(
            execution_key=f"billing:{subscription_id}:{uuid4().hex}",
            subscription_id=subscription_id,
            billing_cycle_id=cycle_id,
            status=status,
            message=message,
            completed_at=datetime.now(timezone.utc),
        )
    )


def _process_subscription(
    db: Session,
    subscription_id: int,
    run_date: date,
) -> dict:
    cycle_id = None

    try:
        subscription = (
            db.query(Subscription)
            .filter(Subscription.id == subscription_id)
            .with_for_update()
            .first()
        )

        if not subscription:
            db.rollback()
            return {"subscription_id": subscription_id, "status": "NOT_FOUND"}

        if subscription.status != "ACTIVE":
            db.rollback()
            return {"subscription_id": subscription_id, "status": "SKIPPED"}

        period_start = subscription.next_billing_date

        if period_start is None or period_start > run_date:
            db.rollback()
            return {"subscription_id": subscription_id, "status": "NOT_DUE"}

        if subscription.end_date and period_start > subscription.end_date:
            db.rollback()
            return {"subscription_id": subscription_id, "status": "EXPIRED"}

        next_date = advance_billing_date(
            period_start, subscription.billing_frequency
        )
        period_end = get_period_end(
            period_start, subscription.billing_frequency
        )

        # The subscription's end date is inclusive.
        if subscription.end_date:
            period_end = min(period_end, subscription.end_date)

        cycle = (
            db.query(BillingCycle)
            .filter(
                BillingCycle.subscription_id == subscription.id,
                BillingCycle.period_start == period_start,
                BillingCycle.period_end == period_end,
            )
            .with_for_update()
            .first()
        )

        if cycle and cycle.status == "INVOICED":
            db.rollback()
            return {
                "subscription_id": subscription.id,
                "status": "ALREADY_INVOICED",
                "cycle_id": cycle.id,
                "invoice_id": cycle.invoice_id,
            }

        if cycle is None:
            cycle = BillingCycle(
                subscription_id=subscription.id,
                period_start=period_start,
                period_end=period_end,
                amount=Decimal("0.00"),
                status="PENDING",
            )
            db.add(cycle)
            db.flush()

        cycle_id = cycle.id

        customer = (
            db.query(Customer)
            .filter(
                Customer.id == subscription.customer_id,
                Customer.is_active.is_(True),
            )
            .first()
        )
        if not customer:
            raise ValueError("Subscription customer is not active")

        saved_lines = (
            db.query(SubscriptionLine)
            .filter(SubscriptionLine.subscription_id == subscription.id)
            .order_by(SubscriptionLine.id.asc())
            .all()
        )
        if not saved_lines:
            raise ValueError("Subscription has no billing lines")

        invoice_lines = []
        for line in saved_lines:
            description = line.product_name
            if line.variant_name:
                description += f" - {line.variant_name}"
            if line.sku:
                description += f" (SKU: {line.sku})"

            invoice_lines.append({
                "description": description[:255],
                "quantity": line.quantity,
                "unit_price": line.unit_price,
            })

        calculations = calculate_invoice_lines(invoice_lines)

        issue_date = run_date
        due_date = issue_date + timedelta(days=7)

        invoice = Invoice(
            invoice_number=f"INV-{uuid4().hex[:16].upper()}",
            customer_id=subscription.customer_id,
            subscription_id=subscription.id,
            issue_date=issue_date,
            due_date=due_date,
            currency=subscription.currency,
            subtotal=calculations["subtotal"],
            discount_amount=Decimal("0.00"),
            tax_amount=Decimal("0.00"),
            total=calculations["total"],
            tax_rate=Decimal("0.00"),
            status="DRAFT",
            payment_status="UNPAID",
        )
        db.add(invoice)
        db.flush()

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

        cycle.invoice_id = invoice.id
        cycle.amount = calculations["total"]
        cycle.status = "INVOICED"
        cycle.processed_at = datetime.now(timezone.utc)

        # Do not advance past the configured subscription end date
        # until the final valid period has been invoiced.
        subscription.next_billing_date = next_date

        _record_execution(
            db,
            subscription.id,
            cycle.id,
            "SUCCEEDED",
            f"Invoice {invoice.invoice_number} generated",
        )

        db.commit()

        return {
            "subscription_id": subscription.id,
            "status": "INVOICED",
            "cycle_id": cycle.id,
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "period_start": period_start.isoformat(),
            "period_end": period_end.isoformat(),
            "total": str(calculations["total"]),
            "due_date": due_date.isoformat(),
        }

    except Exception as exc:
        db.rollback()

        # Persist the failed attempt separately, so the failed cycle
        # can be retried without losing the original failure record.
        try:
            cycle = None
            subscription = (
                db.query(Subscription)
                .filter(Subscription.id == subscription_id)
                .with_for_update()
                .first()
            )

            if subscription and subscription.next_billing_date:
                start = subscription.next_billing_date
                end = get_period_end(start, subscription.billing_frequency)
                if subscription.end_date:
                    end = min(end, subscription.end_date)

                cycle = (
                    db.query(BillingCycle)
                    .filter(
                        BillingCycle.subscription_id == subscription_id,
                        BillingCycle.period_start == start,
                        BillingCycle.period_end == end,
                    )
                    .with_for_update()
                    .first()
                )

                if cycle and cycle.status != "INVOICED":
                    cycle.status = "FAILED"
                elif cycle is None:
                    cycle = BillingCycle(
                        subscription_id=subscription_id,
                        period_start=start,
                        period_end=end,
                        amount=Decimal("0.00"),
                        status="FAILED",
                    )
                    db.add(cycle)
                    db.flush()

            _record_execution(
                db,
                subscription_id,
                cycle.id if cycle else cycle_id,
                "FAILED",
                str(exc)[:2000],
            )
            db.commit()
        except Exception:
            db.rollback()

        return {
            "subscription_id": subscription_id,
            "status": "FAILED",
            "error": str(exc),
        }


def run_recurring_billing(db: Session, run_date: date | None = None) -> dict:
    """Process all subscriptions due on or before run_date."""
    run_date = run_date or date.today()

    due_ids = [
        row[0]
        for row in (
            db.query(Subscription.id)
            .filter(
                Subscription.status == "ACTIVE",
                Subscription.next_billing_date.isnot(None),
                Subscription.next_billing_date <= run_date,
            )
            .order_by(Subscription.id.asc())
            .all()
        )
    ]

    results = [
        _process_subscription(db, subscription_id, run_date)
        for subscription_id in due_ids
    ]

    return {
        "run_date": run_date.isoformat(),
        "total_found": len(due_ids),
        "invoiced": sum(r["status"] == "INVOICED" for r in results),
        "failed": sum(r["status"] == "FAILED" for r in results),
        "results": results,
    }
