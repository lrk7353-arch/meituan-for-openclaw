<template>
  <div class="map-page">
    <!-- 顶部模式切换栏 -->
    <div class="top-bar">
      <div class="mode-selector">
        <el-radio-group v-model="restaurantStore.selectMode" size="small" @change="onModeChange">
          <el-radio-button value="health">🥗 控制热量</el-radio-button>
          <el-radio-button value="budget">💰 控制预算</el-radio-button>
          <el-radio-button value="random">🎲 随意</el-radio-button>
        </el-radio-group>
      </div>

      <div class="dining-type-selector">
        <el-radio-group v-model="restaurantStore.diningType" size="small" @change="onDiningTypeChange">
          <el-radio-button value="dine-in">🏪 到店吃</el-radio-button>
          <el-radio-button value="delivery">🛵 外卖</el-radio-button>
        </el-radio-group>
      </div>
      <div class="campus-selector">
        <el-select
          v-model="restaurantStore.selectedCampus"
          size="small"
          placeholder="选择学校"
          clearable
          @change="onCampusChange"
        >
          <el-option label="全部学校" value="" />
          <el-option label="清华大学" value="清华大学" />
          <el-option label="北京大学" value="北京大学" />
          <el-option label="中国人民大学" value="中国人民大学" />
          <el-option label="北京航空航天大学" value="北京航空航天大学" />
        </el-select>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="map-container">
      <!-- 地图加载中 -->
      <div v-if="mapLoading" class="map-loading">
        <el-icon class="is-loading" :size="48"><Loading /></el-icon>
        <p>地图加载中...</p>
      </div>

      <!-- 地图显示 -->
      <div v-else-if="!mapError" id="map-container" class="map"></div>

      <!-- 地图加载失败降级 -->
      <div v-else class="map-fallback">
        <el-result
          icon="error"
          title="地图加载失败"
          sub-title="可能是 API Key 配置有问题或网络连接问题"
        >
          <template #extra>
            <el-button type="primary" @click="reloadMap">重新加载</el-button>
          </template>
        </el-result>

        <!-- 列表模式的降级显示 -->
        <div class="fallback-list">
          <h3>推荐餐厅列表</h3>
          <div
            v-for="(restaurant, index) in filteredRestaurants"
            :key="restaurant.id"
            class="fallback-item"
            @click="selectRestaurant(restaurant)"
          >
            <div class="item-content">
              <img :src="getRestaurantCover(restaurant)" :alt="restaurant.name" class="item-image" />
              <div class="item-info">
                <h4>{{ restaurant.name }} <span v-if="index === currentRecommendIndex" class="current-tag">当前推荐</span></h4>
                <p>{{ restaurant.cuisine }} | ¥{{ restaurant.avgPrice }}/人</p>
                <p class="item-calorie">主打热量：{{ formatSignatureCalories(restaurant) }}</p>
                <div class="rating">
                  <el-rate v-model="restaurant.rating" disabled size="small" />
                  <span>{{ restaurant.rating }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 餐厅信息气泡（在地图上显示） -->
      <div
        v-if="currentRestaurant && !mapError"
        class="restaurant-bubble"
        :style="bubblePosition"
      >
        <div class="bubble-content">
          <div class="bubble-header">
            <img :src="getRestaurantCover(currentRestaurant)" :alt="currentRestaurant.name" class="bubble-image" />
            <div class="bubble-info">
              <h3>{{ currentRestaurant.name }}</h3>
              <div class="bubble-rating">
                <el-rate v-model="currentRestaurant.rating" disabled size="small" />
                <span>{{ currentRestaurant.rating }}</span>
              </div>
            </div>
          </div>
          <div class="bubble-details">
            <p class="cuisine">{{ currentRestaurant.cuisine }} | ¥{{ currentRestaurant.avgPrice }}/人</p>
            <p class="calorie">主打热量：{{ formatSignatureCalories(currentRestaurant) }}</p>
            <p class="address">📍 {{ currentRestaurant.address }}</p>
            <div class="bubble-tags">
              <el-tag
                v-for="tag in currentRestaurant.tags.slice(0, 3)"
                :key="tag"
                size="small"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
          <div class="bubble-actions">
            <el-button
              v-if="restaurantStore.diningType === 'dine-in'"
              type="primary"
              size="small"
              @click="openMeituan('groupbuy')"
            >
              🎫 查看团购
            </el-button>
            <el-button
              v-else
              type="success"
              size="small"
              @click="openMeituan('delivery')"
            >
              🛵 点外卖
            </el-button>
            <el-button size="small" @click="goToDetail">
              详情
            </el-button>
          </div>
        </div>
        <div class="bubble-arrow"></div>
      </div>
    </div>

    <!-- 底部选择控制栏 -->
    <div class="bottom-controls">
      <div class="restaurant-count">
        推荐 {{ currentRecommendIndex + 1 }} / {{ filteredRestaurants.length }}
      </div>

      <div class="action-buttons">
        <el-button
          class="action-btn dislike"
          type="info"
          circle
          size="large"
          @click="handleDislike"
        >
          <el-icon :size="32"><Close /></el-icon>
        </el-button>

        <el-button
          class="action-btn like"
          type="danger"
          circle
          size="large"
          @click="openMealRecordDialog"
        >
          <span class="heart-outline">♡</span>
        </el-button>
      </div>

      <p class="hint-text">
        <span class="dislike-hint">❌ 不想吃 → 换一家</span>
        <span class="like-hint">♡ 想吃这个</span>
      </p>
    </div>

    <!-- 无推荐结果提示 -->
    <el-empty
      v-if="filteredRestaurants.length === 0"
      description="没有找到符合条件的餐厅，换个模式试试吧～"
      :image-size="200"
    >
      <el-button type="primary" @click="resetMode">重置筛选条件</el-button>
    </el-empty>
    <el-dialog
      v-model="mealDialogVisible"
      title="记录用餐"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form :model="mealForm" label-width="84px">
        <el-form-item label="日期">
          <el-date-picker v-model="mealForm.date" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="餐段">
          <el-select v-model="mealForm.mealPeriod" placeholder="请选择餐段">
            <el-option label="早餐" value="breakfast" />
            <el-option label="午餐" value="lunch" />
            <el-option label="晚餐" value="dinner" />
            <el-option label="加餐" value="snack" />
          </el-select>
        </el-form-item>
        <el-form-item label="菜品">
          <el-select
            v-model="mealForm.selectedDishNames"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="可选择或手动输入菜品"
          >
            <el-option
              v-for="dish in currentRestaurantDishes"
              :key="dish.id"
              :label="`${dish.name}（${formatDishCalories(dish)}）`"
              :value="dish.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="热量汇总">
          <div class="meal-total-calories">{{ mealTotalCaloriesText }}</div>
        </el-form-item>
        <el-form-item label="预算支出">
          <el-input-number v-model="mealForm.budget" :min="0" :precision="2" :step="1" />
          <span class="budget-unit">元</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="mealDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmMealRecord">确认记录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Close, Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useRestaurantStore } from '../stores/restaurant';
