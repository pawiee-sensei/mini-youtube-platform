<template>
  <section class="dashboard-page">
    <div class="dashboard-hero">
      <div>
        <span class="eyebrow">Creator dashboard</span>
        <h1>Welcome back{{ user?.username ? `, ${user.username}` : '' }}</h1>
        <p>
          Keep your uploads moving, track channel momentum, and jump back into
          creator mode with one click.
        </p>
      </div>

      <div class="hero-actions">
        <button class="primary-btn" @click="$router.push(`/profile/${user?.id || ''}`)">
          Open My Channel
        </button>
        <button class="secondary-btn" @click="$router.push('/')">
          Explore Home
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <article class="stat-card" v-for="item in stats" :key="item.label">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <p>{{ item.note }}</p>
      </article>
    </div>

    <div class="dashboard-grid">
      <section class="panel panel-wide">
        <div class="panel-head">
          <div>
            <h2>Recent uploads</h2>
            <p>Your latest channel activity at a glance</p>
          </div>
          <button class="chip-btn">Upload video</button>
        </div>

        <div class="video-list">
          <article class="video-row" v-for="video in videos" :key="video.title">
            <div class="video-thumb"></div>
            <div class="video-copy">
              <strong>{{ video.title }}</strong>
              <span>{{ video.meta }}</span>
            </div>
            <span class="video-badge">{{ video.status }}</span>
          </article>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Channel pulse</h2>
            <p>What is happening today</p>
          </div>
        </div>

        <div class="pulse-list">
          <div class="pulse-item" v-for="item in pulse" :key="item.title">
            <strong>{{ item.title }}</strong>
            <span>{{ item.desc }}</span>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { useAuth } from '../src/store/auth';

const { user } = useAuth();

const stats = [
  { label: 'Views today', value: '18.4K', note: '+12% from yesterday' },
  { label: 'Subscribers', value: '2,390', note: '47 new this week' },
  { label: 'Watch time', value: '612 hrs', note: 'Audience retention improving' }
];

const videos = [
  { title: 'Channel intro refresh', meta: '8.2K views | 2 days ago', status: 'Trending' },
  { title: 'Editing setup tour', meta: '4.7K views | 5 days ago', status: 'Live' },
  { title: 'Mini upload workflow', meta: '1.9K views | 1 week ago', status: 'Draft ready' }
];

const pulse = [
  { title: 'Best posting window', desc: 'Your audience is most active around 7 PM.' },
  { title: 'Top traffic source', desc: 'Home recommendations are driving most clicks.' },
  { title: 'Quick reminder', desc: 'A polished thumbnail can lift CTR for new uploads.' }
];
</script>

<style scoped>
.dashboard-page {
  padding: 34px 28px 56px;
  min-height: calc(100vh - 88px);
  background:
    radial-gradient(circle at top left, rgba(255, 41, 41, 0.14), transparent 24%),
    linear-gradient(180deg, #f7f7f8 0%, #eceef2 100%);
}

.dashboard-hero,
.panel,
.stat-card {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(17, 18, 22, 0.08);
  box-shadow: 0 24px 40px rgba(24, 28, 33, 0.08);
}

.dashboard-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 28px 30px;
  border-radius: 28px;
  margin-bottom: 22px;
}

.eyebrow {
  display: inline-flex;
  margin-bottom: 12px;
  color: #d11a2f;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.dashboard-hero h1,
.panel h2 {
  margin: 0;
  color: #101114;
}

.dashboard-hero p,
.panel-head p,
.video-copy span,
.pulse-item span,
.stat-card p,
.stat-card span {
  color: #5a6270;
}

.dashboard-hero p {
  margin-top: 10px;
  max-width: 52ch;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn,
.chip-btn {
  border: 0;
  border-radius: 999px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn,
.secondary-btn {
  padding: 13px 18px;
}

.primary-btn,
.chip-btn {
  color: #fff;
  background: linear-gradient(135deg, #ff3131, #cc1023);
}

.secondary-btn {
  color: #1b1c21;
  background: #eceff3;
}

.chip-btn {
  padding: 10px 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  padding: 22px;
  border-radius: 24px;
}

.stat-card strong {
  display: block;
  margin: 8px 0 6px;
  color: #101114;
  font-size: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.4fr 0.9fr;
  gap: 18px;
}

.panel {
  border-radius: 28px;
  padding: 24px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}

.video-list,
.pulse-list {
  display: grid;
  gap: 14px;
}

.video-row {
  display: grid;
  grid-template-columns: 140px 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 14px;
  border-radius: 20px;
  background: #f4f6f8;
}

.video-thumb {
  height: 78px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ff4141, #252730);
}

.video-copy strong,
.pulse-item strong {
  display: block;
  color: #121317;
  margin-bottom: 6px;
}

.video-badge {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(209, 26, 47, 0.1);
  color: #c8182c;
  font-size: 0.82rem;
  font-weight: 800;
}

.pulse-item {
  padding: 16px;
  border-radius: 20px;
  background: #f4f6f8;
}

@media (max-width: 920px) {
  .dashboard-page {
    padding-inline: 18px;
  }

  .dashboard-hero,
  .panel-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .video-row {
    grid-template-columns: 1fr;
  }
}
</style>
