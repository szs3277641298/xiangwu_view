<template>
  <div class="chart">
    <VChart v-if="hasData" :option="option" autoresize class="chart__canvas" />
    <div v-else class="chart__empty">暂无数据</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PopulationStructureResponse } from '@/types/bigscreen'
import { baseColors } from './chartColors'

type Group = PopulationStructureResponse['groups'][number]

const props = defineProps<{ groups: Group[] }>()

const hasData = computed(() => (props.groups?.length ?? 0) > 0)

const option = computed(() => ({
  backgroundColor: 'transparent',
  grid: {
    left: 40,
    right: 16,
    top: 16,
    bottom: 32,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: props.groups.map(item => item.range),
    axisLabel: {
      color: '#E6F0FF',
      interval: 0,
      rotate: 30
    },
    axisLine: { lineStyle: { color: 'rgba(166, 191, 248, 0.3)' } },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#A6BFF8' },
    splitLine: { lineStyle: { color: 'rgba(78, 154, 254, 0.08)' } }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  series: [
    {
      type: 'bar',
      barWidth: 20,
      itemStyle: {
        borderRadius: [6, 6, 0, 0]
      },
      data: props.groups.map((item, index) => ({
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
