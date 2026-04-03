<template>
  <section class="home-page">
    <div class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Mini YouTube Studio</span>
        <h1>Watch, manage, and grow your channel in one clean dashboard.</h1>
        <p>
          A compact video platform feel with creator tools, featured uploads, and
          quick access to your own channel.
        </p>

        <div class="hero-actions">
          <button class="hero-btn hero-btn-primary" @click="$router.push('/register')">
            Start Creating
          </button>
          <button class="hero-btn hero-btn-secondary" @click="$router.push('/login')">
            Sign In
          </button>
        </div>

        <div class="hero-stats">
          <div>
            <strong>12K+</strong>
            <span>Weekly plays</span>
          </div>
          <div>
            <strong>480</strong>
            <span>Creator channels</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>Fresh content flow</span>
          </div>
        </div>
      </div>

      <div class="hero-preview">
        <div class="preview-player">
          <div class="preview-thumb">
            <span class="badge">Featured upload</span>
            <div class="play-ring">
              <span></span>
            </div>
          </div>

          <div class="preview-meta">
            <h2>Inside the creator dashboard</h2>
            <p>Track uploads, visit your channel, and stay in control of your audience.</p>
          </div>
        </div>

        <div class="preview-list">
          <div class="mini-card" v-for="item in featured" :key="item.title">
            <div class="mini-thumb"></div>
            <div>
              <strong>{{ item.title }}</strong>
              <span>{{ item.meta }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const featured = [
  { title: 'Creator spotlight reel', meta: '12 min watch' },
  { title: 'Channel growth breakdown', meta: '8 new insights' },
  { title: 'Upload queue preview', meta: '3 drafts ready' }
];
</script>

<style scoped>
.home-page {
  min-height: calc(100vh - 88px);
  padding: 40px 28px 56px;
  background:
    radial-gradient(circle at top right, rgba(255, 45, 45, 0.22), transparent 30%),
    radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.06), transparent 28%),
    linear-gradient(180deg, #111214 0%, #18191d 100%);
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 28px;
  align-items: stretch;
}

.hero-copy,
.hero-preview {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
}

.hero-copy {
  padding: 42px;
}

.eyebrow {
  display: inline-flex;
  margin-bottom: 16px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 45, 45, 0.14);
  color: #ff8080;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1 {
  max-width: 12ch;
  margin: 0 0 18px;
  color: #fff;
  font-size: clamp(2.8rem, 5vw, 5rem);
  line-height: 0.98;
}

.hero-copy p {
  max-width: 58ch;
  color: rgba(255, 255, 255, 0.72);
  font-size: 1.02rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: 14px;
  margin: 28px 0 34px;
  flex-wrap: wrap;
}

.hero-btn {
  border: 0;
  border-radius: 999px;
  padding: 14px 22px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.hero-btn-primary {
  background: linear-gradient(135deg, #ff3131, #d20f24);
  color: #fff;
}

.hero-btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.hero-stats div {
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
}

.hero-stats strong,
.mini-card strong {
  display: block;
  color: #fff;
}

.hero-stats span,
.mini-card span {
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.88rem;
}

.hero-preview {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.preview-player {
  border-radius: 24px;
  overflow: hidden;
  background: #0c0d11;
}

.preview-thumb {
  position: relative;
  min-height: 320px;
  background:
    linear-gradient(135deg, rgba(255, 45, 45, 0.88), rgba(35, 6, 10, 0.7)),
    linear-gradient(180deg, #2b1014, #090a0d);
}

.badge {
  position: absolute;
  top: 18px;
  left: 18px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.34);
  color: #fff;
  font-size: 0.82rem;
}

.play-ring {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.play-ring span {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  position: relative;
  backdrop-filter: blur(10px);
}

.play-ring span::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-38%, -50%);
  border-top: 16px solid transparent;
  border-bottom: 16px solid transparent;
  border-left: 26px solid #fff;
}

.preview-meta {
  padding: 22px;
}

.preview-meta h2 {
  margin: 0 0 8px;
  color: #fff;
}

.preview-meta p {
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.6;
}

.preview-list {
  display: grid;
  gap: 12px;
}

.mini-card {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 14px;
  align-items: center;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
}

.mini-thumb {
  height: 62px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ff3a3a, #292a30);
}

@media (max-width: 920px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-copy,
  .hero-preview {
    padding: 24px;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .preview-thumb {
    min-height: 240px;
  }
}
</style>
