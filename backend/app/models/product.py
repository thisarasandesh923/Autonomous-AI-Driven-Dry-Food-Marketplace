from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.user import Base


class Product(Base):
    __tablename__ = "products"

    __table_args__ = (
        CheckConstraint("price > 0", name="ck_products_price_positive"),
        CheckConstraint("stock_quantity >= 0", name="ck_products_stock_nonnegative"),
        Index("ix_products_seller_id", "seller_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    pack_size: Mapped[str] = mapped_column(String(100), nullable=False)
    stock_quantity: Mapped[int] = mapped_column(nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(2048))
    origin: Mapped[str] = mapped_column(String(100), nullable=False)
    ingredients: Mapped[str | None] = mapped_column(Text)
    allergens: Mapped[str | None] = mapped_column(Text)
    packaging: Mapped[str | None] = mapped_column(Text)
    shelf_life: Mapped[str | None] = mapped_column(String(100))
    storage_instructions: Mapped[str | None] = mapped_column(Text)
