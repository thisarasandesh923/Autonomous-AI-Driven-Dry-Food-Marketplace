"""Verify new table constraints using an isolated SQLite database."""

from decimal import Decimal

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.cart_item import CartItem
from app.models.product import Product
from app.models.user import Base, User


@pytest.fixture
def engine():
    db = create_engine("sqlite://")

    @event.listens_for(db, "connect")
    def enable_foreign_keys(connection, _record):
        connection.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(db)
    yield db
    db.dispose()


def add_user(session, role, number=1):
    user = User(name=role, email=f"{role}{number}@example.com", hashed_password="unused", role=role)
    session.add(user)
    session.flush()
    return user


def add_product(session, seller_id, price=Decimal("12.50"), stock_quantity=3):
    product = Product(
        seller_id=seller_id,
        name="Dried mango",
        description="Unsweetened dried mango",
        category="Fruit",
        price=price,
        pack_size="250 g",
        stock_quantity=stock_quantity,
        origin="Sri Lanka",
    )
    session.add(product)
    session.flush()
    return product


def test_product_and_cart_persist_with_exact_price(engine):
    with Session(engine) as session:
        seller = add_user(session, "seller")
        buyer = add_user(session, "buyer")
        product = add_product(session, seller.id)
        session.add(CartItem(buyer_id=buyer.id, product_id=product.id, quantity=2))
        session.commit()

    with Session(engine) as session:
        product = session.query(Product).one()
        cart_item = session.query(CartItem).one()
        assert product.price == Decimal("12.50")
        assert cart_item.quantity == 2
        assert cart_item.product_id == product.id


@pytest.mark.parametrize("price,stock", [
    (Decimal("0.00"), 1),
    (Decimal("-1.00"), 1),
    (Decimal("1.00"), -1),
])
def test_product_rejects_invalid_price_and_stock(engine, price, stock):
    with Session(engine) as session:
        seller = add_user(session, "seller")
        with pytest.raises(IntegrityError):
            add_product(session, seller.id, price=price, stock_quantity=stock)


def test_cart_rejects_duplicate_and_nonpositive_quantity(engine):
    with Session(engine) as session:
        seller = add_user(session, "seller")
        buyer = add_user(session, "buyer")
        product = add_product(session, seller.id)
        session.add(CartItem(buyer_id=buyer.id, product_id=product.id, quantity=1))
        session.commit()
        buyer_id, product_id = buyer.id, product.id

    with Session(engine) as session:
        session.add(CartItem(buyer_id=buyer_id, product_id=product_id, quantity=2))
        with pytest.raises(IntegrityError):
            session.commit()

    for quantity in (0, -1):
        with Session(engine) as session:
            other_buyer = add_user(session, "buyer", number=quantity)
            session.add(CartItem(buyer_id=other_buyer.id, product_id=product_id, quantity=quantity))
            with pytest.raises(IntegrityError):
                session.commit()


def test_product_and_cart_require_existing_users_and_product(engine):
    with Session(engine) as session:
        with pytest.raises(IntegrityError):
            add_product(session, seller_id=999)

    with Session(engine) as session:
        buyer = add_user(session, "buyer")
        session.flush()
        session.add(CartItem(buyer_id=buyer.id, product_id=999, quantity=1))
        with pytest.raises(IntegrityError):
            session.commit()
