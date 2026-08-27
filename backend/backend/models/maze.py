from typing import List, Literal

from pydantic import BaseModel, ConfigDict, Field


class TurnStatus(BaseModel):
    # True if movement is possible [up, down, right, left]
    possible_movements: List[bool]
    won: bool


class InitResponse(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

    session_email: str
    turn_status: TurnStatus


class PlayerMove(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

    # Direction: 1 (Up), 2 (Right), 3 (Down), 4 (Left)
    direction: int = Field(..., ge=1, le=4)


class MoveResponse(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

    game_status: Literal['in_progress', 'won']
    turn_status: TurnStatus
    move_valid: bool


class SessionResponse(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

    session_email: str
    game_status: Literal['in_progress', 'won']
    turn_status: TurnStatus
    player_x: int
    player_y: int
    # Facing the player should start looking at (1=Up, 2=Right, 3=Down, 4=Left)
    initial_facing: int
