import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8088/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 不需要显示提示的接口列表
const noMessageUrls = [
  '/captcha',           // 验证码
  '/auth/login',        // 登录（登录页面自己处理提示）
  '/menu/getrolemenu',  // 获取菜单（静默加载）
  '/dicttype/list',     // 字典类型列表（静默加载）
  '/dictdata/typeCode'  // 字典数据（静默加载）
]

// 检查URL是否需要显示提示
const shouldShowMessage = (url) => {
  if (!url) return true
  return !noMessageUrls.some(noMsgUrl => url.includes(noMsgUrl))
}

// 响应拦截器（统一处理成功和错误提示）
api.interceptors.response.use(
  response => {
    // 验证码请求返回完整响应（含headers），其他请求返回response.data
    const isCaptchaRequest = response.config.url && 
      (response.config.url.includes('/captcha') || response.config.url === '/captcha');
    
    if (isCaptchaRequest) {
      return response; // 保留完整响应，用于提取captcha-key
    }
    
    const res = response.data;
    const url = response.config.url;
    const method = response.config.method?.toUpperCase();
    
    // 检查业务状态码
    if (res.code === 200 && res.success !== false) {
      // 业务成功
      // 只对写操作（POST/PUT/PATCH/DELETE）显示成功提示
      if (shouldShowMessage(url) && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const successMessage = res.message || '操作成功';
      }
      return res;
    } else {
      // 业务错误，显示错误信息
      const errorMessage = res.errorMsg || res.message || '系统繁忙，请稍后重试';
      console.error('业务错误:', errorMessage, res);
      
      // 只有当存在 errorCode 和 errorMsg 时才显示错误提示
      if (shouldShowMessage(url) && res.errorCode && res.errorMsg) {
        ElMessage.error(res.errorMsg);
      }
      
      // 如果是401未授权，跳转到登录页
      if (res.code === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
      
      // 返回数据，让业务层也能处理
      return res;
    }
  },
  error => {
    console.error('HTTP请求错误:', error);
    
    const url = error.config?.url;
    let errorMessage = '请求失败';
    
    if (error.response) {
      const { status, data } = error.response;
      
      // 优先使用后端返回的错误信息
      if (data && (data.errorMsg || data.message)) {
        errorMessage = data.errorMsg || data.message;
      } else {
        // 根据HTTP状态码设置默认错误信息
        switch (status) {
          case 401:
            errorMessage = '未授权，请重新登录';
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            setTimeout(() => {
              window.location.href = '/login';
            }, 1500);
            break;
          case 403:
            errorMessage = '无权限访问';
            break;
          case 404:
            errorMessage = '请求的资源不存在';
            break;
          case 500:
            errorMessage = '服务器错误，请稍后重试';
            break;
          case 502:
            errorMessage = '网关错误';
            break;
          case 503:
            errorMessage = '服务不可用';
            break;
          default:
            errorMessage = `请求失败 (${status})`;
        }
      }
      
      console.error('错误信息:', errorMessage);
      
      // 显示错误提示
      if (shouldShowMessage(url)) {
        ElMessage.error(errorMessage);
      }
      
      // 返回格式化的错误响应，与成功响应格式一致
      return Promise.reject({
        success: false,
        code: status,
        data: null,
        message: errorMessage,
        errorCode: data?.errorCode || 'HTTP_ERROR',
        errorMsg: errorMessage
      });
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      errorMessage = '网络错误，请检查网络连接';
      console.error('网络错误: 无响应');
      
      if (shouldShowMessage(url)) {
        ElMessage.error(errorMessage);
      }
      
      return Promise.reject({
        success: false,
        code: 0,
        data: null,
        message: errorMessage,
        errorCode: 'NETWORK_ERROR',
        errorMsg: errorMessage
      });
    } else {
      // 其他错误
      errorMessage = error.message || '请求失败';
      console.error('请求配置错误:', errorMessage);
      
      if (shouldShowMessage(url)) {
        ElMessage.error(errorMessage);
      }
      
      return Promise.reject({
        success: false,
        code: 0,
        data: null,
        message: errorMessage,
        errorCode: 'REQUEST_ERROR',
        errorMsg: errorMessage
      });
    }
  }
)

// 认证相关API（登录方法无需修改，确保接收captchaKey参数即可）
export const authAPI = {
  login: (data) => {
    // 直接将data（含captchaKey）作为JSON请求体发送
    return api.post('/auth/login', data)
  },
  register: (data) => {
    return api.post('/auth/register', data)
  },
  logout: () => {
    return api.post('/auth/logout')
  },
  // 获取验证码
  getCaptcha: () => {
    // 移除responseType: 'blob'，返回默认JSON格式
    return api.get('/captcha')
  },
  // 获取用户菜单权限
  getRoleMenu: () => {
    return api.get('/menu/getrolemenu')
  },
  // 获取系统菜单
  getSysMenu: () => {
    return api.get('/menu/getsysmenus')
  },
  // 获取系统角色
  getSysRoles: (data = {}) => {
    return api.post('/role/getsysroles', data)
  },
  // 添加角色菜单
  addRoleMenu: (roleId, menuId) => {
    return api.post(`/menu/addrolemenu?roleId=${Number(roleId)}&menuId=${Number(menuId)}`)
  },
  // 删除角色菜单
  deleteRoleMenu: (roleId, menuId) => {
    return api.delete(`/menu/deleterolemenu?roleId=${Number(roleId)}&menuId=${Number(menuId)}`)
  },
  // 获取角色菜单权限
  getRoleMenu: (roleId) => {
    return api.get(`/menu/getrolemenu?roleId=${Number(roleId)}`)
  },
  sendVerificationCode: (mobile, captchaData = {}) => {
    const { captchaKey, ...requestBody } = { mobile, ...captchaData }
    const config = captchaKey ? { headers: { 'Captcha-Key': captchaKey } } : {}
    return api.post('/auth/sendVerificationCode', requestBody, config)
  },
  resetPassword: (data) => {
    return api.post('/auth/resetPassword', data)
  }
}

// 用户相关API
export const userAPI = {
  getUserInfo: () => {
    return api.get('/user/info')
  },
  getUserList: (params) => {
    return api.post('/user/userlist', params)
  },
  updateUserInfo: (data) => {
    return api.put('/user/info', data)
  },
  updatePassword: (data) => {
    // 根据后端接口，使用URL参数传递密码
    return api.put('/user/updatePassword', null, {
      params: {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      }
    })
  },
  updateUserStatus: (data) => {
    // 根据后端接口，使用URL参数传递用户ID和状态
    return api.patch('/user/updatestatus', null, {
      params: {
        userId: data.userId,
        status: data.status
      }
    })
  },
  changePassword: (data) => {
    return api.post('/user/changePassword', data)
  },
  deleteUser: (userId) => {
    return api.delete(`/user/deleteuser?userId=${userId}`)
  },
  updateUser: (data) => {
    return api.put('/user/updateuser', data)
  },
  createUser: (data) => {
    return api.post('/user/createuser', data)
  }
}

// 村内人员相关API
export const residentAPI = {
  // 获取村内人员列表（新接口）
  getResidentList: (data) => {
    return api.post('/resident/residentlist', data)
  },
  
  // 新增村内人员
  addResident: (data) => {
    return api.post('/resident/addresident', data)
  },
  // 更新村内人员
  updateResident: (data) => {
    console.log('发送更新请求:', data)
    return api.put('/resident/updateresident', data)
  },
  // 获取村内人员详情
  getResidentInfo: (id) => {
    return api.get(`/resident/residentinfo?id=${String(id)}`)
  },
  
  // 删除人员信息
  deleteResident: (id) => {
    return api.delete(`/resident/deleteresident?id=${String(id)}`)
  },
  
  // 批量导入村内人员
  batchImportResidents: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/excel/batch-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 上传村民头像
  uploadResidentPhoto: (villagerId, file) => {
    const formData = new FormData()
    // 根据修改后的后端接口，直接发送字段
    // 使用反斜杠格式，与数据库存储格式一致
    formData.append('folderName', 'villageresident\\photo')
    formData.append('image', file)
    return api.post('/upload/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => {
      // 处理返回的路径，确保格式正确
      if (response.code === 200 && response.data) {
        // 后端返回：/villageresident\\photo/filename.jpg
        // 处理成：villageresident/photo/filename.jpg
        let path = response.data
        
        // 移除开头的斜线
        if (path.startsWith('/')) {
          path = path.substring(1)
        }
        
        // 将所有反斜杠转换为正斜杠
        path = path.replace(/\\/g, '/')
        
        response.data = path
      }
      return response
    })
  },

  // 更新村民头像路径
  updateResidentPhoto: (id, url) => {
    return api.patch('/resident/updatephoto', null, {
      params: {
        id: id,
        url: url
      }
    })
  },

  // 导出村民数据到Excel
  exportResidents: (exportRequest, queryRequest) => {
    return api.post('/residentexcel/exportresident', {
      exportRequest: exportRequest,
      queryRequest: queryRequest
    })
  },

  // 导入村民数据
  importResidents: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/residentexcel/importresident', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 导出村民信息模板
  exportTemplate: (exportRequest, queryRequest) => {
    return api.post('/residentexcel/exportresident', {
      exportRequest: exportRequest,
      queryRequest: queryRequest
    }, {
      responseType: 'blob' // 设置响应类型为blob，用于文件下载
    })
  },

  // 生成村民信息填表说明模板
  generateTemplate: (request) => {
    return api.post('/residentexcel/generateTemplate', request, {
      responseType: 'blob' // 设置响应类型为blob，用于文件下载
    })
  }
}

