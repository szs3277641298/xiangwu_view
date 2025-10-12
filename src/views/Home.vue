<template>
  <div class="home-container">
    <!-- 主内容区域 - 显示当前路由对应的组件 -->
    <router-view v-slot="{ Component, route }">
      <transition name="fade-slide" mode="out-in" appear>
        <div :key="route.path">
          <component :is="Component" />
        </div>
      </transition>
    </router-view>
  </div>
</template>

<script setup>
// 这个组件只作为所有子路由的容器
</script>

<style scoped>
.home-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* 路由过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease-in-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px) scale(0.98);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(1.02);
}
</style>