
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_406_NOT_ACCEPTABLE

from backend.models.user import User
from backend.models.wordle import GuessResponse, InitResponse, PlayerGuess
from backend.services.games.wordle.wordle import GameData
from backend.services.games.wordle.wordle_exeptions import InvalidSession, InvalidWord
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

        return InitResponse(session_email=current_user.email,
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
            gd: GameData = ss.get_session(current_user.email)

            gd = ss.validate_word(current_user.email, player_guess.guess)

        except InvalidSession as e:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                f"Invalid session for: {e.session_email}")
        except InvalidWord as e:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                detail=f"Invalid guess {e.guess}")

        gs = GuessResponse(game_status='won' if gd.player_won else 'lost' if gd.guesses == 0 else 'in_progress',
                           partial_word=gd.partial,
                           hints=list(gd.contains),
                           attempts_remaining=gd.guesses,
                           prev_attempts=gd.prev_guesses
                           )

        return gs
