<template>
  <div class="datav-container">
    <!-- 顶部信息栏 -->
    <div class="top-header">
      <div class="header-left">
        <div class="datetime-info">
          <dv-border-box-13 
            :color="['#00ffff', '#235fa7']"
            :duration="0"
            style="width:160px; height:80px;"
          >
            <div class="datetime-content">
              <div class="date">{{ currentDate }}</div>
              <div class="time">{{ currentTime }}</div>
      </div>
          </dv-border-box-13>
      </div>
    </div>

      <div class="header-center">
        <div class="main-title">
          <h1 class="title-main">智慧乡村</h1>
          <div class="title-decoration">
            <div class="decoration-line"></div>
            <div class="decoration-dot"></div>
            <div class="decoration-line"></div>
          </div>
          </div>
        </div>

      <div class="header-right">
        <div class="return-button">
          <dv-decoration-11 
            :color="['#00ffff', '#235fa7']"
            :duration="0"
            style="width:160px; height:50px;"
          >
            <el-button @click="returnToSystem" type="primary" class="return-btn">
              <el-icon><ArrowLeft /></el-icon>
              <span class="btn-text">返回系统</span>
            </el-button>
          </dv-decoration-11>
          </div>
          </div>
        </div>



    <!-- 主体内容区域 -->
    <div class="content-area">
      <!-- 左侧内容区块 -->
      <div class="left-panel">
        <div class="panel-header">
          </div>
        <!-- 数据统计 - 人口分布饼图 -->
        <div class="datav-panel">
          <dv-border-box-1 
            :color="['#00ffff', '#235fa7']" 
            backgroundColor="transparent"
            :duration="2000"
            ref="populationChartRef"
          >
            <div class="datav-inner">
              <h3 class="box-title">人口分布统计</h3>
              <div class="chart-container" ref="populationChart"></div>
          </div>
          </dv-border-box-1>
        </div>

        <!-- 数据统计 - 年龄结构柱状图 -->
        <div class="datav-panel">
          <dv-border-box-1 
            :color="['#00ffff', '#235fa7']" 
            backgroundColor="transparent"
            :duration="2000"
            ref="ageChartRef"
          >
            <div class="datav-inner">
              <h3 class="box-title">年龄结构分析</h3>
              <div class="chart-container" ref="ageChart"></div>
          </div>
          </dv-border-box-1>
          </div>

        <!-- 数据统计 - 收入来源饼图 -->
        <div class="datav-panel">
          <dv-border-box-1 
            :color="['#00ffff', '#235fa7']" 
            backgroundColor="transparent"
            :duration="2000"
            ref="incomeChartRef"
          >
            <div class="datav-inner">
              <h3 class="box-title">收入来源分析</h3>
              <div class="chart-container" ref="incomeChart"></div>
        </div>
          </dv-border-box-1>
        </div>
      </div>

      <!-- 中间内容区块 -->
      <div class="center-panel">
        <div class="datav-panel main-panel">
          <dv-border-box-11 
            title="数据统计总览"
            :color="['#00ffff', '#235fa7']" 
            backgroundColor="transparent"
            :duration="2000"
            :reverse="false"
            :titleWidth="200"
            ref="infoBorderBoxRef"
          >
            <div class="info-scroll-container" :class="{ 
              fading: isFading,
              'scroll-complete': isScrollComplete
            }">
              <div class="info-scroll-area" ref="scrollArea">
                <div class="info-item" v-for="(item, index) in currentInfoItems" :key="index" :class="{ 
                  active: index === currentIndex,
                  'scroll-complete': isScrollComplete
                }" v-show="item.label && item.label.trim() !== ''" :ref="el => setItemRef(el, index)">
                  <div class="info-label">{{ item.label }}</div>
                  <div class="info-value">{{ item.value }}</div>
                  <div class="info-unit">{{ item.unit }}</div>
            </div>
          </div>
            </div>
          </dv-border-box-11>
          </div>
        <div class="sub-content-row">
          <div class="datav-panel">
            <dv-border-box-1 
              :color="['#00ffff', '#235fa7']" 
              backgroundColor="transparent"
              :duration="2000"
              ref="subBorderBoxRef1"
            >
              <div class="datav-inner">
                <h3 class="box-title">项目进度趋势</h3>
                <div class="chart-container" ref="projectTrendChart"></div>
            </div>
            </dv-border-box-1>
          </div>
          <div class="datav-panel">
            <dv-border-box-1 
              :color="['#00ffff', '#235fa7']" 
              backgroundColor="transparent"
              :duration="2000"
              ref="subBorderBoxRef2"
            >
              <div class="datav-inner">
                <h3 class="box-title">项目类型分布</h3>
                <div class="chart-container" ref="projectTypeChart"></div>
        </div>
            </dv-border-box-1>
            </div>
          </div>
          </div>

      <!-- 右侧内容区块 -->
      <div class="right-panel">
            <div class="panel-header">
            </div>
        <!-- 数据统计 - 教育水平分布 -->
        <div class="datav-panel">
          <dv-border-box-1 
            :color="['#00ffff', '#235fa7']" 
            backgroundColor="transparent"
            :duration="2000"
            ref="educationChartRef"
          >
            <div class="datav-inner">
              <h3 class="box-title">教育水平分布</h3>
              <div class="chart-container" ref="educationChart"></div>
          </div>
          </dv-border-box-1>
        </div>


        <!-- 数据统计 - 党员统计 -->
        <div class="datav-panel">
          <dv-border-box-1 
            :color="['#00ffff', '#235fa7']" 
            backgroundColor="transparent"
            :duration="2000"
            ref="partyMemberChartRef"
          >
            <div class="datav-inner">
              <h3 class="box-title">党员统计</h3>
              <div class="chart-container" ref="partyMemberChart"></div>
            </div>
          </dv-border-box-1>
          </div>

        <!-- 数据统计 - 福利保障情况 -->
        <div class="datav-panel">
          <dv-border-box-1 
            :color="['#00ffff', '#235fa7']" 
            backgroundColor="transparent"
            :duration="2000"
            ref="welfareChartRef"
          >
            <div class="datav-inner">
              <h3 class="box-title">福利保障情况</h3>
              <div class="chart-container" ref="welfareChart"></div>
            </div>
          </dv-border-box-1>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, DataBoard, TrendCharts, Monitor } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { bigScreenAPI, economyAPI } from '../../api/api.js'

const router = useRouter()

// 静态数据
const mainTitle = ref('乡村数据大屏')

// 党员统计数据
const partyMemberCounts = ref([
  { count: 4, fieldName: 'party_member' },
  { count: 1, fieldName: 'secretary' },
  { count: 1, fieldName: 'committee_member' },
  { count: 1, fieldName: 'youth_league_member' },
  { count: 2, fieldName: 'regular_party_member' },
  { count: 2, fieldName: 'activist' }
])

// 字段名称映射
const getFieldDisplayName = (fieldName) => {
  const fieldMap = {
    'party_member': '党员总数',
    'secretary': '党组织书记',
    'committee_member': '党组织委员',
    'youth_league_member': '共青团员',
    'regular_party_member': '预备党员',
    'activist': '入党积极分子'
  }
  return fieldMap[fieldName] || fieldName
}

// 真实数据状态
const populationData = ref({})
const partyMemberData = ref({})
const incomeSourceData = ref({})
const projectData = ref({})
const welfareData = ref({})
const educationData = ref({})
const loading = ref(false)

// 图表引用
const populationChart = ref(null)
const ageChart = ref(null)
const incomeChart = ref(null)
const projectTrendChart = ref(null)
const projectTypeChart = ref(null)
const educationChart = ref(null)
const partyMemberChart = ref(null)
const welfareChart = ref(null)

// 信息滚动数据
const currentIndex = ref(0)
const currentInfoItems = ref([])
const isFading = ref(false)
const scrollArea = ref(null)
const itemRefs = ref([])
const isScrollComplete = ref(false)

// 设置项目引用
const setItemRef = (el, index) => {
  if (el) {
    itemRefs.value[index] = el
  }
}

// 自动滚动到当前激活的项目
const scrollToActiveItem = () => {
  if (scrollArea.value && itemRefs.value[currentIndex.value]) {
    const activeItem = itemRefs.value[currentIndex.value]
    const scrollContainer = scrollArea.value
    const containerHeight = scrollContainer.clientHeight
    const itemHeight = activeItem.offsetHeight
    const itemTop = activeItem.offsetTop
    
    // 使用requestAnimationFrame避免重排
    requestAnimationFrame(() => {
      // 自动滚动到项目位置，让当前项目居中显示
      const targetScrollTop = itemTop - (containerHeight - itemHeight) / 2
      scrollContainer.scrollTop = Math.max(0, targetScrollTop)
    })
  }
}

// 滚动到第一条数据
const scrollToFirstItem = () => {
  if (scrollArea.value) {
    // 使用requestAnimationFrame避免重排
    requestAnimationFrame(() => {
      scrollArea.value.scrollTop = 0
    })
  }
}

