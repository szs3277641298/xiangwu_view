# Credits 滚动快速测试指南

## 🚀 快速启动

### 1️⃣ 启动开发服务器
```powershell
npm run dev
```

### 2️⃣ 访问数据大屏
```
http://localhost:5173/dashboard/datascreen
```

---

## ✅ 功能验证清单

### 基础滚动测试
- [ ] **自动滚动启动**: 页面加载后 3 秒内,中心 KPI 区域开始平滑向上滚动
- [ ] **滚动速度**: 目测约 1.5 秒滚动一条数据项(40px/秒)
- [ ] **停顿效果**: 每条高亮项停留约 1.2 秒清晰可见
- [ ] **流畅度**: 无卡顿,滚动如丝般顺滑(与老版本跳变对比)

### 交互控制测试
- [ ] **鼠标悬停**: 将鼠标移入 KPI 区域,滚动立即暂停
- [ ] **鼠标离开**: 移出鼠标,滚动恢复
- [ ] **上一条按钮**: 点击 ⬅️ 按钮,跳转到上一条数据项
- [ ] **下一条按钮**: 点击 ➡️ 按钮,跳转到下一条数据项
- [ ] **分组指示器**: 点击底部圆点,跳转到对应分组首项

### 窗口行为测试
- [ ] **切换标签页**: 切换到其他浏览器标签页,滚动暂停
- [ ] **返回标签页**: 切回当前页,滚动恢复
- [ ] **窗口最小化**: 最小化浏览器窗口,滚动暂停
- [ ] **窗口恢复**: 恢复窗口,滚动继续

### 内存/性能测试
- [ ] **路由切换**: 离开数据大屏页面,浏览器控制台无错误
- [ ] **返回页面**: 重新进入数据大屏,滚动正常重新初始化
- [ ] **长时间运行**: 保持页面打开 5 分钟,无卡顿或内存飙升

---

## 🔍 调试工具

### 打开浏览器控制台
按 `F12` 或 `Ctrl+Shift+I`,查看日志输出:

**预期日志**:
```
Credits滚动已启用 (rAF驱动)
```

**降级日志** (如果出现问题):
```
KPI容器未找到,使用setInterval fallback
```

### 检查 rAF 性能
在控制台执行:
```javascript
// 启用 FPS 监控
performance.mark('fps-start')
setInterval(() => {
  performance.mark('fps-end')
  performance.measure('fps', 'fps-start', 'fps-end')
  const fps = performance.getEntriesByName('fps')[0]
  console.log(`FPS: ${(1000 / fps.duration).toFixed(1)}`)
  performance.clearMarks()
  performance.clearMeasures()
}, 1000)
```

**预期输出**: FPS: 58-60 (接近 60fps)

---

## 🐛 常见问题排查

### 问题1: 滚动没有启动
**检查步骤**:
1. 打开控制台,查看是否有 "Credits滚动已启用" 日志
2. 检查是否出现 "KPI容器未找到" 警告
3. 确认 KPI 数据是否加载成功 (displayItems 不为空)

**解决方案**:
- 如果看到 "容器未找到",检查网络请求是否成功
- 如果数据为空,检查后端 API `/api/kpi/list` 是否正常

### 问题2: 滚动很卡顿
**检查步骤**:
1. 检查是否降级到 setInterval (控制台查看日志)
2. 检查浏览器是否支持硬件加速 (chrome://gpu)
3. 查看 CPU/GPU 占用率 (任务管理器)

**解决方案**:
- 尝试关闭其他标签页减少负载
- 更新浏览器到最新版本
- 检查是否启用了浏览器节能模式

### 问题3: 鼠标悬停不暂停
**检查步骤**:
1. 确认 `pauseOnHover` 参数为 true (默认)
2. 检查 `@mouseenter` 和 `@mouseleave` 事件是否绑定
3. 控制台执行 `creditsSnapAPI` 查看是否为 null

**解决方案**:
- 确认 Hook 初始化成功
- 检查事件是否被其他元素遮挡

### 问题4: 内存泄漏
**检查步骤**:
1. 打开 Chrome DevTools - Memory - Take Heap Snapshot
2. 离开数据大屏页面
3. 再次拍摄快照,查看 Detached DOM 数量

**解决方案**:
- 确认 `onUnmounted` 中调用了 `creditsSnapAPI.stop()`
- 检查是否有未清理的事件监听器

---

## 📊 性能基准

### 预期性能指标
| 指标 | 目标值 | 说明 |
|------|-------|------|
| FPS | >55 | requestAnimationFrame 帧率 |
| CPU 占用 | <5% | 单核占用率(滚动时) |
| 内存占用 | <50MB | Hook + 组件总内存 |
| 首次滚动延迟 | <500ms | 数据加载完成到启动滚动 |
| 手动跳转响应 | <100ms | 点击按钮到跳转完成 |

### 实测方法
1. **FPS**: 使用上述 FPS 监控代码
2. **CPU**: Windows 任务管理器 - 性能 - CPU
3. **内存**: Chrome DevTools - Memory - Take Snapshot
4. **延迟**: Chrome DevTools - Performance - 录制时间线

---

## 🎯 对比测试 (可选)

### 切换到 setInterval 方案
临时注释掉 rAF 逻辑,强制使用旧版:

**文件**: `src/views/dashboard/DataScreen.vue`

```javascript
// 在 fetchKpiData 函数中,将这行注释:
// if (kpiScrollContainer.value) {
//   creditsSnapAPI = useCreditsSnap(...)
// } else {
  startDataScroll()  // 强制使用旧逻辑
// }
```

**对比观察**:
- 旧版: 明显的"跳变"感,每条数据突然出现
- 新版: 平滑的"滑动"感,连续滚动

---

## 📝 测试报告模板

```markdown
## Credits 滚动测试报告

**测试环境**:
- 浏览器: Chrome 131.0.6778.86
- 操作系统: Windows 11
- 数据量: XX 条 KPI
- 测试时间: 2025-XX-XX

**功能测试结果**:
- [ ] 自动滚动: ✅ 正常 / ❌ 异常
- [ ] 鼠标悬停: ✅ 正常 / ❌ 异常
- [ ] 手动导航: ✅ 正常 / ❌ 异常
- [ ] 标签页切换: ✅ 正常 / ❌ 异常

**性能测试结果**:
- FPS: XX fps (目标 >55)
- CPU: XX% (目标 <5%)
- 内存: XX MB (目标 <50MB)

**问题记录**:
1. (如有问题,详细描述)
2. ...

**建议**:
(优化建议或参数调整建议)
```

---

## 🎉 成功标志

当你看到以下现象时,说明 Credits 滚动已完美运行:

✅ **视觉效果**:
- 数据项像电影字幕一样流畅向上滚动
- 每条高亮项停顿明显,阅读体验舒适
- 无任何跳变或闪烁

✅ **交互体验**:
- 鼠标悬停瞬间响应,无延迟
- 按钮点击后精准跳转,无错位
- 切换标签页时优雅暂停

✅ **控制台日志**:
```
Credits滚动已启用 (rAF驱动)
```

✅ **性能表现**:
- FPS 稳定在 58-60
- CPU 占用 <5%
- 长时间运行无内存增长

---

**祝测试顺利! 🚀**

如有问题,请检查:
1. `src/hooks/useCreditsSnap.ts` 是否存在
2. `src/views/dashboard/DataScreen.vue` 是否正确导入
3. 浏览器控制台是否有错误信息
