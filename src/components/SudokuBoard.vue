<script setup>
import { pb } from '../lib/pocketbase'
import { localStore } from '../lib/localstore'
import { solveBus } from '../lib/solveBus' 

import { generateRange, mlog, merr } from '../lib/helpers'


import { isMobile } from 'mobile-device-detect';

import Modal from './Modal.vue'
import ModalInput from './ModalInput.vue'

import ConfettiExplosion from "vue-confetti-explosion";
import Timer from './Timer.vue'
</script>

<template>
<div class="sudoku-container">
    <ConfettiExplosion  :particleCount="200" 
                    :force="0.4" 
                    :stageWidth="1000"
                    :stageHeight="1500"
                    v-if="sudokuSolved"/>
    <div class="sudoku-board" 
        v-bind:class="{ loading: !boardReady || boardLoading }"
        @mouseleave="handleMouseOutBoard()"
    >
        <div v-for="(section, sectionIndex) in sudokuBoard" :key="sectionIndex" class="sudoku-board-section">
            <div v-for="(cell, cellIndex) in section" :key="cellIndex" class="sudoku-board-section-cell"
                :selected="cell.selected"
                :wrong="cell.wrong && showWrongCells"
                @mouseenter="handleMouseEnterCell(sectionIndex, cellIndex)"
                @mouseleave="handleMouseLeaveCell(sectionIndex, cellIndex)"
            >
                <div class="sudoku-board-section-cell-notes" :ref="`overlay-${sectionIndex}-${cellIndex}`" v-if="!isMobile">
                    <span v-for="number in generateRange(1, 9)" 
                        :key="number"
                        :selected="checkIfIncludes(sectionIndex, cellIndex, number)"
                        @click="handleClick(sectionIndex, cellIndex, number)"
                        @dblclick="handleDbClick(sectionIndex, cellIndex, number)"
                    >
                        {{ number }}
                    </span>
                </div>
                <div class="sudoku-board-section-cell-notes" :ref="`overlay-${sectionIndex}-${cellIndex}`" v-if="isMobile">
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
                    v-bind:readonly="cell.locked ? 'readonly' : null"
                    v-bind:inputmode="isMobile ? 'none' : null">
            </div>
        </div>
    </div>
    <div class="sudoku-controls">
        <button @click="solveBoard()">Solve</button>
        <button @click="alertError()">Check for Errors</button>
        <button @click="showError()">Show Errors</button>

        <div class="spacer"></div>

        <button @click="undoStep()">Undo</button>
        <button @click="resetBoard()">Reset Board</button>
    </div>
    <div class="timer">
        <Timer :elapsedTime="elapsedTime" :timerStart="timerStarted" @elapsedTime="elapsedTime = $event"/>
    </div>

    <Modal v-show="infoModal" @close="infoModal = false" width="200" height="100">
        {{infoModalContent}}
    </Modal>

    <Modal v-show="completedModal" @close="completedModal = false" @confirm="postCompletion()" width="200" height="100" :showConfirm=true>
        Save replay?
    </Modal>

    <ModalInput v-if="inputModal" 
                v-show="inputModal" 
                :cell="getCurSelected()" 
                @close="handleInputModalClose()" 
                @set-note="handleModalNoteClick" 
                @set-number="handleModalNoteDbClick" />
</div>
</template>

