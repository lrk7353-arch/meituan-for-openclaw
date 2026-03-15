import { FOOD_CATEGORIES, RECOMMEND_STORES, DEFAULT_VALID_STATE } from '../data/recommendationData.js';

export const RESULT_TITLE_TEXT = '现在吃……';

export const pickSourceIndex = (randomValue = Math.random()) => {
  return Math.floor(randomValue * FOOD_CATEGORIES.length);
};

export const resolveStoreByCategory = (categoryName) => {
  return RECOMMEND_STORES.find(store => store.category === categoryName) || RECOMMEND_STORES[0];
};

export const buildResultFromIndex = (sourceIndex) => {
  const category = FOOD_CATEGORIES[sourceIndex] || FOOD_CATEGORIES[0];
  const store = resolveStoreByCategory(category.name);
  return {
    sourceIndex,
    categoryName: category.name,
    storeId: store.id
  };
};

export const isResultConsistent = (resultState) => {
  if (!resultState) return false;
  const category = FOOD_CATEGORIES[resultState.sourceIndex];
  if (!category) return false;
  const store = RECOMMEND_STORES.find(item => item.id === resultState.storeId);
  return Boolean(store && category.name === resultState.categoryName && store.category === resultState.categoryName);
};

export const rollbackState = (lastValidState) => {
  if (isResultConsistent(lastValidState)) {
    return { ...lastValidState };
  }
  return { ...DEFAULT_VALID_STATE };
};

export const formatCaloriesText = (store) => {
  if (!store || !store.caloriesKcal) return '';
  return store.caloriesSource === 'estimated'
    ? `${store.caloriesKcal} kcal（估算值）`
    : `${store.caloriesKcal} kcal`;
};
