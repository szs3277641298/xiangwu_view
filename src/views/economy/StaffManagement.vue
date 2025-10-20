<template>
  <div class="staff-management-container">

    <!-- 搜索筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <div class="search-header">
        <div class="search-title">
          <el-icon><Search /></el-icon>
          <span>搜索筛选</span>
        </div>
        <el-button 
          type="text" 
          @click="toggleSearchExpanded"
          class="toggle-btn"
        >
          <el-icon v-if="!searchExpanded"><ArrowDown /></el-icon>
          <el-icon v-else><ArrowUp /></el-icon>
          {{ searchExpanded ? '收起' : '展开' }}
        </el-button>
      </div>
      
      <!-- 快速搜索 -->
      <div class="quick-search">
        <el-form :model="searchForm" class="quick-search-form">
          <div class="search-input-group">
            <el-input
              v-model="searchForm.objectName"
              placeholder="请输入项目名称"
              clearable
              class="search-input"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleSearch" class="search-btn">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset" class="reset-btn">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </el-form>
      </div>

      <!-- 详细搜索区域（可折叠） -->
      <el-collapse-transition>
        <div v-show="searchExpanded" class="detailed-search">
          <el-form :model="searchForm" class="filter-form">
            <!-- 基本信息 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Briefcase /></el-icon>
                <span>项目信息</span>
              </div>
              <div class="form-grid">
                <el-form-item label="项目名称">
                  <el-input
                    v-model="searchForm.objectName"
                    placeholder="请输入项目名称"
                    clearable
                    class="form-input"
                  />
                </el-form-item>
                <el-form-item label="负责人">
                  <el-input
                    v-model="searchForm.managerName"
                    placeholder="请输入负责人姓名"
                    clearable
                    class="form-input"
                  />
                </el-form-item>
                <el-form-item label="项目类型">
                  <el-select v-model="searchForm.typeId" placeholder="请选择项目类型" clearable class="form-select">
                    <el-option 
                      v-for="option in projectTypeOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="项目状态">
                  <el-select v-model="searchForm.statusId" placeholder="请选择项目状态" clearable class="form-select">
                    <el-option 
                      v-for="option in projectStatusOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="项目地址">
                  <el-input
                    v-model="searchForm.address"
                    placeholder="请输入项目地址"
                    clearable
                    class="form-input"
                  />
                </el-form-item>
              </div>
            </div>

            <!-- 负责人信息 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><User /></el-icon>
                <span>负责人信息</span>
              </div>
              <div class="form-grid">
                <el-form-item label="负责人姓名">
                  <el-input
                    v-model="searchForm.managerName"
                    placeholder="请输入负责人姓名"
                    clearable
                    class="form-input"
                  />
                </el-form-item>
                <el-form-item label="性别">
                  <el-select v-model="searchForm.genderId" placeholder="请选择性别" clearable class="form-select">
                    <el-option 
                      v-for="option in genderOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="年龄范围">
                  <div class="range-input-group">
                    <el-input
                      v-model="searchForm.minAge"
                      placeholder="最小年龄"
                      type="number"
                      class="range-input"
                    />
                    <span class="range-separator">-</span>
                    <el-input
                      v-model="searchForm.maxAge"
                      placeholder="最大年龄"
                      type="number"
                      class="range-input"
                    />
                  </div>
                </el-form-item>
              </div>
            </div>

            <!-- 财务信息 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Money /></el-icon>
                <span>财务信息</span>
              </div>
              <div class="form-grid">
                <el-form-item label="投资金额">
                  <div class="range-input-group">
                    <el-input
                      v-model="searchForm.minInvestment"
                      placeholder="最小金额"
                      type="number"
                      class="range-input"
                    />
                    <span class="range-separator">-</span>
                    <el-input
                      v-model="searchForm.maxInvestment"
                      placeholder="最大金额"
                      type="number"
                      class="range-input"
                    />
                  </div>
                </el-form-item>
                <el-form-item label="年收入">
                  <div class="range-input-group">
                    <el-input
                      v-model="searchForm.minAnnualRevenue"
                      placeholder="最小收入"
                      type="number"
                      class="range-input"
                    />
                    <span class="range-separator">-</span>
                    <el-input
                      v-model="searchForm.maxAnnualRevenue"
                      placeholder="最大收入"
                      type="number"
                      class="range-input"
                    />
                  </div>
                </el-form-item>
              </div>
            </div>

            <!-- 时间信息 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Calendar /></el-icon>
                <span>时间信息</span>
              </div>
              <div class="form-grid">
                <el-form-item label="开始时间">
                  <el-date-picker
                    v-model="searchForm.startDateStart"
                    type="date"
                    placeholder="开始时间范围-开始"
                    clearable
                    class="form-date-picker"
                  />
                  <span style="margin: 0 8px">-</span>
                  <el-date-picker
                    v-model="searchForm.startDateEnd"
                    type="date"
                    placeholder="开始时间范围-结束"
                    clearable
                    class="form-date-picker"
                  />
                </el-form-item>
                <el-form-item label="结束时间">
                  <el-date-picker
                    v-model="searchForm.endDateStart"
                    type="date"
                    placeholder="结束时间范围-开始"
                    clearable
                    class="form-date-picker"
                  />
                  <span style="margin: 0 8px">-</span>
                  <el-date-picker
                    v-model="searchForm.endDateEnd"
                    type="date"
                    placeholder="结束时间范围-结束"
                    clearable
                    class="form-date-picker"
                  />
                </el-form-item>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="filter-actions">
              <el-button type="primary" @click="handleAdvancedSearch" class="search-btn">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset" class="reset-btn">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </div>
          </el-form>
        </div>
      </el-collapse-transition>
    </el-card>

    <!-- 项目列表 -->
    <div class="projects-grid">
      <div 
        v-for="project in projectsData" 
        :key="project.id" 
        class="project-card"
        @click="handleProjectClick(project)"
      >
        <div class="project-header">
          <h3 class="project-title">{{ project.objectName }}</h3>
          <el-tag :type="getStatusType(project.statusId)" size="small">
            {{ project.statusName || '未知' }}
          </el-tag>
        </div>
        
        <div class="project-content">
          <div class="project-info">
            <div class="info-item">
              <el-icon><Briefcase /></el-icon>
              <span>{{ project.typeName || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">投资金额：</span>
              <span>¥{{ Number(project.investment).toLocaleString() }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">年回报：</span>
              <span>¥{{ Number(project.annualRevenue).toLocaleString() }}</span>
            </div>
          </div>
          
          <div class="project-stats">
            <div class="stat-item">
              <span class="stat-label">人员数量</span>
              <span class="stat-value">{{ project.staffCount || 0 }}人</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">负责人</span>
              <span class="stat-value">{{ project.name || '未分配' }}</span>
            </div>
          </div>
        </div>
        
        <div class="project-actions">
          <el-button type="primary" size="small" @click.stop="handleProjectClick(project)">
            管理人员
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="projectsData.length === 0 && !loading" class="empty-state">
      <el-icon class="empty-icon"><Briefcase /></el-icon>
      <p>暂无项目数据</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ArrowDown, ArrowUp, Refresh, Briefcase, Money, Loading, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { economyAPI, dictAPI } from '../../api/api.js'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchExpanded = ref(false)
const projectsData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 搜索表单
const searchForm = reactive({
  objectName: '',
  typeId: null,
  statusId: null,
  managerName: '',
  address: '',
  minInvestment: '',
  maxInvestment: '',
  minAnnualRevenue: '',
  maxAnnualRevenue: '',
  startDateStart: null,
  startDateEnd: null,
  endDateStart: null,
  endDateEnd: null,
  minAge: '',
  maxAge: '',
  genderId: null
})

// 字典类型和字典数据
const dictTypeList = ref([])
const dictDataMap = ref(new Map())

// 表单字段与字典类型的映射
const fieldToDictTypeMap = {
  'typeId': 'economy_type',      // 项目类型
  'statusId': 'economy_status',  // 项目状态
  'genderId': 'gender'           // 性别
}

// 枚举选项数据 - 从字典动态获取
const projectTypeOptions = ref([])
const projectStatusOptions = ref([])
const genderOptions = ref([])

// ==================== 字典数据加载函数 ====================

// 根据表单字段加载对应的字典数据
const loadDictDataForField = async (fieldName) => {
  const dictType = fieldToDictTypeMap[fieldName]
  if (!dictType) {
    console.log(`字段 ${fieldName} 没有对应的字典类型`)
    return []
  }
  
  try {
    console.log(`开始加载字段 ${fieldName} 对应的字典数据，类型: ${dictType}`)
    
    const response = await dictAPI.getDictDataByTypeCode(dictType)
    console.log(`字段 ${fieldName} 字典数据API响应:`, response)
    
    if (response && response.code === 200) {
      const data = response.data || []
      console.log(`获取到的字典数据:`, data)
      
      // 转换为选项格式 - 使用数字ID
      const options = data.map(item => ({
        id: item.id,  // 使用数字ID
        name: item.dictLabel
      }))
      
      console.log(`字段 ${fieldName} 转换后的选项:`, options)
      return options
    } else {
      console.warn(`字段 ${fieldName} 字典数据API返回异常:`, response)
      return []
    }
  } catch (error) {
    console.error(`加载字段 ${fieldName} 字典数据失败:`, error)
    return []
  }
}

// 加载所有需要的字典数据
const loadAllDictData = async () => {
  try {
    console.log('=== 项目人员管理页面开始加载字典数据 ===')
    
    // 并行加载所有表单字段对应的字典数据
    const fieldNames = Object.keys(fieldToDictTypeMap)
    console.log('需要加载的字段:', fieldNames)
    
    const promises = fieldNames.map(async (fieldName) => {
      console.log(`开始加载字段: ${fieldName}`)
      const options = await loadDictDataForField(fieldName)
      console.log(`字段 ${fieldName} 加载完成，获取到 ${options.length} 个选项`)
      return { fieldName, options }
    })
    
    console.log('等待所有字段数据加载完成...')
    const results = await Promise.all(promises)
    console.log('所有字段字典数据加载结果:', results)
    
    // 更新对应的选项数据
    results.forEach(({ fieldName, options }) => {
      if (options.length > 0) {
        switch (fieldName) {
          case 'typeId':
            projectTypeOptions.value = options
            console.log(`项目类型选项已更新:`, options)
            break
          case 'statusId':
            projectStatusOptions.value = options
            console.log(`项目状态选项已更新:`, options)
            break
          case 'genderId':
            genderOptions.value = options
            console.log(`性别选项已更新:`, options)
            break
        }
        console.log(`字段 ${fieldName} 选项数据已更新，共 ${options.length} 个选项`)
      } else {
        console.warn(`字段 ${fieldName} 没有获取到数据，将使用备用数据`)
      }
    })
    
    // 检查是否有字段没有数据，如果有则使用备用数据
    const hasEmptyFields = results.some(({ options }) => options.length === 0)
    if (hasEmptyFields) {
      console.log('部分字段没有数据，使用备用数据填充')
      loadFallbackData()
    }
    
    console.log('=== 项目人员管理页面所有字典数据加载完成 ===')
    console.log('最终选项数据:')
    console.log('- 项目类型:', projectTypeOptions.value.length, '个选项')
    console.log('- 项目状态:', projectStatusOptions.value.length, '个选项')
    console.log('- 性别:', genderOptions.value.length, '个选项')
    
  } catch (error) {
    console.error('加载字典数据失败:', error)
    console.log('使用备用数据确保功能正常')
    loadFallbackData()
  }
}

// 备用数据（当字典API失败时使用）
const loadFallbackData = () => {
  console.log('使用备用数据...')
  if (projectTypeOptions.value.length === 0) {
    projectTypeOptions.value = [
      { id: 15, name: '种植' },
      { id: 16, name: '养殖' },
      { id: 17, name: '加工' },
      { id: 18, name: '旅游' },
      { id: 19, name: '其他' }
    ]
  }
  
  if (projectStatusOptions.value.length === 0) {
    projectStatusOptions.value = [
      { id: 20, name: '运营' },
      { id: 21, name: '筹备' },
      { id: 22, name: '暂停' },
      { id: 23, name: '终止' }
    ]
  }
  
  if (genderOptions.value.length === 0) {
    genderOptions.value = [
      { id: 29, name: '男' },
      { id: 30, name: '女' }
    ]
  }
  
  console.log('备用数据加载完成')
}

// ==================== 页面方法 ====================

// 方法
const toggleSearchExpanded = () => {
  searchExpanded.value = !searchExpanded.value
}

const handleSearch = async () => {
  currentPage.value = 1
  await loadProjectsData()
}

const handleAdvancedSearch = () => {
  currentPage.value = 1
  loadProjectsData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    objectName: '',
    typeId: null,
    statusId: null,
    managerName: '',
    address: '',
    minInvestment: '',
    maxInvestment: '',
    minAnnualRevenue: '',
    maxAnnualRevenue: '',
    startDateStart: null,
    startDateEnd: null,
    endDateStart: null,
    endDateEnd: null,
    minAge: '',
    maxAge: '',
    genderId: null
  })
  handleSearch()
}

const loadProjectsData = async () => {
  console.log('=== 开始加载项目数据 ===')
  loading.value = true
  try {
    const queryData = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...cleanSearchForm(searchForm)
    }
    console.log('请求参数:', queryData)
    console.log('调用API: economyAPI.getEconomyList')
    const response = await economyAPI.getEconomyList(queryData)
    console.log('API响应:', response)
    
    if (response.code === 200) {
      projectsData.value = response.data.list || []
      total.value = response.data.total || 0
      console.log('项目数据加载成功，共', projectsData.value.length, '条')
    } else {
      console.error('API返回错误:', response.message)
      ElMessage.error(response.message || '获取项目列表失败')
    }
  } catch (error) {
    console.error('加载项目数据失败:', error)
    ElMessage.error('加载项目数据失败')
  } finally {
    loading.value = false
    console.log('=== 项目数据加载完成 ===')
  }
}

