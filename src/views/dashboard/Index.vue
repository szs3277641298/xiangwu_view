<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-actions">
          <el-button
            type="primary"
            size="large"
            @click="goToDataScreen"
          >
            <el-icon><DataBoard /></el-icon>
            数据大屏
          </el-button>
        </div>
      </div>
    </div>
    
    <div class="dashboard-stats">
      <el-card class="stat-card clickable" @click="handleCardClick('population')">
        <div class="stat-content">
          <div class="stat-number">{{ populationData.totalPopulation || 0 }}</div>
          <div class="stat-label">村内总人口</div>
        </div>
        <div class="stat-icon">
          <el-icon><User /></el-icon>
        </div>
      </el-card>
      
      <el-card class="stat-card clickable" @click="handleCardClick('economy')">
        <div class="stat-content">
          <h3>集体经济总览</h3>
        </div>
        <div class="stat-icon">
          <el-icon><Money /></el-icon>
        </div>
      </el-card>
      
      <el-card class="stat-card clickable" @click="handleCardClick('party')">
        <div class="stat-content">
          <div class="stat-number">{{ partyMemberCount }}</div>
          <div class="stat-label">党建系统人数</div>
        </div>
        <div class="stat-icon">
          <el-icon><Flag /></el-icon>
        </div>
      </el-card>
      

    </div>
    
    <div class="dashboard-charts">
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>人口结构分析</span>
            <el-button 
              type="text" 
              @click="refreshPopulationData"
              :loading="loading"
              size="small"
            >
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>
        <div class="chart-container">
          <div 
            ref="populationChartRef" 
            class="chart"
            v-loading="loading"
          ></div>
        </div>
      </el-card>
      
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>人口收入来源分析</span>
            <el-button 
              type="text" 
              @click="refreshIncomeSourceData"
              :loading="incomeSourceLoading"
              size="small"
            >
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>
        <div class="chart-container">
          <div 
            ref="incomeSourceChartRef" 
            class="chart"
            v-loading="incomeSourceLoading"
          ></div>
        </div>
      </el-card>
      
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>政治面貌分布</span>
            <el-button 
              type="text" 
              @click="refreshPoliticalStatusData"
              :loading="politicalStatusLoading"
              size="small"
            >
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
    </div>
        </template>
        <div class="chart-container">
          <div 
            ref="politicalStatusChartRef" 
            class="chart"
            v-loading="politicalStatusLoading"
          ></div>
        </div>
      </el-card>
      
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>性别分布</span>
            <el-button 
              type="text" 
              @click="refreshGenderData"
              :loading="genderLoading"
              size="small"
            >
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>
        <div class="chart-container">
          <div 
            ref="genderChartRef" 
            class="chart"
            v-loading="genderLoading"
          ></div>
        </div>
      </el-card>
      
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>学历分布</span>
            <el-button 
              type="text" 
              @click="refreshEducationData"
              :loading="educationLoading"
              size="small"
            >
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>
        <div class="chart-container">
          <div 
            ref="educationChartRef" 
            class="chart"
            v-loading="educationLoading"
          ></div>
        </div>
      </el-card>
      
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>婚姻状况分布</span>
            <el-button 
              type="text" 
              @click="refreshMaritalStatusData"
              :loading="maritalStatusLoading"
              size="small"
            >
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>
        <div class="chart-container">
          <div 
            ref="maritalStatusChartRef" 
            class="chart"
            v-loading="maritalStatusLoading"
          ></div>
        </div>
      </el-card>
      
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>优抚情况分布</span>
            <el-button 
              type="text" 
              @click="refreshWelfareStatusData"
              :loading="welfareStatusLoading"
              size="small"
            >
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>
        <div class="chart-container">
          <div 
            ref="welfareStatusChartRef" 
            class="chart"
            v-loading="welfareStatusLoading"
          ></div>
        </div>
      </el-card>
      
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>其他信息统计分布</span>
            <el-button 
              type="text" 
              @click="refreshBooleanCountData"
              :loading="booleanCountLoading"
              size="small"
            >
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>
        <div class="chart-container">
          <div 
            ref="booleanCountChartRef" 
            class="chart"
            v-loading="booleanCountLoading"
          ></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { User, Money, Flag, RefreshRight, Refresh, DataBoard } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/index.js'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { bigScreenAPI } from '../../api/api.js'

