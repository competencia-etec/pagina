
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from starlette.status import HTTP_406_NOT_ACCEPTABLE

from backend.models.user import User
from backend.models.wordle import GuessResponse, InitResponse, PlayerGuess
from backend.services.games.wordle.wordle import GameData
from backend.services.games.wordle.wordle_exeptions import InvalidUUID, InvalidWord
from backend.services.games.wordle.wordle_session_system import WordleSessionSystem
from backend.services.user_service import get_current_active_user


router = APIRouter()


def add_endpoints(router):
    @router.get("/wordle/start/", tags=["wordle"])
    async def wordle_start_game(
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> InitResponse:
        """Create wordle session"""

        sd = WordleSessionSystem()

        session = sd.new_session(current_user.email)

        if session is None:
            raise HTTPException(status_code=501, detail="Internal Error")

        sd.debug_print_sessions()

        return InitResponse(session_uuid=str(session.uuid),
                            word_length=len(session.game_data.answer),
                            max_attempts=session.game_data.guesses)

    @router.post("/wordle/guess/", tags=["wordle"])
    async def wordle_guess_game(
        player_guess: PlayerGuess,
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> GuessResponse:
        """Create wordle session"""

        ss = WordleSessionSystem()

        try:
            gd: GameData = ss.get_session(player_guess.session_uuid)

            gd = ss.validate_word(
                player_guess.session_uuid, player_guess.guess)

        except InvalidUUID as e:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                f"Invalid UUID  {e.session_uuid}")
        except InvalidWord as e:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                detail=f"Invalid guess {e.guess}")

        gs = GuessResponse(game_status='won' if gd.player_won else 'lost' if gd.guesses == 0 else 'in_progress',
                           partial_word=gd.partial,
                           hints=list(gd.contains),
                           attempts_remaining=gd.guesses,
                           )

        return gs
