<template>
  <div class="screen-config-container">
    <!-- 页面标题 -->
    <div class="page-subheader">
      <h3>大屏维度配置</h3>
      <p>配置数据可视化大屏的显示维度和参数</p>
    </div>
    
    <!-- 大屏模板选择 -->
    <el-card class="template-card">
      <template #header>
        <div class="card-header">
          <span>选择大屏模板</span>
        </div>
      </template>
      
      <div class="template-grid">
        <el-card 
          v-for="template in screenTemplates" 
          :key="template.id" 
          class="template-item" 
          :class="{ active: currentTemplate.id === template.id }"
          @click="selectTemplate(template)"
        >
          <div class="template-preview">
            <img :src="template.preview" alt="{{ template.name }}" class="preview-img">
          </div>
          <div class="template-info">
            <h4>{{ template.name }}</h4>
            <p>{{ template.description }}</p>
          </div>
        </el-card>
      </div>
    </el-card>
    
    <!-- 大屏配置 -->
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>大屏配置</span>
          <el-button type="text" @click="handleResetConfig" danger>
            重置当前配置
          </el-button>
        </div>
      </template>
      
      <el-form ref="screenConfigFormRef" :model="screenConfig" :rules="screenConfigRules" label-width="120px">
        <!-- 基础设置 -->
        <el-divider content-position="left">基础设置</el-divider>
        
        <div class="form-row">
          <el-form-item label="大屏标题" prop="title">
            <el-input v-model="screenConfig.title" placeholder="请输入大屏标题" />
          </el-form-item>
          
          <el-form-item label="显示模式" prop="displayMode">
            <el-select v-model="screenConfig.displayMode" placeholder="请选择显示模式">
              <el-option label="标准模式" value="standard" />
              <el-option label="全屏模式" value="fullscreen" />
              <el-option label="轮播模式" value="carousel" />
            </el-select>
          </el-form-item>
        </div>
        
        <div class="form-row">
          <el-form-item label="刷新频率" prop="refreshInterval">
            <el-input-number v-model="screenConfig.refreshInterval" :min="10" :max="3600" :step="10" />
            <span class="unit-label">秒</span>
          </el-form-item>
          
          <el-form-item label="背景样式" prop="backgroundStyle">
            <el-select v-model="screenConfig.backgroundStyle" placeholder="请选择背景样式">
              <el-option label="深色主题" value="dark" />
              <el-option label="浅色主题" value="light" />
              <el-option label="自定义背景" value="custom" />
            </el-select>
          </el-form-item>
        </div>
        
        <el-form-item v-if="screenConfig.backgroundStyle === 'custom'" label="背景图片">
          <el-upload
            class="upload-demo"
            action="#"
            :on-change="handleBackgroundUpload"
            :show-file-list="false"
            :before-upload="beforeBackgroundUpload"
          >
            <el-button size="small" type="primary">上传背景图片</el-button>
          </el-upload>
          <div v-if="screenConfig.backgroundImage" class="background-preview">
            <img :src="screenConfig.backgroundImage" alt="背景预览" class="preview-img">
            <el-button type="text" danger size="small" @click="clearBackgroundImage">
              移除
            </el-button>
          </div>
        </el-form-item>
        
        <!-- 数据维度配置 -->
        <el-divider content-position="left">数据维度配置</el-divider>
        
        <!-- 经济数据维度 -->
        <el-form-item label="经济数据维度">
          <el-checkbox-group v-model="screenConfig.economicDimensions">
            <el-checkbox v-for="dim in economicDimensions" :key="dim.value" :label="dim.value">
              {{ dim.label }}
            </el-checkbox>
          </el-checkbox-group>
          <div class="form-hint">选择需要在大屏上显示的经济数据维度</div>
        </el-form-item>
        
        <!-- 人员数据维度 -->
        <el-form-item label="人员数据维度">
          <el-checkbox-group v-model="screenConfig.personnelDimensions">
            <el-checkbox v-for="dim in personnelDimensions" :key="dim.value" :label="dim.value">
              {{ dim.label }}
            </el-checkbox>
          </el-checkbox-group>
          <div class="form-hint">选择需要在大屏上显示的人员数据维度</div>
        </el-form-item>
        
        <!-- 党建数据维度 -->
        <el-form-item label="党建数据维度">
          <el-checkbox-group v-model="screenConfig.partyDimensions">
            <el-checkbox v-for="dim in partyDimensions" :key="dim.value" :label="dim.value">
              {{ dim.label }}
            </el-checkbox>
          </el-checkbox-group>
          <div class="form-hint">选择需要在大屏上显示的党建数据维度</div>
        </el-form-item>
        
        <!-- 图表配置 -->
        <el-divider content-position="left">图表配置</el-divider>
        
        <div class="charts-config">
          <div v-for="(chart, index) in screenConfig.charts" :key="index" class="chart-config-item">
            <div class="chart-header">
              <h4>图表 {{ index + 1 }}</h4>
              <el-button type="text" danger size="small" @click="removeChart(index)">
                删除图表
              </el-button>
            </div>
            
            <div class="form-row">
              <el-form-item label="图表类型">
                <el-select v-model="chart.type" placeholder="请选择图表类型">
                  <el-option label="柱状图" value="bar" />
                  <el-option label="折线图" value="line" />
                  <el-option label="饼图" value="pie" />
                  <el-option label="散点图" value="scatter" />
                  <el-option label="地图" value="map" />
                  <el-option label="雷达图" value="radar" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="数据来源">
                <el-select v-model="chart.dataSource" placeholder="请选择数据来源">
                  <el-option label="经济数据" value="economic" />
                  <el-option label="人员数据" value="personnel" />
                  <el-option label="党建数据" value="party" />
                </el-select>
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="图表标题">
                <el-input v-model="chart.title" placeholder="请输入图表标题" />
              </el-form-item>
              
              <el-form-item label="显示位置">
                <el-select v-model="chart.position" placeholder="请选择显示位置">
                  <el-option label="左上" value="top-left" />
                  <el-option label="右上" value="top-right" />
                  <el-option label="左下" value="bottom-left" />
                  <el-option label="右下" value="bottom-right" />
                  <el-option label="中央" value="center" />
                </el-select>
              </el-form-item>
            </div>
          </div>
          
          <el-button type="primary" @click="addChart" style="margin-top: 10px;">
            添加图表
          </el-button>
        </div>
        
        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button type="primary" @click="handleSaveConfig">保存配置</el-button>
          <el-button @click="handlePreview">预览大屏</el-button>
          <el-button @click="handleExportConfig">导出配置</el-button>
          <el-upload
            class="upload-config"
            action="#"
            :on-change="handleImportConfig"
            :show-file-list="false"
            :before-upload="beforeImportConfig"
          >
            <el-button type="info">导入配置</el-button>
          </el-upload>
        </div>
      </el-form>
    </el-card>
    
    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="大屏预览" width="90%" height="90%" :fullscreen="true" :close-on-click-modal="false">
      <div class="preview-content">
        <div class="screen-preview" :style="getScreenPreviewStyle()">
          <h1 class="screen-title">{{ screenConfig.title }}</h1>
          <p class="screen-subtitle">预览模式 - 实际效果请以全屏显示为准</p>
          <!-- 这里可以根据配置动态生成预览内容 -->
          <div class="preview-placeholder">
            <p>大屏预览内容将在这里显示</p>
            <p>配置的 {{ screenConfig.charts.length }} 个图表将按照指定位置排列</p>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewVisible = false">关闭预览</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 大屏模板
