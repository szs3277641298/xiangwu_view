// 导入必要的模块
import { defineStore } from 'pinia'

// 用户store
export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    userInfo: null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    getUsername: (state) => state.userInfo?.username || '',
    getUserInfo: (state) => state.userInfo,
    getUserRole: (state) => state.userInfo?.role || null,
    getUserRoleId: (state) => state.userInfo?.roleId || null,
    isAdmin: (state) => {
      const role = state.userInfo?.role
      const roleId = state.userInfo?.roleId
      // 支持新格式：role为"ROLE_ADMIN"或旧格式：role为1或'admin'
      return role === 'ROLE_ADMIN' || role === 1 || role === 'admin' || roleId === 1
    },
    isGuest: (state) => {
      const role = state.userInfo?.role
      const roleId = state.userInfo?.roleId
      // 支持新格式：role为"ROLE_GUEST"或旧格式：role为0或'guest'
      return role === 'ROLE_GUEST' || role === 0 || role === 'guest' || roleId === 0
    }
  },
  
  actions: {
    // 设置token
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    
    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    
    // 清除token和登录状态
    logout() {
      this.token = null
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      if (import.meta.env.DEV) {
        console.log('用户登出，已清除所有登录信息')
      }
    },
    
    // 从localStorage加载token和用户信息
    loadUserData() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
      }
      
      const userInfoStr = localStorage.getItem('userInfo')
      console.log('loadUserData - localStorage中的用户信息:', userInfoStr)
      
      if (userInfoStr && userInfoStr !== 'undefined') {
        try {
          this.userInfo = JSON.parse(userInfoStr)
          console.log('loadUserData - 解析后的用户信息:', this.userInfo)
          console.log('loadUserData - roleId字段:', this.userInfo?.roleId)
          
          // 确保解析后得到的是有效对象
          if (!this.userInfo || typeof this.userInfo !== 'object') {
            if (import.meta.env.DEV) {
              console.warn('用户信息格式无效，重置为null')
            }
            this.userInfo = null
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('解析用户信息失败:', error)
          }
          this.userInfo = null
        }
      }
    }
  }
})