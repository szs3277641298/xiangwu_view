<template>
  <div class="users-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2 class="page-title">
            <el-icon class="title-icon"><User /></el-icon>
            账号管理
          </h2>
          <p class="page-description">管理系统用户账号及权限设置</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-number">{{ total }}</span>
            <span class="stat-label">总用户数</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ activeUsers }}</span>
            <span class="stat-label">活跃用户</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选条件区域 -->
    <el-card class="filter-card" shadow="never">
      <!-- 搜索头部 -->
      <div class="search-header">
        <div class="search-title">
          <el-icon><Search /></el-icon>
          <span>搜索筛选</span>
        </div>
      </div>
      
      <!-- 筛选表单 -->
      <el-form :model="searchForm" class="filter-form">
        <div class="filter-section">
          <div class="section-title">
            <el-icon><User /></el-icon>
            <span>基本信息</span>
          </div>
          <div class="form-grid">
            <el-form-item label="用户名">
              <el-input
                v-model="searchForm.username"
                placeholder="请输入用户名"
                clearable
                class="form-input"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="角色">
              <el-select v-model="searchForm.role" placeholder="请选择角色" clearable style="width: 120px" :loading="rolesLoading">
                <el-option 
                  v-for="role in systemRoles" 
                  :key="role.id" 
                  :label="role.name" 
                  :value="role.id.toString()" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 100px">
                <el-option label="启用" value="1" />
                <el-option label="禁用" value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch" class="search-btn">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset" class="reset-btn">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </el-card>
    
    <!-- 数据表格 -->
    <el-card class="table-card">
      <!-- 表格头部工具栏 -->
      <div class="table-header">
        <div class="table-actions">
          <el-button type="primary" v-if="isAdmin" @click="handleAddUser">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
        </div>
      </div>
      
      <el-table v-loading="loading" :data="usersData" style="width: 100%" table-layout="auto">
        <el-table-column prop="id" label="用户ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column prop="phone" label="手机号" min-width="120">
          <template #default="{ row }">
            {{ row.phone || '未设置' }}
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleName(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="active"
              inactive-value="inactive"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEditUser(row)">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDeleteUser(row)" v-if="!isCurrentUser(row.id)">
              删除
            </el-button>
            <span v-else class="text-disabled">删除</span>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入用户" width="500px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :on-change="handleImportFileChange"
        :before-upload="beforeUpload"
        accept=".xlsx,.xls"
        drag
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 xlsx/xls 文件，且不超过 10MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImport" :loading="importLoading">确定导入</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入结果详情对话框 -->
    <ImportResultDialog
      v-model="importResultDialogVisible"
      :result-data="importResultData"
      @refresh="loadUserList"
    />

    <!-- 导出数据对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出用户数据"
      width="500px"
      :before-close="handleExportClose"
      class="export-dialog"
      center
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div class="export-container">
        <div class="export-info">
          <el-icon class="export-icon"><Download /></el-icon>
          <div class="export-text">
            <h3>准备导出用户数据</h3>
            <p>将导出当前筛选条件下的所有用户数据，共 {{ total }} 条记录</p>
          </div>
        </div>
        <div class="export-options">
          <el-form :model="exportForm" label-width="100px">
            <el-form-item label="导出格式">
              <el-radio-group v-model="exportForm.format">
                <el-radio label="excel">Excel 文件</el-radio>
                <el-radio label="csv">CSV 文件</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="包含字段">
              <el-checkbox-group v-model="exportForm.fields">
                <el-checkbox label="id">用户ID</el-checkbox>
                <el-checkbox label="username">用户名</el-checkbox>
                <el-checkbox label="role">角色</el-checkbox>
                <el-checkbox label="createTime">创建时间</el-checkbox>
                <el-checkbox label="status">状态</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <div class="export-actions">
          <el-button @click="handleExportClose">取消</el-button>
          <el-button type="primary" @click="handleConfirmExport" :loading="exportLoading">
            <el-icon><Download /></el-icon>
            确认导出
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 生成模板路径选择对话框 -->
    <el-dialog
      v-model="generateTemplateDialogVisible"
      title="选择模板文件保存路径"
      width="500px"
      :before-close="handleGenerateTemplateClose"
      class="path-dialog"
      center
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div class="path-container">
        <div class="path-form">
          <el-form :model="generateTemplateForm" label-width="120px">
            <el-form-item label="保存路径" required>
              <el-input
                v-model="generateTemplateForm.directory"
                placeholder="请输入保存路径，如：C:\Users\Desktop"
                clearable
              />
            </el-form-item>
            <el-form-item label="文件名" required>
              <el-input
                v-model="generateTemplateForm.filename"
                placeholder="请输入文件名"
                clearable
              />
            </el-form-item>
            <el-form-item label="工作表名">
              <el-input
                v-model="generateTemplateForm.sheetName"
                placeholder="请输入工作表名称"
                clearable
              />
            </el-form-item>
          </el-form>
        </div>
        
        <div class="path-actions">
          <el-button @click="handleGenerateTemplateClose">取消</el-button>
          <el-button type="primary" @click="handleConfirmGenerateTemplate" :loading="exportLoading">
            <el-icon><Document /></el-icon>
            确认生成
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑用户' : '新增用户'" 
      width="900px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="form-dialog"
      :center="true"
    >
      <div class="dialog-scroll-container">
        <el-form 
          ref="formRef" 
          :model="formData" 
          :rules="formRules" 
          label-width="120px"
        >
          <div class="form-row">
            <el-form-item label="用户名" prop="username">
              <el-input 
                v-model="formData.username" 
                placeholder="请输入用户名"
                clearable
              />
            </el-form-item>
            <el-form-item label="角色" prop="role">
              <el-select
                v-model="formData.role"
                placeholder="请选择角色"
                style="width: 100%"
                :loading="rolesLoading"
              >
                <el-option 
                  v-for="role in systemRoles" 
                  :key="role.id" 
                  :label="role.name" 
                  :value="role.id" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="formData.status"
                active-value="active"
                inactive-value="inactive"
              />
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="电话" prop="phone">
              <el-input 
                v-model="formData.phone" 
                placeholder="请输入电话号码"
                clearable
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input 
                v-model="formData.password" 
                type="password" 
                placeholder="请输入密码"
                show-password
                clearable
              />
            </el-form-item>
          </div>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isEdit ? '保存修改' : '创建用户' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    
    <!-- 批量创建访客账号对话框 -->
    <el-dialog v-model="batchCreateVisible" title="批量创建访客账号" width="600px">
      <el-form ref="batchCreateFormRef" :model="batchCreateForm" :rules="batchCreateRules" label-width="120px">
        <el-form-item label="创建数量" prop="count">
          <el-input v-model.number="batchCreateForm.count" placeholder="请输入创建数量" />
          <div class="form-tip">最多可一次性创建50个访客账号</div>
        </el-form-item>
        <el-form-item label="密码设置" prop="passwordType">
          <el-radio-group v-model="batchCreateForm.passwordType">
            <el-radio label="auto">自动生成密码</el-radio>
            <el-radio label="custom">自定义密码</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="自定义密码" prop="customPassword" v-if="batchCreateForm.passwordType === 'custom'">
          <el-input v-model="batchCreateForm.customPassword" type="password" placeholder="请输入自定义密码" />
          <div class="form-tip">密码长度至少8位，包含字母和数字</div>
        </el-form-item>
        <el-form-item label="备注" prop="batchRemark">
          <el-input v-model="batchCreateForm.batchRemark" placeholder="请输入备注" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchCreateVisible = false">取消</el-button>
          <el-button type="primary" @click="handleBatchCreateSubmit">创建</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量创建结果对话框 -->
    <el-dialog v-model="batchResultVisible" title="批量创建结果" width="800px">
      <div class="batch-result">
        <div class="result-header">
          <div class="result-info">
            <span class="success-count">成功创建 {{ batchSuccessCount }} 个访客账号</span>
            <span class="total-count">共创建 {{ batchTotalCount }} 个访客账号</span>
          </div>
          <el-button type="primary" @click="handleDownloadBatchResult">
            <el-icon><Download /></el-icon>
            下载账号列表
          </el-button>
        </div>
        <el-table :data="batchCreatedUsers" style="width: 100%">
          <el-table-column prop="username" label="用户名" width="150" />
          <el-table-column prop="account" label="账号" width="180" />
          <el-table-column prop="password" label="密码" width="150" />
          <el-table-column prop="createDate" label="创建日期" width="180" />
        </el-table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchResultVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Search, Plus, User, Download, Refresh, ArrowDown, UserFilled, Lock, InfoFilled, Close, Check, Upload, Document } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../store/index.js'
