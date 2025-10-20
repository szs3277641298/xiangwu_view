import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Credits-style 滚动Hook
 * 使用 requestAnimationFrame 驱动平滑滚动，支持逐条对齐和停顿
 */

// 滚动参数常量
const SPEED_PX_PER_SEC = 40      // 滚动速度：每秒40像素
const ACTIVE_HOLD_MS = 1200      // 当前项高亮停顿时间：1200毫秒
const GROUP_PAUSE_MS = 800       // 组间切换停顿时间：800毫秒

export interface CreditsSnapOptions {
  speedPxPerSec?: number
  activeHoldMs?: number
  groupPauseMs?: number
  pauseOnHover?: boolean
  pauseOnBlur?: boolean
}

export interface DataGroup {
  items: Array<{
    label: string
    value: any
    unit?: string
  }>
}

/**
 * Credits 滚动 Hook
 * @param dataGroupsRef 数据分组的响应式引用
 * @param currentGroupRef 当前组索引的响应式引用
 * @param containerRef 滚动容器的DOM引用
 * @param options 配置选项
 */
export function useCreditsSnap(
  dataGroupsRef: { value: DataGroup[] },
  currentGroupRef: { value: number },
  containerRef: { value: HTMLElement | null },
  options: CreditsSnapOptions = {}
) {
  const {
    speedPxPerSec = SPEED_PX_PER_SEC,
    activeHoldMs = ACTIVE_HOLD_MS,
    groupPauseMs = GROUP_PAUSE_MS,
    pauseOnHover = true,
    pauseOnBlur = true
  } = options

  // 内部状态
  const isPlaying = ref(true)
  const isPausedByHover = ref(false)
  const isPausedByBlur = ref(false)
  const currentItemIndex = ref(0)
  const translateY = ref(0)
  
  let animationFrameId: number | null = null
  let lastTimestamp = 0
  let holdStartTime = 0
  let isHolding = false
  let groupPauseStartTime = 0
  let isGroupPausing = false
  
  // 获取当前数据组
  const getCurrentGroup = () => {
    if (!dataGroupsRef.value || dataGroupsRef.value.length === 0) return null
    return dataGroupsRef.value[currentGroupRef.value] || null
  }

  // 获取当前项
  const getCurrentItem = () => {
    const group = getCurrentGroup()
    if (!group || !group.items) return null
    return group.items[currentItemIndex.value] || null
  }

  // 计算是否应该暂停
  const shouldPause = () => {
    return isPausedByHover.value || 
           isPausedByBlur.value || 
           !isPlaying.value
  }

  // 获取指定项的DOM元素
  const getItemElement = (index: number): HTMLElement | null => {
    if (!containerRef.value) return null
    const items = containerRef.value.querySelectorAll('.data-item')
    return items[index] as HTMLElement || null
  }

  // 获取项的高度（包括margin）
  const getItemHeight = (index: number): number => {
    const element = getItemElement(index)
    if (!element) return 0
    
    const rect = element.getBoundingClientRect()
    const style = window.getComputedStyle(element)
    const marginTop = parseFloat(style.marginTop) || 0
    const marginBottom = parseFloat(style.marginBottom) || 0
    
    return rect.height + marginTop + marginBottom
  }

  // 计算到指定项顶部的距离
  const getOffsetToItem = (targetIndex: number): number => {
    let offset = 0
    for (let i = 0; i < targetIndex; i++) {
      offset += getItemHeight(i)
    }
    return offset
  }

  // 更新active类名
  const updateActiveClass = (activeIndex: number) => {
    if (!containerRef.value) return
    
    const items = containerRef.value.querySelectorAll('.data-item')
    items.forEach((item, index) => {
      if (index === activeIndex) {
        item.classList.add('active')
        item.classList.remove('prev', 'next')
      } else if (index < activeIndex) {
        item.classList.add('prev')
        item.classList.remove('active', 'next')
      } else {
        item.classList.add('next')
        item.classList.remove('active', 'prev')
      }
    })
  }

  // 跳转到下一项
  const scrollToNextItem = () => {
    const group = getCurrentGroup()
    if (!group || !group.items) return

    const nextIndex = currentItemIndex.value + 1

    if (nextIndex >= group.items.length) {
      // 到达组末尾，准备切换到下一组
      isGroupPausing = true
      groupPauseStartTime = performance.now()
      return
    }

    currentItemIndex.value = nextIndex
    isHolding = true
    holdStartTime = performance.now()
    updateActiveClass(currentItemIndex.value)
  }

  // 跳转到上一项
  const scrollToPrevItem = () => {
    const group = getCurrentGroup()
    if (!group || !group.items) return

    const prevIndex = currentItemIndex.value - 1

    if (prevIndex < 0) {
      // 到达组开头，切换到上一组
      const prevGroupIndex = (currentGroupRef.value - 1 + dataGroupsRef.value.length) % dataGroupsRef.value.length
      jumpToGroup(prevGroupIndex)
      
      // 跳到上一组的最后一项
      const prevGroup = dataGroupsRef.value[prevGroupIndex]
      if (prevGroup && prevGroup.items) {
        currentItemIndex.value = prevGroup.items.length - 1
        translateY.value = getOffsetToItem(currentItemIndex.value)
        updateActiveClass(currentItemIndex.value)
      }
      return
    }

    currentItemIndex.value = prevIndex
    translateY.value = getOffsetToItem(currentItemIndex.value)
    updateActiveClass(currentItemIndex.value)
  }

  // 跳转到指定组
  const jumpToGroup = (groupIndex: number) => {
    if (groupIndex < 0 || groupIndex >= dataGroupsRef.value.length) return
    
    currentGroupRef.value = groupIndex
    currentItemIndex.value = 0
    translateY.value = 0
    isHolding = true
    holdStartTime = performance.now()
    isGroupPausing = false
    updateActiveClass(0)
  }

  // 动画循环
  const animate = (timestamp: number) => {
    if (!isPlaying.value) {
      animationFrameId = requestAnimationFrame(animate)
      return
    }

    if (shouldPause()) {
      lastTimestamp = timestamp
      animationFrameId = requestAnimationFrame(animate)
      return
    }

    const group = getCurrentGroup()
    if (!group || !group.items || group.items.length === 0) {
      animationFrameId = requestAnimationFrame(animate)
      return
    }

    if (lastTimestamp === 0) {
      lastTimestamp = timestamp
    }

    const deltaTime = timestamp - lastTimestamp
    lastTimestamp = timestamp

    // 处理组间暂停
    if (isGroupPausing) {
      const pauseElapsed = timestamp - groupPauseStartTime
      if (pauseElapsed >= groupPauseMs) {
        // 切换到下一组
        const nextGroupIndex = (currentGroupRef.value + 1) % dataGroupsRef.value.length
        jumpToGroup(nextGroupIndex)
        isGroupPausing = false
      }
      animationFrameId = requestAnimationFrame(animate)
      return
    }

    // 处理项停顿
    if (isHolding) {
      const holdElapsed = timestamp - holdStartTime
      if (holdElapsed >= activeHoldMs) {
        isHolding = false
        // 开始滚动到下一项
      } else {
        animationFrameId = requestAnimationFrame(animate)
        return
      }
    }

    // 计算目标位置（下一项的顶部）
    const targetOffset = getOffsetToItem(currentItemIndex.value + 1)
    const distance = targetOffset - translateY.value

    if (distance <= 0) {
      // 已到达目标位置
      scrollToNextItem()
      animationFrameId = requestAnimationFrame(animate)
      return
    }

    // 平滑滚动
    const speed = speedPxPerSec / 1000 // 转换为每毫秒的像素
    const movement = speed * deltaTime

    if (movement >= distance) {
      // 即将到达，直接对齐
      translateY.value = targetOffset
      scrollToNextItem()
    } else {
      translateY.value += movement
    }

    // 应用transform
    if (containerRef.value) {
      const dataList = containerRef.value.querySelector('.data-list')
      if (dataList) {
        ;(dataList as HTMLElement).style.transform = `translateY(-${translateY.value}px)`
      }
    }

    animationFrameId = requestAnimationFrame(animate)
  }

  // 启动滚动
  const start = () => {
    isPlaying.value = true
    if (!animationFrameId) {
      lastTimestamp = 0
      holdStartTime = performance.now()
      isHolding = true
      updateActiveClass(currentItemIndex.value)
      animationFrameId = requestAnimationFrame(animate)
    }
  }

  // 停止滚动
  const stop = () => {
    isPlaying.value = false
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  // 下一项（手动控制）
  const next = () => {
    scrollToNextItem()
  }

  // 上一项（手动控制）
  const prev = () => {
    scrollToPrevItem()
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

  // 生命周期
  onMounted(() => {
    // 监听页面可见性
    if (pauseOnBlur) {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
    
    // 自动启动
    start()
  })

  onUnmounted(() => {
    // 清理
    stop()
    
    if (pauseOnBlur) {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  })

  return {
    // 状态
    isPlaying,
    currentItemIndex,
    translateY,
    
    // 控制方法
    start,
    stop,
    next,
    prev,
    jumpToGroup,
    
    // 事件处理器
    onMouseEnter,
    onMouseLeave,
    
    // 内部状态（用于调试）
    isPausedByHover,
    isPausedByBlur,
    isHolding: () => isHolding,
    isGroupPausing: () => isGroupPausing
  }
}