const userStore = useUserStore()
const router = useRouter()

// 点击处理函数
const handleCardClick = (type) => {
  switch (type) {
    case 'population':
      // 跳转到村内人员页面
      router.push('/personnel/villagers')
      break
    case 'economy':
      // 跳转到项目概览页面
      router.push('/economy/projects')
      break
    case 'party':
      // 跳转到党员信息库
      router.push('/party/members')
      break
    case 'floating':
      // 流动人口暂时不跳转，或者可以跳转到人员管理
      ElMessage.info('流动人口详情功能开发中')
      break
    default:
      break
  }
}

// 响应式数据
const loading = ref(false)
const populationData = ref({
  totalPopulation: 0,
  ageGroups: []
})
const populationChartRef = ref(null)
let populationChart = null

// 统计卡片数据
const partyMemberCount = ref(0)
const floatingPopulationCount = ref(0)

// 收入来源数据
const incomeSourceLoading = ref(false)
const incomeSourceData = ref({
  totalPopulation: 0,
  incomeSources: []
})
const incomeSourceChartRef = ref(null)
let incomeSourceChart = null

// 政治面貌数据
const politicalStatusLoading = ref(false)
const politicalStatusData = ref({
  totalPopulation: 0,
  politicalStatuses: []
})
const politicalStatusChartRef = ref(null)
let politicalStatusChart = null

// 性别数据
const genderLoading = ref(false)
const genderData = ref({
  totalPopulation: 0,
  genders: []
})
const genderChartRef = ref(null)
let genderChart = null

// 学历数据
const educationLoading = ref(false)
const educationData = ref({
  totalPopulation: 0,
  educationLevels: []
})
const educationChartRef = ref(null)
let educationChart = null

// 婚姻状况数据
const maritalStatusLoading = ref(false)
const maritalStatusData = ref({
  totalPopulation: 0,
  maritalStatuses: []
})
const maritalStatusChartRef = ref(null)
let maritalStatusChart = null

// 优抚情况数据
const welfareStatusLoading = ref(false)
const welfareStatusData = ref({
  totalPopulation: 0,
  welfareStatuses: []
})
const welfareStatusChartRef = ref(null)
let welfareStatusChart = null

// 布尔统计数据
const booleanCountLoading = ref(false)
const booleanCountData = ref([])
const booleanCountChartRef = ref(null)
let booleanCountChart = null

// 跳转到数据大屏
const goToDataScreen = () => {
  router.push('/dashboard/data-screen')
}

