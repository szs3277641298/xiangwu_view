<template>
  <div class="big-screen-container">
    <!-- 顶部标题区域 -->
    <div class="header-section">
      <div class="header-left">
        <div class="title-container">
          <div class="title-with-icon">
            <el-icon class="title-icon"><DataBoard /></el-icon>
            <h1 class="main-title">乡村数据大屏</h1>
          </div>
          <div class="decoration-line"></div>
        </div>
      </div>

      <div class="header-center">
        <div class="time-display">
          <div class="time-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="time-content">
            <div class="date">{{ currentDate }}</div>
            <div class="time">{{ currentTime }}</div>
          </div>
        </div>
      </div>

      <div class="header-right">
        <div class="return-button">
            <el-button @click="returnToSystem" type="primary" class="return-btn">
              <el-icon><ArrowLeft /></el-icon>
              <span class="btn-text">返回系统</span>
            </el-button>
        </div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="content-area">
      <!-- 左侧图表区 -->
      <div class="left-panel">
        <div class="chart-row">
          <!-- 人口结构分布（7个结构分布接口 Tab） -->
          <div class="chart-box" 
               @mouseenter="autoplayHooks.populationStructure.onMouseEnter"
               @mouseleave="autoplayHooks.populationStructure.onMouseLeave">
            <div class="custom-chart-border">
              <div class="chart-header">
                <h3 class="chart-title">人口结构分布</h3>
                <el-tabs v-model="activeTabs.populationStructure" @tab-change="handleTabChange('populationStructure')" class="mini-tabs">
                  <el-tab-pane label="年龄" name="age" />
                  <el-tab-pane label="收入来源" name="incomeSource" />
                  <el-tab-pane label="政治面貌" name="politicalStatus" />
                  <el-tab-pane label="性别" name="sex" />
                  <el-tab-pane label="学历" name="educationLevel" />
                  <el-tab-pane label="福利" name="welfareStatus" />
                  <el-tab-pane label="婚姻" name="maritalStatus" />
                </el-tabs>
                <div v-if="groupProportionAvailable.populationStructure" class="mode-toggle">
                  <el-radio-group v-model="displayModes.populationStructure" size="small" @change="redrawChart('populationStructure')">
                    <el-radio-button label="count">数量</el-radio-button>
                    <el-radio-button label="proportion">占比</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <div ref="ageChart" class="chart-container">
                <div v-if="noData.populationStructure" class="no-data-overlay">暂无数据</div>
              </div>
              <div v-if="chartLoading.populationStructure" class="chart-loading">加载中...</div>
            </div>
          </div>

          <!-- 基础身份计数 -->
          <div class="chart-box"
               @mouseenter="autoplayHooks.basicIdentity.onMouseEnter"
               @mouseleave="autoplayHooks.basicIdentity.onMouseLeave">
            <div class="custom-chart-border">
              <div class="chart-header">
                <h3 class="chart-title">基础身份计数</h3>
                <el-tabs v-model="activeTabs.basicIdentity" @tab-change="handleTabChange('basicIdentity')" class="mini-tabs">
                  <el-tab-pane label="布尔类" name="boolen" />
                  <el-tab-pane label="党员" name="partyMember" />
                  <el-tab-pane label="村民" name="villageResident" />
                </el-tabs>
                <div v-if="groupProportionAvailable.basicIdentity" class="mode-toggle">
                  <el-radio-group v-model="displayModes.basicIdentity" size="small" @change="redrawChart('basicIdentity')">
                    <el-radio-button label="count">数量</el-radio-button>
                    <el-radio-button label="proportion">占比</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <div ref="healthChart" class="chart-container">
                <div v-if="noData.basicIdentity" class="no-data-overlay">暂无数据</div>
              </div>
              <div v-if="chartLoading.basicIdentity" class="chart-loading">加载中...</div>
            </div>
          </div>
        </div>

        <div class="chart-row">
          <!-- 健康与困难状况 -->
          <div class="chart-box full-width"
               @mouseenter="autoplayHooks.healthDifficulty.onMouseEnter"
               @mouseleave="autoplayHooks.healthDifficulty.onMouseLeave">
            <div class="custom-chart-border">
              <div class="chart-header">
                <h3 class="chart-title">健康与困难状况</h3>
                <el-tabs v-model="activeTabs.healthDifficulty" @tab-change="handleTabChange('healthDifficulty')" class="mini-tabs">
                  <el-tab-pane label="健康" name="health" />
                  <el-tab-pane label="贫困" name="poverty" />
                  <el-tab-pane label="残疾" name="disability" />
                </el-tabs>
                <div v-if="groupProportionAvailable.healthDifficulty" class="mode-toggle">
                  <el-radio-group v-model="displayModes.healthDifficulty" size="small" @change="redrawChart('healthDifficulty')">
                    <el-radio-button label="count">数量</el-radio-button>
                    <el-radio-button label="proportion">占比</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <div ref="educationChart" class="chart-container">
                <div v-if="noData.healthDifficulty" class="no-data-overlay">暂无数据</div>
              </div>
              <div v-if="chartLoading.healthDifficulty" class="chart-loading">加载中...</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间滚动显示区 + 图表（优抚与家庭类） -->
      <div class="center-panel">
        <!-- 上部：滚动信息（KPI / 概览） -->
        <div class="info-section">
          <div class="kpi-custom-border">
            <div class="border-title">村庄综合概览</div>
            <div class="kpi-content-root">
              <div class="info-scroll-container" @mouseenter="pauseScroll" @mouseleave="resumeScroll">
                <div class="info-scroll-area">
                  <!-- 所有数据项都会被渲染(DOM中存在),容器固定高度375px,超出部分隐藏,通过transform滚动显示 -->
                  <div class="credits-container" v-if="displayItems.length > 0" :style="{ height: containerHeight + 'px', maxHeight: containerHeight + 'px', minHeight: containerHeight + 'px' }">
                    <div class="credits-wrapper">
                      <!-- 渐隐遮罩（叠加层） -->
                      <div class="fade-overlay top"></div>
                      <div class="fade-overlay bottom"></div>
                      <div ref="creditsContentRef" class="credits-content" :style="{ transform: `translate3d(0, ${scrollOffset}px, 0)` }">
                        <div
                          class="credit-item"
                          :class="{ active: index === currentItemIndex }"
                          v-for="(item, index) in displayItems"
                          :key="item.label + '-' + index"
                        >
                          <div class="credit-row">
                            <div class="credit-label" :title="item.label">{{ item.label }}</div>
                            <div class="credit-value">
                              <span class="credit-number">{{ formatDisplayValue(item.value, item.unit) }}</span>
                              <span class="credit-unit" v-if="item.unit">{{ item.unit }}</span>
                            </div>
                          </div>
                          <div class="credit-progress" v-if="displayItems.length > 0">
                            <div class="credit-progress-bar" :style="{ width: ((index+1)/displayItems.length*100).toFixed(2) + '%' }"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="loading-text" v-if="displayItems.length === 0 && kpiLoading">正在加载数据...</div>
                  <div class="loading-text" v-if="displayItems.length === 0 && !kpiLoading">暂无数据</div>
                </div>
              </div>
              <div class="group-indicators" v-if="kpiDataGroups.length > 1">
                <span v-for="i in kpiDataGroups.length" :key="'ind-'+(i-1)" :class="['indicator-dot', { active: (i-1) === currentDataGroup }]" @click="jumpToGroup(i-1)"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 下部：优抚与家庭类图表 -->
        <div class="chart-section">
          <div class="chart-box"
               @mouseenter="autoplayHooks.priorityFamily.onMouseEnter"
               @mouseleave="autoplayHooks.priorityFamily.onMouseLeave">
            <div class="custom-chart-border">
              <div class="chart-header">
                <h3 class="chart-title">优抚与家庭类</h3>
                <el-tabs v-model="activeTabs.priorityFamily" @tab-change="handleTabChange('priorityFamily')" class="mini-tabs">
                  <el-tab-pane label="独生子女" name="onlyChild" />
                  <el-tab-pane label="烈士家庭" name="martyrFamily" />
                  <el-tab-pane label="其他补助" name="otherSubsidy" />
                </el-tabs>
                <div v-if="groupProportionAvailable.priorityFamily" class="mode-toggle">
                  <el-radio-group v-model="displayModes.priorityFamily" size="small" @change="redrawChart('priorityFamily')">
                    <el-radio-button label="count">数量</el-radio-button>
                    <el-radio-button label="proportion">占比</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <div ref="committeeChart" class="chart-container">
                <div v-if="noData.priorityFamily" class="no-data-overlay">暂无数据</div>
              </div>
              <div v-if="chartLoading.priorityFamily" class="chart-loading">加载中...</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧图表区 -->
      <div class="right-panel">
        <div class="chart-row">
          <!-- 居住与退役身份 -->
          <div class="chart-box"
               @mouseenter="autoplayHooks.residenceVeteran.onMouseEnter"
               @mouseleave="autoplayHooks.residenceVeteran.onMouseLeave">
            <div class="custom-chart-border">
              <div class="chart-header">
                <h3 class="chart-title">居住与退役身份</h3>
                <el-tabs v-model="activeTabs.residenceVeteran" @tab-change="handleTabChange('residenceVeteran')" class="mini-tabs">
                  <el-tab-pane label="常住情况" name="residence" />
                  <el-tab-pane label="退役情况" name="veteran" />
                </el-tabs>
                <div v-if="groupProportionAvailable.residenceVeteran" class="mode-toggle">
                  <el-radio-group v-model="displayModes.residenceVeteran" size="small" @change="redrawChart('residenceVeteran')">
                    <el-radio-button label="count">数量</el-radio-button>
                    <el-radio-button label="proportion">占比</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <div ref="partyChart" class="chart-container">
                <div v-if="noData.residenceVeteran" class="no-data-overlay">暂无数据</div>
              </div>
              <div v-if="chartLoading.residenceVeteran" class="chart-loading">加载中...</div>
            </div>
          </div>

          <!-- 集体经济（项目与投资） -->
          <div class="chart-box"
               @mouseenter="autoplayHooks.economyProjectInvestment.onMouseEnter"
               @mouseleave="autoplayHooks.economyProjectInvestment.onMouseLeave">
            <div class="custom-chart-border">
              <div class="chart-header">
                <h3 class="chart-title">集体经济（项目与投资）</h3>
                <el-tabs v-model="activeTabs.economyProjectInvestment" @tab-change="handleTabChange('economyProjectInvestment')" class="mini-tabs">
                  <el-tab-pane label="项目状态" name="project" />
                  <el-tab-pane label="投资指标" name="investment" />
                </el-tabs>
                <div v-if="groupProportionAvailable.economyProjectInvestment" class="mode-toggle">
                  <el-radio-group v-model="displayModes.economyProjectInvestment" size="small" @change="redrawChart('economyProjectInvestment')">
                    <el-radio-button label="count">数量</el-radio-button>
                    <el-radio-button label="proportion">占比</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <div ref="maritalChart" class="chart-container">
                <div v-if="noData.economyProjectInvestment" class="no-data-overlay">暂无数据</div>
              </div>
              <div v-if="chartLoading.economyProjectInvestment" class="chart-loading">加载中...</div>
            </div>
          </div>
        </div>

        <div class="chart-row">
          <!-- 集体经济（收入与收支） -->
          <div class="chart-box full-width"
               @mouseenter="autoplayHooks.economyRevenueTransaction.onMouseEnter"
               @mouseleave="autoplayHooks.economyRevenueTransaction.onMouseLeave">
            <div class="custom-chart-border">
              <div class="chart-header">
                <h3 class="chart-title">集体经济（收入与收支）</h3>
                <el-tabs v-model="activeTabs.economyRevenueTransaction" @tab-change="handleTabChange('economyRevenueTransaction')" class="mini-tabs">
                  <el-tab-pane label="收入统计" name="revenue" />
                  <el-tab-pane label="收支统计" name="transaction" />
                </el-tabs>
                <div v-if="groupProportionAvailable.economyRevenueTransaction" class="mode-toggle">
                  <el-radio-group v-model="displayModes.economyRevenueTransaction" size="small" @change="redrawChart('economyRevenueTransaction')">
                    <el-radio-button label="count">数量</el-radio-button>
                    <el-radio-button label="proportion">占比</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <div ref="economyChart" class="chart-container">
                <div v-if="noData.economyRevenueTransaction" class="no-data-overlay">暂无数据</div>
              </div>
              <div v-if="chartLoading.economyRevenueTransaction" class="chart-loading">加载中...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { ArrowLeft, DataBoard, Clock } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { bigScreenAPI } from '@/api/api'
