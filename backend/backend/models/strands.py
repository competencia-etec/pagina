
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict

from backend.services.games.strands.strands import Coords


class TurnStatus(BaseModel):
    # True if movement is possible [up, down, right, left]
    possible_movements: List[bool]
    won: bool


class InitResponse(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

    session_email: str
    turn_status: TurnStatus


class PlayerAttempt(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

    coords: Coords


class AttemptResponse(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

    valid: bool
    word: str
    is_game_word: bool
    is_bonus: bool

    points: int
    hint: Optional[Coords]


class SessionResponse(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

    session_email: str
    game_status: Literal['in_progress', 'won']
    turn_status: TurnStatus
    player_x: int
    player_y: int
