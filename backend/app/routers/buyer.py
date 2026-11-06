
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.database import engine
from app.models.cart_item import CartItem
from app.models.product import Product
from app.schemas.cart import CartItemAdd, CartItemRead, CartProduct, CartRead


router = APIRouter(
    prefix="/buyer",
    tags=["Buyer"]
)


@router.get("/dashboard")
def buyer_dashboard(
    current_user: dict = Depends(require_role("buyer"))
):
    return {
        "message": "Welcome to Buyer Dashboard!",
        "user": current_user
    }


def cart_item_read(item: CartItem, product: Product) -> CartItemRead:
    return CartItemRead(
        id=item.id,
        product_id=product.id,
        quantity=item.quantity,
        product=CartProduct.model_validate(product),
        unit_price=product.price,
        subtotal=product.price * item.quantity,
    )


@router.post("/cart/items", response_model=CartItemRead, status_code=status.HTTP_201_CREATED)
def add_cart_item(
    data: CartItemAdd,
    current_user: dict = Depends(require_role("buyer")),
):
    buyer_id = current_user["id"]

    # Locking the product serializes concurrent adds of the same product in PostgreSQL.
    # The unique constraint remains the final safeguard if another writer races us.
    for attempt in range(2):
        with Session(engine) as session:
            try:
                with session.begin():
                    product = session.scalar(
                        select(Product)
                        .where(Product.id == data.product_id)
                        .with_for_update()
                    )
                    if product is None:
                        raise HTTPException(status_code=404, detail="Product not found")

                    item = session.scalar(
                        select(CartItem)
                        .where(CartItem.buyer_id == buyer_id, CartItem.product_id == product.id)
                        .with_for_update()
                    )
                    new_quantity = data.quantity + (item.quantity if item else 0)
                    if new_quantity > product.stock_quantity:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail="Requested quantity exceeds available stock",
                        )

                    if item is None:
                        item = CartItem(
                            buyer_id=buyer_id,
                            product_id=product.id,
                            quantity=new_quantity,
                        )
                        session.add(item)
                    else:
                        item.quantity = new_quantity

                    session.flush()
                    result = cart_item_read(item, product)
                return result
            except IntegrityError:
                session.rollback()
                if attempt == 1:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Cart could not be updated; please retry",
                    )


@router.get("/cart", response_model=CartRead)
def get_cart(current_user: dict = Depends(require_role("buyer"))):
    with Session(engine) as session:
        rows = session.execute(
            select(CartItem, Product)
            .join(Product, CartItem.product_id == Product.id)
            .where(CartItem.buyer_id == current_user["id"])
            .order_by(CartItem.id)
        ).all()
        items = [cart_item_read(item, product) for item, product in rows]
        return CartRead(
            items=items,
            total_items=len(items),
            total_quantity=sum(item.quantity for item in items),
            total_price=sum((item.subtotal for item in items), Decimal("0.00")),
        )