import { useRouter } from 'vue-router'
import { useTabAutoplay } from '@/hooks/useTabAutoplay'
import {
  screenGradients,
  gridTokens,
  axisTokens,
  titleTokens,
  tooltipTokens,
  legendTokens,
  formatNumber,
  createLinearGradient,
  getCategoryColor
} from '@/theme/palette'

/* ===================== 基础状态 ===================== */
const currentDate = ref('')
const currentTime = ref('')
let timeInterval: any = null

// 图表 DOM 引用
const ageChart = ref(null)
const healthChart = ref(null)
const educationChart = ref(null)
const partyChart = ref(null)
const maritalChart = ref(null)
const economyChart = ref(null)
const committeeChart = ref(null)

// ECharts 实例缓存
const chartInstances = reactive({
  populationStructure: null,
  basicIdentity: null,
  healthDifficulty: null,
  priorityFamily: null,
  residenceVeteran: null,
  economyProjectInvestment: null,
  economyRevenueTransaction: null
})

// Tabs 激活值
const activeTabs = reactive({
  populationStructure: 'age',
  basicIdentity: 'boolen',
  healthDifficulty: 'health',
  priorityFamily: 'onlyChild',
  residenceVeteran: 'residence',
  economyProjectInvestment: 'project',
  economyRevenueTransaction: 'revenue'
})

