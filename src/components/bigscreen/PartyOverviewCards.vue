<template>
  <div class="overview-cards">
    <div v-for="item in items" :key="item.key" class="overview-card">
      <div class="overview-card__label">{{ item.label }}</div>
      <div class="overview-card__value">{{ item.value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OverviewMap } from '@/types/bigscreen'

const props = defineProps<{ data: OverviewMap | undefined }>()

const formatCurrency = (value: number | string | boolean | null | undefined) => {
  if (value === null || value === undefined) return '--'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  if (Math.abs(num) >= 1_0000) {
    return `${(num / 1_0000).toFixed(2)} 万元`
  }
  return `${num.toLocaleString()} 元`
}

const items = computed(() => {
  if (!props.data) return []
  return Object.entries(props.data).map(([key, value]) => ({
    key,
    label: key,
    value: formatCurrency(value)
  }))
})
</script>

<style scoped>
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.overview-card {
  padding: 12px 14px;
  background: rgba(23, 39, 73, 0.82);
  border: 1px solid rgba(78, 154, 254, 0.2);
  border-radius: 12px;
}

.overview-card__label {
  color: rgba(230, 240, 255, 0.65);
  font-size: 13px;
  margin-bottom: 6px;
}

.overview-card__value {
  color: #9b7bff;
  font-weight: 600;
  font-size: 18px;
}
</style>
