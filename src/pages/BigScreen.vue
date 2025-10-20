<template>
  <div class="bigscreen-wrapper" ref="wrapperRef">
    <div ref="containerRef" class="bigscreen" :style="scaleStyle">
      <div class="bigscreen__background"></div>
      <header class="bigscreen__header">
        <div class="header__left">
          <dv-decoration-11 class="header__decoration" />
          <div>
            <h1>乡务治理可视化大屏</h1>
            <p>{{ currentTime }}</p>
          </div>
        </div>
        <div class="header__center">
          <GlobalKpiGrid :overview="villageOverview" />
        </div>
        <div class="header__right">
          <el-space align="center" :size="12">
            <el-button type="primary" size="small" plain :loading="refreshLoading" @click="handleRefresh">
              <template #icon>
                <el-icon><RefreshOutline /></el-icon>
              </template>
              刷新全部
            </el-button>
            <el-switch
              v-model="autoRefreshModel"
              size="small"
              active-text="自动刷新"
              inactive-text="手动"
            />
            <el-button size="small" plain @click="handleExport">
              <template #icon>
                <el-icon><DownloadOutline /></el-icon>
              </template>
              导出图片
            </el-button>
            <el-button size="small" plain @click="handleFullScreen">
              <template #icon>
                <el-icon><ExpandOutline /></el-icon>
              </template>
              {{ isFullscreen ? '退出全屏' : '全屏' }}
            </el-button>
          </el-space>
        </div>
      </header>

      <main class="bigscreen__content">
        <section class="column column--left">
          <ChartCard
            title="年龄段分布"
            :loading="loading('populationByAge')"
            :error="error('populationByAge')"
            :is-empty="!(populationByAge?.groups?.length)"
            height="220px"
          >
            <AgeBar v-if="populationByAge" :groups="populationByAge.groups" />
          </ChartCard>

          <div class="column__grid">
            <ChartCard
              title="性别结构"
              :loading="loading('populationBySex')"
              :error="error('populationBySex')"
              :is-empty="!(populationBySex?.groups?.length)"
              height="220px"
            >
              <GenderPie v-if="populationBySex" :groups="populationBySex.groups" />
            </ChartCard>
            <ChartCard
              title="学历结构"
              :loading="loading('populationByEducationLevel')"
              :error="error('populationByEducationLevel')"
              :is-empty="!(populationByEducationLevel?.groups?.length)"
              height="220px"
            >
              <EduBar v-if="populationByEducationLevel" :groups="populationByEducationLevel.groups" />
            </ChartCard>
          </div>

          <ChartCard
            title="婚姻状况"
            :loading="loading('populationByMaritalStatus')"
            :error="error('populationByMaritalStatus')"
            :is-empty="!(populationByMaritalStatus?.groups?.length)"
            height="220px"
          >
            <MaritalPie v-if="populationByMaritalStatus" :groups="populationByMaritalStatus.groups" />
          </ChartCard>

          <ChartCard
            title="政治面貌"
            :loading="loading('populationByPoliticalStatus')"
            :error="error('populationByPoliticalStatus')"
            :is-empty="!(populationByPoliticalStatus?.groups?.length)"
            height="220px"
          >
            <PoliticalBar v-if="populationByPoliticalStatus" :groups="populationByPoliticalStatus.groups" />
          </ChartCard>

          <ChartCard
            title="收入来源"
            :loading="loading('populationByIncomeSource')"
            :error="error('populationByIncomeSource')"
            :is-empty="!(populationByIncomeSource?.groups?.length)"
            height="240px"
          >
            <IncomeTreemap v-if="populationByIncomeSource" :groups="populationByIncomeSource.groups" />
          </ChartCard>

          <ChartCard
            title="福利状况"
            :loading="loading('populationByWelfareStatus')"
            :error="error('populationByWelfareStatus')"
            :is-empty="!(populationByWelfareStatus?.groups?.length)"
            height="220px"
          >
            <WelfareDonut v-if="populationByWelfareStatus" :groups="populationByWelfareStatus.groups" />
          </ChartCard>
        </section>

        <section class="column column--center">
          <ChartCard
            title="综合概览"
            :loading="overviewLoading"
            :error="overviewError"
            :is-empty="!(overviewMap && Object.keys(overviewMap).length)"
            height="300px"
          >
            <PartyOverviewCards :data="overviewMap" />
          </ChartCard>

          <el-tabs v-model="activeTab" type="border-card" class="column__tabs" stretch>
            <el-tab-pane name="overview" label="综合概览">
              <ChartCard
                title="村庄综合指标"
                :loading="loading('villageOverview')"
                :error="error('villageOverview')"
                :is-empty="!villageOverview"
                height="320px"
              >
                <GlobalKpiGrid :overview="villageOverview" />
              </ChartCard>
            </el-tab-pane>
            <el-tab-pane name="economy" label="集体经济">
              <div class="tab-grid">
                <ChartCard
                  title="项目状态分布"
                  :loading="loading('economyProjectStats')"
                  :error="error('economyProjectStats')"
                  :is-empty="!economyProjectStats.length"
                  height="260px"
                >
                  <EconomyStatusPie :data="economyProjectStats" />
                </ChartCard>
                <ChartCard
                  title="投资与回报"
                  :loading="loading('economyInvestmentStats')"
                  :error="error('economyInvestmentStats')"
                  :is-empty="!economyInvestmentStats.length"
                  height="260px"
                >
                  <ROIQuadGauge :data="economyInvestmentStats" />
                </ChartCard>
                <ChartCard
                  title="收支与净利"
                  :loading="loading('economyRevenueStats')"
                  :error="error('economyRevenueStats')"
                  :is-empty="!economyRevenueStats.length"
                  height="260px"
                >
                  <RevenueBar :data="economyRevenueStats" />
                </ChartCard>
                <ChartCard
                  title="收支记录"
                  :loading="loading('economyTransactionStats')"
                  :error="error('economyTransactionStats')"
                  :is-empty="!economyTransactionStats.length"
                  height="260px"
                >
                  <EconomyTransactionList :data="economyTransactionStats" />
                </ChartCard>
              </div>
            </el-tab-pane>
            <el-tab-pane name="party" label="党费">
              <div class="tab-grid">
                <ChartCard
                  title="缴费状态分布"
                  :loading="loading('partyDuePaymentStats')"
                  :error="error('partyDuePaymentStats')"
                  :is-empty="!partyPaymentStats.length"
                  height="260px"
                >
                  <PartyPaymentPie :data="partyPaymentStats" />
                </ChartCard>
                <ChartCard
                  title="金额分布"
                  :loading="loading('partyDueAmountStats')"
                  :error="error('partyDueAmountStats')"
                  :is-empty="!partyAmountStats.length"
                  height="260px"
                >
                  <PartyAmountBar :data="partyAmountStats" />
                </ChartCard>
                <ChartCard
                  title="缴费率"
                  :loading="loading('partyDueRateStats')"
                  :error="error('partyDueRateStats')"
                  :is-empty="!(partyRateStats && Object.keys(partyRateStats).length)"
                  height="260px"
                >
                  <PartyRateGauge :data="partyRateStats" />
                </ChartCard>
                <ChartCard
                  title="党费概览"
                  :loading="loading('partyDueOverview')"
                  :error="error('partyDueOverview')"
                  :is-empty="!(partyOverview && Object.keys(partyOverview).length)"
                  height="260px"
                >
                  <PartyOverviewCards :data="partyOverview" />
                </ChartCard>
              </div>
            </el-tab-pane>
          </el-tabs>
        </section>

        <section class="column column--right">
          <ChartCard
            title="人口与身份统计"
            :loading="boolenLoading"
            :error="boolenError"
            :is-empty="!boolenWallItems.length"
            height="320px"
          >
            <BoolenWall :items="boolenWallItems" :total="totalPopulation" />
          </ChartCard>

          <ChartCard
            title="村委成员"
            :loading="loading('committeeMemberStats')"
            :error="error('committeeMemberStats')"
            :is-empty="!committeeMemberStats.length"
            height="260px"
          >
            <CommitteeMemberPie :data="committeeMemberStats" />
          </ChartCard>

          <ChartCard
            title="村委职务分布"
            :loading="loading('committeeDutyStats')"
            :error="error('committeeDutyStats')"
            :is-empty="!committeeDutyStats.length"
            height="260px"
          >
            <CommitteeDutyBar :data="committeeDutyStats" />
          </ChartCard>

          <ChartCard
            title="村委概览"
            :loading="loading('committeeOverview')"
            :error="error('committeeOverview')"
            :is-empty="!(committeeOverview && Object.keys(committeeOverview).length)"
            height="260px"
          >
            <PartyOverviewCards :data="committeeOverview" />
          </ChartCard>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import screenfull from '@/utils/screenfull'
