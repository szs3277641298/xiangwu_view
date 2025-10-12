<template>
  <div class="role-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <div class="page-title">
            <el-icon class="title-icon"><User /></el-icon>
            角色管理
          </div>
          <div class="page-description">
            管理系统角色信息，包括角色的添加、编辑、删除等操作
          </div>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <div class="stat-number">{{ roleList.length }}</div>
            <div class="stat-label">总角色数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选卡片 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="角色名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入角色名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="searchForm.description"
            placeholder="请输入角色描述"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="Search">
            搜索
          </el-button>
          <el-button @click="handleReset" icon="Refresh">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 角色管理卡片区域 -->
    <el-card class="table-card" shadow="never">
      <div class="table-header">
        <div class="table-actions">
          <el-button type="primary" @click="handleAddRole" icon="Plus">
            新增角色
          </el-button>
          <el-button @click="handleExport" icon="Download">
            导出数据
          </el-button>
        </div>
      </div>

      <!-- 角色卡片列表 -->
      <div class="role-cards" v-loading="loading">
        <div 
          v-for="role in roleList" 
          :key="role.id" 
          class="role-card"
        >
          <div class="card-header">
            <div class="role-info">
              <div class="role-name">{{ role.name }}</div>
              <div class="role-id">ID: {{ role.id }}</div>
            </div>
          </div>
          
          <div class="card-content">
            <div class="role-description">
              <span class="label">描述：</span>
              <span class="value">{{ role.description || '暂无描述' }}</span>
            </div>
          </div>
          
          <div class="card-actions">
            <el-button type="primary" size="small" @click="handleEditRole(role)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteRole(role)">
              删除
            </el-button>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="roleList.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无角色数据" />
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      class="form-dialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="dialog-scroll-container"
      >
        <div class="form-row">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入角色名称" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入角色描述"
            />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Plus, Download, Search, Refresh } from '@element-plus/icons-vue'
import { roleAPI } from '../../api/api.js'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const roleList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()

// 搜索表单
const searchForm = reactive({
  name: '',
  description: ''
})


// 表单数据
const formData = reactive({
  id: null,
  name: '',
  description: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载角色列表
const loadRoleList = async () => {
  loading.value = true
  try {
    // 过滤掉空值，只传递有值的搜索条件
    const searchParams = {}
    if (searchForm.name && searchForm.name.trim()) {
      searchParams.name = searchForm.name.trim()
    }
    if (searchForm.description && searchForm.description.trim()) {
      searchParams.description = searchForm.description.trim()
    }
    
    console.log('搜索参数:', searchParams)
    console.log('原始搜索表单:', searchForm)
    
    const response = await roleAPI.getSysRoles(searchParams)
    if (response.code === 200) {
      roleList.value = response.data || []
    } else {
      throw new Error(response.message || '获取角色列表失败')
    }
  } catch (error) {
    console.error('加载角色列表失败:', error)
    ElMessage.error('加载角色列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  console.log('执行搜索，搜索表单:', searchForm)
  loadRoleList()
}

// 重置
const handleReset = () => {
  console.log('重置搜索条件')
  Object.assign(searchForm, {
    name: '',
    description: ''
  })
  loadRoleList()
}

// 添加角色
const handleAddRole = () => {
  dialogTitle.value = '新增角色'
  Object.assign(formData, {
    id: null,
    name: '',
    description: ''
  })
  dialogVisible.value = true
}

// 编辑角色
const handleEditRole = (row) => {
  dialogTitle.value = '编辑角色'
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    description: row.description || ''
  })
  dialogVisible.value = true
}

// 删除角色
const handleDeleteRole = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${row.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await roleAPI.deleteRole(row.id)
    ElMessage.success('删除成功')
    loadRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
      ElMessage.error('删除失败')
    }
  }
}


// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (formData.id) {
      // 更新角色
      await roleAPI.updateRole(formData)
      ElMessage.success('更新成功')
    } else {
      // 添加角色
      await roleAPI.addRole(formData)
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
    loadRoleList()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 组件挂载
onMounted(() => {
  loadRoleList()
})
</script>

<style scoped>
.role-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

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

.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.table-card {
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

.table-header {
  padding: 20px 24px;
  background: #fafbfc;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-start;
}

.table-actions {
  display: flex;
  gap: 12px;
}

/* 角色卡片样式 */
.role-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 24px;
}

.role-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #409eff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.role-info {
  flex: 1;
}

.role-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.role-id {
  font-size: 14px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}


.card-content {
  margin-bottom: 16px;
}

.role-description {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.label {
  color: #606266;
  font-weight: 500;
  min-width: 80px;
  flex-shrink: 0;
}

.value {
  color: #303133;
  flex: 1;
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.form-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.form-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.dialog-scroll-container {
  max-height: 60vh;
  overflow-y: auto;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row .el-form-item {
  flex: 1;
  margin-bottom: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-dialog .el-form {
  padding: 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .header-stats {
    justify-content: center;
  }
  
  .role-cards {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .role-container {
    padding: 12px;
  }
  
  .page-header {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .table-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .role-cards {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 16px;
  }
  
  .role-card {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 20px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .header-stats {
    gap: 20px;
  }
  
  .role-cards {
    padding: 12px;
  }
  
  .role-card {
    padding: 12px;
  }
  
  .role-name {
    font-size: 16px;
  }
  
  .card-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
