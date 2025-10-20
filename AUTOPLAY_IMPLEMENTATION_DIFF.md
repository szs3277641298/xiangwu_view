# 图表自动轮播功能实现差异对比

## 新增文件：`src/hooks/useTabAutoplay.ts`

```typescript
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

export interface AutoplayOptions {
  intervalMs?: number
  pauseOnHover?: boolean
  pauseOnBlur?: boolean
}

/**
 * 自动轮播Hook
 * @param keys Tab的key数组
 * @param modelRef 当前激活的tab的响应式引用
 * @param options 配置选项
 */
export function useTabAutoplay(
  keys: string[],
  modelRef: { value: string },
  options: AutoplayOptions = {}
) {
  const {
    intervalMs = 8000,
    pauseOnHover = true,
    pauseOnBlur = true
  } = options

  // 内部状态
  const isPlaying = ref(true)
  const isPausedByHover = ref(false)
  const isPausedByBlur = ref(false)
  const isPausedByUser = ref(false)
  const userPauseTimeout = ref<number | null>(null)
  
  let autoplayTimer: number | null = null

  // 计算是否应该暂停
  const shouldPause = computed(() => {
    return isPausedByHover.value || 
           isPausedByBlur.value || 
           isPausedByUser.value || 
           !isPlaying.value
  })

  // 获取当前索引
  const getCurrentIndex = () => {
    return keys.indexOf(modelRef.value)
  }

  // 切换到下一个tab
  const nextTab = () => {
    if (keys.length === 0) return
    
    const currentIndex = getCurrentIndex()
    const nextIndex = (currentIndex + 1) % keys.length
    modelRef.value = keys[nextIndex]
  }

  // 启动自动播放
  const startAutoplay = () => {
    stopAutoplay()
    
    if (shouldPause.value || keys.length <= 1) return
    
    autoplayTimer = window.setTimeout(() => {
      nextTab()
      startAutoplay() // 递归调用以继续播放
    }, intervalMs)
  }

  // 停止自动播放
  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearTimeout(autoplayTimer)
      autoplayTimer = null
    }
  }

  // 用户手动切换处理
  const onUserSwitch = () => {
    // 暂停一个周期
    isPausedByUser.value = true
    
    // 清除之前的超时
    if (userPauseTimeout.value) {
      clearTimeout(userPauseTimeout.value)
    }
    
    // 一个周期后恢复自动播放
    userPauseTimeout.value = window.setTimeout(() => {
      isPausedByUser.value = false
      userPauseTimeout.value = null
    }, intervalMs)
  }

  // 鼠标悬停控制
  const onMouseEnter = () => {
    if (pauseOnHover) {
      isPausedByHover.value = true
    }
  }

  const onMouseLeave = () => {
    if (pauseOnHover) {
      isPausedByHover.value = false
    }
  }

  // 页面可见性控制
  const handleVisibilityChange = () => {
    if (pauseOnBlur) {
      isPausedByBlur.value = document.hidden
    }
  }

  // 播放控制
  const play = () => {
    isPlaying.value = true
  }

  const pause = () => {
    isPlaying.value = false
  }

  const toggle = () => {
    isPlaying.value = !isPlaying.value
  }

  // 监听暂停状态变化
  watch(shouldPause, (newVal) => {
    if (newVal) {
      stopAutoplay()
    } else {
      startAutoplay()
    }
  }, { immediate: true })

  // 监听keys变化
  watch(() => keys, () => {
    // keys改变时，重新开始自动播放
    if (!shouldPause.value) {
      startAutoplay()
    }
  }, { deep: true })

  // 生命周期
  onMounted(() => {
    // 监听页面可见性变化
    if (pauseOnBlur) {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
    
    // 开始自动播放
    if (!shouldPause.value) {
      startAutoplay()
    }
  })

  onUnmounted(() => {
    // 清理定时器
    stopAutoplay()
    
    if (userPauseTimeout.value) {
      clearTimeout(userPauseTimeout.value)
    }
    
    // 移除事件监听
    if (pauseOnBlur) {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  })

  return {
    // 状态
    isPlaying: computed(() => isPlaying.value),
    isPaused: shouldPause,
    
    // 控制方法
    play,
    pause,
    toggle,
    nextTab,
    onUserSwitch,
    
    // 事件处理器
    onMouseEnter,
    onMouseLeave,
    
    // 内部状态（用于调试）
    isPausedByHover: computed(() => isPausedByHover.value),
    isPausedByBlur: computed(() => isPausedByBlur.value),
    isPausedByUser: computed(() => isPausedByUser.value)
  }
}
```

