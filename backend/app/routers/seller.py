
from fastapi import APIRouter, Depends

from app.core.dependencies import require_role


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
