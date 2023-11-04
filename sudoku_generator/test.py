import os

from SudokuGenerator import SudokuGenerator

def upload_board(difficulty):
    sudoku_generator = SudokuGenerator()
    sudoku_generator.generate_board(difficulty)

    sudoku_generator.print_boards()
    print("- o -")

if __name__ == '__main__':
    for difficulty in range(1, 4):
        upload_board(difficulty)