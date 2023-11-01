import random
from difficulty import levels

class SudokuGenerator:
    
    def __init__(self):
        self.grid = [[0]*9 for _ in range(9)]
        self.unsolved_grid = [[0]*9 for _ in range(9)]
    
    def print_board(self, unsolved=True):
        board = self.unsolved_grid if unsolved else self.grid
        for row in board:
            print(row)

    def is_valid(self, num, pos, board):
        for i in range(9):
            if board[pos[0]][i] == num:
                return False

        for i in range(9):
            if board[i][pos[1]] == num:
                return False

        box_x = pos[1] // 3
        box_y = pos[0] // 3
        for i in range(box_y*3, box_y*3 + 3):
            for j in range(box_x*3, box_x*3 + 3):
                if board[i][j] == num:
                    return False

        return True

    def solve(self, board, counting=False):
        empty = self.find_empty(board)
        if not empty:
            return True
        else:
            row, col = empty

        numbers = list(range(1, 10))
        random.shuffle(numbers)
        for num in numbers:
            if self.is_valid(num, (row, col), board):
                board[row][col] = num
                if self.solve(board, counting):
                    if counting:
                        self.solutions += 1
                    else:
                        return True
                board[row][col] = 0

        return False

    def find_empty(self, board):
        for i in range(9):
            for j in range(9):
                if board[i][j] == 0:
                    return (i, j)
        return None

    def count_solutions(self):
        self.solutions = 0
        temp_unsolved = [row.copy() for row in self.unsolved_grid]
        self.solve(temp_unsolved, counting=True)
        return self.solutions

    def remove_numbers(self, difficulty):
        levels = {
            1: 38,
            2: 55,
            3: 70
        }

        self.unsolved_grid = [row.copy() for row in self.grid]
        for _ in range(levels[difficulty]):
            row = random.randint(0, 8)
            col = random.randint(0, 8)
            while self.unsolved_grid[row][col] == 0:
                row = random.randint(0, 8)
                col = random.randint(0, 8)
            backup = self.unsolved_grid[row][col]
            self.unsolved_grid[row][col] = 0

            if self.count_solutions() != 1:
                self.unsolved_grid[row][col] = backup

        return True

    def generate_board(self, difficulty=1):
        self.grid = [[0]*9 for _ in range(9)]
        self.solve(self.grid)
        self.remove_numbers(difficulty)
        return self.unsolved_grid

    def print_board(self):
        for row in self.grid:
            print(row)

    def print_boards(self):
        for i in range(0,9):
            print(self.unsolved_grid[i], self.grid[i])
