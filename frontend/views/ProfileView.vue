<template>
  <section class="profile-page">
    <div class="channel-hero">
      <button
        type="button"
        :class="['channel-banner', { editable: isOwner }]"
        @click="triggerBannerUpload"
      >
        <img v-if="profile.banner" :src="assetUrl(profile.banner)" alt="channel banner" />
      </button>

      <div class="channel-content">
        <button
          type="button"
          :class="['channel-avatar', { editable: isOwner }]"
          @click="triggerAvatarUpload"
        >
          <img v-if="profile.avatar" :src="assetUrl(profile.avatar)" alt="channel avatar" />
          <template v-else>{{ username.charAt(0).toUpperCase() }}</template>
        </button>

        <div class="channel-meta">
          <span class="eyebrow">{{ isOwner ? 'My channel' : 'Creator channel' }}</span>
          <h1>{{ username }}</h1>
          <p>
            Creator hub for uploads, featured videos, and channel activity.
          </p>
        </div>

        <button
          v-if="user && !isOwner"
          class="subscribe-btn"
          type="button"
          @click="toggleSubscription"
        >
          {{ subscribed ? 'Subscribed' : 'Subscribe' }}
        </button>
      </div>
    </div>

    <input
      ref="avatarInput"
      type="file"
      accept="image/*"
      class="hidden-file-input"
      @change="handleAvatarChange"
    />
    <input
      ref="bannerInput"
      type="file"
      accept="image/*"
      class="hidden-file-input"
      @change="handleBannerChange"
    />

    <div v-if="showAvatarCropper" class="modal-overlay">
      <div class="modal crop-modal">
        <div class="modal-header">
          <div>
            <span class="modal-eyebrow">Profile editor</span>
            <h2>Crop Avatar</h2>
            <p>Adjust your image inside the square frame, then save.</p>
          </div>

          <button class="modal-close" type="button" @click="closeAvatarCropper">
            ×
          </button>
        </div>

        <div class="cropper-body">
          <div
            class="crop-frame"
            @pointerdown="startCropDrag"
            @pointermove="onCropDrag"
            @pointerup="endCropDrag"
            @pointerleave="endCropDrag"
          >
            <img
              v-if="avatarCropPreview"
              ref="cropImage"
              :src="avatarCropPreview"
              alt="avatar crop preview"
              class="crop-image"
              :style="cropImageStyle"
              @load="syncCropImageMetrics"
              draggable="false"
            />
            <div class="crop-overlay"></div>
            <div class="crop-grid">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <label class="crop-slider">
            <span>Zoom</span>
            <div class="crop-controls">
              <button type="button" class="zoom-btn" @click="adjustCropZoom(-0.1)">
                -
              </button>
              <input
                v-model="cropZoom"
                type="range"
                min="0.5"
                max="3"
                step="0.01"
              />
              <button type="button" class="zoom-btn" @click="adjustCropZoom(0.1)">
                +
              </button>
            </div>
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="modal-btn modal-btn-muted" @click="closeAvatarCropper">
            Cancel
          </button>
          <button type="button" class="modal-btn modal-btn-primary" @click="saveAvatarCrop">
            Save
          </button>
        </div>
      </div>
    </div>

    <div class="channel-stats">
      <div v-for="item in channelStats" :key="item.label" class="stat-box">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </div>

    <div class="channel-actions">
        <div class="tabs">
            <button
                v-for="tab in visibleTabs"
                :key="tab"
                :class="['tab', { active: activeTab === tab }]"
                @click="activeTab = tab"
                >
                {{ tab }}
            </button>

        </div>
            <button v-if="isOwner" class="create-btn" @click="showModal = true">
            + Create
            </button>
         </div>

