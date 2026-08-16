import { createExercise, migrateExerciseCatalog, sanitizeExercise } from "./exercises";

test("oefeningvelden worden lossless gemigreerd en bronadvies blijft persoonlijk gebruik niet overschrijven", () => {
  const original = createExercise({
    id: "ex-1", name: "Test", category: "mobility", bodyRegion: "Schouder",
    goal: "Mobiliteit", equipment: "Bank", instructions: ["Stap 1", "Stap 2"],
    source: "Video", sourceUrl: "https://youtu.be/abc", sourceTimestamp: "1:23",
    sourceDosage: "30–60 seconden", personalDosage: "20 seconden × 1", side: "Links",
    painRule: "Informatief", progression: "Later", regression: "Rustiger", notes: "Eigen notitie",
  });
  const [restored] = migrateExerciseCatalog({ items: [original] }).items;
  expect(restored).toMatchObject(original);
  expect(restored.sourceDosage).toBe("30–60 seconden");
  expect(restored.personalDosage).toBe("20 seconden × 1");
  expect(sanitizeExercise(restored).instructions).toEqual(["Stap 1", "Stap 2"]);
});
