<template>
  <el-card class="chart-card">
    <template #header>
      <div class="chart-card__header">
        <span class="chart-card__title">{{ title }}</span>
        <div class="chart-card__header-extra">
          <slot name="header-extra" />
        </div>
      </div>
    </template>
    <div class="chart-card__body" :style="bodyStyle">
      <el-skeleton v-if="loading" :rows="4" animated class="chart-card__skeleton" />
      <el-empty v-else-if="error" :description="error" class="chart-card__empty" />
      <el-empty v-else-if="isEmpty" description="暂无数据" class="chart-card__empty" />
      <slot v-else />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  loading?: boolean
  error?: string | null
  isEmpty?: boolean
  height?: string
}>()

const bodyStyle = computed(() => ({
  height: props.height ?? '280px'
}))
</script>

<style scoped>

.chart-card {
  background: linear-gradient(135deg, rgba(23, 39, 73, 0.95), rgba(13, 23, 45, 0.85));
  border: 1px solid rgba(78, 154, 254, 0.2);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
  border-radius: 16px;
  color: #e6f0ff;
}

.chart-card :deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(78, 154, 254, 0.2);
  background: transparent;
}

.chart-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.chart-card__title {
  font-weight: 600;
  letter-spacing: 0.08em;
}

.chart-card__header-extra {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-card__body {
  position: relative;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-card__skeleton {
  width: 100%;
}

.chart-card__empty {
  color: rgba(230, 240, 255, 0.6);
}
</style>