// 加载状态 & 无数据标记
const chartLoading = reactive<Record<string, boolean>>({
  populationStructure: false,
  basicIdentity: false,
  healthDifficulty: false,
  priorityFamily: false,
  residenceVeteran: false,
  economyProjectInvestment: false,
  economyRevenueTransaction: false
})
const noData = reactive<Record<string, boolean>>({
  populationStructure: false,
  basicIdentity: false,
  healthDifficulty: false,
  priorityFamily: false,
  residenceVeteran: false,
  economyProjectInvestment: false,
  economyRevenueTransaction: false
})

// 模式切换（数量/占比）
const displayModes = reactive<Record<string, 'count' | 'proportion'>>({
  populationStructure: 'count',
  basicIdentity: 'count',
  healthDifficulty: 'count',
  priorityFamily: 'count',
  residenceVeteran: 'count',
  economyProjectInvestment: 'count',
  economyRevenueTransaction: 'count'
})

// 数据缓存 & 占比可用性
const groupDataCache = reactive<Record<string, any>>({})
const groupProportionAvailable = reactive<Record<string, boolean>>({
  populationStructure: false,
  basicIdentity: false,
  healthDifficulty: false,
  priorityFamily: false,
  residenceVeteran: false,
  economyProjectInvestment: false,
  economyRevenueTransaction: false
})

/* ===================== KPI 滚动状态 ===================== */
const displayItems = ref<any[]>([])
const kpiDataGroups = ref<any[][]>([])
const currentDataGroup = ref(0)
const currentItemIndex = ref(0)
const isScrolling = ref(false)          // true 表示“暂停”
const kpiLoading = ref(true)
const scrollOffset = ref(0)
const scrollSpeedPerSec = 48

// 动态高度测量
const creditsContentRef = ref<HTMLElement | null>(null)
const measuredItemHeight = ref(75)
const visibleItems = computed(() => displayItems.value.length)
const containerHeight = computed(() => measuredItemHeight.value * visibleItems.value)
function measureFirstItemHeight() {
  nextTick(() => {
    const root = creditsContentRef.value
    const first = root?.querySelector('.credit-item') as HTMLElement | null
    if (!first) return
    const style = window.getComputedStyle(first)
    const h = first.getBoundingClientRect().height + (parseFloat(style.marginBottom) || 0)
    if (h > 0 && Math.abs(h - measuredItemHeight.value) > 0.5) measuredItemHeight.value = h
  })
}

/* ===================== 图表/接口映射 ===================== */
const fetchMap: Record<string, Record<string, Function>> = {
  populationStructure: {
    age: bigScreenAPI.getPopulationByAge,
    incomeSource: bigScreenAPI.getPopulationByIncomeSource,
    politicalStatus: bigScreenAPI.getPopulationByPoliticalStatus,
    sex: bigScreenAPI.getPopulationBySex,
    educationLevel: bigScreenAPI.getPopulationByEducationLevel,
    welfareStatus: bigScreenAPI.getPopulationByWelfareStatus,
    maritalStatus: bigScreenAPI.getPopulationByMaritalStatus
  },
  basicIdentity: {
    boolen: bigScreenAPI.getBoolenCount,
    partyMember: bigScreenAPI.getPartyMemberCounts,
    villageResident: bigScreenAPI.getVillageResidentCounts
  },
  healthDifficulty: {
    health: bigScreenAPI.getHealthStatusCounts,
    poverty: bigScreenAPI.getPovertyCounts,
    disability: bigScreenAPI.getDisabilityCounts
  },
  priorityFamily: {
    onlyChild: bigScreenAPI.getOnlyChildFamilyCounts,
    martyrFamily: bigScreenAPI.getMartyrFamilyCounts,
    otherSubsidy: bigScreenAPI.getOtherSubsidyCounts
  },
  residenceVeteran: {
    residence: bigScreenAPI.getResidenceCounts,
    veteran: bigScreenAPI.getVeteranCounts
  },
  economyProjectInvestment: {
    project: bigScreenAPI.getEconomyProjectStats,
    investment: bigScreenAPI.getEconomyInvestmentStats
  },
  economyRevenueTransaction: {
    revenue: bigScreenAPI.getEconomyRevenueStats,
    transaction: bigScreenAPI.getEconomyTransactionStats
  }
}

const titleMap: Record<string, string> = {
  populationStructure: '人口结构分布',
  basicIdentity: '基础身份计数',
  healthDifficulty: '健康与困难状况',
  priorityFamily: '优抚与家庭类',
  residenceVeteran: '居住与退役身份',
  economyProjectInvestment: '集体经济（项目与投资）',
  economyRevenueTransaction: '集体经济（收入与收支）'
}

