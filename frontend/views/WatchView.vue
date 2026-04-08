<template>
  <!-- Main container for the watch page -->
  <section class="watch-page">
    <div class="watch-layout">
      <!-- Left column: player, metadata, and comments -->
      <div class="watch-main">
        <div ref="playerShell" class="player-shell">
          <div
            v-if="video.video_url"
            class="player-stage"
            tabindex="0"
            @mousemove="handlePlayerActivity"
            @mouseleave="scheduleOverlayHide"
          >
          <!-- Render the player only when the backend returns a video source -->
          <video
            ref="player"
            :controls="showNativeControls"
            class="player"
            :src="base + video.video_url"
            @play="handlePlay"
            @timeupdate="handleTimeUpdate"
            @pause="handlePause"
            @ended="handleEnded"
            @loadedmetadata="handleMetadataLoaded"
            @mouseenter="handlePlayerActivity"
          ></video>

            <div
              :class="['player-hitbox', { 'controls-visible': showNativeControls }]"
              @click="handleSurfaceClick"
              @dblclick.prevent="handleSurfaceDoubleClick"
              @mousemove="handlePlayerActivity"
            ></div>

            <div
              :class="['player-overlay', { visible: showCenterControls }]"
            >
              <div class="overlay-zone overlay-zone-left" aria-hidden="true">
                <span v-if="overlayHint === 'backward'" class="overlay-burst">-10s</span>
              </div>

              <div class="overlay-center">
                <button
                  type="button"
                  class="control-chip seek-chip"
                  @click.stop="seekBy(-10)"
                  aria-label="Go back 10 seconds"
                >
                  <span class="chip-icon">‹‹</span>
                  <span class="chip-label">10</span>
                </button>

                <button
                  type="button"
                  class="control-chip play-chip"
                  @click.stop="togglePlayback"
                  :aria-label="isPlaying ? 'Pause video' : 'Play video'"
                >
                  {{ isPlaying ? '❚❚' : '▶' }}
                </button>

                <button
                  type="button"
                  class="control-chip seek-chip"
                  @click.stop="seekBy(10)"
                  aria-label="Go forward 10 seconds"
                >
                  <span class="chip-label">10</span>
                  <span class="chip-icon">››</span>
                </button>
              </div>

              <div class="overlay-zone overlay-zone-right" aria-hidden="true">
                <span v-if="overlayHint === 'forward'" class="overlay-burst">+10s</span>
              </div>
            </div>
          </div>
        </div>

        <div class="meta-card">
          <h1>{{ video.title }}</h1>

          <div class="sub-meta">
            <button
              class="creator-link"
              type="button"
              @click="goToProfile(video.user_id)"
            >
              <span class="creator-avatar">
                <img
                  v-if="video.uploader_avatar"
                  :src="base + video.uploader_avatar"
                  alt="creator avatar"
                />
                <span v-else>{{ (video.uploader_username || 'M').charAt(0).toUpperCase() }}</span>
              </span>
              <span>{{ video.uploader_username || 'MiniYouTube Creator' }}</span>
            </button>
            <span>{{ video.views || 0 }} views</span>
            <button
              class="like-chip"
              type="button"
              @click="toggleLike"
              :aria-pressed="liked"
            >
              <span class="like-icon">{{ liked ? '♥' : '♡' }}</span>
              <span>{{ likesCount }}</span>
            </button>

            <div class="channel-actions-inline">
              <span class="subscriber-total">{{ subscriberCount }} subscribers</span>
              <button
                :class="['subscribe-btn', { subscribed }]"
                :disabled="isOwnChannel"
                @click="toggleSubscription"
              >
                {{ isOwnChannel ? 'Your Channel' : subscribed ? 'Subscribed' : 'Subscribe' }}
              </button>
            </div>
          </div>

          <p>{{ video.description || 'No description yet.' }}</p>
        </div>

        <div class="comments-panel">
          <div class="section-head">
            <h2>Comments</h2>
            <span>{{ totalCommentsCount }}</span>
          </div>

          <!-- Only logged-in users can submit comments -->
          <div v-if="isAuthenticated()" class="comment-box">
            <input
              v-model="newComment"
              placeholder="Write a comment..."
              @keydown.enter.prevent="submitComment"
            />
            <button @click="submitComment">Post</button>
          </div>

          <div v-if="comments.length" class="comments">
            <div
              v-for="comment in comments"
              :key="comment.id"
              :class="['comment-thread', { 'has-replies': comment.replies.length && isRepliesExpanded(comment.id) }]"
            >
              <div class="comment">
                <button
                  type="button"
                  class="comment-avatar comment-avatar-link"
                  @click="goToProfile(comment.user_id)"
                  :aria-label="`${comment.username} profile`"
                >
                  <img
                    v-if="comment.avatar"
                    :src="base + comment.avatar"
                    :alt="`${comment.username} avatar`"
                  />
                  <span v-else>{{ getCommentInitial(comment.username) }}</span>
                </button>
                <div class="comment-body">
                  <div class="comment-meta">
                    <button
                      type="button"
                      class="comment-author-link"
                      @click="goToProfile(comment.user_id)"
                    >
                      {{ comment.username }}
                    </button>
                    <span>{{ formatCommentTimestamp(comment.created_at) }}</span>
                  </div>
                  <p class="comment-copy">{{ comment.content }}</p>
                  <div class="comment-actions">
                    <button
                      type="button"
                      :class="['comment-reaction-btn', 'icon-only', { active: comment.userReaction === 'like' }]"
                      @click="toggleCommentReaction(comment, 'like')"
                      :aria-pressed="comment.userReaction === 'like'"
                      aria-label="Like comment"
                    >
                      <span class="comment-reaction-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M8 11v9" />
                          <path d="M8 20H5a2 2 0 0 1-2-2v-5.5A1.5 1.5 0 0 1 4.5 11H8Z" />
                          <path d="M14 11V6.5A2.5 2.5 0 0 0 11.5 4L8 11v9h8.2a2 2 0 0 0 2-1.6l1.2-5.5A2 2 0 0 0 17.45 11Z" />
                        </svg>
                      </span>
                      <span v-if="comment.likesCount" class="comment-reaction-count">{{ comment.likesCount }}</span>
                    </button>
                    <button
                      type="button"
                      :class="['comment-reaction-btn', 'icon-only', { active: comment.userReaction === 'dislike' }]"
                      @click="toggleCommentReaction(comment, 'dislike')"
                      :aria-pressed="comment.userReaction === 'dislike'"
                      aria-label="Dislike comment"
                    >
                      <span class="comment-reaction-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M16 13V4" />
                          <path d="M16 4h3a2 2 0 0 1 2 2v5.5A1.5 1.5 0 0 1 19.5 13H16Z" />
                          <path d="M10 13v4.5A2.5 2.5 0 0 0 12.5 20l3.5-7V4H7.8a2 2 0 0 0-2 1.6l-1.2 5.5A2 2 0 0 0 6.55 13Z" />
                        </svg>
                      </span>
                    </button>
                    <button
                      type="button"
                      class="comment-text-action"
                      @click="toggleReplyComposer(comment.id)"
                    >
                      Reply
                    </button>
                  </div>
                  <div v-if="replyComposerId === comment.id" class="reply-box">
                    <div class="reply-box-shell">
                      <div class="comment-avatar reply-composer-avatar">
                        <img
                          v-if="user?.avatar"
                          :src="base + user.avatar"
                          alt="your avatar"
                        />
                        <span v-else>{{ getCommentInitial(user?.username) }}</span>
                      </div>
                      <input
                        v-model="replyDrafts[comment.id]"
                        :placeholder="`Reply to ${comment.username}...`"
                        @keydown.enter.prevent="submitReply(comment.id)"
                      />
                      <button
                        type="button"
                        class="reply-send-btn"
                        @click="submitReply(comment.id)"
                        :disabled="!replyDrafts[comment.id]?.trim()"
                        aria-label="Send reply"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M22 2 11 13" />
                          <path d="m22 2-7 20-4-9-9-4Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button
                    v-if="comment.replies.length"
                    type="button"
                    class="reply-toggle"
                    @click="toggleReplies(comment.id)"
                  >
                    <span class="reply-toggle-line" aria-hidden="true"></span>
                    <span>{{ comment.replies.length }} {{ comment.replies.length === 1 ? 'reply' : 'replies' }}</span>
                    <span :class="['reply-toggle-chevron', { open: isRepliesExpanded(comment.id) }]" aria-hidden="true">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m3 6 5 5 5-5" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>

              <div v-if="comment.replies.length && isRepliesExpanded(comment.id)" class="reply-list">
                <div v-for="reply in comment.replies" :key="reply.id" class="comment reply-comment">
                  <div class="comment-thread-line" aria-hidden="true"></div>
                  <button
                    type="button"
                    class="comment-avatar reply-avatar comment-avatar-link"
                    @click="goToProfile(reply.user_id)"
                    :aria-label="`${reply.username} profile`"
                  >
                    <img
                      v-if="reply.avatar"
                      :src="base + reply.avatar"
                      :alt="`${reply.username} avatar`"
                    />
                    <span v-else>{{ getCommentInitial(reply.username) }}</span>
                  </button>
                  <div class="comment-body">
                    <div class="comment-meta">
                      <button
                        type="button"
                        class="comment-author-link"
                        @click="goToProfile(reply.user_id)"
                      >
                        {{ reply.username }}
                      </button>
                      <span>{{ formatCommentTimestamp(reply.created_at) }}</span>
                    </div>
                    <p class="comment-copy">{{ reply.content }}</p>
                    <div class="comment-actions">
                      <button
                        type="button"
                        :class="['comment-reaction-btn', 'icon-only', { active: reply.userReaction === 'like' }]"
                        @click="toggleCommentReaction(reply, 'like')"
                        :aria-pressed="reply.userReaction === 'like'"
                        aria-label="Like reply"
                      >
                        <span class="comment-reaction-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M8 11v9" />
                            <path d="M8 20H5a2 2 0 0 1-2-2v-5.5A1.5 1.5 0 0 1 4.5 11H8Z" />
                            <path d="M14 11V6.5A2.5 2.5 0 0 0 11.5 4L8 11v9h8.2a2 2 0 0 0 2-1.6l1.2-5.5A2 2 0 0 0 17.45 11Z" />
                          </svg>
                        </span>
                        <span v-if="reply.likesCount" class="comment-reaction-count">{{ reply.likesCount }}</span>
                      </button>
                      <button
                        type="button"
                        :class="['comment-reaction-btn', 'icon-only', { active: reply.userReaction === 'dislike' }]"
                        @click="toggleCommentReaction(reply, 'dislike')"
                        :aria-pressed="reply.userReaction === 'dislike'"
                        aria-label="Dislike reply"
                      >
                        <span class="comment-reaction-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 13V4" />
                            <path d="M16 4h3a2 2 0 0 1 2 2v5.5A1.5 1.5 0 0 1 19.5 13H16Z" />
                            <path d="M10 13v4.5A2.5 2.5 0 0 0 12.5 20l3.5-7V4H7.8a2 2 0 0 0-2 1.6l-1.2 5.5A2 2 0 0 0 6.55 13Z" />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
        <div class="sidebar-card" :style="sidebarCardStyle">
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
import { computed, ref, onBeforeUnmount, onMounted, watch, nextTick } from 'vue';
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
const replyDrafts = ref({});
const replyComposerId = ref(null);
const expandedReplyThreads = ref({});
const likesCount = ref(0);
const liked = ref(false);
const player = ref(null);
const playerShell = ref(null);
const currentPage = ref(1);
const subscribed = ref(false);
const subscriberCount = ref(0);

