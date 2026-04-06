<template>
  <!-- Main container of the watch page -->
  <section class="watch-page">
    <div class="watch-layout">

      <!-- Left column: player, video details, and comments -->
      <div class="watch-main">

        <!-- Video player wrapper -->
        <div class="player-shell">

          <!-- Render the video only when the backend returned a source URL -->
          <video
            v-if="video.video_url"
            controls
            class="player"
            :src="base + video.video_url" 
            @play="handlePlay"
          ></video>
        </div>

        <!-- Video metadata -->
        <div class="meta-card">
          <h1>{{ video.title }}</h1>

          <!-- Uploader name and total views -->
          <div class="sub-meta">
            <span>{{ video.uploader_username || 'MiniYouTube Creator' }}</span>
            <span>{{ video.views || 0 }} views</span>
          </div>

          <!-- Like button -->
          <div class="actions">
            <button class="like-btn" @click="toggleLike">
              {{ liked ? 'Unlike' : 'Like' }} ({{ likesCount }})
            </button>
          </div>

          <!-- Video description -->
          <p>{{ video.description || 'No description yet.' }}</p>
        </div>

        <!-- COMMENTS SECTION -->
        <div class="comments-panel">
          <div class="section-head">
            <h2>Comments</h2>
            <span>{{ comments.length }}</span>
          </div>

          <!-- Show the comment form only to logged-in users -->
          <div v-if="isAuthenticated()" class="comment-box">
            <!-- v-model keeps the input value in sync with newComment -->
            <input
              v-model="newComment" 
              placeholder="Write a comment..."
            />
            <button @click="submitComment">Post</button>
          </div>

          <!-- Comments list -->
          <div v-if="comments.length" class="comments">
            <div v-for="c in comments" :key="c.id" class="comment">
              <strong>{{ c.username }}</strong>
              <p>{{ c.content }}</p>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="empty-state">
            <h3>No comments yet</h3>
            <p>Start the conversation on this video.</p>
          </div>
        </div>
      </div>

      <!-- Right column: recommended videos -->
      <aside class="watch-sidebar">
        <div class="sidebar-card">

          <!-- Sidebar header -->
          <div class="section-head">
            <h2>Recommended</h2>
            <span>{{ filteredVideos.length }}</span>
          </div>

          <!-- Recommended list -->
          <div v-if="paginatedVideos.length" class="recommended-list">
            <button
              v-for="item in paginatedVideos"
              :key="item.id"
              class="recommended-item"
              type="button"
              @click="goToVideo(item.id)"
            >
              <!-- Open another watch page when a recommended item is clicked -->
              <!-- Thumbnail -->
              <div class="recommended-thumb">
                <img
                  v-if="item.thumbnail_url"
                  :src="base + item.thumbnail_url"
                  alt="thumbnail"
                />
                <div v-else class="recommended-fallback">No Thumbnail</div>
              </div>

              <!-- Video info -->
              <div class="recommended-copy">
                <strong>{{ item.title }}</strong>
                <span>{{ item.uploader_username || 'MiniYouTube Creator' }}</span>
                <small>{{ item.views || 0 }} views</small>
              </div>
            </button>
          </div>

          <!-- Empty recommended -->
          <div v-else class="empty-state compact">
            <h3>No videos found</h3>
            <p>Try a different search term.</p>
          </div>

          <!-- Pagination controls -->
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
// Vue core utilities
import { computed, ref, onMounted, watch } from 'vue';

// Vue Router helpers for the current route and page navigation
import { useRoute, useRouter } from 'vue-router';

// Shared Axios client for backend requests
import api from '../src/services/api';

// Auth store used to check whether the user is logged in
import { useAuth } from '../src/store/auth';

// Route state and navigation helpers
const route = useRoute();
const router = useRouter();

// Auth helper used in the template and actions
const { isAuthenticated } = useAuth();

// Reactive state used by the watch page UI
const video = ref({});          // Currently selected video
const videos = ref([]);         // All videos used to build the recommended list
const comments = ref([]);       // Comments for the current video
const newComment = ref('');     // New comment input value
const likesCount = ref(0);      // Total likes for the current video
const liked = ref(false);       // Whether the current user already liked this video
const currentPage = ref(1);     // Current page in the recommended sidebar

// Backend base URL
const base = 'http://localhost:5000';

// Prevent counting the same visit more than once
const hasCountedView = ref(false);

// Number of recommended videos per page
const pageSize = 5;

/*
  Filter the recommended list by:
  1. removing the current video
  2. applying the search term from the route query (?search=...)
*/
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

// Total number of pages in the recommended sidebar
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredVideos.value.length / pageSize));
});

// Only show the videos for the active sidebar page
const paginatedVideos = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredVideos.value.slice(start, start + pageSize);
});

/*
  FETCH FUNCTIONS (API CALLS)
*/

// Load the main video data
const fetchVideo = async () => {
  const res = await api.get(`/videos/${route.params.id}`);
  video.value = res.data;

  // If the card already counted the view, do not count it again on first play
  hasCountedView.value = route.query.counted === '1';
};

// Load all videos so the sidebar can build recommended items
const fetchAllVideos = async () => {
  const res = await api.get('/videos');
  videos.value = res.data;
};

// Load total likes and whether the current user liked this video
const fetchLikes = async () => {
  try {
    const res = await api.get(`/likes/${route.params.id}`);
    likesCount.value = res.data.count;
    liked.value = res.data.liked;
  } catch {
    // Fall back to a safe empty state if the likes request fails
    likesCount.value = 0;
    liked.value = false;
  }
};

// Load comments for the current video
const fetchComments = async () => {
  const res = await api.get(`/comments/${route.params.id}`);
  comments.value = res.data;
};

/*
  EVENT HANDLERS
*/

// Count a view only once per watch-page visit
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

// Toggle like state, then refresh the like summary
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

// Post a new comment and reload the comment list
const submitComment = async () => {
  if (!newComment.value.trim()) return;

  await api.post(`/comments/${route.params.id}`, {
    content: newComment.value
  });

  newComment.value = '';
  await fetchComments();
};

// Open another video from the recommended sidebar
const goToVideo = (id) => {
  router.push(`/watch/${id}`);
};

/*
  Load every API resource the watch page needs
*/
const loadPageData = async () => {
  currentPage.value = 1;

  await Promise.all([
    fetchVideo(),
    fetchAllVideos(),
    fetchLikes(),
    fetchComments()
  ]);
};

// Run once when the page is first mounted
onMounted(loadPageData);

/*
  Watchers keep the page in sync with route changes
*/

// Reload the whole page state when the watched video changes
watch(() => route.params.id, loadPageData);

// Keep the view-count flag aligned with the route query
watch(() => route.query.counted, () => {
  hasCountedView.value = route.query.counted === '1';
});

// Reset pagination whenever the header search term changes
watch(() => route.query.search, () => {
  currentPage.value = 1;
});

// Prevent the current page from pointing past the available results
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
  gap: 12px;
  font-size: 0.95rem;
}

.actions {
  display: flex;
}

.like-btn,
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
.comment-box button {
  color: #fff;
  background: linear-gradient(135deg, #ff3131, #cc1023);
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
