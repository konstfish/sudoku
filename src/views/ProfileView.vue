<script setup>
import { pb } from '../lib/pocketbase'

import Auth from '../components/Auth.vue'
import Profile from '../components/Profile.vue'
</script>

<template>
  <div class="profile">
    <Profile v-if="signedIn" />
    <Auth v-else />
  </div>
</template>


<script>
export default {
  data() {
    return {
      signedIn: pb.authStore.isValid
    };
  },
  beforeMount(){
    pb.authStore.onChange(() => {
      this.signedIn = pb.authStore.isValid
    }, true)
  },
  methods: {

  },
};
</script>

<style>

</style>
