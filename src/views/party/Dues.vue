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
                    class="form-input"
                  />
                </el-form-item>
                <el-form-item label="性别">
                  <el-select v-model="searchForm.genderId" placeholder="请选择" clearable class="form-input">
                    <el-option v-for="option in genderOptions" :key="option.id" :label="option.name" :value="option.id" />
                  </el-select>
                </el-form-item>
                <el-form-item label="年龄">
                  <el-input
                    v-model.number="searchForm.age"
                    placeholder="请输入年龄"
                    type="number"
                    class="form-input"
                  />
                </el-form-item>
                <el-form-item label="联系电话">
                  <el-input
                    v-model="searchForm.phone"
                    placeholder="请输入联系电话"
                    clearable
                    class="form-input"
                  />
                </el-form-item>
                <el-form-item label="缴纳状态">
                  <el-select v-model="searchForm.statusId" placeholder="请选择" clearable class="form-input">
                    <el-option label="已缴纳" :value="1" />
                    <el-option label="未缴纳" :value="0" />
                  </el-select>
                </el-form-item>
              </div>
            </div>
            
            <!-- 党费信息 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Money /></el-icon>
                <span>党费信息</span>
              </div>
              <div class="form-grid">
                <el-form-item label="缴纳金额范围">
                  <div class="age-range">
                    <el-input
                      v-model.number="searchForm.minAmount"
                      placeholder="最小金额"
                      type="number"
                      class="age-input"
                    />
                    <span class="range-separator">-</span>
                    <el-input
                      v-model.number="searchForm.maxAmount"
                      placeholder="最大金额"
                      type="number"
                      class="age-input"
                    />
                  </div>
                </el-form-item>
              </div>
            </div>
            
            <!-- 时间范围 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Calendar /></el-icon>
                <span>时间范围</span>
              </div>
              <div class="form-grid">
                <el-form-item label="实际缴纳日期">
                  <div class="date-range">
                    <el-date-picker
                      v-model="searchForm.paidDateStart"
                      type="date"
                      placeholder="开始日期"
                      class="date-input"
                    />
                    <span class="range-separator">-</span>
                    <el-date-picker
                      v-model="searchForm.paidDateEnd"
                      type="date"
                      placeholder="结束日期"
                      class="date-input"
                    />
                  </div>
                </el-form-item>
                <el-form-item label="应缴截止日期">
                  <div class="date-range">
                    <el-date-picker
                      v-model="searchForm.dueDateStart"
                      type="date"
                      placeholder="开始日期"
                      class="date-input"
                    />
                    <span class="range-separator">-</span>
                    <el-date-picker
                      v-model="searchForm.dueDateEnd"
                      type="date"
                      placeholder="结束日期"
                      class="date-input"
                    />
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
        <el-button type="primary" @click="handleAddPayment">
          <el-icon><Plus /></el-icon>
          新增缴纳记录
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
      <el-table v-loading="loading" :data="duesData" style="width: 100%">
        <el-table-column prop="id" label="记录ID" width="80" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="age" label="年龄" width="80">
          <template #default="{ row }">
            {{ row.age || '-' }}岁
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.genderLabel }}
          </template>
        </el-table-column>
        <el-table-column prop="idCard" label="身份证号" min-width="180">
          <template #default="{ row }">
            <span class="id-card-text">{{ row.idCard || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" min-width="120">
          <template #default="{ row }">
            {{ row.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="缴纳金额" width="120">
          <template #default="{ row }">
            <span class="amount-text">¥{{ row.amount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="缴纳状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.statusId)">
              {{ row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paidDate" label="实际缴纳日期" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.paidDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="dueDate" label="应缴截止日期" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.dueDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="140">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
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
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑党费缴纳记录' : '新增党费缴纳记录'" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="党员信息" prop="memberId">
          <div class="member-selector">
            <!-- 编辑模式：只读显示当前党员信息 -->
            <div v-if="isEdit" class="readonly-member">
              <!-- 隐藏的输入框用于表单验证 -->
              <el-input v-model="formData.memberId" style="display: none;" />
              <el-input
                :value="selectedMember ? selectedMember.name : ''"
                placeholder="当前党员信息"
                readonly
                class="member-input"
              >
                <template #suffix>
                  <el-icon class="lock-icon"><Lock /></el-icon>
                </template>
              </el-input>
              <div v-if="selectedMember" class="selected-member readonly">
                <div class="member-info">
                  <span class="member-name">{{ selectedMember.name }}</span>
                  <span class="member-details">
                    {{ getGenderLabel(selectedMember.gender) }} · 
                    {{ selectedMember.age }}岁 · 
                    {{ selectedMember.phone }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 新增模式：可搜索选择党员 -->
            <div v-else>
              <el-input
                v-model="memberSearchQuery"
                placeholder="请输入党员姓名进行搜索"
                @input="handleMemberSearch($event)"
                @focus="memberSearchVisible = true"
                class="member-input"
              >
                <template #suffix>
                  <el-icon class="search-icon" @click="memberSearchVisible = true">
                    <Search />
                  </el-icon>
                </template>
              </el-input>
              
              <!-- 已选择的党员信息 -->
              <div v-if="selectedMember && selectedMember.name" class="selected-member">
                <div class="member-info">
                  <span class="member-name">{{ selectedMember.name || '' }}</span>
                  <span class="member-details">
                    {{ getGenderLabel(selectedMember.gender) }} · {{ selectedMember.age || 0 }}岁 · {{ selectedMember.phone || '' }}
                  </span>
                </div>
                <el-button 
                  type="text" 
                  @click="clearMemberSelection"
                  class="clear-btn"
                >
                  清除
                </el-button>
              </div>
              
              <!-- 党员搜索结果下拉 -->
              <div v-if="memberSearchVisible && memberSearchQuery && memberSearchQuery.trim().length >= 1" class="member-search-results">
                <div v-if="memberSearchLoading" class="loading-text">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  搜索中...
                </div>
                <div v-else-if="memberSearchResults.length === 0" class="no-results">
                  未找到相关党员
                </div>
                <div v-else class="search-list">
                  <div 
                    v-for="member in memberSearchResults" 
                    :key="member.id || member.name"
                    class="search-item"
                    @click="selectMember(member)"
                  >
                    <div class="item-info">
                      <span class="item-name">{{ member.name || '' }}</span>
                      <span class="item-details">
                        {{ getGenderLabel(member.gender) }} · {{ member.age || 0 }}岁 · {{ member.phone || '' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
        <div class="form-row">
          <el-form-item label="缴纳金额" prop="amount">
            <el-input v-model.number="formData.amount" placeholder="请输入缴纳金额">
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="实际缴纳日期" prop="paidDate">
            <el-date-picker v-model="formData.paidDate" type="date" placeholder="请选择实际缴纳日期" />
          </el-form-item>
          <el-form-item label="应缴截止日期" prop="dueDate">
            <el-date-picker v-model="formData.dueDate" type="date" placeholder="请选择应缴截止日期" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入党费缴纳记录" width="500px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :on-change="handleImportFileChange"
        :before-upload="beforeUpload"
        accept=".xlsx,.xls"
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
      title="导出党费缴纳记录"
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
            <p>将导出当前筛选条件下的所有党费缴纳记录</p>
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
                readonly
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
                readonly
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
      class="path-dialog"
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

    <!-- 导入结果详情对话框 -->
    <ImportResultDialog
      v-model="importResultDialogVisible"
      :result-data="importResultData"
      @refresh="loadData"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { Search, Plus, Upload, Download, Refresh, ArrowDown, ArrowUp, User, Money, Calendar, Loading, UploadFilled, Document, FolderOpened, InfoFilled, Lock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../store/index.js'
import { partyDuesAPI, partyMemberAPI, dictAPI } from '../../api/api.js'
import { getGenderLabel } from '../../utils/constants.js'
import ImportResultDialog from '../../components/ImportResultDialog.vue'

// 用户状态
const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)

// 计算完整路径
const fullPath = computed(() => {
  if (pathForm.directory && pathForm.filename) {
    const filename = pathForm.filename.endsWith('.xlsx') ? pathForm.filename : `${pathForm.filename}.xlsx`
    return `${pathForm.directory}/${filename}`
  }
  return ''
})

// 表格数据相关
const searchQuery = ref('')
const paymentStatus = ref('')
const paymentDateRange = ref([])
const selectedPeriod = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const duesData = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  age: null,
  genderId: null,
  idCard: '',
  phone: '',
  statusId: null,
  minAmount: null,
  maxAmount: null,
  paidDateStart: null,
  paidDateEnd: null,
  dueDateStart: null,
  dueDateEnd: null
})

// 搜索展开状态
const searchExpanded = ref(false)

// 字典类型映射
const dictTypeList = ref([])
const dictDataMap = ref({})
const fieldToDictTypeMap = {
  genderId: 'gender'
}

// 动态选项数据
const genderOptions = ref([])


// 党员列表（模拟数据）
const members = ref([
  { id: '001', name: '张三' },
  { id: '002', name: '李四' },
  { id: '003', name: '王五' },
  { id: '004', name: '赵六' },
  { id: '005', name: '钱七' },
  { id: '006', name: '孙八' },
  { id: '007', name: '周九' },
  { id: '008', name: '吴十' },
  { id: '009', name: '郑十一' },
  { id: '010', name: '王十二' },
  { id: '011', name: '李十三' },
  { id: '012', name: '张十四' }
])

// 缴纳周期列表
const availablePeriods = ref([
  { id: '2023-q1', name: '2023年第一季度' },
  { id: '2023-q2', name: '2023年第二季度' },
  { id: '2023-q3', name: '2023年第三季度' },
  { id: '2023-q4', name: '2023年第四季度' },
  { id: '2024-q1', name: '2024年第一季度' },
  { id: '2024-q2', name: '2024年第二季度' },
  { id: '2024-q3', name: '2024年第三季度' },
  { id: '2024-q4', name: '2024年第四季度' }
])

// 模拟党费缴纳数据
const mockDuesData = [
  { id: 1, memberId: '001', memberName: '张三', periodId: '2023-q1', periodName: '2023年第一季度', amount: 300, paidAmount: 300, status: 'paid', paymentDate: '2023-03-25', paymentMethod: 'cash', remark: '现金缴纳' },
  { id: 2, memberId: '002', memberName: '李四', periodId: '2023-q1', periodName: '2023年第一季度', amount: 280, paidAmount: 280, status: 'paid', paymentDate: '2023-03-26', paymentMethod: 'transfer', remark: '银行转账' },
  { id: 3, memberId: '003', memberName: '王五', periodId: '2023-q1', periodName: '2023年第一季度', amount: 260, paidAmount: 260, status: 'paid', paymentDate: '2023-03-24', paymentMethod: 'wechat', remark: '微信支付' },
  { id: 4, memberId: '004', memberName: '赵六', periodId: '2023-q1', periodName: '2023年第一季度', amount: 240, paidAmount: 240, status: 'paid', paymentDate: '2023-03-27', paymentMethod: 'alipay', remark: '支付宝支付' },
  { id: 5, memberId: '005', memberName: '钱七', periodId: '2023-q1', periodName: '2023年第一季度', amount: 220, paidAmount: 220, status: 'paid', paymentDate: '2023-03-28', paymentMethod: 'cash', remark: '现金缴纳' },
  { id: 6, memberId: '006', memberName: '孙八', periodId: '2023-q1', periodName: '2023年第一季度', amount: 200, paidAmount: 200, status: 'paid', paymentDate: '2023-03-23', paymentMethod: 'transfer', remark: '银行转账' },
  { id: 7, memberId: '007', memberName: '周九', periodId: '2023-q1', periodName: '2023年第一季度', amount: 180, paidAmount: 0, status: 'unpaid', paymentDate: '', paymentMethod: '', remark: '尚未缴纳' },
  { id: 8, memberId: '008', memberName: '吴十', periodId: '2023-q1', periodName: '2023年第一季度', amount: 160, paidAmount: 0, status: 'unpaid', paymentDate: '', paymentMethod: '', remark: '尚未缴纳' },
  { id: 9, memberId: '009', memberName: '郑十一', periodId: '2023-q2', periodName: '2023年第二季度', amount: 300, paidAmount: 300, status: 'paid', paymentDate: '2023-06-25', paymentMethod: 'wechat', remark: '微信支付' },
  { id: 10, memberId: '010', memberName: '王十二', periodId: '2023-q2', periodName: '2023年第二季度', amount: 280, paidAmount: 280, status: 'paid', paymentDate: '2023-06-26', paymentMethod: 'alipay', remark: '支付宝支付' },
  { id: 11, memberId: '011', memberName: '李十三', periodId: '2023-q2', periodName: '2023年第二季度', amount: 260, paidAmount: 260, status: 'paid', paymentDate: '2023-06-27', paymentMethod: 'cash', remark: '现金缴纳' },
  { id: 12, memberId: '012', memberName: '张十四', periodId: '2023-q2', periodName: '2023年第二季度', amount: 220, paidAmount: 0, status: 'unpaid', paymentDate: '', paymentMethod: '', remark: '尚未缴纳' }
]; // 模拟党费缴纳数据

// 表单相关
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const uploadRef = ref(null)
const submitting = ref(false)

// 批量导入相关
const importLoading = ref(false)
const selectedFile = ref(null)
const importResultDialogVisible = ref(false)
const importResultData = ref({})

// 导出相关
const exportDialogVisible = ref(false)
const exportLoading = ref(false)

// 路径选择相关
const pathDialogVisible = ref(false)
const pathForm = reactive({
  directory: '',
  filename: '',
  sheetName: '党费缴纳记录'
})

// 模板生成相关
const templatePathDialogVisible = ref(false)
const templatePathForm = reactive({
  directory: '',
  filename: '',
  sheetName: '党费缴纳记录'
})

// 党员搜索相关
const memberSearchQuery = ref('')
const memberSearchResults = ref([])
const memberSearchVisible = ref(false)
const memberSearchLoading = ref(false)
const selectedMember = ref(null)
const formData = reactive({
  id: null,
  memberId: null,
  residentId: null,
  idCard: '',           // 身份证号 (String)
  amount: null,         // 缴费金额 (BigDecimal -> Number)
  paidDate: null,       // 实际缴纳日期 (LocalDateTime)
  dueDate: null,        // 应缴截止日期 (LocalDateTime)
  createTime: null
})

// 表单验证规则
const formRules = {
  memberId: [
    { required: true, message: '请选择党员', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入缴费金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '缴费金额必须大于0', trigger: 'blur' }
  ],
  paidDate: [
    { required: true, message: '请选择实际缴纳日期', trigger: 'change' }
  ],
  dueDate: [
    { required: true, message: '请选择应缴截止日期', trigger: 'change' }
  ]
}

// 党员搜索方法
const searchMembers = async (query) => {
  if (!query || query.trim().length < 1) {
    memberSearchResults.value = []
    return
  }

  memberSearchLoading.value = true
  try {
    const response = await partyMemberAPI.getPartyMemberList({
      name: query.trim(),
      pageNum: 1,
      pageSize: 10
    })

    if (response && response.code === 200 && response.data) {
      memberSearchResults.value = response.data.list || []
    } else {
      memberSearchResults.value = []
    }
  } catch (error) {
    console.error('搜索党员失败:', error)
    memberSearchResults.value = []
  } finally {
    memberSearchLoading.value = false
  }
}

const handleMemberSearch = (query) => {
  memberSearchQuery.value = query
  if (query && query.trim().length >= 1) {
    memberSearchVisible.value = true
    searchMembers(query)
  } else {
    memberSearchVisible.value = false
    memberSearchResults.value = []
  }
}

const selectMember = (member) => {
  if (member && member.id) {
    selectedMember.value = member
    formData.memberId = member.id
    formData.residentId = member.residentId
    formData.idCard = member.idCard || ''  // 自动填充身份证号
    memberSearchVisible.value = false
    memberSearchQuery.value = ''
    memberSearchResults.value = []
  }
}

const clearMemberSelection = () => {
  selectedMember.value = null
  formData.memberId = null
  formData.residentId = null
  formData.idCard = ''  // 清除身份证号
  memberSearchQuery.value = ''
  memberSearchResults.value = []
}

// 获取状态标签
const getStatusLabel = (status) => {
  const statusMap = {
    'NORMAL': '正常',
    'OVERDUE': '逾期'
  }
  return statusMap[status] || '未知'
}

// 获取状态标签类型
const getStatusTagType = (statusId) => {
  const typeMap = {
    3: 'success',  // 正常
    4: 'danger'    // 逾期
  }
  return typeMap[statusId] || 'default'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 格式化日期为后端期望的格式 (yyyy-MM-dd HH:mm:ss)
const formatDateForBackend = (date) => {
  if (!date) return null
  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  const seconds = String(dateObj.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 清理搜索表单，只发送有值的字段
const cleanSearchForm = (form) => {
  const cleaned = {}
  Object.keys(form).forEach(key => {
    const value = form[key]
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value
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
        case 'genderId':
          genderOptions.value = dictData.map(item => ({
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
    
    console.log('查询参数:', queryData)
    const response = await partyDuesAPI.getPartyDuesList(queryData)
    if (response.code === 200) {
      const data = response.data
      duesData.value = data.list || []
      total.value = data.total || 0
      
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取党费缴纳记录失败:', error)
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
    if (typeof searchForm[key] === 'number') {
      searchForm[key] = null
    } else {
      searchForm[key] = ''
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

// 新增缴纳记录
const handleAddPayment = () => {
  isEdit.value = false
  // 重置表单
  Object.keys(formData).forEach(key => {
    if (key === 'id' || key === 'createTime') {
      formData[key] = null
    } else if (typeof formData[key] === 'number') {
      formData[key] = null
    } else {
      formData[key] = ''
    }
  })
  // 重置党员搜索
  clearMemberSelection()
  dialogVisible.value = true
}

// 编辑缴纳记录
const handleEdit = async (row) => {
  isEdit.value = true
  
  // 只复制必要的字段
  formData.id = row.id
  formData.memberId = row.memberId
  formData.residentId = row.residentId
  formData.idCard = row.idCard || ''
  formData.amount = row.amount
  formData.createTime = row.createTime
  
  // 处理日期格式 - 后端返回的是 yyyy-MM-dd HH:mm:ss 格式
  if (row.paidDate) {
    try {
      if (typeof row.paidDate === 'string' && row.paidDate.includes(' ')) {
        // 如果是 yyyy-MM-dd HH:mm:ss 格式，直接解析
        formData.paidDate = new Date(row.paidDate)
      } else {
        // 如果是其他格式，尝试解析
        formData.paidDate = new Date(row.paidDate)
      }
    } catch (error) {
      console.error('缴费日期解析错误:', error)
      formData.paidDate = null
    }
  } else {
    formData.paidDate = null
  }
  
  if (row.dueDate) {
    try {
      if (typeof row.dueDate === 'string' && row.dueDate.includes(' ')) {
        // 如果是 yyyy-MM-dd HH:mm:ss 格式，直接解析
        formData.dueDate = new Date(row.dueDate)
      } else {
        // 如果是其他格式，尝试解析
        formData.dueDate = new Date(row.dueDate)
      }
    } catch (error) {
      console.error('应缴日期解析错误:', error)
      formData.dueDate = null
    }
  } else {
    formData.dueDate = null
  }
  
  // 直接使用表格行数据中的党员信息，无需额外请求
  if (row.memberId) {
    // 构造党员信息对象用于显示
    selectedMember.value = {
      id: row.memberId,
      name: row.name || row.memberName || '未知党员',
      gender: row.gender,
      age: row.age,
      phone: row.phone
    }
    memberSearchQuery.value = row.name || row.memberName || ''
  } else {
    // 如果没有党员ID，清空选择
    selectedMember.value = null
    memberSearchQuery.value = ''
  }
  
  dialogVisible.value = true
}


// 删除缴纳记录
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除 "${row.name || row.memberName}" 的党费缴纳记录吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      console.log('删除请求参数:', row.id)
      console.log('删除请求URL:', `/partydues/deletepartydues?id=${row.id}`)
      const response = await partyDuesAPI.deletePartyDues(row.id)
      console.log('删除响应:', response)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        loadData()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      console.error('错误详情:', error.response)
      ElMessage.error(`删除失败: ${error.message || '请稍后重试'}`)
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
    
    submitting.value = true
    
    if (isEdit.value) {
      // 编辑模式 - 发送和新增时相同的字段
      const updateData = {
        id: formData.id,
        memberId: formData.memberId ? Number(formData.memberId) : null,
        residentId: formData.residentId ? Number(formData.residentId) : null,
        idCard: formData.idCard || null,
        amount: formData.amount ? Number(formData.amount) : null,
        paidDate: formData.paidDate ? formatDateForBackend(formData.paidDate) : null,
        dueDate: formData.dueDate ? formatDateForBackend(formData.dueDate) : null
      }
      console.log('编辑请求数据:', updateData)
      console.log('编辑请求URL:', '/partydues/updatepartydues')
      const response = await partyDuesAPI.updatePartyDues(updateData)
      console.log('编辑响应:', response)
      if (response.code === 200) {
        ElMessage.success('编辑成功')
        dialogVisible.value = false
        loadData()
      } else {
        ElMessage.error(response.message || '编辑失败')
      }
    } else {
      // 新增模式 - 只发送后端需要的字段
      const addData = {
        memberId: formData.memberId ? Number(formData.memberId) : null,
        residentId: formData.residentId ? Number(formData.residentId) : null,
        idCard: formData.idCard || null,
        amount: formData.amount ? Number(formData.amount) : null,
        paidDate: formData.paidDate ? formatDateForBackend(formData.paidDate) : null,
        dueDate: formData.dueDate ? formatDateForBackend(formData.dueDate) : null
      }
      console.log('新增请求数据:', addData)
      const response = await partyDuesAPI.addPartyDues(addData)
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
  return false // 阻止自动上传
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
    // 创建FormData对象
    const formData = new FormData()
    formData.append('file', selectedFile.value.raw)
    
    const response = await partyDuesAPI.importPartyDues(formData)
    if (response.code === 200) {
      // 解析导入结果
      importResultData.value = response
      
      // 关闭导入对话框
      importDialogVisible.value = false
      clearSelectedFile()
      
      // 显示导入结果详情对话框
      importResultDialogVisible.value = true
      
      // 如果有成功导入的数据，刷新列表
      if (response.success > 0) {
        loadData()
      }
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
  pathForm.filename = `党费缴纳记录_${timestamp}`
  pathForm.sheetName = '党费缴纳记录'
  pathDialogVisible.value = true
}

const handlePathClose = () => {
  pathDialogVisible.value = false
  pathForm.directory = ''
  pathForm.filename = ''
  pathForm.sheetName = '党费缴纳记录'
}

const handleSelectDirectory = () => {
  // 由于浏览器安全限制，无法直接获取完整路径
  // 我们提供一个更实用的路径选择方案
  showPathInputDialog()
}

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
      return true
    }
  }).then(({ value }) => {
    if (value) {
      // 清理路径，确保格式正确
      let finalPath = value.trim().replace(/\\/g, '/')
      if (!finalPath.endsWith('/')) {
        finalPath += '/'
      }
      // 移除末尾的斜杠（如果只有一个）
      if (finalPath.endsWith('/') && finalPath.length > 3) {
        finalPath = finalPath.slice(0, -1)
      }
      pathForm.directory = finalPath
      ElMessage.success('目录选择成功')
    }
  }).catch(() => {
    // 取消操作
  })
}

const handleFilenameChange = (value) => {
  // 确保文件名不包含非法字符
  const cleanFilename = value.replace(/[<>:"/\\|?*]/g, '_')
  if (cleanFilename !== value) {
    pathForm.filename = cleanFilename
    ElMessage.warning('文件名包含非法字符，已自动替换为下划线')
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
  
  exportLoading.value = true
  try {
    // 生成完整路径
    const filename = pathForm.filename.endsWith('.xlsx') ? pathForm.filename : `${pathForm.filename}.xlsx`
    const fullPath = `${pathForm.directory}/${filename}`
    
    // 构建导出请求数据
    const exportData = {
      exportRequest: {
        savepath: fullPath,
        sheetName: pathForm.sheetName || '党费缴纳记录'
      },
      queryRequest: {
        // 传递当前的筛选条件
        name: searchForm.name || null,
        age: searchForm.age || null,
        genderId: searchForm.genderId || null,
        idCard: searchForm.idCard || null,
        phone: searchForm.phone || null,
        statusId: searchForm.statusId || null,
        minAmount: searchForm.minAmount || null,
        maxAmount: searchForm.maxAmount || null,
        paidDateStart: searchForm.paidDateStart || null,
        paidDateEnd: searchForm.paidDateEnd || null,
        dueDateStart: searchForm.dueDateStart || null,
        dueDateEnd: searchForm.dueDateEnd || null,
        // 导出时使用无限分页
        pageNum: 1,
        pageSize: 999999
      }
    }
    
    const response = await partyDuesAPI.exportPartyDues(exportData)
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
  // 生成带时间戳的文件名
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
  templatePathForm.filename = `党费缴纳记录导入模板_${timestamp}`
  templatePathForm.sheetName = '党费缴纳记录'
  templatePathDialogVisible.value = true
}


const handleTemplatePathClose = () => {
  templatePathDialogVisible.value = false
  templatePathForm.directory = ''
  templatePathForm.filename = ''
  templatePathForm.sheetName = '党费缴纳记录'
}

const handleTemplateFilenameChange = (value) => {
  // 确保文件名不包含非法字符
  const cleanFilename = value.replace(/[<>:"/\\|?*]/g, '_')
  if (cleanFilename !== value) {
    templatePathForm.filename = cleanFilename
    ElMessage.warning('文件名包含非法字符，已自动替换为下划线')
  }
}

const handleSelectTemplateDirectory = () => {
  // 由于浏览器安全限制，无法直接获取完整路径
  // 我们提供一个更实用的路径选择方案
  showTemplatePathInputDialog()
}

const showTemplatePathInputDialog = () => {
  // 创建自定义的模板路径选择对话框
  ElMessageBox({
    title: '选择模板保存目录',
    message: '由于浏览器安全限制，无法直接获取完整路径，请手动输入保存目录的完整路径',
    showCancelButton: true,
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
      // 清理路径，确保格式正确
      let finalPath = value.trim().replace(/\\/g, '/')
      if (!finalPath.endsWith('/')) {
        finalPath += '/'
      }
      // 移除末尾的斜杠（如果只有一个）
      if (finalPath.endsWith('/') && finalPath.length > 3) {
        finalPath = finalPath.slice(0, -1)
      }
      templatePathForm.directory = finalPath
      ElMessage.success('目录选择成功')
    }
  }).catch(() => {
    // 取消操作
  })
}


const handleConfirmTemplateExport = async () => {
  if (!templatePathForm.directory) {
    ElMessage.warning('请选择保存目录')
    return
  }


  exportLoading.value = true
  try {
    // 使用表单中的文件名和工作表名称
    const filename = `${templatePathForm.filename}.xlsx`
    const fullPath = `${templatePathForm.directory}/${filename}`

    // 构建模板生成请求数据
    const templateData = {
      savepath: fullPath,
      sheetName: templatePathForm.sheetName
    }
    
    const response = await partyDuesAPI.generateTemplate(templateData)
    if (response.code === 200) {
      ElMessage.success(`模板文件已导出到：${fullPath}`)
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

// 移除自动搜索监听器，改为手动搜索

// 组件挂载时加载数据
onMounted(async () => {
  await loadAllDictData()
  loadData()
})
</script>

<style scoped>
.party-members-container {
  padding: 20px;
  margin: 0 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
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

.el-table .paid-amount {
  color: #67c23a;
  font-weight: 500;
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

.path-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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


/* 统一路径选择对话框样式 */
.path-dialog .el-dialog {
  max-height: 80vh !important;
  margin: 0 !important;
  border-radius: 8px !important;
  position: fixed !important;
  top: 50% !important;
  left: calc(50% + 120px) !important;
  transform: translate(-50%, -50%) !important;
  z-index: 2000 !important;
}

.path-dialog .el-dialog__body {
  max-height: 60vh !important;
  overflow-y: auto !important;
  padding: 20px !important;
  position: relative !important;
}

.path-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.path-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.path-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.path-input {
  flex: 1;
}

.filename-preview {
  margin-top: 8px;
  padding: 8px 12px;
  background: #e3f2fd;
  border-radius: 4px;
  font-size: 13px;
  color: #1976d2;
  border-left: 3px solid #2196f3;
  word-break: break-all;
}

.path-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.path-actions .el-button {
  min-width: 100px;
  height: 36px;
}

.path-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 6px;
  font-size: 12px;
  color: #409eff;
  border-left: 3px solid #409eff;
}

.path-tips .el-icon {
  font-size: 14px;
}

/* 路径选择对话框样式 */
.path-select-dialog .el-message-box {
  width: 500px !important;
  border-radius: 12px !important;
}

.path-select-dialog .el-message-box__header {
  background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  padding: 20px 24px;
}

.path-select-dialog .el-message-box__title {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.path-select-dialog .el-message-box__headerbtn .el-message-box__close {
  color: white;
  font-size: 20px;
}

.path-select-dialog .el-message-box__content {
  padding: 24px;
  background: #f8f9fa;
}

.path-select-dialog .el-message-box__message {
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.path-select-dialog .el-textarea__inner {
  border-radius: 8px;
  border: 2px solid #e4e7ed;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  padding: 12px;
  transition: all 0.3s ease;
}

.path-select-dialog .el-textarea__inner:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.path-select-dialog .el-message-box__btns {
  padding: 16px 24px 24px;
  background: white;
  border-radius: 0 0 12px 12px;
}

.path-select-dialog .el-button {
  border-radius: 8px;
  font-weight: 500;
  padding: 10px 24px;
}

.path-select-dialog .el-button--primary {
  background: #409eff;
  border-color: #409eff;
}

.path-select-dialog .el-button--primary:hover {
  background: #66b3ff;
  border-color: #66b3ff;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .path-dialog .el-dialog {
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 95% !important;
  }

  .path-input-group {
    flex-direction: column;
    align-items: stretch;
  }

  .path-actions {
    flex-direction: column;
    gap: 8px;
  }

  .path-actions .el-button {
    width: 100%;
  }

  .path-form {
    padding: 16px;
  }

  .path-tips {
    font-size: 11px;
    padding: 6px 10px;
  }
}

/* 工具栏样式 */
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

.toolbar-right {
  display: flex;
  align-items: center;
}

.selected-file {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-file span {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.id-card-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #606266;
}

.amount-text {
  color: #e6a23c;
  font-weight: 500;
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

/* 响应式设计 */
@media (min-width: 1200px) {
  .form-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .form-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .form-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 576px) and (max-width: 767px) {
  .form-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 575px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-input {
  width: 100%;
}

.form-input-wide {
  width: 100%;
  grid-column: 1 / -1;
}

.age-range, .date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.age-input {
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

/* 党员选择器样式 */
.member-selector {
  position: relative;
  width: 100%;
}

.member-input {
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

.lock-icon {
  color: #909399;
  cursor: default;
}

/* 只读模式样式 */
.readonly-member .member-input {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
}

.readonly-member .member-input .el-input__inner {
  background-color: #f5f7fa;
  color: #606266;
  cursor: not-allowed;
}

.selected-member.readonly {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
}

.selected-member.readonly .member-info {
  flex: 1;
}

.selected-member.readonly .member-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  margin-bottom: 4px;
  display: block;
}

.selected-member.readonly .member-details {
  color: #606266;
  font-size: 12px;
  margin-bottom: 2px;
  display: block;
}

.selected-member {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  margin-bottom: 4px;
  display: block;
}

.member-details {
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

.member-search-results {
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
.member-search-results::-webkit-scrollbar {
  width: 6px;
}

.member-search-results::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.member-search-results::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.member-search-results::-webkit-scrollbar-thumb:hover {
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

</style>