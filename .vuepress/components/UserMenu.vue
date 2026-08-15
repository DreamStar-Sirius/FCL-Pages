<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useToast, initSupabase, getRoleDisplay } from '../utils/fcl-shared.js'

const { toasts, showToast } = useToast()
const loggedIn = ref(false)
const open = ref(false)
const loading = ref(true)
const user = reactive({
  id: null,
  username: '',
  email: '',
  avatar_url: '/images/default.jpg',
  points: 0,
  level: 1,
  role: 'user'
})

let sb = null
let rootEl = null

const roleInfo = () => getRoleDisplay(user.role)

function setUser(info) {
  user.id = info.id
  user.username = info.username || '用户'
  user.email = info.email || '-'
  user.avatar_url = info.avatar_url || '/images/default.jpg'
  user.points = info.points || 0
  user.level = info.level || 1
  user.role = info.role || 'user'
}

async function updateNavUI() {
  if (!sb) return
  try {
    const { data } = await sb.auth.getSession()
    if (data && data.session) {
      loggedIn.value = true
      const u = data.session.user
      let avatarUrl = (u.user_metadata && u.user_metadata.avatar_url) || '/images/default.jpg'
      let username = (u.user_metadata && u.user_metadata.username) || (u.email ? u.email.split('@')[0] : '用户')
      let points = 0, level = 1, role = 'user'
      try {
        const { data: p } = await sb.from('profiles')
          .select('avatar_url, username, points, level, role')
          .eq('id', u.id).maybeSingle()
        if (p) {
          if (p.avatar_url) avatarUrl = p.avatar_url
          if (p.username) username = p.username
          if (p.points !== undefined) points = p.points
          if (p.level !== undefined) level = p.level
          if (p.role) role = p.role
        }
      } catch (e) { /* profile 可能不存在 */ }
      const info = { id: u.id, username, email: u.email, avatar_url: avatarUrl, points, level, role, updated_at: Date.now() }
      setUser(info)
      if (window.CookieUtil) window.CookieUtil.saveUserInfo(info)
    } else {
      const c = window.CookieUtil && window.CookieUtil.getUserInfo ? window.CookieUtil.getUserInfo() : null
      if (c && c.id) { loggedIn.value = true; setUser(c) }
      else { loggedIn.value = false; open.value = false; if (window.CookieUtil) window.CookieUtil.clearUserInfo() }
    }
  } catch (e) {
    console.error('更新导航栏失败:', e)
  } finally {
    loading.value = false
  }
}

function toggle() {
  if (!loggedIn.value) return
  open.value = !open.value
}

function onClickOutside(e) {
  // 动态获取：未登录时 #fcl-user-menu 不存在，登录后（含通过事件切换）才渲染出来
  if (!rootEl || !rootEl.isConnected) rootEl = document.getElementById('fcl-user-menu')
  if (rootEl && !rootEl.contains(e.target)) open.value = false
}

// 同页其他组件（控制台）更新资料后，立即用最新数据刷新右上角，不必刷新页面
function onUserUpdated(e) {
  const info = e && e.detail
  if (info && info.id) {
    loading.value = false
    loggedIn.value = true
    setUser(info)
  } else if (sb) {
    updateNavUI()
  }
}

async function logout() {
  if (!sb) return
  open.value = false
  const { error } = await sb.auth.signOut()
  if (error) { showToast(error.message, 'error'); return }
  if (window.CookieUtil) window.CookieUtil.clearUserInfo()
  loggedIn.value = false
  showToast('已退出登录', 'success')
  setTimeout(() => { window.location.href = '/' }, 600)
}

onMounted(async () => {
  // 先注册监听：初始化 Supabase 可能重试数秒，若放在后面会漏掉这期间派发的
  // fcl-user-updated 事件（曾导致"头像上传后右上角不刷新"）。
  window.addEventListener('fcl-user-updated', onUserUpdated)
  document.addEventListener('click', onClickOutside)

  // 重试若干次：等待 Supabase 脚本就绪 + 拉取会话，避免“一直加载”或“加载失败”。
  let tries = 0
  while (tries < 4) {
    try {
      sb = await initSupabase()
      await updateNavUI()
      break
    } catch (e) {
      tries++
      console.error('导航栏初始化失败，准备重试 (' + tries + ')', e)
      if (tries >= 4) {
        // 优雅降级：不再无限转圈，直接显示登录/注册入口
        loading.value = false
        loggedIn.value = false
        open.value = false
      } else {
        await new Promise((r) => setTimeout(r, 600))
      }
    }
  }
  if (sb && sb.auth && sb.auth.onAuthStateChange) {
    sb.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') { if (window.CookieUtil) window.CookieUtil.clearUserInfo() }
      updateNavUI()
    })
  }
  rootEl = document.getElementById('fcl-user-menu')
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  window.removeEventListener('fcl-user-updated', onUserUpdated)
})
</script>

