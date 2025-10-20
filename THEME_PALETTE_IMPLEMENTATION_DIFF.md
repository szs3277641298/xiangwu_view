# 主题与色盘系统实现差异对比

## 新增文件：`src/theme/palette.ts`

完整的主题色盘系统，包含：

### 1. Okabe-Ito 类别色盘（色盲友好）
```typescript
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
```

### 2. Viridis 连续色带（感知均匀）
```typescript
export const viridisColors = [
  '#440154', '#482878', '#3e4989', '#31688e', '#26828e',
  '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725'
]
```

### 3. 大屏专用渐变色
```typescript
export const screenGradients = {
  primary: ['#00ffff', '#005b96'],      // 主渐变：青色系
  secondary: ['#00d9ff', '#0066cc'],    // 次渐变：蓝绿系
  accent: ['#ffd700', '#ff8c00'],       // 强调渐变：橙黄系
  success: ['#52c41a', '#1890ff'],      // 成功渐变：绿色系
  warning: ['#faad14', '#fa8c16'],      // 警告渐变：黄色系
  danger: ['#ff4d4f', '#cf1322']        // 危险渐变：红色系
}
```

### 4. 设计令牌（Design Tokens）

#### 网格配置
```typescript
export const gridTokens = {
  lineColor: 'rgba(255, 255, 255, 0.14)',  // 网格线颜色
  lineType: 'dashed' as const,              // 网格线类型
  lineWidth: 1,                             // 网格线宽度
  defaultPadding: {
    left: 10, right: 10, top: 50, bottom: 25,
    containLabel: true
  }
}
```

#### 坐标轴配置
```typescript
export const axisTokens = {
  lineColor: '#007799',                      // 轴线颜色
  labelColor: 'rgba(255, 255, 255, 0.7)',   // 轴标签颜色（70%不透明度）
  labelFontSize: 11,                         // 轴标签字体大小
  nameFontSize: 12,                          // 轴名称字体大小
  nameColor: 'rgba(255, 255, 255, 0.85)',   // 轴名称颜色
  tickShow: false                            // 刻度显示
}
```

#### 标题配置
```typescript
export const titleTokens = {
  color: '#00ffff',                   // 标题颜色
  fontSize: 15,                       // 标题字体大小
  fontWeight: 'bold' as const,        // 标题字体粗细
  position: 'center' as const,        // 标题位置
  subtextColor: 'rgba(255, 255, 255, 0.6)',  // 副标题颜色
  subtextFontSize: 12                 // 副标题字体大小
}
```

#### Tooltip配置
```typescript
export const tooltipTokens = {
  backgroundColor: 'rgba(0, 0, 0, 0.7)',  // 背景颜色
  borderColor: '#00ffff',                  // 边框颜色
  borderWidth: 1,                          // 边框宽度
  textColor: '#fff',                       // 文字颜色
  fontSize: 12,                            // 字体大小
  padding: [8, 12],                        // 内边距
  trigger: 'axis' as const,                // 触发类型
  axisPointer: {
    type: 'shadow' as const,
    shadowStyle: {
      color: 'rgba(0, 255, 255, 0.1)'
    }
  }
}
```

#### Legend配置
```typescript
export const legendTokens = {
  textColor: 'rgba(255, 255, 255, 0.85)',  // 文字颜色
  fontSize: 12,                             // 字体大小
  itemWidth: 14,                            // 图标宽度
  itemHeight: 14,                           // 图标高度
  itemGap: 10,                              // 图标与文字间距
  position: 'top' as const,                 // 位置
  align: 'center' as const                  // 对齐方式
}
```

### 5. 工具函数

#### formatNumber - 统一数字格式化
```typescript
export function formatNumber(
  value: number | string | null | undefined,
  options: {
    type?: 'default' | 'percent' | 'money' | 'rate'
    suffix?: string
    decimalPlaces?: number
  } = {}
): string
```

