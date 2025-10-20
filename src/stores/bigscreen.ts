import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type {
  PopulationStructureResponse,
  CountResponse,
  CommitteeDutyCountResponse,
  OverviewMap,
  VillageOverviewResponse
} from '@/types/bigscreen'
import * as service from '@/services/bigscreen'

const CACHE_TTL = 5 * 60 * 1000

type CacheEntry<T> = {
  data: T
  expires: number
}

type Loader<T> = () => Promise<T>

export const useBigScreenStore = defineStore('bigscreen', () => {
  const cache = ref<Record<string, CacheEntry<any>>>({})
  const loading = ref<Record<string, boolean>>({})
  const errors = ref<Record<string, string | null>>({})
  const pending = new Map<string, Promise<any>>()

  const autoRefresh = ref(true)
  const refreshInterval = ref(60_000)
  let refreshTimer: ReturnType<typeof setInterval> | null = null

  const fetchWithCache = async <T>(key: string, loader: Loader<T>, force = false): Promise<T> => {
    const now = Date.now()
    const existing = cache.value[key]

    if (!force && existing && existing.expires > now) {
      return existing.data
    }

    if (!force && pending.has(key)) {
      return pending.get(key) as Promise<T>
    }

    loading.value[key] = true
    errors.value[key] = null

    const request = loader()
      .then((data) => {
        cache.value[key] = {
          data,
          expires: Date.now() + CACHE_TTL
        }
        return data
      })
      .catch((error) => {
        errors.value[key] = error?.message || '数据获取失败'
        throw error
      })
      .finally(() => {
        loading.value[key] = false
        pending.delete(key)
      })

    pending.set(key, request)

    return request
  }

  const getData = <T>(key: string) => cache.value[key]?.data as T | undefined
  const isLoading = (key: string) => loading.value[key] ?? false
  const getError = (key: string) => errors.value[key] ?? null

  const fetchPopulationByAge = (force = false) =>
    fetchWithCache('populationByAge', () => service.getPopulationByAge(), force)
  const fetchPopulationByIncomeSource = (force = false) =>
    fetchWithCache('populationByIncomeSource', () => service.getPopulationByIncomeSource(), force)
  const fetchPopulationByPoliticalStatus = (force = false) =>
    fetchWithCache('populationByPoliticalStatus', () => service.getPopulationByPoliticalStatus(), force)
  const fetchPopulationBySex = (force = false) =>
    fetchWithCache('populationBySex', () => service.getPopulationBySex(), force)
  const fetchPopulationByEducationLevel = (force = false) =>
    fetchWithCache('populationByEducationLevel', () => service.getPopulationByEducationLevel(), force)
  const fetchPopulationByWelfareStatus = (force = false) =>
    fetchWithCache('populationByWelfareStatus', () => service.getPopulationByWelfareStatus(), force)
  const fetchPopulationByMaritalStatus = (force = false) =>
    fetchWithCache('populationByMaritalStatus', () => service.getPopulationByMaritalStatus(), force)

  const fetchBoolenCount = (force = false) =>
    fetchWithCache('boolenCount', () => service.getBoolenCount(), force)
  const fetchPartyMemberCounts = (force = false) =>
    fetchWithCache('partyMemberCounts', () => service.getPartyMemberCounts(), force)
  const fetchVillagerResidentCounts = (force = false) =>
    fetchWithCache('villagerResidentCounts', () => service.getVillagerResidentCounts(), force)
  const fetchHealthStatusCounts = (force = false) =>
    fetchWithCache('healthStatusCounts', () => service.getHealthStatusCounts(), force)
  const fetchPovertyCounts = (force = false) =>
    fetchWithCache('povertyCounts', () => service.getPovertyCounts(), force)
  const fetchDisabilityCounts = (force = false) =>
    fetchWithCache('disabilityCounts', () => service.getDisabilityCounts(), force)
  const fetchOnlyChildFamilyCounts = (force = false) =>
    fetchWithCache('onlyChildFamilyCounts', () => service.getOnlyChildFamilyCounts(), force)
  const fetchMartyrFamilyCounts = (force = false) =>
    fetchWithCache('martyrFamilyCounts', () => service.getMartyrFamilyCounts(), force)
  const fetchOtherSubsidyCounts = (force = false) =>
    fetchWithCache('otherSubsidyCounts', () => service.getOtherSubsidyCounts(), force)
  const fetchVeteranCounts = (force = false) =>
    fetchWithCache('veteranCounts', () => service.getVeteranCounts(), force)
  const fetchResidenceCounts = (force = false) =>
    fetchWithCache('residenceCounts', () => service.getResidenceCounts(), force)

  const fetchTotalPopulation = (force = false) =>
    fetchWithCache('totalPopulation', () => service.getTotalPopulation(), force)
  const fetchOverview = (force = false) =>
    fetchWithCache('overview', () => service.getOverview(), force)

  const fetchEconomyProjectStats = (force = false) =>
    fetchWithCache('economyProjectStats', () => service.getEconomyProjectStats(), force)
  const fetchEconomyInvestmentStats = (force = false) =>
    fetchWithCache('economyInvestmentStats', () => service.getEconomyInvestmentStats(), force)
  const fetchEconomyRevenueStats = (force = false) =>
    fetchWithCache('economyRevenueStats', () => service.getEconomyRevenueStats(), force)
  const fetchEconomyTransactionStats = (force = false) =>
    fetchWithCache('economyTransactionStats', () => service.getEconomyTransactionStats(), force)
  const fetchEconomyOverview = (force = false) =>
    fetchWithCache('economyOverview', () => service.getEconomyOverview(), force)

  const fetchPartyDuePaymentStats = (force = false) =>
    fetchWithCache('partyDuePaymentStats', () => service.getPartyDuePaymentStats(), force)
  const fetchPartyDueAmountStats = (force = false) =>
    fetchWithCache('partyDueAmountStats', () => service.getPartyDueAmountStats(), force)
  const fetchPartyDueRateStats = (force = false) =>
    fetchWithCache('partyDueRateStats', () => service.getPartyDueRateStats(), force)
  const fetchPartyDueOverview = (force = false) =>
    fetchWithCache('partyDueOverview', () => service.getPartyDueOverview(), force)

  const fetchCommitteeMemberStats = (force = false) =>
    fetchWithCache('committeeMemberStats', () => service.getCommitteeMemberStats(), force)
  const fetchCommitteeDutyStats = (force = false) =>
    fetchWithCache('committeeDutyStats', () => service.getCommitteeDutyStats(), force)
  const fetchCommitteeOverview = (force = false) =>
    fetchWithCache('committeeOverview', () => service.getCommitteeOverview(), force)

  const fetchVillageComprehensiveOverview = (force = false) =>
    fetchWithCache('villageOverview', () => service.getVillageComprehensiveOverview(), force)

  const refreshEconomyAndParty = (force = true) =>
    Promise.all([
      fetchEconomyProjectStats(force),
      fetchEconomyInvestmentStats(force),
      fetchEconomyRevenueStats(force),
      fetchEconomyTransactionStats(force),
      fetchEconomyOverview(force),
      fetchPartyDuePaymentStats(force),
      fetchPartyDueAmountStats(force),
      fetchPartyDueRateStats(force),
      fetchPartyDueOverview(force)
    ])

  const refreshAll = (force = true) =>
    Promise.all([
      fetchPopulationByAge(force),
      fetchPopulationByIncomeSource(force),
      fetchPopulationByPoliticalStatus(force),
      fetchPopulationBySex(force),
      fetchPopulationByEducationLevel(force),
      fetchPopulationByWelfareStatus(force),
      fetchPopulationByMaritalStatus(force),
      fetchBoolenCount(force),
      fetchPartyMemberCounts(force),
      fetchVillagerResidentCounts(force),
      fetchHealthStatusCounts(force),
      fetchPovertyCounts(force),
      fetchDisabilityCounts(force),
      fetchOnlyChildFamilyCounts(force),
      fetchMartyrFamilyCounts(force),
      fetchOtherSubsidyCounts(force),
      fetchVeteranCounts(force),
      fetchResidenceCounts(force),
      fetchTotalPopulation(force),
      fetchOverview(force),
      fetchEconomyProjectStats(force),
      fetchEconomyInvestmentStats(force),
      fetchEconomyRevenueStats(force),
      fetchEconomyTransactionStats(force),
      fetchEconomyOverview(force),
      fetchPartyDuePaymentStats(force),
      fetchPartyDueAmountStats(force),
      fetchPartyDueRateStats(force),
      fetchPartyDueOverview(force),
      fetchCommitteeMemberStats(force),
      fetchCommitteeDutyStats(force),
      fetchCommitteeOverview(force),
      fetchVillageComprehensiveOverview(force)
    ])

  const scheduleAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }

    if (!autoRefresh.value) {
      return
    }

    refreshTimer = setInterval(() => {
      refreshEconomyAndParty(true).catch(() => null)
    }, refreshInterval.value)
  }

  watch(autoRefresh, scheduleAutoRefresh, { immediate: true })
  watch(refreshInterval, scheduleAutoRefresh)

  const setAutoRefresh = (value: boolean) => {
    autoRefresh.value = value
  }

  const setRefreshInterval = (value: number) => {
    refreshInterval.value = value
  }

  const clearCache = (keys?: string[]) => {
    if (!keys || keys.length === 0) {
      cache.value = {}
      return
    }

    const copy = { ...cache.value }
    keys.forEach((key) => {
      delete copy[key]
    })
    cache.value = copy
  }

  return {
    autoRefresh,
    refreshInterval,
    setAutoRefresh,
    setRefreshInterval,
    isLoading,
    getError,
    refreshAll,
    refreshEconomyAndParty,
    fetchPopulationByAge,
    fetchPopulationByIncomeSource,
    fetchPopulationByPoliticalStatus,
    fetchPopulationBySex,
    fetchPopulationByEducationLevel,
    fetchPopulationByWelfareStatus,
    fetchPopulationByMaritalStatus,
    fetchBoolenCount,
    fetchPartyMemberCounts,
    fetchVillagerResidentCounts,
    fetchHealthStatusCounts,
    fetchPovertyCounts,
    fetchDisabilityCounts,
    fetchOnlyChildFamilyCounts,
    fetchMartyrFamilyCounts,
    fetchOtherSubsidyCounts,
    fetchVeteranCounts,
    fetchResidenceCounts,
    fetchTotalPopulation,
    fetchOverview,
    fetchEconomyProjectStats,
    fetchEconomyInvestmentStats,
    fetchEconomyRevenueStats,
    fetchEconomyTransactionStats,
    fetchEconomyOverview,
    fetchPartyDuePaymentStats,
    fetchPartyDueAmountStats,
    fetchPartyDueRateStats,
    fetchPartyDueOverview,
    fetchCommitteeMemberStats,
    fetchCommitteeDutyStats,
    fetchCommitteeOverview,
    fetchVillageComprehensiveOverview,
    getPopulationByAge: () => getData<PopulationStructureResponse>('populationByAge'),
    getPopulationByIncomeSource: () =>
      getData<PopulationStructureResponse>('populationByIncomeSource'),
    getPopulationByPoliticalStatus: () =>
      getData<PopulationStructureResponse>('populationByPoliticalStatus'),
    getPopulationBySex: () => getData<PopulationStructureResponse>('populationBySex'),
    getPopulationByEducationLevel: () =>
      getData<PopulationStructureResponse>('populationByEducationLevel'),
    getPopulationByWelfareStatus: () =>
      getData<PopulationStructureResponse>('populationByWelfareStatus'),
    getPopulationByMaritalStatus: () =>
      getData<PopulationStructureResponse>('populationByMaritalStatus'),
    getBoolenCount: () => getData<CountResponse[]>('boolenCount'),
    getPartyMemberCounts: () => getData<CountResponse[]>('partyMemberCounts'),
    getVillagerResidentCounts: () => getData<CountResponse[]>('villagerResidentCounts'),
    getHealthStatusCounts: () => getData<CountResponse[]>('healthStatusCounts'),
    getPovertyCounts: () => getData<CountResponse[]>('povertyCounts'),
    getDisabilityCounts: () => getData<CountResponse[]>('disabilityCounts'),
    getOnlyChildFamilyCounts: () => getData<CountResponse[]>('onlyChildFamilyCounts'),
    getMartyrFamilyCounts: () => getData<CountResponse[]>('martyrFamilyCounts'),
    getOtherSubsidyCounts: () => getData<CountResponse[]>('otherSubsidyCounts'),
    getVeteranCounts: () => getData<CountResponse[]>('veteranCounts'),
    getResidenceCounts: () => getData<CountResponse[]>('residenceCounts'),
    getTotalPopulation: () => getData<number>('totalPopulation') ?? 0,
    getOverview: () => getData<OverviewMap>('overview'),
    getEconomyProjectStats: () => getData<CountResponse[]>('economyProjectStats'),
    getEconomyInvestmentStats: () => getData<CountResponse[]>('economyInvestmentStats'),
    getEconomyRevenueStats: () => getData<CountResponse[]>('economyRevenueStats'),
    getEconomyTransactionStats: () => getData<CountResponse[]>('economyTransactionStats'),
    getEconomyOverview: () => getData<OverviewMap>('economyOverview'),
    getPartyDuePaymentStats: () => getData<CountResponse[]>('partyDuePaymentStats'),
    getPartyDueAmountStats: () => getData<CountResponse[]>('partyDueAmountStats'),
    getPartyDueRateStats: () => getData<OverviewMap>('partyDueRateStats'),
    getPartyDueOverview: () => getData<OverviewMap>('partyDueOverview'),
    getCommitteeMemberStats: () => getData<CountResponse[]>('committeeMemberStats'),
    getCommitteeDutyStats: () => getData<CommitteeDutyCountResponse[]>('committeeDutyStats'),
    getCommitteeOverview: () => getData<OverviewMap>('committeeOverview'),
    getVillageComprehensiveOverview: () =>
      getData<VillageOverviewResponse>('villageOverview'),
    clearCache
  }
})
