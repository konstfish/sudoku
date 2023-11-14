<script setup>
import { RouterLink, RouterView } from 'vue-router'

import LogRocket from 'logrocket';
LogRocket.init('dzh8o1/sudokuharborcom');

import { pb } from './lib/pocketbase'
import { localStore } from './lib/localstore';

import IconHome from './components/icons/IconHome.vue'
import IconUser from './components/icons/IconUser.vue'
import IconAbout from './components/icons/IconAbout.vue'
import IconHistory from './components/icons/IconHistory.vue'

import IconSudokuHarbor from './components/icons/IconSudokuHarbor.vue'
</script>

<template>
  <header>
    <div class="wrapper">
      <h1><IconSudokuHarbor style="height: 48px"/> Sudoku Harbor</h1>

      <nav>
        <RouterLink to="/"><IconHome /> Home</RouterLink>
        <RouterLink to="/history"><IconHistory /> Board History</RouterLink>
        <RouterLink to="/profile"><IconUser /> Profile</RouterLink>
        <RouterLink to="/about"><IconAbout /> About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<script>
export default {
  data() {
    return {
    };
  },
  beforeMount(){
    console.log('Hello :) View this projects source at https://github.com/konstfish/sudoku')

    this.refreshAuth();

    localStore.deleteOldKeys();
  },
  methods: {
    async refreshAuth(){
      if (pb.authStore.isValid) {
        await pb.collection('users').authRefresh();

        LogRocket.identify(pb.authStore.model.id, {
          name: pb.authStore.model.username,
          email: pb.authStore.model.email,

          verified: pb.authStore.model.verified,
          supporter: pb.authStore.model.supporter
        });
      }
    }
  }
};
</script>


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
