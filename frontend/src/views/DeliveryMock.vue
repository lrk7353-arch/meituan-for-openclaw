<template>
  <div class="delivery-page" v-loading="loading">
    <div class="shop-header">
      <img :src="coverImage" :alt="restaurant.name || '店铺封面'" class="shop-cover">
      <div class="shop-info">
        <h1>{{ restaurant.name || '外卖门店' }}</h1>
        <p>{{ restaurant.cuisine }} · 配送约{{ etaMinutes }}分钟</p>
        <p>满{{ couponThreshold }}减{{ couponDiscount }} · 新客立减{{ newUserDiscount }}</p>
      </div>
    </div>

    <div class="content">
      <aside class="category-list">
        <button
          v-for="category in categories"
          :key="category"
          class="category-item"
          :class="{ active: activeCategory === category }"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </aside>

      <section class="menu-list">
        <div
          v-for="dish in visibleDishes"
          :key="dish.id"
          class="dish-card"
        >
          <img :src="dish.image" :alt="dish.name" class="dish-image">
          <div class="dish-info">
            <h3>{{ dish.name }}</h3>
            <p>{{ formatCalories(dish) }}</p>
            <p class="dish-price">¥{{ dish.price }}</p>
          </div>
          <el-button type="primary" plain size="small" @click="addToCart(dish)">加入购物车</el-button>
        </div>
      </section>
    </div>

    <div class="cart-bar">
      <div class="cart-summary">
        <p>已选 {{ cartCount }} 件 · 合计 ¥{{ cartTotal.toFixed(2) }}</p>
        <p>优惠后 ¥{{ discountedTotal.toFixed(2) }}</p>
      </div>
      <el-button type="danger" size="large" :disabled="cartCount === 0">去结算</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getRestaurantDetail } from '../api/restaurant';

const route = useRoute();
const loading = ref(false);
const restaurant = ref({
  name: '',
  cuisine: '',
  avgPrice: 0,
  recommendedDishes: [],
  dishAlbum: []
});
const activeCategory = ref('招牌推荐');
const cartItems = ref([]);

const couponThreshold = 50;
const couponDiscount = 10;
const newUserDiscount = 6;
const etaMinutes = computed(() => 20 + (Number(route.params.id || 1) % 10));

const coverImage = computed(() => {
  const foodFromAlbum = restaurant.value.dishAlbum?.find(item => item.category === 'food');
  if (foodFromAlbum?.url) return foodFromAlbum.url;
  if (restaurant.value.coverImage) return restaurant.value.coverImage;
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=960&h=640&fm=webp&q=60';
});

const categories = computed(() => ['招牌推荐', '热销菜品', '优惠套餐']);

const visibleDishes = computed(() => {
  const dishes = restaurant.value.recommendedDishes || [];
  if (dishes.length === 0) return [];
  if (activeCategory.value === '热销菜品') {
    return dishes.slice().reverse();
  }
  if (activeCategory.value === '优惠套餐') {
    return dishes.map(dish => ({
      ...dish,
      id: `${dish.id}_set`,
      name: `${dish.name}套餐`,
      price: Math.max(1, Number(dish.price || 0) + 8)
    }));
  }
  return dishes;
});

const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.count, 0));
const cartTotal = computed(() => cartItems.value.reduce((sum, item) => sum + item.count * item.price, 0));
const discountedTotal = computed(() => {
  let total = cartTotal.value;
  if (total >= couponThreshold) {
    total -= couponDiscount;
  }
  if (total > 0) {
    total -= newUserDiscount;
  }
  return Math.max(0, total);
});

const formatCalories = (dish) => {
  if (Number.isFinite(dish.caloriesKcal)) {
    return `${Math.round(dish.caloriesKcal)} 千卡`;
  }
  return '热量待补充';
};

const addToCart = (dish) => {
  const found = cartItems.value.find(item => item.id === dish.id);
  if (found) {
    found.count += 1;
  } else {
    cartItems.value.push({
      id: dish.id,
      name: dish.name,
      price: Number(dish.price || 0),
      count: 1
    });
  }
  ElMessage.success(`${dish.name} 已加入购物车`);
};

const loadRestaurant = async () => {
  loading.value = true;
  try {
    const res = await getRestaurantDetail(route.params.id);
    if (res.success) {
      restaurant.value = res.data;
      if (!restaurant.value.recommendedDishes || restaurant.value.recommendedDishes.length === 0) {
        restaurant.value.recommendedDishes = [
          { id: 'mock_1', name: '招牌套餐', price: 39, caloriesKcal: 680, image: coverImage.value }
        ];
      }
    }
  } catch (error) {
    ElMessage.error('加载外卖门店失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRestaurant();
});
</script>

<style scoped>
.delivery-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
}

.shop-header {
  display: flex;
  gap: 16px;
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
}

.shop-cover {
  width: 240px;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
}

.shop-info h1 {
  font-size: 24px;
  margin-bottom: 8px;
}

.shop-info p {
  color: #606266;
  margin: 4px 0;
}

.content {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px;
}

.category-list {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  border: none;
  background: #f5f7fa;
  border-radius: 10px;
  padding: 10px;
  text-align: left;
  cursor: pointer;
}

.category-item.active {
  background: #ffe2e2;
  color: #ff4c4c;
  font-weight: 600;
}

.menu-list {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dish-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 10px;
}

.dish-image {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.dish-info {
  flex: 1;
}

.dish-info h3 {
  font-size: 16px;
  margin-bottom: 6px;
}

.dish-info p {
  color: #606266;
  margin: 2px 0;
}

.dish-price {
  color: #ff4c4c !important;
  font-weight: 700;
}

.cart-bar {
  margin-top: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-summary p {
  margin: 2px 0;
  color: #303133;
}

@media (max-width: 900px) {
  .content {
    grid-template-columns: 1fr;
  }

  .shop-header {
    flex-direction: column;
  }

  .shop-cover {
    width: 100%;
    height: 180px;
  }
}
</style>
