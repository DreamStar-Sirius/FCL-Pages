import { defineUserConfig } from 'vuepress'
import { plumeTheme } from 'vuepress-theme-plume'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  lang: 'zh-CN',
  title: 'Furnace Craft Launcher',
  description: '现代化、功能全面的 Minecraft 启动器',
  base: '/',

  // 构建时使用的独立临时目录，避免被其它进程持有的 .temp 锁阻塞
  temp: '.vuepress/.temp10',

  bundler: viteBundler({
    viteOptions: {
      // 避免某些依赖的 esbuild 警告中断构建
      optimizeDeps: { exclude: ['@vuepress/shiki-twoslash'] }
    }
  }),

  head: [
    ['link', { rel: 'icon', href: '/images/FCL.png' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' }],
    ['link', { rel: 'stylesheet', href: '/CSS/font-awesome7.css' }],
    ['link', { rel: 'stylesheet', href: '/CSS/fcl.css' }],
    ['link', { rel: 'stylesheet', href: '/CSS/tw-compat.css' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2' }],
    ['script', { src: '/JS/config.js' }],
    ['script', { src: '/JS/cookie.js' }]
  ],

  theme: plumeTheme({
    logo: '/images/FCL.png',
    navbar: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/docs/' },
      { text: '更新日志', link: '/changelog.html' },
      { text: '插件市场', link: '/plugins.html' },
      { text: '使用协议', link: '/terms.html' },
      { text: '反馈', link: '/feedback.html' }
    ],
    social: [
      { icon: 'github', link: 'https://github.com/ShortYard941746/Furnace_Craft_Launcher' }
    ],
    // 浅色主题下的 logo（与深色一致即可）
    logoDark: '/images/FCL.png',
    appearance: true,
    // plume 原生文档集合
    collections: [
      {
        type: 'doc',
        dir: 'docs',
        linkPrefix: '/docs/',
        title: 'FCL 文档',
        // 使用文件路径作为永久链接，使页面变为 /docs/quickstart/ 形式，避免随机 hash
        autoFrontmatter: {
          permalink: 'filepath'
        },
        sidebar: [
          {
            text: '入门指南',
            items: [
              { text: '概述', link: '/docs/' },
              { text: '快速开始', link: '/docs/quickstart/' },
              { text: '安装指南', link: '/docs/installation/' }
            ]
          },
          {
            text: '配置参考',
            items: [
              { text: '配置说明', link: '/docs/configuration/' },
              { text: '功能特性', link: '/docs/features/' }
            ]
          },
          {
            text: '支持',
            items: [
              { text: '常见问题', link: '/docs/faq/' },
              { text: '获取帮助', link: '/docs/support/' }
            ]
          }
        ]
      }
    ]
  })
})
