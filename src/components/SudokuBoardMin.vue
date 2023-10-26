<script setup>
import Timer from './Timer.vue'
</script>

<template>
<div class="sudoku-container">
    <div class="sudoku-board" v-bind:class="{ loading: boardLoading }">
        <div v-for="(section, sectionIndex) in sudokuBoard" :key="sectionIndex" class="sudoku-board-section">
            <div v-for="(cell, cellIndex) in section" :key="cellIndex" class="sudoku-board-section-cell"
                :selected="cell.selected"
                :wrong="cell.wrong && showWrongCells"
            >
                <input type="text" 
                    @input="handleInput(sectionIndex, cellIndex, $event)"
                    :value="cell.number" 
                    :ref="`input-${sectionIndex}-${cellIndex}`"
                    v-bind:readonly="cell.locked ? 'readonly' : null">
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
  props: {
    sudokuBoardInp: {
        type: Object,
        required: true
    },
    solvedBoardInp: {
        type: Object,
        required: true
    },
  },
  watch: {
  },
  data() {
    return {
        sudokuBoard: [],
        solvedBoard: []
    };
  },
  beforeMount(){
    this.initComponent();
  },
  methods: {
    /* HELPERS */
    initComponent(){
        this.sudokuBoard = this.createBoard()
        this.loadBoards()
    },
    loadBoards(){
        this.sudokuBoard = this.convertToSubgrids(this.sudokuBoardInp);
        this.solvedBoard = this.convertToSubgrids(this.solvedBoardInp);
        this.solveBoard()
        this.boardLoading = false
        console.log(this.sudokuBoard)
    },
    generateRange(start, end) {
      return Array.from({ length: end - start + 1 }, (_, index) => start + index);
    },
    /* LOGIC */
    createBoard(){
        let tempBoard = []
        for(let i = 0; i < 9; i++){
            let tempSection = []
            for(let j = 0; j < 9; j++){
                tempSection.push(
                    {
                        number: null,
                        notes: [],
                        selected: false,
                        locked: false,
                        wrong: false,
                    }
                )
            }
            tempBoard.push(tempSection)
        }
        
        return tempBoard;
    },
    convertToSubgrids(board) {
        let tempBoard = this.createBoard()
        for (let i = 0; i < this.sudokuBoard.length; i++) {
            for (let j = 0; j < this.sudokuBoard[i].length; j++) {
                const row = Math.floor(i / 3) * 3 + Math.floor(j / 3);
                const col = (i % 3) * 3 + (j % 3);
                const number = board[row][col];

                tempBoard[i][j].number = number !== 0 ? number : null;
                tempBoard[i][j].locked = number !== 0;
            }
        }
        return tempBoard
    },
    solveBoard(){
        for (let i = 0; i < this.sudokuBoard.length; i++) {
            for (let j = 0; j < this.sudokuBoard[i].length; j++) {
                this.sudokuBoard[i][j].number = this.solvedBoard[i][j].number
            }
        }
    },
  },
};
</script>

<style>
:root {
    --cell-size-min: 26px;
}
</style>

<style scoped>
.sudoku-container{
    user-select: none;
    transition: 0.1s;

    width: calc(var(--cell-size-min) * 3 * 3 + 4px);
    height: calc(var(--cell-size-min) * 3 * 3 + 4px);
}

.sudoku-board{
    display: grid;
    pointer-events: none;
    grid-template-columns: repeat(3, 1fr);
    width: calc(var(--cell-size-min) * 3 * 3);
    height: calc(var(--cell-size-min) * 3 * 3);
}

.sudoku-board.loading{
    filter: blur(4px);
}

.sudoku-board-section{
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    width: calc(var(--cell-size-min) * 3);
    height: calc(var(--cell-size-min) * 3);

    border: 1px solid var(--color-text);
    border-top-width: 0px;
    border-right-width: 0px;
}

.sudoku-board-section:nth-child(1){
    border-top-left-radius: 8px;
}

.sudoku-board-section:nth-last-child(1){
    border-bottom-right-radius: 8px;
}

.sudoku-board-section:nth-last-child(3){
    border-bottom-left-radius: 8px;
}

.sudoku-board-section:nth-child(3){
    border-top-right-radius: 8px;
}

.sudoku-board-section-cell{
    position: relative;

    height: calc(var(--cell-size-min) - 4);
    width: calc(var(--cell-size-min) - 4);

    border: 1px solid var(--color-gray);
    border-top-width: 0px;
    border-left-width: 0px;
}

.sudoku-board-section:nth-child(-n+3){
    border-top-width: 1px;
}

.sudoku-board-section:nth-child(3n){
    border-right-width: 1px;
}

.sudoku-board-section-cell:nth-child(3n){
    border-right-width: 0px;
}

.sudoku-board-section-cell:nth-last-child(-n+3){
    border-bottom-width: 0px;
}

.sudoku-board-section-cell-notes{
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--color-background-transparent);
    color: var(--color-text-transparent);

    visibility: hidden;
    transition: 0.2s;
}

.sudoku-board-section-cell-notes > span{
    font-size: calc(var(--cell-size-min) / 5);
    display: inline-block;
    display: grid;
    align-items: center;
    text-align: center;
}

input{
    border: none;
    background-color: transparent;
    height: 100%;
    width: 100%;

    font-size: calc(var(--cell-size-min) / 2);

    text-align: center;

    color: var(--color-text);

    user-select: none;
    cursor: default;
    caret-color: transparent;
    box-sizing: border-box;
}

input:read-only{
    color: gray;
}
</style>
