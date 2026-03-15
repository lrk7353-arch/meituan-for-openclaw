import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMealTotals, groupRecordsByDateAndMeal, summarizeRecords } from '../src/utils/mealRecords.js';

const buildCaseRecords = () => {
  const baseDate = new Date('2026-03-15T12:00:00');
  return Array.from({ length: 10 }).map((_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - (index % 4));
    return {
      id: `record_${index + 1}`,
      date: date.toISOString().slice(0, 10),
      mealPeriod: ['breakfast', 'lunch', 'dinner', 'snack'][index % 4],
      dishes: [
        { name: `菜品A${index + 1}`, caloriesKcal: 300 + index * 10 },
        { name: `菜品B${index + 1}`, caloriesKcal: 150 + index * 5 }
      ],
      budget: 20 + index
    };
  });
};

test('10组用餐记录热量统计误差低于1%', () => {
  const records = buildCaseRecords();
  const expected = records.reduce((sum, record) => {
    return sum + record.dishes.reduce((dishSum, dish) => dishSum + dish.caloriesKcal, 0);
  }, 0);
  const actual = records.reduce((sum, record) => sum + calculateMealTotals(record).totalCalories, 0);
  const errorRate = Math.abs(actual - expected) / expected;
  assert.ok(errorRate < 0.01);
});

test('按日期+餐段聚合展示', () => {
  const records = buildCaseRecords();
  const grouped = groupRecordsByDateAndMeal(records);
  assert.ok(grouped.length > 0);
  grouped.forEach(group => {
    group.records.forEach(record => {
      assert.equal(record.date, group.date);
      assert.equal(record.mealPeriod, group.mealPeriod);
    });
  });
});

test('日周月累计统计可用', () => {
  const records = buildCaseRecords();
  const summary = summarizeRecords(records, new Date('2026-03-15T12:00:00'));
  assert.ok(summary.day.calories >= 0);
  assert.ok(summary.week.calories >= summary.day.calories);
  assert.ok(summary.month.budget >= summary.week.budget);
});
