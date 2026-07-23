from typing import Literal, List
from typing_extensions import Annotated

from pydantic import (
    BaseModel,
    ConfigDict,
    StringConstraints,
)

import uuid


def normalize_guess(v: str) -> str:
    """Normalize the guess to uppercase for consistent backend processing."""
    return v.upper()


class InitResponse(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

    session_id: uuid.UUID

    word_length: int

    max_attempts: int


class PlayerGuess(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

    session_id: uuid.UUID

    guess: str


class CharGuessHint(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True, frozen=True)

    letter: Annotated[
        str,
        StringConstraints(min_length=1, max_length=1, pattern=r'^[A-Za-z]$')
    ]
    status: Literal['correct_position', 'wrong_position', 'absent']


class GuessResponse(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

    game_status: Literal['in_progress', 'won', 'lost']

    hints: List[CharGuessHint]
    attempts_remaining: int
