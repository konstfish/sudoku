<script setup>
import SudokuBoard from '../components/SudokuBoard.vue'
import Comments from '../components/Comments.vue'

import { pb } from '../lib/pocketbase'

import { getDayRangeQuery } from '../lib/helpers'
</script>

<template>
  <main>
    <SudokuBoard :boardId='boardId' />

    <Comments :boardId='boardId' />
  </main>
</template>

<script>
export default {
  data() {
    return {
    };
  },
  computed: {
    boardId() {
      return this.$route.params.id;
    }
  },
  beforeMount(){
  },
  methods: {
  },
};
</script>


<style scoped>
main{
  display: flex;
  flex-direction: column;
  align-items: center;
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