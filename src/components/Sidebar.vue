<template>
  <div class="sidebar-container" :class="{ 'collapsed': collapsed }">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <div class="logo-container">
        <div class="logo">乡村治理系统</div>
        <div class="logo-subtitle">村级综合管理平台</div>
      </div>
      <el-button
        type="text"
        class="toggle-btn"
        @click="toggleCollapse"
        :title="collapsed ? '展开' : '收起'"
      >
        <el-icon v-if="collapsed"><ArrowRight /></el-icon>
        <el-icon v-else><ArrowLeft /></el-icon>
      </el-button>
    </div>

    <!-- 菜单列表 -->
    <div class="menu-wrapper">
      <!-- 加载状态 -->
      <div v-if="menuStore.isLoading" class="menu-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载菜单中...</span>
      </div>
      
      <!-- 动态菜单 -->
      <el-menu
        v-else
        :collapse="collapsed"
        :default-active="activeRoute"
        :default-openeds="defaultOpenedMenus"
        class="sidebar-menu"
        router
        :unique-opened="false"
      >
        <!-- 渲染动态菜单 -->
        <template v-for="menu in topMenus" :key="menu.id">
          <!-- 有子菜单的情况 -->
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
            <template #title>
              <el-icon><component :is="getMenuIcon(menu.icon)" /></el-icon>
              <span>{{ menu.name }}</span>
            </template>
            <el-menu-item 
              v-for="child in menu.children" 
              :key="child.id" 
              :index="child.path"
            >
              <el-icon><component :is="getMenuIcon(child.icon)" /></el-icon>
              <span>{{ child.name }}</span>
            </el-menu-item>
          </el-sub-menu>
          
          <!-- 没有子菜单的情况 -->
          <el-menu-item v-else :index="menu.path">
            <el-icon><component :is="getMenuIcon(menu.icon)" /></el-icon>
            <span>{{ menu.name }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </div>
    
    <!-- 侧边栏底部 -->
    <div class="sidebar-footer" v-if="!collapsed">
      <div class="footer-info">
        <div class="system-version">版本 v1.0.0</div>
        <div class="copyright">© 2023 乡村治理系统</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineExpose } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '../store/menu.js'
import {
  ArrowRight,
  ArrowLeft,
  DataBoard,
  User,
  Money,
  Flag,
  Setting,
  Document,
  UserFilled,
  DataAnalysis,
  Loading,
  Notebook,
  Collection
} from '@element-plus/icons-vue'

const route = useRoute()
const menuStore = useMenuStore()

// 侧边栏折叠状态
const collapsed = ref(false)

// 计算属性：侧边栏是否展开
const isExpanded = computed(() => !collapsed.value)

// 当前激活的路由
const activeRoute = computed(() => {
  return route.path
})

// 获取顶级菜单
const topMenus = computed(() => {
  return menuStore.getTopMenus
})

// 默认打开的菜单（所有有子菜单的顶级菜单）
const defaultOpenedMenus = computed(() => {
  return topMenus.value
    .filter(menu => menu.children && menu.children.length > 0)
    .map(menu => menu.path)
})

// 图标映射
const iconMap = {
  'el-icon-data-board': DataBoard,
  'el-icon-user': User,
  'el-icon-money': Money,
  'el-icon-flag': Flag,
  'el-icon-setting': Setting,
  'el-icon-document': Document,
  'el-icon-user-filled': UserFilled,
  'el-icon-data-analysis': DataAnalysis,
  'el-icon-user-solid': UserFilled,
  'el-icon-notebook': Notebook,
  'el-icon-collection': Collection,
  // 添加更多可能的变体
  'Money': Money,
  'money': Money,
  'MONEY': Money,
  'el-icon-Money': Money,
  'DataBoard': DataBoard,
  'data-board': DataBoard,
  'User': User,
  'user': User,
  'Flag': Flag,
  'flag': Flag,
  'Setting': Setting,
  'setting': Setting,
  'Document': Document,
  'document': Document,
  'Notebook': Notebook,
  'notebook': Notebook,
  'el-icon-Notebook': Notebook
}

// 获取菜单图标
const getMenuIcon = (iconName) => {
  if (!iconName) return Document
  return iconMap[iconName] || Document
}

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
  localStorage.setItem('sidebarCollapsed', collapsed.value)
}

// 切换侧边栏展开状态（对外暴露的方法）
const toggleExpand = () => {
  toggleCollapse()
}

