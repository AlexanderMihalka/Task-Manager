from app.models import User
from app.security import verify_password


def test_register_success(client):
    response = client.post(
        "/auth/register",
        json={"email": "alice@example.com", "password": "password123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "alice@example.com"
    assert "id" in data
    # пароль чи хеш не повинні потрапляти у відповідь
    assert "password" not in data
    assert "password_hash" not in data


def test_register_email_is_case_insensitive(client):
    client.post(
        "/auth/register", json={"email": "Alice@Example.com", "password": "password123"}
    )
    response = client.post(
        "/auth/register", json={"email": "alice@example.com", "password": "password123"}
    )
    assert response.status_code == 400


def test_password_is_stored_as_bcrypt_hash(client, db):
    client.post(
        "/auth/register",
        json={"email": "alice@example.com", "password": "password123"},
    )
    user = db.query(User).filter_by(email="alice@example.com").one()
    assert user.password_hash != "password123"
    assert user.password_hash.startswith("$2")  # префікс bcrypt
    assert verify_password("password123", user.password_hash)


def test_register_duplicate_email(client):
    payload = {"email": "alice@example.com", "password": "password123"}
    client.post("/auth/register", json=payload)
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 400
    assert "вже існує" in response.json()["detail"]


def test_register_invalid_email(client):
    response = client.post(
        "/auth/register", json={"email": "not-an-email", "password": "password123"}
    )
    assert response.status_code == 422


def test_register_short_password(client):
    response = client.post(
        "/auth/register", json={"email": "alice@example.com", "password": "123"}
    )
    assert response.status_code == 422


def test_login_success(client):
    creds = {"email": "alice@example.com", "password": "password123"}
    client.post("/auth/register", json=creds)
    response = client.post("/auth/login", json=creds)
    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["access_token"]


def test_login_wrong_password(client):
    client.post(
        "/auth/register",
        json={"email": "alice@example.com", "password": "password123"},
    )
    response = client.post(
        "/auth/login", json={"email": "alice@example.com", "password": "wrong-password"}
    )
    assert response.status_code == 401


def test_login_unknown_user(client):
    response = client.post(
        "/auth/login", json={"email": "nobody@example.com", "password": "password123"}
    )
    assert response.status_code == 401


def test_me_returns_current_user(client, auth_headers):
    response = client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "alice@example.com"


def test_me_without_token(client):
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_me_with_invalid_token(client):
    response = client.get("/auth/me", headers={"Authorization": "Bearer abc.def.ghi"})
    assert response.status_code == 401
