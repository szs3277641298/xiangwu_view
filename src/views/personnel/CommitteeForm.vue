<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑村委会人员' : '新增村委会人员'"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      class="committee-form"
    >

      <div class="form-section">
        <h3 class="section-title">村民信息</h3>
        <el-form-item label="关联村民" prop="residentId" required>
          <div class="villager-selector">
            <el-input
              v-model="villagerSearchQuery"
              :placeholder="isEdit ? '当前关联的村民信息' : '请输入村民姓名进行搜索'"
              :readonly="isEdit"
              @input="!isEdit && handleVillagerSearch($event)"
              @focus="!isEdit && (villagerSearchVisible = true)"
              class="villager-input"
            >
              <template #suffix>
                <el-icon v-if="!isEdit" class="search-icon" @click="villagerSearchVisible = true">
                  <Search />
                </el-icon>
              </template>
            </el-input>
            
            <!-- 已选择的村民信息 -->
            <div v-if="selectedVillager && selectedVillager.name" class="selected-villager">
              <div class="villager-info">
                <span class="villager-name">{{ selectedVillager.name || '' }}</span>
                <span class="villager-details">
                  {{ selectedVillager.genderLabel }} · {{ selectedVillager.age || 0 }}岁 · {{ selectedVillager.phone || '' }}
                </span>
              </div>
              <el-button 
                v-if="!isEdit"
                type="text" 
                @click="clearVillagerSelection"
                class="clear-btn"
              >
                清除
              </el-button>
            </div>
            
            <!-- 村民搜索结果下拉 -->
            <div v-if="!isEdit && villagerSearchVisible && villagerSearchQuery && villagerSearchQuery.trim().length >= 1" class="villager-search-results">
              <div 
                v-for="villager in villagerSearchResults" 
                :key="villager.id"
                class="villager-option"
                @click="selectVillager(villager)"
              >
                <div class="villager-name">{{ villager.name }}</div>
                <div class="villager-idcard">{{ villager.idCard }}</div>
                <div class="villager-info">
                  <span class="gender">{{ villager.genderLabel }}</span>
                  <span class="age">{{ villager.age }}岁</span>
                </div>
              </div>
              <div v-if="villagerSearchResults.length === 0" class="no-results">
                未找到匹配的村民
              </div>
            </div>
          </div>
        </el-form-item>
      </div>

      <div class="form-section">
        <h3 class="section-title">村委会信息</h3>
        <div class="form-row">
          <el-form-item label="职务" prop="dutyId" required>
            <el-select v-model="formData.dutyId" placeholder="请选择职务" class="form-select">
              <el-option 
                v-for="option in dutyOptions" 
                :key="option.id" 
                :label="option.name" 
                :value="option.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="入职时间" prop="entryDate" required>
            <el-date-picker
              v-model="formData.entryDate"
              type="date"
              placeholder="请选择入职时间"
              class="form-input"
            />
          </el-form-item>
        </div>
        
        <el-form-item label="负责工作" prop="responsibility" required>
          <el-input
            v-model="formData.responsibility"
            type="textarea"
            :rows="3"
            placeholder="请输入负责工作"
            class="form-textarea"
          />
        </el-form-item>
      </div>

    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ isEdit ? '更新' : '新增' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, defineProps, defineEmits, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { committeeAPI, residentAPI } from '../../api/api.js'
// 不再从constants.js导入，使用新的枚举字典格式

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  editData: {
    type: Object,
    default: null
  },
  dutyOptions: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success'])

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.editData)
const loading = ref(false)
const formRef = ref(null)

// 表单数据
const formData = reactive({
  residentId: null,
  dutyId: null,
  entryDate: null,
  responsibility: ''
})

// 村民搜索相关
const villagerSearchQuery = ref('')
const villagerSearchResults = ref([])
const villagerSearchVisible = ref(false)
const selectedVillager = ref(null)

// 枚举选项 - 从父组件接收
const dutyOptions = computed(() => props.dutyOptions)


// 表单验证规则
const rules = {
  residentId: [
    { required: true, message: '请选择村民', trigger: 'change' }
  ],
  dutyId: [
    { required: true, message: '请选择职务', trigger: 'change' }
  ],
  entryDate: [
    { required: true, message: '请选择入职时间', trigger: 'change' }
  ],
  responsibility: [
    { required: true, message: '请输入负责工作', trigger: 'blur' },
    { min: 5, max: 200, message: '负责工作长度在 5 到 200 个字符', trigger: 'blur' }
  ]
}




// 村民搜索方法
const searchVillagers = async (query) => {
  if (!query || query.trim().length < 1) {
    villagerSearchResults.value = []
    return
  }

  try {
    const response = await residentAPI.getResidentList({
      name: query.trim(),
      pageNum: 1,
      pageSize: 10
    })

    if (response && response.code === 200 && response.data) {
      villagerSearchResults.value = response.data.list || []
    } else {
      villagerSearchResults.value = []
    }
  } catch (error) {
    console.error('搜索村民失败:', error)
    villagerSearchResults.value = []
  }
}

const handleVillagerSearch = (query) => {
  villagerSearchQuery.value = query
  if (query && query.trim().length >= 1) {
    searchVillagers(query)
  } else {
    villagerSearchResults.value = []
  }
}

const selectVillager = (villager) => {
  selectedVillager.value = villager
  formData.residentId = villager.id
  villagerSearchQuery.value = villager.name
  villagerSearchVisible.value = false
  villagerSearchResults.value = []
}

