
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_staff
from app.models import Customer, Invoice, User
from app.schemas.invoice import (
    InvoiceCreate,
    InvoiceResponse,
    InvoiceStatusUpdate,
)
from app.services.invoice_service import create_invoice


router = APIRouter(prefix="/invoices", tags=["Invoices"])


def customer_invoice_query(db: Session, current_user: User):
    """Return invoices visible to the current user."""
    query = db.query(Invoice).options(
        selectinload(Invoice.lines)
    )

    if current_user.role.name.upper() == "CUSTOMER":
        customer = db.query(Customer).filter(
            Customer.user_id == current_user.id
        ).first()

        if not customer:
            return query.filter(Invoice.id == -1)

        query = query.filter(Invoice.customer_id == customer.id)

    return query


@router.post(
    "",
    response_model=InvoiceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_invoice_endpoint(
    data: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    try:
        return create_invoice(db, data)

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Invoice creation conflict",
        )


@router.get(
    "",
    response_model=list[InvoiceResponse],
)
def list_invoices(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = customer_invoice_query(db, current_user)

    return (
        query.order_by(Invoice.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get(
    "/{invoice_id}",
    response_model=InvoiceResponse,
)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = customer_invoice_query(
        db, current_user
    ).filter(
        Invoice.id == invoice_id
    ).first()

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    return invoice


@router.patch(
    "/{invoice_id}/status",
    response_model=InvoiceResponse,
)
def update_invoice_status(
    invoice_id: int,
    data: InvoiceStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    invoice = (
        db.query(Invoice)
        .options(selectinload(Invoice.lines))
        .filter(Invoice.id == invoice_id)
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    if invoice.status != "DRAFT":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only draft invoices can change status",
        )

    invoice.status = data.status

    try:
        db.commit()
        db.refresh(invoice)
        return invoice

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid invoice status update",
        )
