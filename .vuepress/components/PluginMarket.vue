<script setup>
import { ref, onMounted } from 'vue'

// 插件市场示例数据（后续可由后端/配置文件驱动）
const plugins = ref([
  { name: 'OptiFine 优化包', icon: 'fa-solid fa-wand-magic-sparkles', desc: '提升渲染性能与画质的内置优化方案，让低配机也能流畅运行。', version: 'v1.2.0', tag: '官方推荐', url: '' },
  { name: '材质整合工具', icon: 'fa-solid fa-palette', desc: '一键切换与管理你的游戏材质包，实时预览效果。', version: 'v0.9.1', tag: '社区', url: '' },
  { name: '联机桥接', icon: 'fa-solid fa-network-wired', desc: '快速搭建本地或异地联机环境，和朋友一起冒险。', version: 'v2.0.3', tag: '热门', url: '' },
  { name: '启动加速', icon: 'fa-solid fa-bolt', desc: '预加载与缓存策略，显著缩短游戏冷启动时间。', version: 'v1.1.4', tag: '官方', url: '' },
  { name: '皮肤工坊', icon: 'fa-solid fa-user-astronaut', desc: '导入、编辑并预览你的角色皮肤，支持实时渲染。', version: 'v1.0.0', tag: '社区', url: '' },
  { name: '日志分析', icon: 'fa-solid fa-magnifying-glass-chart', desc: '自动解析崩溃日志并给出可行的修复建议。', version: 'v0.5.2', tag: '实用', url: '' },
])

function open(url) { if (url) window.open(url, '_blank') }

// 卡片错落揭示（双向：上下滚动都会重播）。
// 重置在元素完全离开视口后瞬时无过渡完成，避免可见的反向动画。
onMounted(() => {
  const cards = document.querySelectorAll('.plugin-market .pm-card')
  if (!cards.length) return
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!('IntersectionObserver' in window) || reduceMotion) {
    cards.forEach((c) => c.classList.add('in'))
    return
  }
  cards.forEach((c, i) => {
    c.style.transitionDelay = (i % 3) * 0.1 + 's'
  })

  // 单观察器处理入场/离场；离场时瞬时无过渡隐藏，避免倒放。
  // 入场方向统一为「从上方下沉」（CSS 默认即为该起点偏移），不区分滚动方向。
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const el = e.target
      if (e.isIntersecting) {
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

  cards.forEach((c) => io.observe(c))
})
</script>

<template>
  <div class="plugin-market">
    <section class="pm-hero">
      <span class="pm-eyebrow"><i class="fa-solid fa-puzzle-piece"></i> PLUGIN MARKET</span>
      <h1 class="pm-title">插件市场</h1>
      <p class="pm-sub">扩展你的 Minecraft 体验。精选插件与整合包，安装即用，安全可信。</p>
    </section>
    <section class="pm-grid">
      <div class="pm-card reveal" v-for="(p, i) in plugins" :key="i">
        <div class="pm-card-head">
          <i :class="p.icon"></i>
          <span class="pm-tag" :class="'tag-' + (i % 3)">{{ p.tag }}</span>
        </div>
        <h3 class="pm-name">{{ p.name }}</h3>
        <p class="pm-desc">{{ p.desc }}</p>
        <div class="pm-foot">
          <span class="pm-ver">{{ p.version }}</span>
          <button class="pm-btn" @click="open(p.url)"><i class="fa-solid fa-download"></i> 获取</button>
        </div>
      </div>
    </section>
    <p class="pm-note">更多插件持续上架中。如有优质插件想入驻，欢迎通过页眉“反馈”联系我们。</p>
  </div>
</template>