**功能特性：**
- ✅ 自动处理无效值（null、undefined、空字符串）
- ✅ 金额自动转换（亿、万单位）
- ✅ 百分比格式化（保留2位小数）
- ✅ 千分位分隔符
- ✅ 自定义小数位数

#### createLinearGradient - 创建渐变对象
```typescript
export function createLinearGradient(
  colors: string[],
  direction: 'vertical' | 'horizontal' = 'vertical'
): GradientObject
```

**功能特性：**
- ✅ 支持垂直/水平渐变
- ✅ 自动计算color stops
- ✅ 返回ECharts兼容的渐变对象

#### getCategoryColor - 获取类别颜色
```typescript
export function getCategoryColor(index: number): string
```

#### getContinuousColor - 获取连续色带颜色
```typescript
export function getContinuousColor(value: number): string
```

---

## DataScreen.vue 改动差异

### 1. 导入主题模块

```diff
  import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
  import { ArrowLeft, DataBoard, Clock, ArrowRight } from '@element-plus/icons-vue'
  import * as echarts from 'echarts'
  import { bigScreenAPI } from '@/api/api'
  import { useRouter } from 'vue-router'
  import { useTabAutoplay } from '@/hooks/useTabAutoplay'
+ import {
+   screenGradients,
+   gridTokens,
+   axisTokens,
+   titleTokens,
+   tooltipTokens,
+   legendTokens,
+   formatNumber,
+   createLinearGradient
+ } from '@/theme/palette'
```

### 2. 更新formatDisplayValue函数（使用统一格式化）

```diff
  // 数值格式化函数（用于 KPI 与 tooltip）
  const formatDisplayValue = (val, unit) => {
    if (val == null || val === '' || isNaN(Number(val))) return '-'
-   let value = Number(val)
+   
+   const value = Number(val)
    const isPercent = unit === '%'
-   // 金额判断：字段名或单位包含金额相关关键词（可扩展）
-   const isMoney = /amount|investment|revenue|income|expense|fund|money/i.test(unit || '')
-   let suffix = ''
-   if (isMoney) {
-     if (value >= 1e8) { value = value / 1e8; suffix = '亿' }
-     else if (value >= 1e4) { value = value / 1e4; suffix = '万' }
-   }
-   const formatted = value.toLocaleString('zh-CN', { maximumFractionDigits: isPercent || isMoney ? 2 : 0 })
-   return formatted + suffix
+   const isMoney = /amount|investment|revenue|income|expense|fund|money|元|万|亿/i.test(unit || '')
+   
+   if (isPercent) {
+     return formatNumber(value, { type: 'percent', suffix: '' })
+   } else if (isMoney) {
+     return formatNumber(value, { type: 'money' })
+   } else {
+     return formatNumber(value, { type: 'default' })
+   }
  }
```

### 3. 重构buildOption函数（使用主题令牌）

#### 之前的代码（硬编码）
```javascript
const buildOption = ({ title, categories, data, isProportion }) => {
  const gradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: '#00ffff' },
    { offset: 1, color: '#005b96' }
  ])
  return {
    title: { 
      text: title, 
      left: 'center', 
      textStyle: { color: '#00ffff', fontSize: 15, fontWeight: 'bold' } 
    },
    tooltip: { 
      trigger: 'axis', 
      backgroundColor: 'rgba(0,0,0,0.7)', 
      borderColor: '#00ffff', 
      textStyle: { color: '#fff' }, 
      formatter: params => {
        if (!Array.isArray(params)) params = [params]
        return params.map(p => 
          `${p.axisValue}<br/>${isProportion ? '占比' : '数量'}: ${formatDisplayValue(p.data, isProportion ? '%' : '')}${isProportion ? '%' : ''}`
        ).join('<br/>')
      } 
    },
    grid: { left: 10, right: 10, top: 50, bottom: 25, containLabel: true },
    xAxis: { 
      type: 'category', 
      data: categories, 
      axisLabel: { color: '#cceeff', fontSize: 11, rotate: categories.length > 6 ? 30 : 0 }, 
      axisTick: { show: false }, 
      axisLine: { lineStyle: { color: '#007799' } } 
    },
    yAxis: { 
      type: 'value', 
      axisLabel: { 
        color: '#cceeff', 
        fontSize: 11, 
        formatter: v => isProportion ? v + '%' : v 
      }, 
      splitLine: { 
        lineStyle: { color: 'rgba(0,255,255,0.15)', type: 'dashed' } 
      }, 
      axisLine: { lineStyle: { color: '#007799' } } 
    },
    animationDuration: 800,
    series: [{
      type: 'bar', 
      data,
      itemStyle: { color: gradient, borderRadius: [4,4,0,0] },
      barMaxWidth: 42,
      label: { 
        show: true, 
        position: 'top', 
        color: '#00ffff', 
        fontSize: 11, 
        formatter: p => isProportion ? p.value + '%' : p.value 
      },
      emphasis: { 
        itemStyle: { shadowBlur: 15, shadowColor: 'rgba(0,255,255,0.6)' } 
      }
    }]
  }
}
```

