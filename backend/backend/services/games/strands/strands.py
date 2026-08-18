from pathlib import Path
from typing import List, Tuple, Optional

from .grid_generator import generator as generate_grid

MODULE_PATH = Path(__file__).parent
ALL_WORDS_FILE = MODULE_PATH / "all_spanish_words.txt"

Grid = List[List[str]]
Coords = List[Tuple[int, int]]
LetterCoords = List[Coords]

spanish_dict: set[str] = set()
if ALL_WORDS_FILE.exists():
    with ALL_WORDS_FILE.open("r", encoding="utf-8") as f:
        spanish_dict = {w.strip() for w in f if w.strip()}


def _is_adjacent(a: Tuple[int, int], b: Tuple[int, int]) -> bool:
    return abs(a[0] - b[0]) <= 1 and abs(a[1] - b[1]) <= 1 and a != b


def _coords_to_word(grid: Grid, coords: Coords) -> str:
    return "".join(grid[r][c] for r, c in coords)


def _normalize(word: str) -> str:
    return "".join(ch for ch in word.lower() if ch.isalpha())


class StrandsGame:
    HINT_THRESHOLD = 5

    def __init__(self):
        grid, letter_coords, spangram_idx = generate_grid()

        self.grid: Grid = grid
        self.letter_coords: LetterCoords = letter_coords
        self.spangram_idx: int = spangram_idx

        self.words: List[str] = [
            _normalize(_coords_to_word(self.grid, wc))
            for wc in self.letter_coords
        ]

        self.revealed: set[str] = set()
        self.bonus_words_count: int = 0
        self.hint_counter: int = 0

    def __str__(self) -> str:
        revealed = len(self.revealed)
        total = len(self.words)
        return (
            f"StrandsGame:\n"
            f"  Revealed: {revealed}/{total}\n"
            f"  Bonus words: {self.bonus_words_count}\n"
            f"  Hint counter: {self.hint_counter}/{self.HINT_THRESHOLD}"
        )


def attempt(game: StrandsGame, positions: Coords) -> dict:
    global spanish_dict

    if not positions:
        return {
            "valid": False,
            "word": None,
            "is_game_word": False,
            "is_bonus": False,
        }

    rows = len(game.grid)
    cols = len(game.grid[0]) if rows else 0
    seen = set()
    for r, c in positions:
        if not (0 <= r < rows and 0 <= c < cols):
            return {
                "valid": False,
                "word": None,
                "is_game_word": False,
                "is_bonus": False,
            }
        if (r, c) in seen:
            return {
                "valid": False,
                "word": None,
                "is_game_word": False,
                "is_bonus": False,
            }
        seen.add((r, c))

    for a, b in zip(positions[:-1], positions[1:]):
        if not _is_adjacent(a, b):
            return {
                "valid": False,
                "word": None,
                "is_game_word": False,
                "is_bonus": False,
            }

    word = _normalize(_coords_to_word(game.grid, positions))

    if word in game.words and word not in game.revealed:
        game.revealed.add(word)
        return {
            "valid": True,
            "word": word,
            "is_game_word": True,
            "is_bonus": False,
        }

    if word in spanish_dict and word not in game.words:
        game.bonus_words_count += 1
        game.hint_counter += 1
        return {
            "valid": True,
            "word": word,
            "is_game_word": False,
            "is_bonus": True,
        }

    return {
        "valid": False,
        "word": word if word else None,
        "is_game_word": False,
        "is_bonus": False,
    }


def get_hint(game) -> Optional[Coords]:
    if game.hint_counter < game.HINT_THRESHOLD:
        return None

    game.hint_counter -= game.HINT_THRESHOLD
    for word, coords in zip(game.words, game.letter_coords):
        if word not in game.revealed:
            return list(coords)
    return None

