
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session


from app.db.database import engine
from app.models.user import User
from app.schemas.user import UserRegister
from app.core.security import hash_password



router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(data: UserRegister):

    email = str(data.email).lower()

    with Session(engine) as session:

        # Check whether the email already exists
        existing_user = session.scalar(
            select(User).where(User.email == email)
        )

        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="Email already registered"
            )

        # Create new user
        new_user = User(
            name=data.name.strip(),
            email=email,
            hashed_password=hash_password(data.password),
            role=data.role
        )

        session.add(new_user)

        try:
            session.commit()
            session.refresh(new_user)
        except IntegrityError:
            session.rollback()
            raise HTTPException(
                status_code=409,
                detail="Registration conflict"
            )

        return {
            "message": "User registered successfully",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email,
                "role": new_user.role
            }
        }
