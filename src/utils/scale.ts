import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export function useScreenScale(designWidth = 1920, designHeight = 1080) {
  const containerRef = ref<HTMLElement | null>(null)
  const scale = ref(1)
  let resizeObserver: ResizeObserver | null = null

  const applyScale = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    const wScale = width / designWidth
    const hScale = height / designHeight
    scale.value = Math.min(wScale, hScale)
  }

  onMounted(() => {
    applyScale()
    resizeObserver = new ResizeObserver(applyScale)
    resizeObserver.observe(document.documentElement)
    window.addEventListener('resize', applyScale)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', applyScale)
    resizeObserver?.disconnect()
  })

  const style = computed(() => ({
    width: `${designWidth}px`,
    height: `${designHeight}px`,
    transform: `scale(${scale.value})`,
    transformOrigin: '0 0'
  }))

  return {
    containerRef,
    scale,
    style
  }
}
