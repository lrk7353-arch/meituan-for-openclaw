<template>
  <el-card
    class="restaurant-card"
    shadow="hover"
    @click="handleClick"
  >
    <div class="card-header">
      <img :src="restaurant.images[0]" :alt="restaurant.name" class="restaurant-image" />
      <el-button
        class="favorite-btn"
        :type="isFavorite ? 'danger' : 'default'"
        :icon="isFavorite ? StarFilled : Star"
        circle
        @click.stop="toggleFavorite"
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
        <span class="review-count">{{ restaurant.reviewCount }}条评价</span>
      </div>

      <div class="tags">
        <el-tag
          v-for="tag in displayTags"
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
</template>

<script setup>
import { computed } from 'vue';
import { Location, Star, StarFilled } from '@element-plus/icons-vue';
import { useRestaurantStore } from '../stores/restaurant';

const props = defineProps({
  restaurant: {
    type: Object,
    required: true
  },
  maxTags: {
    type: Number,
    default: 3
  }
});

const emit = defineEmits(['click', 'favorite']);

const restaurantStore = useRestaurantStore();

// 是否收藏
const isFavorite = computed(() => {
  return restaurantStore.isFavorite(props.restaurant.id);
});

// 显示的标签
const displayTags = computed(() => {
  return props.restaurant.tags.slice(0, props.maxTags);
});

// 点击卡片
const handleClick = () => {
  emit('click', props.restaurant.id);
};

// 切换收藏
const toggleFavorite = () => {
  const result = restaurantStore.toggleFavorite(props.restaurant.id);
  emit('favorite', props.restaurant.id, result);
};
</script>

<style scoped>
.restaurant-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
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

.review-count {
  color: #909399;
  font-size: 13px;
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
  .card-header {
    height: 180px;
  }

  .restaurant-name {
    font-size: 16px;
  }
}
</style>
