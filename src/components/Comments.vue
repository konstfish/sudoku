<script setup>
import { pb } from '../lib/pocketbase'
import { localStore } from '../lib/localstore'
import { solveBus } from '../lib/solveBus' 

import { formatDateExact, formatTime } from '../lib/helpers'

import IconChat from './icons/IconChat.vue'
import IconReplay from './icons/IconReplay.vue'


import IconCheck from './icons/IconCheck.vue'
import IconHeart from './icons/IconHeart.vue'
import IconTrash from './icons/IconTrash.vue'
import IconClock from './icons/IconClock.vue'
</script>

<template>
    <div class="comments">
        <div class="comment-input-container">
            <div v-if="!boardComplete || !pb.authStore.isValid" class="comment-input-blur">
                <span v-if="!pb.authStore.isValid">Please sign in to leave a comment</span>
                <span v-else-if="!boardComplete">Please complete the board to comment</span>
            </div>

            <div class="comment-input section" v-bind:class="{ blur: !boardComplete || !pb.authStore.isValid }">
                <label for="text"><span><IconChat /> Comment</span></label>
                <textarea id="text" v-model="text" />

                <div class="comment-input-options">
                    <div class="comment-input-options-check">
                        <div class="comment-input-options-check-single">
                            <label for="showSolveTime">
                                <span><IconClock /> Show Solve time</span>
                                <input type="checkbox" class="checkbox" id="showSolveTime" v-model="showSolveTime">
                                <span class="switch"></span>
                            </label>
                        </div>

                        <div class="comment-input-options-check-single">
                            <label for="showReplay">
                                <span><IconReplay /> Show Replay</span>
                                <input type="checkbox" class="checkbox" id="showReplay" v-model="showReplay">
                                <span class="switch"></span>
                            </label>
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
                            {{ comment.expand.user_id.username }}
                            <span class="badge-container">
                                <span v-if="comment.expand.user_id.verified" class="badge comment-user-verified"><IconCheck /></span>
                                <span class="badge-label">Verified</span>
                            </span>
                            <span class="badge-container">
                                <span v-if="comment.expand.user_id.supporter" class="badge comment-user-supporter"><IconHeart /></span>
                                <span class="badge-label">Supporter</span>
                            </span>
                        </span>

                        <span class="comment-created">
                            {{ formatDateExact(comment.created) }}
                            <span v-if="comment.expand.user_id.id == pb.authStore.model.id" @click="deleteComment(comment.id)" class="comment-trash"><IconTrash /></span>
                        </span>
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
      userSignedIn: pb.authStore.isValid,
      commentsLoading: true,
      comments: [],
      text: "",
      elapsedTime: 0,
      showSolveTime: true,
      showReplay: false,
      boardComplete: false,
      solve_time: null,
    };
  },
  beforeMount(){
    this.initComponent();
  },
  created(){
    solveBus.on('boardSolved', this.handleSolveEvent);
    solveBus.on('boardUnsolved', this.handleUnsolveEvent);
  },
  beforeDestroy(){
    solveBus.off('boardSolved', this.handleSolveEvent);
    solveBus.off('boardUnsolved', this.handleUnsolveEvent);
  },
  methods: {
    initComponent(){
        if(this.boardId != null){
            this.fetchComments();
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
    async fetchUserComment(){
        // todo, place on top of list
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
    async deleteComment(commentId){
        console.log(commentId)
        try{
            await pb.collection('comments').delete(commentId);

            this.fetchComments()
        }catch(err){
            console.log(err)
        }
    },
    handleSolveEvent(event) {
        if(this.boardId == event.boardId){
            this.elapsedTime = event.elapsedTime
            this.boardComplete = true
        }
    },
    handleUnsolveEvent(event){
        this.boardComplete = false
    }
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
    pointer-events: none;
}

.comment-input{
    margin-top: 42px;
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


.switch { 
   position : relative ;
   display : inline-block;
   width : 32px;
   height : 18px;
   background-color: var(--color-background);
   border: 1px solid var(--color-background-sec);
   border-radius: 20px;
 }

 .switch::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--color-text-sec);
  top: 1px; 
  left: 1px;
  transition: all 0.3s;
}

.checkbox:checked + .switch::before {
  left : 15px; 
}
.checkbox:checked + .switch {
  background-color: var(--color-accent);
}

.checkbox { 
   display : none;
}

label{
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 6px;
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
    display: flex;
    gap: 2px;
}

.comment-user-verified{
    color: var(--color-accent);
}

.comment-user-supporter{
    color: var(--color-accent-sec);
}

.badge-container {
position: relative;
display: inline-block; /* or block depending on your layout */
}

.badge-label {
  position: absolute;
  margin-top: 2px;
  margin-left: 2px;
  background-color: var(--color-background-sec);
  color: white;
  padding: 2px 5px;
  font-size: 10px;
  border-radius: 3px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease;
  user-select: none;
}

.badge-container:hover .badge-label{
    opacity: 1;
}
</style>