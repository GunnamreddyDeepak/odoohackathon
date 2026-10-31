import getpass

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import User, Role

EMAIL = "brightloop.admin.test@gmail.com"

db = SessionLocal()

try:
    user = db.query(User).filter(User.email == EMAIL).first()

    if not user:
        print("ADMIN account not found.")
        raise SystemExit(1)

    role = db.query(Role).filter(Role.id == user.role_id).first()

    if not role or role.name != "ADMIN":
        print("Account does not have ADMIN role.")
        raise SystemExit(1)

    password = getpass.getpass("Enter a new temporary password: ")
    confirm = getpass.getpass("Confirm the password: ")

    if len(password) < 12:
        print("Password must contain at least 12 characters.")
        raise SystemExit(1)

    if password != confirm:
        print("Passwords do not match.")
        raise SystemExit(1)

    user.hashed_password = hash_password(password)
    user.is_active = True

    db.commit()

    print("Password reset successfully.")
    print("Email:", user.email)
    print("Role:", role.name)
    print("Active:", user.is_active)

except Exception:
    db.rollback()
    raise

finally:
    db.close()