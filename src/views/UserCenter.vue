<template>
  <div class="user-center">
    <!-- 页面标题 -->
    <div class="page-title">
      <h2>个人中心</h2>
      <p>管理您的个人信息和账户设置</p>
    </div>
    
    <!-- 用户信息卡片 -->
    <div class="user-info-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="avatar-container">
            <el-avatar :size="120" class="user-avatar">
              <span>{{ username.substring(0, 2) }}</span>
            </el-avatar>
          </div>
        </el-col>
        
        <el-col :span="18">
          <div class="user-details">
            <h3>{{ username }}</h3>
            <p class="user-role">{{ roleName }}</p>
            <div class="user-meta">
              <el-tag size="small" v-if="isOnline">在线</el-tag>
              <span>上次登录: {{ lastLoginTime }}</span>
              <span>账户ID: {{ userId }}</span>
            </div>
            <el-button type="text" @click="showUserInfoDetail">
              查看详情 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-col>
      </el-row>
    </div>
    
    
    <!-- 账户设置 -->
    <div class="account-settings">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>账户设置</span>
          </div>
        </template>
        
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="基本信息" name="basic">
            <el-form :model="userForm" :rules="rules" ref="userFormRef" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="用户名" prop="username">
                    <el-input v-model="userForm.username" placeholder="请输入用户名" disabled />
                  </el-form-item>
                  
                  <el-form-item label="用户ID" prop="userId">
                    <el-input v-model="userForm.userId" placeholder="用户ID" disabled />
                  </el-form-item>
                  
                  <el-form-item label="角色" prop="role">
                    <el-input v-model="userForm.role" placeholder="角色" disabled />
                  </el-form-item>
                </el-col>
                
                <el-col :span="12">
                  <el-form-item label="创建时间" prop="createTime">
                    <el-input v-model="userForm.createTime" placeholder="创建时间" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item>
                <el-button type="primary" @click="submitUserForm" :loading="loading">保存修改</el-button>
                <el-button @click="resetUserForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="安全设置" name="security">
            <el-form :model="securityForm" :rules="securityRules" ref="securityFormRef" label-width="120px">
              <el-form-item label="当前密码" prop="currentPassword">
                <el-input v-model="securityForm.currentPassword" type="password" placeholder="请输入当前密码" />
              </el-form-item>
              
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="securityForm.newPassword" type="password" placeholder="请输入新密码" />
              </el-form-item>
              
              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input v-model="securityForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="submitSecurityForm" :loading="loading">修改密码</el-button>
                <el-button @click="resetSecurityForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          
        </el-tabs>
      </el-card>
    </div>
    
    <!-- 用户详情对话框 -->
    <el-dialog v-model="showUserDetailDialog" title="用户详情" width="600px">
      <div class="user-detail-info">
        <div class="detail-row">
          <span class="detail-label">用户ID:</span>
          <span class="detail-value">{{ userId }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">用户名:</span>
          <span class="detail-value">{{ username }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">角色:</span>
          <span class="detail-value">{{ roleName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">创建时间:</span>
          <span class="detail-value">{{ registerTime }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">最后登录:</span>
          <span class="detail-value">{{ lastLoginTime }}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUserDetailDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useUserStore } from '../store/index.js'
import { ElMessage } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import { userAPI } from '../api/api.js'

const userStore = useUserStore()

// 用户信息
const username = ref('')
const roleName = ref('')
const userId = ref('')
const lastLoginTime = ref('')
const registerTime = ref('')
const loading = ref(false)


// 选项卡
const activeTab = ref('basic')


// 用户表单数据
const userForm = reactive({
  username: '',
  userId: '',
  role: '',
  createTime: ''
})

// 用户表单验证规则
const rules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' }
  ],
  userId: [
    { required: true, message: '用户ID不能为空', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '角色不能为空', trigger: 'blur' }
  ],
  createTime: [
    { required: true, message: '创建时间不能为空', trigger: 'blur' }
  ]
}

// 安全设置表单
const securityForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 安全设置表单验证规则
const securityRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符之间', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符之间', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value && value === securityForm.currentPassword) {
          callback(new Error('新密码不能与当前密码相同'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== securityForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 对话框状态
const showUserDetailDialog = ref(false)

// 表单引用
const userFormRef = ref(null)
const securityFormRef = ref(null)


// 显示用户详情
const showUserInfoDetail = () => {
  showUserDetailDialog.value = true
}


// 提交用户表单
const submitUserForm = () => {
  if (!userFormRef.value) return
  
  userFormRef.value.validate((valid) => {
    if (valid) {
      // 这里应该调用更新用户信息的 API
      // 模拟更新成功
      ElMessage.success('个人信息更新成功')
    } else {
      ElMessage.error('请检查表单信息')
      return false
    }
  })
}

// 重置用户表单
const resetUserForm = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
}

// 提交安全表单
const submitSecurityForm = async () => {
  if (!securityFormRef.value) return
  
  securityFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await userAPI.updatePassword({
          oldPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword
        })
        
        if (response.code === 200) {
          ElMessage.success('密码修改成功')
          resetSecurityForm()
        } else {
          ElMessage.error(response.message || '密码修改失败')
        }
      } catch (error) {
        console.error('密码修改失败:', error)
        ElMessage.error('密码修改失败')
      }
    } else {
      ElMessage.error('请检查表单信息')
      return false
    }
  })
}

