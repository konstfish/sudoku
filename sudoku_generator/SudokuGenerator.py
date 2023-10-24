import random
import copy

class SudokuGenerator:
    def __init__(self):
        self.grid = [[0] * 9 for _ in range(9)]

    def generate_board(self, difficulty):
        self.attempts = 40 + difficulty * 20

        self.grid = self.generate_full_grid()
        self.unsolved_grid = copy.deepcopy(self.grid)

        self.shuffle_grid(self.grid)
        self.remove_values()

    def solve_sudoku(self):
        empty_cell = self.find_empty()
        if not empty_cell:
            return True  # Solved
        row, col = empty_cell

        for num in range(1, 9 + 1):
            if self.is_safe(row, col, num):
                self.grid[row][col] = num
                if self.solve_sudoku():
                    return True  # Continue solving
                self.grid[row][col] = 0  # Backtrack if unsuccessful

        return False

    def generate_full_grid(self):
        # Start with an empty grid
        grid = [[0] * 9 for _ in range(9)]

        # Fill the diagonal boxes with random permutations of numbers 1 to 9
        for i in range(0, 9, 3):
            box = list(range(1, 10))
            random.shuffle(box)
            for j in range(3):
                grid[i + j][i:i + 3] = box[j * 3: (j + 1) * 3]

        # Solve the initial grid
        solver = SudokuGenerator()
        solver.grid = grid
        solver.solve_sudoku()

        return solver.grid

    def shuffle_grid(self, grid):
        # Shuffle rows
        for i in range(0, 9, 3):
            box = grid[i:i + 3]
            random.shuffle(box)
            grid[i:i + 3] = box

        # Transpose the grid and shuffle columns
        grid = [list(row) for row in zip(*grid)]
        for i in range(0, 9, 3):
            box = grid[i:i + 3]
            random.shuffle(box)
            grid[i:i + 3] = box
        grid = [list(row) for row in zip(*grid)]

        # Shuffle numbers within each row and column
        for _ in range(20):
            random.shuffle(grid)
            grid = [list(row) for row in zip(*grid)]
            random.shuffle(grid)
            grid = [list(row) for row in zip(*grid)]

    def find_empty(self):
        for i in range(9):
            for j in range(9):
                if self.grid[i][j] == 0:
                    return (i, j)
        return None

    def is_safe(self, row, col, num):
        return (
            self.is_safe_row(row, num)
            and self.is_safe_col(col, num)
            and self.is_safe_box(row - row % 3, col - col % 3, num)
        )

    def is_safe_row(self, row, num):
        return num not in self.grid[row]

    def is_safe_col(self, col, num):
        return all(row[col] != num for row in self.grid)

    def is_safe_box(self, start_row, start_col, num):
        return all(
            num not in self.grid[i][start_col: start_col + 3]
            for i in range(start_row, start_row + 3)
        )

    def remove_values(self):
        for _ in range(self.attempts):
            row, col = random.randint(0, 8), random.randint(0, 8)
            if self.grid[row][col] != 0:
                backup = self.grid[row][col]
                self.grid[row][col] = 0

                # Check if the grid still has a unique solution
                if not self.is_unique_solution():
                    self.grid[row][col] = backup

    def is_unique_solution(self):
        # Make a copy of the grid to avoid modifying the original
        copy_grid = [row[:] for row in self.grid]
        solver = SudokuGenerator()
        solver.grid = copy_grid
        return solver.solve_sudoku()

    def print_board(self):
        for row in self.grid:
            print(row)
