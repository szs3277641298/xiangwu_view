// 错误处理工具函数

/**
 * 从错误对象中提取并显示错误信息
 * @param {Object} error - 错误对象
 * @param {Function|Object} messageMethodOrInstance - 消息提示方法或Vue实例
 * @param {string} defaultMessage - 默认错误信息
 * @returns {string} 提取的错误信息
 */
export function showErrorMessage(error, messageMethodOrInstance, defaultMessage = '操作失败，请重试') {
  // 初始化错误信息为默认值
  let errorMessage = defaultMessage
  
  try {
    // 检查错误对象结构
    if (error && error.response && error.response.data) {
      const { data } = error.response
      
      // 从后端返回的错误响应中提取message字段
      if (data.message) {
        errorMessage = data.message
      }
      // 兼容其他可能的错误信息格式
      else if (data.error) {
        errorMessage = data.error
      }
      else if (typeof data === 'string') {
        errorMessage = data
      }
    }
    // 兼容直接返回的错误对象格式 {"code":401,"message":"登录失败,用户名或密码错误","data":null}
    else if (error && error.message) {
      errorMessage = error.message
    }
    else if (error && typeof error === 'string') {
      errorMessage = error
    }
  } catch (e) {
    console.error('提取错误信息失败:', e)
  }
  
  // 显示错误信息
  let messageMethod;
  
  // 如果是Vue实例，从中提取$message.error方法
  if (messageMethodOrInstance && messageMethodOrInstance.$message && typeof messageMethodOrInstance.$message.error === 'function') {
    messageMethod = messageMethodOrInstance.$message.error;
  }
  // 如果是函数，直接使用
  else if (messageMethodOrInstance && typeof messageMethodOrInstance === 'function') {
    messageMethod = messageMethodOrInstance;
  }
  
  if (messageMethod) {
    messageMethod(errorMessage);
  }
  
  return errorMessage
}

/**
 * 创建统一的错误处理函数
 * @param {Object} VueInstance - Vue组件实例，包含this.$message
 * @returns {Function} 错误处理函数
 */
export function createErrorHandler(VueInstance) {
  const messageMethod = VueInstance && VueInstance.$message ? VueInstance.$message.error : console.error
  
  return function handleError(error, defaultMessage) {
    return showErrorMessage(error, messageMethod, defaultMessage)
  }
}

/**
 * 统一的API错误处理中间件
 * @param {Object} error - 错误对象
 * @param {Function} reject - Promise reject函数
 * @param {Function} messageMethod - 消息提示方法
 */
export function handleApiError(error, reject, messageMethod) {
  const errorMessage = showErrorMessage(error, messageMethod)
  reject(errorMessage)
  return errorMessage
}