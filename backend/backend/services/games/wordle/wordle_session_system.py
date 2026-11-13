from dataclasses import dataclass

from fastapi import HTTPException
from starlette.status import HTTP_406_NOT_ACCEPTABLE

from backend.services.games.wordle.wordle import WordleGameData, checkGuess, isValidGuess, startGame
from backend.services.games.wordle.wordle_exeptions import GameCreationError, InvalidSession, InvalidWord


@dataclass
class SessionEntry:
    game_data: WordleGameData


class WordleSessionSystem:
    _instance = None
    _sessions: dict[str, SessionEntry]
    _play_counts: dict[str, int]

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._sessions = {}
            cls._play_counts = {}
        return cls._instance

    def new_session(self, user_email: str) -> SessionEntry:
        """Creates new wordle game session, may raise GameCreationError"""

        assert (self._instance)

        if self._sessions.get(user_email) is not None:
            raise HTTPException(HTTP_406_NOT_ACCEPTABLE,
                                detail="Session already created for this user")

        offset = self._play_counts.get(user_email, 0)
        new_game_data = startGame(offset=offset)

        if new_game_data is None:
            raise GameCreationError("Failed to initialize a new Wordle game.")

        self._sessions[user_email] = SessionEntry(new_game_data)
        self._play_counts[user_email] = offset + 1

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

    def validate_word(self, session_email: str, guess: str) -> WordleGameData:
        """Validated user's guess, may raise InvalidSession or Invalid Word"""

        assert (self._instance)

        if not isValidGuess(guess):
            raise InvalidWord(f"'{guess}' is not in the valid word list.")

        gd = self.get_session(session_email)

        if gd is None:
            raise InvalidSession(
                f"No active session found for user: {session_email}")

        gd = checkGuess(gd.game_data, guess)

        gd.prevGuesses.append(guess)

        return gd

    def clear(self) -> None:
        """Clears all sessions"""

        assert (self._instance)
        self._sessions.clear()
        self._play_counts.clear()

    def debug_print_sessions(self) -> None:
        """DEBUG, prints all sessions"""

        assert (self._instance)
        for key, value in self._sessions.items():
            print(f"Email: {str(key)} \t {value}\n Prev Guesses:\n")
            for val in value.game_data.prevGuesses:
                print(val)
