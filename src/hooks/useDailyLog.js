import { useEffect, useMemo, useState } from "react";
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

export function useDailyLog(selectedDate) {
  const [dailyLog, setDailyLog] = useState(() => loadDailyLog());
  const [cloudLoaded, setCloudLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCloud() {
      const cloudDailyLog = await loadDailyLogFromCloud();

      console.log("CLOUD RAW:", cloudDailyLog);
      console.log(
        "CLOUD DATES:",
        cloudDailyLog?.map((day) => ({
          date: day.date,
          meals: day.meals?.length || 0,
          insulin: day.insulinEvents?.length || 0,
          glucose: day.glucoseEvents?.length || 0,
          movement: day.movementEvents?.length || 0,
        })),
      );
      console.log("SELECTED DATE:", selectedDate);
      console.log(
        "CLOUD SELECTED DAY:",
        cloudDailyLog?.find((day) => day.date === selectedDate),
      );

      if (cancelled) return;

      if (cloudDailyLog) {
        setDailyLog(cloudDailyLog);
      }

      setCloudLoaded(true);
    }

    loadCloud();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveDailyLog(dailyLog);

    if (!cloudLoaded) return;
    if (!dailyLog || dailyLog.length === 0) return;

    const timeoutId = setTimeout(() => {
      saveDailyLogToCloud(dailyLog).then((ok) => {
        console.log("cloud save result:", ok);
      });
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [dailyLog, cloudLoaded]);

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

      // Alarm / reminder voor gepland eetmoment
      alarmEnabled: input.alarmEnabled || false,
      alarmAt: input.alarmAt || null,

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
    const nextDate = String(nextEatenAt || "").slice(0, 10);

    setDailyLog((prev) => {
      let mealToMove = null;

      // 1. Haal maaltijd uit de oude dag
      const withoutMeal = prev
        .map((day) => {
          const foundMeal = (day.meals || []).find(
            (meal) => meal.id === mealId,
          );

          if (!foundMeal) {
            return day;
          }

          mealToMove = {
            ...foundMeal,
            eatenAt: nextEatenAt,
          };

          return {
            ...day,
            meals: (day.meals || []).filter((meal) => meal.id !== mealId),
          };
        })
        .filter(
          (day) =>
            (day.meals || []).length > 0 ||
            (day.insulinEvents || []).length > 0 ||
            (day.glucoseEvents || []).length > 0 ||
            (day.glucoseBoostEvents || []).length > 0 ||
            (day.movementEvents || []).length > 0,
        );

      if (!mealToMove || !nextDate) {
        return prev;
      }

      // 2. Zet maaltijd in de nieuwe dag
      const existingTargetDay = withoutMeal.find(
        (day) => day.date === nextDate,
      );

      if (existingTargetDay) {
        return withoutMeal
          .map((day) =>
            day.date === nextDate
              ? {
                  ...day,
                  meals: [...(day.meals || []), mealToMove],
                }
              : day,
          )
          .sort((a, b) => String(b.date).localeCompare(String(a.date)));
      }

      return [
        ...withoutMeal,
        {
          date: nextDate,
          meals: [mealToMove],
          insulinEvents: [],
          glucoseEvents: [],
          glucoseBoostEvents: [],
          movementEvents: [],
        },
      ].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    });
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

  // Glucosemoment toevoegen
  function addGlucoseEventToDay(input) {
    const eventEntry = {
      id: createId("glucose-event"),
      type: "glucose",
      eventTime: input.eventTime || new Date().toISOString(),
      glucoseValue: input.glucoseValue || "",
      note: input.note || "",
      createdAt: new Date().toLocaleString("nl-NL"),
    };

    setDailyLog((prev) => {
      const existingDay = prev.find((d) => d.date === input.date);

      if (existingDay) {
        return prev.map((d) =>
          d.date === input.date
            ? { ...d, glucoseEvents: [...(d.glucoseEvents || []), eventEntry] }
            : d,
        );
      }

      return [
        ...prev,
        {
          date: input.date,
          meals: [],
          insulinEvents: [],
          glucoseEvents: [eventEntry],
        },
      ].sort((a, b) =>
        String(b?.date || "").localeCompare(String(a?.date || "")),
      );
    });
  }

  // Glucosemoment wijzigen
  function updateGlucoseEvent(eventId, updates) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              glucoseEvents: (day.glucoseEvents || []).map((event) =>
                event.id === eventId ? { ...event, ...updates } : event,
              ),
            }
          : day,
      ),
    );
  }

  // Glucosemoment verwijderen
  function deleteGlucoseEvent(eventId) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              glucoseEvents: (day.glucoseEvents || []).filter(
                (event) => event.id !== eventId,
              ),
            }
          : day,
      ),
    );
  }

  // Glucoseboost toevoegen
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

    setDailyLog((prev) => {
      const existingDay = prev.find((d) => d.date === input.date);

      if (existingDay) {
        return prev.map((d) =>
          d.date === input.date
            ? {
                ...d,
                glucoseBoostEvents: [
                  ...(d.glucoseBoostEvents || []),
                  eventEntry,
                ],
              }
            : d,
        );
      }

      return [
        ...prev,
        {
          date: input.date,
          meals: [],
          insulinEvents: [],
          glucoseEvents: [],
          glucoseBoostEvents: [eventEntry],
        },
      ].sort((a, b) =>
        String(b?.date || "").localeCompare(String(a?.date || "")),
      );
    });
  }

  // Glucoseboost wijzigen
  function updateGlucoseBoostEvent(eventId, updates) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              glucoseBoostEvents: (day.glucoseBoostEvents || []).map((event) =>
                event.id === eventId ? { ...event, ...updates } : event,
              ),
            }
          : day,
      ),
    );
  }

  // Glucoseboost verwijderen
  function deleteGlucoseBoostEvent(eventId) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              glucoseBoostEvents: (day.glucoseBoostEvents || []).filter(
                (event) => event.id !== eventId,
              ),
            }
          : day,
      ),
    );
  }

  // Beweging/sport toevoegen
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
    };

    setDailyLog((prev) => {
      const existingDay = prev.find((d) => d.date === input.date);

      if (existingDay) {
        return prev.map((d) =>
          d.date === input.date
            ? {
                ...d,
                movementEvents: [...(d.movementEvents || []), eventEntry],
              }
            : d,
        );
      }

      return [
        ...prev,
        {
          date: input.date,
          meals: [],
          insulinEvents: [],
          glucoseEvents: [],
          glucoseBoostEvents: [],
          movementEvents: [eventEntry],
          supplementEvents: [],
          bowelEvents: [],
          noteEvents: [],
        },
      ].sort((a, b) =>
        String(b?.date || "").localeCompare(String(a?.date || "")),
      );
    });

    return eventEntry;
  }

  function updateMovementEvent(eventId, updates) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              movementEvents: (day.movementEvents || []).map((event) =>
                event.id === eventId ? { ...event, ...updates } : event,
              ),
            }
          : day,
      ),
    );
  }

  function deleteMovementEvent(eventId) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              movementEvents: (day.movementEvents || []).filter(
                (event) => event.id !== eventId,
              ),
            }
          : day,
      ),
    );
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
    };

    setDailyLog((prev) => {
      const existingDay = prev.find((d) => d.date === input.date);

      if (existingDay) {
        return prev.map((d) =>
          d.date === input.date
            ? {
                ...d,
                supplementEvents: [...(d.supplementEvents || []), eventEntry],
              }
            : d,
        );
      }

      return [
        ...prev,
        {
          date: input.date,
          meals: [],
          insulinEvents: [],
          glucoseEvents: [],
          glucoseBoostEvents: [],
          movementEvents: [],
          supplementEvents: [eventEntry],
          bowelEvents: [],
          noteEvents: [],
        },
      ].sort((a, b) =>
        String(b?.date || "").localeCompare(String(a?.date || "")),
      );
    });

    return eventEntry;
  }

  function updateSupplementEvent(eventId, updates) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              supplementEvents: (day.supplementEvents || []).map((event) =>
                event.id === eventId ? { ...event, ...updates } : event,
              ),
            }
          : day,
      ),
    );
  }

  function deleteSupplementEvent(eventId) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              supplementEvents: (day.supplementEvents || []).filter(
                (event) => event.id !== eventId,
              ),
            }
          : day,
      ),
    );
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

    setDailyLog((prev) => {
      const existingDay = prev.find((d) => d.date === input.date);

      if (existingDay) {
        return prev.map((d) =>
          d.date === input.date
            ? {
                ...d,
                bowelEvents: [...(d.bowelEvents || []), eventEntry],
              }
            : d,
        );
      }

      return [
        ...prev,
        {
          date: input.date,
          meals: [],
          insulinEvents: [],
          glucoseEvents: [],
          glucoseBoostEvents: [],
          movementEvents: [],
          supplementEvents: [],
          bowelEvents: [eventEntry],
          noteEvents: [],
        },
      ].sort((a, b) =>
        String(b?.date || "").localeCompare(String(a?.date || "")),
      );
    });

    return eventEntry;
  }

  function updateBowelEvent(eventId, updates) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              bowelEvents: (day.bowelEvents || []).map((event) =>
                event.id === eventId ? { ...event, ...updates } : event,
              ),
            }
          : day,
      ),
    );
  }

  function deleteBowelEvent(eventId) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              bowelEvents: (day.bowelEvents || []).filter(
                (event) => event.id !== eventId,
              ),
            }
          : day,
      ),
    );
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

    setDailyLog((prev) => {
      const existingDay = prev.find((d) => d.date === input.date);

      if (existingDay) {
        return prev.map((d) =>
          d.date === input.date
            ? { ...d, noteEvents: [...(d.noteEvents || []), eventEntry] }
            : d,
        );
      }

      return [
        ...prev,
        {
          date: input.date,
          meals: [],
          insulinEvents: [],
          glucoseEvents: [],
          glucoseBoostEvents: [],
          movementEvents: [],
          bowelEvents: [],
          noteEvents: [eventEntry],
        },
      ].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    });
    return eventEntry;
  }

  function updateNoteEvent(eventId, updates) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              noteEvents: (day.noteEvents || []).map((event) =>
                event.id === eventId ? { ...event, ...updates } : event,
              ),
            }
          : day,
      ),
    );
  }

  function deleteNoteEvent(eventId) {
    setDailyLog((prev) =>
      prev.map((day) =>
        day.date === selectedDate
          ? {
              ...day,
              noteEvents: (day.noteEvents || []).filter(
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
  };
}
