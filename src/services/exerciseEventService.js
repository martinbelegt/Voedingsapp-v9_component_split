export function buildExerciseTimelineInputs(exercises, eventTime) {
  return exercises.map((exercise) => ({
    date: eventTime.slice(0, 10),
    eventTime,
    activityType: exercise.name || "Oefening",
    exerciseId: exercise.id,
    exerciseName: exercise.name || "Oefening",
    personalDosage: exercise.personalDosage || "",
    side: exercise.side || "Niet van toepassing",
    note: exercise.notes || "",
  }));
}
