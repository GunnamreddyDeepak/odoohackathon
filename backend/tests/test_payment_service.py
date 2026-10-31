from datetime import date, timedelta
from decimal import Decimal
from types import SimpleNamespace

import pytest

from app.models import Invoice
from app.schemas.payment import PaymentCreate
from app.services.payment_service import record_payment, get_recorded_total, reverse_payment


class FakeQuery:
    def __init__(self, db, model):
        self.db = db
        self.model = model

    def filter(self, *args, **kwargs):
        return self

    def with_for_update(self):
        return self

    def first(self):
        if self.model is Invoice:
            return self.db.invoice
        from app.models import Payment
        if self.model is Payment:
            return self.db.payment
        return None

    def scalar(self):
        return sum(
            (
                payment.amount
                for payment in self.db.payments
                if payment.status == "RECORDED"
            ),
            Decimal("0.00"),
        )


class FakeDB:
    def __init__(self, invoice, payments=None):
        self.invoice = invoice
        self.payments = list(payments or [])
        self.payment = None
        self.commits = 0
        self.rollbacks = 0

    def query(self, model):
        return FakeQuery(self, model)

    def add(self, obj):
        self.payments.append(obj)

    def flush(self):
        pass

    def commit(self):
        self.commits += 1

    def refresh(self, obj):
        pass

    def rollback(self):
        self.rollbacks += 1


def make_invoice(status="CONFIRMED", total="1000.00", due_date=None):
    return SimpleNamespace(
        id=101,
        total=Decimal(total),
        status=status,
        due_date=due_date or date.today() + timedelta(days=5),
        payment_status="UNPAID",
    )


def make_payment(amount):
    return PaymentCreate(
        amount=Decimal(amount),
        payment_method="UPI",
    )


def test_partial_payment_updates_outstanding_and_status():
    invoice = make_invoice()
    db = FakeDB(invoice)

    payment, outstanding = record_payment(
        db, invoice.id, make_payment("400.00")
    )

    assert payment.amount == Decimal("400.00")
    assert outstanding == Decimal("600.00")
    assert invoice.payment_status == "PARTIALLY_PAID"
    assert db.commits == 1


def test_full_payment_marks_invoice_paid():
    invoice = make_invoice()
    db = FakeDB(invoice)

    payment, outstanding = record_payment(
        db, invoice.id, make_payment("1000.00")
    )

    assert outstanding == Decimal("0.00")
    assert invoice.payment_status == "PAID"
    assert db.commits == 1


def test_multiple_partial_payments_can_complete_invoice():
    invoice = make_invoice()
    db = FakeDB(invoice)

    _, first_outstanding = record_payment(
        db, invoice.id, make_payment("400.00")
    )

    _, second_outstanding = record_payment(
        db, invoice.id, make_payment("600.00")
    )

    assert first_outstanding == Decimal("600.00")
    assert second_outstanding == Decimal("0.00")
    assert invoice.payment_status == "PAID"
    assert len(db.payments) == 2


def test_overpayment_is_rejected():
    invoice = make_invoice()
    db = FakeDB(invoice)

    with pytest.raises(ValueError, match="exceeds outstanding balance"):
        record_payment(db, invoice.id, make_payment("1000.01"))

    assert db.payments == []
    assert db.commits == 0
    assert db.rollbacks == 1


@pytest.mark.parametrize("invoice_status", ["DRAFT", "CANCELLED"])
def test_payment_rejected_for_non_confirmed_invoice(invoice_status):
    invoice = make_invoice(status=invoice_status)
    db = FakeDB(invoice)

    with pytest.raises(ValueError, match="confirmed invoices"):
        record_payment(db, invoice.id, make_payment("100.00"))

    assert db.payments == []
    assert db.commits == 0
    assert db.rollbacks == 1


def test_reversed_payments_do_not_reduce_outstanding_balance():
    invoice = make_invoice()
    reversed_payment = SimpleNamespace(
        amount=Decimal("300.00"),
        status="REVERSED",
    )
    recorded_payment = SimpleNamespace(
        amount=Decimal("200.00"),
        status="RECORDED",
    )
    db = FakeDB(invoice, [reversed_payment, recorded_payment])

    recorded_total = get_recorded_total(db, invoice.id)

    assert recorded_total == Decimal("200.00")



def test_reversing_payment_restores_outstanding_balance():
    invoice = make_invoice()
    invoice.payment_status = "PARTIALLY_PAID"

    payment = SimpleNamespace(
        id=501,
        invoice_id=invoice.id,
        amount=Decimal("300.00"),
        status="RECORDED",
    )
    remaining_payment = SimpleNamespace(
        id=502,
        invoice_id=invoice.id,
        amount=Decimal("200.00"),
        status="RECORDED",
    )

    db = FakeDB(invoice, [payment, remaining_payment])
    db.payment = payment

    reversed_payment, outstanding = reverse_payment(
        db, invoice.id, payment.id
    )

    assert reversed_payment.status == "REVERSED"
    assert outstanding == Decimal("800.00")
    assert invoice.payment_status == "PARTIALLY_PAID"
    assert db.commits == 1


def test_reversing_last_payment_marks_invoice_unpaid():
    invoice = make_invoice()
    invoice.payment_status = "PAID"

    payment = SimpleNamespace(
        id=503,
        invoice_id=invoice.id,
        amount=Decimal("1000.00"),
        status="RECORDED",
    )

    db = FakeDB(invoice, [payment])
    db.payment = payment

    _, outstanding = reverse_payment(db, invoice.id, payment.id)

    assert outstanding == Decimal("1000.00")
    assert invoice.payment_status == "UNPAID"
    assert payment.status == "REVERSED"


def test_duplicate_payment_reversal_is_rejected():
    invoice = make_invoice()
    payment = SimpleNamespace(
        id=504,
        invoice_id=invoice.id,
        amount=Decimal("250.00"),
        status="REVERSED",
    )

    db = FakeDB(invoice, [payment])
    db.payment = payment

    with pytest.raises(ValueError, match="Only recorded payments"):
        reverse_payment(db, invoice.id, payment.id)

    assert payment.status == "REVERSED"
    assert db.commits == 0
    assert db.rollbacks == 1
