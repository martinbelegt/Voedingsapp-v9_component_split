export function getMealDominantMacro(totals) {
  if (totals.fat > totals.kh && totals.fat > totals.protein) {
    return "fat";
  }

  if (totals.protein > totals.fat && totals.protein > totals.kh) {
    return "protein";
  }

  if (totals.kh > totals.fat && totals.kh > totals.protein) {
    return "kh";
  }

  return "mixed";
}

export function getMealInterpretation(totals) {
  const dominant = getMealDominantMacro(totals);

  switch (dominant) {
    case "fat":
      return "Deze maaltijd lijkt vooral vet-gedreven. Creon wordt hier waarschijnlijk vooral door vetbelasting bepaald.";

    case "protein":
      return "Deze maaltijd lijkt relatief eiwit-zwaar. Let mogelijk ook op latere glucose-invloed.";

    case "kh":
      return "Deze maaltijd lijkt relatief KH-zwaar. Timing en GI kunnen hier extra belangrijk zijn.";

    default:
      return "Deze maaltijd heeft een gemengd profiel. De uitkomst is gebaseerd op meerdere bijdragen tegelijk.";
  }
}

export function getMealFlags(totals) {
  return {
    hasDelayedCarbs: totals.mealHasDelayedCarbs,

    needsLightMealSupport: totals.needsLightMealSupport,

    delayedItemsText: totals.delayedItemsText || "",
  };
}
