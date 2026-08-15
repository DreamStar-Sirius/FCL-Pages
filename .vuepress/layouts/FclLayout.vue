<script setup>
// 包装 plume 的 Layout，把 UserMenu 注入到导航栏的插槽中，
// 从而在所有页面保留登录状态（导航栏用户菜单）。
import Layout from '../../node_modules/vuepress-theme-plume/dist/client/layouts/Layout.vue'
import UserMenu from '../components/UserMenu.vue'
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <UserMenu />
    </template>
    <template #nav-screen-content-after>
      <UserMenu />
    </template>
  </Layout>
</template>
