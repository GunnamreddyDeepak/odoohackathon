from datetime import date

import pytest

from app.services.recurring_billing_service import (
    advance_billing_date,
    get_period_end,
)


@pytest.mark.parametrize(
    ("start", "frequency", "expected"),
    [
        (date(2026, 1, 31), "MONTHLY", date(2026, 2, 28)),
        (date(2026, 2, 28), "MONTHLY", date(2026, 3, 31)),
        (date(2026, 4, 30), "MONTHLY", date(2026, 5, 31)),
        (date(2026, 1, 15), "MONTHLY", date(2026, 2, 15)),
        (date(2026, 12, 31), "YEARLY", date(2027, 12, 31)),
        (date(2024, 2, 29), "YEARLY", date(2025, 2, 28)),
        (date(2026, 1, 1), "DAILY", date(2026, 1, 2)),
        (date(2026, 1, 1), "WEEKLY", date(2026, 1, 8)),
    ],
)
def test_advance_billing_date(start, frequency, expected):
    assert advance_billing_date(start, frequency) == expected


def test_monthly_period_end_is_day_before_next_billing_date():
    assert get_period_end(date(2026, 1, 31), "MONTHLY") == date(2026, 2, 27)


def test_unsupported_billing_frequency():
    with pytest.raises(ValueError):
        advance_billing_date(date(2026, 1, 1), "HOURLY")
