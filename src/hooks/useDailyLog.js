import { useEffect, useMemo, useRef, useState } from "react";
import { createId } from "../services/idService";
import {
  loadDailyLog,
  saveDailyLog,
  loadDailyLogFromCloud,
  saveDailyLogToCloud,
} from "../services/localStorageService";

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

function createEmptyDay(date) {
  return {
    date,
    meals: [],
    insulinEvents: [],
    glucoseEvents: [],
    glucoseBoostEvents: [],
    movementEvents: [],
    supplementEvents: [],
    bowelEvents: [],
    noteEvents: [],
    trainingPlanEvents: [],
    sportSupplementPlanEvents: [],
  };
}

function normalizeDay(day = {}) {
  return {
    ...createEmptyDay(day.date),
    ...day,
    meals: day.meals || [],
    insulinEvents: day.insulinEvents || [],
    glucoseEvents: day.glucoseEvents || [],
    glucoseBoostEvents: day.glucoseBoostEvents || [],
    movementEvents: day.movementEvents || [],
    supplementEvents: day.supplementEvents || [],
    bowelEvents: day.bowelEvents || [],
    noteEvents: day.noteEvents || [],
    trainingPlanEvents: day.trainingPlanEvents || [],
    sportSupplementPlanEvents: day.sportSupplementPlanEvents || [],
  };
}

function hasDayContent(day = {}) {
  return (
    (day.meals || []).length > 0 ||
    (day.insulinEvents || []).length > 0 ||
    (day.glucoseEvents || []).length > 0 ||
    (day.glucoseBoostEvents || []).length > 0 ||
    (day.movementEvents || []).length > 0 ||
    (day.supplementEvents || []).length > 0 ||
    (day.bowelEvents || []).length > 0 ||
    (day.noteEvents || []).length > 0 ||
    (day.trainingPlanEvents || []).length > 0 ||
    (day.sportSupplementPlanEvents || []).length > 0
  );
}

function sortDaysNewestFirst(days) {
  return [...days].sort((a, b) =>
    String(b?.date || "").localeCompare(String(a?.date || "")),
  );
}

function countDailyLogEvents(days = []) {
  return days.reduce(
    (total, day) =>
      total +
      (day.meals || []).length +
      (day.insulinEvents || []).length +
      (day.glucoseEvents || []).length +
      (day.glucoseBoostEvents || []).length +
      (day.movementEvents || []).length +
      (day.supplementEvents || []).length +
      (day.bowelEvents || []).length +
      (day.noteEvents || []).length +
      (day.trainingPlanEvents || []).length +
      (day.sportSupplementPlanEvents || []).length,
    0,
  );
}

function getTimePart(value, fallback) {
  return String(value || "").slice(11, 16) || fallback;
}

function normalizeRowsForRepeat(rows = []) {
  return rows.map((row) => ({
    productId: row.productId || "",
    mode: row.mode || "portion",
    amount: String(row.amount ?? ""),
  }));
}

function createRepeatSignature(item = {}, type) {
  if (type === "meal") {
    return JSON.stringify({
      type,
      name: item.name || "",
      mealMoment: item.mealMoment || "neutral",
      mealNote: item.mealNote || "",
      time: getTimePart(item.eatenAt, "12:00"),
      rows: normalizeRowsForRepeat(item.rows || []),
      totals: normalizeTotals(item.totals),
    });
  }

  if (type === "supplement") {
    return JSON.stringify({
      type,
      name: item.name || "",
      dosage: item.dosage || "",
      note: item.note || "",
      time: getTimePart(item.eventTime, "08:00"),
    });
  }

  return JSON.stringify({
    type,
    activityType: item.activityType || "Krachttraining",
    intensityType: item.intensityType || "Gemengd",
    durationMinutes: String(item.durationMinutes ?? ""),
    note: item.note || "",
    time: getTimePart(item.eventTime, "10:00"),
  });
}

function createRepeatSignatureSet(items = [], type) {
  return new Set(items.map((item) => createRepeatSignature(item, type)));
}

