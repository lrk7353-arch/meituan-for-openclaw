<template>
  <div class="mode-select">
    <div class="hero-section">
      <h1>今天吃什么？</h1>
      <p class="subtitle">{{ randomSubtitle }}</p>
    </div>

    <div class="mode-cards">
      <!-- 控制热量模式 -->
      <div class="mode-card" @click="selectMode('health')">
        <div class="mode-icon health">🥗</div>
        <h3>我要控制热量</h3>
        <p>推荐轻食、低卡路里美食</p>
        <div class="tags">
          <el-tag size="small" type="success">低卡</el-tag>
          <el-tag size="small" type="success">健康</el-tag>
          <el-tag size="small" type="success">轻食</el-tag>
        </div>
      </div>

      <!-- 控制预算模式 -->
      <div class="mode-card" @click="selectMode('budget')">
        <div class="mode-icon budget">💰</div>
        <h3>我要控制预算</h3>
        <p>推荐性价比高的实惠美食</p>
        <div class="tags">
          <el-tag size="small" type="warning">实惠</el-tag>
          <el-tag size="small" type="warning">性价比</el-tag>
          <el-tag size="small" type="warning">学生价</el-tag>
        </div>
      </div>

      <!-- 随意模式 -->
      <div class="mode-card" @click="selectMode('random')">
        <div class="mode-icon random">🎲</div>
        <h3>我想吃什么就吃什么</h3>
        <p>基于位置和好评为你推荐</p>
        <div class="tags">
          <el-tag size="small" type="info">随缘</el-tag>
          <el-tag size="small" type="info">惊喜</el-tag>
          <el-tag size="small" type="info">看心情</el-tag>
        </div>
      </div>
    </div>

    <!-- 随机转盘入口 -->
    <div class="lucky-draw">
      <p>选择困难？试试手气！</p>
      <el-button type="primary" size="large" @click="openLuckyDraw">
        <el-icon><MagicStick /></el-icon>
        打开幸运转盘
      </el-button>
    </div>

    <!-- 幸运转盘弹窗 -->
    <el-dialog
      v-model="showLuckyDraw"
      title="今天吃什么？"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="lucky-wheel">
        <div class="wheel-container">
          <div class="wheel" :style="{ transform: `rotate(${wheelRotation}deg)` }">
            <div class="wheel-segments" :style="wheelSegmentStyle"></div>
            <div
              v-for="(item, index) in wheelItems"
              :key="index"
              class="wheel-label"
              :style="getWheelLabelStyle(index)"
            >
              <span>{{ item }}</span>
            </div>
          </div>
          <button class="wheel-center-btn" @click="spinWheel" :disabled="spinning">
            <span>{{ spinning ? '旋转中' : '轻触抽签' }}</span>
          </button>
          <div class="wheel-pointer"></div>
        </div>
        <el-alert
          v-if="syncErrorMessage"
          title="结果同步异常，已回滚到上一次有效状态"
          type="error"
          :closable="false"
          show-icon
          class="sync-alert"
        />
        <div class="wheel-result" v-if="wheelResult">
          <h3>{{ resultTitle }}</h3>
          <p class="result-text">{{ wheelResult }}</p>
        </div>
        <el-card v-if="currentRecommendedStore" class="recommend-card" shadow="hover">
          <div class="recommend-cover">
            <img :src="currentRecommendedStore.coverImages[0]" :alt="currentRecommendedStore.name">
          </div>
          <div class="recommend-content">
            <h4>{{ currentRecommendedStore.name }}</h4>
            <div class="recommend-meta">
              <el-tag size="small" type="danger">{{ currentRecommendedStore.category }}</el-tag>
              <el-tag size="small">{{ currentRecommendedStore.rating.toFixed(1) }}分</el-tag>
              <el-tag size="small">人均¥{{ currentRecommendedStore.avgPrice }}</el-tag>
              <el-tag size="small">步行{{ currentRecommendedStore.walkMinutes }}分钟</el-tag>
            </div>
            <p>营业时间：{{ currentRecommendedStore.businessHours }}</p>
            <p>电话：{{ currentRecommendedStore.phone }}</p>
            <p v-if="caloriesText">热量：{{ caloriesText }}</p>
            <a :href="currentRecommendedStore.amapUrl" target="_blank" rel="noreferrer">高德地图导航</a>
          </div>
        </el-card>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            v-if="wheelResult"
            @click="recommendByResult"
            type="success"
          >
            立刻推荐美食门店
          </el-button>
          <el-button
            v-if="wheelResult"
            @click="resetWheel"
          >
            再抽一次！
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { MagicStick } from '@element-plus/icons-vue';
import { useRestaurantStore } from '../stores/restaurant';
import { loadRecommendationData } from '../utils/recommendationCache';
import {
  RESULT_TITLE_TEXT,
  pickSourceIndex,
  buildResultFromIndex,
  isResultConsistent,
  rollbackState,
  formatCaloriesText
} from '../utils/recommendationSync';
import { DEFAULT_VALID_STATE } from '../data/recommendationData';

