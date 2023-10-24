<script setup>
import { pb } from '../lib/pocketbase'

import ConfettiExplosion from "vue-confetti-explosion";
</script>

<template>
<div class="sudoku-container">
    <ConfettiExplosion  :particleCount="200" 
                    :force="0.4" 
                    :stageWidth="1000"
                    :stageHeight="1500"
                    v-if="sudokuSolved"/>
    <div class="sudoku-board" v-bind:class="{ loading: boardLoading }">
        <div v-for="(section, sectionIndex) in sudokuBoard" :key="sectionIndex" class="sudoku-board-section">
            <div v-for="(cell, cellIndex) in section" :key="cellIndex" class="sudoku-board-section-cell"
                :selected="cell.selected"
                :wrong="cell.wrong && showWrongCells"
                @mouseenter="handleMouseOver(sectionIndex, cellIndex)"
                @mouseleave="handleMouseOut(sectionIndex, cellIndex)"
            >
                <div class="sudoku-board-section-cell-notes" :ref="`overlay-${sectionIndex}-${cellIndex}`">
                    <span v-for="number in generateRange(1, 9)" 
                        :key="number"
                        :selected="checkIfIncludes(sectionIndex, cellIndex, number)"
                        @click="handleClick(sectionIndex, cellIndex, number)"
                        @dblclick="handleDbClick(sectionIndex, cellIndex, number)"
                    >
                        {{ number }}
                    </span>
                </div>
                <input type="text" 
                    @input="handleInput(sectionIndex, cellIndex, $event)"
                    :value="cell.number" 
                    :ref="`input-${sectionIndex}-${cellIndex}`"
                    v-bind:readonly="cell.locked ? 'readonly' : null">
            </div>
        </div>
    </div>
    <div class="sudoku-controls">
        <button @click="solveBoard()">Solve</button>
        <button @click="checkForError()">Check for Errors</button>
        <button @click="showWrongCells = !showWrongCells">Show Errors ({{showWrongCells}})</button>

        <div class="spacer"></div>

        <button @click="resetBoard()">Reset Board</button>
    </div>
</div>
</template>

