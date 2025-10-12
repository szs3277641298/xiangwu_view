<template>
  <div class="config-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <div class="page-title">
            <el-icon class="title-icon"><Setting /></el-icon>
            信息公开设置
          </div>
          <div class="page-description">
            管理不同角色的菜单权限，控制用户可访问的功能模块
          </div>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <div class="stat-number">{{ systemRoles.length }}</div>
            <div class="stat-label">系统角色</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ systemMenus.length }}</div>
            <div class="stat-label">系统菜单</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 角色切换区域 -->
    <el-card class="role-switch-card">
      <template #header>
        <div class="card-header">
          <span>角色切换</span>
          <el-tag v-if="selectedRole" :type="selectedRole.id === 1 ? 'success' : 'info'">
            {{ selectedRole.name }}
          </el-tag>
        </div>
      </template>
      
      <div class="role-switch-content">
        <!-- 加载状态 -->
        <div v-if="rolesLoading" class="roles-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载角色数据中...</span>
        </div>
        
        <!-- 角色选择 -->
        <el-radio-group v-else v-model="currentRole" @change="handleRoleChange">
          <el-radio 
            v-for="role in systemRoles" 
            :key="role.id" 
            :label="role.id" 
            size="large"
          >
            <div class="role-option">
              <el-icon><User /></el-icon>
              <span>{{ role.name }} (ID: {{ role.id }})</span>
            </div>
          </el-radio>
          </el-radio-group>
        </div>
    </el-card>
    
    <!-- 系统菜单管理 -->
    <el-card class="menu-management-card">
      <template #header>
        <div class="card-header">
          <span>系统菜单管理</span>
          <el-button type="primary" @click="loadSystemMenus" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新菜单
          </el-button>
        </div>
      </template>
      
      <div class="menu-content">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载系统菜单中...</span>
        </div>
        
        <!-- 菜单列表 -->
        <div v-else-if="systemMenus.length > 0" class="menu-list">
          <div v-for="menu in systemMenus" :key="menu.id" class="menu-group">
            <!-- 父菜单 -->
            <div class="menu-item">
              <div class="menu-info">
                <div class="menu-header">
                  <el-icon><component :is="getMenuIcon(menu.icon)" /></el-icon>
                  <span class="menu-name">{{ menu.name }}</span>
                  <el-tag v-if="menu.children && menu.children.length > 0" type="info" size="small">
                    有子菜单 ({{ menu.children.length }})
                  </el-tag>
                </div>
                <div class="menu-details">
                  <span class="menu-path">{{ menu.path }}</span>
                  <span class="menu-component">{{ menu.component }}</span>
                </div>
              </div>
              
              <div class="menu-actions">
                <el-switch
                  v-model="menu.enabled"
                  @change="handleMenuToggle(menu)"
                  :loading="switchLoading.has(menu.id)"
                  active-text="启用"
                  inactive-text="禁用"
                />
              </div>
            </div>
            
            <!-- 子菜单 -->
            <div v-if="menu.children && menu.children.length > 0" class="submenu-container">
              <div v-for="submenu in menu.children" :key="submenu.id" class="submenu-item">
                <div class="submenu-info">
                  <div class="submenu-header">
                    <el-icon><component :is="getMenuIcon(submenu.icon)" /></el-icon>
                    <span class="submenu-name">{{ submenu.name }}</span>
                  </div>
                  <div class="submenu-details">
                    <span class="submenu-path">{{ submenu.path }}</span>
                    <span class="submenu-component">{{ submenu.component }}</span>
                  </div>
                </div>
                
                <div class="submenu-actions">
                  <el-switch
                    v-model="submenu.enabled"
                    @change="handleSubmenuToggle(menu, submenu)"
                    :loading="switchLoading.has(submenu.id)"
                    active-text="启用"
                    inactive-text="禁用"
                  />
          </div>
          </div>
          </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else class="empty-state">
          <el-icon><Document /></el-icon>
          <p>暂无系统菜单数据</p>
          <el-button type="primary" @click="loadSystemMenus">重新加载</el-button>
        </div>
      </div>
    </el-card>
    
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, 
  UserFilled, 
  Refresh, 
  Loading, 
  Document,
  DataBoard,
  Money,
  Flag,
  Setting,
  Collection
} from '@element-plus/icons-vue'
import { authAPI } from '../../api/api.js'
import { useUserStore } from '../../store/index.js'

