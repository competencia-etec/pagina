import uuid


class WordleSessionError(Exception):
    """Base exception for all Wordle session errors."""
    pass


class InvalidUUID(WordleSessionError):
    """Raised when a requested session UUID does not exist."""

    def __init__(self, session_uuid: uuid.UUID, message: str | None = None):
        self.session_uuid = session_uuid
        self.message = message or f"No active session found for UUID: {
            session_uuid}"
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
