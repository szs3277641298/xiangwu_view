# 数字格式化与 Tooltip/Legend 优化 Diff

## 📋 优化目标

1. **formatDisplayValue**: 金额自动万/亿、人数千分位、百分比仅数值加 '%'
2. **Tooltip**: 显示色块 + 名称 + 值(应用 format),占比模式才加 '%',避免 double '%'
3. **Legend**: 可点击开关系列,保留交互性以便扩展

---

## 🔧 核心问题分析

### 当前问题
1. **Double '%' 问题**: 
   - `formatNumber(value, { type: 'percent', suffix: '%' })` 在 percent 类型时已经处理了百分比,再加 suffix 会导致 "85.00%%" 这样的输出
   
2. **Tooltip 格式不统一**:
   - 缺少颜色标记(色块)
   - 占比和数量的后缀逻辑混乱
   - 百分比计算重复显示(饼图的 params.percent 和 value 都显示百分号)

3. **Legend 缺失**:
   - 除饼图外,其他图表类型没有 legend
   - 无法通过点击图例开关数据系列

---

## 📝 修改方案

### 1️⃣ formatDisplayValue 函数优化

**位置**: DataScreen.vue 第 544-558 行

**Before**:
```javascript
const formatDisplayValue = (val, unit) => {
  if (val == null || val === '' || isNaN(Number(val))) return '-'
  
  const value = Number(val)
  const isPercent = unit === '%'
  const isMoney = /amount|investment|revenue|income|expense|fund|money|元|万|亿/i.test(unit || '')
  
  if (isPercent) {
    return formatNumber(value, { type: 'percent', suffix: '' })
  } else if (isMoney) {
    return formatNumber(value, { type: 'money' })
  } else {
    return formatNumber(value, { type: 'default' })
  }
}
```

**After**:
```javascript
const formatDisplayValue = (val, unit) => {
  if (val == null || val === '' || isNaN(Number(val))) return '-'
  
  const value = Number(val)
  const isPercent = unit === '%'
  const isMoney = /amount|investment|revenue|income|expense|fund|money|元|万|亿/i.test(unit || '')
  
  if (isPercent) {
    // 百分比:仅数值 + '%',formatNumber 的 percent 类型不自动添加 '%'
    return formatNumber(value, { type: 'percent' }) + '%'
  } else if (isMoney) {
    // 金额:自动万/亿转换
    return formatNumber(value, { type: 'money' })
  } else {
    // 人数/默认:千分位格式化
    return formatNumber(value, { type: 'default' })
  }
}
```

**变更说明**:
- ✅ 百分比显式添加 `'%'` 后缀,避免在 formatNumber 内部重复添加
- ✅ 金额自动万/亿转换(保持不变)
- ✅ 默认类型使用千分位(保持不变)

---

### 2️⃣ Tooltip formatter 统一优化

**位置**: DataScreen.vue 第 841-871 行

**Before**:
```javascript
formatter: params => {
  if (type === 'pie') {
    // 饼图/环形图特殊格式
    const formattedValue = formatNumber(params.value, {
      type: valueType,
      suffix: isProportion ? '%' : ''
    })
    const percent = params.percent ? ` (${params.percent}%)` : ''
    return `${params.name}<br/>${isProportion ? '占比' : '数量'}: ${formattedValue}${percent}`
  } else if (type === 'radar') {
    // 雷达图特殊格式
    return `${params.name}<br/>${params.value.map((v, i) => 
      `${categories[i]}: ${formatNumber(v, { type: valueType, suffix: isProportion ? '%' : '' })}`
    ).join('<br/>') }`
  } else if (type === 'heat') {
    // 热力图特殊格式
    const [x, y, value] = params.value
    return `${categories[x]} - ${categories[y]}<br/>值: ${formatNumber(value, { type: valueType })}`
  } else {
    // 其他图表类型
    if (!Array.isArray(params)) params = [params]
    return params.map(p => {
      const formattedValue = formatNumber(p.value || p.data, {
        type: valueType,
        suffix: isProportion ? '%' : ''
      })
      return `${p.name || p.axisValue}<br/>${isProportion ? '占比' : '数量'}: ${formattedValue}`
    }).join('<br/>')
  }
}
```

