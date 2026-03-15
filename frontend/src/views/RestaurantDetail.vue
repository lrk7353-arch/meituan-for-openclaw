<template>
  <div class="detail" v-if="restaurant">
    <!-- 返回按钮 -->
    <el-button @click="goBack" class="back-btn" icon="ArrowLeft">返回</el-button>

    <!-- 头部信息 -->
    <el-card class="header-card" shadow="never">
      <div class="header-content">
        <div class="left">
          <h1>{{ restaurant.name }}</h1>
          <div class="basic-info">
            <el-tag type="info">{{ restaurant.cuisine }}</el-tag>
            <span class="divider">|</span>
            <span>人均消费 ¥{{ restaurant.avgPrice }}</span>
            <span class="divider">|</span>
            <span>营业时间：{{ restaurant.businessHours }}</span>
          </div>
          <div class="tags">
            <el-tag
              v-for="tag in restaurant.tags"
              :key="tag"
              size="small"
              type="success"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <div class="right">
          <div class="rating-box">
            <div class="rating">{{ restaurant.rating }}</div>
            <el-rate v-model="restaurant.rating" disabled show-score text-color="#ff9900" />
            <span class="review-count">{{ restaurant.reviewCount }}条评价</span>
          </div>
          <el-button
            :type="isFavorite ? 'danger' : 'default'"
            @click="toggleFavorite"
            :icon="isFavorite ? StarFilled : Star"
            size="large"
          >
            {{ isFavorite ? '已收藏' : '收藏' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 图片展示 -->
    <el-card class="images-card" v-if="displayAlbum.length > 0">
      <el-carousel :interval="4000" type="card" height="400px">
        <el-carousel-item v-for="(image, index) in displayAlbum" :key="index">
          <img :src="image" :alt="`${restaurant.name}图片${index + 1}`" class="carousel-image" />
        </el-carousel-item>
      </el-carousel>
    </el-card>

    <!-- 详细信息 -->
    <el-row :gutter="24" class="detail-row">
      <!-- 左侧内容 -->
      <el-col :span="16" class="left-col">
        <!-- 推荐菜品 -->
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <el-icon><Cherry /></el-icon>
              <span>推荐菜品</span>
            </div>
          </template>
          <div class="dishes-list">
            <div v-for="dish in restaurant.recommendedDishes" :key="dish.name" class="dish-item">
              <div class="dish-name">{{ dish.name }}</div>
              <div class="dish-price">¥{{ dish.price }}</div>
              <div class="dish-calorie">{{ formatDishCalories(dish) }}</div>
            </div>
          </div>
        </el-card>

        <!-- 用户评价 -->
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <el-icon><ChatDotRound /></el-icon>
              <span>用户评价</span>
            </div>
          </template>

          <div v-if="loading" class="loading">
            <el-skeleton :rows="4" animated />
          </div>

          <div v-else-if="reviews.length === 0" class="empty">
            <el-empty description="暂无评价，快来抢沙发吧！" />
          </div>

          <div v-else class="reviews-list">
            <div v-for="review in reviews" :key="review.id" class="review-item">
              <div class="review-header">
                <img :src="review.avatar" :alt="review.userName" class="user-avatar" />
                <div class="user-info">
                  <div class="user-name">{{ review.userName }}</div>
                  <div class="review-time">{{ formatTime(review.timestamp) }}</div>
                </div>
                <el-rate v-model="review.rating" disabled size="small" />
              </div>
              <div class="review-content">{{ review.content }}</div>
              <div class="review-images" v-if="review.images && review.images.length > 0">
                <img
                  v-for="(img, index) in review.images.slice(0, 3)"
                  :key="index"
                  :src="img"
                  :alt="`评价图片${index + 1}`"
                  class="review-image"
                />
              </div>
              <div class="review-footer">
                <el-button
                  type="primary"
                  link
                  :icon="CaretTop"
                  @click="handleLikeReview(review.id)"
                >
                  {{ review.likes }} 赞
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧信息 -->
      <el-col :span="8" class="right-col">
        <!-- 联系信息 -->
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <el-icon><InfoFilled /></el-icon>
              <span>餐厅信息</span>
            </div>
          </template>
          <div class="info-list">
            <div class="info-item">
              <span class="label">地址：</span>
              <span class="value">{{ restaurant.address }}</span>
            </div>
            <div class="info-item">
              <span class="label">电话：</span>
              <span class="value">{{ restaurant.phone }}</span>
            </div>
            <div class="info-item">
              <span class="label">营业时间：</span>
              <span class="value">{{ restaurant.businessHours }}</span>
            </div>
            <div class="info-item">
              <span class="label">人均消费：</span>
              <span class="value">¥{{ restaurant.avgPrice }}</span>
            </div>
          </div>
        </el-card>

        <!-- 添加评价 -->
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <el-icon><EditPen /></el-icon>
              <span>写评价</span>
            </div>
          </template>
          <el-form :model="reviewForm" label-width="0">
            <el-form-item>
              <el-rate v-model="reviewForm.rating" show-text />
            </el-form-item>
            <el-form-item>
              <el-input
                v-model="reviewForm.content"
                type="textarea"
                :rows="4"
                placeholder="分享你的用餐体验..."
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitReview" :loading="submitting">
                提交评价
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>

  <div v-else class="loading">
    <el-skeleton :rows="10" animated />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Cherry,
  ChatDotRound,
  InfoFilled,
  EditPen,
  CaretTop,
  Star,
  StarFilled
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getRestaurantDetail, getReviews, addReview, likeReview } from '../api/restaurant';
import { useRestaurantStore } from '../stores/restaurant';
import storage from '../utils/storage';

const route = useRoute();
const router = useRouter();
const restaurantStore = useRestaurantStore();

const restaurant = ref(null);
const reviews = ref([]);
const loading = ref(false);
const submitting = ref(false);

const reviewForm = ref({
  rating: 5,
  content: ''
});

const displayAlbum = computed(() => {
  if (!restaurant.value) return [];
  if (Array.isArray(restaurant.value.dishAlbum) && restaurant.value.dishAlbum.length > 0) {
    return restaurant.value.dishAlbum
      .filter(item => item.category === 'food')
      .map(item => item.url);
  }
  if (Array.isArray(restaurant.value.images)) {
    return restaurant.value.images;
  }
  return [];
});

// 是否收藏
const isFavorite = computed(() => {
  return restaurantStore.isFavorite(route.params.id);
});

// 加载餐厅详情
const loadRestaurantDetail = async () => {
  loading.value = true;
  try {
    const res = await getRestaurantDetail(route.params.id);
    if (res.success) {
      restaurant.value = res.data;
      restaurantStore.setCurrentRestaurant(res.data);
      storage.addBrowseHistory({
        id: res.data.id,
        name: res.data.name,
        campus: res.data.campus || '',
        cuisine: res.data.cuisine,
        avgPrice: res.data.avgPrice,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('加载餐厅详情失败:', error);
  } finally {
    loading.value = false;
  }
};

// 加载评价
const loadReviews = async () => {
  try {
    const res = await getReviews(route.params.id);
    if (res.success) {
      reviews.value = res.data;
    }
  } catch (error) {
    console.error('加载评价失败:', error);
  }
};

// 切换收藏
const toggleFavorite = () => {
  restaurantStore.toggleFavorite(route.params.id);
  ElMessage({
    message: isFavorite.value ? '已添加到收藏' : '已取消收藏',
    type: isFavorite.value ? 'success' : 'info'
  });
};

const formatDishCalories = (dish) => {
  if (Number.isFinite(dish?.caloriesKcal)) {
    return `${Math.round(dish.caloriesKcal)} 千卡`;
  }
  return '热量待补充';
};

// 提交评价
const submitReview = async () => {
  if (!reviewForm.value.content.trim()) {
    ElMessage.warning('请输入评价内容');
    return;
  }

  submitting.value = true;
  try {
    const data = {
      restaurantId: route.params.id,
      userId: 'current_user',
      userName: '我',
      rating: reviewForm.value.rating,
      content: reviewForm.value.content
    };

    const res = await addReview(data);
    if (res.success) {
      ElMessage.success('评价提交成功！');
      storage.addMyReview({
        restaurantId: route.params.id,
        restaurantName: restaurant.value?.name || '',
        rating: reviewForm.value.rating,
        content: reviewForm.value.content,
        timestamp: new Date().toISOString()
      });
      reviewForm.value.content = '';
      reviewForm.value.rating = 5;
      await loadReviews();
      await loadRestaurantDetail();
    }
  } catch (error) {
    console.error('提交评价失败:', error);
  } finally {
    submitting.value = false;
  }
};

// 点赞评价
const handleLikeReview = async (reviewId) => {
  try {
    const res = await likeReview(reviewId);
    if (res.success) {
      const review = reviews.value.find(r => r.id === reviewId);
      if (review) {
        review.likes = res.data.likes;
      }
    }
  } catch (error) {
    console.error('点赞失败:', error);
  }
};

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`;

  return date.toLocaleDateString('zh-CN');
};

// 返回
const goBack = () => {
  router.back();
};

onMounted(() => {
  loadRestaurantDetail();
  loadReviews();
});
</script>

<style scoped>
.detail {
  width: 100%;
  padding-bottom: 40px;
}

.back-btn {
  margin-bottom: 16px;
}

.header-card {
  margin-bottom: 24px;
  border-radius: 12px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.left h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #303133;
}

.basic-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.right {
  text-align: right;
}

.rating-box {
  margin-bottom: 16px;
}

.rating {
  font-size: 36px;
  font-weight: bold;
  color: #ff6b6b;
}

.review-count {
  color: #909399;
  font-size: 13px;
  margin-left: 8px;
}

.images-card {
  margin-bottom: 24px;
  border-radius: 12px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.detail-row {
  margin-bottom: 24px;
}

.content-card {
  margin-bottom: 24px;
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.dishes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dish-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.dish-name {
  font-weight: 500;
  flex: 1;
}

.dish-price {
  color: #ff6b6b;
  font-weight: 600;
}

.dish-calorie {
  color: #409eff;
  font-size: 13px;
  min-width: 88px;
  text-align: right;
}

.loading {
  padding: 20px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #303133;
}

.review-time {
  font-size: 12px;
  color: #909399;
}

.review-content {
  margin-bottom: 12px;
  line-height: 1.6;
  color: #606266;
}

.review-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.review-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.review-footer {
  text-align: right;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.label {
  color: #909399;
  min-width: 70px;
}

.value {
  color: #303133;
  flex: 1;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .right {
    text-align: left;
    width: 100%;
  }

  .detail-row .left-col {
    margin-bottom: 24px;
  }
}
</style>
