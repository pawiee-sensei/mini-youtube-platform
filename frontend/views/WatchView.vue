<template>
  <div class="watch">

    <!-- VIDEO PLAYER -->
    <video
      v-if="video.video_url"
      controls
      class="player"
      :src="base + video.video_url"
      @play="handlePlay"
    ></video>

    <!-- META -->
    <div class="meta">
      <h2>{{ video.title }}</h2>

      <div class="sub-meta">
        <span>{{ video.uploader_username || 'MiniYouTube Creator' }}</span>
        <span>{{ video.views || 0 }} views</span>
      </div>

      <!-- LIKE BUTTON -->
      <div class="actions">
        <button @click="toggleLike">
          {{ liked ? 'Unlike' : 'Like' }} ({{ likesCount }})
        </button>
      </div>

      <p>{{ video.description }}</p>
    </div>

    <!-- COMMENT INPUT -->
    <div v-if="isAuthenticated()" class="comment-box">
      <input
        v-model="newComment"
        placeholder="Write a comment..."
      />
      <button @click="submitComment">Post</button>
    </div>

    <!-- COMMENTS -->
    <div class="comments">
      <div v-for="c in comments" :key="c.id" class="comment">
        <strong>{{ c.username }}</strong>
        <p>{{ c.content }}</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '../src/services/api';
import { useAuth } from '../src/store/auth';

const route = useRoute();
const { isAuthenticated } = useAuth();

const video = ref({});
const comments = ref([]);
const newComment = ref('');

const likesCount = ref(0);
const liked = ref(false);

const base = 'http://localhost:5000';
const hasCountedView = ref(false);

// 🎬 FETCH VIDEO
const fetchVideo = async () => {
  const res = await api.get(`/videos/${route.params.id}`);
  video.value = res.data;
  hasCountedView.value = route.query.counted === '1';
};

// 👍 FETCH LIKES
const fetchLikes = async () => {
  try {
    const res = await api.get(`/likes/${route.params.id}`);
    likesCount.value = res.data.count;
    liked.value = res.data.liked;
  } catch {
    likesCount.value = 0;
  }
};

// 💬 FETCH COMMENTS
const fetchComments = async () => {
  const res = await api.get(`/comments/${route.params.id}`);
  comments.value = res.data;
};

// ▶️ HANDLE VIEW COUNT
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

// 👍 TOGGLE LIKE
const toggleLike = async () => {
  if (!isAuthenticated()) {
    alert('Login required');
    return;
  }

  if (liked.value) {
    await api.delete(`/likes/${route.params.id}`);
  } else {
    await api.post(`/likes/${route.params.id}`);
  }

  await fetchLikes();
};

// 💬 SUBMIT COMMENT
const submitComment = async () => {
  if (!newComment.value.trim()) return;

  await api.post(`/comments/${route.params.id}`, {
    content: newComment.value
  });

  newComment.value = '';
  await fetchComments();
};

// 🔁 INIT
onMounted(() => {
  fetchVideo();
  fetchLikes();
  fetchComments();
});

// 🔁 WATCH ROUTE CHANGES
watch(() => route.params.id, () => {
  fetchVideo();
  fetchLikes();
  fetchComments();
});

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

.actions {
  margin: 10px 0;
}

.actions button {
  padding: 8px 14px;
  cursor: pointer;
}

.meta p {
  margin: 0;
  color: #2a313d;
}

/* COMMENTS */
.comment-box {
  display: flex;
  gap: 10px;
}

.comment-box input {
  flex: 1;
  padding: 8px;
}

.comments {
  margin-top: 10px;
}

.comment {
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}
</style>