// 获取人口结构数据
const loadPopulationData = async () => {
  loading.value = true
  try {
    const response = await bigScreenAPI.getPopulationByAge()
    if (response.code === 200) {
      // 映射后端数据结构到前端期望的格式
      populationData.value = {
        totalPopulation: response.data.totalPopulation,
        ageGroups: response.data.groups || []  // 后端返回的是groups字段
      }
      await nextTick()
      initPopulationChart()
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 刷新人口数据
const refreshPopulationData = () => {
  loadPopulationData()
}

// 获取收入来源数据
const loadIncomeSourceData = async () => {
  incomeSourceLoading.value = true
  try {
    const response = await bigScreenAPI.getPopulationByIncomeSource()
    if (response.code === 200) {
      // 映射后端数据结构到前端期望的格式
      incomeSourceData.value = {
        totalPopulation: response.data.totalPopulation,
        incomeSources: response.data.groups || []  // 假设后端也使用groups字段
      }
      await nextTick()
      initIncomeSourceChart()
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    incomeSourceLoading.value = false
  }
}

// 刷新收入来源数据
const refreshIncomeSourceData = () => {
  loadIncomeSourceData()
}

// 获取政治面貌数据
const loadPoliticalStatusData = async () => {
  politicalStatusLoading.value = true
  try {
    const response = await bigScreenAPI.getPopulationByPoliticalStatus()
    if (response.code === 200) {
      // 映射后端数据结构到前端期望的格式
      politicalStatusData.value = {
        totalPopulation: response.data.totalPopulation,
        politicalStatuses: response.data.groups || []  // 后端返回的是groups字段
      }
      await nextTick()
      initPoliticalStatusChart()
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    politicalStatusLoading.value = false
  }
}

// 刷新政治面貌数据
const refreshPoliticalStatusData = () => {
  loadPoliticalStatusData()
}

// 获取性别数据
const loadGenderData = async () => {
  genderLoading.value = true
  try {
    const response = await bigScreenAPI.getPopulationBySex()
    if (response.code === 200) {
      // 映射后端数据结构到前端期望的格式
      genderData.value = {
        totalPopulation: response.data.totalPopulation,
        genders: response.data.groups || []  // 后端返回的是groups字段
      }
      await nextTick()
      initGenderChart()
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    genderLoading.value = false
  }
}

// 刷新性别数据
const refreshGenderData = () => {
  loadGenderData()
}

// 获取学历数据
const loadEducationData = async () => {
  educationLoading.value = true
  try {
    const response = await bigScreenAPI.getPopulationByEducationLevel()
    if (response.code === 200) {
      // 映射后端数据结构到前端期望的格式
      educationData.value = {
        totalPopulation: response.data.totalPopulation,
        educationLevels: response.data.groups || []  // 后端返回的是groups字段
      }
      await nextTick()
      initEducationChart()
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    educationLoading.value = false
  }
}

// 刷新学历数据
const refreshEducationData = () => {
  loadEducationData()
}

// 获取婚姻状况数据
const loadMaritalStatusData = async () => {
  maritalStatusLoading.value = true
  try {
    const response = await bigScreenAPI.getPopulationByMaritalStatus()
    if (response.code === 200) {
      // 映射后端数据结构到前端期望的格式
      maritalStatusData.value = {
        totalPopulation: response.data.totalPopulation,
        maritalStatuses: response.data.groups || []  // 后端返回的是groups字段
      }
      await nextTick()
      initMaritalStatusChart()
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    maritalStatusLoading.value = false
  }
}

// 刷新婚姻状况数据
const refreshMaritalStatusData = () => {
  loadMaritalStatusData()
}

// 获取优抚情况数据
const loadWelfareStatusData = async () => {
  welfareStatusLoading.value = true
  try {
    const response = await bigScreenAPI.getPopulationByWelfareStatus()
    if (response.code === 200) {
      // 映射后端数据结构到前端期望的格式
      welfareStatusData.value = {
        totalPopulation: response.data.totalPopulation,
        welfareStatuses: response.data.groups || []  // 后端返回的是groups字段
      }
      await nextTick()
      initWelfareStatusChart()
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    welfareStatusLoading.value = false
  }
}

// 刷新优抚情况数据
const refreshWelfareStatusData = () => {
  loadWelfareStatusData()
}

// 获取布尔统计数据
const loadBooleanCountData = async () => {
  booleanCountLoading.value = true
  try {
    const response = await bigScreenAPI.getBoolenCount()
    if (response.code === 200) {
      booleanCountData.value = response.data || []
      
      // 提取党员数量和流动人口数量
      const partyMemberData = booleanCountData.value.find(item => item.fieldName === 'party_member')
      const residenceData = booleanCountData.value.find(item => item.fieldName === 'residence')
      
      if (partyMemberData) {
        partyMemberCount.value = partyMemberData.count
      }
      if (residenceData) {
        floatingPopulationCount.value = residenceData.count
      }
      
      await nextTick()
      initBooleanCountChart()
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    booleanCountLoading.value = false
  }
}

// 刷新布尔统计数据
const refreshBooleanCountData = () => {
  loadBooleanCountData()
}

// 初始化人口结构饼图
const initPopulationChart = () => {
  if (!populationChartRef.value) return
  
  // 销毁已存在的图表实例
  if (populationChart) {
    populationChart.dispose()
  }
  
  populationChart = echarts.init(populationChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        const data = params[0]
        return `${data.name}<br/>人数: ${data.value}人<br/>占比: ${((data.value / 71) * 100).toFixed(1)}%`
      }
    },
    legend: {
      orient: 'horizontal',
      left: 'center',
      bottom: '10px',
      data: populationData.value.ageGroups.map(item => item.range),
      textStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: populationData.value.ageGroups.map(item => item.range),
      axisLabel: {
        fontSize: 12,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      nameTextStyle: {
        fontSize: 12,
        color: '#666'
      },
      axisLabel: {
        fontSize: 12,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    series: [
      {
        name: '人口结构',
        type: 'line',
        data: populationData.value.ageGroups.map((item, index) => ({
          value: item.count,
          name: item.range,
          itemStyle: {
            color: getAgeGroupColor(index)
          }
        })),
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(84, 112, 198, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(84, 112, 198, 0.1)'
              }
            ]
          }
        },
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#5470c6'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        animationDelay: function (idx) {
          return idx * 100;
        }
      }
    ]
  }
  
  populationChart.setOption(option)
  
  // 响应式调整
  const resizeHandler = () => {
    if (populationChart) {
      populationChart.resize()
    }
  }
  
  window.addEventListener('resize', resizeHandler)
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
  })
}

// 获取年龄组颜色
const getAgeGroupColor = (index) => {
  const colors = [
    '#5470c6', // 18-40岁 - 蓝色
    '#91cc75', // 41-65岁 - 绿色
    '#fac858'  // 66岁以上 - 橙色
  ]
  return colors[index] || '#5470c6'
}

// 初始化收入来源柱状图
const initIncomeSourceChart = () => {
  if (!incomeSourceChartRef.value) return
  
  // 销毁已存在的图表实例
  if (incomeSourceChart) {
    incomeSourceChart.dispose()
  }
  
  incomeSourceChart = echarts.init(incomeSourceChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        return `${params.name}<br/>人数: ${params.value}人<br/>占比: ${((params.value / 71) * 100).toFixed(1)}%`
      }
    },
    legend: {
      orient: 'horizontal',
      left: 'center',
      bottom: '10px',
      data: incomeSourceData.value.incomeSources.map(item => item.range),
      textStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    series: [
      {
        name: '收入来源',
        type: 'funnel',
        left: '10%',
        top: '10%',
        width: '80%',
        height: '80%',
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: function(params) {
            return `${params.name}\n${params.value}人`
          },
          fontSize: 12,
          fontWeight: 'bold',
          color: '#fff'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 14
          }
        },
        data: incomeSourceData.value.incomeSources.map((item, index) => ({
          value: item.count,
          name: item.range,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                {
                  offset: 0,
                  color: getIncomeSourceColor(index)
                },
                {
                  offset: 1,
                  color: getIncomeSourceColor(index) + '80'
                }
              ]
            },
            shadowBlur: 10,
            shadowColor: getIncomeSourceColor(index) + '40'
          }
        })),
        animationDelay: function (idx) {
          return idx * 100;
        }
      }
    ]
  }
  
  incomeSourceChart.setOption(option)
  
  // 响应式调整
  const resizeHandler = () => {
    if (incomeSourceChart) {
      incomeSourceChart.resize()
    }
  }
  
  window.addEventListener('resize', resizeHandler)
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
  })
}

