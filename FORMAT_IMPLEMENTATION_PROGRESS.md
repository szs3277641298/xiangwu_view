# 数字格式化优化 - 实施进度

## ✅ 已完成的修改

### 1. formatDisplayValue 函数 ✅
**位置**: 第 543-559 行  
**修改内容**:
- 百分比类型显式添加 `'%'` 后缀
- 避免在 `formatNumber` 内部重复添加

```javascript
// Before
return formatNumber(value, { type: 'percent', suffix: '' })

// After
return formatNumber(value, { type: 'percent' }) + '%'
```

---

### 2. Tooltip formatter 统一优化 ✅
**位置**: 第 843-891 行  
**修改内容**:
- 所有图表类型统一添加色块标记 (`params.marker`)
- 移除 `suffix: '%'` 参数,显式拼接后缀
- 新增散点图(scatter)的 X/Y 坐标格式化
- 优化系列名显示逻辑

**关键变化**:
```javascript
// 饼图
const marker = params.marker || ''
const percentSuffix = isProportion ? '%' : ''
return `${marker}${params.name}<br/>${formattedValue}${percentSuffix}${percentInfo}`

// 雷达图
const marker = params.marker || ''
return `${marker}${params.name}<br/>${valueLines}`

// 散点图
const marker = p.marker || ''
return `${marker}${p.seriesName}<br/>X: ${xFormatted}${suffix}<br/>Y: ${yFormatted}${suffix}`

// 其他
const marker = p.marker || ''
return `${marker}${label}: ${formattedValue}${suffix}`
```

---

### 3. 柱状图 Y 轴 formatter ✅
**位置**: 第 948-956 行  
**修改内容**:
```javascript
// Before
formatter: v => isProportion 
  ? formatNumber(v, { type: 'percent', suffix: '%' })
  : formatNumber(v, { type: 'default' })

// After
formatter: v => {
  const formatted = formatNumber(v, { type: isProportion ? 'percent' : valueType })
  return isProportion ? formatted + '%' : formatted
}
```

---

### 4. 柱状图 Label formatter ✅
**位置**: 第 972-977 行  
**修改内容**:
```javascript
// Before
formatter: p => formatNumber(p.value, {
  type: valueType,
  suffix: isProportion ? '%' : ''
})

// After
formatter: p => {
  const formatted = formatNumber(p.value, { type: valueType })
  return isProportion ? formatted + '%' : formatted
}
```

---

### 5. 面积图 Y 轴 formatter ✅
**位置**: 第 1013-1021 行  
**修改内容**: 同柱状图 Y 轴

---

### 6. 面积图 Label formatter ✅
**位置**: 第 1044-1049 行  
**修改内容**: 同柱状图 Label

---

## 🔄 待完成的修改 (需继续)

### 7. 堆叠图 Y 轴 formatter
**位置**: 约第 1095-1103 行  
**待修改**: 同柱状图 Y 轴逻辑

### 8. 堆叠图 Label formatter (两处)
**位置**: 约第 1120 行, 1135 行  
**待修改**:
```javascript
// Before
formatter: p => p.value > 0 ? formatNumber(p.value, { type: valueType, suffix: isProportion ? '%' : '' }) : ''

// After
formatter: p => {
  if (p.value <= 0) return ''
  const formatted = formatNumber(p.value, { type: valueType })
  return isProportion ? formatted + '%' : formatted
}
```

### 9. 排行榜 X 轴 formatter
**位置**: 约第 1159-1167 行  
**待修改**: 同柱状图 Y 轴逻辑

### 10. 排行榜 Label formatter
**位置**: 约第 1193-1198 行  
**待修改**: 同柱状图 Label逻辑

### 11. 饼图 Legend formatter
**位置**: 约第 1219-1239 行  
**待修改**:
```javascript
// Before
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

// After
formatter: name => {
  const item = pieData.find(d => d.name === name)
  if (item) {
    const formatted = formatNumber(item.value, { type: valueType })
    const suffix = isProportion ? '%' : ''
    return `${name}: ${formatted}${suffix}`
  }
  return name
}
```

同时添加:
```javascript
selectedMode: 'multiple', // 可点击开关
```

### 12. 饼图 Label formatter
**位置**: 约第 1254-1260 行  
**待修改**:
```javascript
// Before
formatter: p => {
  const formatted = formatNumber(p.value, {
    type: valueType,
    suffix: isProportion ? '%' : ''
  })
  return `${p.name}\n${formatted}`
}

// After
formatter: p => {
  const formatted = formatNumber(p.value, { type: valueType })
  const suffix = isProportion ? '%' : ''
  return `${p.name}\n${formatted}${suffix}`
}
```

### 13. baseOption 添加 Legend 配置
**位置**: buildOption 函数中,约第 820 行  
**新增内容**:
```javascript
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
  selectedMode: 'multiple'
} : undefined,
```

### 14. 堆叠图 Legend 配置
**位置**: buildStackOption 函数中,约第 1073 行  
**新增内容**:
```javascript
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
```

---

## 📊 修改统计

| 状态 | 数量 | 项目 |
|------|-----|------|
| ✅ 已完成 | 6 | formatDisplayValue, Tooltip, 柱状图 Y/Label, 面积图 Y/Label |
| 🔄 待完成 | 8 | 堆叠图 Y/Label×2, 排行榜 X/Label, 饼图 Legend/Label, Legend 配置×2 |
| **总计** | **14** | **所有需修改的位置** |

---

## 🚀 下一步行动

由于代码修改较多且存在重复的 `emphasis` 问题(可能是我的修改操作导致的),建议:

### 方案 A: 继续逐个修改 (保守)
- 逐个修复剩余 8 个位置
- 风险: 可能继续产生语法错误需要回退

### 方案 B: 批量查找替换 (高效)
使用 VS Code 的查找替换功能:
1. **查找**: `formatNumber\\(([^,]+), \\{[^}]*suffix: isProportion \\? '%' : ''[^}]*\\}\\)`
2. **替换**: 手动调整为新格式

### 方案 C: 回滚后重新一次性修改 (推荐)
1. 使用 Git 回滚到修改前的状态
2. 创建一个完整的搜索替换脚本
3. 一次性应用所有修改

---

## ⚠️ 已知问题

1. **重复的 emphasis 块**: 在柱状图和面积图中出现了重复的 `emphasis: {` 块,已修复
2. **编译错误**: 由于修改过程中的语法问题导致编译错误,已修复

---

## ✨ 优化效果预览

### Before (存在问题)
```javascript
// formatNumber 中传递 suffix
formatNumber(value, { type: 'percent', suffix: '%' })
// 如果 formatNumber 内部已经添加了 '%',会导致 "85.00%%"

// Tooltip 没有色块
return `${params.name}<br/>数量: ${formattedValue}`
```

### After (已优化)
```javascript
// 显式拼接 '%'
const formatted = formatNumber(value, { type: 'percent' })
return isProportion ? formatted + '%' : formatted
// 确保只有一个 '%'

// Tooltip 有色块
const marker = params.marker || ''
return `${marker}${params.name}<br/>数量: ${formattedValue}${suffix}`
```

---

**状态**: 🔄 进行中 (6/14 完成)  
**建议**: 用户确认是否继续逐个修改,或选择方案 B/C