<style scoped>
.plugin-market { max-width: 1200px; margin: 0 auto; padding: 4rem 1.5rem 5rem; color: #E6E8EC; }
.pm-hero { text-align: center; margin-bottom: 3rem; }
.pm-eyebrow { display: inline-flex; align-items: center; gap: .5rem; font-size: .8rem; font-weight: 600; letter-spacing: .08em; color: #7c9cff; background: rgba(52, 94, 239, .12); border: 1px solid rgba(52, 94, 239, .3); padding: .4rem .9rem; border-radius: 9999px; }
.pm-title { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; margin: 1rem 0 .5rem; background: linear-gradient(135deg, #fff 30%, #9db4ff 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pm-sub { color: #9ca3af; font-size: 1.05rem; max-width: 40rem; margin: 0 auto; }
.pm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
.pm-card { background: rgba(255, 255, 255, .04); border: 1px solid rgba(255, 255, 255, .08); border-radius: 1rem; padding: 1.5rem; transition: all .2s; }
.pm-card:hover { border-color: rgba(52, 94, 239, .5); transform: translateY(-3px); background: rgba(52, 94, 239, .06); }
.pm-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.pm-card-head > i { font-size: 1.6rem; color: #7c9cff; }
.pm-tag { font-size: .7rem; padding: .2rem .6rem; border-radius: 9999px; background: rgba(255, 255, 255, .1); color: #cbd5e1; }
.tag-0 { background: rgba(52, 94, 239, .15); color: #9db4ff; }
.tag-1 { background: rgba(34, 197, 94, .15); color: #86efac; }
.tag-2 { background: rgba(245, 158, 11, .15); color: #fcd34d; }
.pm-name { margin: 0 0 .4rem; color: #fff; font-size: 1.15rem; }
.pm-desc { margin: 0 0 1.2rem; color: #9ca3af; font-size: .9rem; line-height: 1.6; min-height: 2.8em; }
.pm-foot { display: flex; align-items: center; justify-content: space-between; }
.pm-ver { font-size: .8rem; color: #6b7280; }
.pm-btn { display: inline-flex; align-items: center; gap: .4rem; padding: .5rem .9rem; border-radius: .6rem; background: #345eef; color: #fff; border: none; font-size: .85rem; font-weight: 600; cursor: pointer; transition: all .2s; }
.pm-btn:hover { background: #274bbd; }
.pm-note { text-align: center; color: #6b7280; font-size: .85rem; margin-top: 2.5rem; }
/* 卡片错落揭示动画（双向：向下滚从下方入，向上滚从上方入） */
/* 统一「淡入下沉」起点：从上方下沉到原位，不区分滚动方向 */
.pm-card.reveal { opacity: 0; transform: translateY(-28px) scale(1.03); transition: opacity .6s ease, transform .6s cubic-bezier(.22,.61,.36,1), border-color .2s, background .2s; }
.pm-card.reveal.in { opacity: 1; transform: none; }
.pm-card.reveal.no-anim { transition: none !important; }
@media (prefers-reduced-motion: reduce) { .pm-card.reveal { opacity: 1 !important; transform: none !important; } }
@media (max-width: 900px) { .pm-grid { grid-template-columns: 1fr; } }
</style>

<style>
/* 浅色模式：放在非 scoped 全局块，避免 scoped + :global 在构建时被丢弃或优先级丢失。
   pm-* 均为本组件自定义类，plume 不会覆盖，故 !important 安全且必赢。 */
html[data-theme="light"] .plugin-market { color: #1a1a1a !important; }
/* 顶部 eyebrow 与标题保持深蓝（保留渐变） */
html[data-theme="light"] .pm-eyebrow { color: #274bbd !important; border-color: rgba(52,94,239,.4) !important; background: rgba(52,94,239,.1) !important; }
html[data-theme="light"] .pm-title { background: linear-gradient(135deg, #274bbd 25%, #345eef 100%) !important; -webkit-background-clip: text; background-clip: text; color: transparent !important; }
/* 其余文字统一为黑色（按钮内的文字除外） */
html[data-theme="light"] .pm-sub,
html[data-theme="light"] .pm-desc,
html[data-theme="light"] .pm-ver,
html[data-theme="light"] .pm-note { color: #1a1a1a !important; }
html[data-theme="light"] .pm-name { color: #1a1a1a !important; }
html[data-theme="light"] .pm-tag { color: #1a1a1a !important; }
html[data-theme="light"] .pm-card-head > i { color: #345eef !important; }
html[data-theme="light"] .pm-card { background: #fff !important; border-color: rgba(0, 0, 0, .1) !important; }
html[data-theme="light"] .pm-card:hover { background: rgba(52, 94, 239, .05) !important; border-color: rgba(52, 94, 239, .4) !important; }
</style>
