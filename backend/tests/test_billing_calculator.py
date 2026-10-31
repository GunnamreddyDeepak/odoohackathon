import pytest
from decimal import Decimal
from app.services.billing_calculator import calculate_invoice


def test_percentage_discount():
    result = calculate_invoice("10000", 18, "PERCENTAGE", 10)
    assert result["discount"] == Decimal("1000.00")
    assert result["tax_amount"] == Decimal("1620.00")
    assert result["total"] == Decimal("10620.00")


def test_fixed_discount():
    result = calculate_invoice("10000", 18, "FIXED", 500)
    assert result["discount"] == Decimal("500.00")
    assert result["total"] == Decimal("11210.00")


def test_no_discount():
    result = calculate_invoice("10000", 18)
    assert result["total"] == Decimal("11800.00")


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