// 党员相关API
export const partyMemberAPI = {
  // 获取党员列表
  getPartyMemberList: (data) => {
    return api.post('/partymember/partymemberlist', data)
  },
  
  // 新增党员
  addPartyMember: (data) => {
    console.log('API调用 - 新增党员:', data)
    return api.post('/partymember/addpartymember', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  
  // 更新党员信息
  updatePartyMember: (data) => {
    return api.put('/partymember/updatepartymember', data)
  },
  
  // 获取党员详情
  getPartyMemberInfo: (residentId) => {
    return api.get(`/partymember/partymemberinfo?residentId=${String(residentId)}`)
  },
  
  // 删除党员
  deletePartyMember: (residentId) => {
    return api.delete(`/partymember/deletepartymember?residentId=${String(residentId)}`)
  },
  
  // 上传党员头像
  uploadPartyMemberPhoto: (memberId, file) => {
    const formData = new FormData()
    formData.append('folderName', 'partymember\\photo')
    formData.append('image', file)
    return api.post('/upload/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => {
      // 处理返回的路径，确保格式正确
      if (response.code === 200 && response.data) {
        let path = response.data
        
        // 移除开头的斜线
        if (path.startsWith('/')) {
          path = path.substring(1)
        }
        
        // 将所有反斜杠转换为正斜杠
        path = path.replace(/\\/g, '/')
        
        response.data = path
      }
      return response
    })
  },
  
  // 更新党员头像路径
  updatePartyMemberPhoto: (id, url) => {
    return api.patch('/partymember/updatephoto', null, {
      params: {
        id: id,
        url: url
      }
    })
  },
  
  // 导出党员数据到Excel
  exportPartyMembers: (exportRequest, queryRequest) => {
    return api.post('/partymemberexcel/exportpartymember', {
      exportRequest: exportRequest,
      queryRequest: queryRequest
    })
  },

  // 导入党员数据
  importPartyMembers: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/partymemberexcel/importpartymember', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 生成党员信息填表说明模板
  generatePartyMemberTemplate: (request) => {
    return api.post('/partymemberexcel/generateTemplate', request, {
      responseType: 'blob' // 设置响应类型为blob，用于文件下载
    })
  },

  // 下载党员模板
  downloadPartyMemberTemplate: (request) => {
    return api.post('/partymemberexcel/downloadTemplate', request, {
      responseType: 'blob' // 设置响应类型为blob，用于文件下载
    })
  }
}

// 村委会相关API
export const committeeAPI = {
  // 获取村委会人员列表
  getCommitteeList: (data) => {
    return api.post('/committee/committeelist', data)
  },
  
  // 新增村委会人员
  addCommitteeMember: (data) => {
    return api.post('/committee/addcommittee', data)
  },
  
  // 更新村委会人员
  updateCommitteeMember: (data) => {
    return api.put('/committee/updatecommittee', data)
  },
  
  
  // 根据村民ID获取村委会人员详情
  getCommitteeInfoByResidentId: (residentId) => {
    return api.get(`/committee/committeeinfo?residentId=${String(residentId)}`)
  },
  
  // 删除村委会人员
  deleteCommitteeMember: (residentId) => {
    const id = Number(residentId)
    if (isNaN(id)) {
      return Promise.reject(new Error('residentId必须是有效的数字'))
    }
    return api.delete(`/committee/deletecommittee?residentId=${id}`)
  },
  
  // 上传村委会人员头像
  uploadCommitteePhoto: (memberId, file) => {
    const formData = new FormData()
    formData.append('folderName', 'committee\\photo')
    formData.append('image', file)
    return api.post('/upload/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => {
      // 处理返回的路径，确保格式正确
      if (response.code === 200 && response.data) {
        let path = response.data
        
        // 移除开头的斜线
        if (path.startsWith('/')) {
          path = path.substring(1)
        }
        
        // 将所有反斜杠转换为正斜杠
        path = path.replace(/\\/g, '/')
        
        response.data = path
      }
      return response
    })
  },
  
  // 更新村委会人员头像路径
  updateCommitteePhoto: (id, url) => {
    return api.patch('/committee/updatephoto', null, {
      params: {
        id: id,
        url: url
      }
    })
  },
  
  // 导出村委会数据到Excel
  exportCommittee: (exportRequest, queryRequest) => {
    return api.post('/committeexcel/exportcommittee', {
      exportRequest: exportRequest,
      queryRequest: queryRequest
    })
  },

  // 导入村委会数据
  importCommittee: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/committeexcel/importcommittee', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 生成村委会信息填表说明模板
  generateCommitteeTemplate: (request) => {
    return api.post('/committeexcel/generateTemplate', request, {
      responseType: 'blob' // 设置响应类型为blob，用于文件下载
    })
  },

  // 下载村委会模板
  downloadCommitteeTemplate: (request) => {
    return api.post('/committeexcel/downloadTemplate', request, {
      responseType: 'blob' // 设置响应类型为blob，用于文件下载
    })
  }
}