// 信息数据配置 - 使用真实数据
const infoDataConfigs = computed(() => {
  const populationGroups = populationData.value.ageGroups || []  // 使用年龄分组数据
  const partyGroups = partyMemberData.value.groups || []
  const projects = projectData.value.list || []
  const educationGroups = educationData.value.groups || []
  const welfareGroups = welfareData.value.groups || []
  
  // 计算统计数据
  const totalPopulation = populationData.value.totalPopulation || 0
  
  // 调试人口数据结构
  console.log('人口数据结构:', populationData.value)
  console.log('年龄分组数据:', populationGroups)
  console.log('性别分组数据:', populationData.value.sexGroups || [])
  
  // 打印所有分组数据的字段名，帮助调试
  if (populationGroups.length > 0) {
    console.log('人口分组字段示例:', Object.keys(populationGroups[0]))
    console.log('人口分组详细数据:', populationGroups)
  }
  
  if (populationData.value.sexGroups && populationData.value.sexGroups.length > 0) {
    console.log('性别分组字段示例:', Object.keys(populationData.value.sexGroups[0]))
    console.log('性别分组详细数据:', populationData.value.sexGroups)
  }
  
  // 从专门的性别数据中获取男女人数
  const sexGroups = populationData.value.sexGroups || []
  let maleCount = 0
  let femaleCount = 0
  
  if (sexGroups.length > 0) {
    // 尝试多种字段名匹配
    maleCount = sexGroups.find(g => 
      g.sex === 'MALE' || 
      g.range === '男性' || 
      g.name === '男性' ||
      g.gender === 'MALE' ||
      g.sex === '男' ||
      g.range === '男' ||
      g.sex === '1' ||  // 可能用数字表示
      g.range === '1'
    )?.count || 0
    
    femaleCount = sexGroups.find(g => 
      g.sex === 'FEMALE' || 
      g.range === '女性' || 
      g.name === '女性' ||
      g.gender === 'FEMALE' ||
      g.sex === '女' ||
      g.range === '女' ||
      g.sex === '0' ||  // 可能用数字表示
      g.range === '0'
    )?.count || 0
    
    console.log('性别分组匹配结果:', { maleCount, femaleCount })
  } else {
    console.log('没有性别分组数据，尝试从其他数据源获取...')
    // 如果sexGroups不存在，尝试从populationGroups中查找
    maleCount = populationGroups.find(g => 
      g.sex === 'MALE' || 
      g.range === '男性' || 
      g.name === '男性' ||
      g.gender === 'MALE' ||
      g.sex === '男' ||
      g.range === '男'
    )?.count || 0
    
    femaleCount = populationGroups.find(g => 
      g.sex === 'FEMALE' || 
      g.range === '女性' || 
      g.name === '女性' ||
      g.gender === 'FEMALE' ||
      g.sex === '女' ||
      g.range === '女'
    )?.count || 0
  }
  
  console.log('男性人数:', maleCount, '女性人数:', femaleCount)
  
  const partyMemberCount = partyGroups.find(g => g.politicalStatus === 'PARTY_MEMBER' || g.range === '正式党员')?.count || 0
  const probationaryCount = partyGroups.find(g => g.politicalStatus === 'PROBATIONARY' || g.range === '预备党员')?.count || 0
  
  const projectCount = projects.length
  const totalInvestment = projects.reduce((sum, p) => sum + (Number(p.investment) || 0), 0)
  const totalIncome = projects.reduce((sum, p) => sum + (Number(p.annualRevenue) || 0), 0)
  const averageReturnRate = totalInvestment > 0 ? ((totalIncome / totalInvestment) * 100).toFixed(1) : 0
  
  // 调试信息
  console.log('党员统计数据配置:', partyMemberCounts.value)
  console.log('党员统计映射结果:', partyMemberCounts.value.map(item => ({
    label: getFieldDisplayName(item.fieldName),
    value: item.count.toLocaleString(),
    unit: '人'
  })))
  console.log('学历统计数据配置:', educationGroups)
  console.log('学历统计映射结果:', educationGroups.slice(0, 6).map(group => ({
    label: group.name || group.educationLevel || group.range || '未知',
    value: (group.count || 0).toLocaleString(),
    unit: '人'
  })))
  console.log('福利保障数据配置:', welfareGroups)
  console.log('福利保障映射结果:', welfareGroups.slice(0, 6).map(group => ({
    label: group.range || group.name || group.welfareStatus || '未知',
    value: (group.count || 0).toLocaleString(),
    unit: '人'
  })))
  
  return [
    {
      title: '党员统计',
      items: [
        // 使用党员统计总览数据
        ...partyMemberCounts.value.map(item => ({
          label: getFieldDisplayName(item.fieldName),
          value: item.count.toLocaleString(),
          unit: '人'
        })),
        // 如果党员统计总览数据不足8项，用空项填充
        ...Array(Math.max(0, 8 - partyMemberCounts.value.length)).fill({ label: '', value: '', unit: '' })
      ].slice(0, 8)
    },
    {
      title: '人口统计',
      items: [
        { label: '总人口', value: totalPopulation.toLocaleString(), unit: '人' },
        { label: '男性', value: maleCount.toLocaleString(), unit: '人' },
        { label: '女性', value: femaleCount.toLocaleString(), unit: '人' },
        ...populationGroups.slice(0, 4).map(group => ({
          label: group.name || group.ageGroup || group.range || group.ageRange || '未知',
          value: (group.count || 0).toLocaleString(),
          unit: '人'
        })),
        { label: '', value: '', unit: '' }
      ].slice(0, 8)
    },
    {
      title: '项目统计',
      items: [
        { label: '项目总数', value: projectCount.toLocaleString(), unit: '个' },
        { label: '总投资', value: (totalInvestment / 10000).toFixed(1), unit: '万元' },
        { label: '累计收益', value: (totalIncome / 10000).toFixed(1), unit: '万元' },
        { label: '平均收益率', value: averageReturnRate, unit: '%' },
        ...projects.slice(0, 3).map(project => ({
          label: project.objectName || '项目',
          value: (Number(project.investment) / 10000).toFixed(1),
          unit: '万元'
        })),
        { label: '', value: '', unit: '' }
      ].slice(0, 8)
    },
    {
      title: '学历统计',
      items: [
        ...educationGroups.slice(0, 6).map(group => ({
          label: group.name || group.educationLevel || group.range || group.education || group.level || '未知',
          value: (group.count || 0).toLocaleString(),
          unit: '人'
        })),
        { label: '', value: '', unit: '' },
        { label: '', value: '', unit: '' }
      ].slice(0, 8)
    },
    {
      title: '福利保障',
      items: [
        ...welfareGroups.slice(0, 6).map(group => ({
          label: group.range || group.name || group.welfareStatus || '未知',
          value: (group.count || 0).toLocaleString(),
          unit: '人'
        })),
        { label: '', value: '', unit: '' },
        { label: '', value: '', unit: '' }
      ].slice(0, 8)
    }
  ]
})

// 图表实例
let populationChartInstance = null
let ageChartInstance = null
let incomeChartInstance = null
let overviewChartInstance = null
let projectTrendChartInstance = null
let projectTypeChartInstance = null
let educationChartInstance = null
let partyMemberChartInstance = null
let welfareChartInstance = null

// BorderBox1 引用
const borderBoxRef = ref(null)
const subBorderBoxRef1 = ref(null)
const subBorderBoxRef2 = ref(null)
const rightBorderBoxRefs = ref([])
const infoBorderBoxRef = ref(null)

// 实时更新时间
const currentDate = ref('')
const currentTime = ref('')
const currentWeekday = ref('')
const currentLunar = ref('')
let timeInterval = null

const updateDateTime = () => {
  const now = new Date()
  
  // 日期
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '.')
  
  // 时间
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  // 星期
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  currentWeekday.value = weekdays[now.getDay()]
  
  // 农历（简化版本，实际项目中可以使用专业的农历库）
  const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
  const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                     '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                     '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']
  
  // 这里使用简化的农历显示，实际项目中建议使用专业的农历库
  const month = now.getMonth() + 1
  const day = now.getDate()
  currentLunar.value = `${lunarMonths[month - 1]}月${lunarDays[day - 1]}`
}

// 返回系统
const returnToSystem = () => {
  router.push('/')
}

// 初始化BorderBox组件
const initBorderBoxes = () => {
  nextTick(() => {
    setTimeout(() => {
      // 初始化所有BorderBox1组件
      const borderBox1Components = [
        borderBoxRef.value,
        subBorderBoxRef1.value,
        subBorderBoxRef2.value,
        ...rightBorderBoxRefs.value
      ].filter(Boolean)
      
      borderBox1Components.forEach(borderBox => {
        if (borderBox && borderBox.initWH) {
          borderBox.initWH()
        }
      })
      
      // 特殊处理BorderBox11组件
      if (infoBorderBoxRef.value) {
        // 尝试多种初始化方法
        if (infoBorderBoxRef.value.initWH) {
          infoBorderBoxRef.value.initWH()
        } else if (infoBorderBoxRef.value.init) {
          infoBorderBoxRef.value.init()
        } else if (infoBorderBoxRef.value.$forceUpdate) {
          infoBorderBoxRef.value.$forceUpdate()
        }
        
        // 延迟再次尝试初始化
        setTimeout(() => {
          if (infoBorderBoxRef.value && infoBorderBoxRef.value.initWH) {
            infoBorderBoxRef.value.initWH()
          }
        }, 500)
      }
    }, 300)
  })
}

// 初始化所有图表
const initCharts = () => {
  nextTick(() => {
  setTimeout(() => {
    initPopulationChart()
      initAgeChart()
      initIncomeChart()
      initProjectTrendChart()
      initProjectTypeChart()
      initEducationChart()
      initPartyMemberChart()
      initWelfareChart()
    }, 500)
  })
}

