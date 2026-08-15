<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useToast, initSupabase, compressImage } from '../utils/fcl-shared.js'

const { toasts, showToast } = useToast()
const loading = ref(true)
const activeTab = ref('overview')
const isMicrosoft = ref(false)
const compressing = ref(false)
const compressStatus = ref('')
const compressSize = ref('')
const profile = reactive({
  username: '', email: '', bio: '', avatar_url: '/images/default.jpg',
  points: 0, level: 1, role: 'user', status: 'active',
  sign_streak: 0, last_active_at: null, created_at: null, login_method: 'FCL 账户'
})
const form = reactive({ username: '', bio: '', newPassword: '', confirmPassword: '' })

let sb = null
let currentUser = null

const DEFAULT_PROFILE = {
  points: 0, level: 1, account_status: 'active', role: 'user',
  theme_preference: 'dark', bio: '', header_bg_url: '',
  login_fail_count: 0, locked_until: null, last_login_ip: null,
  last_login_at: null, last_active_at: null, registration_ip: null,
  registration_device: null, sign_streak: 0, last_sign_at: null
}

function calculateLevel(points) { return Math.floor(points / 50) + 1 }

function roleBadge(role) {
  if (role === 'admin') return { text: '管理员', cls: 'badge-active' }
  if (role === 'tester') return { text: 'FCL认证内测员', cls: 'badge-microsoft' }
  return { text: '普通用户', cls: 'badge-fcl' }
}

function updateUserCookie() {
  if (!currentUser) return
  const info = {
    id: currentUser.id,
    username: profile.username || currentUser.email?.split('@')[0] || '用户',
    email: currentUser.email,
    avatar_url: profile.avatar_url,
    points: profile.points,
    level: profile.level,
    role: profile.role,
    login_method: isMicrosoft.value ? 'microsoft' : 'fcl',
    updated_at: Date.now()
  }
  try {
    if (window.CookieUtil) window.CookieUtil.saveUserInfo(info)
  } catch (e) {
    console.warn('保存用户 cookie 失败（不影响界面刷新）', e)
  }
  try { window.dispatchEvent(new CustomEvent('fcl-user-updated', { detail: info })) } catch (e) { /* noop */ }
}

async function initApp() {
  try {
    sb = await initSupabase()
    await loadDashboard()
    setInterval(updateLastActive, 60000)
  } catch (err) {
    console.error('初始化失败:', err)
    loading.value = false
    showToast('初始化失败，请刷新页面重试', 'error')
  }
}

async function updateLastActive() {
  if (!sb || !currentUser) return
  try { await sb.from('profiles').upsert({ id: currentUser.id, last_active_at: new Date().toISOString() }) } catch (e) {}
}

async function getSessionWithRetry(tries = 3) {
  let lastErr = null
  for (let i = 0; i < tries; i++) {
    const { data, error } = await sb.auth.getSession()
    if (error) { lastErr = error; await new Promise((r) => setTimeout(r, 500)); continue }
    if (data && data.session) return data.session
    await new Promise((r) => setTimeout(r, 400))
    if (i < tries - 1) continue
    return null
  }
  if (lastErr) console.warn('getSession 出错：', lastErr)
  return null
}

