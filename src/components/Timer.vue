<script setup>
import { formatTime } from '../lib/helpers'
</script>


<template>
  <span>{{ formattedTime }}</span>
</template>

<script>
export default {
  props: {
    elapsedTime: {
      type: Number,
      default: 0
    },
    timerStart: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    elapsedTime(newVal){
      this.localElapsedTime = newVal;
    }
  },
  data() {
    return {
      localElapsedTime: this.elapsedTime,
      timerInterval: null
    };
  },
  computed: {
    formattedTime() {
      return formatTime(this.localElapsedTime)
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
      if(this.timerStart){
        this.localElapsedTime += 1;
        this.$emit('elapsedTime', this.localElapsedTime);
      }
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
    this.timerInterval = setInterval(this.updateTimer, 1000);
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