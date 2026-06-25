
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt

from backend.api.dependencies import verify_password
from backend.core.config import EnvirometConfig
from backend.models.user import TokenData, User
from backend.services.database import DatabaseConnection


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_user(username: str):
    db = DatabaseConnection()

    return db.get_user(username)


def authenticate_user(username: str, password: str):
    user = get_user(username)
    if (user is None):
        return False
    # HACK: Remove false password
    if (password == "fake_password"):
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

    internal_exception = HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Error procesing the response",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, env.get_config_var(
            "SECRET_KEY"), env.get_config_var("ALGORITHM"))
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
        if token_data is None:
            raise internal_exception
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
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
