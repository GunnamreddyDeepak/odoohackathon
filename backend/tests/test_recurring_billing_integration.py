from datetime import date
from decimal import Decimal

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
import app.models

from app.models import (
    Customer,
    Product,
    Subscription,
    SubscriptionLine,
    Invoice,
    InvoiceLine,
    BillingCycle,
    BillingExecutionLog,
)
from app.services.recurring_billing_service import run_recurring_billing


@pytest.fixture
def db():
    engine = create_engine("sqlite:///:memory:")

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(connection, record):
        cursor = connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture
def active_subscription(db):
    customer = Customer(
        customer_code="TEST-CUST-001",
        full_name="Test Customer",
        email="billing-test@example.com",
        is_active=True,
    )
    db.add(customer)
    db.flush()

    product = Product(
        name="Current Product Name",
        product_code="TEST-PROD-001",
        sales_price=Decimal("150.00"),
        cost_price=Decimal("80.00"),
        is_active=True,
    )
    db.add(product)
    db.flush()

    subscription = Subscription(
        subscription_code="TEST-SUB-001",
        customer_id=customer.id,
        status="ACTIVE",
        start_date=date(2026, 10, 1),
        next_billing_date=date(2026, 10, 31),
        plan_name="Test Monthly Plan",
        plan_price=Decimal("250.00"),
        currency="INR",
        billing_frequency="MONTHLY",
        creation_source="USER",
    )
    db.add(subscription)
    db.flush()

    db.add(
        SubscriptionLine(
            subscription_id=subscription.id,
            product_id=product.id,
            product_name="Historical Product Name",
            variant_name=None,
            sku="HIST-SKU-001",
            quantity=2,
            unit_price=Decimal("125.00"),
            line_total=Decimal("250.00"),
        )
    )

    db.commit()
    return subscription


def test_recurring_billing_generates_invoice(db, active_subscription):
    result = run_recurring_billing(db, date(2026, 10, 31))

    assert result["invoiced"] == 1
    assert result["failed"] == 0

    invoice = db.query(Invoice).filter_by(
        subscription_id=active_subscription.id
    ).one()

    assert invoice.status == "DRAFT"
    assert invoice.payment_status == "UNPAID"
    assert invoice.total == Decimal("250.00")
    assert invoice.issue_date == date(2026, 10, 31)
    assert invoice.due_date == date(2026, 11, 7)

    line = db.query(InvoiceLine).filter_by(
        invoice_id=invoice.id
    ).one()

    assert line.description == (
        "Historical Product Name (SKU: HIST-SKU-001)"
    )
    assert line.quantity == 2
    assert line.unit_price == Decimal("125.00")
    assert line.line_total == Decimal("250.00")

    cycle = db.query(BillingCycle).filter_by(
        subscription_id=active_subscription.id
    ).one()

    assert cycle.status == "INVOICED"
    assert cycle.invoice_id == invoice.id
    assert cycle.amount == Decimal("250.00")

    db.refresh(active_subscription)
    assert active_subscription.next_billing_date == date(2026, 11, 30)

    log = db.query(BillingExecutionLog).filter_by(
        subscription_id=active_subscription.id
    ).one()

    assert log.status == "SUCCEEDED"


def test_repeated_billing_does_not_create_duplicate(
    db, active_subscription
):
    first = run_recurring_billing(db, date(2026, 10, 31))
    second = run_recurring_billing(db, date(2026, 10, 31))

    assert first["invoiced"] == 1
    assert second["invoiced"] == 0

    assert db.query(Invoice).filter_by(
        subscription_id=active_subscription.id
    ).count() == 1

    assert db.query(BillingCycle).filter_by(
        subscription_id=active_subscription.id
    ).count() == 1

    db.refresh(active_subscription)
    assert active_subscription.next_billing_date == date(2026, 11, 30)

