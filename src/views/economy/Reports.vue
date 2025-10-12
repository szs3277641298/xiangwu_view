<template>
  <div class="reports-container">
    <!-- 页面标题和权限提示 -->
    <div class="page-header">
      <h2>收益统计报表</h2>
      <el-tag type="warning" v-if="!isAdmin">访客模式下无法查看完整报表数据</el-tag>
    </div>
    
    <!-- 筛选工具栏 -->
    <div class="toolbar">
      <div class="report-type-selector">
        <el-radio-group v-model="reportType" @change="handleReportTypeChange">
          <el-radio-button label="month">月度报表</el-radio-button>
          <el-radio-button label="quarter">季度报表</el-radio-button>
          <el-radio-button label="year">年度报表</el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="date-selector">
        <el-select v-model="selectedYear" placeholder="选择年份" @change="loadReportData" v-if="reportType !== 'year'">
          <el-option v-for="year in availableYears" :key="year" :label="year + '年'" :value="year" />
        </el-select>
        <el-select v-model="selectedQuarter" placeholder="选择季度" @change="loadReportData" v-if="reportType === 'quarter'">
          <el-option label="第一季度" value="1" />
          <el-option label="第二季度" value="2" />
          <el-option label="第三季度" value="3" />
          <el-option label="第四季度" value="4" />
        </el-select>
        <el-select v-model="selectedMonth" placeholder="选择月份" @change="loadReportData" v-if="reportType === 'month'">
          <el-option v-for="month in 12" :key="month" :label="month + '月'" :value="month" />
        </el-select>
      </div>
      
      <div class="toolbar-actions" v-if="isAdmin">
        <el-button type="primary" @click="generatePDF">
          <el-icon><Download /></el-icon>
          导出PDF
        </el-button>
        <el-button @click="generateExcel">
          <el-icon><Document /></el-icon>
          导出Excel
        </el-button>
      </div>
    </div>
    
    <!-- 核心数据概览 -->
    <div class="summary-cards">
      <el-card class="summary-card">
        <div class="summary-content">
          <div class="summary-text">
            <p class="summary-label">总收益</p>
            <h3 class="summary-value">¥{{ totalIncome.toLocaleString() }}</h3>
            <p class="summary-change" :class="incomeChangeType">
              <el-icon v-if="incomeChangeType === 'increase'"><Minus /></el-icon>
              <el-icon v-else-if="incomeChangeType === 'decrease'" class="decrease"><Minus /></el-icon>
              <el-icon v-else><Minus /></el-icon>
              {{ incomeChange }}% 较上期
            </p>
          </div>
        </div>
      </el-card>
      
      <el-card class="summary-card">
        <div class="summary-content">
          <div class="summary-text">
            <p class="summary-label">净利润率</p>
            <h3 class="summary-value">{{ profitMargin.toFixed(2) }}%</h3>
            <p class="summary-change" :class="marginChangeType">
              <el-icon v-if="marginChangeType === 'increase'" class="increase"><Minus /></el-icon>
              <el-icon v-else-if="marginChangeType === 'decrease'" class="decrease"><Minus /></el-icon>
              <el-icon v-else><Minus /></el-icon>
              {{ marginChange.toFixed(2) }}% 较上期
            </p>
          </div>
        </div>
      </el-card>
      
      <el-card class="summary-card">
        <div class="summary-content">
          <div class="summary-text">
            <p class="summary-label">项目数量</p>
            <h3 class="summary-value">{{ projectCount }}</h3>
            <p class="summary-label">平均收益</p>
            <h3 class="summary-value">¥{{ avgProjectIncome.toLocaleString() }}</h3>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 收益趋势图表 -->
    <div class="charts-section">
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>收益趋势分析</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="incomeTrendChart" class="chart" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>
      
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>项目收益占比</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="projectPieChart" class="chart" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>
    </div>
    
    <!-- 项目收益明细表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>项目收益明细</span>
        </div>
      </template>
      <el-table v-loading="loading" :data="projectDetails" style="width: 100%">
        <el-table-column prop="projectName" label="项目名称" width="200" />
        <el-table-column prop="income" label="收益金额" width="150" :formatter="formatCurrency">
          <template #default="{ row }">
            <span class="income-amount">¥{{ row.income.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="成本支出" width="150" :formatter="formatCurrency">
          <template #default="{ row }">
            <span class="cost-amount">¥{{ row.cost.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="profit" label="净利润" width="150" :formatter="formatCurrency">
          <template #default="{ row }">
            <span class="profit-amount">¥{{ row.profit.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="profitRate" label="利润率" width="100">
          <template #default="{ row }">
            <span>{{ row.profitRate.toFixed(2) }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="contribution" label="贡献占比" width="100">
          <template #default="{ row }">
            <span>{{ row.contribution.toFixed(2) }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" v-if="isAdmin">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewProjectDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 收支明细弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="项目收支明细" width="800px">
      <div v-if="selectedProject">
        <h3>{{ selectedProject.projectName }}</h3>
        <div class="detail-section">
          <h4>收支明细</h4>
          <el-table :data="selectedProject.transactions" style="width: 100%">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="type" label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="row.type === 'income' ? 'success' : 'danger'">
                  {{ row.type === 'income' ? '收入' : '支出' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="100">
              <template #default="{ row }">
                <span :class="row.type === 'income' ? 'income' : 'expense'">
                  {{ row.type === 'income' ? '+' : '-' }}{{ formatCurrency(row, null, row.amount) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" />
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Download, Document, Minus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../store/index.js'
// 使用全局的echarts对象（通过CDN引入）
// @ts-ignore
const echarts = window.echarts

// 用户状态
const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)

// 报表配置
const reportType = ref('month') // month, quarter, year
const selectedYear = ref(new Date().getFullYear())
const selectedQuarter = ref(Math.ceil((new Date().getMonth() + 1) / 3))
const selectedMonth = ref(new Date().getMonth() + 1)
const availableYears = [2021, 2022, 2023, 2024]

// 数据状态
const loading = ref(false)
const totalIncome = ref(0)
const totalCost = ref(0)
const profitMargin = ref(0)
const projectCount = ref(0)
const avgProjectIncome = ref(0)
const incomeChange = ref(0)
const incomeChangeType = ref('stable') // increase, decrease, stable
const marginChange = ref(0)
const marginChangeType = ref('stable')
const projectDetails = ref([])

// 图表实例
const incomeTrendChart = ref(null)
const projectPieChart = ref(null)
let trendChartInstance = null
let pieChartInstance = null

// 详情弹窗
const detailDialogVisible = ref(false)
const selectedProject = ref(null)

// 模拟数据
const generateMockData = () => {
  // 模拟的项目数据
  const projects = [
    { id: 1, name: '有机蔬菜种植基地' },
    { id: 2, name: '生态养鸡场' },
    { id: 3, name: '农产品加工厂' },
    { id: 4, name: '乡村旅游民宿' },
    { id: 5, name: '集体商铺租赁' },
    { id: 6, name: '光伏电站建设' }
  ]
  
  // 根据报表类型生成数据
  let periodData = []
  let months = []
  
  if (reportType.value === 'year') {
    // 年度数据 - 生成最近几年的数据
    months = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 4 + i))
    periodData = months.map(year => {
      const yearIncome = Math.floor(Math.random() * 300000) + 200000 // 20-50万
      const yearCost = Math.floor(yearIncome * (0.4 + Math.random() * 0.2)) // 40-60%成本
      return {
        period: `${year}年`,
        income: yearIncome,
        cost: yearCost,
        profit: yearIncome - yearCost
      }
    })
  } else if (reportType.value === 'quarter') {
    // 季度数据 - 生成四个季度
    months = [1, 2, 3, 4].map(q => `第${q}季度`)
    periodData = months.map((quarter, index) => {
      const quarterIncome = Math.floor(Math.random() * 100000) + 50000 // 5-15万
      const quarterCost = Math.floor(quarterIncome * (0.4 + Math.random() * 0.2)) // 40-60%成本
      return {
        period: quarter,
        income: quarterIncome,
        cost: quarterCost,
        profit: quarterIncome - quarterCost
      }
    })
  } else {
    // 月度数据 - 生成12个月
    months = Array.from({ length: 12 }, (_, i) => `${i + 1}月`)
    periodData = months.map((month, index) => {
      const monthIncome = Math.floor(Math.random() * 50000) + 20000 // 2-7万
      const monthCost = Math.floor(monthIncome * (0.4 + Math.random() * 0.2)) // 40-60%成本
      return {
        period: month,
        income: monthIncome,
        cost: monthCost,
        profit: monthIncome - monthCost
      }
    })
  }
  
  // 生成项目详情
  const projectData = projects.map(project => {
    const income = Math.floor(Math.random() * 100000) + 50000 // 5-15万
    const cost = Math.floor(income * (0.4 + Math.random() * 0.2)) // 40-60%成本
    const profit = income - cost
    const profitRate = (profit / income) * 100
    return {
      projectId: project.id,
      projectName: project.name,
      income,
      cost,
      profit,
      profitRate,
      contribution: 0, // 临时设置为0，后续计算
      // 生成该项目的交易明细
      transactions: Array.from({ length: 5 + Math.floor(Math.random() * 5) }, (_, i) => {
        const isIncome = Math.random() > 0.3
        const amount = isIncome 
          ? Math.floor(Math.random() * 30000) + 10000 // 1-4万收入
          : Math.floor(Math.random() * 15000) + 5000 // 0.5-2万支出
        
        const month = Math.floor(Math.random() * 12) + 1
        const day = Math.floor(Math.random() * 28) + 1
        const date = `${selectedYear.value}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        
        return {
          id: i + 1,
          date,
          type: isIncome ? 'income' : 'expense',
          amount,
          description: isIncome ? `${project.name}销售收入` : `${project.name}成本支出`
        }
      })
    }
  })
  
  // 计算贡献占比
  const totalProfit = projectData.reduce((sum, p) => sum + p.profit, 0)
  projectData.forEach(project => {
    project.contribution = (project.profit / totalProfit) * 100
  })
  
  return {
    periodData,
    projectData
  }
}

// 加载报表数据
const loadReportData = () => {
  loading.value = true
  
  // 模拟API请求延迟
  setTimeout(() => {
    const mockData = generateMockData()
    
    // 计算核心指标
    const totalProfit = mockData.projectData.reduce((sum, p) => sum + p.profit, 0)
    totalIncome.value = mockData.projectData.reduce((sum, p) => sum + p.income, 0)
    totalCost.value = mockData.projectData.reduce((sum, p) => sum + p.cost, 0)
    profitMargin.value = totalIncome.value > 0 ? (totalProfit / totalIncome.value) * 100 : 0
    projectCount.value = mockData.projectData.length
    avgProjectIncome.value = projectCount.value > 0 ? totalIncome.value / projectCount.value : 0
    
    // 计算同比变化（模拟值）
    const mockPrevPeriodIncome = Math.floor(totalIncome.value * (0.9 + Math.random() * 0.2))
    const mockPrevPeriodMargin = Math.floor(profitMargin.value * (0.9 + Math.random() * 0.2))
    
    incomeChange.value = totalIncome.value > 0 ? ((totalIncome.value - mockPrevPeriodIncome) / mockPrevPeriodIncome) * 100 : 0
    incomeChangeType.value = incomeChange.value > 0 ? 'increase' : incomeChange.value < 0 ? 'decrease' : 'stable'
    
    marginChange.value = profitMargin.value - mockPrevPeriodMargin
    marginChangeType.value = marginChange.value > 0 ? 'increase' : marginChange.value < 0 ? 'decrease' : 'stable'
    
    // 设置项目详情
    projectDetails.value = mockData.projectData
    
    // 更新图表
    updateCharts(mockData)
    
    loading.value = false
  }, 800)
}

// 更新图表
const updateCharts = (mockData) => {
  nextTick(() => {
    // 更新趋势图
    if (incomeTrendChart.value && !trendChartInstance) {
      trendChartInstance = echarts.init(incomeTrendChart.value)
    }
    
    if (trendChartInstance) {
      const trendOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: ['收入', '成本', '利润']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: mockData.periodData.map(item => item.period)
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: function(value) {
              return (value / 10000).toFixed(1) + 'w'
            }
          }
        },
        series: [
          {
            name: '收入',
            type: 'line',
            stack: 'Total',
            data: mockData.periodData.map(item => item.income),
            smooth: true,
            itemStyle: {
              color: '#67c23a'
            }
          },
          {
            name: '成本',
            type: 'line',
            stack: 'Total',
            data: mockData.periodData.map(item => item.cost),
            smooth: true,
            itemStyle: {
              color: '#f56c6c'
            }
          },
          {
            name: '利润',
            type: 'line',
            stack: 'Total',
            data: mockData.periodData.map(item => item.profit),
            smooth: true,
            itemStyle: {
              color: '#409eff'
            }
          }
        ]
      }
      
      trendChartInstance.setOption(trendOption)
    }
    
    // 更新饼图
    if (projectPieChart.value && !pieChartInstance) {
      pieChartInstance = echarts.init(projectPieChart.value)
    }
    
    if (pieChartInstance) {
      const pieOption = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: mockData.projectData.map(item => item.projectName)
        },
        series: [
          {
            name: '项目收益',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: mockData.projectData.map(item => ({
              value: item.income,
              name: item.projectName
            }))
          }
        ]
      }
      
      pieChartInstance.setOption(pieOption)
    }
  })
}

// 处理报表类型变化
const handleReportTypeChange = () => {
  loadReportData()
}

// 格式化货币
const formatCurrency = (row, column, cellValue) => {
  return Number(cellValue).toLocaleString()
}

// 生成PDF报表
const generatePDF = () => {
  ElMessage.success('PDF报表生成中，请稍候...')
  // 模拟生成PDF操作
  setTimeout(() => {
    ElMessage.success('PDF报表生成成功')
  }, 1500)
}

// 生成Excel报表
const generateExcel = () => {
  ElMessage.success('Excel报表生成中，请稍候...')
  // 模拟生成Excel操作
  setTimeout(() => {
    ElMessage.success('Excel报表生成成功')
  }, 1500)
}

// 查看项目详情
const viewProjectDetail = (row) => {
  selectedProject.value = row
  detailDialogVisible.value = true
}

// 处理窗口大小变化
const handleResize = () => {
  if (trendChartInstance) {
    trendChartInstance.resize()
  }
  if (pieChartInstance) {
    pieChartInstance.resize()
  }
}

// 组件挂载
onMounted(() => {
  loadReportData()
  window.addEventListener('resize', handleResize)
})

// 组件卸载
onUnmounted(() => {
  if (trendChartInstance) {
    trendChartInstance.dispose()
  }
  if (pieChartInstance) {
    pieChartInstance.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.reports-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.report-type-selector {
  flex: 1;
}

.date-selector {
  display: flex;
  gap: 16px;
}

.date-selector .el-select {
  width: 120px;
}

.toolbar-actions {
  display: flex;
  gap: 16px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.summary-card {
  height: 100%;
}

.summary-content {
  padding: 20px 0;
}

.summary-text {
  text-align: center;
}

.summary-label {
  font-size: 14px;
  color: #606266;
  margin: 0 0 8px 0;
}

.summary-value {
  font-size: 28px;
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #409eff;
}

.summary-change {
  font-size: 14px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.summary-change.increase {
  color: #67c23a;
}

.summary-change.decrease {
  color: #f56c6c;
}

.summary-change .decrease {
  transform: rotate(180deg);
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  min-height: 300px;
}

.chart-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 300px;
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

.el-table .income-amount {
  color: #67c23a;
  font-weight: 500;
}

.el-table .cost-amount {
  color: #f56c6c;
}

.el-table .profit-amount {
  color: #409eff;
  font-weight: 500;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .reports-container {
    padding: 10px;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .report-type-selector {
    width: 100%;
  }
  
  .date-selector {
    width: 100%;
  }
  
  .toolbar-actions {
    justify-content: center;
  }
}
</style>