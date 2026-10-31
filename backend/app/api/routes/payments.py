from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_staff
from app.models import Customer, Invoice, User
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.payment_service import (
    record_payment,
    list_invoice_payments,
    reverse_payment,
)


router = APIRouter(prefix="/invoices", tags=["Payments"])


def get_visible_invoice(db: Session, invoice_id: int, current_user: User):
    query = db.query(Invoice).filter(Invoice.id == invoice_id)

    if current_user.role.name.upper() == "CUSTOMER":
        customer = db.query(Customer).filter(
            Customer.user_id == current_user.id
        ).first()

        if customer is None:
            return None

        query = query.filter(Invoice.customer_id == customer.id)

    return query.first()


@router.post(
    "/{invoice_id}/payments",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_payment(
    invoice_id: int,
    data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    try:
        payment, outstanding = record_payment(db, invoice_id, data)

        return PaymentResponse(
            id=payment.id,
            invoice_id=payment.invoice_id,
            amount=payment.amount,
            payment_method=payment.payment_method,
            payment_date=payment.payment_date,
            reference=payment.reference,
            note=payment.note,
            status=payment.status,
            created_at=payment.created_at,
            outstanding_balance=outstanding,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get(
    "/{invoice_id}/payments",
    response_model=list[PaymentResponse],
)
def get_invoice_payments(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = get_visible_invoice(db, invoice_id, current_user)

    if invoice is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    payments, outstanding = list_invoice_payments(db, invoice_id)

    return [
        PaymentResponse(
            id=payment.id,
            invoice_id=payment.invoice_id,
            amount=payment.amount,
            payment_method=payment.payment_method,
            payment_date=payment.payment_date,
            reference=payment.reference,
            note=payment.note,
            status=payment.status,
            created_at=payment.created_at,
            outstanding_balance=outstanding,
        )
        for payment in payments
    ]



@router.post(
    "/{invoice_id}/payments/{payment_id}/reverse",
    response_model=PaymentResponse,
)
def reverse_invoice_payment(
    invoice_id: int,
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    try:
        payment, outstanding = reverse_payment(
            db, invoice_id, payment_id
        )

        return PaymentResponse(
            id=payment.id,
            invoice_id=payment.invoice_id,
            amount=payment.amount,
            payment_method=payment.payment_method,
            payment_date=payment.payment_date,
            reference=payment.reference,
            note=payment.note,
            status=payment.status,
            created_at=payment.created_at,
            outstanding_balance=outstanding,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
