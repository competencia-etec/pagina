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
def startGame(offset: int = 0) -> WordleGameData | None:
    with ANSW_FILE.open("r", encoding="utf-8") as answfile:
        words = [line.strip().lower() for line in answfile if line.strip()]

    if not words:
        return None

    wordIdx = ((date.today() - INIT_DATE).days + offset) % len(words)
    return WordleGameData(words[wordIdx])


def checkGuess(gd: WordleGameData, guess: str) -> WordleGameData:
    guess = guess.strip().lower()
    if not isValidGuess(guess):
        return gd

    gd.guesses -= 1

    if gd.answer == guess:
        gd.playerWon = True
        gd.partial = gd.answer
        for ch in gd.answer:
            if ch not in gd.contains:
                gd.contains += ch
        return gd

    for idx in range(len(gd.answer)):
        if gd.answer[idx] == guess[idx]:
            gd.partial = _replaceChar(gd.partial, gd.answer[idx], idx)

    for idx in range(len(gd.answer)):
        ch = guess[idx]
        if ch in gd.answer and gd.answer[idx] != ch and ch not in gd.contains:
            green_count = sum(
                1 for k in range(len(gd.answer))
                if gd.answer[k] == ch and guess[k] == ch
            )
            if gd.answer.count(ch) > green_count:
                gd.contains += ch

    return gd


# FIX: Reading the whole file EVERY TIME we check answers
def isValidGuess(guess: str) -> bool:
    guess = guess.strip().lower()
    if len(guess) != 5:
        return False

    with DICT_FILE.open("r", encoding="utf-8") as dfile:
        for word in dfile:
            if word.strip().lower() == guess:
                return True

    return False
