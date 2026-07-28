import uuid
from dataclasses import dataclass
from typing import Optional

from backend.services.games.wordle.wordle import GameData, check_guess, is_valid_guess, start_game
from backend.services.games.wordle.wordle_exeptions import GameCreationError, InvalidUUID, InvalidWord


@dataclass
class SessionEntry:
    game_data: GameData
    user_email: str


@dataclass
class SessionData:
    game_data: GameData
    uuid: uuid.UUID
    user_email: str


class WordleSessionSystem:
    _instance = None
    _sessions: dict[uuid.UUID, SessionEntry]

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._sessions = {}
        return cls._instance

    def new_session(self, user_email: str) -> SessionData:
        """Creates new wordle game session, may raise GameCreationError"""

        assert (self._instance)
        new_uuid = uuid.uuid4()
        new_game_data = start_game()

        if new_game_data is None:
            raise GameCreationError("Failed to initialize a new Wordle game.")

        self._sessions[new_uuid] = SessionEntry(new_game_data, user_email)

        return SessionData(
            uuid=new_uuid,
            game_data=new_game_data,
            user_email=user_email
        )

    def finish_session(self, session_uuid: uuid.UUID) -> None:
        """Terminates the wordle session"""

        assert (self._instance)
        self._sessions.pop(session_uuid, None)

    def get_session(self, session_uuid: str) -> GameData:
        """Returns Game data for the provided session_uuid, may raise InvalidUUID"""

        assert (self._instance)

        se = self._sessions.get(uuid.UUID(session_uuid))

        if se is None:
            raise InvalidUUID(session_uuid)

        return se.game_data

    def validate_word(self, session_uuid: str, guess: str) -> GameData:
        """Validated user's guess, may raise InvalidUUID or Invalid Word"""

        assert (self._instance)

        if not is_valid_guess(guess):
            raise InvalidWord(f"'{guess}' is not in the valid word list.")

        gd = self.get_session(session_uuid)

        if gd is None:
            raise InvalidUUID(
                f"No active session found for UUID: {session_uuid}")

        gd = check_guess(gd, guess)

        gd.prev_guesses.append(guess)

        return gd

    def clear(self) -> None:
        """Clears all sessions"""

        assert (self._instance)
        self._sessions.clear()

    def is_users_session(self, session_uuid: str, user_email: str) -> bool:
        se = self._sessions.get(uuid.UUID(session_uuid))
        if se is None:
            raise InvalidUUID(session_uuid)

        return se.user_email == user_email

    def debug_print_sessions(self) -> None:
        """DEBUG, prints all sessions"""

        assert (self._instance)
        for key, value in self._sessions.items():
            print(f"UUID: {str(key)} \t {value}\n Prev Guesses:\n")
            for val in value.game_data.prev_guesses:
                print(val)