const containerMap: Record<string, any> = {
  populationStructure: ageChart,
  basicIdentity: healthChart,
  healthDifficulty: educationChart,
  priorityFamily: committeeChart,
  residenceVeteran: partyChart,
  economyProjectInvestment: maritalChart,
  economyRevenueTransaction: economyChart
}

/* ===================== 通用函数 ===================== */
function updateDateTime() {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const router = useRouter()
function returnToSystem() { router.push('/') }

function tabLabel(_group: string, tabKey: string) {
  const labelMap: Record<string, string> = {
    age: '年龄', incomeSource: '收入来源', politicalStatus: '政治面貌', sex: '性别', educationLevel: '学历', welfareStatus: '福利', maritalStatus: '婚姻',
    boolen: '布尔类', partyMember: '党员', villageResident: '村民',
    health: '健康', poverty: '贫困', disability: '残疾',
    onlyChild: '独生子女', martyrFamily: '烈士家庭', otherSubsidy: '其他补助',
    residence: '常住情况', veteran: '退役情况',
    project: '项目状态', investment: '投资指标',
    revenue: '收入统计', transaction: '收支统计'
  }
  return labelMap[tabKey] || tabKey
}

function formatDisplayValue(val: any, unit: string) {
  if (val == null || val === '' || isNaN(Number(val))) return '-'
  const value = Number(val)
  const isPercent = unit === '%'
  const isMoney = /amount|investment|revenue|income|expense|fund|money|元|万|亿/i.test(unit || '')
  if (isPercent) return formatNumber(value, { type: 'percent' }) + '%'
  if (isMoney) return formatNumber(value, { type: 'money' })
  return formatNumber(value, { type: 'default' })
}

/* ===================== KPI 滚动逻辑 ===================== */
function updateCurrentHighlight() {
  if (!displayItems.value.length) { currentItemIndex.value = -1; return }
  const offset = Math.max(0, Math.abs(scrollOffset.value))
  const newIndex = Math.min(displayItems.value.length - 1, Math.max(0, Math.floor(offset / measuredItemHeight.value + 0.0001)))
  if (newIndex !== currentItemIndex.value) currentItemIndex.value = newIndex
}

function pauseScroll() { isScrolling.value = true }
function resumeScroll() { isScrolling.value = false }

function jumpToGroup(index: number) {
  if (index < 0 || index >= kpiDataGroups.value.length) return
  if (index === currentDataGroup.value) return
  currentDataGroup.value = index
  displayItems.value = [...kpiDataGroups.value[index]]
  scrollOffset.value = 0
  groupSwitchTime = performance.now()
  currentItemIndex.value = 0
  updateCurrentHighlight()
  measureFirstItemHeight()
}

const safeCall = async (fn: Function) => { try { return await fn() } catch { return null } }

const fetchKpiData = async () => {
  kpiLoading.value = true
  try {
    const [totalPop, overview, economyOverview, partyRate, partyOverview, committeeOverview, villageOverview] = await Promise.all([
      safeCall(bigScreenAPI.getTotalPopulation),
      safeCall(bigScreenAPI.getOverview),
      safeCall(bigScreenAPI.getEconomyOverview),
      safeCall(bigScreenAPI.getPartyDuesRateStats),
      safeCall(bigScreenAPI.getPartyDuesOverview),
      safeCall(bigScreenAPI.getCommitteeOverview),
      safeCall(bigScreenAPI.getVillageComprehensiveOverview)
    ])
    const flatten = (obj: any, unit = '') => (obj && typeof obj === 'object') ? Object.keys(obj).map(k => ({ label: k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim(), value: obj[k], unit })) : []
    const groups: any[][] = []
    const g1: any[] = []
    if (totalPop && (totalPop.data || totalPop.value)) {
      const val = (totalPop.data?.total || totalPop.data?.value || totalPop.value || totalPop.data) || 0
      g1.push({ label: '总人口', value: val, unit: '人' })
    }
    g1.push(...flatten(overview?.data || overview))
    if (g1.length) groups.push(g1)
    const g2 = flatten(economyOverview?.data || economyOverview); if (g2.length) groups.push(g2)
    const g3: any[] = []
    if (partyRate) {
      const rateVal = (partyRate.data?.rate || partyRate.data?.value || partyRate.rate) ?? partyRate.data
      if (rateVal !== undefined) g3.push({ label: '党费缴费率', value: rateVal, unit: '%' })
    }
    g3.push(...flatten(partyOverview?.data || partyOverview)); if (g3.length) groups.push(g3)
    const g4 = flatten(committeeOverview?.data || committeeOverview); if (g4.length) groups.push(g4)
    const g5 = flatten(villageOverview?.data || villageOverview); if (g5.length) groups.push(g5)
    kpiDataGroups.value = groups
    if (groups.length) {
      currentDataGroup.value = 0
      displayItems.value = [...groups[0]]
      currentItemIndex.value = 0 // 确保从第一条开始
      nextTick(() => {
        updateCurrentHighlight()
        startDataScroll() // 数据加载完成后自动启动滚动
      })
    }
  } finally { kpiLoading.value = false }
}

// 动画控制变量
let animationFrameId: number | null = null
const pauseDuration = 2000
let groupSwitchTime = 0
let lastScrollTimestamp = 0
const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
let wasPausedByVisibility = false

function startDataScroll() {
  stopDataScroll()
  isScrolling.value = false
  groupSwitchTime = 0
  lastScrollTimestamp = 0
  measureFirstItemHeight()
  animateScroll()
}

function animateScroll() {
  const items = displayItems.value
  if (!isScrolling.value && items.length) {
    scrollOffset.value = -currentItemIndex.value * measuredItemHeight.value
    updateCurrentHighlight()
    if (currentItemIndex.value < items.length - 1) {
      setTimeout(() => {
        currentItemIndex.value++
        animationFrameId = requestAnimationFrame(animateScroll)
      }, pauseDuration)
    } else {
      setTimeout(() => {
        switchToNextGroup()
        animationFrameId = requestAnimationFrame(animateScroll)
      }, pauseDuration)
    }
  } else {
    animationFrameId = requestAnimationFrame(animateScroll)
  }
}

function switchToNextGroup() {
  if (!kpiDataGroups.value.length) return
  currentDataGroup.value = (currentDataGroup.value + 1) % kpiDataGroups.value.length
  displayItems.value = [...kpiDataGroups.value[currentDataGroup.value]]
  scrollOffset.value = 0
  currentItemIndex.value = 0 // 切组后从第一条开始
  measureFirstItemHeight()
  updateCurrentHighlight()
  groupSwitchTime = performance.now()
  lastScrollTimestamp = 0
}

function stopDataScroll() { if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null } }

