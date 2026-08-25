from dataclasses import dataclass
from typing import Optional, List, Tuple
from fastapi import HTTPException
from starlette.status import HTTP_406_NOT_ACCEPTABLE

from backend.services.games.strands.strands import StrandsGame
from backend.services.games.strands.strands_exceptions import GameCreationError, InvalidSession


@dataclass
class SessionEntry:
    game_data: StrandsGame


class StrandsSessionSystem:
    _instance = None
    _sessions: dict[str, SessionEntry]

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._sessions = {}
        return cls._instance

    def new_session(self, user_email: str) -> SessionEntry:
        """Creates new strands game session, may raise GameCreationError"""
        assert self._instance

        try:
            game_data = StrandsGame()
        except Exception as e:
            raise GameCreationError(f"Failed to initialize a new Strands game: {e}")

        if self._sessions.get(user_email) is not None:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                detail="Session already created for this user")

        session_entry = SessionEntry(game_data=game_data)
        self._sessions[user_email] = session_entry

        return session_entry

    def finish_session(self, user_email: str) -> None:
        """Terminates the strands session"""
        assert self._instance

        self._sessions.pop(user_email, None)

    def get_session(self, user_email: str) -> SessionEntry:
        """Returns Game data for the provided user email, may raise InvalidSession"""
        assert self._instance

        se = self._sessions.get(user_email)

        if se is None:
            raise InvalidSession(user_email)

        return se

    def make_attempt(self, session_email: str, coords: List[Tuple[int, int]]) -> dict:
        """Executes player word attempt, returns attempt response dictionary"""
        assert self._instance

        session = self.get_session(session_email)
        return session.game_data.attempt(coords)

    def clear(self) -> None:
        """Clears all sessions"""
        assert self._instance
        self._sessions.clear()