import { getRestaurants, getRestaurantDishes } from '../api/restaurant';
import storage from '../utils/storage';

const router = useRouter();
const restaurantStore = useRestaurantStore();

const map = ref(null);
const mapError = ref(false);
const mapLoading = ref(false);
const markers = ref([]);
const AMAP_KEY = import.meta.env.VITE_AMAP_KEY || '';
const mealDialogVisible = ref(false);
const currentRestaurantDishes = ref([]);
const mealForm = ref({
  date: new Date().toISOString().slice(0, 10),
  mealPeriod: 'lunch',
  selectedDishNames: [],
  budget: 0
});

// 当前推荐餐厅
const currentRestaurant = computed(() => {
  return restaurantStore.getCurrentRecommendation;
});

// 筛选后的餐厅
const filteredRestaurants = computed(() => {
  return restaurantStore.getFilteredRestaurants;
});

// 当前推荐索引
const currentRecommendIndex = computed(() => {
  return restaurantStore.currentRecommendIndex;
});

const mealTotalCalories = computed(() => {
  return mealForm.value.selectedDishNames.reduce((sum, dishName) => {
    const targetDish = currentRestaurantDishes.value.find(item => item.name === dishName);
    if (targetDish && Number.isFinite(targetDish.caloriesKcal)) {
      return sum + targetDish.caloriesKcal;
    }
    return sum;
  }, 0);
});

const mealTotalCaloriesText = computed(() => {
  if (mealTotalCalories.value <= 0) {
    return '热量待补充';
  }
  return `${Math.round(mealTotalCalories.value)} 千卡`;
});

// 气泡位置（基于地图中心）
const bubblePosition = computed(() => {
  // 气泡显示在地图中上部
  return {
    top: '15%',
    left: '50%',
    transform: 'translateX(-50%)'
  };
});

// 模式变化时重新加载
const onModeChange = () => {
  localStorage.setItem('foodie_mode', restaurantStore.selectMode);
  restaurantStore.resetRecommendation();
  restaurantStore.luckyDrawResult = null;
  centerOnCurrentRestaurant();
};

