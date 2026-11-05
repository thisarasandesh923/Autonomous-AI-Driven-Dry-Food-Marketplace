from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, StringConstraints


ProductName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]
ShortText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
Description = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class ProductCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: ProductName
    description: Description
    category: ShortText
    price: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    pack_size: ShortText
    stock_quantity: int = Field(ge=0)
    image_url: HttpUrl | None = Field(default=None, max_length=2048)
    origin: ShortText
    ingredients: str | None = None
    allergens: str | None = None
    packaging: str | None = None
    shelf_life: str | None = Field(default=None, max_length=100)
    storage_instructions: str | None = None


class ProductRead(ProductCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seller_id: int


class SellerSummary(BaseModel):
    id: int
    name: str


class ProductDetail(ProductRead):
    seller: SellerSummary


class ProductPage(BaseModel):
    items: list[ProductRead]
    total: int
    page: int
    page_size: int
