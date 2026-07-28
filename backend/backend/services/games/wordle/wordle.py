from pathlib import Path
from datetime import date
from typing import List

MODULE_PATH = Path(__file__).parent
ANSW_FILE = MODULE_PATH / Path("valid-answers.txt")
DICT_FILE = MODULE_PATH / Path("dictionary.txt")
INIT_DATE = date(2026, 7, 1)


def replace_char(string: str, char: str, idx: int):
    return string[:idx] + char + string[1 + idx:]


class GameData:
    def __init__(self, answer):
        self.answer = answer  # The actual answer (set in the code block below)
        self.guesses = 6  # Amount of guesses the user has left
        self.contains = ""  # Yellow letters (in no particular order)
        self.partial = "?????"  # Green letters (each in its own position)
        self.player_won = False

        self.prev_guesses: List[str] = []

    def __str__(self):
        return (f"Game Status:\n"
                f"  Answer: {self.answer}\n"
                f"  Guesses left: {self.guesses}\n"
                f"  Contains (Yellow): '{self.contains}'\n"
                f"  Partial (Green): {self.partial}\n"
                f"  Player Won: {self.player_won}")


#    def __str__(self):
#        return f"""
#    Answer: {self.answer}
#    Guesses: {self.guesses}
#    Yellow letters: {self.contains}
#    Green letters: {self.partial}
#    Player Won: {self.player_won}
#    """


# FIX: Reading the whole file EVERY TIME we create a session
def start_game() -> GameData | None:
    word_idx = (date.today() - INIT_DATE).days
    gd = None

    with ANSW_FILE.open("r") as answfile:
        for idx, word in enumerate(answfile):
            if idx == word_idx:
                gd = GameData(word.strip())

    return gd


def check_guess(gd: GameData, guess: str) -> GameData:
    assert is_valid_guess(guess)

    gd.guesses -= 1

    if gd.answer == guess:
        gd.player_won = True
        return gd

    for idx in range(len(gd.answer)):
        if gd.answer[idx] == guess[idx]:
            gd.partial = replace_char(gd.partial, gd.answer[idx], idx)
        if guess[idx] in gd.answer and not (guess[idx] in gd.contains):
            gd.contains += guess[idx]

    return gd


# FIX: Reading the whole file EVERY TIME we check answers
def is_valid_guess(guess: str) -> bool:
    if len(guess) != 5:
        return False

    with DICT_FILE.open("r") as dfile:
        for word in dfile:
            if word.strip() == guess:
                return True

    return False
