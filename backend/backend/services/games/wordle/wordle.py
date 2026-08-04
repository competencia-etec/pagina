from pathlib import Path
from datetime import date
from typing import List

MODULE_PATH = Path(__file__).parent
ANSW_FILE = MODULE_PATH / Path("valid-answers.txt")
DICT_FILE = MODULE_PATH / Path("dictionary.txt")
INIT_DATE = date(2026, 7, 1)


def _replaceChar(string: str, char: str, idx: int):
    return string[:idx] + char + string[1 + idx:]


class WordleGameData:
    def __init__(self, answer):
        self.answer = answer  # The actual answer
        self.guesses = 6  # Amount of guesses the user has left
        self.contains = ""  # Yellow letters (in arbitrary order)
        self.partial = "?????"  # Green letters (each in its own position)
        self.playerWon = False

        self.prevGuesses: List[str] = []

    def __str__(self):
        return (
            f"Game Status:\n"
            f"  Answer: {self.answer}\n"
            f"  Guesses left: {self.guesses}\n"
            f"  Contains (Yellow): '{self.contains}'\n"
            f"  Partial (Green): {self.partial}\n"
            f"  Player Won: {self.playerWon}"
        )


# FIX: Reading the whole file EVERY TIME we create a session
def startGame() -> WordleGameData | None:
    wordIdx = (date.today() - INIT_DATE).days
    gd = None

    with ANSW_FILE.open("r") as answfile:
        for idx, word in enumerate(answfile):
            if idx == wordIdx:
                gd = WordleGameData(word.strip())

    return gd


# HACK: Returning game data until assertion removed
def checkGuess(gd: WordleGameData, guess: str) -> WordleGameData:
    # FIX:: Assertions are removed on dist runtime, replace for classic conditional
    assert isValidGuess(guess)

    gd.guesses -= 1

    if gd.answer == guess:
        gd.playerWon = True
        return gd

    for idx in range(len(gd.answer)):
        if gd.answer[idx] == guess[idx]:
            gd.partial = _replaceChar(gd.partial, gd.answer[idx], idx)
        if guess[idx] in gd.answer and not (guess[idx] in gd.contains):
            gd.contains += guess[idx]

    return gd


# FIX: Reading the whole file EVERY TIME we check answers
def isValidGuess(guess: str) -> bool:
    if len(guess) != 5:
        return False

    with DICT_FILE.open("r") as dfile:
        for word in dfile:
            if word.strip() == guess:
                return True

    return False
