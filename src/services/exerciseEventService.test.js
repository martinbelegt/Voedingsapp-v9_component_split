import { buildExerciseTimelineInputs } from "./exerciseEventService";

test("gezamenlijke tijdplaatsing maakt afzonderlijke oefenregistraties", () => {
  const time = "2026-08-16T09:30";
  const result = buildExerciseTimelineInputs([
    { id: "a", name: "A", personalDosage: "1 x 20 sec", side: "Links" },
    { id: "b", name: "B", personalDosage: "2 x 8", side: "Beide" },
  ], time);
  expect(result).toHaveLength(2);
  expect(result.map((item) => item.exerciseId)).toEqual(["a", "b"]);
  expect(result.every((item) => item.eventTime === time)).toBe(true);
  expect(result[0]).toMatchObject({ personalDosage: "1 x 20 sec", side: "Links" });
});
