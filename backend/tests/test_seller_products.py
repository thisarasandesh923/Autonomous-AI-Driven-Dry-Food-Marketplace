"""Seller product API tests against isolated SQLite, never PostgreSQL."""

import os
from decimal import Decimal

os.environ.setdefault("JWT_SECRET_KEY", "isolated-test-secret-at-least-32-characters")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core import dependencies
from app.core.security import create_access_token
from app.main import app
from app.models.product import Product
from app.models.user import Base, User
from app.routers import seller


PRODUCT_BODY = {
    "name": "Dried mango",
    "description": "Unsweetened dried mango",
    "category": "Fruit",
    "price": "12.50",
    "pack_size": "250 g",
    "stock_quantity": 5,
    "image_url": "https://example.com/mango.jpg",
    "origin": "Sri Lanka",
    "ingredients": "Mango",
    "allergens": "None declared",
    "packaging": "Resealable pouch",
    "shelf_life": "12 months",
    "storage_instructions": "Store in a cool, dry place",
}


@pytest.fixture
def client(monkeypatch):
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    monkeypatch.setattr(dependencies, "engine", engine)
    monkeypatch.setattr(seller, "engine", engine)
    with TestClient(app) as api:
        yield api, engine
    engine.dispose()


def add_user(engine, role, number=1):
    with Session(engine) as session:
        user = User(
            name=f"{role} {number}",
            email=f"{role}{number}@example.com",
            hashed_password="unused",
            role=role,
        )
        session.add(user)
        session.commit()
        return user.id


def auth_header(user_id):
    return {"Authorization": f"Bearer {create_access_token(user_id)}"}


def test_seller_creates_saved_product_with_own_id(client):
    api, engine = client
    seller_id = add_user(engine, "seller")
    add_user(engine, "seller", number=2)

    response = api.post("/seller/products", json=PRODUCT_BODY, headers=auth_header(seller_id))

    assert response.status_code == 201
    body = response.json()
    assert body["id"] > 0
    assert body["seller_id"] == seller_id
    assert body["price"] == "12.50"
    for field, value in PRODUCT_BODY.items():
        assert body[field] == value
    with Session(engine) as session:
        saved = session.scalar(select(Product))
        assert saved.id == body["id"]
        assert saved.seller_id == seller_id
        assert saved.price == Decimal("12.50")
        assert saved.stock_quantity == 5


def test_buyer_cannot_create_product(client):
    api, engine = client
    buyer_id = add_user(engine, "buyer")
    response = api.post("/seller/products", json=PRODUCT_BODY, headers=auth_header(buyer_id))
    assert response.status_code == 403
    with Session(engine) as session:
        assert session.scalar(select(Product)) is None


def test_unauthenticated_cannot_create_product(client):
    api, engine = client
    assert api.post("/seller/products", json=PRODUCT_BODY).status_code == 401
    with Session(engine) as session:
        assert session.scalar(select(Product)) is None


@pytest.mark.parametrize("changes", [
    {"name": "   "},
    {"category": ""},
    {"price": "0"},
    {"price": "-2.00"},
    {"price": "1.234"},
    {"price": "12345678901.00"},
    {"stock_quantity": -1},
    {"image_url": "not-a-url"},
    {"image_url": "https://example.com/" + "a" * 2048},
    {"seller_id": 999},
])
def test_invalid_product_fields_are_rejected(client, changes):
    api, engine = client
    seller_id = add_user(engine, "seller")
    response = api.post(
        "/seller/products", json={**PRODUCT_BODY, **changes}, headers=auth_header(seller_id)
    )
    assert response.status_code == 422
    with Session(engine) as session:
        assert session.scalar(select(Product)) is None
