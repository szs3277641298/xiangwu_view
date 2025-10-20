<template>
  <div class="dictionary-container">
    <!-- 字典头部 -->
    <div class="dictionary-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="dictionary-title">
            <el-icon class="title-icon"><Reading /></el-icon>
            系统字典
          </h1>
          <p class="dictionary-subtitle">管理系统配置和枚举数据</p>
        </div>
      </div>
    </div>
    
    <!-- 字典主体 -->
    <div class="dictionary-body">
      <!-- 字典类型列表 -->
      <div class="dict-types-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><List /></el-icon>
            字典类型
          </h2>
          <div class="section-actions">
            <el-button type="text" @click="refreshTypes">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
        </div>
      </div>
      
        <div class="types-grid" v-loading="typeLoading">
          <div 
            v-for="type in dictTypeList" 
            :key="type.id"
            class="type-card"
            @click="toggleTypeExpansion(type.id)"
          >
            <div class="type-header">
              <div class="type-info">
                <h3 class="type-name">{{ type.typeName }}</h3>
                <p class="type-code">{{ type.typeCode }}</p>
                <p class="type-description">{{ type.description || '暂无描述' }}</p>
          </div>
              <div class="type-status">
                <el-tag 
                  :type="type.status === 1 ? 'success' : 'danger'"
                  class="status-tag"
                >
                  {{ type.status === 1 ? '启用' : '禁用' }}
                </el-tag>
          </div>
        </div>
            
            <!-- 展开的字典数据 -->
            <div 
              v-if="expandedTypes.includes(type.id)" 
              class="type-data-section"
            >
              <div class="data-header">
                <h4 class="data-title">
                  <el-icon><DataBoard /></el-icon>
                  字典数据
                </h4>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click.stop="handleAddDataForType(type.id)"
                  class="add-data-btn"
                >
            <el-icon><Plus /></el-icon>
                  新增数据
          </el-button>
      </div>
      
              <div class="data-list" v-loading="dataLoading">
                <div 
                  v-for="data in getDataForType(type.id)" 
                  :key="data.id"
                  class="data-item"
                >
                  <div class="data-content">
                    <div class="data-label">
                      <span class="label-text">{{ data.dictLabel }}</span>
                      <span class="label-value">{{ data.dictValue }}</span>
                    </div>
                    <div class="data-status">
                      <el-tag
                        :type="data.isChanged === 1 ? 'success' : 'danger'"
                        size="small"
                        class="status-tag"
                      >
                        {{ data.isChanged === 1 ? '可修改' : '不可修改' }}
                      </el-tag>
                    </div>
                    <p class="data-remark" v-if="data.remark">{{ data.remark }}</p>
                  </div>
                  <div class="data-actions">
                    <el-button
                      type="text"
                      size="small"
                      @click.stop="handleEditData(data)"
                      :disabled="data.isChanged === 0"
                      class="data-action-btn"
                      :title="data.isChanged === 0 ? '不可修改的数据' : '编辑'"
                    >
                      <el-icon><Edit /></el-icon>
                      </el-button>
                    <el-button
                      type="text"
                      size="small"
                      @click.stop="handleDeleteData(data)"
                      :disabled="data.isChanged === 0"
                      class="data-action-btn danger"
                      :title="data.isChanged === 0 ? '不可修改的数据' : '删除'"
                    >
                      <el-icon><Delete /></el-icon>
                      </el-button>
              </div>
            </div>
                
                <div v-if="getDataForType(type.id).length === 0" class="empty-data">
                  <el-icon class="empty-icon"><DocumentRemove /></el-icon>
                  <p>暂无字典数据</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="typePagination.total > 0">
        <el-pagination
          v-model:current-page="typePagination.current"
          v-model:page-size="typePagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="typePagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadDictTypeList"
          @current-change="loadDictTypeList"
            class="dict-pagination"
        />
      </div>
      </div>
    </div>
    
    
    <!-- 字典数据表单对话框 -->
    <el-dialog
      v-model="dataDialogVisible"
      :title="dataDialogTitle"
      width="600px"
      class="dict-dialog"
      @close="resetDataForm"
    >
      <div class="dialog-content">
      <el-form
        ref="dataFormRef"
        :model="dataForm"
        :rules="dataFormRules"
        label-width="100px"
          class="dict-form"
        >
          <div class="form-section">
            <div class="section-header">
              <el-icon class="section-icon"><List /></el-icon>
              <span class="section-title">字典数据</span>
            </div>
            <div class="form-fields">
              <el-form-item label="字典标签" prop="dictLabel" class="form-item">
                <el-input 
                  v-model="dataForm.dictLabel" 
                  placeholder="请输入字典标签"
                  class="form-input"
                  clearable
                >
                  <template #prefix>
                    <el-icon><PriceTag /></el-icon>
                  </template>
                </el-input>
        </el-form-item>
              <el-form-item label="字典键值" prop="dictValue" class="form-item">
                <el-input 
                  v-model="dataForm.dictValue" 
                  placeholder="请输入字典键值"
                  class="form-input"
                  clearable
                >
                  <template #prefix>
                    <el-icon><Key /></el-icon>
                  </template>
                </el-input>
        </el-form-item>
              <el-form-item label="备注" prop="remark" class="form-item">
          <el-input
            v-model="dataForm.remark"
            type="textarea"
            :rows="3"
                  placeholder="请输入备注信息"
                  class="form-textarea"
                  resize="none"
          />
        </el-form-item>
              <el-form-item label="修改状态" class="form-item">
                <div class="status-display">
                  <el-tag
                    :type="dataForm.isChanged === 1 ? 'success' : 'danger'"
                    class="status-tag"
                  >
                    {{ dataForm.isChanged === 1 ? '可修改' : '不可修改' }}
                  </el-tag>
                  <span class="status-text">
                    {{ dataForm.isChanged === 1 ? '该字典数据可以进行编辑和删除操作' : '该字典数据已被锁定，无法进行编辑和删除操作' }}
                  </span>
                </div>
              </el-form-item>
            </div>
          </div>
      </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dataDialogVisible = false" class="cancel-btn">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
          <el-button type="primary" @click="handleDataSubmit" class="submit-btn">
            <el-icon><Check /></el-icon>
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
import { Plus, Setting, Search, Refresh, Download, Key, Document, Edit, CircleCheck, CircleClose, Close, Check, List, PriceTag, Reading, DataBoard, Delete, DocumentRemove } from '@element-plus/icons-vue'
import { dictAPI } from '@/api/api.js'

