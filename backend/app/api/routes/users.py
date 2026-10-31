from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.core.security import hash_password
from app.models import User, Role
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


def serialize_user(user):
    return UserResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user.role.name,
        is_active=user.is_active,
    )


@router.get("", response_model=list[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if skip < 0 or limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Invalid pagination")

    users = (
        db.query(User)
        .order_by(User.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [serialize_user(user) for user in users]


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    email = str(data.email).lower()

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    role = db.query(Role).filter(Role.name == data.role.upper()).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role")

    user = User(
        full_name=data.full_name.strip(),
        email=email,
        hashed_password=hash_password(data.password),
        role_id=role.id,
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        return serialize_user(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="User creation conflict")


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return serialize_user(user)


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = data.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(status_code=400, detail="No update fields provided")

    if "email" in updates:
        updates["email"] = str(updates["email"]).lower()
        duplicate = db.query(User).filter(
            User.email == updates["email"],
            User.id != user_id,
        ).first()

        if duplicate:
            raise HTTPException(status_code=409, detail="Email already registered")

    for field, value in updates.items():
        if field == "full_name":
            value = value.strip()
        setattr(user, field, value)

    try:
        db.commit()
        db.refresh(user)
        return serialize_user(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="User update conflict")
