import os

from SudokuGenerator import SudokuGenerator

from pocketbase import Client

client = Client('https://api.konst.fish/sudoku')
pb_user = os.environ.get("POCKETBASE_ADMIN")
pb_pass = os.environ.get("POCKETBASE_PASSWORD")

try:
    admin_data = client.admins.auth_with_password(pb_user, pb_pass)
except:
    print("Auth failed, exiting")
    exit(1)

def upload_board(difficulty):
    sudoku_generator = SudokuGenerator()
    sudoku_generator.generate_board(difficulty)

    sudoku_generator.print_board()

    data = {
        "difficulty": difficulty,
        "production": 1,
        "board": sudoku_generator.grid,
        "solved_board": sudoku_generator.unsolved_grid
    };
    
    try:
        result = client.collection('boards').create(data)
        print(result.id)
    except:
        print("Upload failed, exiting")
        exit(1)

if __name__ == '__main__':
    for difficulty in range(1, 4):
        upload_board(difficulty)