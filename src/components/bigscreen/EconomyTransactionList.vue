<template>
  <div class="transaction-list">
    <div v-for="item in data" :key="item.name" class="transaction-list__item">
      <div class="transaction-list__name">{{ item.name }}</div>
      <div class="transaction-list__value">{{ formatValue(item.count) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CountResponse } from '@/types/bigscreen'

const props = defineProps<{ data: CountResponse[] }>()

const formatValue = (value: number) => {
  if (Math.abs(value) >= 1_0000) {
    return `${(value / 1_0000).toFixed(2)} 万元`
  }
  return `${value.toLocaleString()} 元`
}
</script>

<style scoped>
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-list__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(23, 39, 73, 0.78);
  border: 1px solid rgba(78, 154, 254, 0.16);
  border-radius: 12px;
}

.transaction-list__name {
  color: rgba(230, 240, 255, 0.75);
  font-size: 14px;
}

.transaction-list__value {
  color: #ffa940;
  font-weight: 600;
}
</style>
