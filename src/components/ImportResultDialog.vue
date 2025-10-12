<template>
  <el-dialog
    v-model="visible"
    title="导入结果详情"
    width="480px"
    :before-close="handleClose"
    center
    class="import-result-dialog"
    :close-on-click-modal="false"
  >
    <div class="import-result-container" ref="containerRef">
      <!-- 滚动提示 -->
      <div v-if="hasScrollableContent" class="scroll-hint">
        <el-icon><ArrowDown /></el-icon>
        <span>内容较多，可滚动查看</span>
      </div>
      
      <!-- 总体统计 -->
      <div class="summary-section">
        <el-card class="summary-card">
          <template #header>
            <div class="card-header">
              <el-icon><InfoFilled /></el-icon>
              <span>导入统计</span>
            </div>
          </template>
          <div class="summary-stats">
            <div class="stat-item">
              <div class="label">总计</div>
              <div class="value">{{ resultData.total || 0 }}</div>
              <div class="unit">条</div>
            </div>
            <div class="stat-item success">
              <div class="label">成功</div>
              <div class="value">{{ resultData.success || 0 }}</div>
              <div class="unit">条</div>
            </div>
            <div class="stat-item skipped">
              <div class="label">跳过</div>
              <div class="value">{{ resultData.skipped || 0 }}</div>
              <div class="unit">条</div>
            </div>
            <div class="stat-item failed">
              <div class="label">失败</div>
              <div class="value">{{ resultData.failed || 0 }}</div>
              <div class="unit">条</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 详细错误信息 -->
      <div v-if="errorDetails.length > 0" class="error-section">
        <el-card class="error-card">
          <template #header>
            <div class="card-header">
              <el-icon><WarningFilled /></el-icon>
              <span>错误详情</span>
            </div>
          </template>
          <div class="error-list">
            <div 
              v-for="(error, index) in errorDetails" 
              :key="index" 
              class="error-item"
            >
              <el-tag type="danger" size="small">第{{ error.row }}行</el-tag>
              <span class="error-message">{{ error.message }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 跳过信息 -->
      <div v-if="skipDetails.length > 0" class="skip-section">
        <el-card class="skip-card">
          <template #header>
            <div class="card-header">
              <el-icon><InfoFilled /></el-icon>
              <span>跳过详情</span>
            </div>
          </template>
          <div class="skip-list">
            <div 
              v-for="(skip, index) in skipDetails" 
              :key="index" 
              class="skip-item"
            >
              <el-tag type="warning" size="small">第{{ skip.row }}行</el-tag>
              <span class="skip-message">{{ skip.message }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { InfoFilled, WarningFilled, ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  resultData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const containerRef = ref(null)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 解析错误详情
const errorDetails = computed(() => {
  if (!props.resultData.errorMsg) return []
  
  const errors = []
  const errorMsg = props.resultData.errorMsg
  
  // 解析错误信息，提取行号和错误描述
  const errorPattern = /第(\d+)行：(.+?)(?=；|$)/g
  let match
  
  while ((match = errorPattern.exec(errorMsg)) !== null) {
    const message = match[2]
    // 只包含真正的错误信息，不包含跳过信息
    if (!message.includes('已存在，跳过导入')) {
      errors.push({
        row: parseInt(match[1]),
        message: message
      })
    }
  }
  
  return errors
})

// 解析跳过详情
const skipDetails = computed(() => {
  if (!props.resultData.errorMsg) return []
  
  const skips = []
  const errorMsg = props.resultData.errorMsg
  
  // 解析带行号的跳过信息
  const skipPattern = /第(\d+)行：(.+?)(?=；|$)/g
  let match
  
  while ((match = skipPattern.exec(errorMsg)) !== null) {
    const message = match[2]
    // 只包含跳过信息（包含"已存在，跳过导入"）
    if (message.includes('已存在，跳过导入')) {
      skips.push({
        row: parseInt(match[1]),
        message: message
      })
    }
  }
  
  return skips
})

// 判断是否有可滚动内容
const hasScrollableContent = computed(() => {
  return errorDetails.value.length > 3 || skipDetails.value.length > 3
})

const handleClose = () => {
  visible.value = false
}

// 调试滚动状态
const checkScrollStatus = () => {
  if (containerRef.value) {
    const container = containerRef.value
    console.log('容器高度:', container.scrollHeight)
    console.log('可视高度:', container.clientHeight)
    console.log('是否需要滚动:', container.scrollHeight > container.clientHeight)
  }
}

// 监听对话框显示状态
watch(visible, async (newVal) => {
  if (newVal) {
    await nextTick()
    checkScrollStatus()
  }
})

const handleRefresh = () => {
  emit('refresh')
  handleClose()
}

// 监听结果数据变化，自动解析统计信息
watch(() => props.resultData, (newData) => {
  if (newData && newData.errorMsg) {
    // 解析统计信息
    const errorMsg = newData.errorMsg
    const totalMatch = errorMsg.match(/总计(\d+)条/)
    const successMatch = errorMsg.match(/成功(\d+)条/)
    const skipMatch = errorMsg.match(/跳过(\d+)条/)
    const failMatch = errorMsg.match(/失败(\d+)条/)
    
    if (totalMatch) newData.total = parseInt(totalMatch[1])
    if (successMatch) newData.success = parseInt(successMatch[1])
    if (skipMatch) newData.skipped = parseInt(skipMatch[1])
    if (failMatch) newData.failed = parseInt(failMatch[1])
  }
}, { immediate: true, deep: true })
</script>

<style scoped>
/* 对话框整体样式 */
:deep(.import-result-dialog .el-dialog) {
  border-radius: 8px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

:deep(.import-result-dialog .el-dialog__header) {
  padding: 16px 16px 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

:deep(.import-result-dialog .el-dialog__body) {
  padding: 16px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.import-result-dialog .el-dialog__footer) {
  padding: 8px 16px 16px 16px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.import-result-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  position: relative;
  box-sizing: border-box;
  min-height: 0;
}

.scroll-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #0369a1;
  text-align: center;
  justify-content: center;
}

.summary-section,
.error-section,
.skip-section {
  margin-bottom: 16px;
}

.summary-section:last-child,
.error-section:last-child,
.skip-section:last-child {
  margin-bottom: 0;
}

/* 卡片样式 */
:deep(.summary-card .el-card__header),
:deep(.error-card .el-card__header),
:deep(.skip-card .el-card__header) {
  padding: 10px 12px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.summary-card .el-card__body) {
  padding: 12px;
}

:deep(.error-card .el-card__body),
:deep(.skip-card .el-card__body) {
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #333;
}

/* 统计信息样式 */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.stat-item {
  padding: 12px 8px;
  border-radius: 6px;
  text-align: center;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-item .label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.stat-item .value {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 2px;
  line-height: 1;
}

.stat-item .unit {
  font-size: 10px;
  color: #999;
}

.stat-item.success .value {
  color: #16a34a;
}

.stat-item.skipped .value {
  color: #ea580c;
}

.stat-item.failed .value {
  color: #dc2626;
}

/* 错误和跳过列表 */
.error-list,
.skip-list {
  max-height: 100px;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
}

.error-item,
.skip-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  background-color: #f8f9fa;
  border-left: 4px solid #e5e7eb;
}

.error-item {
  background-color: #fef2f2;
  border-left-color: #ef4444;
}

.skip-item {
  background-color: #fffbeb;
  border-left-color: #f59e0b;
}

.error-item:last-child,
.skip-item:last-child {
  margin-bottom: 0;
}

.error-message,
.skip-message {
  flex: 1;
  font-size: 13px;
  line-height: 1.5;
  color: #374151;
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: center;
  padding: 0;
}

.dialog-footer .el-button {
  min-width: 100px;
  height: 36px;
  font-weight: 500;
  font-size: 14px;
  border-radius: 6px;
}

/* 滚动条样式 */
.import-result-container::-webkit-scrollbar,
.error-list::-webkit-scrollbar,
.skip-list::-webkit-scrollbar {
  width: 8px;
}

.import-result-container::-webkit-scrollbar-track,
.error-list::-webkit-scrollbar-track,
.skip-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.import-result-container::-webkit-scrollbar-thumb,
.error-list::-webkit-scrollbar-thumb,
.skip-list::-webkit-scrollbar-thumb {
  background: #64748b;
  border-radius: 4px;
}

.import-result-container::-webkit-scrollbar-thumb:hover,
.error-list::-webkit-scrollbar-thumb:hover,
.skip-list::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* 强制显示滚动条 */
.import-result-container {
  scrollbar-width: thin;
  scrollbar-color: #64748b #f1f5f9;
}

.error-list,
.skip-list {
  scrollbar-width: thin;
  scrollbar-color: #64748b #f1f5f9;
}

</style>