const base = 'http://localhost:5000';
const hasCountedView = ref(false);
const lastSavedSecond = ref(0);
const historySaveInFlight = ref(false);
const isPlaying = ref(false);
const showCenterControls = ref(false);
const showNativeControls = ref(true);
const overlayHint = ref('');
const centerControlsHideTimer = ref(null);
const nativeControlsHideTimer = ref(null);
const overlayHintTimer = ref(null);
const surfaceClickTimer = ref(null);
const sidebarHeight = ref(null);
let playerShellObserver = null;
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

const totalCommentsCount = computed(() => {
  return comments.value.reduce((total, comment) => total + 1 + comment.replies.length, 0);
});

const paginatedVideos = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredVideos.value.slice(start, start + pageSize);
});

const sidebarCardStyle = computed(() => {
  if (!sidebarHeight.value) {
    return {};
  }

  return {
    height: `${sidebarHeight.value}px`
  };
});

const fetchVideo = async () => {
  const res = await api.get(`/videos/${route.params.id}`);
  video.value = res.data;
  hasCountedView.value = route.query.counted === '1';
  lastSavedSecond.value = 0;
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

const buildCommentThreads = (items) => {
  const topLevel = [];
  const repliesByParent = new Map();

  items.forEach((item) => {
    if (item.parent_comment_id) {
      const existingReplies = repliesByParent.get(String(item.parent_comment_id)) || [];
      existingReplies.push(item);
      repliesByParent.set(String(item.parent_comment_id), existingReplies);
      return;
    }

    topLevel.push(item);
  });

  return topLevel.map((comment) => ({
    ...comment,
    replies: (repliesByParent.get(String(comment.id)) || []).sort((a, b) => {
      return new Date(a.created_at) - new Date(b.created_at);
    })
  }));
};

const fetchComments = async () => {
  const res = await api.get(`/comments/${route.params.id}`);
  comments.value = buildCommentThreads(res.data.map(normalizeComment));

  expandedReplyThreads.value = comments.value.reduce((acc, comment) => {
    acc[comment.id] = expandedReplyThreads.value[comment.id] ?? false;
    return acc;
  }, {});
};

const normalizeComment = (comment) => {
  return {
    ...comment,
    parent_comment_id: comment.parent_comment_id ?? null,
    likesCount: Number(comment.likesCount || 0),
    dislikesCount: Number(comment.dislikesCount || 0),
    userReaction: comment.userReaction || null,
    replies: comment.replies || []
  };
};

const replaceCommentReaction = (items, updatedComment) => {
  return items.map((comment) => {
    if (String(comment.id) === String(updatedComment.id)) {
      return {
        ...comment,
        ...normalizeComment(updatedComment)
      };
    }

    if (comment.replies.length) {
      return {
        ...comment,
        replies: replaceCommentReaction(comment.replies, updatedComment)
      };
    }

    return comment;
  });
};

const updateCommentInList = (updatedComment) => {
  comments.value = replaceCommentReaction(comments.value, updatedComment);
};

const getCommentInitial = (username) => {
  return String(username || 'U').charAt(0).toUpperCase();
};

const formatCommentTimestamp = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'just now';
  }

  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  const ranges = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60]
  ];

  for (const [unit, size] of ranges) {
    if (seconds >= size) {
      const valueCount = Math.floor(seconds / size);
      return `${valueCount} ${unit}${valueCount === 1 ? '' : 's'} ago`;
    }
  }

  return 'just now';
};

