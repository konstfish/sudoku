<script setup>
import { pb } from '../lib/pocketbase'
import { solveBus } from '../lib/solveBus' 

import { formatDateExact, formatTime } from '../lib/helpers'

import IconCheck from './icons/IconCheck.vue'
import IconHeart from './icons/IconHeart.vue'
import IconTrash from './icons/IconTrash.vue'
import IconClock from './icons/IconClock.vue'
</script>

<template>
    <div class="comment section" v-if="comment">
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
</template>

<script>
export default {
  name: 'Comment',
  props: {
    comment: {
        type: [Object, null],
        required: true
    }
  },
  watch: {
    comment(){
        this.initComponent();
    }
  },
  data() {
    return {
    };
  },
  beforeMount(){
    this.initComponent();
  },
  methods: {
    initComponent(){
        if(this.comment != null){
            this.fetchReplies();
        }
    },
    async fetchReplies(){    
        /*   
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
        }*/ 
    },
    async fetchUserComment(){
        if(this.authStore.isValid){
            const records = await pb.collection('comments').getList(1, 1, {
                filter: `user_id = "${this.authStore.model.id}"`,
                expand: "user_id",
            });
        }
    },
    async deleteComment(commentId){
        console.log(commentId)
        try{
            await pb.collection('comments').delete(commentId);

            solveBus.emit('commentDeleted', commentId);
        }catch(err){
            console.log(err)
        }
    }
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