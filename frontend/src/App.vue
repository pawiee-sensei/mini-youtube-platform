<template>
  <div class="app-shell">
    <Header />
    <router-view />
  </div>
</template>

<script setup>
import Header from './components/Header.vue';
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  background:
    linear-gradient(180deg, #121319 0%, #171a21 180px, #eef1f5 180px, #eef1f5 100%);
}
</style>

<style>
html,
body,
#app {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>
