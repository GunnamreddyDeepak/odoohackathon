from decimal import Decimal, ROUND_HALF_UP, InvalidOperation

CENT = Decimal("0.01")


def money(value):
    try:
        return Decimal(str(value)).quantize(CENT, rounding=ROUND_HALF_UP)
    except (InvalidOperation, ValueError):
        raise ValueError("Invalid monetary value")


def calculate_invoice(
    subtotal,
    tax_rate=0,
    discount_type=None,
    discount_value=0,
):
    subtotal = money(subtotal)
    tax_rate = Decimal(str(tax_rate))
    discount_value = Decimal(str(discount_value))

    if subtotal < 0:
        raise ValueError("Subtotal cannot be negative")

    if tax_rate < 0 or tax_rate > 100:
        raise ValueError("Tax rate must be between 0 and 100")

    if discount_value < 0:
        raise ValueError("Discount cannot be negative")

    if discount_type is None:
        discount = Decimal("0.00")
    elif discount_type == "PERCENTAGE":
        if discount_value > 100:
            raise ValueError("Percentage discount cannot exceed 100")
        discount = money(subtotal * discount_value / Decimal("100"))
    elif discount_type == "FIXED":
        discount = money(discount_value)
    else:
        raise ValueError("Discount type must be FIXED or PERCENTAGE")

    if discount > subtotal:
        raise ValueError("Discount cannot exceed subtotal")

    taxable_amount = money(subtotal - discount)
    tax_amount = money(taxable_amount * tax_rate / Decimal("100"))
    total = money(taxable_amount + tax_amount)

    return {
        "subtotal": subtotal,
        "discount": discount,
        "taxable_amount": taxable_amount,
        "tax_rate": tax_rate,
        "tax_amount": tax_amount,
        "total": total,
    }
