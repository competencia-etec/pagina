from dataclasses import dataclass

from fastapi import HTTPException
from starlette.status import HTTP_406_NOT_ACCEPTABLE

from backend.services.games.maze.maze import MazeGameData, startGame
from backend.services.games.maze.maze_exceptions import GameCreationError, InvalidMove, InvalidSession


@dataclass
class SessionEntry:
    game_data: MazeGameData


class MazeSessionSystem:
    _instance = None
    _sessions: dict[str, SessionEntry]

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._sessions = {}
        return cls._instance

    def new_session(self, user_email: str, difficulty: int = 1, seed: int | None = None) -> SessionEntry:
        """Creates new maze game session, may raise GameCreationError"""

        assert self._instance

        new_game_data = startGame(difficulty=difficulty, seed=seed)

        if new_game_data is None:
            raise GameCreationError("Failed to initialize a new Maze game.")

        if self._sessions.get(user_email) is not None:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                detail="Session already created for this user")
        
        session_entry = SessionEntry(game_data=new_game_data)
        self._sessions[user_email] = session_entry

        return session_entry

    def finish_session(self, user_email: str) -> None:
        """Terminates the maze session"""

        assert self._instance

        self._sessions.pop(user_email, None)

    def get_session(self, user_email: str) -> SessionEntry:
        """Returns Game data for the provided user email, may raise InvalidSession"""

        assert self._instance

        se = self._sessions.get(user_email)

        if se is None:
            raise InvalidSession(user_email)

        return se

    def make_move(self, session_email: str, direction: int) -> MazeGameData:
        """Validates user's move direction, returns updated game data"""

        assert self._instance

        if direction not in (1, 2, 3, 4):
            raise InvalidMove(f"Invalid direction {direction}. Must be 1 (Up), 2 (Right), 3 (Down), or 4 (Left).")

        session = self.get_session(session_email)
        session.game_data.movePlayer(direction)

        return session.game_data

    def clear(self) -> None:
        """Clears all sessions"""

        assert self._instance
        self._sessions.clear()
