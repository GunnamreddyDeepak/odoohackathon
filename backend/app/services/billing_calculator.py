
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation

CENT = Decimal("0.01")


def money(value):
    try:
        amount = Decimal(str(value))

        if not amount.is_finite():
            raise ValueError("Amount must be finite")

        return amount.quantize(CENT, rounding=ROUND_HALF_UP)

    except (InvalidOperation, ValueError, TypeError):
        raise ValueError("Invalid monetary value")


def calculate_invoice(
    subtotal,
    tax_rate=0,
    discount_type=None,
    discount_value=0,
):
    # All prices are tax-inclusive.
    subtotal = money(subtotal)

    try:
        tax_rate = Decimal(str(tax_rate))
        discount_value = Decimal(str(discount_value))
    except (InvalidOperation, ValueError, TypeError):
        raise ValueError("Invalid tax rate or discount value")

    if not tax_rate.is_finite() or not discount_value.is_finite():
        raise ValueError("Values must be finite")

    if subtotal < 0:
        raise ValueError("Subtotal cannot be negative")

    if not Decimal("0") <= tax_rate <= Decimal("100"):
        raise ValueError("Tax rate must be between 0 and 100")

    if discount_value < 0:
        raise ValueError("Discount cannot be negative")

    if discount_type is None:
        discount = Decimal("0.00")

    elif discount_type == "PERCENTAGE":
        if discount_value > 100:
            raise ValueError("Percentage discount cannot exceed 100")

        discount = money(subtotal * discount_value / 100)

    elif discount_type == "FIXED":
        discount = money(discount_value)

    else:
        raise ValueError("Discount type must be FIXED or PERCENTAGE")

    if discount > subtotal:
        raise ValueError("Discount cannot exceed subtotal")

    total = money(subtotal - discount)

    if tax_rate == 0:
        tax_amount = Decimal("0.00")
    else:
        tax_amount = money(
            total * tax_rate / (Decimal("100") + tax_rate)
        )

    taxable_amount = money(total - tax_amount)

    return {
        "subtotal": subtotal,
        "discount": discount,
        "taxable_amount": taxable_amount,
        "tax_rate": tax_rate,
        "tax_amount": tax_amount,
        "total": total,
    }
