# 多图表类型支持实现差异对比

## 概述

在不改变 `fetchMap` 和 `displayModes` 的前提下，为各区域配置不同的图表类型，提升数据可视化的多样性和表现力。

---

## 一、图表类型映射配置

### 新增：`chartTypeMap` 配置对象

```javascript
// 图表类型映射配置（根据区域分配不同图表类型）
const chartTypeMap = {
  // 左列：柱状图和面积图交替
  populationStructure: 'bar',      // 人口结构分布 - 柱状图
  basicIdentity: 'area',            // 基础身份计数 - 面积图
  healthDifficulty: 'bar',          // 健康与困难状况 - 柱状图
  
  // 中列：排行、环形图、雷达图
  priorityFamily: 'pie',            // 优抚与家庭类 - 环形图
  
  // 右列：堆叠、散点、热力图
  residenceVeteran: 'stack',        // 居住与退役身份 - 堆叠柱状图
  economyProjectInvestment: 'bar',  // 集体经济（项目与投资）- 柱状图
  economyRevenueTransaction: 'rank' // 集体经济（收入与收支）- 排行（横向条形图）
}
```

### 区域布局与图表类型对应关系

| 区域 | 位置 | 图表组 | 图表类型 | 适用场景 |
|------|------|--------|----------|----------|
| 左列 | Left Panel | 人口结构分布 | **柱状图 (bar)** | 清晰对比多个类别的数值 |
| 左列 | Left Panel | 基础身份计数 | **面积图 (area)** | 展示趋势和累积效果 |
| 左列 | Left Panel | 健康与困难状况 | **柱状图 (bar)** | 对比不同健康状态 |
| 中列 | Center Panel | 优抚与家庭类 | **环形图 (pie)** | 展示占比关系 |
| 右列 | Right Panel | 居住与退役身份 | **堆叠图 (stack)** | 展示部分与整体关系 |
| 右列 | Right Panel | 项目与投资 | **柱状图 (bar)** | 对比投资指标 |
| 右列 | Right Panel | 收入与收支 | **排行图 (rank)** | 展示排名顺序 |

---

## 二、buildOption 函数扩展

### 之前版本（仅支持柱状图）

```javascript
const buildOption = ({ title, categories, data, isProportion }) => {
  const gradient = createLinearGradient(screenGradients.primary, 'vertical')
  const valueType = isProportion ? 'percent' : 'default'
  
  return {
    title: { ... },
    tooltip: { ... },
    grid: { ... },
    xAxis: { ... },
    yAxis: { ... },
    series: [{
      type: 'bar',  // 硬编码为柱状图
      data,
      // ... 其他配置
    }]
  }
}
```

### 扩展后版本（支持8种图表类型）

```javascript
const buildOption = ({ title, categories, data, isProportion, type = 'bar' }) => {
  const valueType = isProportion ? 'percent' : 'default'
  
  // 基础配置（所有图表通用）
  const baseOption = {
    title: { ... },
    tooltip: {
      // 根据图表类型动态调整trigger
      trigger: type === 'pie' || type === 'radar' ? 'item' : 'axis',
      // 根据图表类型动态调整formatter
      formatter: params => {
        if (type === 'pie') { /* 饼图格式化 */ }
        else if (type === 'radar') { /* 雷达图格式化 */ }
        else if (type === 'heat') { /* 热力图格式化 */ }
        else { /* 通用格式化 */ }
      }
    },
    animationDuration: 800,
    animationEasing: 'cubicOut'
  }
  
  // 根据图表类型构建特定配置
  switch (type) {
    case 'bar': return buildBarOption(...)
    case 'area': return buildAreaOption(...)
    case 'stack': return buildStackOption(...)
    case 'rank': return buildRankOption(...)
    case 'pie': return buildPieOption(...)
    case 'radar': return buildRadarOption(...)
    case 'scatter': return buildScatterOption(...)
    case 'heat': return buildHeatOption(...)
    default: return buildBarOption(...)
  }
}
```

### 新增参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `string` | `'bar'` | 图表类型：'bar' \| 'area' \| 'stack' \| 'rank' \| 'pie' \| 'radar' \| 'scatter' \| 'heat' |

---

## 三、支持的8种图表类型详解

### 1. 柱状图 (bar) - `buildBarOption`

**适用场景**：清晰对比多个类别的数值大小