## DataScreen.vue 集成差异

### 1. 导入Hook

```diff
<script setup>
- import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
+ import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ArrowLeft, DataBoard, Clock, ArrowRight } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { bigScreenAPI } from '@/api/api'
import { useRouter } from 'vue-router'
+ import { useTabAutoplay } from '@/hooks/useTabAutoplay'
```

### 2. 初始化自动轮播Hooks

在activeTabs定义后添加：

```typescript
// 自动轮播Hooks配置
const autoplayHooks = {
  populationStructure: useTabAutoplay(
    ['age', 'incomeSource', 'politicalStatus', 'sex', 'educationLevel', 'welfareStatus', 'maritalStatus'],
    { get value() { return activeTabs.populationStructure }, set value(v) { activeTabs.populationStructure = v } },
    { intervalMs: 8000, pauseOnHover: true, pauseOnBlur: true }
  ),
  basicIdentity: useTabAutoplay(
    ['boolen', 'partyMember', 'villageResident'],
    { get value() { return activeTabs.basicIdentity }, set value(v) { activeTabs.basicIdentity = v } },
    { intervalMs: 8000, pauseOnHover: true, pauseOnBlur: true }
  ),
  healthDifficulty: useTabAutoplay(
    ['health', 'poverty', 'disability'],
    { get value() { return activeTabs.healthDifficulty }, set value(v) { activeTabs.healthDifficulty = v } },
    { intervalMs: 8000, pauseOnHover: true, pauseOnBlur: true }
  ),
  priorityFamily: useTabAutoplay(
    ['onlyChild', 'martyrFamily', 'otherSubsidy'],
    { get value() { return activeTabs.priorityFamily }, set value(v) { activeTabs.priorityFamily = v } },
    { intervalMs: 8000, pauseOnHover: true, pauseOnBlur: true }
  ),
  residenceVeteran: useTabAutoplay(
    ['residence', 'veteran'],
    { get value() { return activeTabs.residenceVeteran }, set value(v) { activeTabs.residenceVeteran = v } },
    { intervalMs: 8000, pauseOnHover: true, pauseOnBlur: true }
  ),
  economyProjectInvestment: useTabAutoplay(
    ['project', 'investment'],
    { get value() { return activeTabs.economyProjectInvestment }, set value(v) { activeTabs.economyProjectInvestment = v } },
    { intervalMs: 8000, pauseOnHover: true, pauseOnBlur: true }
  ),
  economyRevenueTransaction: useTabAutoplay(
    ['revenue', 'transaction'],
    { get value() { return activeTabs.economyRevenueTransaction }, set value(v) { activeTabs.economyRevenueTransaction = v } },
    { intervalMs: 8000, pauseOnHover: true, pauseOnBlur: true }
  )
}
```

### 3. 修改Tab切换处理函数

```diff
// 补充缺失: Tab 切换处理函数（模板调用）
function handleTabChange(groupKey) {
+  // 用户手动切换时通知hook暂停一个周期
+  if (autoplayHooks[groupKey]) {
+    autoplayHooks[groupKey].onUserSwitch()
+  }
  loadChart(groupKey)
}
```

### 4. 添加Tab变化监听

```typescript
// 监听tab变化并重新加载图表数据
// 为每个图表组监听tab变化
Object.keys(activeTabs).forEach(groupKey => {
  watch(() => activeTabs[groupKey], () => {
    loadChart(groupKey)
  })
})
```

