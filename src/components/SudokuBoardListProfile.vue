<script setup>
import { pb } from '../lib/pocketbase'

import { formatDate, formatTime } from '../lib/helpers'

import SudokuBoardMin from './SudokuBoardMin.vue';
import SudokuViewer from './SudokuViewer.vue';
import Modal from './Modal.vue';

import IconClock from './icons/IconClock.vue'
</script>

<template>
    <div class="solved-boards">
        <span v-if="boardsLoadingInit">Loading...</span>
        <div v-for="board in solvedBoards" :key="board" class="solved-board section">
            <div class="board">
                <SudokuBoardMin :sudokuBoardInp="board.expand.board_id.board" :solvedBoardInp="board.expand.board_id.solved_board" />
            </div>
            <div class="info">
                <h3>
                  <span>{{ formatDate(board.expand.board_id.created) }} | </span>
                  <span v-if="board.expand.board_id.difficulty == 1">Easy</span>
                  <span v-if="board.expand.board_id.difficulty == 2">Medium</span>
                  <span v-if="board.expand.board_id.difficulty == 3">Hard</span>
                </h3>
                <div class="stats">
                <span><IconClock /> {{ formatTime(board.solve_time) }}</span>
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
      boardsLoadingInit: true,
      boardsLoading: true,
      boardsToLoad: true,
      solvedBoards: [],
      replayVisible: false,
      boardData: null,
      currentPage: 1
    };
  },
  beforeMount(){
    this.fetchBoards();
    window.addEventListener('scroll', this.checkScroll);
  },
  beforeDestroy(){
    window.removeEventListener('scroll', this.checkScroll);
  },
  methods: {
    async fetchBoards(){
      this.boardsLoading = true

      const records = await pb.collection('solved_boards').getList(this.currentPage, 3, {
          expand: "board_id",
          sort: "-created"
      });

      console.log(this.currentPage, records.items)

      if(records.items.length == 0){
        this.boardsToLoad = false
      }else{
        this.solvedBoards = [...this.solvedBoards, ...records.items];
      }

      this.currentPage += 1

      this.boardsLoadingInit = false
      this.boardsLoading = false
    },
    checkScroll() {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

      if (nearBottom && !this.boardsLoading && !this.boardsLoadingInit && this.boardsToLoad) {
        this.fetchBoards();
      }
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