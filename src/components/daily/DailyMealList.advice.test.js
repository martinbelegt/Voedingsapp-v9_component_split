import { formatCreonAdvice } from "./DailyMealList";

describe("Creonadvies op de maaltijdadviesregel", () => {
  test("toont expliciet wanneer geen Creon nodig is", () => {
    expect(formatCreonAdvice({ creon25: 0, creon10: 0 })).toBe(
      "Geen Creon nodig",
    );
  });

  test("formatteert de bestaande capsuleberekening compact", () => {
    expect(formatCreonAdvice({ creon35: 1 })).toBe("Creonadvies 35.000");
    expect(formatCreonAdvice({ creon25: 2 })).toBe("Creonadvies 2×25.000");
  });
});