/* ===================== Tab 自动播放 ===================== */
const autoplayHooks = {
  populationStructure: useTabAutoplay(['age','incomeSource','politicalStatus','sex','educationLevel','welfareStatus','maritalStatus'], { get value(){return activeTabs.populationStructure}, set value(v){activeTabs.populationStructure=v}}, { intervalMs:8000, pauseOnHover:true, pauseOnBlur:true }),
  basicIdentity: useTabAutoplay(['boolen','partyMember','villageResident'], { get value(){return activeTabs.basicIdentity}, set value(v){activeTabs.basicIdentity=v}}, { intervalMs:8000, pauseOnHover:true, pauseOnBlur:true }),
  healthDifficulty: useTabAutoplay(['health','poverty','disability'], { get value(){return activeTabs.healthDifficulty}, set value(v){activeTabs.healthDifficulty=v}}, { intervalMs:8000, pauseOnHover:true, pauseOnBlur:true }),
  priorityFamily: useTabAutoplay(['onlyChild','martyrFamily','otherSubsidy'], { get value(){return activeTabs.priorityFamily}, set value(v){activeTabs.priorityFamily=v}}, { intervalMs:8000, pauseOnHover:true, pauseOnBlur:true }),
  residenceVeteran: useTabAutoplay(['residence','veteran'], { get value(){return activeTabs.residenceVeteran}, set value(v){activeTabs.residenceVeteran=v}}, { intervalMs:8000, pauseOnHover:true, pauseOnBlur:true }),
  economyProjectInvestment: useTabAutoplay(['project','investment'], { get value(){return activeTabs.economyProjectInvestment}, set value(v){activeTabs.economyProjectInvestment=v}}, { intervalMs:8000, pauseOnHover:true, pauseOnBlur:true }),
  economyRevenueTransaction: useTabAutoplay(['revenue','transaction'], { get value(){return activeTabs.economyRevenueTransaction}, set value(v){activeTabs.economyRevenueTransaction=v}}, { intervalMs:8000, pauseOnHover:true, pauseOnBlur:true })
}

function handleTabChange(groupKey: string) { autoplayHooks[groupKey]?.onUserSwitch(); loadChart(groupKey) }

/* ===================== 图表数据加载与渲染 ===================== */
function parseCategoryData(response: any) {
  if (!response) return { categories: [], counts: [], proportions: [] }
  const raw = response.data
  if (!raw) return { categories: [], counts: [], proportions: [] }
  if (Array.isArray(raw.groups)) {
    return {
      categories: raw.groups.map((g:any)=>g.range||''),
      counts: raw.groups.map((g:any)=>Number(g.count||0)),
      proportions: raw.groups.map((g:any)=>g.proportion!=null? Number((g.proportion * (g.proportion<=1?100:1)).toFixed(2)):0)
    }
  }
  if (Array.isArray(raw)) {
    return {
      categories: raw.map((i:any)=> i.FieldName || i.dutyName || i.range || i.name || ''),
      counts: raw.map((i:any)=> Number(i.count || i.value || 0)),
      proportions: raw.map((i:any)=> i.proportion!=null? Number((i.proportion * (i.proportion<=1?100:1)).toFixed(2)):0)
    }
  }
  if (typeof raw === 'object') {
    const keys = Object.keys(raw)
    return { categories: keys, counts: keys.map(k=>Number(raw[k]||0)), proportions: [] }
  }
  return { categories: [], counts: [], proportions: [] }
}

const chartTypeMap: Record<string,string> = {
  populationStructure:'bar', basicIdentity:'area', healthDifficulty:'bar',
  priorityFamily:'pie', residenceVeteran:'stack', economyProjectInvestment:'bar', economyRevenueTransaction:'rank'
}

function buildOption({ title, categories, data, isProportion, type='bar' }) {
  const valueType = isProportion? 'percent':'default'
  const baseOption:any = {
    title:{ text:title, left:titleTokens.position, textStyle:{ color:titleTokens.color, fontSize:titleTokens.fontSize, fontWeight:titleTokens.fontWeight } },
    tooltip:{
      trigger: type==='pie'||type==='radar'? 'item': tooltipTokens.trigger,
      backgroundColor: tooltipTokens.backgroundColor,
      borderColor: tooltipTokens.borderColor,
      borderWidth: tooltipTokens.borderWidth,
      textStyle:{ color:tooltipTokens.textColor, fontSize: tooltipTokens.fontSize },
      padding: tooltipTokens.padding,
      axisPointer: type!=='pie'&&type!=='radar'? tooltipTokens.axisPointer: undefined,
      formatter: (params:any)=>{
        if (type==='pie') {
          const p=params; const formatted=formatNumber(p.value,{type:valueType}); const percentInfo=p.percent?` (${p.percent.toFixed(1)}%)`:''; return `${p.marker||''}${p.name}<br/>${isProportion?'占比':'数量'}: ${formatted}${isProportion?'%':''}${percentInfo}`
        }
        if (!Array.isArray(params)) params=[params]
        return params.map((p:any)=>{ const formatted=formatNumber(p.value||p.data,{type:valueType}); return `${p.marker||''}${p.seriesName||p.name||p.axisValue}: ${formatted}${isProportion?'%':''}` }).join('<br/>')
      }
    },
    legend: type!=='pie'&&type!=='radar'? { show:true, orient:'horizontal', top:10, left:'center', textStyle:{ color:legendTokens.textColor, fontSize: legendTokens.fontSize }, itemWidth: legendTokens.itemWidth, itemHeight: legendTokens.itemHeight, itemGap: legendTokens.itemGap } : undefined,
    animationDuration:800, animationEasing:'cubicOut'
  }
  switch(type){
    case 'bar': return buildBarOption(baseOption,categories,data,isProportion,valueType)
    case 'area': return buildAreaOption(baseOption,categories,data,isProportion,valueType)
    case 'stack': return buildStackOption(baseOption,categories,data,isProportion,valueType)
    case 'rank': return buildRankOption(baseOption,categories,data,isProportion,valueType)
    case 'pie': return buildPieOption(baseOption,categories,data,isProportion,valueType)
    default: return buildBarOption(baseOption,categories,data,isProportion,valueType)
  }
}

