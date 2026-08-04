
from typing import Annotated

from fastapi import APIRouter, Depends

from backend.models.user import User
from backend.services.user_service import get_current_active_user


router = APIRouter()


def add_endpoints(router):
    @router.get("/maze/start/", tags=["maze"])
    async def wordle_start_game(
        current_user: Annotated[User, Depends(get_current_active_user)],
    ):
        pass

    @router.post("/maze/move/", tags=["maze"])
    async def wordle_guess_game(
        current_user: Annotated[User, Depends(get_current_active_user)],
    ):
        pass
