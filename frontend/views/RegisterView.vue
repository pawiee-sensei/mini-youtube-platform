<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Create Account</h2>

      <form @submit.prevent="handleRegister">
        <input v-model="username" placeholder="Username" />

        <input v-model="email" placeholder="Email" />
        <p v-if="errors.email" class="error">{{ errors.email }}</p>

        <input v-model="password" type="password" placeholder="Password" />


        <button class="primary-btn">Register</button>
      </form>

      <p class="link" @click="$router.push('/')">
        Already have an account?
      </p>
    </div>
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

const errors = ref({});

const router = useRouter();
const { register } = useAuth();

const handleRegister = async () => {
  errors.value = {};

  try {
    await register({
      username: username.value,
      email: email.value,
      password: password.value,
      role: role.value
    });

    router.push('/');
  } catch (err) {
    const field = err.response?.data?.field;
    const message = err.response?.data?.message;

    if (field) {
      errors.value[field] = message;
    }
  }
};
</script>

<style scoped>
/* reuse same styles from login */
.error {
  color: red;
  font-size: 12px;
}
</style>