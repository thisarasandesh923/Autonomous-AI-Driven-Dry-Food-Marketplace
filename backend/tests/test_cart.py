"""Buyer cart API tests against isolated SQLite, never PostgreSQL."""

import os

os.environ.setdefault("JWT_SECRET_KEY", "isolated-test-secret-at-least-32-characters")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core import dependencies
from app.core.security import create_access_token
from app.main import app
from app.models.cart_item import CartItem
from app.models.product import Product
from app.models.user import Base, User
from app.routers import buyer, seller


@pytest.fixture
def client(monkeypatch):
    db = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(db)
    monkeypatch.setattr(dependencies, "engine", db)
    monkeypatch.setattr(seller, "engine", db)
    monkeypatch.setattr(buyer, "engine", db)
    with TestClient(app) as api:
        yield api, db
    db.dispose()


def user(db, role, number):
    with Session(db) as session:
        account = User(
            name=f"{role} {number}",
            email=f"{role}{number}@example.com",
            hashed_password="unused",
            role=role,
        )
        session.add(account)
        session.commit()
        return account.id


def headers(user_id):
    return {"Authorization": f"Bearer {create_access_token(user_id)}"}


def product(api, seller_id, name="Ceylon Cinnamon Quills", price="12.50", stock=5):
    response = api.post("/seller/products", headers=headers(seller_id), json={
        "name": name,
        "description": "Freshly packed",
        "category": "Spices",
        "price": price,
        "pack_size": "100 g",
        "stock_quantity": stock,
        "origin": "Sri Lanka",
    })
    assert response.status_code == 201
    return response.json()["id"]


@pytest.fixture
def stocked_cart(client):
    api, db = client
    seller_id = user(db, "seller", 1)
    buyer_id = user(db, "buyer", 1)
    product_id = product(api, seller_id)
    return api, db, seller_id, buyer_id, product_id


def test_add_persists_cart_item_without_reducing_stock(stocked_cart):
    api, db, _, buyer_id, product_id = stocked_cart
    response = api.post(
        "/buyer/cart/items",
        json={"product_id": product_id, "quantity": 2},
        headers=headers(buyer_id),
    )
    assert response.status_code == 201
    body = response.json()
    assert body["product_id"] == product_id
    assert body["quantity"] == 2
    assert body["unit_price"] == "12.50"
    assert body["subtotal"] == "25.00"
    assert body["product"]["name"] == "Ceylon Cinnamon Quills"
    assert body["product"]["stock_quantity"] == 5
    with Session(db) as session:
        saved = session.scalar(select(CartItem))
        assert saved.buyer_id == buyer_id
        assert saved.quantity == 2
        assert session.get(Product, product_id).stock_quantity == 5


def test_repeat_add_increases_quantity_without_duplicate_row(stocked_cart):
    api, db, _, buyer_id, product_id = stocked_cart
    request = {"product_id": product_id, "quantity": 2}
    first = api.post("/buyer/cart/items", json=request, headers=headers(buyer_id)).json()
    second = api.post("/buyer/cart/items", json=request, headers=headers(buyer_id))
    assert second.status_code == 201
    assert second.json()["id"] == first["id"]
    assert second.json()["quantity"] == 4
    assert second.json()["subtotal"] == "50.00"
    with Session(db) as session:
        assert session.scalar(select(func.count()).select_from(CartItem)) == 1


def test_transient_insert_conflict_retries_without_duplicate(stocked_cart):
    api, db, _, buyer_id, product_id = stocked_cart
    attempts = 0

    @event.listens_for(db, "before_cursor_execute")
    def conflict_once(_connection, _cursor, statement, parameters, _context, _many):
        nonlocal attempts
        if statement.lstrip().upper().startswith("INSERT INTO CART_ITEMS"):
            attempts += 1
            if attempts == 1:
                raise IntegrityError(statement, parameters, Exception("simulated conflict"))

    response = api.post(
        "/buyer/cart/items",
        json={"product_id": product_id, "quantity": 2},
        headers=headers(buyer_id),
    )
    assert response.status_code == 201
    assert attempts == 2
    with Session(db) as session:
        assert session.scalar(select(func.count()).select_from(CartItem)) == 1