<section class="videos-section">


  <!---------- VIDEOS TAB ---------->

  <template v-if="activeTab === 'Videos'">
    <div class="section-head">
      <h2>Channel videos</h2>
      <p>{{ videos.length }} videos published</p>
    </div>

    <div v-if="videos.length" class="videos">
      <article
        v-for="video in videos"
        :key="video.id"
        class="video-card"
        @click="goToVideo(video.id)"
      >
        <div class="video-thumb">
            <img
                v-if="video.thumbnail_url"
                :src="getThumbnail(video.thumbnail_url)"
                alt="thumbnail"
            />

            <div v-else class="no-thumb">
                No Thumbnail
            </div>

            <span class="video-pill">HD</span>
        </div>
        <div class="video-info">
          <strong>{{ video.title }}</strong>
          <span>Channel upload</span>
        </div>

        <div v-if="isOwner" class="video-actions">
            <button type="button" @click.stop="openEdit(video)">Edit</button>
            <button type="button" @click.stop="deleteVideo(video.id)">Delete</button>
        </div>

      </article>
    </div>

    <div v-else class="empty-state">
      <h3>No videos yet</h3>
      <p>Start uploading your first video.</p>
    </div>
  </template>

  <!---------- PLAYLISTS TAB ---------->
  <template v-else-if="activeTab === 'Playlists'">
    <div class="empty-state">
      <h3>No playlists yet</h3>
      <p>Create playlists to organize videos.</p>
    </div>
  </template>

  <!----------HISTORY TAB ---------->
  <template v-else-if="activeTab === 'History'">
    <div v-if="historyVideos.length" class="videos history-grid">
      <article
        v-for="item in historyVideos"
        :key="item.video_id"
        class="video-card history-card"
        @click="goToVideo(item.video_id)"
      >
        <div class="video-thumb history-thumb">
          <img
            v-if="item.thumbnail_url"
            :src="getThumbnail(item.thumbnail_url)"
            alt="thumbnail"
          />

          <div v-else class="no-thumb">
            No Thumbnail
          </div>

          <div
            class="watch-progress-bar"
            :style="{ width: `${getWatchProgressPercent(item)}%` }"
          ></div>
        </div>

        <div class="video-info">
          <strong>{{ item.title }}</strong>
          <span>{{ item.uploader_username || 'MiniYouTube Creator' }}</span>
          <span class="history-copy">
            {{ isVideoCompleted(item) ? 'Watched' : 'Continue watching' }}
          </span>
          <span class="history-time">
            {{ formatDuration(item.progress_seconds) }} / {{ formatDuration(item.duration_seconds) }}
          </span>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <h3>No watch history</h3>
      <p>Watched videos will appear here.</p>
    </div>
  </template>
</section>


<!---------- CREATE VIDEO MODAL ---------->

<div v-if="showModal" class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <div>
        <span class="modal-eyebrow">Creator studio</span>
        <h2>Upload Video</h2>
        <p>Fill in the details for your next upload.</p>
      </div>

      <button class="modal-close" type="button" @click="showModal = false">
        ×
      </button>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="field-group">
        <label for="video-title">Video title</label>
        <input
          id="video-title"
          v-model="form.title"
          placeholder="Give your video a clear title"
          required
        />
      </div>

      <div class="field-group">
        <label for="video-description">Description</label>
        <textarea
          id="video-description"
          v-model="form.description"
          placeholder="Tell viewers what this video is about"
        ></textarea>
      </div>

      <div class="upload-grid">
        <div class="file-input">
          <label>Video file</label>
          <div class="upload-card">
            <strong>{{ form.video ? form.video.name : 'Choose a video file' }}</strong>
            <span>MP4, MOV, or any supported video format</span>
            <input type="file" @change="handleVideo" accept="video/*" />
          </div>
        </div>

        <div class="file-input">
          <label>Thumbnail</label>
          <div class="upload-card">
            <strong>{{ form.thumbnail ? form.thumbnail.name : 'Choose a thumbnail' }}</strong>
            <span>PNG or JPG cover image for your video</span>
            <input type="file" @change="handleThumbnail" accept="image/*" />
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="modal-btn modal-btn-muted" @click="showModal = false">
          Cancel
        </button>

        <button type="submit" class="modal-btn modal-btn-primary">
          Upload
        </button>
      </div>
    </form>
  </div>