import { RefreshOutline, DownloadOutline, ExpandOutline } from '@vicons/ionicons5'
import type { CountResponse } from '@/types/bigscreen'
import { useBigScreenStore } from '@/stores/bigscreen'
import { useScreenScale } from '@/utils/scale'
import { exportAsImage } from '@/utils/export'
import ChartCard from '@/components/bigscreen/ChartCard.vue'
import AgeBar from '@/components/bigscreen/AgeBar.vue'
import GenderPie from '@/components/bigscreen/GenderPie.vue'
import EduBar from '@/components/bigscreen/EduBar.vue'
import MaritalPie from '@/components/bigscreen/MaritalPie.vue'
import PoliticalBar from '@/components/bigscreen/PoliticalBar.vue'
import IncomeTreemap from '@/components/bigscreen/IncomeTreemap.vue'
import WelfareDonut from '@/components/bigscreen/WelfareDonut.vue'
import BoolenWall from '@/components/bigscreen/BoolenWall.vue'
import EconomyStatusPie from '@/components/bigscreen/EconomyStatusPie.vue'
import ROIQuadGauge from '@/components/bigscreen/ROIQuadGauge.vue'
import RevenueBar from '@/components/bigscreen/RevenueBar.vue'
import EconomyTransactionList from '@/components/bigscreen/EconomyTransactionList.vue'
import PartyPaymentPie from '@/components/bigscreen/PartyPaymentPie.vue'
import PartyAmountBar from '@/components/bigscreen/PartyAmountBar.vue'
import PartyRateGauge from '@/components/bigscreen/PartyRateGauge.vue'
import PartyOverviewCards from '@/components/bigscreen/PartyOverviewCards.vue'
import CommitteeMemberPie from '@/components/bigscreen/CommitteeMemberPie.vue'
import CommitteeDutyBar from '@/components/bigscreen/CommitteeDutyBar.vue'
import GlobalKpiGrid from '@/components/bigscreen/GlobalKpiGrid.vue'

