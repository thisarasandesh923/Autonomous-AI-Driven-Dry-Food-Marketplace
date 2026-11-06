
from fastapi import APIRouter, HTTPException, status, Depends
from app.core.dependencies import get_current_user
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session


from app.db.database import engine
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)


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


@router.post("/login")
def login_user(data: UserLogin):

    email = str(data.email).lower()

    with Session(engine) as session:

        # Find user by email
        user = session.scalar(
            select(User).where(User.email == email)
        )

        # Check email and password
        if not user or not verify_password(
            data.password, user.hashed_password
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"}
            )

        # Generate JWT token
        access_token = create_access_token(user.id)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }

#user_protect

@router.get("/me")
def get_my_profile(
    current_user: dict = Depends(get_current_user)
):
    return current_user
