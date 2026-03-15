<template>
  <div class="favorites">
    <h1 class="page-title">我的收藏</h1>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="6" animated />
    </div>

    <div v-else-if="favoriteRestaurants.length === 0" class="empty">
      <el-empty description="还没有收藏任何餐厅">
        <el-button type="primary" @click="goToHome">去逛逛</el-button>
      </el-empty>
    </div>

    <div v-else class="favorites-grid">
      <el-card
        v-for="restaurant in favoriteRestaurants"
        :key="restaurant.id"
        class="restaurant-card"
        shadow="hover"
        @click="goToDetail(restaurant.id)"
      >
        <div class="card-header">
          <img :src="restaurant.images[0]" :alt="restaurant.name" class="restaurant-image" />
          <el-button
            class="favorite-btn"
            type="danger"
            :icon="StarFilled"
            circle
            @click.stop="removeFavorite(restaurant.id)"
          />
        </div>

        <div class="card-content">
          <h3 class="restaurant-name">{{ restaurant.name }}</h3>
          <div class="restaurant-info">
            <span class="cuisine">{{ restaurant.cuisine }}</span>
            <span class="divider">|</span>
            <span class="price">人均¥{{ restaurant.avgPrice }}</span>
          </div>

          <div class="rating-section">
            <el-rate v-model="restaurant.rating" disabled show-score text-color="#ff9900" />
          </div>

          <div class="tags">
            <el-tag
              v-for="tag in restaurant.tags.slice(0, 2)"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Location, StarFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getRestaurants } from '../api/restaurant';
import { useRestaurantStore } from '../stores/restaurant';

const router = useRouter();
const restaurantStore = useRestaurantStore();

const loading = ref(false);
const restaurants = ref([]);

// 收藏的餐厅列表
const favoriteRestaurants = computed(() => {
  return restaurants.value.filter(r => restaurantStore.isFavorite(r.id));
});

// 加载餐厅列表
const loadRestaurants = async () => {
  loading.value = true;
  try {
    const res = await getRestaurants();
    if (res.success) {
      restaurants.value = res.data;
    }
  } catch (error) {
    console.error('加载餐厅列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 移除收藏
const removeFavorite = (id) => {
  restaurantStore.toggleFavorite(id);
  ElMessage.info('已取消收藏');
};

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/restaurant/${id}`);
};

// 返回首页
const goToHome = () => {
  router.push('/');
};

onMounted(() => {
  loadRestaurants();
});
</script>

<style scoped>
.favorites {
  width: 100%;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #303133;
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

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.restaurant-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.restaurant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.card-header {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.restaurant-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.card-content {
  padding: 16px 0 0 0;
}

.restaurant-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.restaurant-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #909399;
  font-size: 14px;
}

.divider {
  color: #dcdfe6;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.address {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 22px;
  }
}
</style>