const router = useRouter();
const restaurantStore = useRestaurantStore();

const showLuckyDraw = ref(false);
const spinning = ref(false);
const wheelRotation = ref(0);
const wheelResult = ref(null);
const wheelItems = ref([]);
const recommendationStores = ref([]);
const selectedState = ref({ ...DEFAULT_VALID_STATE });
const lastValidState = ref({ ...DEFAULT_VALID_STATE });
const syncErrorMessage = ref('');
const warmColors = ['#ffd166', '#ffb703', '#fb8500', '#e76f51'];
const resultTitle = RESULT_TITLE_TEXT;

const SUBTITLES = [
  "是啊，吃什么？",
  "干饭不积极，思想有问题",
  "没什么事，是一顿饭解决不了的，如果有，就两顿。",
  "请手机先吃！",
  "我的优点：吃错就改；我的缺点：改了还饿。",
  "三餐四季，温暖有趣。",
  "奶奶说：要按时吃饭。",
  "减肥？吃饱了才有力气减。",
  "我不是吃货，我只是对美食比较忠诚。",
  "把烦恼都嚼碎，咽进肚子里。",
  "唯有美食与爱不可辜负，先吃为敬。"
];

const randomSubtitle = ref(SUBTITLES[0]);

const currentRecommendedStore = computed(() => {
  return recommendationStores.value.find(item => item.id === selectedState.value.storeId) || null;
});

const caloriesText = computed(() => {
  return formatCaloriesText(currentRecommendedStore.value);
});

// 选择模式
const selectMode = (mode) => {
  restaurantStore.selectMode = mode;
  localStorage.setItem('foodie_mode', mode);
  router.push('/map');
};

const openLuckyDraw = () => {
  showLuckyDraw.value = true;
  resetWheel();
};

const applyResultState = (nextState) => {
  const start = performance.now();
  const store = recommendationStores.value.find(item => item.id === nextState.storeId);
  if (!store || !isResultConsistent(nextState)) {
    throw new Error('转盘与推荐卡片不同步');
  }
  selectedState.value = { ...nextState };
  wheelResult.value = nextState.categoryName;
  restaurantStore.luckyDrawResult = nextState.categoryName;
  restaurantStore.setForcedRestaurantId('');
  if (performance.now() - start > 300) {
    throw new Error('同步渲染超时');
  }
  lastValidState.value = { ...nextState };
  syncErrorMessage.value = '';
};

const getWheelLabelStyle = (index) => {
  const itemAngle = 360 / wheelItems.value.length;
  const angle = itemAngle * index + itemAngle / 2;
  const radius = 55; // 再次内收半径，让文字完全在扇形内部，不溢出

  return {
    left: '50%',
    top: '50%',
    transform: `rotate(${angle}deg) translateX(${radius}px) translateY(-50%)`,
    transformOrigin: '0 50%'
  };
};

const wheelSegmentStyle = computed(() => {
  const angle = 360 / wheelItems.value.length;
  const segments = wheelItems.value.map((_, index) => {
    const start = index * angle;
    const end = start + angle;
    const color = warmColors[index % warmColors.length];
    return `${color} ${start}deg ${end}deg`;
  });
  return {
    background: `conic-gradient(${segments.join(', ')})`
  };
});

const syncResultWithRollback = (sourceIndex) => {
  try {
    const nextState = buildResultFromIndex(sourceIndex);
    applyResultState(nextState);
  } catch (error) {
    syncErrorMessage.value = error.message;
    const rollback = rollbackState(lastValidState.value);
    selectedState.value = rollback;
    wheelResult.value = rollback.categoryName;
    restaurantStore.luckyDrawResult = rollback.categoryName;
    restaurantStore.setForcedRestaurantId('');
  }
};

const spinWheel = () => {
  if (spinning.value || wheelItems.value.length === 0) return;
  spinning.value = true;
  wheelResult.value = null;
  syncErrorMessage.value = '';
  const sourceIndex = pickSourceIndex();
  const itemAngle = 360 / wheelItems.value.length;
  const targetAngle = sourceIndex * itemAngle + itemAngle / 2;
  const randomRotation = 2160 + (360 - targetAngle);
  wheelRotation.value += randomRotation;
  setTimeout(() => {
    syncResultWithRollback(sourceIndex);
    spinning.value = false;
  }, 3000);
};