<script>
export default {
  props: {
    boardId: {
        type: [String, null],
        required: true
    }
  },
  watch: {
    boardId(){
        this.initComponent();
    }
  },
  data() {
    return {
        sudokuBoard: [],
        solvedBoard: [],
        steps: [],
        curSelected: null,
        boardLoading: true,
        boardReady: false,
        boardCreated: null,
        boardSolvedCheated: false,
        difficulty: 1,
        sudokuSolved: false,
        showWrongCells: false,
        elapsedTime: 0,
        timerStarted: true,
        gameStarted: false,
        completedModal: false,
        inputModal: false,
        infoModal: false,
        sudokuUploaded: false,
        infoModalContent: ""
    };
  },
  beforeMount(){
    if(isMobile){
        mlog("mobile", isMobile)
    }

    this.initComponent();
  },
  methods: {
    /* HELPERS */
    initComponent(){
        this.boardLoading = true
        this.sudokuSolved = false
        this.showWrongCells = false
        this.boardReady = false
        this.sudokuUploaded = false
        this.steps = []

        solveBus.emit('boardUnsolved');

        // todo, actual game start & clean up unused/useless variables
        this.timerStarted = true
        this.elapsedTime = 0

        mlog("populating board")
        this.sudokuBoard = this.createBoard()

        if(this.boardId){
            mlog("fetch board")
            this.fetchBoard();

            mlog("check localstorage")
            this.checkStorage()
        }
    },
    setCell(sectionIndex, cellIndex, number){
        this.logStep('note', sectionIndex, cellIndex, this.sudokuBoard[sectionIndex][cellIndex].notes, [])
        this.logStep('number', sectionIndex, cellIndex, this.sudokuBoard[sectionIndex][cellIndex].number, number)

        this.sudokuBoard[sectionIndex][cellIndex].number = number
        this.sudokuBoard[sectionIndex][cellIndex].selected = false
        this.sudokuBoard[sectionIndex][cellIndex].notes = []

        this.checkForCompletion()
    },
    setCellNote(sectionIndex, cellIndex, number){
        const preNotes = [...this.sudokuBoard[sectionIndex][cellIndex].notes]
        if(this.checkIfIncludes(sectionIndex, cellIndex, number)){
            let index = this.sudokuBoard[sectionIndex][cellIndex].notes.indexOf(number);
            if (index !== -1) {
                this.sudokuBoard[sectionIndex][cellIndex].notes.splice(index, 1);
            }
        }else{
            this.sudokuBoard[sectionIndex][cellIndex].notes.push(number)
        }
        /* rewrite this at some point */
        this.sudokuBoard[sectionIndex][cellIndex].wrong = false
        const curNotes = [...this.sudokuBoard[sectionIndex][cellIndex].notes]
        this.logStep('note', sectionIndex, cellIndex, preNotes, curNotes)
    },
    checkIfIncludes(sectionIndex, cellIndex, number){
        return this.sudokuBoard[sectionIndex][cellIndex].notes.includes(number);
    },
    /* INTERFACE */
    handleMouseEnterCell(sectionIndex, cellIndex){
        const inpName = `input-${sectionIndex}-${cellIndex}`
        if(this.curSelected != inpName){
            this.curSelected = inpName
            if(!this.sudokuBoard[sectionIndex][cellIndex].locked){
                this.sudokuBoard[sectionIndex][cellIndex].selected = true
                if(!isMobile){
                    this.$refs[inpName][0].focus()
                }
            }
        }

        if(isMobile){
            setTimeout(() => {
                this.inputModal = true
            }, 100);
        }
    },
    getCurSelected(){
        if(this.curSelected != null){
            let idx = this.curSelected.split("-")

            return this.sudokuBoard[idx[1]][idx[2]]
        }
        return null
    },
    handleMouseLeaveCell(sectionIndex, cellIndex){
        this.sudokuBoard[sectionIndex][cellIndex].selected = false
    },
    handleMouseOutBoard(){
        if(!isMobile){
            this.curSelected = null
        }
    },
    handleInputModalClose(){
        this.inputModal = false
        this.curSelected = null
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
    handleModalNoteClick(number){
        if(this.curSelected != null){
            let idx = this.curSelected.split("-")

            this.handleClick(idx[1], idx[2], number)
        }
    },
    handleModalNoteDbClick(number){
        if(this.curSelected != null){
            this.inputModal = false

            let idx = this.curSelected.split("-")

            this.handleDbClick(idx[1], idx[2], number)
        }
    },
    handleClick(sectionIndex, cellIndex, number){
        if(this.sudokuBoard[sectionIndex][cellIndex].number != null){
            this.setCell(sectionIndex, cellIndex, null)
        }
        this.setCellNote(sectionIndex, cellIndex, number)
    },
    handleDbClick(sectionIndex, cellIndex, number){
        this.setCell(sectionIndex, cellIndex, number)
    },
    /* pocketbase */
    async postCompletion(){
        if(pb.authStore.isValid){
            mlog("posting result")

            const data = {
                "user_id": pb.authStore.model.id,
                "board_id": this.boardId,
                "solve_time": this.elapsedTime,
                "steps": this.steps
            };

            // todo trycatch
            try{
                const record = await pb.collection('solved_boards').create(data);
                this.sudokuUploaded = true
                this.updateStorage()
            }catch{
                merr("Error loading board")
            }
        }
        this.completedModal = false
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
        for (let i = 0; i < this.sudokuBoard.length; i++) {
            for (let j = 0; j < this.sudokuBoard[i].length; j++) {
                this.sudokuBoard[i][j] = this.solvedBoard[i][j]
            }
        }

        this.boardSolvedCheated = true

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
            this.timerStarted = false;
            // wait for confetti (if user is signed in)
            if(!this.boardSolvedCheated){
                setTimeout(() => {
                    if(pb.authStore.isValid && !this.sudokuUploaded){
                        this.completedModal = true;
                    }
                    solveBus.emit('boardSolved', {boardId: this.boardId, elapsedTime: this.elapsedTime});
                }, 1000);
            }
        }
        return done
    },
    checkForError(){
        for (let i = 0; i < this.sudokuBoard.length; i++) {
            for (let j = 0; j < this.sudokuBoard[i].length; j++) {
                if(this.sudokuBoard[i][j].wrong){
                    return true
                }
            }
        }
        return false
    },
    alertError(){
        if(this.checkForError()){
            this.infoModalContent = "Error found on board!"
        }else{
            this.infoModalContent = "No errors so far!"
        }
        this.infoModal = true
    },
    showError(){
        if(this.checkForError()){
            this.showWrongCells = true

            // hide again in 10 seconds
            window.setTimeout(() => {
                this.showWrongCells = false
            }, 10 * 1000)
        }else{
            this.alertError()
        }
    },
    resetBoard(){
        this.sudokuSolved = false
        this.elapsedTime = 0
        this.timerStarted = true
        this.steps = []

        localStore.remove(this.boardId)
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
        mlog(this.boardId)
        if(this.boardId){
            try{
                const record = await pb.collection('boards').getOne(this.boardId);

                this.sudokuBoard = this.convertToSubgrids(record.board)
                this.solvedBoard = this.convertToSubgrids(record.solved_board)
                this.boardCreated = record.created

                this.difficulty = record.difficulty

                this.matchSolvedBoard()
                this.boardLoading = false
            }catch{
                merr("Error loading board")
            }
        }
    },

    checkStorage(){
        let restore = localStore.check(this.boardId);

        if(restore){
            let gameState = localStore.get(this.boardId);

            this.elapsedTime = gameState.time
            this.steps = gameState.steps
            this.sudokuSolved = gameState.complete
            this.sudokuUploaded = gameState.uploaded
            if(this.sudokuSolved){
                this.timerStarted = false
            }

            this.restoreSteps(this.steps);
        }else{
            this.boardReady = true;
        }
    },

    /* step history */
    logStep(action, sectionIndex, cellIndex, prevNumber, number){
        const tempStep = {
            action: action,
            time: this.elapsedTime,
            sectionIndex: sectionIndex,
            cellIndex: cellIndex,
            number: number,
            prevNumber: prevNumber
        }

        this.steps.push(tempStep)
        this.updateStorage()
    },

    undoStep(){
        if(this.steps.length > 0){
            const step = this.steps.pop()
            mlog(step);

            switch (step.action) {
                case "note":
                    this.sudokuBoard[step.sectionIndex][step.cellIndex].notes = step.prevNumber
                    break;

                case "number":
                    this.sudokuBoard[step.sectionIndex][step.cellIndex].number = step.prevNumber
                    break;
            }

            this.checkForCompletion()
            window.setTimeout(() => {
                this.updateStorage()
            }, 100)
        }
    },

    updateStorage(){
        const data = {
            created: this.boardCreated,
            steps: this.steps, 
            time: this.elapsedTime, 
            complete: this.sudokuSolved, 
            uploaded: this.sudokuUploaded
        }
        localStore.set(this.boardId, data);
    },
    
    restoreSteps(steps){
        if(this.boardLoading) {
            window.setTimeout(this.restoreSteps, 100, steps);
        } else {
            for (var step of steps) {
                switch (step.action) {
                    case "note":
                        this.sudokuBoard[step.sectionIndex][step.cellIndex].notes = step.number
                        break;

                    case "number":
                        this.sudokuBoard[step.sectionIndex][step.cellIndex].number = step.number
                        break;
                }
            }
            this.checkForCompletion()
            this.boardReady = true
        }
    }
  },
};
</script>

<style>
:root {
    --cell-size: 52px;
}

@media screen and (max-width: 470px) {
    :root{
        --cell-size: 42px;
    }
}

@media screen and (max-width: 425px) {
    :root{
        --cell-size: 32px;
    }
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

    overflow-y: hidden;
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
    font-size: calc(var(--cell-size) / 4.8);
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

    transition: 0.2s;
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

/* timer */
.timer{
    margin-top: 4px;
    text-align: center;
}
</style>