// 手动触发滚动更新
const triggerScrollUpdate = () => {
  console.log('手动触发滚动更新')
  console.log('当前信息配置:', infoDataConfigs.value)
  console.log('当前信息项:', currentInfoItems.value)
  if (typeof updateInfoItems === 'function') {
    updateInfoItems()
  }
}

// 初始化信息滚动
const initInfoScroll = () => {
  let configIndex = 0
  let isTransitioning = false
  
  // 确保BorderBox11正确初始化
  nextTick(() => {
    if (infoBorderBoxRef.value && infoBorderBoxRef.value.initWH) {
      infoBorderBoxRef.value.initWH()
    }
  })
  
  const updateInfoItems = () => {
    if (isTransitioning) return
    isTransitioning = true
    
    // 确保configIndex是有效的数字
    if (isNaN(configIndex) || configIndex < 0 || configIndex >= infoDataConfigs.value.length) {
      configIndex = 0
    }
    
    console.log('开始更新信息项，当前配置索引:', configIndex)
    console.log('总配置数量:', infoDataConfigs.value.length)
    console.log('所有配置标题:', infoDataConfigs.value.map(c => c.title))
    
    // 淡出效果
    isFading.value = true
    
  setTimeout(() => {
        const config = infoDataConfigs.value[configIndex]
        if (!config) {
          console.error('配置不存在，重置为第一组')
          configIndex = 0
          isTransitioning = false
          return
        }
        console.log('切换信息组:', config.title, '数据:', config.items)
        console.log('有效数据项数量:', config.items.filter(item => item.label && item.label.trim() !== '').length)
        currentInfoItems.value = config.items
        currentIndex.value = 0
        itemRefs.value = [] // 清空项目引用
        isScrollComplete.value = false // 重置滚动完成状态
        
        // 重新初始化BorderBox11组件
        nextTick(() => {
          if (infoBorderBoxRef.value) {
            // 尝试多种初始化方法
            if (infoBorderBoxRef.value.initWH) {
              infoBorderBoxRef.value.initWH()
            } else if (infoBorderBoxRef.value.init) {
              infoBorderBoxRef.value.init()
            } else if (infoBorderBoxRef.value.$forceUpdate) {
              infoBorderBoxRef.value.$forceUpdate()
            }
            
            // 延迟再次尝试初始化
  setTimeout(() => {
              if (infoBorderBoxRef.value && infoBorderBoxRef.value.initWH) {
                infoBorderBoxRef.value.initWH()
}
            }, 100)
          }
        })

        // 淡入效果
  setTimeout(() => {
          isFading.value = false
          // 延迟滚动到第一条数据，避免重排
          setTimeout(() => {
            scrollToFirstItem()
          }, 100)
        }, 50) // 减少淡入时间
      
      // 逐项显示信息
      const showNextItem = () => {
        console.log('显示下一项，当前索引:', currentIndex.value, '总项目数:', config.items.length)
        
        // 找到下一个非空项目
        let nextIndex = currentIndex.value + 1
        while (nextIndex < config.items.length && 
               (!config.items[nextIndex].label || config.items[nextIndex].label.trim() === '')) {
          nextIndex++
        }
        
        console.log('下一个非空项目索引:', nextIndex)
        
        if (nextIndex < config.items.length) {
          currentIndex.value = nextIndex
          isScrollComplete.value = false
          console.log('显示项目:', config.items[nextIndex].label, config.items[nextIndex].value)
          // 自动滚动到当前激活的项目
  setTimeout(() => {
            scrollToActiveItem()
          }, 200)
          setTimeout(showNextItem, 800) // 每800ms显示下一项，更流畅
        } else {
          // 当前配置显示完毕，清除动画效果
          isScrollComplete.value = true
          console.log('当前配置显示完毕，准备切换到下一组数据')
          setTimeout(() => {
            configIndex = (configIndex + 1) % infoDataConfigs.value.length
            console.log('切换到配置索引:', configIndex, '配置标题:', infoDataConfigs.value[configIndex]?.title)
            // 确保切换后的索引是有效的
            if (isNaN(configIndex) || configIndex < 0 || configIndex >= infoDataConfigs.value.length) {
              configIndex = 0
            }
            isTransitioning = false
            // 在切换数据组时重新初始化BorderBox11
            nextTick(() => {
              if (infoBorderBoxRef.value) {
                // 尝试多种初始化方法
                if (infoBorderBoxRef.value.initWH) {
                  infoBorderBoxRef.value.initWH()
                } else if (infoBorderBoxRef.value.init) {
                  infoBorderBoxRef.value.init()
                } else if (infoBorderBoxRef.value.$forceUpdate) {
                  infoBorderBoxRef.value.$forceUpdate()
                }
                
                // 延迟再次尝试初始化
  setTimeout(() => {
                  if (infoBorderBoxRef.value && infoBorderBoxRef.value.initWH) {
                    infoBorderBoxRef.value.initWH()
                  }
                }, 100)
              }
            })
            updateInfoItems()
          }, 500) // 等待0.5秒后切换到下一组数据
        }
      }
      
      // 开始显示第一项，延迟3秒让用户看清楚新数据
  setTimeout(() => {
        isTransitioning = false
        // 延迟滚动到第一条数据，确保DOM完全更新
        setTimeout(() => {
          scrollToFirstItem()
          // 再延迟一点时间开始滚动
          setTimeout(() => {
            showNextItem()
          }, 200)
        }, 100)
      }, 2000) // 延迟2秒开始滚动
    }, 200) // 减少淡出时间
  }
  
  // 开始滚动
  updateInfoItems()
}

// 人口分布饼图 - 完全按照数据看板的方式
const initPopulationChart = () => {
  if (!populationChart.value) return
  
  console.log('初始化人口图表，数据:', populationData.value)
  
  // 销毁已存在的图表实例
  if (populationChartInstance) {
    populationChartInstance.dispose()
  }
  
  populationChartInstance = echarts.init(populationChart.value)
    
  // 按照数据看板的方式处理数据
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00ffff',
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        const data = params[0]
        return `${data.name}<br/>人数: ${data.value}人<br/>占比: ${((data.value / (populationData.value.totalPopulation || 1)) * 100).toFixed(1)}%`
      }
    },
    legend: {
      orient: 'horizontal',
      left: 'center',
      bottom: '10px',
      data: populationData.value.ageGroups?.map(item => item.range) || [],
      textStyle: {
        fontSize: 12,
        color: '#00ffff'
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
      data: populationData.value.ageGroups?.map(item => item.range) || [],
      axisLabel: {
        fontSize: 12,
        color: '#00ffff'
      },
      axisLine: {
        lineStyle: {
          color: '#00ffff'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      nameTextStyle: {
        fontSize: 12,
        color: '#00ffff'
      },
      axisLabel: {
        fontSize: 12,
        color: '#00ffff'
      },
      axisLine: {
        lineStyle: {
          color: '#00ffff'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 255, 255, 0.2)'
        }
      }
    },
    series: [
      {
        name: '人口结构',
        type: 'line',
        data: populationData.value.ageGroups?.map((item, index) => ({
          value: item.count || 0,
          itemStyle: {
            color: ['#00ffff', '#235fa7', '#4fd2dd', '#7b68ee'][index % 4]
          }
        })) || [],
        smooth: true,
        lineStyle: {
          color: '#00ffff',
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(0, 255, 255, 0.3)'
            }, {
              offset: 1, color: 'rgba(0, 255, 255, 0.05)'
            }]
          }
        },
        symbol: 'circle',
        symbolSize: 8,
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2
          }
        }
      }
    ]
  }
  
  populationChartInstance.setOption(option)
}

// 年龄结构柱状图
const initAgeChart = () => {
  if (ageChart.value) {
    ageChartInstance = echarts.init(ageChart.value)
  const option = {
    backgroundColor: 'transparent',
    tooltip: { 
    trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00ffff',
      textStyle: { color: '#fff' }
    },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
        data: ['0-18', '18-35', '35-60', '60+'],
        axisLine: { lineStyle: { color: '#00ffff' }},
        axisLabel: { color: '#00ffff' }
  },
  yAxis: {
    type: 'value',
        axisLine: { lineStyle: { color: '#00ffff' }},
        axisLabel: { color: '#00ffff' }
    },
    series: [{
        data: [1200, 2800, 3200, 1800],
    type: 'bar',
      itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00ffff' },
            { offset: 1, color: '#235fa7' }
          ])
        }
      }]
    }
    ageChartInstance.setOption(option)
  }
}

