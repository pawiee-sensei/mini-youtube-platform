<template>
  <section class="profile-page">
    <div class="channel-hero">
      <div class="channel-banner"></div>

      <div class="channel-content">
        <div class="channel-avatar">{{ username.charAt(0).toUpperCase() }}</div>

        <div class="channel-meta">
          <span class="eyebrow">My channel</span>
          <h1>{{ username }}</h1>
          <p>
            Creator hub for uploads, featured videos, and channel activity.
          </p>
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
                v-for="tab in tabs"
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
      <article v-for="video in videos" :key="video.id" class="video-card">
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
            <button type="button" @click="openEdit(video)">Edit</button>
            <button type="button" @click="deleteVideo(video.id)">Delete</button>
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
    <div class="empty-state">
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
const username = ref('User');

const { user } = useAuth();

watch(user, (newUser) => {
  if (!newUser) {
    router.push('/'); // force exit if logged out
  }
});

const isOwner = computed(() => {
  return user.value && user.value.id == route.params.id;
});

const channelStats = computed(() => [
  { label: 'Videos', value: videos.value.length || '0' },
  { label: 'Subscribers', value: isOwner.value ? '1.2K' : '842' },
  { label: 'Total views', value: isOwner.value ? '36.8K' : '21.4K' }
]);

const fetchVideos = async () => {
  const res = await api.get(`/videos/user/${route.params.id}`);
  videos.value = res.data;

  if (user.value && String(user.value.id) === String(route.params.id)) {
    username.value = user.value.username || 'My Channel';
  }
};

const goUpload = () => {
  router.push('/dashboard');
};

onMounted(fetchVideos);
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
  min-height: 210px;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.22), transparent 20%),
    linear-gradient(135deg, #ff3131, #811320 45%, #1b1d25);
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
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #111215, #353841);
  border: 6px solid #fff;
  color: #fff;
  font-size: 2.4rem;
  font-weight: 800;
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

.video-card {
  overflow: hidden;
  border-radius: 22px;
  background: #f4f6f8;
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
