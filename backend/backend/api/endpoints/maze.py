from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from starlette.status import HTTP_406_NOT_ACCEPTABLE

from backend.models.maze import InitResponse, MoveResponse, PlayerMove, SessionResponse
from backend.models.user import User
from backend.services.games.maze.maze_exceptions import InvalidMove, InvalidSession
from backend.services.games.maze.maze_session_system import MazeSessionSystem
from backend.services.user_service import get_current_active_user


router = APIRouter()


def add_endpoints(router):
    @router.get("/maze/start/", tags=["maze"])
    async def maze_start_game(
        current_user: Annotated[User, Depends(get_current_active_user)],
        difficulty: int = 1,
    ) -> InitResponse:
        """Create maze session"""

        ms = MazeSessionSystem()

        session = ms.new_session(current_user.email, difficulty=difficulty)

        if session is None:
            raise HTTPException(status_code=501, detail="Internal Error")

        turn_status = session.game_data.get_turn_status()

        return InitResponse(session_email=current_user.email,
                            turn_status=turn_status)

    @router.post("/maze/move/", tags=["maze"])
    async def maze_move_game(
        player_move: PlayerMove,
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> MoveResponse:
        """Execute move direction in maze game (1: Up, 2: Right, 3: Down, 4: Left)"""

        ms = MazeSessionSystem()

        try:
            session = ms.get_session(current_user.email)
            move_valid = session.game_data.movePlayer(player_move.direction)
            gd = session.game_data

        except InvalidSession as e:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                detail=f"Invalid session for: {e.session_email}")
        except InvalidMove as e:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                detail=f"Invalid move: {e.message}")

        game_status = 'won' if gd.playerWon else 'in_progress'
        turn_status = gd.get_turn_status()

        if gd.playerWon:
            ms.finish_session(current_user.email)

        return MoveResponse(game_status=game_status,
                            turn_status=turn_status,
                            move_valid=move_valid)

    @router.get("/maze/get_game/", tags=["maze"])
    async def maze_get_game(
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> SessionResponse:
        """Retrieves a maze session"""

        ms = MazeSessionSystem()

        try:
            session = ms.get_session(current_user.email)
        except InvalidSession as e:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                detail=f"Invalid session for: {e.session_email}")

        gd = session.game_data
        game_status = 'won' if gd.playerWon else 'in_progress'
        turn_status = gd.get_turn_status()

        return SessionResponse(session_email=current_user.email,
                               game_status=game_status,
                               turn_status=turn_status,
                               player_x=gd.playerX,
                               player_y=gd.playerY)
