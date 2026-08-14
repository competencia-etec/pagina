
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from starlette.status import HTTP_406_NOT_ACCEPTABLE

from backend.models.strands import AttemptResponse, PlayerAttempt
from backend.models.user import User
from backend.services.user_service import get_current_active_user


router = APIRouter()


def add_endpoints(router):
    @router.get("/strands/start/", tags=["strands"])
    async def wordle_start_game(
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> None:
        pass

    @router.post("/strands/attempt/", tags=["strands"])
    async def wordle_guess_game(
        player_guess: PlayerAttempt,
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> AttemptResponse:
        pass

    @router.get("/wordle/get_game/", tags=["strands"])
    async def wordle_get_game(
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> None:
        pass
