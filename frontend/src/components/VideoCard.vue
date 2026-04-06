<template>
  <div class="video-card" @click="goWatch">
    <div class="thumb">
      <img v-if="video.thumbnail_url" :src="base + video.thumbnail_url" />
    </div>

    <div class="info">
      <strong>{{ video.title }}</strong>
      <span>{{ video.views }} views</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  video: Object
});

const router = useRouter();
const base = 'http://localhost:5000';

const goWatch = () => {
  router.push(`/watch/${props.video.id}`);
};
</script>

<style scoped>
.video-card {
  cursor: pointer;
}

.thumb img {
  width: 100%;
  border-radius: 12px;
}

.info {
  padding: 8px 0;
}
</style>