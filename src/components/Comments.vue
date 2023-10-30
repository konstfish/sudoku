<script setup>
import { pb } from '../lib/pocketbase'

import { formatDateExact } from '../lib/helpers'
</script>

<template>
    <div class="comments">
        <div class="comment-input">
            {{ userSignedIn }}
        </div>
        <div class="comment-list">

        </div>
        <span v-if="comments">Loading...</span>

    </div>
</template>

<script>
export default {
  data() {
    return {
      userSignedIn: pb.authStore.isValid
    };
  },
  beforeMount(){
    this.fetchBoards();
  },
  methods: {
    async fetchBoards(){
      /*const records = await pb.collection('comments').getList(1, 10, {
          expand: "board_id",
          sort: "-created"
      });

      console.log(records.items)

      this.solvedBoards = records.items
      this.boardsLoading = false*/
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