<script setup>
import { pb } from '../lib/pocketbase'
import { solveBus } from '../lib/solveBus'
import { extractErrorMessage } from '../lib/helpers'

import IconChat from './icons/IconChat.vue'
import IconReplay from './icons/IconReplay.vue'
import IconClock from './icons/IconClock.vue'

import Modal from './Modal.vue'
</script>

<template>
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

        <Modal v-show="infoModal" @close="infoModal = false" width="200" height="100">{{ infoModalContent }} A user can only create one comment.</Modal>
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
      text: "",
      elapsedTime: 0,
      showSolveTime: true,
      showReplay: false,
      boardComplete: false,
      infoModal: false,
      infoModalContent: "",
    };
  },
  beforeMount(){
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

            solveBus.emit('commentPosted', record);

        }catch(err){
            this.alertUser(err);
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
    },
    alertUser(error){
      this.infoModal = true

      if(error.data.message){
        this.infoModalContent = error.data.message
      }else{
        this.infoModalContent = extractErrorMessage(error.data.data)
      }

      console.error(error.data)
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
    pointer-events: none;
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
</style>