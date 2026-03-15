import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import storage from '../utils/storage';

export const useRestaurantStore = defineStore('restaurant', () => {
  const restaurants = ref([]);
  const currentRestaurant = ref(null);
  const favorites = ref(storage.getFavorites());
  const loading = ref(false);

  // 用户选择的模式
  const selectMode = ref(localStorage.getItem('foodie_mode') || 'random');
  // 幸运转盘结果
  const luckyDrawResult = ref(null);
  // 用餐方式
  const diningType = ref(localStorage.getItem('dining_type') || 'dine-in'); // 'dine-in' 或 'delivery'
  const selectedCampus = ref(localStorage.getItem('selected_campus') || '');
  const forcedRestaurantId = ref('');
  // 当前推荐索引（用于探探式选择）
  const currentRecommendIndex = ref(0);

  // 设置餐厅列表
  const setRestaurants = (data) => {
    restaurants.value = data;
  };

  // 设置当前餐厅
  const setCurrentRestaurant = (data) => {
    currentRestaurant.value = data;
  };

  // 切换收藏状态
  const toggleFavorite = (restaurantId) => {
    const index = favorites.value.findIndex(id => id === restaurantId);
    if (index > -1) {
      favorites.value.splice(index, 1);
      storage.removeFavorite(restaurantId);
      return false;
    } else {
      favorites.value.push(restaurantId);
      storage.addFavorite(restaurantId);
      return true;
    }
  };

  // 检查是否收藏
  const isFavorite = (restaurantId) => {
    return favorites.value.includes(restaurantId);
  };

  // 从本地存储加载收藏
  const loadFavorites = () => {
    favorites.value = storage.getFavorites();
  };

  // 设置用餐方式
  const setDiningType = (type) => {
    diningType.value = type;
    localStorage.setItem('dining_type', type);
  };

  const setSelectedCampus = (campus) => {
    selectedCampus.value = campus;
    localStorage.setItem('selected_campus', campus);
    resetRecommendation();
  };

  const setForcedRestaurantId = (restaurantId) => {
    forcedRestaurantId.value = restaurantId || '';
  };

  // 根据模式筛选餐厅
  const getFilteredRestaurants = computed(() => {
    let filtered = [...restaurants.value];

    if (selectedCampus.value) {
      filtered = filtered.filter(r => r.campus === selectedCampus.value);
    }

    // 根据模式筛选
    if (selectMode.value === 'health') {
      // 控制热量：推荐真正的低热量菜系
      filtered = filtered.filter(r => {
        // 如果有热量数据，优先使用热量数据筛选
        if (Number.isFinite(r.signatureCaloriesKcal)) {
          return r.signatureCaloriesKcal <= 500; // 低于500千卡为低热量
        }
        // 没有热量数据时，使用菜系和标签推断
        const lowCalorieCuisines = ['轻食', '素食', '沙拉'];
        const hasLowCalorieTag = r.tags.some(t => 
          t.includes('健康') || t.includes('减脂') || 
          t.includes('沙拉') || t.includes('低卡') || 
          t.includes('轻食')
        );
        return lowCalorieCuisines.includes(r.cuisine) || hasLowCalorieTag;
      });
    } else if (selectMode.value === 'budget') {
      // 控制预算：推荐平价餐厅（价格档位 1-2）
      filtered = filtered.filter(r => r.priceLevel <= 2);
    }
    // random 模式不做筛选，基于位置和好评

    // 根据幸运转盘结果筛选
    if (luckyDrawResult.value) {
      const cuisineMap = {
        '火锅': '火锅烧烤',
        '烧烤': '火锅烧烤',
        '日料': '日韩料理',
        '韩餐': '日韩料理',
        '西餐': '西餐',
        '中餐': '中餐',
        '奶茶': '奶茶甜点',
        '甜品': '奶茶甜点',
        '快餐': '中餐',
        '轻食': '西餐',
        '川湘菜': '中餐',
        '粤菜': '中餐',
        '东北菜': '中餐',
        '江浙菜': '中餐',
        '西北面食': '中餐',
        '中式快餐': '中餐',
        '东南亚菜': '中餐',
        '咖啡简餐': '西餐',
        '海鲜': '中餐',
        '素食': '西餐',
        '煲仔饭': '中餐',
        '地方小吃': '中餐',
        '披萨': '西餐',
        '汉堡': '西餐'
      };
      const mappedCuisine = cuisineMap[luckyDrawResult.value];
      if (mappedCuisine) {
        filtered = filtered.filter(r => r.cuisine === mappedCuisine);
      }
    }

    // 按评分排序
    filtered.sort((a, b) => b.rating - a.rating);

    return filtered;
  });

  // 获取当前推荐的餐厅
  const getCurrentRecommendation = computed(() => {
    const filtered = getFilteredRestaurants.value;
    return filtered[currentRecommendIndex.value] || null;
  });

  // 移动到下一个推荐
  const nextRecommendation = () => {
    const filtered = getFilteredRestaurants.value;
    if (currentRecommendIndex.value < filtered.length - 1) {
      currentRecommendIndex.value++;
      return true;
    }
    return false;
  };

  // 重置推荐索引
  const resetRecommendation = () => {
    currentRecommendIndex.value = 0;
  };

  const locateRecommendationById = (restaurantId) => {
    const filtered = getFilteredRestaurants.value;
    const targetIndex = filtered.findIndex(item => item.id === restaurantId);
    if (targetIndex >= 0) {
      currentRecommendIndex.value = targetIndex;
      return true;
    }
    return false;
  };

  return {
    restaurants,
    currentRestaurant,
    favorites,
    loading,
    selectMode,
    luckyDrawResult,
    diningType,
    selectedCampus,
    forcedRestaurantId,
    currentRecommendIndex,
    getFilteredRestaurants,
    getCurrentRecommendation,
    setRestaurants,
    setCurrentRestaurant,
    toggleFavorite,
    isFavorite,
    loadFavorites,
    setDiningType,
    setSelectedCampus,
    setForcedRestaurantId,
    nextRecommendation,
    resetRecommendation,
    locateRecommendationById
  };
});
