<template>
  <div class="roi-gauge">
    <div class="roi-gauge__chart">
      <VChart v-if="roiItem" :option="option" autoresize class="chart__canvas" />
      <div v-else class="chart__empty">暂无ROI数据</div>
    </div>
    <div class="roi-gauge__stats">
      <div v-for="item in summary" :key="item.label" class="roi-gauge__stat">
        <div class="label">{{ item.label }}</div>
        <div class="value">{{ item.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CountResponse } from '@/types/bigscreen'

const props = defineProps<{ data: CountResponse[] }>()

const findByKeyword = (keyword: string) =>
  props.data.find((item) => item.name.toLowerCase().includes(keyword))

const roiItem = computed(() => findByKeyword('roi') || findByKeyword('回报'))

const roiPercentage = computed(() => {
  const raw = Number((roiItem.value?.count ?? 0) as number)
  if (!Number.isFinite(raw)) return 0
  return raw <= 1 ? raw * 100 : raw
})

const option = computed(() => ({
  backgroundColor: 'transparent',
  series: [
    {
      type: 'gauge',
      startAngle: 210,
      endAngle: -30,
      min: 0,
      max: 100,
      splitNumber: 5,
      axisLine: {
        lineStyle: {
          width: 12,
          color: [
            [Math.min(roiPercentage.value / 100, 1), '#41D6C3'],
            [1, 'rgba(78,154,254,0.25)']
          ]
        }
      },
      pointer: { show: false },
      progress: {
        show: true,
        width: 12,
        roundCap: true
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: {
        color: '#A6BFF8'
      },
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
        fontSize: 26,
        color: '#E6F0FF'
      },
      data: [
        {
          value: Number(roiPercentage.value.toFixed(1))
        }
      ]
    }
  ]
}))

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null || Number.isNaN(value)) return '--'
  if (Math.abs(value) >= 1_0000) {
    return `${(value / 1_0000).toFixed(2)} 万元`
  }
  return `${value.toLocaleString()} 元`
}

const summary = computed(() => {
  const totalInvestment = findByKeyword('投') || findByKeyword('investment')
  const annualIncome = findByKeyword('收益') || findByKeyword('income')
  const profit = findByKeyword('净') || findByKeyword('profit')

  return [
    {
      label: totalInvestment?.name ?? '总投资',
      value: formatCurrency(totalInvestment ? totalInvestment.count : undefined)
    },
    {
      label: annualIncome?.name ?? '年收益',
      value: formatCurrency(annualIncome ? annualIncome.count : undefined)
    },
    {
      label: profit?.name ?? '净利润',
      value: formatCurrency(profit ? profit.count : undefined)
    }
  ]
})
</script>

<style scoped>
.roi-gauge {
  display: flex;
  align-items: stretch;
  gap: 16px;
  height: 100%;
}

.roi-gauge__chart {
  flex: 0 0 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart__canvas {
  width: 100%;
  height: 100%;
}

.chart__empty {
  color: rgba(230, 240, 255, 0.6);
}

.roi-gauge__stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
}

.roi-gauge__stat {
  padding: 12px 16px;
  background: rgba(23, 39, 73, 0.75);
  border: 1px solid rgba(78, 154, 254, 0.18);
  border-radius: 12px;
}

.roi-gauge__stat .label {
  font-size: 13px;
  color: rgba(230, 240, 255, 0.7);
  margin-bottom: 4px;
}

.roi-gauge__stat .value {
  font-size: 18px;
  font-weight: 600;
  color: #41d6c3;
}
</style>
