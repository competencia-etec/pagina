from backend.models.user import User
from typing import Annotated
from fastapi import Depends

from backend.services.user_service import get_current_active_user


def add_endpoints(app):
    @app.get("/users/me/")
    async def read_users_me(
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> User:
        return current_user