import { userAPI, authAPI } from '../../api/api.js'
import ImportResultDialog from '@/components/ImportResultDialog.vue'

// 用户状态
const userStore = useUserStore()
const currentUserId = computed(() => userStore.currentUserId || '1') // 假设当前用户ID为1

// 检查是否为管理员
const isAdmin = computed(() => {
  // 这里可以根据实际需求判断用户是否为管理员
  // 暂时返回true，让所有用户都能看到按钮
  return true
})

// 计算属性
const activeUsers = computed(() => {
  return usersData.value.filter(user => user.status === 'active').length
})

// 表格数据相关
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const usersData = ref([])

// 筛选相关
const searchForm = reactive({
  username: '',
  role: null,
  status: null
})

// 批量导入相关
const importDialogVisible = ref(false)
const importLoading = ref(false)
const selectedFile = ref(null)
const uploadRef = ref(null)
const importResultDialogVisible = ref(false)
const importResultData = ref({})

// 导出相关
const exportDialogVisible = ref(false)
const exportLoading = ref(false)
const exportForm = reactive({
  format: 'excel',
  fields: ['id', 'username', 'phone', 'role', 'createTime', 'status']
})

// 生成模板相关
const generateTemplateDialogVisible = ref(false)
const generateTemplateForm = reactive({
  directory: '',
  filename: '',
  sheetName: '用户信息模板'
})

