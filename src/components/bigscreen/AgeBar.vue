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

const topSet = computed(() => {
  const sorted = [...props.groups].sort((a, b) => b.count - a.count)
  return new Set(sorted.slice(0, 5).map(item => item.range))
})

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
    axisLine: { lineStyle: { color: 'rgba(166, 191, 248, 0.3)' } },
    splitLine: { lineStyle: { color: 'rgba(78, 154, 254, 0.1)' } }
  },
  yAxis: {
    type: 'category',
    data: props.groups.map(item => item.range),
    axisLabel: { color: '#E6F0FF' },
    axisLine: { show: false },
    axisTick: { show: false }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  series: [
    {
      type: 'bar',
      barWidth: 14,
      itemStyle: {
        borderRadius: [0, 8, 8, 0]
      },
      emphasis: {
        itemStyle: {
          color: '#FF6B6B'
        }
      },
      data: props.groups.map((item, index) => ({
        value: item.count,
        itemStyle: {
          color: topSet.value.has(item.range)
            ? '#FFA940'
            : baseColors[index % baseColors.length]
        }
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