// 初始化政治面貌横向柱状图
const initPoliticalStatusChart = () => {
  if (!politicalStatusChartRef.value) return
  
  politicalStatusChart = echarts.init(politicalStatusChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        const data = params[0]
        return `${data.name}<br/>人数: ${data.value}人<br/>占比: ${((data.value / 71) * 100).toFixed(1)}%`
      }
    },
    grid: {
      left: '15%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '人数',
      nameTextStyle: {
        fontSize: 12,
        color: '#666'
      },
      axisLabel: {
        fontSize: 12,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: politicalStatusData.value.politicalStatuses.map(item => item.range), // 后端返回的是range字段
      axisLabel: {
        fontSize: 12,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: politicalStatusData.value.politicalStatuses.map((item, index) => ({
          value: item.count,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                {
                  offset: 0,
                  color: getPoliticalStatusColor(index)
                },
                {
                  offset: 1,
                  color: getPoliticalStatusColor(index) + '80'
                }
              ]
            },
            borderRadius: [0, 4, 4, 0],
            shadowBlur: 5,
            shadowColor: getPoliticalStatusColor(index) + '40'
          }
        })),
        barWidth: '60%',
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        animationDelay: function (idx) {
          return idx * 100;
        }
      }
    ]
  }
  
  politicalStatusChart.setOption(option)
  
  // 响应式调整
  const resizeHandler = () => {
    if (politicalStatusChart) {
      politicalStatusChart.resize()
    }
  }
  
  window.addEventListener('resize', resizeHandler)
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
  })
}

