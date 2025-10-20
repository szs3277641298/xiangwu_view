<template>
  <div id="app">
    <!-- 数据大屏页面 - 全屏显示，无侧边栏 -->
    <template v-if="currentRoute.meta.hideSidebar">
      <router-view />
    </template>
    
    <!-- 根据路由meta信息条件渲染侧边栏和主内容区域 -->
    <template v-else-if="currentRoute.meta.requiresAuth">
      <!-- 侧边栏 -->
      <Sidebar ref="sidebarRef" />
      
      <!-- 主内容区域 -->
      <div class="main-content" :class="{ 'sidebar-expanded': sidebarRef?.isExpanded }">
        <!-- 顶部导航栏 -->
        <div class="top-navbar">
          <div class="navbar-left">
            <el-button 
              class="sidebar-toggle"
              type="text"
              @click="toggleSidebar"
              icon="el-icon-menu"
            />
            <div class="current-page">{{ currentPageTitle }}</div>
          </div>
          
          <div class="navbar-right">
            <el-button 
              type="text"
              icon="el-icon-bell"
              @click="showNotification"
            />
            <el-dropdown>
              <span class="user-info">
                <el-avatar class="user-avatar">
                  {{ userInfo?.username?.substring(0, 2) || '游客' }}
                </el-avatar>
                <span class="username">{{ userInfo?.username || '未登录' }}</span>
                <el-icon class="arrow-icon"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToUserCenter">
                    <el-icon><User /></el-icon>
                    <span>个人中心</span>
                  </el-dropdown-item>
                  <el-dropdown-item @click="showSettings">
                    <el-icon><Setting /></el-icon>
                    <span>系统设置</span>
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="logout">
                    <el-icon><TurnOff /></el-icon>
                    <span>退出登录</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <!-- 内容区域 -->
        <div class="content-wrapper">
          <router-view />
        </div>
      </div>
    </template>
    
    <!-- 对于不需要认证的页面（如登录页），直接显示路由视图 -->
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineExpose, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown, User, Setting, TurnOff } from '@element-plus/icons-vue'
import Sidebar from './components/Sidebar.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'
import { useUserStore } from './store/index.js'
import { useMenuStore } from './store/menu.js'
import { addDynamicRoutes } from './router/index.js'
import routePreloader from './utils/routePreloader.js'

const router = useRouter()
const route = useRoute()
const sidebarRef = ref(null)
const userStore = useUserStore()
const menuStore = useMenuStore()

// 用户信息
const userInfo = computed(() => {
  return userStore.userInfo || {}
})

// 当前页面标题
const currentPageTitle = computed(() => {
  return route.meta?.title || '项目管理系统'
})

// 当前路由
const currentRoute = computed(() => {
  return route
})

// 切换侧边栏展开/收起状态
const toggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.toggleExpand()
  }
}

// 显示通知
const showNotification = () => {
  ElMessage.success('暂无新通知')
}

// 前往用户中心
const goToUserCenter = () => {
  router.push('/user-center')
}

// 显示系统设置
const showSettings = () => {
  router.push('/system/settings')
}

// 退出登录
const logout = () => {
  userStore.logout()
  router.push('/login')
  ElMessage.success('退出登录成功')
}

// 路由切换性能监控
let routeChangeStartTime = 0

// 监听路由变化
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (import.meta.env.DEV) {
      const changeTime = Date.now() - routeChangeStartTime
      console.log(`路由切换: ${oldPath} -> ${newPath}, 耗时: ${changeTime}ms`)
      console.log('当前路由元信息:', route.meta)
    }
  },
  { immediate: true }
)

// 监听路由元信息变化
watch(
  () => route.meta,
  (newMeta) => {
    // 可以根据路由元信息做一些特殊处理
    if (import.meta.env.DEV) {
      console.log('路由元信息变化:', newMeta)
    }
  },
  { immediate: true }
)

