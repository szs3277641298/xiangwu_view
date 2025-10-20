<template>
  <div class="structure-container">

    <!-- 暂未开发提示遮罩层 -->
    <div class="unavailable-overlay">
      <div class="unavailable-content">
        <div class="unavailable-icon">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="unavailable-title">页面暂无需求</div>
        <div class="unavailable-subtitle">暂未开发</div>
        <div class="unavailable-description">什么都不能点</div>
      </div>
    </div>
    
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="search-filters">
        <el-select v-model="selectedBranch" placeholder="选择党支部" clearable class="filter-select">
          <el-option label="全部党支部" value="" />
          <el-option label="村党支部" value="village" />
          <el-option label="社区党支部" value="community" />
          <el-option label="企业党支部" value="enterprise" />
        </el-select>
        <el-date-picker
          v-model="statDate"
          type="date"
          placeholder="统计日期"
          value-format="YYYY-MM-DD"
          class="date-filter"
        />
      </div>
      
      <div class="toolbar-actions" v-if="userStore.isAdmin">
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出报表
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
            <el-icon><User /></el-icon>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-text">
            <p class="stat-label">正式党员</p>
            <h3 class="stat-value">{{ formalMembers }}</h3>
          </div>
          <div class="stat-icon">
            <el-icon><UserFilled /></el-icon>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-text">
            <p class="stat-label">预备党员</p>
            <h3 class="stat-value">{{ probationaryMembers }}</h3>
          </div>
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-text">
            <p class="stat-label">党小组数量</p>
            <h3 class="stat-value">{{ partyGroups }}</h3>
          </div>
          <div class="stat-icon">
            <el-icon><OfficeBuilding /></el-icon>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-text">
            <p class="stat-label">平均党龄</p>
            <h3 class="stat-value">{{ averagePartyAge.toFixed(1) }}年</h3>
          </div>
          <div class="stat-icon">
            <el-icon><Calendar /></el-icon>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-text">
            <p class="stat-label">入党积极分子</p>
            <h3 class="stat-value">{{ activists }}</h3>
          </div>
          <div class="stat-icon">
            <el-icon><Star /></el-icon>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 内容区域 -->
    <div class="content-section">
      <!-- 组织结构图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>党组织结构图</span>
          </div>
        </template>
        <div class="org-chart-container">
          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div v-else class="org-chart">
            <!-- 简化版组织结构图展示 -->
            <div class="org-level-1">
              <div class="org-node">
                <div class="node-title">中国共产党村委会支部委员会</div>
                <div class="node-stats">党员总数：{{ totalMembers }}</div>
              </div>
            </div>
            
            <div class="org-level-2">
              <div class="org-node" v-for="(branch, index) in branches" :key="index">
                <div class="node-title">{{ branch.name }}</div>
                <div class="node-stats">党员：{{ branch.memberCount }}人</div>
                <div class="node-stats">负责人：{{ branch.leader }}</div>
              </div>
            </div>
            
            <div class="org-level-3">
              <div class="org-node small" v-for="(group, index) in partyGroupStats" :key="index">
                <div class="node-title">{{ group.name }}</div>
                <div class="node-stats">{{ group.memberCount }}人</div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 统计图表 -->
      <div class="charts-grid">
        <!-- 党员年龄分布 -->
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>党员年龄分布</span>
            </div>
          </template>
          <div class="chart-container">
            <div v-if="loading" class="loading-container">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
            <div v-else>
              <el-table :data="ageDistributionData" border style="width: 100%">
                <el-table-column prop="ageRange" label="年龄段" width="120" />
                <el-table-column prop="count" label="人数" width="80" />
                <el-table-column prop="percentage" label="占比" width="100">
                  <template #default="{ row }">
                    <el-progress :percentage="row.percentage" :text-inside="true" :stroke-width="20" />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-card>
        
        <!-- 党员性别分布 -->
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>党员性别分布</span>
            </div>
          </template>
          <div class="chart-container">
            <div v-if="loading" class="loading-container">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
            <div v-else>
              <el-table :data="genderDistributionData" border style="width: 100%">
                <el-table-column prop="gender" label="性别" width="100" />
                <el-table-column prop="count" label="人数" width="100" />
                <el-table-column prop="percentage" label="占比" width="100">
                  <template #default="{ row }">
                    <el-progress :percentage="row.percentage" :text-inside="true" :stroke-width="20" />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-card>
        
        <!-- 党员学历分布 -->
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>党员学历分布</span>
            </div>
          </template>
          <div class="chart-container">
            <div v-if="loading" class="loading-container">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
            <div v-else>
              <el-table :data="educationDistributionData" border style="width: 100%">
                <el-table-column prop="education" label="学历" width="120" />
                <el-table-column prop="count" label="人数" width="80" />
                <el-table-column prop="percentage" label="占比" width="100">
                  <template #default="{ row }">
                    <el-progress :percentage="row.percentage" :text-inside="true" :stroke-width="20" />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-card>
        
        <!-- 党员职务分布 -->
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>党员职务分布</span>
            </div>
          </template>
          <div class="chart-container">
            <div v-if="loading" class="loading-container">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
            <div v-else>
              <el-table :data="positionDistributionData" border style="width: 100%">
                <el-table-column prop="position" label="职务" width="150" />
                <el-table-column prop="count" label="人数" width="80" />
                <el-table-column prop="percentage" label="占比" width="100">
                  <template #default="{ row }">
                    <el-progress :percentage="row.percentage" :text-inside="true" :stroke-width="20" />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 党小组统计表格 -->
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <span>党小组详细统计</span>
          </div>
        </template>
        <el-table v-loading="loading" :data="partyGroupStats" border style="width: 100%">
          <el-table-column prop="id" label="小组编号" width="100" />
          <el-table-column prop="name" label="党小组名称" width="180" />
          <el-table-column prop="branch" label="所属党支部" width="150" />
          <el-table-column prop="memberCount" label="党员总数" width="100" />
          <el-table-column prop="formalCount" label="正式党员" width="100" />
          <el-table-column prop="probationaryCount" label="预备党员" width="100" />
          <el-table-column prop="averageAge" label="平均年龄" width="100">
            <template #default="{ row }">
              {{ row.averageAge.toFixed(1) }}
            </template>
          </el-table-column>
          <el-table-column prop="averagePartyAge" label="平均党龄" width="100">
            <template #default="{ row }">
              {{ row.averagePartyAge.toFixed(1) }}年
            </template>
          </el-table-column>
          <el-table-column prop="leader" label="组长" width="120" />
          <el-table-column prop="contact" label="联系方式" width="150" />
          <el-table-column label="操作" width="150" v-if="userStore.isAdmin">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleViewGroup(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    
    <!-- 党小组详情对话框 -->
    <el-dialog 
      v-model="groupDetailVisible" 
      title="党小组详情"
      width="800px"
      :close-on-click-modal="false"
      :center="true"
    >
      <div v-if="selectedGroup" class="group-detail">
        <div class="detail-header">
          <h3>{{ selectedGroup.name }}</h3>
          <p>所属党支部：{{ selectedGroup.branch }}</p>
        </div>
        
        <div class="detail-stats">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-item">
                <span class="stat-label">党员总数</span>
                <span class="stat-value">{{ selectedGroup.memberCount }}</span>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <span class="stat-label">正式党员</span>
                <span class="stat-value">{{ selectedGroup.formalCount }}</span>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <span class="stat-label">预备党员</span>
                <span class="stat-value">{{ selectedGroup.probationaryCount }}</span>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <span class="stat-label">平均年龄</span>
                <span class="stat-value">{{ selectedGroup.averageAge.toFixed(1) }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div class="detail-info">
          <el-descriptions title="小组信息" :column="1" border>
            <el-descriptions-item label="组长">{{ selectedGroup.leader }}</el-descriptions-item>
            <el-descriptions-item label="联系方式">{{ selectedGroup.contact }}</el-descriptions-item>
            <el-descriptions-item label="成立时间">{{ selectedGroup.establishmentDate }}</el-descriptions-item>
            <el-descriptions-item label="活动地点">{{ selectedGroup.activityLocation }}</el-descriptions-item>
            <el-descriptions-item label="活动频率">{{ selectedGroup.activityFrequency }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ selectedGroup.remark || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="detail-members">
          <h4>党员列表</h4>
          <el-table :data="selectedGroup.members" border style="width: 100%" class="members-table">
            <el-table-column prop="id" label="党员编号" width="100" />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="gender" label="性别" width="80" />
            <el-table-column prop="age" label="年龄" width="80" />
            <el-table-column prop="partyAge" label="党龄" width="80">
              <template #default="{ row }">
                {{ row.partyAge }}年
              </template>
            </el-table-column>
            <el-table-column prop="position" label="职务" width="120" />
          </el-table>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="groupDetailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { User, UserFilled, OfficeBuilding, Calendar, Star, Refresh, Download, Loading, Warning } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../store/index.js'

// 用户状态
const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)

// 过滤条件
const selectedBranch = ref('')
const statDate = ref(new Date().toISOString().split('T')[0])
const loading = ref(false)
const expandedRows = ref([])

// 统计数据
const totalMembers = ref(0)
const formalMembers = ref(0)
const probationaryMembers = ref(0)
const partyGroups = ref(0)
const averagePartyAge = ref(0)
const activists = ref(0)

// 党支部数据
const branches = ref([
  { name: '村党支部', memberCount: 45, leader: '张三' },
  { name: '社区党支部', memberCount: 32, leader: '李四' },
  { name: '企业党支部', memberCount: 18, leader: '王五' }
])

// 党小组统计数据
const partyGroupStats = ref([])

// 分布统计数据
const ageDistributionData = ref([])
const genderDistributionData = ref([])
const educationDistributionData = ref([])
const positionDistributionData = ref([])

// 对话框相关
const groupDetailVisible = ref(false)
const selectedGroup = ref(null)

// 模拟数据生成
const generateMockData = () => {
  // 党小组数据
  const groups = [
    { id: '001', name: '第一党小组', branch: '村党支部', memberCount: 15, formalCount: 13, probationaryCount: 2, averageAge: 48.5, averagePartyAge: 12.3, leader: '赵六', contact: '13800138001', establishmentDate: '2010-01-15', activityLocation: '村委会会议室', activityFrequency: '每月一次', remark: '' },
    { id: '002', name: '第二党小组', branch: '村党支部', memberCount: 15, formalCount: 14, probationaryCount: 1, averageAge: 42.8, averagePartyAge: 10.5, leader: '孙七', contact: '13800138002', establishmentDate: '2010-01-15', activityLocation: '村文化中心', activityFrequency: '每月一次', remark: '' },
    { id: '003', name: '第三党小组', branch: '村党支部', memberCount: 15, formalCount: 15, probationaryCount: 0, averageAge: 52.1, averagePartyAge: 15.7, leader: '周八', contact: '13800138003', establishmentDate: '2010-01-15', activityLocation: '村老年活动中心', activityFrequency: '每月一次', remark: '' },
    { id: '004', name: '社区第一党小组', branch: '社区党支部', memberCount: 10, formalCount: 9, probationaryCount: 1, averageAge: 45.3, averagePartyAge: 11.2, leader: '吴九', contact: '13800138004', establishmentDate: '2012-03-20', activityLocation: '社区服务中心', activityFrequency: '每月两次', remark: '' },
    { id: '005', name: '社区第二党小组', branch: '社区党支部', memberCount: 11, formalCount: 10, probationaryCount: 1, averageAge: 41.6, averagePartyAge: 9.8, leader: '郑十', contact: '13800138005', establishmentDate: '2012-03-20', activityLocation: '社区文化广场', activityFrequency: '每月两次', remark: '' },
    { id: '006', name: '社区第三党小组', branch: '社区党支部', memberCount: 11, formalCount: 9, probationaryCount: 2, averageAge: 43.9, averagePartyAge: 10.4, leader: '钱十一', contact: '13800138006', establishmentDate: '2012-03-20', activityLocation: '社区老年公寓', activityFrequency: '每月两次', remark: '' },
    { id: '007', name: '企业第一党小组', branch: '企业党支部', memberCount: 9, formalCount: 8, probationaryCount: 1, averageAge: 38.2, averagePartyAge: 8.5, leader: '孙十二', contact: '13800138007', establishmentDate: '2015-06-10', activityLocation: '企业会议室', activityFrequency: '每周一次', remark: '' },
    { id: '008', name: '企业第二党小组', branch: '企业党支部', memberCount: 9, formalCount: 8, probationaryCount: 1, averageAge: 37.5, averagePartyAge: 7.9, leader: '李十三', contact: '13800138008', establishmentDate: '2015-06-10', activityLocation: '企业党员活动室', activityFrequency: '每周一次', remark: '' }
  ]
  
  // 为每个党小组添加模拟党员数据
  groups.forEach(group => {
    group.members = []
    for (let i = 1; i <= group.memberCount; i++) {
      const isFormal = i <= group.formalCount
      const partyAge = isFormal ? Math.floor(Math.random() * 20) + 3 : 0
      group.members.push({
        id: `${group.id}-${String(i).padStart(2, '0')}`,
        name: `党员${i}`,
        gender: Math.random() > 0.3 ? '男' : '女',
        age: Math.floor(Math.random() * 30) + 30,
        partyAge: partyAge,
        position: i === 1 ? '组长' : i === 2 ? '副组长' : '成员'
      })
    }
  })
  
  // 更新党小组统计数据
  partyGroupStats.value = groups
  
  // 计算总统计数据
  totalMembers.value = groups.reduce((sum, group) => sum + group.memberCount, 0)
  formalMembers.value = groups.reduce((sum, group) => sum + group.formalCount, 0)
  probationaryMembers.value = groups.reduce((sum, group) => sum + group.probationaryCount, 0)
  partyGroups.value = groups.length
  
  // 计算平均党龄
  const totalPartyAge = groups.reduce((sum, group) => sum + (group.averagePartyAge * group.formalCount), 0)
  averagePartyAge.value = formalMembers.value > 0 ? totalPartyAge / formalMembers.value : 0
  
  // 入党积极分子数量
  activists.value = Math.floor(totalMembers.value * 0.2)
  
  // 生成分布统计数据
  ageDistributionData.value = [
    { ageRange: '30岁以下', count: Math.floor(totalMembers.value * 0.15), percentage: 15 },
    { ageRange: '30-40岁', count: Math.floor(totalMembers.value * 0.25), percentage: 25 },
    { ageRange: '40-50岁', count: Math.floor(totalMembers.value * 0.3), percentage: 30 },
    { ageRange: '50-60岁', count: Math.floor(totalMembers.value * 0.2), percentage: 20 },
    { ageRange: '60岁以上', count: Math.floor(totalMembers.value * 0.1), percentage: 10 }
  ]
  
  genderDistributionData.value = [
    { gender: '男', count: Math.floor(totalMembers.value * 0.7), percentage: 70 },
    { gender: '女', count: Math.floor(totalMembers.value * 0.3), percentage: 30 }
  ]
  
  educationDistributionData.value = [
    { education: '大专及以下', count: Math.floor(totalMembers.value * 0.4), percentage: 40 },
    { education: '本科', count: Math.floor(totalMembers.value * 0.45), percentage: 45 },
    { education: '硕士', count: Math.floor(totalMembers.value * 0.1), percentage: 10 },
    { education: '博士及以上', count: Math.floor(totalMembers.value * 0.05), percentage: 5 }
  ]
  
  positionDistributionData.value = [
    { position: '村/社区干部', count: Math.floor(totalMembers.value * 0.2), percentage: 20 },
    { position: '党小组长', count: groups.length, percentage: (groups.length / totalMembers.value) * 100 },
    { position: '普通党员', count: Math.floor(totalMembers.value * 0.7), percentage: 70 },
    { position: '入党积极分子', count: activists.value, percentage: (activists.value / (totalMembers.value + activists.value)) * 100 }
  ]
}

// 加载数据
const loadData = () => {
  loading.value = true
  
  // 模拟API请求延迟
  setTimeout(() => {
    generateMockData()
    
    // 根据选择的党支部过滤数据
    if (selectedBranch.value) {
      const filteredGroups = partyGroupStats.value.filter(group => group.branch.includes(selectedBranch.value === 'village' ? '村' : selectedBranch.value === 'community' ? '社区' : '企业'))
      
      // 重新计算统计数据
      totalMembers.value = filteredGroups.reduce((sum, group) => sum + group.memberCount, 0)
      formalMembers.value = filteredGroups.reduce((sum, group) => sum + group.formalCount, 0)
      probationaryMembers.value = filteredGroups.reduce((sum, group) => sum + group.probationaryCount, 0)
      partyGroups.value = filteredGroups.length
      
      // 重新计算平均党龄
      const totalPartyAge = filteredGroups.reduce((sum, group) => sum + (group.averagePartyAge * group.formalCount), 0)
      averagePartyAge.value = formalMembers.value > 0 ? totalPartyAge / formalMembers.value : 0
    }
    
    loading.value = false
  }, 800)
}

// 查看党小组详情
const handleViewGroup = (row) => {
  selectedGroup.value = { ...row }
  groupDetailVisible.value = true
}

// 刷新数据
const handleRefresh = () => {
  loadData()
  ElMessage.success('数据已刷新')
}

// 导出报表
const handleExport = () => {
  // 模拟导出操作
  ElMessage.success('报表导出成功')
}

// 展开全部
const expandAll = () => {
  expandedRows.value = partyGroupStats.value.map(row => row.id)
}

// 收起全部
const collapseAll = () => {
  expandedRows.value = []
}

// 监听过滤条件变化
watch([selectedBranch, statDate], () => {
  loadData()
})

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.structure-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.page-header {
  margin-bottom: 20px;
  opacity: 0.3;
  pointer-events: none;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #9ca3af;
}

.page-header p {
  margin: 0;
  font-size: 14px;
  color: #d1d5db;
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

.filter-select {
  width: 180px;
}

.date-filter {
  width: 200px;
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

.stat-icon {
  font-size: 32px;
  color: #409eff;
}

.content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.org-chart-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.loading-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.org-chart {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 20px;
}

.org-level-1,
.org-level-2,
.org-level-3 {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.org-node {
  background: #f0f9ff;
  border: 1px solid #409eff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  min-width: 250px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.org-node.small {
  min-width: 150px;
  padding: 15px;
}

.node-title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
}

.node-stats {
  font-size: 14px;
  color: #606266;
  margin: 4px 0;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.group-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-header {
  text-align: center;
  margin-bottom: 30px;
}

.detail-header h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
}

.detail-header p {
  margin: 0;
  color: #606266;
}

.detail-stats {
  margin-bottom: 30px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
}

.stat-item .stat-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.stat-item .stat-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}

.detail-info {
  margin-bottom: 30px;
}

.detail-members h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
}

/* 暂未开发提示遮罩层样式 */
.unavailable-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  backdrop-filter: blur(3px);
  overflow: hidden;
  animation: none !important;
}

.unavailable-content {
  text-align: center;
  padding: 50px 40px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.98);
  border: 2px solid #e5e7eb;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 90vw;
  min-width: 320px;
  animation: none !important;
}