// 清理搜索表单数据
const cleanSearchForm = (form) => {
  const cleaned = {}
  Object.keys(form).forEach(key => {
    const value = form[key]
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value
    }
  })
  return cleaned
}

const handleProjectClick = (project) => {
  router.push({
    name: 'ProjectStaffDetail',
    params: { projectId: project.id },
    query: { projectName: project.objectName }
  })
}


const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadProjectsData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadProjectsData()
}


// 项目状态类型
const getStatusType = (statusId) => {
  const typeMap = {
    21: 'warning',  // 筹备
    20: 'success',  // 运营
    22: 'info',     // 暂停
    23: 'danger'    // 终止
  }
  return typeMap[statusId] || 'default'
}

// 组件挂载时加载数据
onMounted(async () => {
  console.log('=== 项目人员管理页面开始初始化 ===')
  // 先加载字典数据
  console.log('开始加载字典数据...')
  await loadAllDictData()
  console.log('字典数据加载完成')
  // 再加载项目数据
  console.log('开始加载项目数据...')
  await loadProjectsData()
  console.log('=== 项目人员管理页面初始化完成 ===')
})
</script>

<style scoped>
.staff-management-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}


.filter-card {
  margin-bottom: 20px;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.search-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #303133;
}

.toggle-btn {
  color: #409eff;
}

.quick-search {
  margin-bottom: 16px;
}

.quick-search-form {
  margin: 0;
}

.search-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.search-btn, .reset-btn {
  min-width: 80px;
}

.filter-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.advanced-search {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.advanced-search-form {
  margin: 0;
}

.filter-form {
  margin: 0;
}

.filter-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.section-title .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.form-input,
.form-select,
.form-date-picker {
  width: 100%;
}

.range-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-input {
  flex: 1;
}

.range-separator {
  color: #909399;
  font-weight: 500;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.project-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.project-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  flex: 1;
  margin-right: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-content {
  margin-bottom: 16px;
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.info-item .el-icon {
  font-size: 16px;
  color: #909399;
}

.info-item .info-label {
  font-weight: 500;
  color: #303133;
  min-width: 60px;
}

.project-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.project-actions {
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.loading-state .el-icon {
  font-size: 24px;
  margin-right: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .search-input-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    max-width: none;
  }
}
</style>
