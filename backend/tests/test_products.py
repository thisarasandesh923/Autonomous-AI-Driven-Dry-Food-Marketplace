"""Product catalog API tests against isolated SQLite, never PostgreSQL."""

import os

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
from app.routers import products, seller


@pytest.fixture
def client(monkeypatch):
    db = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(db)
    monkeypatch.setattr(dependencies, "engine", db)
    monkeypatch.setattr(seller, "engine", db)
    monkeypatch.setattr(products, "engine", db)
    with TestClient(app) as api:
        yield api, db
    db.dispose()


def user(db, role, name):
    with Session(db) as session:
        account = User(
            name=name,
            email=f"{role}{name.replace(' ', '')}@example.com",
            hashed_password="unused",
            role=role,
        )
        session.add(account)
        session.commit()
        return account.id


def headers(user_id):
    return {"Authorization": f"Bearer {create_access_token(user_id)}"}


def create_product(api, seller_id, name, description, category, price, stock):
    response = api.post("/seller/products", headers=headers(seller_id), json={
        "name": name,
        "description": description,
        "category": category,
        "price": price,
        "pack_size": "100 g",
        "stock_quantity": stock,
        "origin": "Sri Lanka",
        "ingredients": name,
    })
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def catalog(client):
    api, db = client
    buyer_id = user(db, "buyer", "Buyer")
    first_seller = user(db, "seller", "First Seller")
    second_seller = user(db, "seller", "Second Seller")
    cinnamon = create_product(api, first_seller, "Ceylon Cinnamon Quills", "Warm spice", "Spices", "12.50", 5)
    mango = create_product(api, second_seller, "Dried Mango", "Sweet fruit", "Fruit", "8.00", 0)
    pepper = create_product(api, first_seller, "Black Pepper", "Sharp SPICE", "Spices", "15.00", 2)
    return api, db, headers(buyer_id), first_seller, second_seller, cinnamon, mango, pepper


def test_list_is_paginated_and_new_products_appear_immediately(catalog):
    api, _, buyer_headers, _, _, cinnamon, mango, pepper = catalog
    response = api.get("/products", headers=buyer_headers)
    assert response.status_code == 200
    assert response.json() == {
        "items": [pepper, mango, cinnamon],
        "total": 3,
        "page": 1,
        "page_size": 20,
    }


@pytest.mark.parametrize("term,expected", [
    ("ceylon", ["Ceylon Cinnamon Quills"]),
    ("SPICE", ["Black Pepper", "Ceylon Cinnamon Quills"]),
    ("sweet", ["Dried Mango"]),
    ("%", []),
])
def test_search_name_and_description_case_insensitively(catalog, term, expected):
    api, _, buyer_headers, *_ = catalog
    body = api.get("/products", params={"search": term}, headers=buyer_headers).json()
    assert [item["name"] for item in body["items"]] == expected
    assert body["total"] == len(expected)


def test_category_seller_price_and_stock_filters(catalog):
    api, _, buyer_headers, first_seller, second_seller, *_ = catalog
    cases = [
        ({"category": "spices"}, ["Black Pepper", "Ceylon Cinnamon Quills"]),
        ({"seller_id": first_seller}, ["Black Pepper", "Ceylon Cinnamon Quills"]),
        ({"seller_id": second_seller}, ["Dried Mango"]),
        ({"min_price": "10.00", "max_price": "12.50"}, ["Ceylon Cinnamon Quills"]),
        ({"in_stock": "true"}, ["Black Pepper", "Ceylon Cinnamon Quills"]),
        ({"in_stock": "false"}, ["Dried Mango"]),
        ({"category": "Spices", "seller_id": first_seller, "max_price": "13.00", "in_stock": "true"}, ["Ceylon Cinnamon Quills"]),
    ]
    for params, expected in cases:
        body = api.get("/products", params=params, headers=buyer_headers).json()
        assert [item["name"] for item in body["items"]] == expected


def test_pagination_and_sorting(catalog):
    api, _, buyer_headers, *_ = catalog
    page = api.get("/products", params={"page": 2, "page_size": 1}, headers=buyer_headers).json()
    assert (page["total"], page["page"], page["page_size"]) == (3, 2, 1)
    assert [item["name"] for item in page["items"]] == ["Dried Mango"]
    expected = {
        "newest": ["Black Pepper", "Dried Mango", "Ceylon Cinnamon Quills"],
        "price_asc": ["Dried Mango", "Ceylon Cinnamon Quills", "Black Pepper"],
        "price_desc": ["Black Pepper", "Ceylon Cinnamon Quills", "Dried Mango"],
        "name_asc": ["Black Pepper", "Ceylon Cinnamon Quills", "Dried Mango"],
        "name_desc": ["Dried Mango", "Ceylon Cinnamon Quills", "Black Pepper"],
    }
    for sort, names in expected.items():
        body = api.get("/products", params={"sort": sort}, headers=buyer_headers).json()
        assert [item["name"] for item in body["items"]] == names


def test_details_include_complete_product_and_seller(catalog):
    api, _, buyer_headers, first_seller, _, cinnamon, *_ = catalog
    response = api.get(f"/products/{cinnamon['id']}", headers=buyer_headers)
    assert response.status_code == 200
    assert response.json() == {**cinnamon, "seller": {"id": first_seller, "name": "First Seller"}}
    assert api.get("/products/99999", headers=buyer_headers).status_code == 404


def test_empty_results_are_consistent(catalog):
    api, _, buyer_headers, *_ = catalog
    for params in ({"search": "absent"}, {"page": 99, "page_size": 2}):
        body = api.get("/products", params=params, headers=buyer_headers).json()
        assert body["items"] == []
        assert body["page_size"] == params.get("page_size", 20)
        assert body["total"] == (3 if "page" in params else 0)


@pytest.mark.parametrize("params", [
    {"page": 0}, {"page_size": 0}, {"page_size": 101},
    {"search": "   "}, {"category": "   "}, {"seller_id": 0},
    {"min_price": "-1"}, {"max_price": "-1"},
    {"min_price": "12.00", "max_price": "10.00"},
    {"in_stock": "maybe"}, {"sort": "unknown"},
])
def test_invalid_filters_return_422(catalog, params):
    api, _, buyer_headers, *_ = catalog
    assert api.get("/products", params=params, headers=buyer_headers).status_code == 422


def test_buyer_auth_is_required_for_catalog_and_details(catalog):
    api, _, buyer_headers, first_seller, _, cinnamon, *_ = catalog
    for path in ("/products", f"/products/{cinnamon['id']}"):
        assert api.get(path).status_code == 401
        assert api.get(path, headers=headers(first_seller)).status_code == 403
        assert api.get(path, headers=buyer_headers).status_code == 200
