import {
  createWeightEvent,
  formatWeightKg,
  parseWeightKg,
  validateWeightKg,
} from "./weightEventService";

test("Nederlandse en technische decimalen worden numeriek genormaliseerd", () => {
  expect(parseWeightKg("78,4")).toBe(78.4);
  expect(parseWeightKg("78.4")).toBe(78.4);
  expect(parseWeightKg(78)).toBe(78);
});

test("gewicht valideert ontbrekende, negatieve en onrealistische waarden", () => {
  expect(validateWeightKg("")).toMatch(/geldig gewicht/);
  expect(validateWeightKg("-2")).toMatch(/groter zijn dan 0/);
  expect(validateWeightKg("12")).toMatch(/tussen 20 en 400/);
  expect(validateWeightKg("78,4")).toBeNull();
});

test("weight-event bewaart toekomstbestendige numerieke en tijdvelden", () => {
  const { date, event } = createWeightEvent(
    {
      valueKg: "78,4",
      eventTime: "2026-07-31T07:42",
      note: "Ochtendmeting",
    },
    {
      createId: () => "weight-1",
      now: () => new Date("2026-07-31T07:42:00"),
    },
  );

  expect(date).toBe("2026-07-31");
  expect(event).toMatchObject({
    id: "weight-1",
    type: "weight",
    valueKg: 78.4,
    datetime: "2026-07-31T07:42",
    eventTime: "2026-07-31T07:42",
    note: "Ochtendmeting",
  });
  expect(formatWeightKg(event.valueKg)).toBe("78,4");
});
