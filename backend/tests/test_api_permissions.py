from fastapi.testclient import TestClient
from types import SimpleNamespace
from unittest.mock import MagicMock

from app.main import app
from app.core.dependencies import get_current_user, get_db

client = TestClient(app)


def override_db():
    yield MagicMock()


def make_customer_user(user_id=1):
    return SimpleNamespace(
        id=user_id,
        role_id=3,
        role=SimpleNamespace(id=3, name="CUSTOMER"),
    )


def make_staff_user(user_id=2):
    return SimpleNamespace(
        id=user_id,
        role_id=2,
        role=SimpleNamespace(id=2, name="STAFF"),
    )


def test_customers_endpoint_requires_authentication():
    response = client.get("/api/v1/customers")
    assert response.status_code == 401


def test_subscriptions_endpoint_requires_authentication():
    response = client.get("/api/v1/subscriptions")
    assert response.status_code == 401


def test_users_endpoint_requires_authentication():
    response = client.get("/api/v1/users")
    assert response.status_code == 401


def test_roles_endpoint_requires_authentication():
    response = client.get("/api/v1/roles")
    assert response.status_code == 401


def test_customer_cannot_create_customer():
    app.dependency_overrides[get_current_user] = lambda: make_customer_user()
    app.dependency_overrides[get_db] = override_db

    try:
        response = client.post("/api/v1/customers", json={})
        assert response.status_code == 403
    finally:
        app.dependency_overrides.clear()


def test_customer_cannot_create_subscription():
    app.dependency_overrides[get_current_user] = lambda: make_customer_user()
    app.dependency_overrides[get_db] = override_db

    try:
        response = client.post("/api/v1/subscriptions", json={})
        assert response.status_code == 403
    finally:
        app.dependency_overrides.clear()


def test_customer_cannot_list_all_customers():
    app.dependency_overrides[get_current_user] = lambda: make_customer_user()
    app.dependency_overrides[get_db] = override_db

    try:
        response = client.get("/api/v1/customers")
        assert response.status_code == 403
    finally:
        app.dependency_overrides.clear()


def test_customer_cannot_access_another_customer_profile():
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.filter.return_value.first.return_value = None

    def override_db_for_ownership():
        yield mock_db

    app.dependency_overrides[get_current_user] = lambda: make_customer_user(user_id=1)
    app.dependency_overrides[get_db] = override_db_for_ownership

    try:
        response = client.get("/api/v1/customers/2")
        assert response.status_code == 404
    finally:
        app.dependency_overrides.clear()


def test_customer_cannot_access_another_customer_subscription():
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.filter.return_value.first.return_value = None

    def override_db_for_ownership():
        yield mock_db

    app.dependency_overrides[get_current_user] = lambda: make_customer_user(user_id=1)
    app.dependency_overrides[get_db] = override_db_for_ownership

    try:
        response = client.get("/api/v1/subscriptions/2")
        assert response.status_code == 404
    finally:
        app.dependency_overrides.clear()


def test_customer_cannot_access_another_customer_subscription_lines():
    mock_db = MagicMock()

    subscription = SimpleNamespace(id=2, customer_id=2)

    mock_db.query.return_value.filter.return_value.first.side_effect = [
        subscription,
        None,
    ]

    def override_db_for_ownership():
        yield mock_db

    app.dependency_overrides[get_current_user] = lambda: make_customer_user(user_id=1)
    app.dependency_overrides[get_db] = override_db_for_ownership

    try:
        response = client.get("/api/v1/subscriptions/2/lines")
        assert response.status_code == 404
    finally:
        app.dependency_overrides.clear()


def test_staff_can_list_customers():
    mock_db = MagicMock()

    # Role lookup for require_staff
    mock_db.query.return_value.filter.return_value.first.return_value = (
        SimpleNamespace(id=2, name="STAFF")
    )

    # Customer list query
    mock_db.query.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = []

    def override_db_for_staff():
        yield mock_db

    app.dependency_overrides[get_current_user] = lambda: make_staff_user()
    app.dependency_overrides[get_db] = override_db_for_staff

    try:
        response = client.get("/api/v1/customers")
        assert response.status_code == 200
        assert response.json() == []
    finally:
        app.dependency_overrides.clear()