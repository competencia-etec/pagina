class MazeSessionError(Exception):
    """Base exception for all Maze session errors."""
    pass


class InvalidSession(MazeSessionError):
    """Raised when a requested maze session does not exist."""

    def __init__(self, session_email: str, message: str | None = None):
        self.session_email = session_email
        self.message = message or f"No active session found for user: {session_email}"
        super().__init__(self.message)


class InvalidMove(MazeSessionError):
    """Raised when a move direction is invalid."""

    def __init__(self, message: str = "Invalid move direction"):
        self.message = message
        super().__init__(self.message)


class GameCreationError(MazeSessionError):
    """Raised when the maze engine fails to generate a new game."""
    pass
