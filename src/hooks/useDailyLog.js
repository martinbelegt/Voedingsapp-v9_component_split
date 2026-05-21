import { useEffect, useMemo, useState } from "react";
import { createId } from "../services/idService";
import { loadDailyLog, saveDailyLog } from "../services/localStorageService";

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function normalizeTotals(totals) {
  return {
    kh: round2(totals.kh),
    protein: round2(totals.protein),
    fat: round2(totals.fat),
    kcal: round2(totals.kcal),
  };
}

export function useDailyLog(selectedDate) {
  const [dailyLog, setDailyLog] = useState(() => loadDailyLog());

  useEffect(() => {
    saveDailyLog(dailyLog);
  }, [dailyLog]);

  const selectedDay = useMemo(() => {
    return dailyLog.find((d) => d?.date === selectedDate) || null;
  }, [dailyLog, selectedDate]);

  const dayTotals = useMemo(() => {
    if (!selectedDay) {
      return { kh: 0, protein: 0, fat: 0, kcal: 0 };
    }

    return normalizeTotals(
      selectedDay.meals.reduce(
        (acc, meal) => {
          acc.kh += meal.totals.kh;
          acc.protein += meal.totals.protein;
          acc.fat += meal.totals.fat;
          acc.kcal += meal.totals.kcal;
          return acc;
        },
        { kh: 0, protein: 0, fat: 0, kcal: 0 },
      ),
    );
  }, [selectedDay]);

  const sortedDates = useMemo(() => {
    return [...dailyLog]
      .map((d) => d?.date)
      .filter(Boolean)
      .sort((a, b) => String(b).localeCompare(String(a)));
  }, [dailyLog]);

  function addMealToDay(input) {
    const mealEntry = {
      id: createId("daily-meal"),
      name: input.name,
      mealMoment: input.mealMoment || "neutral",
      createdAt: input.createdAt || new Date().toLocaleString("nl-NL"),
      rows: input.rows,
      totals: normalizeTotals(input.totals),
    };

    setDailyLog((prev) => {
      const existingDay = prev.find((d) => d.date === input.date);

      if (existingDay) {
        return prev.map((d) =>
          d.date === input.date ? { ...d, meals: [...d.meals, mealEntry] } : d,
        );
      }

      return [...prev, { date: input.date, meals: [mealEntry] }].sort((a, b) =>
        String(b?.date || "").localeCompare(String(a?.date || "")),
      );
    });
  }

  function deleteMealFromDay(mealId) {
    setDailyLog((prev) =>
      prev
        .map((day) =>
          day.date === selectedDate
            ? { ...day, meals: day.meals.filter((meal) => meal.id !== mealId) }
            : day,
        )
        .filter((day) => day.meals.length > 0),
    );
  }

  function clearDailyLog() {
    setDailyLog((prev) => prev.filter((day) => day.date !== selectedDate));
  }

  return {
    dailyLog,
    setDailyLog,
    selectedDay,
    dayTotals,
    sortedDates,
    addMealToDay,
    deleteMealFromDay,
    clearDailyLog,
  };
}
