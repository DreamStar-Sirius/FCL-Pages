<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useToast } from '../utils/fcl-shared.js'

const { toasts, showToast } = useToast()
const progress = ref(42)
const progressText = ref('42%')
const progressFill = ref(null)
let timer = null
let toastTimer = null

const JOKES = [
  '一只猫正在重写我们的数据库索引，请耐心等待。',
  '程序员正在跟猫谈判，目前猫要求加罐头。',
  '数据库正在迷路中，已派出松鼠前往搜寻。',
  '维护进度取决于猫的午睡时长，建议你也去睡一觉。',
  '我们的服务器正在被猫踩键盘，代码在乱码中重构。'
]

function tick() {
  const inc = 0.5 + Math.random() * 1.5
  progress.value = Math.min(progress.value + inc, 99)
  progressText.value = Math.floor(progress.value) + '%'
  if (progressFill.value) progressFill.value.style.width = progress.value + '%'
}

function refresh() {
  showToast('刷新了，但没完全刷新，毕竟猫还没醒。', 'info')
}
function subscribe() {
  showToast('已订阅！我们将在恢复后通过猫叫通知你（频率取决于猫的嗓子）。', 'success')
}

onMounted(() => {
  timer = setInterval(tick, 3000)
  toastTimer = setTimeout(() => {
    showToast(JOKES[Math.floor(Math.random() * JOKES.length)], 'warning')
  }, 2000)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  clearTimeout(toastTimer)
})
</script>

<template>
  <div class="maintain-page">
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="'toast-' + t.type">{{ t.message }}</div>
    </div>

    <aside class="glow-bg" aria-hidden="true"></aside>

    <header class="topbar">
      <nav class="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" class="brand">
          <img src="/images/FCL.png" alt="FCL Logo" class="logo"> FCL
        </a>
        <span class="status-tag">
          <span class="status-pulse"></span> 维护中
        </span>
      </nav>
    </header>

    <main class="flex-1 flex items-center justify-center px-6 py-8">
      <section class="max-w-5xl w-full">
        <header class="text-center mb-12">
          <div class="cute-cat mb-4">(=^･^=)</div>
          <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-3">
            <span class="text-white">FCL网站正在维护，</span>
            <span class="grad">程序员正在被猫踩键盘</span>
          </h1>
          <p class="subtitle max-w-2xl mx-auto">
            别慌，不是你的问题。是我们的服务器在跟代码打架，目前代码暂时领先。
          </p>
        </header>

        <section class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <article class="maintenance-card col-span-1 lg:col-span-2">
            <header class="flex items-center gap-3 mb-3">
              <i class="fa-solid fa-circle-exclamation text-accent text-xl"></i>
              <h2 class="text-lg font-semibold">发生了什么</h2>
              <span class="text-xs ml-auto" style="color:rgba(255,255,255,0.3)">事发时间：5分钟前</span>
            </header>
            <p class="text-sm leading-relaxed" style="color:rgba(255,255,255,0.6)">
              我们的数据库在午睡时被一只路过的猫踩到了电源键，导致数据表们集体迷路。
              目前技术团队正在用<strong style="color:rgba(255,255,255,0.8)">猫条</strong>和<strong style="color:rgba(255,255,255,0.8)">激光笔</strong>诱导它们归位。
              预计恢复时间取决于猫的心情，乐观估计 <strong class="text-accent">2小时</strong>，悲观估计……等猫睡醒。
            </p>
            <footer class="mt-3 flex items-center gap-4 text-xs" style="color:rgba(255,255,255,0.3)">
              <span><i class="fa-solid fa-user-astronaut mr-1"></i> 受影响服务：登录、下载、云存档</span>
              <span><i class="fa-solid fa-rotate-right mr-1"></i> 上次重试：12秒前</span>
            </footer>
          </article>

          <article class="maintenance-card">
            <header class="flex items-center gap-2 mb-3">
              <i class="fa-solid fa-chart-simple text-accent text-sm"></i>
              <h3 class="text-sm font-medium">维护进度</h3>
            </header>
            <div class="flex justify-between text-xs mb-1" style="color:rgba(255,255,255,0.4)">
              <span>已完成</span>
              <span>{{ progressText }}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" ref="progressFill" :style="{ width: progress + '%' }"></div>
            </div>
            <p class="text-xs mt-2" style="color:rgba(255,255,255,0.3)">
              <i class="fa-solid fa-spinner fa-spin mr-1"></i> 正在重新训练数据库的认路能力
            </p>
          </article>
        </section>

        <footer class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 p-4 glass rounded-xl" style="border:1px solid rgba(255,255,255,0.05)">
          <div class="flex items-center gap-4 text-sm" style="color:rgba(255,255,255,0.4)">
            <i class="fa-regular fa-bell"></i>
            <span>恢复后我们会通过 <strong style="color:rgba(255,255,255,0.6)">猫叫</strong> 通知你</span>
          </div>
          <div class="flex items-center gap-3">
            <button class="btn-ghost" @click="refresh">
              <i class="fa-solid fa-rotate-right"></i> 手动刷新
            </button>
            <button class="btn-accent" @click="subscribe">
              <i class="fa-regular fa-envelope"></i> 订阅恢复通知
            </button>
          </div>
        </footer>

        <p class="text-center text-xs mt-6" style="color:rgba(255,255,255,0.2)">
          <i class="fa-regular fa-comment-dots mr-1"></i>
          如果你在维护期间看到了这条消息，说明你的网络没问题，是我们的服务器在试图跟猫讲道理。
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.maintain-page { min-height: 100vh; display: flex; flex-direction: column; position: relative; }
.topbar { width: 100%; padding: 1.5rem 1.5rem 1rem; position: relative; z-index: 10; }
.brand { font-size: 1.125rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
.logo { height: 2.25rem; width: 2.25rem; }
.status-tag { font-size: 0.75rem; display: flex; align-items: center; gap: 0.5rem; color: rgba(255,255,255,0.3); }
.subtitle { color: rgba(255,255,255,0.4); font-size: 1rem; }
.grad { background: linear-gradient(90deg, #345eef, #F59E0B); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

.btn-ghost { padding: 0.5rem 1.25rem; border-radius: 0.5rem; background: rgba(255,255,255,0.05); transition: all 0.2s; font-size: 0.875rem; color: rgba(255,255,255,0.7); border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; }
.btn-ghost:hover { background: rgba(255,255,255,0.1); }
.btn-accent { padding: 0.5rem 1.25rem; border-radius: 0.5rem; background: rgba(52, 94, 239,0.2); transition: all 0.2s; font-size: 0.875rem; color: #345eef; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; }
.btn-accent:hover { background: rgba(52, 94, 239,0.3); }

:global(html[data-theme="light"]) .maintain-page { background-color: #F0F2F5; }
:global(html[data-theme="light"]) .brand { color: #1A1A1A; }
:global(html[data-theme="light"]) .status-tag,
:global(html[data-theme="light"]) .subtitle,
:global(html[data-theme="light"]) .maintain-page main p,
:global(html[data-theme="light"]) .maintenance-card p,
:global(html[data-theme="light"]) .maintenance-card footer span { color: #4B5563 !important; }
:global(html[data-theme="light"]) .maintenance-card strong { color: #1A1A1A !important; }
</style>
