export function getFilledMealRows(rowsWithCalc) {
  return rowsWithCalc.filter(
    (r) => r.product && String(r.amount).trim() !== "",
  );
}

export function buildMealSnapshot({
  rowsWithCalc,
  customName,
  mealName,
  dayMealName,
  totals,
}) {
  const filledRows = getFilledMealRows(rowsWithCalc);
  if (filledRows.length === 0) return null;

  return {
    id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name:
      customName?.trim() ||
      mealName?.trim() ||
      dayMealName?.trim() ||
      `Maaltijd ${new Date().toLocaleTimeString("nl-NL", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    createdAt: new Date().toLocaleString("nl-NL"),
    rows: filledRows.map((r) => ({
      id: r.id,
      productId: r.productId,
      mode: r.mode,
      amount: r.amount,
    })),
    totals: {
      kh: totals.kh,
      protein: totals.protein,
      fat: totals.fat,
      kcal: totals.kcal,
      insulin: totals.insulin,
      weightedGi: totals.weightedGi,
      giClass: totals.giClass,
      timingAdvice: totals.timingAdvice,
      personalTimingAdvice: totals.personalTimingAdvice,
      effectiveFat: totals.effectiveFat,
      creon25: totals.best.c25,
      creon10: totals.best.c10,
    },
  };
}