// 组件挂载时初始化
onMounted(async () => {
  // 从localStorage加载侧边栏状态
  const storedCollapsed = localStorage.getItem('sidebarCollapsed')
  if (storedCollapsed !== null) {
    collapsed.value = storedCollapsed === 'true'
  }
  
  // 加载用户菜单
  if (!menuStore.isMenuLoaded) {
    await menuStore.fetchUserMenu()
  }
})

// 暴露方法和属性给父组件
defineExpose({
  toggleExpand,
  isExpanded
})
</script>

<style scoped>
.sidebar-container {
  height: 100vh;
  background: #ffffff;
  transition: width 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 101;
  border-right: 1px solid #e4e7ed;
}

.sidebar-container:not(.collapsed) {
  width: 240px;
}

.sidebar-container.collapsed {
  width: 64px;
}

/* 侧边栏头部 */
.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #ffffff;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}

.logo {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  transition: all 0.3s ease;
}

.logo-subtitle {
  color: #909399;
  font-size: 12px;
  margin-top: 2px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.sidebar-container.collapsed .logo,
.sidebar-container.collapsed .logo-subtitle {
  display: none;
}

.toggle-btn {
  color: #606266;
  font-size: 16px;
  transition: all 0.3s ease;
  padding: 6px;
  border-radius: 4px;
}

.toggle-btn:hover {
  color: #409eff;
  background: #f5f7fa;
}

/* 菜单列表 */
.menu-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.menu-wrapper::-webkit-scrollbar {
  width: 4px;
}

.menu-wrapper::-webkit-scrollbar-track {
  background: #f5f7fa;
}

.menu-wrapper::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 2px;
}

.menu-wrapper::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 侧边栏底部 */
.sidebar-footer {
  height: 60px;
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.system-version {
  color: #909399;
  font-size: 12px;
}

.copyright {
  color: #c0c4cc;
  font-size: 11px;
}

/* 菜单样式 */
.sidebar-menu {
  border-right: none !important;
}

/* 一级菜单样式 - 更小更精致 */
.sidebar-menu .el-sub-menu__title {
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #606266 !important;
  padding-left: 20px !important;
}

.sidebar-menu .el-sub-menu__title .el-icon {
  font-size: 16px !important;
  color: #909399 !important;
}

.sidebar-menu .el-sub-menu__title:hover {
  color: #303133 !important;
  background-color: #f5f7fa !important;
}

/* 一级菜单项样式（没有子菜单的一级菜单） */
.sidebar-menu .el-menu-item {
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #606266 !important;
  padding-left: 20px !important;
  height: 45px !important;
  line-height: 45px !important;
}

.sidebar-menu .el-menu-item .el-icon {
  font-size: 16px !important;
  color: #909399 !important;
}

.sidebar-menu .el-menu-item:hover {
  color: #303133 !important;
  background-color: #f5f7fa !important;
}

.sidebar-menu .el-menu-item.is-active {
  color: #303133 !important;
  background-color: #f0f2f5 !important;
  font-weight: 500 !important;
}

.sidebar-menu .el-menu-item.is-active .el-icon {
  color: #606266 !important;
}

/* 二级菜单样式 - 更小更精致 */
.sidebar-menu .el-sub-menu .el-menu-item {
  font-size: 13px !important;
  font-weight: 400 !important;
  color: #606266 !important;
  padding-left: 40px !important;
  height: 40px !important;
  line-height: 40px !important;
}

.sidebar-menu .el-sub-menu .el-menu-item .el-icon {
  font-size: 14px !important;
  color: #909399 !important;
}

.sidebar-menu .el-sub-menu .el-menu-item:hover {
  color: #409eff !important;
  background-color: #f0f9ff !important;
}

.sidebar-menu .el-sub-menu .el-menu-item.is-active {
  color: #409eff !important;
  background-color: #e6f7ff !important;
  font-weight: 500 !important;
}

.sidebar-menu .el-sub-menu .el-menu-item.is-active .el-icon {
  color: #409eff !important;
}

/* 菜单加载状态 */
.menu-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
  gap: 12px;
}

.menu-loading .el-icon {
  font-size: 24px;
}

.menu-loading span {
  font-size: 14px;
}

/* 电脑端优化 */
@media screen and (min-width: 1200px) {
  .sidebar-container:not(.collapsed) {
    width: 260px;
  }
  
  .logo {
    font-size: 18px;
  }
  
  .logo-subtitle {
    font-size: 13px;
  }
}

/* 移动端优化 */
@media screen and (max-width: 768px) {
  .sidebar-container:not(.collapsed) {
    width: 220px;
  }
  
  .sidebar-container.collapsed {
    width: 60px;
  }
  
  .sidebar-header {
    height: 60px;
    padding: 0 16px;
  }
  
  .logo {
    font-size: 15px;
  }
}
</style>