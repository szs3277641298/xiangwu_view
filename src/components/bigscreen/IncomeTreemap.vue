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
  tooltip: {
    formatter: ({ name, value }: any) => `${name}: ${value}`
  },
  series: [
    {
      type: 'treemap',
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: {
        show: true,
        color: '#E6F0FF',
        formatter: '{b}\n{c}'
      },
      itemStyle: {
        borderColor: '#0B1222',
        borderWidth: 1,
        gapWidth: 2
      },
      data: props.groups.map((item, index) => ({
        name: item.range,
        value: item.count,
        itemStyle: {
          color: baseColors[index % baseColors.length]
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