</div>


<!---------- Edit VIDEO MODAL ---------->

        <div v-if="showEditModal" class="modal-overlay">
        <div class="modal">
            <h2>Edit Video</h2>

            <input v-model="selectedVideo.title" />
            <textarea v-model="selectedVideo.description"></textarea>

            <div class="modal-actions">
            <button type="button" @click="showEditModal = false">Cancel</button>
            <button type="button" @click="submitEdit">Save</button>
            </div>
        </div>
        </div>

<!---------- END ---------->

</section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../src/services/api';
import { useAuth } from '../src/store/auth';

const selectedVideo = ref(null);
const showEditModal = ref(false);

const openEdit = (video) => {
  selectedVideo.value = { ...video };
  showEditModal.value = true;
};

const deleteVideo = async (id) => {
  if (!confirm('Delete this video?')) return;

  try {
    await api.delete(`/videos/${id}`);
    await fetchVideos();
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Delete failed';
    alert(message);
  }
};


const submitEdit = async () => {
  if (!selectedVideo.value?.id) {
    alert('No video selected.');
    return;
  }

  try {
    await api.put(`/videos/${selectedVideo.value.id}`, {
      title: selectedVideo.value.title,
      description: selectedVideo.value.description
    });

    showEditModal.value = false;
    await fetchVideos();
  } catch (err) {
    console.error(err);
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Update failed';
    alert(message);
  }
};

const getThumbnail = (path) => {
  if (!path) return null;
  return `http://localhost:5000${path}`;
};

const showModal = ref(false);

const form = ref({
  title: '',
  description: '',
  video: null,
  thumbnail: null
});

const handleVideo = (e) => {
  form.value.video = e.target.files[0];
};

const handleThumbnail = (e) => {
  form.value.thumbnail = e.target.files[0];
};

const handleSubmit = async () => {
  if (!form.value.video) {
    alert('Please choose a video file before uploading.');
    return;
  }

  try {
    const formData = new FormData();

    formData.append('title', form.value.title);
    formData.append('description', form.value.description);
    formData.append('video', form.value.video);

    if (form.value.thumbnail) {
      formData.append('thumbnail', form.value.thumbnail);
    }

    const res = await api.post('/videos/upload', formData);

    console.log('UPLOAD SUCCESS:', res.data);

    // 🔥 refresh videos instantly
    await fetchVideos();

    showModal.value = false;

    // reset form
    form.value = {
      title: '',
      description: '',
      video: null,
      thumbnail: null
    };

  } catch (err) {
    console.error(err);
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Upload failed';
    alert(message);
  }
};

const tabs = ['Videos', 'Playlists', 'History'];
const activeTab = ref('Videos');

const route = useRoute();
const router = useRouter();

const videos = ref([]);
const historyVideos = ref([]);
const username = ref('User');
const profile = ref({
  avatar: null,
  banner: null
});
const subscribed = ref(false);
const subscriberCount = ref(0);
const avatarInput = ref(null);
const bannerInput = ref(null);
const cropImage = ref(null);
const showAvatarCropper = ref(false);
const avatarCropPreview = ref('');
const cropZoom = ref(1);
const cropOffsetX = ref(0);
const cropOffsetY = ref(0);
const cropDragging = ref(false);
const cropStartX = ref(0);
const cropStartY = ref(0);
const cropBaseOffsetX = ref(0);
const cropBaseOffsetY = ref(0);
const cropNaturalWidth = ref(0);
const cropNaturalHeight = ref(0);

const { user } = useAuth();

watch(user, (newUser) => {
  if (!newUser) {
    router.push('/'); // force exit if logged out
  }
});

const isOwner = computed(() => {
  return user.value && user.value.id == route.params.id;
});

const visibleTabs = computed(() => {
  return isOwner.value ? tabs : tabs.filter((tab) => tab !== 'History');
});

