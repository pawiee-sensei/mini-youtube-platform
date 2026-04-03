<template>
  <header class="header">
    <div class="logo" @click="$router.push('/')">
      MiniYouTube
    </div>

    <div class="nav">
      <template v-if="!isAuthenticated()">
        <button @click="$router.push('/login')">Login</button>
        <button @click="$router.push('/register')">Sign Up</button>
      </template>

      <template v-else>
        <button @click="$router.push('/dashboard')">Dashboard</button>
        <button @click="logout">Logout</button>
        <button v-if="isAuthenticated()" @click="$router.push(`/profile/${user?.id}`)">
  My Channel
</button>
      </template>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';

const router = useRouter();
const { isAuthenticated, logout, user } = useAuth();

const goHome = () => {
  if (isAuthenticated()) {
    router.push('/dashboard'); // ✅ FIX
  } else {
    router.push('/'); // public home
  }
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  padding: 15px 30px;
  background: black;
  color: white;
}

.logo {
  font-weight: bold;
  cursor: pointer;
}

.nav button {
  margin-left: 10px;
  padding: 6px 12px;
}
</style>