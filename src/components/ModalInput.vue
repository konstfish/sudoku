<script setup>
import { generateRange } from '../lib/helpers'
</script>

<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" @click="close">
      <div class="modal" @click.stop>
            <div class="sudoku-board-section-cell-notes">
              <span v-for="number in generateRange(1, 9)" 
                  :key="number"
                  :selected="checkIfIncludes(number)"
                  @click.stop="handleClick(number)"
              >
              {{ number }}
              </span>
          </div>
        <button @click="close">Close</button>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    name: 'ModalInput',
    props: {
      cell: {
        type: Object,
        default: null
      },
    },
    methods: {
      close() {
        this.$emit('close');
      },
      handleClick(number){
        if(this.checkIfIncludes(number)){
          this.$emit('set-number', number)
        }else{
          this.$emit('set-note', number)
        }
      },
      checkIfIncludes(number){
        if(this.cell){
          return this.cell.notes.includes(number);
        }

        return false
      }

    },
  };
</script>

<style scoped>
  .modal-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  .modal {
    background: var(--color-background);
    width: 70%;
    height: 80%;
    padding: 12px;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    border: 1px solid var(--color-background-sec);
    z-index: 101;
  }

  .modal-fade-enter,
  .modal-fade-leave-to {
    opacity: 0;
  }

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity .2s ease;
  }

  .sudoku-board-section-cell-notes{
      display: grid;
      grid-template-columns: repeat(3, 1fr);

      margin-bottom: 12px;

      height: calc(100% - 12px);
      width: 100%;

      background-color: var(--color-background);
      color: var(--color-text);

      transition: 0.2s;
  }

  .sudoku-board-section-cell-notes > span{
      display: inline-block;
      display: grid;
      align-items: center;
      text-align: center;

      font-size: 32px;
      transition: 0.2s;
  }

  .sudoku-board-section-cell-notes > span[selected="true"]{
      background-color: var(--color-background-sec);
  }

  .sudoku-board-section-cell-notes > span{
    border: 1px solid var(--color-text);
    border-top-width: 0px;
    border-right-width: 0px;
  }

  .sudoku-board-section-cell-notes > span:nth-child(1){
      border-top-left-radius: 8px;
  }

  .sudoku-board-section-cell-notes > span:nth-last-child(1){
      border-bottom-right-radius: 8px;
  }

  .sudoku-board-section-cell-notes > span:nth-last-child(3){
      border-bottom-left-radius: 8px;
  }

  .sudoku-board-section-cell-notes > span:nth-child(3){
      border-top-right-radius: 8px;
  }

  .sudoku-board-section-cell-notes > span:nth-child(-n+3){
    border-top-width: 1px;
  }

  .sudoku-board-section-cell-notes > span:nth-child(3n){
      border-right-width: 1px;
  }

  button{
    margin: 0;

    flex-grow: 1;
    flex-basis: 0;
  }

  #confirm{
    background-color: var(--color-accent);
  }
</style>