**特点**：
- ✅ 垂直柱状图
- ✅ 支持渐变填充
- ✅ 顶部显示数值标签
- ✅ 圆角矩形样式

```javascript
function buildBarOption(baseOption, categories, data, isProportion, valueType) {
  const gradient = createLinearGradient(screenGradients.primary, 'vertical')
  
  return {
    ...baseOption,
    grid: { ...gridTokens.defaultPadding },
    xAxis: { type: 'category', data: categories, ... },
    yAxis: { type: 'value', ... },
    series: [{
      type: 'bar',
      data,
      itemStyle: { color: gradient, borderRadius: [4, 4, 0, 0] },
      barMaxWidth: 42,
      label: { show: true, position: 'top', ... }
    }]
  }
}
```

---

### 2. 面积图 (area) - `buildAreaOption`

**适用场景**：展示数据趋势和累积效果

**特点**：
- ✅ 平滑曲线
- ✅ 渐变填充区域
- ✅ 数据点标记
- ✅ 适合展示变化趋势

```javascript
function buildAreaOption(baseOption, categories, data, isProportion, valueType) {
  const gradient = createLinearGradient(screenGradients.primary, 'vertical')
  
  return {
    ...baseOption,
    xAxis: { type: 'category', boundaryGap: false, ... },
    yAxis: { type: 'value', ... },
    series: [{
      type: 'line',
      data,
      smooth: true,
      areaStyle: { color: gradient, opacity: 0.6 },
      lineStyle: { color: screenGradients.primary[0], width: 2 },
      itemStyle: { color: screenGradients.primary[0], borderWidth: 2 },
      symbol: 'circle',
      symbolSize: 6
    }]
  }
}
```

---

### 3. 堆叠柱状图 (stack) - `buildStackOption`

**适用场景**：展示部分与整体的关系，对比组成结构

**特点**：
- ✅ 自动将数据分成两组堆叠
- ✅ 不同颜色区分组别
- ✅ 内部显示数值
- ✅ 显示图例

```javascript
function buildStackOption(baseOption, categories, data, isProportion, valueType) {
  const midPoint = Math.ceil(data.length / 2)
  const data1 = data.slice(0, midPoint)
  const data2 = data.slice(midPoint)
  
  return {
    ...baseOption,
    legend: { show: true, ... },
    series: [
      {
        name: '组1',
        type: 'bar',
        stack: 'total',
        data: data1,
        itemStyle: { color: gradient1 }
      },
      {
        name: '组2',
        type: 'bar',
        stack: 'total',
        data: data2,
        itemStyle: { color: gradient2 }
      }
    ]
  }
}
```

---

### 4. 排行图 (rank) - `buildRankOption`

**适用场景**：展示排名顺序，横向对比

**特点**：
- ✅ 横向条形图
- ✅ Y轴显示类别名称
- ✅ X轴显示数值
- ✅ 右侧显示数值标签

```javascript
function buildRankOption(baseOption, categories, data, isProportion, valueType) {
  const gradient = createLinearGradient(screenGradients.primary, 'horizontal')
  
  return {
    ...baseOption,
    grid: { left: 100, right: 40, ... },
    xAxis: { type: 'value', ... },
    yAxis: { type: 'category', data: categories, ... },
    series: [{
      type: 'bar',
      data,
      itemStyle: { color: gradient, borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', ... }
    }]
  }
}
```

---

### 5. 环形图 (pie) - `buildPieOption`

**适用场景**：展示各部分占比关系

**特点**：
- ✅ 环形显示（内半径40%，外半径65%）
- ✅ 使用Okabe-Ito色盘（色盲友好）
- ✅ 显示图例（右侧垂直）
- ✅ 标签显示名称和数值

```javascript
function buildPieOption(baseOption, categories, data, isProportion, valueType) {
  const pieData = categories.map((name, index) => ({
    name,
    value: data[index],
    itemStyle: { color: getCategoryColor(index) }
  }))
  
  return {
    ...baseOption,
    legend: { show: true, orient: 'vertical', right: 10, ... },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],  // 环形图
      center: ['35%', '50%'],
      data: pieData,
      label: { show: true, formatter: '{b}\n{c}' }
    }]
  }
}
```

---

### 6. 雷达图 (radar) - `buildRadarOption`

