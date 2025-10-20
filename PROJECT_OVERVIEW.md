# 村级信息管理系统项目说明

本文档旨在快速了解 `xiangwu_view` 前端项目的整体结构、核心业务模块与主要技术实现，便于后续开发、维护及交接。

## 基础信息
- **技术框架**：Vue 3 + Vite + Pinia + Vue Router
- **UI 组件库**：Element Plus、@kjgl77/datav-vue3、ECharts（通过 `vue-echarts`）
- **数据交互**：Axios，统一封装于 `src/api/api.js`
- **环境变量**：后端接口基地址使用 `VITE_API_BASE_URL`（`.env.*` 文件）

## 常用脚本
```bash
npm run dev        # 启动本地开发服务器
npm run build      # 构建生产包（支持 --mode production/test）
npm run preview    # 本地预览构建结果
npm run lint       # ESLint 检查并自动修复
npm run type-check # Vue TSC 类型检查
```

## 目录概览
```text
src/
├─ api/                 # 统一的 REST 接口封装
├─ assets/              # 静态资源
├─ components/          # 全局复用组件（侧边栏、导入结果弹窗等）
├─ router/              # 路由表与守卫
├─ store/               # Pinia 状态管理（用户、菜单）
├─ utils/               # 工具方法（枚举、预加载、错误处理）
├─ views/               # 业务页面（仪表盘、人员、经济、党建、系统等域）
├─ App.vue              # 应用骨架与导航布局
└─ main.js              # 应用入口，注册全局插件与状态
```

## 核心页面模块
- **数据看板（`views/dashboard`）**
  - `Index.vue`：主仪表盘，展示人口结构、收入来源、政治面貌等图表，并提供跳转到数据大屏。
  - `DataScreen.vue`：全屏大屏模式，利用 DataV/ECharts 呈现重点指标、统计图。
- **人员管理（`views/personnel`）**
  - `Villagers.vue`：村民档案管理，支持快速/高级筛选、表格视图切换、批量导入导出。
  - `Committee.vue` & `CommitteeForm.vue`：村委成员维护，包含表单与岗位职责展示。
- **集体经济（`views/economy`）**
  - `Projects.vue`：项目总览，含进度、收益、风险提示。
  - `StaffManagement.vue`、`ProjectStaffDetail.vue`：项目人员分工、详情。
  - `Transactions.vue`、`Reports.vue`：收支流水与经营分析。
- **党建模块（`views/party`）**
  - `PartyMembers.vue`、`Members.vue`：党员档案、发展流程。
  - `Dues.vue`：党费缴纳记录导入/导出、统计。
  - `Structure.vue`：组织架构、职务分布展示。
- **系统设置（`views/system`）**
  - `Users.vue`：用户列表、状态切换、重置密码。
  - `Dict.vue`、`Role.vue`：数据字典与角色权限维护。
  - `Config.vue`、`ScreenConfig.vue`：系统参数与大屏配置。
- **认证与个人中心**
  - `Login.vue`：验证码登录、短信验证码、动态背景效果。
  - `Register.vue`：注册流程，校验验证码与密码强度。
  - `UserCenter.vue`：个人资料、登录日志、常用操作集合。

## 路由与导航（`src/router/index.js`）
- 静态路由涵盖登录、注册、404 重定向及基础 Layout。
- `Home` 路由下配置大量嵌套路由，基于 `meta` 控制权限、侧边栏、标题。
- 全局守卫依据 `meta.requiresAuth` 与 Pinia 用户状态进行鉴权。
- `addDynamicRoutes` 与 `generateRoutesFromMenu` 支持后端返回菜单时的动态挂载。
- `utils/routePreloader.js` 预加载常用路由组件，提高页面切换体验。

## 状态管理（`src/store`）
- `useUserStore`（`index.js`）
  - 保存 `token` 与 `userInfo`，提供登录状态、角色判定（admin/guest）等 getter。
  - 支持从 `localStorage` 恢复会话、统一登出流程。
- `useMenuStore`（`menu.js`）
  - 按角色拉取菜单 `authAPI.getRoleMenu(roleId)`，缓存顶级/子级菜单。
  - 提供加载状态与错误处理，便于侧边栏和路由动态更新。

## API 封装（`src/api/api.js`）
- 基于 Axios 创建实例，配置超时、Token 注入、统一错误提示。
- 响应拦截器针对写操作（POST/PUT/PATCH/DELETE）出具提示，对 401 做自动登出跳转。
- 按业务域划分服务：
  - `authAPI`：登录、注册、验证码、角色菜单等鉴权接口。
  - `userAPI`：用户增删改、密码更新、状态调整。
  - `residentAPI`：村民档案 CRUD、批量导入导出。
  - `partyMemberAPI`、`partyDuesAPI`：党建成员与党费管理。
  - `committeeAPI`：村委成员维护。
  - `economyAPI`、`economyStaffAPI`、`economyTransactionAPI`、`economyExcelAPI`：项目、人员、资金流水、报表导出。
  - `dictAPI`、`roleAPI`：数据字典与角色权限数据。
  - `bigScreenAPI`：大屏统计数据（人口、经济、党建、特定群体等）。
- `multipart/form-data` 上传、导出、模板生成等场景均已在各 API 中封装。

## 公共组件
- `Sidebar.vue`：动态菜单侧边栏，支持折叠、图标映射、加载态显示。
- `ImportResultDialog.vue`：批量导入结果解析，拆分成功/跳过/失败明细。
- `LoadingSpinner.vue`：全局加载状态。
- `DynamicBackground.vue`：登录页渐变背景动效。

## 工具与辅助
- `utils/constants.js`：人员、政治面貌、教育程度等枚举及 label 映射。
- `utils/errorHandler.js`：统一的错误信息提取与展示。
- `utils/routePreloader.js`：路由组件并发预加载与缓存管理。
- `utils/imageCache.js`：图片缓存占位（当前为空实现，预留扩展）。

## 交互流程速览
1. `main.js` 启动应用时加载用户信息，确保刷新后仍保持登录态。
2. 进入受保护路由时，路由守卫校验 `token`，未登录则跳转登录页。
3. 登录成功后，通过 `useMenuStore.fetchUserMenu` 拉取菜单；`App.vue` 中根据菜单补齐动态路由并渲染侧边栏。
4. 各业务页面调用对应 API，获取数据后使用 Element Plus 表格、表单、弹窗等组件展示。
5. 导入功能统一复用 `ImportResultDialog` 呈现结果详情。

## 开发注意事项
- 确保 `.env.development` 中配置了有效的 `VITE_API_BASE_URL`，否则 Axios 默认指向 `http://localhost:8088/api`。
- 某些接口在响应拦截器中静默处理（如验证码、菜单、字典），需要在调用处自行提示。
- 大屏、图表场景大量依赖 ECharts，注意按需清理实例避免内存泄露。
- 文件较大（如 `views/economy/Projects.vue`），建议拆分子组件以提高可维护性。

## 可深入的优化方向
- 将人员/经济/党建等长页面组件拆分为组合式函数或子组件，提升可读性。
- 引入类型定义（例如使用 TypeScript 或定义 `.d.ts`）以规范后端返回结构。
- 完善单元测试或端到端测试，保障复杂表单和导入流程的稳定性。
- 扩展 `imageCache` 与离线缓存支持，进一步提高首屏和图片加载体验。

---

若需进一步了解某个模块，可直接查看对应源码文件或与后端接口文档保持同步更新。
