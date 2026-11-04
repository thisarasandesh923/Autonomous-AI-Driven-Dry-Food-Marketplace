
from fastapi import APIRouter, Depends

from app.core.dependencies import require_role


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
