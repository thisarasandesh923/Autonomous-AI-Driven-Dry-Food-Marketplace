
from fastapi import FastAPI
from sqlalchemy import text

from app.db.database import engine
from app.routers.auth import router as auth_router
from app.routers.seller import router as seller_router
from app.routers.buyer import router as buyer_router

# Create FastAPI application
app = FastAPI(
    title="DryLeaf API",
    description="Autonomous AI-Driven Dry Food Marketplace Backend",
    version="1.0.0"
)


# Register API Routers
app.include_router(auth_router)
app.include_router(seller_router)
app.include_router(buyer_router)

# Home Endpoint
@app.get("/")
def home():
    return {
        "message": "DryLeaf Backend is running!"
    }


# Database Connection Test
@app.get("/db-check")
def check_database():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT current_database()")
        )

        return {
            "status": "connected",
            "database": result.scalar()
        }
