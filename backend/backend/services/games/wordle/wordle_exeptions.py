import uuid


class WordleSessionError(Exception):
    """Base exception for all Wordle session errors."""
    pass


class InvalidSession(WordleSessionError):
    """Raised when a requested session does not exist."""

    def __init__(self, session_email: str, message: str | None = None):
        self.session_email = session_email
        self.message = message or f"No active session found for user: {
            session_email}"
        super().__init__(self.message)


class InvalidWord(WordleSessionError):
    """Raised when a guess is not a valid Wordle word."""

    def __init__(self, guess: str, message: str | None = None):
        self.guess = guess
        self.message = message or f"'{guess}' is not in the valid word list."
        super().__init__(self.message)


class GameCreationError(WordleSessionError):
    """Raised when the game engine fails to generate a new game."""
    pass
