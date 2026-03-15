const PERIOD_RANGES = {
  day: 1,
  week: 7,
  month: 30
};

const normalizeDate = (dateStr) => {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const calculateMealTotals = (record) => {
  const totalCalories = (record.dishes || []).reduce((sum, item) => sum + (Number(item.caloriesKcal) || 0), 0);
  return {
    totalCalories: Math.round(totalCalories),
    budget: Number(record.budget || 0)
  };
};

export const groupRecordsByDateAndMeal = (records) => {
  const map = new Map();
  records.forEach(record => {
    const key = `${record.date}_${record.mealPeriod}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        date: record.date,
        mealPeriod: record.mealPeriod,
        records: []
      });
    }
    map.get(key).records.push(record);
  });

  return Array.from(map.values()).sort((a, b) => {
    const dateDiff = normalizeDate(b.date) - normalizeDate(a.date);
    if (dateDiff !== 0) return dateDiff;
    return a.mealPeriod.localeCompare(b.mealPeriod);
  });
};

export const summarizeRecords = (records, now = new Date()) => {
  const baseDate = normalizeDate(now);
  const isWithinRange = (record, rangeDays) => {
    const diffDays = (baseDate - normalizeDate(record.date)) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays < rangeDays;
  };

  const calc = (rangeDays) => {
    const selected = records.filter(record => isWithinRange(record, rangeDays));
    return selected.reduce((summary, record) => {
      const totals = calculateMealTotals(record);
      return {
        calories: summary.calories + totals.totalCalories,
        budget: summary.budget + totals.budget
      };
    }, { calories: 0, budget: 0 });
  };

  return {
    day: calc(PERIOD_RANGES.day),
    week: calc(PERIOD_RANGES.week),
    month: calc(PERIOD_RANGES.month)
  };
};