#### 重构后的代码（使用主题令牌）
```javascript
const buildOption = ({ title, categories, data, isProportion }) => {
  // 创建渐变色（保持原有柱状图渐变效果）
  const gradient = createLinearGradient(screenGradients.primary, 'vertical')
  
  // 确定数值类型
  const valueType = isProportion ? 'percent' : 'default'
  
  return {
    // 标题配置
    title: {
      text: title,
      left: titleTokens.position,
      textStyle: {
        color: titleTokens.color,
        fontSize: titleTokens.fontSize,
        fontWeight: titleTokens.fontWeight
      }
    },
    
    // Tooltip配置（统一样式）
    tooltip: {
      trigger: tooltipTokens.trigger,
      backgroundColor: tooltipTokens.backgroundColor,
      borderColor: tooltipTokens.borderColor,
      borderWidth: tooltipTokens.borderWidth,
      textStyle: {
        color: tooltipTokens.textColor,
        fontSize: tooltipTokens.fontSize
      },
      padding: tooltipTokens.padding,
      axisPointer: tooltipTokens.axisPointer,
      formatter: params => {
        if (!Array.isArray(params)) params = [params]
        return params.map(p => {
          const formattedValue = formatNumber(p.data, {
            type: valueType,
            suffix: isProportion ? '%' : ''
          })
          return `${p.axisValue}<br/>${isProportion ? '占比' : '数量'}: ${formattedValue}`
        }).join('<br/>')
      }
    },
    
    // 图例配置（统一样式）
    legend: {
      show: false, // 当前图表不需要图例，但保留配置供将来使用
      textStyle: {
        color: legendTokens.textColor,
        fontSize: legendTokens.fontSize
      },
      itemWidth: legendTokens.itemWidth,
      itemHeight: legendTokens.itemHeight,
      itemGap: legendTokens.itemGap
    },
    
    // 网格配置
    grid: {
      ...gridTokens.defaultPadding
    },
    
    // X轴配置
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        color: axisTokens.labelColor,
        fontSize: axisTokens.labelFontSize,
        rotate: categories.length > 6 ? 30 : 0
      },
      axisTick: {
        show: axisTokens.tickShow
      },
      axisLine: {
        lineStyle: {
          color: axisTokens.lineColor
        }
      }
    },
    
    // Y轴配置
    yAxis: {
      type: 'value',
      axisLabel: {
        color: axisTokens.labelColor,
        fontSize: axisTokens.labelFontSize,
        formatter: v => {
          return isProportion 
            ? formatNumber(v, { type: 'percent', suffix: '%' })
            : formatNumber(v, { type: 'default' })
        }
      },
      splitLine: {
        lineStyle: {
          color: gridTokens.lineColor,
          type: gridTokens.lineType
        }
      },
      axisLine: {
        lineStyle: {
          color: axisTokens.lineColor
        }
      }
    },
    
    // 动画配置
    animationDuration: 800,
    animationEasing: 'cubicOut',
    
    // 系列配置
    series: [{
      type: 'bar',
      data,
      itemStyle: {
        color: gradient, // 使用渐变色
        borderRadius: [4, 4, 0, 0]
      },
      barMaxWidth: 42,
      label: {
        show: true,
        position: 'top',
        color: titleTokens.color,
        fontSize: axisTokens.labelFontSize,
        formatter: p => {
          return formatNumber(p.value, {
            type: valueType,
            suffix: isProportion ? '%' : ''
          })
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowColor: 'rgba(0, 255, 255, 0.6)'
        }
      }
    }]
  }
}
```