def test_failed_billing_can_be_retried(
    db, active_subscription
):
    customer = db.query(Customer).filter_by(
        id=active_subscription.customer_id
    ).one()

    original_date = active_subscription.next_billing_date

    customer.is_active = False
    db.commit()

    failed_result = run_recurring_billing(
        db, date(2026, 10, 31)
    )

    assert failed_result["failed"] == 1
    assert failed_result["invoiced"] == 0

    db.refresh(active_subscription)
    assert active_subscription.next_billing_date == original_date

    cycle = db.query(BillingCycle).filter_by(
        subscription_id=active_subscription.id
    ).one()

    assert cycle.status == "FAILED"
    assert cycle.invoice_id is None

    failed_log = db.query(BillingExecutionLog).filter_by(
        subscription_id=active_subscription.id
    ).one()

    assert failed_log.status == "FAILED"

    customer.is_active = True
    db.commit()

    retry_result = run_recurring_billing(
        db, date(2026, 10, 31)
    )

    assert retry_result["invoiced"] == 1
    assert retry_result["failed"] == 0

    db.refresh(active_subscription)
    assert active_subscription.next_billing_date == date(2026, 11, 30)

    invoice = db.query(Invoice).filter_by(
        subscription_id=active_subscription.id
    ).one()

    assert invoice.total == Decimal("250.00")

    cycle = db.query(BillingCycle).filter_by(
        subscription_id=active_subscription.id
    ).one()

    assert cycle.status == "INVOICED"
    assert cycle.invoice_id == invoice.id

    logs = db.query(BillingExecutionLog).filter_by(
        subscription_id=active_subscription.id
    ).order_by(BillingExecutionLog.id.asc()).all()

    assert len(logs) == 2
    assert logs[0].status == "FAILED"
    assert logs[1].status == "SUCCEEDED"

@pytest.mark.parametrize("subscription_status", ["PAUSED", "CLOSED"])
def test_inactive_subscription_status_skips_billing(
    db, active_subscription, subscription_status
):
    active_subscription.status = subscription_status
    db.commit()

    result = run_recurring_billing(db, date(2026, 10, 31))

    assert result["total_found"] == 0
    assert result["invoiced"] == 0
    assert result["failed"] == 0

    assert db.query(Invoice).filter_by(
        subscription_id=active_subscription.id
    ).count() == 0

    db.refresh(active_subscription)
    assert active_subscription.next_billing_date == date(2026, 10, 31)


def test_future_billing_date_does_not_generate_invoice(
    db, active_subscription
):
    active_subscription.next_billing_date = date(2026, 11, 30)
    db.commit()

    result = run_recurring_billing(db, date(2026, 10, 31))

    assert result["total_found"] == 0
    assert result["invoiced"] == 0

    assert db.query(Invoice).filter_by(
        subscription_id=active_subscription.id
    ).count() == 0


def test_final_billing_period_respects_inclusive_end_date(
    db, active_subscription
):
    active_subscription.end_date = date(2026, 10, 31)
    db.commit()

    result = run_recurring_billing(db, date(2026, 10, 31))

    assert result["invoiced"] == 1
    assert result["failed"] == 0

    cycle = db.query(BillingCycle).filter_by(
        subscription_id=active_subscription.id
    ).one()

    assert cycle.period_start == date(2026, 10, 31)
    assert cycle.period_end == date(2026, 10, 31)
    assert cycle.status == "INVOICED"

    db.refresh(active_subscription)
    assert active_subscription.next_billing_date == date(2026, 11, 30)


def test_empty_subscription_lines_fail_without_advancing_billing_date(
    db, active_subscription
):
    original_date = active_subscription.next_billing_date

    db.query(SubscriptionLine).filter_by(
        subscription_id=active_subscription.id
    ).delete()
    db.commit()

    result = run_recurring_billing(db, date(2026, 10, 31))

    assert result["failed"] == 1
    assert result["invoiced"] == 0

    db.refresh(active_subscription)
    assert active_subscription.next_billing_date == original_date

    assert db.query(Invoice).filter_by(
        subscription_id=active_subscription.id
    ).count() == 0

    cycle = db.query(BillingCycle).filter_by(
        subscription_id=active_subscription.id
    ).one()

    assert cycle.status == "FAILED"
    assert cycle.invoice_id is None
