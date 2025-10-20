<template>
  <div class="user-center">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2 class="page-title">
            <el-icon class="title-icon"><User /></el-icon>
            个人中心
          </h2>
          <p class="page-description">管理您的个人信息和账户设置</p>
        </div>
      </div>
    </div>
    
    <!-- 用户信息卡片 -->
    <el-card class="user-card" shadow="never">
      <div class="user-info-content">
        <div class="user-info">
          <h3 class="username">{{ userInfo.username || '未知用户' }}</h3>
          <div class="user-details">
            <div class="detail-item">
              <span class="label">用户ID:</span>
              <span class="value">{{ userInfo.id || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">角色:</span>
              <span class="value">{{ roleName || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">手机号:</span>
              <span class="value">{{ userInfo.phone || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">创建时间:</span>
              <span class="value">{{ formatTime(userInfo.createTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">状态:</span>
              <el-tag :type="userInfo.status === 1 ? 'success' : 'danger'" size="small">
                {{ userInfo.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 修改密码卡片 -->
    <el-card class="password-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>
      
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input 
            v-model="passwordForm.currentPassword" 
            type="password" 
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitPassword" :loading="loading">
            修改密码
          </el-button>
          <el-button @click="resetPassword">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { userAPI, roleAPI } from '../api/api.js'

// 用户信息
const userInfo = ref({})
const roleList = ref([])
const loading = ref(false)

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码修改表单验证规则
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符之间', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符之间', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value && value === passwordForm.currentPassword) {
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
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 表单引用
const passwordFormRef = ref(null)

// 计算角色名称
const roleName = computed(() => {
  if (!userInfo.value.role || !roleList.value.length) return '未知角色'
  const role = roleList.value.find(r => r.id === userInfo.value.role)
  return role ? role.name : '未知角色'
})

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 提交密码修改
const submitPassword = async () => {
  if (!passwordFormRef.value) return
  
  passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await userAPI.updatePassword({
          oldPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
        
        if (response.code === 200) {
          ElMessage.success('密码修改成功')
          resetPassword()
        } else {
          ElMessage.error(response.message || '密码修改失败')
        }
      } catch (error) {
        console.error('密码修改失败:', error)
        ElMessage.error('密码修改失败')
      } finally {
        loading.value = false
      }
    } else {
      ElMessage.error('请检查表单信息')
    }
  })
}

// 重置密码表单
const resetPassword = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate()
  }
}

// 获取用户信息
const loadUserInfo = async () => {
  loading.value = true
  try {
    const response = await userAPI.getUserInfo()
    if (response.code === 200) {
      userInfo.value = response.data
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

// 获取角色列表
const loadRoleList = async () => {
  try {
    const response = await roleAPI.getSysRoles({})
    if (response.code === 200) {
      roleList.value = response.data
    } else {
      console.error('获取角色列表失败:', response.message)
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

// 组件挂载时
onMounted(() => {
  loadUserInfo()
  loadRoleList()
})
</script>

<style scoped>
.user-center {
  padding: 16px;
  min-height: 100%;
  overflow: visible !important;
}

/* 页面头部样式 - 与其他页面统一 */
.page-header {
  background: white;
  border-radius: 12px;
  padding: 32px;
  color: #303133;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 20px;
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
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 24px;
  color: #409eff;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

/* 用户信息卡片 */
.user-card {
  margin-bottom: 20px;
}

.user-info-content {
  display: flex;
  align-items: flex-start;
}

.user-info {
  flex: 1;
  width: 100%;
}

.username {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 500;
  color: #303133;
}

.user-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item .label {
  font-weight: 500;
  color: #909399;
  min-width: 80px;
}

.detail-item .value {
  color: #303133;
  font-weight: 500;
}

/* 修改密码卡片 */
.password-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-center {
    padding: 12px;
  }
  
  .page-header {
    padding: 24px 20px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .user-info-content {
    text-align: center;
  }
  
  .user-details {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 20px 16px;
  }
}

/* 强制滚动样式 */
:deep(.content-wrapper) {
  overflow-y: auto !important;
  height: calc(100vh - 60px) !important;
  max-height: calc(100vh - 60px) !important;
  position: static !important;
}

:deep(.content-wrapper) > * {
  overflow: visible !important;
}
</style>