// 响应式数据
const typeLoading = ref(false)
const dataLoading = ref(false)
const dictTypeList = ref([])
const dictDataList = ref([])
const expandedTypes = ref([])

// 分页数据
const typePagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 对话框状态
const dataDialogVisible = ref(false)
const dataDialogTitle = ref('')

// 表单引用
const dataFormRef = ref()

// 字典数据表单
const dataForm = reactive({
  id: null,
  typeCode: '',
  dictLabel: '',
  dictValue: '',
  remark: '',
  isChanged: 1
})

// 表单验证规则
const dataFormRules = {
  dictLabel: [
    { required: true, message: '请输入字典标签', trigger: 'blur' }
  ],
  dictValue: [
    { required: true, message: '请输入字典键值', trigger: 'blur' }
  ]
}

// 获取字典类型列表
const loadDictTypeList = async () => {
  try {
    typeLoading.value = true
    const response = await dictAPI.getDictTypeList({
      pageNum: typePagination.current,
      pageSize: typePagination.size
    })
    if (response.code === 200) {
    dictTypeList.value = response.data.list || []
    typePagination.total = response.data.total || 0
    }
  } catch (error) {
    console.error('获取字典类型列表失败:', error)
    ElMessage.error('获取字典类型列表失败')
  } finally {
    typeLoading.value = false
  }
}

// 获取字典数据列表
const loadDictDataList = async (typeCode) => {
  try {
    dataLoading.value = true
    const response = await dictAPI.getDictDataByTypeCode(typeCode)
    if (response.code === 200) {
      return response.data || []
    }
    return []
  } catch (error) {
    console.error('获取字典数据列表失败:', error)
    return []
  } finally {
    dataLoading.value = false
  }
}

// 切换类型展开状态
const toggleTypeExpansion = async (typeId) => {
  const index = expandedTypes.value.indexOf(typeId)
    if (index > -1) {
    expandedTypes.value.splice(index, 1)
  } else {
    expandedTypes.value.push(typeId)
    // 获取该类型的typeCode
  const type = dictTypeList.value.find(t => t.id === typeId)
  if (type) {
      // 使用typeCode加载数据
      const data = await loadDictDataList(type.typeCode)
      type.dataList = data
    }
  }
}

// 获取指定类型的数据
const getDataForType = (typeId) => {
  const type = dictTypeList.value.find(t => t.id === typeId)
  return type?.dataList || []
}



