<template>
  <div class="chart">
    <VChart v-if="hasData" :option="option" autoresize class="chart__canvas" />
    <div v-else class="chart__empty">暂无数据</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CommitteeDutyCountResponse } from '@/types/bigscreen'
import { baseColors } from './chartColors'

const props = defineProps<{ data: CommitteeDutyCountResponse[] }>()

const hasData = computed(() => (props.data?.length ?? 0) > 0)

const option = computed(() => ({
  backgroundColor: 'transparent',
  grid: {
    left: 8,
    right: 16,
    top: 16,
    bottom: 8,
    containLabel: true
  },
  xAxis: {
    type: 'value',
    axisLabel: { color: '#A6BFF8' },
    splitLine: { lineStyle: { color: 'rgba(78, 154, 254, 0.08)' } }
  },
  yAxis: {
    type: 'category',
    data: props.data.map(item => item.dutyName),
    axisLabel: { color: '#E6F0FF' },
    axisTick: { show: false },
    axisLine: { show: false }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params: any) => {
      const item = params[0]
      const data = props.data[item.dataIndex]
      return `${data.dutyName}<br/>数量：${data.count}<br/>占比：${(data.proportion * 100).toFixed(1)}%`
    }
  },
  series: [
    {
      type: 'bar',
      barWidth: 14,
      itemStyle: { borderRadius: [0, 8, 8, 0] },
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