// 用户store
const userStore = useUserStore()

// 当前选择的角色
const currentRole = ref(1) // 默认选择第一个角色

// 加载状态
const loading = ref(false)
const rolesLoading = ref(false)
const switchLoading = ref(new Set()) // 记录正在操作的开关ID

// 系统角色数据
const systemRoles = ref([])

// 系统菜单数据
const systemMenus = ref([])

// 角色菜单权限数据
const roleMenus = ref([])

// 图标映射
const iconMap = {
  'el-icon-data-board': DataBoard,
  'el-icon-user': User,
  'el-icon-money': Money,
  'el-icon-flag': Flag,
  'el-icon-setting': Setting,
  'el-icon-user-solid': UserFilled,
  'el-icon-user-filled': UserFilled,
  'el-icon-collection': Collection
}

// 获取菜单图标
const getMenuIcon = (iconName) => {
  if (!iconName) return Document
  return iconMap[iconName] || Document
}

// 当前选中的角色
const selectedRole = computed(() => {
  return systemRoles.value.find(role => role.id === currentRole.value)
})

// 获取系统角色
const loadSystemRoles = async () => {
  rolesLoading.value = true
  try {
    const response = await authAPI.getSysRoles({})
    if (response.code === 200) {
      systemRoles.value = response.data
      // 设置默认选择第一个角色
      if (response.data.length > 0) {
        currentRole.value = response.data[0].id
      }
      console.log('系统角色数据:', systemRoles.value)
    } else {
      throw new Error(response.message || '获取系统角色失败')
    }
  } catch (error) {
    console.error('加载系统角色失败:', error)
    systemRoles.value = []
  } finally {
    rolesLoading.value = false
  }
}

// 角色切换处理
const handleRoleChange = async (roleId) => {
  const selectedRole = systemRoles.value.find(role => role.id === roleId)
  ElMessage.info(`已切换到${selectedRole?.name || '未知角色'}角色`)
  
  // 重新加载系统菜单，然后根据选择的角色权限初始化开关状态
  await loadSystemMenus()
  await loadRoleMenus(roleId)
}

// 加载系统菜单
const loadSystemMenus = async () => {
  loading.value = true
  try {
    const response = await authAPI.getSysMenu()
    if (response.code === 200) {
      console.log('后端返回的原始菜单数据:', response.data)
      console.log('菜单数据长度:', response.data.length)
      
      // 构建嵌套菜单结构
      const buildMenuTree = (menuList) => {
        const menuMap = new Map()
        const rootMenus = []
        
        // 为每个菜单项添加enabled属性
        menuList.forEach(menu => {
          menuMap.set(menu.id, {
            ...menu,
            enabled: true,
            children: []
          })
        })
        
        // 构建父子关系
        menuList.forEach(menu => {
          const menuItem = menuMap.get(menu.id)
          if (menu.parentId === 0) {
            // 顶级菜单
            rootMenus.push(menuItem)
          } else {
            // 子菜单
            const parentMenu = menuMap.get(menu.parentId)
            if (parentMenu) {
              parentMenu.children.push(menuItem)
            }
          }
        })
        
        return rootMenus
      }
      
      systemMenus.value = buildMenuTree(response.data)
      
      console.log('处理后的菜单数据:', systemMenus.value)
      
      // 详细检查每个菜单的子菜单
      systemMenus.value.forEach(menu => {
        console.log(`菜单 ${menu.name}:`, {
          id: menu.id,
          children: menu.children,
          childrenLength: menu.children ? menu.children.length : 0
        })
        if (menu.children && menu.children.length > 0) {
          console.log(`  - 子菜单数量: ${menu.children.length}`)
          menu.children.forEach(child => {
            console.log(`    - 子菜单: ${child.name} (ID: ${child.id})`)
          })
        } else {
          console.log(`  - 无子菜单`)
        }
      })
      
    } else {
      throw new Error(response.message || '获取系统菜单失败')
    }
  } catch (error) {
    console.error('加载系统菜单失败:', error)
    systemMenus.value = []
  } finally {
    loading.value = false
  }
}

