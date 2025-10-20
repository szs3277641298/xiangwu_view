import type { App } from 'vue'
import {
  create,
  darkTheme,
  NButton,
  NSwitch,
  NTooltip,
  NStatistic,
  NIcon,
  NCard,
  NGrid,
  NGridItem,
  NTag,
  NSpin,
  NSkeleton,
  NDivider,
  NTabs,
  NTabPane,
  NEmpty,
  NProgress,
  NSpace,
  NBadge,
  NDescriptions,
  NDescriptionsItem,
  NNumberAnimation
} from 'naive-ui'
import { createDiscreteApi } from 'naive-ui'

const naive = create({
  components: [
    NButton,
    NSwitch,
    NTooltip,
    NStatistic,
    NIcon,
    NCard,
    NGrid,
    NGridItem,
    NTag,
    NSpin,
    NSkeleton,
    NDivider,
    NTabs,
    NTabPane,
    NEmpty,
    NProgress,
    NSpace,
    NBadge,
    NDescriptions,
    NDescriptionsItem,
    NNumberAnimation
  ]
})

export const naiveDarkTheme = darkTheme

export const naiveThemeOverrides = {
  common: {
    bodyColor: '#0B1222',
    cardColor: 'rgba(21, 34, 60, 0.8)',
    modalColor: 'rgba(21, 34, 60, 0.9)',
    popoverColor: 'rgba(21, 34, 60, 0.9)',
    borderColor: 'rgba(78, 154, 254, 0.3)',
    primaryColor: '#4E9AFE',
    primaryColorHover: '#6BABFF',
    primaryColorPressed: '#387DE0',
    textColorBase: '#E6F0FF'
  }
}

export function setupNaive(app: App) {
  app.use(naive)
}

const { message, notification } = createDiscreteApi(['message', 'notification'], {
  configProviderProps: {
    theme: naiveDarkTheme,
    themeOverrides: naiveThemeOverrides
  }
})

export { message, notification }
