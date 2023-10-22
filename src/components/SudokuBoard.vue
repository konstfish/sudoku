<script setup>
    defineProps({
    msg: {
        type: String,
        required: false
    }
    })
</script>

<template>
<div class="sudoku-container">
    <div class="sudoku-board">
        <div v-for="(section, sectionIndex) in sudokuBoard" :key="sectionIndex" class="sudoku-board-section">
            <div v-for="(cell, cellIndex) in section" :key="cellIndex" :selected="cell.selected" class="sudoku-board-section-cell"
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
</div>
</template>

<script>
export default {
  data() {
    return {
        sudokuBoard: [],
        curSelected: null
    };
  },
  beforeMount(){
    console.log("populating board")
    for(let i = 0; i < 9; i++){
        let tempSection = []
        for(let j = 0; j < 9; j++){
            tempSection.push(
                {number: null,
                notes: [],
                selected: false,
                locked: false}
            )
        }
        this.sudokuBoard.push(tempSection)
    }

    console.log("loading board")
    this.convertToSubgrids(
        [[0, 0, 1, 0, 5, 3, 6, 7, 8], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 7, 8, 1, 0, 9, 2, 0, 5], [1, 2, 0, 7, 0, 5, 0, 8, 0], [3, 0, 0, 0, 9, 1, 7, 0, 0], [7, 8, 0, 4, 2, 0, 0, 0, 1], [4, 0, 2, 5, 0, 0, 1, 0, 3], [0, 1, 3, 9, 6, 0, 0, 0, 0], [8, 0, 0, 3, 0, 0, 5, 6, 0]]    );
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
        
        console.log(parsed)

        if(!isNaN(parsed) && parsed >= 1 && parsed <= 9){
            this.sudokuBoard[sectionIndex][cellIndex].number = inp
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
        this.sudokuBoard[sectionIndex][cellIndex].number = number
        this.sudokuBoard[sectionIndex][cellIndex].notes = []

        this.sudokuBoard[sectionIndex][cellIndex].selected = false
    },
    /* LOGIC */
    convertToSubgrids(board) {
        for (let i = 0; i < this.sudokuBoard.length; i++) {
            for (let j = 0; j < this.sudokuBoard[i].length; j++) {
                const row = Math.floor(i / 3) * 3 + Math.floor(j / 3);
                const col = (i % 3) * 3 + (j % 3);
                const number = board[row][col];

                this.sudokuBoard[i][j].number = number !== 0 ? number : null;
                this.sudokuBoard[i][j].locked = number !== 0;
            }
        }
    }
  },
};
</script>

<style>
:root {
    --cell-size: 52px;
}
</style>

<style scoped>
.sudoku-container{
    user-select: none;
}

.sudoku-board{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: calc(var(--cell-size) * 3 * 3);
    height: calc(var(--cell-size) * 3 * 3);
}

.sudoku-board-section{
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    width: calc(var(--cell-size) * 3);
    height: calc(var(--cell-size) * 3);

    border: 1px solid white;
    border-top-width: 0px;
    border-right-width: 0px;
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
    background-color: rgba(0, 0, 0, 0);
    color: rgba(255, 255, 255, 0);

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

    color: white;

    user-select: none;
    cursor: default;
    caret-color: transparent;
    box-sizing: border-box;
}

input:read-only{
    color: darkgray;
}

/* game */

.sudoku-board-section-cell[selected="true"] > .sudoku-board-section-cell-notes{
    visibility: visible;
    background-color: rgba(0, 0, 0, 1);
    color: rgba(255, 255, 255, 1);
}

.sudoku-board-section-cell[selected="true"] > .sudoku-board-section-cell-notes > span[selected="true"]{
    background-color: grey;
}

.sudoku-board-section-cell-notes > span:hover{
    background-color: lightblue;
}

.sudoku-board-section-cell-notes > span[selected="true"]{
    visibility: visible;
    color: rgba(255, 255, 255, 1);
}

</style>