<script>
export default {
  props: {
    difficulty: {
        type: Number,
        required: true
    }
  },
  watch: {
    difficulty(){
        this.boardLoading = true
        this.sudokuSolved = false
        this.showWrongCells = false
        this.sudokuBoard = this.createBoard()
        this.fetchBoard();
    }
  },
  data() {
    return {
        sudokuBoard: [],
        solvedBoard: [],
        curSelected: null,
        boardLoading: true,
        sudokuSolved: false,
        showWrongCells: false
    };
  },
  beforeMount(){
    console.log("populating board")
    this.sudokuBoard = this.createBoard()

    console.log("fetch board")
    this.fetchBoard()
  },
  methods: {
    /* INTERFACE */
    handleMouseOver(sectionIndex, cellIndex){
        const inpName = `input-${sectionIndex}-${cellIndex}`
        if(this.curSelected != inpName){
            this.curSelected = inpName
            if(!this.sudokuBoard[sectionIndex][cellIndex].locked){
                this.sudokuBoard[sectionIndex][cellIndex].selected = true
                this.$refs[inpName][0].focus()
            }
        }
    },
    handleMouseOut(sectionIndex, cellIndex){
        this.sudokuBoard[sectionIndex][cellIndex].selected = false
    },
    handleInput(sectionIndex, cellIndex, event){
        let inp = event.data;

        let parsed = parseInt(inp, 10);
        
        if(!isNaN(parsed) && parsed >= 1 && parsed <= 9){
            this.setCell(sectionIndex, cellIndex, inp)
        }else{
            event.preventDefault();
        }
    },
    handleKeyDown(event){
        event.preventDefault();
    },
    generateRange(start, end) {
      return Array.from({ length: end - start + 1 }, (_, index) => start + index);
    },
    checkIfIncludes(sectionIndex, cellIndex, number){
        return this.sudokuBoard[sectionIndex][cellIndex].notes.includes(number)
    },
    handleClick(sectionIndex, cellIndex, number){
        if(this.sudokuBoard[sectionIndex][cellIndex].number != null){
            this.sudokuBoard[sectionIndex][cellIndex].number = null
        }
        if(this.checkIfIncludes(sectionIndex, cellIndex, number)){
            let index = this.sudokuBoard[sectionIndex][cellIndex].notes.indexOf(number);
            if (index !== -1) {
                this.sudokuBoard[sectionIndex][cellIndex].notes.splice(index, 1);
            }
        }else{
            this.sudokuBoard[sectionIndex][cellIndex].notes.push(number)
        }
    },
    handleDbClick(sectionIndex, cellIndex, number){
        this.setCell(sectionIndex, cellIndex, number)
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
    setCell(sectionIndex, cellIndex, number){
        this.sudokuBoard[sectionIndex][cellIndex].number = number
        this.sudokuBoard[sectionIndex][cellIndex].notes = []
        this.sudokuBoard[sectionIndex][cellIndex].selected = false

        this.checkForCompletion()
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
    matchSolvedBoard(){
        for (let i = 0; i < this.sudokuBoard.length; i++) {
            for (let j = 0; j < this.sudokuBoard[i].length; j++) {
                if(!this.sudokuBoard[i][j].locked){
                    this.solvedBoard[i][j].locked = false
                }
            }
        }
    },
    solveBoard(){
        this.sudokuBoard = this.solvedBoard;
        
        this.checkForCompletion()
    },
    checkForCompletion(){
        let done = true
        for (let i = 0; i < this.sudokuBoard.length; i++) {
            for (let j = 0; j < this.sudokuBoard[i].length; j++) {
                if(this.sudokuBoard[i][j].number != this.solvedBoard[i][j].number){
                    if(this.sudokuBoard[i][j].number != null){
                        this.sudokuBoard[i][j].wrong = true
                    }
                    done = false
                }else{
                    this.sudokuBoard[i][j].wrong = false
                }
            }
        }

        if(done){
            this.sudokuSolved = true;
        }
        return done
    },
    checkForError(){
        for (let i = 0; i < this.sudokuBoard.length; i++) {
            for (let j = 0; j < this.sudokuBoard[i].length; j++) {
                if(this.sudokuBoard[i][j].wrong){
                    alert('Error made on Board')
                    console.log(i, j)
                    return true
                }
            }
        }
        alert("No errors so far")
        return false
    },
    resetBoard(){
        this.sudokuSolved = false
        for (let i = 0; i < this.sudokuBoard.length; i++) {
            for (let j = 0; j < this.sudokuBoard[i].length; j++) {
                if(!this.sudokuBoard[i][j].locked){
                    this.sudokuBoard[i][j] = {
                        number: null,
                        notes: [],
                        selected: false,
                        locked: false,
                        wrong: false,
                    }
                }
            }
        }
    },
    async fetchBoard(){
        let today = new Date();
        let tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        today = today.toISOString().split('T')[0];
        tomorrow = tomorrow.toISOString().split('T')[0];

        const query = `created >= "${today}" && created <= "${tomorrow}" && difficulty = ${this.difficulty}`

        // console.log(query)
        const resultList = await pb.collection('boards').getList(1, 10, {
            filter: query,
        });

        if(resultList.items.length == 1){
            this.sudokuBoard = this.convertToSubgrids(resultList.items[0].board)
            this.solvedBoard = this.convertToSubgrids(resultList.items[0].solved_board)

            this.matchSolvedBoard()

            this.boardLoading = false
        }else{
            console.error("Error loading board")
        }

        console.log(resultList)
    }
  },
};
</script>

<style>
:root {
    --cell-size: 52px;
}

.confetti-container{
    position: absolute;
    left: calc((var(--cell-size) * 4.5));
    top: calc((var(--cell-size) * 4.5));
    background-color: black;
}

</style>

<style scoped>
.sudoku-container{
    user-select: none;
    transition: 0.1s;

    width: calc(var(--cell-size) * 3 * 3 + 4px);
}

.sudoku-board{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: calc(var(--cell-size) * 3 * 3);
    height: calc(var(--cell-size) * 3 * 3);
}

.sudoku-board.loading{
    filter: blur(4px);
    pointer-events: none;
}

.sudoku-board-section{
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    width: calc(var(--cell-size) * 3);
    height: calc(var(--cell-size) * 3);

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

    height: calc(var(--cell-size) - 4);
    width: calc(var(--cell-size) - 4);

    border: 1px solid gray;
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
    font-size: 8px;
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

    font-size: calc(var(--cell-size) / 2);

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

/* game */

.sudoku-board-section-cell[wrong="true"] > input{
    color: var(--color-accent-sec);
}

.sudoku-board-section-cell[selected="true"] > .sudoku-board-section-cell-notes{
    visibility: visible;
    background-color: var(--color-background-solid);
    color: var(--color-text-solid);
}

.sudoku-board-section-cell[selected="true"] > .sudoku-board-section-cell-notes > span[selected="true"]{
    background-color: var(--color-background-sec);
}

.sudoku-board-section-cell[selected="true"] > .sudoku-board-section-cell-notes > span:hover{
    background-color: var(--color-accent-transparent);
}

.sudoku-board-section-cell-notes > span[selected="true"]{
    visibility: visible;
    color: var(--color-text);
}

/* controls */
.sudoku-controls{
    margin-top: 16px;
    display: flex;
    flex-wrap: nowrap;
    gap: 6px;
}

.sudoku-controls .spacer{
    flex-grow: 1;
}
</style>
