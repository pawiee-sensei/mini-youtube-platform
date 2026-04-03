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

  <!-- VIDEOS TAB -->
  <template v-if="activeTab === 'Videos'">
    <div class="section-head">
      <h2>Channel videos</h2>
      <p>{{ videos.length }} videos published</p>
    </div>

    <div v-if="videos.length" class="videos">
      <article v-for="video in videos" :key="video.id" class="video-card">
        <div class="video-thumb"></div>
        <div class="video-info">
          <strong>{{ video.title }}</strong>
          <span>Channel upload</span>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <h3>No videos yet</h3>
      <p>Start uploading your first video.</p>
    </div>
  </template>

  <!-- PLAYLISTS TAB -->
  <template v-else-if="activeTab === 'Playlists'">
    <div class="empty-state">
      <h3>No playlists yet</h3>
      <p>Create playlists to organize videos.</p>
    </div>
  </template>

  <!-- HISTORY TAB -->
  <template v-else-if="activeTab === 'History'">
    <div class="empty-state">
      <h3>No watch history</h3>
      <p>Watched videos will appear here.</p>
    </div>
  </template>
</section>

<!-- CREATE VIDEO MODAL -->
<div v-if="showModal" class="modal-overlay">

  <div class="modal">

    <h2>Upload Video</h2>

    <form @submit.prevent="handleSubmit">

      <input
        v-model="form.title"
        placeholder="Video title"
        required
      />

      <textarea
        v-model="form.description"
        placeholder="Description"
      ></textarea>

      <div class="file-input">
        <label>Video File</label>
        <input type="file" @change="handleVideo" accept="video/*" />
      </div>

      <div class="file-input">
        <label>Thumbnail</label>
        <input type="file" @change="handleThumbnail" accept="image/*" />
      </div>

      <div class="modal-actions">
        <button type="button" @click="showModal = false">
          Cancel
        </button>

        <button type="submit">
          Upload
        </button>
      </div>

    </form>

  </div>

</div>


</section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../src/services/api';
import { useAuth } from '../src/store/auth';

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

const handleSubmit = () => {
  console.log('FORM DATA:', form.value);

  // temporary: just close modal
  showModal.value = false;

  // reset form
  form.value = {
    title: '',
    description: '',
    video: null,
    thumbnail: null
  };
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);

  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 400px;
}

.modal h2 {
  margin-bottom: 16px;
}

.modal input,
.modal textarea {
  width: 100%;
  margin-bottom: 12px;
  padding: 10px;
}

.file-input {
  margin-bottom: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-actions button {
  padding: 8px 14px;
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
  min-height: 170px;
  background: linear-gradient(135deg, #ff4a4a, #1d1f27);
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
}
</style>