async function loadDashboard() {
  const session = await getSessionWithRetry()
  if (!session) { window.location.href = '/login.html'; return }
  currentUser = session.user
  isMicrosoft.value = currentUser.app_metadata?.provider === 'azure' || currentUser.app_metadata?.provider === 'microsoft'

  const { data: p, error: pErr } = await sb.from('profiles').select('*').eq('id', currentUser.id).maybeSingle()
  if (pErr) console.warn('加载 profiles 失败:', pErr)
  const merged = { ...DEFAULT_PROFILE, ...(p || {}) }
  merged.level = calculateLevel(merged.points)
  Object.assign(profile, merged)

  if (!p) {
    await sb.from('profiles').insert({
      id: currentUser.id,
      username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0],
      avatar_url: currentUser.user_metadata?.avatar_url || '/images/default.jpg',
      ...DEFAULT_PROFILE
    }).then(({ error }) => { if (error) console.warn('创建 profiles 失败:', error) })
  }

  try {
    const ipRes = await fetch('https://api.ipify.org?format=json')
    const ipData = await ipRes.json()
    await sb.from('profiles').upsert({ id: currentUser.id, last_login_at: new Date().toISOString(), last_login_ip: ipData.ip })
    profile.last_login_at = new Date().toISOString()
    profile.last_login_ip = ipData.ip
  } catch (e) { console.log('获取 IP 失败:', e) }

  loading.value = false
  updateOverviewTab()
  updateProfileTab()

  if (isMicrosoft.value) {
    document.getElementById('passwordField')?.style.setProperty('display', 'none')
    document.getElementById('changeAvatarBtn')?.style.setProperty('display', 'none')
  }

  const today = new Date().toDateString()
  const lastSign = profile.last_sign_at ? new Date(profile.last_sign_at).toDateString() : null
  if (lastSign !== today) document.getElementById('signInBtn')?.classList.add('signin-available')
  updateUserCookie()
}

function updateOverviewTab() {
  profile.login_method = isMicrosoft.value ? 'Microsoft 账户' : 'FCL 账户'
  profile.status = profile.status || 'active'
}

function updateProfileTab() {
  form.username = profile.username || currentUser?.user_metadata?.username || currentUser?.email?.split('@')[0] || ''
  form.bio = profile.bio || ''
}

function switchTab(tab) {
  activeTab.value = tab
  document.querySelectorAll('.dash-nav-item').forEach((n) => n.classList.toggle('active', n.dataset.tab === tab))
}

async function handleSignIn() {
  const today = new Date().toDateString()
  const lastSign = profile.last_sign_at ? new Date(profile.last_sign_at).toDateString() : null
  if (lastSign === today) { showToast('今天已经签到过了！明天再来吧~', 'info'); return }
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  let streak = profile.sign_streak || 0
  if (lastSign === yesterday.toDateString()) streak++; else streak = 1
  const earned = Math.floor(Math.random() * 5) + 1
  const newPoints = (profile.points || 0) + earned
  const newLevel = calculateLevel(newPoints)
  try {
    const { error } = await sb.from('profiles').upsert({
      id: currentUser.id, points: newPoints, level: newLevel, sign_streak: streak,
      last_sign_at: new Date().toISOString(), updated_at: new Date().toISOString()
    })
    if (error) { showToast('签到失败: ' + error.message, 'error'); return }
    profile.points = newPoints; profile.level = newLevel; profile.sign_streak = streak; profile.last_sign_at = new Date().toISOString()
    updateUserCookie()
    showToast('签到成功！获得 ' + earned + ' 积分，当前等级 Lv.' + newLevel, 'success')
    document.getElementById('signInBtn')?.classList.remove('signin-available')
  } catch (e) { showToast('签到失败，请稍后重试', 'error') }
}

async function saveProfile() {
  if (!form.username.trim()) { showToast('用户名不能为空', 'error'); return }
  const { error } = await sb.from('profiles').upsert({ id: currentUser.id, username: form.username.trim(), bio: form.bio, updated_at: new Date().toISOString() })
  if (error) showToast('更新失败: ' + error.message, 'error')
  else { showToast('资料已更新', 'success'); profile.username = form.username.trim(); profile.bio = form.bio; updateUserCookie() }
}

async function saveSecurity() {
  if (isMicrosoft.value) { showToast('Microsoft 账户不能修改密码', 'error'); return }
  if (!form.newPassword) { showToast('请输入新密码', 'error'); return }
  if (form.newPassword.length < 6) { showToast('密码至少6位', 'error'); return }
  if (form.newPassword !== form.confirmPassword) { showToast('两次输入的密码不一致', 'error'); return }
  const { error } = await sb.auth.updateUser({ password: form.newPassword })
  if (error) showToast('更新失败: ' + error.message, 'error')
  else { showToast('密码已更新', 'success'); form.newPassword = ''; form.confirmPassword = '' }
}

