<template>
  <header class="header">
    <div class="brand" @click="$router.push('/')">
      <div class="brand-mark">
        <span class="play-icon"></span>
      </div>
      <div class="brand-copy">
        <strong>MiniYouTube</strong>
        <span>Stream your small-screen universe</span>
      </div>
    </div>

    <form class="search-form" @submit.prevent="submitSearch">
      <input
        v-model="searchText"
        class="search-input"
        type="search"
        placeholder="Search videos"
      />
      <button class="search-btn" type="submit">Search</button>
    </form>

    <div class="nav">
      <template v-if="!isAuthenticated()">
        <button class="nav-btn nav-btn-muted" @click="$router.push('/login')">
          Login
        </button>
        <button class="nav-btn nav-btn-primary" @click="$router.push('/register')">
          Sign Up
        </button>
      </template>

      <template v-else>
        <button class="nav-btn nav-btn-muted" @click="$router.push('/')">
          Home
        </button>
        <button class="nav-btn nav-btn-muted" @click="$router.push('/dashboard')">
          Dashboard
        </button>
        <button
          v-if="isAuthenticated()"
          class="nav-btn nav-btn-muted"
          @click="$router.push(`/profile/${user?.id}`)"
        >
          My Channel
        </button>
        <button class="nav-btn nav-btn-primary" @click="handleLogout">
          Logout
        </button>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../store/auth';

const route = useRoute();
const router = useRouter();
const { isAuthenticated, logout, user } = useAuth();
const searchText = ref(route.query.search || '');

// The header search writes to the current route query so pages like WatchView
// can react to it without needing a separate shared store.
const submitSearch = () => {
  const nextQuery = { ...route.query };

  if (searchText.value.trim()) {
    nextQuery.search = searchText.value.trim();
  } else {
    delete nextQuery.search;
  }

  router.push({
    path: route.path,
    query: nextQuery
  });
};

const handleLogout = () => {
  logout();
  router.push('/');
};

// Keep the input in sync when navigation changes the search query.
watch(
  () => route.query.search,
  (value) => {
    searchText.value = value || '';
  }
);
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  padding: 18px 28px;
  background:
    linear-gradient(180deg, rgba(12, 12, 14, 0.96), rgba(12, 12, 14, 0.88));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}

.brand-mark {
  width: 48px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #ff2d2d, #d90f23);
  box-shadow: 0 14px 30px rgba(217, 15, 35, 0.35);
}

.play-icon {
  width: 0;
  height: 0;
  margin-left: 3px;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 12px solid #fff;
}

.brand-copy {
  display: flex;
  flex-direction: column;
}

.brand-copy strong {
  color: #fff;
  font-size: 1rem;
  letter-spacing: 0.02em;
}

.brand-copy span {
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.78rem;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  max-width: 520px;
}

.search-input {
  flex: 1;
  min-width: 180px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font: inherit;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.52);
}

.search-btn {
  border: 0;
  border-radius: 999px;
  padding: 11px 16px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.nav-btn {
  border: 0;
  border-radius: 999px;
  padding: 11px 18px;
  font: inherit;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.nav-btn:hover {
  transform: translateY(-1px);
}

.nav-btn-muted {
  color: #f7f7f7;
  background: rgba(255, 255, 255, 0.08);
}

.nav-btn-primary {
  color: #fff;
  background: linear-gradient(135deg, #ff2d2d, #cc1023);
  box-shadow: 0 12px 24px rgba(204, 16, 35, 0.28);
}

@media (max-width: 700px) {
  .header {
    padding: 16px 18px;
    align-items: flex-start;
    flex-direction: column;
  }

  .search-form {
    width: 100%;
    max-width: none;
  }

  .nav {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