// 初始化性别饼图
const initGenderChart = () => {
  if (!genderChartRef.value) return
  
  genderChart = echarts.init(genderChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        const data = params
        const percentage = ((data.value / genderData.value.totalPopulation) * 100).toFixed(1)
        return `${data.name}<br/>人数: ${data.value}人<br/>占比: ${percentage}%`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    series: [
      {
        name: '性别',
        type: 'pie',
        radius: [20, 80],
        center: ['60%', '50%'],
        roseType: 'area',
        avoidLabelOverlap: false,
        data: genderData.value.genders.map((item, index) => ({
          name: item.range, // 后端返回的是range字段
          value: item.count,
          itemStyle: {
            color: {
              type: 'radial',
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                {
                  offset: 0,
                  color: getGenderColor(index)
                },
                {
                  offset: 1,
                  color: getGenderColor(index) + '60'
                }
              ]
            },
            shadowBlur: 10,
            shadowColor: getGenderColor(index) + '40'
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          },
          scale: 1.1
        },
        label: {
          show: true,
          formatter: function(params) {
            const percentage = ((params.value / genderData.value.totalPopulation) * 100).toFixed(1)
            return `${params.name}\n${percentage}%`
          },
          fontSize: 12,
          fontWeight: 'bold',
          color: '#333'
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          lineStyle: {
            color: '#999'
          }
        },
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
          return Math.random() * 200;
        }
      }
    ]
  }
  
  genderChart.setOption(option)
  
  // 响应式调整
  const resizeHandler = () => {
    if (genderChart) {
      genderChart.resize()
    }
  }
  
  window.addEventListener('resize', resizeHandler)
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
  })
}

// 初始化学历柱状图
const initEducationChart = () => {
  if (!educationChartRef.value) return
  
  educationChart = echarts.init(educationChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        const data = params[0]
        return `${data.name}<br/>人数: ${data.value}人<br/>占比: ${((data.value / 71) * 100).toFixed(1)}%`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: educationData.value.educationLevels.map(item => item.range), // 后端返回的是range字段
      axisLabel: {
        rotate: 45,
        fontSize: 12,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      nameTextStyle: {
        fontSize: 12,
        color: '#666'
      },
      axisLabel: {
        fontSize: 12,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: educationData.value.educationLevels.map((item, index) => ({
          value: item.count,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: getEducationColor(index)
                },
                {
                  offset: 1,
                  color: getEducationColor(index) + '80'
                }
              ]
            },
            borderRadius: [4, 4, 0, 0],
            shadowBlur: 8,
            shadowColor: getEducationColor(index) + '40'
          }
        })),
        barWidth: '60%',
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        animationDelay: function (idx) {
          return idx * 100;
        }
      }
    ]
  }
  
  educationChart.setOption(option)
  
  // 响应式调整
  const resizeHandler = () => {
    if (educationChart) {
      educationChart.resize()
    }
  }
  
  window.addEventListener('resize', resizeHandler)
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
  })
}

