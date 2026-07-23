from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.engine import create
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR

from backend.core import logger
from backend.core.config import EnviromentConfig
from backend.models.user import CreateUser, TokenData, User
from backend.services.database import DatabaseConnection


db = DatabaseConnection()


def get_user_by_username(username: str):
    try:
        return db.get_user_by_username(username)
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database service unavailable: {e}"
        )


def get_user_by_email(email: str):
    try:
        return db.get_user_by_email(email)
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database service unavailable: {e}"
        )


# FIX: Hey buddy, authentication token shouldn't be on http urls
async def get_current_user(token: str):
    env = EnviromentConfig()
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            env.get_config_var("SECRET_KEY"),
            algorithms=[env.get_config_var("ALGORITHM")]
        )
        email = payload.get("sub")
        if email is None:
            raise HTTPException(HTTP_500_INTERNAL_SERVER_ERROR,
                                "Error getting current user")
        token_data = TokenData(email=email)
    except jwt.InvalidTokenError:
        raise credentials_exception

    user = get_user_by_email(token_data.email)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user


async def create_user(creating_user: CreateUser) -> User:
    return await create_oauth_user(creating_user)


async def create_oauth_user(creating_user: CreateUser) -> User:
    """Creates user with oauth, must not specify password"""

    try:
        db.add_user(
            username=creating_user.username,
            full_name=creating_user.full_name,
            email=creating_user.email,
            disabled=creating_user.disabled,
        )

    except IntegrityError as e:
        logger.logger.error(f"Integrity error (Duplicate User/Email): {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User or email already exists",
        )
    except SQLAlchemyError as e:
        logger.logger.error(f"SQL ERROR: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing the response",
        )

    return User(
        **creating_user.model_dump(),
    )
