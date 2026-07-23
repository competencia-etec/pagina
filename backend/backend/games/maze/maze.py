from generator import Maze


class GameData:
    def __init__(self):
        self.m = Maze(15, 15, 5)
        self.playerX, self.playerY = self._find_longest_path()


    def _trace_path(self, x, y):
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

    def _is_dead_end(self, x, y):
        assert 0 <= y < self.m.h
        assert 0 <= x < self.m.w

        if self.m.walls[y][x] in (14, 13, 11, 7):
            return True
        return False

    def _find_longest_path(self):
        # We find the longest path by first generating a list of every dead end
        # in the maze, and then, for every one, follow the path they take to get
        # to the origin, and count the amount of steps to get there.
        # Finally, we return the coordinates of the node that's furthest from
        # the origin in terms of steps.

        starting_cells = []

        for x in range(self.m.w):
            for y in range(self.m.h):
                if self._is_dead_end(x, y):
                    starting_cells.append((x, y))

        longest_path = -1
        best_cell = None

        for cell in starting_cells:
            path_length = self._trace_path(cell[0], cell[1])
            if path_length > longest_path:
                longest_path = path_length
                best_cell = cell

        return best_cell


def start_game():
    gd = GameData()
    return gd