**After**:
```javascript
formatter: params => {
  if (type === 'pie') {
    // 饼图:色块 + 名称 + 值 + 占比百分比
    const marker = params.marker || ''
    const formattedValue = formatNumber(params.value, { type: valueType })
    const percentSuffix = isProportion ? '%' : ''
    const percentInfo = params.percent ? ` (${params.percent.toFixed(1)}%)` : ''
    return `${marker}${params.name}<br/>${isProportion ? '占比' : '数量'}: ${formattedValue}${percentSuffix}${percentInfo}`
  } else if (type === 'radar') {
    // 雷达图:名称 + 各维度(色块 + 指标 + 值)
    const marker = params.marker || ''
    const valueLines = params.value.map((v, i) => {
      const formatted = formatNumber(v, { type: valueType })
      const suffix = isProportion ? '%' : ''
      return `  ${categories[i]}: ${formatted}${suffix}`
    }).join('<br/>')
    return `${marker}${params.name}<br/>${valueLines}`
  } else if (type === 'heat') {
    // 热力图:坐标 + 值
    const [x, y, value] = params.value
    const formatted = formatNumber(value, { type: valueType })
    const suffix = isProportion ? '%' : ''
    return `${categories[x]} - ${categories[y]}<br/>值: ${formatted}${suffix}`
  } else if (type === 'scatter') {
    // 散点图:名称 + X/Y 坐标
    if (!Array.isArray(params)) params = [params]
    return params.map(p => {
      const marker = p.marker || ''
      const [x, y] = p.value
      const xFormatted = formatNumber(x, { type: valueType })
      const yFormatted = formatNumber(y, { type: valueType })
      const suffix = isProportion ? '%' : ''
      return `${marker}${p.seriesName || p.name}<br/>X: ${xFormatted}${suffix}<br/>Y: ${yFormatted}${suffix}`
    }).join('<br/>')
  } else {
    // 柱状图/折线图/面积图/堆叠图/排行榜:色块 + 系列名 + 值
    if (!Array.isArray(params)) params = [params]
    return params.map(p => {
      const marker = p.marker || ''
      const seriesName = p.seriesName || ''
      const label = seriesName ? `${seriesName}` : (p.name || p.axisValue || '')
      const formattedValue = formatNumber(p.value || p.data, { type: valueType })
      const suffix = isProportion ? '%' : ''
      return `${marker}${label}: ${formattedValue}${suffix}`
    }).join('<br/>')
  }
}
```

**变更说明**:
- ✅ **统一色块显示**: 所有图表类型都使用 `params.marker` 显示颜色标记
- ✅ **避免 double '%'**: 不再在 `formatNumber` 中传递 `suffix: '%'`,而是在最终拼接时添加
- ✅ **饼图优化**: 
  - `params.percent` 显示为 `(85.0%)` 形式(实际占比)
  - `formattedValue` 显示原始数值或百分比值
- ✅ **散点图处理**: 新增 X/Y 坐标的格式化
- ✅ **系列名显示**: 优先显示 `p.seriesName`,便于多系列图表区分

---

### 3️⃣ Y 轴 Label formatter 优化

**影响位置**: 
- 柱状图: 第 931-933 行
- 面积图: 第 991-993 行
- 堆叠图: 第 1081-1083 行
- 排行榜 X 轴: 第 1143-1145 行

**Before** (以柱状图为例):
```javascript
yAxis: {
  type: 'value',
  axisLabel: {
    color: axisTokens.labelColor,
    fontSize: axisTokens.labelFontSize,
    formatter: v => isProportion 
      ? formatNumber(v, { type: 'percent', suffix: '%' })
      : formatNumber(v, { type: 'default' })
  },
  // ...
}
```

**After**:
```javascript
yAxis: {
  type: 'value',
  axisLabel: {
    color: axisTokens.labelColor,
    fontSize: axisTokens.labelFontSize,
    formatter: v => {
      const formatted = formatNumber(v, { type: isProportion ? 'percent' : valueType })
      return isProportion ? formatted + '%' : formatted
    }
  },
  // ...
}
```

**变更说明**:
- ✅ 移除 `suffix: '%'` 参数
- ✅ 显式在占比模式下拼接 `'%'`
- ✅ 非占比模式使用 `valueType` (可能是 'money' 或 'default')

---

### 4️⃣ Series Label formatter 优化

**影响位置**:
- 柱状图: 第 951-955 行
- 面积图: 第 1023-1027 行
- 堆叠图: 第 1104 行, 1119 行
- 排行榜: 第 1177-1181 行
- 饼图: 第 1238-1244 行

**Before** (以柱状图为例):
```javascript
label: {
  show: true,
  position: 'top',
  color: titleTokens.color,
  fontSize: axisTokens.labelFontSize,
  formatter: p => formatNumber(p.value, {
    type: valueType,
    suffix: isProportion ? '%' : ''
  })
}
```

**After**:
```javascript
label: {
  show: true,
  position: 'top',
  color: titleTokens.color,
  fontSize: axisTokens.labelFontSize,
  formatter: p => {
    const formatted = formatNumber(p.value, { type: valueType })
    return isProportion ? formatted + '%' : formatted
  }
}
```