---

## 主要改进点对比

### 颜色配置

| 配置项 | 之前（硬编码） | 现在（使用令牌） | 改进说明 |
|--------|--------------|----------------|----------|
| 轴文字颜色 | `#cceeff` | `rgba(255,255,255,0.7)` | 更标准的70%不透明度白色 |
| 网格线颜色 | `rgba(0,255,255,0.15)` | `rgba(255,255,255,0.14)` | 改为白色14%透明度，更符合设计规范 |
| 标题颜色 | `#00ffff` | `titleTokens.color` (#00ffff) | 使用令牌统一管理 |
| 轴线颜色 | `#007799` | `axisTokens.lineColor` (#007799) | 使用令牌统一管理 |

### Tooltip改进

| 配置项 | 之前 | 现在 | 改进说明 |
|--------|------|------|----------|
| 背景色 | `rgba(0,0,0,0.7)` | `tooltipTokens.backgroundColor` | 统一管理 |
| 边框 | 只有颜色 | 颜色+宽度 | 更完整的配置 |
| 内边距 | 默认 | `[8, 12]` | 明确定义 |
| 轴指示器 | 无 | shadow类型 | 更好的视觉反馈 |
| 数值格式化 | 简单拼接 | `formatNumber`函数 | 统一的格式化逻辑 |

### Legend配置

- ✅ 新增完整的图例配置（虽然当前不显示，但为将来扩展做好准备）
- ✅ 统一的文字颜色、字体大小
- ✅ 定义图标尺寸和间距

### 渐变色创建

| 方式 | 之前 | 现在 |
|------|------|------|
| 创建方式 | `new echarts.graphic.LinearGradient` | `createLinearGradient` 函数 |
| 可复用性 | 低（每次都要重新创建） | 高（工具函数） |
| 维护性 | 差（硬编码颜色） | 好（使用色盘配置） |

### 数字格式化

| 功能 | 之前 | 现在 |
|------|------|------|
| 千分位 | ✅ 支持 | ✅ 支持 |
| 金额转换 | ✅ 亿、万 | ✅ 亿、万 |
| 百分比 | ⚠️ 简单处理 | ✅ 专门类型 |
| 小数位 | 固定逻辑 | ✅ 可配置 |
| 统一性 | ❌ 多处重复 | ✅ 单一函数 |

---

## 优势总结

### 1. 可维护性提升
- ✅ 所有颜色、尺寸集中管理
- ✅ 修改主题只需更新palette.ts
- ✅ 减少硬编码，降低出错概率

### 2. 可扩展性增强
- ✅ 支持多套色盘（Okabe-Ito、Viridis）
- ✅ 可快速添加新的渐变方案
- ✅ 工具函数可在其他组件复用

### 3. 代码质量改进
- ✅ TypeScript类型支持
- ✅ 清晰的语义化命名
- ✅ 完整的注释文档

### 4. 视觉一致性
- ✅ 统一的Tooltip样式
- ✅ 统一的Legend样式
- ✅ 统一的数字格式化规则
- ✅ 标准化的透明度值

### 5. 无障碍支持
- ✅ Okabe-Ito色盘对色盲友好
- ✅ 合适的对比度（70%不透明度）
- ✅ 清晰的视觉层次