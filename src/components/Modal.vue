<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" @click="close">
      <div class="modal" @click.stop>
        <div class="content">
          <slot></slot>
        </div>
        <button @click="close">Close</button>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    name: 'Modal',
    methods: {
      close() {
        this.$emit('close');
      },
    },
  };
</script>

<style>
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
  }

  .modal {
    background: var(--color-background);
    width: 320px;
    height: 400px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    border: 1px solid var(--color-background-sec)
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

  button{
    margin-top: 6px;
    margin: 0;
  }
</style>