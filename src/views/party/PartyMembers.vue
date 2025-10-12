<template>
  <div class="party-members-container">
    <!-- 筛选条件区域 -->
    <el-card class="filter-card" shadow="never">
      <!-- 搜索头部 -->
      <div class="search-header">
        <div class="search-title">
          <el-icon><Search /></el-icon>
          <span>搜索筛选</span>
        </div>
        <div class="header-actions">
          <el-button 
            type="text" 
            @click="toggleDisplayMode"
            class="display-toggle-btn"
            :class="{ 'active': showFullInfo }"
          >
            <el-icon><InfoFilled /></el-icon>
            {{ showFullInfo ? '简化显示' : '完整显示' }}
          </el-button>
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
      </div>
      
      <!-- 快速搜索区域（始终显示） -->
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
      
      <!-- 详细搜索区域（可折叠） -->
      <el-collapse-transition>
        <div v-show="searchExpanded" class="detailed-search">
          <el-form :model="searchForm" class="filter-form">
            <!-- 基本信息 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><User /></el-icon>
                <span>基本信息</span>
              </div>
              <div class="form-grid">
                <el-form-item label="姓名">
                  <el-input
                    v-model="searchForm.name"
                    placeholder="请输入姓名"
                    clearable
                    class="form-input"
                  />
                </el-form-item>
                <el-form-item label="性别">
                  <el-select v-model="searchForm.genderId" placeholder="请选择" clearable style="width: 100px">
                    <el-option 
                      v-for="option in genderOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="年龄范围">
                  <el-input
                    v-model.number="searchForm.minAge"
                    placeholder="最小年龄"
                    type="number"
                    style="width: 100px"
                  />
                  <span style="margin: 0 8px">-</span>
                  <el-input
                    v-model.number="searchForm.maxAge"
                    placeholder="最大年龄"
                    type="number"
                    style="width: 100px"
                  />
                </el-form-item>
              </div>
            </div>
            
            <!-- 党员信息 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Star /></el-icon>
                <span>党员信息</span>
              </div>
              <div class="form-grid">
                <el-form-item label="党内职务">
                  <el-select v-model="searchForm.partyDutyId" placeholder="请选择" clearable style="width: 150px">
                    <el-option 
                      v-for="option in partyDutyOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="所在党支部">
                  <el-input
                    v-model="searchForm.branch"
                    placeholder="请输入党支部"
                    clearable
                    class="form-input"
                  />
                </el-form-item>
                <el-form-item label="党龄范围">
                  <el-input
                    v-model.number="searchForm.minPartyAge"
                    placeholder="最小党龄"
                    type="number"
                    style="width: 100px"
                  />
                  <span style="margin: 0 8px">-</span>
                  <el-input
                    v-model.number="searchForm.maxPartyAge"
                    placeholder="最大党龄"
                    type="number"
                    style="width: 100px"
                  />
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
        <el-button type="primary" v-if="isAdmin" @click="handleAddPartyMember">
          <el-icon><Plus /></el-icon>
          新增党员
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
      <div class="toolbar-right">
        <span class="total-info">共 {{ total }} 条记录</span>
      </div>
    </div>
    
    <!-- 党员卡片列表 -->
    <div class="party-members-list" v-loading="loading">
      <div class="member-card" v-for="member in partyMembersData" :key="member.id" @click="handleViewDetail(member)">
        <!-- 党员照片 -->
        <div class="photo-section">
          <div class="member-photo" @click.stop="handleImagePreview(member)">
            <img 
              v-if="member.photoUrl" 
              :src="member.photoUrl" 
              :alt="member.name"
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
        </div>
        
        <!-- 党员信息 -->
        <div class="info-section">
          <!-- 基本信息行 -->
          <div class="info-row primary">
            <div class="name-group">
              <h3 class="member-name">{{ member.name }}</h3>
              <div class="basic-info">
                <span class="gender-age">{{ member.genderLabel }} · {{ member.age }}岁</span>
                <el-tag 
                  :type="getPartyDutyTagType(member.partyDutyId)" 
                  size="small"
                  class="duty-tag"
                >
                  {{ member.partyDutyName || '普通党员' }}
                </el-tag>
              </div>
            </div>
            <div class="contact-info">
              <div class="id-card">{{ member.idCard }}</div>
            </div>
          </div>
          
          <!-- 党内信息行 -->
          <div class="info-row secondary">
            <div class="party-info">
              <el-icon class="info-icon"><Star /></el-icon>
              <span class="party-details">党龄 {{ getPartyAgeText(member.partyAge) }} · {{ member.branch || '未设置党支部' }}</span>
            </div>
            <div class="join-info">
              <span class="join-date">入党：{{ formatDate(member.joinTime) }}</span>
            </div>
          </div>
          
          <!-- 状态标签行 -->
          <div class="info-row status-row">
            <div class="status-tags">
              <el-tag type="success" size="small">党员</el-tag>
              <el-tag v-if="member.educationLevelLabel" type="info" size="small">
                {{ member.educationLevelLabel }}
              </el-tag>
              <el-tag v-if="member.occupation" type="primary" size="small">
                {{ member.occupation }}
              </el-tag>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-section" @click.stop>
          <el-button link type="success" v-if="isAdmin" @click="handleEdit(member)" class="action-btn">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button link type="danger" v-if="isAdmin" @click="handleDelete(member)" class="action-btn">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="partyMembersData.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无党员数据" />
      </div>
    </div>
    
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
    
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑党员' : '新增党员'" width="600px" class="form-dialog" :center="true">
      <div class="dialog-scroll-container">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
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
                    {{ selectedVillager.genderLabel || '未知' }} · {{ selectedVillager.age || 0 }}岁 · {{ selectedVillager.phone || '' }}
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
                        {{ villager.genderLabel || '未知' }} · {{ villager.age || 0 }}岁 · {{ villager.phone || '' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>
          
          <!-- 党内职务 -->
          <el-form-item label="党内职务" prop="partyDutyId">
            <el-select v-model="formData.partyDutyId" placeholder="请选择党内职务" style="width: 100%">
              <el-option 
                v-for="option in partyDutyOptions" 
                :key="option.id" 
                :label="option.name" 
                :value="option.id" 
              />
            </el-select>
          </el-form-item>
          
          <!-- 所在党支部 -->
          <el-form-item label="所在党支部" prop="branch">
            <el-input v-model="formData.branch" placeholder="请输入所在党支部" />
          </el-form-item>
          
          <!-- 入党时间 -->
          <el-form-item label="入党时间" prop="joinTime">
            <el-date-picker
              v-model="formData.joinTime" 
              type="date" 
              placeholder="请选择入党时间" 
              style="width: 100%"
            />
          </el-form-item>
          
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 查看详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="党员详情" width="800px">
      <div v-if="selectedMember" class="member-detail">
        <div class="detail-row">
          <div class="detail-item">
            <span class="detail-label">姓名：</span>
            <span class="detail-value">{{ selectedMember.name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">性别：</span>
            <span class="detail-value">{{ selectedMember.genderLabel || '未知' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">年龄：</span>
            <span class="detail-value">{{ selectedMember.age }}岁</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">党内职务：</span>
            <span class="detail-value">{{ selectedMember.partyDutyName || '普通党员' }}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item">
            <span class="detail-label">所在党支部：</span>
            <span class="detail-value">{{ selectedMember.branch || '未设置' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">党龄：</span>
            <span class="detail-value">{{ getPartyAgeText(selectedMember.partyAge) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">入党时间：</span>
            <span class="detail-value">{{ formatDate(selectedMember.joinTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">联系电话：</span>
            <span class="detail-value">{{ selectedMember.phone }}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item full-width">
            <span class="detail-label">地址：</span>
            <span class="detail-value">{{ selectedMember.address }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入党员信息" width="500px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :on-change="handleImportFileChange"
        :before-upload="beforeUpload"
        accept=".xlsx,.xls"
        drag
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 xlsx/xls 文件，且不超过 10MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImport" :loading="importLoading">确定导入</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导出对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出党员数据"
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
            <p>将导出当前筛选条件下的所有党员数据</p>
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
            </el-form-item>
            <el-form-item label="工作表名" required>
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


    <!-- 生成模板对话框 -->
    <el-dialog
      v-model="generateTemplateDialogVisible"
      title="选择模板文件保存路径"
      width="500px"
      :before-close="handleGenerateTemplateClose"
      class="path-dialog"
      center
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div class="path-container">
        <div class="path-form">
          <el-form :model="generateTemplateForm" label-width="120px">
            <el-form-item label="保存路径" required>
              <div class="path-input-group">
                <el-input
                  v-model="generateTemplateForm.directory"
                  placeholder="请选择保存目录"
                  class="path-input"
                  readonly
                  @click="handleSelectGenerateTemplateDirectory"
                />
                <el-button @click="handleSelectGenerateTemplateDirectory" type="primary">
                  <el-icon><FolderOpened /></el-icon>
                  浏览文件夹
                </el-button>
              </div>
              <div class="path-tips">
                <el-icon><InfoFilled /></el-icon>
                <span>由于浏览器安全限制，无法直接获取完整路径，请手动输入保存目录的完整路径</span>
              </div>
            </el-form-item>
          </el-form>
        </div>
        <div class="path-actions">
          <el-button @click="handleGenerateTemplateClose">取消</el-button>
          <el-button type="primary" @click="handleConfirmGenerateTemplate" :loading="exportLoading">
            <el-icon><Document /></el-icon>
            确认生成
          </el-button>
        </div>
      </div>
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
          <p>职务：{{ previewMember?.partyDutyName || '普通党员' }}</p>
          <div class="preview-actions">
            <el-button size="small" @click="previewDialogVisible = false">关闭</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { 
  Search, Plus, Download, User, Clock, Location, 
  InfoFilled, ArrowDown, ArrowUp, Refresh, Upload, 
  Document, Edit, Delete, ZoomIn, Star, Loading,
  FolderOpened, UploadFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../store/index.js'
import { partyMemberAPI, residentAPI, dictAPI } from '../../api/api.js'
import api from '../../api/api.js'

// 用户状态
const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)

// 搜索和显示状态
const searchExpanded = ref(false)
const showFullInfo = ref(true)


// 字典类型和字典数据
const dictTypeList = ref([])
const dictDataMap = ref(new Map())

// 表单字段与字典类型的映射
const fieldToDictTypeMap = {
  'genderId': 'gender',           // 性别
  'partyDutyId': 'party_duty'     // 党内职务
}

// 枚举选项数据 - 从字典动态获取
const genderOptions = ref([])
const partyDutyOptions = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  genderId: null,
  minAge: null,
  maxAge: null,
  partyDutyId: null,
  branch: '',
  minPartyAge: null,
  maxPartyAge: null
})

// 表格数据相关
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const partyMembersData = ref([])

// 表单相关
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const selectedMember = ref(null)

// 图片预览相关
const previewDialogVisible = ref(false)
const previewImageUrl = ref('')
const previewMember = ref(null)
const formData = reactive({
  residentId: null,
  partyDutyId: null,
  branch: '',
  joinTime: ''
})

// 村民选择相关
const villagerSearchVisible = ref(false)
const villagerSearchQuery = ref('')
const villagerSearchResults = ref([])
const villagerSearchLoading = ref(false)
const selectedVillager = ref(null)

// 导入导出相关
const importDialogVisible = ref(false)
const importLoading = ref(false)
const selectedFile = ref(null)
const uploadRef = ref(null)

// 导出相关
const exportDialogVisible = ref(false)
const exportLoading = ref(false)

// 路径选择相关
const pathDialogVisible = ref(false)
const generateTemplateDialogVisible = ref(false)

const pathForm = reactive({
  directory: '',
  filename: '',
  sheetName: '党员数据'
})


const generateTemplateForm = reactive({
  directory: ''
})

// 表单验证规则
const formRules = {
  residentId: [
    { required: true, message: '请选择村民', trigger: 'change' }
  ],
  partyDutyId: [
    { required: true, message: '请选择党内职务', trigger: 'change' }
  ],
  branch: [
    { required: true, message: '请输入所在党支部', trigger: 'blur' }
  ],
  joinTime: [
    { required: true, message: '请选择入党时间', trigger: 'change' }
  ]
}

// 工具方法
const getGenderLabel = (gender) => {
  if (!gender) return '未知'
  // 如果传入的是对象，直接返回name字段
  if (typeof gender === 'object' && gender.name) {
    return gender.name
  }
  // 兼容旧的字符串格式
  return gender === 'MALE' ? '男' : '女'
}

const getPartyDutyLabel = (duty) => {
  if (!duty) return '未知'
  // 如果传入的是对象，直接返回name字段
  if (typeof duty === 'object' && duty.name) {
    return duty.name
  }
  // 兼容旧的字符串格式
  const dutyMap = {
    'SECRETARY': '党组织书记',
    'COMMITTEE_MEMBER': '党组织委员',
    'YOUTH_LEAGUE_MEMBER': '共青团员',
    'REGULAR_PARTY_MEMBER': '普通党员',
    'PROBATIONARY_MEMBER': '预备党员',
    'ACTIVIST': '入党积极分子'
  }
  return dutyMap[duty] || '未知'
}

const getPartyDutyTagType = (dutyId) => {
  if (!dutyId) return 'default'
  const typeMap = {
    5: 'danger',   // 党支部书记 - 红色（最高级别）
    6: 'primary',  // 党支部副书记 - 蓝色（重要职务）
    7: 'warning',  // 党支部委员 - 橙色（重要职务）
    8: 'info',     // 党小组长 - 灰色（小组领导）
    9: 'success',  // 普通党员 - 绿色（正式党员）
    10: 'warning' // 预备党员 - 橙色（预备期）
  }
  return typeMap[dutyId] || 'default'
}

const getEducationLabel = (education) => {
  if (!education) return '未知'
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
  return educationMap[education] || education
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}


// 获取党龄显示文本
const getPartyAgeText = (partyAge) => {
  if (partyAge === 0) {
    return '小于一年'
  } else if (partyAge === 1) {
    return '小于两年'
  } else {
    return `${partyAge}年`
  }
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
    
    console.log('村民搜索响应:', response)
    
    if (response && response.code === 200 && response.data) {
      const villagers = response.data.list || []
      
      // 加载村民照片
      await Promise.all(villagers.map(async (villager, index) => {
        if (villager.photo) {
          try {
            const photoUrl = await getPhotoUrl(villager.photo)
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
      console.log('搜索结果:', villagerSearchResults.value)
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
  console.log('搜索查询:', query)
  console.log('搜索可见性:', villagerSearchVisible.value)
  
  if (query && query.trim().length >= 1) {
    villagerSearchVisible.value = true
    console.log('开始搜索，设置可见性为true')
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
    villagerSearchVisible.value = false
    villagerSearchQuery.value = ''
    villagerSearchResults.value = []
  }
}

const clearVillagerSelection = () => {
  selectedVillager.value = null
  formData.residentId = null
}

// 切换显示模式
const toggleDisplayMode = () => {
  showFullInfo.value = !showFullInfo.value
}

// 切换搜索展开状态
const toggleSearchExpanded = () => {
  searchExpanded.value = !searchExpanded.value
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    // 字符串字段设为空字符串，数字字段设为null
    if (key === 'name' || key === 'branch') {
      searchForm[key] = ''
    } else {
      searchForm[key] = null
    }
  })
  currentPage.value = 1
  loadData()
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 只发送有值的搜索条件
    const request = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    
    if (searchForm.name && searchForm.name.trim()) {
      request.name = searchForm.name.trim()
    }
    if (searchForm.genderId) {
      request.genderId = searchForm.genderId
    }
    if (searchForm.minAge) {
      request.minAge = searchForm.minAge
    }
    if (searchForm.maxAge) {
      request.maxAge = searchForm.maxAge
    }
    if (searchForm.partyDutyId) {
      request.partyDutyId = searchForm.partyDutyId
    }
    if (searchForm.branch && searchForm.branch.trim()) {
      request.branch = searchForm.branch.trim()
    }
    if (searchForm.minPartyAge) {
      request.minPartyAge = searchForm.minPartyAge
    }
    if (searchForm.maxPartyAge) {
      request.maxPartyAge = searchForm.maxPartyAge
    }
    
    console.log('搜索请求参数:', request)
    
    const response = await partyMemberAPI.getPartyMemberList(request)
    
    if (response && response.code === 200 && response.data) {
      const members = response.data.list || response.data.records || []
      
      // 先设置数据，让界面先显示
      partyMembersData.value = members
      total.value = response.data.total || 0
      
      // 异步加载图片URL（使用优化的缓存机制）
      // 使用 Promise.allSettled 来避免 forEach 的异步问题
      const imagePromises = members.map(async (member, index) => {
        // 如果后端返回了photoUrl，需要通过getPhotoUrl函数处理
        if (member.photoUrl) {
          try {
            const photoUrl = await getPhotoUrl(member.photoUrl)
            // 使用Vue的响应式更新，直接更新数组中的对象
            partyMembersData.value[index].photoUrl = photoUrl
          } catch (error) {
            console.error(`加载党员 ${member.name} 的图片失败:`, error)
            partyMembersData.value[index].photoUrl = null
          }
        } else if (member.photo) {
          // 如果后端没有返回photoUrl但有photo字段，则通过API获取
          try {
            const photoUrl = await getPhotoUrl(member.photo)
            // 使用Vue的响应式更新，直接更新数组中的对象
            partyMembersData.value[index].photoUrl = photoUrl
          } catch (error) {
            console.error(`加载党员 ${member.name} 的图片失败:`, error)
            partyMembersData.value[index].photoUrl = null
          }
        } else {
          partyMembersData.value[index].photoUrl = null
        }
      })
      
      // 等待所有图片加载完成（不阻塞界面显示）
      Promise.allSettled(imagePromises)
      
      // 启动缓存清理定时器
      startCacheCleanup()
      
      // 预加载下一页的图片（如果存在）
      if (response.data.total > currentPage.value * pageSize.value) {
        // 延迟预加载，避免影响当前页面的显示
        setTimeout(() => {
          preloadImages(members)
        }, 1000)
      }
    } else {
      ElMessage.error(response?.message || '获取党员列表失败')
    }
  } catch (error) {
    console.error('获取党员列表失败:', error)
    ElMessage.error('获取党员列表失败')
  } finally {
    loading.value = false
  }
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

// 新增党员
const handleAddPartyMember = () => {
  isEdit.value = false
  // 重置表单
  formData.residentId = null
  formData.partyDutyId = null
  formData.branch = ''
  formData.joinTime = ''
  selectedVillager.value = null
  dialogVisible.value = true
}

// 编辑党员
const handleEdit = async (row) => {
  isEdit.value = true
  // 填充表单数据
  formData.residentId = row.residentId
  formData.partyDutyId = row.partyDutyId
  formData.branch = row.branch
  formData.joinTime = row.joinTime
  
  // 获取村民信息
  try {
    const response = await residentAPI.getResidentInfo(row.residentId)
    if (response && response.code === 200 && response.data) {
      const villagerData = response.data
      
      // 加载村民照片
      if (villagerData.photo) {
        try {
          const photoUrl = await getPhotoUrl(villagerData.photo)
          villagerData.photoUrl = photoUrl
        } catch (error) {
          console.error('获取图片失败:', error)
          villagerData.photoUrl = null
        }
      }
      
      selectedVillager.value = villagerData
    }
  } catch (error) {
    console.error('获取村民信息失败:', error)
  }
  
  dialogVisible.value = true
}

// 查看党员详情
const handleViewDetail = (row) => {
  selectedMember.value = row
  detailDialogVisible.value = true
}

// 删除党员
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除党员 "${row.name}" 的信息吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await partyMemberAPI.deletePartyMember(row.residentId)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        loadData()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除党员失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 表单验证
    await formRef.value.validate()
    
    // 验证必填字段
    if (!formData.residentId) {
      ElMessage.error('请选择村民')
      return
    }
    if (!formData.joinTime) {
      ElMessage.error('请选择入党时间')
      return
    }
    if (!formData.partyDutyId) {
      ElMessage.error('请选择党内职务')
      return
    }
    if (!formData.branch || formData.branch.trim() === '') {
      ElMessage.error('请输入所在党支部')
      return
    }
    
    // 构建提交数据，根据后端SQL只发送必要字段
    const submitData = {}
    
    if (formData.residentId) {
      submitData.residentId = Number(formData.residentId)
    }
    if (formData.joinTime) {
      // 将日期转换为 yyyy-MM-dd 格式
      const date = new Date(formData.joinTime)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      submitData.joinTime = `${year}-${month}-${day}`
    }
    if (formData.partyDutyId) {
      submitData.partyDutyId = formData.partyDutyId
    }
    if (formData.branch && formData.branch.trim()) {
      submitData.branch = formData.branch.trim()
    }
    
    console.log('提交数据:', submitData)
    console.log('数据类型检查:', {
      residentId: typeof submitData.residentId,
      joinTime: typeof submitData.joinTime,
      partyDuty: typeof submitData.partyDuty,
      branch: typeof submitData.branch
    })
    
    // 测试请求
    console.log('发送请求到:', isEdit.value ? 'updatePartyMember' : 'addPartyMember')
    
    const response = isEdit.value 
      ? await partyMemberAPI.updatePartyMember(submitData)
      : await partyMemberAPI.addPartyMember(submitData)
    
    console.log('响应结果:', response)
    
    if (response && response.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(response?.message || (isEdit.value ? '编辑失败' : '新增失败'))
    }
  } catch (error) {
    console.error('提交失败:', error)
    
    // 详细错误信息
    if (error.response) {
      console.error('错误响应:', error.response.data)
      console.error('错误状态:', error.response.status)
      ElMessage.error(`提交失败: ${error.response.data?.message || error.response.statusText || '未知错误'}`)
    } else if (error.request) {
      console.error('请求错误:', error.request)
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      console.error('其他错误:', error.message)
      ElMessage.error(`提交失败: ${error.message}`)
    }
  }
}

// 图片缓存管理
const imageCache = new Map()
const CACHE_SIZE_LIMIT = 100 // 最大缓存图片数量
const CACHE_EXPIRE_TIME = 30 * 60 * 1000 // 缓存过期时间：30分钟

// 缓存项结构
class CacheItem {
  constructor(blobUrl, timestamp) {
    this.blobUrl = blobUrl
    this.timestamp = timestamp
  }
  
  isExpired() {
    return Date.now() - this.timestamp > CACHE_EXPIRE_TIME
  }
}

// 清理过期缓存
const cleanExpiredCache = () => {
  const now = Date.now()
  for (const [key, item] of imageCache.entries()) {
    if (item.isExpired()) {
      URL.revokeObjectURL(item.blobUrl)
      imageCache.delete(key)
    }
  }
}

// 清理最旧的缓存项（当缓存达到限制时）
const cleanOldestCache = () => {
  if (imageCache.size >= CACHE_SIZE_LIMIT) {
    const oldestKey = imageCache.keys().next().value
    const oldestItem = imageCache.get(oldestKey)
    URL.revokeObjectURL(oldestItem.blobUrl)
    imageCache.delete(oldestKey)
  }
}

// 获取图片完整URL（带token认证和缓存管理）
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
    const cacheItem = imageCache.get(photoPath)
    if (!cacheItem.isExpired()) {
      return cacheItem.blobUrl
    } else {
      // 清理过期缓存
      URL.revokeObjectURL(cacheItem.blobUrl)
      imageCache.delete(photoPath)
    }
  }

  try {
    // 清理过期缓存
    cleanExpiredCache()
    
    // 如果缓存达到限制，清理最旧的项
    cleanOldestCache()
    
    // 将反斜杠转换为正斜杠，确保路径格式正确
    const normalizedPath = photoPath.replace(/\\/g, '/')
    
    // 使用axios请求图片，会自动带上Authorization header
    // 后端返回的路径格式：villageresident/photo/filename.jpg
    // 需要添加 /api 前缀进行请求
    console.log('请求图片路径:', normalizedPath)
    console.log('API baseURL:', api.defaults.baseURL)
    console.log('完整请求URL:', api.defaults.baseURL + normalizedPath)
    
    const response = await api.get(normalizedPath, {
      responseType: 'blob'
    })
    
    // 由于响应拦截器返回了response.data，所以response就是blob数据
    const blob = new Blob([response])
    const blobUrl = URL.createObjectURL(blob)
    
    // 缓存blob URL和时间戳
    imageCache.set(photoPath, new CacheItem(blobUrl, Date.now()))
    
    return blobUrl
  } catch (error) {
    console.error('加载图片失败:', error)
    return null
  }
}

// 清理所有图片缓存
const clearImageCache = () => {
  for (const [key, item] of imageCache.entries()) {
    URL.revokeObjectURL(item.blobUrl)
  }
  imageCache.clear()
  console.log('图片缓存已清理')
}

// 获取缓存统计信息
const getCacheStats = () => {
  return {
    size: imageCache.size,
    limit: CACHE_SIZE_LIMIT,
    keys: Array.from(imageCache.keys())
  }
}

// 预加载图片（在后台静默加载）
const preloadImages = async (members) => {
  const preloadPromises = members
    .filter(member => member.photo && !member.photoUrl)
    .map(async (member) => {
      try {
        const photoUrl = await getPhotoUrl(member.photo)
        // 找到对应的党员并更新photoUrl
        const index = partyMembersData.value.findIndex(m => m.id === member.id)
        if (index !== -1) {
          partyMembersData.value[index].photoUrl = photoUrl
        }
      } catch (error) {
        console.error(`预加载图片失败: ${member.name}`, error)
      }
    })
  
  // 并行预加载，不等待完成
  Promise.allSettled(preloadPromises)
}

// 智能缓存清理（在内存压力大时自动清理）
const smartCacheCleanup = () => {
  // 如果缓存超过限制的80%，清理最旧的20%
  if (imageCache.size > CACHE_SIZE_LIMIT * 0.8) {
    const itemsToRemove = Math.floor(imageCache.size * 0.2)
    const sortedEntries = Array.from(imageCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    for (let i = 0; i < itemsToRemove; i++) {
      const [key, item] = sortedEntries[i]
      URL.revokeObjectURL(item.blobUrl)
      imageCache.delete(key)
    }
    
    console.log(`智能清理：移除了 ${itemsToRemove} 个缓存项`)
  }
}

// 定期清理过期缓存（每5分钟执行一次）
let cacheCleanupInterval = null

const startCacheCleanup = () => {
  if (cacheCleanupInterval) {
    clearInterval(cacheCleanupInterval)
  }
  
  cacheCleanupInterval = setInterval(() => {
    cleanExpiredCache()
    smartCacheCleanup()
  }, 5 * 60 * 1000) // 5分钟
}

const stopCacheCleanup = () => {
  if (cacheCleanupInterval) {
    clearInterval(cacheCleanupInterval)
    cacheCleanupInterval = null
  }
}

// 调试功能：在控制台暴露缓存管理方法
if (import.meta.env.DEV) {
  window.partyImageCache = {
    stats: getCacheStats,
    clear: clearImageCache,
    cleanup: cleanExpiredCache,
    smartCleanup: smartCacheCleanup
  }
  console.log('图片缓存调试工具已加载，使用 window.partyImageCache 访问')
}

// 加载党员照片
const loadMemberPhotos = async () => {
  if (partyMembersData.value && partyMembersData.value.length > 0) {
    await Promise.all(partyMembersData.value.map(async (member, index) => {
      // 如果后端已经返回了photoUrl，直接使用
      if (member.photoUrl) {
        // photoUrl已经存在，不需要额外处理
        return
      }
      
      // 如果后端没有返回photoUrl但有photo字段，则通过API获取
      if (member.photo) {
        try {
          const photoUrl = await getPhotoUrl(member.photo)
          // 使用Vue的响应式更新，直接更新数组中的对象
          partyMembersData.value[index].photoUrl = photoUrl
        } catch (error) {
          console.error(`加载党员 ${member.name} 的图片失败:`, error)
          partyMembersData.value[index].photoUrl = null
        }
      } else {
        partyMembersData.value[index].photoUrl = null
      }
    }))
  }
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

// 图片加载错误处理
const handleImageError = (event) => {
  console.error('图片加载失败:', event.target.src)
  ElMessage.error('图片加载失败')
}

// 批量导入
const handleBatchImport = () => {
  importDialogVisible.value = true
}


// 监听搜索条件变化
watch([searchForm], () => {
  currentPage.value = 1
  loadData()
}, { deep: true })

// 点击外部关闭搜索结果
const handleClickOutside = (event) => {
  if (!event.target.closest('.villager-selector')) {
    villagerSearchVisible.value = false
    // 如果输入框为空，清空搜索结果
    if (!villagerSearchQuery.value || villagerSearchQuery.value.trim().length < 1) {
      villagerSearchResults.value = []
    }
  }
}

// 初始化函数
const initializeData = () => {
  // 确保所有响应式变量都有正确的初始值
  if (!villagerSearchResults.value) {
    villagerSearchResults.value = []
  }
  if (!partyMembersData.value) {
    partyMembersData.value = []
  }
  if (!selectedMember.value) {
    selectedMember.value = null
  }
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
      const options = data.map(item => ({
        id: item.id,
        name: item.dictLabel
      }))
      console.log(`字段 ${fieldName} 转换后的选项数据:`, options)
      return options
    } else {
      console.warn(`字段 ${fieldName} 字典数据API响应异常:`, response)
      return []
    }
  } catch (error) {
    console.error(`加载字段 ${fieldName} 字典数据失败:`, error)
    return []
  }
}

// 加载所有字典数据
const loadAllDictData = async () => {
  console.log('=== 开始加载党员信息库页面所有字典数据 ===')
  
  try {
    // 并行加载所有字段的字典数据
    const fieldNames = Object.keys(fieldToDictTypeMap)
    const promises = fieldNames.map(fieldName => 
      loadDictDataForField(fieldName).then(options => ({ fieldName, options }))
    )
    
    const results = await Promise.all(promises)
    console.log('所有字段字典数据加载结果:', results)
    
    // 更新对应的选项数据
    results.forEach(({ fieldName, options }) => {
      if (options.length > 0) {
        switch (fieldName) {
          case 'genderId':
            genderOptions.value = options
            console.log(`性别选项已更新:`, options)
            break
          case 'partyDutyId':
            partyDutyOptions.value = options
            console.log(`党内职务选项已更新:`, options)
            break
        }
        console.log(`字段 ${fieldName} 选项数据已更新，共 ${options.length} 个选项`)
      } else {
        console.warn(`字段 ${fieldName} 没有获取到数据，将使用备用数据`)
      }
    })
    
    console.log('=== 党员信息库页面所有字典数据加载完成 ===')
    console.log('最终选项数据:')
    console.log('- 性别:', genderOptions.value.length, '个选项')
    console.log('- 党内职务:', partyDutyOptions.value.length, '个选项')
    
  } catch (error) {
    console.error('加载字典数据失败:', error)
    console.log('使用备用数据确保功能正常')
    loadFallbackData()
  }
}

// 备用数据加载
const loadFallbackData = () => {
  console.log('使用备用数据...')
  if (genderOptions.value.length === 0) {
    genderOptions.value = [
      { id: 29, name: '男' },
      { id: 30, name: '女' }
    ]
  }
  if (partyDutyOptions.value.length === 0) {
    partyDutyOptions.value = [
      { id: 5, name: '党支部书记' },
      { id: 6, name: '党支部副书记' },
      { id: 7, name: '党支部委员' },
      { id: 8, name: '党小组长' },
      { id: 9, name: '普通党员' },
      { id: 10, name: '预备党员' }
    ]
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  // 先加载字典数据
  await loadAllDictData()
  initializeData()
  loadData()
  // 添加点击外部关闭搜索结果的监听
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除监听
// 导入相关函数

const handleImportFileChange = (file) => {
  selectedFile.value = file.raw
}

const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!')
    return false
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  return true
}

const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择要导入的文件')
    return
  }
  
  importLoading.value = true
  try {
    const response = await partyMemberAPI.importPartyMembers(selectedFile.value)
    if (response.code === 200) {
      ElMessage.success(response.message || '导入成功')
      importDialogVisible.value = false
      selectedFile.value = null
      uploadRef.value?.clearFiles()
      // 刷新数据
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

// 导出相关函数
const handleExport = async () => {
  exportDialogVisible.value = true
}

// 导出模板

// 生成说明
const handleGenerateTemplate = () => {
  generateTemplateDialogVisible.value = true
}

const handleSelectPath = () => {
  // 生成默认文件名
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
  pathForm.filename = `党员数据导出_${timestamp}`
  pathForm.sheetName = '党员数据'
  pathDialogVisible.value = true
}


const handleExportClose = () => {
  exportDialogVisible.value = false
}

const handleSelectDirectory = () => {
  // 由于浏览器安全限制，无法直接获取完整路径
  // 我们提供一个更实用的路径选择方案
  showPathInputDialog()
}


const handleSelectGenerateTemplateDirectory = () => {
  // 由于浏览器安全限制，无法直接获取完整路径
  // 我们提供一个更实用的路径选择方案
  showGenerateTemplatePathInputDialog()
}

// 路径输入对话框相关
const showPathInputDialog = () => {
  // 创建自定义的路径选择对话框
  ElMessageBox({
    title: '选择保存目录',
    message: '由于浏览器安全限制，无法直接获取完整路径，请手动输入保存目录的完整路径',
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    customClass: 'path-select-dialog',
    showInput: true,
    inputValue: pathForm.directory || 'D:\\',
    inputPlaceholder: '例如：D:\\Documents\\Exports',
    inputType: 'textarea',
    inputValidator: (value) => {
      if (!value || value.trim() === '') {
        return '请输入有效的目录路径'
      }
      // 简单的路径格式验证
      const trimmedValue = value.trim()
      if (trimmedValue.includes('..') || trimmedValue.includes('//')) {
        return '请输入正确的目录路径'
      }
      return true
    },
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        const value = instance.inputValue
        if (value) {
          const trimmedPath = value.trim()
          // 确保路径格式正确
          let finalPath = trimmedPath
          if (finalPath.endsWith('\\') || finalPath.endsWith('/')) {
            finalPath = finalPath.slice(0, -1)
          }
          pathForm.directory = finalPath
          ElMessage.success('目录选择成功')
        }
      }
      done()
    }
  }).catch(() => {
    // 用户取消，不需要处理，静默忽略
  })
}


const showGenerateTemplatePathInputDialog = () => {
  // 创建自定义的说明文件路径选择对话框
  ElMessageBox({
    title: '选择说明文件保存目录',
    message: '由于浏览器安全限制，无法直接获取完整路径，请手动输入保存目录的完整路径',
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    customClass: 'path-select-dialog',
    showInput: true,
    inputValue: generateTemplateForm.directory || 'D:\\',
    inputPlaceholder: '例如：D:\\Documents\\Templates',
    inputType: 'textarea',
    inputValidator: (value) => {
      if (!value || value.trim() === '') {
        return '请输入有效的目录路径'
      }
      // 简单的路径格式验证
      const trimmedValue = value.trim()
      if (trimmedValue.includes('..') || trimmedValue.includes('//')) {
        return '请输入正确的目录路径'
      }
      return true
    },
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        const value = instance.inputValue
        if (value) {
          const trimmedPath = value.trim()
          // 确保路径格式正确
          let finalPath = trimmedPath
          if (finalPath.endsWith('\\') || finalPath.endsWith('/')) {
            finalPath = finalPath.slice(0, -1)
          }
          generateTemplateForm.directory = finalPath
          ElMessage.success('目录选择成功')
        }
      }
      done()
    }
  }).catch(() => {
    // 用户取消，不需要处理，静默忽略
  })
}

// 对话框关闭处理
const handlePathClose = () => {
  pathDialogVisible.value = false
  pathForm.directory = ''
  pathForm.filename = ''
  pathForm.sheetName = '党员数据'
}


const handleGenerateTemplateClose = () => {
  generateTemplateDialogVisible.value = false
  generateTemplateForm.directory = ''
}

const handleFilenameChange = (value) => {
  // 确保文件名不包含非法字符
  const cleanFilename = value.replace(/[<>:"/\\|?*]/g, '_')
  if (cleanFilename !== value) {
    pathForm.filename = cleanFilename
    ElMessage.warning('文件名包含非法字符，已自动替换为下划线')
  }
}


// 确认导出
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
    // 构建完整路径
    const fullPath = `${pathForm.directory}/${pathForm.filename}.xlsx`
    
    // 构建导出请求
    const exportRequest = {
      savepath: fullPath,
      sheetName: pathForm.sheetName
    }
    
    // 构建查询请求（使用当前搜索条件）
    const queryRequest = {}
    if (searchForm.name) queryRequest.name = searchForm.name
    if (searchForm.gender) queryRequest.gender = searchForm.gender
    if (searchForm.minAge) queryRequest.minAge = Number(searchForm.minAge)
    if (searchForm.maxAge) queryRequest.maxAge = Number(searchForm.maxAge)
    if (searchForm.partyDuty) queryRequest.partyDuty = searchForm.partyDuty
    if (searchForm.branch) queryRequest.branch = searchForm.branch
    if (searchForm.minPartyAge) queryRequest.minPartyAge = Number(searchForm.minPartyAge)
    if (searchForm.maxPartyAge) queryRequest.maxPartyAge = Number(searchForm.maxPartyAge)
    
    const response = await partyMemberAPI.exportPartyMembers(exportRequest, queryRequest)
    
    console.log('后端响应:', response)
    
    if (response.code === 200) {
      ElMessage.success(`Excel文件已导出到：${fullPath}`)
      pathDialogVisible.value = false
    } else {
      ElMessage.error(response.message || '导出Excel失败')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  } finally {
    exportLoading.value = false
  }
}


// 确认生成说明
const handleConfirmGenerateTemplate = async () => {
  if (!generateTemplateForm.directory) {
    ElMessage.warning('请选择保存目录')
    return
  }
  
  exportLoading.value = true
  try {
    // 构建完整路径
    const fullPath = `${generateTemplateForm.directory}/党员信息导入模板.xlsx`
    
    // 构建请求
    const request = {
      savepath: fullPath
    }
    
    const response = await partyMemberAPI.generatePartyMemberTemplate(request)
    
    console.log('后端响应:', response)
    
    // 由于API设置了responseType: 'blob'，成功时返回的是blob数据
    // 如果请求成功，说明文件已经生成
    ElMessage.success(`模板文件已生成到：${fullPath}`)
    generateTemplateDialogVisible.value = false
  } catch (error) {
    console.error('生成模板失败:', error)
    ElMessage.error('生成模板失败，请稍后重试')
  } finally {
    exportLoading.value = false
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  stopCacheCleanup()
  clearImageCache()
})
</script>

<style scoped>
/* 完全复制村委会人员管理的样式 */
.party-members-container {
  padding: 20px;
  margin: 0 20px;
  background: #f5f5f5;
  min-height: 100vh;
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
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.display-toggle-btn {
  color: #606266;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.display-toggle-btn:hover {
  color: #409eff;
  background: #f5f7fa;
  border-color: #409eff;
}

.display-toggle-btn.active {
  color: #409eff;
  background: #ecf5ff;
  border-color: #409eff;
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

/* 筛选分组样式 */
.filter-section {
  margin-bottom: 24px;
  background: #fafbfc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e4e7ed;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.section-title .el-icon {
  margin-right: 8px;
  color: #409eff;
  font-size: 18px;
}

/* 表单网格布局 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  align-items: start;
}

.form-grid .el-form-item {
  margin-bottom: 0;
}

/* 表单控件样式 */
.form-input {
  width: 100%;
}

.form-input-wide {
  width: 100%;
  grid-column: 1 / -1;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.total-info {
  font-size: 14px;
  color: #606266;
}

/* 村民卡片列表 */
.villagers-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.villager-card {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  margin-bottom: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.villager-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 照片区域 */
.photo-section {
  margin-right: 20px;
  flex-shrink: 0;
}

.villager-photo {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden !important;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.villager-photo:hover {
  transform: scale(1.05);
}


.preview-icon {
  color: white;
  font-size: 24px;
}

/* 信息区域 */
.info-section {
  flex: 1;
  min-width: 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

/* 基本信息行 */
.info-row.primary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.name-group {
  flex: 1;
  min-width: 0;
}

.member-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.basic-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.gender-age {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.duty-tag {
  font-size: 12px;
  font-weight: 500;
}

.contact-info {
  text-align: right;
  flex-shrink: 0;
  margin-left: 16px;
}

.id-card {
  font-size: 13px;
  color: #909399;
  font-family: 'Courier New', monospace;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
}

/* 党内信息行 */
.info-row.secondary {
  align-items: flex-start;
}

.party-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}

.party-details {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  word-break: break-word;
}

.join-info {
  flex-shrink: 0;
  text-align: right;
}

.join-date {
  font-size: 13px;
  color: #909399;
  background: #f0f9ff;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #b3d8ff;
}

.info-icon {
  font-size: 16px;
  color: #409eff;
  margin-right: 8px;
  margin-top: 2px;
  flex-shrink: 0;
}

/* 状态标签行 */
.info-row.status-row {
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.status-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 操作按钮区域 */
.action-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 20px;
  flex-shrink: 0;
}

.action-btn {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f5f7fa;
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: white;
  border-radius: 8px;
  margin: 20px 0;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
}

/* 详情对话框 */
.detail-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.detail-photo {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.detail-photo:hover {
  transform: scale(1.05);
}

.detail-photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-photo-placeholder {
  font-size: 48px;
  color: #c0c4cc;
}

.detail-info {
  flex: 1;
}

.detail-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-form-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-form-label {
  font-weight: 600;
  color: #606266;
  min-width: 80px;
}

.detail-form-value {
  flex: 1;
  color: #303133;
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
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.preview-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: center;
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

.loading-text, .no-results {
  padding: 12px;
  text-align: center;
  color: #909399;
  font-size: 12px;
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
  font-size: 14px;
  margin-bottom: 4px;
}

.item-details {
  color: #606266;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .villager-card {
    flex-direction: column;
    text-align: center;
    padding: 16px;
  }
  
  .photo-section {
    margin-right: 0;
    margin-bottom: 16px;
    align-self: center;
  }
  
  .action-section {
    margin-left: 0;
    margin-top: 12px;
    align-items: center;
  }
  
  .search-input-group {
    flex-direction: column;
    align-items: stretch;
    max-width: 100%;
  }
  
  .search-input {
    max-width: 100%;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .form-input-wide {
    grid-column: span 1;
  }
  
  .filter-section {
    padding: 15px;
  }
  
  .detail-container {
    flex-direction: column;
    align-items: center;
  }
  
  .detail-form {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .detail-photo {
    width: 100px;
    height: 100px;
    margin: 0 auto;
  }
}

/* 导入导出相关样式 */
.export-dialog .el-dialog__body {
  padding: 30px 20px;
}

.export-container {
  text-align: center;
}

.export-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.export-icon {
  font-size: 48px;
  color: #409eff;
  margin-right: 16px;
}

.export-text h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
}

.export-text p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.export-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.path-dialog .el-dialog__body {
  padding: 20px;
}

.path-container {
  max-height: 500px;
  overflow-y: auto;
}

.path-form {
  margin-bottom: 20px;
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
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}

.path-tips .el-icon {
  margin-right: 6px;
  color: #409eff;
}

.path-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

/* 上传组件样式 */
.el-upload-dragger {
  width: 100%;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.el-upload-dragger:hover {
  border-color: #409eff;
}

.el-upload-dragger .el-icon--upload {
  font-size: 67px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.el-upload__text {
  color: #606266;
  font-size: 14px;
  text-align: center;
}

.el-upload__text em {
  color: #409eff;
  font-style: normal;
}

.el-upload__tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  text-align: center;
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
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.display-toggle-btn {
  color: #606266;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.display-toggle-btn:hover {
  color: #409eff;
  background: #f5f7fa;
  border-color: #409eff;
}

.display-toggle-btn.active {
  color: #409eff;
  background: #ecf5ff;
  border-color: #409eff;
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
  width: 300px;
}

.search-btn, .reset-btn {
  min-width: 80px;
}

.detailed-search {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.filter-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
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

.form-input {
  width: 100%;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.total-info {
  font-size: 14px;
  color: #606266;
}

.party-members-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.member-card {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  margin-bottom: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.member-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 照片区域 */
.photo-section {
  margin-right: 20px;
  flex-shrink: 0;
}

.member-photo {
  width: 80px;
  height: 80px; /* 1:1 比例 */
  border-radius: 8px;
  overflow: hidden !important;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
  border: none !important;
  outline: none !important;
  clip-path: inset(0 round 8px);
  justify-content: center;
  cursor: pointer;
}

.member-photo:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.photo-image {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center !important;
  border-radius: 0 !important;
  display: block !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.photo-placeholder {
  font-size: 24px;
  color: #999;
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
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.member-photo:hover .photo-overlay {
  opacity: 1;
}

.preview-icon {
  color: white;
  font-size: 24px;
}

/* 信息区域 */
.info-section {
  flex: 1;
  min-width: 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

/* 基本信息行 */
.info-row.primary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.name-group {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.basic-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.gender-age {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.duty-tag {
  font-size: 12px;
}

.contact-info {
  text-align: right;
  flex-shrink: 0;
  margin-left: 16px;
}

.phone {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.id-card {
  font-size: 12px;
  color: #909399;
  font-family: 'Courier New', monospace;
}

/* 地址和党内信息行 */
.info-row.secondary {
  align-items: flex-start;
}

.address-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}

.info-icon {
  color: #909399;
  margin-right: 6px;
  margin-top: 2px;
  flex-shrink: 0;
}

.address {
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
  word-break: break-all;
}

.party-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}

.party-details {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  word-break: break-word;
}

.join-info {
  flex-shrink: 0;
  text-align: right;
}

.join-date {
  font-size: 13px;
  color: #909399;
  background: #f0f9ff;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #b3d8ff;
}


.join-time {
  font-size: 12px;
  color: #909399;
}

/* 详细信息行 */
.info-row.details {
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.detail-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  flex: 1;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
}

.detail-label {
  color: #909399;
  margin-right: 4px;
  white-space: nowrap;
}

.detail-value {
  color: #303133;
  font-weight: 500;
}

/* 状态标签行 */
.info-row.status-row {
  align-items: center;
  justify-content: flex-start;
}

.status-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 操作按钮区域 */
.action-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 20px;
  flex-shrink: 0;
}

.action-btn {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f5f7fa;
}


.preview-icon {
  color: #fff;
  font-size: 20px;
}

.info-section {
  flex: 1;
  min-width: 0;
}

.info-row {
  margin-bottom: 12px;
}

.info-row.primary {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.name-group {
  flex: 1;
  min-width: 0;
}

.member-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.basic-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.gender-age {
  font-size: 14px;
  color: #606266;
}

.duty-tag {
  font-size: 12px;
}

.contact-info {
  text-align: right;
  flex-shrink: 0;
}

.phone, .id-card {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.info-row.secondary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.address-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.info-icon {
  margin-right: 6px;
  color: #909399;
  flex-shrink: 0;
}

.address {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.party-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.branch, .party-age {
  font-size: 14px;
  color: #606266;
}

.info-row.details {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.detail-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.detail-label {
  color: #909399;
  margin-right: 6px;
  white-space: nowrap;
}

.detail-value {
  color: #606266;
}

.info-row.status-row {
  margin-bottom: 0;
}

.status-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}


.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-scroll-container {
  max-height: 60vh;
  overflow-y: auto;
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

.member-detail {
  padding: 10px 0;
}

.detail-row {
  display: flex;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  margin-right: 30px;
  margin-bottom: 10px;
  min-width: 200px;
}

.detail-item.full-width {
  min-width: 100%;
  margin-right: 0;
}

.detail-label {
  font-weight: 500;
  color: #606266;
  margin-right: 10px;
  min-width: 80px;
}

.detail-value {
  color: #303133;
  flex: 1;
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
  color: #409eff;
}

.selected-villager {
  margin-top: 8px;
  padding: 12px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
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
  display: block;
  margin-bottom: 4px;
}

.villager-details {
  font-size: 12px;
  color: #606266;
}

.clear-btn {
  color: #f56c6c;
  padding: 0;
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
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.preview-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .party-members-container {
    padding: 16px;
    margin: 0 16px;
  }
  
  .preview-image-wrapper {
    max-width: 300px;
    height: 300px;
  }
}
</style>