const AVATAR_BUCKET = 'avatars'

function explainUploadError(err) {
  const raw = (err && (err.message || err.error || String(err))) || '未知错误'
  const m = String(raw)
  if (/Failed to fetch|NetworkError|network error|ERR_NETWORK|Load failed/i.test(m)) {
    return '无法连接存储服务（supabase.co 在国内网络下常需代理/VPN，或被防火墙拦截）。请检查网络/代理后重试；若长期不稳定，可考虑改用国内可达的对象存储做头像。'
  }
  if (/Bucket not found|NoSuchBucket/i.test(m)) {
    return '云端存储桶「' + AVATAR_BUCKET + '」不存在，请联系管理员在 Supabase 控制台创建该存储桶并设为公开'
  }
  if (/row-level security|AccessDenied|Unauthorized|403/i.test(m)) {
    return '没有上传权限。请联系管理员为存储桶「' + AVATAR_BUCKET + '」配置允许登录用户上传的访问策略'
  }
  if (/exceeded the maximum allowed size|Payload too large|413/i.test(m)) {
    return '文件超出存储桶允许的大小上限，请换一张更小的图片'
  }
  if (/JWT|token is expired|invalid claim/i.test(m)) {
    return '登录状态已过期，请重新登录后再上传'
  }
  if (/timeout|timed out/i.test(m)) {
    return '上传超时，网络较慢，请稍后重试'
  }
  return '上传失败：' + m
}

function isRetriableError(err) {
  const m = String((err && (err.message || err.error)) || err || '')
  return /Failed to fetch|NetworkError|network error|ERR_NETWORK|Load failed|timeout|timed out|502|503|504/i.test(m)
}

async function uploadWithRetry(fileName, fileObj, maxTries = 3) {
  let lastErr = null
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    if (attempt > 1) {
      compressStatus.value = '网络不稳定，正在重试上传（第 ' + attempt + '/' + maxTries + ' 次）...'
      await new Promise((r) => setTimeout(r, 700 * Math.pow(2, attempt - 2)))
    }
    try {
      const { error } = await sb.storage
        .from(AVATAR_BUCKET)
        .upload(fileName, fileObj, { upsert: true, contentType: 'image/webp', cacheControl: '3600' })
      if (!error) return
      lastErr = error
      if (!isRetriableError(error)) throw error
    } catch (err) {
      lastErr = err
      if (!isRetriableError(err)) throw err
    }
  }
  throw lastErr || new Error('上传失败')
}

async function changeAvatar(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    if (!sb || !currentUser) { showToast('账户信息尚未就绪，请稍后重试', 'error'); return }
    try {
      const { data: sessData } = await sb.auth.getSession()
      if (!sessData || !sessData.session) {
        showToast('登录状态已过期，请重新登录后再上传', 'error')
        return
      }
    } catch (e) {
      console.warn('[头像] 会话检查失败，仍继续尝试上传：', e)
    }

    compressing.value = true
    compressStatus.value = '正在压缩图片为 WebP 格式...'
    compressSize.value = '目标大小：≤ 50 KB（WebP 已优化，节省空间且显示清晰）'
    const blob = await compressImage(file, 50, 128)
    const finalKB = blob.size / 1024
    compressStatus.value = '✅ 压缩完成 (' + finalKB.toFixed(0) + ' KB)，正在上传...'
    const compressedFile = new File([blob], 'avatar_' + Date.now() + '.webp', { type: 'image/webp' })

    compressStatus.value = '正在上传头像...'
    const fileName = currentUser.id + '/' + Date.now() + '.webp'

    await uploadWithRetry(fileName, compressedFile)

    const { data: urlData } = sb.storage.from(AVATAR_BUCKET).getPublicUrl(fileName)
    if (!urlData || !urlData.publicUrl) throw new Error('未能获取头像访问地址')
    const publicUrl = urlData.publicUrl

    const { error: up2 } = await sb.from('profiles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', currentUser.id)
    if (up2) throw up2

    const old = profile.avatar_url
    if (old && old.includes('/' + AVATAR_BUCKET + '/')) {
      const oldPath = old.split('/' + AVATAR_BUCKET + '/')[1].split('?')[0]
      if (oldPath && oldPath !== fileName) {
        try { await sb.storage.from(AVATAR_BUCKET).remove([oldPath]) } catch (err) { console.warn('清理旧头像失败（可忽略）', err) }
      }
    }

    const displayUrl = publicUrl + (publicUrl.includes('?') ? '&' : '?') + 't=' + Date.now()
    profile.avatar_url = displayUrl
    updateUserCookie()
    showToast('✅ 头像已更新！压缩后 ' + finalKB.toFixed(0) + ' KB (WebP 格式)', 'success')
  } catch (err) {
    console.error('[头像上传失败]', err)
    showToast(explainUploadError(err), 'error')
  } finally {
    compressing.value = false
    compressStatus.value = ''
    e.target.value = ''
  }
}

