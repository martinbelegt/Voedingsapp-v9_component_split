import { buildExerciseSourceMomentUrl } from "./exerciseSourceService";

test("YouTube-bron opent op het afzonderlijk opgeslagen tijdstip", () => {
  expect(buildExerciseSourceMomentUrl("https://youtu.be/abc", "1:23")).toBe("https://youtu.be/abc?t=83s");
  expect(buildExerciseSourceMomentUrl("javascript:alert(1)", "1:23")).toBe("");
});
