<script setup>
import SudokuBoard from '../components/SudokuBoard.vue'

import { pb } from '../lib/pocketbase'
</script>

<template>
  <main>
  <div class="button-group">
    <button v-for="option, key in options" :key="option" @click="difficulty = key" :class="{ active: difficulty == key }">
      {{ option }}
    </button>
  </div>

  <!-- <SudokuBoard :difficulty='difficulty !== undefined ? Number(difficulty) : 1' /> -->
  <SudokuBoard :difficulty='Number(difficulty)' />
  </main>
</template>

<script>
export default {
  data() {
    return {
        options: {
          1: "Easy",
          2: "Medium",
          3: "Hard"
        },
        difficulty: 1,
    };
  },
  beforeMount(){
    // refresh auth
    this.refreshAuth();
  },
  methods: {
    async refreshAuth(){
      if (pb.authStore.isValid) {
        await pb.collection('users').authRefresh();
      }
    }
  },
};
</script>


<style scoped>
main{

}

.button-group {
  display: flex;
  height: 32px;
  margin: 12px 0 12px 0;
}

.button-group button{
  width: 64px;
}

button:nth-child(1){
  border-radius: 8px 0 0 8px;
}

button:nth-child(2){
  border-right: 0;
  border-left: 0;
  border-radius: 0px;
}

button:nth-last-child(1){
  border-radius: 0 8px 8px 0;
}

/* Style for the selected button */
.active {
    background-color: var(--color-accent);
    color: var(--color-text);
}
</style>