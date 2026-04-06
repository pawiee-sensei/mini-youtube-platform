<template>
  <div class="video-card" @click="goWatch">
    <div class="thumb">
      <img v-if="video.thumbnail_url" :src="base + video.thumbnail_url" />
      <div v-else class="thumb-fallback">No Thumbnail</div>
    </div>

    <div class="info">
      <strong>{{ video.title }}</strong>
      <span>{{ video.uploader_username || 'MiniYouTube Creator' }}</span>
      <small>{{ video.views || 0 }} views</small>
    </div>
  </div>
</template>

<script setup>
import api from '../services/api';
import { useRouter } from 'vue-router';

const props = defineProps({
  video: Object
});

const router = useRouter();
const base = 'http://localhost:5000';

// Opening a card counts a view immediately, then the query flag tells WatchView
// not to count the same visit a second time on first play.
const goWatch = async () => {
  try {
    await api.post(`/videos/${props.video.id}/view`);
    router.push(`/watch/${props.video.id}?counted=1`);
  } catch (err) {
    console.error('CARD VIEW COUNT ERROR:', err);
    router.push(`/watch/${props.video.id}`);
  }
};
</script>

<style scoped>
.video-card {
  overflow: hidden;
  border-radius: 22px;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 18px 34px rgba(18, 19, 24, 0.08);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 38px rgba(18, 19, 24, 0.14);
}

.thumb {
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #101114, #2a2d35);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.9rem;
  font-weight: 700;
}

.info {
  display: grid;
  gap: 6px;
  padding: 14px 14px 16px;
}

.info strong {
  color: #111318;
}

.info span,
.info small {
  color: #697586;
}

.info small {
  font-size: 0.84rem;
}
</style>
