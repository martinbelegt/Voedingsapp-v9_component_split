function optionalNumber(value) {
  if (value === "" || value === null || value === undefined) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function normalizeTrainingExercise(exercise = {}, index = 0) {
  const normalized = {
    ...exercise,
    id: String(exercise.id || `exercise-${index + 1}`),
    name: String(exercise.name || "").trim(),
  };

  [
    "order",
    "sets",
    "repsMin",
    "repsMax",
    "weight",
    "restSecondsMin",
    "restSecondsMax",
    "rir",
    "rpe",
  ].forEach((field) => {
    const value = optionalNumber(exercise[field]);
    if (value === undefined) delete normalized[field];
    else normalized[field] = value;
  });

  ["section", "weightUnit", "tempo", "intensityType", "note"].forEach(
    (field) => {
      if (exercise[field] === undefined || exercise[field] === null) {
        delete normalized[field];
      } else {
        const value = String(exercise[field]).trim();
        if (value) normalized[field] = value;
        else delete normalized[field];
      }
    },
  );

  if (exercise.toFailure === true) normalized.toFailure = true;
  else if (exercise.toFailure === false) normalized.toFailure = false;
  else delete normalized.toFailure;

  return normalized;
}

export function sortTrainingExercises(exercises = []) {
  return [...(Array.isArray(exercises) ? exercises : [])].sort(
    (left, right) =>
      (optionalNumber(left?.order) ?? Number.MAX_SAFE_INTEGER) -
      (optionalNumber(right?.order) ?? Number.MAX_SAFE_INTEGER),
  );
}

export function normalizeTrainingPlanEvent(event = {}) {
  const normalized = { ...event };
  if (Array.isArray(event.exercises)) {
    normalized.exercises = sortTrainingExercises(
      event.exercises.map(normalizeTrainingExercise),
    );
  } else {
    delete normalized.exercises;
  }
  return normalized;
}

export function cloneTrainingPlanEvent(event = {}, updates = {}) {
  return normalizeTrainingPlanEvent({
    ...event,
    ...updates,
    exercises:
      updates.exercises !== undefined ? updates.exercises : event.exercises,
  });
}

export function formatExercisePrescription(exercise = {}) {
  const sets = optionalNumber(exercise.sets);
  const min = optionalNumber(exercise.repsMin);
  const max = optionalNumber(exercise.repsMax);
  const parts = [];

  if (sets !== undefined) parts.push(String(sets));
  if (min !== undefined && max !== undefined) {
    parts.push(`${min}–${max}`);
  } else if (min !== undefined || max !== undefined) {
    parts.push(String(min ?? max));
  }

  if (parts.length === 2) return `${parts[0]} × ${parts[1]}`;
  if (sets !== undefined) return `${sets} sets`;
  if (parts.length === 1) return `${parts[0]} reps`;
  return "";
}

export function getCompactExerciseSummary(exercise = {}) {
  return [exercise.name || "Oefening", formatExercisePrescription(exercise)]
    .filter(Boolean)
    .join(" · ");
}
