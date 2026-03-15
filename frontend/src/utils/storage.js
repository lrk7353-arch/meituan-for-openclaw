import { STORAGE_KEYS } from './constants';

/**
 * 本地存储工具类
 */
class Storage {
  /**
   * 获取数据
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('读取本地存储失败:', error);
      return defaultValue;
    }
  }

  /**
   * 设置数据
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('写入本地存储失败:', error);
      return false;
    }
  }

  /**
   * 删除数据
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('删除本地存储失败:', error);
      return false;
    }
  }

  /**
   * 清空所有数据
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('清空本地存储失败:', error);
      return false;
    }
  }

  /**
   * 获取收藏列表
   */
  getFavorites() {
    return this.get(STORAGE_KEYS.FAVORITES, []);
  }

  /**
   * 设置收藏列表
   */
  setFavorites(favorites) {
    return this.set(STORAGE_KEYS.FAVORITES, favorites);
  }

  /**
   * 添加收藏
   */
  addFavorite(restaurantId) {
    const favorites = this.getFavorites();
    if (!favorites.includes(restaurantId)) {
      favorites.push(restaurantId);
      return this.setFavorites(favorites);
    }
    return true;
  }

  /**
   * 移除收藏
   */
  removeFavorite(restaurantId) {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(restaurantId);
    if (index > -1) {
      favorites.splice(index, 1);
      return this.setFavorites(favorites);
    }
    return true;
  }

  /**
   * 判断是否已收藏
   */
  isFavorite(restaurantId) {
    const favorites = this.getFavorites();
    return favorites.includes(restaurantId);
  }

  /**
   * 获取用户ID
   */
  getUserId() {
    return this.get(STORAGE_KEYS.USER_ID, '');
  }

  /**
   * 设置用户ID
   */
  setUserId(userId) {
    return this.set(STORAGE_KEYS.USER_ID, userId);
  }

  /**
   * 获取搜索历史
   */
  getSearchHistory() {
    return this.get(STORAGE_KEYS.SEARCH_HISTORY, []);
  }

  /**
   * 添加搜索历史
   */
  addSearchHistory(keyword) {
    if (!keyword || !keyword.trim()) return false;

    const history = this.getSearchHistory();
    const index = history.indexOf(keyword);

    // 如果已存在，先删除
    if (index > -1) {
      history.splice(index, 1);
    }

    // 添加到开头
    history.unshift(keyword);

    // 只保留最近 10 条
    if (history.length > 10) {
      history.pop();
    }

    return this.set(STORAGE_KEYS.SEARCH_HISTORY, history);
  }

  /**
   * 清空搜索历史
   */
  clearSearchHistory() {
    return this.remove(STORAGE_KEYS.SEARCH_HISTORY);
  }

  getBrowseHistory() {
    return this.get(STORAGE_KEYS.BROWSE_HISTORY, []);
  }

  addBrowseHistory(restaurant) {
    if (!restaurant || !restaurant.id) return false;

    const history = this.getBrowseHistory();
    const deduped = history.filter(item => item.id !== restaurant.id);
    deduped.unshift(restaurant);

    if (deduped.length > 20) {
      deduped.length = 20;
    }

    return this.set(STORAGE_KEYS.BROWSE_HISTORY, deduped);
  }

  getMyReviews() {
    return this.get(STORAGE_KEYS.MY_REVIEWS, []);
  }

  addMyReview(review) {
    if (!review || !review.restaurantId) return false;

    const reviews = this.getMyReviews();
    reviews.unshift(review);

    if (reviews.length > 50) {
      reviews.length = 50;
    }

    return this.set(STORAGE_KEYS.MY_REVIEWS, reviews);
  }

  getMealRecords() {
    return this.get(STORAGE_KEYS.MEAL_RECORDS, []);
  }

  setMealRecords(records) {
    return this.set(STORAGE_KEYS.MEAL_RECORDS, records);
  }

  addMealRecord(record) {
    if (!record || !record.id) return false;
    const records = this.getMealRecords();
    records.unshift(record);
    return this.setMealRecords(records);
  }

  updateMealRecord(recordId, updates) {
    const records = this.getMealRecords();
    const index = records.findIndex(item => item.id === recordId);
    if (index < 0) return false;
    records[index] = {
      ...records[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.setMealRecords(records);
  }

  removeMealRecord(recordId) {
    const records = this.getMealRecords().filter(item => item.id !== recordId);
    return this.setMealRecords(records);
  }

  cloneMealRecord(recordId, nextDate) {
    const records = this.getMealRecords();
    const target = records.find(item => item.id === recordId);
    if (!target) return false;
    const cloned = {
      ...target,
      id: `${target.id}_copy_${Date.now()}`,
      date: nextDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    records.unshift(cloned);
    return this.setMealRecords(records);
  }

  appendCalorieMonitorLog(log) {
    const logs = this.get(STORAGE_KEYS.CALORIE_MONITOR_LOG, []);
    logs.unshift(log);
    if (logs.length > 30) {
      logs.length = 30;
    }
    return this.set(STORAGE_KEYS.CALORIE_MONITOR_LOG, logs);
  }
}

export default new Storage();
