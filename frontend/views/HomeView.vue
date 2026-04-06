<template>
  <div class="feed">
    <VideoCard
      v-for="video in videos"
      :key="video.id"
      :video="video"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../src/services/api';
import VideoCard from '../src/components/VideoCard.vue';

const videos = ref([]);

const fetchVideos = async () => {
  const res = await api.get('/videos');
  videos.value = res.data;
};

onMounted(fetchVideos);
</script>

<style scoped>
.feed {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 20px;
}
</style>