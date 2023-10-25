<template>
  <div>
    <p>{{ formattedTime }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      elapsedTime: 0,
      timerInterval: null,
    };
  },
  computed: {
    formattedTime() {
      const seconds = this.elapsedTime % 60;
      const minutes = Math.floor(this.elapsedTime / 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    },
  },
  methods: {
    startTimer() {
      this.timerInterval = setInterval(this.updateTimer, 1000);
    },
    stopTimer(){
      clearInterval(this.timerInterval);
    },
    updateTimer() {
      this.elapsedTime += 1;
    },
    handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        this.stopTimer();
      } else {
        this.startTimer();
      }
    },
  },
  beforeMount() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  },
  beforeDestroy() {
    clearInterval(this.timerInterval);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  },
};
</script>

<style scoped>
p{
  text-align: center;
}
</style>