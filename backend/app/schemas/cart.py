from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CartItemAdd(BaseModel):
    model_config = ConfigDict(extra="forbid")

    product_id: int = Field(strict=True, gt=0)
    quantity: int = Field(strict=True, gt=0)


class CartProduct(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seller_id: int
    name: str
    category: str
    pack_size: str
    image_url: str | None
    origin: str
    stock_quantity: int


class CartItemRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: CartProduct
    unit_price: Decimal
    subtotal: Decimal


class CartRead(BaseModel):
    items: list[CartItemRead]
    total_items: int
    total_quantity: int
    total_price: Decimal