const totalViews = computed(() => {
  return videos.value.reduce((sum, video) => {
    return sum + (Number(video.views) || 0);
  }, 0);
});

const formatCompactNumber = (value) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(Number(value) || 0);
};

const channelStats = computed(() => [
  { label: 'Videos', value: videos.value.length || '0' },
  { label: 'Subscribers', value: subscriberCount.value || '0' },
  { label: 'Total views', value: formatCompactNumber(totalViews.value) }
]);

const assetUrl = (path) => {
  if (!path) return null;
  return `http://localhost:5000${path}`;
};

const formatDuration = (seconds) => {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

const getWatchProgressPercent = (item) => {
  const progress = Number(item.progress_seconds) || 0;
  const duration = Number(item.duration_seconds) || 0;

  if (duration <= 0) return 0;

  return Math.min(100, Math.max(0, (progress / duration) * 100));
};

const isVideoCompleted = (item) => {
  return getWatchProgressPercent(item) >= 95;
};

const cropBaseScale = computed(() => {
  const frameSize = 320;

  if (!cropNaturalWidth.value || !cropNaturalHeight.value) {
    return 1;
  }

  return Math.max(
    frameSize / cropNaturalWidth.value,
    frameSize / cropNaturalHeight.value
  );
});

const cropImageStyle = computed(() => ({
  width: cropNaturalWidth.value ? `${cropNaturalWidth.value}px` : 'auto',
  height: cropNaturalHeight.value ? `${cropNaturalHeight.value}px` : 'auto',
  transform: `translate(-50%, -50%) translate(${cropOffsetX.value}px, ${cropOffsetY.value}px) scale(${cropBaseScale.value * cropZoom.value})`
}));

const fetchVideos = async () => {
  const res = await api.get(`/videos/user/${route.params.id}`);
  videos.value = res.data;

  if (user.value && String(user.value.id) === String(route.params.id)) {
    username.value = user.value.username || 'My Channel';
  }
};

const fetchProfile = async () => {
  try {
    const res = await api.get(`/auth/profile/${route.params.id}`);
    profile.value = {
      avatar: res.data.user.avatar,
      banner: res.data.user.banner
    };
    username.value = res.data.user.username || 'Creator Channel';
  } catch (err) {
    profile.value = {
      avatar: null,
      banner: null
    };
    username.value = 'Creator Channel';
  }
};

const fetchSubscription = async () => {
  try {
    const res = await api.get(`/subscriptions/${route.params.id}`);
    subscribed.value = res.data.subscribed;
    subscriberCount.value = res.data.count;
  } catch {
    subscribed.value = false;
    subscriberCount.value = 0;
  }
};

const fetchHistory = async () => {
  if (!user.value || !isOwner.value) {
    historyVideos.value = [];
    return;
  }

  try {
    const res = await api.get(`/history/user/${route.params.id}`);
    historyVideos.value = res.data;
  } catch (err) {
    console.error('WATCH HISTORY FETCH ERROR:', err);
    historyVideos.value = [];
  }
};

const toggleSubscription = async () => {
  if (!user.value || isOwner.value) return;

  try {
    const res = await api.post(`/subscriptions/${route.params.id}`);
    subscribed.value = res.data.subscribed;
    subscriberCount.value = res.data.count;
  } catch (err) {
    console.error('SUBSCRIPTION ERROR:', err);
  }
};

const triggerAvatarUpload = () => {
  if (!isOwner.value) return;
  avatarInput.value?.click();
};

const triggerBannerUpload = () => {
  if (!isOwner.value) return;
  bannerInput.value?.click();
};

const openAvatarCropper = (file) => {
  if (!file) return;

  avatarCropPreview.value = URL.createObjectURL(file);
  cropZoom.value = 1;
  cropOffsetX.value = 0;
  cropOffsetY.value = 0;
  cropNaturalWidth.value = 0;
  cropNaturalHeight.value = 0;
  showAvatarCropper.value = true;
};

const closeAvatarCropper = () => {
  if (avatarCropPreview.value) {
    URL.revokeObjectURL(avatarCropPreview.value);
  }

  avatarCropPreview.value = '';
  showAvatarCropper.value = false;
  cropZoom.value = 1;
  cropOffsetX.value = 0;
  cropOffsetY.value = 0;
  cropDragging.value = false;
};

const syncCropImageMetrics = () => {
  const img = cropImage.value;
  if (!img) return;

  cropNaturalWidth.value = img.naturalWidth;
  cropNaturalHeight.value = img.naturalHeight;
};

const startCropDrag = (event) => {
  cropDragging.value = true;
  cropStartX.value = event.clientX;
  cropStartY.value = event.clientY;
  cropBaseOffsetX.value = cropOffsetX.value;
  cropBaseOffsetY.value = cropOffsetY.value;
};

const onCropDrag = (event) => {
  if (!cropDragging.value) return;

  cropOffsetX.value = cropBaseOffsetX.value + (event.clientX - cropStartX.value);
  cropOffsetY.value = cropBaseOffsetY.value + (event.clientY - cropStartY.value);
};

const endCropDrag = () => {
  cropDragging.value = false;
};

const adjustCropZoom = (delta) => {
  const nextZoom = Number(cropZoom.value) + delta;
  cropZoom.value = Math.min(3, Math.max(0.5, Number(nextZoom.toFixed(2))));
};

const uploadProfileImage = async (field, file) => {
  if (!file || !isOwner.value) return;

  const formData = new FormData();
  formData.append(field, file);

  try {
    const res = await api.put('/auth/profile/images', formData);
    profile.value = {
      avatar: res.data.user.avatar,
      banner: res.data.user.banner
    };
  } catch (err) {
    console.error('PROFILE IMAGE UPLOAD ERROR:', err);
    alert('Image upload failed');
  }
};

const handleAvatarChange = async (event) => {
  const file = event.target.files?.[0];
  openAvatarCropper(file);
  event.target.value = '';
};

const handleBannerChange = async (event) => {
  const file = event.target.files?.[0];
  await uploadProfileImage('banner', file);
  event.target.value = '';
};

const saveAvatarCrop = async () => {
  if (!cropNaturalWidth.value || !cropNaturalHeight.value) return;

  const frameSize = 320;
  const outputSize = 512;
  const ratio = outputSize / frameSize;
  const drawScale = cropBaseScale.value * cropZoom.value;

  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext('2d');
  if (!context) return;

  const drawWidth = cropNaturalWidth.value * drawScale * ratio;
  const drawHeight = cropNaturalHeight.value * drawScale * ratio;
  const dx = (outputSize - drawWidth) / 2 + cropOffsetX.value * ratio;
  const dy = (outputSize - drawHeight) / 2 + cropOffsetY.value * ratio;

  const image = new Image();
  image.src = avatarCropPreview.value;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  context.drawImage(image, dx, dy, drawWidth, drawHeight);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });

  if (!blob) return;

  const croppedFile = new File([blob], 'avatar.png', { type: 'image/png' });
  await uploadProfileImage('avatar', croppedFile);
  closeAvatarCropper();
};

