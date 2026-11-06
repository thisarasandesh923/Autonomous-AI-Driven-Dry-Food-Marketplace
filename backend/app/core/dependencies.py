
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.database import engine
from app.models.user import User
from app.core.security import verify_access_token


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)
):
    error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication token",
        headers={"WWW-Authenticate": "Bearer"}
    )

    # Check whether token exists
    if credentials is None:
        raise error

    # Verify JWT token
    user_id = verify_access_token(credentials.credentials)

    if user_id is None:
        raise error

    # Find user in PostgreSQL
    with Session(engine) as session:
        user = session.get(User, user_id)

        if user is None:
            raise error

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }

#role base

def require_role(required_role: str):

    def role_checker(
        current_user: dict = Depends(get_current_user)
    ):

        if current_user["role"] != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )

        return current_user

    return role_checker
