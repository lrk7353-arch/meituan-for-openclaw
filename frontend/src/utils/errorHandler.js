/**
 * 全局错误处理工具
 */

/**
 * 处理 API 错误
 */
export function handleApiError(error) {
  console.error('API Error:', error);

  if (error.response) {
    // 服务器返回了错误响应
    const { status, data } = error.response;
    switch (status) {
      case 400:
        return '请求参数错误，请检查后重试';
      case 401:
        return '未授权，请登录后重试';
      case 403:
        return '没有权限访问该资源';
      case 404:
        return '请求的资源不存在';
      case 500:
        return '服务器内部错误，请稍后重试';
      default:
        return data?.error || `请求失败 (${status})`;
    }
  } else if (error.request) {
    // 请求已发出但没有收到响应
    if (error.message === 'Network Error') {
      return '网络连接失败，请检查网络';
    }
    return '服务器无响应，请稍后重试';
  } else {
    // 请求配置出错
    return '请求配置错误';
  }
}

/**
 * 处理地图加载错误
 */
export function handleMapError(error) {
  console.error('Map Error:', error);

  if (error.includes('API_KEY')) {
    return '地图 API Key 未配置或无效，请在配置文件中设置高德地图 API Key';
  }

  return '地图加载失败，请检查网络连接或刷新页面重试';
}

/**
 * 处理图片加载错误
 */
export function handleImageError(event, fallbackImage) {
  console.error('Image Load Error:', event.target.src);

  // 设置默认图片
  if (fallbackImage) {
    event.target.src = fallbackImage;
  } else {
    // 使用占位图片服务
    const width = event.target.width || 400;
    const height = event.target.height || 300;
    event.target.src = `https://via.placeholder.com/${width}x${height}?text=Image+Not+Found`;
  }
}

/**
 * 格式化错误信息
 */
export function formatErrorMessage(error) {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.toString) {
    return error.toString();
  }

  return '发生未知错误';
}

/**
 * 创建错误提示
 */
export function showErrorToast(message, duration = 3000) {
  // 这里可以使用 Element Plus 的 ElMessage
  // 需要在使用的地方导入
  if (typeof ElMessage !== 'undefined') {
    ElMessage.error({
      message,
      duration,
      showClose: true
    });
  } else {
    console.error(message);
  }
}

/**
 * 创建成功提示
 */
export function showSuccessToast(message, duration = 2000) {
  if (typeof ElMessage !== 'undefined') {
    ElMessage.success({
      message,
      duration
    });
  } else {
    console.log(message);
  }
}

/**
 * 创建警告提示
 */
export function showWarningToast(message, duration = 3000) {
  if (typeof ElMessage !== 'undefined') {
    ElMessage.warning({
      message,
      duration
    });
  } else {
    console.warn(message);
  }
}

/**
 * 确认对话框
 */
export function showConfirm(message, title = '确认操作') {
  if (typeof ElMessageBox !== 'undefined') {
    return ElMessageBox.confirm(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
  }

  // 降级方案
  return new Promise((resolve, reject) => {
    if (confirm(`${title}\n${message}`)) {
      resolve();
    } else {
      reject(new Error('User cancelled'));
    }
  });
}

/**
 * 错误日志记录（可扩展到远程日志服务）
 */
export function logError(error, context = {}) {
  const errorData = {
    timestamp: new Date().toISOString(),
    message: formatErrorMessage(error),
    stack: error?.stack,
    context
  };

  console.error('Error logged:', errorData);

  // TODO: 可以扩展发送到错误追踪服务（如 Sentry）
  // fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(errorData)
  // });
}

/**
 * Vue 错误处理器
 */
export function createVueErrorHandler(app) {
  app.config.errorHandler = (err, vm, info) => {
    console.error('Vue Error:', err);
    console.error('Component:', vm);
    console.error('Info:', info);

    logError(err, { component: vm?.$options?.name, info });

    // 可以在这里显示全局错误提示
    showErrorToast('页面发生错误，请刷新重试');
  };
}

/**
 * 全局未捕获的 Promise 错误处理
 */
export function setupUnhandledRejectionHandler() {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    logError(event.reason, { type: 'unhandledrejection' });
    event.preventDefault(); // 阻止默认的 console 输出
  });
}

/**
 * 全局未捕获的错误处理
 */
export function setupGlobalErrorHandler() {
  window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error);
    logError(event.error, { type: 'error', message: event.message });
  });
}

/**
 * 初始化所有错误处理器
 */
export function initErrorHandlers(app) {
  createVueErrorHandler(app);
  setupUnhandledRejectionHandler();
  setupGlobalErrorHandler();
}