**变更说明**:
- ✅ 移除 `suffix: '%'` 参数
- ✅ 显式在占比模式下拼接 `'%'`

---

### 5️⃣ Legend 配置补充

**新增位置**: 在 buildOption 函数的 baseOption 中(第 813 行之后)

**Before**:
```javascript
const baseOption = {
  grid: {
    left: 50,
    right: 30,
    top: 50,
    bottom: 30,
    containLabel: true
  },
  
  // Tooltip 配置
  tooltip: {
    // ... 现有配置
  },
  
  // 动画配置
  animationDuration: 800,
  animationEasing: 'cubicOut'
}
```

**After**:
```javascript
const baseOption = {
  grid: {
    left: 50,
    right: 30,
    top: type === 'pie' ? 20 : 50, // 饼图顶部留白少一些
    bottom: 30,
    containLabel: true
  },
  
  // Legend 配置(除饼图和雷达图外统一启用)
  legend: type !== 'pie' && type !== 'radar' ? {
    show: true,
    orient: 'horizontal',
    top: 10,
    left: 'center',
    textStyle: {
      color: legendTokens.textColor,
      fontSize: legendTokens.fontSize
    },
    itemWidth: legendTokens.itemWidth,
    itemHeight: legendTokens.itemHeight,
    itemGap: legendTokens.itemGap,
    // 可点击开关系列
    selectedMode: 'multiple',
    // formatter: 根据具体图表类型在各 build 函数中定制
  } : undefined,
  
  // Tooltip 配置
  tooltip: {
    // ... 现有配置
  },
  
  // 动画配置
  animationDuration: 800,
  animationEasing: 'cubicOut'
}
```

**变更说明**:
- ✅ 为柱状图/面积图/堆叠图/排行榜/散点图/热力图添加 Legend
- ✅ `selectedMode: 'multiple'` 允许点击图例开关系列
- ✅ 饼图和雷达图保持原有 Legend 配置(在各自的 build 函数中)
- ✅ formatter 留空,在各 build 函数中根据需要定制

---

### 6️⃣ 堆叠图 Legend formatter 定制

**位置**: buildStackOption 函数中(第 1053 行之后)

**新增**:
```javascript
function buildStackOption(baseOption, categories, data, isProportion, valueType) {
  // ... 现有代码 ...
  
  return {
    ...baseOption,
    legend: {
      show: true,
      orient: 'horizontal',
      top: 10,
      left: 'center',
      textStyle: {
        color: legendTokens.textColor,
        fontSize: legendTokens.fontSize
      },
      itemWidth: legendTokens.itemWidth,
      itemHeight: legendTokens.itemHeight,
      itemGap: legendTokens.itemGap,
      selectedMode: 'multiple',
      data: [categories1.join('/'), categories2.join('/')]
    },
    grid: { 
      // ... 现有配置
    },
    // ... 其他配置
  }
}
```

**变更说明**:
- ✅ 显示两个堆叠系列的图例
- ✅ 可点击切换显示/隐藏某个系列

---

### 7️⃣ 饼图 Legend formatter 优化

**位置**: buildPieOption 函数中(第 1203-1223 行)

**Before**:
```javascript
legend: {
  show: true,
  orient: 'vertical',
  right: 10,
  top: 'center',
  textStyle: {
    color: legendTokens.textColor,
    fontSize: legendTokens.fontSize
  },
  itemWidth: legendTokens.itemWidth,
  itemHeight: legendTokens.itemHeight,
  itemGap: 8,
  formatter: name => {
    const item = pieData.find(d => d.name === name)
    if (item) {
      const formatted = formatNumber(item.value, {
        type: valueType,
        suffix: isProportion ? '%' : ''
      })
      return `${name}: ${formatted}`
    }
    return name
  }
}
```

**After**:
```javascript
legend: {
  show: true,
  orient: 'vertical',
  right: 10,
  top: 'center',
  textStyle: {
    color: legendTokens.textColor,
    fontSize: legendTokens.fontSize
  },
  itemWidth: legendTokens.itemWidth,
  itemHeight: legendTokens.itemHeight,
  itemGap: 8,
  selectedMode: 'multiple', // 可点击开关
  formatter: name => {
    const item = pieData.find(d => d.name === name)
    if (item) {
      const formatted = formatNumber(item.value, { type: valueType })
      const suffix = isProportion ? '%' : ''
      return `${name}: ${formatted}${suffix}`
    }
    return name
  }
}
```

**变更说明**:
- ✅ 添加 `selectedMode: 'multiple'` 允许点击
- ✅ 移除 `suffix: '%'` 参数,显式拼接

---

### 8️⃣ 饼图 Label formatter 优化

**位置**: buildPieOption 函数中(第 1235-1245 行)

