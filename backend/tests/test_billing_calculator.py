
import pytest
from decimal import Decimal

from app.services.billing_calculator import calculate_invoice


def test_tax_inclusive_without_discount():
    result = calculate_invoice("1180", 18)

    assert result["subtotal"] == Decimal("1180.00")
    assert result["taxable_amount"] == Decimal("1000.00")
    assert result["tax_amount"] == Decimal("180.00")
    assert result["total"] == Decimal("1180.00")


def test_percentage_discount():
    result = calculate_invoice("1180", 18, "PERCENTAGE", 10)

    assert result["discount"] == Decimal("118.00")
    assert result["tax_amount"] == Decimal("162.00")
    assert result["total"] == Decimal("1062.00")


def test_fixed_discount():
    result = calculate_invoice("1180", 18, "FIXED", 100)

    assert result["discount"] == Decimal("100.00")
    assert result["tax_amount"] == Decimal("164.75")
    assert result["total"] == Decimal("1080.00")


def test_zero_tax():
    result = calculate_invoice("1000", 0)

    assert result["tax_amount"] == Decimal("0.00")
    assert result["total"] == Decimal("1000.00")


def test_rejects_discount_above_subtotal():
    with pytest.raises(ValueError):
        calculate_invoice("1000", 18, "FIXED", 1500)


def test_rejects_invalid_tax():
    with pytest.raises(ValueError):
        calculate_invoice("1000", 101)


def test_rejects_negative_subtotal():
    with pytest.raises(ValueError):
        calculate_invoice("-100", 18)


def test_rejects_percentage_above_100():
    with pytest.raises(ValueError):
        calculate_invoice("1000", 18, "PERCENTAGE", 110)


def test_rejects_invalid_discount_type():
    with pytest.raises(ValueError):
        calculate_invoice("1000", 18, "INVALID", 10)
