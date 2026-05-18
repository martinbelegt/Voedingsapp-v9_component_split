import { createId } from "./idService";

export const TIMER_TYPES = [
  {
    value: "satiety",
    label: "Verzadiging",
    description: "Hoe lang je verwacht weinig of geen honger te hebben.",
  },
  {
    value: "fasting",
    label: "Eetpauze",
    description: "Zelfgekozen periode waarin je geen nieuwe calorieën neemt.",
  },
  {
    value: "glucose",
    label: "Glucose opletten",
    description: "Periode waarin je extra let op glucoseverloop.",
  },
  {
    value: "digestion",
    label: "Vertering / Creon",
    description:
      "Periode waarin vertering of enzymwerking nog relevant kan zijn.",
  },
];

export const TIMER_DURATION_OPTIONS = [2, 3, 4, 6, 8];

export function getTimerTypeMeta(type) {
  return TIMER_TYPES.find((item) => item.value === type) || TIMER_TYPES[0];
}

export function createMealTimer({
  type = "satiety",
  durationHours = 3,
  note = "",
  startedAt = new Date().toISOString(),
}) {
  const start = new Date(startedAt);
  const ends = new Date(
    start.getTime() + Number(durationHours) * 60 * 60 * 1000,
  );

  return {
    id: createId("timer"),
    type,
    label: getTimerTypeMeta(type).label,
    durationHours: Number(durationHours),
    startedAt: start.toISOString(),
    endsAt: ends.toISOString(),
    note: String(note || "").trim(),
  };
}

export function getRemainingMs(timer, now = new Date()) {
  return new Date(timer.endsAt).getTime() - now.getTime();
}

export function isTimerExpired(timer, now = new Date()) {
  return getRemainingMs(timer, now) <= 0;
}

export function formatRemainingTime(timer, now = new Date()) {
  const remainingMs = getRemainingMs(timer, now);

  if (remainingMs <= 0) return "afgelopen";

  const totalMinutes = Math.ceil(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}u`;

  return `${hours}u ${minutes}m`;
}

export function formatTimerEndTime(timer) {
  return new Date(timer.endsAt).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function sortTimersByEndTime(timers) {
  return [...timers].sort(
    (a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime(),
  );
}