// 初始化动态菜单
const initializeDynamicMenu = async () => {
  try {
    console.log('初始化动态菜单，用户状态:', {
      isLoggedIn: userStore.isLoggedIn,
      userInfo: userStore.userInfo,
      getUserRoleId: userStore.getUserRoleId,
      isMenuLoaded: menuStore.isMenuLoaded
    })
    
    // 如果用户已登录且菜单未加载，则加载菜单
    if (userStore.isLoggedIn && !menuStore.isMenuLoaded) {
      await menuStore.fetchUserMenu()
      
      // 添加动态路由
      if (menuStore.menuList.length > 0) {
        addDynamicRoutes(menuStore.menuList)
        if (import.meta.env.DEV) {
          console.log('动态路由已添加:', menuStore.menuList)
        }
      }
      
      // 预加载用户相关路由
      const userRole = userStore.userInfo?.role || 'guest'
      routePreloader.preloadUserRoutes(userRole)
    }
  } catch (error) {
    console.error('初始化动态菜单失败:', error)
  }
}

// 监听用户登录状态变化
watch(
  () => userStore.isLoggedIn,
  async (isLoggedIn) => {
    if (isLoggedIn) {
      // 用户登录后，初始化动态菜单
      await initializeDynamicMenu()
    } else {
      // 用户登出后，清空菜单
      menuStore.clearMenu()
    }
  },
  { immediate: true }
)

// 组件挂载时
onMounted(async () => {
  if (import.meta.env.DEV) {
    console.log('App mounted')
  }
  
  // 确保用户数据已加载
  userStore.loadUserData()
  
  // 等待一个tick确保用户数据完全加载
  await nextTick()
  
  // 初始化动态菜单
  await initializeDynamicMenu()
})

// 处理路由变化前的逻辑
const handleRouteBeforeUpdate = () => {
  routeChangeStartTime = Date.now()
  if (import.meta.env.DEV) {
    console.log('路由即将变化')
  }
}

// 监听路由变化
router.afterEach((to, from) => {
  handleRouteBeforeUpdate()
})

// 过渡动画钩子函数（已移除，在Home.vue中处理）

// 导出清理函数供路由使用
defineExpose({
  handleRouteBeforeUpdate
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
  height: 100vh;
  overflow: hidden;
}

#app {
  height: 100vh;
  width: 100vw;
  display: flex;
  background-color: #f5f7fa;
}

/* 侧边栏样式 - 与组件内样式保持一致 */
.sidebar-container {
  height: 100vh;
  background-color: #001529;
  transition: width 0.3s ease;
  flex-shrink: 0;
}

.sidebar-container:not(.collapsed) {
  width: 260px;
}

.sidebar-container.collapsed {
  width: 60px;
}

/* 主内容区域 - 完全填充剩余空间并支持滚动 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  min-width: 0;
  position: relative;
}

/* 顶部导航栏 */
.top-navbar {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
  flex-shrink: 0;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.sidebar-toggle {
  color: #606266;
  font-size: 18px;
}

.sidebar-toggle:hover {
  color: #409eff;
}

.current-page {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  color: #303133;
  font-size: 14px;
}

.arrow-icon {
  font-size: 12px;
  color: #909399;
}

.user-avatar {
  background-color: #409eff;
}

/* 内容区域 - 主要滚动容器 */
.content-wrapper {
  flex: 1;
  width: 100%;
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
  position: static;
  padding: 0;
  max-height: calc(100vh - 60px);
  height: calc(100vh - 60px);
  z-index: 10;
}

/* 自定义滚动条样式 */
.content-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  display: block !important;
}

.content-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式布局优化 */
@media screen and (min-width: 1200px) {
  .main-content {
    flex: 1;
  }
}

/* 修复用户中心等页面内容溢出问题 */
.content-wrapper > * {
  width: 100%;
  overflow: visible;
}

/* 强制内容区域滚动 */
.content-wrapper {
  overflow: auto !important;
  scrollbar-width: thin;
}

.content-wrapper * {
  overflow: visible !important;
}

/* 为内容包装器添加相对定位 */
.content-wrapper {
  position: relative;
  overflow: hidden;
}
</style>
