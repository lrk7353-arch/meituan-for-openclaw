import { FOOD_CATEGORIES, RECOMMEND_STORES } from '../data/recommendationData.js';

const DB_NAME = 'foodie_map_cache';
const STORE_NAME = 'recommendation_cache';
const CACHE_KEY = 'v5';
const EXPIRE_MS = 24 * 60 * 60 * 1000;

let cacheStats = {
  hits: 0,
  total: 0
};

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const writeCache = async (payload) => {
  const db = await openDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({
      key: CACHE_KEY,
      createdAt: Date.now(),
      payload
    });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
  db.close();
};

const readCache = async () => {
  const db = await openDB();
  const data = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(CACHE_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return data;
};

const buildDefaultPayload = () => {
  return {
    categories: FOOD_CATEGORIES,
    stores: RECOMMEND_STORES
  };
};

export const loadRecommendationData = async () => {
  cacheStats.total += 1;
  try {
    const cache = await readCache();
    if (cache && Date.now() - cache.createdAt < EXPIRE_MS) {
      cacheStats.hits += 1;
      return cache.payload;
    }
  } catch (error) {
    //
  }

  const payload = buildDefaultPayload();
  try {
    await writeCache(payload);
  } catch (error) {
    //
  }
  return payload;
};

export const getCacheHitRate = () => {
  if (cacheStats.total === 0) return 0;
  return (cacheStats.hits / cacheStats.total) * 100;
};

export const __setCacheStatsForTest = (hits, total) => {
  cacheStats = { hits, total };
};
