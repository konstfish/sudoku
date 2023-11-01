<script setup>
import { pb } from '../lib/pocketbase'

import { formatDate, formatTime } from '../lib/helpers'

import SudokuBoardMin from '../components/SudokuBoardMin.vue';
import SudokuViewer from '../components/SudokuViewer.vue';
import Modal from '../components/Modal.vue';

import IconClock from '../components/icons/IconClock.vue'
</script>

<template>
    <span v-if="!pb.authStore.isValid">Please sign in to view & play past Sudoku boards</span>
    <div v-else class="wrapper">
      <div class="solved-boards">
        <span v-if="boardsLoadingInit">Loading...</span>
        <div v-for="board in boardHistory" :key="board" class="solved-board section">
            <div class="board">
                <SudokuBoardMin :sudokuBoardInp="board.board" />
            </div>
            <div class="info">
                <h3>
                  <span>{{ formatDate(board.created) }} | </span>
                  <span v-if="board.difficulty == 1">Easy</span>
                  <span v-if="board.difficulty == 2">Medium</span>
                  <span v-if="board.difficulty == 3">Hard</span>
                </h3>
                <div class="stats">
                </div>
                <router-link :to="{ name: 'board', params: { id: board.id }}">
                  <button>Play Board</button>
                </router-link>
            </div>
        </div>
        <Modal v-show="replayVisible" width="320" height="400" @close="closeModal()">
          <SudokuViewer v-if="boardData" :boardData="boardData" />
        </Modal>
      </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      boardsLoadingInit: true,
      boardsLoading: true,
      boardsToLoad: true,
      boardHistory: [],
      replayVisible: false,
      boardData: null,
      currentPage: 1
    };
  },
  beforeMount(){
    this.fetchBoards();
  },
  mounted(){
    window.addEventListener('scroll', this.checkScroll);
  },
  unmounted(){
    window.removeEventListener('scroll', this.checkScroll);
  },
  methods: {
    async fetchBoards(){
      if(pb.authStore.isValid){
        this.boardsLoading = true

        const records = await pb.collection('boards').getList(this.currentPage, 3, {
            sort: "-created"
        });

        console.log(this.currentPage, records.items)

        if(records.items.length == 0){
          this.boardsToLoad = false
        }else{
          this.boardHistory = [...this.boardHistory, ...records.items];
        }

        this.currentPage += 1

        this.boardsLoadingInit = false
        this.boardsLoading = false
      }
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