**适用场景**：多维度数据对比，展示整体轮廓

**特点**：
- ✅ 多边形展示
- ✅ 填充区域渐变
- ✅ 自动计算最大值（留20%余量）
- ✅ 显示数据点标签

```javascript
function buildRadarOption(baseOption, categories, data, isProportion, valueType) {
  const max = Math.max(...data) * 1.2
  
  return {
    ...baseOption,
    radar: {
      indicator: categories.map(name => ({ name, max })),
      radius: '65%',
      shape: 'polygon',
      splitNumber: 4
    },
    series: [{
      type: 'radar',
      data: [{
        value: data,
        areaStyle: { color: gradient, opacity: 0.3 },
        lineStyle: { color: primary[0], width: 2 }
      }]
    }]
  }
}
```

---

### 7. 散点图 (scatter) - `buildScatterOption`

**适用场景**：展示数据分布和离散程度

**特点**：
- ✅ 气泡大小根据数值动态调整
- ✅ 显示数据点标签
- ✅ X/Y轴网格线
- ✅ 强调效果阴影

```javascript
function buildScatterOption(baseOption, categories, data, isProportion, valueType) {
  const scatterData = data.map((value, index) => [index, value])
  
  return {
    ...baseOption,
    xAxis: { type: 'category', data: categories, ... },
    yAxis: { type: 'value', ... },
    series: [{
      type: 'scatter',
      data: scatterData,
      symbolSize: params => Math.max(8, Math.min(20, params[1] / max * 20)),
      itemStyle: { color: primary[0], borderColor: '#fff', borderWidth: 2 }
    }]
  }
}
```

---

### 8. 热力图 (heat) - `buildHeatOption`

**适用场景**：展示矩阵数据，发现模式和关联

**特点**：
- ✅ 颜色映射数值大小
- ✅ 使用连续色带
- ✅ 显示视觉映射组件
- ✅ 单元格内显示数值

```javascript
function buildHeatOption(baseOption, categories, data, isProportion, valueType) {
  const size = Math.ceil(Math.sqrt(data.length))
  const heatData = []
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = i * size + j
      if (index < data.length) {
        heatData.push([j, i, data[index]])
      }
    }
  }
  
  return {
    ...baseOption,
    visualMap: {
      min: Math.min(...data),
      max: Math.max(...data),
      calculable: true,
      inRange: { color: viridisColors }
    },
    xAxis: { type: 'category', data: categories.slice(0, size) },
    yAxis: { type: 'category', data: categories.slice(0, size) },
    series: [{
      type: 'heatmap',
      data: heatData,
      label: { show: true }
    }]
  }
}
```

---

## 四、redrawChart 函数改动

### 之前版本

```javascript
const redrawChart = (groupKey) => {
  const cache = groupDataCache[groupKey]
  if (!cache) return
  const isProportion = displayModes[groupKey] === 'proportion' && groupProportionAvailable[groupKey]
  const title = `${titleMap[groupKey]} - ${tabLabel(groupKey, activeTabs[groupKey])}${isProportion ? '(占比)' : '(数量)'}`
  
  const option = buildOption({
    title,
    categories: cache.categories,
    data: isProportion ? cache.proportions : cache.counts,
    isProportion
    // 缺少 type 参数，默认使用柱状图
  })
  
  const inst = chartInstances[groupKey]
  if (inst) {
    inst.setOption(option, true)
  }
}
```

### 改进后版本

```javascript
const redrawChart = (groupKey) => {
  const cache = groupDataCache[groupKey]
  if (!cache) return
  const isProportion = displayModes[groupKey] === 'proportion' && groupProportionAvailable[groupKey]
  const title = `${titleMap[groupKey]} - ${tabLabel(groupKey, activeTabs[groupKey])}${isProportion ? '(占比)' : '(数量)'}`
  
  // ✅ 根据groupKey映射到对应的图表类型
  const chartType = chartTypeMap[groupKey] || 'bar'
  
  const option = buildOption({
    title,
    categories: cache.categories,
    data: isProportion ? cache.proportions : cache.counts,
    isProportion,
    type: chartType  // ✅ 传入图表类型参数
  })
  
  const inst = chartInstances[groupKey]
  if (inst) {
    // 仅重绘当前实例，使用 setOption 进行动画更新
    inst.setOption(option, true)
  }
}
```

