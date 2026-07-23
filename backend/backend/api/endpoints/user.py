from typing import Annotated
from fastapi import Depends, APIRouter

from backend.models.user import CreateUser, User
from backend.services.user_service import get_current_active_user, create_user as service_create_user

router = APIRouter()


def add_endpoints(router):
    @router.get("/users/me/", tags=["user"])
    async def read_users_me(
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> User:
        """Validate current logging user"""
        return current_user
