<template>
  <div class="home">
    <!-- 搜索和筛选区 -->
    <div class="search-section">
      <el-card class="search-card">
        <el-form :model="searchForm" inline>
          <el-form-item>
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索餐厅、菜品..."
              clearable
              @clear="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="品类">
            <el-select v-model="searchForm.cuisine" placeholder="选择美食类型" clearable @change="handleSearch">
              <el-option label="全部" value=""></el-option>
              <el-option label="中餐" value="中餐"></el-option>
              <el-option label="西餐" value="西餐"></el-option>
              <el-option label="日韩料理" value="日韩料理"></el-option>
              <el-option label="火锅烧烤" value="火锅烧烤"></el-option>
              <el-option label="奶茶甜点" value="奶茶甜点"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="档次">
            <el-select v-model="searchForm.priceLevel" placeholder="选择价格区间" clearable @change="handleSearch">
              <el-option label="全部" value=""></el-option>
              <el-option label="经济实惠" value="1"></el-option>
              <el-option label="中等" value="2"></el-option>
              <el-option label="较高" value="3"></el-option>
              <el-option label="高档" value="4"></el-option>
              <el-option label="奢华" value="5"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="学校">
            <el-select v-model="searchForm.campus" placeholder="选择所在校区" clearable @change="handleSearch">
              <el-option label="全部学校" value=""></el-option>
              <el-option label="清华大学" value="清华大学"></el-option>
              <el-option label="北京大学" value="北京大学"></el-option>
              <el-option label="中国人民大学" value="中国人民大学"></el-option>
              <el-option label="北京航空航天大学" value="北京航空航天大学"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="meituan-btn" @click="handleSearch">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-button plain class="recommend-btn" @click="goToModeSelect">不想选了，智能推荐</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 餐厅列表 -->
    <div class="content-section">
      <div v-if="loading && visibleRestaurants.length === 0" class="loading">
        <el-skeleton :rows="6" animated />
      </div>

      <div v-else-if="filteredRestaurants.length === 0" class="empty">
        <el-empty description="暂无符合条件的餐厅" />
      </div>

      <div v-else>
        <div class="restaurant-grid">
          <el-card
            v-for="restaurant in visibleRestaurants"
            :key="restaurant.id"
            class="restaurant-card"
            shadow="hover"
            @click="goToDetail(restaurant.id)"
          >
            <div class="card-header">
              <img :src="getFoodCover(restaurant)" :alt="restaurant.name" class="restaurant-image" />
              <el-button
                class="favorite-btn"
                :type="isFavorite(restaurant.id) ? 'danger' : 'default'"
                :icon="isFavorite(restaurant.id) ? StarFilled : Star"
                circle
                @click.stop="toggleFavorite(restaurant.id)"
              />
            </div>

            <div class="card-content">
              <h3 class="restaurant-name">{{ restaurant.name }}</h3>
              <div class="restaurant-info">
                <span class="cuisine">{{ restaurant.cuisine }}</span>
                <span class="divider">|</span>
                <span class="price">人均¥{{ restaurant.avgPrice }}</span>
                <span class="divider">|</span>
                <span class="campus">{{ restaurant.campus }}</span>
                <span v-if="restaurant.distanceKm !== undefined" class="divider">|</span>
                <span v-if="restaurant.distanceKm !== undefined" class="distance">直线{{ restaurant.distanceKm.toFixed(2) }}km</span>
              </div>

              <div class="rating-section">
                <el-rate v-model="restaurant.rating" disabled show-score text-color="#ff9900" />
                <span class="review-count">{{ restaurant.reviewCount }}条评价</span>
              </div>
              <p class="calorie-line">主打热量：{{ formatSignatureCalories(restaurant) }}</p>

              <div class="tags">
                <el-tag
                  v-for="tag in restaurant.tags.slice(0, 3)"
                  :key="tag"
                  size="small"
                  type="info"
                >
                  {{ tag }}
                </el-tag>
              </div>

              <p class="address">
                <el-icon><Location /></el-icon>
                {{ restaurant.address }}
              </p>
            </div>
          </el-card>
        </div>
        <div v-if="canLoadMore" class="load-more">
          <el-icon v-if="loading" class="is-loading"><Loading /></el-icon>
          <p v-else>下拉加载更多...</p>
        </div>
        <div v-else class="load-more">
          <p>已经到底啦～</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Location, Star, StarFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getRestaurants, searchRestaurants } from '../api/restaurant';
