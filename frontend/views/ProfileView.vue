<template>
  <div class="profile">
    <h1>{{ username }}</h1>

    <button v-if="isOwner" @click="goUpload">
      Upload Video
    </button>

    <div class="videos">
      <div v-for="video in videos" :key="video.id" class="video-card">
        <p>{{ video.title }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../src/services/api';
import { useAuth } from '../src/store/auth';

const route = useRoute();
const router = useRouter();

const videos = ref([]);
const username = ref('User');

const { user } = useAuth();

const isOwner = computed(() => {
  return user.value && user.value.id == route.params.id;
});

const fetchVideos = async () => {
  const res = await api.get(`/videos/user/${route.params.id}`);
  videos.value = res.data;
};

const goUpload = () => {
  router.push('/dashboard'); // temp (upload later)
};

onMounted(fetchVideos);
</script>

<style scoped>
.profile {
  padding: 20px;
}

.videos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.video-card {
  border: 1px solid #ccc;
  padding: 10px;
}
</style>