const toggleReplyComposer = (commentId) => {
  if (!isAuthenticated()) {
    alert('Login required');
    return;
  }

  replyComposerId.value = replyComposerId.value === commentId ? null : commentId;
  replyDrafts.value = {
    ...replyDrafts.value,
    [commentId]: replyDrafts.value[commentId] || ''
  };
};

const closeReplyComposer = () => {
  replyComposerId.value = null;
};

const toggleReplies = (commentId) => {
  expandedReplyThreads.value = {
    ...expandedReplyThreads.value,
    [commentId]: !expandedReplyThreads.value[commentId]
  };
};

const isRepliesExpanded = (commentId) => {
  return expandedReplyThreads.value[commentId] ?? false;
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
  isPlaying.value = true;
  showCenterOverlay();
  showPlayerOverlay();

  if (hasCountedView.value || !route.params.id) return;

  try {
    const res = await api.post(`/videos/${route.params.id}/view`);
    video.value = res.data;
    hasCountedView.value = true;
  } catch (err) {
    console.error('VIEW COUNT ERROR:', err);
  }
};

const saveWatchProgress = async (force = false, overrideProgress = null) => {
  if (!isAuthenticated() || !route.params.id || !player.value) return;

  const durationSeconds = Number(player.value.duration);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return;

  const progressSeconds = overrideProgress ?? Number(player.value.currentTime);
  if (!Number.isFinite(progressSeconds) || progressSeconds < 0) return;

  const roundedProgress = Math.min(durationSeconds, Math.max(0, progressSeconds));
  const roundedDuration = Math.max(0, durationSeconds);

  if (!force && Math.abs(roundedProgress - lastSavedSecond.value) < 5) {
    return;
  }

  if (historySaveInFlight.value) {
    return;
  }

  try {
    historySaveInFlight.value = true;
    lastSavedSecond.value = roundedProgress;
    await api.post(`/history/${route.params.id}`, {
      progressSeconds: roundedProgress,
      durationSeconds: roundedDuration
    });
  } catch (err) {
    console.error('WATCH HISTORY SAVE ERROR:', err);
  } finally {
    historySaveInFlight.value = false;
  }
};

