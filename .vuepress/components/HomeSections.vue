<template>
  <div class="fcl-home-root">
    <!-- ============ Hero ============ -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="hero-grid"></div>
      <div class="hero-inner">
        <!-- 左侧：标题与操作 -->
        <div class="hero-left">
          <span class="hero-kicker hero-anim" style="--hd:0s"><i class="fa-solid fa-fire"></i> FOR MINECRAFT PLAYERS</span>
          <h1 class="hero-title">Furnace Craft Launcher</h1>
          <p class="hero-subtitle hero-anim" style="--hd:.24s">你的全能 Minecraft 启动器 —— 一键部署、智能优化、安全畅玩，把热爱写进每一个像素。</p>
          <div class="hero-actions hero-anim" style="--hd:.36s">
            <button class="btn-primary" @click="download">
              <i class="fa-solid fa-download"></i> 立即下载
            </button>
            <a class="btn-ghost" href="/docs/"><i class="fa-solid fa-book"></i> 阅读文档</a>
            <a class="btn-ghost" :href="github" target="_blank" rel="noopener">
              <i class="fa-brands fa-github"></i> GitHub
            </a>
          </div>
          <div class="hero-platforms hero-anim" style="--hd:.48s">
            <span class="platforms-label">支持平台</span>
            <i class="fa-brands fa-windows" title="Windows"></i>
            <span class="platforms-note">Windows</span>
          </div>
        </div>

        <!-- 右侧：漂浮特性胶囊（错落有致） -->
        <div class="hero-right">
          <div class="float-pills hero-anim" style="--hd:.3s">
            <span class="pill" style="--d:0s; --x:0px; --y:34px; --r:-2deg"><i class="fa-solid fa-rocket"></i> 一键部署</span>
            <span class="pill" style="--d:1.2s; --x:46px; --y:0; --r:1.5deg"><i class="fa-solid fa-bolt"></i> 智能优化</span>
            <span class="pill" style="--d:0.6s; --x:0; --y:14px; --r:-1deg"><i class="fa-solid fa-shield-halved"></i> 安全登录</span>
            <span class="pill" style="--d:1.8s; --x:58px; --y:0; --r:2deg"><i class="fa-solid fa-palette"></i> 皮肤渲染</span>
            <span class="pill" style="--d:0.9s; --x:0; --y:40px; --r:-1.5deg"><i class="fa-solid fa-earth-asia"></i> 全球加速</span>
            <span class="pill" style="--d:2.1s; --x:26px; --y:0; --r:1deg"><i class="fa-solid fa-code-branch"></i> 开源免费</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 公告 / 特别注意 ============ -->
    <section class="band reveal">
      <div class="glass-card notice-warn">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p><strong>特别注意：</strong>本启动器与 Fold Craft Launcher<strong>无任何关联</strong>，请勿混淆。Furnace Craft Launcher（FCL）是我们独立维护的全新项目。</p>
      </div>
      <details class="glass-card update-log">
        <summary><i class="fa-solid fa-bullhorn"></i> 最新公告 / 更新日志</summary>
        <ul>
          <li><span class="dot"></span> 全新下载与安装引导已上线，支持一键获取最新版本。</li>
          <li><span class="dot"></span> 用户控制台支持头像、角色标识与个性化设置。</li>
          <li><span class="dot"></span> 社区反馈通道开放，欢迎提交建议与 Bug 报告。</li>
        </ul>
      </details>
    </section>

    <!-- ============ 功能区块 1：极速启动与管理 ============ -->
    <section class="feature-row reveal">
      <div class="feature-text">
        <span class="block-kicker">极速启动</span>
        <h2 class="section-title">极速启动与管理</h2>
        <p class="feature-desc">告别繁琐的手动配置，用可视化界面轻松掌控一切，小白也能快速上手。</p>
        <ul class="feature-points">
          <li><i class="fa-solid fa-rocket accent"></i><div><h3>一键部署</h3><p>向导式引导，几分钟即可完成安装与首个版本的启动。</p></div></li>
          <li><i class="fa-solid fa-wand-magic-sparkles accent"></i><div><h3>智能优化</h3><p>自动适配运行参数与内存分配，流畅运行不卡顿。</p></div></li>
          <li><i class="fa-solid fa-gauge-high accent"></i><div><h3>全球加速</h3><p>内置高速镜像与下载通道，秒速获取游戏资源。</p></div></li>
        </ul>
      </div>
      <div class="feature-visual">
        <div class="ui-mock">
          <div class="ui-top"><span class="ui-dot"></span><span class="ui-dot"></span><span class="ui-dot"></span><span class="ui-title">FCL</span></div>
          <div class="ui-body">
            <div class="ui-side">
              <i class="fa-solid fa-house"></i><i class="fa-solid fa-cube"></i>
              <i class="fa-solid fa-user"></i><i class="fa-solid fa-gear"></i>
            </div>
            <div class="ui-main">
              <div class="ui-card"><span class="ui-chip">运行中</span><div class="ui-bar"></div></div>
              <div class="ui-card sm"><div class="ui-bar short"></div></div>
              <div class="ui-card sm"><div class="ui-bar short"></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 功能区块 2：安全与个性化 ============ -->
    <section class="feature-row reverse reveal">
      <div class="feature-visual">
        <div class="ui-mock alt">
          <div class="ui-top"><span class="ui-dot"></span><span class="ui-dot"></span><span class="ui-dot"></span><span class="ui-title">账户</span></div>
          <div class="ui-body center">
            <div class="ui-avatar"><i class="fa-solid fa-user"></i></div>
            <div class="ui-card full"><div class="ui-bar"></div></div>
            <div class="ui-card full"><div class="ui-bar short"></div></div>
            <div class="ui-badges"><span class="ui-badge">皮肤</span><span class="ui-badge">个性</span><span class="ui-badge">云端</span></div>
          </div>
        </div>
      </div>
      <div class="feature-text">
        <span class="block-kicker">安全与个性化</span>
        <h2 class="section-title">安全与个性化</h2>
        <p class="feature-desc">把账户交给我们守护，把风格交给你自己，打造专属于你的启动器。</p>
        <ul class="feature-points">
          <li><i class="fa-solid fa-shield-halved accent"></i><div><h3>安全登录</h3><p>账号数据加密存储，登录态跨页面保持稳定可靠。</p></div></li>
          <li><i class="fa-solid fa-palette accent"></i><div><h3>皮肤渲染</h3><p>支持自定义皮肤与外观，界面随心切换。</p></div></li>
          <li><i class="fa-solid fa-sliders accent"></i><div><h3>个性化设置</h3><p>头像、角色标识、主题随心配置，彰显你的风格。</p></div></li>
        </ul>
      </div>
    </section>

    <!-- ============ 开发者团队（MSLTeam 同款） ============ -->
    <section class="dev-team reveal">
      <h2 class="section-title center">✨ FCL Team</h2>
      <p class="block-sub center">由一位热爱 Minecraft 的开发者打造！</p>

      <div class="dev-grid">
        <div class="dev-card glass-card">
          <img class="dev-avatar" src="/img/devs/cat-yuna.jpeg" alt="猫羽雫 头像" />
          <div class="dev-info">
            <h3 class="dev-name">猫羽雫</h3>
            <span class="dev-role">FCL 开发者 / 前端 / 设计</span>
            <p class="dev-quote">“Furnace Craft Launcher 作者 · 用代码点亮方块世界 ”</p>
          </div>
        </div>
      </div>

      <p class="dev-thanks">✨ 感谢以下贡献者对项目的付出（暂时没有）</p>
    </section>

    <!-- ============ FAQ ============ -->
    <section class="faq reveal">
      <h2 class="section-title center">解答您的顾虑</h2>
      <div class="faq-list">
        <details class="faq-item"><summary>FCL 支持哪些系统平台？<i class="fa-solid fa-chevron-down"></i></summary><p>目前主要支持 Windows 平台（基于 WinUI3 打造），更多平台的适配正在计划中，敬请期待。</p></details>
        <details class="faq-item"><summary>FCL 是开源的吗？<i class="fa-solid fa-chevron-down"></i></summary><p>是的，FCL 完全开源，代码托管于 GitHub，欢迎大家提交 Issue、PR 与功能建议。</p></details>
        <details class="faq-item"><summary>如何下载与安装？<i class="fa-solid fa-chevron-down"></i></summary><p>前往 GitHub Releases 下载最新安装包，按提示完成安装即可开始使用。</p></details>
        <details class="faq-item"><summary>FCL 与 Fold Craft Launcher 有关系吗？<i class="fa-solid fa-chevron-down"></i></summary><p>没有任何关联。Furnace Craft Launcher 是我们独立维护的全新项目，请勿混淆。</p></details>
        <details class="faq-item"><summary>遇到问题怎么办？<i class="fa-solid fa-chevron-down"></i></summary><p>可查阅文档的常见问题章节，或加入 QQ 群（1051456192）与社区一起交流。</p></details>
      </div>
    </section>

    <!-- ============ 社区交流 ============ -->
    <section class="community reveal">
      <h2 class="section-title center">加入社区交流</h2>
      <p class="block-sub center">欢迎通过以下方式反馈问题、提交建议，或直接与我们取得联系。</p>
      <div class="community-grid">
        <a class="community-card glass-card" :href="github" target="_blank" rel="noopener">
          <i class="fa-brands fa-github"></i><h3>GitHub</h3><p>提交 Issue 与功能建议</p>
        </a>
        <a class="community-card glass-card" href="https://qm.qq.com/" target="_blank" rel="noopener">
          <i class="fa-brands fa-qq"></i><h3>QQ 群</h3><p>1051456192</p>
        </a>
        <a class="community-card glass-card" href="mailto:3465453028@qq.com">
          <i class="fa-regular fa-envelope"></i><h3>邮箱</h3><p>3465453028@qq.com</p>
        </a>
      </div>
    </section>

    <!-- ============ 页脚 ============ -->
    <footer class="site-footer reveal">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="footer-logo">FCL</span>
          <p>Furnace Craft Launcher · 为热爱 Minecraft 的你而生</p>
        </div>
        <div class="footer-links">
          <a href="/docs/">文档</a>
          <a href="/feedback.html">反馈</a>
          <a href="/legaldocs/eula.txt">用户协议</a>
          <a href="/legaldocs/privacy.txt">隐私政策</a>
          <a :href="github" target="_blank" rel="noopener">GitHub</a>
        </div>
        <p class="footer-copy">© 2024–2026 Furnace Craft Launcher. 保留所有权利。</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const github = 'https://github.com/ShortYard941746/Furnace_Craft_Launcher'

