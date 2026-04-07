<template>
  <!-- Main container for the watch page -->
  <section class="watch-page">
    <div class="watch-layout">
      <!-- Left column: player, metadata, and comments -->
      <div class="watch-main">
        <div class="player-shell">
          <!-- Render the player only when the backend returns a video source -->
          <video
            v-if="video.video_url"
            controls
            class="player"
            :src="base + video.video_url"
            @play="handlePlay"
          ></video>
        </div>

        <div class="meta-card">
          <h1>{{ video.title }}</h1>

          <div class="sub-meta">
            <button
              class="creator-link"
              type="button"
              @click="goToProfile(video.user_id)"
            >
              {{ video.uploader_username || 'MiniYouTube Creator' }}
            </button>
            <span>{{ video.views || 0 }} views</span>
          </div>

          <!-- Subscription summary for the uploader channel -->
          <div class="channel-bar">
            <span>{{ subscriberCount }} subscribers</span>

            <button
              class="subscribe-btn"
              :disabled="isOwnChannel"
              @click="toggleSubscription"
            >
              {{ isOwnChannel ? 'Your Channel' : subscribed ? 'Subscribed' : 'Subscribe' }}
            </button>
          </div>

          <div class="actions">
            <button class="like-btn" @click="toggleLike">
              {{ liked ? 'Unlike' : 'Like' }} ({{ likesCount }})
            </button>
          </div>

          <p>{{ video.description || 'No description yet.' }}</p>
        </div>

        <div class="comments-panel">
          <div class="section-head">
            <h2>Comments</h2>
            <span>{{ comments.length }}</span>
          </div>

          <!-- Only logged-in users can submit comments -->
          <div v-if="isAuthenticated()" class="comment-box">
            <input
              v-model="newComment"
              placeholder="Write a comment..."
            />
            <button @click="submitComment">Post</button>
          </div>

          <div v-if="comments.length" class="comments">
            <div v-for="comment in comments" :key="comment.id" class="comment">
              <strong>{{ comment.username }}</strong>
              <p>{{ comment.content }}</p>
            </div>
          </div>

          <div v-else class="empty-state">
            <h3>No comments yet</h3>
            <p>Start the conversation on this video.</p>
          </div>
        </div>
      </div>

      <!-- Right column: recommended videos -->
      <aside class="watch-sidebar">
        <div class="sidebar-card">
          <div class="section-head">
            <h2>Recommended</h2>
            <span>{{ filteredVideos.length }}</span>
          </div>

          <div v-if="paginatedVideos.length" class="recommended-list">
            <button
              v-for="item in paginatedVideos"
              :key="item.id"
              class="recommended-item"
              type="button"
              @click="goToVideo(item.id)"
            >
              <div class="recommended-thumb">
                <img
                  v-if="item.thumbnail_url"
                  :src="base + item.thumbnail_url"
                  alt="thumbnail"
                />
                <div v-else class="recommended-fallback">No Thumbnail</div>
              </div>

              <div class="recommended-copy">
                <strong>{{ item.title }}</strong>
                <span>{{ item.uploader_username || 'MiniYouTube Creator' }}</span>
                <small>{{ item.views || 0 }} views</small>
              </div>
            </button>
          </div>

          <div v-else class="empty-state compact">
            <h3>No videos found</h3>
            <p>Try a different search term.</p>
          </div>

          <div v-if="totalPages > 1" class="pagination">
            <button type="button" :disabled="currentPage === 1" @click="currentPage--">
              Previous
            </button>
            <span>Page {{ currentPage }} / {{ totalPages }}</span>
            <button type="button" :disabled="currentPage === totalPages" @click="currentPage++">
              Next
            </button>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../src/services/api';
import { useAuth } from '../src/store/auth';

const route = useRoute();
const router = useRouter();
const { isAuthenticated, user } = useAuth();

const video = ref({});
const videos = ref([]);
const comments = ref([]);
const newComment = ref('');
const likesCount = ref(0);
const liked = ref(false);
const currentPage = ref(1);
const subscribed = ref(false);
const subscriberCount = ref(0);

const base = 'http://localhost:5000';
const hasCountedView = ref(false);
const pageSize = 5;

// Prevent creators from subscribing to their own channel.
const isOwnChannel = computed(() => {
  return !!user.value && String(user.value.id) === String(video.value.user_id);
});

// Filter recommended videos using the header search query and exclude the current video.
const filteredVideos = computed(() => {
  const currentId = String(route.params.id);
  const query = String(route.query.search || '').trim().toLowerCase();

  return videos.value.filter((item) => {
    if (String(item.id) === currentId) return false;
    if (!query) return true;

    const title = item.title?.toLowerCase() || '';
    const uploader = item.uploader_username?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';

    return title.includes(query) || uploader.includes(query) || description.includes(query);
  });
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredVideos.value.length / pageSize));
});

const paginatedVideos = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredVideos.value.slice(start, start + pageSize);
});

const fetchVideo = async () => {
  const res = await api.get(`/videos/${route.params.id}`);
  video.value = res.data;
  hasCountedView.value = route.query.counted === '1';
};

const fetchAllVideos = async () => {
  const res = await api.get('/videos');
  videos.value = res.data;
};

const fetchLikes = async () => {
  try {
    const res = await api.get(`/likes/${route.params.id}`);
    likesCount.value = res.data.count;
    liked.value = res.data.liked;
  } catch {
    likesCount.value = 0;
    liked.value = false;
  }
};