// 重置安全表单
const resetSecurityForm = () => {
  securityForm.currentPassword = ''
  securityForm.newPassword = ''
  securityForm.confirmPassword = ''
  if (securityFormRef.value) {
    securityFormRef.value.clearValidate()
  }
}


// 获取用户信息
const loadUserInfo = async () => {
  loading.value = true
  try {
    const response = await userAPI.getUserInfo()
    if (response.code === 200) {
      const userData = response.data
      username.value = userData.username || ''
      userId.value = userData.id || ''
      roleName.value = userData.role === 1 ? '管理员' : '普通用户'
      registerTime.value = userData.createTime ? new Date(userData.createTime).toLocaleString() : '未知'
      lastLoginTime.value = '刚刚'
      
      // 填充表单数据
      userForm.username = userData.username || ''
      userForm.userId = userData.id || ''
      userForm.role = userData.role === 1 ? '管理员' : '普通用户'
      userForm.createTime = userData.createTime ? new Date(userData.createTime).toLocaleString() : '未知'
    } else {
      ElMessage.error(response.message || '获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}


// 组件挂载时
onMounted(() => {
  // 抑制 ResizeObserver 错误
  const resizeObserverError = (e) => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
      e.stopImmediatePropagation()
    }
  }
  window.addEventListener('error', resizeObserverError)
  
  loadUserInfo()
  
  // 清理事件监听器
  onUnmounted(() => {
    window.removeEventListener('error', resizeObserverError)
  })
})
</script>

<style scoped>
.user-center {
  padding: 16px;
  min-height: 100%;
  overflow: visible !important;
}

.page-title {
  margin-bottom: 20px;
}

.page-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-title p {
  margin: 8px 0 0 0;
  color: #909399;
  font-size: 14px;
}

/* 用户信息卡片 */
.user-info-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-avatar {
  margin-bottom: 16px;
  background-color: #409eff;
}

.change-avatar-btn {
  width: 120px;
}

.user-details {
  padding: 16px 0;
}

.user-details h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 500;
  color: #303133;
}

.user-role {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 14px;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #909399;
}

.user-meta .el-tag {
  margin-right: 8px;
}


/* 账户设置 */
.account-settings {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}


/* 用户详情对话框 */
.user-detail-info {
  padding: 16px 0;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-label {
  width: 100px;
  color: #909399;
  font-size: 14px;
}

.detail-value {
  flex: 1;
  color: #303133;
  font-size: 14px;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .user-center {
    padding: 12px;
  }
  
  
}

/* 强制滚动样式 - 确保用户中心可以滚动 */
:deep(.content-wrapper) {
  overflow-y: auto !important;
  height: calc(100vh - 60px) !important;
  max-height: calc(100vh - 60px) !important;
  position: static !important;
}

:deep(.content-wrapper) > * {
  overflow: visible !important;
}

/* 确保表格内容可以正常显示 */
el-table {
  overflow: visible !important;
}
</style>