function download() {
  window.open(github + '/releases', '_blank')
}
function openUrl(url) {
  window.open(url, '_blank')
}

// 滚动揭示（统一「淡入下沉」）：
//   无论向上还是向下滚动，元素进入视口时都从上方下沉到原位（translateY 负值起点 → 0），
//   不再区分滚动方向。重置在元素完全离开视口后「瞬时无过渡」完成，避免可见的反向动画。
onMounted(() => {
  // .reveal = 区块级揭示；.dev-card = 卡片级揭示（动画幅度不同，方向逻辑一致）
  const els = document.querySelectorAll('.fcl-home-root .reveal, .fcl-home-root .dev-card')
  if (!els.length) return

  // 不支持 IO 或用户偏好减少动效时，直接全部显示
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!('IntersectionObserver' in window) || reduceMotion) {
    els.forEach((el) => el.classList.add('in'))
    return
  }

  // 交错延迟：保持原有「同屏多块依次弹出」的节奏
  els.forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 0.12 + 's'
  })

  // 单一观察器同时处理「入场」与「离场」；离场（完全离开真实视口）时瞬时无过渡隐藏，
  // 避免可见的倒放。入场方向统一为「从上方下沉」（CSS 默认即为该起点偏移），不区分滚动方向。
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target
      if (entry.isIntersecting) {
        // 去 in → 强制回流锁定起点偏移（CSS 默认 = 从上方下沉）→ 加 in，淡入下沉到原位
        el.classList.remove('in')
        void el.offsetWidth
        el.classList.add('in')
      } else {
        // 完全离开真实视口后才隐藏（不可见，绝无倒放）
        el.classList.add('no-anim')
        el.classList.remove('in')
        void el.offsetWidth
        el.classList.remove('no-anim')
      }
    })
  }, { threshold: 0, rootMargin: '0px' })

  els.forEach((el) => io.observe(el))
})
</script>

