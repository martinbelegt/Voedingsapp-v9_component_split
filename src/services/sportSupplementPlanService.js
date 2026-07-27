const DAILY_LOG_COLLECTIONS = [
  "meals",
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

function emptyDay(date) {
  return DAILY_LOG_COLLECTIONS.reduce(
    (day, collection) => ({ ...day, [collection]: [] }),
    { date },
  );
}

function normalizeDay(day) {
  return DAILY_LOG_COLLECTIONS.reduce(
    (result, collection) => ({
      ...result,
      [collection]: Array.isArray(day?.[collection]) ? day[collection] : [],
    }),
    { ...emptyDay(day?.date), ...day },
  );
}

function hasContent(day) {
  return DAILY_LOG_COLLECTIONS.some(
    (collection) => day[collection].length > 0,
  );
}

export function createSportSupplementPlanEvent(input, options = {}) {
  const eventTime = String(input?.eventTime || "");
  const date = eventTime.slice(0, 10);
  const makeId = options.createId;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Een supplementplanning heeft een geldige datum en tijd nodig.");
  }
  if (typeof makeId !== "function") {
    throw new Error("Een supplementplanning heeft een ID-generator nodig.");
  }

  return {
    date,
    event: {
      id: makeId("sport-supplement-plan-event"),
      type: "sportSupplementPlan",
      eventTime,
      trainingPlanId: input?.trainingPlanId || null,
      intakeItemId: input?.intakeItemId || null,
      name: String(input?.name || "").trim(),
      amount: String(input?.amount || "").trim(),
      unit: String(input?.unit || "").trim(),
      note: String(input?.note || "").trim(),
      createdAt:
        input?.createdAt ||
        (options.now ? options.now() : new Date()).toLocaleString("nl-NL"),
    },
  };
}

export function addSportSupplementPlanEvent(dailyLog, date, event) {
  const existingDay = dailyLog.find((day) => day.date === date);
  const days = existingDay
    ? dailyLog.map((day) => {
        const normalized = normalizeDay(day);
        return day.date === date
          ? {
              ...normalized,
              sportSupplementPlanEvents: [
                ...normalized.sportSupplementPlanEvents,
                event,
              ],
            }
          : normalized;
      })
    : [
        ...dailyLog.map(normalizeDay),
        { ...emptyDay(date), sportSupplementPlanEvents: [event] },
      ];

  return days.sort((left, right) => right.date.localeCompare(left.date));
}

export function removeSportSupplementPlanEvent(dailyLog, eventId) {
  return dailyLog
    .map((day) => {
      const normalized = normalizeDay(day);
      return {
        ...normalized,
        sportSupplementPlanEvents:
          normalized.sportSupplementPlanEvents.filter(
            (event) => event.id !== eventId,
          ),
      };
    })
    .filter(hasContent);
}
