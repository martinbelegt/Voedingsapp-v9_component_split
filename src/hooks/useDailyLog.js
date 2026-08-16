import { useEffect, useMemo, useRef, useState } from "react";
import { createId } from "../services/idService";
import { createSupplementEvent } from "../services/supplementEventService";
import {
  loadDailyLog,
  loadDailyLogSyncMetadata,
  saveDailyLog,
  saveDailyLogConflictBackup,
  saveDailyLogSyncMetadata,
  loadDailyLogFromCloud,
  saveDailyLogToCloud,
} from "../services/localStorageService";
import {
  areJsonValuesEqual,
  decideInitialArrayAuthority,
  interpretRevisionSaveResult,
} from "../services/syncSafetyService";
import { moveDailyLogEvent } from "../services/dailyLogEventMoveService";
import { getAdministeredInsulinTotal } from "../services/insulinService";
import { getDailyCreonSummary } from "../services/creonSemanticsService";
import {
  addTrainingPlanEvent,
  createTrainingPlanEvent,
  removeTrainingPlanEvent,
} from "../services/trainingPlanService";
import {
  addSportSupplementPlanEvent,
  createSportSupplementPlanEvent,
  removeSportSupplementPlanEvent,
} from "../services/sportSupplementPlanService";
import {
  registerSportSupplementPlanIntake,
  registerTrainingPlanExecution,
} from "../services/plannedExecutionService";
import { createWeightEvent } from "../services/weightEventService";

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
    creon35: Number(totals.creon35) || Number(totals.best?.c35) || 0,
    creon25: Number(totals.creon25) || Number(totals.best?.c25) || 0,
    creon10: Number(totals.creon10) || Number(totals.best?.c10) || 0,
    creon5: Number(totals.creon5) || Number(totals.best?.c5) || 0,
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
    weightEvents: [],
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
    weightEvents: day.weightEvents || [],
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
    (day.weightEvents || []).length > 0 ||
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
      (day.weightEvents || []).length +
      (day.supplementEvents || []).length +
      (day.bowelEvents || []).length +
      (day.noteEvents || []).length +
      (day.trainingPlanEvents || []).length +
      (day.sportSupplementPlanEvents || []).length,
    0,
  );
}

const isDevelopment = process.env.NODE_ENV === "development";

function createSyncDebugState(localDailyLog = [], syncMetadata = null) {
  const localDays = Array.isArray(localDailyLog) ? localDailyLog.length : 0;
  const hasKnownRevision = Number.isInteger(syncMetadata?.revision);
  const hasKnownDirtyState = typeof syncMetadata?.dirty === "boolean";

  return {
    source: "Local",
    status: "loading",
    conflict: false,
    decision: {
      action: "pending",
      reason: null,
      contentEqual: null,
    },
    cloud: {
      revision: null,
      days: null,
      events: null,
      updatedAt: null,
      lastSuccessfulSaveAt: null,
    },
    local: {
      revision: hasKnownRevision ? syncMetadata.revision : null,
      baselineKnown: hasKnownRevision,
      dirty: hasKnownDirtyState ? syncMetadata.dirty : null,
      days: localDays,
      events: Array.isArray(localDailyLog)
        ? countDailyLogEvents(localDailyLog)
        : 0,
      lastSaveAt: null,
    },
  };
}

function logSyncBlock(lines) {
  if (!isDevelopment) return;
  console.log(["[SYNC]", ...lines].join("\n"));
}

