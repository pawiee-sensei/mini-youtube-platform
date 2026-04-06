<template>
  <div class="watch">

    <video
      v-if="video.video_url"
      controls
      class="player"
      :src="base + video.video_url"
    ></video>

    <h2>{{ video.title }}</h2>
    <p>{{ video.description }}</p>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../src/services/api';

const route = useRoute();
const video = ref({});
const base = 'http://localhost:5000';

const fetchVideo = async () => {
  const res = await api.get(`/videos/${route.params.id}`);
  video.value = res.data;
};

onMounted(fetchVideo);
</script>

<style scoped>
.watch {
  padding: 20px;
}

.player {
  width: 100%;
  max-height: 500px;
  border-radius: 12px;
}
</style>