// 新增字典数据
const handleAddDataForType = (typeId) => {
  dataDialogTitle.value = '新增字典数据'
  resetDataForm()
  // 获取该类型的typeCode
  const type = dictTypeList.value.find(t => t.id === typeId)
  if (type) {
    dataForm.typeCode = type.typeCode
  }
  dataDialogVisible.value = true
}

// 编辑字典数据
const handleEditData = (row) => {
  dataDialogTitle.value = '编辑字典数据'
  // 只复制表单需要的字段，忽略后端返回的额外字段
  dataForm.id = row.id
  dataForm.typeCode = row.typeCode
  dataForm.dictLabel = row.dictLabel
  dataForm.dictValue = row.dictValue
  dataForm.remark = row.remark
  dataForm.isChanged = row.isChanged || 1
  dataDialogVisible.value = true
}

// 删除字典数据
const handleDeleteData = async (row) => {
  try {
    // 检查是否为不可删除的数据
    if (row.isChanged === 0) {
      ElMessage.warning('该字典数据已被锁定，无法删除')
      return
    }

    await ElMessageBox.confirm('确定要删除这个字典数据吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await dictAPI.deleteDictData(row.id)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      // 重新加载该类型的数据
      const type = dictTypeList.value.find(t => t.id === row.typeCode)
      if (type) {
        const data = await loadDictDataList(type.typeCode)
        type.dataList = data
      }
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除字典数据失败:', error)
      ElMessage.error('删除失败')
    }
  }
}


// 提交字典数据表单
const handleDataSubmit = async () => {
  try {
    await dataFormRef.value.validate()

    // 检查是否为不可修改的数据
    if (dataForm.id && dataForm.isChanged === 0) {
      ElMessage.warning('该字典数据已被锁定，无法修改')
      return
    }

    const response = dataForm.id
      ? await dictAPI.updateDictData(dataForm)
      : await dictAPI.createDictData(dataForm)

    if (response.code === 200) {
      ElMessage.success(dataForm.id ? '编辑成功' : '新增成功')
      dataDialogVisible.value = false
      // 重新加载该类型的数据
      const type = dictTypeList.value.find(t => t.typeCode === dataForm.typeCode)
      if (type) {
        const data = await loadDictDataList(type.typeCode)
        type.dataList = data
      }
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('提交表单失败:', error)
  }
}


const resetDataForm = () => {
  Object.assign(dataForm, {
    id: null,
    typeCode: '',
    dictLabel: '',
    dictValue: '',
    remark: '',
    isChanged: 1
  })
  dataFormRef.value?.clearValidate()
}

// 刷新类型列表
const refreshTypes = () => {
  loadDictTypeList()
}

// 初始化
onMounted(() => {
  loadDictTypeList()
})
</script>

<style scoped>
/* 字典容器 */
.dictionary-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px;
}

/* 字典头部 */
.dictionary-header {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  color: #2c3e50;
}

.dictionary-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
}

.title-icon {
  font-size: 24px;
  color: #6c757d;
}

