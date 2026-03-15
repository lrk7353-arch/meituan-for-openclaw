const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// 数据文件路径
const RESTAURANTS_FILE = path.join(__dirname, '../data/restaurants.json');
const FOOD_PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=960&h=640&fm=webp&q=60';

// 12张各具特色的美食实拍图（去重）
const FIXED_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1080&h=720&q=80', // 烤肉
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1080&h=720&q=80', // 中餐
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1080&h=720&q=80', // 日料
  'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=1080&h=720&q=80', // 奶茶
  'https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=1080&h=720&q=80', // 麻辣香锅
  'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1080&h=720&q=80', // 西餐
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1080&h=720&q=80', // 面食
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1080&h=720&q=80', // 炸鸡
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1080&h=720&q=80', // 沙拉
  'https://images.unsplash.com/photo-1488477304112-4944851de03d?auto=format&fit=crop&w=1080&h=720&q=80', // 甜品
  'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1080&h=720&q=80', // 小吃
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1080&h=720&q=80'  // 韩餐
];

const DISH_CALORIE_RULES = [
  { keyword: '沙拉', kcal: 320 },
  { keyword: '鸡胸', kcal: 360 },
  { keyword: '寿司', kcal: 420 },
  { keyword: '刺身', kcal: 280 },
  { keyword: '火锅', kcal: 640 },
  { keyword: '香锅', kcal: 760 },
  { keyword: '奶茶', kcal: 380 },
  { keyword: '蛋糕', kcal: 460 },
  { keyword: '牛排', kcal: 690 },
  { keyword: '面', kcal: 540 },
  { keyword: '炸鸡', kcal: 680 },
  { keyword: '烤', kcal: 620 },
  { keyword: '甜', kcal: 420 }
];

// 读取餐厅数据
async function getRestaurants() {
  const data = await fs.readFile(RESTAURANTS_FILE, 'utf8');
  const restaurants = JSON.parse(data);
  return restaurants.map((restaurant, index) => ({
    ...restaurant,
    campus: restaurant.campus || inferCampus(restaurant),
    recommendedDishes: normalizeDishes(restaurant.recommendedDishes || []),
    dishAlbum: normalizeDishAlbum(restaurant),
    coverImage: FIXED_COVER_IMAGES[index % FIXED_COVER_IMAGES.length] || pickFoodCoverImage(restaurant),
    signatureCaloriesKcal: inferSignatureCalories(restaurant.recommendedDishes || [])
  }));
}

function inferCaloriesByName(dishName) {
  const matched = DISH_CALORIE_RULES.find(rule => dishName.includes(rule.keyword));
  return matched ? matched.kcal : null;
}

function normalizeDishes(dishes) {
  return dishes.map((dish, index) => {
    const caloriesKcal = Number.isFinite(dish.caloriesKcal) ? dish.caloriesKcal : inferCaloriesByName(dish.name);
    return {
      id: dish.id || `dish_${index + 1}`,
      name: dish.name,
      price: dish.price,
      caloriesKcal: Number.isFinite(caloriesKcal) ? Math.round(caloriesKcal) : null,
      caloriesSource: Number.isFinite(dish.caloriesKcal) ? 'database' : 'pending',
      image: dish.image || FOOD_PLACEHOLDER_IMAGE
    };
  });
}

function normalizeDishAlbum(restaurant) {
  const baseImages = Array.isArray(restaurant.images) ? restaurant.images : [];
  const dishes = normalizeDishes(restaurant.recommendedDishes || []);
  const fromDishes = dishes.map((dish, index) => ({
    id: `album_dish_${index + 1}`,
    url: dish.image || baseImages[index] || FOOD_PLACEHOLDER_IMAGE,
    category: 'food'
  }));
  if (fromDishes.length > 0) {
    return fromDishes;
  }
  return baseImages.map((url, index) => ({
    id: `album_default_${index + 1}`,
    url,
    category: 'food'
  }));
}

function pickFoodCoverImage(restaurant) {
  const dishAlbum = normalizeDishAlbum(restaurant);
  const found = dishAlbum.find(item => item.category === 'food');
  return found?.url || FOOD_PLACEHOLDER_IMAGE;
}

function inferSignatureCalories(dishes) {
  const normalized = normalizeDishes(dishes);
  const firstWithCalories = normalized.find(dish => Number.isFinite(dish.caloriesKcal));
  return firstWithCalories ? firstWithCalories.caloriesKcal : null;
}

function inferCampus(restaurant) {
  const text = `${restaurant.name || ''} ${restaurant.address || ''}`;

  if (text.includes('清华')) return '清华大学';
  if (text.includes('北大')) return '北京大学';
  if (text.includes('人大')) return '中国人民大学';
  if (text.includes('学院路')) return '北京航空航天大学';

  return '中关村大学城';
}

// 获取所有餐厅
router.get('/', async (req, res) => {
  try {
    const restaurants = await getRestaurants();
    res.json({
      success: true,
      data: restaurants,
      total: restaurants.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取餐厅列表失败'
    });
  }
});

// 搜索餐厅
router.get('/search', async (req, res) => {
  try {
    const { keyword, cuisine, priceLevel, minRating, campus } = req.query;
    const restaurants = await getRestaurants();

    let filtered = restaurants;

    // 关键词搜索
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(kw) ||
        r.cuisine.toLowerCase().includes(kw) ||
        r.address.toLowerCase().includes(kw) ||
        r.tags.some(tag => tag.includes(kw))
      );
    }

    // 菜系筛选
    if (cuisine) {
      filtered = filtered.filter(r => r.cuisine === cuisine);
    }

    // 价格档位筛选
    if (priceLevel) {
      filtered = filtered.filter(r => r.priceLevel == priceLevel);
    }

    // 最低评分筛选
    if (minRating) {
      filtered = filtered.filter(r => r.rating >= parseFloat(minRating));
    }

    // 校园筛选
    if (campus) {
      filtered = filtered.filter(r => r.campus === campus);
    }

    res.json({
      success: true,
      data: filtered,
      total: filtered.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '搜索失败'
    });
  }
});

router.get('/monitor/missing-calories', async (req, res) => {
  try {
    const restaurants = await getRestaurants();
    const missing = restaurants
      .map(restaurant => {
        const missingDishes = restaurant.recommendedDishes.filter(dish => !Number.isFinite(dish.caloriesKcal));
        return {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          missingDishCount: missingDishes.length,
          missingDishNames: missingDishes.map(dish => dish.name)
        };
      })
      .filter(item => item.missingDishCount > 0);

    res.json({
      success: true,
      checkedAt: new Date().toISOString(),
      totalRestaurants: restaurants.length,
      missingRestaurantCount: missing.length,
      data: missing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '热量巡检失败'
    });
  }
});

router.get('/:id/dishes', async (req, res) => {
  try {
    const restaurants = await getRestaurants();
    const restaurant = restaurants.find(item => item.id === req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: '餐厅不存在'
      });
    }
    res.json({
      success: true,
      data: restaurant.recommendedDishes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取菜品失败'
    });
  }
});

// 获取单个餐厅详情
router.get('/:id', async (req, res) => {
  try {
    const restaurants = await getRestaurants();
    const restaurant = restaurants.find(r => r.id === req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: '餐厅不存在'
      });
    }

    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取餐厅详情失败'
    });
  }
});

module.exports = router;
