<template>
  <div class="kpi-grid">
    <div v-for="item in items" :key="item.label" class="kpi-grid__item">
      <div class="kpi-grid__label">{{ item.label }}</div>
      <div class="kpi-grid__value">{{ item.value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { VillageOverviewResponse } from '@/types/bigscreen'

const props = defineProps<{
  overview?: VillageOverviewResponse | null
}>()

const formatNumber = (value: number | undefined) => {
  if (value === undefined || value === null) return '--'
  if (Math.abs(value) >= 1_0000) {
    return `${(value / 1_0000).toFixed(2)} 万`
  }
  return value.toLocaleString()
}

const items = computed(() => {
  if (!props.overview) return []
  return [
    { label: '总人口', value: formatNumber(props.overview.totalPopulation) },
    { label: '党员人数', value: formatNumber(props.overview.totalPartyMembers) },
    { label: '村委成员', value: formatNumber(props.overview.totalCommitteeMembers) },
    { label: '经济项目', value: formatNumber(props.overview.totalEconomyProjects) },
    { label: '总投资', value: formatNumber(props.overview.totalEconomyInvestment) },
    { label: '总收入', value: formatNumber(props.overview.totalEconomyRevenue) },
    { label: '总支出', value: formatNumber(props.overview.totalEconomyExpense) },
    { label: '净收益', value: formatNumber(props.overview.totalEconomyIncome) },
    { label: '党费总额', value: formatNumber(props.overview.totalPartyDuesAmount) }
  ]
})
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.kpi-grid__item {
  padding: 12px 16px;
  background: rgba(23, 39, 73, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(78, 154, 254, 0.3);
  box-shadow: inset 0 0 12px rgba(78, 154, 254, 0.15);
}

.kpi-grid__label {
  color: rgba(230, 240, 255, 0.65);
  font-size: 12px;
  margin-bottom: 6px;
}

.kpi-grid__value {
  color: #4e9afe;
  font-weight: 700;
  font-size: 20px;
}
</style>