const screenTemplates = [
  {
    id: 'template1',
    name: '乡村振兴综合大屏',
    description: '全面展示乡村经济、人口和党建等综合数据',
    preview: 'https://picsum.photos/id/1/600/300'
  },
  {
    id: 'template2',
    name: '集体经济专题大屏',
    description: '专注展示集体经济项目和收支数据',
    preview: 'https://picsum.photos/id/2/600/300'
  },
  {
    id: 'template3',
    name: '人口结构分析大屏',
    description: '展示村庄人口结构、流动趋势等数据',
    preview: 'https://picsum.photos/id/3/600/300'
  },
  {
    id: 'template4',
    name: '党建工作展示大屏',
    description: '展示党员结构、党费缴纳和党建活动等数据',
    preview: 'https://picsum.photos/id/4/600/300'
  }
]

// 当前选择的模板
const currentTemplate = ref(screenTemplates[0])

// 表单相关
const screenConfigFormRef = ref(null)
const screenConfig = reactive({
  title: '乡村振兴数据大屏',
  displayMode: 'standard',
  refreshInterval: 60,
  backgroundStyle: 'dark',
  backgroundImage: '',
  economicDimensions: ['projects', 'income', 'expenditure'],
  personnelDimensions: ['population', 'structure', 'flow'],
  partyDimensions: ['members', 'organization', 'activities'],
  charts: [
    {
      type: 'bar',
      dataSource: 'economic',
      title: '集体经济项目收益分析',
      position: 'top-left'
    },
    {
      type: 'line',
      dataSource: 'economic',
      title: '年度收益趋势',
      position: 'top-right'
    },
    {
      type: 'pie',
      dataSource: 'personnel',
      title: '人口结构分布',
      position: 'bottom-left'
    },
    {
      type: 'bar',
      dataSource: 'party',
      title: '党员结构分析',
      position: 'bottom-right'
    }
  ]
})