function buildBarOption(base,categories,data,isProportion,valueType){
  const gradient = createLinearGradient(screenGradients.primary,'vertical')
  return { ...base, grid:{...gridTokens.defaultPadding}, xAxis:{ type:'category', data:categories, axisLabel:{ color:axisTokens.labelColor, fontSize:axisTokens.labelFontSize, rotate: categories.length>6?30:0 }, axisTick:{ show:axisTokens.tickShow }, axisLine:{ lineStyle:{ color:axisTokens.lineColor } } }, yAxis:{ type:'value', axisLabel:{ color:axisTokens.labelColor, fontSize:axisTokens.labelFontSize, formatter:v=>{ const f=formatNumber(v,{type:isProportion?'percent':valueType}); return isProportion? f+'%': f } }, splitLine:{ lineStyle:{ color:gridTokens.lineColor, type:gridTokens.lineType } }, axisLine:{ lineStyle:{ color:axisTokens.lineColor } } }, series:[{ type:'bar', data, itemStyle:{ color:gradient, borderRadius:[4,4,0,0] }, barMaxWidth:42, label:{ show:true, position:'top', color:titleTokens.color, fontSize:axisTokens.labelFontSize, formatter:p=>{ const f=formatNumber(p.value,{type:valueType}); return isProportion? f+'%': f } } }] }
}
function buildAreaOption(base,categories,data,isProportion,valueType){
  const gradient=createLinearGradient(screenGradients.primary,'vertical')
  return { ...base, grid:{...gridTokens.defaultPadding}, xAxis:{ type:'category', data:categories, boundaryGap:false, axisLabel:{ color:axisTokens.labelColor, fontSize:axisTokens.labelFontSize, rotate: categories.length>6?30:0 }, axisTick:{ show:axisTokens.tickShow }, axisLine:{ lineStyle:{ color:axisTokens.lineColor } } }, yAxis:{ type:'value', axisLabel:{ color:axisTokens.labelColor, fontSize:axisTokens.labelFontSize, formatter:v=>{ const f=formatNumber(v,{type:isProportion?'percent':valueType}); return isProportion? f+'%': f } }, splitLine:{ lineStyle:{ color:gridTokens.lineColor, type:gridTokens.lineType } }, axisLine:{ lineStyle:{ color:axisTokens.lineColor } } }, series:[{ type:'line', data, smooth:true, areaStyle:{ color:gradient, opacity:.6 }, lineStyle:{ color:screenGradients.primary[0], width:2 }, itemStyle:{ color:screenGradients.primary[0], borderWidth:2, borderColor:'#fff' }, symbol:'circle', symbolSize:6, label:{ show:true, position:'top', color:titleTokens.color, fontSize:axisTokens.labelFontSize, formatter:p=>{ const f=formatNumber(p.value,{type:valueType}); return isProportion? f+'%': f } } }] }
}
function buildStackOption(base,categories,data,isProportion,valueType){
  const m=Math.ceil(data.length/2); const d1=data.slice(0,m); const d2=data.slice(m); const c1=categories.slice(0,m); const c2=categories.slice(m); const g1=createLinearGradient(screenGradients.primary,'vertical'); const g2=createLinearGradient(screenGradients.secondary,'vertical')
  return { ...base, legend:{ show:true, orient:'horizontal', top:35, left:'center', textStyle:{ color:legendTokens.textColor, fontSize:legendTokens.fontSize }, data:[c1.join('/'), c2.join('/')] }, grid:{...gridTokens.defaultPadding}, xAxis:{ type:'category', data:c1, axisLabel:{ color:axisTokens.labelColor, fontSize:axisTokens.labelFontSize, rotate: categories.length>4?30:0 }, axisTick:{ show:axisTokens.tickShow }, axisLine:{ lineStyle:{ color:axisTokens.lineColor } } }, yAxis:{ type:'value', axisLabel:{ color:axisTokens.labelColor, fontSize:axisTokens.labelFontSize, formatter:v=>{ const f=formatNumber(v,{type:isProportion?'percent':valueType}); return isProportion? f+'%': f } }, splitLine:{ lineStyle:{ color:gridTokens.lineColor, type:gridTokens.lineType } } }, series:[{ name:c1.join('/'), type:'bar', stack:'total', data:d1, itemStyle:{ color:g1 }, barMaxWidth:35, label:{ show:true, position:'inside', color:'#fff', fontSize:10, formatter:p=>{ if(p.value<=0) return ''; const f=formatNumber(p.value,{type:valueType}); return isProportion? f+'%': f } } }, { name:c2.join('/'), type:'bar', stack:'total', data:d2, itemStyle:{ color:g2 }, barMaxWidth:35, label:{ show:true, position:'inside', color:'#fff', fontSize:10, formatter:p=>{ if(p.value<=0) return ''; const f=formatNumber(p.value,{type:valueType}); return isProportion? f+'%': f } } }] }
}
function buildRankOption(base,categories,data,isProportion,valueType){ const gradient=createLinearGradient(screenGradients.primary,'horizontal'); return { ...base, grid:{ left:100,right:40,top:50,bottom:25,containLabel:true }, xAxis:{ type:'value', axisLabel:{ color:axisTokens.labelColor, fontSize:axisTokens.labelFontSize, formatter:v=>{ const f=formatNumber(v,{type:isProportion?'percent':valueType}); return isProportion? f+'%': f } }, splitLine:{ lineStyle:{ color:gridTokens.lineColor, type:gridTokens.lineType } } }, yAxis:{ type:'category', data:categories, axisLabel:{ color:axisTokens.labelColor, fontSize:axisTokens.labelFontSize } }, series:[{ type:'bar', data, itemStyle:{ color:gradient, borderRadius:[0,4,4,0] }, barMaxWidth:28, label:{ show:true, position:'right', color:titleTokens.color, fontSize:axisTokens.labelFontSize, formatter:p=>{ const f=formatNumber(p.value,{type:valueType}); return isProportion? f+'%': f } } }] }
}
function buildPieOption(base,categories,data,isProportion,valueType){ const pieData=categories.map((n,i)=>({ name:n,value:data[i], itemStyle:{ color:getCategoryColor(i) }})); return { ...base, legend:{ show:true, orient:'vertical', right:10, top:'center', textStyle:{ color:legendTokens.textColor, fontSize:legendTokens.fontSize } }, series:[{ type:'pie', radius:['40%','65%'], center:['35%','50%'], data: pieData, label:{ show:true, color:axisTokens.labelColor, fontSize:11, formatter:p=>{ const f=formatNumber(p.value,{type:valueType}); return `${p.name}\n${f}${isProportion?'%':''}` } } }] }
}