### 关键改进点

| 改进项 | 说明 |
|--------|------|
| **类型映射** | 通过 `chartTypeMap[groupKey]` 获取对应图表类型 |
| **默认值** | 使用 `'bar'` 作为后备默认类型 |
| **参数传递** | 将 `type` 参数传递给 `buildOption` |
| **数量/占比共用** | 所有图表类型都支持数量和占比模式切换 |

---

## 五、核心优势

### 1. 可维护性 ⬆️⬆️⬆️
- ✅ 图表类型集中管理在 `chartTypeMap`
- ✅ 修改图表类型只需更新映射表
- ✅ 不影响 `fetchMap` 和 `displayModes` 逻辑

### 2. 可扩展性 ⬆️⬆️⬆️
- ✅ 支持8种图表类型
- ✅ 易于添加新的图表类型
- ✅ 每种类型独立配置函数

### 3. 数据兼容性 ⬆️⬆️
- ✅ 数量/占比模式自动适配
- ✅ 所有图表类型共享格式化逻辑
- ✅ Tooltip 自动适配不同图表类型

### 4. 视觉多样性 ⬆️⬆️⬆️
- ✅ 不同区域使用不同可视化方式
- ✅ 提升数据展示的专业性
- ✅ 更符合数据特征的表现形式

### 5. 用户体验 ⬆️⬆️
- ✅ 更直观的数据展示
- ✅ 更丰富的交互效果
- ✅ 更易于理解复杂数据

---

## 六、图表类型选择指南

### 左列（对比类）
- **人口结构分布**：柱状图 - 适合对比7个年龄段
- **基础身份计数**：面积图 - 展示布尔类/党员/村民的趋势
- **健康与困难**:柱状图 - 清晰对比健康/贫困/残疾状态

### 中列（占比类）
- **优抚与家庭**：环形图 - 直观展示各类补助的占比关系

### 右列（排名/结构类）
- **居住与退役**：堆叠图 - 对比常住/退役的组成结构
- **项目与投资**：柱状图 - 对比项目状态和投资指标
- **收入与收支**：排行图 - 横向展示收入/支出的排名

---

## 七、完整改动清单

### 新增内容

1. **chartTypeMap** - 图表类型映射配置
2. **buildOption扩展** - 支持 `type` 参数
3. **buildBarOption** - 柱状图配置函数
4. **buildAreaOption** - 面积图配置函数
5. **buildStackOption** - 堆叠图配置函数
6. **buildRankOption** - 排行图配置函数
7. **buildPieOption** - 环形图配置函数
8. **buildRadarOption** - 雷达图配置函数
9. **buildScatterOption** - 散点图配置函数
10. **buildHeatOption** - 热力图配置函数

### 修改内容

1. **导入语句** - 新增 `okabeItoColors`, `getCategoryColor`
2. **redrawChart** - 添加图表类型映射逻辑
3. **buildOption** - 从单一实现改为分发器模式

### 保持不变

- ✅ `fetchMap` - 数据获取映射
- ✅ `displayModes` - 数量/占比显示模式
- ✅ `activeTabs` - Tab 激活状态
- ✅ `groupDataCache` - 数据缓存机制
- ✅ 所有API调用逻辑

---

## 八、测试建议

### 功能测试
1. ✅ 验证每种图表类型正确渲染
2. ✅ 测试数量/占比模式切换
3. ✅ 检查Tooltip显示是否正确
4. ✅ 验证自动轮播功能兼容性

### 视觉测试
1. ✅ 检查渐变色显示效果
2. ✅ 验证标签位置和可读性
3. ✅ 测试不同数据量下的显示效果
4. ✅ 检查响应式布局适配

### 性能测试
1. ✅ 监测图表切换流畅度
2. ✅ 检查内存占用情况
3. ✅ 验证动画性能

---

## 总结

通过引入图表类型映射和扩展 `buildOption` 函数，成功实现了：

1. **8种图表类型支持**：bar, area, stack, rank, pie, radar, scatter, heat
2. **智能类型映射**：根据 `groupKey` 自动选择最适合的图表类型
3. **数据模式兼容**：所有图表类型支持数量/占比切换
4. **代码架构优化**：分发器模式 + 独立配置函数，易于维护和扩展

整体提升了数据大屏的可视化表现力和专业性！🎉