// 表单验证规则
const screenConfigRules = {
  title: [
    {
      required: true,
      message: '请输入大屏标题',
      trigger: 'blur'
    },
    {
      max: 50,
      message: '标题不能超过50个字符',
      trigger: 'blur'
    }
  ],
  displayMode: [
    {
      required: true,
      message: '请选择显示模式',
      trigger: 'change'
    }
  ],
  refreshInterval: [
    {
      required: true,
      message: '请设置刷新频率',
      trigger: 'change'
    }
  ],
  backgroundStyle: [
    {
      required: true,
      message: '请选择背景样式',
      trigger: 'change'
    }
  ]
}

// 数据维度选项
const economicDimensions = [
  { value: 'projects', label: '项目数量' },
  { value: 'income', label: '总收入' },
  { value: 'expenditure', label: '总支出' },
  { value: 'profit', label: '净利润' },
  { value: 'investment', label: '总投资' },
  { value: 'growth', label: '增长率' }
]

const personnelDimensions = [
  { value: 'population', label: '总人口' },
  { value: 'structure', label: '人口结构' },
  { value: 'flow', label: '人口流动' },
  { value: 'households', label: '户数' },
  { value: 'education', label: '教育程度' },
  { value: 'employment', label: '就业情况' }
]

const partyDimensions = [
  { value: 'members', label: '党员数量' },
  { value: 'organization', label: '组织结构' },
  { value: 'activities', label: '党建活动' },
  { value: 'dues', label: '党费缴纳' },
  { value: 'age', label: '年龄结构' },
  { value: 'education', label: '学历分布' }
]

// 预览相关
const previewVisible = ref(false)

// 选择模板
const selectTemplate = (template) => {
  currentTemplate.value = template
  ElMessage.success(`已选择模板：${template.name}`)
  // 这里可以根据模板预设配置
  // loadTemplateConfig(template.id)
}

// 加载模板配置
const loadTemplateConfig = (templateId) => {
  // 模拟加载模板配置
  console.log(`加载模板配置：${templateId}`)
  // 这里可以根据模板ID加载对应的配置
}

// 添加图表
const addChart = () => {
  screenConfig.charts.push({
    type: 'bar',
    dataSource: 'economic',
    title: '新图表',
    position: 'center'
  })
}

// 删除图表
const removeChart = (index) => {
  ElMessageBox.confirm(
    '确定要删除此图表吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    screenConfig.charts.splice(index, 1)
    ElMessage.success('图表已删除')
  }).catch(() => {
    // 取消删除
  })
}

// 背景图片上传
const handleBackgroundUpload = (file) => {
  // 模拟上传，实际项目中应该调用上传接口
  const reader = new FileReader()
  reader.onload = (e) => {
    screenConfig.backgroundImage = e.target.result
  }
  reader.readAsDataURL(file.raw)
  return false
}

const beforeBackgroundUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片文件！')
    return false
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过10MB！')
    return false
  }
  return true
}

// 清除背景图片
const clearBackgroundImage = () => {
  screenConfig.backgroundImage = ''
  ElMessage.info('背景图片已清除')
}

// 保存配置
const handleSaveConfig = async () => {
  try {
    // 表单验证
    await screenConfigFormRef.value.validate()
    
    // 模拟保存操作
    ElMessage.success('大屏配置保存成功')
    
    // 这里可以调用API保存配置
    console.log('保存大屏配置:', screenConfig)
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败:', error)
  }
}

