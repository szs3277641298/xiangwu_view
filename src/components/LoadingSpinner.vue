<template>
  <div class="loading-spinner">
    <div class="spinner-container">
      <div class="spinner">
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
      </div>
    </div>
    <div class="loading-text">加载中...</div>
  </div>
</template>

<script setup>
// 优化的加载组件
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #409eff;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.spinner-container {
  position: relative;
  margin-bottom: 16px;
}

.spinner {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.spinner-dot {
  width: 8px;
  height: 8px;
  background-color: #409eff;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

.spinner-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.spinner-dot:nth-child(2) {
  animation-delay: -0.16s;
}

.spinner-dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.loading-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>
