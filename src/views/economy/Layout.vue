<template>
  <div class="economy-layout">
    
    <div class="layout-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
// 布局组件，主要用于路由嵌套和统一的页面结构
</script>

<style scoped>
.economy-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.layout-header {
  background-color: white;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.layout-header h2 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 8px;
  font-weight: 600;
}

.layout-header p {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.layout-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
</style>