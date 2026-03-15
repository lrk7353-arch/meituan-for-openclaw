<template>
  <div class="profile">
    <h1 class="page-title">个人中心</h1>
    <div class="summary-grid">
      <el-card class="summary-card">
        <p class="summary-label">当日热量</p>
        <p class="summary-value">{{ periodSummary.day.calories }} kcal</p>
      </el-card>
      <el-card class="summary-card">
        <p class="summary-label">当周支出</p>
        <p class="summary-value">¥{{ periodSummary.week.budget.toFixed(0) }}</p>
      </el-card>
      <el-card class="summary-card">
        <p class="summary-label">当月热量</p>
        <p class="summary-value">{{ periodSummary.month.calories }} kcal</p>
      </el-card>
    </div>
    <el-row :gutter="24">
      <el-col :span="14">
        <el-card class="panel-card">
          <template #header>
            <div class="panel-header">吃过什么</div>
          </template>
          <el-empty v-if="groupedMealRecords.length === 0" description="还没有用餐记录" />
          <p v-else class="collapse-tip">点击下方条目可展开查看对应餐段的详细记录</p>
          <el-collapse v-if="groupedMealRecords.length > 0" v-model="activeMealGroups" accordion>
            <el-collapse-item
              v-for="group in groupedMealRecords"
              :key="group.key"
              :title="`${group.date} · ${mealPeriodLabelMap[group.mealPeriod] || group.mealPeriod}`"
              :name="group.key"
            >
              <div class="list">
                <div v-for="record in group.records" :key="record.id" class="list-item">
                  <div class="list-main">
                    <p class="list-title">{{ record.restaurantName }}</p>
                    <p class="list-desc">
                      {{ record.date }} · {{ mealPeriodLabelMap[record.mealPeriod] || record.mealPeriod }} ·
                      {{ record.dishes.map(item => item.name).join('、') || '未填写' }} ·
                      热量{{ record.totalCaloriesKcal ? `${record.totalCaloriesKcal} kcal` : '待补充' }} ·
                      支出¥{{ Number(record.budget || 0).toFixed(2) }}
                    </p>
                  </div>
                  <div class="record-actions">
                    <el-button link type="primary" @click="openEditRecord(record)">编辑</el-button>
                    <el-button link @click="copyRecord(record)">复制到明天</el-button>
                    <el-button link type="danger" @click="removeRecord(record.id)">删除</el-button>
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="panel-card">
          <template #header>
            <div class="panel-header">最近浏览</div>
          </template>
          <div class="list">
            <div v-for="item in browseHistory.slice(0, 6)" :key="`${item.id}-${item.timestamp}`" class="list-item">
              <div class="list-main">
                <p class="list-title clickable" @click="goToDetail(item.id)">{{ item.name }}</p>
                <p class="list-desc">{{ item.campus || '大学城' }} · {{ item.cuisine }} · 人均¥{{ item.avgPrice }}</p>
              </div>
              <p class="list-time">{{ formatTime(item.timestamp) }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog v-model="recordEditorVisible" title="编辑用餐记录" width="520px">
      <el-form :model="recordEditorForm" label-width="84px">
        <el-form-item label="日期">
          <el-date-picker v-model="recordEditorForm.date" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="餐段">
          <el-select v-model="recordEditorForm.mealPeriod">
            <el-option label="早餐" value="breakfast" />
            <el-option label="午餐" value="lunch" />
            <el-option label="晚餐" value="dinner" />
            <el-option label="加餐" value="snack" />
          </el-select>
        </el-form-item>
        <el-form-item label="菜品">
          <el-select
            v-model="recordEditorForm.dishNames"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入或选择菜品"
          />
        </el-form-item>
        <el-form-item label="总热量">
          <el-input-number v-model="recordEditorForm.totalCaloriesKcal" :min="0" :precision="0" />
          <span class="budget-unit">kcal</span>
        </el-form-item>
        <el-form-item label="预算">
          <el-input-number v-model="recordEditorForm.budget" :min="0" :precision="2" />
          <span class="budget-unit">元</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordEditorVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRecordEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import storage from '../utils/storage';
import { groupRecordsByDateAndMeal, summarizeRecords } from '../utils/mealRecords';

const router = useRouter();
const browseHistory = ref([]);
const mealRecords = ref([]);
const activeMealGroups = ref([]);
const recordEditorVisible = ref(false);
const recordEditorForm = ref({
  id: '',
  date: '',
  mealPeriod: 'lunch',
  dishNames: [],
  totalCaloriesKcal: 0,
  budget: 0
});
const mealPeriodLabelMap = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐'
};
const groupedMealRecords = computed(() => groupRecordsByDateAndMeal(mealRecords.value));
const periodSummary = computed(() => summarizeRecords(mealRecords.value));

const loadProfileData = () => {
  browseHistory.value = storage.getBrowseHistory();
  mealRecords.value = storage.getMealRecords();
  const groups = groupRecordsByDateAndMeal(mealRecords.value);
  activeMealGroups.value = groups.length > 0 ? [groups[0].key] : [];
};

const goToDetail = (id) => {
  router.push(`/restaurant/${id}`);
};

const openEditRecord = (record) => {
  recordEditorForm.value = {
    id: record.id,
    date: record.date,
    mealPeriod: record.mealPeriod,
    dishNames: (record.dishes || []).map(item => item.name),
    totalCaloriesKcal: Number(record.totalCaloriesKcal || 0),
    budget: Number(record.budget || 0)
  };
  recordEditorVisible.value = true;
};

const saveRecordEdit = () => {
  const updatedDishes = recordEditorForm.value.dishNames.map(name => ({ name, caloriesKcal: null }));
  storage.updateMealRecord(recordEditorForm.value.id, {
    date: recordEditorForm.value.date,
    mealPeriod: recordEditorForm.value.mealPeriod,
    dishes: updatedDishes,
    totalCaloriesKcal: Number(recordEditorForm.value.totalCaloriesKcal || 0),
    budget: Number(recordEditorForm.value.budget || 0)
  });
  recordEditorVisible.value = false;
  loadProfileData();
  ElMessage.success('用餐记录已更新');
};

const removeRecord = (recordId) => {
  storage.removeMealRecord(recordId);
  loadProfileData();
  ElMessage.success('记录已删除');
};

const copyRecord = (record) => {
  const nextDate = new Date(record.date);
  nextDate.setDate(nextDate.getDate() + 1);
  storage.cloneMealRecord(record.id, nextDate.toISOString().slice(0, 10));
  loadProfileData();
  ElMessage.success('已复制到下一天');
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString('zh-CN');
};

onMounted(() => {
  loadProfileData();
});
</script>

<style scoped>
.profile {
  width: 100%;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.summary-card {
  text-align: center;
}

.summary-label {
  font-size: 14px;
  color: #909399;
}

.summary-value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}

.panel-card {
  border-radius: 12px;
}

.panel-header {
  font-size: 16px;
  font-weight: 600;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.collapse-tip {
  font-size: 13px;
  color: #909399;
  margin-bottom: 10px;
}

.list-item {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 12px;
}

.list-main {
  margin-bottom: 8px;
}

.list-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.list-desc {
  margin-top: 6px;
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
}

.list-time {
  color: #909399;
  font-size: 12px;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.budget-unit {
  margin-left: 8px;
  color: #909399;
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  color: #409eff;
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
