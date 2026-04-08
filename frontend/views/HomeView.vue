<template>
  <section class="home-page">
    <div v-if="isAuthenticated()" class="hero hero-auth">
      <div class="hero-copy">
        <span class="eyebrow">For you</span>
        <h1>Welcome back{{ user?.username ? `, ${user.username}` : '' }}</h1>
        <p>
          Jump into fresh uploads from across MiniYouTube and keep your next watch
          session moving.
        </p>
      </div>

      <div class="hero-actions">
        <button class="primary-btn" @click="$router.push('/dashboard')">
          Open Dashboard
        </button>
        <button
          v-if="user?.id"
          class="secondary-btn"
          @click="$router.push(`/profile/${user.id}`)"
        >
          My Channel
        </button>
      </div>
    </div>

    <div v-else class="hero hero-guest">
      <div class="hero-copy">
        <span class="eyebrow">Discover</span>
        <h1>Watch what creators are uploading now</h1>
        <p>
          Browse the latest videos, then sign in to manage your own channel and
          jump back into creator mode anytime.
        </p>
      </div>

      <div class="hero-actions">
        <button class="primary-btn" @click="$router.push('/login')">
          Login
        </button>
        <button class="secondary-btn" @click="$router.push('/register')">
          Create Account
        </button>
      </div>
    </div>

    <div class="feed-shell">
      <div class="feed-head">
        <div>
          <span class="section-kicker">{{ isAuthenticated() ? 'Recommended feed' : 'Video feed' }}</span>
          <h2>Latest uploads</h2>
          <p>{{ videos.length }} videos ready to watch</p>
        </div>
      </div>

      <div v-if="videos.length" class="feed">
        <VideoCard
          v-for="video in videos"
          :key="video.id"
          :video="video"
        />
      </div>

      <div v-else class="empty-state">
        <h3>No videos yet</h3>
        <p>Uploads will appear here as soon as creators publish them.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../src/services/api';
import VideoCard from '../src/components/VideoCard.vue';
import { useAuth } from '../src/store/auth';

const videos = ref([]);
const { isAuthenticated, user } = useAuth();

// The home page reuses the same public video feed for both guests and logged-in users.
// The difference is the hero/actions shown at the top of the page.
const fetchVideos = async () => {
  const res = await api.get('/videos');
  videos.value = res.data;
};

onMounted(fetchVideos);
</script>

<style scoped>
.home-page {
  min-height: calc(100vh - 88px);
  padding: 28px 28px 56px;
  background:
    radial-gradient(circle at top left, rgba(255, 54, 54, 0.14), transparent 18%),
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.06), transparent 18%),
    linear-gradient(180deg, rgba(17, 18, 23, 0.98) 0%, rgba(28, 31, 39, 0.98) 24%, #eef1f5 24%, #eef1f5 100%);
}

.hero,
.feed-shell {
  border: 1px solid rgba(17, 18, 22, 0.08);
  box-shadow: 0 24px 40px rgba(24, 28, 33, 0.1);
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
  padding: 30px;
  border-radius: 30px;
}

.hero-auth {
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.12), transparent 28%),
    linear-gradient(135deg, #ff3131, #811320 46%, #1b1d25);
  color: #fff;
}

.hero-guest {
  background:
    radial-gradient(circle at top left, rgba(255, 72, 72, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(246, 247, 250, 0.98));
}

.hero-copy h1,
.feed-head h2,
.empty-state h3 {
  margin: 0;
}

.hero-copy p,
.feed-head p,
.empty-state p {
  margin-bottom: 0;
}

.hero-auth .hero-copy p,
.hero-auth .eyebrow {
  color: rgba(255, 255, 255, 0.84);
}

.hero-guest .hero-copy p,
.feed-head p,
.section-kicker,
.empty-state p {
  color: #637082;
}

.eyebrow,
.section-kicker {
  display: inline-flex;
  margin-bottom: 12px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn {
  border: 0;
  border-radius: 999px;
  padding: 13px 18px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn {
  color: #fff;
  background: linear-gradient(135deg, #ff3131, #cc1023);
  box-shadow: 0 16px 32px rgba(204, 16, 35, 0.28);
}

.hero-auth .primary-btn {
  background: #fff;
  color: #121317;
  box-shadow: none;
}

.secondary-btn {
  color: #111318;
  background: rgba(17, 19, 24, 0.08);
}

.hero-auth .secondary-btn {
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
}

.feed-shell {
  padding: 24px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.94);
}

.feed-head {
  margin-bottom: 20px;
}

.feed {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.empty-state {
  padding: 42px 24px;
  border-radius: 24px;
  text-align: center;
  background: #f3f5f8;
}

@media (max-width: 1100px) {
  .feed {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 920px) {
  .home-page {
    padding-inline: 18px;
  }

  .hero,
  .hero-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .feed {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .feed {
    grid-template-columns: 1fr;
  }
}
</style>
