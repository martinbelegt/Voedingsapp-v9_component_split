function toAmount(value) {
  return Number(value) || 0;
}

function isRegistered(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

export function getMealCreonAdvice(meal) {
  return {
    creon25: toAmount(meal?.totals?.creon25),
    creon10: toAmount(meal?.totals?.creon10),
  };
}

export function getMealActualCreon(meal) {
  return {
    creon25: toAmount(meal?.actualCreon25),
    creon10: toAmount(meal?.actualCreon10),
    creonTime: meal?.creonTime || "",
    registered:
      isRegistered(meal?.actualCreon25) ||
      isRegistered(meal?.actualCreon10),
  };
}

export function getDailyCreonSummary(day) {
  return (day?.meals || []).reduce(
    (summary, meal) => {
      const advice = getMealCreonAdvice(meal);
      const actual = getMealActualCreon(meal);

      return {
        adviceCreon25: summary.adviceCreon25 + advice.creon25,
        adviceCreon10: summary.adviceCreon10 + advice.creon10,
        actualCreon25: summary.actualCreon25 + actual.creon25,
        actualCreon10: summary.actualCreon10 + actual.creon10,
        hasActualCreon: summary.hasActualCreon || actual.registered,
      };
    },
    {
      adviceCreon25: 0,
      adviceCreon10: 0,
      actualCreon25: 0,
      actualCreon10: 0,
      hasActualCreon: false,
    },
  );
}
