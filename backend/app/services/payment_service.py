from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Invoice, Payment
from app.services.billing_calculator import money


def get_recorded_total(db: Session, invoice_id: int) -> Decimal:
    total = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(
            Payment.invoice_id == invoice_id,
            Payment.status == "RECORDED",
        )
        .scalar()
    )
    return money(total or 0)


def record_payment(db: Session, invoice_id: int, data):
    try:
        invoice = (
            db.query(Invoice)
            .filter(Invoice.id == invoice_id)
            .with_for_update()
            .first()
        )

        if invoice is None:
            raise ValueError("Invoice not found")

        if invoice.status != "CONFIRMED":
            raise ValueError(
                "Payments can only be recorded for confirmed invoices"
            )

        amount = money(data.amount)
        if amount <= 0:
            raise ValueError("Payment amount must be greater than zero")

        already_paid = get_recorded_total(db, invoice.id)
        outstanding = money(Decimal(invoice.total) - already_paid)

        if amount > outstanding:
            raise ValueError(
                f"Payment exceeds outstanding balance of {outstanding}"
            )

        payment = Payment(
            invoice_id=invoice.id,
            amount=amount,
            payment_method=data.payment_method,
            payment_date=data.payment_date,
            reference=data.reference,
            note=data.note,
            status="RECORDED",
        )

        db.add(payment)
        db.flush()

        new_outstanding = money(outstanding - amount)

        if new_outstanding == 0:
            invoice.payment_status = "PAID"
        elif invoice.due_date < date.today():
            invoice.payment_status = "OVERDUE"
        else:
            invoice.payment_status = "PARTIALLY_PAID"

        db.commit()
        db.refresh(payment)

        return payment, new_outstanding

    except Exception:
        db.rollback()
        raise


def reverse_payment(db: Session, invoice_id: int, payment_id: int):
    try:
        # Lock the invoice first so payment writes and reversals serialize.
        invoice = (
            db.query(Invoice)
            .filter(Invoice.id == invoice_id)
            .with_for_update()
            .first()
        )

        if invoice is None:
            raise ValueError("Invoice not found")

        payment = (
            db.query(Payment)
            .filter(
                Payment.id == payment_id,
                Payment.invoice_id == invoice_id,
            )
            .with_for_update()
            .first()
        )

        if payment is None:
            raise ValueError("Payment not found for this invoice")

        if payment.status != "RECORDED":
            raise ValueError("Only recorded payments can be reversed")

        payment.status = "REVERSED"
        db.flush()

        recorded_total = get_recorded_total(db, invoice_id)
        outstanding = money(Decimal(invoice.total) - recorded_total)

        if outstanding == 0:
            invoice.payment_status = "PAID"
        elif invoice.due_date < date.today():
            invoice.payment_status = "OVERDUE"
        elif recorded_total > 0:
            invoice.payment_status = "PARTIALLY_PAID"
        else:
            invoice.payment_status = "UNPAID"

        db.commit()
        db.refresh(payment)

        return payment, outstanding

    except Exception:
        db.rollback()
        raise


def list_invoice_payments(db: Session, invoice_id: int):
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id
    ).first()

    if invoice is None:
        raise ValueError("Invoice not found")

    payments = (
        db.query(Payment)
        .filter(Payment.invoice_id == invoice_id)
        .order_by(Payment.payment_date.desc(), Payment.id.desc())
        .all()
    )

    recorded_total = get_recorded_total(db, invoice_id)
    outstanding = money(Decimal(invoice.total) - recorded_total)

    return payments, outstanding
