<script setup>
import { onMounted } from 'vue'

const releases = [
  {
    version: 'v1.0.0',
    date: '2026-08',
    latest: true,
    changes: [
      '首个公开版本发布，支持 Windows 10/11（x64）。',
      '账号系统：邮箱注册 / 登录、Microsoft 账户登录、个人信息与头像管理。',
      '游戏管理：一键部署、智能 JVM 参数优化、全球镜像加速。',
      '云存档与个性化设置同步。',
      '内置皮肤渲染预览（基于 MinecraftSkinRender）。',
      '官方文档站与用户反馈渠道上线。'
    ]
  },
  {
    version: 'v0.9.0',
    date: '预览版',
    latest: false,
    changes: [
      '内部测试版本，验证核心启动与账号流程。'
    ]
  }
]

function initReveal() {
  const els = document.querySelectorAll('.changelog-root .reveal')
  if (!els.length) return
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!('IntersectionObserver' in window) || reduceMotion) {
    els.forEach((el) => el.classList.add('in'))
    return
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target
      if (entry.isIntersecting) {
        el.classList.remove('in')
        void el.offsetWidth
        el.classList.add('in')
      } else {
        el.classList.add('no-anim')
        el.classList.remove('in')
        void el.offsetWidth
        el.classList.remove('no-anim')
      }
    })
  }, { threshold: 0, rootMargin: '0px' })
  els.forEach((el) => io.observe(el))
  // 兜底：若 IO 因任何原因未触发，1.4s 后强制显形，避免整页空白
  setTimeout(() => {
    els.forEach((el) => { if (!el.classList.contains('in')) el.classList.add('in') })
  }, 1400)
}

onMounted(() => {
  initReveal()
})
</script>

<template>
  <div class="changelog-root">
    <div class="hero-glow" aria-hidden="true"></div>

    <main class="changelog-main">
      <header class="changelog-header reveal">
        <span class="kicker"><i class="fa-solid fa-clock-rotate-left"></i> CHANGELOG</span>
        <h1 class="title">更新日志</h1>
        <p class="subtitle">记录 Furnace Craft Launcher 的版本迭代与重要变更。</p>
      </header>

      <div class="timeline">
        <div class="timeline-line" aria-hidden="true"></div>

        <div
          v-for="(release, index) in releases"
          :key="release.version"
          class="timeline-item reveal"
          :style="{ '--delay': (index % 3) * 0.12 + 's' }"
        >
          <div class="timeline-dot" :class="{ latest: release.latest }" aria-hidden="true">
            <span class="dot-core"></span>
            <span v-if="release.latest" class="dot-ring"></span>
          </div>

          <article class="release-card glass-card">
            <div class="release-head">
              <div class="release-title">
                <h2 class="version">{{ release.version }}</h2>
                <span v-if="release.latest" class="badge-latest">最新</span>
              </div>
              <time class="release-date">{{ release.date }}</time>
            </div>
            <ul class="release-list">
              <li v-for="(item, i) in release.changes" :key="i">
                <span class="change-dot" aria-hidden="true"></span>
                <span class="change-text">{{ item }}</span>
              </li>
            </ul>
          </article>
        </div>
      </div>

      <p class="changelog-note reveal">
        更多历史版本将随正式发布逐步补全。如你发现某版本存在问题，请通过页眉“反馈”告知我们。
      </p>
    </main>
  </div>
</template>

<style scoped>
.changelog-root {
  position: relative;
  min-height: 100vh;
  color: #e6e8ec;
  padding: 6rem 1.5rem 4rem;
  overflow: hidden;
}
.hero-glow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(ellipse at 18% 12%, rgba(52, 94, 239, 0.10) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 85%, rgba(34, 197, 94, 0.06) 0%, transparent 45%);
}
.changelog-main {
  position: relative;
  z-index: 1;
  max-width: 880px;
  margin: 0 auto;
}

