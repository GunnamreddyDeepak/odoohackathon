from app.core.database import SessionLocal
from app.models import User

OLD_EMAIL = "admin.test@brightloop.local"
NEW_EMAIL = "brightloop.admin.test@gmail.com"

db = SessionLocal()

try:
    user = db.query(User).filter(
        User.email == OLD_EMAIL
    ).first()

    if not user:
        print("Existing ADMIN account not found.")
    else:
        duplicate = db.query(User).filter(
            User.email == NEW_EMAIL
        ).first()

        if duplicate and duplicate.id != user.id:
            print("New email is already in use.")
        else:
            user.email = NEW_EMAIL
            db.commit()
            db.refresh(user)

            print("Email updated successfully.")
            print("Email:", user.email)
            print("Role:", user.role.name)
            print("Active:", user.is_active)

except Exception:
    db.rollback()
    raise

finally:
    db.close()