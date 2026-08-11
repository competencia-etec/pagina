from pathlib import Path
import pickle
import random
import itertools
from typing import List, Tuple, Optional

import numpy as np
from scipy.spatial import KDTree

MODULE_PATH = Path(__file__).parent
COMMON_WORDS_FILE = MODULE_PATH / "common_spanish_words.txt"
ALL_WORDS_FILE = MODULE_PATH / "all_spanish_words.txt"
EMBEDDINGS_FILE = MODULE_PATH / "embeddings.pkl"

Grid = List[List[str]]
Coords = List[Tuple[int, int]]
LetterCoords = List[Coords]


def _generate_n_cont_set(word: str, n: int) -> set[str]:
    n_letters_word = set()
    for i in range(len(word) - n + 1):
        n_letters_word.add(word[i:i + n])
    return n_letters_word


def _rotate_grid(grid):
    return [[tuple(item) for item in row] for row in np.rot90(np.array(grid))]


with COMMON_WORDS_FILE.open("r") as f:
    _all_words = f.readlines()

WORDS: List[str] = []
for _word in _all_words:
    _word_filtered = _word.strip()
    if len(_word_filtered) > 3:
        WORDS.append(_word_filtered)

with EMBEDDINGS_FILE.open("rb") as f:
    EMBEDDINGS = pickle.load(f)

TREE = KDTree(EMBEDDINGS)


