/**
 * 图表主题色盘与设计令牌
 * 提供统一的颜色方案和样式配置
 */

// ============= Okabe-Ito 类别色盘 =============
// 色盲友好的类别色盘，适用于分类数据可视化
export const okabeItoColors = [
  '#E69F00', // 橙色
  '#56B4E9', // 天蓝色
  '#009E73', // 青绿色
  '#F0E442', // 黄色
  '#0072B2', // 蓝色
  '#D55E00', // 朱红色
  '#CC79A7', // 粉红色
  '#999999'  // 灰色
]

// ============= Viridis 连续色带 =============
// 感知均匀的连续色带，适用于热力图和连续数据
export const viridisColors = [
  '#440154', // 深紫
  '#482878', // 紫蓝
  '#3e4989', // 蓝紫
  '#31688e', // 深蓝
  '#26828e', // 青蓝
  '#1f9e89', // 青绿
  '#35b779', // 绿色
  '#6ece58', // 黄绿
  '#b5de2b', // 黄色
  '#fde725'  // 亮黄
]

// ============= 大屏专用渐变色 =============
// 用于柱状图、面积图等的渐变填充
export const screenGradients = {
  // 主渐变：青色系（适用于主要图表）
  primary: ['#00ffff', '#005b96'],
  
  // 次渐变：蓝绿系（适用于次要图表）
  secondary: ['#00d9ff', '#0066cc'],
  
  // 强调渐变：橙黄系（适用于重点数据）
  accent: ['#ffd700', '#ff8c00'],
  
  // 成功渐变：绿色系
  success: ['#52c41a', '#1890ff'],
  
  // 警告渐变：黄色系
  warning: ['#faad14', '#fa8c16'],
  
  // 危险渐变：红色系
  danger: ['#ff4d4f', '#cf1322']
}

// ============= 设计令牌（Design Tokens）=============

/**
 * 网格配置
 */
export const gridTokens = {
  // 网格线颜色：白色，14%透明度
  lineColor: 'rgba(255, 255, 255, 0.14)',
  
  // 网格线类型
  lineType: 'dashed' as const,
  
  // 网格线宽度
  lineWidth: 1,
  
  // 默认边距
  defaultPadding: {
    left: 10,
    right: 10,
    top: 50,
    bottom: 25,
    containLabel: true
  }
}

/**
 * 坐标轴配置
 */
export const axisTokens = {
  // 轴线颜色
  lineColor: '#007799',
  
  // 轴标签颜色：白色，70%不透明度
  labelColor: 'rgba(255, 255, 255, 0.7)',
  
  // 轴标签字体大小
  labelFontSize: 11,
  
  // 轴名称字体大小
  nameFontSize: 12,
  
  // 轴名称颜色
  nameColor: 'rgba(255, 255, 255, 0.85)',
  
  // 刻度显示
  tickShow: false
}

/**
 * 标题配置
 */
export const titleTokens = {
  // 标题颜色：主题青色
  color: '#00ffff',
  
  // 标题字体大小
  fontSize: 15,
  
  // 标题字体粗细
  fontWeight: 'bold' as const,
  
  // 标题位置
  position: 'center' as const,
  
  // 副标题颜色
  subtextColor: 'rgba(255, 255, 255, 0.6)',
  
  // 副标题字体大小
  subtextFontSize: 12
}

/**
 * 提示框（Tooltip）配置
 */
export const tooltipTokens = {
  // 背景颜色
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  
  // 边框颜色
  borderColor: '#00ffff',
  
  // 边框宽度
  borderWidth: 1,
  
  // 文字颜色
  textColor: '#fff',
  
  // 字体大小
  fontSize: 12,
  
  // 内边距
  padding: [8, 12],
  
  // 触发类型
  trigger: 'axis' as const,
  
  // 轴指示器
  axisPointer: {
    type: 'shadow' as const,
    shadowStyle: {
      color: 'rgba(0, 255, 255, 0.1)'
    }
  }
}

/**
 * 图例（Legend）配置
 */