// 获取角色菜单权限
const loadRoleMenus = async (roleId = null) => {
  try {
    // 如果没有传递roleId，使用当前选择的角色ID，否则使用当前用户的roleId
    let targetRoleId
    if (roleId) {
      targetRoleId = Number(roleId)
    } else {
      // 在编辑模式下，使用当前选择的角色ID
      targetRoleId = Number(currentRole.value)
    }
    
    const response = await authAPI.getRoleMenu(targetRoleId)
    if (response.code === 200) {
      // 确保data是数组，如果是null或undefined则设为空数组
      roleMenus.value = Array.isArray(response.data) ? response.data : []
      console.log(`角色 ${targetRoleId} 的菜单权限数据:`, roleMenus.value)
      
      // 根据角色菜单权限初始化开关状态
      initializeMenuStates()
    } else {
      throw new Error(response.message || '获取角色菜单权限失败')
    }
  } catch (error) {
    console.error('获取角色菜单权限失败:', error)
    roleMenus.value = []
    // 即使出错也要初始化菜单状态（全部关闭）
    initializeMenuStates()
  }
}


// 初始化菜单开关状态
const initializeMenuStates = () => {
  // 创建角色菜单ID集合，便于快速查找
  const roleMenuIds = new Set()
  
  // 如果有角色菜单权限数据，收集所有角色菜单ID（包括主菜单和子菜单）
  if (roleMenus.value.length > 0) {
    roleMenus.value.forEach(menu => {
      roleMenuIds.add(menu.id)
      if (menu.children && menu.children.length > 0) {
        menu.children.forEach(child => {
          roleMenuIds.add(child.id)
        })
      }
    })
    console.log('角色菜单ID集合:', Array.from(roleMenuIds))
  } else {
    console.log('没有角色菜单权限数据，所有开关将设置为关闭状态')
  }
  
  // 更新系统菜单的开关状态
  systemMenus.value.forEach(menu => {
    // 设置主菜单状态 - 如果角色菜单为空，则全部关闭
    menu.enabled = roleMenuIds.has(menu.id)
    
    // 设置子菜单状态 - 如果角色菜单为空，则全部关闭
    if (menu.children && menu.children.length > 0) {
      menu.children.forEach(child => {
        child.enabled = roleMenuIds.has(child.id)
      })
    }
  })
  
  console.log('菜单开关状态已初始化:', systemMenus.value)
  
  // 统计启用的菜单数量
  let enabledCount = 0
  systemMenus.value.forEach(menu => {
    if (menu.enabled) enabledCount++
    if (menu.children) {
      menu.children.forEach(child => {
        if (child.enabled) enabledCount++
      })
    }
  })
  
  console.log(`当前启用的菜单数量: ${enabledCount}`)
}

// 主菜单开关切换
const handleMenuToggle = async (menu) => {
  console.log(`主菜单 ${menu.name} 状态切换为:`, menu.enabled ? '启用' : '禁用')
  
  // 添加加载状态
  switchLoading.value.add(menu.id)
  
  try {
    if (menu.enabled) {
      // 启用菜单 - 调用添加接口
      await authAPI.addRoleMenu(currentRole.value, menu.id)
      // 如果启用主菜单，同时启用所有子菜单
      if (menu.children) {
        for (const child of menu.children) {
          child.enabled = true
          await authAPI.addRoleMenu(currentRole.value, child.id)
        }
      }
    } else {
      // 禁用菜单 - 调用删除接口
      await authAPI.deleteRoleMenu(currentRole.value, menu.id)
      
      // 如果禁用主菜单，同时禁用所有子菜单
      if (menu.children) {
        for (const child of menu.children) {
          child.enabled = false
          await authAPI.deleteRoleMenu(currentRole.value, child.id)
        }
      }
    }
  } catch (error) {
    // 操作失败，恢复开关状态
    menu.enabled = !menu.enabled
    console.error('菜单状态切换失败:', error)
  } finally {
    // 移除加载状态
    switchLoading.value.delete(menu.id)
  }
}

