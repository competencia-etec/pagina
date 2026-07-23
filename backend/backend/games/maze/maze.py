from generator import Maze


class GameData:
    def __init__(self):
        self.m = Maze(15, 15, 5)
        self.playerX, self.playerY = self._findLongestPath()

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


def startGame():
    gd = GameData()
    return gd
