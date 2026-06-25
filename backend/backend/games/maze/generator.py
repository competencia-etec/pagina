# Origin shift
from random import Random


class Maze:
    def __init__(self, width: int, height: int, seed=1):
        self.r = Random(seed)

        # Initialize the labirinth as appropriate for origin shift, with every
        # cell pointing left, with the exception of the ones in the first column,
        # pointing up.

        # Cell numbers 1-4 represent the direction the cell is pointing at (up,
        # right, down, left), while 0 means no direction.
        self.grid = [[0 for cell in range(width)] for row in range(height)]
        self.originX = 0
        self.originY = 0

        for col in range(width):
            for row in range(height):
                if col == 0:
                    self.grid[row][col] = 1  # Up
                else:
                    self.grid[row][col] = 4  # Left

        self.shift()

    def shift(self, iterations: int = None):
        if not iterations:
            iterations = len(self.grid) * len(self.grid[0]) * 10
        for i in range(iterations):
            preOriginX = self.originX
            preOriginY = self.originY
            newDir = self.r.randint(1, 4)

            match newDir:
                case 1:  # Up
                    if self.originY - 1 < 0:
                        continue
                    self.originY -= 1
                case 3:  # Down
                    if self.originY + 1 >= len(self.grid):
                        continue
                    self.originY += 1

                case 2:  # Right
                    if self.originX + 1 >= len(self.grid[0]):
                        continue
                    self.originX += 1
                case 4:  # Left
                    if self.originX - 1 < 0:
                        continue
                    self.originX -= 1
                case _:
                    print(newDir)

            self.grid[preOriginY][preOriginX] = newDir
            self.grid[self.originY][self.originX] = 0

    def __str__(self):
        symbols = {
            0: '.',
            1: '↑',
            2: '→',
            3: '↓',
            4: '←',
            }
        return '\n'.join(''.join(symbols[cell] for cell in row) for row in self.grid)
