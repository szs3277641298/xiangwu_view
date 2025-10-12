import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import { useMenuStore } from '../store/menu.js'

// 定义路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      // 数据看板
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/Index.vue'),
        meta: {
          requiresAuth: true,
          title: '数据看板',
          icon: 'el-icon-data-board',
          roles: ['admin'],
          isMenu: true
        }
      },
      {
        path: '/dashboard/data-screen',
        name: 'DataScreen',
        component: () => import('../views/dashboard/DataScreen.vue'),
        meta: {
          requiresAuth: true,
          title: '数据大屏',
          icon: 'el-icon-data-board',
          roles: ['admin', 'guest'],
          isMenu: false,
          hideSidebar: true
        }
      },
      
      // 人员管理
      {
        path: '/personnel',
        name: 'Personnel',
        component: () => import('../views/personnel/Layout.vue'),
        meta: {
          requiresAuth: true,
          title: '人员管理',
          icon: 'el-icon-user',
          roles: ['admin'],
          isMenu: true
        },
        redirect: '/personnel/villagers',
        children: [
          {
            path: 'committee',
            name: 'PersonnelCommittee',
            component: () => import('../views/personnel/Committee.vue'),
            meta: {
              requiresAuth: true,
              title: '村委会人员',
              roles: ['admin', 'guest'],
              isMenu: true
            }
          },
          {
            path: 'villagers',
            name: 'PersonnelVillagers',
            component: () => import('../views/personnel/Villagers.vue'),
            meta: {
              requiresAuth: true,
              title: '村内人员',
              roles: ['admin', 'guest'],
              isMenu: true
            }
          },
        ]
      },
      
      // 集体经济
      {
        path: '/economy',
        name: 'Economy',
        component: () => import('../views/economy/Layout.vue'),
        meta: {
          requiresAuth: true,
          title: '集体经济',
          icon: 'el-icon-money',
          roles: ['admin', 'guest'],
          isMenu: true
        },
        redirect: '/economy/projects',
        children: [
      {
        path: 'projects',
        name: 'EconomyProjects',
        component: () => import('../views/economy/Projects.vue'),
        meta: {
          requiresAuth: true,
          title: '项目总览',
          roles: ['admin', 'guest'],
          isMenu: true
        }
      },
      {
        path: 'staff-management',
        name: 'EconomyStaffManagement',
        component: () => import('../views/economy/StaffManagement.vue'),
        meta: {
          requiresAuth: true,
          title: '项目人员管理',
          roles: ['admin', 'guest'],
          isMenu: true
        }
      },
      {
        path: 'project-staff/:projectId',
        name: 'ProjectStaffDetail',
        component: () => import('../views/economy/ProjectStaffDetail.vue'),
        meta: {
          requiresAuth: true,
          title: '项目人员详情',
          roles: ['admin', 'guest'],
          isMenu: false
        }
      },
          {
            path: 'transactions',
            name: 'EconomyTransactions',
            component: () => import('../views/economy/Transactions.vue'),
            meta: {
              requiresAuth: true,
              title: '收支明细',
              roles: ['admin', 'guest'],
              isMenu: true
            }
          },
          {
            path: 'reports',
            name: 'EconomyReports',
            component: () => import('../views/economy/Reports.vue'),
            meta: {
              requiresAuth: true,
              title: '收益统计报表',
              roles: ['admin'],
              isMenu: true
            }
          }
        ]
      },
      
      // 党建管理
      {
        path: '/party',
        name: 'Party',
        component: () => import('../views/party/Layout.vue'),
        meta: {
          requiresAuth: true,
          title: '党建管理',
          icon: 'el-icon-flag',
          roles: ['admin', 'guest'],
          isMenu: true
        },
        redirect: '/party/members',
        children: [
          {
            path: 'members',
            name: 'PartyMembers',
            component: () => import('../views/party/PartyMembers.vue'),
            meta: {
              requiresAuth: true,
              title: '党员信息库',
              roles: ['admin', 'guest'],
              isMenu: true
            }
          },
          {
            path: 'dues',
            name: 'PartyDues',
            component: () => import('../views/party/Dues.vue'),
            meta: {
              requiresAuth: true,
              title: '党费缴纳记录',
              roles: ['admin'],
              isMenu: true
            }
          },
          {
            path: 'structure',
            name: 'PartyStructure',
            component: () => import('../views/party/Structure.vue'),
            meta: {
              requiresAuth: true,
              title: '组织架构统计',
              roles: ['admin', 'guest'],
              isMenu: true
            }
          }
        ]
      },
      
      // 系统管理
      {
        path: '/system',
        name: 'System',
        component: () => import('../views/system/Layout.vue'),
        meta: {
          requiresAuth: true,
          title: '系统管理',
          icon: 'el-icon-setting',
          roles: ['admin'],
          isMenu: true
        },
        children: [
          {
            path: 'users',
            name: 'SystemUsers',
            component: () => import('../views/system/Users.vue'),
            meta: {
              requiresAuth: true,
              title: '账号列表',
              roles: ['admin'],
              isMenu: true
            }
          },
          {
            path: 'dict',
            name: 'SystemDict',
            component: () => import('../views/system/Dict.vue'),
            meta: {
              requiresAuth: true,
              title: '字典管理',
              roles: ['admin'],
              isMenu: true
            }
          },
          {
            path: 'role',
            name: 'SystemRole',
            component: () => import('../views/system/Role.vue'),
            meta: {
              requiresAuth: true,
              title: '角色管理',
              roles: ['admin'],
              isMenu: true
            }
          },
          {
            path: 'config',
            name: 'SystemConfig',
            component: () => import('../views/system/Config.vue'),
            meta: {
              requiresAuth: true,
              title: '信息公开设置',
              roles: ['admin'],
              isMenu: true
            }
          },
          {
            path: 'screen-config',
            name: 'SystemScreenConfig',
            component: () => import('../views/system/ScreenConfig.vue'),
            meta: {
              requiresAuth: true,
              title: '大屏维度配置',
              roles: ['admin'],
              isMenu: true
            }
          }
        ]
      },
      
      // 用户中心
      {
        path: '/user-center',
        name: 'UserCenter',
        component: () => import('../views/UserCenter.vue'),
        meta: {
          requiresAuth: true,
          title: '用户中心',
          icon: 'el-icon-user-solid',
          roles: ['admin', 'guest'],
          isMenu: true
        }
      },
      
      
      // 重定向规则 - 处理直接访问子路径的情况
      {
        path: '/villagers',
        redirect: '/personnel/villagers'
      },
      {
        path: '/reports',
        redirect: '/economy/reports'
      },
      {
        path: '/staff',
        redirect: '/personnel/staff'
      },
      {
        path: '/projects',
        redirect: '/economy/projects'
      },
      {
        path: '/transactions',
        redirect: '/economy/transactions'
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 优化滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// 动态路由生成函数
const generateRoutesFromMenu = (menuList) => {
  const dynamicRoutes = []
  
  menuList.forEach(menu => {
    // 生成主路由
    const route = {
      path: menu.path,
      name: menu.name,
      component: () => import(`../views/${menu.component}`),
      meta: {
        requiresAuth: true,
        title: menu.name,
        icon: menu.icon,
        roles: menu.permission ? [menu.permission] : ['*'],
        isMenu: true
      }
    }
    
    // 如果有子菜单，添加children
    if (menu.children && menu.children.length > 0) {
      route.children = menu.children.map(child => ({
        path: child.path,
        name: child.name,
        component: () => import(`../views/${child.component}`),
        meta: {
          requiresAuth: true,
          title: child.name,
          roles: child.permission ? [child.permission] : ['*'],
          isMenu: true
        }
      }))
    }
    
    dynamicRoutes.push(route)
  })
  
  return dynamicRoutes
}

// 添加动态路由到现有路由
const addDynamicRoutes = (menuList) => {
  const dynamicRoutes = generateRoutesFromMenu(menuList)
  
  // 找到Home路由并添加动态路由作为children
  const homeRoute = routes.find(route => route.path === '/')
  if (homeRoute && homeRoute.children) {
    // 先移除所有已存在的动态菜单路由，避免重复添加
    homeRoute.children = homeRoute.children.filter(route => route.meta?.isMenu !== true)
    
    // 添加新的动态路由
    homeRoute.children.push(...dynamicRoutes)
  }
}


export default router
export { addDynamicRoutes }