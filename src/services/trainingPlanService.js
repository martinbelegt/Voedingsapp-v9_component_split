export const TRAINING_TYPES = [
  "Krachttraining",
  "Cardio",
  "Mobiliteit en herstel",
  "Overig",
];
import { normalizeTrainingPlanEvent } from "./trainingStructureService";

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

function hasContent(day) {
  return DAILY_LOG_COLLECTIONS.some(
    (collection) => day[collection].length > 0,
  );
}

export function createTrainingPlanEvent(input, options = {}) {
  const eventTime = String(input?.eventTime || "");
  const date = eventTime.slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Een trainingsplan heeft een geldige datum en tijd nodig.");
  }

  const makeId = options.createId;
  if (typeof makeId !== "function") {
    throw new Error("Een trainingsplan heeft een ID-generator nodig.");
  }

  return {
    date,
    event: normalizeTrainingPlanEvent({
      ...input,
      id: makeId("training-plan-event"),
      type: "trainingPlan",
      eventTime,
      title: String(input?.title || "").trim(),
      trainingType: input?.trainingType || TRAINING_TYPES[0],
      durationMinutes: input?.durationMinutes ?? "",
      note: String(input?.note || "").trim(),
      createdAt:
        input?.createdAt ||
        (options.now ? options.now() : new Date()).toLocaleString("nl-NL"),
    }),
  };
}

export function addTrainingPlanEvent(dailyLog, date, event) {
  const existingDay = dailyLog.find((day) => day.date === date);
  const days = existingDay
    ? dailyLog.map((day) => {
        const normalized = normalizeDay(day);
        return day.date === date
          ? {
              ...normalized,
              trainingPlanEvents: [...normalized.trainingPlanEvents, event],
            }
          : normalized;
      })
    : [
        ...dailyLog.map(normalizeDay),
        { ...emptyDay(date), trainingPlanEvents: [event] },
      ];

  return days.sort((left, right) => right.date.localeCompare(left.date));
}

export function removeTrainingPlanEvent(dailyLog, eventId) {
  return dailyLog
    .map((day) => {
      const normalized = normalizeDay(day);
      return {
        ...normalized,
        trainingPlanEvents: normalized.trainingPlanEvents.filter(
          (event) => event.id !== eventId,
        ),
      };
    })
    .filter(hasContent);
}
