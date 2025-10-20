import http from '@/utils/http'
import type {
  PopulationStructureResponse,
  CountResponse,
  CommitteeDutyCountResponse,
  OverviewMap,
  VillageOverviewResponse
} from '@/types/bigscreen'

const request = <T>(url: string) => http.get(url) as Promise<T>

const normalizeCountList = (list: any[] = []): CountResponse[] =>
  list.map((item, index) => ({
    name: String(item.name ?? item.fieldName ?? item.FieldName ?? `未命名${index + 1}`),
    count: Number(item.count ?? item.value ?? 0)
  }))

const fetchPopulationStructure = (url: string) =>
  request<PopulationStructureResponse>(url)

const fetchCountList = (url: string) =>
  request<CountResponse[]>(url).then(res => normalizeCountList(res as any))

export const getPopulationByAge = () => fetchPopulationStructure('/bigscreen/populationbyage')
export const getPopulationByIncomeSource = () => fetchPopulationStructure('/bigscreen/populationbyincomesource')
export const getPopulationByPoliticalStatus = () => fetchPopulationStructure('/bigscreen/populationbypoliticalstatus')
export const getPopulationBySex = () => fetchPopulationStructure('/bigscreen/populationbysex')
export const getPopulationByEducationLevel = () => fetchPopulationStructure('/bigscreen/populationbyeducationlevel')
export const getPopulationByWelfareStatus = () => fetchPopulationStructure('/bigscreen/populationbywelfarestatus')
export const getPopulationByMaritalStatus = () => fetchPopulationStructure('/bigscreen/populationbymaritalstatus')

export const getBoolenCount = () => fetchCountList('/bigscreen/boolencount')
export const getPartyMemberCounts = () => fetchCountList('/bigscreen/partymembercounts')
export const getVillagerResidentCounts = () => fetchCountList('/bigscreen/villageresidentcounts')
export const getHealthStatusCounts = () => fetchCountList('/bigscreen/healthstatuscounts')
export const getPovertyCounts = () => fetchCountList('/bigscreen/povertycounts')
export const getDisabilityCounts = () => fetchCountList('/bigscreen/disabilitycounts')
export const getOnlyChildFamilyCounts = () => fetchCountList('/bigscreen/onlychildfamilycounts')
export const getMartyrFamilyCounts = () => fetchCountList('/bigscreen/martyrfamilycounts')
export const getOtherSubsidyCounts = () => fetchCountList('/bigscreen/othersubsidycounts')
export const getVeteranCounts = () => fetchCountList('/bigscreen/veterancounts')
export const getResidenceCounts = () => fetchCountList('/bigscreen/residencecounts')

export const getTotalPopulation = () => request<number>('/bigscreen/totalpopulation')
export const getOverview = () => request<OverviewMap>('/bigscreen/overview')

export const getEconomyProjectStats = () => fetchCountList('/bigscreen/economyprojectstats')
export const getEconomyInvestmentStats = () => fetchCountList('/bigscreen/economyinvestmentstats')
export const getEconomyRevenueStats = () => fetchCountList('/bigscreen/economyrevenuestats')
export const getEconomyTransactionStats = () => fetchCountList('/bigscreen/economytransactionstats')
export const getEconomyOverview = () => request<OverviewMap>('/bigscreen/economyoverview')

export const getPartyDuePaymentStats = () => fetchCountList('/bigscreen/partyduepaymentstats')
export const getPartyDueAmountStats = () => fetchCountList('/bigscreen/partydueamountstats')
export const getPartyDueRateStats = () => request<OverviewMap>('/bigscreen/partydueratestats')
export const getPartyDueOverview = () => request<OverviewMap>('/bigscreen/partydueoverview')

export const getCommitteeMemberStats = () => fetchCountList('/bigscreen/committeememberstats')
export const getCommitteeDutyStats = () =>
  request<CommitteeDutyCountResponse[]>('/bigscreen/committeedutystats')
export const getCommitteeOverview = () => request<OverviewMap>('/bigscreen/committeeoverview')

export const getVillageComprehensiveOverview = () =>
  request<VillageOverviewResponse>('/bigscreen/villagecomprehensiveoverview')
