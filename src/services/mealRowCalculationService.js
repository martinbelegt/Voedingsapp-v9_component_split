export function calculateMealRows(rows, products, parseDecimalInput, round2) {
  return rows.map((r) => {
    const p = products.find((x) => x.id === r.productId);
    const amount = parseDecimalInput(r.amount);

    if (!p) {
      return {
        ...r,
        grams: 0,
        kh: 0,
        protein: 0,
        fat: 0,
        kcal: 0,
      };
    }

    const grams = r.mode === "portion" ? amount * p.portionGram : amount;

    return {
      ...r,
      product: p,
      grams: round2(grams),
      kh: round2((p.kh100 / 100) * grams),
      protein: round2((p.protein100 / 100) * grams),
      fat: round2((p.fat100 / 100) * grams),
      kcal: round2((p.kcal100 / 100) * grams),
    };
  });
}