const wrapperRef = ref<HTMLDivElement | null>(null)
const store = useBigScreenStore()
const { autoRefresh } = storeToRefs(store)

const { containerRef, style: scaleStyle } = useScreenScale()

const currentTime = ref(dayjs().format('YYYY年MM月DD日 HH:mm:ss'))
const activeTab = ref('overview')
const refreshLoading = ref(false)
const isFullscreen = ref(false)
let clock: ReturnType<typeof setInterval> | null = null
const screenChangeHandler = () => {
  isFullscreen.value = screenfull.isFullscreen
}

const autoRefreshModel = computed({
  get: () => autoRefresh.value,
  set: (value: boolean) => store.setAutoRefresh(value)
})

const loading = (key: string) => store.isLoading(key)
const error = (key: string) => store.getError(key)

const populationByAge = computed(() => store.getPopulationByAge())
const populationBySex = computed(() => store.getPopulationBySex())
const populationByEducationLevel = computed(() => store.getPopulationByEducationLevel())
const populationByMaritalStatus = computed(() => store.getPopulationByMaritalStatus())
const populationByPoliticalStatus = computed(() => store.getPopulationByPoliticalStatus())
const populationByIncomeSource = computed(() => store.getPopulationByIncomeSource())
const populationByWelfareStatus = computed(() => store.getPopulationByWelfareStatus())

const overviewMap = computed(() => store.getOverview())
const villageOverview = computed(() => store.getVillageComprehensiveOverview())

const economyProjectStats = computed(() => store.getEconomyProjectStats() ?? [])
const economyInvestmentStats = computed(() => store.getEconomyInvestmentStats() ?? [])
const economyRevenueStats = computed(() => store.getEconomyRevenueStats() ?? [])
const economyTransactionStats = computed(() => store.getEconomyTransactionStats() ?? [])
const partyPaymentStats = computed(() => store.getPartyDuePaymentStats() ?? [])
const partyAmountStats = computed(() => store.getPartyDueAmountStats() ?? [])
const partyRateStats = computed(() => store.getPartyDueRateStats())
const partyOverview = computed(() => store.getPartyDueOverview())
const committeeMemberStats = computed(() => store.getCommitteeMemberStats() ?? [])
const committeeDutyStats = computed(() => store.getCommitteeDutyStats() ?? [])
const committeeOverview = computed(() => store.getCommitteeOverview())

const boolenWallItems = computed<CountResponse[]>(() => {
  const lists = [
    store.getBoolenCount(),
    store.getPartyMemberCounts(),
    store.getVillagerResidentCounts(),
    store.getHealthStatusCounts(),
    store.getPovertyCounts(),
    store.getDisabilityCounts(),
    store.getOnlyChildFamilyCounts(),
    store.getMartyrFamilyCounts(),
    store.getOtherSubsidyCounts(),
    store.getVeteranCounts(),
    store.getResidenceCounts()
  ].filter((item): item is CountResponse[] => Array.isArray(item))
  return lists.flat()
})

const totalPopulation = computed(() => {
  return villageOverview.value?.totalPopulation ?? store.getTotalPopulation() ?? 0
})

const boolenLoading = computed(() => {
  const keys = [
    'boolenCount',
    'partyMemberCounts',
    'villagerResidentCounts',
    'healthStatusCounts',
    'povertyCounts',
    'disabilityCounts',
    'onlyChildFamilyCounts',
    'martyrFamilyCounts',
    'otherSubsidyCounts',
    'veteranCounts',
    'residenceCounts'
  ]
  return keys.some((key) => loading(key))
})

