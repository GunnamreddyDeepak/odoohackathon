from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.core.dependencies import require_admin, require_staff, require_customer


class FakeQuery:
    def __init__(self, role):
        self.role = role

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self.role


class FakeDB:
    def __init__(self, role):
        self.role = role

    def query(self, model):
        return FakeQuery(self.role)


def make_user(role_name):
    role = SimpleNamespace(name=role_name)
    return SimpleNamespace(id=1, role_id=1, role=role)


def test_admin_access_allowed():
    user = make_user("ADMIN")
    assert require_admin(current_user=user, db=FakeDB(user.role)) is user


@pytest.mark.parametrize("role_name", ["ADMIN", "STAFF"])
def test_staff_access_allowed(role_name):
    user = make_user(role_name)
    assert require_staff(current_user=user, db=FakeDB(user.role)) is user


def test_customer_access_allowed():
    user = make_user("CUSTOMER")
    assert require_customer(current_user=user, db=FakeDB(user.role)) is user


@pytest.mark.parametrize(
    "dependency,role_name",
    [
        (require_admin, "STAFF"),
        (require_admin, "CUSTOMER"),
        (require_staff, "CUSTOMER"),
        (require_customer, "ADMIN"),
        (require_customer, "STAFF"),
    ],
)
def test_forbidden_roles_receive_403(dependency, role_name):
    user = make_user(role_name)

    with pytest.raises(HTTPException) as exc:
        dependency(current_user=user, db=FakeDB(user.role))

    assert exc.value.status_code == 403