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
        self.w = width
        self.h = height
        self.paths = [[0 for cell in range(self.w)] for row in range(self.h)]
        self.walls = []
        self.originX = 0
        self.originY = 0

        for col in range(self.w):
            for row in range(self.h):
                if col == 0:
                    self.paths[row][col] = 1  # Up
                else:
                    self.paths[row][col] = 4  # Left

        self.shift()
        self.genWalls()

    def shift(self, iterations: int = None):
        if not iterations:
            iterations = len(self.paths) * len(self.paths[0]) * 10
        for _ in range(iterations):
            preOriginX = self.originX
            preOriginY = self.originY
            newDir = self.r.randint(1, 4)

            match newDir:
                case 1:  # Up
                    if self.originY - 1 < 0:
                        continue
                    self.originY -= 1
                case 3:  # Down
                    if self.originY + 1 >= len(self.paths):
                        continue
                    self.originY += 1

                case 2:  # Right
                    if self.originX + 1 >= len(self.paths[0]):
                        continue
                    self.originX += 1
                case 4:  # Left
                    if self.originX - 1 < 0:
                        continue
                    self.originX -= 1
                case _:
                    print(newDir)

            self.paths[preOriginY][preOriginX] = newDir
            self.paths[self.originY][self.originX] = 0

    def genWalls(self):
        # Reset walls
        self.walls = [[15 for cell in range(self.w)] for row in range(self.h)]

        # For every cell in self.walls, each bit represents one of the cell's
        # walls, like so:
        # 0001 = 1 = only north wall present
        # 0010 = 2 = only right wall present
        # 0100 = 4 = only south wall present
        # 1000 = 8 = only left  wall present
        # And every other combination other than 1111 = 15 (init value) as that
        # would make for an isolated cell

        # Binary shenanigans abstraction
        def removeCellWall(cellX: int, cellY: int, direction: int):
            oldValue = self.walls[cellY][cellX]
            assert direction >= 1 and direction <= 4

            mask = 1 << (direction - 1)  # e.g. 0010
            mask = ~mask  # now 1101
            self.walls[cellY][cellX] = oldValue & mask

        for cellY in range(0, self.h):
            for cellX in range(0, self.w):
                direction = self.paths[cellY][cellX]
                if direction == 0:  # Skip the origin
                    continue

                removeCellWall(cellX, cellY, direction)

                cellXB = cellX
                cellYB = cellY
                # Now remove the other side of the wall
                match direction:
                    case 1:
                        cellYB -= 1
                    case 2:
                        cellXB += 1
                    case 3:
                        cellYB += 1
                    case 4:
                        cellXB -= 1

                direction = ((direction + 1) % 4) + 1

                assert 0 <= cellXB < self.h
                assert 0 <= cellYB < self.w

                removeCellWall(cellXB, cellYB, direction)

    def __str__(self):
        symbols = {
            0: ".",
            1: "↑",
            2: "→",
            3: "↓",
            4: "←",
        }
        return "\n".join("".join(symbols[cell] for cell in row) for row in self.paths)
