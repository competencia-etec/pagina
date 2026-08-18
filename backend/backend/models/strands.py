from typing import List, Literal, Optional, Tuple

from pydantic import BaseModel, ConfigDict

Coords = List[Tuple[int, int]]


class InitResponse(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

    session_email: str
    grid: List[List[str]]
    theme: str
    spangram: str
    total_words: int
    found_words: List[str]
    bonus_words_count: int
    hint_counter: int
    game_status: Literal['in_progress', 'won']


class PlayerAttempt(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

    coords: Coords


class AttemptResponse(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

    valid: bool
    word: Optional[str] = None
    is_game_word: bool
    is_bonus: bool
    is_spangram: bool
    hint: Optional[Coords] = None
    game_status: Literal['in_progress', 'won']
    found_words: List[str]
    bonus_words_count: int
    hint_counter: int


class SessionResponse(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

    session_email: str
    grid: List[List[str]]
    theme: str
    spangram: str
    game_status: Literal['in_progress', 'won']
    found_words: List[str]
    total_words: int
    bonus_words_count: int
    hint_counter: int
    found_paths: List[Coords]
