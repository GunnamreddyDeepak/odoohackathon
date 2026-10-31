from decimal import Decimal
from app.services.billing_calculator import money, calculate_invoice


def calculate_invoice_lines(lines, tax_rate=0, discount_type=None, discount_value=0):
    if not lines:
        raise ValueError("Invoice must contain at least one line")

    normalized_lines = []
    subtotal = Decimal("0.00")

    for item in lines:
        quantity = int(item["quantity"])
        unit_price = money(item["unit_price"])

        if quantity <= 0:
            raise ValueError("Quantity must be greater than zero")

        if unit_price < 0:
            raise ValueError("Unit price cannot be negative")

        line_total = money(unit_price * quantity)
        subtotal += line_total

        normalized_lines.append({
            "description": str(item["description"]),
            "quantity": quantity,
            "unit_price": unit_price,
            "line_total": line_total,
        })

    totals = calculate_invoice(
        subtotal=subtotal,
        tax_rate=tax_rate,
        discount_type=discount_type,
        discount_value=discount_value,
    )

    return {
        "lines": normalized_lines,
        **totals,
    }