.dictionary-subtitle {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.add-type-btn {
  background: #007bff;
  border: 1px solid #007bff;
  color: white;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.add-type-btn:hover {
  background: #0056b3;
  border-color: #0056b3;
}

/* 字典主体 */
.dictionary-body {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

/* 区域头部 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 8px;
}

/* 类型网格 */
.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

/* 类型卡片 */
.type-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.type-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

/* 类型头部 */
.type-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.type-info {
  flex: 1;
}

.type-name {
  font-size: 16px;
  font-weight: 500;
  color: #495057;
  margin: 0 0 6px 0;
}

.type-code {
  font-size: 12px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
  margin: 0 0 6px 0;
  font-family: 'Courier New', monospace;
}

.type-description {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
  line-height: 1.4;
}

.type-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.status-tag {
  font-weight: 400;
  border-radius: 3px;
  font-size: 12px;
}

.type-actions {
  display: flex;
  gap: 2px;
}

.action-btn {
  padding: 4px;
  border-radius: 3px;
  transition: all 0.2s ease;
  color: #6c757d;
}

.action-btn:hover {
  background: #f8f9fa;
  color: #007bff;
}

.action-btn.danger:hover {
  background: #f8f9fa;
  color: #dc3545;
}

/* 数据区域 */
.type-data-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.data-title {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}

.add-data-btn {
  background: #007bff;
  border: 1px solid #007bff;
  color: white;
  font-weight: 400;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  transition: all 0.2s ease;
}

.add-data-btn:hover {
  background: #0056b3;
  border-color: #0056b3;
}

/* 数据列表 */
.data-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.data-item:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.data-content {
  flex: 1;
}

.data-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.data-status {
  margin-bottom: 4px;
}

.label-text {
  font-weight: 500;
  color: #495057;
  font-size: 13px;
}

.label-value {
  background: #6c757d;
  color: white;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-family: 'Courier New', monospace;
}

.data-remark {
  font-size: 11px;
  color: #6c757d;
  margin: 0;
  font-style: italic;
}

.data-actions {
  display: flex;
  gap: 2px;
}

.data-action-btn {
  padding: 2px;
  border-radius: 3px;
  transition: all 0.2s ease;
  color: #6c757d;
}

.data-action-btn:hover {
  background: #f8f9fa;
  color: #007bff;
}

.data-action-btn.danger:hover {
  background: #f8f9fa;
  color: #dc3545;
}

.data-action-btn:disabled {
  color: #adb5bd;
  cursor: not-allowed;
}

.data-action-btn:disabled:hover {
  background: transparent;
  color: #adb5bd;
}

/* 空数据状态 */
.empty-data {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-data p {
  margin: 0;
  font-size: 12px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.dict-pagination {
  background: white;
  padding: 12px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 对话框样式优化 */
:deep(.dict-dialog) {
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.dict-dialog .el-dialog__header) {
  background: white;
  color: #495057;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
}

:deep(.dict-dialog .el-dialog__title) {
  font-size: 16px;
  font-weight: 500;
  color: #495057;
}

:deep(.dict-dialog .el-dialog__headerbtn) {
  color: #6c757d;
  font-size: 16px;
}

:deep(.dict-dialog .el-dialog__headerbtn:hover) {
  color: #495057;
}

:deep(.dict-dialog .el-dialog__body) {
  padding: 0;
  background: white;
}

.dialog-content {
  padding: 20px;
}

/* 表单样式优化 */
.dict-form {
  background: white;
  border-radius: 4px;
  padding: 0;
}

.form-section {
  margin-bottom: 16px;
  background: #f8f9fa;
  border-radius: 4px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.section-icon {
  font-size: 16px;
  color: #6c757d;
  margin-right: 6px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-item {
  margin-bottom: 0;
}

:deep(.form-item .el-form-item__label) {
  font-weight: 400;
  color: #495057;
  font-size: 13px;
}

.form-input {
  transition: all 0.2s ease;
}

:deep(.form-input .el-input__wrapper) {
  border-radius: 4px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

:deep(.form-input .el-input__wrapper:hover) {
  border-color: #007bff;
}

:deep(.form-input .el-input__wrapper.is-focus) {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

:deep(.form-input .el-input__prefix) {
  color: #6c757d;
}

.form-textarea {
  transition: all 0.2s ease;
}

:deep(.form-textarea .el-textarea__inner) {
  border-radius: 4px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  font-family: inherit;
  line-height: 1.4;
}

:deep(.form-textarea .el-textarea__inner:hover) {
  border-color: #007bff;
}

:deep(.form-textarea .el-textarea__inner:focus) {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

/* 状态显示区域样式 */
.status-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-text {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

/* 状态单选按钮样式 */
.status-radio-group {
  display: flex;
  gap: 12px;
}

.status-radio {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.status-radio:hover {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.05);
}

:deep(.status-radio.is-checked) {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
}

.radio-icon {
  margin-right: 4px;
  font-size: 14px;
}

/* 对话框底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.cancel-btn {
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 400;
  transition: all 0.2s ease;
  border: 1px solid #e9ecef;
  color: #6c757d;
}

.cancel-btn:hover {
  border-color: #dc3545;
  color: #dc3545;
  background: rgba(220, 53, 69, 0.05);
}

.submit-btn {
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 400;
  transition: all 0.2s ease;
  background: #007bff;
  border: 1px solid #007bff;
}

.submit-btn:hover {
  background: #0056b3;
  border-color: #0056b3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dictionary-container {
    padding: 10px;
  }
  
  .dictionary-header {
    padding: 20px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .dictionary-title {
    font-size: 24px;
  }
  
  .dictionary-body {
    padding: 20px;
  }
  
  .types-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .type-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .type-status {
    align-items: flex-start;
  }
  
  :deep(.dict-dialog) {
    width: 95% !important;
    margin: 0 auto;
  }
  
  .dialog-content {
    padding: 16px;
  }
  
  .form-section {
    padding: 16px;
}

  .dialog-footer {
    padding: 16px;
    flex-direction: column;
  }
  
  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>