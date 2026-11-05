
from fastapi import APIRouter, Depends, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.database import engine
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductRead


router = APIRouter(
    prefix="/seller",
    tags=["Seller"]
)


@router.get("/dashboard")
def seller_dashboard(
    current_user: dict = Depends(require_role("seller"))
):
    return {
        "message": "Welcome to Seller Dashboard!",
        "user": current_user
    }


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
