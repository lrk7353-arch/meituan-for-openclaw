const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// 数据文件路径
const REVIEWS_FILE = path.join(__dirname, '../data/reviews.json');
const RESTAURANTS_FILE = path.join(__dirname, '../data/restaurants.json');

// 读取评价数据
async function getReviews() {
  const data = await fs.readFile(REVIEWS_FILE, 'utf8');
  return JSON.parse(data);
}

// 获取餐厅的所有评价
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const reviews = await getReviews();
    const restaurantReviews = reviews.filter(r => r.restaurantId === req.params.restaurantId);

    res.json({
      success: true,
      data: restaurantReviews,
      total: restaurantReviews.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取评价失败'
    });
  }
});

// 添加评价
router.post('/', async (req, res) => {
  try {
    const { restaurantId, userId, userName, rating, content, images } = req.body;

    // 验证必填字段
    if (!restaurantId || !userId || !userName || !rating || !content) {
      return res.status(400).json({
        success: false,
        error: '缺少必填字段'
      });
    }

    // 读取现有数据
    const reviews = await getReviews();

    // 创建新评价
    const newReview = {
      id: Date.now().toString(),
      restaurantId,
      userId,
      userName,
      avatar: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}`,
      rating: parseInt(rating),
      content,
      images: images || [],
      likes: 0,
      timestamp: new Date().toISOString()
    };

    // 添加到数组
    reviews.unshift(newReview);

    // 保存到文件
    await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2));

    // 更新餐厅的评分（简化处理，实际应该更精确）
    const restaurants = JSON.parse(await fs.readFile(RESTAURANTS_FILE, 'utf8'));
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      const restaurantReviews = reviews.filter(r => r.restaurantId === restaurantId);
      const avgRating = restaurantReviews.reduce((sum, r) => sum + r.rating, 0) / restaurantReviews.length;
      restaurant.rating = Math.round(avgRating * 10) / 10;
      restaurant.reviewCount = restaurantReviews.length;
      await fs.writeFile(RESTAURANTS_FILE, JSON.stringify(restaurants, null, 2));
    }

    res.json({
      success: true,
      message: '评价添加成功',
      data: newReview
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: '添加评价失败'
    });
  }
});

// 点赞评价
router.post('/:id/like', async (req, res) => {
  try {
    const reviews = await getReviews();
    const reviewIndex = reviews.findIndex(r => r.id === req.params.id);

    if (reviewIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '评价不存在'
      });
    }

    reviews[reviewIndex].likes += 1;
    await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2));

    res.json({
      success: true,
      message: '点赞成功',
      data: reviews[reviewIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '点赞失败'
    });
  }
});

module.exports = router;