// 模拟用户数据
const mockUsersData = [
  { id: '1', username: '系统管理员', account: 'admin', role: 'admin', status: 'active', createDate: '2023-01-01', lastLogin: '2023-06-15 14:30:25', loginCount: 125, remark: '系统超级管理员' },
  { id: '2', username: '访客账号1', account: 'guest001', role: 'guest', status: 'active', createDate: '2023-02-10', lastLogin: '2023-06-10 09:15:30', loginCount: 45, remark: '村委会访客账号' },
  { id: '3', username: '访客账号2', account: 'guest002', role: 'guest', status: 'active', createDate: '2023-02-15', lastLogin: '2023-06-05 16:45:20', loginCount: 32, remark: '乡政府访客账号' },
  { id: '4', username: '访客账号3', account: 'guest003', role: 'guest', status: 'inactive', createDate: '2023-03-01', lastLogin: '2023-04-20 11:20:15', loginCount: 18, remark: '临时访客账号' },
  { id: '5', username: '访客账号4', account: 'guest004', role: 'guest', status: 'active', createDate: '2023-03-15', lastLogin: '2023-06-12 10:30:45', loginCount: 25, remark: '县统计局访客账号' },
  { id: '6', username: '访客账号5', account: 'guest005', role: 'guest', status: 'active', createDate: '2023-04-01', lastLogin: '2023-06-08 15:20:30', loginCount: 19, remark: '组织部访客账号' },
  { id: '7', username: '访客账号6', account: 'guest006', role: 'guest', status: 'inactive', createDate: '2023-04-15', lastLogin: '2023-05-10 09:45:15', loginCount: 12, remark: '过期访客账号' },
  { id: '8', username: '访客账号7', account: 'guest007', role: 'guest', status: 'active', createDate: '2023-05-01', lastLogin: '2023-06-14 16:10:25', loginCount: 15, remark: '乡村振兴办公室访客账号' },
  { id: '9', username: '访客账号8', account: 'guest008', role: 'guest', status: 'active', createDate: '2023-05-15', lastLogin: '2023-06-13 11:50:35', loginCount: 10, remark: '农业局访客账号' },
  { id: '10', username: '访客账号9', account: 'guest009', role: 'guest', status: 'active', createDate: '2023-06-01', lastLogin: '2023-06-11 14:25:40', loginCount: 8, remark: '财政局访客账号' },
  { id: '11', username: '访客账号10', account: 'guest010', role: 'guest', status: 'active', createDate: '2023-06-10', lastLogin: '2023-06-14 10:15:20', loginCount: 5, remark: '民政局访客账号' }
]

// 对话框相关
const dialogVisible = ref(false)
const batchCreateVisible = ref(false)
const batchResultVisible = ref(false)
const isEdit = ref(false)
const selectedUserId = ref(null)
const formRef = ref(null)
const batchCreateFormRef = ref(null)

