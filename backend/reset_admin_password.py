import getpass

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import User, Role

EMAIL = "brightloop.admin.test@gmail.com"

db = SessionLocal()

try:
    user = db.query(User).filter(User.email == EMAIL).first()

    if not user:
        raise ValueError("ADMIN account not found")

    role = db.query(Role).filter(Role.id == user.role_id).first()

    if not role or role.name != "ADMIN":
        raise ValueError("Account does not have ADMIN role")

    password = getpass.getpass("Enter new temporary password: ")
    confirm = getpass.getpass("Confirm password: ")

    if len(password) < 12:
        raise ValueError("Password must contain at least 12 characters")

    if password != confirm:
        raise ValueError("Passwords do not match")

    user.hashed_password = hash_password(password)
    user.is_active = True

    db.commit()

    print("Password reset successfully")
    print("Email:", user.email)
    print("Role:", role.name)
    print("Active:", user.is_active)

except Exception:
    db.rollback()
    raise

finally:
    db.close()
