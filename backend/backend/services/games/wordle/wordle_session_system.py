from dataclasses import dataclass

from fastapi import HTTPException
from starlette.status import HTTP_406_NOT_ACCEPTABLE

from backend.services.games.wordle.wordle import GameData, check_guess, is_valid_guess, start_game
from backend.services.games.wordle.wordle_exeptions import GameCreationError, InvalidSession, InvalidWord


@dataclass
class SessionEntry:
    game_data: GameData


class WordleSessionSystem:
    _instance = None
    _sessions: dict[str, SessionEntry]

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._sessions = {}
        return cls._instance

    def new_session(self, user_email: str) -> SessionEntry:
        """Creates new wordle game session, may raise GameCreationError"""

        assert (self._instance)

        new_game_data = start_game()

        if new_game_data is None:
            raise GameCreationError("Failed to initialize a new Wordle game.")

        if self._sessions.get(user_email) is not None:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                detail="Session already created for this user")
        self._sessions[user_email] = SessionEntry(new_game_data)

        return SessionEntry(
            game_data=new_game_data,
        )

    def finish_session(self, user_email: str) -> None:
        """Terminates the wordle session"""

        assert (self._instance)

        self._sessions.pop(user_email, None)

    def get_session(self, user_email: str) -> SessionEntry:
        """Returns Game data for the provided user email, may raise InvalidSession"""

        assert (self._instance)

        se = self._sessions.get(user_email)

        if se is None:
            raise InvalidSession(user_email)

        return se

    def validate_word(self, session_email: str, guess: str) -> GameData:
        """Validated user's guess, may raise InvalidSession or Invalid Word"""

        assert (self._instance)

        if not is_valid_guess(guess):
            raise InvalidWord(f"'{guess}' is not in the valid word list.")

        gd = self.get_session(session_email)

        if gd is None:
            raise InvalidSession(
                f"No active session found for user: {session_email}")

        gd = check_guess(gd.game_data, guess)

        gd.prev_guesses.append(guess)

        return gd

    def clear(self) -> None:
        """Clears all sessions"""

        assert (self._instance)
        self._sessions.clear()

    def debug_print_sessions(self) -> None:
        """DEBUG, prints all sessions"""

        assert (self._instance)
        for key, value in self._sessions.items():
            print(f"Email: {str(key)} \t {value}\n Prev Guesses:\n")
            for val in value.game_data.prev_guesses:
                print(val)
