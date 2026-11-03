
from fastapi import FastAPI
from sqlalchemy import text

from app.db.database import engine
from app.routers.auth import router as auth_router

app = FastAPI(title="DryLeaf API")

# Connect authentication router
app.include_router(auth_router)


@app.get("/")
def home():
    return {"message": "DryLeaf Backend is running!"}


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
