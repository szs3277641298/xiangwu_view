<template>
  <div class="dynamic-background">
    <!-- 简洁的纯白色背景 -->
  </div>
</template>

<script>
export default {
  name: 'DynamicBackground'
}
</script>

<style scoped>
.dynamic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #ffffff;
  z-index: 0;
}
</style>
