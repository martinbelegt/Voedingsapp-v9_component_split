import {
  getDailyCreonSummary,
  getMealActualCreon,
  getMealCreonAdvice,
} from "./creonSemanticsService";

test("maaltijdadvies telt niet als werkelijk ingenomen Creon", () => {
  const meal = { totals: { creon25: 2, creon10: 1 } };

  expect(getMealCreonAdvice(meal)).toEqual({ creon25: 2, creon10: 1 });
  expect(getMealActualCreon(meal)).toMatchObject({
    creon25: 0,
    creon10: 0,
    registered: false,
  });
  expect(getDailyCreonSummary({ meals: [meal] })).toEqual({
    adviceCreon25: 2,
    adviceCreon10: 1,
    actualCreon25: 0,
    actualCreon10: 0,
    hasActualCreon: false,
  });
});

test("actualCreon telt uitsluitend als werkelijk geregistreerd", () => {
  const meal = {
    actualCreon25: "1",
    actualCreon10: "2",
    creonTime: "08:15",
  };

  expect(getMealActualCreon(meal)).toEqual({
    creon25: 1,
    creon10: 2,
    creonTime: "08:15",
    registered: true,
  });
  expect(getDailyCreonSummary({ meals: [meal] })).toMatchObject({
    adviceCreon25: 0,
    adviceCreon10: 0,
    actualCreon25: 1,
    actualCreon10: 2,
    hasActualCreon: true,
  });
});

test("advies en werkelijk blijven onafhankelijk binnen dezelfde maaltijd", () => {
  const meal = {
    totals: { creon25: 2, creon10: 0 },
    actualCreon25: "1",
    actualCreon10: "0",
  };

  expect(getDailyCreonSummary({ meals: [meal] })).toEqual({
    adviceCreon25: 2,
    adviceCreon10: 0,
    actualCreon25: 1,
    actualCreon10: 0,
    hasActualCreon: true,
  });
});

test("ontbrekende actualCreon wordt nooit uit advies afgeleid", () => {
  const summary = getDailyCreonSummary({
    meals: [{ totals: { creon25: 4, creon10: 3 } }],
  });

  expect(summary.actualCreon25).toBe(0);
  expect(summary.actualCreon10).toBe(0);
  expect(summary.hasActualCreon).toBe(false);
});

test("meerdere maaltijden sommeren advies en werkelijk onafhankelijk", () => {
  const summary = getDailyCreonSummary({
    meals: [
      {
        totals: { creon25: 2, creon10: 1 },
        actualCreon25: "1",
        actualCreon10: "0",
      },
      {
        totals: { creon25: 1, creon10: 2 },
        actualCreon25: "0",
        actualCreon10: "2",
      },
    ],
  });

  expect(summary).toEqual({
    adviceCreon25: 3,
    adviceCreon10: 3,
    actualCreon25: 1,
    actualCreon10: 2,
    hasActualCreon: true,
  });
});

test("legacy actualCreonvelden blijven ongewijzigd", () => {
  const meal = {
    id: "meal-legacy",
    actualCreon25: "1",
    actualCreon10: "2",
    creonTime: "19:30",
    legacyExtra: "behouden",
  };
  const before = JSON.parse(JSON.stringify(meal));

  getMealActualCreon(meal);
  getDailyCreonSummary({ meals: [meal] });

  expect(meal).toEqual(before);
});