/* Header */
.changelog-header {
  text-align: center;
  margin-bottom: 3.5rem;
}
.kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #7c9bff;
  background: rgba(52, 94, 239, 0.12);
  border: 1px solid rgba(52, 94, 239, 0.3);
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
}
.title {
  font-size: clamp(2rem, 4.5vw, 3rem);
  font-weight: 800;
  color: #fff;
  margin: 1rem 0 0.6rem;
  letter-spacing: -0.02em;
}
.subtitle {
  color: #9aa1ad;
  font-size: 1.05rem;
  margin: 0;
}

/* Timeline */
.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.timeline-line {
  position: absolute;
  left: 15px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: linear-gradient(
    180deg,
    rgba(52, 94, 239, 0.45) 0%,
    rgba(52, 94, 239, 0.15) 50%,
    rgba(52, 94, 239, 0.05) 100%
  );
  border-radius: 2px;
}
.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 1.25rem;
  align-items: start;
}

/* Timeline dot */
.timeline-dot {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dot-core {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #345eef;
  box-shadow: 0 0 0 4px rgba(52, 94, 239, 0.15);
}
.timeline-dot.latest .dot-core {
  background: #5b82f2;
  box-shadow: 0 0 12px rgba(52, 94, 239, 0.7);
}
.dot-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(52, 94, 239, 0.55);
  animation: dotPulse 1.8s ease-out infinite;
}
@keyframes dotPulse {
  0% { transform: scale(0.6); opacity: 1; }
  100% { transform: scale(2.2); opacity: 0; }
}

/* Release card */
.release-card {
  padding: 1.5rem 1.75rem;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.release-card:hover {
  transform: translateY(-2px);
  border-color: rgba(52, 94, 239, 0.25);
  box-shadow: 0 16px 40px -18px rgba(52, 94, 239, 0.45);
}
.release-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.1rem;
  flex-wrap: wrap;
}
.release-title {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.version {
  font-size: 1.35rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.01em;
}
.badge-latest {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: #fff;
  background: #345eef;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
}
.release-date {
  font-size: 0.85rem;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
}
.release-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.release-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  color: #9aa1ad;
  font-size: 0.95rem;
  line-height: 1.6;
}
.change-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #345eef;
  margin-top: 0.55rem;
  flex-shrink: 0;
}
.change-text {
  flex: 1;
}

/* Note */
.changelog-note {
  margin-top: 3rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Scroll reveal */
.reveal {
  opacity: 0;
  transform: translateY(-28px) scale(1.02);
  transition: opacity 0.8s cubic-bezier(0.22, 0.61, 0.36, 1),
              transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
  transition-delay: var(--delay, 0s);
}
.reveal.in {
  opacity: 1;
  transform: none;
}
.reveal.no-anim {
  transition: none !important;
}
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1 !important; transform: none !important; }
}

/* Responsive */
@media (max-width: 640px) {
  .timeline-item {
    grid-template-columns: 28px 1fr;
    gap: 0.9rem;
  }
  .timeline-line { left: 13px; }
  .release-card { padding: 1.2rem; }
  .release-head { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
}
</style>

<style>
/* Light mode overrides */
html[data-theme="light"] .changelog-root {
  color: #1a1a1a;
  background: #eef1f6;
}
html[data-theme="light"] .hero-glow {
  background:
    radial-gradient(ellipse at 18% 12%, rgba(52, 94, 239, 0.08) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 85%, rgba(34, 197, 94, 0.04) 0%, transparent 45%);
}
html[data-theme="light"] .title,
html[data-theme="light"] .version { color: #1a1a1a !important; }
html[data-theme="light"] .subtitle,
html[data-theme="light"] .release-list li,
html[data-theme="light"] .changelog-note { color: #4b5563 !important; }
html[data-theme="light"] .release-date { color: #6b7280 !important; }
html[data-theme="light"] .release-card,
html[data-theme="light"] .kicker {
  background: rgba(255, 255, 255, 0.92) !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
}
html[data-theme="light"] .kicker { color: #345eef !important; }
html[data-theme="light"] .timeline-line {
  background: linear-gradient(
    180deg,
    rgba(52, 94, 239, 0.35) 0%,
    rgba(52, 94, 239, 0.12) 50%,
    rgba(52, 94, 239, 0.04) 100%
  );
}
</style>