// 初始化婚姻状况饼图
const initMaritalStatusChart = () => {
  if (!maritalStatusChartRef.value) return
  
  maritalStatusChart = echarts.init(maritalStatusChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        const data = params
        const percentage = ((data.value / maritalStatusData.value.totalPopulation) * 100).toFixed(1)
        return `${data.name}<br/>人数: ${data.value}人<br/>占比: ${percentage}%`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    series: [
      {
        name: '婚姻状况',
        type: 'pie',
        radius: ['30%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        data: maritalStatusData.value.maritalStatuses.map((item, index) => ({
          name: item.range, // 后端返回的是range字段
          value: item.count,
          itemStyle: {
            color: {
              type: 'radial',
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                {
                  offset: 0,
                  color: getMaritalStatusColor(index)
                },
                {
                  offset: 1,
                  color: getMaritalStatusColor(index) + '60'
                }
              ]
            },
            shadowBlur: 10,
            shadowColor: getMaritalStatusColor(index) + '40'
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          },
          scale: 1.1
        },
        label: {
          show: true,
          formatter: function(params) {
            const percentage = ((params.value / maritalStatusData.value.totalPopulation) * 100).toFixed(1)
            return `${params.name}\n${percentage}%`
          },
          fontSize: 12,
          fontWeight: 'bold',
          color: '#333'
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          lineStyle: {
            color: '#999'
          }
        },
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
          return Math.random() * 200;
        }
      }
    ]
  }
  
  maritalStatusChart.setOption(option)
  
  // 响应式调整
  const resizeHandler = () => {
    if (maritalStatusChart) {
      maritalStatusChart.resize()
    }
  }
  
  window.addEventListener('resize', resizeHandler)
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
  })
}

// 初始化优抚情况柱状图
const initWelfareStatusChart = () => {
  if (!welfareStatusChartRef.value) return
  
  welfareStatusChart = echarts.init(welfareStatusChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        const data = params[0]
        return `${data.name}<br/>人数: ${data.value}人<br/>占比: ${((data.value / 71) * 100).toFixed(1)}%`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: welfareStatusData.value.welfareStatuses.map(item => item.range), // 后端返回的是range字段
      axisLabel: {
        rotate: 45,
        fontSize: 12,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      nameTextStyle: {
        fontSize: 12,
        color: '#666'
      },
      axisLabel: {
        fontSize: 12,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: welfareStatusData.value.welfareStatuses.map((item, index) => ({
          value: item.count,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: getWelfareStatusColor(index)
                },
                {
                  offset: 1,
                  color: getWelfareStatusColor(index) + '80'
                }
              ]
            },
            borderRadius: [4, 4, 0, 0],
            shadowBlur: 8,
            shadowColor: getWelfareStatusColor(index) + '40'
          }
        })),
        barWidth: '60%',
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        animationDelay: function (idx) {
          return idx * 100;
        }
      }
    ]
  }
  
  welfareStatusChart.setOption(option)
  
  // 响应式调整
  const resizeHandler = () => {
    if (welfareStatusChart) {
      welfareStatusChart.resize()
    }
  }
  
  window.addEventListener('resize', resizeHandler)
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
  })
}

// 获取收入来源颜色
const getIncomeSourceColor = (index) => {
  const colors = [
    '#91cc75', // 绿色 - 种植
    '#5470c6', // 蓝色 - 养殖
    '#fac858', // 橙色 - 务工
    '#ee6666', // 红色 - 经商
    '#9a60b4'  // 紫色 - 其他
  ]
  return colors[index % colors.length]
}

// 获取政治面貌颜色
const getPoliticalStatusColor = (index) => {
  const colors = [
    '#ff6b6b', // 红色 - 党员
    '#4ecdc4', // 青色 - 共青团员
    '#45b7d1', // 蓝色 - 预备党员
    '#96ceb4', // 绿色 - 入党积极分子
    '#feca57', // 黄色 - 群众
    '#ff9ff3', // 粉色
    '#54a0ff', // 蓝色
    '#5f27cd'  // 紫色
  ]
  return colors[index % colors.length]
}

// 获取性别颜色
const getGenderColor = (index) => {
  const colors = [
    '#ff6b6b', // 红色 - 男性
    '#4ecdc4'  // 青色 - 女性
  ]
  return colors[index % colors.length]
}

// 获取学历颜色
const getEducationColor = (index) => {
  const colors = [
    '#ff6b6b', // 红色 - 文盲
    '#5470c6', // 蓝色 - 小学
    '#91cc75', // 绿色 - 初中
    '#fac858', // 橙色 - 高中
    '#73c0de', // 青色 - 中专
    '#ee6666', // 红色 - 大专
    '#3ba272', // 深绿色 - 本科
    '#9a60b4'  // 紫色 - 研究生及以上
  ]
  return colors[index % colors.length]
}

