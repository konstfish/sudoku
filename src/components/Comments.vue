<script setup>
import { pb } from '../lib/pocketbase'
import { localStore } from '../lib/localstore'
import { solveBus } from '../lib/solveBus' 

import { formatDateExact, formatTime } from '../lib/helpers'

import IconChat from './icons/IconChat.vue'
import IconReplay from './icons/IconReplay.vue'


import IconCheck from './icons/IconCheck.vue'
import IconClock from './icons/IconClock.vue'
</script>

<template>
    <div class="comments">
        <div class="comment-input-container" v-if="commentsReady">
            <div v-if="!this.boardComplete || !pb.authStore.isValid" class="comment-input-blur">
                <span v-if="!pb.authStore.isValid">Please sign in to leave a comment</span>
                <span v-else-if="!this.boardComplete">Please complete the board to comment</span>
            </div>

            <div class="comment-input section" v-bind:class="{ blur: !this.boardComplete || !pb.authStore.isValid }">
                <label for="text"><span><IconChat /> Comment</span></label>
                <textarea id="text" v-model="text" />

                <div class="comment-input-options">
                    <div class="comment-input-options-check">
                        <div class="comment-input-options-check-single">
                            <label for="text"><span><IconClock /> Show Solve Time</span></label>
                            <input type="checkbox" id="showSolveTime" v-model="showSolveTime">
                        </div>

                        <div class="comment-input-options-check-single">
                            <label for="text"><span><IconReplay /> Show Replay</span></label>
                            <input type="checkbox" id="showReplay" v-model="showReplay">
                        </div>
                    </div>

                    <button @click="submitComment()">Submit</button>
                </div>
            </div>
        </div>

        <div class="comment-spacer"></div>

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
      commentsReady: false,
      userSignedIn: pb.authStore.isValid,
      commentsLoading: true,
      comments: [],
      text: "",
      elapsedTime: 0,
      showSolveTime: true,
      showReplay: false,
      boardComplete: false,
      solve_time: null,
      boardIdStorage: null
    };
  },
  beforeMount(){
    this.initComponent();
  },
  created(){
    solveBus.on('boardSolved', this.handleSolveEvent);
  },
  beforeDestroy(){
    solveBus.off('boardSolved', this.handleSolveEvent);
  },
  methods: {
    initComponent(){
        if(this.boardId != null){
            this.fetchComments();
            this.boardIdStorage = localStore.createKey(this.boardId)
        }
    },
    async fetchComments(){       
        try{
            const records = await pb.collection('comments').getList(1, 10, {
                filter: `board_id = "${this.boardId}"`,
                expand: "user_id",
                sort: "-created"
            });

            this.comments = records.items

            this.commentsLoading = false

            this.solvedBoards = records.items
            this.boardsLoading = false
        }catch(err){
            console.log(err)
        }
    },
    async submitComment(){
        try{
            const data = {
                "board_id": this.boardId,
                "user_id": pb.authStore.model.id,
                "solve_time": this.elapsedTime,
                "text": this.text,
                "show_time": this.showSolveTime,
                "show_replay": this.showReplay
            };

            const record = await pb.collection('comments').create(data);

            this.fetchComments()
        }catch(err){
            console.log(err);
        }
    },
    handleSolveEvent(event) {
        if(this.boardId == event.boardId){
            this.elapsedTime = event.elapsedTime
            this.boardComplete = true
        }
    },
  }
};
</script>

<style scoped>
/* comment input */

.comment-input-blur{
    position: absolute;

    display: flex;
    align-items: center;
    justify-content: center;

    width: calc(var(--cell-size) * 9 + 4px);
    height: 160px;
    background-color: rgba(0, 0, 0, 0.1);

    border-radius: 8px;
}

.blur{
    filter: blur(4px);
    transition: 0.2s;
}

.comment-input{
    transition: 0.2s;
    
    width: calc(var(--cell-size) * 9 - 14px);
}

textarea{
  border-radius: 8px;
  padding: 6px;
}

#text{
    width: calc(var(--cell-size) * 9 - 28px);
    height: 75px;
    margin-bottom: 6px;
}

.comment-input-options{
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 30px;
}

.comment-input-options-check{
    display: flex;
    gap: 12px;
}

.comment-input-options-check-single{
    display: flex;
}

.comment-spacer{
    height: 24px;
}

/* comment list */
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