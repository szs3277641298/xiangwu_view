import { createApp } from 'vue'
import App from './App.vue'
// 导入路由
import router from './router'
// 导入Pinia
import { createPinia } from 'pinia'
// 导入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入DataV Vue3
import DataV from '@kjgl77/datav-vue3'
// 导入用户store
import { useUserStore } from './store/index.js'

// 创建应用实例
const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()

// 使用插件
app.use(router)
app.use(pinia)
app.use(ElementPlus)
app.use(DataV)

// 在挂载前加载用户数据
const userStore = useUserStore()
userStore.loadUserData()

// 确保用户状态在应用启动时正确初始化
// 开发环境下才输出日志
if (import.meta.env.DEV) {
  console.log('应用启动时用户状态:', {
    isLoggedIn: userStore.isLoggedIn,
    token: userStore.token,
    userInfo: userStore.userInfo
  })
}

// 全局 ResizeObserver 错误处理
window.addEventListener('error', (e) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    e.stopImmediatePropagation()
  }
})

// 挂载应用
app.mount('#app')
