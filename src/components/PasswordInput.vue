<script setup>
import IconKey from './icons/IconKey.vue'
</script>


<template>
  <div>
    <div class="input-group">
      <div class="inplab">
        <label for="password"><span><IconKey /> Password</span></label>
        <input :type="showPassword ? 'text' : 'password'" id="password"
              placeholder="password"
              v-model="password"
              @input="checkPassword"
              />
      </div>
      <button type="button" @click="togglePasswordVisibility">
        {{ showPassword ? "Hide" : "Show" }}
      </button>
    </div>
    <p :valid="password.length < 8">Password must be at least 8 characters long.</p>
    <p :valid="!hasNumber">Password must contain at least one number.</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      password: "",
      hasNumber: false,
      showPassword: false,
    };
  },
  methods: {
    checkPassword() {
      const isLengthValid = this.password.length >= 8;
      const hasNumber = /\d/.test(this.password);
      this.hasNumber = hasNumber;
      const isValid = isLengthValid && hasNumber;

      this.$emit("password-validation", {
        password: this.password,
        isValid: isValid,
      });
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
  },
};
</script>

<style scoped>
.input-group{
  display: flex;
  gap: 6px;
}

.input-group button{
  padding: 6px;
  height: 28.8px; /* ???? frontend sux */
  align-self: flex-end;
}

button{
    width: 50px;
    text-align: center;
}

input{
  border-radius: 8px;
  padding: 6px;
  width: calc(186px - 56px);
}

p{
    margin: 0;
    font-size: 9px;
    color: gray;

    transition: 0.2s;
}

p[valid="false"]{
    color: var(--color-accent);
}
</style>