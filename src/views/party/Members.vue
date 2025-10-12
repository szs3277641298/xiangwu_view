<template>
  <div class="members-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="search-filters">
        <el-input
          v-model="searchQuery"
          placeholder="请输入姓名"
          clearable
          class="search-input"
          :prefix-icon="Search"
        />
        <el-select v-model="partyStatus" placeholder="党员状态" clearable class="filter-select">
          <el-option label="正式党员" value="formal" />
          <el-option label="预备党员" value="probationary" />
          <el-option label="入党积极分子" value="active" />
          <el-option label="发展对象" value="development" />
        </el-select>
        <el-select v-model="position" placeholder="职务" clearable class="filter-select">
          <el-option label="党支部书记" value="secretary" />
          <el-option label="党支部副书记" value="deputy_secretary" />
          <el-option label="党支部委员" value="committee" />
          <el-option label="普通党员" value="ordinary" />
        </el-select>
        <el-date-picker
          v-model="joinDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="入党日期起"
          end-placeholder="入党日期止"
          class="date-filter"
        />
      </div>
      
      <div v-if="isAdmin" class="toolbar-actions">
        <el-button type="primary" @click="handleAddMember">
          <el-icon><Plus /></el-icon>
          新增党员
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-text">
            <p class="stat-label">党员总数</p>
            <h3 class="stat-value">{{ totalMembers }}</h3>
          </div>
          <div class="stat-icon">
            <el-icon><UserFilled /></el-icon>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-text">
            <p class="stat-label">正式党员</p>
            <h3 class="stat-value formal">{{ formalMembers }}</h3>
          </div>
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-text">
            <p class="stat-label">预备党员</p>
            <h3 class="stat-value probationary">{{ probationaryMembers }}</h3>
          </div>
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-text">
            <p class="stat-label">平均党龄</p>
            <h3 class="stat-value">{{ avgPartyAge }}年</h3>
          </div>
          <div class="stat-icon">
            <el-icon><Clock /></el-icon>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="membersData" style="width: 100%">
        <el-table-column prop="id" label="党员编号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <span>{{ row.gender === 'male' ? '男' : '女' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="status" label="党员状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="职务" width="150">
          <template #default="{ row }">
            <span>{{ getPositionText(row.position) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="joinDate" label="入党日期" width="150" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="address" label="居住地址" show-overflow-tooltip />
        <el-table-column prop="education" label="学历" width="100">
          <template #default="{ row }">
            <span>{{ getEducationText(row.education) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" v-if="isAdmin">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="详情" width="80" fixed="right" v-else>
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">
              查看
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
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑党员信息' : '新增党员信息'" width="800px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <div class="form-row">
          <el-form-item label="党员编号" prop="id">
            <el-input v-model="formData.id" placeholder="请输入党员编号" v-if="isEdit" disabled />
            <el-input v-model="formData.id" placeholder="请输入党员编号" v-else />
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input v-model="formData.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="formData.gender">
              <el-radio label="male">男</el-radio>
              <el-radio label="female">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="年龄" prop="age">
            <el-input v-model.number="formData.age" placeholder="请输入年龄" />
          </el-form-item>
          <el-form-item label="党员状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择党员状态">
              <el-option label="正式党员" value="formal" />
              <el-option label="预备党员" value="probationary" />
              <el-option label="入党积极分子" value="active" />
              <el-option label="发展对象" value="development" />
            </el-select>
          </el-form-item>
          <el-form-item label="职务" prop="position">
            <el-select v-model="formData.position" placeholder="请选择职务" clearable>
              <el-option label="党支部书记" value="secretary" />
              <el-option label="党支部副书记" value="deputy_secretary" />
              <el-option label="党支部委员" value="committee" />
              <el-option label="普通党员" value="ordinary" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="入党日期" prop="joinDate">
            <el-date-picker v-model="formData.joinDate" type="date" placeholder="请选择入党日期" />
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="学历" prop="education">
            <el-select v-model="formData.education" placeholder="请选择学历">
              <el-option label="小学" value="primary" />
              <el-option label="初中" value="junior" />
              <el-option label="高中" value="senior" />
              <el-option label="大专" value="college" />
              <el-option label="本科" value="bachelor" />
              <el-option label="研究生" value="postgraduate" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="居住地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入居住地址" type="textarea" rows="3" />
        </el-form-item>
        <el-form-item label="个人简介" prop="biography">
          <el-input v-model="formData.biography" placeholder="请输入个人简介" type="textarea" rows="4" />
        </el-form-item>
      </el-form>
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
            <span class="detail-label">党员编号：</span>
            <span class="detail-value">{{ selectedMember.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">姓名：</span>
            <span class="detail-value">{{ selectedMember.name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">性别：</span>
            <span class="detail-value">{{ selectedMember.gender === 'male' ? '男' : '女' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">年龄：</span>
            <span class="detail-value">{{ selectedMember.age }}岁</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item">
            <span class="detail-label">党员状态：</span>
            <el-tag :type="getStatusTagType(selectedMember.status)">
              {{ getStatusText(selectedMember.status) }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="detail-label">职务：</span>
            <span class="detail-value">{{ getPositionText(selectedMember.position) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">入党日期：</span>
            <span class="detail-value">{{ selectedMember.joinDate }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">学历：</span>
            <span class="detail-value">{{ getEducationText(selectedMember.education) }}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item full-width">
            <span class="detail-label">联系电话：</span>
            <span class="detail-value">{{ selectedMember.phone }}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item full-width">
            <span class="detail-label">居住地址：</span>
            <span class="detail-value">{{ selectedMember.address }}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item full-width">
            <span class="detail-label">个人简介：</span>
            <div class="detail-value biography">{{ selectedMember.biography || '暂无简介' }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { Search, Plus, Download, UserFilled, User, Clock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../store/index.js'

// 用户状态
const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)

// 表格数据相关
const searchQuery = ref('')
const partyStatus = ref('')
const position = ref('')
const joinDateRange = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const membersData = ref([])

// 统计数据
const totalMembers = ref(0)
const formalMembers = ref(0)
const probationaryMembers = ref(0)
const avgPartyAge = ref(0)

// 模拟党员数据
const mockMembersData = [
  { id: '001', name: '张三', gender: 'male', age: 45, status: 'formal', position: 'secretary', joinDate: '2005-07-01', phone: '13800138001', address: '村东头1号', education: 'bachelor', biography: '现任村党支部书记，负责全面工作。' },
  { id: '002', name: '李四', gender: 'female', age: 42, status: 'formal', position: 'deputy_secretary', joinDate: '2007-08-15', phone: '13900139002', address: '村西头2号', education: 'college', biography: '现任村党支部副书记，负责组织工作。' },
  { id: '003', name: '王五', gender: 'male', age: 50, status: 'formal', position: 'committee', joinDate: '2003-06-10', phone: '13700137003', address: '村南头3号', education: 'senior', biography: '现任村党支部委员，负责宣传工作。' },
  { id: '004', name: '赵六', gender: 'female', age: 38, status: 'formal', position: 'ordinary', joinDate: '2009-05-20', phone: '13600136004', address: '村北头4号', education: 'bachelor', biography: '普通党员，积极参与党组织活动。' },
  { id: '005', name: '钱七', gender: 'male', age: 35, status: 'probationary', position: 'ordinary', joinDate: '2022-03-01', phone: '13500135005', address: '村东头5号', education: 'postgraduate', biography: '预备党员，表现优秀。' },
  { id: '006', name: '孙八', gender: 'male', age: 48, status: 'formal', position: 'ordinary', joinDate: '2001-09-25', phone: '13400134006', address: '村西头6号', education: 'junior', biography: '老党员，在村里有较高威望。' },
  { id: '007', name: '周九', gender: 'female', age: 32, status: 'active', position: null, joinDate: null, phone: '13300133007', address: '村南头7号', education: 'bachelor', biography: '入党积极分子，正在考察期。' },
  { id: '008', name: '吴十', gender: 'male', age: 30, status: 'development', position: null, joinDate: null, phone: '13200132008', address: '村北头8号', education: 'college', biography: '发展对象，即将成为预备党员。' },
  { id: '009', name: '郑十一', gender: 'male', age: 40, status: 'formal', position: 'ordinary', joinDate: '2010-10-10', phone: '13100131009', address: '村东头9号', education: 'senior', biography: '普通党员，积极参与志愿服务。' },
  { id: '010', name: '王十二', gender: 'female', age: 37, status: 'formal', position: 'ordinary', joinDate: '2012-01-15', phone: '13000130010', address: '村西头10号', education: 'bachelor', biography: '普通党员，从事教育工作。' },
  { id: '011', name: '李十三', gender: 'male', age: 55, status: 'formal', position: 'ordinary', joinDate: '1998-05-01', phone: '13800138011', address: '村南头11号', education: 'junior', biography: '老党员，退休干部。' },
  { id: '012', name: '张十四', gender: 'female', age: 28, status: 'probationary', position: 'ordinary', joinDate: '2022-07-01', phone: '13900139012', address: '村北头12号', education: 'postgraduate', biography: '预备党员，大学生村官。' }
]

// 表单相关
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const selectedMember = ref(null)
const formData = reactive({
  id: '',
  name: '',
  gender: 'male',
  age: '',
  status: 'formal',
  position: '',
  joinDate: '',
  phone: '',
  address: '',
  education: 'senior',
  biography: ''
})

// 表单验证规则
const formRules = {
  id: [
    { required: true, message: '请输入党员编号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number', min: 18, max: 120, message: '年龄必须在18-120之间', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择党员状态', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入居住地址', trigger: 'blur' }
  ],
  education: [
    { required: true, message: '请选择学历', trigger: 'change' }
  ]
}

// 获取党员状态文本
const getStatusText = (status) => {
  const statusMap = {
    formal: '正式党员',
    probationary: '预备党员',
    active: '入党积极分子',
    development: '发展对象'
  }
  return statusMap[status] || status
}

// 获取党员状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    formal: 'success',
    probationary: 'primary',
    active: 'info',
    development: 'warning'
  }
  return typeMap[status] || 'default'
}

// 获取职务文本
const getPositionText = (position) => {
  if (!position) return '无'
  const positionMap = {
    secretary: '党支部书记',
    deputy_secretary: '党支部副书记',
    committee: '党支部委员',
    ordinary: '普通党员'
  }
  return positionMap[position] || position
}

// 获取学历文本
const getEducationText = (education) => {
  const educationMap = {
    primary: '小学',
    junior: '初中',
    senior: '高中',
    college: '大专',
    bachelor: '本科',
    postgraduate: '研究生'
  }
  return educationMap[education] || education
}

// 加载数据
const loadData = () => {
  loading.value = true
  
  // 模拟API请求延迟
  setTimeout(() => {
    // 根据搜索条件过滤数据
    let filteredData = [...mockMembersData]
    
    // 搜索过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filteredData = filteredData.filter(item => 
        item.id.toLowerCase().includes(query) || 
        item.name.toLowerCase().includes(query)
      )
    }
    
    // 党员状态过滤
    if (partyStatus.value) {
      filteredData = filteredData.filter(item => item.status === partyStatus.value)
    }
    
    // 职务过滤
    if (position.value) {
      filteredData = filteredData.filter(item => item.position === position.value)
    }
    
    // 入党日期范围过滤
    if (joinDateRange.value && joinDateRange.value.length === 2 && joinDateRange.value[0] && joinDateRange.value[1]) {
      filteredData = filteredData.filter(item => {
        if (!item.joinDate) return false
        const joinDate = new Date(item.joinDate)
        return joinDate >= joinDateRange.value[0] && joinDate <= joinDateRange.value[1]
      })
    }
    
    // 计算统计数据
    totalMembers.value = filteredData.length
    formalMembers.value = filteredData.filter(item => item.status === 'formal').length
    probationaryMembers.value = filteredData.filter(item => item.status === 'probationary').length
    
    // 计算平均党龄
    const currentYear = new Date().getFullYear()
    const partyAges = filteredData
      .filter(item => item.joinDate && item.status !== 'active' && item.status !== 'development')
      .map(item => currentYear - new Date(item.joinDate).getFullYear())
    
    avgPartyAge.value = partyAges.length > 0 
      ? Math.round(partyAges.reduce((sum, age) => sum + age, 0) / partyAges.length)
      : 0
    
    // 分页处理
    total.value = filteredData.length
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    membersData.value = filteredData.slice(startIndex, endIndex)
    
    loading.value = false
  }, 300)
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
const handleAddMember = () => {
  isEdit.value = false
  // 重置表单
  Object.keys(formData).forEach(key => {
    if (key === 'gender') {
      formData[key] = 'male'
    } else if (key === 'status') {
      formData[key] = 'formal'
    } else if (key === 'education') {
      formData[key] = 'senior'
    } else {
      formData[key] = ''
    }
  })
  dialogVisible.value = true
}

// 编辑党员
const handleEdit = (row) => {
  isEdit.value = true
  // 填充表单数据
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 查看党员详情
const handleView = (row) => {
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
  ).then(() => {
    // 模拟删除操作
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 表单验证
    await formRef.value.validate()
    
    // 模拟提交数据
    ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败:', error)
  }
}

// 导出数据
const handleExport = () => {
  // 模拟导出操作
  ElMessage.success('数据导出成功')
}

// 监听搜索条件变化
watch([searchQuery, partyStatus, position, joinDateRange], () => {
  currentPage.value = 1
  loadData()
}, { deep: true })

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.members-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.search-filters {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.filter-select {
  width: 150px;
}

.date-filter {
  width: 260px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-text {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin: 0 0 8px 0;
}

.stat-value {
  font-size: 24px;
  margin: 0;
  font-weight: 600;
  color: #409eff;
}

.stat-value.formal {
  color: #67c23a;
}

.stat-value.probationary {
  color: #e6a23c;
}

.stat-icon {
  font-size: 32px;
  color: #409eff;
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

.detail-value.biography {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}
</style>