const handleTimeUpdate = () => {
  isPlaying.value = !player.value?.paused;
  saveWatchProgress(false);
};

const handlePause = () => {
  isPlaying.value = false;
  showCenterControls.value = true;
  showPlayerOverlay();
  saveWatchProgress(true);
};

const handleEnded = () => {
  if (!player.value) return;
  isPlaying.value = false;
  showCenterControls.value = true;
  showPlayerOverlay();
  saveWatchProgress(true, Number(player.value.duration) || 0);
};

const clearOverlayTimers = () => {
  if (centerControlsHideTimer.value) {
    clearTimeout(centerControlsHideTimer.value);
    centerControlsHideTimer.value = null;
  }

  if (nativeControlsHideTimer.value) {
    clearTimeout(nativeControlsHideTimer.value);
    nativeControlsHideTimer.value = null;
  }

  if (overlayHintTimer.value) {
    clearTimeout(overlayHintTimer.value);
    overlayHintTimer.value = null;
  }

  if (surfaceClickTimer.value) {
    clearTimeout(surfaceClickTimer.value);
    surfaceClickTimer.value = null;
  }
};

const scheduleOverlayHide = () => {
  if (!isPlaying.value) {
    showNativeControls.value = true;
    return;
  }

  if (nativeControlsHideTimer.value) {
    clearTimeout(nativeControlsHideTimer.value);
  }

  nativeControlsHideTimer.value = setTimeout(() => {
    showNativeControls.value = false;
  }, 2000);
};