const fetchComments = async () => {
  const res = await api.get(`/comments/${route.params.id}`);
  comments.value = res.data;
};

// Subscription status needs the uploader id from the fetched video payload.
const fetchSubscription = async () => {
  if (!isAuthenticated() || !video.value.user_id) {
    subscribed.value = false;
    subscriberCount.value = 0;
    return;
  }

  try {
    const res = await api.get(`/subscriptions/${video.value.user_id}`);
    subscribed.value = res.data.subscribed;
    subscriberCount.value = res.data.count;
  } catch {
    subscribed.value = false;
    subscriberCount.value = 0;
  }
};

// Count one view per watch-page visit.
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

const toggleSubscription = async () => {
  if (!isAuthenticated()) {
    alert('Login required');
    return;
  }

  if (isOwnChannel.value || !video.value.user_id) {
    return;
  }

  try {
    const res = await api.post(`/subscriptions/${video.value.user_id}`);
    subscribed.value = res.data.subscribed;
    subscriberCount.value = res.data.count;
  } catch (err) {
    console.error('SUBSCRIPTION ERROR:', err);
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;

  await api.post(`/comments/${route.params.id}`, {
    content: newComment.value
  });

  newComment.value = '';
  await fetchComments();
};

const goToVideo = (id) => {
  router.push(`/watch/${id}`);
};

const goToProfile = (userId) => {
  if (!userId) return;
  router.push(`/profile/${userId}`);
};

const loadPageData = async () => {
  currentPage.value = 1;

  await Promise.all([
    fetchVideo(),
    fetchAllVideos(),
    fetchLikes(),
    fetchComments()
  ]);

  setTimeout(fetchSubscription, 300);
};

onMounted(loadPageData);

watch(() => route.params.id, loadPageData);
watch(() => route.query.counted, () => {
  hasCountedView.value = route.query.counted === '1';
});
watch(() => route.query.search, () => {
  currentPage.value = 1;
});
watch(totalPages, (value) => {
  if (currentPage.value > value) {
    currentPage.value = value;
  }
});
</script>

<style scoped>
.watch-page {
  min-height: calc(100vh - 88px);
  padding: 28px 28px 56px;
  background:
    radial-gradient(circle at top left, rgba(255, 52, 52, 0.14), transparent 20%),
    linear-gradient(180deg, #15171c 0%, #20232b 24%, #eef1f5 24%, #eef1f5 100%);
}

.watch-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) 360px;
  gap: 22px;
  align-items: start;
}

.watch-main,
.watch-sidebar {
  display: grid;
  gap: 18px;
}

.player-shell,
.meta-card,
.comments-panel,
.sidebar-card {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(17, 18, 22, 0.08);
  border-radius: 28px;
  box-shadow: 0 24px 40px rgba(24, 28, 33, 0.08);
}

.player-shell {
  overflow: hidden;
  padding: 12px;
  background: #0f1014;
}

.player {
  width: 100%;
  max-height: 480px;
  display: block;
  border-radius: 20px;
  background: #000;
}

.meta-card,
.comments-panel,
.sidebar-card {
  padding: 24px;
}

.meta-card {
  display: grid;
  gap: 14px;
}

.meta-card h1,
.section-head h2,
.empty-state h3 {
  margin: 0;
  color: #111318;
}

.sub-meta,
.recommended-copy span,
.recommended-copy small,
.empty-state p,
.section-head span,
.meta-card p,
.comment p {
  color: #677384;
}

.sub-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
}

.creator-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: #cc1023;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.creator-link:hover {
  text-decoration: underline;
}

.channel-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #f4f6f8;
  color: #4f5968;
  font-size: 0.95rem;
  font-weight: 600;
}

.actions {
  display: flex;
}

.like-btn,
.subscribe-btn,
.comment-box button,
.pagination button {
  border: 0;
  border-radius: 999px;
  padding: 11px 16px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.like-btn,
.subscribe-btn,
.comment-box button {
  color: #fff;
  background: linear-gradient(135deg, #ff3131, #cc1023);
}

.subscribe-btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
  background: #b8c0ca;
  color: #1f2630;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.comment-box {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  margin-bottom: 16px;
}

.comment-box input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d5dbe3;
  border-radius: 16px;
  padding: 13px 15px;
  background: #fff;
  font: inherit;
}

.comments {
  display: grid;
  gap: 14px;
}

.comment {
  padding-bottom: 14px;
  border-bottom: 1px solid #e7ebf0;
}

.comment:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.comment strong,
.recommended-copy strong {
  display: block;
  color: #111318;
  margin-bottom: 6px;
}

.recommended-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.recommended-item {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.recommended-thumb {
  overflow: hidden;
  border-radius: 18px;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #101114, #2a2d35);
}

.recommended-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommended-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.82rem;
  font-weight: 700;
}

.recommended-copy {
  display: grid;
  align-content: start;
  gap: 4px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
}

.pagination button {
  background: #edf1f5;
  color: #16181d;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.empty-state {
  padding: 26px 18px;
  border-radius: 22px;
  text-align: center;
  background: #f4f6f8;
}

.empty-state.compact {
  margin-top: 16px;
}

@media (max-width: 1080px) {
  .watch-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .watch-page {
    padding-inline: 18px;
  }

  .comment-box,
  .recommended-item,
  .pagination {
    grid-template-columns: 1fr;
  }

  .pagination {
    justify-content: stretch;
  }
}
</style>
