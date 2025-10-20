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