<script setup>
import SudokuBoard from '../components/SudokuBoard.vue'
</script>

<template>
  <main>
  <div class="button-group">
    <button v-for="option, key in options" :key="option" @click="difficulty = key" :class="{ active: difficulty == key }">
      {{ option }}
    </button>
  </div>

  <SudokuBoard :difficulty="difficulty !== undefined ? difficulty : 1" />
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

  },
  methods: {
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

button {
    padding: 6px;
    width: 64px;
    text-align: center;
    cursor: pointer;
    border: 1px solid var(--color-text-sec);
    background-color: var(--background-color);
}

button:nth-child(1){
  border-radius: 8px 0 0 8px;
}

button:nth-child(2){
  border-right: 0;
  border-left: 0;
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