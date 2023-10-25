<script setup>
import { pb } from '../lib/pocketbase'

import IconGoogle from './icons/IconGoogle.vue'
</script>

<template>
  <div class="auth-container">
    <div class="login-container">

    </div>

    <div class="register-container">

    </div>

    <button>Sign In</button>

    <button @click="googleSignIn()"><IconGoogle /> Sign in with Google</button>
  </div>
</template>


<script>
export default {
  data() {
    return {
        
    };
  },
  beforeMount(){
    console.log('asdf')
  },
  methods: {
    async googleSignIn(){
        const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
        console.log(authData)

        console.log(pb.authStore.isValid);
        console.log(pb.authStore.token);
        console.log(pb.authStore.model.id);
    },
  }
};
</script>

<style>

</style>