// 子菜单开关切换
const handleSubmenuToggle = async (parentMenu, submenu) => {

  
  // 添加加载状态
  switchLoading.value.add(submenu.id)
  
  try {
    if (submenu.enabled) {
      // 启用子菜单 - 调用添加接口
      await authAPI.addRoleMenu(currentRole.value, submenu.id)
      
      // 如果启用子菜单，确保父菜单也启用
      if (!parentMenu.enabled) {
        parentMenu.enabled = true
        await authAPI.addRoleMenu(currentRole.value, parentMenu.id)
        ElMessage.info(`父菜单 "${parentMenu.name}" 已自动启用`)
      }
    } else {
      // 禁用子菜单 - 调用删除接口
      await authAPI.deleteRoleMenu(currentRole.value, submenu.id)
    }
  } catch (error) {
    // 操作失败，恢复开关状态
    submenu.enabled = !submenu.enabled
    console.error('子菜单状态切换失败:', error)
  } finally {
    // 移除加载状态
    switchLoading.value.delete(submenu.id)
  }
}


// 组件挂载时的初始化
onMounted(async () => {
  console.log('加载信息公开配置页面')
  // 先加载系统角色，再加载菜单和角色权限
  await loadSystemRoles()
  await loadSystemMenus()
  await loadRoleMenus()
})
</script>

<style scoped>
.config-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  color: #303133;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 32px;
  color: #409eff;
}

.page-description {
  font-size: 16px;
  color: #606266;
  line-height: 1.5;
}

.header-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.page-subheader {
  margin-bottom: 10px;
}

.page-subheader h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.page-subheader p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

/* 角色切换卡片 */
.role-switch-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-switch-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
}

.role-info {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.role-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #606266;
}

.role-tip {
  color: #409eff !important;
  font-weight: 500;
  background: #f0f9ff;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.roles-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #909399;
  gap: 12px;
}

.roles-loading .el-icon {
  font-size: 24px;
}

/* 菜单管理卡片 */
.menu-management-card {
  margin-bottom: 20px;
}

.menu-content {
  min-height: 400px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
  gap: 12px;
}

.loading-container .el-icon {
  font-size: 24px;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.menu-item:hover {
  background-color: #f0f9ff;
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.menu-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.menu-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.menu-path {
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.menu-component {
  background-color: #f6ffed;
  color: #52c41a;
  padding: 2px 6px;
  border-radius: 4px;
}

.menu-actions {
  display: flex;
  align-items: center;
}

/* 菜单组样式 */
.menu-group {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

/* 子菜单样式 */
.submenu-container {
  margin-left: 20px;
  margin-top: 8px;
  padding-left: 20px;
  border-left: 2px solid #e4e7ed;
}

.submenu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.submenu-item:hover {
  background-color: #e6f7ff;
  border-color: #91d5ff;
}

.submenu-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.submenu-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.submenu-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.submenu-details {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #909399;
}

.submenu-path {
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 1px 4px;
  border-radius: 3px;
}

.submenu-component {
  background-color: #f6ffed;
  color: #52c41a;
  padding: 1px 4px;
  border-radius: 3px;
}

.submenu-actions {
  display: flex;
  align-items: center;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
  gap: 16px;
}

.empty-state .el-icon {
  font-size: 48px;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}


/* 响应式布局 */
@media (max-width: 1200px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .header-stats {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .config-container {
    padding: 10px;
  }
  
  .page-header {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .header-stats {
    gap: 20px;
  }
  
  .menu-item,
  .submenu-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .menu-actions,
  .submenu-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  
  .submenu-container {
    margin-left: 10px;
    padding-left: 10px;
  }
}
</style>