function shouldCopyRepeat(existingSignatures, item, type) {
  return !existingSignatures.has(createRepeatSignature(item, type));
}

export function useDailyLog(selectedDate) {
  const [dailyLog, setDailyLogState] = useState(() =>
    sortDaysNewestFirst((loadDailyLog() || []).map(normalizeDay)),
  );
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const hasHydratedCloudData = useRef(false);
  const hasLocalUserChange = useRef(false);
  const cloudHydratedDayCount = useRef(0);
  const cloudHydratedEventCount = useRef(0);
  const loadedRevision = useRef(null);
  const localChangeVersion = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCloud() {
      try {
        const cloudResult = await loadDailyLogFromCloud();

        if (cancelled) return;

        const cloudDailyLog = cloudResult?.dailyLog;

        if (!Array.isArray(cloudDailyLog)) {
          console.warn(
            "dailyLog cloud load failure: no usable cloud dailyLog returned",
          );
          setCloudLoaded(true);
          return;
        }

        const normalizedCloudLog = sortDaysNewestFirst(
          cloudDailyLog.map(normalizeDay),
        );
        const cloudEventCount = countDailyLogEvents(normalizedCloudLog);

        hasHydratedCloudData.current = true;
        cloudHydratedDayCount.current = normalizedCloudLog.length;
        cloudHydratedEventCount.current = cloudEventCount;
        loadedRevision.current = Number.isInteger(cloudResult.revision)
          ? cloudResult.revision
          : 0;

        console.log("dailyLog cloud load success:", {
          days: normalizedCloudLog.length,
          events: cloudEventCount,
          revision: loadedRevision.current,
          updatedAt: cloudResult.updatedAt,
          selectedDate,
          selectedDay: normalizedCloudLog.find(
            (day) => day.date === selectedDate,
          ),
        });

        setDailyLogState(normalizedCloudLog);
        saveDailyLog(normalizedCloudLog);
        setCloudLoaded(true);
      } catch (error) {
        if (cancelled) return;

        console.error("dailyLog cloud load failure:", error);
        setCloudLoaded(true);
      }
    }

    loadCloud();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveDailyLog(dailyLog);

    if (!cloudLoaded) {
      console.log("dailyLog cloud save skipped: cloud load not finished");
      return;
    }

    if (!hasHydratedCloudData.current) {
      console.warn("dailyLog cloud save skipped: cloud data not hydrated");
      return;
    }

    if (!hasLocalUserChange.current) {
      console.log(
        "dailyLog cloud save skipped: no local user change after hydration",
      );
      return;
    }

    if (!Number.isInteger(loadedRevision.current)) {
      console.warn("dailyLog cloud save skipped: revision not loaded");
      return;
    }

    if (!dailyLog || dailyLog.length === 0) {
      console.warn("dailyLog cloud save skipped: empty dailyLog");
      return;
    }

    const localDayCount = dailyLog.length;
    const localEventCount = countDailyLogEvents(dailyLog);

    if (localDayCount < cloudHydratedDayCount.current) {
      console.warn("dailyLog cloud save skipped: local day count is smaller", {
        localDays: localDayCount,
        cloudDays: cloudHydratedDayCount.current,
      });
      return;
    }

    if (localEventCount < cloudHydratedEventCount.current) {
      console.warn(
        "dailyLog cloud save skipped: local event count is smaller",
        {
          localEvents: localEventCount,
          cloudEvents: cloudHydratedEventCount.current,
        },
      );
      return;
    }

    const expectedRevision = loadedRevision.current;
    const saveChangeVersion = localChangeVersion.current;

    const timeoutId = setTimeout(() => {
      console.log("dailyLog cloud save executing:", {
        days: localDayCount,
        events: localEventCount,
        expectedRevision,
        changeVersion: saveChangeVersion,
      });

      saveDailyLogToCloud(dailyLog, expectedRevision).then((result) => {
        console.log("dailyLog cloud save result:", result);

        if (result.ok) {
          loadedRevision.current = result.revision;
          hasLocalUserChange.current = false;
          cloudHydratedDayCount.current = localDayCount;
          cloudHydratedEventCount.current = localEventCount;

          if (saveChangeVersion !== localChangeVersion.current) {
            hasLocalUserChange.current = true;
            console.warn(
              "dailyLog cloud save succeeded for an older local change; newer local changes remain unsaved",
              {
                savedChangeVersion: saveChangeVersion,
                currentChangeVersion: localChangeVersion.current,
                revision: loadedRevision.current,
              },
            );
          }
        } else if (result.conflict) {
          console.warn(
            "dailyLog cloud save blocked: Supabase has a newer revision; localStorage keeps the local changes",
            {
              expectedRevision,
              serverRevision: result.revision,
              days: localDayCount,
              events: localEventCount,
            },
          );
        }
      });
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [dailyLog, cloudLoaded]);

  function setDailyLog(nextDailyLog) {
    if (hasHydratedCloudData.current) {
      hasLocalUserChange.current = true;
      localChangeVersion.current += 1;
    } else {
      console.log(
        "dailyLog local change before cloud hydration; cloud save remains blocked",
      );
    }

    setDailyLogState(nextDailyLog);
  }

  const selectedDay = useMemo(() => {
    const foundDay = dailyLog.find((d) => d?.date === selectedDate);
    return foundDay ? normalizeDay(foundDay) : null;
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
      (selectedDay.meals || []).reduce(
        (acc, meal) => {
          acc.kh += Number(meal.totals?.kh) || 0;
          acc.protein += Number(meal.totals?.protein) || 0;
          acc.fat += Number(meal.totals?.fat) || 0;
          acc.kcal += Number(meal.totals?.kcal) || 0;
          acc.creon25 += Number(meal.totals?.creon25) || 0;
          acc.creon10 += Number(meal.totals?.creon10) || 0;
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

    const insulinTotal = (selectedDay.insulinEvents || []).reduce(
      (sum, event) => sum + (Number(event.units) || 0),
      0,
    );

    return {
      ...mealTotals,
      insulin: round2(insulinTotal),
    };
  }, [selectedDay]);

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

  function addEntryToDay(input, key, entry) {
    setDailyLog((prev) => {
      const existingDay = prev.find((day) => day.date === input.date);

      if (existingDay) {
        return sortDaysNewestFirst(
          prev.map((day) =>
            day.date === input.date
              ? {
                  ...normalizeDay(day),
                  [key]: [...(day[key] || []), entry],
                }
              : normalizeDay(day),
          ),
        );
      }

      return sortDaysNewestFirst([
        ...prev.map(normalizeDay),
        {
          ...createEmptyDay(input.date),
          [key]: [entry],
        },
      ]);
    });

    return entry;
  }

  function updateEntryInSelectedDay(key, eventId, updates) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...normalizeDay(day),
              [key]: (day[key] || []).map((event) =>
                event.id === eventId ? { ...event, ...updates } : event,
              ),
            }
          : normalizeDay(day),
      ),
    );
  }

  function deleteEntryFromSelectedDay(key, eventId) {
    setDailyLog((prev) =>
      prev
        .map((day) =>
          day.date === selectedDate
            ? {
                ...normalizeDay(day),
                [key]: (day[key] || []).filter((event) => event.id !== eventId),
              }
            : normalizeDay(day),
        )
        .filter(hasDayContent),
    );
  }

  function addMealToDay(input) {
    const mealEntry = {
      id: createId("daily-meal"),
      name: input.name,
      mealMoment: input.mealMoment || "neutral",
      mealNote: input.mealNote || "",
      createdAt: input.createdAt || new Date().toLocaleString("nl-NL"),
      eatenAt: input.eatenAt || new Date().toISOString(),
      alarmEnabled: input.alarmEnabled || false,
      alarmAt: input.alarmAt || null,
      actualInsulin: input.actualInsulin || "",
      insulinType: input.insulinType || "Novorapid",
      insulinTime: input.insulinTime || "",
      actualCreon25: input.actualCreon25 || "",
      actualCreon10: input.actualCreon10 || "",
      creonTime: input.creonTime || "",
      rows: input.rows || [],
      totals: normalizeTotals(input.totals),
      repeat: input.repeat || "none",
    };

    return addEntryToDay(input, "meals", mealEntry);
  }

  function deleteMealFromDay(mealId) {
    setDailyLog((prev) =>
      prev
        .map((day) =>
          day.date === selectedDate
            ? {
                ...normalizeDay(day),
                meals: (day.meals || []).filter((meal) => meal.id !== mealId),
              }
            : normalizeDay(day),
        )
        .filter(hasDayContent),
    );
  }

  function updateMealTime(mealId, nextEatenAt) {
    const nextDate = String(nextEatenAt || "").slice(0, 10);

    setDailyLog((prev) => {
      let mealToMove = null;

      const withoutMeal = prev
        .map((day) => {
          const normalizedDay = normalizeDay(day);
          const foundMeal = normalizedDay.meals.find(
            (meal) => meal.id === mealId,
          );

          if (!foundMeal) return normalizedDay;

          mealToMove = {
            ...foundMeal,
            eatenAt: nextEatenAt,
          };

          return {
            ...normalizedDay,
            meals: normalizedDay.meals.filter((meal) => meal.id !== mealId),
          };
        })
        .filter(hasDayContent);

      if (!mealToMove || !nextDate) return prev;

      const existingTargetDay = withoutMeal.find(
        (day) => day.date === nextDate,
      );

      if (existingTargetDay) {
        return sortDaysNewestFirst(
          withoutMeal.map((day) =>
            day.date === nextDate
              ? {
                  ...normalizeDay(day),
                  meals: [...(day.meals || []), mealToMove],
                }
              : normalizeDay(day),
          ),
        );
      }

      return sortDaysNewestFirst([
        ...withoutMeal.map(normalizeDay),
        {
          ...createEmptyDay(nextDate),
          meals: [mealToMove],
        },
      ]);
    });
  }

  function updateMealMedicalLog(mealId, updates) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...normalizeDay(day),
              meals: (day.meals || []).map((meal) =>
                meal.id === mealId ? { ...meal, ...updates } : meal,
              ),
            }
          : normalizeDay(day),
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

    return addEntryToDay(input, "insulinEvents", eventEntry);
  }

  function updateInsulinEvent(eventId, updates) {
    updateEntryInSelectedDay("insulinEvents", eventId, updates);
  }

  function deleteInsulinEvent(eventId) {
    deleteEntryFromSelectedDay("insulinEvents", eventId);
  }

  function addGlucoseEventToDay(input) {
    const eventEntry = {
      id: createId("glucose-event"),
      type: "glucose",
      eventTime: input.eventTime || new Date().toISOString(),
      glucoseValue: input.glucoseValue || "",
      note: input.note || "",
      createdAt: new Date().toLocaleString("nl-NL"),
    };

    return addEntryToDay(input, "glucoseEvents", eventEntry);
  }

  function updateGlucoseEvent(eventId, updates) {
    updateEntryInSelectedDay("glucoseEvents", eventId, updates);
  }

  function deleteGlucoseEvent(eventId) {
    deleteEntryFromSelectedDay("glucoseEvents", eventId);
  }

  function addGlucoseBoostEventToDay(input) {
    const eventEntry = {
      id: createId("glucose-boost"),
      type: "glucoseBoost",
      eventTime: input.eventTime || new Date().toISOString(),
      kh: input.kh || "",
      source: input.source || "",
      note: input.note || "",
      createdAt: new Date().toLocaleString("nl-NL"),
    };

    return addEntryToDay(input, "glucoseBoostEvents", eventEntry);
  }

  function updateGlucoseBoostEvent(eventId, updates) {
    updateEntryInSelectedDay("glucoseBoostEvents", eventId, updates);
  }

  function deleteGlucoseBoostEvent(eventId) {
    deleteEntryFromSelectedDay("glucoseBoostEvents", eventId);
  }

  function addMovementEventToDay(input) {
    const eventEntry = {
      id: createId("movement-event"),
      type: "movement",
      eventTime: input.eventTime || new Date().toISOString(),
      activityType: input.activityType || "Krachttraining",
      intensityType: input.intensityType || "Gemengd",
      durationMinutes: input.durationMinutes || "",
      note: input.note || "",
      createdAt: new Date().toLocaleString("nl-NL"),
      repeat: input.repeat || "none",
    };

    return addEntryToDay(input, "movementEvents", eventEntry);
  }

  function updateMovementEvent(eventId, updates) {
    updateEntryInSelectedDay("movementEvents", eventId, updates);
  }

  function deleteMovementEvent(eventId) {
    deleteEntryFromSelectedDay("movementEvents", eventId);
  }

  function addSupplementEventToDay(input) {
    const eventEntry = {
      id: createId("supplement-event"),
      type: "supplement",
      eventTime: input.eventTime || new Date().toISOString(),
      name: input.name || "",
      dosage: input.dosage || "",
      note: input.note || "",
      createdAt: new Date().toLocaleString("nl-NL"),
      repeat: input.repeat || "none",
    };

    return addEntryToDay(input, "supplementEvents", eventEntry);
  }

  function updateSupplementEvent(eventId, updates) {
    updateEntryInSelectedDay("supplementEvents", eventId, updates);
  }

  function deleteSupplementEvent(eventId) {
    deleteEntryFromSelectedDay("supplementEvents", eventId);
  }

  function addBowelEventToDay(input) {
    const eventEntry = {
      id: createId("bowel-event"),
      type: "bowel",
      eventTime: input.eventTime || new Date().toISOString(),
      bowelColor: input.bowelColor || "",
      bristolScore: input.bristolScore || "4",
      urgency: input.urgency || "",
      note: input.note || "",
      createdAt: new Date().toLocaleString("nl-NL"),
    };

    return addEntryToDay(input, "bowelEvents", eventEntry);
  }

  function updateBowelEvent(eventId, updates) {
    updateEntryInSelectedDay("bowelEvents", eventId, updates);
  }

  function deleteBowelEvent(eventId) {
    deleteEntryFromSelectedDay("bowelEvents", eventId);
  }

  function addNoteEventToDay(input) {
    const eventEntry = {
      id: createId("note-event"),
      type: "note",
      eventTime: input.eventTime || new Date().toISOString(),
      note: input.note || "",
      context: input.context || "",
      alarmEnabled: input.alarmEnabled || false,
      alarmAt: input.alarmAt || null,
      createdAt: new Date().toLocaleString("nl-NL"),
    };

    return addEntryToDay(input, "noteEvents", eventEntry);
  }

  function updateNoteEvent(eventId, updates) {
    updateEntryInSelectedDay("noteEvents", eventId, updates);
  }

  function deleteNoteEvent(eventId) {
    deleteEntryFromSelectedDay("noteEvents", eventId);
  }

  function addTrainingPlanEventToDay(input) {
    const eventEntry = {
      id: createId("training-plan-event"),
      type: "trainingPlan",
      eventTime: input.eventTime || new Date().toISOString(),
      title: input.title || "",
      trainingType: input.trainingType || "Krachttraining",
      durationMinutes: input.durationMinutes || "",
      note: input.note || "",
      createdAt: new Date().toLocaleString("nl-NL"),
    };

    return addEntryToDay(input, "trainingPlanEvents", eventEntry);
  }

  function updateTrainingPlanEvent(eventId, updates) {
    updateEntryInSelectedDay("trainingPlanEvents", eventId, updates);
  }

  function deleteTrainingPlanEvent(eventId) {
    deleteEntryFromSelectedDay("trainingPlanEvents", eventId);
  }

  function fillDailyRepeats() {
    const previousDate = new Date(selectedDate);
    previousDate.setDate(previousDate.getDate() - 1);

    const previousDateString = previousDate.toISOString().slice(0, 10);

    const sourceDay = dailyLog.find((day) => day.date === previousDateString);
    const targetDay =
      dailyLog.find((day) => day.date === selectedDate) ||
      createEmptyDay(selectedDate);

    if (!sourceDay) return false;

    const existingMealSignatures = createRepeatSignatureSet(
      targetDay.meals || [],
      "meal",
    );
    const existingSupplementSignatures = createRepeatSignatureSet(
      targetDay.supplementEvents || [],
      "supplement",
    );
    const existingMovementSignatures = createRepeatSignatureSet(
      targetDay.movementEvents || [],
      "movement",
    );

    const repeatedMeals = (sourceDay.meals || [])
      .filter((meal) => meal.repeat === "daily")
      .filter((meal) => shouldCopyRepeat(existingMealSignatures, meal, "meal"))
      .map((meal) => ({
        ...meal,
        id: createId("daily-meal"),
        eatenAt: `${selectedDate}T${getTimePart(meal.eatenAt, "12:00")}`,
        createdAt: new Date().toLocaleString("nl-NL"),
        repeat: "none",
      }));

    const repeatedSupplements = (sourceDay.supplementEvents || [])
      .filter((item) => item.repeat === "daily")
      .filter((item) =>
        shouldCopyRepeat(existingSupplementSignatures, item, "supplement"),
      )
      .map((item) => ({
        ...item,
        id: createId("supplement-event"),
        eventTime: `${selectedDate}T${getTimePart(item.eventTime, "08:00")}`,
        createdAt: new Date().toLocaleString("nl-NL"),
        repeat: "none",
      }));

    const repeatedMovements = (sourceDay.movementEvents || [])
      .filter((item) => item.repeat === "daily")
      .filter((item) =>
        shouldCopyRepeat(existingMovementSignatures, item, "movement"),
      )
      .map((item) => ({
        ...item,
        id: createId("movement-event"),
        eventTime: `${selectedDate}T${getTimePart(item.eventTime, "10:00")}`,
        createdAt: new Date().toLocaleString("nl-NL"),
        repeat: "none",
      }));

    if (
      repeatedMeals.length === 0 &&
      repeatedSupplements.length === 0 &&
      repeatedMovements.length === 0
    ) {
      return false;
    }

    setDailyLog((prev) => {
      const existingTargetDay =
        prev.find((day) => day.date === selectedDate) ||
        createEmptyDay(selectedDate);

      const nextTargetDay = {
        ...normalizeDay(existingTargetDay),

        meals: [...(existingTargetDay.meals || []), ...repeatedMeals],

        supplementEvents: [
          ...(existingTargetDay.supplementEvents || []),
          ...repeatedSupplements,
        ],

        movementEvents: [
          ...(existingTargetDay.movementEvents || []),
          ...repeatedMovements,
        ],
      };

      const withoutTarget = prev.filter((day) => day.date !== selectedDate);

      return sortDaysNewestFirst([
        ...withoutTarget.map(normalizeDay),
        nextTargetDay,
      ]);
    });

    return true;
  }

  function clearDailyLog() {
    setDailyLog((prev) => prev.filter((day) => day.date !== selectedDate));
  }

  return {
    dailyLog,
    setDailyLog,
    selectedDay,
    dayTotals,
    insulinTotal,
    sortedDates,

    addMealToDay,
    deleteMealFromDay,
    updateMealTime,
    updateMealMedicalLog,

    fillDailyRepeats,
    clearDailyLog,

    addInsulinEventToDay,
    updateInsulinEvent,
    deleteInsulinEvent,

    addGlucoseEventToDay,
    updateGlucoseEvent,
    deleteGlucoseEvent,

    addGlucoseBoostEventToDay,
    updateGlucoseBoostEvent,
    deleteGlucoseBoostEvent,

    addMovementEventToDay,
    updateMovementEvent,
    deleteMovementEvent,

    addSupplementEventToDay,
    updateSupplementEvent,
    deleteSupplementEvent,

    addBowelEventToDay,
    updateBowelEvent,
    deleteBowelEvent,

    addNoteEventToDay,
    updateNoteEvent,
    deleteNoteEvent,

    addTrainingPlanEventToDay,
    updateTrainingPlanEvent,
    deleteTrainingPlanEvent,
  };
}