function redrawChart(groupKey: string) {
  const cache = groupDataCache[groupKey]; if (!cache) return
  const isProportion = displayModes[groupKey]==='proportion' && groupProportionAvailable[groupKey]
  const title = `${titleMap[groupKey]} - ${tabLabel(groupKey, activeTabs[groupKey])}${isProportion ? '(占比)' : '(数量)'}`
  const type = chartTypeMap[groupKey] || 'bar'
  const option = buildOption({ title, categories: cache.categories, data: isProportion? cache.proportions: cache.counts, isProportion, type })
  chartInstances[groupKey]?.setOption(option, true)
}

async function loadChart(groupKey: string) {
  const tabKey = activeTabs[groupKey]
  const fetchFunc = fetchMap[groupKey]?.[tabKey]
  if (!fetchFunc) return
  chartLoading[groupKey] = true
  try {
    const resp = await fetchFunc()
    const parsed = parseCategoryData(resp)
    groupDataCache[groupKey] = parsed
    groupProportionAvailable[groupKey] = parsed.proportions.some((p:number)=>p>0)
    if (displayModes[groupKey] !== 'count') displayModes[groupKey] = 'count'
    noData[groupKey] = parsed.counts.length===0 || parsed.counts.every((v:number)=>v===0)
    const containerRef = containerMap[groupKey]
    if (containerRef?.value) {
      if (!chartInstances[groupKey]) chartInstances[groupKey] = echarts.init(containerRef.value)
      redrawChart(groupKey)
    }
  } catch (e) { console.error('加载图表失败', groupKey, e); noData[groupKey] = true } finally { chartLoading[groupKey] = false }
}

Object.keys(activeTabs).forEach(groupKey => { watch(()=>activeTabs[groupKey], () => loadChart(groupKey)) })
function initCharts() { Object.keys(fetchMap).forEach(loadChart) }

/* ===================== 生命周期 ===================== */
onMounted(()=>{
  document.body.style.margin='0'
  document.body.style.padding='0'
  document.body.style.overflow='hidden'
  updateDateTime(); timeInterval=setInterval(updateDateTime,1000)
  window.addEventListener?.('resize', measureFirstItemHeight)
  nextTick(()=>{ initCharts(); fetchKpiData() })
})

onUnmounted(()=>{
  if (timeInterval) clearInterval(timeInterval)
  stopDataScroll()
  document.body.style.margin=''
  document.body.style.padding=''
  document.body.style.overflow=''
  window.removeEventListener?.('resize', measureFirstItemHeight)
  Object.keys(chartInstances).forEach(k=>{ if(chartInstances[k]){ chartInstances[k].dispose(); chartInstances[k]=null } })
})

</script>

<style scoped>
:root { /* 组件级 CSS 变量，便于统一调整 */
  --kpi-item-height: 65px;
  --kpi-item-gap: 10px;
  --kpi-item-radius: 12px;
  --kpi-color-primary: #00ffff;
  --kpi-color-primary-soft: rgba(0,255,255,0.15);
  --kpi-color-primary-soft2: rgba(0,128,255,0.12);
  --kpi-color-border: rgba(0,255,255,0.3);
  --kpi-color-border-active: #00ffff;
  --kpi-color-text-label: rgba(255,255,255,0.78);
  --kpi-color-text-value: #00ffff;
  --kpi-color-text-muted: rgba(255,255,255,0.45);
  --kpi-color-bg-item: linear-gradient(135deg,var(--kpi-color-primary-soft) 0%, var(--kpi-color-primary-soft2) 100%);
  --kpi-shadow-item: 0 2px 8px rgba(0,0,0,0.35);
  --kpi-shadow-active: 0 0 24px rgba(0,255,255,0.55), 0 0 8px rgba(0,128,255,0.4);
  --kpi-transition: 260ms cubic-bezier(.4,0,.2,1);
  --kpi-font-label: 13px;
  --kpi-font-value: 22px;
  --kpi-scroll-mask-size: 60px;
  --kpi-progress-height: 3px;
}

.big-screen-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at 15% 20%, rgba(0, 180, 255, 0.12), transparent 45%),
    radial-gradient(circle at 82% 0%, rgba(0, 255, 255, 0.1), transparent 52%),
    #040b18;
  color: #fff;
  font-family: 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

/* 通用自定义图表边框 */
.custom-chart-border {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.6) 0%, rgba(0, 15, 30, 0.8) 100%);
  border: 2px solid;
  border-image: linear-gradient(135deg, #00ffff, #0080ff) 1;
  box-shadow: 
    inset 0 0 15px rgba(0, 255, 255, 0.08),
    0 0 15px rgba(0, 255, 255, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 顶部标题区域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 32px;
  background: linear-gradient(90deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 46, 0.82) 55%, rgba(10, 10, 10, 0.95) 100%);
  border-bottom: 1px solid rgba(0, 255, 255, 0.35);
  box-shadow: 0 12px 25px rgba(0, 40, 80, 0.25);
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 15px;
}

.title-icon {
  font-size: 32px;
  color: #00ffff;
}

