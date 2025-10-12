<template>
  <div class="party-layout">
    <!-- 标题区域 -->
    <div class="page-header">
      <p v-if="!isAdmin">访客模式下仅能查看部分信息</p>
    </div>
    
    <!-- 路由视图容器 -->
    <div class="content-container">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../../store/index.js'

// 用户状态
const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)
</script>

<style scoped>
.party-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-header p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.content-container {
  flex: 1;
  overflow: auto;
  padding-bottom: 20px;
}
</style>