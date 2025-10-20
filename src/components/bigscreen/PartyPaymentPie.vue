<template>
  <div class="chart">
    <VChart v-if="hasData" :option="option" autoresize class="chart__canvas" />
    <div v-else class="chart__empty">暂无数据</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CountResponse } from '@/types/bigscreen'
import { baseColors } from './chartColors'

const props = defineProps<{ data: CountResponse[] }>()

const hasData = computed(() => (props.data?.length ?? 0) > 0)

const option = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      itemStyle: { borderColor: '#0B1222', borderWidth: 2 },
      label: { color: '#E6F0FF' },
      data: props.data.map((item, index) => ({
        name: item.name,
        value: item.count,
        itemStyle: { color: baseColors[index % baseColors.length] }
      }))
    }
  ]
}))
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
.chart__canvas {
  width: 100%;
  height: 100%;
}
.chart__empty {
  color: rgba(230, 240, 255, 0.6);
}
</style>