const showPlayerOverlay = () => {
  showNativeControls.value = true;
  scheduleOverlayHide();
};

const scheduleCenterControlsHide = () => {
  if (!isPlaying.value) {
    showCenterControls.value = true;
    return;
  }

  if (centerControlsHideTimer.value) {
    clearTimeout(centerControlsHideTimer.value);
  }

  centerControlsHideTimer.value = setTimeout(() => {
    showCenterControls.value = false;
  }, 1200);
};

const showCenterOverlay = () => {
  showCenterControls.value = true;
  scheduleCenterControlsHide();
};

const handlePlayerActivity = () => {
  if (!isPlaying.value) {
    showCenterControls.value = true;
  }
  showPlayerOverlay();
};

const flashOverlayHint = (direction) => {
  overlayHint.value = direction;
  showCenterOverlay();
  showPlayerOverlay();

  if (overlayHintTimer.value) {
    clearTimeout(overlayHintTimer.value);
  }

  overlayHintTimer.value = setTimeout(() => {
    overlayHint.value = '';
  }, 900);
};

const togglePlayback = async () => {
  if (!player.value) return;

  showCenterOverlay();
  showPlayerOverlay();

  if (player.value.paused) {
    await player.value.play();
  } else {
    player.value.pause();
  }
};

const getSurfaceSeekDirection = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;

  if (offsetX < rect.width * 0.35) {
    return -10;
  }

  if (offsetX > rect.width * 0.65) {
    return 10;
  }

  return 0;
};

const handleSurfaceClick = (event) => {
  if (surfaceClickTimer.value) {
    clearTimeout(surfaceClickTimer.value);
    surfaceClickTimer.value = null;
  }

  handlePlayerActivity();

  surfaceClickTimer.value = setTimeout(() => {
    togglePlayback();
    surfaceClickTimer.value = null;
  }, 220);
};

const handleSurfaceDoubleClick = (event) => {
  if (surfaceClickTimer.value) {
    clearTimeout(surfaceClickTimer.value);
    surfaceClickTimer.value = null;
  }

  const direction = getSurfaceSeekDirection(event);

  if (direction !== 0) {
    seekBy(direction);
    return;
  }

  togglePlayback();
};

const seekBy = (seconds) => {
  if (!player.value) return;

  const duration = Number(player.value.duration) || 0;
  const currentTime = Number(player.value.currentTime) || 0;
  const nextTime = Math.min(duration || currentTime + seconds, Math.max(0, currentTime + seconds));

  player.value.currentTime = nextTime;
  flashOverlayHint(seconds < 0 ? 'backward' : 'forward');
  saveWatchProgress(true, nextTime);
};

