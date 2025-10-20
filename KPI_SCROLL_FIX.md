# KPI 滚动区域修复方案

## 🐛 问题分析

### 问题 1: 自动滚动未启动
**原因**:
- Credits 滚动 Hook 可能未正确初始化
- `kpiScrollContainer` ref 可能未正确绑定
- 数据格式不匹配 Hook 期望的格式

### 问题 2: 数据超出边框
**原因**:
- `.data-list` 设置了 `overflow-y: auto` 显示滚动条
- rAF 滚动使用 `translateY` 变换,与 overflow 冲突
- 容器高度未限制,内容可能溢出父容器

---

## 🔧 修复方案

### 修复 1: CSS 样式调整

#### 1.1 修复 `.data-list` 样式
**问题**: `overflow-y: auto` 与 rAF 的 translateY 冲突

**Before**:
```css
.data-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;  /* ❌ 会显示滚动条,与 rAF 冲突 */
  padding: 10px 0;
}
```

**After**:
```css
.data-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;  /* ✅ 隐藏溢出,配合 rAF */
  padding: 10px 0;
  position: relative;  /* ✅ 为 translateY 提供定位上下文 */
}
```

#### 1.2 修复 `.info-scroll-area` 样式
**问题**: 未明确限制高度

**Before**:
```css
.info-scroll-area {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}
```

**After**:
```css
.info-scroll-area {
  height: 100%;
  max-height: 100%;  /* ✅ 限制最大高度 */
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;  /* ✅ 保持隐藏溢出 */
}
```

#### 1.3 修复 `.info-scroll-container` 样式
**问题**: 未设置明确高度限制

**Before**:
```css
.info-scroll-container {
  flex: 1;
  overflow: hidden;
}
```

**After**:
```css
.info-scroll-container {
  flex: 1;
  min-height: 0;  /* ✅ 允许 flex 子项缩小 */
  overflow: hidden;
  position: relative;  /* ✅ 为绝对定位的控制按钮提供上下文 */
}
```

---

### 修复 2: 确保 Credits 滚动初始化

#### 2.1 检查 Hook 初始化逻辑

**当前代码** (第 675-690 行):
```javascript
creditsSnapAPI = useCreditsSnap(
  { value: formattedGroups },
  currentDataGroup,
  kpiScrollContainer,
  {
    speedPxPerSec: 40,
    activeHoldMs: 1200,
    groupPauseMs: 800,
    pauseOnHover: true,
    pauseOnBlur: true
  }
)

console.log('Credits滚动已启用 (rAF驱动)')
```

**优化建议**: 添加验证日志
```javascript
if (kpiScrollContainer.value) {
  console.log('✅ KPI容器已找到:', kpiScrollContainer.value)
  console.log('📊 数据组数量:', formattedGroups.length)
  console.log('📝 总数据项:', formattedGroups.reduce((sum, g) => sum + g.items.length, 0))
  
  creditsSnapAPI = useCreditsSnap(
    { value: formattedGroups },
    currentDataGroup,
    kpiScrollContainer,
    {
      speedPxPerSec: 40,
      activeHoldMs: 1200,
      groupPauseMs: 800,
      pauseOnHover: true,
      pauseOnBlur: true
    }
  )
  
  console.log('✅ Credits滚动已启用 (rAF驱动)')
} else {
  console.error('❌ KPI容器未找到! ref绑定可能有问题')
  startDataScroll()
}
```

---

### 修复 3: 添加降级提示

如果 rAF 滚动未启动,添加视觉提示:

**模板修改** (第 154 行附近):
```vue
<div class="loading-text" v-if="displayItems.length === 0 && kpiLoading">正在加载数据...</div>
<div class="loading-text" v-if="displayItems.length === 0 && !kpiLoading">暂无数据</div>

<!-- 新增:滚动状态提示 -->
<div class="scroll-status" v-if="displayItems.length > 0">
  <span v-if="creditsSnapAPI" class="status-badge success">🟢 平滑滚动</span>
  <span v-else class="status-badge warning">🟡 基础滚动</span>
</div>
```

**CSS 样式**:
```css
.scroll-status {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 10;
  opacity: 0.6;
  font-size: 10px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
}

.status-badge.success {
  border: 1px solid #0f0;
}

.status-badge.warning {
  border: 1px solid #ff0;
}
```

---

## 📝 实施步骤

### 步骤 1: 修复 CSS (3处)
1. `.data-list`: 改 `overflow-y: auto` 为 `overflow: hidden`, 添加 `position: relative`
2. `.info-scroll-area`: 添加 `max-height: 100%`
3. `.info-scroll-container`: 添加 `min-height: 0`, 添加 `position: relative`

### 步骤 2: 添加调试日志
在 `fetchKpiData` 函数中添加详细日志输出

### 步骤 3: 测试验证
1. 打开浏览器控制台
2. 刷新页面
3. 观察是否有 "Credits滚动已启用" 日志
4. 检查数据项是否在容器内平滑滚动
5. 验证鼠标悬停是否暂停

---

## ✅ 预期效果

### 修复后的表现
1. **自动滚动**: 页面加载后 3 秒内开始平滑向上滚动
2. **边框限制**: 所有数据项严格限制在容器内,无滚动条
3. **流畅动画**: 60fps 的平滑滚动,每项停顿 1.2 秒
4. **交互控制**: 鼠标悬停暂停,离开恢复

### 控制台日志
```
✅ KPI容器已找到: <div class="info-scroll-container">
📊 数据组数量: 3
📝 总数据项: 12
✅ Credits滚动已启用 (rAF驱动)
```

---

## 🚨 故障排查

### 如果滚动仍未启动
1. 检查 `ref="kpiScrollContainer"` 是否正确绑定
2. 检查数据是否加载成功 (displayItems.length > 0)
3. 检查控制台是否有错误信息
4. 验证 `useCreditsSnap` Hook 是否正确导入

### 如果数据仍超出边框
1. 使用浏览器开发者工具检查 `.data-list` 的 computed styles
2. 确认 `overflow: hidden` 已应用
3. 检查父容器 `.info-scroll-area` 的高度
4. 验证是否有其他样式覆盖

---

**修复优先级**: 🔴 高  
**预计耗时**: 5-10 分钟  
**影响范围**: KPI 信息滚动区域  
**风险等级**: 🟢 低 (仅 CSS 调整)
