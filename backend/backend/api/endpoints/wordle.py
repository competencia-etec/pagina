
from fastapi import APIRouter, HTTPException, status
from starlette.status import HTTP_406_NOT_ACCEPTABLE

from backend.models.wordle import GuessResponse, InitResponse, PlayerGuess
from backend.services.games.wordle.wordle import GameData
from backend.services.games.wordle.wordle_exeptions import InvalidUUID, InvalidWord
from backend.services.games.wordle.wordle_session_system import WordleSessionSystem


router = APIRouter()


def add_endpoints(router):
    @router.get("/wordle/start/", tags=["wordle"])
    async def wordle_start_game(
        # HACK: removing authentication user for debug
        # current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> InitResponse:
        """Create wordle session"""

        sd = WordleSessionSystem()

        # session_id = sd.new_session(current_user.email)
        session = sd.new_session("fakeemail@fakehost.com")
        if session is None:
            raise HTTPException(status_code=501, detail="Internal Error")

        sd.debug_print_sessions()

        return InitResponse(session_id=session.uuid,
                            word_length=len(session.game_data.answer),
                            max_attempts=session.game_data.guesses)

    @router.post("/wordle/guess/", tags=["wordle"])
    async def wordle_guess_game(
        player_guess: PlayerGuess,
        # HACK: removing authentication user for debug
        # current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> GuessResponse:
        """Create wordle session"""

        ss = WordleSessionSystem()

        try:
            gd: GameData = ss.get_session(player_guess.session_id)

            gd = ss.validate_word(
                player_guess.session_id, player_guess.guess)

        except InvalidUUID as e:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                f"Invalid UUID  {e.session_uuid}")
        except InvalidWord as e:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                detail=f"Invalid guess {e.guess}")

        gs = GuessResponse(game_status='won' if gd.player_won else 'lost' if gd.guesses == 0 else 'in_progress',
                           partial_word=gd.partial,
                           hints=gd.contains.split(''),
                           attempts_remaining=gd.guesses,
                           )

        return gs
