from pathlib import Path
from datetime import date

ANSW_FILE = Path('valid-answers.txt')
DICT_FILE = Path('dictionary.txt')
INIT_DATE = date(2026, 7, 1)


def start_game():
    word_idx = (date.today() - INIT_DATE).days
    game_data = {
        'word_contains': '',
        'found_letters': '',
        'word': ''
        }

    with ANSW_FILE.open('r') as answfile:
        for idx, word in enumerate(answfile):
            if idx == word_idx:
                game_data['word'] = word

    return game_data


if __name__ == '__main__':
    gd = start_game()
    print(gd['word'])
