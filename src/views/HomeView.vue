<script setup>
import SudokuBoard from '../components/SudokuBoard.vue'
import Comments from '../components/Comments.vue'

import { pb } from '../lib/pocketbase'

import { getDayRangeQuery, mlog, merr } from '../lib/helpers'
</script>

<template>
  <main>
    <div class="button-group">
      <button v-for="option, key in options" :key="option" @click="optionSelected = key" :class="{ active: optionSelected == key }">
        {{ option }}
      </button>
    </div>

    <div class="game">
      <SudokuBoard :boardId='optionsId[optionSelected]' />

      <Comments :boardId='optionsId[optionSelected]' />
    </div>
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
        optionsId: {
          1: null,
          2: null,
          3: null
        },
        optionSelected: 1,
    };
  },
  beforeMount(){
    this.fetchBoards()
  },
  methods: {
    async fetchBoards(){
      const query = getDayRangeQuery()

      try{
          const resultList = await pb.collection('boards').getList(1, 3, {
              filter: query,
              sort: 'created'
          });
          
          for (let board of resultList.items) {
              this.optionsId[board.difficulty] = board.id
          }
      }catch(err){
          merr(err)
      }
    }
  },
};
</script>


<style scoped>
main{
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game{
  display: flex;
  flex-direction: column;
  gap: 12px;
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