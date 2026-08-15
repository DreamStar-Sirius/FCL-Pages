<script setup>
import { ref, onMounted } from 'vue'
import { useToast, initSupabase, getStorageMessage } from '../utils/fcl-shared.js'

const { toasts, showToast } = useToast()
const username = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const pwdMismatch = ref(false)
const loading = ref(false)
const ready = ref(false)
const storage = ref({ used: 0, total: 5000, percent: 0, remain: 5000, message: '正在获取存储信息...', shard: '--', progressColor: '#22C55E' })

let sb = null

onMounted(async () => {
  try {
    sb = await initSupabase()
    checkSession()
    loadShardStatus(window.CONFIG)
    ready.value = true
  } catch (e) {
    console.error('注册页初始化失败', e)
    showToast('服务初始化失败，请刷新页面重试', 'error')
  }
})

async function checkSession() {
  const { data } = await sb.auth.getSession()
  if (data && data.session) window.location.replace('/dashboard.html')
}

async function loadShardStatus(cfg) {
  try {
    const res = await fetch('https://' + cfg.SUPABASE_URL.replace('https://', '') + '/functions/v1/get-shard-status', {
      headers: { Authorization: 'Bearer ' + cfg.SUPABASE_ANON_KEY }
    })
    const result = await res.json()
    if (result.success) updateStorageUI(result)
    else storage.value.message = '获取存储状态失败'
  } catch (e) {
    storage.value.message = '无法连接存储服务'
  }
}

function updateStorageUI(data) {
  const used = data?.summary?.totalUsedMB || 0
  const total = data?.summary?.totalCapacityMB || 5000
  const percent = Math.min((used / total) * 100, 100)
  const remaining = Math.max(total - used, 0)
  storage.value.used = used
  storage.value.total = total
  storage.value.percent = percent
  storage.value.remain = remaining
  const info = getStorageMessage(percent)
  storage.value.progressColor = info.progressColor
  storage.value.message = info.text
  storage.value.shard = data?.summary?.activeShard?.name || '--'
}