// 用餐方式变化
const onDiningTypeChange = () => {
  localStorage.setItem('dining_type', restaurantStore.diningType);
};

const onCampusChange = (campus) => {
  restaurantStore.setSelectedCampus(campus || '');
};

const formatSignatureCalories = (restaurant) => {
  if (Number.isFinite(restaurant?.signatureCaloriesKcal)) {
    return `${Math.round(restaurant.signatureCaloriesKcal)} 千卡`;
  }
  return '热量待补充';
};

const formatDishCalories = (dish) => {
  if (Number.isFinite(dish?.caloriesKcal)) {
    return `${Math.round(dish.caloriesKcal)}千卡`;
  }
  return '热量待补充';
};

const getRestaurantCover = (restaurant) => {
  if (!restaurant) return '';
  if (restaurant.coverImage) return restaurant.coverImage;
  if (Array.isArray(restaurant.dishAlbum)) {
    const firstFood = restaurant.dishAlbum.find(item => item.category === 'food');
    if (firstFood?.url) return firstFood.url;
  }
  if (Array.isArray(restaurant.images) && restaurant.images.length > 0) {
    return restaurant.images[0];
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=960&h=640&fm=webp&q=60';
};

const applyForcedRecommendation = () => {
  if (!restaurantStore.forcedRestaurantId) return;
  const matched = restaurantStore.locateRecommendationById(restaurantStore.forcedRestaurantId);
  if (matched) {
    centerOnCurrentRestaurant();
  }
  restaurantStore.setForcedRestaurantId('');
};

// 处理不喜欢
const handleDislike = () => {
  const hasNext = restaurantStore.nextRecommendation();
  if (hasNext) {
    centerOnCurrentRestaurant();
  } else {
    ElMessage.info('已经看完所有推荐啦～');
  }
};

const fetchCurrentRestaurantDishes = async () => {
  if (!currentRestaurant.value?.id) {
    currentRestaurantDishes.value = [];
    return;
  }
  try {
    const res = await getRestaurantDishes(currentRestaurant.value.id);
    if (res.success) {
      currentRestaurantDishes.value = res.data;
    }
  } catch (error) {
    currentRestaurantDishes.value = currentRestaurant.value.recommendedDishes || [];
  }
};

const openMealRecordDialog = async () => {
  if (!currentRestaurant.value) return;
  await fetchCurrentRestaurantDishes();
  mealForm.value = {
    date: new Date().toISOString().slice(0, 10),
    mealPeriod: 'lunch',
    selectedDishNames: currentRestaurantDishes.value.slice(0, 2).map(item => item.name),
    budget: Number(currentRestaurant.value.avgPrice || 0)
  };
  mealDialogVisible.value = true;
};

const confirmMealRecord = () => {
  if (!currentRestaurant.value) return;
  const dishes = mealForm.value.selectedDishNames.map(name => {
    const source = currentRestaurantDishes.value.find(item => item.name === name);
    return {
      name,
      caloriesKcal: Number.isFinite(source?.caloriesKcal) ? Math.round(source.caloriesKcal) : null
    };
  });
  const record = {
    id: `meal_${Date.now()}`,
    restaurantId: currentRestaurant.value.id,
    restaurantName: currentRestaurant.value.name,
    date: mealForm.value.date,
    mealPeriod: mealForm.value.mealPeriod,
    dishes,
    budget: Number(mealForm.value.budget || 0),
    totalCaloriesKcal: mealTotalCalories.value > 0 ? Math.round(mealTotalCalories.value) : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  storage.addMealRecord(record);
  mealDialogVisible.value = false;
  ElMessage.success('已生成用餐记录');
};

// 跳转到详情页
const goToDetail = () => {
  if (currentRestaurant.value) {
    router.push(`/restaurant/${currentRestaurant.value.id}`);
  }
};

// 打开美团（团购或外卖）
const openMeituan = (type) => {
  if (!currentRestaurant.value) return;

  if (type === 'groupbuy') {
    const restaurantName = encodeURIComponent(currentRestaurant.value.name);
    const url = `https://i.meituan.com/search?keyword=${restaurantName}`;
    window.open(url, '_blank');
  } else {
    router.push(`/delivery/${currentRestaurant.value.id}`);
  }
};

// 重置模式
const resetMode = () => {
  restaurantStore.selectMode = 'random';
  restaurantStore.luckyDrawResult = null;
  localStorage.setItem('foodie_mode', 'random');
  restaurantStore.setSelectedCampus('');
};

// 重新加载地图
const reloadMap = () => {
  mapError.value = false;
  setTimeout(initMap, 500);
};

// 地图中心移动到当前餐厅
const centerOnCurrentRestaurant = () => {
  if (!map.value || !currentRestaurant.value) return;

  map.value.panTo([
    currentRestaurant.value.location.lng,
    currentRestaurant.value.location.lat
  ]);
  map.value.setZoom(16);
};

// 初始化地图
const initMap = async () => {
  if (!AMAP_KEY) {
    mapError.value = true;
    ElMessage.error('缺少地图 Key，请在 .env 中配置 VITE_AMAP_KEY');
    return;
  }

  mapLoading.value = true;
  await nextTick(); // 等待 DOM 更新

  if (typeof window.AMap === 'undefined') {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Scale,AMap.ToolBar`;

    script.onload = () => {
      setTimeout(() => {
        mapLoading.value = false;
        createMap();
      }, 500);
    };

    script.onerror = (e) => {
      console.error('高德地图 API 加载失败:', e);
      mapLoading.value = false;
      mapError.value = true;
      ElMessage.error('地图加载失败，可能是 API Key 配置有问题');
    };

    document.head.appendChild(script);
  } else {
    mapLoading.value = false;
    createMap();
  }
};

// 创建地图
const createMap = async () => {
  if (typeof window.AMap === 'undefined') {
    console.error('AMap 未定义');
    mapError.value = true;
    return;
  }

  await nextTick(); // 再次确保 DOM 更新

  try {
    const container = document.getElementById('map-container');
    if (!container) {
      console.error('地图容器不存在，尝试重新获取...');
      // 简单的重试机制
      setTimeout(createMap, 500);
      return;
    }

    // 销毁旧实例（如果存在）
    if (map.value) {
      map.value.destroy();
      map.value = null;
    }

    map.value = new window.AMap.Map('map-container', {
      zoom: 14,
      center: [116.325, 39.99],
      viewMode: '2D',
      resizeEnable: true,
      animateEnable: true
    });

    map.value.addControl(new window.AMap.Scale());
    map.value.addControl(new window.AMap.ToolBar());

    // 添加所有餐厅标记
    addMarkers();

    // 移动到第一家推荐餐厅
    if (currentRestaurant.value) {
      setTimeout(() => centerOnCurrentRestaurant(), 1000);
    }

  } catch (error) {
    console.error('创建地图失败:', error);
    mapLoading.value = false;
    mapError.value = true;
    // 只有非容器错误才显示 Toast，避免打扰用户
    if (!error.message.includes('Map container')) {
      ElMessage.error('地图初始化失败: ' + error.message);
    }
  }
};

onUnmounted(() => {
  if (map.value) {
    map.value.destroy();
    map.value = null;
  }
});

// 添加餐厅标记
const addMarkers = () => {
  if (!map.value) return;

  clearMarkers();

  filteredRestaurants.value.forEach((restaurant, index) => {
    const marker = new window.AMap.Marker({
      position: [restaurant.location.lng, restaurant.location.lat],
      title: restaurant.name,
      content: createMarkerContent(restaurant, index)
    });

    marker.on('click', () => {
      // 点击标记时切换到该餐厅
      restaurantStore.currentRecommendIndex = index;
    });

    map.value.add(marker);
    markers.value.push(marker);
  });
};

const clearMarkers = () => {
  if (!map.value || markers.value.length === 0) return;
  map.value.remove(markers.value);
  markers.value = [];
};

// 创建标记内容
const createMarkerContent = (restaurant, index) => {
  const isCurrent = index === currentRecommendIndex.value;
  return `
    <div class="custom-marker ${isCurrent ? 'active' : ''}">
      <div class="marker-icon">
        <span style="font-size: 20px">🍜</span>
      </div>
      ${isCurrent ? `<div class="marker-label">${restaurant.name.substring(0, 6)}</div>` : ''}
    </div>
  `;
};

// 加载餐厅数据
const loadRestaurants = async () => {
  restaurantStore.loading = true;
  try {
    const res = await getRestaurants();
    if (res.success) {
      restaurantStore.setRestaurants(res.data);
      applyForcedRecommendation();
    }
  } catch (error) {
    console.error('加载餐厅失败:', error);
    ElMessage.error('加载餐厅数据失败');
  } finally {
    restaurantStore.loading = false;
  }
};

// 选择餐厅（用于列表模式）
const selectRestaurant = (restaurant) => {
  restaurantStore.currentRecommendIndex = filteredRestaurants.value.findIndex(r => r.id === restaurant.id);
  ElMessage.success(`已选择：${restaurant.name}`);
};

onMounted(() => {
  loadRestaurants();
  setTimeout(initMap, 500);
});

watch(filteredRestaurants, () => {
  addMarkers();
  centerOnCurrentRestaurant();
  applyForcedRecommendation();
});

watch(currentRestaurant, () => {
  fetchCurrentRestaurantDishes();
});
</script>

<style scoped>
.map-page {
  height: calc(100vh - 64px - 48px); /* 减去header和padding */
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  position: relative;
  overflow: hidden;
}

.top-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 10;
  flex-wrap: wrap;
}

.mode-selector,
.dining-type-selector,
.campus-selector {
  display: flex;
  align-items: center;
}

/* 覆盖 Element Plus Radio Button 样式为美团黄 */
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #FFC300;
  border-color: #FFC300;
  color: #222;
  box-shadow: -1px 0 0 0 #FFC300;
  font-weight: 600;
}

:deep(.el-radio-button__inner:hover) {
  color: #FFC300;
}

.map-container {
  flex: 1;
  position: relative;
  background: #eef1f6;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
}

.map-loading,
.map-fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f8f8f8;
  z-index: 2;
  color: #909399;
}

.map-loading p {
  margin-top: 12px;
  font-size: 14px;
}

.fallback-list {
  margin-top: 24px;
  width: 100%;
  max-width: 500px;
  padding: 0 16px;
  height: 60vh;
  overflow-y: auto;
}

.fallback-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.2s;
}

.fallback-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.item-content {
  display: flex;
  gap: 12px;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
}

.item-info h4 {
  font-size: 16px;
  margin-bottom: 4px;
  color: #303133;
}

.current-tag {
  font-size: 12px;
  background: #FFC300;
  color: #222;
  padding: 2px 4px;
  border-radius: 4px;
  margin-left: 4px;
}

.restaurant-bubble {
  position: absolute;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 300px;
  z-index: 100;
  padding: 16px;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from { transform: translateX(-50%) scale(0.8); opacity: 0; }
  to { transform: translateX(-50%) scale(1); opacity: 1; }
}

.bubble-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.bubble-image {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
}

.bubble-info h3 {
  font-size: 16px;
  margin-bottom: 4px;
  color: #303133;
  font-weight: 600;
}

.bubble-details {
  margin-bottom: 16px;
}

.bubble-details p {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}

.bubble-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.bubble-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.bubble-arrow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: #fff;
  box-shadow: 4px 4px 4px rgba(0,0,0,0.05);
}

.bottom-controls {
  padding: 16px 24px;
  background: #ffffff;
  border-top: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  z-index: 20;
}

.restaurant-count {
  font-size: 13px;
  color: #909399;
  background: #f5f7fa;
  padding: 4px 12px;
  border-radius: 12px;
}

.action-buttons {
  display: flex;
  gap: 40px;
  align-items: center;
}

.action-btn {
  width: 64px;
  height: 64px;
  font-size: 24px;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: none;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn.dislike {
  background: #f2f2f2;
  color: #999;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.action-btn.like {
  background: #FFC300;
  color: #222;
  box-shadow: 0 4px 16px rgba(255, 195, 0, 0.4);
}

.heart-outline {
  font-size: 32px;
  font-weight: bold;
  line-height: 1;
  margin-top: -2px;
}

.hint-text {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 24px;
}

.meal-total-calories {
  font-size: 18px;
  font-weight: bold;
  color: #67c23a;
}

.budget-unit {
  margin-left: 8px;
  color: #606266;
}

/* 自定义标记样式 */
:deep(.custom-marker) {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s;
}

:deep(.marker-icon) {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 3px solid #FFC300;
}

:deep(.custom-marker.active .marker-icon) {
  background: #FFC300;
  border-color: #FFC300;
  transform: scale(1.2);
}

:deep(.marker-label) {
  margin-top: 4px;
  padding: 4px 8px;
  background: #ffffff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  color: #222;
}

@media (max-width: 768px) {
  .map-page {
    height: calc(100vh - 56px); /* 移动端 header 高度 */
  }

  .top-bar {
    padding: 8px 12px;
    gap: 8px;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }
  
  .top-bar::-webkit-scrollbar {
    display: none;
  }

  .restaurant-bubble {
    width: 280px;
    padding: 12px;
  }

  .action-btn {
    width: 56px;
    height: 56px;
  }

  .bottom-controls {
    padding: 12px;
  }
}
</style>
