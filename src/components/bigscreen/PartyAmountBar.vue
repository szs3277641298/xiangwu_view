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
  grid: {
    left: 32,
    right: 16,
    top: 16,
    bottom: 32,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: props.data.map(item => item.name),
    axisLabel: { color: '#E6F0FF' },
    axisLine: { lineStyle: { color: 'rgba(166, 191, 248, 0.3)' } },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#A6BFF8' },
    splitLine: { lineStyle: { color: 'rgba(78, 154, 254, 0.08)' } }
  },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  series: [
    {
      type: 'bar',
      barWidth: 24,
      itemStyle: { borderRadius: [6, 6, 0, 0] },
      data: props.data.map((item, index) => ({
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