export const legendTokens = {
  // 文字颜色
  textColor: 'rgba(255, 255, 255, 0.85)',
  
  // 字体大小
  fontSize: 12,
  
  // 图标大小
  itemWidth: 14,
  itemHeight: 14,
  
  // 图标与文字间距
  itemGap: 10,
  
  // 位置
  position: 'top' as const,
  
  // 对齐方式
  align: 'center' as const
}

/**
 * 数值格式化配置
 */
export const numberFormatTokens = {
  // 千分位分隔符
  thousandsSeparator: ',',
  
  // 小数位数
  decimalPlaces: {
    default: 0,
    percent: 2,
    money: 2,
    rate: 2
  },
  
  // 金额单位
  moneyUnits: {
    yi: { threshold: 1e8, divisor: 1e8, suffix: '亿' },
    wan: { threshold: 1e4, divisor: 1e4, suffix: '万' }
  }
}

// ============= 工具函数 =============

/**
 * 格式化数字
 * @param value 数值
 * @param options 格式化选项
 */
export function formatNumber(
  value: number | string | null | undefined,
  options: {
    type?: 'default' | 'percent' | 'money' | 'rate'
    suffix?: string
    decimalPlaces?: number
  } = {}
): string {
  const { type = 'default', suffix = '', decimalPlaces } = options
  
  // 处理无效值
  if (value == null || value === '' || isNaN(Number(value))) {
    return '-'
  }
  
  let numValue = Number(value)
  let resultSuffix = suffix
  
  // 金额处理
  if (type === 'money') {
    if (numValue >= numberFormatTokens.moneyUnits.yi.threshold) {
      numValue = numValue / numberFormatTokens.moneyUnits.yi.divisor
      resultSuffix = numberFormatTokens.moneyUnits.yi.suffix + suffix
    } else if (numValue >= numberFormatTokens.moneyUnits.wan.threshold) {
      numValue = numValue / numberFormatTokens.moneyUnits.wan.divisor
      resultSuffix = numberFormatTokens.moneyUnits.wan.suffix + suffix
    }
  }
  
  // 确定小数位数
  const decimals = decimalPlaces ?? numberFormatTokens.decimalPlaces[type]
  
  // 格式化数字
  const formatted = numValue.toLocaleString('zh-CN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  })
  
  return formatted + resultSuffix
}

/**
 * 创建线性渐变对象（用于ECharts）
 * @param colors 渐变颜色数组
 * @param direction 渐变方向 'vertical' | 'horizontal'
 */
export function createLinearGradient(
  colors: string[],
  direction: 'vertical' | 'horizontal' = 'vertical'
): {
  type: 'linear'
  x: number
  y: number
  x2: number
  y2: number
  colorStops: Array<{ offset: number; color: string }>
} {
  const isVertical = direction === 'vertical'
  
  return {
    type: 'linear',
    x: 0,
    y: isVertical ? 0 : 1,
    x2: isVertical ? 0 : 1,
    y2: isVertical ? 1 : 0,
    colorStops: colors.map((color, index) => ({
      offset: index / (colors.length - 1),
      color
    }))
  }
}

/**
 * 获取类别颜色（循环使用Okabe-Ito色盘）
 * @param index 索引
 */
export function getCategoryColor(index: number): string {
  return okabeItoColors[index % okabeItoColors.length]
}

/**
 * 获取连续色带颜色
 * @param value 0-1之间的值
 */
export function getContinuousColor(value: number): string {
  const clampedValue = Math.max(0, Math.min(1, value))
  const index = Math.floor(clampedValue * (viridisColors.length - 1))
  return viridisColors[index]
}

// ============= 默认导出 =============
export default {
  okabeItoColors,
  viridisColors,
  screenGradients,
  gridTokens,
  axisTokens,
  titleTokens,
  tooltipTokens,
  legendTokens,
  numberFormatTokens,
  formatNumber,
  createLinearGradient,
  getCategoryColor,
  getContinuousColor
}
