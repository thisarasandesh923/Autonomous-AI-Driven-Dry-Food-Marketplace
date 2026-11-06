from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.product import ProductRead


class SellerAccount(BaseModel):
    id: int
    name: str
    email: str
    role: Literal["seller"]


class SellerDashboardSummary(BaseModel):
    total_products: int = Field(ge=0)
    available_packs: int = Field(ge=0)
    # These metrics have no authoritative data source in the current schema.
    approved_products: None = None
    revenue_minor: None = None
    open_suborders: None = None
    low_stock: None = None
    forecast_error: None = None


class SellerDashboardRead(BaseModel):
    message: str
    user: SellerAccount
    snapshot_at: datetime
    is_demo: Literal[False] = False
    profile: None = None
    summary: SellerDashboardSummary
    inventory: list[ProductRead]
    orders: None = None
    forecast: None = None
    unavailable: dict[str, str]
