<script setup>
import { pb } from '../lib/pocketbase'
import { solveBus } from '../lib/solveBus' 

import Comment from './Comment.vue'
</script>

<template>
    <div class="comment-list">
        <span v-if="commentsLoading">Loading...</span>

        <Comment :comment="user_comment" v-if="user_comment" id="user-comment"/>

        <div v-for="comment in comments" :key="comment">
            <Comment :comment="comment" />
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
      commentsToLoad: true,
      currentPage: 1,
      comments: [],
      user_comment: null
    };
  },
  beforeMount(){
    this.initComponent();
  },
  created(){
    solveBus.on('commentPosted', this.handleUserComment);
    solveBus.on('commentDeleted', this.handleUserCommentDelete);
  },
  beforeDestroy(){
    solveBus.off('commentPosted', this.handleUserComment);
    solveBus.off('commentDeleted', this.handleUserCommentDelete);
  },
  methods: {
    initComponent(){
        this.comments = []
        this.user_comment = null
        this.currentPage = 1
        this.commentsToLoad = true
        this.commentsLoading = true

        if(this.boardId != null){
            this.fetchComments();
        }
    },
    async fetchComments(){       
        try{
            const records = await pb.collection('comments').getList(this.currentPage, 3, {
                filter: `board_id = "${this.boardId}"`,
                expand: "user_id",
                sort: "-created"
            });

            console.log(this.currentPage, records.items)

            if(pb.authStore.isValid){
                const userComment = records.items.find(obj => obj.expand.user_id.id === pb.authStore.model.id);
                if(userComment){
                    this.user_comment = userComment
                    records.items = records.items.filter(obj => obj.expand.user_id.id !== pb.authStore.model.id);
                }
            }

            if(records.items.length == 0){
                this.commentsToLoad = false
            }else{
                this.comments = [...this.comments, ...records.items];
            }

            this.commentsLoading = false
        }catch(err){
            console.log(err)
        }
    },
    async handleUserComment(){
        if(pb.authStore.isValid){
            const records = await pb.collection('comments').getList(1, 1, {
                filter: `user_id = "${pb.authStore.model.id}" && board_id = "${this.boardId}"`,
                expand: "user_id",
            });

            this.user_comment = records.items[0]
        }
    },
    async handleUserCommentDelete(){
        this.user_comment = null
    },
  }
};
</script>

<style scoped>
.comment-list{
    display: flex;
    flex-direction: column;
    gap: 12px;

    width: calc(var(--cell-size) * 9 + 4px);
}
</style>