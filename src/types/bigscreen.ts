export interface ApiResult<T> { code: number; msg: string; data: T }

export interface PopulationStructureResponse {
  totalPopulation: number
  groups: { range: string; count: number; proportion: number }[]
}

export interface CountResponse {
  name: string
  count: number
}

export interface CommitteeDutyCountResponse {
  dutyId: number
  dutyName: string
  count: number
  proportion: number
}

export type OverviewMap = Record<string, number | string | boolean | null>

export interface VillageOverviewResponse {
  totalPopulation: number
  totalPartyMembers: number
  totalCommitteeMembers: number
  totalEconomyProjects: number
  totalEconomyInvestment: number
  totalEconomyRevenue: number
  totalEconomyIncome: number
  totalEconomyExpense: number
  totalPartyDuesAmount: number
  paidPartyDuesAmount: number
  unpaidPartyDuesAmount: number
  overduePartyDuesAmount: number
}
