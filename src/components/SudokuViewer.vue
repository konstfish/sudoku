<script setup>
import Timer from './Timer.vue'

import { mlog, merr } from '../lib/helpers'
</script>

<template>
<div class="sudoku-container">
    <div class="sudoku-board" v-bind:class="{ loading: boardLoading }">
        <div v-for="(section, sectionIndex) in sudokuBoard" :key="sectionIndex" class="sudoku-board-section">
            <div v-for="(cell, cellIndex) in section" :key="cellIndex" class="sudoku-board-section-cell"
                :selected="cell.selected"
                :wrong="cell.wrong && showWrongCells"
            >
                <div class="sudoku-board-section-cell-notes" :ref="`overlay-${sectionIndex}-${cellIndex}`">
                    <span v-for="number in generateRange(1, 9)" 
                        :key="number"
                        :selected="checkIfIncludes(sectionIndex, cellIndex, number)"
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

        <input type="range" min="1" max="100" v-model="stepProgress" @input="updateProgress" class="slider">
        <Timer :elapsedTime="elapsedTime" :timerStart="false"/>
    </div>
</div>
</template>

<script>
export default {
  props: {
    boardData: {
        type: Object,
        required: true
    }
  },
  watch: {
  },
  data() {
    return {
        initialBoard: [],
        sudokuBoard: [],
        steps: [],
        stepProgress: 1,
        boardLoading: false,
    };
  },
  beforeMount(){
    this.initComponent();
  },
  methods: {
    /* HELPERS */
    initComponent(){
        mlog("populating board")
        this.sudokuBoard = this.createBoard()

        mlog("fetch board")
        this.loadBoards()
    },
    loadBoards(){
        this.initialBoard = this.convertToSubgrids(this.boardData.board);
        this.sudokuBoard = JSON.parse(JSON.stringify(this.initialBoard))

        this.steps = this.boardData.steps
        this.elapsedTime = this.boardData.elapsedTime

        this.boardLoading = false
    },
    checkIfIncludes(sectionIndex, cellIndex, number){
        return this.sudokuBoard[sectionIndex][cellIndex].notes.includes(number);
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
    updateProgress(){
        let stepLen = this.steps.length;
        let stepIdx = Math.floor((this.stepProgress / 100) * stepLen);

        if(stepIdx == this.steps.length){
            stepIdx -= 1
        }
        this.setBoardState(stepIdx);
    },
    setBoardState(index){
        this.sudokuBoard = JSON.parse(JSON.stringify(this.initialBoard))

        this.elapsedTime = this.steps[index].time
        for (let i = 0; i <= index; i++) {
            let step = this.steps[i]
            mlog(step)
            switch (step.action) {
                case "note":
                    this.sudokuBoard[step.sectionIndex][step.cellIndex].notes = step.number
                    break;

                case "number":
                    this.sudokuBoard[step.sectionIndex][step.cellIndex].number = step.number
                    break;
            }
        }
    },
  },
};
</script>

<style>
:root {
    --cell-size-viewer: 32px;
}
</style>

<style scoped>
.sudoku-container{
    user-select: none;
    transition: 0.1s;

    width: calc(var(--cell-size-viewer) * 3 * 3 + 4px);

    overflow-y: hidden;
}

.sudoku-board{
    display: grid;
    pointer-events: none;
    grid-template-columns: repeat(3, 1fr);
    width: calc(var(--cell-size-viewer) * 3 * 3);
    height: calc(var(--cell-size-viewer) * 3 * 3);
}

.sudoku-board.loading{
    filter: blur(4px);
}

.sudoku-board-section{
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    width: calc(var(--cell-size-viewer) * 3);
    height: calc(var(--cell-size-viewer) * 3);

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

    height: calc(var(--cell-size-viewer) - 4);
    width: calc(var(--cell-size-viewer) - 4);

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
    font-size: calc(var(--cell-size-viewer) / 5);
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

    font-size: calc(var(--cell-size-viewer) / 2);

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

</style>
