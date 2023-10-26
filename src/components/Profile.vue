<script setup>
import { pb } from '../lib/pocketbase'

import Modal from './Modal.vue'
import SudokuViewer from './SudokuViewer.vue'
import SudokuBoardMin from './SudokuBoardMin.vue'
</script>

<template>
  <div class="profile-container">
    <div class="user-info section">
        Username: {{ pb.authStore.model.username }}
        <br>
        Email: {{ pb.authStore.model.email }}
        <br>
        Registered on: {{ pb.authStore.model.created }}
        <br>
        <button @click="logoutUser()">Logout</button>
    </div>

    <hr>

    <div class="solved-boards">
      <span v-if="boardsLoading">Loading...</span>
      <div v-for="board in solvedBoards" :key="board" class="solved-board section">
        <div class="board">
          <SudokuBoardMin :sudokuBoardInp="board.expand.board_id.board" :solvedBoardInp="board.expand.board_id.solved_board" />
        </div>
        <div class="info">
          <h3>{{ formatDate(board.expand.board_id.created) }}</h3>
          <div class="stats">
            <p>Solve time: {{ formatTime(board.solve_time) }}</p>
            <p>Difficulty: {{ board.expand.board_id.difficulty }}</p>
          </div>
          <button @click="showReplay(board.id)">Show Replay</button>
        </div>
      </div>
    </div>

    <Modal v-show="replayVisible" @close="closeModal()">
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
    formatDate(date) {
      let dt = new Date(Date.parse(date));

      var day = dt.getDate();
      var month = dt.getMonth() + 1;
      var year = dt.getFullYear();
      var formattedDate = `${day < 10 ? '0' : ''}${day} ${month < 10 ? '0' : ''}${month} ${year}`;

      return formattedDate
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
    async logoutUser(){
        pb.authStore.clear();
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
  margin: auto;
  margin-top: 0px;
}

.solved-board .info button{
  margin: 0;
}

</style>