import { useRestaurantStore } from '../stores/restaurant';
import { RECOMMEND_STORES } from '../data/recommendationData';

const router = useRouter();
const restaurantStore = useRestaurantStore();

const searchForm = ref({
  keyword: '',
  cuisine: '',
  priceLevel: '',
  campus: localStorage.getItem('selected_campus') || ''
});

const loading = ref(false);
const restaurants = ref([]);
const visibleCount = ref(20);
const INITIAL_VISIBLE_COUNT = 20;
const LOAD_STEP = 15;
const CAMPUS_COORDS = {
  '清华大学': { lng: 116.3269, lat: 40.0031 },
  '北京大学': { lng: 116.3105, lat: 39.9928 },
  '中国人民大学': { lng: 116.3164, lat: 39.9689 },
  '北京航空航天大学': { lng: 116.3520, lat: 39.9929 }
};
const FOOD_IMAGE_KEYWORDS = {
  '中餐': [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '西餐': [
    'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '日韩料理': [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1563612116625-3012372fccce?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '火锅烧烤': [
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '奶茶甜点': [
    'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1080&h=720&q=80'
  ]
};

// 筛选后的餐厅列表
const filteredRestaurants = computed(() => restaurants.value);
const visibleRestaurants = computed(() => filteredRestaurants.value.slice(0, visibleCount.value));
const canLoadMore = computed(() => visibleCount.value < filteredRestaurants.value.length);

const getFoodCover = (restaurant) => {
  if (restaurant.coverImage) {
    return restaurant.coverImage;
  }
  if (Array.isArray(restaurant.dishAlbum)) {
    const firstFood = restaurant.dishAlbum.find(item => item.category === 'food');
    if (firstFood?.url) {
      return firstFood.url;
    }
  }
  const imagePool = FOOD_IMAGE_KEYWORDS[restaurant.cuisine] || FOOD_IMAGE_KEYWORDS['中餐'];
  const lockSeed = Number(restaurant.id) || restaurant.name.length || 1;
  return imagePool[lockSeed % imagePool.length];
};

const formatSignatureCalories = (restaurant) => {
  if (Number.isFinite(restaurant.signatureCaloriesKcal)) {
    return `${Math.round(restaurant.signatureCaloriesKcal)} 千卡`;
  }
  return '热量待补充';
};

const resetVisibleCount = () => {
  visibleCount.value = INITIAL_VISIBLE_COUNT;
};

const loadMore = () => {
  visibleCount.value = Math.min(visibleCount.value + LOAD_STEP, filteredRestaurants.value.length);
};

const handleScrollLoadMore = () => {
  const reachBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 120;
  if (reachBottom && canLoadMore.value && !loading.value) {
    loadMore();
  }
};

const normalizePriceLevel = (avgPrice) => {
  if (avgPrice <= 25) return 1;
  if (avgPrice <= 45) return 2;
  if (avgPrice <= 65) return 3;
  if (avgPrice <= 90) return 4;
  return 5;
};

const randomOffset = (seed, base) => {
  const value = ((seed * 17) % 1000) / 1000;
  return base + (value - 0.5) * 0.02;
};

const buildExpandedRestaurants = (baseList) => {
  if (baseList.length >= 30) {
    return baseList;
  }

  const generated = RECOMMEND_STORES.map((store, index) => {
    const campusPoint = CAMPUS_COORDS[store.campus] || CAMPUS_COORDS['清华大学'];
    return {
      id: `auto_${store.id}`,
      name: store.name,
      cuisine: store.category,
      avgPrice: store.avgPrice,
      rating: store.rating,
      reviewCount: 30 + (index % 80),
      priceLevel: normalizePriceLevel(store.avgPrice),
      campus: store.campus,
      coverImage: store.coverImages[0],
      tags: store.categoryTags,
      signatureCaloriesKcal: store.caloriesKcal,
      address: `${store.campus}商圈${(index % 8) + 1}号`,
      location: {
        lng: randomOffset(index + 1, campusPoint.lng),
        lat: randomOffset(index + 7, campusPoint.lat)
      },
      dishAlbum: store.coverImages.map((url, imageIndex) => ({
        id: `album_${store.id}_${imageIndex + 1}`,
        url,
        category: 'food'
      }))
    };
  });

  const merged = [...baseList, ...generated];
  const map = new Map();
  merged.forEach(item => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values()).slice(0, 50);
};

const assignRestaurants = (list, { expand } = { expand: false }) => {
  const nextList = expand ? buildExpandedRestaurants(list) : list;
  restaurants.value = nextList;
  restaurantStore.setRestaurants(nextList);
  resetVisibleCount();
};

const toRadians = (value) => (value * Math.PI) / 180;

const getDistanceKm = (pointA, pointB) => {
  const earthRadius = 6371;
  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);
  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);
  const haversine = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const getUserLocation = async () => {
  if (!navigator.geolocation) {
    return null;
  }
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lng: position.coords.longitude,
          lat: position.coords.latitude
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: 2500,
        maximumAge: 300000
      }
    );
  });
};

