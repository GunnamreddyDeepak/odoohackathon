import getpass

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import User, Role


EMAIL = "admin.test@brightloop.local"


def create_admin():
    db: Session = SessionLocal()

    try:
        role = db.query(Role).filter(Role.name == "ADMIN").first()

        if not role:
            print("ADMIN role not found.")
            return

        existing = db.query(User).filter(User.email == EMAIL).first()

        if existing:
            print("Test account already exists.")
            print("Email:", EMAIL)
            print("Role:", role.name if existing.role_id == role.id else "Different role")
            return

        password = getpass.getpass("Enter a temporary test password: ")

        if len(password) < 12:
            print("Password must contain at least 12 characters.")
            return

        user = User(
            full_name="Brightloop Test Admin",
            email=EMAIL,
            hashed_password=hash_password(password),
            role_id=role.id,
            is_active=True,
        )

        db.add(user)
        db.commit()

        print("\nADMIN test account created successfully.")
        print("Email:", EMAIL)
        print("Role: ADMIN")
        print("Password: Entered locally (not displayed).")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()