// 重置配置
const handleResetConfig = () => {
  ElMessageBox.confirm(
    '确定要重置当前配置吗？',
    '重置确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 重置表单
    screenConfig.title = '乡村振兴数据大屏'
    screenConfig.displayMode = 'standard'
    screenConfig.refreshInterval = 60
    screenConfig.backgroundStyle = 'dark'
    screenConfig.backgroundImage = ''
    screenConfig.economicDimensions = ['projects', 'income', 'expenditure']
    screenConfig.personnelDimensions = ['population', 'structure', 'flow']
    screenConfig.partyDimensions = ['members', 'organization', 'activities']
    screenConfig.charts = [
      {
        type: 'bar',
        dataSource: 'economic',
        title: '集体经济项目收益分析',
        position: 'top-left'
      },
      {
        type: 'line',
        dataSource: 'economic',
        title: '年度收益趋势',
        position: 'top-right'
      },
      {
        type: 'pie',
        dataSource: 'personnel',
        title: '人口结构分布',
        position: 'bottom-left'
      },
      {
        type: 'bar',
        dataSource: 'party',
        title: '党员结构分析',
        position: 'bottom-right'
      }
    ]
    
    // 清除验证
    if (screenConfigFormRef.value) {
      screenConfigFormRef.value.clearValidate()
    }
    
    ElMessage.info('配置已重置')
  }).catch(() => {
    // 取消操作
  })
}

// 预览大屏
const handlePreview = () => {
  previewVisible.value = true
}

// 导出配置
const handleExportConfig = () => {
  // 模拟导出配置
  const configStr = JSON.stringify(screenConfig, null, 2)
  const blob = new Blob([configStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `screen-config-${new Date().getTime()}.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('配置导出成功')
}

// 导入配置
const handleImportConfig = (file) => {
  // 模拟导入配置
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const importedConfig = JSON.parse(e.target.result)
      // 验证导入的配置格式
      if (importedConfig && typeof importedConfig === 'object') {
        // 合并导入的配置
        Object.assign(screenConfig, importedConfig)
        ElMessage.success('配置导入成功')
      } else {
        ElMessage.error('配置文件格式错误')
      }
    } catch (error) {
      ElMessage.error('配置文件解析失败')
    }
  }
  reader.readAsText(file.raw)
  return false
}

const beforeImportConfig = (file) => {
  const isJson = file.name.endsWith('.json')
  if (!isJson) {
    ElMessage.error('请上传JSON格式的配置文件！')
    return false
  }
  return true
}

// 获取预览样式
const getScreenPreviewStyle = () => {
  const style = {
    backgroundColor: screenConfig.backgroundStyle === 'dark' ? '#0a0c10' : '#ffffff',
    color: screenConfig.backgroundStyle === 'dark' ? '#ffffff' : '#000000'
  }
  
  if (screenConfig.backgroundImage) {
    style.backgroundImage = `url(${screenConfig.backgroundImage})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
  }
  
  return style
}

// 组件挂载时的初始化
onMounted(() => {
  // 这里可以加载已保存的配置
  console.log('加载大屏维度配置')
})
</script>

<style scoped>
.screen-config-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-subheader {
  margin-bottom: 10px;
}

.page-subheader h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.page-subheader p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.template-card,
.config-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.template-item {
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.template-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);
}

.template-item.active {
  border-color: #1890ff;
  box-shadow: 0 6px 16px 0 rgba(24, 144, 255, 0.2);
}

.template-preview {
  height: 180px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s;
}

.template-item:hover .preview-img {
  transform: scale(1.05);
}

.template-info {
  padding: 15px;
}

.template-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.template-info p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.el-form-item {
  margin-bottom: 25px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.form-row .el-form-item {
  flex: 1;
  min-width: 300px;
  margin-bottom: 0;
}

.unit-label {
  margin-left: 10px;
  color: #606266;
}

.form-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.background-preview {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.background-preview .preview-img {
  width: 200px;
  height: 100px;
  object-fit: cover;
  border: 1px solid #ddd;
}

.charts-config {
  margin-top: 20px;
}

.chart-config-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.chart-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 16px;
  margin-top: 40px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.preview-content {
  width: 100%;
  height: calc(100vh - 200px);
  overflow: hidden;
}

.screen-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  transition: all 0.3s;
}

.screen-title {
  font-size: 36px;
  margin: 0 0 20px 0;
  text-align: center;
}

.screen-subtitle {
  font-size: 18px;
  margin: 0 0 40px 0;
  opacity: 0.8;
}

.preview-placeholder {
  text-align: center;
  font-size: 18px;
  opacity: 0.6;
}

.preview-placeholder p {
  margin: 10px 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .template-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .form-row .el-form-item {
    min-width: 100%;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
  
  .chart-config-item {
    padding: 15px;
  }
}
</style>