const boolenError = computed(() => {
  const keys = [
    'boolenCount',
    'partyMemberCounts',
    'villagerResidentCounts',
    'healthStatusCounts',
    'povertyCounts',
    'disabilityCounts',
    'onlyChildFamilyCounts',
    'martyrFamilyCounts',
    'otherSubsidyCounts',
    'veteranCounts',
    'residenceCounts'
  ]
  return keys.map((key) => error(key)).find((item) => !!item) || null
})

const overviewLoading = computed(() => loading('overview'))
const overviewError = computed(() => error('overview'))

const handleRefresh = async () => {
  refreshLoading.value = true
  try {
    await store.refreshAll(true)
  } finally {
    refreshLoading.value = false
  }
}

const handleExport = async () => {
  if (!containerRef.value) return
  await exportAsImage(containerRef.value, `bigscreen-${dayjs().format('YYYYMMDD-HHmmss')}.png`)
}

const handleFullScreen = () => {
  if (!wrapperRef.value || !screenfull.isEnabled) return
  screenfull.toggle(wrapperRef.value)
}

onMounted(async () => {
  clock = setInterval(() => {
    currentTime.value = dayjs().format('YYYY年MM月DD日 HH:mm:ss')
  }, 1000)

  if (screenfull.isEnabled) {
    screenfull.on('change', screenChangeHandler)
  }

  await store.refreshAll(true)
})

onBeforeUnmount(() => {
  if (clock) {
    clearInterval(clock)
  }
  if (screenfull.isEnabled) {
    screenfull.off('change', screenChangeHandler)
  }
})

watch(activeTab, (tab) => {
  if (tab === 'economy') {
    store.fetchEconomyProjectStats()
    store.fetchEconomyInvestmentStats()
    store.fetchEconomyRevenueStats()
    store.fetchEconomyTransactionStats()
    store.fetchEconomyOverview()
  } else if (tab === 'party') {
    store.fetchPartyDuePaymentStats()
    store.fetchPartyDueAmountStats()
    store.fetchPartyDueRateStats()
    store.fetchPartyDueOverview()
  } else {
    store.fetchOverview()
    store.fetchVillageComprehensiveOverview()
  }
})
</script>

<style scoped>
.bigscreen-wrapper {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at top, #182645 0%, #080d18 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bigscreen {
  position: relative;
  width: 1920px;
  height: 1080px;
  padding: 16px 24px;
  box-sizing: border-box;
  color: #e6f0ff;
}

.bigscreen__background {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(19, 36, 67, 0.95), rgba(9, 16, 32, 0.95));
  border: 1px solid rgba(78, 154, 254, 0.25);
  border-radius: 24px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  z-index: 0;
}

.bigscreen__header {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 400px auto 320px;
  align-items: center;
  padding-bottom: 16px;
}

.header__left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header__left h1 {
  font-size: 28px;
  letter-spacing: 0.12em;
  margin: 0;
}

.header__left p {
  margin: 4px 0 0;
  color: rgba(230, 240, 255, 0.7);
  font-size: 14px;
}

.header__decoration {
  width: 80px;
  height: 80px;
}

.header__center {
  padding: 0 24px;
}

.header__right {
  justify-self: end;
}

.header__right :deep(.el-button.is-plain) {
  color: #e6f0ff;
  border-color: rgba(78, 154, 254, 0.4);
  background-color: rgba(18, 30, 55, 0.65);
}

.header__right :deep(.el-button.is-plain:hover),
.header__right :deep(.el-button.is-plain:focus) {
  border-color: rgba(78, 154, 254, 0.8);
  background-color: rgba(30, 54, 96, 0.9);
  color: #ffffff;
}

.header__right :deep(.el-switch__label) {
  color: #e6f0ff;
}

.bigscreen__content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 420px 720px 420px;
  gap: 16px;
  height: calc(100% - 120px);
}

.column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

.column__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.column__tabs {
  margin-top: 16px;
}

.tab-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

:deep(.el-tabs__header) {
  margin-bottom: 16px;
}

:deep(.el-tabs--border-card) {
  background: rgba(18, 30, 55, 0.6);
  border: 1px solid rgba(78, 154, 254, 0.2);
  border-radius: 12px;
}

:deep(.el-tabs--border-card > .el-tabs__header) {
  border-bottom: 1px solid rgba(78, 154, 254, 0.2);
  background: transparent;
}

:deep(.el-tabs__item) {
  color: #e6f0ff;
}

:deep(.el-tabs__content) {
  padding: 0;
  background: transparent;
}

.column--right {
  overflow-y: auto;
  padding-right: 4px;
}

.column--right::-webkit-scrollbar {
  width: 6px;
}

.column--right::-webkit-scrollbar-thumb {
  background: rgba(78, 154, 254, 0.4);
  border-radius: 3px;
}
</style>