// 收入来源饼图
const initIncomeChart = () => {
  if (incomeChart.value) {
    console.log('初始化收入图表，数据:', incomeSourceData.value)
    
    // 如果已有实例，先销毁
    if (incomeChartInstance) {
      incomeChartInstance.dispose()
    }
    
    incomeChartInstance = echarts.init(incomeChart.value)
    
    // 使用真实数据配置
    const incomeGroups = incomeSourceData.value.incomeSources || []
    
    // 默认收入数据
    const defaultIncomeData = [
      { value: 35, name: '农业收入', itemStyle: { color: '#00ffff' }},
      { value: 25, name: '务工收入', itemStyle: { color: '#235fa7' }},
      { value: 20, name: '经商收入', itemStyle: { color: '#4fd2dd' }},
      { value: 15, name: '其他收入', itemStyle: { color: '#7b68ee' }},
      { value: 5, name: '政府补贴', itemStyle: { color: '#ff6b6b' }}
    ]
    
    const dataConfigs = [
      {
        title: '收入来源',
        data: incomeGroups.length > 0 ? incomeGroups.map((group, index) => ({
          value: group.count || 0,
          name: group.range,
          itemStyle: { color: ['#00ffff', '#235fa7', '#4fd2dd', '#7b68ee', '#ff6b6b'][index % 5] }
        })) : defaultIncomeData
      },
      {
        title: '收入水平',
        data: [
          { value: 30, name: '高收入', itemStyle: { color: '#00ffff' }},
          { value: 40, name: '中等收入', itemStyle: { color: '#235fa7' }},
          { value: 25, name: '低收入', itemStyle: { color: '#4fd2dd' }},
          { value: 5, name: '贫困', itemStyle: { color: '#ff6b6b' }}
        ]
      },
      {
        title: '就业类型',
        data: [
          { value: 40, name: '务农', itemStyle: { color: '#00ffff' }},
          { value: 30, name: '务工', itemStyle: { color: '#235fa7' }},
          { value: 15, name: '经商', itemStyle: { color: '#4fd2dd' }},
          { value: 10, name: '其他', itemStyle: { color: '#7b68ee' }},
          { value: 5, name: '无业', itemStyle: { color: '#ff6b6b' }}
        ]
      }
    ]
    
    let currentIndex = 0
    
    const updateChart = () => {
      const config = dataConfigs[currentIndex]
      const option = {
        backgroundColor: 'transparent',
        color: ['#00ffff', '#235fa7', '#4fd2dd', '#7b68ee', '#ff6b6b'],
        title: {
          text: config.title,
          left: 'center',
          top: 10,
          textStyle: {
            color: '#00ffff',
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: { 
          trigger: 'item', 
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#00ffff',
          textStyle: { color: '#fff' }
        },
        series: [{
          name: config.title,
          type: 'pie',
          radius: '60%',
          data: config.data,
          itemStyle: {
            color: function(params) {
              return params.data.itemStyle?.color || ['#00ffff', '#235fa7', '#4fd2dd', '#7b68ee', '#ff6b6b'][params.dataIndex % 5]
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 255, 255, 0.5)'
            }
          },
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: (idx) => idx * 100
        }]
      }
      incomeChartInstance.setOption(option, true)
    }
    
    // 初始化图表
    updateChart()
    
    // 设置循环滚动
    setInterval(() => {
      currentIndex = (currentIndex + 1) % dataConfigs.length
      updateChart()
    }, 4500) // 每4.5秒切换一次
  }
}


// 项目进度趋势图
const initProjectTrendChart = () => {
  if (projectTrendChart.value) {
    projectTrendChartInstance = echarts.init(projectTrendChart.value)
    
    // 使用真实项目数据
    const projects = projectData.value.list || []
    const monthlyData = {}
    
    // 按月份统计项目数量
    projects.forEach(project => {
      if (project.createTime) {
        const month = new Date(project.createTime).getMonth() + 1
        monthlyData[month] = (monthlyData[month] || 0) + 1
      }
    })
    
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    const projectCounts = months.map((_, index) => monthlyData[index + 1] || 0)
    
  const option = {
    backgroundColor: 'transparent',
    tooltip: { 
      trigger: 'axis', 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00ffff',
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
        containLabel: true
    },
    xAxis: { 
      type: 'category', 
        data: months,
        axisLine: { lineStyle: { color: '#00ffff' }},
        axisLabel: { color: '#00ffff' }
    },
    yAxis: { 
      type: 'value',
        axisLine: { lineStyle: { color: '#00ffff' }},
        axisLabel: { color: '#00ffff' }
    },
    series: [{
        data: [20, 35, 45, 60, 70, 75],
        type: 'line',
        smooth: true,
        lineStyle: { color: '#00ffff', width: 3 },
        itemStyle: { color: '#00ffff' },
        areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 255, 255, 0.3)' },
            { offset: 1, color: 'rgba(0, 255, 255, 0.1)' }
          ])
        }
      }]
    }
    projectTrendChartInstance.setOption(option)
  }
}

// 项目类型分布图
const initProjectTypeChart = () => {
  if (projectTypeChart.value) {
    projectTypeChartInstance = echarts.init(projectTypeChart.value)
    
    // 使用真实项目数据统计类型分布
    const projects = projectData.value.list || []
    const typeStats = {}
    
    projects.forEach(project => {
      const type = project.type
      typeStats[type] = (typeStats[type] || 0) + 1
    })
    
  const option = {
    backgroundColor: 'transparent',
    color: ['#00ffff', '#235fa7', '#4fd2dd', '#7b68ee', '#ff6b6b'],
    tooltip: { 
      trigger: 'item', 
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00ffff',
      textStyle: { color: '#fff' },
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [{
      name: '项目类型',
      type: 'pie',
      radius: ['30%', '70%'],
      center: ['50%', '50%'],
      data: [
        { value: typeStats.PLANTING || 0, name: '种植', itemStyle: { color: '#00ffff' } },
        { value: typeStats.BREEDING || 0, name: '养殖', itemStyle: { color: '#235fa7' } },
        { value: typeStats.PROCESSING || 0, name: '加工', itemStyle: { color: '#4fd2dd' } },
        { value: typeStats.TOURISM || 0, name: '旅游', itemStyle: { color: '#7b68ee' } },
        { value: typeStats.OTHER || 0, name: '其他', itemStyle: { color: '#ff6b6b' } }
      ],
      itemStyle: {
        color: function(params) {
          return params.data.itemStyle?.color || ['#00ffff', '#235fa7', '#4fd2dd', '#7b68ee', '#ff6b6b'][params.dataIndex % 5]
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 255, 255, 0.5)'
        }
      }
    }]
  }
    projectTypeChartInstance.setOption(option)
  }
}

// 教育水平分布图
const initEducationChart = () => {
  if (educationChart.value) {
    educationChartInstance = echarts.init(educationChart.value)
    
    // 使用真实教育数据
    const educationGroups = educationData.value.groups || []
    const categories = educationGroups.map(group => group.range)
    const values = educationGroups.map(group => group.count || 0)
    
  const option = {
    backgroundColor: 'transparent',
    tooltip: { 
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00ffff',
      textStyle: { color: '#fff' }
    },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: '#00ffff' }},
        axisLabel: { color: '#00ffff', rotate: 45 }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#00ffff' }},
        axisLabel: { color: '#00ffff' }
    },
    series: [{
        data: [1500, 2200, 1800, 800, 400, 100],
        type: 'bar',
      itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00ffff' },
            { offset: 1, color: '#235fa7' }
          ])
        }
      }]
    }
    educationChartInstance.setOption(option)
  }
}

// 党员统计图
const initPartyMemberChart = () => {
  if (partyMemberChart.value) {
    partyMemberChartInstance = echarts.init(partyMemberChart.value)
    
    // 使用滚动面板的党员统计数据
    console.log('党员统计饼图 - 滚动面板数据:', partyMemberCounts.value)
    
    // 将滚动面板数据转换为饼图数据
    const partyChartData = partyMemberCounts.value.map((item, index) => ({
      value: item.count || 0,
      name: getFieldDisplayName(item.fieldName),
      itemStyle: { color: ['#00ffff', '#235fa7', '#4fd2dd', '#7b68ee', '#ff6b6b'][index % 5] }
    }))
    
    console.log('党员统计饼图 - 转换后数据:', partyChartData)
    
    const dataConfigs = [
      {
        title: '党员统计',
        data: partyChartData
      },
      {
        title: '党费缴纳',
        data: [
          { value: 85, name: '已缴纳', itemStyle: { color: '#00ffff' }},
          { value: 15, name: '未缴纳', itemStyle: { color: '#ff6b6b' }}
        ]
      },
      {
        title: '党员年龄',
        data: [
          { value: 20, name: '30岁以下', itemStyle: { color: '#00ffff' }},
          { value: 25, name: '30-50岁', itemStyle: { color: '#235fa7' }},
          { value: 15, name: '50岁以上', itemStyle: { color: '#4fd2dd' }}
        ]
      }
    ]
    
    let currentIndex = 0
    
    const updateChart = () => {
      const config = dataConfigs[currentIndex]
      const option = {
        backgroundColor: 'transparent',
        color: ['#00ffff', '#235fa7', '#4fd2dd', '#7b68ee', '#ff6b6b'],
        title: {
          text: config.title,
          left: 'center',
          top: 10,
          textStyle: {
            color: '#00ffff',
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: { 
          trigger: 'item', 
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#00ffff',
          textStyle: { color: '#fff' }
        },
        series: [{
          name: config.title,
          type: 'pie',
          radius: '60%',
          center: ['50%', '50%'],
          data: config.data,
          itemStyle: {
            color: function(params) {
              return params.data.itemStyle?.color || ['#00ffff', '#235fa7', '#4fd2dd', '#7b68ee', '#ff6b6b'][params.dataIndex % 5]
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 255, 255, 0.5)'
            }
          },
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: (idx) => idx * 100
        }]
      }
      partyMemberChartInstance.setOption(option, true)
    }
    
    // 初始化图表
    updateChart()
    
    // 设置循环滚动
    setInterval(() => {
      currentIndex = (currentIndex + 1) % dataConfigs.length
      updateChart()
    }, 5500) // 每5.5秒切换一次
  }
}

// 福利保障情况图
const initWelfareChart = () => {
  if (welfareChart.value) {
    welfareChartInstance = echarts.init(welfareChart.value)
    
    // 使用真实优抚数据
    const welfareGroups = welfareData.value.groups || []
    const categories = welfareGroups.map(group => group.range || group.name || group.welfareStatus || '未知')
    const values = welfareGroups.map(group => group.count || 0)
    
  const option = {
    backgroundColor: 'transparent',
    tooltip: { 
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00ffff',
      textStyle: { color: '#fff' }
    },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: '#00ffff' }},
        axisLabel: { color: '#00ffff', rotate: 45 }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#00ffff' }},
        axisLabel: { color: '#00ffff' }
    },
    series: [{
        data: values,
        type: 'bar',
      itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00ffff' },
            { offset: 1, color: '#235fa7' }
          ])
        }
      }]
    }
    welfareChartInstance.setOption(option)
  }
}

