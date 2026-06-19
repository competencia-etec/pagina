from backend.api.dependencies import get_current_active_user
from backend.models.user import User
from typing import Annotated
from fastapi import Depends


def add_endpoints(app):
    @app.get("/users/me/")
    async def read_users_me(
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> User:
        return current_user
