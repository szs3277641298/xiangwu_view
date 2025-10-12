<template>
  <div class="project-staff-detail-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <div class="project-info">
          <h2>{{ projectName }}</h2>
          <p>项目人员管理</p>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAddStaff">
          <el-icon><Plus /></el-icon>
          添加人员
        </el-button>
      </div>
    </div>

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
              v-model="searchForm.name"
              placeholder="请输入姓名"
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

      <!-- 高级搜索 -->
      <el-collapse-transition>
        <div v-show="searchExpanded" class="advanced-search">
          <el-form :model="searchForm" class="advanced-search-form">
            <div class="form-row">
              <el-form-item label="职务">
                <el-input v-model="searchForm.position" placeholder="请输入职务" clearable />
              </el-form-item>
              <el-form-item label="工作状态">
                <el-select v-model="searchForm.workStatusId" placeholder="请选择工作状态" clearable>
                  <el-option 
                    v-for="option in workStatusOptions" 
                    :key="option.id" 
                    :label="option.name" 
                    :value="option.id" 
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="form-row">
              <el-form-item label="年龄范围">
                <el-input
                  v-model.number="searchForm.minAge"
                  placeholder="最小年龄"
                  type="number"
                  class="form-input"
                />
                <span class="range-separator">-</span>
                <el-input
                  v-model.number="searchForm.maxAge"
                  placeholder="最大年龄"
                  type="number"
                  class="form-input"
                />
              </el-form-item>
              <el-form-item label="性别">
                <el-select v-model="searchForm.genderId" placeholder="请选择性别" clearable>
                  <el-option 
                    v-for="option in genderOptions" 
                    :key="option.id" 
                    :label="option.name" 
                    :value="option.id" 
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="form-row">
              <el-form-item label="薪资范围">
                <el-input
                  v-model.number="searchForm.minMonthlySalary"
                  placeholder="最低薪资"
                  type="number"
                  class="form-input"
                >
                  <template #prefix>¥</template>
                </el-input>
                <span class="range-separator">-</span>
                <el-input
                  v-model.number="searchForm.maxMonthlySalary"
                  placeholder="最高薪资"
                  type="number"
                  class="form-input"
                >
                  <template #prefix>¥</template>
                </el-input>
              </el-form-item>
            </div>
          </el-form>
        </div>
      </el-collapse-transition>
    </el-card>

    <!-- 人员列表 -->
    <el-card class="staff-list-card" shadow="never">
      <el-table 
        v-loading="loading" 
        :data="staffData" 
        style="width: 100%"
        empty-text="暂无人员数据"
      >
        <el-table-column prop="name" label="姓名" width="120" fixed="left">
          <template #default="{ row }">
            <div class="staff-name">
              <div class="villager-photo" @click.stop="handleImagePreview(row)">
                <img 
                  v-if="row.photoUrl" 
                  :src="row.photoUrl" 
                  :alt="row.name"
                  class="photo-image"
                />
                <el-icon v-else class="photo-placeholder">
                  <User />
                </el-icon>
                <div class="photo-overlay">
                  <el-icon class="preview-icon">
                    <ZoomIn />
                  </el-icon>
                </div>
              </div>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="age" label="年龄" width="70">
          <template #default="{ row }">
            {{ row.age || '-' }}岁
          </template>
        </el-table-column>
        
        <el-table-column prop="gender" label="性别" width="70">
          <template #default="{ row }">
            {{ row.genderLabel }}
          </template>
        </el-table-column>
        
        <el-table-column prop="idCard" label="身份证号" width="160">
          <template #default="{ row }">
            <span class="id-card-text">{{ row.idCard || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="educationLevel" label="学历" width="80">
          <template #default="{ row }">
            {{ row.educationLevelLabel }}
          </template>
        </el-table-column>
        
        <el-table-column prop="phone" label="联系电话" width="120">
          <template #default="{ row }">
            {{ row.phone || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="position" label="职务" width="100" />
        
        <el-table-column prop="responsibility" label="工作内容" min-width="200">
          <template #default="{ row }">
            <div class="responsibility-text">
              {{ row.responsibility || '暂无' }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="workStatus" label="工作状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getWorkStatusType(row.workStatusId)" size="small">
              {{ row.workStatusName }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="MonthlySalary" label="月薪资" width="100">
          <template #default="{ row }">
            <span v-if="row.MonthlySalary && row.MonthlySalary > 0">¥{{ Number(row.MonthlySalary).toLocaleString() }}</span>
            <span v-else class="text-muted">未设置</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="joinDate" label="加入时间" width="110">
          <template #default="{ row }">
            {{ formatDate(row.joinDate) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="performanceEvaluation" label="绩效评价" width="100">
          <template #default="{ row }">
            <span v-if="row.performanceEvaluation">{{ row.performanceEvaluation }}</span>
            <span v-else class="text-muted">未评价</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEditStaff(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDeleteStaff(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
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
    </el-card>

    <!-- 添加/编辑人员对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑人员' : '添加人员'" 
      width="600px"
      :center="true"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <!-- 村民选择 -->
        <el-form-item label="关联村民" prop="residentId">
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
                  {{ getGenderLabel(selectedVillager.gender) }} · {{ selectedVillager.age || 0 }}岁 · {{ selectedVillager.phone || '' }}
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
              <div v-if="villagerSearchLoading" class="loading-text">
                <el-icon class="is-loading"><Loading /></el-icon>
                搜索中...
              </div>
              <div v-else-if="villagerSearchResults.length === 0" class="no-results">
                未找到相关村民
              </div>
              <div v-else class="search-list">
                <div 
                  v-for="villager in villagerSearchResults" 
                  :key="villager.id || villager.name"
                  class="search-item"
                  @click="selectVillager(villager)"
                >
                  <div class="item-info">
                    <span class="item-name">{{ villager.name || '' }}</span>
                    <span class="item-details">
                      {{ getGenderLabel(villager.gender) }} · {{ villager.age || 0 }}岁 · {{ villager.phone || '' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="职务" prop="position">
          <el-input v-model="formData.position" placeholder="请输入职务" />
        </el-form-item>
        
        <el-form-item label="工作内容" prop="responsibility">
          <el-input 
            v-model="formData.responsibility" 
            type="textarea" 
            :rows="3"
            placeholder="请输入工作内容" 
          />
        </el-form-item>
        
        <el-form-item label="工作状态" prop="workStatusId">
          <el-select v-model="formData.workStatusId" placeholder="请选择工作状态">
            <el-option 
              v-for="option in workStatusOptions" 
              :key="option.id" 
              :label="option.name" 
              :value="option.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="月薪资" prop="MonthlySalary">
          <el-input 
            v-model.number="formData.MonthlySalary" 
            placeholder="请输入月薪资"
            type="number"
          >
            <template #prefix>¥</template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="加入时间" prop="joinDate">
          <el-date-picker
            v-model="formData.joinDate"
            type="date"
            placeholder="选择加入时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item v-if="isEdit" label="离职时间" prop="leaveDate">
          <el-date-picker
            v-model="formData.leaveDate"
            type="date"
            placeholder="选择离职时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="绩效评价" prop="performanceEvaluation">
          <el-input 
            v-model="formData.performanceEvaluation" 
            type="textarea" 
            :rows="2"
            placeholder="请输入绩效评价" 
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEdit ? '更新' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="图片预览"
      width="600px"
      :before-close="handlePreviewClose"
      class="preview-dialog"
      center
    >
      <div class="preview-container">
        <div class="preview-image-wrapper">
          <img 
            v-if="previewImageUrl" 
            :src="previewImageUrl" 
            :alt="previewMember?.name"
            class="preview-image"
          />
          <div v-else class="preview-placeholder">
            <el-icon class="preview-placeholder-icon">
              <User />
            </el-icon>
            <p>暂无图片</p>
          </div>
        </div>
        <div class="preview-info">
          <h4>{{ previewMember?.name }}</h4>
          <p>身份证号：{{ previewMember?.idCard }}</p>
          <p>职务：{{ previewMember?.position }}</p>
          <div class="preview-actions">
            <el-button size="small" @click="previewDialogVisible = false">关闭</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Plus, Search, ArrowDown, ArrowUp, Refresh, Loading, Picture, User, ZoomIn } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { economyStaffAPI, residentAPI, dictAPI } from '../../api/api.js'
import api from '../../api/api.js'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchExpanded = ref(false)
const staffData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 图片缓存
const imageCache = new Map()

// 获取图片完整URL（带token认证）
const getPhotoUrl = async (photoPath) => {
  if (!photoPath || typeof photoPath !== 'string') {
    return null
  }

  // 如果已经是完整URL，直接返回
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath
  }

  // 检查缓存
  if (imageCache.has(photoPath)) {
    return imageCache.get(photoPath)
  }

  try {
    // 将反斜杠转换为正斜杠，确保路径格式正确
    const normalizedPath = photoPath.replace(/\\/g, '/')
    
    // 使用axios请求图片，会自动带上Authorization header
    // 直接使用API路径请求图片（与村内人员页面保持一致）
    const response = await api.get(normalizedPath, {
      responseType: 'blob'
    })
    
    // 由于响应拦截器返回了response.data，所以response就是blob数据
    const blob = new Blob([response])
    const blobUrl = URL.createObjectURL(blob)
    
    // 缓存blob URL
    imageCache.set(photoPath, blobUrl)
    
    return blobUrl
  } catch (error) {
    console.error('加载图片失败:', error)
    return null
  }
}

// 项目信息
const projectId = computed(() => route.params.projectId)
const projectName = computed(() => route.query.projectName || '未知项目')

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  position: '',
  workStatusId: null,
  minAge: null,
  maxAge: null,
  genderId: null,
  minMonthlySalary: null,
  maxMonthlySalary: null
})

// 表单数据
const formData = reactive({
  id: null,
  projectId: projectId.value,
  residentId: null,
  position: '',
  responsibility: '',
  joinDate: '',
  leaveDate: '',
  workStatusId: null,
  MonthlySalary: null,
  performanceEvaluation: ''
})

// 村民搜索相关
const villagerSearchVisible = ref(false)
const villagerSearchQuery = ref('')
const villagerSearchResults = ref([])
const villagerSearchLoading = ref(false)
const selectedVillager = ref(null)

// 图片预览相关
const previewDialogVisible = ref(false)
const previewImageUrl = ref('')
const previewMember = ref(null)

// 字典类型和字典数据
const dictTypeList = ref([])
const dictDataMap = ref(new Map())

// 表单字段与字典类型的映射
const fieldToDictTypeMap = {
  'workStatusId': 'work_status',  // 工作状态
  'genderId': 'gender'             // 性别
}

// 枚举选项数据 - 从字典动态获取
const workStatusOptions = ref([])
const genderOptions = ref([])

// 表单验证规则
const formRules = {
  residentId: [
    { required: true, message: '请选择关联村民', trigger: 'change' }
  ],
  position: [
    { required: true, message: '请输入职务', trigger: 'blur' }
  ],
  workStatusId: [
    { required: true, message: '请选择工作状态', trigger: 'change' }
  ],
  joinDate: [
    { required: true, message: '请选择加入时间', trigger: 'change' }
  ]
}

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
    console.log('=== 项目人员详情页面开始加载字典数据 ===')
    
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
          case 'workStatusId':
            workStatusOptions.value = options
            console.log(`工作状态选项已更新:`, options)
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
    
    console.log('=== 项目人员详情页面所有字典数据加载完成 ===')
    console.log('最终选项数据:')
    console.log('- 工作状态:', workStatusOptions.value.length, '个选项')
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
  if (workStatusOptions.value.length === 0) {
    workStatusOptions.value = [
      { id: 24, name: '在职' },
      { id: 25, name: '休假' },
      { id: 26, name: '离职' },
      { id: 27, name: '调岗' }
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
const goBack = () => {
  router.go(-1)
}

const toggleSearchExpanded = () => {
  searchExpanded.value = !searchExpanded.value
}

const handleSearch = async () => {
  currentPage.value = 1
  await loadStaffData()
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (typeof searchForm[key] === 'number') {
      searchForm[key] = null
    } else {
      searchForm[key] = ''
    }
  })
  handleSearch()
}

const loadStaffData = async () => {
  loading.value = true
  try {
    const queryData = {
      projectId: projectId.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...cleanSearchForm(searchForm)
    }
    
    const response = await economyStaffAPI.getEconomyStaffList(queryData)
    if (response.code === 200) {
      const data = response.data.list || []
      
      // 先清空photoUrl，避免显示原始路径
      data.forEach(member => {
        if (member.photoUrl) {
          member.originalPhotoUrl = member.photoUrl // 保存原始路径
          member.photoUrl = null // 清空，避免直接显示原始路径
        }
      })
      
      staffData.value = data
      total.value = response.data.total || 0
      
      // 异步加载图片URL
      data.forEach(async (member, index) => {
        if (member.originalPhotoUrl) {
          try {
            const photoUrl = await getPhotoUrl(member.originalPhotoUrl)
            // 使用Vue的响应式更新，直接更新数组中的对象
            if (staffData.value[index]) {
              staffData.value[index].photoUrl = photoUrl
            }
          } catch (error) {
            console.error(`加载人员 ${member.name} 的图片失败:`, error)
            if (staffData.value[index]) {
              staffData.value[index].photoUrl = null
            }
          }
        } else {
          if (staffData.value[index]) {
            staffData.value[index].photoUrl = null
          }
        }
      })
    } else {
      ElMessage.error(response.message || '获取人员列表失败')
    }
  } catch (error) {
    console.error('加载人员数据失败:', error)
    ElMessage.error('加载人员数据失败')
  } finally {
    loading.value = false
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

// 村民搜索相关方法
const searchVillagers = async (query) => {
  if (!query || query.trim().length < 1) {
    villagerSearchResults.value = []
    return
  }
  
  villagerSearchLoading.value = true
  try {
    const response = await residentAPI.getResidentList({
      name: query.trim(),
      pageNum: 1,
      pageSize: 10
    })
    
    if (response && response.code === 200 && response.data) {
      const villagers = response.data.list || []
      
      // 加载村民照片
      await Promise.all(villagers.map(async (villager, index) => {
        if (villager.photoUrl) {
          try {
            const photoUrl = await getPhotoUrl(villager.photoUrl)
            villagers[index].photoUrl = photoUrl
          } catch (error) {
            console.error(`加载村民 ${villager.name} 的图片失败:`, error)
            villagers[index].photoUrl = null
          }
        } else {
          villagers[index].photoUrl = null
        }
      }))
      
      villagerSearchResults.value = villagers
    } else {
      villagerSearchResults.value = []
    }
  } catch (error) {
    console.error('搜索村民失败:', error)
    villagerSearchResults.value = []
  } finally {
    villagerSearchLoading.value = false
  }
}

const handleVillagerSearch = (query) => {
  villagerSearchQuery.value = query
  
  if (query && query.trim().length >= 1) {
    villagerSearchVisible.value = true
    searchVillagers(query)
  } else {
    villagerSearchVisible.value = false
    villagerSearchResults.value = []
  }
}

const selectVillager = (villager) => {
  if (villager && villager.id) {
    selectedVillager.value = villager
    formData.residentId = villager.id
    formData.name = villager.name // 同时设置姓名用于显示
    villagerSearchVisible.value = false
    villagerSearchQuery.value = ''
    villagerSearchResults.value = []
  }
}

const clearVillagerSelection = () => {
  selectedVillager.value = null
  formData.residentId = null
  formData.name = ''
}

// 获取性别标签
const getGenderLabel = (gender) => {
  const genderMap = {
    'MALE': '男',
    'FEMALE': '女'
  }
  return genderMap[gender] || '未知'
}

// 获取学历标签
const getEducationLabel = (education) => {
  const educationMap = {
    'ILLITERATE': '文盲',
    'PRIMARY': '小学',
    'JUNIOR': '初中',
    'SENIOR': '高中',
    'SECONDARY': '中专',
    'COLLEGE': '大专',
    'BACHELOR': '本科',
    'MASTER': '研究生及以上'
  }
  return educationMap[education] || education || '未知'
}


// 图片预览相关方法
const handleImagePreview = (member) => {
  previewMember.value = member
  previewImageUrl.value = member.photoUrl || ''
  previewDialogVisible.value = true
}

const handlePreviewClose = () => {
  previewDialogVisible.value = false
  previewMember.value = null
  previewImageUrl.value = ''
}

const handleAddStaff = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEditStaff = async (row) => {
  isEdit.value = true
  
  // 处理日期格式
  let formattedJoinDate = ''
  if (row.joinDate) {
    const dateObj = typeof row.joinDate === 'number' ? new Date(row.joinDate) : new Date(row.joinDate)
    formattedJoinDate = dateObj.toISOString().split('T')[0] // 转换为 YYYY-MM-DD 格式
  }
  
  // 处理离职日期格式
  let formattedLeaveDate = ''
  if (row.leaveDate) {
    const dateObj = typeof row.leaveDate === 'number' ? new Date(row.leaveDate) : new Date(row.leaveDate)
    formattedLeaveDate = dateObj.toISOString().split('T')[0] // 转换为 YYYY-MM-DD 格式
  }
  
  Object.assign(formData, {
    id: row.id,
    projectId: projectId.value,
    residentId: row.residentId,
    position: row.position,
    responsibility: row.responsibility,
    joinDate: formattedJoinDate,
    leaveDate: formattedLeaveDate,
    workStatusId: row.workStatusId,
    MonthlySalary: row.MonthlySalary,
    performanceEvaluation: row.performanceEvaluation
  })
  
  // 获取村民信息并预填充
  if (row.residentId) {
    try {
      const response = await residentAPI.getResidentInfo(row.residentId)
      if (response && response.code === 200 && response.data) {
        const villagerData = response.data
        
        // 加载村民照片
        if (villagerData.photoUrl) {
          try {
            const photoUrl = await getPhotoUrl(villagerData.photoUrl)
            villagerData.photoUrl = photoUrl
          } catch (error) {
            console.error('获取图片失败:', error)
            villagerData.photoUrl = null
          }
        }
        
        selectedVillager.value = villagerData
        villagerSearchQuery.value = villagerData.name
      }
    } catch (error) {
      console.error('获取村民信息失败:', error)
    }
  }
  
  dialogVisible.value = true
}

const handleDeleteStaff = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${row.name} 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await economyStaffAPI.deleteStaff(row.projectId, row.residentId)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      await loadStaffData()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    // 过滤数据，只发送后端需要的字段
    const submitData = {
      projectId: Number(formData.projectId),
      residentId: Number(formData.residentId),
      position: formData.position,
      responsibility: formData.responsibility,
      joinDate: formData.joinDate,
      workStatusId: formData.workStatusId,
      monthlySalary: formData.MonthlySalary ? Number(formData.MonthlySalary) : null,
      performanceEvaluation: formData.performanceEvaluation
    }
    
    // 编辑时才包含离职时间
    if (isEdit.value) {
      submitData.leaveDate = formData.leaveDate
    }
    
    // 编辑时需要包含id
    if (isEdit.value) {
      submitData.id = formData.id
    }
    
    if (isEdit.value) {
      const response = await economyStaffAPI.updateStaffInfo(submitData)
      if (response.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        await loadStaffData()
      } else {
        ElMessage.error(response.message || '更新失败')
      }
    } else {
      const response = await economyStaffAPI.addStaffToEconomy(submitData)
      if (response.code === 200) {
        ElMessage.success('添加成功')
        dialogVisible.value = false
        await loadStaffData()
      } else {
        ElMessage.error(response.message || '添加失败')
      }
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    projectId: projectId.value,
    residentId: null,
    position: '',
    responsibility: '',
    joinDate: '',
    leaveDate: '',
    workStatusId: null,
    MonthlySalary: null,
    performanceEvaluation: ''
  })
  
  // 清空村民选择
  selectedVillager.value = null
  villagerSearchQuery.value = ''
  villagerSearchResults.value = []
  villagerSearchVisible.value = false
  
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadStaffData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadStaffData()
}

// 工作状态标签
const getWorkStatusLabel = (status) => {
  const statusMap = {
    'ACTIVE': '在职',
    'LEAVE': '休假',
    'RESIGNED': '离职',
    'TRANSFERRED': '调岗'
  }
  return statusMap[status] || '未知'
}

// 工作状态类型
const getWorkStatusType = (statusId) => {
  const typeMap = {
    24: 'success',  // 在职
    25: 'warning',  // 休假
    26: 'danger',   // 离职
    27: 'info'      // 调岗
  }
  return typeMap[statusId] || 'default'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  // 处理时间戳格式
  const dateObj = typeof date === 'number' ? new Date(date) : new Date(date)
  return dateObj.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 组件挂载时加载数据
onMounted(async () => {
  // 先加载字典数据
  await loadAllDictData()
  // 再加载人员数据
  await loadStaffData()
})
</script>

<style scoped>
.project-staff-detail-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.project-info h2 {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.project-info p {
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
  max-width: 300px;
}

.search-btn, .reset-btn {
  min-width: 80px;
}

.advanced-search {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.advanced-search-form {
  margin: 0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-input {
  width: 100%;
}

.range-separator {
  display: flex;
  align-items: center;
  padding: 0 8px;
  color: #909399;
}

.staff-list-card {
  margin-bottom: 20px;
}

.staff-name {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}

.villager-photo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden !important;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

.villager-photo:hover {
  transform: scale(1.05);
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  font-size: 20px;
  color: #c0c4cc;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.villager-photo:hover .photo-overlay {
  opacity: 1;
}

.preview-icon {
  color: white;
  font-size: 16px;
}

.id-card-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #606266;
}

.responsibility-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-muted {
  color: #c0c4cc;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

.loading-text, .no-results {
  padding: 12px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

/* 搜索列表样式由外层容器控制滚动 */

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
  margin-bottom: 4px;
}

.item-details {
  font-size: 12px;
  color: #606266;
}

/* 图片预览对话框样式 */
.preview-dialog .el-dialog__body {
  padding: 30px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.preview-image-wrapper {
  width: 300px;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  height: 100%;
}

.preview-placeholder-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.preview-info {
  text-align: center;
}

.preview-info h4 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #303133;
}

.preview-info p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.preview-actions {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
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
