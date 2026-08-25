class GameCreationError(Exception):
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class InvalidSession(Exception):
    def __init__(self, session_email: str):
        super().__init__(session_email)
        self.session_email = session_email


class InvalidAttempt(Exception):
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message
