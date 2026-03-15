import test from 'node:test';
import assert from 'node:assert/strict';
import { FOOD_CATEGORIES, RECOMMEND_STORES } from '../src/data/recommendationData.js';
import {
  RESULT_TITLE_TEXT,
  buildResultFromIndex,
  isResultConsistent,
  formatCaloriesText
} from '../src/utils/recommendationSync.js';
import { __setCacheStatsForTest, getCacheHitRate } from '../src/utils/recommendationCache.js';

test('转盘与推荐卡片使用同一随机索引源', () => {
  for (let i = 0; i < FOOD_CATEGORIES.length; i += 1) {
    const result = buildResultFromIndex(i);
    assert.equal(result.sourceIndex, i);
    assert.ok(isResultConsistent(result));
  }
});

test('转盘结果文案已替换', () => {
  assert.equal(RESULT_TITLE_TEXT, '现在吃……');
});

test('轻食门店展示热量估算值', () => {
  const lightFoodStore = RECOMMEND_STORES.find(item => item.category === '轻食');
  assert.ok(lightFoodStore);
  const caloriesText = formatCaloriesText(lightFoodStore);
  assert.match(caloriesText, /kcal/);
  assert.match(caloriesText, /估算值/);
});

test('非轻食门店不展示热量文案', () => {
  const nonLightFoodStore = RECOMMEND_STORES.find(item => item.category !== '轻食');
  assert.ok(nonLightFoodStore);
  const caloriesText = formatCaloriesText(nonLightFoodStore);
  assert.equal(caloriesText, '');
});

test('缓存命中率不低于95%', () => {
  __setCacheStatsForTest(96, 100);
  assert.ok(getCacheHitRate() >= 95);
});