def test_view_cart_has_product_details_and_decimal_totals(stocked_cart):
    api, _, seller_id, buyer_id, product_id = stocked_cart
    second_id = product(api, seller_id, name="Dried Mango", price="8.25", stock=3)
    first = api.post("/buyer/cart/items", json={"product_id": product_id, "quantity": 2}, headers=headers(buyer_id)).json()
    second = api.post("/buyer/cart/items", json={"product_id": second_id, "quantity": 1}, headers=headers(buyer_id)).json()
    response = api.get("/buyer/cart", headers=headers(buyer_id))
    assert response.status_code == 200
    assert response.json() == {
        "items": [first, second],
        "total_items": 2,
        "total_quantity": 3,
        "total_price": "33.25",
    }


def test_buyers_see_only_their_own_saved_items(stocked_cart):
    api, db, _, first_buyer, product_id = stocked_cart
    other_buyer = user(db, "buyer", 2)
    assert api.get("/buyer/cart", headers=headers(other_buyer)).json() == {
        "items": [], "total_items": 0, "total_quantity": 0, "total_price": "0.00"
    }
    api.post("/buyer/cart/items", json={"product_id": product_id, "quantity": 1}, headers=headers(first_buyer))
    assert api.get("/buyer/cart", headers=headers(other_buyer)).json()["items"] == []
    api.post("/buyer/cart/items", json={"product_id": product_id, "quantity": 2}, headers=headers(other_buyer))
    assert api.get("/buyer/cart", headers=headers(first_buyer)).json()["total_quantity"] == 1
    assert api.get("/buyer/cart", headers=headers(other_buyer)).json()["total_quantity"] == 2


def test_cart_requires_buyer_authentication(stocked_cart):
    api, _, seller_id, _, product_id = stocked_cart
    body = {"product_id": product_id, "quantity": 1}
    for path, method in (("/buyer/cart/items", "post"), ("/buyer/cart", "get")):
        call = getattr(api, method)
        kwargs = {"json": body} if method == "post" else {}
        assert call(path, **kwargs).status_code == 401
        assert call(path, headers=headers(seller_id), **kwargs).status_code == 403


@pytest.mark.parametrize("quantity", [0, -1, 1.5, "2", None])
def test_invalid_quantity_returns_422(stocked_cart, quantity):
    api, db, _, buyer_id, product_id = stocked_cart
    response = api.post(
        "/buyer/cart/items",
        json={"product_id": product_id, "quantity": quantity},
        headers=headers(buyer_id),
    )
    assert response.status_code == 422
    with Session(db) as session:
        assert session.scalar(select(func.count()).select_from(CartItem)) == 0


def test_client_cannot_choose_buyer_id(stocked_cart):
    api, _, _, buyer_id, product_id = stocked_cart
    response = api.post(
        "/buyer/cart/items",
        json={"product_id": product_id, "quantity": 1, "buyer_id": 999},
        headers=headers(buyer_id),
    )
    assert response.status_code == 422


def test_nonexistent_product_returns_404(stocked_cart):
    api, _, _, buyer_id, _ = stocked_cart
    response = api.post(
        "/buyer/cart/items", json={"product_id": 99999, "quantity": 1}, headers=headers(buyer_id)
    )
    assert response.status_code == 404


def test_insufficient_stock_rejects_initial_and_repeat_add(stocked_cart):
    api, db, _, buyer_id, product_id = stocked_cart
    assert api.post(
        "/buyer/cart/items", json={"product_id": product_id, "quantity": 6}, headers=headers(buyer_id)
    ).status_code == 409
    first = api.post(
        "/buyer/cart/items", json={"product_id": product_id, "quantity": 4}, headers=headers(buyer_id)
    )
    assert first.status_code == 201
    assert api.post(
        "/buyer/cart/items", json={"product_id": product_id, "quantity": 2}, headers=headers(buyer_id)
    ).status_code == 409
    with Session(db) as session:
        item = session.scalar(select(CartItem))
        assert item.quantity == 4
        assert session.get(Product, product_id).stock_quantity == 5
