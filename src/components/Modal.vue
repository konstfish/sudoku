<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" @click="close">
      <div class="modal" :style="cssProps" @click.stop>
        <div class="content">
          <slot></slot>
        </div>
        <div class="spacer"></div>
        <div class="action-buttons">
          <button @click="close">Close</button>
          <button @click="confirm" id="confirm" v-if="showConfirm">Confirm</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    name: 'Modal',
    props: {
      width: String,
      height: String,
      showConfirm: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      cssProps() {
        return {
          'width': this.width + "px",
          'height': this.height + "px",
          }
        }
    },
    methods: {
      close() {
        this.$emit('close');
      },
      confirm() {
        this.$emit('confirm');
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

  .content{
    margin: auto;
  }

  .action-buttons{
    margin: 0;

    gap: 6px;

    display: flex;
  }

  button{
    flex-grow: 1;
    flex-basis: 0;
  }

  #confirm{
    background-color: var(--color-accent);
  }
</style>