
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from starlette.status import HTTP_406_NOT_ACCEPTABLE

from backend.models.user import User
from backend.models.wordle import GuessResponse, InitResponse, PlayerGuess, SessionResponse
from backend.services.games.wordle.wordle import WordleGameData
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
            gd: WordleGameData = ss.get_session(current_user.email).game_data

            gd = ss.validate_word(current_user.email, player_guess.guess)

        except InvalidSession as e:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                f"Invalid session for: {e.session_email}")
        except InvalidWord as e:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                detail=f"Invalid guess {e.guess}")

        gs = GuessResponse(game_status='won' if gd.playerWon else 'lost' if gd.guesses == 0 else 'in_progress',
                           partial_word=gd.partial,
                           hints=list(gd.contains),
                           attempts_remaining=gd.guesses,
                           prev_attempts=gd.prevGuesses)

        if gd.playerWon:
            ss.finish_session(current_user.email)

        return gs

    @router.get("/wordle/get_game/", tags=["wordle"])
    async def wordle_get_game(
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> SessionResponse:
        """Retrieves a wordle session"""

        ss = WordleSessionSystem()

        try:
            se = ss.get_session(current_user.email)
        except InvalidSession as e:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                detail=f"Invalid session for: {e.session_email}")

        return SessionResponse(hints=list(se.game_data.contains),
                               partial_word=se.game_data.partial,
                               attempts_remaining=se.game_data.guesses,
                               prev_attempts=se.game_data.prevGuesses)
