
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.database import engine
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductRead
from app.schemas.seller import SellerDashboardRead, SellerDashboardSummary


router = APIRouter(
    prefix="/seller",
    tags=["Seller"]
)


@router.get("/dashboard", response_model=SellerDashboardRead)
def seller_dashboard(
    current_user: dict = Depends(require_role("seller"))
):
    # Ownership comes exclusively from the verified account, never query input.
    # Derive totals from the same rows so inventory and counts share a snapshot.
    with Session(engine) as session:
        products = session.scalars(
            select(Product)
            .where(Product.seller_id == current_user["id"])
            .order_by(Product.id)
        ).all()
        return SellerDashboardRead(
            message="Welcome to Seller Dashboard!",
            user=current_user,
            snapshot_at=datetime.now(timezone.utc),
            summary=SellerDashboardSummary(
                total_products=len(products),
                available_packs=sum(product.stock_quantity for product in products),
            ),
            inventory=[ProductRead.model_validate(product) for product in products],
            unavailable={
                "profile": "Business profiles are not configured.",
                "approvals": "Product approval status is not recorded.",
                "currency": "Product currency is not configured.",
                "low_stock": "Restock thresholds are not configured.",
                "orders": "Order reporting is not connected.",
                "revenue": "Revenue reporting is not connected.",
                "forecast": "A forecasting data source has not been connected.",
            },
        )


@router.post("/products", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate,
    current_user: dict = Depends(require_role("seller"))
):
    values = data.model_dump()
    if values["image_url"] is not None:
        values["image_url"] = str(values["image_url"])

    product = Product(**values, seller_id=current_user["id"])
    with Session(engine) as session:
        session.add(product)
        try:
            session.commit()
        except SQLAlchemyError:
            session.rollback()
            raise

        session.refresh(product)
        return product
