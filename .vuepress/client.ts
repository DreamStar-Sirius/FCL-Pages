import { defineClientConfig } from 'vuepress/client'
import Layout from './layouts/FclLayout.vue'

import HomeSections from './components/HomeSections.vue'
import LoginForm from './components/LoginForm.vue'
import RegisterForm from './components/RegisterForm.vue'
import DashboardConsole from './components/DashboardConsole.vue'
import FeedbackForm from './components/FeedbackForm.vue'
import MaintainPage from './components/MaintainPage.vue'
import UserMenu from './components/UserMenu.vue'
import PluginMarket from './components/PluginMarket.vue'
import ChangelogView from './components/ChangelogView.vue'

export default defineClientConfig({
  layouts: {
    Layout
  },
  enhance({ app }) {
    // 显式全局注册自定义组件，确保 markdown 中的 <Component /> 在运行时
    // 可被 resolveComponent 找到（部分组件 VuePress 不会静态打包）。
    app.component('HomeSections', HomeSections)
    app.component('LoginForm', LoginForm)
    app.component('RegisterForm', RegisterForm)
    app.component('DashboardConsole', DashboardConsole)
    app.component('FeedbackForm', FeedbackForm)
    app.component('MaintainPage', MaintainPage)
    app.component('UserMenu', UserMenu)
    app.component('PluginMarket', PluginMarket)
    app.component('ChangelogView', ChangelogView)
  }
})
