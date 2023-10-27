<script setup>
import { RouterLink, RouterView } from 'vue-router'

import IconHome from './components/icons/IconHome.vue'
import IconUser from './components/icons/IconUser.vue'
import IconAbout from './components/icons/IconAbout.vue'
</script>

<template>
  <header>
    <div class="wrapper">
      <h1>SudokuHarbor</h1>

      <nav>
        <RouterLink to="/"><IconHome /> Home</RouterLink>
        <RouterLink to="/profile"><IconUser /> Profile</RouterLink>
        <RouterLink to="/about"><IconAbout /> About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
nav {
  width: 100%;
  font-size: 12px;
  margin-bottom: 12px;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem 0 0;
}
</style>