.unavailable-icon {
  margin: 0 auto 24px;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.unavailable-icon .el-icon {
  font-size: 36px;
  color: #d97706;
  animation: none !important;
}

.unavailable-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.unavailable-subtitle {
  font-size: 18px;
  color: #4b5563;
  margin-bottom: 14px;
  font-weight: 500;
}

.unavailable-description {
  font-size: 15px;
  color: #6b7280;
  font-style: italic;
  opacity: 0.8;
}

/* 禁用所有按钮和交互元素 */
.structure-container :deep(.el-button) {
  pointer-events: none !important;
  opacity: 0.4 !important;
  cursor: not-allowed !important;
}

.structure-container :deep(.el-select) {
  pointer-events: none !important;
  opacity: 0.4 !important;
}

.structure-container :deep(.el-date-editor) {
  pointer-events: none !important;
  opacity: 0.4 !important;
}

.structure-container :deep(.el-table) {
  pointer-events: none !important;
  opacity: 0.4 !important;
}

.structure-container :deep(.el-pagination) {
  pointer-events: none !important;
  opacity: 0.4 !important;
}

.structure-container :deep(.el-card) {
  opacity: 0.3 !important;
  pointer-events: none !important;
}

/* 确保所有文本内容都可见但不可交互 */
.structure-container :deep(*) {
  user-select: none !important;
  animation: none !important;
  transition: none !important;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .charts-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select,
  .date-filter,
  .search-input {
    width: 100%;
  }

  .toolbar-actions {
    justify-content: center;
  }

  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .org-node {
    min-width: 180px;
    padding: 15px;
  }

  .org-node.small {
    min-width: 120px;
    padding: 10px;
  }

  .node-title {
    font-size: 14px;
  }

  .node-stats {
    font-size: 12px;
  }
}
</style>