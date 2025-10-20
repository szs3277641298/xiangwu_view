import type { App } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  DatasetComponent
} from 'echarts/components'
import {
  BarChart,
  PieChart,
  LineChart,
  GaugeChart,
  RadarChart,
  TreemapChart
} from 'echarts/charts'
import VueECharts from 'vue-echarts'

use([
  CanvasRenderer,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  DatasetComponent,
  BarChart,
  PieChart,
  LineChart,
  GaugeChart,
  RadarChart,
  TreemapChart
])

export function setupEcharts(app: App) {
  app.component('VChart', VueECharts)
}