async function register() {
  if (!ready.value || !sb) { showToast('服务初始化中，请稍候', 'error'); return }
  if (!username.value.trim()) { showToast('请输入用户名', 'error'); return }
  if (username.value.trim().length < 3) { showToast('用户名至少3个字符', 'error'); return }
  if (!email.value.trim()) { showToast('请输入邮箱', 'error'); return }
  if (!password.value) { showToast('请输入密码', 'error'); return }
  if (password.value.length < 6) { showToast('密码至少6位', 'error'); return }
  if (password.value !== confirm.value) { pwdMismatch.value = true; showToast('密码不一致', 'error'); return }
  pwdMismatch.value = false
  loading.value = true
  try {
    const { error } = await sb.auth.signUp({
      email: email.value.trim(),
      password: password.value,
      options: { data: { username: username.value.trim() }, emailRedirectTo: window.location.origin + '/index.html' }
    })
    if (error) showToast(error.message || '注册失败', 'error')
    else { showToast('注册成功', 'success'); setTimeout(() => { window.location.href = '/login.html' }, 1500) }
  } catch (err) {
    showToast('异常：' + err.message, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="'toast-' + t.type">{{ t.message }}</div>
    </div>

    <div class="auth-wrapper">
      <section class="auth-main">
        <div class="glass card p-8">
          <h1 class="card-title">创建账户</h1>
          <p class="card-sub">填写信息注册新账户</p>

          <form @submit.prevent="register" class="form-space mb-6">
            <label class="block">
              <span class="label">用户名</span>
              <span class="input-wrap">
                <input type="text" class="form-input" placeholder="选择你的用户名" v-model="username">
                <i class="fa-solid fa-user input-icon"></i>
              </span>
            </label>
            <label class="block">
              <span class="label">邮箱</span>
              <span class="input-wrap">
                <input type="email" class="form-input" placeholder="you@example.com" v-model="email" autocomplete="email">
                <i class="fa-solid fa-envelope input-icon"></i>
              </span>
            </label>
            <label class="block">
              <span class="label">密码</span>
              <span class="input-wrap">
                <input type="password" class="form-input" placeholder="至少6位字符" v-model="password" autocomplete="new-password">
                <i class="fa-solid fa-lock input-icon"></i>
              </span>
            </label>
            <label class="block">
              <span class="label">确认密码</span>
              <span class="input-wrap">
                <input type="password" class="form-input" placeholder="再次输入密码" v-model="confirm" autocomplete="new-password">
                <i class="fa-solid fa-lock input-icon"></i>
              </span>
              <em v-if="pwdMismatch" class="mismatch">两次输入的密码不一致</em>
            </label>
            <button type="submit" class="btn-primary submit-btn" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              <span>{{ loading ? '注册中...' : '创建账户' }}</span>
            </button>
          </form>

          <p class="bottom-tip">已有账户？<a href="/login.html" class="accent-link">立即登录</a></p>
        </div>

        <div class="welcome">
          <p class="welcome-desc">创建你的账户，解锁个性化设置、云存档同步和高级功能内测资格。开始你的 Minecraft 全新旅程。</p>
          <div class="welcome-tags">
            <span><i class="fa-solid fa-shield-halved"></i> 安全加密</span>
            <span><i class="fa-solid fa-bolt"></i> 极速同步</span>
            <span><i class="fa-solid fa-globe"></i> 全球加速</span>
          </div>
        </div>
      </section>

      <aside class="storage-card">
        <div class="storage-head"><i class="fa-solid fa-database"></i><span>存储状态</span></div>
        <div class="storage-row"><span>{{ storage.used.toFixed(0) }} MB</span><span>{{ storage.total }} MB</span></div>
        <div class="progress-track"><div class="progress-fill" :style="{ width: Math.min(storage.percent,100) + '%', background: storage.progressColor }"></div></div>
        <div class="storage-row"><span>{{ storage.percent.toFixed(1) }}%</span><span>剩余 {{ storage.remain.toFixed(0) }} MB</span></div>
        <div class="storage-message">{{ storage.message }}</div>
        <div class="storage-shard"><i class="fa-solid fa-server"></i> 活跃分库：{{ storage.shard }}</div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.auth-page { position: relative; min-height: calc(100vh - 64px); padding: 4rem 1.5rem; }
.auth-wrapper { display: flex; align-items: stretch; gap: 2.5rem; max-width: 1000px; margin: 0 auto; width: 100%; }
.auth-main { flex: 1.4; }
.auth-main .card { border-radius: 1rem; }
.p-8 { padding: 2rem; }
.card-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
.card-sub { font-size: 0.875rem; color: rgba(255,255,255,0.3); margin-bottom: 1.5rem; }
.label { font-size: 0.75rem; font-weight: 500; color: rgba(255,255,255,0.4); margin-bottom: 0.375rem; display: block; }
.input-wrap { position: relative; display: block; }
.form-space > * + * { margin-top: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mismatch { font-size: 0.6875rem; color: #EF4444; margin-top: 0.25rem; display: block; }
.submit-btn { width: 100%; height: 3rem; border-radius: 0.75rem; font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border: none; cursor: pointer; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.bottom-tip { margin-top: 1.5rem; text-align: center; font-size: 0.75rem; color: rgba(255,255,255,0.3); }
.accent-link { color: #345eef; font-weight: 600; }

.welcome { margin-top: 2rem; text-align: center; }
.welcome-desc { font-size: 0.875rem; color: rgba(255,255,255,0.4); max-width: 28rem; margin: 0 auto; line-height: 1.6; }
.welcome-tags { display: flex; justify-content: center; gap: 1.5rem; font-size: 0.75rem; color: rgba(255,255,255,0.3); margin-top: 1.5rem; }
.welcome-tags i { color: rgba(52, 94, 239,0.6); margin-right: 0.375rem; }

.storage-card { flex: 0.8; align-self: flex-start; background: rgba(20,20,20,0.5); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.06); border-radius: 1rem; padding: 1.5rem; min-width: 280px; max-width: 340px; }
.storage-head { display: flex; align-items: center; gap: 0.5rem; color: rgba(255,255,255,0.6); font-size: 0.875rem; font-weight: 500; }
.storage-row { display: flex; justify-content: space-between; font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 0.5rem; }
.progress-track { width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 9999px; overflow: hidden; margin: 0.75rem 0; }
.progress-fill { height: 100%; border-radius: 9999px; transition: width 0.6s ease; background: #22C55E; }
.storage-message { font-size: 0.75rem; line-height: 1.5; margin-top: 0.5rem; padding: 0.5rem 0.75rem; border-radius: 0.5rem; background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.5); }
.storage-shard { font-size: 0.625rem; color: rgba(255,255,255,0.2); margin-top: 0.5rem; }

@media (max-width: 768px) {
  .auth-wrapper { flex-direction: column; align-items: center; }
  .storage-card { max-width: 100%; width: 100%; flex: none; }
  .auth-main { width: 100%; max-width: 100%; }
}
</style>
