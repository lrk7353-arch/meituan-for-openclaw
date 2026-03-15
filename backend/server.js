const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
const restaurantRoutes = require('./routes/restaurants');
const reviewRoutes = require('./routes/reviews');

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);

// 静态文件服务（用于餐厅图片）
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '美食地图API服务运行中' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 美食地图API服务已启动，运行在端口 ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
