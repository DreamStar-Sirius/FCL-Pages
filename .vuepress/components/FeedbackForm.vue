<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useToast, waitForConfig } from '../utils/fcl-shared.js'

function initReveal() {
  const els = document.querySelectorAll('.feedback-root .reveal')
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
}

const { toasts, showToast } = useToast()
const form = reactive({ type: 'bug', title: '', content: '', contact: '', captcha: '' })
const submitting = ref(false)
const captchaCode = ref('')
const canvasRef = ref(null)

const FEISHU_WEBHOOK = 'https://open.feishu.cn/open-apis/bot/v2/hook/e9e58d18-3a97-48ed-8fcd-b49084f2cabd'
const TYPE_MAP = { bug: '🐛 Bug 报告', feature: '💡 功能建议', other: '📝 其他' }
const TYPE_OPTIONS = [
  { value: 'bug', label: 'Bug 报告', icon: 'fa-bug' },
  { value: 'feature', label: '功能建议', icon: 'fa-lightbulb' },
  { value: 'other', label: '其他', icon: 'fa-pen-to-square' }
]

function genChar() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return chars.charAt(Math.floor(Math.random() * chars.length))
}
function rndColor() {
  const r = Math.floor(Math.random() * 200) + 30
  const g = Math.floor(Math.random() * 200) + 30
  const b = Math.floor(Math.random() * 200) + 30
  return `rgb(${r},${g},${b})`
}
function drawCaptcha() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width, h = canvas.height
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, w, h)
  let code = ''
  for (let i = 0; i < 4; i++) code += genChar()
  captchaCode.value = code
  const chars = code.split('')
  const charW = w / chars.length
  const fontSize = h * 0.7
  chars.forEach((c, i) => {
    const x = charW * i + charW / 2 + (Math.random() * 6 - 3)
    const y = h * 0.75 + (Math.random() * 6 - 3)
    const angle = (Math.random() - 0.5) * 0.5
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.font = `bold ${fontSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = rndColor()
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 4
    ctx.fillText(c, 0, 0)
    ctx.restore()
  })
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    ctx.moveTo(Math.random() * w, Math.random() * h)
    ctx.lineTo(Math.random() * w, Math.random() * h)
    ctx.strokeStyle = rndColor()
    ctx.lineWidth = Math.random() * 1.5 + 0.5
    ctx.stroke()
  }
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = rndColor()
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5)
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, w, h)
}
function refreshCaptcha() {
  drawCaptcha()
  form.captcha = ''
}

function getCurrentUser() {
  try {
    const u = window.CookieUtil && window.CookieUtil.getUserInfo ? window.CookieUtil.getUserInfo() : null
    if (u && u.username && u.username !== '用户') return u.username
  } catch (e) {}
  return '未登录用户'
}

function buildPayload(type, title, content, contact, username, now) {
  const typeLabel = TYPE_MAP[type] || type
  return {
    msg_type: 'post',
    content: { post: { zh_cn: {
      title: '📢 [FCL] 新反馈',
      content: [
        [{ tag: 'text', text: '📌 类型：' }, { tag: 'text', text: typeLabel }],
        [{ tag: 'text', text: '📝 标题：' }, { tag: 'text', text: title }],
        [{ tag: 'text', text: '👤 用户：' }, { tag: 'text', text: username }],
        [{ tag: 'text', text: '📞 联系方式：' }, { tag: 'text', text: contact || '未填写' }],
        [{ tag: 'text', text: '🕐 时间：' }, { tag: 'text', text: now }],
        [{ tag: 'text', text: '─────────────────' }],
        [{ tag: 'text', text: '📄 详细描述：' }],
        [{ tag: 'text', text: content }]
      ]
    } } }
  }
}

async function submit() {
  if (submitting.value) return
  if (!form.title.trim() || !form.content.trim()) { showToast('请填写标题和详细描述', 'error'); return }
  if (form.captcha.trim().toUpperCase() !== captchaCode.value) {
    showToast('验证码错误，请重新输入', 'error')
    refreshCaptcha()
    return
  }
  const username = getCurrentUser()
  const now = new Date().toLocaleString('zh-CN')
  submitting.value = true
  const payload = buildPayload(form.type, form.title.trim(), form.content.trim(), form.contact.trim(), username, now)
  try {
    const res = await fetch(FEISHU_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const result = await res.json()
    if (result.code === 0) {
      showToast('反馈已提交，感谢你的贡献！', 'success')
      form.title = ''; form.content = ''; form.contact = ''; form.captcha = ''
      refreshCaptcha()
    } else {
      const msgMap = {
        19024: '关键词校验失败，请检查飞书机器人是否设置了自定义关键词 "FCL"',
        19022: 'IP 不在白名单中',
        9499: '请求体格式错误，请检查消息大小是否超过 20KB'
      }
      showToast('提交失败：' + (msgMap[result.code] || result.msg || '未知错误'), 'error')
      refreshCaptcha()
    }
  } catch (err) {
    console.error('提交反馈失败:', err)
    showToast('网络错误，请稍后重试', 'error')
    refreshCaptcha()
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  waitForConfig().then(drawCaptcha)
  initReveal()
})
</script>

<template>
  <div class="feedback-root">
    <div class="feedback-glow" aria-hidden="true"></div>
    <div class="feedback-grid" aria-hidden="true"></div>

    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="'toast-' + t.type">{{ t.message }}</div>
    </div>

    <main class="feedback-main">
      <header class="feedback-header reveal">
        <span class="kicker"><i class="fa-solid fa-comments"></i> FEEDBACK</span>
        <h1 class="title">反馈</h1>
        <p class="subtitle">提交 Bug 报告或功能建议，帮助我们改进 FCL。</p>
      </header>

      <div class="feedback-body">
        <section class="feedback-card glass-card reveal">
          <form @submit.prevent="submit" class="feedback-form">
            <div class="form-group">
              <label class="form-label">反馈类型</label>
              <div class="type-tabs">
                <button
                  v-for="opt in TYPE_OPTIONS"
                  :key="opt.value"
                  type="button"
                  class="type-tab"
                  :class="{ active: form.type === opt.value }"
                  @click="form.type = opt.value"
                >
                  <i :class="['fa-solid', opt.icon]"></i>
                  <span>{{ opt.label }}</span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="fb-title">标题</label>
              <div class="input-wrap">
                <i class="fa-solid fa-heading input-icon"></i>
                <input id="fb-title" type="text" class="form-input" placeholder="简要描述问题或建议" v-model="form.title">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="fb-content">详细描述</label>
              <div class="input-wrap">
                <i class="fa-solid fa-align-left input-icon textarea-icon"></i>
                <textarea id="fb-content" class="form-input" rows="6" placeholder="请提供尽可能详细的信息，包括复现步骤、系统环境等" v-model="form.content"></textarea>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="fb-contact">联系方式（可选）</label>
              <div class="input-wrap">
                <i class="fa-solid fa-address-card input-icon"></i>
                <input id="fb-contact" type="text" class="form-input" placeholder="邮箱或 QQ" v-model="form.contact">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">验证码</label>
              <div class="captcha-row">
                <canvas ref="canvasRef" class="captcha-canvas" width="140" height="48" @click="refreshCaptcha"></canvas>
                <button type="button" class="captcha-refresh" title="换一张验证码" @click="refreshCaptcha">
                  <i class="fa-solid fa-rotate-right"></i>
                </button>
                <input type="text" class="form-input captcha-input" placeholder="输入验证码" v-model="form.captcha" maxlength="4" autocomplete="off">
              </div>
            </div>

            <button type="submit" class="btn-primary submit-btn" :disabled="submitting">
              <i class="fa-solid fa-paper-plane"></i>
              <span>{{ submitting ? '提交中...' : '提交反馈' }}</span>
            </button>
          </form>
        </section>

        <section class="channels-card glass-card reveal">
          <h2 class="channels-title"><i class="fa-solid fa-share-nodes"></i> 其他渠道</h2>
          <div class="channels-list">
            <a class="channel-item" href="https://github.com/ShortYard941746/MFSDT-Update/issues" target="_blank" rel="noopener">
              <span class="channel-icon github"><i class="fa-brands fa-github"></i></span>
              <div class="channel-info">
                <span class="channel-name">GitHub Issues</span>
                <span class="channel-desc">提交 Issue 与功能建议</span>
              </div>
            </a>
            <div class="channel-item">
              <span class="channel-icon qq"><i class="fa-brands fa-qq"></i></span>
              <div class="channel-info">
                <span class="channel-name">QQ 群</span>
                <span class="channel-desc">1051456192</span>
              </div>
            </div>
            <div class="channel-item">
              <span class="channel-icon email"><i class="fa-regular fa-envelope"></i></span>
              <div class="channel-info">
                <span class="channel-name">邮箱</span>
                <span class="channel-desc">3465453028@qq.com</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.feedback-root {
  position: relative;
  min-height: 100vh;
  color: #e6e8ec;
  padding: 6rem 1.5rem 4rem;
  overflow: hidden;
}
.feedback-glow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(ellipse at 15% 15%, rgba(52, 94, 239, 0.10) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 80%, rgba(34, 197, 94, 0.06) 0%, transparent 45%);
}
.feedback-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.25;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at 50% 30%, #000 20%, transparent 70%);
}
.feedback-main {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
}

/* Header */
.feedback-header {
  text-align: center;
  margin-bottom: 2.5rem;
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

/* Cards */
.feedback-card,
.channels-card {
  padding: 2rem;
  margin-bottom: 1.5rem;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.feedback-card:hover,
.channels-card:hover {
  border-color: rgba(52, 94, 239, 0.22);
  box-shadow: 0 16px 40px -18px rgba(52, 94, 239, 0.45);
}

/* Form */
.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
}
.input-wrap {
  position: relative;
}
.input-wrap .form-input {
  padding-left: 2.75rem;
  width: 100%;
}
.input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.25);
  font-size: 0.875rem;
  pointer-events: none;
}
.textarea-icon {
  top: 1rem;
  transform: none;
}

/* Type tabs */
.type-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.type-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1rem;
  border-radius: 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.type-tab:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.type-tab.active {
  background: rgba(52, 94, 239, 0.15);
  border-color: rgba(52, 94, 239, 0.45);
  color: #7c9bff;
}
.type-tab i {
  font-size: 0.85rem;
}

/* Captcha */
.captcha-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.captcha-canvas {
  width: 140px;
  height: 48px;
  border-radius: 0.65rem;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: border-color 0.2s;
}
.captcha-canvas:hover {
  border-color: rgba(52, 94, 239, 0.4);
}
.captcha-refresh {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s;
}
.captcha-refresh:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  transform: rotate(90deg);
}
.captcha-input {
  flex: 1;
  min-width: 140px;
  padding-left: 1rem !important;
}

/* Submit */
.submit-btn {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.85rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 8px 24px -8px rgba(52, 94, 239, 0.55);
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Channels */
.channels-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.channels-title i { color: #7c9bff; }
.channels-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.channel-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  text-decoration: none;
  transition: all 0.2s;
}
.channel-item:hover {
  background: rgba(52, 94, 239, 0.08);
  border-color: rgba(52, 94, 239, 0.25);
  transform: translateY(-1px);
}
.channel-icon {
  width: 42px;
  height: 42px;
  border-radius: 0.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  flex-shrink: 0;
}
.channel-icon.github { background: rgba(255, 255, 255, 0.08); color: #fff; }
.channel-icon.qq { background: rgba(52, 94, 239, 0.15); color: #7c9bff; }
.channel-icon.email { background: rgba(34, 197, 94, 0.12); color: #22C55E; }
.channel-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.channel-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
}
.channel-desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
}

/* Scroll reveal */
.reveal {
  opacity: 0;
  transform: translateY(-28px) scale(1.02);
  transition: opacity 0.8s cubic-bezier(0.22, 0.61, 0.36, 1),
              transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
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
  .feedback-card,
  .channels-card { padding: 1.5rem; }
  .type-tabs { width: 100%; }
  .type-tab { flex: 1; justify-content: center; }
  .captcha-row > * { flex: 1 1 100%; }
  .captcha-canvas { width: 100%; }
}
</style>

<style>
/* Light mode overrides */
html[data-theme="light"] .feedback-root {
  color: #1a1a1a;
  background: #eef1f6;
}
html[data-theme="light"] .feedback-glow {
  background:
    radial-gradient(ellipse at 15% 15%, rgba(52, 94, 239, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 80%, rgba(34, 197, 94, 0.04) 0%, transparent 45%);
}
html[data-theme="light"] .title,
html[data-theme="light"] .channels-title,
html[data-theme="light"] .channel-name { color: #1a1a1a !important; }
html[data-theme="light"] .subtitle,
html[data-theme="light"] .channel-desc { color: #6b7280 !important; }
html[data-theme="light"] .form-label { color: #6b7280 !important; }
html[data-theme="light"] .feedback-card,
html[data-theme="light"] .channels-card,
html[data-theme="light"] .kicker { background: rgba(255, 255, 255, 0.92) !important; border-color: rgba(0, 0, 0, 0.1) !important; }
html[data-theme="light"] .kicker { color: #345eef !important; }
html[data-theme="light"] .type-tab {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #4b5563;
}
html[data-theme="light"] .type-tab:hover { background: #e5e7eb; color: #1a1a1a; }
html[data-theme="light"] .type-tab.active { background: rgba(52, 94, 239, 0.1); border-color: rgba(52, 94, 239, 0.35); color: #345eef; }
html[data-theme="light"] .captcha-refresh {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #6b7280;
}
html[data-theme="light"] .captcha-refresh:hover { background: #e5e7eb; color: #1a1a1a; }
html[data-theme="light"] .channel-item { background: #f9fafb; border-color: rgba(0, 0, 0, 0.06); }
html[data-theme="light"] .channel-item:hover { background: rgba(52, 94, 239, 0.06); border-color: rgba(52, 94, 239, 0.2); }
html[data-theme="light"] .channel-icon.github { background: #f3f4f6; color: #1a1a1a; }
html[data-theme="light"] .channel-icon.qq { background: rgba(52, 94, 239, 0.1); color: #345eef; }
html[data-theme="light"] .channel-icon.email { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
</style>
