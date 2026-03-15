const CATEGORY_NAMES = [
  '川湘菜', '粤菜', '东北菜', '江浙菜', '西北面食',
  '火锅', '烧烤', '日料', '韩餐', '轻食',
  '中式快餐', '西餐', '东南亚菜', '奶茶', '甜品',
  '咖啡简餐', '海鲜', '素食', '煲仔饭', '地方小吃',
  '披萨', '汉堡'
];

const WARM_COLORS = ['#ffd166', '#ffb703', '#fb8500', '#e76f51'];

const STORE_PREFIX = [
  '食光', '好味', '同学', '校园里', '晚风', '大口', '乐享', '小满', '悦食', '鲜客'
];

const STORE_SUFFIX = [
  '厨房', '食堂', '餐馆', '小馆', '饭铺', '食集', '餐吧', '食屋', '饭堂', '食坊'
];

const CAMPUSES = ['清华大学', '北京大学', '中国人民大学', '北京航空航天大学', '中关村大学城'];

const LIGHT_FOOD_CALORIE_MAP = {
  '轻食': 420,
  '西餐': 610,
  '咖啡简餐': 560,
  '素食': 430
};

const CATEGORY_IMAGE_KEYWORDS = {
  '川湘菜': [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '粤菜': [
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '东北菜': [
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '江浙菜': [
    'https://images.unsplash.com/photo-1548940740-204726a19be3?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '西北面食': [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '火锅': [
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '烧烤': [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '日料': [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1563612116625-3012372fccce?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '韩餐': [
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '轻食': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '中式快餐': [
    'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '西餐': [
    'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '东南亚菜': [
    'https://images.unsplash.com/photo-1604908176997-431f08f2eb78?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '奶茶': [
    'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '甜品': [
    'https://images.unsplash.com/photo-1488477304112-4944851de03d?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '咖啡简餐': [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1494314671902-399b18174975?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '海鲜': [
    'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '素食': [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '煲仔饭': [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '地方小吃': [
    'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '披萨': [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1080&h=720&q=80'
  ],
  '汉堡': [
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1080&h=720&q=80',
    'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=1080&h=720&q=80'
  ]
};

const buildCategoryImages = (name, index) => {
  const imagePool = CATEGORY_IMAGE_KEYWORDS[name] || CATEGORY_IMAGE_KEYWORDS['中式快餐'];
  return [0, 1, 2].map(seed => imagePool[(index + seed) % imagePool.length]);
};

export const FOOD_CATEGORIES = CATEGORY_NAMES.map((name, index) => ({
  id: `cat_${index + 1}`,
  name,
  color: WARM_COLORS[index % WARM_COLORS.length],
  coverImages: buildCategoryImages(name, index + 1)
}));

const buildAmapUrl = (storeName) => {
  return `https://uri.amap.com/search?keyword=${encodeURIComponent(storeName)}&view=map`;
};

const buildPhone = (index) => {
  const suffix = (1000 + index).toString();
  return `010-62${suffix}`;
};

const buildBusinessHours = (index) => {
  const start = 8 + (index % 4);
  const end = 20 + (index % 4);
  return `${start.toString().padStart(2, '0')}:00-${end.toString().padStart(2, '0')}:30`;
};

export const RECOMMEND_STORES = Array.from({ length: 50 }).map((_, index) => {
  const category = FOOD_CATEGORIES[index % FOOD_CATEGORIES.length];
  const campus = CAMPUSES[index % CAMPUSES.length];
  const storeName = `${campus.replace('大学', '')}${STORE_PREFIX[index % STORE_PREFIX.length]}${STORE_SUFFIX[index % STORE_SUFFIX.length]}`;
  const isLightFood = category.name === '轻食';
  const fallbackCalories = LIGHT_FOOD_CALORIE_MAP[category.name] || 520;

  return {
    id: `rs_${index + 1}`,
    name: storeName,
    category: category.name,
    categoryTags: [category.name, campus],
    rating: Number((4.0 + ((index % 10) * 0.1)).toFixed(1)),
    avgPrice: 18 + (index % 18) * 4,
    walkMinutes: 4 + (index % 18),
    businessHours: buildBusinessHours(index),
    phone: buildPhone(index),
    amapUrl: buildAmapUrl(storeName),
    campus,
    coverImages: buildCategoryImages(category.name, index + 1),
    caloriesKcal: isLightFood ? Math.round(fallbackCalories) : null,
    caloriesSource: isLightFood ? 'estimated' : null
  };
});

export const DEFAULT_VALID_STATE = {
  sourceIndex: 0,
  categoryName: FOOD_CATEGORIES[0].name,
  storeId: RECOMMEND_STORES.find(store => store.category === FOOD_CATEGORIES[0].name)?.id || RECOMMEND_STORES[0].id
};
