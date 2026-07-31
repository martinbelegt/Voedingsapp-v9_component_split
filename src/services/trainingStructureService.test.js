import {
  cloneTrainingPlanEvent,
  formatExercisePrescription,
  getCompactExerciseSummary,
  normalizeTrainingPlanEvent,
  sortTrainingExercises,
} from "./trainingStructureService";

test("legacytraining zonder exercises blijft geldig", () => {
  const legacy = { id: "training-1", title: "Borst", futureField: "bewaren" };
  expect(normalizeTrainingPlanEvent(legacy)).toEqual(legacy);
});

test("volledige oefeningsvelden en onbekende velden blijven behouden", () => {
  const training = normalizeTrainingPlanEvent({
    id: "training-1",
    exercises: [{
      id: "exercise-1",
      name: " Incline Dumbbell Press ",
      section: "Borst",
      order: 0,
      sets: "3",
      repsMin: "6",
      repsMax: "10",
      weight: "32.5",
      weightUnit: "kg",
      tempo: "3-1-1-0",
      restSecondsMin: "180",
      restSecondsMax: "240",
      intensityType: "Hypertrofie",
      rir: "0",
      rpe: "10",
      toFailure: true,
      note: "Stop bij onvrijwillige vertraging.",
      futureExerciseField: { preserved: true },
    }],
  });

  expect(training.exercises[0]).toMatchObject({
    name: "Incline Dumbbell Press",
    sets: 3,
    repsMin: 6,
    repsMax: 10,
    weight: 32.5,
    tempo: "3-1-1-0",
    restSecondsMin: 180,
    restSecondsMax: 240,
    toFailure: true,
    futureExerciseField: { preserved: true },
  });
});

test("oefeningen sorteren stabiel op order", () => {
  const exercises = sortTrainingExercises([
    { id: "b", order: 2 },
    { id: "a", order: 0 },
    { id: "c", order: 1 },
  ]);
  expect(exercises.map((exercise) => exercise.id)).toEqual(["a", "c", "b"]);
});

test("compacte samenvattingen hebben zinvolle fallbacks", () => {
  expect(formatExercisePrescription({ sets: 3, repsMin: 6, repsMax: 10 }))
    .toBe("3 × 6–10");
  expect(formatExercisePrescription({ sets: 3 })).toBe("3 sets");
  expect(getCompactExerciseSummary({ name: "Cable Fly", sets: 3 }))
    .toBe("Cable Fly · 3 sets");
  expect(formatExercisePrescription({})).toBe("");
});

test("clone/update behoudt exercises en onbekende velden", () => {
  const original = {
    id: "training-1",
    title: "Borst",
    futureTrainingField: "bewaren",
    exercises: [{ id: "exercise-1", name: "Press", future: 42 }],
  };
  expect(cloneTrainingPlanEvent(original, { title: "Borsttraining" }))
    .toMatchObject({
      title: "Borsttraining",
      futureTrainingField: "bewaren",
      exercises: [{ id: "exercise-1", name: "Press", future: 42 }],
    });
});