const clearVillagerSelection = () => {
  selectedVillager.value = null
  formData.residentId = null
  villagerSearchQuery.value = ''
  villagerSearchResults.value = []
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    residentId: null,
    dutyId: null,
    entryDate: null,
    responsibility: ''
  })
  clearVillagerSelection()
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 填充编辑数据
const fillEditData = async () => {
  if (props.editData) {
    // 处理 LocalDateTime 格式的日期
    let formattedEntryDate = null
    if (props.editData.entryDate) {
      try {
        // 处理 yyyy-MM-dd HH:mm:ss 格式
        if (typeof props.editData.entryDate === 'string' && props.editData.entryDate.includes(' ')) {
          const datePart = props.editData.entryDate.split(' ')[0] // 取日期部分
          formattedEntryDate = new Date(datePart)
        } else {
          formattedEntryDate = new Date(props.editData.entryDate)
        }
      } catch (error) {
        console.error('日期解析错误:', error)
        formattedEntryDate = null
      }
    }
    
    Object.assign(formData, {
      residentId: props.editData.residentId || null,
      dutyId: props.editData.dutyId || null,
      entryDate: formattedEntryDate,
      responsibility: props.editData.responsibility || ''
    })
    
    console.log('编辑数据填充详情:')
    console.log('- 职务ID:', props.editData.dutyId, '职务名称:', props.editData.dutyName)
    
    // 如果有村民ID，获取村民信息
    if (props.editData.residentId) {
      try {
        const response = await residentAPI.getResidentInfo(props.editData.residentId)
        if (response && response.code === 200 && response.data) {
          selectedVillager.value = response.data
          villagerSearchQuery.value = response.data.name || ''
        }
      } catch (error) {
        console.error('获取村民信息失败:', error)
      }
    }
  }
}

// 监听编辑数据变化
watch(() => props.editData, () => {
  if (props.editData) {
    fillEditData()
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听对话框显示状态
watch(visible, (val) => {
  if (val) {
    if (props.editData) {
      fillEditData()
    } else {
      resetForm()
    }
  }
})


// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    loading.value = true
    
    // 准备提交数据，根据后端SQL只发送必要字段
    const submitData = {}
    
    if (formData.residentId) {
      submitData.residentId = Number(formData.residentId)
    }
    if (formData.dutyId) {
      submitData.dutyId = formData.dutyId
    }
    if (formData.entryDate) {
      // 将日期转换为 yyyy-MM-dd HH:mm:ss 格式
      const date = new Date(formData.entryDate)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      submitData.entryDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
    if (formData.responsibility && formData.responsibility.trim()) {
      submitData.responsibility = formData.responsibility.trim()
    }
    
    console.log('提交的村委会数据:', submitData)

    let response
    if (isEdit.value) {
      response = await committeeAPI.updateCommitteeMember(submitData)
    } else {
      response = await committeeAPI.addCommitteeMember(submitData)
    }

    console.log('后端响应:', response)

    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
      emit('success')
      handleClose()
    } else {
      console.error('更新失败，响应详情:', response)
      ElMessage.error(response.message || (isEdit.value ? '更新失败' : '新增失败'))
    }
  } catch (error) {
    console.error('表单提交失败:', error)
    console.error('错误详情:', error.response?.data)
    console.error('错误状态码:', error.response?.status)
    console.error('错误信息:', error.message)
    
    // 显示更详细的错误信息
    const errorMessage = error.response?.data?.message || error.message || '表单提交失败'
    ElMessage.error(`提交失败: ${errorMessage}`)
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  resetForm()
}

// 组件挂载时不需要加载字典数据，从父组件接收
onMounted(() => {
  console.log('CommitteeForm组件挂载，从父组件接收职务选项数据')
})
</script>

<style scoped>
.committee-form {
  max-height: 600px;
  overflow-y: auto;
  padding: 20px;
  margin: 0 20px;
}

.form-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  padding-left: 8px;
  border-left: 4px solid #409eff;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-input,
.form-select {
  width: 100%;
}

.form-textarea {
  width: 100%;
}

/* 村民信息显示 */
.resident-info {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  font-weight: 500;
  color: #606266;
  min-width: 60px;
}

.info-item .value {
  color: #303133;
}

/* 村民选择器样式 */
.villager-selector {
  position: relative;
  width: 100%;
}

.villager-input {
  width: 100%;
}

.search-icon {
  cursor: pointer;
  color: #909399;
  transition: color 0.3s;
}

.search-icon:hover {
  color: #409eff;
}

.selected-villager {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.villager-info {
  flex: 1;
}

.villager-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  margin-bottom: 4px;
  display: block;
}

.villager-details {
  color: #606266;
  font-size: 12px;
}

.clear-btn {
  color: #f56c6c;
  padding: 4px 8px;
  font-size: 12px;
}

.clear-btn:hover {
  background: #fef0f0;
}

.villager-search-results {
  position: absolute !important;
  top: 100% !important;
  left: 0 !important;
  right: 0 !important;
  background: #fff !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  height: 240px !important;
  max-height: 240px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  z-index: 1000 !important;
  margin-top: 4px !important;
}

/* 下拉容器滚动条样式 */
.villager-search-results::-webkit-scrollbar {
  width: 6px;
}

.villager-search-results::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.villager-search-results::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.villager-search-results::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.villager-option {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f5f7fa;
  transition: background-color 0.3s;
  flex-shrink: 0;
}

.villager-option:hover {
  background: #f5f7fa;
}

.villager-option:last-child {
  border-bottom: none;
}

.villager-option .villager-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  margin-bottom: 4px;
}

.villager-option .villager-idcard {
  color: #606266;
  font-size: 12px;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
}

.villager-option .villager-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.villager-option .villager-info .gender,
.villager-option .villager-info .age {
  color: #909399;
}

.no-results {
  padding: 12px;
  text-align: center;
  color: #909399;
  font-size: 12px;
}


.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0 0 0;
  border-top: 1px solid #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .committee-form {
    padding: 16px;
    margin: 0 16px;
  }
  
}
</style>
