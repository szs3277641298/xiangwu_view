import { defineStore } from 'pinia'
import { authAPI } from '../api/api.js'
import { useUserStore } from './index.js'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menuList: [],
    loading: false,
    error: null
  }),
  
  getters: {
    // 获取菜单列表
    getMenuList: (state) => state.menuList,
    
    // 获取顶级菜单
    getTopMenus: (state) => {
      return state.menuList.filter(menu => menu.parentId === 0)
    },
    
    // 根据父ID获取子菜单
    getChildMenus: (state) => (parentId) => {
      return state.menuList.filter(menu => menu.parentId === parentId)
    },
    
    // 检查菜单是否加载完成
    isMenuLoaded: (state) => state.menuList.length > 0,
    
    // 获取加载状态
    isLoading: (state) => state.loading
  },
  
  actions: {
    // 获取用户菜单
    async fetchUserMenu(roleId = null) {
      this.loading = true
      this.error = null
      
      try {
        // 如果没有传递roleId，从用户store获取当前用户角色ID
        let targetRoleId = roleId
        if (!targetRoleId) {
          const userStore = useUserStore()
          console.log('用户store状态:', {
            isLoggedIn: userStore.isLoggedIn,
            userInfo: userStore.userInfo,
            getUserRoleId: userStore.getUserRoleId
          })
          
          // 检查localStorage中的原始用户信息
          const userInfoStr = localStorage.getItem('userInfo')
          console.log('localStorage中的用户信息:', userInfoStr)
          if (userInfoStr && userInfoStr !== 'undefined') {
            try {
              const rawUserInfo = JSON.parse(userInfoStr)
              console.log('解析后的用户信息:', rawUserInfo)
              targetRoleId = rawUserInfo?.roleId || userStore.getUserRoleId || 1
            } catch (error) {
              console.error('解析localStorage用户信息失败:', error)
              targetRoleId = userStore.getUserRoleId || 1
            }
          } else {
            targetRoleId = userStore.getUserRoleId || 1
          }
          
          console.log('从用户store获取roleId:', userStore.getUserRoleId, '最终使用:', targetRoleId)
        } else {
          // 确保传递的roleId是数字类型
          targetRoleId = Number(targetRoleId)
          console.log('使用传递的roleId:', targetRoleId)
        }
        
        console.log('准备调用getRoleMenu，roleId:', targetRoleId)
        const response = await authAPI.getRoleMenu(targetRoleId)
        if (response.code === 200) {
          this.menuList = response.data || []
          console.log(`角色 ${targetRoleId} 菜单加载成功:`, this.menuList)
        } else {
          throw new Error(response.message || '获取菜单失败')
        }
      } catch (error) {
        console.error('获取菜单失败:', error)
        this.error = error.message || '获取菜单失败'
        this.menuList = []
      } finally {
        this.loading = false
      }
    },
    
    // 清空菜单
    clearMenu() {
      this.menuList = []
      this.error = null
    },
    
    // 根据路径查找菜单
    findMenuByPath(path) {
      return this.menuList.find(menu => menu.path === path)
    },
    
    // 根据ID查找菜单
    findMenuById(id) {
      return this.menuList.find(menu => menu.id === id)
    }
  }
})