const handleMetadataLoaded = () => {
  isPlaying.value = !player.value?.paused;
  showCenterControls.value = !isPlaying.value;
  showPlayerOverlay();
};

const adjustVolumeBy = (delta) => {
  if (!player.value) return;

  const nextVolume = Math.max(0, Math.min(1, Number(player.value.volume || 0) + delta));
  player.value.volume = nextVolume;
  if (nextVolume > 0) {
    player.value.muted = false;
  }
  showPlayerOverlay();
};

const handlePlayerKeydown = (event) => {
  if (!player.value) return;

  if (event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }

  const activeTag = document.activeElement?.tagName;
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
    return;
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    seekBy(10);
    return;
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    seekBy(-10);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    adjustVolumeBy(0.1);
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    adjustVolumeBy(-0.1);
    return;
  }

  if (event.code === 'Space') {
    event.preventDefault();
    togglePlayback();
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

const submitReply = async (commentId) => {
  const content = String(replyDrafts.value[commentId] || '').trim();
  if (!content) return;

  await api.post(`/comments/${route.params.id}`, {
    content,
    parentCommentId: commentId
  });

  replyDrafts.value = {
    ...replyDrafts.value,
    [commentId]: ''
  };
  replyComposerId.value = null;
  expandedReplyThreads.value = {
    ...expandedReplyThreads.value,
    [commentId]: true
  };
  await fetchComments();
};

const toggleCommentReaction = async (comment, reaction) => {
  if (!isAuthenticated()) {
    alert('Login required');
    return;
  }

  try {
    let res;

    if (comment.userReaction === reaction) {
      res = await api.delete(`/comments/${comment.id}/reaction`);
    } else {
      res = await api.post(`/comments/${comment.id}/reaction`, { reaction });
    }

    updateCommentInList(res.data);
  } catch (err) {
    console.error('COMMENT REACTION ERROR:', err);
  }
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
  lastSavedSecond.value = 0;
  historySaveInFlight.value = false;
  isPlaying.value = false;
  showCenterControls.value = false;
  showNativeControls.value = true;
  overlayHint.value = '';
  clearOverlayTimers();
  replyComposerId.value = null;
  replyDrafts.value = {};

  await Promise.all([
    fetchVideo(),
    fetchAllVideos(),
    fetchLikes(),
    fetchComments()
  ]);

  setTimeout(fetchSubscription, 300);
  await nextTick();
  updateSidebarHeight();
};

const updateSidebarHeight = () => {
  if (!playerShell.value) {
    sidebarHeight.value = null;
    return;
  }

  sidebarHeight.value = Math.round(playerShell.value.getBoundingClientRect().height);
};

onMounted(loadPageData);
onMounted(() => {
  window.addEventListener('keydown', handlePlayerKeydown);
  window.addEventListener('resize', updateSidebarHeight);

  nextTick(() => {
    updateSidebarHeight();

    if (typeof ResizeObserver !== 'undefined' && playerShell.value) {
      playerShellObserver = new ResizeObserver(() => {
        updateSidebarHeight();
      });
      playerShellObserver.observe(playerShell.value);
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handlePlayerKeydown);
  window.removeEventListener('resize', updateSidebarHeight);
  clearOverlayTimers();

  if (playerShellObserver) {
    playerShellObserver.disconnect();
    playerShellObserver = null;
  }
});

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

watch(player, () => {
  showPlayerOverlay();
  nextTick(updateSidebarHeight);
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

.watch-sidebar {
  align-self: start;
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

.sidebar-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-sizing: border-box;
}

.player-stage {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: #000;
  outline: none;
}

.player {
  width: 100%;
  max-height: 480px;
  display: block;
  background: #000;
}

.player-hitbox {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.player-hitbox.controls-visible {
  pointer-events: none;
}

.player-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease;
  background:
    radial-gradient(circle at center, rgba(0, 0, 0, 0.04), transparent 34%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.08), transparent 28%, transparent 72%, rgba(0, 0, 0, 0.08));
}

.player-overlay.visible {
  opacity: 1;
}

.overlay-zone {
  position: relative;
  height: 100%;
}

.overlay-zone-left {
  background: radial-gradient(circle at 26% 50%, rgba(255, 255, 255, 0.02), transparent 32%);
}

.overlay-zone-right {
  background: radial-gradient(circle at 74% 50%, rgba(255, 255, 255, 0.02), transparent 32%);
}

.overlay-center {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 18px;
  pointer-events: auto;
}

.control-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 68px;
  height: 68px;
  border: 0;
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
  backdrop-filter: blur(16px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
  transition: transform 160ms ease, background 160ms ease, opacity 160ms ease;
}

.control-chip:hover {
  transform: scale(1.04);
}

.play-chip {
  width: 88px;
  height: 88px;
  background: linear-gradient(135deg, rgba(255, 49, 49, 0.1), rgba(191, 12, 36, 0.1));
  font-size: 2rem;
}

.seek-chip {
  background: rgba(17, 19, 24, 0.1);
  font-weight: 800;
}

.chip-icon {
  font-size: 1.08rem;
  letter-spacing: -0.08em;
}

.chip-label {
  font-size: 0.98rem;
}

.overlay-burst {
  position: absolute;
  top: 50%;
  padding: 12px 16px;
  border-radius: 999px;
  background: rgba(15, 16, 20, 0.42);
  color: #fff;
  font-weight: 800;
  backdrop-filter: blur(14px);
  transform: translateY(-50%);
}

.overlay-zone-left .overlay-burst {
  left: 24px;
}

.overlay-zone-right .overlay-burst {
  right: 24px;
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

.channel-actions-inline {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.creator-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: #cc1023;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.creator-link:hover {
  text-decoration: underline;
}

.creator-avatar {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #111318, #3b404a);
  color: #fff;
  font-size: 0.92rem;
  font-weight: 800;
  flex-shrink: 0;
}

.creator-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.like-chip,
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

.subscribe-btn,
.comment-box button {
  color: #fff;
  background: linear-gradient(135deg, #ff3131, #cc1023);
}

.like-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  color: #1b2028;
  background: #eef2f6;
  border: 1px solid #d6dde6;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.like-chip[aria-pressed='true'] {
  background: #fff1f3;
  border-color: #f3bcc6;
  color: #b0182a;
}

.like-icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(17, 19, 24, 0.08);
  font-size: 0.92rem;
  line-height: 1;
}

.like-chip[aria-pressed='true'] .like-icon {
  background: rgba(176, 24, 42, 0.12);
}

.subscriber-total {
  color: #677384;
  font-size: 0.92rem;
  font-weight: 600;
  white-space: nowrap;
}

.subscribe-btn {
  padding: 10px 16px;
  color: #15202b;
  background: linear-gradient(180deg, #ffffff, #edf2f7);
  border: 1px solid #d6dde6;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.subscribe-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #ffffff, #e7edf4);
}

.subscribe-btn:not(:disabled) {
  color: #15202b;
}

.subscribe-btn.subscribed:not(:disabled) {
  background: #111318;
  border-color: #111318;
  color: #fff;
}

.subscribe-btn:disabled {
  cursor: not-allowed;
  opacity: 0.75;
  background: #eef2f6;
  border-color: #d6dde6;
  color: #526070;
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

.comment-thread {
  display: grid;
  gap: 12px;
  padding: 6px 0 20px;
  border-bottom: 1px solid #e7ebf0;
  position: relative;
}

.comment-thread:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.comment-thread.has-replies::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 48px;
  bottom: 104.5px;
  width: 2px;
  border-radius: 999px;
  background: #cbd5e1;
}

.comment {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: start;
}

.comment-avatar {
  position: relative;
  z-index: 2;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2a2d35, #6b7280);
  color: #fff;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.comment-avatar-link {
  border: 0;
  padding: 0;
  cursor: pointer;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-avatar span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.reply-avatar {
  width: 36px;
  height: 36px;
  font-size: 0.88rem;
}

.comment-body {
  min-width: 0;
  padding-top: 2px;
}

.comment-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-author-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: #111318;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.comment-author-link:hover {
  text-decoration: underline;
}

.comment-meta span {
  color: #7a8594;
  font-size: 0.86rem;
}

.comment-copy {
  margin: 0;
  color: #171a20;
  font-size: 1rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.comment-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.comment-reaction-btn {
  border-radius: 999px;
  padding: 7px 10px;
  border: 0;
  background: transparent;
  color: #526070;
  font: inherit;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease, transform 160ms ease;
}

.comment-reaction-btn:hover {
  background: #eef2f6;
  color: #111318;
}

.comment-reaction-btn.active {
  background: #fff4f6;
  color: #b0182a;
}

.comment-reaction-btn.icon-only {
  padding-right: 12px;
}

.comment-reaction-icon {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(17, 19, 24, 0.06);
  font-size: 0.92rem;
  line-height: 1;
  transition: background 160ms ease;
}

.comment-reaction-icon svg {
  width: 14px;
  height: 14px;
}

.comment-reaction-count {
  min-width: 10px;
}

.comment-reaction-btn.active .comment-reaction-icon {
  background: rgba(176, 24, 42, 0.12);
}

.comment-text-action {
  border: 0;
  background: transparent;
  color: #394452;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  padding: 7px 10px;
  border-radius: 999px;
  transition: background 160ms ease, color 160ms ease;
}

.comment-text-action:hover {
  background: #eef2f6;
  color: #111318;
}

.reply-box {
  margin-top: 12px;
  display: grid;
  gap: 10px;
  padding: 14px 16px 14px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f8fafc, #f2f5f8);
  border: 1px solid #e3e8ee;
}

.reply-box-shell {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
}

.reply-composer-avatar {
  width: 34px;
  height: 34px;
  font-size: 0.82rem;
}

.reply-box input {
  width: 100%;
  box-sizing: border-box;
  border: 0;
  border-bottom: 2px solid #cfd7e1;
  border-radius: 16px;
  padding: 10px 2px 12px;
  background: transparent;
  font: inherit;
  outline: none;
}

.reply-box input:focus {
  border-bottom-color: #cc1023;
}

.reply-send-btn {
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff3131, #cc1023);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 12px 22px rgba(204, 16, 35, 0.22);
  transition: transform 160ms ease, opacity 160ms ease, box-shadow 160ms ease;
}

.reply-send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(204, 16, 35, 0.28);
}

.reply-send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
}

.reply-send-btn svg {
  width: 16px;
  height: 16px;
}

.reply-toggle {
  margin-top: 12px;
  border: 0;
  background: transparent;
  color: #2453c0;
  font: inherit;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  padding: 6px 10px 6px 0;
  width: fit-content;
  transition: color 160ms ease, transform 160ms ease;
}

.reply-toggle:hover {
  color: #17398b;
}

.reply-toggle-line {
  width: 24px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.35;
}

.reply-toggle-chevron {
  display: inline-flex;
  transition: transform 160ms ease;
  line-height: 1;
}

.reply-toggle-chevron svg {
  width: 14px;
  height: 14px;
}

.reply-toggle-chevron.open {
  transform: rotate(180deg);
}

.reply-list {
  margin-left: 2px;
  padding-left: 34px;
  display: grid;
  gap: 16px;
}

.reply-comment {
  grid-template-columns: auto 1fr;
  column-gap: 12px;
  position: relative;
}

.comment-thread-line {
  position: absolute;
  z-index: 1;
  left: -16px;
  top: 10px;
  width: 28px;
  height: 12px;
  border-left: 2.4px solid #cbd5e1;
  border-bottom: 2.4px solid #cbd5e1;
  border-bottom-left-radius: 14px;
  pointer-events: none;
}

.comment strong,
.recommended-copy strong {
  display: block;
  color: #111318;
  margin-bottom: 6px;
}

.recommended-list {
  flex: 1;
  min-height: 0;
  display: grid;
  gap: 12px;
  margin-top: 16px;
  overflow-y: auto;
  padding-right: 8px;
}

.recommended-list::-webkit-scrollbar {
  width: 8px;
}

.recommended-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(120, 132, 149, 0.35);
}

.recommended-list::-webkit-scrollbar-track {
  background: transparent;
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

  .sidebar-card {
    height: auto !important;
  }

  .recommended-list {
    overflow: visible;
    padding-right: 0;
  }
}

@media (max-width: 720px) {
  .watch-page {
    padding-inline: 18px;
  }

  .overlay-center {
    gap: 10px;
  }

  .control-chip {
    width: 54px;
    height: 54px;
  }

  .play-chip {
    width: 72px;
    height: 72px;
    font-size: 1.5rem;
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
