# 导入结果弹窗组件使用指南

## 概述

`ImportResultDialog` 是一个通用的导入结果展示组件，可以显示详细的导入统计信息、错误详情和跳过信息。该组件已经被提取为可复用的组件，可以在任何需要显示导入结果的页面中使用。

## 组件特性

- **统计信息展示**：显示总计、成功、跳过、失败的条数
- **错误详情**：解析并显示具体的错误信息，包括行号和错误描述
- **跳过详情**：显示因重复数据而跳过的记录
- **响应式设计**：支持滚动查看大量错误信息
- **智能解析**：自动从后端返回的 `errorMsg` 中提取统计信息

## 使用方法

### 1. 导入组件

```javascript
import ImportResultDialog from '@/components/ImportResultDialog.vue'
```

### 2. 在模板中添加组件

```vue
<template>
  <!-- 其他内容 -->
  
  <!-- 导入结果详情对话框 -->
  <ImportResultDialog
    v-model="importResultDialogVisible"
    :result-data="importResultData"
    @refresh="loadData"
  />
</template>
```

### 3. 添加相关变量

```javascript
// 导入结果相关
const importResultDialogVisible = ref(false)
const importResultData = ref({})
```

### 4. 修改导入处理逻辑

```javascript
const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择要导入的文件')
    return
  }
  
  importLoading.value = true
  try {
    const response = await yourAPI.importData(selectedFile.value)
    if (response.code === 200) {
      // 解析导入结果
      importResultData.value = response
      
      // 关闭导入对话框
      importDialogVisible.value = false
      selectedFile.value = null
      uploadRef.value?.clearFiles()
      
      // 显示导入结果详情对话框
      importResultDialogVisible.value = true
      
      // 如果有成功导入的数据，刷新列表
      if (response.success > 0) {
        loadData()
      }
    } else {
      ElMessage.error(response.message || '导入失败')
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败，请稍后重试')
  } finally {
    importLoading.value = false
  }
}
```

## 后端数据格式要求

组件期望后端返回以下格式的数据：

```javascript
{
  code: 200,
  success: true,
  message: '部分数据导入成功',
  total: 10,        // 总记录数
  success: 7,       // 成功导入数
  skipped: 2,       // 跳过数
  failed: 1,        // 失败数
  errorMsg: '导入完成：总计10条，成功7条，跳过2条，失败1条；第3行：用户名已存在，跳过导入；第8行：邮箱格式不正确；第9行：密码不能为空'
}
```

### errorMsg 格式说明

`errorMsg` 字段应该包含以下信息：

1. **统计信息**：`导入完成：总计X条，成功X条，跳过X条，失败X条`
2. **错误详情**：`第X行：错误描述`
3. **跳过详情**：`第X行：重复信息，跳过导入`

示例：
```
导入完成：总计10条，成功7条，跳过2条，失败1条；第3行：用户名已存在，跳过导入；第8行：邮箱格式不正确；第9行：密码不能为空
```

## 已集成的页面

以下页面已经集成了导入结果弹窗：

1. **村内人员管理** (`src/views/personnel/Villagers.vue`)
2. **村委会人员管理** (`src/views/personnel/Committee.vue`)
3. **党员信息管理** (`src/views/party/PartyMembers.vue`)
4. **系统用户管理** (`src/views/system/Users.vue`)

## 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| modelValue | Boolean | false | 控制对话框显示/隐藏 |
| resultData | Object | {} | 导入结果数据 |

## 组件事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | Boolean | 更新对话框显示状态 |
| refresh | - | 刷新数据列表 |

## 样式定制

组件使用了 scoped 样式，如果需要定制样式，可以通过以下方式：

1. 使用 `:deep()` 选择器覆盖组件内部样式
2. 通过 CSS 变量定制主题色彩
3. 修改组件的 CSS 类名

## 注意事项

1. **数据格式**：确保后端返回的数据格式符合组件要求
2. **错误信息**：`errorMsg` 中的错误信息应该包含行号，格式为 `第X行：错误描述`
3. **跳过信息**：跳过信息应该包含 `已存在，跳过导入` 或类似的标识
4. **性能**：对于大量错误信息，组件会自动启用滚动功能
5. **响应式**：组件支持不同屏幕尺寸的响应式显示

## 示例代码

完整的使用示例可以参考以下文件：

- `src/views/personnel/Villagers.vue` - 村内人员导入
- `src/views/personnel/Committee.vue` - 村委会人员导入
- `src/views/party/PartyMembers.vue` - 党员信息导入
- `src/views/system/Users.vue` - 系统用户导入

## 更新日志

- **v1.0.0** - 初始版本，支持基本的导入结果展示
- **v1.1.0** - 添加智能解析功能，自动提取统计信息
- **v1.2.0** - 优化UI设计，添加滚动提示和响应式布局
- **v1.3.0** - 提取为通用组件，支持所有页面的导入功能