<style scoped>
/* ---------- 根容器 ---------- */
.fcl-home-root { color: #e6e8ec; overflow: hidden; }

/* ---------- Hero ---------- */
.hero {
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  padding: 6rem 1.5rem 4rem;
  overflow: hidden;
}
.hero-bg {
  position: absolute; inset: 0; z-index: 0;
  background:
    radial-gradient(ellipse at 18% 22%, rgba(52,94,239,0.18) 0%, transparent 55%),
    radial-gradient(ellipse at 82% 78%, rgba(34,197,94,0.10) 0%, transparent 45%),
    linear-gradient(160deg, #0a0b10 0%, #0d1018 45%, #0a0b10 100%);
}
.hero-grid {
  position: absolute; inset: 0; z-index: 0; opacity: 0.35;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at 50% 40%, #000 30%, transparent 80%);
}
.hero-inner {
  position: relative; z-index: 1;
  width: 100%; max-width: 1180px; margin: 0 auto;
  display: grid; grid-template-columns: 1.3fr 1fr; gap: 3rem; align-items: center;
}
.hero-kicker {
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-size: 0.8rem; font-weight: 600; letter-spacing: 0.12em;
  color: #7c9bff; background: rgba(52,94,239,0.12);
  border: 1px solid rgba(52,94,239,0.3); padding: 0.35rem 0.85rem; border-radius: 9999px;
}
.hero-title {
  font-size: clamp(2.4rem, 5vw, 4rem); font-weight: 800; line-height: 1.05;
  margin: 1.1rem 0 0.8rem; color: #fff; letter-spacing: -0.02em;
}
.hero-subtitle { font-size: 1.1rem; color: #9aa1ad; max-width: 32rem; line-height: 1.6; margin-bottom: 2rem; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 0.85rem; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: #345eef; color: #fff; border: none; cursor: pointer;
  font-size: 0.95rem; font-weight: 600; padding: 0.8rem 1.5rem; border-radius: 0.7rem;
  transition: all 0.2s; box-shadow: 0 8px 24px -8px rgba(52,94,239,0.6);
}
.btn-primary:hover { background: #274bbd; transform: translateY(-2px); }
.btn-ghost {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: rgba(255,255,255,0.05); color: #e6e8ec; text-decoration: none;
  border: 1px solid rgba(255,255,255,0.12); font-size: 0.95rem; font-weight: 500;
  padding: 0.8rem 1.3rem; border-radius: 0.7rem; transition: all 0.2s;
}
.btn-ghost:hover { background: rgba(255,255,255,0.1); color: #fff; }
.hero-platforms { display: flex; align-items: center; gap: 0.6rem; margin-top: 2.2rem; flex-wrap: wrap; }
.platforms-label { font-size: 0.8rem; color: #6b7280; }
.hero-platforms .fa-windows { font-size: 1.3rem; color: #6ca0ff; }
.platforms-note { font-size: 0.8rem; color: #6b7280; }

/* 漂浮胶囊（错落有致但不凌乱） */
.hero-right { display: flex; justify-content: center; }
.float-pills { display: flex; flex-direction: column; gap: 0.9rem; align-items: center; }
.pill {
  display: inline-flex; align-items: center; gap: 0.6rem;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: #e6e8ec; font-size: 0.9rem; font-weight: 500;
  padding: 0.7rem 1.1rem; border-radius: 9999px; backdrop-filter: blur(8px);
  margin-left: var(--x, 0); margin-right: var(--y, 0);
  transform: rotate(var(--r, 0deg));
  animation: floaty 5s ease-in-out infinite; animation-delay: var(--d);
  box-shadow: 0 6px 20px -10px rgba(0,0,0,0.5);
}
.pill i { color: #7c9bff; }
.pill:hover { transform: rotate(0deg) translateY(-3px); border-color: rgba(52,94,239,0.4); }
@keyframes floaty { 0%,100% { transform: translateY(0) rotate(var(--r, 0deg)); } 50% { transform: translateY(-10px) rotate(var(--r, 0deg)); } }

/* ---------- 公告 / 特别注意 ---------- */
.band {
  max-width: 1180px; margin: 0 auto; padding: 0 1.5rem 2rem;
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem;
}
.glass-card {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 1rem; padding: 1.2rem 1.4rem; backdrop-filter: blur(16px);
}
.notice-warn { display: flex; gap: 0.75rem; align-items: flex-start; border-color: rgba(245,158,11,0.35); background: rgba(245,158,11,0.08); }
.notice-warn i { color: #F59E0B; margin-top: 0.2rem; }
.notice-warn p { margin: 0; color: #d6d9df; font-size: 0.9rem; line-height: 1.6; }
.notice-warn strong { color: #fff; }
.update-log summary { cursor: pointer; font-weight: 600; color: #e6e8ec; display: flex; align-items: center; gap: 0.5rem; list-style: none; }
.update-log summary i { color: #7c9bff; }
.update-log ul { margin: 0.9rem 0 0; padding-left: 0; list-style: none; display: flex; flex-direction: column; gap: 0.55rem; }
.update-log li { display: flex; align-items: center; gap: 0.55rem; color: #9aa1ad; font-size: 0.88rem; }
.update-log .dot { width: 6px; height: 6px; border-radius: 50%; background: #345eef; flex-shrink: 0; }

/* ---------- 功能区块 ---------- */
.feature-row {
  max-width: 1180px; margin: 0 auto; padding: 3.5rem 1.5rem;
  display: grid; grid-template-columns: 1fr 1fr; gap: 3.5rem; align-items: center;
}
.feature-row.reverse .feature-visual { order: 1; }
.feature-row.reverse .feature-text { order: 2; }
.block-kicker { font-size: 0.8rem; font-weight: 600; letter-spacing: 0.1em; color: #7c9bff; text-transform: uppercase; }
.section-title { font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 800; color: #fff; margin: 0.6rem 0 0.8rem; letter-spacing: -0.01em; }
.section-title.center, .block-sub.center { text-align: center; }
.feature-desc { color: #9aa1ad; font-size: 1.02rem; line-height: 1.7; margin-bottom: 1.6rem; max-width: 30rem; }
.feature-points { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1.1rem; }
.feature-points li { display: flex; gap: 0.9rem; align-items: flex-start; }
.feature-points i { font-size: 1.2rem; color: #7c9bff; margin-top: 0.15rem; flex-shrink: 0; }
.feature-points h3 { margin: 0 0 0.25rem; font-size: 1.05rem; color: #fff; font-weight: 600; }
.feature-points p { margin: 0; color: #9aa1ad; font-size: 0.92rem; line-height: 1.6; }

/* UI 示意卡 */
.feature-visual { display: flex; justify-content: center; }
.ui-mock {
  width: 100%; max-width: 420px; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09); border-radius: 1.1rem; overflow: hidden;
  box-shadow: 0 30px 60px -25px rgba(0,0,0,0.7); backdrop-filter: blur(12px);
}
.ui-top { display: flex; align-items: center; gap: 0.4rem; padding: 0.7rem 1rem; background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.07); }
.ui-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.18); }
.ui-title { margin-left: auto; font-size: 0.8rem; color: #9aa1ad; font-weight: 600; }
.ui-body { display: flex; gap: 0.8rem; padding: 1.1rem; }
.ui-body.center { flex-direction: column; align-items: center; }
.ui-side { display: flex; flex-direction: column; gap: 0.9rem; color: #7c9bff; }
.ui-side i { font-size: 1rem; }
.ui-main { flex: 1; display: flex; flex-direction: column; gap: 0.7rem; }
.ui-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.6rem; padding: 0.9rem; }
.ui-card.sm { padding: 0.7rem; }
.ui-card.full { width: 100%; }
.ui-chip { font-size: 0.7rem; color: #22C55E; background: rgba(34,197,94,0.12); padding: 0.15rem 0.5rem; border-radius: 9999px; }
.ui-bar { height: 8px; border-radius: 9999px; background: linear-gradient(90deg, #345eef, #5b82f2); margin-top: 0.6rem; }
.ui-bar.short { width: 60%; }
.ui-avatar { width: 64px; height: 64px; border-radius: 50%; background: rgba(52,94,239,0.15); display: flex; align-items: center; justify-content: center; color: #7c9bff; font-size: 1.6rem; border: 2px solid rgba(52,94,239,0.4); }
.ui-badges { display: flex; gap: 0.5rem; margin-top: 0.4rem; }
.ui-badge { font-size: 0.72rem; color: #cdd2db; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 0.2rem 0.6rem; border-radius: 9999px; }

/* ---------- 开发者团队 ---------- */
.dev-team { max-width: 1180px; margin: 0 auto; padding: 4rem 1.5rem; text-align: center; }
.block-sub { color: #9aa1ad; font-size: 1rem; margin: 0.4rem 0 2.5rem; }
.dev-grid { display: flex; justify-content: center; }
.dev-card { display: flex; align-items: center; gap: 1.2rem; max-width: 460px; text-align: left; }
.dev-avatar { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(52,94,239,0.5); flex-shrink: 0; }
.dev-name { margin: 0 0 0.2rem; font-size: 1.3rem; color: #fff; font-weight: 700; }
.dev-role { font-size: 0.82rem; color: #7c9bff; font-weight: 500; }
.dev-quote { margin: 0.5rem 0 0; font-size: 0.88rem; color: #9aa1ad; font-style: italic; line-height: 1.5; }
.dev-thanks { margin: 3rem 0 0; color: #e6e8ec; font-weight: 600; font-size: 1.05rem; }

/* ---------- FAQ ---------- */
.faq { max-width: 880px; margin: 0 auto; padding: 3.5rem 1.5rem; }
.faq-list { display: flex; flex-direction: column; gap: 0.9rem; margin-top: 2rem; }
.faq-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.8rem; padding: 0 1.2rem; overflow: hidden; }
.faq-item summary { cursor: pointer; list-style: none; display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 0; font-weight: 600; color: var(--faq-summary-color, #e6e8ec); }
.faq-item summary i { color: var(--faq-chevron, #6b7280); transition: transform 0.2s; font-size: 0.8rem; }
.faq-item[open] summary i { transform: rotate(180deg); }
.faq-item p { margin: 0 0 1.1rem; color: #9aa1ad; font-size: 0.92rem; line-height: 1.7; }

/* ---------- 社区交流 ---------- */
.community { max-width: 1180px; margin: 0 auto; padding: 3.5rem 1.5rem; }
.community-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; margin-top: 2rem; }
.community-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.4rem; text-decoration: none; transition: all 0.2s; }
.community-card i { font-size: 2rem; color: #7c9bff; margin-bottom: 0.3rem; }
.community-card h3 { margin: 0; color: #fff; font-size: 1.1rem; }
.community-card p { margin: 0; color: #9aa1ad; font-size: 0.88rem; }
.community-card:hover { transform: translateY(-3px); border-color: rgba(52,94,239,0.4); background: rgba(52,94,239,0.08); }

/* ---------- 页脚 ---------- */
.site-footer { border-top: 1px solid rgba(255,255,255,0.07); margin-top: 4rem; padding: 2.5rem 1.5rem; background: rgba(0,0,0,0.25); }
.footer-inner { max-width: 1180px; margin: 0 auto; display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; justify-content: space-between; }
.footer-brand { display: flex; align-items: center; gap: 0.8rem; }
.footer-logo { font-weight: 800; font-size: 1.2rem; color: #fff; background: #345eef; padding: 0.3rem 0.7rem; border-radius: 0.5rem; }
.footer-brand p { margin: 0; color: #9aa1ad; font-size: 0.85rem; }
.footer-links { display: flex; flex-wrap: wrap; gap: 1.2rem; }
.footer-links a { color: #9aa1ad; text-decoration: none; font-size: 0.88rem; transition: color 0.2s; }
.footer-links a:hover { color: #7c9bff; }
.footer-copy { width: 100%; color: #6b7280; font-size: 0.8rem; margin: 0.5rem 0 0; }

/* 浅色模式样式已移至文件末尾的全局 <style> 块（避免 scoped + :global 在构建时被丢弃） */

/* ---------- 动画系统（入场 / 滚动揭示 / 光晕 / 流光） ---------- */
/* 滚动揭示（双向）：
   - 向下滚动 → 元素从下方 38px 滑入
   - 向上滚动 → 元素从上方 38px 滑入
   离开视口后由 JS 重置方向类，因此上下反复滚动都会重播动画。 */
.reveal {
  opacity: 0;
  /* 统一「淡入下沉」起点：从上方下沉到原位，不区分滚动方向 */
  transform: translateY(-38px) scale(1.03) rotate(-.6deg);
  transition: opacity .8s cubic-bezier(.22,.61,.36,1), transform .8s cubic-bezier(.22,.61,.36,1);
  will-change: opacity, transform;
}
.reveal.in { opacity: 1; transform: none; }
/* 重置瞬间关闭过渡，避免出现「倒放」的反向动画 */
.reveal.no-anim { transition: none !important; }
@media (prefers-reduced-motion: reduce) {
  .reveal, .hero-anim, .dev-card { opacity: 1 !important; transform: none !important; animation: none !important; }
  .orb { display: none !important; }
}

/* Hero 入场（错落淡入上浮） */
.hero-anim {
  opacity: 0;
  animation: heroIn .9s cubic-bezier(.22,.61,.36,1) forwards;
  animation-delay: var(--hd, 0s);
}
@keyframes heroIn {
  from { opacity: 0; transform: translateY(26px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 漂浮光晕（hero 背景氛围） */
.orb {
  position: absolute; z-index: 0; border-radius: 50%;
  filter: blur(60px); opacity: .55; pointer-events: none;
  animation: orbFloat 14s ease-in-out infinite;
}
.orb-1 { width: 420px; height: 420px; top: -120px; left: -80px; background: radial-gradient(circle, rgba(52,94,239,.55), transparent 70%); }
.orb-2 { width: 360px; height: 360px; bottom: -120px; right: -60px; background: radial-gradient(circle, rgba(34,197,94,.35), transparent 70%); animation-delay: -5s; }
.orb-3 { width: 280px; height: 280px; top: 40%; left: 55%; background: radial-gradient(circle, rgba(124,155,255,.4), transparent 70%); animation-delay: -9s; }
@keyframes orbFloat {
  0%,100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(40px,-30px) scale(1.08); }
  66% { transform: translate(-30px,25px) scale(.95); }
}

/* 按钮流光（悬停时扫过一道高光） */
.btn-primary { position: relative; overflow: hidden; }
.btn-primary::after {
  content: ''; position: absolute; top: 0; left: -120%; width: 60%; height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,.35), transparent);
  transform: skewX(-20deg); transition: left .6s ease;
}
.btn-primary:hover::after { left: 130%; }
/* 标题轻微呼吸光晕（同时保留入场） */
.hero-title { text-shadow: 0 0 30px rgba(52,94,239,.25); animation: heroIn .9s cubic-bezier(.22,.61,.36,1) .12s both, titleGlow 4s ease-in-out infinite; }
@keyframes titleGlow { 0%,100% { text-shadow: 0 0 28px rgba(52,94,239,.18); } 50% { text-shadow: 0 0 42px rgba(52,94,239,.42); } }

/* FAQ 展开平滑 */
.faq-item p { max-height: 0; overflow: hidden; opacity: 0; transition: max-height .35s ease, opacity .35s ease, margin .35s ease; margin: 0 0 0 !important; }
.faq-item[open] p { max-height: 320px; opacity: 1; margin: 0 0 1.1rem !important; }
.faq-item summary { transition: color .2s; }
.faq-item:hover summary { color: #fff; }

/* 开发者卡片入场：原为一次性 devPop 动画（只在页面加载时播一次、不随滚动重播），
   现改为与 .reveal 同源的双向 transition，正/反动画对称。 */
.dev-card {
  opacity: 0;
  /* 统一「淡入下沉」起点 */
  transform: translateY(-24px) scale(1.04);
  transition: opacity .7s cubic-bezier(.22,.61,.36,1) .1s, transform .7s cubic-bezier(.22,.61,.36,1) .1s;
  will-change: opacity, transform;
}
.dev-card.in { opacity: 1; transform: none; }
.dev-card.no-anim { transition: none !important; }
.dev-avatar { transition: transform .4s ease, box-shadow .4s ease; }
.dev-card:hover .dev-avatar { transform: scale(1.06) rotate(-2deg); box-shadow: 0 0 30px rgba(52,94,239,.5); }

/* 社区卡片依次浮现（由 reveal 控制，这里加悬停微光） */
.community-card { position: relative; overflow: hidden; }
.community-card::before {
  content: ''; position: absolute; inset: 0; border-radius: 1rem; opacity: 0;
  background: radial-gradient(circle at 50% 0%, rgba(52,94,239,.25), transparent 60%);
  transition: opacity .4s ease;
}
.community-card:hover::before { opacity: 1; }

/* 公告卡片悬停微动 */
.glass-card { transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease; }
.glass-card:hover { box-shadow: 0 16px 40px -18px rgba(52,94,239,.5); }

/* ---------- 响应式 ---------- */
@media (max-width: 900px) {
  .hero-inner { grid-template-columns: 1fr; gap: 2rem; }
  .hero-right { justify-content: flex-start; }
  .band, .feature-row, .community-grid { grid-template-columns: 1fr; }
  .feature-row.reverse .feature-visual { order: 2; }
  .feature-row.reverse .feature-text { order: 1; }
}
</style>

<style>
/* ============ 浅色模式兜底（全局样式，避免 scoped + :global 在构建时被丢弃） ============ */
html[data-theme="light"] {
  background-color: #eef1f6 !important;
}
html[data-theme="light"] body {
  background-color: #eef1f6 !important;
}
html[data-theme="light"] .fcl-home-root {
  color: #1a1a1a !important;
  background: #eef1f6 !important;
  min-height: 100vh;
  /* 通过变量控制 FAQ 折叠标题与箭头颜色，绕开与 plume 浅色主题的优先级之争 */
  --faq-summary-color: #1a1a1a;
  --faq-chevron: #374151;
}
html[data-theme="light"] .hero-bg {
  background:
    radial-gradient(ellipse at 18% 22%, rgba(52,94,239,0.10) 0%, transparent 55%),
    radial-gradient(ellipse at 82% 78%, rgba(34,197,94,0.05) 0%, transparent 45%),
    #eef1f6 !important;
}
html[data-theme="light"] .hero-grid { opacity: 0.22; }
html[data-theme="light"] .hero-title,
html[data-theme="light"] .section-title,
html[data-theme="light"] .dev-name,
html[data-theme="light"] .feature-points h3,
html[data-theme="light"] .community-card h3 { color: #1a1a1a !important; }
html[data-theme="light"] .hero-subtitle,
html[data-theme="light"] .feature-desc,
html[data-theme="light"] .block-sub,
html[data-theme="light"] .dev-quote,
html[data-theme="light"] .feature-points p,
html[data-theme="light"] .notice-warn p,
html[data-theme="light"] .update-log li,
html[data-theme="light"] .faq-item p,
html[data-theme="light"] .community-card p { color: #4b5563 !important; }
html[data-theme="light"] .glass-card,
html[data-theme="light"] .ui-mock,
html[data-theme="light"] .ui-card,
html[data-theme="light"] .faq-item,
html[data-theme="light"] .community-card { background: rgba(255,255,255,0.92) !important; border-color: rgba(0,0,0,0.1) !important; }
html[data-theme="light"] .ui-top,
html[data-theme="light"] .ui-side { background: rgba(0,0,0,0.03) !important; }
html[data-theme="light"] .btn-ghost { background: #f3f4f6 !important; color: #374151 !important; border-color: #d1d5db !important; }
html[data-theme="light"] .btn-ghost:hover { background: #e5e7eb !important; color: #1a1a1a !important; }
html[data-theme="light"] .pill { background: #f3f4f6 !important; color: #374151 !important; border-color: #e5e7eb !important; box-shadow: none !important; }
html[data-theme="light"] .pill i { color: #345eef !important; }
html[data-theme="light"] .notice-warn { background: rgba(245,158,11,0.10) !important; border-color: rgba(245,158,11,0.4) !important; }
html[data-theme="light"] .notice-warn i { color: #d97706 !important; }
html[data-theme="light"] .site-footer { background: #f0f2f5 !important; border-top-color: rgba(0,0,0,0.08) !important; }
html[data-theme="light"] .footer-brand p,
html[data-theme="light"] .footer-links a,
html[data-theme="light"] .footer-copy { color: #6b7280 !important; }
/* FAQ 折叠标题在浅色模式下必须为黑色（之前是浅灰，几乎看不见） */
html[data-theme="light"] .faq-item summary { color: #1a1a1a !important; }
html[data-theme="light"] .faq-item summary i { color: #374151 !important; }
html[data-theme="light"] .update-log summary { color: #1a1a1a !important; }
/* 贡献者致谢行在浅色模式下原为深灰（#e6e8ec），浅底上几乎不可见，改为可读的中深灰；
   同时显式钉死深色值，避免主题切换时序导致的残留 */
html[data-theme="light"] .dev-thanks { color: #374151 !important; }
html[data-theme="dark"] .dev-thanks { color: #e6e8ec !important; }
</style>
