<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Welcome Back</h2>

      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <input v-model="email" placeholder="Email" />
        </div>

        <div class="input-group">
          <input v-model="password" type="password" placeholder="Password" />
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button class="primary-btn">Login</button>
      </form>

      <div class="divider">OR</div>

      <button class="google-btn">
        Continue with Google
      </button>

      <p class="link" @click="$router.push('/register')">
        Create account
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../src/store/auth';

const email = ref('');
const password = ref('');
const error = ref('');

const router = useRouter();
const { login } = useAuth();

const handleLogin = async () => {
  error.value = '';

  try {
    await login(email.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed';
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
}

.auth-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 350px;
}

.input-group {
  margin-bottom: 15px;
}

input {
  width: 100%;
  padding: 10px;
}

.primary-btn {
  width: 100%;
  padding: 10px;
  background: black;
  color: white;
}

.google-btn {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
}

.divider {
  text-align: center;
  margin: 10px 0;
}

.error {
  color: red;
  font-size: 13px;
}

.link {
  text-align: center;
  cursor: pointer;
  margin-top: 10px;
}
</style>