const goToVideo = (id) => {
  router.push(`/watch/${id}`);
};

const goUpload = () => {
  router.push('/dashboard');
};

const loadProfile = async () => {
  await fetchProfile();
  await fetchVideos();
  await fetchSubscription();
  await fetchHistory();
};

onMounted(loadProfile);

watch(() => route.params.id, async () => {
  activeTab.value = 'Videos';
  await loadProfile();
});

watch(visibleTabs, (tabsList) => {
  if (!tabsList.includes(activeTab.value)) {
    activeTab.value = tabsList[0] || 'Videos';
  }
});
</script>

<style scoped>

.video-actions {
  display: flex;
  gap: 8px;
  padding: 10px;
}

.video-actions button {
  font-size: 12px;
  padding: 6px 10px;
  cursor: pointer;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  padding: 20px;
  background: rgba(8, 10, 14, 0.72);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  width: min(100%, 620px);
  padding: 28px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(246, 247, 250, 0.98));
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.modal-eyebrow {
  display: inline-flex;
  margin-bottom: 10px;
  padding: 7px 11px;
  border-radius: 999px;
  background: rgba(255, 49, 49, 0.1);
  color: #d21c31;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.modal h2 {
  margin-bottom: 6px;
}

.modal form {
  display: grid;
  gap: 16px;
}

