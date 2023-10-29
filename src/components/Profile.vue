<script setup>
import { pb } from '../lib/pocketbase'

import { formatDate } from '../lib/helpers'

import SudokuBoardList from './SudokuBoardList.vue'

import Modal from './Modal.vue'

import IconUser from './icons/IconUser.vue'
import IconMail from './icons/IconMail.vue'
import IconClock from './icons/IconClock.vue'
</script>

<template>
  <div class="profile-container">
    <div class="user-info section">
      <div class="general">
        <div class="input-group">
          <div class="inplab">
            <label for="username"><span><IconUser /> Username</span></label>
            <input type="text" id="username" v-model="username" />
          </div>
          <button v-if="username != storeUser" @click="changeUsername()">Change</button>
        </div>

        <div class="input-group">
          <div class="inplab">
            <label for="email"><span><IconMail /> Mail <span v-if="!verified">(Unverified)</span></span></label>
            <input type="text" id="email" v-model="email" disabled />
          </div>
          <button v-if="!verified" @click="verifyMail()">Verify</button>
        </div>

        <div class="inplab">
          <label for="registered"><span><IconClock /> Registered Since</span></label>
          <input type="text" id="registered" v-model="registered" disabled />
        </div>
      </div>
      <div class="stats">
        <button @click="logoutUser()">Logout</button>
      </div>
    </div>

    <Modal v-show="emailModal" @close="emailModal = false" width="200" height="100">Please check your email!</Modal>

    <hr>

    <SudokuBoardList />
  </div>
</template>

<script>
export default {
  components: { Modal },
  data() {
    return {
      username: pb.authStore.model.username,
      storeUser: pb.authStore.model.username,
      email: pb.authStore.model.email,
      verified: pb.authStore.model.verified,
      registered: formatDate(pb.authStore.model.created),
      emailModal: false
    };
  },
  beforeMount(){
  },
  methods: {
    async changeUsername(){
      const data = {
        "username": this.username,
      };
      
      try{
        const record = await pb.collection('users').update(pb.authStore.model.id, data);
        if (pb.authStore.isValid) {
          console.log("refresh auth")
          await pb.collection('users').authRefresh();
          this.storeUser = pb.authStore.model.username
        }
      }catch(err){
        console.log(err)
      }
    },
    async verifyMail(){
      await pb.collection('users').requestVerification(this.email);
      this.emailModal = true;
      this.verified = true;
    },
    async logoutUser(){
        pb.authStore.clear();
    },
  }
};
</script>

<style scoped>
.user-info{
  height: 180px;
  display: flex;
  justify-content: space-between;
}

.general {
  height: 180px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-between;
}

input{
  border-radius: 8px;
  padding: 6px;
  width: 180px;
  height: 15px;
}

label{
  margin-bottom: 4px;
}

.input-group{
  display: flex;
  gap: 12px;
}

.input-group button{
  padding: 6px;
  height: 28.8px; /* ???? frontend sux */
  align-self: flex-end;
}

.stats{
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.stats button{
  flex-grow: none;
}
</style>