// 获取婚姻状况颜色
const getMaritalStatusColor = (index) => {
  const colors = [
    '#ff6b6b', // 红色 - 未婚
    '#91cc75', // 绿色 - 已婚
    '#fac858', // 橙色 - 离异
    '#5470c6'  // 蓝色 - 丧偶
  ]
  return colors[index % colors.length]
}

// 获取优抚情况颜色
const getWelfareStatusColor = (index) => {
  const colors = [
    '#91cc75', // 绿色 - 无
    '#ff6b6b', // 红色 - 低保
    '#fac858', // 橙色 - 低保边缘
    '#5470c6'  // 蓝色 - 五保户
  ]
  return colors[index % colors.length]
}

// 获取布尔统计颜色
const getBooleanCountColor = (index) => {
  const colors = [
    '#ff6b6b', // 红色 - 不健康人数
    '#91cc75', // 绿色 - 贫困家庭
    '#fac858', // 橙色 - 残疾人员
    '#5470c6', // 蓝色 - 独生子女家庭
    '#ee6666', // 红色 - 烈士家庭
    '#73c0de', // 青色 - 其他补贴
    '#9a60b4'  // 紫色 - 退役军人
  ]
  return colors[index % colors.length]
}

// 初始化布尔统计柱状图
const initBooleanCountChart = () => {
  if (!booleanCountChartRef.value) return
  
  booleanCountChart = echarts.init(booleanCountChartRef.value)
  
  // 字段名称映射（排除党员数量和流动人口，这些只显示在统计卡片中）
  const fieldNameMap = {
    'health_status': '不健康人数',
    'is_poor': '贫困家庭',
    'is_disabled': '残疾人员',
    'is_only_child_family': '独生子女家庭',
    'is_martyr_family': '烈士家庭',
    'has_other_subsidy': '其他补贴',
    'is_veteran': '退役军人'
  }
  
  // 过滤数据并准备柱状图数据
  const chartData = booleanCountData.value
    .filter(item => fieldNameMap[item.fieldName])
    .map(item => ({
      name: fieldNameMap[item.fieldName],
      value: item.count
    }))
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        return `${params[0].name}<br/>数量: ${params[0].value}人`
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '10%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 11,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: chartData.map(item => item.name),
      axisLabel: {
        fontSize: 11,
        color: '#666',
        interval: 0
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    series: [
      {
        name: '其他信息统计',
        type: 'bar',
        data: chartData.map(item => item.value),
        itemStyle: {
          color: function(params) {
            const colors = [
              '#5470c6', '#91cc75', '#fac858', '#ee6666', 
              '#73c0de', '#3ba272', '#fc8452'
            ]
            return colors[params.dataIndex % colors.length]
          },
          borderRadius: [0, 4, 4, 0],
          shadowBlur: 4,
          shadowColor: 'rgba(0, 0, 0, 0.1)'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        barWidth: '60%',
        animationDelay: function (idx) {
          return idx * 100
        }
      }
    ]
  }
  
  booleanCountChart.setOption(option)
  
  // 响应式调整
  const resizeHandler = () => {
    if (booleanCountChart) {
      booleanCountChart.resize()
    }
  }
  
  window.addEventListener('resize', resizeHandler)
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
  })
}

// 组件挂载时加载数据
onMounted(() => {
  // 抑制 ResizeObserver 错误
  const resizeObserverError = (e) => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
      e.stopImmediatePropagation()
    }
  }
  window.addEventListener('error', resizeObserverError)
  
  // 加载人口数据
  loadPopulationData()
  
  // 加载收入来源数据
  loadIncomeSourceData()
  
  // 加载政治面貌数据
  loadPoliticalStatusData()
  
  // 加载性别数据
  loadGenderData()
  
  // 加载学历数据
  loadEducationData()
  
  // 加载婚姻状况数据
  loadMaritalStatusData()
  
  // 加载优抚情况数据
  loadWelfareStatusData()
  
  // 加载布尔统计数据
  loadBooleanCountData()
  
  // 清理事件监听器
  onUnmounted(() => {
    window.removeEventListener('error', resizeObserverError)
    if (populationChart) {
      populationChart.dispose()
    }
    if (incomeSourceChart) {
      incomeSourceChart.dispose()
    }
    if (politicalStatusChart) {
      politicalStatusChart.dispose()
    }
    if (genderChart) {
      genderChart.dispose()
    }
    if (educationChart) {
      educationChart.dispose()
    }
    if (maritalStatusChart) {
      maritalStatusChart.dispose()
    }
    if (welfareStatusChart) {
      welfareStatusChart.dispose()
    }
    if (booleanCountChart) {
      booleanCountChart.dispose()
    }
  })
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background-color: #f5f5f5;
}

