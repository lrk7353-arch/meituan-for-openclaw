import api from './request';

// 获取所有餐厅
export const getRestaurants = () => {
  return api.get('/restaurants');
};

// 获取餐厅详情
export const getRestaurantDetail = (id) => {
  return api.get(`/restaurants/${id}`);
};

// 搜索餐厅
export const searchRestaurants = (params) => {
  return api.get('/restaurants/search', { params });
};

export const getRestaurantDishes = (restaurantId) => {
  return api.get(`/restaurants/${restaurantId}/dishes`);
};

export const getMissingCaloriesMonitor = () => {
  return api.get('/restaurants/monitor/missing-calories');
};

// 获取餐厅评价
export const getReviews = (restaurantId) => {
  return api.get(`/reviews/restaurant/${restaurantId}`);
};

// 添加评价
export const addReview = (data) => {
  return api.post('/reviews', data);
};

// 点赞评价
export const likeReview = (id) => {
  return api.post(`/reviews/${id}/like`);
};