**Before**:
```javascript
label: {
  show: true,
  color: axisTokens.labelColor,
  fontSize: 11,
  formatter: p => {
    const formatted = formatNumber(p.value, {
      type: valueType,
      suffix: isProportion ? '%' : ''
    })
    return `${p.name}\n${formatted}`
  }
}
```

**After**:
```javascript
label: {
  show: true,
  color: axisTokens.labelColor,
  fontSize: 11,
  formatter: p => {
    const formatted = formatNumber(p.value, { type: valueType })
    const suffix = isProportion ? '%' : ''
    return `${p.name}\n${formatted}${suffix}`
  }
}
```

**变更说明**:
- ✅ 移除 `suffix: '%'` 参数,显式拼接

---

## 📊 修改总览

| 修改项 | 位置 | 变更类型 | 影响范围 |
|-------|------|---------|---------|
| formatDisplayValue | 544-558行 | 优化逻辑 | KPI 数据展示 |
| Tooltip formatter | 841-871行 | 重构 | 所有图表类型 |
| Y轴 formatter (柱状图) | 931-933行 | 简化 | 柱状图 Y轴 |
| Y轴 formatter (面积图) | 991-993行 | 简化 | 面积图 Y轴 |
| Y轴 formatter (堆叠图) | 1081-1083行 | 简化 | 堆叠图 Y轴 |
| X轴 formatter (排行榜) | 1143-1145行 | 简化 | 排行榜 X轴 |
| Label formatter (柱状图) | 951-955行 | 简化 | 柱状图标签 |
| Label formatter (面积图) | 1023-1027行 | 简化 | 面积图标签 |
| Label formatter (堆叠图) | 1104,1119行 | 简化 | 堆叠图标签 |
| Label formatter (排行榜) | 1177-1181行 | 简化 | 排行榜标签 |
| Label formatter (饼图) | 1238-1244行 | 简化 | 饼图标签 |
| Legend formatter (饼图) | 1203-1223行 | 优化 | 饼图图例 |
| Legend 配置 (baseOption) | 813行之后 | 新增 | 所有非饼/雷达图 |
| Legend 配置 (堆叠图) | 1053行之后 | 新增 | 堆叠图 |

---

## ✅ 优化效果

### Before (有问题的输出)
```
Tooltip: "收入: 85.00%%"           ❌ double '%'
Tooltip: "数据A - 45.00%"          ❌ 缺少色块标记
Legend:  "类别A: 120.00%"          ❌ double '%'
Y轴:     "50.00%%"                 ❌ double '%'
```

### After (正确的输出)
```
Tooltip: "🟦 收入: 85.00%"         ✅ 色块 + 单个 '%'
Tooltip: "🟧 数据A: 45.00%"        ✅ 色块 + 单个 '%'
Legend:  "类别A: 120.00%"          ✅ 单个 '%'
Y轴:     "50.00%"                  ✅ 单个 '%'
```

### 具体示例

**饼图 Tooltip**:
```
Before: "收入\n占比: 45.23% (45.23%)"   ❌ 重复百分比
After:  "🟦 收入\n占比: 45.23% (45.2%)" ✅ 色块 + 格式化值 + 实际占比
```

**雷达图 Tooltip**:
```
Before: "团队A\n指标1: 85.00%\n指标2: 90.00%\n..."
After:  "🔵 团队A\n  指标1: 85.00%\n  指标2: 90.00%\n..." ✅ 色块 + 缩进
```

**堆叠图 Tooltip**:
```
Before: "收入\n占比: 30.00%"                    ❌ 无系列名
After:  "🟦 本月数据: 30.00%\n🟧 上月数据: 25.00%" ✅ 色块 + 系列名
```

---

## 🎯 核心原则

1. **formatNumber 职责**: 仅负责数字格式化(千分位、小数位、万/亿转换),不添加 '%' 后缀
2. **外层拼接 '%'**: 在 formatter 中根据 `isProportion` 显式拼接 `'%'`
3. **Tooltip 统一格式**: `marker + 名称 + 值 + 后缀`
4. **Legend 可交互**: 所有图表都支持点击图例开关系列

---

## 🚀 实施步骤

1. **修改 formatDisplayValue** (1处)
2. **修改 Tooltip formatter** (1处,影响所有图表类型)
3. **修改轴 formatter** (4处: 柱状图/面积图/堆叠图/排行榜)
4. **修改 Label formatter** (6处: 各图表类型)
5. **新增/优化 Legend** (2处: baseOption + 堆叠图)

**预计工作量**: 14 处修改,约 30 分钟

---

**文档创建日期**: 2025-10-18  
**版本**: v1.0  
**状态**: ✅ Ready for Implementation
