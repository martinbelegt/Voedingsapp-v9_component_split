import { moveDailyLogEvent } from "./dailyLogEventMoveService";
import { getAdministeredInsulinTotal } from "./insulinService";

function day(overrides = {}) {
  return {
    date: "2026-07-27",
    meals: [],
    insulinEvents: [],
    ...overrides,
  };
}

test("meal.totals.insulin telt niet als werkelijk toegediend", () => {
  const value = day({
    meals: [{ id: "meal-1", totals: { insulin: 6 } }],
  });

  expect(getAdministeredInsulinTotal(value)).toBe(0);
});

test("werkelijk dagtotaal gebruikt uitsluitend insulinEvents", () => {
  const value = day({
    insulinEvents: [{ id: "insulin-1", units: "4" }],
  });

  expect(getAdministeredInsulinTotal(value)).toBe(4);
});

test("legacy maaltijdinsuline en gelijk event worden niet dubbel geteld", () => {
  const legacyMeal = {
    id: "meal-1",
    actualInsulin: "4",
    insulinType: "Novorapid",
    insulinTime: "08:00",
  };
  const value = day({
    meals: [legacyMeal],
    insulinEvents: [{ id: "insulin-1", units: "4" }],
  });

  expect(getAdministeredInsulinTotal(value)).toBe(4);
  expect(value.meals[0]).toEqual(legacyMeal);
});

test("legacy meal.actualInsulin blijft behouden maar telt niet mee", () => {
  const legacyMeal = {
    id: "meal-legacy",
    actualInsulin: "3.5",
    insulinType: "Novorapid",
    insulinTime: "12:15",
  };
  const value = day({ meals: [legacyMeal] });

  expect(getAdministeredInsulinTotal(value)).toBe(0);
  expect(value.meals[0]).toMatchObject({
    actualInsulin: "3.5",
    insulinType: "Novorapid",
    insulinTime: "12:15",
  });
});

test("wijzigen en verwijderen van insulinEvents werkt direct door in totaal", () => {
  const original = day({
    insulinEvents: [
      { id: "insulin-1", units: "2" },
      { id: "insulin-2", units: "1.5" },
    ],
  });
  const updated = {
    ...original,
    insulinEvents: original.insulinEvents.map((event) =>
      event.id === "insulin-1" ? { ...event, units: "4" } : event,
    ),
  };
  const deleted = {
    ...updated,
    insulinEvents: updated.insulinEvents.filter(
      (event) => event.id !== "insulin-2",
    ),
  };

  expect(getAdministeredInsulinTotal(original)).toBe(3.5);
  expect(getAdministeredInsulinTotal(updated)).toBe(5.5);
  expect(getAdministeredInsulinTotal(deleted)).toBe(4);
});

test("datumverplaatsing laat het insulinetotaal de nieuwe dag volgen", () => {
  const source = day({
    insulinEvents: [
      {
        id: "insulin-move",
        type: "insulin",
        units: "4",
        eventTime: "2026-07-27T09:00",
      },
    ],
  });
  const result = moveDailyLogEvent({
    dailyLog: [source],
    collection: "insulinEvents",
    eventId: "insulin-move",
    updates: { eventTime: "2026-07-28T09:00" },
  });

  const oldDay = result.dailyLog.find((entry) => entry.date === "2026-07-27");
  const newDay = result.dailyLog.find((entry) => entry.date === "2026-07-28");

  expect(getAdministeredInsulinTotal(oldDay)).toBe(0);
  expect(getAdministeredInsulinTotal(newDay)).toBe(4);
});