.main-title {
  font-size: 36px;
  font-weight: bold;
  color: #00ffff;
  margin: 0;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.decoration-line {
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, #00ffff, #235fa7);
  margin-top: 10px;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(0, 255, 255, 0.1);
  padding: 10px 20px;
  border-radius: 25px;
  border: 1px solid #00ffff;
}

.time-content {
  text-align: center;
}

.return-button {
  display: flex;
  align-items: center;
}

.return-btn {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid #00ffff !important;
  color: #00ffff !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
}

.return-btn:hover {
  background: rgba(0, 255, 255, 0.2) !important;
  border-color: #00ffff !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3) !important;
  transform: translateY(-2px);
}

/* 主体内容区域 */
.content-area {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(280px, 1.1fr) minmax(0, 1.8fr) minmax(280px, 1.1fr);
  gap: 24px;
  padding: 24px 32px 32px;
  box-sizing: border-box;
  min-height: 0;
}

/* 图表盒子 */
.chart-box {
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid #00ffff;
  border-radius: 10px;
  padding: 20px;
  height: 300px;
  position: relative;
}

.chart-header {
  margin-bottom: 10px;
}

.chart-title {
  font-size: 16px;
  color: #00ffff;
  margin: 0 0 6px 0;
}

.chart-container {
  width: 100%;
  height: 200px;
}

.chart-loading {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.4);
  font-size: 14px;
  color: #00ffff;
}

.mini-tabs :deep(.el-tabs__nav-wrap) { /* style-lint ignore: dynamic component class */
  margin-bottom: 0;
}

.mini-tabs :deep(.el-tabs__item) { /* style-lint ignore: dynamic component class */
  font-size: 12px;
  padding: 0 10px;
}

.center-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* 自定义科技感边框容器 */
.kpi-custom-border {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.8) 0%, rgba(0, 15, 30, 0.9) 100%);
  border: 2px solid;
  border-image: linear-gradient(90deg, #00ffff, #0080ff, #00ffff) 1;
  box-shadow: 
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 20px rgba(0, 255, 255, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.kpi-custom-border::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(180deg, rgba(0, 255, 255, 0.15) 0%, transparent 100%);
  pointer-events: none;
  z-index: 1;
}

.border-title {
  position: absolute;
  top: 10px;
  left: 20px;
  font-size: 16px;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
  z-index: 2;
  letter-spacing: 2px;
}

.info-scroll-container {
  flex: 1;
  min-height: 0;  /* 允许 flex 子项缩小 */
  max-height: calc(100% - 30px);  /* 减去指示器高度 */
  overflow: hidden;
  position: relative;
}

.info-scroll-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 10px 15px;
  box-sizing: border-box;
  overflow: hidden;
}

.chart-section {
  height: 250px;
  flex-shrink: 0;
}

/* 平滑多组滚动容器 */
.credits-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  padding: 0;
  /* 顶部和底部渐隐效果 */
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );
}

.credits-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.credits-content {
  width: 100%;
  will-change: transform;
  transition: none;  /* 禁用过渡,由JS控制 */
  /* 所有项目都会被渲染,通过transform控制显示哪部分 */
}

.credit-item { /* 优化：左右结构 + 更紧凑内边距 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  height: var(--kpi-item-height);
  padding: 10px 18px 8px 18px;
  margin-bottom: var(--kpi-item-gap);
  background: var(--kpi-color-bg-item);
  border: 1px solid var(--kpi-color-border);
  border-radius: var(--kpi-item-radius);
  box-sizing: border-box;
  box-shadow: var(--kpi-shadow-item);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(2px);
  transition: var(--kpi-transition);
}
.credit-item::before { /* 轻微的内发光边框 */
  content: '';
  position: absolute; inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(140deg, rgba(0,255,255,0.18), rgba(0,255,255,0) 45%);
  opacity: 0; transition: var(--kpi-transition);
}
.credit-item.active::before { opacity: 1; }
.credit-item.active { border-color: var(--kpi-color-border-active); box-shadow: var(--kpi-shadow-active); transform: translateY(-2px); }
.credit-item:hover:not(.active) { border-color: var(--kpi-color-border-active); transform: translateY(-2px); }

.credit-row { flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 14px; min-width: 0; }
.credit-label { flex: 1; font-size: var(--kpi-font-label); font-weight: 500; color: var(--kpi-color-text-label); letter-spacing: .5px; line-height: 1.25; text-align: left; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.credit-value { display: flex; align-items: baseline; gap: 6px; justify-content: flex-end; white-space: nowrap; }
.credit-number { font-size: var(--kpi-font-value); font-weight: 600; color: var(--kpi-color-text-value); letter-spacing: 1px; text-shadow: 0 0 10px rgba(0,255,255,0.7), 0 0 18px rgba(0,255,255,0.35); }
.credit-unit { font-size: 12px; color: #55d9ff; opacity: 0.9; }

.credit-progress { position: relative; width: 100%; height: var(--kpi-progress-height); margin-top: 6px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.credit-progress-bar { position: absolute; left:0; top:0; bottom:0; background: linear-gradient(90deg,#00eaff,#007bff); box-shadow: 0 0 6px rgba(0,255,255,0.65); transition: width .6s ease; }

/* 渐隐遮罩层（增强可读性） */
.fade-overlay { position:absolute; left:0; right:0; height: var(--kpi-scroll-mask-size); z-index:2; pointer-events:none; }
.fade-overlay.top { top:0; background: linear-gradient(to bottom, rgba(4,11,24,0.92) 0%, rgba(4,11,24,0.75) 45%, rgba(4,11,24,0) 100%); }
.fade-overlay.bottom { bottom:0; background: linear-gradient(to top, rgba(4,11,24,0.92) 0%, rgba(4,11,24,0.75) 45%, rgba(4,11,24,0) 100%); }

/* 响应式缩放：在较窄宽度或较低高度时缩小字号与间距 */
@media (max-width: 1500px) {
  :root { --kpi-font-value: 20px; --kpi-font-label: 12px; }
  .credit-item { padding: 8px 14px 6px 14px; }
}
@media (max-width: 1200px) {
  :root { --kpi-font-value: 18px; --kpi-font-label: 12px; }
  .credit-number { letter-spacing: .5px; }
}
@media (max-width: 1000px) {
  :root { --kpi-font-value: 17px; --kpi-font-label: 11px; --kpi-item-height: 60px; }
}

/* 亮/暗前景微调：在高亮元素下方添加微弱边界光带 */
.credit-item.active .credit-progress { background: rgba(0,255,255,0.15); }

/* 指示器与内容间距微调 */
.group-indicators { margin-top: 2px; }

.no-data-overlay { position: absolute; left:0; top:0; right:0; bottom:0; display:flex; align-items:center; justify-content:center; color:#00ffff; font-size:14px; background:rgba(0,0,0,0.35); backdrop-filter: blur(2px); }

.chart-container { position: relative; }
</style>
