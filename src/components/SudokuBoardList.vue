<script setup>
import { pb } from '../lib/pocketbase'

import { formatDate } from '../lib/helpers'

import SudokuBoardMin from './SudokuBoardMin.vue';
import SudokuViewer from './SudokuViewer.vue';
import Modal from './Modal.vue';
</script>

<template>
    <div class="solved-boards">
        <span v-if="boardsLoading">Loading...</span>
        <div v-for="board in solvedBoards" :key="board" class="solved-board section">
            <div class="board">
                <SudokuBoardMin :sudokuBoardInp="board.expand.board_id.board" :solvedBoardInp="board.expand.board_id.solved_board" />
            </div>
            <div class="info">
                <h3>{{ formatDate(board.expand.board_id.created) }}</h3>
                <h4>
                  <span v-if="board.expand.board_id.difficulty == 1">Easy</span>
                  <span v-if="board.expand.board_id.difficulty == 2">Medium</span>
                  <span v-if="board.expand.board_id.difficulty == 3">Hard</span>
                </h4>
                <div class="stats">
                <span>Solve time: {{ formatTime(board.solve_time) }}</span>
                </div>
                <button @click="showReplay(board.id)">Show Replay</button>
            </div>
        </div>
        <Modal v-show="replayVisible" width="320" height="400" @close="closeModal()">
          <SudokuViewer v-if="boardData" :boardData="boardData" />
        </Modal>
    </div>
</template>

<script>
export default {
  data() {
    return {
      boardsLoading: true,
      solvedBoards: [],
      replayVisible: false,
      boardData: null
    };
  },
  beforeMount(){
    this.fetchBoards();
  },
  methods: {
    async fetchBoards(){
      const records = await pb.collection('solved_boards').getList(1, 5, {
          expand: "board_id",
          sort: "-created"
      });

      console.log(records.items)

      this.solvedBoards = records.items
      this.boardsLoading = false
    },
    showReplay(boardId){
      const temp = this.solvedBoards.find(obj => obj.id === boardId);
      console.log(this.solvedBoards.find(obj => obj.id === boardId))
      this.boardData = {
        board: temp.expand.board_id.board,
        steps: temp.steps,
        solve_time: temp.solve_time
      }
      this.replayVisible = true;
    },
    formatTime(time){
      const seconds = time % 60;
      const minutes = Math.floor(time / 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    },
    closeModal(){
      this.boardData = null;
      this.replayVisible = false;
    },
  }
};
</script>

<style scoped>
.solved-board{
  height: 240px;

  display: flex;
}

.solved-board .board{
  margin-right: 12px;
  padding-right: 12px;
  border-right: 1px solid var(--color-background-sec);
}

.solved-board .info{
  display: flex;
  flex-wrap: wrap;
  flex-direction: column; 
}

.solved-board .info .stats{
  margin-bottom: auto;
}

.solved-board .info button{
  margin: 0;
}

@media screen and (max-width: 470px) {
  .solved-board{
    justify-content: center;
    height: auto;
    flex-direction: column;
  }

  .solved-board .board{
    align-self: center;
    margin: 6px;
    padding-right: 0;
    border-right: none;
  }

  .solved-board .info{
    margin: 6px;
  }
}
</style>