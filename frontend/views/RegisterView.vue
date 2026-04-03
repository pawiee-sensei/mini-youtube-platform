<template>
  <section class="register-page">
    <div class="register-shell">
      <div class="register-promo">
        <span class="eyebrow">Join MiniYouTube</span>
        <h1>Build your channel and publish with a cleaner creator workflow.</h1>
        <p>
          Sign up to access your dashboard, create your channel identity, and start
          growing your audience.
        </p>

        <div class="promo-points">
          <div class="promo-card" v-for="item in points" :key="item.title">
            <strong>{{ item.title }}</strong>
            <span>{{ item.desc }}</span>
          </div>
        </div>
      </div>

      <div class="auth-card">
        <div class="card-head">
          <span class="mini-badge">Creator sign up</span>
          <h2>Create Account</h2>
          <p>Reserve your name and get your channel ready.</p>
        </div>

        <form @submit.prevent="handleRegister">
          <div class="input-group">
            <label>Username</label>
            <input v-model="username" placeholder="Choose a channel name" />
          </div>

          <div class="input-group">
            <label>Email</label>
            <input v-model="email" placeholder="Enter your email" />
            <p v-if="errors.email" class="error">{{ errors.email }}</p>
          </div>

          <div class="input-group">
            <label>Password</label>
            <input v-model="password" type="password" placeholder="Create a password" />
          </div>

          <button class="primary-btn">Create Channel</button>
        </form>

        <p class="link" @click="$router.push('/')">
          Already have an account? Return home
        </p>
      </div>
    </div>
  </section>
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

const points = [
  { title: 'Creator dashboard', desc: 'Keep channel tools and performance in one place.' },
  { title: 'My Channel page', desc: 'Show off uploads in a clean, video-first layout.' },
  { title: 'Fast setup', desc: 'Create your account and jump straight into publishing.' }
];

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
.register-page {
  min-height: calc(100vh - 88px);
  padding: 34px 28px 54px;
  background:
    radial-gradient(circle at top left, rgba(255, 53, 53, 0.18), transparent 24%),
    linear-gradient(180deg, #131418 0%, #1c1f26 100%);
}

.register-shell {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 22px;
  align-items: stretch;
}

.register-promo,
.auth-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 30px;
  box-shadow: 0 24px 54px rgba(0, 0, 0, 0.28);
}

.register-promo {
  padding: 36px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03)),
    linear-gradient(135deg, rgba(255, 49, 49, 0.2), rgba(255, 255, 255, 0.02));
}

.eyebrow,
.mini-badge {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.eyebrow {
  color: #ff8a8a;
  background: rgba(255, 49, 49, 0.12);
}

.register-promo h1,
.auth-card h2 {
  color: #fff;
  margin: 16px 0 12px;
}

.register-promo h1 {
  max-width: 13ch;
  font-size: clamp(2.2rem, 4vw, 4rem);
  line-height: 1.02;
}

.register-promo p,
.promo-card span,
.auth-card p,
.link {
  color: rgba(255, 255, 255, 0.7);
}

.promo-points {
  display: grid;
  gap: 14px;
  margin-top: 28px;
}

.promo-card {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.05);
}

.promo-card strong {
  display: block;
  margin-bottom: 6px;
  color: #fff;
}

.auth-card {
  padding: 30px;
  background: #17191f;
}

.mini-badge {
  color: #ff8a8a;
  background: rgba(255, 49, 49, 0.12);
}

.card-head {
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #f2f4f8;
  font-size: 0.92rem;
  font-weight: 600;
}

.input-group input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  font: inherit;
}

.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.primary-btn {
  width: 100%;
  border: 0;
  border-radius: 16px;
  padding: 15px;
  background: linear-gradient(135deg, #ff3131, #cc1023);
  color: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  margin-top: 8px;
}

.error {
  margin-top: 8px;
  color: #ff9ca6;
  font-size: 0.82rem;
}

.link {
  text-align: center;
  cursor: pointer;
  margin-top: 16px;
}

@media (max-width: 920px) {
  .register-shell {
    grid-template-columns: 1fr;
  }

  .register-page {
    padding-inline: 18px;
  }
}
</style>
