<template>
  <div class="watch">
    <video
      v-if="video.video_url"
      controls
      class="player"
      :src="base + video.video_url"
      @play="handlePlay"
    ></video>

    <div class="meta">
      <h2>{{ video.title }}</h2>
      <div class="sub-meta">
        <span>{{ video.uploader_username || 'MiniYouTube Creator' }}</span>
        <span>{{ video.views || 0 }} views</span>
      </div>
      <p>{{ video.description }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '../src/services/api';

const route = useRoute();
const video = ref({});
const base = 'http://localhost:5000';
const hasCountedView = ref(false);

const fetchVideo = async () => {
  const res = await api.get(`/videos/${route.params.id}`);
  video.value = res.data;
  hasCountedView.value = route.query.counted === '1';
};

const handlePlay = async () => {
  if (hasCountedView.value || !route.params.id) return;

  try {
    const res = await api.post(`/videos/${route.params.id}/view`);
    video.value = res.data;
    hasCountedView.value = true;
  } catch (err) {
    console.error('VIEW COUNT ERROR:', err);
  }
};

onMounted(fetchVideo);

watch(() => route.params.id, fetchVideo);
watch(() => route.query.counted, () => {
  hasCountedView.value = route.query.counted === '1';
});
</script>

<style scoped>
.watch {
  padding: 20px;
  display: grid;
  gap: 18px;
}

.player {
  width: 100%;
  max-height: 500px;
  border-radius: 12px;
}

.meta {
  display: grid;
  gap: 10px;
}

.meta h2 {
  margin: 0;
}

.sub-meta {
  display: flex;
  gap: 14px;
  color: #66707e;
  font-size: 0.95rem;
}

.meta p {
  margin: 0;
  color: #2a313d;
}
</style>
