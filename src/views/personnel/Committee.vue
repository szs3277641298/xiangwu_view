<template>
  <div class="villagers-container">
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
                <el-form-item label="身份证号">
                  <el-input
                    v-model="searchForm.idCard"
                    placeholder="请输入身份证号"
                    clearable
                    style="width: 180px"
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
            
            <!-- 工作信息 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Briefcase /></el-icon>
                <span>工作信息</span>
              </div>
              <div class="form-grid">
                <el-form-item label="职务">
                  <el-select v-model="searchForm.dutyId" placeholder="请选择" clearable style="width: 120px">
                    <el-option 
                      v-for="option in dutyOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="负责工作">
                  <el-input
                    v-model="searchForm.responsibility"
                    placeholder="请输入负责工作"
                    clearable
                    class="form-input-wide"
                  />
                </el-form-item>
                <el-form-item label="入职时间">
                  <el-date-picker
                    v-model="searchForm.entryDate"
                    type="date"
                    placeholder="请选择入职时间"
                    clearable
                    style="width: 180px"
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
        <el-button type="primary" v-if="isAdmin" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增村委会人员
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
    
    <!-- 村委会人员卡片列表 -->
    <div class="villagers-list" v-loading="loading">
      <div class="villager-card" v-for="member in committeeData" :key="member.id" @click="handleViewDetail(member)">
        <!-- 人员照片 -->
        <div class="photo-section">
          <div class="villager-photo" @click.stop="handleImagePreview(member)">
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
        
        <!-- 人员信息 -->
        <div class="info-section">
          <!-- 基本信息行 -->
          <div class="info-row primary">
            <div class="name-group">
              <h3 class="villager-name">{{ member.name }}</h3>
              <div class="basic-info">
                <span class="gender-age">{{ member.genderLabel }} · {{ member.age }}岁 · {{ member.educationLevelLabel }}</span>
                <el-tag 
                  :type="getDutyTagType(member.dutyId)" 
                  size="small"
                  class="residence-tag"
                >
                  {{ member.dutyName }}
                </el-tag>
              </div>
            </div>
            <div class="contact-info">
              <div class="id-card">{{ member.idCard }}</div>
            </div>
          </div>
          
          <!-- 工作信息行 -->
          <div class="info-row secondary">
            <div class="work-info">
              <el-icon class="info-icon"><Briefcase /></el-icon>
              <span class="responsibility">{{ member.responsibility || '暂无负责工作' }}</span>
            </div>
            <div class="entry-info">
              <span class="entry-date">入职：{{ formatDate(member.entryDate) }}</span>
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
      <div v-if="committeeData.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无村委会人员数据" />
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="村委会人员详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="detail-container" v-if="selectedMember">
        <div class="detail-photo" @click="handleImagePreview(selectedMember)">
          <img 
            v-if="selectedMember.photoUrl" 
            :src="selectedMember.photoUrl" 
            :alt="selectedMember.name"
            class="detail-photo-image"
          />
          <el-icon v-else class="detail-photo-placeholder">
            <User />
          </el-icon>
        </div>
        <div class="detail-info">
          <div class="detail-form">
            <div class="detail-form-row">
              <div class="detail-form-label">姓名：</div>
              <div class="detail-form-value">{{ selectedMember.name }}</div>
            </div>
            <div class="detail-form-row">
              <div class="detail-form-label">身份证号：</div>
              <div class="detail-form-value">{{ selectedMember.idCard }}</div>
            </div>
            <div class="detail-form-row">
              <div class="detail-form-label">性别：</div>
              <div class="detail-form-value">{{ selectedMember.genderLabel }}</div>
            </div>
            <div class="detail-form-row">
              <div class="detail-form-label">年龄：</div>
              <div class="detail-form-value">{{ selectedMember.age }}岁</div>
            </div>
            <div class="detail-form-row">
              <div class="detail-form-label">学历：</div>
              <div class="detail-form-value">{{ selectedMember.educationLevelLabel }}</div>
            </div>
            <div class="detail-form-row">
              <div class="detail-form-label">职务：</div>
              <div class="detail-form-value">{{ selectedMember.dutyName }}</div>
            </div>
            <div class="detail-form-row">
              <div class="detail-form-label">入职时间：</div>
              <div class="detail-form-value">{{ formatDate(selectedMember.entryDate) }}</div>
            </div>
            <div class="detail-form-row">
              <div class="detail-form-label">负责工作：</div>
              <div class="detail-form-value">{{ selectedMember.responsibility || '暂无' }}</div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
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
          <p>职务：{{ previewMember?.dutyName }}</p>
          <div class="preview-actions">
            <el-button size="small" @click="previewDialogVisible = false">关闭</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 村委会人员详情对话框 -->
    <el-dialog
      v-model="committeeDetailDialogVisible"
      title="村委会人员详情"
      width="800px"
      :before-close="handleCommitteeDetailClose"
      class="detail-dialog"
      center
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div class="detail-scroll-container" v-if="selectedCommitteeMember">
        <div class="detail-container">
          <!-- 村委会人员照片 -->
          <div class="detail-photo-section">
            <div class="detail-photo" @click="handleImagePreview(selectedCommitteeMember)">
              <img 
                v-if="selectedCommitteeMember.photoUrl" 
                :src="selectedCommitteeMember.photoUrl" 
                :alt="selectedCommitteeMember.name"
                class="detail-photo-image"
              />
              <el-icon v-else class="detail-photo-placeholder">
                <User />
              </el-icon>
            </div>
          </div>

          <!-- 村委会人员详细信息表单 -->
          <div class="detail-info-section">
            <div class="detail-form-container">
              <div class="detail-form">
                <div class="detail-form-row">
                  <div class="detail-form-label">姓名</div>
                  <div class="detail-form-value">{{ selectedCommitteeMember.name || '未填写' }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">身份证号</div>
                  <div class="detail-form-value">{{ selectedCommitteeMember.idCard || '未填写' }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">性别</div>
                  <div class="detail-form-value">{{ selectedCommitteeMember.genderLabel || '未填写' }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">年龄</div>
                  <div class="detail-form-value">{{ selectedCommitteeMember.age ? selectedCommitteeMember.age + '岁' : '未填写' }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">学历</div>
                  <div class="detail-form-value">{{ selectedCommitteeMember.educationLevelLabel || '未填写' }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">职务</div>
                  <div class="detail-form-value">
                    <el-tag v-if="selectedCommitteeMember.dutyName" :type="getDutyTagType(selectedCommitteeMember.dutyId)" size="small">
                      {{ selectedCommitteeMember.dutyName }}
                    </el-tag>
                    <span v-else>未填写</span>
                  </div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">入职时间</div>
                  <div class="detail-form-value">{{ selectedCommitteeMember.entryDate ? formatDate(selectedCommitteeMember.entryDate) : '未填写' }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">负责工作</div>
                  <div class="detail-form-value">{{ selectedCommitteeMember.responsibility || '未填写' }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">联系电话</div>
                  <div class="detail-form-value">{{ selectedCommitteeMember.phone || '未填写' }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">地址</div>
                  <div class="detail-form-value">{{ selectedCommitteeMember.address || '未填写' }}</div>
                </div>
                <div class="detail-form-row" v-if="selectedCommitteeMember.remarks">
                  <div class="detail-form-label">备注</div>
                  <div class="detail-form-value">{{ selectedCommitteeMember.remarks }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入村委会人员" width="500px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :on-change="handleImportFileChange"
        :before-upload="beforeUpload"
        accept=".xlsx,.xls"
        :limit="1"
        drag
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
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

    <!-- 导出数据对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出村委会数据"
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
            <p>将导出当前筛选条件下的所有村委会人员数据</p>
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
                />
                <el-button type="primary" @click="handleSelectDirectory" class="path-select-btn">
                  <el-icon><FolderOpened /></el-icon>
                  选择目录
                </el-button>
              </div>
            </el-form-item>
            <el-form-item label="文件名" required>
              <el-input
                v-model="pathForm.filename"
                placeholder="请输入文件名（不含扩展名）"
                @input="handleFilenameChange"
              />
            </el-form-item>
            <el-form-item label="工作表名称" required>
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
                  placeholder="请选择保存目录"
                  class="path-input"
                  readonly
                />
                <el-button type="primary" @click="handleSelectTemplateDirectory" class="path-select-btn">
                  <el-icon><FolderOpened /></el-icon>
                  选择目录
                </el-button>
              </div>
            </el-form-item>
            <el-form-item label="文件名" required>
              <el-input
                v-model="templatePathForm.filename"
                placeholder="请输入文件名（不含扩展名）"
                @input="handleTemplateFilenameChange"
              />
            </el-form-item>
            <el-form-item label="工作表名称" required>
              <el-input
                v-model="templatePathForm.sheetName"
                placeholder="请输入工作表名称"
              />
            </el-form-item>
          </el-form>
        </div>
        
        <div class="path-actions">
          <el-button @click="handleTemplatePathClose">取消</el-button>
          <el-button type="primary" @click="handleConfirmTemplateExport" :loading="exportLoading">
            <el-icon><Download /></el-icon>
            确认导出
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 生成模板路径选择对话框 -->
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

    <!-- 新增/编辑表单 -->
    <CommitteeForm
      v-model="formVisible"
      :edit-data="editData"
      :duty-options="dutyOptions"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { Search, Plus, Download, Refresh, User, Briefcase, Edit, Delete, ArrowDown, ArrowUp, ZoomIn, InfoFilled, Document, Upload, UploadFilled, CopyDocument, FolderOpened } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../store/index.js'
import { committeeAPI, dictAPI } from '../../api/api.js'
import api from '../../api/api.js'
import { 
  getGenderOptions,
  getGenderLabel,
  getCommitteeDutyOptions,
  getCommitteeDutyLabel
} from '../../utils/constants.js'
import CommitteeForm from './CommitteeForm.vue'

// 用户权限
const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)

// 搜索展开状态
const searchExpanded = ref(false)


// 详情对话框相关
const detailDialogVisible = ref(false)
const selectedMember = ref(null)

// 图片预览相关
const previewDialogVisible = ref(false)
const previewImageUrl = ref('')
const previewMember = ref(null)

// 村委会人员详情相关
const committeeDetailDialogVisible = ref(false)
const selectedCommitteeMember = ref(null)

// 批量导入相关
const importDialogVisible = ref(false)
const importLoading = ref(false)
const uploadRef = ref(null)
const selectedFile = ref(null)

// 导出相关
const exportDialogVisible = ref(false)
const exportLoading = ref(false)

// 路径选择相关
const pathDialogVisible = ref(false)
const templatePathDialogVisible = ref(false)
const generateTemplateDialogVisible = ref(false)
const pathForm = reactive({
  directory: '',
  filename: '',
  sheetName: '村委会数据'
})
const templatePathForm = reactive({
  directory: '',
  filename: '',
  sheetName: '模板_村委会信息'
})
const generateTemplateForm = reactive({
  directory: ''
})


// 表单相关
const formVisible = ref(false)
const editData = ref(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  idCard: '',
  dutyId: null,
  genderId: null,
  minAge: null,
  maxAge: null,
  responsibility: '',
  entryDate: null
})

// 数据相关
const committeeData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 字典数据相关
const dictTypeList = ref([]) // 存储字典类型列表
const dictDataMap = ref(new Map()) // 存储每个类型的字典数据

// 表单字段与字典类型的映射
const fieldToDictTypeMap = {
  'genderId': 'gender',        // 性别
  'dutyId': 'committee_duty'   // 职务 - 村委会职务
}

// 选项数据 - 用于搜索筛选
const genderOptions = ref([])
const dutyOptions = ref([])

// 获取所有字典类型
const loadDictTypes = async () => {
  try {
    const response = await dictAPI.getDictTypeList({ page: 1, size: 1000 })
    if (response.code === 200) {
      dictTypeList.value = response.data.list || []
      console.log('获取字典类型成功:', dictTypeList.value)
    } else {
      console.log('响应状态码不是200')
      return []
    }
  } catch (error) {
    console.error('获取字典类型失败:', error)
    return []
  }
}

// 根据类型代码获取字典数据
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
      console.log(`字段 ${fieldName} 字典数据:`, data)
      
      const options = data.map(item => ({
        id: item.id,
        name: item.dictLabel
      }))
      
      console.log(`字段 ${fieldName} 转换后的选项:`, options)
      
      // 存储到对应的选项数组中
      switch (fieldName) {
        case 'genderId':
          genderOptions.value = options
          break
        case 'dutyId':
          dutyOptions.value = options
          break
      }
      
      // 存储到字典数据映射中
      dictDataMap.value.set(dictType, options)
      
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
    console.log('=== 开始加载字典数据 ===')
    
    // 并行加载所有表单字段对应的字典数据
    const fieldNames = Object.keys(fieldToDictTypeMap)
    console.log('需要加载的字段:', fieldNames)
    console.log('字段映射关系:', fieldToDictTypeMap)
    
    const promises = fieldNames.map(async (fieldName) => {
      console.log(`开始加载字段: ${fieldName}`)
      const options = await loadDictDataForField(fieldName)
      console.log(`字段 ${fieldName} 加载完成，选项数量:`, options.length)
      return { fieldName, options }
    })
    
    const results = await Promise.all(promises)
    console.log('所有字段加载结果:', results)
    
    console.log('字典数据加载完成:')
    console.log('- 性别:', genderOptions.value.length, '个选项')
    console.log('- 职务:', dutyOptions.value.length, '个选项')
    
  } catch (error) {
    console.error('加载字典数据失败:', error)
    // 如果字典API失败，使用备用数据
    console.log('使用备用数据确保功能正常')
    loadFallbackData()
  }
}

// 备用数据
const loadFallbackData = () => {
  genderOptions.value = [
    { id: 29, name: '男' },
    { id: 30, name: '女' }
  ]
  
  dutyOptions.value = [
    { id: 12, name: '村长' },
    { id: 13, name: '会计' },
    { id: 14, name: '委员' }
  ]
}

// 切换搜索展开状态
const toggleSearchExpanded = () => {
  searchExpanded.value = !searchExpanded.value
}


// 获取照片URL
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

// 获取职务标签类型
const getDutyTagType = (dutyId) => {
  const typeMap = {
    12: 'danger',  // 村长
    13: 'info',    // 会计
    14: 'success'  // 委员
  }
  return typeMap[dutyId] || 'info'
}



// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未填写'
  
  try {
    // 处理 LocalDateTime 格式 (yyyy-MM-dd HH:mm:ss)
    if (typeof dateString === 'string' && dateString.includes(' ')) {
      const datePart = dateString.split(' ')[0] // 取日期部分
      const date = new Date(datePart)
      if (isNaN(date.getTime())) return '日期格式错误'
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }
    
    // 处理时间戳格式
    const date = new Date(typeof dateString === 'number' ? dateString : dateString)
    if (isNaN(date.getTime())) return '日期格式错误'
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    console.error('日期格式化错误:', error)
    return '日期格式错误'
  }
}

// 格式化日期时间
const formatDateTime = (date) => {
  if (!date) return '暂无'
  return new Date(date).toLocaleString('zh-CN')
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadCommitteeData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    idCard: '',
    dutyId: null,
    genderId: null,
    minAge: null,
    maxAge: null,
    responsibility: '',
    entryDate: null
  })
  handleSearch()
}

// 加载数据
const loadCommitteeData = async () => {
  loading.value = true
  try {
    // 在开始加载时清空数据，避免重复显示
    committeeData.value = []
    total.value = 0

    const requestData = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }

    // 只添加非空值到请求数据中
    if (searchForm.name) requestData.name = searchForm.name
    if (searchForm.idCard) requestData.idCard = searchForm.idCard
    if (searchForm.dutyId) requestData.dutyId = searchForm.dutyId
    if (searchForm.genderId) requestData.genderId = searchForm.genderId
    if (searchForm.minAge !== null) requestData.minAge = searchForm.minAge
    if (searchForm.maxAge !== null) requestData.maxAge = searchForm.maxAge
    if (searchForm.responsibility) requestData.responsibility = searchForm.responsibility
    if (searchForm.entryDate) requestData.entryDate = searchForm.entryDate

    const response = await committeeAPI.getCommitteeList(requestData)

    if (response.code === 200) {
      const data = response.data.list || []

      // 先设置数据，过滤掉name="XXX"且id=1的记录
      const filteredData = data.filter(member => !(member.name === 'XXX'))

      // 先清空photoUrl，避免显示原始路径
      filteredData.forEach(member => {
        if (member.photoUrl) {
          member.originalPhotoUrl = member.photoUrl // 保存原始路径
          member.photoUrl = null // 清空，避免直接显示原始路径
        }
      })

      committeeData.value = filteredData
      total.value = filteredData.length
      
      // 异步加载图片URL
      filteredData.forEach(async (member, index) => {
        // 村委数据使用photoUrl字段
        if (member.originalPhotoUrl) {
          try {
            const photoUrl = await getPhotoUrl(member.originalPhotoUrl)
            // 使用Vue的响应式更新，直接更新数组中的对象
            if (committeeData.value[index]) {
              committeeData.value[index].photoUrl = photoUrl
            }
          } catch (error) {
            console.error(`加载村委会人员 ${member.name} 的图片失败:`, error)
            if (committeeData.value[index]) {
              committeeData.value[index].photoUrl = null
            }
          }
        } else {
          if (committeeData.value[index]) {
            committeeData.value[index].photoUrl = null
          }
        }
      })
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取村委会人员数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
const handleViewDetail = async (member) => {
  try {
    const response = await committeeAPI.getCommitteeInfoByResidentId(member.residentId)
    if (response.code === 200) {
      const data = response.data
      
      // 处理图片URL
      if (data.photoUrl) {
        try {
          const photoUrl = await getPhotoUrl(data.photoUrl)
          data.photoUrl = photoUrl
        } catch (error) {
          console.error('获取图片失败:', error)
          data.photoUrl = null
        }
      }
      
      selectedMember.value = data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(response.message || '获取详情失败')
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
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

// 查看村委会人员详情（通过residentId）
const handleViewCommitteeDetail = async (residentId) => {
  try {
    const response = await committeeAPI.getCommitteeInfoByResidentId(residentId)
    if (response.code === 200) {
      const data = response.data
      
      // 处理图片URL
      if (data.photoUrl) {
        try {
          const photoUrl = await getPhotoUrl(data.photoUrl)
          data.photoUrl = photoUrl
        } catch (error) {
          console.error('获取图片失败:', error)
          data.photoUrl = null
        }
      }
      
      selectedCommitteeMember.value = data
      committeeDetailDialogVisible.value = true
    } else {
      ElMessage.error(response.message || '获取村委会人员详情失败')
    }
  } catch (error) {
    console.error('获取村委会人员详情失败:', error)
    ElMessage.error('获取详情失败，请稍后重试')
  }
}

// 关闭村委会人员详情对话框
const handleCommitteeDetailClose = () => {
  committeeDetailDialogVisible.value = false
  selectedCommitteeMember.value = null
}

// 批量导入相关方法
const handleBatchImport = () => {
  importDialogVisible.value = true
}

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
    const response = await committeeAPI.importCommittee(selectedFile.value)
    if (response.code === 200) {
      ElMessage.success(response.message || '导入成功')
      importDialogVisible.value = false
      selectedFile.value = null
      uploadRef.value?.clearFiles()
      // 刷新数据
      loadCommitteeData()
    } else {
      ElMessage.error(response.message || '导入失败')
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败，请稍后重试')
  } finally {
    importLoading.value = false
  }
}

// 导出相关方法
const handleExport = async () => {
  exportDialogVisible.value = true
}

// 导出模板
const handleExportTemplate = () => {
  // 生成默认文件名
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
  templatePathForm.filename = `模板_村委会信息导入模板_${timestamp}`
  templatePathForm.sheetName = '模板_村委会信息'
  templatePathDialogVisible.value = true
}


// 生成说明
const handleGenerateTemplate = () => {
  generateTemplateDialogVisible.value = true
}


const handleExportClose = () => {
  exportDialogVisible.value = false
}

const handleSelectPath = () => {
  // 生成默认文件名
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
  pathForm.filename = `村委会人员数据_${timestamp}`
  pathForm.sheetName = '村委会数据'
  pathDialogVisible.value = true
}

const handleSelectDirectory = () => {
  ElMessageBox.prompt('请输入保存目录路径', '选择目录', {
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
      return true
    }
  }).then(({ value }) => {
    if (value) {
      let finalPath = value.trim()
      // 确保路径格式正确
      if (!finalPath.endsWith('\\') && !finalPath.endsWith('/')) {
        finalPath += '\\'
      }
      // 移除末尾的斜杠
      if (finalPath.endsWith('\\') || finalPath.endsWith('/')) {
        finalPath = finalPath.slice(0, -1)
      }
      pathForm.directory = finalPath
      ElMessage.success('目录选择成功')
    }
  }).catch(() => {
    // 用户取消
  })
}

const handleSelectTemplateDirectory = () => {
  ElMessageBox.prompt('请输入保存目录路径', '选择目录', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    customClass: 'path-select-dialog',
    showInput: true,
    inputValue: templatePathForm.directory || 'D:\\',
    inputPlaceholder: '例如：D:\\Documents\\Templates',
    inputType: 'textarea',
    inputValidator: (value) => {
      if (!value || value.trim() === '') {
        return '请输入有效的目录路径'
      }
      return true
    }
  }).then(({ value }) => {
    if (value) {
      let finalPath = value.trim()
      // 确保路径格式正确
      if (!finalPath.endsWith('\\') && !finalPath.endsWith('/')) {
        finalPath += '\\'
      }
      // 移除末尾的斜杠
      if (finalPath.endsWith('\\') || finalPath.endsWith('/')) {
        finalPath = finalPath.slice(0, -1)
      }
      templatePathForm.directory = finalPath
      ElMessage.success('目录选择成功')
    }
  }).catch(() => {
    // 用户取消
  })
}

const handleSelectGenerateTemplateDirectory = () => {
  ElMessageBox.prompt('请输入保存目录路径', '选择目录', {
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
      return true
    }
  }).then(({ value }) => {
    if (value) {
      let finalPath = value.trim()
      // 确保路径格式正确
      if (!finalPath.endsWith('\\') && !finalPath.endsWith('/')) {
        finalPath += '\\'
      }
      // 移除末尾的斜杠
      if (finalPath.endsWith('\\') || finalPath.endsWith('/')) {
        finalPath = finalPath.slice(0, -1)
      }
      generateTemplateForm.directory = finalPath
      ElMessage.success('目录选择成功')
    }
  }).catch(() => {
    // 用户取消
  })
}

// 路径选择相关方法
const handlePathClose = () => {
  pathDialogVisible.value = false
  pathForm.directory = ''
  pathForm.filename = ''
  pathForm.sheetName = '村委会数据'
}


// 模板路径选择相关方法
const handleTemplatePathClose = () => {
  templatePathDialogVisible.value = false
  templatePathForm.directory = ''
  templatePathForm.filename = ''
  templatePathForm.sheetName = '模板_村委会信息'
}

// 生成说明相关方法
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

const handleTemplateFilenameChange = (value) => {
  // 确保文件名不包含非法字符
  const cleanFilename = value.replace(/[<>:"/\\|?*]/g, '_')
  if (cleanFilename !== value) {
    templatePathForm.filename = cleanFilename
    ElMessage.warning('文件名包含非法字符，已自动替换为下划线')
  }
}

const handleConfirmTemplateExport = async () => {
  if (!templatePathForm.directory) {
    ElMessage.warning('请选择保存目录')
    return
  }
  
  if (!templatePathForm.filename) {
    ElMessage.warning('请输入文件名')
    return
  }
  
  try {
    exportLoading.value = true
    
    // 生成完整路径
    const filename = templatePathForm.filename.endsWith('.xlsx') ? templatePathForm.filename : `${templatePathForm.filename}.xlsx`
    const fullPath = `${templatePathForm.directory}/${filename}`
    
    // 构建请求参数
    const exportRequest = {
      savepath: fullPath,
      sheetName: templatePathForm.sheetName
    }
    
    // 构建查询条件（下载模板时固定name参数）
    const queryRequest = {
      name: 'XXX',
      dutyId: '',
      genderId: '',
      minAge: null,
      maxAge: null,
      responsibility: '',
      entryDate: null,
      pageNum: 1,
      pageSize: 10000 // 导出所有数据
    }
    
    console.log('模板导出参数:', exportRequest)
    console.log('模板查询条件:', queryRequest)
    
    // 使用普通导出接口而不是模板导出接口
    const response = await committeeAPI.exportCommittee(exportRequest, queryRequest)
    
    console.log('后端响应:', response)
    
    if (response.code === 200) {
      ElMessage.success(`模板文件已导出到：${fullPath}`)
      templatePathDialogVisible.value = false
      templatePathForm.directory = ''
      templatePathForm.filename = ''
      templatePathForm.sheetName = '模板_村委会信息'
    } else {
      ElMessage.error(response.message || '模板导出失败')
    }
  } catch (error) {
    console.error('模板导出失败:', error)
    ElMessage.error('模板导出失败，请稍后重试')
  } finally {
    exportLoading.value = false
  }
}


const handleConfirmExport = async () => {
  if (!pathForm.directory) {
    ElMessage.warning('请选择保存目录')
    return
  }
  
  if (!pathForm.filename) {
    ElMessage.warning('请输入文件名')
    return
  }
  
  try {
    exportLoading.value = true
    
    // 生成完整路径
    const filename = pathForm.filename.endsWith('.xlsx') ? pathForm.filename : `${pathForm.filename}.xlsx`
    const fullPath = `${pathForm.directory}/${filename}`
    
    // 构建请求参数
    const exportRequest = {
      savepath: fullPath,
      sheetName: pathForm.sheetName
    }
    
    // 构建查询条件（使用当前筛选条件）
    const queryRequest = {
      name: searchForm.name || '',
      dutyId: searchForm.dutyId || '',
      genderId: searchForm.genderId || '',
      minAge: searchForm.minAge || null,
      maxAge: searchForm.maxAge || null,
      responsibility: searchForm.responsibility || '',
      entryDate: searchForm.entryDate || null,
      pageNum: 1,
      pageSize: 10000 // 导出所有数据
    }
    
    console.log('导出参数:', exportRequest)
    console.log('查询条件:', queryRequest)
    
    // 调用后端导出接口
    const response = await committeeAPI.exportCommittee(exportRequest, queryRequest)
    
    console.log('后端响应:', response)
    
    if (response.code === 200) {
      ElMessage.success(`Excel文件已导出到：${fullPath}`)
      pathDialogVisible.value = false
      pathForm.directory = ''
      pathForm.filename = ''
      pathForm.sheetName = '村委会数据'
    } else {
      ElMessage.error(response.message || '导出失败')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  } finally {
    exportLoading.value = false
  }
}

const handleConfirmGenerateTemplate = async () => {
  if (!generateTemplateForm.directory) {
    ElMessage.warning('请选择保存目录')
    return
  }
  
  try {
    exportLoading.value = true
    
    // 生成完整路径，文件名固定为"村委会信息导入模板.xlsx"
    const fullPath = `${generateTemplateForm.directory}/村委会信息导入模板.xlsx`
    
    // 构建请求参数，只需要保存路径
    const request = {
      savepath: fullPath
    }
    
    console.log('生成说明参数:', request)
    
    // 调用生成说明接口
    const response = await committeeAPI.generateCommitteeTemplate(request)
    
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


// 新增
const handleAdd = () => {
  editData.value = null
  formVisible.value = true
}

// 编辑
const handleEdit = (member) => {
  editData.value = { ...member }
  formVisible.value = true
}

// 表单提交成功
const handleFormSuccess = () => {
  loadCommitteeData()
}

// 删除
const handleDelete = (member) => {
  // 检查residentId是否存在
  if (!member.residentId) {
    ElMessage.error('无法获取村民ID，删除失败')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除村委会人员"${member.name}"吗？删除后将无法恢复。`,
    '确认删除村委会人员',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: false
    }
  ).then(async () => {
    try {
      const response = await committeeAPI.deleteCommitteeMember(member.residentId)
      if (response.code === 200) {
        ElMessage.success('删除村委会人员成功')
        loadCommitteeData()
      } else {
        ElMessage.error(response.message || '删除村委会人员失败')
      }
    } catch (error) {
      console.error('删除村委会人员失败:', error)
      ElMessage.error('删除村委会人员失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}



// 下载模板

// 生成说明

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadCommitteeData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadCommitteeData()
}

// 初始化
onMounted(async () => {
  // 抑制 ResizeObserver 错误
  const resizeObserverError = (e) => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
      e.stopImmediatePropagation()
    }
  }
  window.addEventListener('error', resizeObserverError)
  
  // 先加载字典数据，再加载村委会数据
  try {
    console.log('Committee页面挂载，开始加载字典数据...')
    await loadAllDictData()
    console.log('Committee字典数据加载完成')
  } catch (error) {
    console.error('Committee字典数据加载失败:', error)
    // 使用备用数据确保功能正常
    loadFallbackData()
  }
  
  // 加载村委会数据
  loadCommitteeData()
  
  // 清理事件监听器
  onUnmounted(() => {
    window.removeEventListener('error', resizeObserverError)
  })
})
</script>

<style scoped>
/* 完全复制村内人员管理的样式 */
.villagers-container {
  padding: 20px;
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

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  font-size: 32px;
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
  transition: opacity 0.3s ease;
}

.villager-photo:hover .photo-overlay {
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

.villager-name {
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

.residence-tag {
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

/* 工作信息行 */
.info-row.secondary {
  align-items: flex-start;
}

.work-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}

.info-icon {
  font-size: 16px;
  color: #409eff;
  margin-right: 8px;
  margin-top: 2px;
  flex-shrink: 0;
}

.responsibility {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  word-break: break-word;
}

.entry-info {
  flex-shrink: 0;
  text-align: right;
}

.entry-date {
  font-size: 13px;
  color: #909399;
  background: #f0f9ff;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #b3d8ff;
}

/* 状态标签行 */
.info-row.status-row {
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

/* 身份标签行 */
.info-row.identity-row {
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.status-tags,
.identity-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 详细信息行 */
.info-row.details {
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

.detail-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}

.detail-label {
  color: #909399;
  margin-right: 4px;
  font-weight: 500;
}

.detail-value {
  color: #303133;
  font-weight: 500;
}

/* 项目信息行 */
.info-row.project {
  align-items: flex-start;
}

.project-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.project-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  word-break: break-word;
}

.project-position {
  color: #909399;
  font-size: 13px;
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


/* 村委会人员详情对话框样式 */
.detail-dialog .el-dialog {
  max-height: 90vh !important;
  margin: 0 !important;
  border-radius: 8px !important;
  position: fixed !important;
  top: 50% !important;
  left: calc(50% + 120px) !important;
  transform: translate(-50%, -50%) !important;
  z-index: 2000 !important;
}

.detail-scroll-container {
  max-height: 75vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 0 !important;
  -webkit-overflow-scrolling: touch !important;
  scrollbar-width: thin;
  scrollbar-color: #409eff #f0f2f5;
}

.detail-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.detail-scroll-container::-webkit-scrollbar-track {
  background: #f0f2f5;
  border-radius: 3px;
}

.detail-scroll-container::-webkit-scrollbar-thumb {
  background: #409eff;
  border-radius: 3px;
}

.detail-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #337ecc !important;
}

.detail-container {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.detail-photo-section {
  flex-shrink: 0;
}

.detail-photo {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e4e7ed;
  transition: all 0.3s ease;
}

.detail-photo:hover {
  border-color: #409eff;
  transform: scale(1.05);
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.total-info {
  color: #606266;
  font-size: 14px;
}

.export-dialog .export-container {
  text-align: center;
  padding: 20px;
}

.export-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

.export-icon {
  font-size: 48px;
  color: #409eff;
  margin-right: 20px;
}

.export-text h3 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 18px;
}

.export-text p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.export-actions {
  display: flex;
  justify-content: center;
}

.path-dialog .path-container,
.template-path-dialog .path-container,
.generate-template-dialog .path-container {
  padding: 20px;
}

.path-form {
  margin-bottom: 30px;
}

.path-input-group {
  display: flex;
  gap: 10px;
}

.path-input {
  flex: 1;
}

.path-select-btn {
  flex-shrink: 0;
}

.path-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 路径选择对话框样式 */
.path-select-dialog .el-message-box__input {
  width: 100%;
}

.path-select-dialog .el-textarea__inner {
  min-height: 80px;
  font-family: 'Courier New', monospace;
}

.detail-photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 32px;
}

.detail-info-section {
  flex: 1;
  min-width: 0;
}

.detail-form-container {
  background: #fafbfc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e4e7ed;
}

.detail-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-form-row {
  display: flex;
  align-items: center;
  min-height: 32px;
}

.detail-form-label {
  font-weight: 600;
  color: #606266;
  min-width: 100px;
  margin-right: 12px;
  font-size: 14px;
}

.detail-form-value {
  color: #303133;
  font-size: 14px;
  flex: 1;
  word-break: break-all;
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
</style>