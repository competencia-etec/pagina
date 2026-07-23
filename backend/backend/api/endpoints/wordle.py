
from fastapi import APIRouter, HTTPException

from backend.models.wordle import WordleInitResponse
from backend.services.games.wordle.wordle_session_system import WordleSessionSystem


router = APIRouter()


def add_endpoints(router):
    @router.get("/wordle/start/", tags=["wordle"])
    async def wordle_start_game(
        # HACK: removing authentication user for debug
        # current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> WordleInitResponse:
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
