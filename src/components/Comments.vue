<script setup>
import CommentList from './CommentList.vue'
import CommentSubmission from './CommentSubmission.vue'
</script>

<template>
    <div class="comments">
        <CommentSubmission :boardId="boardId" />
        <CommentList :boardId="boardId" />
    </div>
</template>

<script>
export default {
  props: {
    boardId: {
        type: [String, null],
        required: true
    }
  },
  data() {
    return {
    };
  }
};
</script>

<style scoped>
.comments{
    display: flex;
    flex-direction: column;
    gap: 6px;
}
</style>