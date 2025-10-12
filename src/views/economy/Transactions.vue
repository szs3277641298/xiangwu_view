<template>
  <div class="transactions-container">
    <!-- 筛选条件区域 -->
    <el-card class="filter-card" shadow="never">
      <div class="search-header">
        <div class="search-title">
          <el-icon><Search /></el-icon>
          <span>搜索筛选</span>
        </div>
        <div class="header-actions">
          <el-button type="text" @click="toggleSearchExpanded" class="toggle-btn">
            <el-icon v-if="!searchExpanded"><ArrowDown /></el-icon>
            <el-icon v-else><ArrowUp /></el-icon>
            {{ searchExpanded ? '收起' : '展开' }}
          </el-button>
        </div>
      </div>
      
      <!-- 快速搜索区域 -->
      <div class="quick-search">
        <el-form :model="searchForm" class="quick-search-form">
          <div class="search-input-group">
        <el-input
              v-model="searchForm.projectname"
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
    
      <!-- 详细搜索区域 -->
      <el-collapse-transition>
        <div v-show="searchExpanded" class="detailed-search">
          <el-form :model="searchForm" class="filter-form">
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Briefcase /></el-icon>
                <span>项目信息</span>
          </div>
              <div class="form-grid">
                <el-form-item label="项目名称">
                  <el-input v-model="searchForm.projectname" placeholder="请输入项目名称" clearable class="form-input" />
                </el-form-item>
                <el-form-item label="项目类型">
                  <el-select v-model="searchForm.projectTypeId" placeholder="请选择" clearable class="form-input">
                    <el-option 
                      v-for="option in projectTypeOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="收支类型">
                  <el-select v-model="searchForm.payTypeId" placeholder="请选择" clearable class="form-input">
                    <el-option 
                      v-for="option in payTypeOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
          </div>
        </div>
            
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Money /></el-icon>
                <span>金额信息</span>
          </div>
              <div class="form-grid">
                <el-form-item label="金额范围">
                  <div class="amount-range">
                    <el-input v-model.number="searchForm.minAmount" placeholder="最小金额" type="number" class="amount-input" />
                    <span class="range-separator">-</span>
                    <el-input v-model.number="searchForm.maxAmount" placeholder="最大金额" type="number" class="amount-input" />
          </div>
                </el-form-item>
        </div>
            </div>
            
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Calendar /></el-icon>
                <span>时间范围</span>
          </div>
              <div class="form-grid">
                <el-form-item label="收支日期">
                  <div class="date-range">
                    <el-date-picker v-model="searchForm.startDate" type="date" placeholder="开始日期" class="date-input" />
                    <span class="range-separator">-</span>
                    <el-date-picker v-model="searchForm.endDate" type="date" placeholder="结束日期" class="date-input" />
          </div>
                </el-form-item>
        </div>
            </div>
          </el-form>
        </div>
      </el-collapse-transition>
      </el-card>
    
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="success" v-if="isAdmin" @click="handleBatchImport">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button type="primary" @click="handleAddTransaction">
          <el-icon><Plus /></el-icon>
          新增收支记录
        </el-button>
        <el-button type="warning" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
        <el-button type="info" @click="handleGenerateTemplate">
          <el-icon><Document /></el-icon>
          生成模板
        </el-button>
      </div>
    </div>
    
    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="transactionData" style="width: 100%">
        <el-table-column prop="id" label="记录ID" width="80" />
        <el-table-column prop="projectname" label="项目名称" min-width="150" />
        <el-table-column prop="projectType" label="项目类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getProjectTypeTagType(row.projectTypeId)">
              {{ row.projectTypeLabel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payType" label="收支类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getPayTypeTagType(row.payTypeId)">
              {{ row.payTypeLabel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            <span class="amount-text" :class="getAmountClass(row.payTypeId)">
              {{ getAmountPrefix(row.payTypeId) }}¥{{ row.amount || 0 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="收支日期" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="{ row }">
            <span class="description-text">{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="140">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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
    
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑收支记录' : '新增收支记录'" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="选择项目" prop="projectId">
          <div class="project-selector">
            <!-- 编辑模式：只读显示当前项目信息 -->
            <div v-if="isEdit" class="readonly-project">
              <!-- 隐藏的输入框用于表单验证 -->
              <el-input v-model="formData.projectId" style="display: none;" />
              <el-input
                :value="selectedProject ? selectedProject.objectName : (formData.projectname || '')"
                placeholder="当前项目信息"
                readonly
                class="project-input"
              >
                <template #suffix>
                  <el-icon class="lock-icon"><Lock /></el-icon>
                </template>
              </el-input>
              <div v-if="selectedProject || formData.projectname" class="selected-project readonly">
                <div class="project-info">
                  <span class="project-name">{{ selectedProject ? selectedProject.objectName : formData.projectname }}</span>
                  <span class="project-details">
                    {{ getProjectTypeLabel(selectedProject ? selectedProject.type : formData.projectType) }} · 投资: ¥{{ selectedProject ? (selectedProject.investment || 0) : '未知' }}
                  </span>
        </div>
              </div>
            </div>
            
            <!-- 新增模式：可搜索选择项目 -->
            <div v-else>
              <el-input
                v-model="projectSearchQuery"
                placeholder="请输入项目名称进行搜索"
                @input="handleProjectSearch($event)"
                @focus="projectSearchVisible = true"
                class="project-input"
              >
                <template #suffix>
                  <el-icon class="search-icon" @click="projectSearchVisible = true">
                    <Search />
                  </el-icon>
                </template>
              </el-input>
              
              <!-- 已选择的项目信息 -->
              <div v-if="selectedProject && selectedProject.objectName" class="selected-project">
                <div class="project-info">
                  <span class="project-name">{{ selectedProject.objectName }}</span>
                  <span class="project-details">
                    {{ getProjectTypeLabel(selectedProject.type) }} · 投资: ¥{{ selectedProject.investment || 0 }}
                  </span>
                </div>
                <el-button 
                  type="text" 
                  @click="clearProjectSelection"
                  class="clear-btn"
                >
                  清除
                </el-button>
              </div>
              
              <!-- 项目搜索结果下拉 -->
              <div v-if="projectSearchVisible && projectSearchQuery && projectSearchQuery.trim().length >= 1" class="project-search-results">
                <div v-if="projectSearchLoading" class="loading-text">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  搜索中...
                </div>
                <div v-else-if="projectSearchResults.length === 0" class="no-results">
                  未找到相关项目
                </div>
                <div v-else class="search-list">
                  <div 
                    v-for="project in projectSearchResults" 
                    :key="project.id || project.objectName"
                    class="search-item"
                    @click="selectProject(project)"
                  >
                    <div class="item-info">
                      <span class="item-name">{{ project.objectName }}</span>
                      <span class="item-details">
                        {{ getProjectTypeLabel(project.type) }} · 投资: ¥{{ project.investment || 0 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </el-form-item>
        <div class="form-row">
          <el-form-item label="收支类型" prop="payTypeId">
            <el-select v-model="formData.payTypeId" placeholder="请选择收支类型">
              <el-option v-for="option in payTypeOptions" :key="option.id" :label="option.name" :value="option.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="金额" prop="amount">
            <el-input v-model.number="formData.amount" placeholder="请输入金额">
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="收支日期" prop="date">
            <el-date-picker v-model="formData.date" type="date" placeholder="请选择收支日期" />
          </el-form-item>
        </div>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入收支记录" width="500px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :on-change="handleImportFileChange"
        :before-upload="beforeUpload"
        accept=".xlsx,.xls"
        drag
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">只能上传 xlsx/xls 文件，且不超过 10MB</div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImport" :loading="importLoading">确定导入</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导出数据对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出集体经济收支明细"
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
            <h3>数据导出</h3>
            <p>将导出当前筛选条件下的所有集体经济收支明细</p>
          </div>
        </div>
        <div class="export-actions">
          <el-button type="primary" @click="handleSelectPath" :loading="exportLoading" size="large">
            <el-icon><Download /></el-icon>
            选择路径导出
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 路径选择对话框 -->
    <el-dialog
      v-model="pathDialogVisible"
      title="选择导出路径"
      width="600px"
      :before-close="handlePathClose"
      class="path-dialog"
      center
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div class="path-container">
        <div class="path-form">
          <el-form :model="pathForm" label-width="120px">
            <el-form-item label="保存路径" required>
              <div class="path-input-group">
                <el-input
                  v-model="pathForm.directory"
                  placeholder="请选择保存目录"
                  class="path-input"
                  readonly
                  @click="handleSelectDirectory"
                />
                <el-button @click="handleSelectDirectory" type="primary">
                  <el-icon><FolderOpened /></el-icon>
                  浏览文件夹
                </el-button>
              </div>
              <div class="path-tips">
                <el-icon><InfoFilled /></el-icon>
                <span>由于浏览器安全限制，无法直接获取完整路径，请手动输入保存目录的完整路径</span>
              </div>
            </el-form-item>
            <el-form-item label="文件名" required>
              <el-input
                v-model="pathForm.filename"
                placeholder="请输入文件名（不含扩展名）"
                @input="handleFilenameChange"
              />
              <div class="filename-preview">
                完整路径：{{ fullPath }}
              </div>
            </el-form-item>
            <el-form-item label="工作表名称">
              <el-input
                v-model="pathForm.sheetName"
                placeholder="请输入工作表名称"
              />
            </el-form-item>
          </el-form>
        </div>
        
        <div class="path-actions">
          <el-button @click="handlePathClose">取消</el-button>
          <el-button type="primary" @click="handleConfirmExport" :loading="exportLoading">
            <el-icon><Download /></el-icon>
            确认导出
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 模板路径选择对话框 -->
    <el-dialog
      v-model="templatePathDialogVisible"
      title="选择模板保存路径"
      width="600px"
      :before-close="handleTemplatePathClose"
      class="template-path-dialog"
      center
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div class="path-container">
        <div class="path-form">
          <el-form :model="templatePathForm" label-width="120px">
            <el-form-item label="保存路径" required>
              <div class="path-input-group">
                <el-input
                  v-model="templatePathForm.directory"
                  placeholder="请选择模板保存目录"
                  class="path-input"
                  readonly
                  @click="handleSelectTemplateDirectory"
                />
                <el-button @click="handleSelectTemplateDirectory" type="primary">
                  <el-icon><FolderOpened /></el-icon>
                  浏览文件夹
                </el-button>
              </div>
              <div class="path-tips">
                <el-icon><InfoFilled /></el-icon>
                <span>由于浏览器安全限制，无法直接获取完整路径，请手动输入保存目录的完整路径</span>
              </div>
            </el-form-item>
            <el-form-item label="文件名" required>
              <el-input
                v-model="templatePathForm.filename"
                placeholder="请输入模板文件名（不含扩展名）"
                @input="handleTemplateFilenameChange"
              />
              <div class="filename-preview">
                完整路径：{{ templateFullPath }}
              </div>
            </el-form-item>
            <el-form-item label="工作表名称">
              <el-input
                v-model="templatePathForm.sheetName"
                placeholder="请输入工作表名称"
              />
            </el-form-item>
          </el-form>
        </div>
        
        <div class="path-actions">
          <el-button @click="handleTemplatePathClose">取消</el-button>
          <el-button type="primary" @click="handleConfirmTemplate" :loading="exportLoading">
            <el-icon><Document /></el-icon>
            确认生成
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Plus, Upload, Download, Refresh, ArrowDown, ArrowUp, Briefcase, Money, Calendar, UploadFilled, Document, Loading, Lock, FolderOpened, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../store/index.js'
import { economyTransactionAPI, economyAPI, dictAPI } from '../../api/api.js'

// 用户状态
const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)

// 表格数据相关
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const transactionData = ref([])

// 搜索表单
const searchForm = reactive({
  projectname: '',           // String - 项目名
  projectTypeId: null,       // Integer - 项目类型ID
  payTypeId: null,           // Integer - 收支类型ID
  minAmount: null,           // BigDecimal - 最小金额
  maxAmount: null,           // BigDecimal - 最大金额
  startDate: null,           // LocalDateTime - 最早收支日期
  endDate: null              // LocalDateTime - 最晚收支日期
})

// 搜索展开状态
const searchExpanded = ref(false)

// 字典类型映射
const dictTypeList = ref([])
const dictDataMap = ref({})
const fieldToDictTypeMap = {
  projectTypeId: 'economy_type',  // 项目类型
  payTypeId: 'pay_type'          // 收支类型
}

// 动态选项数据
const projectTypeOptions = ref([])
const payTypeOptions = ref([])

// 表单相关
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const uploadRef = ref(null)
const selectedFile = ref(null)
const submitting = ref(false)

// 批量导入相关
const importLoading = ref(false)

// 导出相关
const exportDialogVisible = ref(false)
const exportLoading = ref(false)

// 路径选择相关
const pathDialogVisible = ref(false)
const pathForm = reactive({
  directory: '',
  filename: '',
  sheetName: '集体经济收支明细'
})

// 模板生成相关
const templatePathDialogVisible = ref(false)
const templatePathForm = reactive({
  directory: '',
  filename: '',
  sheetName: '模板_集体经济收支明细'
})

// 项目搜索相关
const projectSearchQuery = ref('')
const projectSearchResults = ref([])
const projectSearchVisible = ref(false)
const projectSearchLoading = ref(false)
const selectedProject = ref(null)

const formData = reactive({
  id: null,               // Long - ID
  projectId: null,        // Long - 项目ID
  payTypeId: null,        // Integer - 收支类型ID
  amount: null,           // BigDecimal - 金额
  date: null,             // LocalDateTime - 时间
  description: '',        // String - 描述
  createTime: null        // LocalDateTime - 创建时间
})

// 表单验证规则
const formRules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  payTypeId: [{ required: true, message: '请选择收支类型', trigger: 'change' }],
  amount: [
    { required: true, message: '请输入金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
  ],
  date: [{ required: true, message: '请选择收支日期', trigger: 'change' }]
}

// 获取项目类型标签
const getProjectTypeLabel = (type) => {
  const typeMap = {
    'PLANTING': '种植业',
    'BREEDING': '养殖业',
    'PROCESSING': '加工业',
    'SERVICE': '服务业',
    'OTHER': '其他'
  }
  return typeMap[type] || '未知'
}

// 获取项目类型标签类型
const getProjectTypeTagType = (typeId) => {
  const typeMap = {
    15: 'success',  // 种植
    16: 'warning',  // 养殖
    17: 'info',     // 加工
    18: 'primary',  // 旅游
    19: 'default'   // 其他
  }
  return typeMap[typeId] || 'default'
}

// 获取收支类型标签
const getPayTypeLabel = (type) => {
  const typeMap = {
    'INCOME': '收入',
    'EXPENSE': '支出'
  }
  return typeMap[type] || '未知'
}

// 获取收支类型标签类型
const getPayTypeTagType = (typeId) => {
  const typeMap = {
    1: 'success',  // 收入
    2: 'danger'    // 支出
  }
  return typeMap[typeId] || 'default'
}

// 获取金额显示前缀
const getAmountPrefix = (typeId) => {
  return typeId === 1 ? '+' : '-'
}

// 获取金额样式类
const getAmountClass = (typeId) => {
  return typeId === 1 ? 'income-amount' : 'expense-amount'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化日期为后端期望的格式 (yyyy-MM-dd)
const formatDateForBackend = (date) => {
  if (!date) return null
  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 项目搜索方法
const searchProjects = async (query) => {
  if (!query || query.trim().length < 1) {
    projectSearchResults.value = []
    return
  }

  projectSearchLoading.value = true
  try {
    // 调用项目总览的筛选接口
    const response = await economyAPI.getEconomyList({
      objectName: query.trim(),
      pageNum: 1,
      pageSize: 10
    })

    if (response && response.code === 200 && response.data) {
      projectSearchResults.value = response.data.list || []
    } else {
      projectSearchResults.value = []
    }
  } catch (error) {
    console.error('搜索项目失败:', error)
    projectSearchResults.value = []
  } finally {
    projectSearchLoading.value = false
  }
}

const handleProjectSearch = (query) => {
  projectSearchQuery.value = query
  if (query && query.trim().length >= 1) {
    projectSearchVisible.value = true
    searchProjects(query)
  } else {
    projectSearchVisible.value = false
    projectSearchResults.value = []
  }
}

const selectProject = (project) => {
  if (project && project.id) {
    selectedProject.value = project
    formData.projectId = project.id
    formData.projectname = project.objectName
    formData.projectType = project.type
    projectSearchVisible.value = false
    projectSearchQuery.value = ''
    projectSearchResults.value = []
  }
}

const clearProjectSelection = () => {
  selectedProject.value = null
  formData.projectId = null
  formData.projectname = ''
  formData.projectType = ''
  projectSearchQuery.value = ''
  projectSearchResults.value = []
}

// 清理搜索表单，只发送有值的字段
const cleanSearchForm = (form) => {
  const cleaned = {}
  Object.keys(form).forEach(key => {
    const value = form[key]
    if (value !== null && value !== undefined && value !== '') {
      // 确保数字类型字段正确转换
      if (key === 'projectTypeId' || key === 'payTypeId') {
        cleaned[key] = Number(value)
      } else if (key === 'minAmount' || key === 'maxAmount') {
        cleaned[key] = Number(value)
      } else {
        cleaned[key] = value
      }
    }
  })
  return cleaned
}

// 字典数据加载函数
const loadDictDataForField = async (fieldName) => {
  const dictType = fieldToDictTypeMap[fieldName]
  if (!dictType) return

  try {
    const response = await dictAPI.getDictDataByTypeCode(dictType)
    if (response.code === 200) {
      const dictData = response.data || []
      dictDataMap.value[dictType] = dictData
      
      // 根据字段名更新对应的选项
      switch (fieldName) {
        case 'projectTypeId':
          projectTypeOptions.value = dictData.map(item => ({
            id: item.id,
            name: item.dictLabel
          }))
          break
        case 'payTypeId':
          payTypeOptions.value = dictData.map(item => ({
            id: item.id,
            name: item.dictLabel
          }))
          break
      }
    }
  } catch (error) {
    console.error(`加载字典数据失败 (${dictType}):`, error)
  }
}

// 加载所有字典数据
const loadAllDictData = async () => {
  try {
    // 并行加载所有字典数据
    const promises = Object.keys(fieldToDictTypeMap).map(fieldName => 
      loadDictDataForField(fieldName)
    )
    await Promise.all(promises)
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const queryData = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...cleanSearchForm(searchForm)
    }
    
    const response = await economyTransactionAPI.getEconomyTransactionList(queryData)
    if (response.code === 200) {
      const data = response.data
      transactionData.value = data.list || []
      total.value = data.total || 0
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取收支记录失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (key === 'projectname') {
      searchForm[key] = ''           // String 字段重置为空字符串
    } else {
      searchForm[key] = null         // Integer/BigDecimal/LocalDateTime 字段重置为 null
    }
  })
  currentPage.value = 1
  loadData()
}

// 切换搜索展开状态
const toggleSearchExpanded = () => {
  searchExpanded.value = !searchExpanded.value
}

// 分页相关方法
const handleSizeChange = (size) => {
  pageSize.value = size
  loadData()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  loadData()
}

// 新增收支记录
const handleAddTransaction = () => {
  isEdit.value = false
  // 重置表单数据，匹配DTO字段
  formData.id = null
  formData.projectId = null
  formData.payTypeId = null
  formData.amount = null
  formData.date = null
  formData.description = ''
  formData.createTime = null
  
  // 重置项目搜索
  clearProjectSelection()
  dialogVisible.value = true
}

// 编辑收支记录
const handleEdit = async (row) => {
  isEdit.value = true
  
  // 只复制DTO中存在的字段
  formData.id = row.id
  formData.projectId = row.projectId
  formData.payTypeId = row.payTypeId
  formData.amount = row.amount
  formData.date = row.date
  formData.description = row.description || ''
  formData.createTime = row.createTime
  
  // 如果有项目ID，获取项目信息并自动选中
  if (row.projectId) {
    try {
      const response = await economyAPI.getEconomyInfo(row.projectId)
      if (response && response.code === 200 && response.data) {
        const project = response.data
        selectedProject.value = project
        projectSearchQuery.value = project.objectName || ''
      } else {
        // 如果获取项目详情失败，使用原始数据
        formData.projectId = row.projectId
        formData.projectname = row.projectname || ''
        formData.projectType = row.projectType || ''
      }
    } catch (error) {
      // 即使获取失败，也确保有基本的项目信息显示
      formData.projectId = projectId
      formData.projectname = row.projectname || ''
      formData.projectType = row.projectType || ''
    }
  } else {
    // 如果没有项目ID，至少设置一个默认值来避免验证错误
    formData.projectId = 1 // 临时设置，实际应该从后端获取正确的项目ID
  }
  
  dialogVisible.value = true
}

// 删除收支记录
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除 "${row.projectname}" 的收支记录吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await economyTransactionAPI.deleteEconomyTransaction(row.id)
      if (response.code === 200) {
    ElMessage.success('删除成功')
    loadData()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true
    
    const submitData = {
      projectId: formData.projectId ? Number(formData.projectId) : null,
      payTypeId: formData.payTypeId ? Number(formData.payTypeId) : null,
      amount: formData.amount ? Number(formData.amount) : null,
      date: formData.date ? formatDateForBackend(formData.date) : null,
      description: formData.description || null
    }
    
    if (isEdit.value) {
      // 编辑模式
      const response = await economyTransactionAPI.updateEconomyTransaction({
        id: formData.id,
        projectId: formData.projectId ? Number(formData.projectId) : null,
        payTypeId: formData.payTypeId ? Number(formData.payTypeId) : null,
        amount: formData.amount ? Number(formData.amount) : null,
        date: formData.date ? formatDateForBackend(formData.date) : null,
        description: formData.description || null,
        createTime: formData.createTime
      })
      if (response.code === 200) {
        ElMessage.success('编辑成功')
    dialogVisible.value = false
    loadData()
      } else {
        ElMessage.error(response.message || '编辑失败')
      }
    } else {
      // 新增模式
      const response = await economyTransactionAPI.addEconomyTransaction(submitData)
      if (response.code === 200) {
        ElMessage.success('新增成功')
    dialogVisible.value = false
    loadData()
      } else {
        ElMessage.error(response.message || '新增失败')
      }
    }
  } catch (error) {
    console.error('提交失败:', error)
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('提交失败，请检查表单数据')
    }
  } finally {
    submitting.value = false
  }
}

// 批量导入相关方法
const handleBatchImport = () => {
  importDialogVisible.value = true
  clearSelectedFile()
}

const handleImportFileChange = (file) => {
  selectedFile.value = file
}

const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel'
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  return false
}

const clearSelectedFile = () => {
  selectedFile.value = null
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择要导入的文件')
    return
  }
  
  importLoading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value.raw)
    
    const response = await economyTransactionAPI.importEconomyTransaction(formData)
    if (response.code === 200) {
      if (response.message && response.message.includes('失败原因')) {
        ElMessage.warning(response.message)
      } else {
        ElMessage.success(response.message || '导入成功')
      }
      importDialogVisible.value = false
      clearSelectedFile()
  loadData()
    } else {
      ElMessage.error(response.message || '导入失败，请重试')
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败，请稍后重试')
  } finally {
    importLoading.value = false
  }
}

// 导出相关方法
const handleExport = () => {
  exportDialogVisible.value = true
}

const handleExportClose = () => {
  exportDialogVisible.value = false
}

const handleSelectPath = () => {
  // 生成默认文件名
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
  pathForm.filename = `集体经济收支明细_${timestamp}`
  pathForm.sheetName = '集体经济收支明细'
  pathDialogVisible.value = true
}

const handlePathClose = () => {
  pathDialogVisible.value = false
  pathForm.directory = ''
  pathForm.filename = ''
  pathForm.sheetName = '集体经济收支明细'
}

const handleSelectDirectory = () => {
  // 由于浏览器安全限制，无法直接获取完整路径
  // 我们提供一个更实用的路径选择方案
  showPathInputDialog()
}

const showPathInputDialog = () => {
  ElMessageBox.prompt('请输入保存目录的完整路径', '选择保存目录', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '例如：D:\\',
    inputValue: 'D:\\', // 默认D盘根目录
    inputValidator: (value) => {
      if (!value || value.trim() === '') {
        return '请输入保存目录路径'
      }
      return true
    }
  }).then(({ value }) => {
    pathForm.directory = value.trim()
  }).catch(() => {
    // 用户取消
  })
}

const handleFilenameChange = () => {
  // 文件名变化时的处理逻辑
}

const fullPath = computed(() => {
  if (!pathForm.directory || !pathForm.filename) {
    return ''
  }
  const filename = pathForm.filename.endsWith('.xlsx') ? pathForm.filename : `${pathForm.filename}.xlsx`
  return `${pathForm.directory}/${filename}`
})

const handleConfirmExport = async () => {
  if (!pathForm.directory) {
    ElMessage.warning('请选择保存目录')
    return
  }
  
  if (!pathForm.filename) {
    ElMessage.warning('请输入文件名')
    return
  }
  
  exportLoading.value = true
  try {
    // 生成完整路径
    const filename = pathForm.filename.endsWith('.xlsx') ? pathForm.filename : `${pathForm.filename}.xlsx`
    const fullPath = `${pathForm.directory}/${filename}`
    
    // 构建导出请求数据
    const exportData = {
      exportRequest: {
        savepath: fullPath,
        sheetName: pathForm.sheetName || '集体经济收支明细'
      },
      queryRequest: {
        // 传递当前的筛选条件
        projectname: searchForm.projectname || null,
        projectTypeId: searchForm.projectTypeId || null,
        payTypeId: searchForm.payTypeId || null,
        minAmount: searchForm.minAmount || null,
        maxAmount: searchForm.maxAmount || null,
        startDate: searchForm.startDate || null,
        endDate: searchForm.endDate || null,
        // 导出时使用无限分页
        pageNum: 1,
        pageSize: 999999
      }
    }
    
    const response = await economyTransactionAPI.exportEconomyTransaction(exportData)
    if (response.code === 200) {
      ElMessage.success(`文件已导出到：${fullPath}`)
      pathDialogVisible.value = false
      exportDialogVisible.value = false
    } else {
      ElMessage.error(response.message || '导出失败，请重试')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  } finally {
    exportLoading.value = false
  }
}

// 模板生成相关方法
const handleGenerateTemplate = () => {
  templatePathDialogVisible.value = true
}

const handleTemplatePathClose = () => {
  templatePathDialogVisible.value = false
  templatePathForm.directory = ''
  templatePathForm.filename = ''
  templatePathForm.sheetName = '模板_集体经济收支明细'
}

const handleSelectTemplateDirectory = () => {
  ElMessageBox.prompt('请输入模板保存目录的完整路径', '选择模板保存目录', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '例如：D:\\',
    inputValue: 'D:\\', // 默认D盘根目录
    inputValidator: (value) => {
      if (!value || value.trim() === '') {
        return '请输入保存目录路径'
      }
      return true
    }
  }).then(({ value }) => {
    templatePathForm.directory = value.trim()
  }).catch(() => {
    // 用户取消
  })
}

const handleTemplateFilenameChange = () => {
  // 模板文件名变化时的处理逻辑
}

const templateFullPath = computed(() => {
  if (!templatePathForm.directory || !templatePathForm.filename) {
    return ''
  }
  const filename = templatePathForm.filename.endsWith('.xlsx') ? templatePathForm.filename : `${templatePathForm.filename}.xlsx`
  return `${templatePathForm.directory}/${filename}`
})

const handleConfirmTemplate = async () => {
  if (!templatePathForm.directory) {
    ElMessage.warning('请选择模板保存目录')
    return
  }
  
  if (!templatePathForm.filename) {
    ElMessage.warning('请输入模板文件名')
    return
  }
  
  exportLoading.value = true
  try {
    // 生成完整路径
    const filename = templatePathForm.filename.endsWith('.xlsx') ? templatePathForm.filename : `${templatePathForm.filename}.xlsx`
    const fullPath = `${templatePathForm.directory}/${filename}`
    
    // 构建模板生成请求数据
    const templateData = {
      templateRequest: {
        savepath: fullPath,
        sheetName: templatePathForm.sheetName || '模板_集体经济收支明细'
      }
    }
    
    const response = await economyTransactionAPI.generateTemplate(templateData)
    if (response.code === 200) {
      ElMessage.success(`模板已生成到：${fullPath}`)
      templatePathDialogVisible.value = false
    } else {
      ElMessage.error(response.message || '模板生成失败，请重试')
    }
  } catch (error) {
    console.error('模板生成失败:', error)
    ElMessage.error('模板生成失败，请稍后重试')
  } finally {
    exportLoading.value = false
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadAllDictData()
  loadData()
})
</script>

<style scoped>
.transactions-container {
  padding: 20px;
  margin: 0 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background-color: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.table-card {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.el-table {
  flex: 1;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.form-row .el-form-item {
  flex: 1;
  min-width: 200px;
}

.amount-text {
  font-weight: 500;
}

.income-amount {
  color: #67c23a;
}

.expense-amount {
  color: #f56c6c;
}

.description-text {
  color: #606266;
  font-size: 12px;
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
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
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.toggle-btn {
  color: #606266;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  color: #409eff;
  background: #f5f7fa;
}

/* 快速搜索 */
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
  flex-shrink: 0;
}

/* 详细搜索 */
.detailed-search {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.filter-form {
  margin: 0;
}

.filter-section {
  margin-bottom: 24px;
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
  font-weight: 500;
  color: #303133;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.form-input {
  width: 100%;
}

.amount-range, .date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount-input {
  flex: 1;
  min-width: 80px;
}

.date-input {
  flex: 1;
  min-width: 120px;
}

.range-separator {
  color: #909399;
  font-size: 14px;
  white-space: nowrap;
}

/* 项目选择器样式 */
.project-selector {
  position: relative;
  width: 100%;
}

.project-input {
  width: 100%;
}

/* 只读项目样式 */
.readonly-project .project-input {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
}

.readonly-project .project-input .el-input__inner {
  color: #606266;
  cursor: not-allowed;
}

.lock-icon {
  color: #909399;
  cursor: not-allowed;
}

.selected-project.readonly {
  background-color: #f8f9fa;
  border-color: #e9ecef;
  cursor: not-allowed;
}

.selected-project.readonly .project-name {
  color: #606266;
}

.selected-project.readonly .project-details {
  color: #909399;
}

.search-icon {
  cursor: pointer;
  color: #909399;
  transition: color 0.3s;
}

.search-icon:hover {
  color: #409eff;
}

.selected-project {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-info {
  flex: 1;
}

.project-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  margin-bottom: 4px;
  display: block;
}

.project-details {
  color: #606266;
  font-size: 12px;
  margin-bottom: 2px;
  display: block;
}

.clear-btn {
  color: #f56c6c;
  padding: 4px 8px;
  font-size: 12px;
}

.clear-btn:hover {
  background: #fef0f0;
}

.project-search-results {
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
.project-search-results::-webkit-scrollbar {
  width: 6px;
}

.project-search-results::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.project-search-results::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.project-search-results::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.loading-text, .no-results {
  padding: 12px;
  text-align: center;
  color: #909399;
  font-size: 12px;
}

/* 搜索列表样式由外层容器控制滚动 */
.search-list {
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
}

.search-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;
  flex-shrink: 0;
}

.search-item:hover {
  background-color: #f5f7fa;
}

.search-item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  margin-bottom: 4px;
}

.item-details {
  color: #606266;
  font-size: 12px;
  margin-bottom: 2px;
}

/* 导出对话框样式 */
.export-dialog .export-container {
  text-align: center;
  padding: 20px 0;
}

.export-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  gap: 15px;
}

.export-icon {
  font-size: 48px;
  color: #409eff;
}

.export-text h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
}

.export-text p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.export-actions {
  display: flex;
  justify-content: center;
}

/* 路径选择对话框样式 */
.path-dialog .path-container {
  padding: 20px 0;
}

.path-form {
  margin-bottom: 30px;
}

.path-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.path-input {
  flex: 1;
}

.path-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  color: #409eff;
  font-size: 12px;
}

.filename-preview {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  word-break: break-all;
}

.path-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 模板路径选择对话框样式 */
.template-path-dialog .path-container {
  padding: 20px 0;
}

.template-path-dialog .path-form {
  margin-bottom: 30px;
}

.template-path-dialog .path-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.template-path-dialog .path-input {
  flex: 1;
}

.template-path-dialog .path-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  color: #409eff;
  font-size: 12px;
}

.template-path-dialog .filename-preview {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  word-break: break-all;
}

.template-path-dialog .path-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>