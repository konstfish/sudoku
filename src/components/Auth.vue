<script setup>
import { pb } from '../lib/pocketbase'

import Modal from './Modal.vue'

import IconUser from './icons/IconUser.vue'
import IconMail from './icons/IconMail.vue'
import IconGoogle from './icons/IconGoogle.vue'
import PasswordInput from './PasswordInput.vue'
</script>

<template>
  <div class="auth-container">
    <div class="button-group">
      <button @click="signIn = !signIn" :class="{ active: signIn }">
        Sign In
      </button>
      <button @click="signIn = !signIn" :class="{ active: !signIn }">
        Register
      </button>
    </div>

    <div class="input-group login-container">
      
      <div class="inplab">
        <label for="email"><span><IconMail /> Mail</span></label>
        <input type="text" v-model="inputEmail" placeholder="email" @input="checkEmail" id="email">
      </div>

      <div class="inplab" v-if="!signIn">
        <label for="username"><span><IconUser /> Username</span></label>
        <input type="text" v-model="inputUsername" placeholder="username" @input="checkUsername" id="username">
      </div>

      <PasswordInput @password-validation="handlePasswordValidation" />

      <button @click="emailSignIn()" :disabled="!isPasswordValid || !isEmailValid || !buttonEnabled" v-if="signIn">
        <span v-if="!buttonEnabled" class="spinner"></span>Sign In
      </button>
      <button @click="emailRegister()" :disabled="!isPasswordValid || !isEmailValid || !isUsernameValid || !buttonEnabled" v-if="!signIn">
        <span v-if="!buttonEnabled" class="spinner"></span>Register
      </button>

      <div class="spacer">- or -</div>

      <button @click="oauthSignIn('google')"><IconGoogle /> <span v-if="signIn">Sign in</span><span v-if="!signIn">Register</span> with Google</button>
    </div>

    <Modal v-show="infoModal" @close="infoModal = false" width="200" height="100">{{ infoModalContent }}</Modal>
  </div>
</template>


<script>
export default {
  data() {
    return {
        signIn: true,
        inputEmail: "",
        inputPassword: "",
        inputUsername: "",
        isPasswordValid: false,
        isEmailValid: false,
        isUsernameValid: false,
        buttonEnabled: true,
        infoModal: false,
        infoModalContent: ""
    };
  },
  beforeMount(){
  },
  methods: {
    async oauthSignIn(provider){
        let w = window.open()

        const authData = await pb.collection('users').authWithOAuth2({ 
          provider: provider,
          urlCallback: (url) => {
            w.location.href = url
          },
        });
        console.log(authData)

        console.log(pb.authStore.isValid);
        console.log(pb.authStore.token);
        console.log(pb.authStore.model.id);
    },

    async emailSignIn(){
      this.buttonEnabled = false
        pb.collection('users').authWithPassword(this.inputEmail, this.inputPassword)
          .catch((err) => {
            this.alertUser(err)
        })
    },

    async emailRegister(){
      this.buttonEnabled = false
      const data = {
          "username": this.inputUsername,
          "email": this.inputEmail,
          "emailVisibility": false,
          "password": this.inputPassword,
          "passwordConfirm": this.inputPassword
      };

      await pb.collection('users').create(data)
        .then(() => {
          pb.collection('users').authWithPassword(this.inputEmail, this.inputPassword)
            .catch((err) => {
              this.alertUser(err)
          })
        })
        .catch((err) => {
          this.alertUser(err)
        })
    },

    alertUser(error){
      this.buttonEnabled = true
      this.infoModal = true

      if(error.data == {}){
        this.infoModalContent = error.data.message
      }else{
        this.infoModalContent = this.extractErrorMessage(error.data.data)
      }

      console.error(error.data)
    },

    extractErrorMessage(error) {
      if (error && typeof error === 'object') {
          if ('message' in error) {
              return error.message;
          }

          for (let key in error) {
              if (error.hasOwnProperty(key)) {
                  const result = this.extractErrorMessage(error[key]);
                  if (result) {
                      return result;
                  }
              }
          }
      }

      return 'Unknown Error';
    },

    handlePasswordValidation({ password, isValid }) {
      this.inputPassword = password;
      this.isPasswordValid = isValid;
    },

    checkEmail() {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.inputEmail)
      this.isEmailValid = valid;
    },

    checkUsername() {
      const valid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(this.inputUsername)
      this.isUsernameValid = valid;
    },
  }
};
</script>

<style scoped>
.auth-container{
  width: 200px;
}

.auth-container > .input-group{
  width: 200px;
  display: flex;
  flex-wrap: wrap;

  flex-direction: column;

  justify-content: center;

  gap: 12px;
}

input{
  width: 186px;
}

.auth-container > div > button{
  width: 200px;
}

button{
  transition: 0.4s;
}

button:disabled{
  color: gray;
  border: 1px solid gray;
}

input{
  border-radius: 8px;
  padding: 6px;
}

.spacer{
  text-align: center;
}

/* selector */

.button-group {
  display: flex;
  width: 200px;
  margin: 12px 0 12px 0;
}

.button-group button{
  width: 64px;
  padding: 6px;
}

.button-group button:nth-child(1){
  border-radius: 8px 0 0 8px;
}

.button-group button:nth-last-child(1){
  border-radius: 0 8px 8px 0;
  border-left: 0;
}

/* Style for the selected button */
.active {
    background-color: var(--color-accent);
    color: var(--color-text);
}

.spinner {
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 2px solid #3498db; /* Adjust the color as needed */
  width: 12px;
  height: 12px;
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-bottom: -4px;
  margin-right: 6px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>