// 表单数据
const formData = reactive({
  username: '',
  role: 2, // 默认为村民角色ID
  status: 'active',
  password: '',
  phone: ''
})


const batchCreateForm = reactive({
  count: 10,
  passwordType: 'auto',
  customPassword: '',
  batchRemark: ''
})

// 批量创建结果
const batchCreatedUsers = ref([])
const batchSuccessCount = ref(0)
const batchTotalCount = ref(0)

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  password: [],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}


const batchCreateRules = {
  count: [
    { required: true, message: '请输入创建数量', trigger: 'blur' },
    { type: 'number', min: 1, max: 50, message: '创建数量在 1 到 50 之间', trigger: 'blur' }
  ],
  customPassword: [
    { required: () => batchCreateForm.passwordType === 'custom', message: '请输入自定义密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少为 8 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, message: '密码必须包含字母和数字', trigger: 'blur' }
  ],
  batchRemark: [
    { max: 200, message: '备注长度不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 判断是否为当前用户
const isCurrentUser = (userId) => {
  return userId === currentUserId.value
}

// 生成随机密码
const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// 生成账号
const generateAccount = (index) => {
  return `guest${String(index).padStart(3, '0')}`
}

// 生成用户名
const generateUsername = (index) => {
  return `访客账号${index}`
}

// 加载数据
const loadData = () => {
  // 现在直接调用API，搜索和分页都由后端处理
  loadUserList()
}

// 分页相关方法
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
  loadData()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  loadData()
}

// 筛选相关方法
const handleSearch = () => {
  currentPage.value = 1
  loadUserList()
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.role = null
  searchForm.status = null
  currentPage.value = 1
  loadUserList()
}

// 批量导入相关方法
const handleBatchImport = () => {
  importDialogVisible.value = true
}

const handleImportFileChange = (file) => {
  selectedFile.value = file.raw
}

const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!')
    return false
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  return true
}

const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择要导入的文件')
    return
  }
  
  importLoading.value = true
  try {
    // 这里应该调用实际的导入API
    // const response = await userAPI.importUsers(selectedFile.value)
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟导入结果数据
    const mockResult = {
      code: 200,
      success: true,
      message: '部分数据导入成功',
      total: 10,
      success: 7,
      skipped: 2,
      failed: 1,
      errorMsg: '导入完成：总计10条，成功7条，跳过2条，失败1条；第3行：用户名已存在，跳过导入；第8行：邮箱格式不正确；第9行：密码不能为空'
    }
    
    // 解析导入结果
    importResultData.value = mockResult
    
    // 关闭导入对话框
    importDialogVisible.value = false
    selectedFile.value = null
    uploadRef.value?.clearFiles()
    
    // 显示导入结果详情对话框
    importResultDialogVisible.value = true
    
    // 如果有成功导入的数据，刷新列表
    if (mockResult.success > 0) {
      loadUserList()
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败，请稍后重试')
  } finally {
    importLoading.value = false
  }
}

// 导出相关方法
const handleExport = async () => {
  exportDialogVisible.value = true
}

const handleExportClose = () => {
  exportDialogVisible.value = false
}

const handleConfirmExport = async () => {
  exportLoading.value = true
  try {
    // 这里应该调用实际的导出API
    // const response = await userAPI.exportUsers(exportForm)
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('导出成功')
    exportDialogVisible.value = false
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  } finally {
    exportLoading.value = false
  }
}

// 生成模板相关方法
const handleGenerateTemplate = () => {
  // 生成默认文件名
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
  generateTemplateForm.filename = `用户信息导入模板_${timestamp}`
  generateTemplateForm.sheetName = '用户信息模板'
  generateTemplateDialogVisible.value = true
}

const handleGenerateTemplateClose = () => {
  generateTemplateDialogVisible.value = false
  generateTemplateForm.directory = ''
  generateTemplateForm.filename = ''
  generateTemplateForm.sheetName = '用户信息模板'
}

const handleConfirmGenerateTemplate = async () => {
  if (!generateTemplateForm.directory || !generateTemplateForm.filename) {
    ElMessage.warning('请填写保存路径和文件名')
    return
  }
  
  exportLoading.value = true
  try {
    // 这里应该调用实际的生成模板API
    // const response = await userAPI.generateTemplate(generateTemplateForm)
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('模板生成成功')
    generateTemplateDialogVisible.value = false
  } catch (error) {
    console.error('生成模板失败:', error)
    ElMessage.error('生成模板失败，请稍后重试')
  } finally {
    exportLoading.value = false
  }
}


// 新增用户
const handleAddUser = () => {
  isEdit.value = false
  // 重置表单
  Object.keys(formData).forEach(key => {
    if (key === 'role' || key === 'status') {
      formData[key] = key === 'role' ? 2 : 'active' // 默认为村民角色ID
    } else {
      formData[key] = ''
    }
  })
  dialogVisible.value = true
}

// 编辑用户
const handleEditUser = (row) => {
  isEdit.value = true
  selectedUserId.value = row.id
  // 填充表单数据
  formData.username = row.username
  formData.role = row.role // 直接使用角色ID
  formData.status = row.status
  formData.password = '' // 编辑时不显示密码
  formData.phone = row.phone || '' // 电话字段
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 表单验证
    await formRef.value.validate()
    
    if (isEdit.value) {
      // 编辑用户 - 调用更新接口
      const updateData = {
        id: selectedUserId.value,
        username: formData.username,
        password: formData.password || null, // 如果密码为空则设为null
        role: formData.role, // 直接使用角色ID
        status: formData.status === 'active' ? 1 : 0, // 转换为后端格式
        phone: formData.phone || null // 电话字段，空字符串改为null
      }
      
      console.log('更新用户数据:', updateData) // 添加调试日志
      
      const response = await userAPI.updateUser(updateData)
      console.log('更新用户响应:', response) // 添加调试日志
      
      if (response.code === 200) {
        ElMessage.success('用户编辑成功')
        dialogVisible.value = false
        await loadUserList() // 重新加载用户列表
      } else {
        ElMessage.error(response.message || '用户编辑失败')
      }
    } else {
      // 新增用户 - 调用创建接口
      const createData = {
        username: formData.username,
        password: formData.password || '123456', // 如果密码为空，设置默认密码
        role: formData.role, // 直接使用角色ID
        status: formData.status === 'active' ? 1 : 0, // 转换为后端格式
        phone: formData.phone || null // 电话字段，空字符串改为null
      }
      
      console.log('创建用户数据:', createData) // 添加调试日志
      
      const response = await userAPI.createUser(createData)
      console.log('创建用户响应:', response) // 添加调试日志
      
      if (response.code === 200) {
        ElMessage.success('用户创建成功')
        dialogVisible.value = false
        await loadUserList() // 重新加载用户列表
      } else {
        ElMessage.error(response.message || '用户创建失败')
      }
    }
  } catch (error) {
    console.error('操作失败:', error)
    
    // 处理不同类型的错误
    if (error.response) {
      // 服务器返回了错误状态码
      const status = error.response.status
      const message = error.response.data?.message || error.response.data?.msg || '服务器错误'
      
      if (status === 400) {
        ElMessage.error(`请求参数错误: ${message}`)
      } else if (status === 500) {
        ElMessage.error(`服务器内部错误: ${message}`)
      } else {
        ElMessage.error(`请求失败 (${status}): ${message}`)
      }
      
      console.error('错误详情:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      })
    } else if (error.request) {
      // 请求已发出但没有收到响应
      ElMessage.error('网络连接失败，请检查网络设置')
      console.error('网络错误:', error.request)
    } else {
      // 其他错误
      ElMessage.error('操作失败: ' + error.message)
      console.error('其他错误:', error.message)
    }
  }
}


// 删除用户
const handleDeleteUser = (row) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.username}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await userAPI.deleteUser(row.id)
      if (response.code === 200) {
        ElMessage.success('用户删除成功')
        await loadUserList() // 重新加载用户列表
      } else {
        ElMessage.error(response.message || '用户删除失败')
      }
    } catch (error) {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 改变用户状态
const handleStatusChange = async (row) => {
  try {
    // 根据后端接口，状态参数应该是Integer类型：1=启用，0=禁用
    const newStatus = row.status === 'active' ? 1 : 0
    const response = await userAPI.updateUserStatus({
      userId: row.id,
      status: newStatus
    })
    
    if (response.code === 200) {
      ElMessage.success(`用户 "${row.username}" 状态已变更为${row.status === 'active' ? '启用' : '禁用'}`)
      // 重新加载用户列表
      await loadUserList()
    } else {
      ElMessage.error(response.message || '用户状态更新失败')
      // 如果更新失败，恢复原状态
      row.status = row.status === 'active' ? 'inactive' : 'active'
    }
  } catch (error) {
    console.error('用户状态更新失败:', error)
    ElMessage.error('用户状态更新失败')
    // 如果更新失败，恢复原状态
    row.status = row.status === 'active' ? 'inactive' : 'active'
  }
}

// 批量创建访客账号
const handleBatchCreateGuest = () => {
  batchCreateForm.count = 10
  batchCreateForm.passwordType = 'auto'
  batchCreateForm.customPassword = ''
  batchCreateForm.batchRemark = ''
  batchCreateVisible.value = true
}

// 提交批量创建
const handleBatchCreateSubmit = async () => {
  try {
    // 表单验证
    await batchCreateFormRef.value.validate()
    
    // 模拟批量创建操作
    ElMessage.success('正在创建访客账号，请稍候...')
    
    setTimeout(() => {
      // 生成模拟数据
      const createdUsers = []
      const baseIndex = mockUsersData.length + 1
      const password = batchCreateForm.passwordType === 'auto' ? null : batchCreateForm.customPassword
      
      for (let i = 0; i < batchCreateForm.count; i++) {
        const index = baseIndex + i
        createdUsers.push({
          id: String(index),
          username: generateUsername(index - 1),
          account: generateAccount(index - 1),
          password: password || generateRandomPassword(),
          role: 'guest',
          status: 'active',
          createDate: new Date().toISOString().split('T')[0],
          lastLogin: '',
          loginCount: 0,
          remark: batchCreateForm.batchRemark
        })
      }
      
      // 更新批量创建结果
      batchCreatedUsers.value = createdUsers
      batchSuccessCount.value = createdUsers.length
      batchTotalCount.value = createdUsers.length
      
      // 显示结果对话框
      batchCreateVisible.value = false
      batchResultVisible.value = true
      
      // 重新加载数据
      loadData()
    }, 1500)
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败:', error)
  }
}

// 下载批量创建结果
const handleDownloadBatchResult = () => {
  // 模拟下载操作
  ElMessage.success('账号列表已下载')
}

// 导出用户列表
const handleExportUsers = () => {
  // 模拟导出操作
  ElMessage.success('用户列表导出成功')
}

// 系统角色数据
const systemRoles = ref([])
const rolesLoading = ref(false)

// 获取系统角色
const loadSystemRoles = async () => {
  rolesLoading.value = true
  try {
    const response = await authAPI.getSysRoles({})
    if (response.code === 200) {
      systemRoles.value = response.data
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

// 根据角色ID获取角色名称
const getRoleName = (roleId) => {
  const role = systemRoles.value.find(r => r.id === roleId)
  return role ? role.name : '未知角色'
}

// 根据角色ID获取角色标签类型
const getRoleTagType = (roleId) => {
  if (roleId === 1) return 'primary' // 管理员
  if (roleId === 2) return 'success' // 村民
  return 'info' // 其他角色
}

// 从用户中心移过来的用户管理功能
// 获取用户列表（从API）
const loadUserList = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const queryParams = {
      username: searchForm.username || null,
      role: searchForm.role || null,
      status: searchForm.status || null,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    
    const response = await userAPI.getUserList(queryParams)
    if (response.code === 200) {
      // 将API数据转换为表格需要的格式
      const apiUsers = response.data.list.map(user => ({
        id: user.id,
        username: user.username,
        phone: user.phone || '', // 添加phone字段
        role: user.role, // 保持原始角色ID
        createTime: user.createTime, // 保持原始时间戳
        status: user.status === 1 ? 'active' : 'inactive' // 1=启用, 0=禁用
      }))
      
      // 使用API数据
      usersData.value = apiUsers
      total.value = response.data.total
    } else {
      ElMessage.error(response.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}


// 监听搜索条件变化
watch([() => searchForm.username, () => searchForm.role, () => searchForm.status], () => {
  currentPage.value = 1
  loadData()
}, { deep: true })

// 抑制 ResizeObserver 错误
const resizeObserverError = (e) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    e.stopImmediatePropagation()
  }
}

// 组件挂载时加载数据
onMounted(() => {
  window.addEventListener('error', resizeObserverError)
  
  // 使用 nextTick 确保 DOM 完全渲染后再加载数据
  nextTick(async () => {
    await loadSystemRoles() // 先加载角色数据
    loadUserList() // 再加载用户数据
  })
})

// 组件卸载时清理事件监听器
onUnmounted(() => {
  window.removeEventListener('error', resizeObserverError)
})
</script>

<style scoped>
.users-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* 页面头部样式 */
.page-header {
  background: white;
  border-radius: 12px;
  padding: 32px;
  color: #303133;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
  width: 100%;
  box-sizing: border-box;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.title-section {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 32px;
  color: #409eff;
}

.page-description {
  margin: 0;
  font-size: 16px;
  color: #606266;
  font-weight: 400;
  line-height: 1.5;
}

.header-stats {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* 筛选卡片样式 */
.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
}

/* 搜索头部样式 */
.search-header {
  margin-bottom: 16px;
}

.search-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.filter-form {
  margin: 0;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.section-title .el-icon {
  color: #409eff;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.form-grid .el-form-item {
  margin-bottom: 0;
}

.form-input {
  width: 100%;
}

.search-btn, .reset-btn {
  white-space: nowrap;
  margin-left: 8px;
}


.table-card {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: none;
  width: 100%;
  min-width: 0;
}

/* 表格头部工具栏样式 */
.table-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 导入导出对话框样式 */
.export-container {
  padding: 20px 0;
}

.export-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.export-icon {
  font-size: 32px;
  color: #409eff;
}

.export-text h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.export-text p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.export-options {
  margin-bottom: 20px;
}

.export-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 路径选择对话框样式 */
.path-container {
  padding: 20px 0;
}

.path-form {
  margin-bottom: 24px;
}

.path-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.table-card :deep(.el-card__body) {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
}

.el-table {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  width: 100% !important;
  min-width: 0;
}

.el-table :deep(.el-table__body-wrapper) {
  width: 100% !important;
}

.el-table :deep(.el-table__header-wrapper) {
  width: 100% !important;
}

.el-table :deep(.el-table__header) {
  background: #f8f9fa;
}

.el-table :deep(.el-table__header th) {
  background: #f8f9fa;
  color: #495057;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
}

.el-table :deep(.el-table__row:hover) {
  background: #f8f9fa;
}

.pagination {
  margin: 24px;
  display: flex;
  justify-content: flex-end;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.batch-result {
  max-height: 500px;
  overflow-y: auto;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f0f9ff;
  border-radius: 4px;
}

.result-info {
  display: flex;
  gap: 20px;
}

.success-count {
  color: #67c23a;
  font-weight: 500;
}

.total-count {
  color: #606266;
}

.text-disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .users-container {
    padding: 16px;
    gap: 16px;
  }
  
  .page-header {
    padding: 24px 20px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .header-stats {
    justify-content: center;
    gap: 20px;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .search-section {
    max-width: none;
  }
  
  .search-input {
    min-width: auto;
  }
  
  .action-section {
    justify-content: center;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .stat-number {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .users-container {
    padding: 12px;
  }
  
  .page-header {
    padding: 20px 16px;
  }
  
  .header-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-item {
    padding: 12px 16px;
  }
  
  .toolbar {
    padding: 16px;
  }
  
  .action-section {
    flex-direction: column;
    gap: 12px;
  }
}

.text-muted {
  color: #909399;
  font-style: italic;
}

/* 表单对话框样式 - 模仿村内人员页面 */
.form-dialog :deep(.el-dialog) {
  border-radius: 8px;
}

.form-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.dialog-scroll-container {
  max-height: 70vh;
  overflow-y: auto;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.form-row .el-form-item {
  margin-bottom: 0;
  margin-right: 16px;
  flex: 1;
  min-width: 200px;
}

.dialog-footer {
  text-align: right;
  padding: 10px 20px;
  border-top: 1px solid #e4e7ed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-dialog {
    width: 95% !important;
    margin: 0 auto;
  }
  
  .form-row .el-form-item {
    min-width: 100%;
    margin-right: 0;
  }
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input,
  .filter-select,
  .date-filter {
    width: 100%;
  }
  
  .toolbar-actions {
    justify-content: center;
  }
}
</style>