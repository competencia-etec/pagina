from pathlib import Path
from random import shuffle

if __name__ == '__main__':
    WORD_FILE = Path('valid-answers.txt')
    OUTP_FILE = Path('out.txt')

    words = []

    with WORD_FILE.open('r') as wfile:
        for word in wfile:
            words.append(word)
        shuffle(words)

    with OUTP_FILE.open('w') as ofile:
        for word in words:
            ofile.write(word)
