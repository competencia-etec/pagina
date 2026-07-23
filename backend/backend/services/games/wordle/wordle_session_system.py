from dataclasses import dataclass

from backend.services.games.wordle.wordle import GameData, start_game
import uuid


@dataclass
class SessionData:
    game_data: GameData
    uuid: uuid.UUID
    user_email: str


class WordleSessionSystem:
    _instance = None
    _sessions: dict[uuid.UUID, GameData]

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._sessions = {}
        return cls._instance

    def new_session(self, user_email: str) -> SessionData | None:
        new_uuid = uuid.uuid4()
        new_game_data = start_game()

        if new_game_data is None:
            return None

        self._sessions[new_uuid] = new_game_data

        return SessionData(uuid=new_uuid,
                           game_data=new_game_data,
                           user_email=user_email)

    def finish_session(self, session_uuid: uuid.UUID) -> None:
        self._sessions.pop(session_uuid, None)

    def get_session(self, session_uuid: uuid.UUID) -> GameData | None:
        if self._instance is None:
            return None
        return self._sessions[session_uuid]

    def clear(self):
        self._sessions.clear()

    def debug_print_sessions(self):
        for key, value in self._sessions.items():
            print(f"UUID: {str(key)} \t {value}")
