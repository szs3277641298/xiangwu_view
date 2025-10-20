<template>
  <el-dialog
    v-model="visible"
    title="导入结果详情"
    width="700px"
    :before-close="handleClose"
    center
    class="import-result-dialog"
    :close-on-click-modal="false"
  >
    <!-- 顶部统计区域 -->
    <div class="stats-section">
      <div class="stats-summary">
        <span class="summary-text">导入完成：</span>
        <span class="total-count">总计 {{ processedResultData.total || 0 }} 条</span>
        <span class="success-count">成功 {{ processedResultData.success || 0 }} 条</span>
        <span class="skip-count">跳过 {{ processedResultData.skipped || 0 }} 条</span>
        <span class="fail-count">失败 {{ processedResultData.failed || 0 }} 条</span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：跳过信息 -->
      <div v-if="skipDetails.length > 0" class="left-panel">
        <div class="panel-header">
          <span class="panel-title">跳过详情 ({{ skipDetails.length }} 条)</span>
        </div>
        <div class="panel-content">
          <div
            v-for="(skip, index) in skipDetails"
            :key="index"
            class="info-item"
          >
            <div class="row-badge">第{{ skip.row }}行</div>
            <div class="message-content">{{ skip.message }}</div>
          </div>
        </div>
      </div>

      <!-- 右侧：错误信息 -->
      <div v-if="errorDetails.length > 0" class="right-panel">
        <div class="panel-header">
          <span class="panel-title">错误详情 ({{ errorDetails.length }} 条)</span>
        </div>
        <div class="panel-content">
          <div
            v-for="(error, index) in errorDetails"
            :key="index"
            class="info-item error"
          >
            <div class="row-badge error">第{{ error.row }}行</div>
            <div class="message-content">{{ error.message }}</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

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

const emit = defineEmits(['update:modelValue'])

// 处理统计数据，确保显示正确的数字
const processedResultData = computed(() => {
  const data = { ...props.resultData }

  // 如果有 errorMsg，优先从其中解析统计数字
  if (data.errorMsg) {
    const errorMsg = data.errorMsg

    // 解析统计信息
    const totalMatch = errorMsg.match(/总计(\d+)条/)
    const successMatch = errorMsg.match(/成功(\d+)条/)
    const skipMatch = errorMsg.match(/跳过(\d+)条/)
    const failMatch = errorMsg.match(/失败(\d+)条/)

    if (totalMatch) data.total = parseInt(totalMatch[1])
    if (successMatch) data.success = parseInt(successMatch[1])
    if (skipMatch) data.skipped = parseInt(skipMatch[1])
    if (failMatch) data.failed = parseInt(failMatch[1])
  }

  return data
})

// 解析错误详情
const errorDetails = computed(() => {
  if (!processedResultData.value.errorMsg) return []

  const errors = []
  const errorMsg = processedResultData.value.errorMsg

  // 解析错误信息，提取行号和错误描述
  const errorPattern = /第(\d+)行：(.+?)(?=；|$)/g
  let match

  while ((match = errorPattern.exec(errorMsg)) !== null) {
    const message = match[2]
    // 只包含真正的错误信息，不包含跳过信息
    if (!message.includes('跳过导入')) {
      errors.push({
        row: parseInt(match[1]),
        message: message.trim()
      })
    }
  }

  return errors
})

// 解析跳过详情
const skipDetails = computed(() => {
  if (!processedResultData.value.errorMsg) return []

  const skips = []
  const errorMsg = processedResultData.value.errorMsg

  // 解析所有带行号的信息
  const allLines = errorMsg.split('；')

  allLines.forEach((line, index) => {
    const trimmedLine = line.trim()

    // 检查是否包含跳过导入关键词
    if (trimmedLine.includes('跳过导入')) {
      // 尝试提取行号
      const rowMatch = trimmedLine.match(/第(\d+)行/)
      const rowNum = rowMatch ? parseInt(rowMatch[1]) : null

      skips.push({
        row: rowNum,
        message: trimmedLine
      })
    }
  })

  return skips
})

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
/* 对话框整体样式 */
:deep(.import-result-dialog .el-dialog) {
  border-radius: 6px;
  height: auto !important;
  width: 700px !important;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.import-result-dialog .el-dialog) {
    width: 95vw;
    max-width: 700px;
  }
}

:deep(.import-result-dialog .el-dialog__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

:deep(.import-result-dialog .el-dialog__body) {
  padding: 20px;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.import-result-dialog .el-dialog__footer) {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

/* 统计区域 */
.stats-section {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.stats-summary {
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
}

.summary-text {
  color: #64748b;
  margin-right: 8px;
}

.total-count {
  color: #334155;
  font-weight: 600;
  margin-right: 16px;
}

.success-count {
  color: #059669;
  font-weight: 600;
  margin-right: 16px;
}

.skip-count {
  color: #d97706;
  font-weight: 600;
  margin-right: 16px;
}

.fail-count {
  color: #dc2626;
  font-weight: 600;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 20px;
  overflow: hidden;
}

.left-panel,
.right-panel {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-header {
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  min-height: 0;
}

.info-item {
  margin-bottom: 12px;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item.error {
  background: #fef2f2;
  border-color: #fecaca;
}

.row-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
  border-radius: 12px;
  margin-bottom: 8px;
}

.row-badge.error {
  background: #fee2e2;
  color: #dc2626;
}

.message-content {
  font-size: 13px;
  line-height: 1.5;
  color: #334155;
  word-break: break-word;
  white-space: pre-wrap;
}

/* 底部按钮 */
:deep(.el-button) {
  height: 36px;
  padding: 0 20px;
  font-size: 14px;
  border-radius: 4px;
}

/* 滚动条样式 */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.panel-content {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

/* 当只有一个面板时，让它占满宽度 */
.main-content .left-panel:only-child,
.main-content .right-panel:only-child {
  width: 100%;
}
</style>
