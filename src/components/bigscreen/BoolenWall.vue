<template>
  <div class="wall">
    <div v-for="item in formatted" :key="item.name" class="wall__item">
      <div class="wall__title">{{ item.name }}</div>
      <n-number-animation
        class="wall__count"
        :from="0"
        :to="item.count"
        :duration="1200"
        show-separator
      />
      <template v-if="item.percent !== null">
        <n-progress :percentage="item.percent" type="line" :height="6" processing color="#4E9AFE" />
        <div class="wall__percent">{{ item.percent.toFixed(1) }}%</div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CountResponse } from '@/types/bigscreen'

const props = defineProps<{
  items: CountResponse[]
  total?: number | null
}>()

const formatted = computed(() =>
  props.items.map((item) => ({
    name: item.name,
    count: item.count,
    percent:
      props.total && props.total > 0 ? Math.min(100, (item.count / props.total) * 100) : null
  }))
)
</script>

<style scoped>
.wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.wall__item {
  padding: 12px 14px;
  background: rgba(23, 39, 73, 0.85);
  border: 1px solid rgba(78, 154, 254, 0.2);
  border-radius: 12px;
  box-shadow: inset 0 0 12px rgba(78, 154, 254, 0.12);
}

.wall__title {
  font-size: 14px;
  color: rgba(230, 240, 255, 0.75);
  margin-bottom: 8px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.wall__count {
  font-size: 24px;
  font-weight: 600;
  color: #4e9afe;
  margin-bottom: 4px;
}

.wall__percent {
  text-align: right;
  color: rgba(230, 240, 255, 0.65);
  font-size: 12px;
}
</style>
