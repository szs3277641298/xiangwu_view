<template>
  <div class="chart">
    <VChart :option="option" autoresize class="chart__canvas" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OverviewMap } from '@/types/bigscreen'

const props = defineProps<{ data: OverviewMap | undefined }>()

const parseRate = (keys: string[]) => {
  if (!props.data) return 0
  for (const key of keys) {
    const value = props.data[key]
    const num = Number(value)
    if (!Number.isNaN(num)) {
      return num <= 1 ? num * 100 : num
    }
  }
  return 0
}

const monthRate = computed(() => parseRate(['monthRate', 'currentMonthRate', 'thisMonth']))
const overallRate = computed(() => parseRate(['overallRate', 'totalRate', 'overall']))

const buildSeries = (center: [string, string], value: number, color: string, title: string) => ({
  type: 'gauge',
  center,
  startAngle: 210,
  endAngle: -30,
  min: 0,
  max: 100,
  splitNumber: 4,
  axisLine: {
    lineStyle: {
      width: 10,
      color: [
        [Math.min(value / 100, 1), color],
        [1, 'rgba(78,154,254,0.25)']
      ]
    }
  },
  pointer: { show: false },
  progress: { show: true, width: 10, roundCap: true },
  axisTick: { show: false },
  splitLine: { show: false },
  axisLabel: { show: false },
  title: {
    show: true,
    color: '#A6BFF8',
    fontSize: 14,
    offsetCenter: [0, '75%']
  },
  detail: {
    valueAnimation: true,
    formatter: '{value}%',
    fontSize: 24,
    color: '#E6F0FF'
  },
  data: [
    {
      value: Number(value.toFixed(1)),
      name: title
    }
  ]
})

const option = computed(() => ({
  backgroundColor: 'transparent',
  series: [
    buildSeries(['30%', '55%'], monthRate.value, '#4E9AFE', '本月缴费率'),
    buildSeries(['70%', '55%'], overallRate.value, '#41D6C3', '总体缴费率')
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
</style>
