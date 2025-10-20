<template>
  <span>{{ formattedValue }}</span>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    from?: number
    to: number
    duration?: number
    showSeparator?: boolean
  }>(),
  {
    from: 0,
    duration: 1000,
    showSeparator: false
  }
)

const currentValue = ref(props.from)
let animationFrame = 0

const formattedValue = computed(() => {
  const value = Number.isFinite(currentValue.value) ? currentValue.value : 0
  if (props.showSeparator) {
    return Math.round(value).toLocaleString()
  }
  return Math.round(value).toString()
})

const animateTo = (target: number) => {
  cancelAnimationFrame(animationFrame)

  const start = Number.isFinite(props.from) ? Number(props.from) : 0
  const startValue = Number.isFinite(currentValue.value) ? currentValue.value : start
  const delta = target - startValue
  const duration = Math.max(0, props.duration)
  const startTime = performance.now()

  const step = (now: number) => {
    const elapsed = now - startTime
    if (duration === 0 || Math.abs(delta) < 0.001) {
      currentValue.value = target
      return
    }

    const progress = Math.min(1, elapsed / duration)
    currentValue.value = startValue + delta * progress

    if (progress < 1) {
      animationFrame = requestAnimationFrame(step)
    }
  }

  animationFrame = requestAnimationFrame(step)
}

onMounted(() => {
  currentValue.value = props.from
  animateTo(props.to)
})

watch(
  () => props.to,
  (value) => {
    animateTo(value)
  }
)

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
})
</script>

<style scoped>
span {
  display: inline-block;
}
</style>
