// 路由预加载工具
class RoutePreloader {
  constructor() {
    this.preloadedRoutes = new Set()
    this.preloadQueue = []
    this.isPreloading = false
  }

  // 预加载指定路由
  async preloadRoute(routePath) {
    if (this.preloadedRoutes.has(routePath)) {
      return
    }

    try {
      // 根据路径动态导入组件
      const component = await this.getComponentByPath(routePath)
      if (component) {
        this.preloadedRoutes.add(routePath)
        console.log(`路由预加载成功: ${routePath}`)
      }
    } catch (error) {
      console.warn(`路由预加载失败: ${routePath}`, error)
    }
  }

  // 根据路径获取组件
  async getComponentByPath(routePath) {
    const routeMap = {
      '/dashboard': () => import('../views/dashboard/Index.vue'),
      '/dashboard/data-screen': () => import('../views/dashboard/DataScreen.vue'),
      '/personnel/villagers': () => import('../views/personnel/Villagers.vue'),
      '/personnel/committee': () => import('../views/personnel/Committee.vue'),
      '/economy/projects': () => import('../views/economy/Projects.vue'),
      '/economy/staff-management': () => import('../views/economy/StaffManagement.vue'),
      '/economy/transactions': () => import('../views/economy/Transactions.vue'),
      '/economy/reports': () => import('../views/economy/Reports.vue'),
      '/party/members': () => import('../views/party/PartyMembers.vue'),
      '/party/dues': () => import('../views/party/Dues.vue'),
      '/party/structure': () => import('../views/party/Structure.vue'),
      '/system/users': () => import('../views/system/Users.vue'),
      '/system/dict': () => import('../views/system/Dict.vue'),
      '/system/role': () => import('../views/system/Role.vue'),
      '/system/config': () => import('../views/system/Config.vue'),
      '/system/screen-config': () => import('../views/system/ScreenConfig.vue'),
      '/user-center': () => import('../views/UserCenter.vue')
    }

    const importFn = routeMap[routePath]
    if (importFn) {
      return await importFn()
    }
    return null
  }

  // 批量预加载路由
  async preloadRoutes(routes) {
    if (this.isPreloading) {
      this.preloadQueue.push(...routes)
      return
    }

    this.isPreloading = true
    
    try {
      // 并发预加载，但限制并发数量
      const concurrency = 3
      for (let i = 0; i < routes.length; i += concurrency) {
        const batch = routes.slice(i, i + concurrency)
        await Promise.allSettled(
          batch.map(route => this.preloadRoute(route))
        )
        
        // 添加小延迟，避免阻塞主线程
        if (i + concurrency < routes.length) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
    } finally {
      this.isPreloading = false
      
      // 处理队列中的剩余路由
      if (this.preloadQueue.length > 0) {
        const remaining = [...this.preloadQueue]
        this.preloadQueue = []
        this.preloadRoutes(remaining)
      }
    }
  }

  // 预加载常用路由
  preloadCommonRoutes() {
    const commonRoutes = [
      '/dashboard',
      '/personnel/villagers',
      '/economy/projects',
      '/party/members',
      '/user-center'
    ]
    
    this.preloadRoutes(commonRoutes)
  }

  // 预加载当前用户可能访问的路由
  preloadUserRoutes(userRole) {
    const roleRoutes = {
      admin: [
        '/dashboard',
        '/personnel/villagers',
        '/personnel/committee',
        '/economy/projects',
        '/economy/staff-management',
        '/economy/transactions',
        '/economy/reports',
        '/party/members',
        '/party/dues',
        '/party/structure',
        '/system/users',
        '/system/export',
        '/system/backup',
        '/system/config',
        '/system/screen-config',
        '/user-center'
      ],
      guest: [
        '/dashboard',
        '/personnel/villagers',
        '/personnel/committee',
        '/economy/projects',
        '/economy/staff-management',
        '/economy/transactions',
        '/party/members',
        '/party/structure',
        '/user-center'
      ]
    }

    const routes = roleRoutes[userRole] || roleRoutes.guest
    this.preloadRoutes(routes)
  }

  // 检查路由是否已预加载
  isRoutePreloaded(routePath) {
    return this.preloadedRoutes.has(routePath)
  }

  // 清理预加载缓存
  clearCache() {
    this.preloadedRoutes.clear()
    this.preloadQueue = []
  }
}

// 创建全局实例
const routePreloader = new RoutePreloader()

export default routePreloader
