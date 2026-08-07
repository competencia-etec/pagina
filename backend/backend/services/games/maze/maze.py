import random
from typing import List

from .generator import Maze
from backend.models.maze import TurnStatus

SMALL = 10
MED = 20
LARGE = 30


class MazeGameData:
    def __init__(self, size: int, seed: int):
        self.m = Maze(size, size, seed)
        start_cell = self._findLongestPath()
        if start_cell is None:
            # TODO: FIX - Fallback to bottom-right corner if no dead-end cell is found
            start_cell = (self.m.w - 1, self.m.h - 1)
        self.playerX, self.playerY = start_cell
        self.playerWon = (self.playerX, self.playerY) == (self.m.originX, self.m.originY)

    def _tracePath(self, x: int, y: int) -> int:
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

    def _isDeadEnd(self, x: int, y: int) -> bool:
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

    def _getCellWall(self, cellX: int, cellY: int, direction: int) -> bool:
        assert 1 <= direction <= 4
        # TODO: FIX - Changed self.walls to self.m.walls as Maze holds the walls matrix
        wallsValue = self.m.walls[cellY][cellX]

        mask = 1 << (direction - 1)  # e.g. 0010
        return bool(wallsValue & mask)

    def get_possible_movements(self) -> List[bool]:
        """
        Returns a list of booleans indicating movement availability in order:
        [Up (1), Down (3), Right (2), Left (4)] as expected by TurnStatus.
        """
        # TODO: FIX - Maintain TurnStatus possible_movements format [up, down, right, left]
        up = not self._getCellWall(self.playerX, self.playerY, 1)
        down = not self._getCellWall(self.playerX, self.playerY, 3)
        right = not self._getCellWall(self.playerX, self.playerY, 2)
        left = not self._getCellWall(self.playerX, self.playerY, 4)
        return [up, down, right, left]

    def get_turn_status(self) -> TurnStatus:
        return TurnStatus(
            possible_movements=self.get_possible_movements(),
            won=self.playerWon,
        )

    def movePlayer(self, direction: int) -> bool:
        assert 1 <= direction <= 4
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

        return True


def startGame(difficulty: int = 1, seed: int | None = None) -> MazeGameData:
    if seed is None:
        seed = random.randint(1, 100000)

    match difficulty:
        case 2:
            return MazeGameData(MED, seed)
        case 3:
            return MazeGameData(LARGE, seed)
        case _:
            return MazeGameData(SMALL, seed)
