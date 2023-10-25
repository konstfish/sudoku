<script setup>
import { pb } from '../lib/pocketbase'
</script>

<template>
  <div class="profile-container">

    <div class="user-info">
        Username: {{ pb.authStore.model.username }}
        <br>
        Email: {{ pb.authStore.model.email }}
        <br>
        Registered on: {{ pb.authStore.model.created }}
    </div>

    <button @click="logoutUser()">Logout</button>
  </div>
</template>


<script>
export default {
  data() {
    return {
    };
  },
  beforeMount(){
  },
  methods: {
    async logoutUser(){
        pb.authStore.clear();
    },
  }
};
</script>

<style scoped>
button{
  transition: 0.4s;
}
</style>