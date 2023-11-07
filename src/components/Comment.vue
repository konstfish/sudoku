<script setup>
import { pb } from '../lib/pocketbase'
import { solveBus } from '../lib/solveBus' 

import { formatDateExact, formatTime } from '../lib/helpers'

import IconCheck from './icons/IconCheck.vue'
import IconHeart from './icons/IconHeart.vue'
import IconTrash from './icons/IconTrash.vue'
import IconClock from './icons/IconClock.vue'
import IconChat from './icons/IconChat.vue'
import IconChevron from './icons/IconChevron.vue'
</script>

<template>
    <div class="ind-comment-container">
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
                        <span v-if="pb.authStore.isValid">
                            <span v-if="comment.expand.user_id.id == pb.authStore.model.id" @click="deleteComment(comment.id)" class="comment-trash"><IconTrash /></span>
                        </span>
                    </span>
                </div>
                <span class="comment-solve-time" v-if="comment.show_time">
                    <IconClock />{{ formatTime(comment.solve_time) }}
                </span>
            </div>
            <div class="comment-text">
                {{ comment.text }}
            </div>

            <IconChevron class="comment-chevron" :class="{rotateChevron: repliesShown}" @click="openReplies()" />

            <div class="comment-replay" v-if="comment.show_replay">
                <!-- todo -->
            </div>
        </div>

        <div class="replies" ref="replies">
            <div class="reply section" v-for="reply in replies" :key="reply">
                <div class="comment-about">
                    <div class="comment-head">
                        <span class="comment-user">
                            {{ reply.expand.user_id.username }}
                            <span class="badge-container">
                                <span v-if="reply.expand.user_id.verified" class="badge comment-user-verified"><IconCheck /></span>
                                <span class="badge-label">Verified</span>
                            </span>
                            <span class="badge-container">
                                <span v-if="reply.expand.user_id.supporter" class="badge comment-user-supporter"><IconHeart /></span>
                                <span class="badge-label">Supporter</span>
                            </span>
                        </span>

                        <span class="comment-created">
                            {{ formatDateExact(reply.created) }}
                            <span v-if="pb.authStore.isValid">
                                <span v-if="reply.expand.user_id.id == pb.authStore.model.id" @click="deleteReply(reply.id)" class="comment-trash"><IconTrash /></span>
                            </span>
                        </span>
                    </div>
                </div>
                <div class="comment-text">
                    {{ reply.text }}
                </div>
            </div>

            <form @submit.prevent class="add-reply section" v-if="pb.authStore.isValid">
                <label for="text"><span><IconChat /> Reply</span></label>
                <div class="reply-submit">
                    <input id="text" placeholder="Reply" v-model="text" />
                    <button type="submit" @click="submitReply()">Submit</button>
                </div>
            </form>
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
        replies: [],
        repliesShown: false,
        text: ""
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
        try{
            const records = await pb.collection('comment_replies').getList(1, 30, {
                filter: `comment_id = "${this.comment.id}"`,
                expand: "user_id",
                sort: "+created",
                requestKey: this.comment.id
            });

            console.log(this.replies)

            this.replies = records.items
        }catch(err){
            console.log(err)
        }
    },
    async submitReply(){
        try{
            const data = {
                "comment_id": this.comment.id,
                "user_id": pb.authStore.model.id,
                "text": this.text
            };

            const record = await pb.collection('comment_replies').create(data);

            this.text = ""

            this.fetchReplies();

            setTimeout(() => {
                this.$refs.replies.style.maxHeight = this.$refs.replies.scrollHeight + 200 + "px";
            }, 250);
        }catch(err){
            console.err(err);
        }
    },
    async deleteReply(replyId){
        try{
            await pb.collection('comment_replies').delete(replyId);

            /* todo rewrite to make this cleaner*/

            this.fetchReplies();
        }catch(err){
            console.log(err)
        }
    },
    async deleteComment(commentId){
        try{
            await pb.collection('comments').delete(commentId);

            solveBus.emit('commentDeleted', commentId);
        }catch(err){
            console.log(err)
        }
    },
    openReplies(){
        if(this.repliesShown){
            this.$refs.replies.style.maxHeight = "0px";
        }else{
            this.$refs.replies.style.maxHeight = this.$refs.replies.scrollHeight + 200 + "px";
        }
        this.repliesShown = !this.repliesShown;

    }
  }
};
</script>

<style scoped>
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

.replies{
    margin-left: 12px;
    padding-left: 12px;
    border-left: 1px solid var(--color-background-sec);
    display: flex;
    flex-direction: column;

    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease;
}

input{
  border-radius: 8px;
  padding: 6px;
  width: calc(100% - 12px - 60px);
}

.reply-submit{
    display: flex;
    justify-content: space-between;
    gap: 6px;
}

.comment-chevron{
    transition: transform 0.1s ease;
}

.rotateChevron{
    transform: rotate(0.5turn);
}

</style>