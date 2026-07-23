
from fastapi import APIRouter, HTTPException

from backend.models.wordle import GuessResponse, InitResponse, PlayerGuess
from backend.services.games.wordle.wordle import check_guess
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

        return WordleInitResponse(session_id=str(session.uuid),
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

        return GuessResponse