function logSyncRuntime(message, details = {}) {
  if (!isDevelopment) return;
  console.log(`[Companion Sync] ${message}`, details);
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
  const initialSyncMetadata = useRef(loadDailyLogSyncMetadata());
  const [dailyLog, setDailyLogState] = useState(() =>
    sortDaysNewestFirst((loadDailyLog() || []).map(normalizeDay)),
  );
  const [syncDebug, setSyncDebug] = useState(() =>
    createSyncDebugState(dailyLog, initialSyncMetadata.current),
  );
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const hasHydratedCloudData = useRef(false);
  const hasLocalUserChange = useRef(
    initialSyncMetadata.current?.dirty === true,
  );
  const cloudHydratedDayCount = useRef(0);
  const cloudHydratedEventCount = useRef(0);
  const loadedRevision = useRef(
    Number.isInteger(initialSyncMetadata.current?.revision)
      ? initialSyncMetadata.current.revision
      : null,
  );
  const localChangeVersion = useRef(0);
  const cloudWriteBlockedByConflict = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCloud() {
      const mutationVersionAtLoadStart = localChangeVersion.current;

      try {
        const cloudResult = await loadDailyLogFromCloud();

        if (cancelled) return;

        const localChangedDuringLoad =
          localChangeVersion.current !== mutationVersionAtLoadStart;
        const currentLocalLog = dailyLog;
        const comparableCloudLog = Array.isArray(cloudResult.dailyLog)
          ? sortDaysNewestFirst(cloudResult.dailyLog.map(normalizeDay))
          : null;
        const contentEqual = comparableCloudLog
          ? areJsonValuesEqual(currentLocalLog, comparableCloudLog)
          : null;
        const decision = decideInitialArrayAuthority({
          localValue: currentLocalLog,
          cloudResult,
          localChangedDuringLoad,
          localKnownRevision: loadedRevision.current,
          localDirty: hasLocalUserChange.current,
        });
        logSyncRuntime("cloud load decision", {
          cloudRevision: cloudResult.revision,
          localKnownRevision: loadedRevision.current,
          localDirty: hasLocalUserChange.current,
          localChangedDuringLoad,
          action: decision.action,
          status: decision.status,
          reason: decision.reason,
          contentEqual,
        });

        if (
          cloudResult.status === "error" ||
          cloudResult.status === "invalid"
        ) {
          console.warn(
            "dailyLog cloud load kept local data:",
            cloudResult.status,
            cloudResult.error,
          );
          setSyncDebug((prev) => ({
            ...prev,
            status: "error",
            source: "Local",
            decision: {
              action: decision.action,
              reason: decision.reason,
              contentEqual,
            },
          }));
          setCloudLoaded(true);
          return;
        }

        if (decision.action === "keep-local") {
          cloudWriteBlockedByConflict.current =
            decision.status === "conflict";
          console.warn("dailyLog cloud load kept local data:", decision.reason);
          setSyncDebug((prev) => ({
            ...prev,
            status: decision.status,
            source: "Local",
            conflict: decision.status === "conflict",
            decision: {
              action: decision.action,
              reason: decision.reason,
              contentEqual,
            },
            cloud: {
              ...prev.cloud,
              revision: Number.isInteger(cloudResult.revision)
                ? cloudResult.revision
                : null,
              days: Array.isArray(cloudResult.dailyLog)
                ? cloudResult.dailyLog.length
                : null,
              events: Array.isArray(cloudResult.dailyLog)
                ? countDailyLogEvents(cloudResult.dailyLog)
                : null,
              updatedAt: cloudResult.updatedAt || null,
            },
            local: {
              ...prev.local,
              revision: loadedRevision.current,
              baselineKnown: Number.isInteger(loadedRevision.current),
              dirty: hasLocalUserChange.current,
            },
          }));
          setCloudLoaded(true);
          return;
        }

        const cloudDailyLog = cloudResult.dailyLog;
        const normalizedCloudLog = sortDaysNewestFirst(
          cloudDailyLog.map(normalizeDay),
        );
        const cloudEventCount = countDailyLogEvents(normalizedCloudLog);

        if (
          decision.action === "compare-non-empty" &&
          !areJsonValuesEqual(currentLocalLog, normalizedCloudLog)
        ) {
          cloudWriteBlockedByConflict.current = true;
          setSyncDebug((prev) => ({
            ...prev,
            status: "conflict",
            source: "Local",
            conflict: true,
            decision: {
              action: decision.action,
              reason: decision.reason,
              contentEqual,
            },
            cloud: {
              ...prev.cloud,
              revision: Number.isInteger(cloudResult.revision)
                ? cloudResult.revision
                : null,
              days: normalizedCloudLog.length,
              events: cloudEventCount,
              updatedAt: cloudResult.updatedAt,
            },
            local: {
              ...prev.local,
              revision: loadedRevision.current,
              baselineKnown: Number.isInteger(loadedRevision.current),
              dirty: hasLocalUserChange.current,
            },
          }));
          console.warn(
            "dailyLog initial sync conflict: local and cloud are both non-empty; local data retained",
          );
          setCloudLoaded(true);
          return;
        }

        hasHydratedCloudData.current = true;
        cloudWriteBlockedByConflict.current = false;
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
        saveDailyLogSyncMetadata(loadedRevision.current, false);
        hasLocalUserChange.current = false;
        const localSaveAt = new Date().toISOString();
        setSyncDebug((prev) => ({
          ...prev,
          status: "synced",
          source: "Cloud",
          conflict: false,
          decision: {
            action: decision.action,
            reason: decision.reason,
            contentEqual,
          },
          cloud: {
            ...prev.cloud,
            revision: loadedRevision.current,
            days: normalizedCloudLog.length,
            events: cloudEventCount,
            updatedAt: cloudResult.updatedAt,
          },
          local: {
            ...prev.local,
            revision: loadedRevision.current,
            baselineKnown: true,
            dirty: false,
            days: normalizedCloudLog.length,
            events: cloudEventCount,
            lastSaveAt: localSaveAt,
          },
        }));
        logSyncBlock([
          "Loaded from cloud",
          "",
          `Revision: ${loadedRevision.current}`,
          "",
          `Days: ${normalizedCloudLog.length}`,
          "",
          `Events: ${cloudEventCount}`,
        ]);
        setCloudLoaded(true);
      } catch (error) {
        if (cancelled) return;

        console.error("dailyLog cloud load failure:", error);
        setSyncDebug((prev) => ({
          ...prev,
          status: "error",
          source: "Local",
        }));
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
    const localSaveAt = new Date().toISOString();
    const currentLocalDayCount = Array.isArray(dailyLog) ? dailyLog.length : 0;
    const currentLocalEventCount = countDailyLogEvents(dailyLog);

    setSyncDebug((prev) => ({
      ...prev,
      local: {
        ...prev.local,
        days: currentLocalDayCount,
        events: currentLocalEventCount,
        lastSaveAt: localSaveAt,
      },
    }));

    if (!cloudLoaded) {
      console.log("dailyLog cloud save skipped: cloud load not finished");
      return;
    }

    if (!hasHydratedCloudData.current) {
      console.warn("dailyLog cloud save skipped: cloud data not hydrated");
      return;
    }

    if (cloudWriteBlockedByConflict.current) {
      console.warn(
        "dailyLog cloud save skipped: reconciliation required after conflict",
      );
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

    const localDayCount = dailyLog.length;
    const localEventCount = countDailyLogEvents(dailyLog);

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
        logSyncRuntime("cloud save result", {
          expectedRevision,
          resultRevision: result?.revision,
          ok: result?.ok,
          conflict: result?.conflict,
          changeVersion: saveChangeVersion,
        });
        console.log("dailyLog cloud save result:", result);
        const saveOutcome = interpretRevisionSaveResult(result);

        if (saveOutcome.status === "synced") {
          const cloudSaveAt = new Date().toISOString();
          const hasNewerLocalChange =
            saveChangeVersion !== localChangeVersion.current;
          loadedRevision.current = result.revision;
          hasLocalUserChange.current = hasNewerLocalChange;
          saveDailyLogSyncMetadata(
            result.revision,
            hasNewerLocalChange,
          );
          cloudWriteBlockedByConflict.current = false;
          cloudHydratedDayCount.current = localDayCount;
          cloudHydratedEventCount.current = localEventCount;
          setSyncDebug((prev) => ({
            ...prev,
            status: "synced",
            source: "Cloud",
            conflict: false,
            cloud: {
              ...prev.cloud,
              revision: result.revision,
              days: localDayCount,
              events: localEventCount,
              updatedAt: result.updatedAt || cloudSaveAt,
              lastSuccessfulSaveAt: cloudSaveAt,
            },
            local: {
              ...prev.local,
              revision: result.revision,
              baselineKnown: true,
              dirty: hasNewerLocalChange,
              days: localDayCount,
              events: localEventCount,
            },
          }));
          logSyncBlock([
            "Cloud save success: true",
            "",
            `Old revision: ${expectedRevision}`,
            `New revision: ${result.revision}`,
            "",
            `Local days: ${localDayCount}`,
            `Cloud days: ${localDayCount}`,
            "",
            "Status: OK",
          ]);

          if (hasNewerLocalChange) {
            console.warn(
              "dailyLog cloud save succeeded for an older local change; newer local changes remain unsaved",
              {
                savedChangeVersion: saveChangeVersion,
                currentChangeVersion: localChangeVersion.current,
                revision: loadedRevision.current,
              },
            );
          }
        } else if (saveOutcome.status === "conflict") {
          cloudWriteBlockedByConflict.current = saveOutcome.blockWrites;
          console.warn(
            "dailyLog cloud save blocked: Supabase has a newer revision; localStorage keeps the local changes",
            {
              expectedRevision,
              serverRevision: result.revision,
              days: localDayCount,
              events: localEventCount,
            },
          );
          setSyncDebug((prev) => ({
            ...prev,
            status: "conflict",
            conflict: true,
            cloud: {
              ...prev.cloud,
              revision: Number.isInteger(result.revision)
                ? result.revision
                : prev.cloud.revision,
            },
            local: {
              ...prev.local,
              revision: expectedRevision,
              baselineKnown: true,
              dirty: true,
              days: localDayCount,
              events: localEventCount,
            },
          }));
          logSyncBlock([
            "Cloud save success: false",
            "",
            `Expected revision: ${expectedRevision}`,
            `Actual revision: ${result.revision}`,
            "",
            "Reload required",
          ]);
        } else {
          setSyncDebug((prev) => ({
            ...prev,
            status: "error",
            source: "Local",
          }));
        }
      });
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [dailyLog, cloudLoaded]);

  function setDailyLog(nextDailyLog) {
    hasLocalUserChange.current = true;
    localChangeVersion.current += 1;
    saveDailyLogSyncMetadata(loadedRevision.current, true);
    setSyncDebug((prev) => ({
      ...prev,
      local: {
        ...prev.local,
        revision: loadedRevision.current,
        baselineKnown: Number.isInteger(loadedRevision.current),
        dirty: true,
      },
    }));
    logSyncRuntime("local mutation marked dirty", {
      knownRevision: loadedRevision.current,
      changeVersion: localChangeVersion.current,
      cloudHydrated: hasHydratedCloudData.current,
      writeBlockedByConflict: cloudWriteBlockedByConflict.current,
    });

    if (!hasHydratedCloudData.current) {
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
        actualCreon25: 0,
        actualCreon10: 0,
        hasActualCreon: false,
      };
    }

    const mealTotals = normalizeTotals(
      (selectedDay.meals || []).reduce(
        (acc, meal) => {
          acc.kh += Number(meal.totals?.kh) || 0;
          acc.protein += Number(meal.totals?.protein) || 0;
          acc.fat += Number(meal.totals?.fat) || 0;
          acc.kcal += Number(meal.totals?.kcal) || 0;
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
    const creonSummary = getDailyCreonSummary(selectedDay);

    return {
      ...mealTotals,
      // Bestaande creon25/creon10 keys blijven de adviessnapshot-totalen.
      creon25: creonSummary.adviceCreon25,
      creon10: creonSummary.adviceCreon10,
      actualCreon25: creonSummary.actualCreon25,
      actualCreon10: creonSummary.actualCreon10,
      hasActualCreon: creonSummary.hasActualCreon,
      // insulinEvents is de enige primaire bron voor werkelijk toegediend.
      // meal.totals.insulin blijft advies; meal.actualInsulin blijft legacy.
      insulin: getAdministeredInsulinTotal(selectedDay),
    };
  }, [selectedDay]);

  const insulinTotal = getAdministeredInsulinTotal(selectedDay);

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

  function updateOrMoveEntry(key, eventId, updates) {
    setDailyLog((prev) => {
      const result = moveDailyLogEvent({
        dailyLog: prev,
        collection: key,
        eventId,
        updates,
      });

      if (!result.moved) {
        console.warn("dailyLog event update/move refused:", {
          collection: key,
          eventId,
          reason: result.reason,
        });
      }

      return result.dailyLog;
    });
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
      // Alleen voor backwards compatibility met bestaande maaltijddata.
      // Nieuwe werkelijke doses worden als insulinEvents geregistreerd.
      actualInsulin: input.actualInsulin || "",
      insulinType: input.insulinType || "Novorapid",
      insulinTime: input.insulinTime || "",
      // Historische expliciete registratie binnen een maaltijd. Niet afleiden
      // uit totals.creon*: die waarden zijn uitsluitend Creonadvies.
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
    updateOrMoveEntry("insulinEvents", eventId, updates);
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
    updateOrMoveEntry("glucoseEvents", eventId, updates);
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
    updateOrMoveEntry("glucoseBoostEvents", eventId, updates);
  }

  function deleteGlucoseBoostEvent(eventId) {
    deleteEntryFromSelectedDay("glucoseBoostEvents", eventId);
  }

  function addMovementEventToDay(input) {
    const eventEntry = {
      id: createId("movement-event"),
      type: "movement",
      eventTime: input.eventTime || new Date().toISOString(),
      activityType: input.activityType || "Beweging",
      intensityType: input.intensityType || "Gemengd",
      durationMinutes: input.durationMinutes || "",
      note: input.note || "",
      exerciseId: input.exerciseId || "",
      exerciseName: input.exerciseName || "",
      personalDosage: input.personalDosage || "",
      side: input.side || "",
      routineExecution: input.routineExecution || null,
      createdAt: new Date().toLocaleString("nl-NL"),
      repeat: input.repeat || "none",
    };

    return addEntryToDay(input, "movementEvents", eventEntry);
  }

  function updateMovementEvent(eventId, updates) {
    updateOrMoveEntry("movementEvents", eventId, updates);
  }

  function deleteMovementEvent(eventId) {
    deleteEntryFromSelectedDay("movementEvents", eventId);
  }

  function addWeightEventToDay(input) {
    const { date, event } = createWeightEvent(input, { createId });
    return addEntryToDay({ ...input, date }, "weightEvents", event);
  }

  function updateWeightEvent(eventId, updates) {
    updateOrMoveEntry("weightEvents", eventId, {
      ...updates,
      ...(updates.eventTime ? { datetime: updates.eventTime } : {}),
    });
  }

  function deleteWeightEvent(eventId) {
    deleteEntryFromSelectedDay("weightEvents", eventId);
  }

  function addSupplementEventToDay(input) {
    const eventEntry = createSupplementEvent(input, { createId });

    return addEntryToDay(input, "supplementEvents", eventEntry);
  }

  function updateSupplementEvent(eventId, updates) {
    updateOrMoveEntry("supplementEvents", eventId, updates);
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
    updateOrMoveEntry("bowelEvents", eventId, updates);
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
    updateOrMoveEntry("noteEvents", eventId, updates);
  }

  function deleteNoteEvent(eventId) {
    deleteEntryFromSelectedDay("noteEvents", eventId);
  }

  function addTrainingPlanEventToDay(input) {
    const { date, event } = createTrainingPlanEvent(input, { createId });
    setDailyLog((prev) => addTrainingPlanEvent(prev, date, event));
    return event;
  }

  function updateTrainingPlanEvent(eventId, updates) {
    updateOrMoveEntry("trainingPlanEvents", eventId, updates);
  }

  function deleteTrainingPlanEvent(eventId) {
    setDailyLog((prev) => removeTrainingPlanEvent(prev, eventId));
  }

  function addSportSupplementPlanEventToDay(input) {
    const { date, event } = createSportSupplementPlanEvent(input, { createId });
    setDailyLog((prev) => addSportSupplementPlanEvent(prev, date, event));
    return event;
  }

  function updateSportSupplementPlanEvent(eventId, updates) {
    updateOrMoveEntry("sportSupplementPlanEvents", eventId, updates);
  }

  function deleteSportSupplementPlanEvent(eventId) {
    setDailyLog((prev) => removeSportSupplementPlanEvent(prev, eventId));
  }

  function executeTrainingPlan(training, input) {
    setDailyLog((prev) =>
      registerTrainingPlanExecution(prev, training, input, { createId })
        .dailyLog,
    );
  }

  function takeSportSupplementPlan(plan, input) {
    setDailyLog((prev) =>
      registerSportSupplementPlanIntake(prev, plan, input, { createId })
        .dailyLog,
    );
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

  async function acceptLatestCloudDailyLog() {
    const cloudResult = await loadDailyLogFromCloud();
    if (
      cloudResult.status !== "success" &&
      cloudResult.status !== "empty"
    ) {
      setSyncDebug((prev) => ({ ...prev, status: "error" }));
      return false;
    }

    const normalizedCloudLog = sortDaysNewestFirst(
      cloudResult.dailyLog.map(normalizeDay),
    );
    const cloudEventCount = countDailyLogEvents(normalizedCloudLog);

    saveDailyLogConflictBackup(dailyLog, {
      localRevision: loadedRevision.current,
      cloudRevision: cloudResult.revision,
    });
    loadedRevision.current = Number.isInteger(cloudResult.revision)
      ? cloudResult.revision
      : 0;
    hasHydratedCloudData.current = true;
    hasLocalUserChange.current = false;
    cloudWriteBlockedByConflict.current = false;
    cloudHydratedDayCount.current = normalizedCloudLog.length;
    cloudHydratedEventCount.current = cloudEventCount;

    setDailyLogState(normalizedCloudLog);
    saveDailyLog(normalizedCloudLog);
    saveDailyLogSyncMetadata(loadedRevision.current, false);
    setSyncDebug((prev) => ({
      ...prev,
      status: "synced",
      source: "Cloud",
      conflict: false,
      decision: {
        action: "use-cloud",
        reason: "manual-accept-latest-cloud",
        contentEqual: areJsonValuesEqual(dailyLog, normalizedCloudLog),
      },
      cloud: {
        ...prev.cloud,
        revision: loadedRevision.current,
        days: normalizedCloudLog.length,
        events: cloudEventCount,
        updatedAt: cloudResult.updatedAt,
      },
      local: {
        ...prev.local,
        revision: loadedRevision.current,
        baselineKnown: true,
        dirty: false,
        days: normalizedCloudLog.length,
        events: cloudEventCount,
        lastSaveAt: new Date().toISOString(),
      },
    }));
    return true;
  }

  return {
    dailyLog,
    syncDebug,
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
    acceptLatestCloudDailyLog,

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

    addWeightEventToDay,
    updateWeightEvent,
    deleteWeightEvent,

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

    addSportSupplementPlanEventToDay,
    updateSportSupplementPlanEvent,
    deleteSportSupplementPlanEvent,

    executeTrainingPlan,
    takeSportSupplementPlan,
  };
}