def _generate_grid(query: Optional[str] = None):
    if query is None:
        query_idx = random.randrange(len(WORDS))
        query = WORDS[query_idx]
    else:
        query_idx = WORDS.index(query)

    query_embedding = EMBEDDINGS[query_idx]

    dd, ii = TREE.query(query_embedding, k=1000)

    spangrammable = []
    spangram_weights = []
    for weight, i in zip(dd, ii):
        candidate = WORDS[i].strip()
        candidate_alpha_only = "".join([char for char in candidate if char.isalpha()])
        if 6 <= len(candidate_alpha_only) <= 13:
            spangrammable.append(candidate)
            similarity = 1.0 - (weight ** 2) / 2.0
            spangram_weights.append(similarity ** 60)

    spangram_weights = spangram_weights[:100]
    spangram_weights /= sum(spangram_weights)
    spangram = random.choices(spangrammable[:100], spangram_weights, k=1)[0]

    subembeddings = [EMBEDDINGS[i] for i in ii]
    subwords = [WORDS[i] for i in ii]
    subtree = KDTree(subembeddings)

    ddd, iii = subtree.query(EMBEDDINGS[WORDS.index(spangram)], k=250)

    candidates: list[str] = []
    n = 4
    candidate_n_cont_pool: set[str] = set()
    candidate_weights = {}
    for weight, i in zip(ddd, iii):
        word = subwords[i].strip().lower()
        word_set = _generate_n_cont_set(word, n)
        unique = True
        for item in word_set:
            if item in candidate_n_cont_pool:
                unique = False
                break
        if unique:
            candidates.append(word)
            candidate_n_cont_pool.update(word_set)
            similarity = 1.0 - (weight ** 2) / 2.0
            candidate_weights[word] = similarity ** 60

    plain_words = []
    phrases = []
    for candidate in candidates[1:]:
        if len(candidate) <= 3:
            continue
        if candidate.isalpha():
            plain_words.append(candidate)
        else:
            phrases.append(candidate)

    plain_lengths = [len(plain_word) for plain_word in plain_words]

    spangram = "".join([char for char in spangram if char.isalpha()])

    budget = 48 - len(spangram)

    chosen = []
    plain_lengths_cpy = plain_lengths[:]
    while sum(chosen) != budget:
        remaining = budget - sum(chosen)
        if sum(chosen) < budget:
            if remaining in plain_lengths_cpy:
                chosen.append(remaining)
                break
            else:
                new_chosen = random.choice(plain_lengths_cpy)
                plain_lengths_cpy.remove(new_chosen)
                chosen.append(new_chosen)
        elif sum(chosen) > budget:
            if (-remaining) in chosen:
                chosen.remove(-remaining)
                break
            else:
                for _ in range(random.choice([1, 1, 1, 2, 2, 3])):
                    to_remove = random.choice(chosen)
                    chosen.remove(to_remove)
                    plain_lengths_cpy.append(to_remove)

    word_lens: dict[int, list[str]] = {}
    for word in plain_words:
        word_len = len(word)
        if word_len not in word_lens:
            word_lens[word_len] = [word]
        else:
            word_lens[word_len].append(word)

    chosen_words = [spangram]
    for length in chosen:
        weights = [candidate_weights[word] for word in word_lens[length]]
        weights = np.array(weights) / sum(weights)
        chosen_word = random.choices(word_lens[length], weights, k=1)[0]
        word_lens[length].remove(chosen_word)
        chosen_words.append(chosen_word)

    if len(spangram) < 8:
        spangram_direction = "ltr"
    else:
        spangram_direction = random.choice(["ltr", "ttb"])

    grid = []
    for i in range(8):
        row = []
        for j in range(6):
            row.append((i, j))
        grid.append(row)

    if spangram_direction == "ttb":
        grid = _rotate_grid(grid)
    coord_lst = grid.pop(0)
    row = 1
    while len(grid) > 0:
        if row % 2 == 0:
            coord_lst.extend(grid.pop(0))
        else:
            coord_lst.extend(reversed(grid.pop(0)))
        row += 1

    non_spangrams = chosen_words[:]
    non_spangrams.remove(spangram)
    valid_combos = []
    for n in range(len(non_spangrams) + 1):
        for combo in itertools.combinations(non_spangrams, n):
            prefix_len = sum([len(item) for item in combo])
            if spangram_direction == "ltr":
                dir_len = 6
            else:
                dir_len = 8
            row_prefix_len = prefix_len % dir_len
            if (row_prefix_len == 0) or ((row_prefix_len + len(spangram)) >= (2 * dir_len)):
                valid_combos.append(combo)

    chosen_combo = list(random.choice(valid_combos[1:-1]))
    random.shuffle(chosen_combo)
    for word in chosen_combo:
        non_spangrams.remove(word)
    random.shuffle(non_spangrams)
    chosen_words = chosen_combo + [spangram] + non_spangrams
    spangram_idx = chosen_words.index(spangram)

    coords: list[list[tuple[int, int]]] = []

    for word in chosen_words:
        word_coords = []
        for char in word:
            word_coords.append(coord_lst.pop(0))
        if random.choice([True, False]):
            coords.append(word_coords)
        else:
            coords.append(list(reversed(word_coords)))

    def get_word_letter_idx(coords, letter_coords, words):
        for word_idx, word_coords in enumerate(coords):
            if letter_coords in word_coords:
                letter_idx = word_coords.index(letter_coords)
                word = words[word_idx]
                letter = word[letter_idx]
                return letter_idx, letter, word_idx, word

    def check_word_continuity(word_coords):
        for coords_a, coords_b in zip(word_coords[:-1], word_coords[1:]):
            if abs(coords_a[0] - coords_b[0]) > 1 or abs(coords_a[1] - coords_b[1]) > 1:
                return False
        return True

    def spangram_valid(word_coords, direction: str):
        if direction == "ltr":
            return 0 in [coord[1] for coord in word_coords] and 5 in [coord[1] for coord in word_coords]
        else:
            return 0 in [coord[0] for coord in word_coords] and 7 in [coord[0] for coord in word_coords]

    def shuffle_grid(letter_coords, words, n):
        letter_coords_cpy = [word[:] for word in letter_coords]
        shuffles = 0

        while shuffles < n:
            a_coord = random.randint(0, 7), random.randint(0, 5)
            a_letter_idx, a_letter, a_word_idx, a_word = get_word_letter_idx(letter_coords_cpy, a_coord, words)

            b_candidate_coords = []
            for i in range(-1, 2):
                row = a_coord[0] + i
                if row < 0 or row >= 8:
                    continue
                for j in range(-1, 2):
                    col = a_coord[1] + j
                    if col < 0 or col >= 6 or a_coord == (row, col):
                        continue
                    b_candidate_coords.append((row, col))

            random.shuffle(b_candidate_coords)
            for b_coord in b_candidate_coords:
                b_letter_idx, b_letter, b_word_idx, b_word = get_word_letter_idx(letter_coords_cpy, b_coord, chosen_words)
                if a_word_idx == b_word_idx:
                    possible_word_coords = [item[:] for item in letter_coords_cpy[a_word_idx]]
                    possible_word_coords[a_letter_idx] = b_coord
                    possible_word_coords[b_letter_idx] = a_coord
                    if a_word_idx == spangram_idx and not spangram_valid(possible_word_coords, spangram_direction):
                        continue
                    if check_word_continuity(possible_word_coords):
                        letter_coords_cpy[a_word_idx] = possible_word_coords
                        shuffles += 1
                        break
                else:
                    possible_a_word_coords = letter_coords_cpy[a_word_idx][:]
                    possible_a_word_coords[a_letter_idx] = b_coord

                    possible_b_word_coords = letter_coords_cpy[b_word_idx][:]
                    possible_b_word_coords[b_letter_idx] = a_coord

                    if a_word_idx == spangram_idx and not spangram_valid(possible_a_word_coords, spangram_direction):
                        continue
                    if b_word_idx == spangram_idx and not spangram_valid(possible_b_word_coords, spangram_direction):
                        continue
                    if check_word_continuity(possible_a_word_coords) and check_word_continuity(possible_b_word_coords):
                        letter_coords_cpy[a_word_idx] = possible_a_word_coords
                        letter_coords_cpy[b_word_idx] = possible_b_word_coords
                        shuffles += 1
                        break
        return letter_coords_cpy

    new_letter_coords = shuffle_grid(coords, chosen_words, 100000)

    grid = [["" for col in range(6)] for row in range(8)]
    for word_coords, word in zip(new_letter_coords, chosen_words):
        for letter_coord, letter in zip(word_coords, word):
            grid[letter_coord[0]][letter_coord[1]] = letter

    return grid, new_letter_coords, spangram_idx, query


