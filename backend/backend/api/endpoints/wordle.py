from typing import Annotated
from fastapi import Depends, APIRouter

from backend.models import wordle
from backend.models.user import User
from backend.models.wordle import WordleInitResponse
from backend.services.user_service import get_current_active_user


router = APIRouter()


def add_endpoints(router):
    @router.get("/users/me/", tags=["wordle"])
    async def wordle_start_game(
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> WordleInitResponse:
        """Create wordle session"""
        return current_user
