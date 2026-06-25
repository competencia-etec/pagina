from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from backend.api.dependencies import hash_password, verify_password
from backend.core import logger
from backend.core.config import EnvirometConfig
from backend.models.user import CreateUser, TokenData, User
from backend.services.database import DatabaseConnection

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

db = DatabaseConnection()


def get_user(username: str):
    try:
        return db.get_user(username)
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database service unavailable"
        )


def authenticate_user(username: str, password: str):
    user = get_user(username)
    if user is None:
        return False

    # HACK: Remove false password
    if password == "fake_password":
        return user

    if not verify_password(password, user.hashed_password):
        return False
    return user


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    env = EnvirometConfig()
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
        username: str = payload.get("sub")
        token_data = TokenData(username=username)
    except jwt.InvalidTokenError:
        raise credentials_exception

    user = get_user(token_data.username)
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
    hashed_password = hash_password(creating_user.unhashed_password)

    try:
        db.add_user(
            username=creating_user.username,
            full_name=creating_user.full_name,
            email=creating_user.email,
            hashed_password=hashed_password,
            disabled=creating_user.disabled
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
        **creating_user.model_dump(exclude={"unhashed_password"}),
        hashed_password=hashed_password
    )