### 5. 重绘函数改进（仅重绘当前实例）

```diff
// 重绘（不请求）
- const redrawChart = (groupKey) => {
+ const redrawChart = (groupKey) => { // 仅重绘当前实例
  const cache = groupDataCache[groupKey]
  if (!cache) return
  const isProportion = displayModes[groupKey] === 'proportion' && groupProportionAvailable[groupKey]
  const title = `${titleMap[groupKey]} - ${tabLabel(groupKey, activeTabs[groupKey])}${isProportion ? '(占比)' : '(数量)'}`
  const option = buildOption({
    title,
    categories: cache.categories,
    data: isProportion ? cache.proportions : cache.counts,
    isProportion
  })
  const inst = chartInstances[groupKey]
- if (inst) inst.setOption(option, true)
+ if (inst) {
+   // 仅重绘当前实例，使用 setOption 进行动画更新
+   inst.setOption(option, true)
+ }
}
```

### 6. 模板中添加鼠标事件处理

为每个图表区域的 `.chart-box` 添加鼠标事件：

#### 人口结构分布

```diff
- <div class="chart-box">
+ <div class="chart-box" 
+      @mouseenter="autoplayHooks.populationStructure.onMouseEnter"
+      @mouseleave="autoplayHooks.populationStructure.onMouseLeave">
```

#### 基础身份计数

```diff
- <div class="chart-box">
+ <div class="chart-box"
+      @mouseenter="autoplayHooks.basicIdentity.onMouseEnter"
+      @mouseleave="autoplayHooks.basicIdentity.onMouseLeave">
```

#### 健康与困难状况

```diff
- <div class="chart-box full-width">
+ <div class="chart-box full-width"
+      @mouseenter="autoplayHooks.healthDifficulty.onMouseEnter"
+      @mouseleave="autoplayHooks.healthDifficulty.onMouseLeave">
```

#### 优抚与家庭类

```diff
- <div class="chart-box">
+ <div class="chart-box"
+      @mouseenter="autoplayHooks.priorityFamily.onMouseEnter"
+      @mouseleave="autoplayHooks.priorityFamily.onMouseLeave">
```

#### 居住与退役身份

```diff
- <div class="chart-box">
+ <div class="chart-box"
+      @mouseenter="autoplayHooks.residenceVeteran.onMouseEnter"
+      @mouseleave="autoplayHooks.residenceVeteran.onMouseLeave">
```

#### 集体经济（项目与投资）

```diff
- <div class="chart-box">
+ <div class="chart-box"
+      @mouseenter="autoplayHooks.economyProjectInvestment.onMouseEnter"
+      @mouseleave="autoplayHooks.economyProjectInvestment.onMouseLeave">
```

#### 集体经济（收入与收支）

```diff
- <div class="chart-box full-width">
+ <div class="chart-box full-width"
+      @mouseenter="autoplayHooks.economyRevenueTransaction.onMouseEnter"
+      @mouseleave="autoplayHooks.economyRevenueTransaction.onMouseLeave">
```

## 功能特性

### 自动轮播功能
- ✅ 每8秒自动切换到下一个Tab
- ✅ 鼠标悬停图表区域时暂停轮播
- ✅ 页面失去焦点时暂停轮播（visibilitychange事件）
- ✅ 用户手动切换后暂停一个周期（8秒）再继续自动轮播
- ✅ 切换时仅重绘当前图表实例，使用 ECharts 的 setOption 方法
- ✅ 支持多个图表区域独立轮播
- ✅ 自动处理生命周期，清理定时器避免内存泄漏

### Hook设计优势
- 🎯 响应式设计，支持实时状态变化
- 🎯 灵活配置轮播间隔、暂停条件
- 🎯 完善的事件处理机制
- 🎯 良好的TypeScript类型支持
- 🎯 可复用的组合式函数设计