const applyCampusRadiusFilter = async (list) => {
  if (!searchForm.value.campus) {
    return list;
  }

  const schoolPoint = CAMPUS_COORDS[searchForm.value.campus];
  if (!schoolPoint) {
    return list;
  }

  const userPoint = await getUserLocation();
  const centerPoint = userPoint || schoolPoint;

  return list
    .filter(item => item.location && Number.isFinite(item.location.lat) && Number.isFinite(item.location.lng))
    .map(item => {
      const distanceKm = getDistanceKm(centerPoint, {
        lng: item.location.lng,
        lat: item.location.lat
      });
      return {
        ...item,
        distanceKm
      };
    })
    .filter(item => item.distanceKm <= 3)
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

// 加载餐厅列表
const loadRestaurants = async () => {
  loading.value = true;
  try {
    const res = await getRestaurants();
    if (res.success) {
      assignRestaurants(res.data, { expand: true });
    }
  } catch (error) {
    console.error('加载餐厅列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = async () => {
  loading.value = true;
  try {
    const params = {};
    if (searchForm.value.keyword) params.keyword = searchForm.value.keyword;
    if (searchForm.value.cuisine) params.cuisine = searchForm.value.cuisine;
    if (searchForm.value.priceLevel) params.priceLevel = searchForm.value.priceLevel;
    if (searchForm.value.campus) params.campus = searchForm.value.campus;

    if (Object.keys(params).length > 0) {
      const res = await searchRestaurants(params);
      if (res.success) {
        const radiusFiltered = await applyCampusRadiusFilter(res.data);
        assignRestaurants(radiusFiltered, { expand: false });
        restaurantStore.setSelectedCampus(searchForm.value.campus || '');
      }
    } else {
      const res = await getRestaurants();
      if (res.success) {
        const radiusFiltered = await applyCampusRadiusFilter(res.data);
        assignRestaurants(radiusFiltered, { expand: true });
      }
      restaurantStore.setSelectedCampus('');
    }
  } catch (error) {
    console.error('搜索失败:', error);
  } finally {
    loading.value = false;
  }
};

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/restaurant/${id}`);
};

const goToModeSelect = () => {
  router.push('/mode');
};

// 切换收藏
const toggleFavorite = (id) => {
  restaurantStore.toggleFavorite(id);
  const isFav = restaurantStore.isFavorite(id);
  ElMessage({
    message: isFav ? '已添加到收藏' : '已取消收藏',
    type: isFav ? 'success' : 'info'
  });
};

// 检查是否收藏
const isFavorite = (id) => {
  return restaurantStore.isFavorite(id);
};

onMounted(() => {
  window.addEventListener('scroll', handleScrollLoadMore, { passive: true });
  if (searchForm.value.campus) {
    handleSearch();
    return;
  }
  loadRestaurants();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScrollLoadMore);
});
</script>

<style scoped>
.home {
  width: 100%;
}

.search-section {
  margin-bottom: 24px;
}

.search-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  background: #ffffff;
}

/* 美团风格按钮 */
.meituan-btn {
  background-color: #FFC300;
  border-color: #FFC300;
  color: #222;
  font-weight: 700;
  transition: all 0.2s;
}

.meituan-btn:hover,
.meituan-btn:focus {
  background-color: #FFD000;
  border-color: #FFD000;
  transform: translateY(-1px);
}

.recommend-btn {
  color: #555;
  border-color: #e4e7ed;
  font-weight: 500;
}

.recommend-btn:hover {
  color: #FFC300;
  border-color: #FFC300;
  background-color: #fffcf5;
}

.content-section {
  min-height: 400px;
}

.load-more {
  text-align: center;
  margin-top: 24px;
  padding-bottom: 24px;
  color: #909399;
}

.load-more p {
  margin-top: 8px;
  font-size: 13px;
}

.loading {
  padding: 20px;
}

.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.restaurant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.restaurant-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.restaurant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  position: relative;
  width: 100%;
  padding-top: 60%; /* 16:9 Aspect Ratio */
  overflow: hidden;
}

.restaurant-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.restaurant-card:hover .restaurant-image {
  transform: scale(1.05);
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-content {
  padding: 16px;
}

.restaurant-name {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #222;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.restaurant-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
  color: #666;
  font-size: 13px;
}

.divider {
  color: #eee;
  font-size: 12px;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.review-count {
  color: #999;
  font-size: 12px;
}

.campus {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.distance {
  color: #666;
  font-size: 12px;
}

.calorie-line {
  color: #67c23a;
  font-size: 12px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.calorie-line::before {
  content: '🔥';
  font-size: 12px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.address {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .search-card :deep(.el-form) {
    display: flex;
    flex-direction: column;
  }

  .search-card :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 12px;
    width: 100%;
  }

  .search-card :deep(.el-form-item__content),
  .search-card :deep(.el-select),
  .search-card :deep(.el-input) {
    width: 100%;
  }

  .meituan-btn,
  .recommend-btn {
    width: 100%;
  }

  .restaurant-grid {
    grid-template-columns: 1fr; /* 单列布局 */
    gap: 16px;
  }
  
  .restaurant-card {
    display: flex; /* 改为左图右文布局 */
    flex-direction: row;
    height: 120px;
    border-radius: 8px;
    padding: 10px;
    align-items: center;
  }

  .card-header {
    width: 100px;
    height: 100px;
    padding-top: 0;
    flex-shrink: 0;
    border-radius: 6px;
    margin-right: 12px;
  }
  
  .restaurant-image {
    position: relative;
    border-radius: 6px;
  }
  
  .favorite-btn {
    display: none; /* 移动端列表简化，隐藏收藏按钮或移位置 */
  }

  .card-content {
    padding: 0;
    flex: 1;
    min-width: 0; /* 防止文本溢出 */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .restaurant-name {
    font-size: 16px;
    margin-bottom: 4px;
  }

  .restaurant-info {
    margin-bottom: 4px;
  }
  
  .rating-section {
    margin-bottom: 4px;
  }
  
  .tags, .address {
    display: none; /* 移动端简化信息 */
  }
  
  .calorie-line {
    margin-bottom: 0;
  }
}
</style>