async function logout() {
  if (confirm('确定要注销当前设备吗？你需要重新登录才能访问账户。')) {
    if (window.CookieUtil) window.CookieUtil.clearUserInfo()
    await sb.auth.signOut()
    window.location.href = '/login.html'
  }
}

async function deleteAccount() {
  if (isMicrosoft.value) { showToast('Microsoft 账户暂不支持删除', 'error'); return }
  if (!confirm('⚠️ 危险操作警告\n\n删除账户后，你的所有数据将被永久删除且无法恢复。\n\n确定要删除账户吗？')) return
  if (prompt('请输入 "DELETE" 确认删除账户：') !== 'DELETE') { showToast('删除已取消', 'info'); return }
  showToast('正在删除账户...', 'info')
  const { data, error } = await sb.rpc('delete_my_account')
  if (error) { showToast('删除失败: ' + error.message, 'error'); return }
  if (data && data.success) {
    showToast('账户已删除', 'success')
    if (window.CookieUtil) window.CookieUtil.clearUserInfo()
    await sb.auth.signOut()
    setTimeout(() => { window.location.href = '/index.html' }, 1500)
  } else { showToast('删除失败: ' + (data?.error || '未知错误'), 'error') }
}

const jokes = [
  '建议把路由器举过头顶转三圈，',
  '检测到您还没给屏幕磕头，试试来一下，',
  '可能是您吸气方式不对，换个方式',
  '正在给服务器发送脑电波，但对方没有收到，试试换一下电波频率，',
  '因为您没有对着摄像头比心，试试来一下，',
  '大概是您今天的“运气余额”不足，请先充值，',
  '请坐和放宽一会，'
]

