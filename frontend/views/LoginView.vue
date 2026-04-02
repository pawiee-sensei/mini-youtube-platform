<template>
  <div>
    <h2>Login</h2>

    <form @submit.prevent="handleLogin">
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>

    <p @click="$router.push('/register')">Go to Register</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../src/store/auth';

const email = ref('');
const password = ref('');
const router = useRouter();
const { login } = useAuth();

const handleLogin = async () => {
  await login(email.value, password.value);
  router.push('/dashboard');
};
</script>