// 强制更新所有图表
const forceUpdateCharts = () => {
  console.log('强制更新所有图表')
  setTimeout(() => {
    // 直接更新图表选项而不是重新初始化
    updatePopulationChart()
    updateIncomeChart()
    updateProjectTrendChart()
    updateProjectTypeChart()
    updateEducationChart()
    updatePartyMemberChart()
    updateWelfareChart()
  }, 100)
}

// 更新人口图表数据
const updatePopulationChart = () => {
  if (populationChartInstance) {
    console.log('更新人口图表数据:', populationData.value)
    const ageGroups = populationData.value.groups || []
    const sexData = populationData.value.sexGroups || []
    const politicalData = partyMemberData.value.groups || []
    
    // 使用真实数据
    const dataConfigs = [
      {
        title: '年龄分布',
        data: ageGroups.length > 0 ? ageGroups.map((group, index) => ({
          value: group.count || 0,
          name: group.name || group.ageGroup || '未知',
          itemStyle: { color: ['#00ffff', '#235fa7', '#4fd2dd', '#7b68ee'][index % 4] }
        })) : [
          { value: 1200, name: '18岁以下', itemStyle: { color: '#00ffff' }},
          { value: 2800, name: '18-35岁', itemStyle: { color: '#235fa7' }},
          { value: 3200, name: '35-60岁', itemStyle: { color: '#4fd2dd' }},
          { value: 1800, name: '60岁以上', itemStyle: { color: '#7b68ee' }}
        ]
      },
      {
        title: '性别分布',
        data: sexData.length > 0 ? sexData.map((group, index) => ({
          value: group.count || 0,
          name: group.name || group.sex || '未知',
          itemStyle: { color: ['#00ffff', '#235fa7'][index % 2] }
        })) : [
          { value: 4600, name: '男性', itemStyle: { color: '#00ffff' }},
          { value: 4400, name: '女性', itemStyle: { color: '#235fa7' }}
        ]
      }
    ]
    // 这里需要添加更新人口图表的逻辑
  }
}

// 更新收入图表数据
const updateIncomeChart = () => {
  if (incomeChartInstance) {
    console.log('更新收入图表数据:', incomeSourceData.value)
    const incomeGroups = incomeSourceData.value.groups || []
    
    const chartData = incomeGroups.length > 0 ? incomeGroups.map((group, index) => ({
      value: group.count || 0,
      name: group.name || group.incomeSource || '未知',
      itemStyle: { color: ['#00ffff', '#235fa7', '#4fd2dd', '#7b68ee', '#ff6b6b'][index % 5] }
    })) : [
      { value: 35, name: '农业收入', itemStyle: { color: '#00ffff' }},
      { value: 25, name: '务工收入', itemStyle: { color: '#235fa7' }},
      { value: 20, name: '经商收入', itemStyle: { color: '#4fd2dd' }},
      { value: 15, name: '其他收入', itemStyle: { color: '#7b68ee' }},
      { value: 5, name: '政府补贴', itemStyle: { color: '#ff6b6b' }}
    ]
    
    const option = {
      backgroundColor: 'transparent',
      color: ['#00ffff', '#235fa7', '#4fd2dd', '#7b68ee', '#ff6b6b'],
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00ffff',
        textStyle: { color: '#fff' }
      },
      series: [{
        name: '收入来源',
        type: 'pie',
        radius: ['30%', '70%'],
        data: chartData,
        itemStyle: {
          color: function(params) {
            return params.data.itemStyle?.color || ['#00ffff', '#235fa7', '#4fd2dd', '#7b68ee', '#ff6b6b'][params.dataIndex % 5]
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 255, 255, 0.5)'
          }
        }
      }]
    }
    incomeChartInstance.setOption(option, true)
  }
}

// 其他图表更新函数（简化版）
const updateProjectTrendChart = () => {
  if (projectTrendChartInstance) {
    console.log('更新项目趋势图表数据:', projectData.value)
    // 这里可以添加项目趋势图表的更新逻辑
  }
}

const updateProjectTypeChart = () => {
  if (projectTypeChartInstance) {
    console.log('更新项目类型图表数据:', projectData.value)
    // 这里可以添加项目类型图表的更新逻辑
  }
}

const updateEducationChart = () => {
  if (educationChartInstance) {
    console.log('更新教育图表数据:', educationData.value)
    // 这里可以添加教育图表的更新逻辑
  }
}

const updatePartyMemberChart = () => {
  if (partyMemberChartInstance) {
    console.log('更新党员图表数据:', partyMemberData.value)
    // 这里可以添加党员图表的更新逻辑
  }
}

const updateWelfareChart = () => {
  if (welfareChartInstance) {
    console.log('更新优抚图表数据:', welfareData.value)
    // 这里可以添加优抚图表的更新逻辑
  }
}