def _load_spanish_dict() -> set[str]:
    with ALL_WORDS_FILE.open("r") as f:
        return {w.strip() for w in f if w.strip()}


def _is_adjacent(a: Tuple[int, int], b: Tuple[int, int]) -> bool:
    return abs(a[0] - b[0]) <= 1 and abs(a[1] - b[1]) <= 1 and a != b


def _coords_to_word(grid: Grid, coords: Coords) -> str:
    return "".join(grid[r][c] for r, c in coords)


def _normalize(word: str) -> str:
    return "".join(ch for ch in word.lower() if ch.isalpha())


class StrandsGame:
    HINT_THRESHOLD = 5

    def __init__(self, query: Optional[str] = None):
        grid, letter_coords, spangram_idx, query = _generate_grid(query)

        self.query: str = query
        self.grid: Grid = grid
        self.letter_coords: LetterCoords = letter_coords
        self.spangram_idx: int = spangram_idx

        self.words: List[str] = [
            _normalize(_coords_to_word(self.grid, wc))
            for wc in self.letter_coords
        ]
        self._spanish_dict: set[str] = _load_spanish_dict()

        self.revealed: set[str] = set()
        self.bonus_words_count: int = 0
        self.hint_counter: int = 0

    def __str__(self) -> str:
        revealed = len(self.revealed)
        total = len(self.words)
        return (
            f"StrandsGame:\n"
            f"  Query: {self.query}\n"
            f"  Revealed: {revealed}/{total}\n"
            f"  Bonus words: {self.bonus_words_count}\n"
            f"  Hint counter: {self.hint_counter}/{self.HINT_THRESHOLD}"
        )

    def attempt(self, positions: Coords) -> dict:
        if not positions:
            return {
                "valid": False,
                "word": None,
                "is_game_word": False,
                "is_bonus": False,
            }

        rows = len(self.grid)
        cols = len(self.grid[0]) if rows else 0
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

        word = _normalize(_coords_to_word(self.grid, positions))

        if word in self.words and word not in self.revealed:
            self.revealed.add(word)
            return {
                "valid": True,
                "word": word,
                "is_game_word": True,
                "is_bonus": False,
            }

        if word in self._spanish_dict and word not in self.words:
            self.bonus_words_count += 1
            self.hint_counter += 1
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

    def get_hint(self) -> Optional[Coords]:
        if self.hint_counter < self.HINT_THRESHOLD:
            return None

        self.hint_counter -= self.HINT_THRESHOLD
        for word, coords in zip(self.words, self.letter_coords):
            if word not in self.revealed:
                return list(coords)
        return None