function initReveal() {
  const els = document.querySelectorAll('.dash-root .reveal')
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

onMounted(async () => {
  document.getElementById('randomJoke').textContent = jokes[Math.floor(Math.random() * jokes.length)]
  await initApp()
  initReveal()
})
</script>

<template>
  <div class="dash-root">
    <div class="dash-glow" aria-hidden="true"></div>
    <div class="dash-grid" aria-hidden="true"></div>

    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="'toast-' + t.type">{{ t.message }}</div>
    </div>

    <div id="compressOverlay" class="compress-overlay" :style="{ display: compressing ? 'flex' : 'none' }">
      <div class="spinner-lg"></div>
      <p>{{ compressStatus }}</p>
      <p class="size-info">{{ compressSize }}</p>
    </div>

    <main class="dash-main">
      <div v-if="loading" class="loading">
        <div class="spinner-lg"></div>
        <div class="loading-text">
          <p>正在拼命加载您的个人信息，请耐心等待……</p>
          <p class="loading-joke">如果长时间加载不出来，<del id="randomJoke"></del>再刷新页面重试。</p>
        </div>
      </div>

      <template v-else>
        <header class="dash-header reveal">
          <span class="kicker"><i class="fa-solid fa-gauge-high"></i> DASHBOARD</span>
          <h1 class="title">控制台</h1>
          <p class="subtitle">管理你的账户信息和偏好设置</p>
        </header>

        <div class="dash-layout">
          <aside class="dash-side reveal">
            <nav class="dash-nav glass-card">
              <div class="dash-nav-item active" data-tab="overview" @click="switchTab('overview')">
                <i class="fa-solid fa-chart-line"></i><span>总览</span>
              </div>
              <div class="dash-nav-item" data-tab="profile" @click="switchTab('profile')">
                <i class="fa-solid fa-user"></i><span>个人资料</span>
              </div>
              <div class="dash-nav-item" data-tab="security" @click="switchTab('security')">
                <i class="fa-solid fa-shield-halved"></i><span>安全设置</span>
              </div>
              <div class="dash-nav-item" data-tab="danger" @click="switchTab('danger')">
                <i class="fa-solid fa-triangle-exclamation"></i><span>危险区域</span>
              </div>
            </nav>
          </aside>

          <div class="dash-panels">
            <!-- 总览 -->
            <section v-show="activeTab === 'overview'" class="dash-panel reveal">
              <div class="glass-card overview-card">
                <div class="overview-head">
                  <h2 class="panel-title"><i class="fa-solid fa-chart-line accent"></i> 账户总览</h2>
                  <button id="signInBtn" class="btn-success signin" @click="handleSignIn">
                    <i class="fa-solid fa-calendar-check"></i> 每日签到
                  </button>
                </div>
                <div class="overview-body">
                  <div class="avatar-wrap">
                    <img :src="profile.avatar_url" alt="Avatar" class="avatar-large">
                    <span class="level-ring">Lv.{{ profile.level }}</span>
                  </div>
                  <div class="overview-info">
                    <div class="info-row">
                      <span class="info-label">用户名</span>
                      <span class="info-value name">{{ profile.username || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">邮箱</span>
                      <span class="info-value">{{ profile.email || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">个性签名</span>
                      <span class="info-value bio">{{ profile.bio || '这个人很懒，还没有写签名~' }}</span>
                    </div>
                    <div class="badges-row">
                      <span class="badge" :class="isMicrosoft ? 'badge-microsoft' : 'badge-fcl'">{{ profile.login_method }}</span>
                      <span class="badge" :class="profile.status === 'active' ? 'badge-active' : 'badge-frozen'">{{ profile.status }}</span>
                      <span class="badge" :class="roleBadge(profile.role).cls">{{ roleBadge(profile.role).text }}</span>
                    </div>
                    <div class="stats-row">
                      <div class="stat-box">
                        <span class="stat-label">积分</span>
                        <span class="stat-value">{{ profile.points }}</span>
                      </div>
                      <div class="stat-box">
                        <span class="stat-label">等级</span>
                        <span class="stat-value">Lv.{{ profile.level }}</span>
                      </div>
                      <div class="stat-box">
                        <span class="stat-label">连续签到</span>
                        <span class="stat-value">{{ profile.sign_streak }} 天</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="glass-card activity-card reveal">
                <h3 class="panel-subtitle">最近活动</h3>
                <div class="activity-list">
                  <div class="activity-item">
                    <i class="fa-solid fa-clock"></i>
                    <span>最后活跃：{{ profile.last_active_at ? new Date(profile.last_active_at).toLocaleString() : '刚刚' }}</span>
                  </div>
                  <div class="activity-item">
                    <i class="fa-solid fa-calendar-plus"></i>
                    <span>注册时间：{{ profile.created_at ? new Date(profile.created_at).toLocaleString() : (currentUser?.created_at ? new Date(currentUser.created_at).toLocaleString() : '-') }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- 个人资料 -->
            <section v-show="activeTab === 'profile'" class="dash-panel reveal">
              <div class="glass-card profile-card">
                <h2 class="panel-title"><i class="fa-solid fa-user-pen accent"></i> 个人资料</h2>
                <form @submit.prevent="saveProfile" class="profile-form">
                  <div class="form-group">
                    <label class="form-label">头像</label>
                    <div class="avatar-row">
                      <img :src="profile.avatar_url" alt="Avatar" class="avatar-medium">
                      <button type="button" id="changeAvatarBtn" class="btn-secondary" @click="$refs.avatarInput.click()">
                        <i class="fa-solid fa-camera"></i> 更换头像
                      </button>
                      <input ref="avatarInput" type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/bmp" style="display:none" @change="changeAvatar">
                    </div>
                    <p class="form-hint">支持 JPG、PNG、GIF、WebP、BMP，自动压缩为 WebP ≤100KB</p>
                  </div>
                  <div class="form-group">
                    <label class="form-label">用户名</label>
                    <div class="input-wrap">
                      <i class="fa-solid fa-user input-icon"></i>
                      <input type="text" class="form-input" v-model="form.username" placeholder="用户名">
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">个性签名</label>
                    <textarea class="form-input" rows="3" v-model="form.bio" placeholder="介绍一下你自己..."></textarea>
                  </div>
                  <button type="submit" class="btn-primary save-btn"><i class="fa-solid fa-floppy-disk"></i> 保存修改</button>
                </form>
              </div>
            </section>

            <!-- 安全 -->
            <section v-show="activeTab === 'security'" class="dash-panel reveal">
              <div class="glass-card security-card">
                <h2 class="panel-title"><i class="fa-solid fa-lock accent"></i> 安全设置</h2>
                <form @submit.prevent="saveSecurity" class="security-form" id="securityForm">
                  <div id="passwordField" class="password-fields">
                    <div class="form-group">
                      <label class="form-label">新密码</label>
                      <div class="input-wrap">
                        <i class="fa-solid fa-key input-icon"></i>
                        <input type="password" class="form-input" v-model="form.newPassword" placeholder="留空则不修改">
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="form-label">确认新密码</label>
                      <div class="input-wrap">
                        <i class="fa-solid fa-key input-icon"></i>
                        <input type="password" class="form-input" v-model="form.confirmPassword" placeholder="再次输入新密码">
                      </div>
                    </div>
                  </div>
                  <button type="submit" class="btn-primary save-btn"><i class="fa-solid fa-shield-halved"></i> 更新密码</button>
                </form>
              </div>
            </section>

            <!-- 危险区域 -->
            <section v-show="activeTab === 'danger'" class="dash-panel reveal">
              <div class="glass-card danger-card">
                <h2 class="panel-title danger"><i class="fa-solid fa-triangle-exclamation"></i> 危险区域</h2>
                <p class="panel-desc">以下操作不可逆，请谨慎操作。</p>
                <div class="danger-list">
                  <div class="danger-item">
                    <div class="danger-icon"><i class="fa-solid fa-right-from-bracket"></i></div>
                    <div class="danger-content">
                      <h3>注销当前设备</h3>
                      <p>退出当前登录，需要重新输入密码才能访问账户。</p>
                    </div>
                    <button class="btn-danger" @click="logout">立即注销</button>
                  </div>
                  <div class="danger-item strong">
                    <div class="danger-icon"><i class="fa-solid fa-trash-can"></i></div>
                    <div class="danger-content">
                      <h3>删除账户</h3>
                      <p>永久删除所有账户数据，包括个人资料、下载记录、反馈等。</p>
                    </div>
                    <button class="btn-danger strong" @click="deleteAccount">永久删除</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.dash-root {
  position: relative;
  min-height: 100vh;
  color: #e6e8ec;
  padding: 6rem 1.5rem 4rem;
  overflow: hidden;
}
.dash-glow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(ellipse at 12% 12%, rgba(52, 94, 239, 0.10) 0%, transparent 50%),
    radial-gradient(ellipse at 88% 85%, rgba(34, 197, 94, 0.06) 0%, transparent 45%);
}
.dash-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.22;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at 50% 25%, #000 20%, transparent 70%);
}
.dash-main {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}
.loading-text { text-align: center; margin-top: 1.5rem; }
.loading-text p { color: rgba(255,255,255,0.6); font-size: 0.875rem; }
.loading-joke { color: rgba(255,255,255,0.4); font-size: 0.75rem; margin-top: 0.5rem; }

/* Header */
.dash-header {
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

/* Layout */
.dash-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 2rem;
  align-items: start;
}
.dash-side { position: sticky; top: 6rem; }
.dash-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
}
.dash-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-weight: 500;
}
.dash-nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: #fff;
}
.dash-nav-item.active {
  background: rgba(52, 94, 239, 0.12);
  color: #7c9bff;
  border-left: 2px solid #345eef;
}
.dash-nav-item i { width: 1.2rem; text-align: center; }

/* Panels */
.dash-panels { min-width: 0; }
.dash-panel { display: flex; flex-direction: column; gap: 1.5rem; }
.glass-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 1rem;
  backdrop-filter: blur(16px);
  padding: 1.75rem;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.glass-card:hover {
  border-color: rgba(52, 94, 239, 0.18);
}
.panel-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.panel-title .accent { color: #7c9bff; }
.panel-title.danger { color: #EF4444; }
.panel-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 1rem;
}
.panel-desc {
  color: rgba(255,255,255,0.4);
  font-size: 0.875rem;
  margin: -0.75rem 0 1.25rem;
}

/* Overview */
.overview-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}
.signin {
  background: #22C55E;
  color: #fff;
  padding: 0.55rem 1rem;
  border-radius: 0.65rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.signin:hover { background: #16A34A; }
.signin-available { animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.02); } }
.overview-body {
  display: flex;
  gap: 1.75rem;
  align-items: flex-start;
}
.avatar-wrap { position: relative; flex-shrink: 0; }
.avatar-large {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #345eef;
}
.level-ring {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #345eef;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  border: 2px solid rgba(10, 11, 16, 0.8);
}
.overview-info { flex: 1; display: flex; flex-direction: column; gap: 0.75rem; }
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.info-label { color: rgba(255,255,255,0.4); font-size: 0.875rem; }
.info-value { color: #fff; font-weight: 500; }
.info-value.name { font-size: 1.1rem; font-weight: 700; }
.info-value.bio { color: rgba(255,255,255,0.6); font-style: italic; }
.badges-row { display: flex; gap: 0.6rem; flex-wrap: wrap; padding-top: 0.25rem; }
.badge { padding: 0.3rem 0.8rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.badge-fcl { background: rgba(52, 94, 239, 0.15); color: #7c9bff; }
.badge-microsoft { background: rgba(0,120,212,0.15); color: #5eb5ff; }
.badge-active { background: rgba(34,197,94,0.15); color: #4ade80; }
.badge-frozen { background: rgba(245,158,11,0.15); color: #fbbf24; }
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
}
.stat-box {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.75rem;
  padding: 0.85rem;
  text-align: center;
}
.stat-label { display: block; color: rgba(255,255,255,0.4); font-size: 0.75rem; margin-bottom: 0.25rem; }
.stat-value { display: block; color: #fff; font-size: 1.1rem; font-weight: 700; }

/* Activity */
.activity-list { display: flex; flex-direction: column; gap: 0.75rem; }
.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255,255,255,0.55);
  font-size: 0.875rem;
}
.activity-item i { color: #7c9bff; font-size: 0.9rem; }

/* Forms */
.profile-form,
.security-form { display: flex; flex-direction: column; gap: 1.1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-label { font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.55); }
.input-wrap { position: relative; }
.input-wrap .form-input { padding-left: 2.75rem; width: 100%; }
.input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.25);
  font-size: 0.875rem;
  pointer-events: none;
}
.form-hint { font-size: 0.75rem; color: rgba(255,255,255,0.35); margin: 0.25rem 0 0; }
.avatar-row { display: flex; align-items: center; gap: 1rem; }
.avatar-medium {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(52, 94, 239, 0.4);
}
.save-btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 24px -8px rgba(52, 94, 239, 0.55);
}

/* Danger */
.danger-list { display: flex; flex-direction: column; gap: 1rem; }
.danger-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem;
  border-radius: 0.85rem;
  background: rgba(239,68,68,0.05);
  border: 1px solid rgba(239,68,68,0.2);
}
.danger-item.strong { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.3); }
.danger-icon {
  width: 44px;
  height: 44px;
  border-radius: 0.75rem;
  background: rgba(239,68,68,0.12);
  color: #EF4444;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.danger-content { flex: 1; min-width: 0; }
.danger-content h3 { margin: 0 0 0.25rem; font-size: 1rem; color: #fff; font-weight: 600; }
.danger-content p { margin: 0; font-size: 0.85rem; color: rgba(255,255,255,0.45); }
.btn-danger {
  background: rgba(239,68,68,0.1);
  color: #EF4444;
  border: 1px solid rgba(239,68,68,0.3);
  padding: 0.55rem 1rem;
  border-radius: 0.65rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.btn-danger:hover { background: rgba(239,68,68,0.2); }
.btn-danger.strong { background: rgba(239,68,68,0.2); }

/* Scroll reveal */
.reveal {
  opacity: 0;
  transform: translateY(-28px) scale(1.02);
  transition: opacity 0.8s cubic-bezier(0.22, 0.61, 0.36, 1),
              transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.reveal.in { opacity: 1; transform: none; }
.reveal.no-anim { transition: none !important; }
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1 !important; transform: none !important; }
}

/* Responsive */
@media (max-width: 900px) {
  .dash-layout { grid-template-columns: 1fr; }
  .dash-side { position: static; }
  .dash-nav { flex-direction: row; overflow-x: auto; padding: 0.5rem; }
  .dash-nav-item { white-space: nowrap; }
  .overview-body { flex-direction: column; align-items: center; text-align: center; }
  .overview-info { width: 100%; }
  .info-row { flex-direction: column; gap: 0.25rem; align-items: flex-start; }
  .stats-row { grid-template-columns: repeat(3, 1fr); }
  .danger-item { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
}
@media (max-width: 480px) {
  .stats-row { grid-template-columns: 1fr; }
  .overview-head { flex-direction: column; align-items: flex-start; }
  .save-btn { align-self: stretch; }
}
</style>

<style>
/* Light mode overrides */
html[data-theme="light"] .dash-root {
  color: #1a1a1a;
  background: #eef1f6;
}
html[data-theme="light"] .dash-glow {
  background:
    radial-gradient(ellipse at 12% 12%, rgba(52, 94, 239, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 88% 85%, rgba(34, 197, 94, 0.04) 0%, transparent 45%);
}
html[data-theme="light"] .title,
html[data-theme="light"] .panel-title,
html[data-theme="light"] .info-value,
html[data-theme="light"] .stat-value,
html[data-theme="light"] .danger-content h3 { color: #1a1a1a !important; }
html[data-theme="light"] .subtitle,
html[data-theme="light"] .panel-desc,
html[data-theme="light"] .info-label,
html[data-theme="light"] .stat-label,
html[data-theme="light"] .form-label,
html[data-theme="light"] .form-hint,
html[data-theme="light"] .activity-item,
html[data-theme="light"] .danger-content p,
html[data-theme="light"] .info-value.bio { color: #6b7280 !important; }
html[data-theme="light"] .glass-card,
html[data-theme="light"] .kicker,
html[data-theme="light"] .stat-box,
html[data-theme="light"] .danger-item { background: rgba(255, 255, 255, 0.92) !important; border-color: rgba(0, 0, 0, 0.1) !important; }
html[data-theme="light"] .kicker { color: #345eef !important; }
html[data-theme="light"] .dash-nav-item { color: #4b5563; }
html[data-theme="light"] .dash-nav-item:hover { background: rgba(0, 0, 0, 0.05); color: #1a1a1a; }
html[data-theme="light"] .dash-nav-item.active { background: rgba(52, 94, 239, 0.1); border-left-color: #345eef; color: #345eef; }
html[data-theme="light"] .info-row { border-bottom-color: rgba(0, 0, 0, 0.08); }
html[data-theme="light"] .activity-item i { color: #345eef; }
html[data-theme="light"] .level-ring { border-color: #eef1f6; }
</style>