// 集体经济相关API
export const economyAPI = {
  // 获取集体经济列表
  getEconomyList: (data) => {
    return api.post('/economy/economylist', data)
  },
  
  // 获取集体经济详情
  getEconomyInfo: (id) => {
    return api.get(`/economy/economyinfo?id=${id}`)
  },
  
  // 新增集体经济项目
  addEconomy: (data) => {
    return api.post('/economy/addeconomy', data)
  },
  
  // 更新集体经济项目
  updateEconomy: (data) => {
    return api.put('/economy/updateeconomy', data)
  },
  
  // 删除集体经济项目
  deleteEconomy: (id) => {
    return api.delete(`/economy/deleteeconomy?id=${id}`)
  },

  // 导出集体经济数据到Excel
  exportEconomy: (exportRequest, queryRequest) => {
    return api.post('/economyexcel/exporteconomy', {
      exportRequest: exportRequest,
      queryRequest: queryRequest
    })
  },

  // 获取排序后的集体经济列表
  getEconomyListWithOrder: (orderField) => {
    return api.get(`/economy/getlistwithorder?orderField=${orderField}`)
  }
}

// 项目人员管理API
export const economyStaffAPI = {
  // 获取项目人员列表
  getEconomyStaffList: (data) => {
    return api.post('/economyStaff/economystafflist', data)
  },

  // 添加员工到项目
  addStaffToEconomy: (data) => {
    return api.post('/economyStaff/addstafftoeconomy', data)
  },

  // 更新员工信息
  updateStaffInfo: (data) => {
    return api.put('/economyStaff/updatestaffinfo', data)
  },

  // 删除员工
  deleteStaff: (objectId, residentId) => {
    return api.delete(`/economyStaff/deletestaff?ObjectId=${objectId}&ResidentId=${residentId}`)
  }
}