<template>
  <div class="fcl-nav-auth">
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="'toast-' + t.type">{{ t.message }}</div>
    </div>

    <template v-if="loading">
      <span class="nav-loading"><span class="spinner"></span></span>
    </template>

    <template v-else-if="!loggedIn">
      <a href="/login.html" class="btn-primary nav-btn">登录</a>
      <a href="/register.html" class="btn-secondary nav-btn">注册</a>
    </template>

    <template v-else>
      <div class="user-menu" id="fcl-user-menu" @click="toggle">
        <div class="user-trigger">
          <img class="avatar" :src="user.avatar_url" alt="Avatar">
          <span class="user-name-wrapper">
            <span class="user-name">{{ user.username }}</span>
            <img v-if="user.role === 'admin'" class="admin-icon" src="/images/admin.png" alt="Admin">
          </span>
          <i class="fa-solid fa-chevron-down caret"></i>
        </div>

        <div class="user-dropdown" :class="{ show: open }" @click.stop>
          <div class="user-dropdown-header">
            <div class="flex gap">
              <img class="avatar" style="width:40px;height:40px;" :src="user.avatar_url" alt="Avatar">
              <div>
                <div class="user-name-wrapper">
                  <span class="user-name font-semibold">{{ user.username }}</span>
                  <img v-if="user.role === 'admin'" class="admin-icon" src="/images/admin.png" alt="Admin">
                </div>
                <div class="dropdown-email">{{ user.email }}</div>
              </div>
            </div>
            <div class="meta-row">
              <span><i class="fa-solid fa-coins"></i> {{ user.points }} 积分</span>
              <span><i class="fa-solid fa-chart-simple"></i> Lv.{{ user.level }}</span>
            </div>
            <span class="badge-role" :class="roleInfo().cls">{{ roleInfo().text }}</span>
          </div>
          <a href="/dashboard.html" class="user-dropdown-item">
            <i class="fa-solid fa-tachometer-alt w-5"></i><span>进入仪表盘</span>
          </a>
          <button class="user-dropdown-item logout" @click="logout">
            <i class="fa-solid fa-right-from-bracket w-5"></i><span>退出登录</span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.fcl-nav-auth { display: flex; align-items: center; gap: 0.5rem; }
.nav-btn { padding: 0.4rem 1rem; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 600; text-decoration: none; }
.nav-loading { display: inline-flex; padding: 0 0.5rem; }

.user-menu { position: relative; cursor: pointer; }
.user-trigger { display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.6rem; border-radius: 2rem; transition: all 0.2s; }
.user-trigger:hover { background: rgba(255,255,255,0.06); }
.caret { font-size: 0.65rem; color: rgba(255,255,255,0.4); transition: transform 0.2s; }
.user-menu .user-dropdown.show .caret,
.user-menu .show ~ .caret { transform: rotate(180deg); }

.user-dropdown {
  position: absolute; top: 100%; right: 0; margin-top: 0.5rem;
  background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.75rem; min-width: 230px;
  opacity: 0; visibility: hidden; transform: translateY(-6px); transition: all 0.18s ease;
  z-index: 200; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);
}
.user-dropdown.show { opacity: 1; visibility: visible; transform: translateY(0); }

.user-dropdown-header { padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
.flex.gap { display: flex; align-items: center; gap: 0.75rem; }
.dropdown-email { font-size: 0.75rem; color: rgba(255,255,255,0.4); }
.meta-row { display: flex; justify-content: space-between; margin-top: 0.6rem; padding-top: 0.6rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.8rem; color: #fff; }
.meta-row i { color: #345eef; margin-right: 0.3rem; }
.user-dropdown-header .badge-role { margin-top: 0.6rem; display: inline-block; }

.user-dropdown-item { display: flex; align-items: center; gap: 0.6rem; width: 100%; padding: 0.7rem 1rem; color: rgba(255,255,255,0.7); text-decoration: none; background: transparent; border: none; font-size: 0.85rem; text-align: left; transition: all 0.2s; }
.user-dropdown-item:hover { background: rgba(52, 94, 239,0.1); color: #345eef; cursor: pointer; }
.user-dropdown-item .w-5 { width: 1.25rem; text-align: center; }
.logout:hover { color: #EF4444; }

/* 浅色模式 */
:global(html[data-theme="light"]) .nav-btn.btn-secondary { background: #F3F4F6; color: #374151; border: 1px solid #D1D5DB; }
:global(html[data-theme="light"]) .user-dropdown { background: #fff; border-color: rgba(0,0,0,0.1); }
:global(html[data-theme="light"]) .user-dropdown-header { border-color: rgba(0,0,0,0.1); }
:global(html[data-theme="light"]) .meta-row { border-color: rgba(0,0,0,0.1); color: #1A1A1A; }
:global(html[data-theme="light"]) .dropdown-email { color: #666; }
:global(html[data-theme="light"]) .user-dropdown-item { color: #4B5563; }
:global(html[data-theme="light"]) .user-dropdown-item:hover { background: rgba(52, 94, 239,0.1); color: #345eef; }
</style>
