from datetime import date

from fastapi import APIRouter, Depends, Query

from app.core.database import get_db
from app.core.dependencies import require_staff
from app.services.recurring_billing_service import run_recurring_billing

router = APIRouter(prefix="/billing", tags=["Recurring Billing"])


@router.post("/run")
def run_billing_endpoint(
    run_date: date | None = Query(default=None),
    db=Depends(get_db),
    current_user=Depends(require_staff),
):
    return run_recurring_billing(db, run_date)