.modal-header p {
  color: #66707e;
}

.modal-close {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: #edf0f4;
  color: #111;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
}

.field-group {
  display: grid;
  gap: 8px;
}

.field-group label,
.file-input label {
  display: block;
  color: #252a33;
  font-size: 0.92rem;
  font-weight: 700;
}

.modal input,
.modal textarea {
  display: block;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d7dce3;
  border-radius: 16px;
  padding: 14px 16px;
  background: #fff;
  color: #111318;
  font: inherit;
  line-height: 1.5;
}

.modal textarea {
  min-height: 120px;
  height: 140px;
  resize: vertical;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.file-input {
  display: grid;
  gap: 8px;
}

.upload-card {
  padding: 18px;
  border: 1px dashed #cfd6df;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff, #f6f7fa);
}

.upload-card strong {
  display: block;
  margin-bottom: 6px;
  color: #111318;
}

.upload-card span {
  display: block;
  margin-bottom: 14px;
  color: #66707e;
  font-size: 0.88rem;
}

.upload-card input[type='file'] {
  padding: 10px 12px;
  background: #f2f4f7;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-btn {
  padding: 12px 18px;
  border: none;
  border-radius: 999px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.modal-btn-muted {
  background: #eceff3;
  color: #14171c;
}

.modal-btn-primary {
  background: linear-gradient(135deg, #ff3131, #cc1023);
  color: #fff;
}


.profile-page {
  padding: 30px 28px 56px;
  min-height: calc(100vh - 88px);
  background:
    linear-gradient(180deg, #16171b 0%, #20232a 20%, #f3f4f7 20%, #f3f4f7 100%);
}

.channel-hero,
.videos-section,
.stat-box {
  box-shadow: 0 24px 40px rgba(14, 17, 22, 0.12);
}

.channel-hero {
  overflow: hidden;
  border-radius: 30px;
  background: #fff;
}

.channel-banner {
  width: 100%;
  border: none;
  min-height: 210px;
  padding: 0;
  display: block;
  cursor: default;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.22), transparent 20%),
    linear-gradient(135deg, #ff3131, #811320 45%, #1b1d25);
}

.channel-banner img {
  width: 100%;
  height: 210px;
  display: block;
  object-fit: cover;
}

.channel-content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 22px;
  align-items: center;
  padding: 0 28px 28px;
  margin-top: -52px;
}

.channel-avatar {
  width: 108px;
  height: 108px;
  border-radius: 28px;
  padding: 0;
  border: 6px solid #fff;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #111215, #353841);
  color: #fff;
  font-size: 2.4rem;
  font-weight: 800;
}

.channel-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 22px;
  object-fit: cover;
}

.channel-avatar.editable,
.channel-banner.editable {
  cursor: pointer;
}

.hidden-file-input {
  display: none;
}

.crop-modal {
  width: min(100%, 560px);
}

.cropper-body {
  display: grid;
  gap: 18px;
}

.crop-frame {
  position: relative;
  width: min(100%, 320px);
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 28px;
  background: #0f1014;
  touch-action: none;
  cursor: grab;
}

.crop-frame:active {
  cursor: grabbing;
}

.crop-image {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: none;
  max-height: none;
  transform-origin: center;
  user-select: none;
}

.crop-overlay {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(255, 255, 255, 0.7);
  border-radius: 28px;
  box-shadow: inset 0 0 0 999px rgba(0, 0, 0, 0.22);
  pointer-events: none;
}

.crop-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.crop-grid span {
  position: absolute;
  background: rgba(255, 255, 255, 0.28);
}

.crop-grid span:nth-child(1),
.crop-grid span:nth-child(2) {
  top: 0;
  bottom: 0;
  width: 1px;
}

.crop-grid span:nth-child(1) {
  left: 33.333%;
}

.crop-grid span:nth-child(2) {
  left: 66.666%;
}

.crop-grid span:nth-child(3),
.crop-grid span:nth-child(4) {
  left: 0;
  right: 0;
  height: 1px;
}

.crop-grid span:nth-child(3) {
  top: 33.333%;
}

.crop-grid span:nth-child(4) {
  top: 66.666%;
}

.crop-slider {
  display: grid;
  gap: 8px;
  color: #252a33;
  font-weight: 700;
}

.crop-controls {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
}

.zoom-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 999px;
  background: #edf0f4;
  color: #111318;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.eyebrow {
  display: inline-flex;
  margin-bottom: 8px;
  color: #d21c31;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.channel-meta h1,
.section-head h2,
.empty-state h3 {
  margin: 0;
  color: #121317;
}

.channel-meta p,
.section-head p,
.video-info span,
.stat-box span,
.empty-state p {
  color: #66707e;
}

.subscribe-btn {
  border: none;
  border-radius: 999px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #111318, #30343d);
  color: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.upload-btn {
  border: 0;
  border-radius: 999px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #ff3131, #cc1023);
  color: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.channel-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 18px 0 24px;
}

.stat-box {
  padding: 22px;
  border-radius: 24px;
  background: #fff;
}

.stat-box strong {
  display: block;
  margin-bottom: 6px;
  color: #121317;
  font-size: 2rem;
}

.videos-section {
  padding: 24px;
  border-radius: 30px;
  background: #fff;
}

.section-head {
  margin-bottom: 18px;
}

.videos {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.history-grid {
  align-items: start;
}

.video-card {
  overflow: hidden;
  border-radius: 22px;
  background: #f4f6f8;
  cursor: pointer;
}

.history-card {
  position: relative;
}

.video-thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9; /* 🔥 KEY FIX */
  overflow: hidden;
  border-radius: 16px;
  background: #000;
}

.video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* now safe because container is correct ratio */
}

.no-thumb {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ddd;
  color: #555;
  font-size: 12px;
}

.watch-progress-bar {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 5px;
  background: linear-gradient(90deg, #ff3131, #d5142a);
  border-radius: 0 999px 999px 0;
}

.history-copy {
  color: #d21c31;
  font-weight: 700;
}

.history-time {
  font-size: 0.84rem;
}



.video-pill {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.38);
  color: #fff;
  font-size: 0.74rem;
  font-weight: 800;
}

.video-info {
  padding: 16px;
}

.video-info strong {
  display: block;
  margin-bottom: 6px;
  color: #121317;
}

.empty-state {
  padding: 38px 22px;
  border-radius: 24px;
  text-align: center;
  background: #f4f6f8;
}

.channel-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.tabs {
  display: flex;
  gap: 10px;
}

.tab {
  border: none;
  padding: 10px 16px;
  border-radius: 999px;
  background: #e5e7eb;
  cursor: pointer;
  font-weight: 600;
}

.tab.active {
  background: #111;
  color: white;
}

.create-btn {
  border: none;
  padding: 10px 18px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff3131, #cc1023);
  color: white;
  font-weight: bold;
  cursor: pointer;
}

@media (max-width: 920px) {
  .profile-page {
    padding-inline: 18px;
  }

  .channel-content,
  .channel-stats,
  .videos {
    grid-template-columns: 1fr;
  }

  .channel-content {
    margin-top: -40px;
  }

  .upload-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .modal {
    padding: 22px;
  }

  .modal-header,
  .modal-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