const recommendByResult = () => {
  if (!wheelResult.value) return;
  restaurantStore.selectMode = 'random';
  localStorage.setItem('foodie_mode', 'random');
  restaurantStore.luckyDrawResult = wheelResult.value;
  restaurantStore.resetRecommendation();
  showLuckyDraw.value = false;
  router.push('/map');
};

const resetWheel = () => {
  wheelResult.value = null;
  syncErrorMessage.value = '';
  spinning.value = false;
};

onMounted(async () => {
  const data = await loadRecommendationData();
  wheelItems.value = data.categories.map(item => item.name);
  recommendationStores.value = data.stores;
  syncResultWithRollback(selectedState.value.sourceIndex);
  randomSubtitle.value = SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)];
});
</script>

<style scoped>
.mode-select {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFC300 0%, #FF9000 100%);
  padding: 40px 20px;
}

.hero-section {
  text-align: center;
  margin-bottom: 40px;
}

.hero-section h1 {
  font-size: 42px;
  color: #fff;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-weight: 800;
  letter-spacing: 1px;
}

.subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto 40px auto;
}

.mode-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
}

.mode-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  border-color: #FFC300;
}

.mode-icon {
  font-size: 64px;
  margin-bottom: 16px;
  display: inline-block;
  transition: transform 0.3s;
}

.mode-card:hover .mode-icon {
  transform: scale(1.1);
}

/* 保持原有渐变色，或者调整为更暖的色调 */
.mode-icon.health {
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mode-icon.budget {
  background: linear-gradient(135deg, #FF9966 0%, #FF5E62 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mode-icon.random {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mode-card h3 {
  font-size: 22px;
  color: #303133;
  margin-bottom: 8px;
  font-weight: 700;
}

.mode-card p {
  font-size: 14px;
  color: #909399;
  margin-bottom: 16px;
}

.tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.lucky-draw {
  text-align: center;
  padding: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  max-width: 500px;
  margin: 0 auto;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.lucky-draw p {
  color: #fff;
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.lucky-wheel {
  text-align: center;
  padding: 10px;
}

.wheel-container {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto 20px auto;
}

.wheel {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99);
  border: 8px solid #ffffff;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  background: #fff;
}

.wheel-segments {
  position: absolute;
  inset: 0;
  border-radius: 50%;
}

.wheel-label {
  position: absolute;
  width: 70px;
  text-align: right;
  z-index: 2;
  padding-right: 6px;
}

.wheel-label span {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: #5a2f00;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.55);
  letter-spacing: 0.5px;
  transform: translateY(-50%) rotate(0deg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.wheel-center-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #fff;
  cursor: pointer;
  z-index: 5;
  background: linear-gradient(135deg, #FFC300 0%, #FF9000 100%);
  box-shadow: 0 4px 12px rgba(255, 144, 0, 0.4);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wheel-center-btn span {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.wheel-center-btn:not(:disabled):hover {
  transform: translate(-50%, -50%) scale(1.05);
}

.wheel-center-btn:disabled {
  cursor: not-allowed;
  opacity: 0.8;
  filter: grayscale(0.5);
}

.wheel-pointer {
  position: absolute;
  top: 50%;
  right: -2px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 16px solid #FF4C4C;
  transform: translateY(-50%);
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.sync-alert {
  margin: 0 auto 12px auto;
  max-width: 360px;
}

.wheel-result {
  margin-top: 20px;
  padding: 20px;
  background: #fffcf5;
  border-radius: 12px;
  border: 1px solid #FFC300;
}

.wheel-result h3 {
  font-size: 16px;
  color: #606266;
  margin-bottom: 4px;
}

.result-text {
  font-size: 24px;
  font-weight: 800;
  color: #FF6600;
}

.recommend-card {
  margin-top: 14px;
  border-radius: 14px;
  text-align: left;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.recommend-cover {
  width: 100%;
  height: 160px;
  border-radius: 10px;
  overflow: hidden;
}

.recommend-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommend-content {
  padding-top: 12px;
}

.recommend-content h4 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #303133;
  font-weight: 700;
}

.recommend-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.recommend-content p {
  margin: 4px 0;
  color: #606266;
  font-size: 13px;
}

.recommend-content a {
  color: #FF9000;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  margin-top: 4px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .mode-select {
    padding: 24px 16px;
  }

  .hero-section h1 {
    font-size: 32px;
  }

  .mode-cards {
    grid-template-columns: 1fr;
  }

  .wheel-container {
    width: 260px;
    height: 260px;
  }

  .wheel-center-btn {
    width: 70px;
    height: 70px;
  }

  .wheel-label span {
    font-size: 11px;
  }
}
</style>
