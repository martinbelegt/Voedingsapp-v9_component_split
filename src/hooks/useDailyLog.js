import { useEffect, useMemo, useState } from "react";
import { createId } from "../services/idService";
import { loadDailyLog, saveDailyLog } from "../services/localStorageService";

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function normalizeTotals(totals = {}) {
  return {
    kh: round2(Number(totals.kh) || 0),
    protein: round2(Number(totals.protein) || 0),
    fat: round2(Number(totals.fat) || 0),
    kcal: round2(Number(totals.kcal) || 0),

    insulin: round2(Number(totals.insulin) || 0),

    creon25: Number(totals.creon25) || Number(totals.best?.c25) || 0,
    creon10: Number(totals.creon10) || Number(totals.best?.c10) || 0,
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
      return {
        kh: 0,
        protein: 0,
        fat: 0,
        kcal: 0,
        insulin: 0,
        creon25: 0,
        creon10: 0,
      };
    }

    const mealTotals = normalizeTotals(
      selectedDay.meals.reduce(
        (acc, meal) => {
          acc.kh += Number(meal.totals.kh) || 0;
          acc.protein += Number(meal.totals.protein) || 0;
          acc.fat += Number(meal.totals.fat) || 0;
          acc.kcal += Number(meal.totals.kcal) || 0;

          // Creon blijft voorlopig bij eetmomenten
          acc.creon25 += Number(meal.totals.creon25) || 0;
          acc.creon10 += Number(meal.totals.creon10) || 0;

          return acc;
        },
        {
          kh: 0,
          protein: 0,
          fat: 0,
          kcal: 0,
          insulin: 0,
          creon25: 0,
          creon10: 0,
        },
      ),
    );

    // Insuline komt nu uit losse insulin-events
    const insulinTotal = (selectedDay?.insulinEvents || []).reduce(
      (sum, event) => sum + (Number(event.units) || 0),
      0,
    );

    return {
      ...mealTotals,
      insulin: round2(insulinTotal),
    };
  }, [selectedDay]);

  // Totaal werkelijk gespoten insuline
  const insulinTotal = (selectedDay?.insulinEvents || []).reduce(
    (sum, event) => sum + (Number(event.units) || 0),
    0,
  );

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

      // Vrije context bij dit eetmoment
      mealNote: input.mealNote || "",

      // createdAt = wanneer je het in de app opslaat
      createdAt: input.createdAt || new Date().toLocaleString("nl-NL"),

      // eatenAt = wanneer je het echt eet / plant
      eatenAt: input.eatenAt || new Date().toISOString(),

      // Werkelijk toegediende insuline
      actualInsulin: input.actualInsulin || "",
      insulinType: input.insulinType || "Novorapid",
      insulinTime: input.insulinTime || "",

      // Werkelijk genomen Creon
      actualCreon25: input.actualCreon25 || "",
      actualCreon10: input.actualCreon10 || "",
      creonTime: input.creonTime || "",

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

  function updateMealTime(mealId, nextEatenAt) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              meals: day.meals.map((meal) =>
                meal.id === mealId
                  ? {
                      ...meal,
                      eatenAt: nextEatenAt,
                    }
                  : meal,
              ),
            }
          : day,
      ),
    );
  }

  function updateMealMedicalLog(mealId, updates) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              meals: day.meals.map((meal) =>
                meal.id === mealId
                  ? {
                      ...meal,
                      ...updates,
                    }
                  : meal,
              ),
            }
          : day,
      ),
    );
  }

  function addInsulinEventToDay(input) {
    const eventEntry = {
      id: createId("insulin-event"),
      type: "insulin",
      eventTime: input.eventTime || new Date().toISOString(),
      insulinType: input.insulinType || "Novorapid",
      units: input.units || "",
      note: input.note || "",
      createdAt: new Date().toLocaleString("nl-NL"),
    };

    setDailyLog((prev) => {
      const existingDay = prev.find((d) => d.date === input.date);

      if (existingDay) {
        return prev.map((d) =>
          d.date === input.date
            ? { ...d, insulinEvents: [...(d.insulinEvents || []), eventEntry] }
            : d,
        );
      }

      return [
        ...prev,
        { date: input.date, meals: [], insulinEvents: [eventEntry] },
      ].sort((a, b) =>
        String(b?.date || "").localeCompare(String(a?.date || "")),
      );
    });
  }

  // Insuline-event wijzigen
  function updateInsulinEvent(mealId, updates) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              insulinEvents: (day.insulinEvents || []).map((event) =>
                event.id === mealId
                  ? {
                      ...event,
                      ...updates,
                    }
                  : event,
              ),
            }
          : day,
      ),
    );
  }

  // Insuline-event verwijderen
  function deleteInsulinEvent(eventId) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              insulinEvents: (day.insulinEvents || []).filter(
                (event) => event.id !== eventId,
              ),
            }
          : day,
      ),
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
    updateMealTime,
    updateMealMedicalLog,
    clearDailyLog,
    addInsulinEventToDay,
    updateInsulinEvent,
    deleteInsulinEvent,
  };
}
