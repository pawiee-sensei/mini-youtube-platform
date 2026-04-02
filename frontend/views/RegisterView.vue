<template>
  <div>
    <h2>Register</h2>

    <form @submit.prevent="handleRegister">
      <input v-model="username" placeholder="Username" />
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />

      <select v-model="role">
        <option value="user">User</option>
        <option value="creator">Creator</option>
      </select>

      <button type="submit">Register</button>
    </form>

    <p @click="$router.push('/')">Go to Login</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../src/store/auth';

const username = ref('');
const email = ref('');
const password = ref('');
const role = ref('user');

const router = useRouter();
const { register } = useAuth();

const handleRegister = async () => {
  await register({
    username: username.value,
    email: email.value,
    password: password.value,
    role: role.value
  });

  router.push('/');
};
</script>