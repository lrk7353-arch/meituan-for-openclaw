/**
 * 应用常量配置
 */

// 菜系分类
export const CUISINE_TYPES = [
  { value: '', label: '全部' },
  { value: '中餐', label: '中餐' },
  { value: '西餐', label: '西餐' },
  { value: '日韩料理', label: '日韩料理' },
  { value: '火锅烧烤', label: '火锅烧烤' },
  { value: '奶茶甜点', label: '奶茶甜点' }
];

// 价格档位
export const PRICE_LEVELS = [
  { value: '', label: '全部' },
  { value: 1, label: '经济实惠 (¥20以下)', icon: '💰' },
  { value: 2, label: '中等消费 (¥20-50)', icon: '💰💰' },
  { value: 3, label: '较高消费 (¥50-100)', icon: '💰💰💰' },
  { value: 4, label: '高档消费 (¥100-200)', icon: '💰💰💰💰' },
  { value: 5, label: '奢华消费 (¥200以上)', icon: '💰💰💰💰💰' }
];

// 排序选项
export const SORT_OPTIONS = [
  { value: 'default', label: '默认排序' },
  { value: 'rating', label: '评分最高' },
  { value: 'reviewCount', label: '评价最多' },
  { value: 'priceLow', label: '价格从低到高' },
  { value: 'priceHigh', label: '价格从高到低' },
  { value: 'distance', label: '距离最近' }
];

// 默认地图中心（北京大学城）
export const DEFAULT_CENTER = {
  lng: 116.325,
  lat: 39.99
};

// 默认地图缩放级别
export const DEFAULT_ZOOM = 14;

// 每页显示数量
export const PAGE_SIZE = 12;

// 图片最大宽度
export const MAX_IMAGE_WIDTH = 800;

// 图片最大高度
export const MAX_IMAGE_HEIGHT = 600;

// 评分颜色
export const RATING_COLORS = {
  5: '#67C23A',
  4: '#409EFF',
  3: '#E6A23C',
  2: '#F56C6C',
  1: '#909399'
};

// 标签类型映射
export const TAG_TYPE_MAP = {
  '学生优惠': 'danger',
  '套餐划算': 'success',
  '外卖配送': 'info',
  '聚餐首选': 'warning',
  '家常菜': 'info',
  '实惠': 'success',
  '寿司': 'primary',
  '刺身': 'primary',
  '环境好': 'success',
  '奶茶': 'danger',
  '甜品': 'warning',
  '外卖快': 'info',
  '健康': 'success',
  '沙拉': 'primary',
  '减脂': 'success',
  '蛋糕': 'warning',
  '下午茶': 'info',
  '约会': 'danger',
  '小吃': 'info',
  '便宜': 'success',
  '聚会': 'danger',
  '夜宵': 'warning',
  '早餐': 'info',
  '午餐': 'success',
  '晚餐': 'primary'
};

// 评价内容限制
export const REVIEW_CONFIG = {
  minContentLength: 10,
  maxContentLength: 500,
  minRating: 1,
  maxRating: 5
};

// 本地存储键名
export const STORAGE_KEYS = {
  FAVORITES: 'meituan_favorites',
  USER_ID: 'meituan_user_id',
  SEARCH_HISTORY: 'meituan_search_history',
  BROWSE_HISTORY: 'meituan_browse_history',
  MY_REVIEWS: 'meituan_my_reviews',
  MEAL_RECORDS: 'meituan_meal_records',
  CALORIE_MONITOR_LOG: 'meituan_calorie_monitor_log'
};

// API 超时时间（毫秒）
export const API_TIMEOUT = 10000;

// 地图配置
export const MAP_CONFIG = {
  provider: 'amap', // amap | baidu | leaflet
  amapKey: '', // 从环境变量读取
  defaultCenter: DEFAULT_CENTER,
  defaultZoom: DEFAULT_ZOOM
};
