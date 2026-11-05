from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.database import engine
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductDetail, ProductPage, ProductRead, SellerSummary


router = APIRouter(prefix="/products", tags=["Products"])

SortOrder = Literal["newest", "price_asc", "price_desc", "name_asc", "name_desc"]


def escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


@router.get("", response_model=ProductPage)
def list_products(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None, min_length=1, max_length=200),
    category: str | None = Query(default=None, min_length=1, max_length=100),
    seller_id: int | None = Query(default=None, gt=0),
    min_price: Decimal | None = Query(default=None, ge=0, max_digits=12, decimal_places=2),
    max_price: Decimal | None = Query(default=None, ge=0, max_digits=12, decimal_places=2),
    in_stock: bool | None = Query(default=None),
    sort: SortOrder = Query(default="newest"),
    _current_user: dict = Depends(require_role("buyer")),
):
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="min_price must be less than or equal to max_price",
        )

    filters = []
    if search is not None:
        term = search.strip()
        if not term:
            raise HTTPException(status_code=422, detail="search must not be blank")
        pattern = f"%{escape_like(term)}%"
        filters.append(or_(
            Product.name.ilike(pattern, escape="\\"),
            Product.description.ilike(pattern, escape="\\"),
        ))
    if category is not None:
        category = category.strip()
        if not category:
            raise HTTPException(status_code=422, detail="category must not be blank")
        filters.append(func.lower(Product.category) == category.lower())
    if seller_id is not None:
        filters.append(Product.seller_id == seller_id)
    if min_price is not None:
        filters.append(Product.price >= min_price)
    if max_price is not None:
        filters.append(Product.price <= max_price)
    if in_stock is not None:
        filters.append(Product.stock_quantity > 0 if in_stock else Product.stock_quantity == 0)

    order = {
        "newest": (Product.id.desc(),),
        "price_asc": (Product.price.asc(), Product.id.asc()),
        "price_desc": (Product.price.desc(), Product.id.desc()),
        "name_asc": (func.lower(Product.name).asc(), Product.id.asc()),
        "name_desc": (func.lower(Product.name).desc(), Product.id.desc()),
    }[sort]

    with Session(engine) as session:
        total = session.scalar(select(func.count()).select_from(Product).where(*filters))
        products = session.scalars(
            select(Product)
            .where(*filters)
            .order_by(*order)
            .offset((page - 1) * page_size)
            .limit(page_size)
        ).all()
        return ProductPage(items=products, total=total, page=page, page_size=page_size)


@router.get("/{product_id}", response_model=ProductDetail)
def get_product(
    product_id: int,
    _current_user: dict = Depends(require_role("buyer")),
):
    with Session(engine) as session:
        row = session.execute(
            select(Product, User)
            .join(User, Product.seller_id == User.id)
            .where(Product.id == product_id)
        ).one_or_none()
        if row is None:
            raise HTTPException(status_code=404, detail="Product not found")

        product, seller = row
        return ProductDetail.model_validate({
            **ProductRead.model_validate(product).model_dump(),
            "seller": SellerSummary(id=seller.id, name=seller.name),
        })
