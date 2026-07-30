from generator import Maze

SMALL = 10
MED = 20
LARGE = 30


class MazeGameData:
    def __init__(self, size, seed):
        self.m = Maze(size, size, seed)
        self.playerX, self.playerY = self._findLongestPath()
        self.playerWon = False

    def _tracePath(self, x, y):
        assert 0 <= y < self.m.h
        assert 0 <= x < self.m.w

        steps = 0

        while True:
            direction = self.m.paths[y][x]
            match direction:
                case 0:  # This is the origin cell
                    return steps
                case 1:  # Cell is pointing up
                    y -= 1
                case 2:  # Right
                    x += 1
                case 3:  # Down
                    y += 1
                case 4:  # Left
                    x -= 1
            steps += 1
            assert steps <= self.m.w * self.m.h

    def _isDeadEnd(self, x, y):
        assert 0 <= y < self.m.h
        assert 0 <= x < self.m.w

        if self.m.walls[y][x] in (14, 13, 11, 7):
            return True
        return False

    def _findLongestPath(self):
        # We find the longest path by first generating a list of every dead end
        # in the maze, and then, for every one, follow the path they take to get
        # to the origin, and count the amount of steps to get there.
        # Finally, we return the coordinates of the node that's furthest from
        # the origin in terms of steps.

        startingCells = []

        for x in range(self.m.w):
            for y in range(self.m.h):
                if self._isDeadEnd(x, y):
                    startingCells.append((x, y))

        longestPath = -1
        bestCell = None

        for cell in startingCells:
            pathLength = self._tracePath(cell[0], cell[1])
            if pathLength > longestPath:
                longestPath = pathLength
                bestCell = cell

        return bestCell

    def _getCellWall(self, cellX: int, cellY: int, direction: int):
        assert direction >= 1 and direction <= 4
        wallsValue = self.walls[cellY][cellX]

        mask = 1 << (direction - 1)  # e.g. 0010
        return bool(wallsValue & mask)

    def movePlayer(self, direction: int):
        assert direction >= 1 and direction <= 4
        if self._getCellWall(self.playerX, self.playerY, direction):
            return False

        match direction:
            case 1:  # Move up
                self.playerY -= 1
            case 2:  # Right
                self.playerX += 1
            case 3:  # Down
                self.playerY += 1
            case 4:  # Left
                self.playerX -= 1

        if (self.playerX, self.playerY) == (self.m.originX, self.m.originY):
            self.playerWon = True


def startGame(difficulty: int, seed: int):
    gd = None

    match difficulty:
        case 1:
            gd = MazeGameData(SMALL, seed)
        case 2:
            gd = MazeGameData(MED, seed)
        case 3:
            gd = MazeGameData(LARGE, seed)

    return gd
