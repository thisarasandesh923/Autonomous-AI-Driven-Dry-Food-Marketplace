"""Seller dashboard integration against disposable SQLite, never PostgreSQL."""
import os
from datetime import datetime

os.environ.setdefault("JWT_SECRET_KEY", "isolated-test-secret-at-least-32-characters")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core import dependencies
from app.core.security import create_access_token
from app.main import app
from app.models.product import Product
from app.models.user import Base, User
from app.routers import seller


@pytest.fixture
def client(monkeypatch):
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    monkeypatch.setattr(dependencies, "engine", engine)
    monkeypatch.setattr(seller, "engine", engine)
    with Session(engine) as session:
        session.add_all([
            User(id=1, name="Seller One", email="one@example.com", role="seller", hashed_password="unused"),
            User(id=2, name="Seller Two", email="two@example.com", role="seller", hashed_password="unused"),
            User(id=3, name="Buyer", email="buyer@example.com", role="buyer", hashed_password="unused"),
        ])
        session.commit()
    with TestClient(app) as api:
        yield api, engine
    engine.dispose()


def headers(user_id):
    return {"Authorization": f"Bearer {create_access_token(user_id)}"}


def product_body(name="Dried mango", stock=5):
    return {
        "name": name, "description": "Unsweetened dried fruit", "category": "Fruit",
        "price": "12.50", "pack_size": "250 g", "stock_quantity": stock, "origin": "Sri Lanka",
    }


def test_dashboard_reads_created_products_and_isolates_sellers(client):
    api, _ = client
    for user_id, name, stock in [(1, "Own mango", 5), (1, "Own sold out", 0), (2, "Other seller", 100)]:
        assert api.post("/seller/products", json=product_body(name, stock), headers=headers(user_id)).status_code == 201

    response = api.get("/seller/dashboard?seller_id=2", headers=headers(1))
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Welcome to Seller Dashboard!"
    assert data["user"] == {"id": 1, "name": "Seller One", "email": "one@example.com", "role": "seller"}
    assert data["summary"]["total_products"] == 2
    assert data["summary"]["available_packs"] == 5
    assert [product["name"] for product in data["inventory"]] == ["Own mango", "Own sold out"]
    assert {product["seller_id"] for product in data["inventory"]} == {1}
    assert data["inventory"][0]["price"] == "12.50"
    assert data["inventory"][0]["pack_size"] == "250 g"
    assert data["is_demo"] is False
    assert datetime.fromisoformat(data["snapshot_at"].replace("Z", "+00:00")).utcoffset().total_seconds() == 0
    assert "hashed_password" not in response.text
    other = api.get("/seller/dashboard", headers=headers(2)).json()
    assert other["summary"]["available_packs"] == 100
    assert len(other["inventory"]) == 1


def test_empty_inventory_is_known_zero_but_missing_metrics_are_null(client):
    api, _ = client
    data = api.get("/seller/dashboard", headers=headers(1)).json()
    assert data["inventory"] == []
    assert data["summary"]["total_products"] == 0
    assert data["summary"]["available_packs"] == 0
    for field in ["approved_products", "revenue_minor", "open_suborders", "low_stock", "forecast_error"]:
        assert data["summary"][field] is None
    for field in ["profile", "orders", "forecast"]:
        assert data[field] is None
    assert data["unavailable"]["low_stock"]
    assert data["unavailable"]["currency"]


def test_dashboard_refresh_reads_current_stock(client):
    api, engine = client
    product = api.post("/seller/products", json=product_body(), headers=headers(1)).json()
    assert api.get("/seller/dashboard", headers=headers(1)).json()["summary"]["available_packs"] == 5
    with Session(engine) as session:
        session.get(Product, product["id"]).stock_quantity = 12
        session.commit()
    refreshed = api.get("/seller/dashboard", headers=headers(1)).json()
    assert refreshed["summary"]["available_packs"] == 12
    assert refreshed["inventory"][0]["stock_quantity"] == 12


@pytest.mark.parametrize("auth_headers", [{}, {"Authorization": "Bearer invalid"}])
def test_dashboard_rejects_missing_or_invalid_token(client, auth_headers):
    api, _ = client
    assert api.get("/seller/dashboard", headers=auth_headers).status_code == 401


def test_dashboard_rejects_buyers(client):
    api, _ = client
    assert api.get("/seller/dashboard", headers=headers(3)).status_code == 403
