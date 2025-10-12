<template>
  <div class="system-layout">
    <!-- 路由视图容器 -->
    <div class="content-container">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../../store/index.js'
import { useRouter } from 'vue-router'

// 用户状态
const userStore = useUserStore()
const router = useRouter()

// 检查是否为管理员
const isAdmin = computed(() => userStore.isAdmin)

// 组件挂载时检查权限
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'

onMounted(() => {
  // 如果不是管理员，重定向到首页
  if (!isAdmin.value) {
    ElMessage.error('您没有权限访问系统管理页面')
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.system-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.page-header {
  background-color: #fff;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  padding: 0 0 24px 0;
  overflow-y: auto;
  width: 100%;
}
</style>