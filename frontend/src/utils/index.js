/**
 * 格式化价格
 */
export function formatPrice(price) {
  return `¥${price}`;
}

/**
 * 格式化距离
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * 格式化时间
 */
export function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < month) return `${Math.floor(diff / day)}天前`;
  if (diff < year) return `${Math.floor(diff / month)}个月前`;

  return date.toLocaleDateString('zh-CN');
}

/**
 * 格式化营业时间
 */
export function formatBusinessHours(hours) {
  return hours;
}

/**
 * 获取价格档位文字
 */
export function getPriceLevelText(level) {
  const levels = {
    1: '经济实惠',
    2: '中等消费',
    3: '较高消费',
    4: '高档消费',
    5: '奢华消费'
  };
  return levels[level] || '未知';
}

/**
 * 获取价格档位颜色
 */
export function getPriceLevelColor(level) {
  const colors = {
    1: '#67C23A', // 绿色
    2: '#409EFF', // 蓝色
    3: '#E6A23C', // 橙色
    4: '#F56C6C', // 红色
    5: '#909399'  // 灰色
  };
  return colors[level] || '#67C23A';
}

/**
 * 生成星级评分
 */
export function generateStarRating(rating) {
  return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '');
}

/**
 * 防抖函数
 */
export function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 */
export function throttle(fn, delay) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 深拷贝
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));

  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * 判断是否为移动设备
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * 获取随机图片
 */
export function getRandomImage(width = 400, height = 300) {
  const random = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/${width}/${height}?random=${random}`;
}
