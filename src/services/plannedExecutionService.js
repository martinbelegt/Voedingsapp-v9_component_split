const DAILY_LOG_COLLECTIONS = [
  "meals",
  "insulinEvents",
  "glucoseEvents",
  "glucoseBoostEvents",
  "movementEvents",
  "weightEvents",
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

function addEvent(dailyLog, date, collection, event) {
  const existingDay = dailyLog.find((day) => day.date === date);
  const days = existingDay
    ? dailyLog.map((day) => {
        const normalized = normalizeDay(day);
        return day.date === date
          ? { ...normalized, [collection]: [...normalized[collection], event] }
          : normalized;
      })
    : [
        ...dailyLog.map(normalizeDay),
        { ...emptyDay(date), [collection]: [event] },
      ];

  return days.sort((left, right) => right.date.localeCompare(left.date));
}

function eventDate(eventTime) {
  const date = String(eventTime || "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

export function isTrainingPlanExecuted(dailyLog, trainingPlanId) {
  return dailyLog.some((day) =>
    (day.movementEvents || []).some(
      (event) => event.trainingPlanId === trainingPlanId,
    ),
  );
}

export function isSportSupplementPlanTaken(dailyLog, planId) {
  return dailyLog.some((day) =>
    (day.supplementEvents || []).some(
      (event) => event.sportSupplementPlanId === planId,
    ),
  );
}

export function registerTrainingPlanExecution(
  dailyLog,
  training,
  input,
  options = {},
) {
  if (isTrainingPlanExecuted(dailyLog, training.id)) {
    return { dailyLog, created: false, reason: "already-executed" };
  }

  const date = eventDate(input?.eventTime);
  if (!date) {
    return { dailyLog, created: false, reason: "invalid-event-time" };
  }

  const event = {
    id: options.createId("movement-event"),
    type: "movement",
    eventTime: input.eventTime,
    trainingPlanId: training.id,
    title: training.title || "",
    activityType: training.trainingType || "Krachttraining",
    intensityType: input.intensityType || "Gemengd",
    durationMinutes: input.durationMinutes ?? training.durationMinutes ?? "",
    note: input.note ?? training.note ?? "",
    createdAt: (options.now ? options.now() : new Date()).toLocaleString(
      "nl-NL",
    ),
    repeat: "none",
  };

  return {
    dailyLog: addEvent(dailyLog, date, "movementEvents", event),
    event,
    created: true,
  };
}

export function registerSportSupplementPlanIntake(
  dailyLog,
  plan,
  input,
  options = {},
) {
  if (isSportSupplementPlanTaken(dailyLog, plan.id)) {
    return { dailyLog, created: false, reason: "already-taken" };
  }

  const date = eventDate(input?.eventTime);
  if (!date) {
    return { dailyLog, created: false, reason: "invalid-event-time" };
  }

  const amount = String(input.amount ?? plan.amount ?? "").trim();
  const unit = String(input.unit ?? plan.unit ?? "").trim();
  const event = {
    id: options.createId("supplement-event"),
    type: "supplement",
    eventTime: input.eventTime,
    sportSupplementPlanId: plan.id,
    trainingPlanId: plan.trainingPlanId || null,
    intakeItemId: plan.intakeItemId || null,
    name: plan.name || "",
    amount,
    unit,
    dosage: [amount, unit].filter(Boolean).join(" "),
    note: input.note ?? plan.note ?? "",
    createdAt: (options.now ? options.now() : new Date()).toLocaleString(
      "nl-NL",
    ),
    repeat: "none",
  };

  return {
    dailyLog: addEvent(dailyLog, date, "supplementEvents", event),
    event,
    created: true,
  };
}
