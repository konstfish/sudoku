<script setup>
import { pb } from '../lib/pocketbase'

import { formatDateExact, formatTime } from '../lib/helpers'

import IconCheck from './icons/IconCheck.vue'
import IconClock from './icons/IconClock.vue'
</script>

<template>
    <div class="comments">
        <div class="comment-input">
        </div>
        <span v-if="commentsLoading">Loading...</span>
        <div class="comment-list">
            <div v-for="comment in comments" :key="comment" class="comment section">
                <div class="comment-about">
                    <div class="comment-head">
                        <span class="comment-user">
                            {{ comment.expand.user_id.username }} <span v-if="comment.expand.user_id.verified" class="check"><IconCheck /></span>
                        </span>

                        <span class="comment-created">{{ formatDateExact(comment.created) }}</span>
                    </div>
                    <span class="comment-solve-time" v-if="comment.show_time">
                        <IconClock />{{ formatTime(comment.solve_time) }}
                    </span>
                </div>
                <div class="comment-text">
                    {{ comment.text }}
                </div>
                <div class="comment-replay" v-if="comment.show_replay">
                    <!-- todo -->
                </div>
            </div>
        </div>

    </div>
</template>

<script>
export default {
  data() {
    return {
      userSignedIn: pb.authStore.isValid,
      commentsLoading: true,
      comments: []
    };
  },
  beforeMount(){
    this.fetchComments();
  },
  methods: {
    async fetchComments(){
        const records = await pb.collection('comments').getList(1, 10, {
            expand: "user_id",
            sort: "-created"
        });

        this.comments = records.items

        this.commentsLoading = false

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
.comment-list{
    display: flex;
    flex-direction: column;

    width: calc(var(--cell-size) * 9 + 4px);
}

.comment-head{
    display: flex;
    justify-content: space-between;
}

.comment-user{
    font-weight: bold;
}

.check{
    color: var(--color-accent);
}
</style>