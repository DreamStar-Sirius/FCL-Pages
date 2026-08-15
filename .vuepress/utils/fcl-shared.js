// .vuepress/utils/fcl-shared.js
// 全局共享工具：Toast、角色显示、Supabase 客户端、图片压缩
// 注意：此文件位于 .vuepress/utils，不会被 components 目录自动注册为组件。
import { ref } from 'vue'

export function useToast() {
  const toasts = ref([])
  let seq = 0
  function showToast(message, type = 'info') {
    const item = { id: ++seq, message, type }
    toasts.value.push(item)
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== item.id)
    }, 3000)
    return item
  }
  return { toasts, showToast }
}

export function getRoleDisplay(role) {
  if (role === 'admin') return { text: '管理员', cls: 'admin' }
  if (role === 'tester') return { text: 'FCL认证内测员', cls: 'tester' }
  return { text: '普通用户', cls: '' }
}

// 等待 window.CONFIG 就绪（config.js 异步加载）
export function waitForConfig(interval = 100) {
  return new Promise((resolve) => {
    if (window.CONFIG && window.CONFIG.SUPABASE_URL) return resolve(window.CONFIG)
    const timer = setInterval(() => {
      if (window.CONFIG && window.CONFIG.SUPABASE_URL) {
        clearInterval(timer)
        resolve(window.CONFIG)
      }
    }, interval)
  })
}

// 等待 Supabase UMD 脚本（通过 CDN 异步加载）真正就绪。
// 仅当 window.supabase.createClient 是一个函数时才认为可用，
// 避免“脚本还没下载完就调用 createClient 导致 sb 为 null / 抛错”的竞态。
export function waitForSupabase(interval = 120, timeout = 8000) {
  return new Promise((resolve) => {
    const start = Date.now()
    const tick = () => {
      if (window.supabase && typeof window.supabase.createClient === 'function') return resolve(true)
      if (Date.now() - start > timeout) return resolve(false)
      setTimeout(tick, interval)
    }
    tick()
  })
}

// 统一的初始化入口：先等 CONFIG，再等 Supabase 脚本，最后创建（单例）客户端。
// 用法：const sb = await initSupabase()
// 这能彻底消除“配置加载中 / 用户信息一直加载 / 刷新后被踢回登录页”三类问题。
export async function initSupabase() {
  await waitForConfig()
  const ok = await waitForSupabase()
  if (!ok) throw new Error('Supabase 客户端脚本未加载（可能是 CDN 被拦截或网络异常）')
  if (!_sb) {
    _sb = window.supabase.createClient(
      window.CONFIG.SUPABASE_URL,
      window.CONFIG.SUPABASE_ANON_KEY
    )
  }
  return _sb
}

// 单例：所有组件共享同一个 Supabase 客户端，避免同页面多实例导致的
// "Multiple GoTrueClient instances" 警告与 session 不同步问题。
let _sb = null
export function createSupabase() {
  if (!_sb) {
    _sb = window.supabase.createClient(
      window.CONFIG.SUPABASE_URL,
      window.CONFIG.SUPABASE_ANON_KEY
    )
  }
  return _sb
}

// 存储状态文案（登录/注册页右侧卡片）
export function getStorageMessage(percent) {
  if (percent >= 100) {
    return { icon: 'fa-solid fa-skull', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', text: '💀 数据库已撑爆！管理员正在用脚踩服务器，建议你去泡杯咖啡等扩容。', progressColor: '#EF4444' }
  }
  if (percent >= 95) {
    return { icon: 'fa-solid fa-triangle-exclamation', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', text: '🚨 距离数据库爆炸还有 5%！快给管理员烧柱香，或者……少传点自拍？', progressColor: '#EF4444' }
  }
  if (percent >= 90) {
    return { icon: 'fa-solid fa-bell', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', text: '⚠️ 存储快满了（90%+）！建议清理一下垃圾文件，不然下次登录要排队了。', progressColor: '#F59E0B' }
  }
  if (percent >= 80) {
    return { icon: 'fa-solid fa-circle-exclamation', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', text: '😅 数据库有点挤（80%+），就像早高峰的地铁。建议佛系登录，别太猛。', progressColor: '#F59E0B' }
  }
  if (percent >= 50) {
    return { icon: 'fa-solid fa-hourglass-half', color: '#22C55E', bg: 'rgba(34,197,94,0.08)', text: '🤔 存储用了过半（50%+），还算健康，但别高兴太早，未来还长。', progressColor: '#22C55E' }
  }
  return { icon: 'fa-solid fa-face-smile', color: '#22C55E', bg: 'rgba(34,197,94,0.08)', text: '😎 存储空间充足（<50%），随便登录！这点数据连热身都算不上。', progressColor: '#22C55E' }
}

// 图片压缩为 WebP（≤ targetSizeKB）
// displaySize：图片在网页上的实际显示边长(px)。源图取显示尺寸 ×2（适配视网膜屏），
// 并限制在 64~320px，既保证网页显示清晰，又尽量减小在 Supabase 上的存储占用。
export function compressImage(file, targetSizeKB = 50, displaySize = 128) {
  return new Promise((resolve, reject) => {
    if (file.size > 10 * 1024 * 1024) { reject(new Error('原始图片不能超过 10MB')); return }
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
    if (!allowed.includes(file.type)) { reject(new Error('不支持的图片格式')); return }

    const side = Math.max(64, Math.min(320, Math.round(displaySize * 2)))
    const maxWidth = side
    const maxHeight = side

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function (e) {
      const img = new Image()
      img.src = e.target.result
      img.onload = function () {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        let width = img.width, height = img.height
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        canvas.width = width
        canvas.height = height
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        let quality = 0.85
        let attempts = 0
        const maxAttempts = 20

        function tryCompress() {
          attempts++
          if (attempts > maxAttempts) { canvas.toBlob((b) => resolve(b), 'image/webp', 0.1); return }
          if (quality < 0.1) {
            if (width > 80 || height > 80) {
              canvas.width = Math.round(width / 1.3)
              canvas.height = Math.round(height / 1.3)
              ctx.imageSmoothingEnabled = true
              ctx.imageSmoothingQuality = 'high'
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
              quality = 0.7
              tryCompress()
              return
            }
            canvas.toBlob((b) => resolve(b), 'image/webp', 0.1)
            return
          }
          canvas.toBlob((b) => {
            if (!b) { reject(new Error('压缩失败')); return }
            const sizeKB = b.size / 1024
            if (sizeKB <= targetSizeKB) { resolve(b); return }
            const ratio = targetSizeKB / sizeKB
            quality = quality * Math.max(ratio, 0.5)
            quality = Math.max(quality, 0.1)
            tryCompress()
          }, 'image/webp', quality)
        }
        tryCompress()
      }
      img.onerror = function () { reject(new Error('图片加载失败')) }
    }
    reader.onerror = function () { reject(new Error('文件读取失败')) }
  })
}
