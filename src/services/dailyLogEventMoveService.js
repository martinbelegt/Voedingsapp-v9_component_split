export const DAILY_EVENT_COLLECTIONS = [
  "insulinEvents",
  "glucoseEvents",
  "glucoseBoostEvents",
  "movementEvents",
  "supplementEvents",
  "bowelEvents",
  "noteEvents",
  "trainingPlanEvents",
  "sportSupplementPlanEvents",
];

const ALL_DAY_COLLECTIONS = ["meals", ...DAILY_EVENT_COLLECTIONS];

function createEmptyDay(date) {
  return ALL_DAY_COLLECTIONS.reduce(
    (day, collection) => ({ ...day, [collection]: [] }),
    { date },
  );
}

function normalizeDay(day = {}) {
  return ALL_DAY_COLLECTIONS.reduce(
    (normalized, collection) => ({
      ...normalized,
      [collection]: Array.isArray(day[collection]) ? day[collection] : [],
    }),
    { ...createEmptyDay(day.date), ...day },
  );
}

function hasDayContent(day) {
  return ALL_DAY_COLLECTIONS.some(
    (collection) => (day[collection] || []).length > 0,
  );
}

function sortDaysNewestFirst(days) {
  return [...days].sort((left, right) =>
    String(right?.date || "").localeCompare(String(left?.date || "")),
  );
}

function getTargetDate(sourceDate, updates) {
  if (!Object.prototype.hasOwnProperty.call(updates, "eventTime")) {
    return sourceDate;
  }

  const targetDate = String(updates.eventTime || "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(targetDate) ? targetDate : null;
}

export function moveDailyLogEvent({
  dailyLog,
  collection,
  eventId,
  updates = {},
}) {
  if (!DAILY_EVENT_COLLECTIONS.includes(collection)) {
    return { dailyLog, moved: false, reason: "unsupported-collection" };
  }

  const matches = [];

  for (const day of dailyLog) {
    for (const event of day?.[collection] || []) {
      if (event.id === eventId) {
        matches.push({ day, event });
      }
    }
  }

  if (matches.length === 0) {
    return { dailyLog, moved: false, reason: "event-not-found" };
  }

  // Een dubbel ID is ambigue. De veilige keuze is de gehele mutatie weigeren:
  // niets verwijderen, niets samenvoegen en geen derde kopie toevoegen.
  if (matches.length > 1) {
    return { dailyLog, moved: false, reason: "duplicate-id-conflict" };
  }

  const [{ day: sourceDay, event }] = matches;
  const targetDate = getTargetDate(sourceDay.date, updates);

  if (!targetDate) {
    return { dailyLog, moved: false, reason: "invalid-target-date" };
  }

  const updatedEvent = { ...event, ...updates };

  if (targetDate === sourceDay.date) {
    const nextDailyLog = dailyLog.map((day) => {
      if (day !== sourceDay) return normalizeDay(day);

      let updated = false;
      return {
        ...normalizeDay(day),
        [collection]: (day[collection] || []).map((candidate) => {
          if (!updated && candidate.id === eventId) {
            updated = true;
            return updatedEvent;
          }
          return candidate;
        }),
      };
    });

    return {
      dailyLog: sortDaysNewestFirst(nextDailyLog),
      moved: true,
      sourceDate: sourceDay.date,
      targetDate,
    };
  }

  const withoutEvent = dailyLog
    .map((day) => {
      const normalized = normalizeDay(day);
      if (day !== sourceDay) return normalized;

      let removed = false;
      return {
        ...normalized,
        [collection]: normalized[collection].filter((candidate) => {
          if (!removed && candidate.id === eventId) {
            removed = true;
            return false;
          }
          return true;
        }),
      };
    })
    .filter(hasDayContent);

  const targetDay = withoutEvent.find((day) => day.date === targetDate);
  const nextDailyLog = targetDay
    ? withoutEvent.map((day) =>
        day.date === targetDate
          ? {
              ...normalizeDay(day),
              [collection]: [...day[collection], updatedEvent],
            }
          : normalizeDay(day),
      )
    : [
        ...withoutEvent.map(normalizeDay),
        {
          ...createEmptyDay(targetDate),
          [collection]: [updatedEvent],
        },
      ];

  return {
    dailyLog: sortDaysNewestFirst(nextDailyLog),
    moved: true,
    sourceDate: sourceDay.date,
    targetDate,
  };
}