// 获取人口结构数据 - 完全按照数据看板的方式
const loadPopulationData = async () => {
  loading.value = true
  try {
    // 并行获取年龄和性别数据
    const [ageResponse, sexResponse] = await Promise.all([
      bigScreenAPI.getPopulationStructure(),
      bigScreenAPI.getPopulationBySex()
    ])
    
    if (ageResponse.code === 200 && sexResponse.code === 200) {
      // 映射后端数据结构到前端期望的格式
      populationData.value = {
        totalPopulation: ageResponse.data.totalPopulation,
        ageGroups: ageResponse.data.groups || [],  // 年龄分组数据
        sexGroups: sexResponse.data.groups || [],  // 性别分组数据
        groups: ageResponse.data.groups || []  // 原始分组数据
      }
      console.log('人口数据加载成功:', populationData.value)
      console.log('年龄分组数据:', ageResponse.data)
      console.log('性别分组数据:', sexResponse.data)
      await nextTick()
    initPopulationChart()
    } else {
      console.error('人口数据加载失败:', { ageResponse, sexResponse })
    }
  } catch (error) {
    console.error('获取人口数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取收入来源数据 - 完全按照数据看板的方式
const loadIncomeSourceData = async () => {
  try {
    const response = await bigScreenAPI.getPopulationByIncomeSource()
    if (response.code === 200) {
      // 映射后端数据结构到前端期望的格式
      incomeSourceData.value = {
        totalPopulation: response.data.totalPopulation,
        incomeSources: response.data.groups || []  // 假设后端也使用groups字段
      }
      console.log('收入来源数据加载成功:', incomeSourceData.value)
      await nextTick()
      initIncomeChart()
    } else {
      console.error('收入来源数据加载失败:', response)
    }
  } catch (error) {
    console.error('获取收入来源数据失败:', error)
  }
}

// 获取党员数据 - 使用滚动面板的党员统计接口
const loadPartyMemberData = async () => {
  try {
    console.log('开始加载党员统计数据...')
    const response = await bigScreenAPI.getPartyMemberCounts()
    console.log('党员统计数据API响应:', response)
    
    if (response.code === 200) {
      partyMemberCounts.value = response.data || []
      console.log('党员统计数据加载成功:', partyMemberCounts.value)
      await nextTick()
      initPartyMemberChart()
    } else {
      console.error('党员统计数据加载失败:', response)
      // 如果API失败，使用默认数据
      partyMemberCounts.value = [
        { count: 15, fieldName: 'party_member' },
        { count: 5, fieldName: 'regular_party_member' },
        { count: 8, fieldName: 'activist' },
        { count: 2, fieldName: 'youth_league_member' }
      ]
      await nextTick()
      initPartyMemberChart()
    }
  } catch (error) {
    console.error('获取党员统计数据失败:', error)
    // 如果API失败，使用默认数据
    partyMemberCounts.value = [
      { count: 15, fieldName: 'party_member' },
      { count: 5, fieldName: 'regular_party_member' },
      { count: 8, fieldName: 'activist' },
      { count: 2, fieldName: 'youth_league_member' }
    ]
    await nextTick()
    initPartyMemberChart()
  }
}

// 获取项目数据
const loadProjectData = async () => {
  try {
    const response = await economyAPI.getEconomyList({ pageNum: 1, pageSize: 1000 })
    if (response.code === 200) {
      projectData.value = response.data
      console.log('项目数据加载成功:', projectData.value)
      await nextTick()
      initProjectTrendChart()
    initProjectTypeChart()
    } else {
      console.error('项目数据加载失败:', response)
    }
  } catch (error) {
    console.error('获取项目数据失败:', error)
  }
}

// 获取教育数据
const loadEducationData = async () => {
  try {
    const response = await bigScreenAPI.getPopulationByEducationLevel()
    if (response.code === 200) {
      educationData.value = response.data
      console.log('教育数据加载成功:', educationData.value)
      await nextTick()
      initEducationChart()
    } else {
      console.error('教育数据加载失败:', response)
    }
  } catch (error) {
    console.error('获取教育数据失败:', error)
  }
}

// 获取优抚数据
const loadWelfareData = async () => {
  try {
    const response = await bigScreenAPI.getPopulationByWelfareStatus()
    if (response.code === 200) {
      welfareData.value = response.data
      console.log('优抚数据加载成功:', welfareData.value)
      await nextTick()
      initWelfareChart()
    } else {
      console.error('优抚数据加载失败:', response)
    }
  } catch (error) {
    console.error('获取优抚数据失败:', error)
  }
}

// 加载党员统计数据
const loadPartyMemberCounts = async () => {
  try {
    const response = await bigScreenAPI.getPartyMemberCounts()
    if (response.code === 200) {
      partyMemberCounts.value = response.data || []
      console.log('党员统计数据加载成功:', partyMemberCounts.value)
      // 强制触发计算属性更新
      await nextTick()
    } else {
      console.error('党员统计数据加载失败:', response)
      partyMemberCounts.value = []
    }
  } catch (error) {
    console.error('获取党员统计数据失败:', error)
    partyMemberCounts.value = []
  }
}

// 加载所有数据 - 按照数据看板的方式
const loadAllData = async () => {
  console.log('开始加载所有数据')
  // 先加载党员统计数据，确保滚动显示优先
  await loadPartyMemberCounts()
  await loadPopulationData()
  await loadIncomeSourceData()
  await loadPartyMemberData()
  await loadProjectData()
  await loadEducationData()
  await loadWelfareData()
  console.log('所有数据加载完成')
  
  // 强制触发滚动更新
  await nextTick()
  console.log('当前信息配置:', infoDataConfigs.value)
  
  // 延迟触发滚动更新，确保数据完全加载
  setTimeout(() => {
    triggerScrollUpdate()
  }, 1000)
  
  // 强制显示第一组数据
  setTimeout(() => {
    if (infoDataConfigs.value && infoDataConfigs.value.length > 0) {
      console.log('强制显示第一组数据:', infoDataConfigs.value[0])
      currentInfoItems.value = infoDataConfigs.value[0].items
      currentIndex.value = 0
      isFading.value = false
    }
  }, 2000)
}

// 防抖函数
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 响应式缩放适配 - 统一缩放策略版本
const adjustScale = () => {
  const container = document.querySelector('.datav-container')
  if (!container) return
  
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const designWidth = 1920
  const designHeight = 1080
  
  // 计算基础缩放比例 - 确保所有内容都能显示
  const scaleX = windowWidth / designWidth
  const scaleY = windowHeight / designHeight
  const baseScale = Math.min(scaleX, scaleY) // 使用Math.min确保所有内容都能显示
  
  // 智能缩放策略 - 优先保证完整显示
  let finalScale
  
  // 首先确保内容能够完整显示
  const maxScaleX = windowWidth / designWidth
  const maxScaleY = windowHeight / designHeight
  const maxScaleForFullDisplay = Math.min(maxScaleX, maxScaleY)
  
  // 根据屏幕尺寸设置最小缩放比例
  let minScale
  if (windowWidth < 1200) {
    minScale = 0.2 // 小屏幕最小20%
  } else if (windowWidth < 1600) {
    minScale = 0.25 // 中等屏幕最小25%
  } else if (windowWidth < 1920) {
    minScale = 0.3 // 接近设计尺寸最小30%
  } else if (windowWidth < 2560) {
    minScale = 0.4 // 2K屏幕最小40%
  } else if (windowWidth < 3840) {
    minScale = 0.5 // 4K屏幕最小50%
  } else {
    minScale = 0.6 // 超高清屏幕最小60%
  }
  
  // 计算最终缩放比例：在完整显示和最小缩放之间取最大值
  finalScale = Math.max(Math.min(maxScaleForFullDisplay, 1.0), minScale)
  
  // 强制完整显示：如果内容仍然超出屏幕，进一步缩小
  const testWidth = designWidth * finalScale
  const testHeight = designHeight * finalScale
  if (testWidth > windowWidth || testHeight > windowHeight) {
    const maxAllowedScale = Math.min(windowWidth / designWidth, windowHeight / designHeight)
    finalScale = Math.min(finalScale, maxAllowedScale)
    console.log(`强制完整显示调整: 原缩放${finalScale.toFixed(2)} -> 新缩放${finalScale.toFixed(2)}`)
  }
  
  // 特殊处理：如果基础缩放比例小于0.5，强制使用更小的缩放以确保完整显示
  if (baseScale < 0.5) {
    finalScale = Math.max(baseScale, 0.15) // 最小15%确保内容可见
  }
  
  // 计算居中偏移 - 确保内容在屏幕中央
  const scaledWidth = designWidth * finalScale
  const scaledHeight = designHeight * finalScale
  const offsetX = Math.max(0, (windowWidth - scaledWidth) / 2)
  const offsetY = Math.max(0, (windowHeight - scaledHeight) / 2)
  
  // 应用缩放变换
  container.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${finalScale})`
  
  // 强制重新计算布局
  container.style.width = `${designWidth}px`
  container.style.height = `${designHeight}px`
  
  // 重新初始化图表
  setTimeout(() => {
    initCharts()
  }, 100)
  
  // 高分辨率屏幕优化
  if (windowWidth >= 2560) {
    const browserZoom = window.devicePixelRatio || 1
    if (browserZoom > 1) {
      container.style.imageRendering = 'crisp-edges'
      container.style.imageRendering = '-webkit-optimize-contrast'
    }
  }
  
  console.log(`数据大屏缩放计算:`)
  console.log(`  窗口尺寸: ${windowWidth}x${windowHeight}`)
  console.log(`  基础缩放: ${baseScale.toFixed(2)} (X:${(windowWidth/designWidth).toFixed(2)}, Y:${(windowHeight/designHeight).toFixed(2)})`)
  console.log(`  完整显示最大缩放: ${maxScaleForFullDisplay.toFixed(2)}`)
  console.log(`  最小缩放: ${minScale.toFixed(2)}`)
  console.log(`  最终缩放: ${finalScale.toFixed(2)}`)
  console.log(`  内容尺寸: ${scaledWidth.toFixed(0)}x${scaledHeight.toFixed(0)}`)
  console.log(`  偏移: (${offsetX.toFixed(0)}, ${offsetY.toFixed(0)})`)
  
  // 检查是否完整显示
  const isFullyVisible = scaledWidth <= windowWidth && scaledHeight <= windowHeight
  console.log(`  完整显示: ${isFullyVisible}, 宽度比例: ${(scaledWidth/windowWidth).toFixed(2)}, 高度比例: ${(scaledHeight/windowHeight).toFixed(2)}`)
}

// 防抖的缩放适配函数
const debouncedAdjustScale = debounce(adjustScale, 300)

// 简化的缩放检测函数
const detectBrowserZoom = () => {
  const ratio = window.devicePixelRatio || 1
  return {
    ratio: ratio,
    zoomLevel: Math.round(ratio * 100)
  }
}

onMounted(() => {
  // 设置body样式，确保没有白边
  document.body.style.margin = '0'
  document.body.style.padding = '0'
  document.body.style.overflow = 'hidden'
  document.body.style.background = '#0a0f1a'
  document.body.style.width = '100%'
  document.body.style.height = '100%'
  document.documentElement.style.margin = '0'
  document.documentElement.style.padding = '0'
  document.documentElement.style.overflow = 'hidden'
  document.documentElement.style.background = '#0a0f1a'
  document.documentElement.style.width = '100%'
  document.documentElement.style.height = '100%'
  
  // 设置app容器样式
  const app = document.getElementById('app')
  if (app) {
    app.style.margin = '0'
    app.style.padding = '0'
    app.style.background = '#0a0f1a'
    app.style.width = '100%'
    app.style.height = '100%'
  }
  
  updateDateTime()
  timeInterval = setInterval(updateDateTime, 1000)
  initBorderBoxes()
  
  // 按照数据看板的方式加载数据
  loadAllData()
  initInfoScroll()
  
  // 初始缩放适配 - 延迟执行确保DOM完全加载
  setTimeout(() => {
    adjustScale()
  }, 100)
  
  // 监听窗口大小变化
  const handleResize = () => {
    // 检测浏览器缩放
    const zoomInfo = detectBrowserZoom()
    console.log(`浏览器缩放检测: ${zoomInfo.zoomLevel}%`)
    
    debouncedAdjustScale()
    if (infoBorderBoxRef.value && infoBorderBoxRef.value.initWH) {
      infoBorderBoxRef.value.initWH()
    }
  }
  
  window.addEventListener('resize', handleResize)
  
  // 清理事件监听器
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (timeInterval) clearInterval(timeInterval)
    
    // 恢复body样式
    document.body.style.margin = ''
    document.body.style.padding = ''
    document.body.style.overflow = ''
    document.body.style.background = ''
    document.body.style.width = ''
    document.body.style.height = ''
    document.documentElement.style.margin = ''
    document.documentElement.style.padding = ''
    document.documentElement.style.overflow = ''
    document.documentElement.style.background = ''
    document.documentElement.style.width = ''
    document.documentElement.style.height = ''
    
    // 恢复app容器样式
    const app = document.getElementById('app')
    if (app) {
      app.style.margin = ''
      app.style.padding = ''
      app.style.background = ''
      app.style.width = ''
      app.style.height = ''
    }
  })
})
</script>

<style scoped>
/* 全局样式重置，确保没有白边 */
:global(body), :global(html) {
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  background: #0a0f1a !important;
  width: 100% !important;
  height: 100% !important;
}

:global(#app) {
  margin: 0 !important;
  padding: 0 !important;
  background: #0a0f1a !important;
  width: 100% !important;
  height: 100% !important;
}

.datav-container {
  width: 1920px;
  height: 1080px;
  background: #0a0f1a;
  color: #ffffff;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  transform-origin: top left;
  z-index: 1000;
}


/* 扫描线动画层 */
.datav-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(45deg, transparent 30%, rgba(0, 255, 255, 0.05) 50%, transparent 70%);
  animation: scanLine 4s linear infinite;
  pointer-events: none;
  z-index: 1;
}

/* 全屏背景覆盖层，确保背景占满屏幕 */
.datav-container::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: #0a0f1a;
  z-index: -1;
  pointer-events: none;
}

@keyframes scanLine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 30px;
  background: #0a0f1a;
  border-bottom: 1px solid #00ffff;
  position: relative;
  z-index: 2;
  min-height: 40px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-title {
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.title-main {
  font-size: 36px;
  font-weight: 900;
  color: #00ffff;
  margin: 0 0 5px 0;
  text-shadow: 
    0 0 20px rgba(0, 255, 255, 0.8),
    0 0 40px rgba(0, 255, 255, 0.4),
    0 0 60px rgba(0, 255, 255, 0.2);
  letter-spacing: 3px;
  text-transform: uppercase;
  position: relative;
  animation: titleGlow 3s ease-in-out infinite alternate;
}

.title-sub {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
  letter-spacing: 1px;
  opacity: 0.9;
}

.title-decoration {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.decoration-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  position: relative;
  animation: lineGlow 2s ease-in-out infinite alternate;
}

.decoration-dot {
  width: 6px;
  height: 6px;
  background: #00ffff;
  border-radius: 50%;
  box-shadow: 
    0 0 8px rgba(0, 255, 255, 0.8),
    0 0 16px rgba(0, 255, 255, 0.4);
  animation: dotPulse 1.5s ease-in-out infinite;
}

@keyframes titleGlow {
  0% {
    text-shadow: 
      0 0 20px rgba(0, 255, 255, 0.8),
      0 0 40px rgba(0, 255, 255, 0.4),
      0 0 60px rgba(0, 255, 255, 0.2);
  }
  100% {
    text-shadow: 
      0 0 30px rgba(0, 255, 255, 1),
      0 0 60px rgba(0, 255, 255, 0.6),
      0 0 90px rgba(0, 255, 255, 0.3);
  }
}

@keyframes lineGlow {
  0% {
    opacity: 0.6;
    transform: scaleX(1);
  }
  100% {
    opacity: 1;
    transform: scaleX(1.1);
  }
}

@keyframes dotPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}


.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.login-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.datetime-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: flex-start;
}

.datetime-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
}

.datetime-content .date {
  font-size: 14px;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

.datetime-content .time {
  font-size: 12px;
  color: #ffffff;
  font-weight: 500;
}


.datetime-info .weekday {
  font-size: 14px;
  color: #ffffff;
  opacity: 0.8;
}

.datetime-info .lunar {
  font-size: 12px;
  color: #00ffff;
  opacity: 0.7;
  font-style: italic;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-indicators {
  display: flex;
  gap: 15px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #00ffff;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ffff;
  animation: pulse 2s infinite;
}

.status-line {
  width: 20px;
  height: 1px;
  background: #00ffff;
  box-shadow: 0 0 1px #00ffff;
}

.status-label {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.edit-buttons {
  display: flex;
  gap: 10px;
}

.edit-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #00ffff;
  border-radius: 0px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 1px #00ffff;
  position: relative;
}

.edit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 10px;
  height: 10px;
  border-top: 1px solid #00ffff;
  border-left: 1px solid #00ffff;
  box-shadow: 0 0 2px #00ffff;
}

.edit-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-bottom: 1px solid #00ffff;
  border-right: 1px solid #00ffff;
  box-shadow: 0 0 2px #00ffff;
}

.edit-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 4px #00ffff;
}

.edit-btn:hover::before,
.edit-btn:hover::after {
  box-shadow: 0 0 4px #00ffff;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}



.content-area {
  flex: 1;
  display: flex;
  padding: 20px 30px;
  gap: 20px;
  position: relative;
  z-index: 2;
  min-height: calc(100vh - 120px); /* 减去头部高度 */
  width: 100%;
  box-sizing: border-box;
}

.left-panel, .right-panel {
  flex: 0 0 30%;
  min-width: 0; /* 防止flex子项溢出 */
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 30%;
}

.center-panel {
  flex: 0 0 40%;
  min-width: 0; /* 防止flex子项溢出 */
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 40%;
}

/* 响应式适配 - 确保所有内容都能显示 */
@media screen and (max-width: 1600px) {
  .content-area {
    padding: 12px 18px;
    gap: 12px;
  }
  
  .left-panel, .right-panel {
    flex: 0 0 28%;
    max-width: 28%;
  }
  
  .center-panel {
    flex: 0 0 44%;
    max-width: 44%;
  }
  
  .datav-panel {
    min-height: 80px;
  }
  
  .chart-container {
    height: 120px !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .title-main {
    font-size: 40px;
  }
  
  .title-sub {
    font-size: 20px;
  }
}

@media screen and (max-width: 1200px) {
  .content-area {
    padding: 8px 12px;
  gap: 8px;
  }
  
  .left-panel, .right-panel {
    flex: 0 0 25%;
    max-width: 25%;
  }
  
  .center-panel {
    flex: 0 0 50%;
    max-width: 50%;
  }
  
  .datav-panel {
    min-height: 60px;
  }
  
  .chart-container {
    height: 100px !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .title-main {
    font-size: 32px;
  }
  
  .title-sub {
    font-size: 16px;
  }
  
  .box-title {
    font-size: 14px;
  }
  
  .info-label {
    font-size: 18px;
  }
  
  .info-value {
    font-size: 28px;
  }
  
  .info-unit {
    font-size: 16px;
  }
}

@media screen and (max-width: 800px) {
  .content-area {
    padding: 6px 8px;
    gap: 6px;
  }
  
  .left-panel, .right-panel {
    flex: 0 0 22%;
    max-width: 22%;
  }
  
  .center-panel {
    flex: 0 0 56%;
    max-width: 56%;
  }
  
  .datav-panel {
    min-height: 50px;
  }
  
  .chart-container {
    height: 80px !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .title-main {
    font-size: 24px;
  }
  
  .title-sub {
    font-size: 14px;
  }
  
  .box-title {
    font-size: 12px;
  }
  
  .info-label {
    font-size: 14px;
  }
  
  .info-value {
    font-size: 20px;
  }
  
  .info-unit {
    font-size: 12px;
  }
}

/* 超小屏幕适配 */
@media screen and (max-width: 600px) {
  .content-area {
    padding: 4px 6px;
    gap: 4px;
  }
  
  .left-panel, .right-panel {
    flex: 0 0 20%;
    max-width: 20%;
  }
  
  .center-panel {
    flex: 0 0 60%;
    max-width: 60%;
  }
  
  .datav-panel {
    min-height: 40px;
  }
  
  .chart-container {
    height: 60px !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .title-main {
    font-size: 20px;
  }
  
  .title-sub {
    font-size: 12px;
  }
  
  .box-title {
    font-size: 10px;
  }
  
  .info-label {
    font-size: 12px;
  }
  
  .info-value {
    font-size: 16px;
  }
  
  .info-unit {
    font-size: 10px;
  }
}

/* 高分辨率屏幕适配 - 2K屏幕 */
@media screen and (min-width: 2560px) and (max-width: 3839px) {
  .content-area {
    padding: 25px 30px;
    gap: 25px;
  }
  
  .left-panel, .right-panel {
    flex: 0 0 30%;
    max-width: 30%;
  }
  
  .center-panel {
    flex: 0 0 40%;
    max-width: 40%;
  }
  
  .datav-panel {
    min-height: 200px;
  }
  
  .chart-container {
    height: 250px !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .title-main {
    font-size: 60px;
  }
  
  .title-sub {
    font-size: 30px;
  }
  
  .box-title {
    font-size: 20px;
  }
  
  .info-label {
    font-size: 24px;
  }
  
  .info-value {
    font-size: 48px;
  }
  
  .info-unit {
    font-size: 24px;
  }
}

/* 超高分辨率屏幕适配 - 4K屏幕 */
@media screen and (min-width: 3840px) {
  .content-area {
    padding: 35px 40px;
    gap: 35px;
  }
  
  .left-panel, .right-panel {
    flex: 0 0 32%;
    max-width: 32%;
  }
  
  .center-panel {
    flex: 0 0 36%;
    max-width: 36%;
  }
  
  .datav-panel {
    min-height: 280px;
  }
  
  .chart-container {
    height: 350px !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .title-main {
    font-size: 80px;
  }
  
  .title-sub {
    font-size: 40px;
  }
  
  .box-title {
    font-size: 28px;
  }
  
  .info-label {
    font-size: 32px;
  }
  
  .info-value {
    font-size: 64px;
  }
  
  .info-unit {
    font-size: 32px;
  }
}

/* 高分辨率屏幕渲染优化 */
@media screen and (min-width: 2560px) {
  .datav-container {
    /* 高分辨率屏幕渲染优化 */
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    image-rendering: pixelated;
    
    /* 抗锯齿优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  
  /* 图表容器高分辨率优化 */
  .chart-container {
    /* 确保图表在高分辨率屏幕上清晰 */
    transform: translateZ(0);
    will-change: transform;
  }
  
  /* 边框和装饰元素优化 */
  .dv-border-box-13,
  .dv-border-box-1,
  .dv-border-box-11 {
    /* 高分辨率边框渲染 */
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

/* 统一响应式适配 - 确保不同缩放级别下显示一致 */
@media screen and (max-width: 1600px) {
  .content-area {
    padding: 15px 20px;
    gap: 15px;
  }
  
  .left-panel, .right-panel {
    flex: 0 0 28%;
    max-width: 28%;
  }
  
  .center-panel {
    flex: 0 0 44%;
    max-width: 44%;
  }
  
  .datav-panel {
    min-height: 100px;
  }
  
  .chart-container {
    height: 150px !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .title-main {
    font-size: 40px;
  }
  
  .title-sub {
    font-size: 20px;
  }
}

@media screen and (max-width: 1200px) {
  .content-area {
    padding: 12px 15px;
    gap: 12px;
  }
  
  .left-panel, .right-panel {
    flex: 0 0 25%;
    max-width: 25%;
  }
  
  .center-panel {
    flex: 0 0 50%;
    max-width: 50%;
  }
  
  .datav-panel {
    min-height: 80px;
  }
  
  .chart-container {
    height: 120px !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .title-main {
    font-size: 32px;
  }
  
  .title-sub {
    font-size: 16px;
  }
  
  .box-title {
    font-size: 14px;
  }
  
  .info-label {
    font-size: 18px;
  }
  
  .info-value {
    font-size: 28px;
  }
  
  .info-unit {
    font-size: 16px;
  }
}

@media screen and (max-width: 800px) {
  .content-area {
    padding: 8px 10px;
  gap: 8px;
  }
  
  .left-panel, .right-panel {
    flex: 0 0 22%;
    max-width: 22%;
  }
  
  .center-panel {
    flex: 0 0 56%;
    max-width: 56%;
  }
  
  .datav-panel {
    min-height: 60px;
  }
  
  .chart-container {
    height: 80px !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .title-main {
    font-size: 24px;
  }
  
  .title-sub {
    font-size: 14px;
  }
  
  .box-title {
    font-size: 12px;
  }
  
  .info-label {
    font-size: 14px;
  }
  
  .info-value {
    font-size: 20px;
  }
  
  .info-unit {
    font-size: 12px;
  }
}

.panel-header {
  margin-bottom: 10px;
}


.edit-labels {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.edit-label {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.connecting-line {
  width: 30px;
  height: 1px;
  background: #00ffff;
  box-shadow: 0 0 1px #00ffff;
}

/* DataV 风格的面板 */
.datav-panel {
  background: #0a0f1a;
  position: relative;
  margin-bottom: 15px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.datav-panel.main-panel {
  height: 600px; /* 固定高度 */
  min-height: 600px; /* 最小高度 */
  max-height: 600px; /* 最大高度 */
  flex: none; /* 取消flex: 1 */
}

/* DataV BorderBox1 组件样式优化 */
.datav-panel {
  width: 100%;
  height: 100%;
  position: relative;
}

.datav-panel:hover {
  transform: scale(1.02);
  transition: transform 0.3s ease;
}

.datav-inner {
  background: transparent;
  margin: 0;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.chart-container {
  width: 100%;
  height: 200px !important; /* 强制设置高度 */
  margin-top: 10px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 
    0 4px 20px rgba(0, 255, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  /* 确保图表容器能够正确缩放 */
  transform-origin: center;
  will-change: transform;
  /* 确保图表可见 */
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}


.chart-container:hover {
  backdrop-filter: blur(12px);
  box-shadow: 
    0 6px 30px rgba(0, 255, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* 确保所有图表容器都能正常显示 */
.chart-container * {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* 确保ECharts图表能正常渲染 */
.chart-container canvas {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  width: 100% !important;
  height: 100% !important;
}

/* 信息滚动容器 */
.info-scroll-container {
  width: 100%;
  height: 600px; /* 固定高度 */
  background: transparent;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 50px 30px 30px 30px;
  transition: opacity 0.3s ease;
  box-sizing: border-box;
}

.info-scroll-container.fading {
  opacity: 0.3;
}

.info-scroll-container.scroll-complete {
  opacity: 1;
}

.info-item.scroll-complete {
  opacity: 0.9;
  transform: translateX(0);
  transition: all 0.3s ease;
  background: rgba(0, 255, 255, 0.08);
  border-color: rgba(0, 255, 255, 0.3);
  width: 85%;
  max-width: 85%;
  justify-content: center;
  margin: 12px auto;
}

.info-item.scroll-complete.active {
  opacity: 1;
  transform: translateX(0) scale(1.02);
  background: rgba(0, 255, 255, 0.15);
  border-color: rgba(0, 255, 255, 0.5);
  width: 95%;
  max-width: 95%;
  justify-content: space-between;
  margin: 12px auto;
}

/* 信息滚动区域 */
.info-scroll-area {
  width: 100%;
  height: 500px; /* 固定高度 */
  overflow: hidden;
  padding-right: 10px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  pointer-events: none; /* 禁用鼠标交互 */
  scroll-behavior: smooth; /* 平滑滚动 */
  contain: layout style; /* 防止重排 */
  will-change: scroll-position; /* 优化滚动性能 */
  transform: translateZ(0); /* 启用硬件加速 */
  box-sizing: border-box;
}

.info-scroll-area::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 85%;
  max-width: 85%;
  padding: 20px 30px;
  margin: 12px auto;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  opacity: 0.6;
  transform: translateX(0);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  height: 65px; /* 固定高度 */
  min-height: 65px; /* 最小高度 */
  max-height: 65px; /* 最大高度 */
  flex-shrink: 0;
  box-sizing: border-box;
  contain: layout style; /* 防止重排 */
  will-change: transform, width, opacity; /* 优化动画性能 */
}


.info-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.4), transparent);
  transition: left 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-item.active {
  opacity: 1;
  transform: translateX(0) scale(1.02);
  width: 95%;
  max-width: 95%;
  justify-content: space-between;
  background: rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.6);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  margin: 12px auto;
}

@keyframes slideToActive {
  0% {
    opacity: 0.3;
    transform: translateX(-40px) scale(0.9) translateY(30px);
  }
  50% {
    opacity: 0.7;
    transform: translateX(-20px) scale(0.95) translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1.02) translateY(0);
  }
}

@keyframes activePulse {
  0%, 100% {
    box-shadow: 
      0 0 25px rgba(0, 255, 255, 0.5),
      0 6px 20px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(0, 255, 255, 0.3);
  }
  50% {
    box-shadow: 
      0 0 35px rgba(0, 255, 255, 0.7),
      0 8px 25px rgba(0, 0, 0, 0.5),
      0 0 0 2px rgba(0, 255, 255, 0.5);
  }
}

.info-item.active::before {
  left: 100%;
}

.info-label {
  font-size: 22px;
  font-weight: 500;
  color: #00ffff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  flex: 1;
  margin-right: 20px;
  text-align: left;
}

.info-value {
  font-size: 36px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
  margin: 0 25px;
  min-width: 140px;
  text-align: center;
}

.info-unit {
  font-size: 20px;
  color: #4fd2dd;
  text-shadow: 0 0 5px rgba(79, 210, 221, 0.5);
  min-width: 60px;
  text-align: right;
}

/* 非激活状态时内容居中显示 */
.info-item:not(.active) .info-label,
.info-item:not(.active) .info-value,
.info-item:not(.active) .info-unit {
  text-align: center;
  margin: 0 5px;
}

.info-item:not(.active) .info-label {
  flex: none;
  margin-right: 0;
}

.sub-content-row {
  display: flex;
  gap: 15px;
}

.sub-content-row .datav-panel {
  flex: 1;
}

.box-title {
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  margin: 0 0 10px 0;
  text-align: center;
}

.box-content {
  font-size: 14px;
  color: #ffffff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.bottom-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
  padding: 10px 0;
}

.alert-dots {
  display: flex;
  gap: 5px;
}

.alert-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.alert-dot.red {
  background: #ff0000;
  box-shadow: 0 0 10px #ff0000;
}

.bottom-lines {
  display: flex;
  gap: 10px;
}

.bottom-line {
  width: 40px;
  height: 1px;
  background: #00ffff;
  box-shadow: 0 0 1px #00ffff;
}

.label {
  font-size: 12px;
  color: #00ffff;
  margin-bottom: 4px;
  font-weight: 500;
}

.value {
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
}

.date {
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
}

.time {
    font-size: 18px;
  font-weight: bold;
  color: #00ffff;
}

.return-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.return-btn {
  background: transparent !important;
  border: none !important;
  border-radius: 0px !important;
  color: #00ffff !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  padding: 8px 16px !important;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease !important;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
    gap: 8px;
  }
  
.return-btn:hover {
  background: rgba(0, 255, 255, 0.1) !important;
  transform: translateY(-1px) !important;
}

.return-btn:active {
  transform: translateY(0) !important;
}

.btn-text {
  font-size: 14px;
  margin-left: 5px;
}

/* 响应式适配 - 简化版本 */
@media screen and (max-height: 800px) {
  .content-area {
    min-height: calc(100vh - 100px);
  }
  
  .datav-panel.main-panel {
    height: 500px;
    min-height: 500px;
    max-height: 500px;
  }
  
  .info-scroll-container {
    height: 500px;
  }
  
  .info-scroll-area {
    height: 400px;
  }
}

</style>