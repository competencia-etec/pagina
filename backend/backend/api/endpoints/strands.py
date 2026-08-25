from typing import Annotated, List, Tuple

from fastapi import APIRouter, Depends, HTTPException
from starlette.status import HTTP_406_NOT_ACCEPTABLE

from backend.models.strands import AttemptResponse, InitResponse, PlayerAttempt, SessionResponse
from backend.models.user import User
from backend.services.games.strands.strands import attempt as service_strands_attempt, get_hint as service_strands_get_hint
from backend.services.games.strands.strands_exceptions import InvalidSession
from backend.services.games.strands.strands_session_system import StrandsSessionSystem
from backend.services.user_service import get_current_active_user


router = APIRouter()


def add_endpoints(router):
    @router.get("/strands/start/", tags=["strands"])
    async def strands_start_game(
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> InitResponse:
        """Create strands session"""

        ss = StrandsSessionSystem()

        session = ss.new_session(current_user.email)

        if session is None:
            raise HTTPException(status_code=501, detail="Internal Error")

        gd = session.game_data
        spangram = gd.words[gd.spangram_idx] if (
            gd.words and 0 <= gd.spangram_idx < len(gd.words)) else ""
        theme = getattr(gd, 'theme', 'UN DÍA ESPECIAL')
        game_status = 'won' if (gd.words and len(
            gd.revealed) == len(gd.words)) else 'in_progress'

        return InitResponse(
            session_email=current_user.email,
            grid=gd.grid,
            theme=theme,
            spangram=spangram,
            total_words=len(gd.words),
            found_words=list(gd.revealed),
            bonus_words_count=gd.bonus_words_count,
            hint_counter=gd.hint_counter,
            game_status=game_status,
        )

    @router.post("/strands/attempt/", tags=["strands"])
    async def strands_attempt_game(
        player_attempt: PlayerAttempt,
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> AttemptResponse:
        """Execute word attempt in strands game"""

        ss = StrandsSessionSystem()

        try:
            session = ss.get_session(current_user.email)

            coords: List[Tuple[int, int]] = [
                (c[0], c[1]) for c in player_attempt.coords
            ]

            gd = session.game_data

            res = service_strands_attempt(gd, coords)

            found_paths = getattr(gd, 'found_paths', None)

            if found_paths is not None and res["valid"] and res.get("is_game_word"):
                if coords not in found_paths:
                    found_paths.append(coords)

        except InvalidSession as e:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                detail=f"Invalid session for: {e.session_email}")

        spangram = gd.words[gd.spangram_idx] if (
            gd.words and 0 <= gd.spangram_idx < len(gd.words)) else ""

        is_spangram = res.get("is_game_word", False) and (
            res.get("word") == spangram)

        game_status = 'won' if (gd.words and len(
            gd.revealed) == len(gd.words)) else 'in_progress'

        return AttemptResponse(
            valid=res["valid"],
            word=res.get("word"),
            is_game_word=res.get("is_game_word", False),
            is_bonus=res.get("is_bonus", False),
            is_spangram=is_spangram,
            hint=None,
            game_status=game_status,
            found_words=list(gd.revealed),
            bonus_words_count=gd.bonus_words_count,
            hint_counter=gd.hint_counter,
        )

    @router.get("/strands/get_game/", tags=["strands"])
    async def strands_get_game(
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> SessionResponse:
        """Retrieves a strands session"""

        ss = StrandsSessionSystem()

        try:
            session = ss.get_session(current_user.email)
        except InvalidSession as e:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                detail=f"Invalid session for: {e.session_email}")

        gd = session.game_data
        spangram = gd.words[gd.spangram_idx] if (
            gd.words and 0 <= gd.spangram_idx < len(gd.words)) else ""
        theme = getattr(gd, 'theme', 'UN DÍA ESPECIAL')
        found_paths = getattr(gd, 'found_paths', [])
        game_status = 'won' if (gd.words and len(
            gd.revealed) == len(gd.words)) else 'in_progress'

        return SessionResponse(
            session_email=current_user.email,
            grid=gd.grid,
            theme=theme,
            spangram=spangram,
            game_status=game_status,
            found_words=list(gd.revealed),
            total_words=len(gd.words),
            bonus_words_count=gd.bonus_words_count,
            hint_counter=gd.hint_counter,
            found_paths=found_paths,
        )

    @router.get("/strands/hint/", tags=["strands"])
    async def strands_get_hint(
        current_user: Annotated[User, Depends(get_current_active_user)],
    ):
        """Retrieves hint coordinates if hint points threshold reached"""

        ss = StrandsSessionSystem()

        try:
            session = ss.get_session(current_user.email)
        except InvalidSession as e:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                detail=f"Invalid session for: {e.session_email}")

        gd = session.game_data
        hint_coords = service_strands_get_hint(gd)
        if hint_coords is None:
            raise HTTPException(
                status_code=400, detail="Not enough bonus words for hint or all words found")

        return {"hint": hint_coords, "hint_counter": gd.hint_counter}