/* 手机端容器调整 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 10px;
  }
}

.dashboard-header {
  margin-bottom: 24px;
}

/* 手机端头部调整 */
@media (max-width: 768px) {
  .dashboard-header {
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    margin-bottom: 15px;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-text h1 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 8px;
}

.header-text p {
  font-size: 14px;
  color: #606266;
}

.header-actions {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .header-text h1 {
    font-size: 20px;
  }
  
  .header-text p {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .header-text h1 {
    font-size: 18px;
  }
  
  .header-text p {
    font-size: 12px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

/* 手机端统计网格调整 */
@media (max-width: 768px) {
  .dashboard-stats {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
    margin-bottom: 14px;
  }
}

@media (max-width: 480px) {
  .dashboard-stats {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 12px;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 12px;
  transition: all 0.2s ease;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

/* 手机端统计卡片调整 */
@media (max-width: 768px) {
  .stat-card {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .stat-card {
    padding: 8px;
  }
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 可点击卡片样式 */
.stat-card.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  background-color: #f8fafc;
}

.stat-card.clickable:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

/* 手机端禁用hover效果 */
@media (max-width: 768px) {
  .stat-card:hover {
    transform: none;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  }
  
  .stat-card.clickable:hover {
    transform: none;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    background-color: #ffffff;
  }
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

/* 手机端数字调整 */
@media (max-width: 768px) {
  .stat-number {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .stat-number {
    font-size: 16px;
  }
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

/* 手机端标签调整 */
@media (max-width: 768px) {
  .stat-label {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .stat-label {
    font-size: 10px;
  }
}

.stat-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  color: #6b7280;
  border-radius: 6px;
  font-size: 16px;
}

/* 手机端图标调整 */
@media (max-width: 768px) {
  .stat-icon {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .stat-icon {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
}

.dashboard-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .dashboard-charts {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .dashboard-charts {
    grid-template-columns: 1fr;
    gap: 15px;
    margin-top: 15px;
  }
}

@media (max-width: 480px) {
  .dashboard-charts {
    gap: 10px;
    margin-top: 10px;
  }
}

.chart-card {
  height: 400px;
  min-height: 350px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* 手机端图表卡片高度调整 */
@media (max-width: 768px) {
  .chart-card {
    height: 350px;
    min-height: 300px;
  }
}

@media (max-width: 480px) {
.chart-card {
  height: 300px;
    min-height: 250px;
  }
}

.chart-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* 手机端禁用hover效果 */
@media (max-width: 768px) {
  .chart-card:hover {
    transform: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

/* 手机端卡片头部调整 */
@media (max-width: 768px) {
  .card-header {
    padding: 0 8px;
  }
  
  .card-header span {
    font-size: 14px;
  }
  
  .card-header .el-button {
    padding: 4px 8px;
    font-size: 12px;
  }
}

.chart-container {
  height: calc(100% - 50px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  overflow: hidden;
}

/* 手机端图表容器调整 */
@media (max-width: 768px) {
  .chart-container {
    height: calc(100% - 45px);
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .chart-container {
    height: calc(100% - 40px);
    padding: 5px;
  }
}

.chart {
  width: 100%;
  height: 100%;
  max-height: 250px;
  min-height: 200px;
}

/* 手机端图表尺寸调整 */
@media (max-width: 768px) {
  .chart {
    max-height: 200px;
    min-height: 150px;
  }
}

@media (max-width: 480px) {
  .chart {
    max-height: 180px;
    min-height: 120px;
  }
}

.chart-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  color: #909399;
  font-size: 14px;
  border-radius: 4px;
}
</style>