// 集体经济收支明细API
export const economyTransactionAPI = {
  // 获取收支明细列表
  getEconomyTransactionList: (data) => {
    return api.post('/economytransaction/economytransactionlist', data)
  },
  // 新增收支明细
  addEconomyTransaction: (data) => {
    return api.post('/economytransaction/addeconomytransaction', data)
  },
  // 更新收支明细
  updateEconomyTransaction: (data) => {
    return api.patch('/economytransaction/updateeconomytransaction', data)
  },
  // 删除收支明细
  deleteEconomyTransaction: (id) => {
    return api.delete(`/economytransaction/deleteeconomytransaction?id=${id}`)
  },
  // 导出收支明细数据
  exportEconomyTransaction: (data) => {
    return api.post('/economytransactionexcel/exporteconomytransaction', data)
  },
  // 生成收支明细导入模板
  generateTemplate: (data) => {
    return api.post('/economytransactionexcel/generateTemplate', data)
  },
  // 批量导入收支明细
  importEconomyTransaction: (data) => {
    return api.post('/economytransactionexcel/importeconomytransaction', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

// 大屏数据API
export const bigScreenAPI = {
  // 获取人口数据（总人口、男女数量等）
  getPopulationData: () => {
    return api.get('/bigscreen/populationdata')
  },
  // 获取党建数据（党员数量等）
  getPartyMemberData: () => {
    return api.get('/bigscreen/partymemberdata')
  },
  // 获取人口结构数据（按年龄）
  getPopulationStructure: () => {
    return api.get('/bigscreen/populationbyage')
  },
  // 获取人口结构数据（按收入来源）
  getPopulationByIncomeSource: () => {
    return api.get('/bigscreen/populationbyincomesource')
  },
  // 获取人口结构数据（按政治面貌）
  getPopulationByPoliticalStatus: () => {
    return api.get('/bigscreen/populationbypoliticalstatus')
  },
  // 获取人口结构数据（按性别）
  getPopulationBySex: () => {
    return api.get('/bigscreen/populationbysex')
  },
  // 获取人口结构数据（按学历）
  getPopulationByEducationLevel: () => {
    return api.get('/bigscreen/populationbyeducationlevel')
  },
  // 获取人口结构数据（按婚姻状况）
  getPopulationByMaritalStatus: () => {
    return api.get('/bigscreen/populationbymaritalstatus')
  },
  // 获取人口结构数据（按优抚情况）
  getPopulationByWelfareStatus: () => {
    return api.get('/bigscreen/populationbywelfarestatus')
  },
  // 获取布尔统计数量
  getBooleanCount: () => {
    return api.get('/bigscreen/boolencount')
  },
  // 获取党员统计总览数据
  getPartyMemberCounts: () => {
    return api.get('/bigscreen/partymembercounts')
  }
}

// 党费缴纳API
export const partyDuesAPI = {
  // 获取党费缴纳记录列表
  getPartyDuesList: (data) => {
    return api.post('/partydues/partydueslist', data)
  },
  // 添加党费缴纳记录
  addPartyDues: (data) => {
    return api.post('/partydues/addpartydues', data)
  },
  // 更新党费缴纳记录
  updatePartyDues: (data) => {
    return api.put('/partydues/updatepartydues', data)
  },
  // 删除党费缴纳记录
  deletePartyDues: (id) => {
    return api.delete(`/partydues/deletepartydues?id=${id}`)
  },
  // 导出党费缴纳记录
  exportPartyDues: (data) => {
    return api.post('/partyduesexcel/exportpartydues', data)
  },
  // 生成党费缴纳记录导入模板
  generateTemplate: (data) => {
    return api.post('/partyduesexcel/generateTemplate', data)
  },
  // 批量导入党费缴纳记录
  importPartyDues: (data) => {
    return api.post('/partyduesexcel/importpartydues', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

// 字典管理API
export const dictAPI = {
  // 字典类型管理
  getDictTypeList: (params) => api.get('/dict/type/list', { params }),
  getDictTypeById: (id) => api.get(`/dict/type/${id}`),
  getDictTypeByCode: (typeCode) => api.get(`/dict/type/code/${typeCode}`),
  createDictType: (data) => api.post('/dict/type', data),
  updateDictType: (data) => api.put('/dict/type', data),
  deleteDictType: (id) => api.delete(`/dict/type/${id}`),

  // 字典数据管理
  getDictDataList: (params) => api.get('/dict/data/list', { params }),
  getDictDataByTypeCode: (typeCode) => api.get(`/dict/data/type/${typeCode}`),
  getDictDataById: (id) => api.get(`/dict/data/${id}`),
  createDictData: (data) => api.post('/dict/createdata', data),
  updateDictData: (data) => api.put('/dict/updatedata', data),
  deleteDictData: (id) => api.delete(`/dict/deletedata/${id}`),

  // 字典工具方法
  getDictLabel: (typeCode, dictValue) => api.get('/dict/label', {
    params: { typeCode, dictValue }
  }),
  getDictValue: (typeCode, dictLabel) => api.get('/dict/value', {
    params: { typeCode, dictLabel }
  })
}

// 角色管理API
export const roleAPI = {
  // 获取系统角色列表（带查询参数）
  getSysRoles: (data) => api.post('/role/getsysroles', data),
  
  // 角色管理
  addRole: (data) => api.post('/role/addrole', data),
  updateRole: (data) => api.put('/role/updaterole', data),
  deleteRole: (id) => api.delete('/role/deleterole', { params: { id } })
}

export default api