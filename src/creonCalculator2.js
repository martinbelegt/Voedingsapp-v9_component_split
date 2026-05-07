export function calculateCreon({ fat, protein, kh, settings }) {
  const round2 = (n) => Math.round(n * 100) / 100;

  const fatPerCap35 = Number(settings.fatPerCap35) || 0;
  const fatPerCap25 = Number(settings.fatPerCap25) || 0;
  const fatPerCap10 = Number(settings.fatPerCap10) || 0;
  const fatPerCap5 = Number(settings.fatPerCap5) || 0;

  const useCreon35000 = !!settings.useCreon35000;
  const useCreon25000 = !!settings.useCreon25000;
  const useCreon10000 = !!settings.useCreon10000;
  const useCreon5000 = !!settings.useCreon5000;

  const proteinCorrection = Number(settings.proteinCorrection) || 0;
  const khCreonFactor = Number(settings.khCreonFactor) || 0;
  const proteinCreonFactor = Number(settings.proteinCreonFactor) || 0;

  const includeProteinGlucoseInCreon = !!settings.includeProteinGlucoseInCreon;
  const creonMode = settings.creonMode || "standard";
  const creonGoal = settings.creonGoal || "comfort";

  const minKhForLightMealCreon = Number(settings.minKhForLightMealCreon) || 0;
  const minProteinForLightMealCreon =
    Number(settings.minProteinForLightMealCreon) || 0;
  const lightMealMinEnzymeLoad = Number(settings.lightMealMinEnzymeLoad) || 0;

  const fatContribution = round2(Math.max(0, fat));

  const khContribution =
    creonMode === "extended"
      ? round2(Math.max(0, kh) * Math.max(0, khCreonFactor))
      : 0;

  const proteinContribution =
    creonMode === "extended"
      ? round2(Math.max(0, protein) * Math.max(0, proteinCreonFactor))
      : 0;

  const proteinGlucoseContribution = includeProteinGlucoseInCreon
    ? round2(Math.max(0, protein) * Math.max(0, proteinCorrection))
    : 0;

  const rawEnzymeLoad = round2(
    fatContribution +
      khContribution +
      proteinContribution +
      proteinGlucoseContribution,
  );

  let enzymeLoad = rawEnzymeLoad;

  const isLowFatMeal = fatContribution <= 5;
  const khTrigger =
    minKhForLightMealCreon > 0 && Number(kh) >= minKhForLightMealCreon;
  const proteinTrigger =
    minProteinForLightMealCreon > 0 &&
    Number(protein) >= minProteinForLightMealCreon;

  const needsLightMealSupport =
    isLowFatMeal &&
    (khTrigger || proteinTrigger) &&
    (creonGoal === "optimal" || enzymeLoad > 0);

  const lightMealReason = !needsLightMealSupport
    ? "geen"
    : khTrigger && proteinTrigger
      ? "lichte maaltijd: KH + eiwit"
      : khTrigger
        ? "lichte maaltijd: KH"
        : "lichte maaltijd: eiwit";

  if (needsLightMealSupport) {
    enzymeLoad = round2(Math.max(enzymeLoad, lightMealMinEnzymeLoad));
  }

  const baseResult = {
    fatContribution,
    khCreonContribution: khContribution,
    proteinCreonContribution: proteinContribution,
    proteinGlucoseContribution,
    creonGoal,
    needsLightMealSupport,
    lightMealReason,
    lightMealMinEnzymeLoad,
    rawEnzymeLoad,
    usedFactors: {
      khCreonFactor,
      proteinCreonFactor,
      proteinCorrection,
      includeProteinGlucoseInCreon,
      creonMode,
      creonGoal,
    },
    inputMacros: {
      fat: round2(fat),
      protein: round2(protein),
      kh: round2(kh),
    },
  };

  if (enzymeLoad <= 0) {
    return {
      effectiveFat: 0,
      enzymeLoad: 0,
      best: {
        c35: 0,
        c25: 0,
        c10: 0,
        c5: 0,
        covered: 0,
        over: 0,
        score: 0,
        description: "0",
      },
      options: [],
      ...baseResult,
    };
  }

  const activeCapsules = [
    useCreon35000 && fatPerCap35 > 0
      ? { key: "c35", label: "35.000", fatValue: fatPerCap35 }
      : null,
    useCreon25000 && fatPerCap25 > 0
      ? { key: "c25", label: "25.000", fatValue: fatPerCap25 }
      : null,
    useCreon10000 && fatPerCap10 > 0
      ? { key: "c10", label: "10.000", fatValue: fatPerCap10 }
      : null,
    useCreon5000 && fatPerCap5 > 0
      ? { key: "c5", label: "5.000", fatValue: fatPerCap5 }
      : null,
  ].filter(Boolean);

  if (activeCapsules.length === 0) {
    return {
      effectiveFat: enzymeLoad,
      enzymeLoad,
      best: {
        c35: 0,
        c25: 0,
        c10: 0,
        c5: 0,
        covered: 0,
        over: 0,
        score: 999999,
        description: "Geen actieve Creon-soorten ingesteld",
      },
      options: [],
      ...baseResult,
    };
  }

  const buildCounts = (c35, c25, c10, c5) => ({
    c35,
    c25,
    c10,
    c5,
  });

  const covers = (counts) =>
    counts.c35 * fatPerCap35 +
    counts.c25 * fatPerCap25 +
    counts.c10 * fatPerCap10 +
    counts.c5 * fatPerCap5;

  const options = [];

  const max35 =
    useCreon35000 && fatPerCap35 > 0
      ? Math.ceil(enzymeLoad / fatPerCap35) + 1
      : 0;
  const max25 =
    useCreon25000 && fatPerCap25 > 0
      ? Math.ceil(enzymeLoad / fatPerCap25) + 1
      : 0;
  const max10 =
    useCreon10000 && fatPerCap10 > 0
      ? Math.ceil(enzymeLoad / fatPerCap10) + 2
      : 0;
  const max5 =
    useCreon5000 && fatPerCap5 > 0 ? Math.ceil(enzymeLoad / fatPerCap5) + 2 : 0;

  for (let c35 = 0; c35 <= max35; c35++) {
    for (let c25 = 0; c25 <= max25; c25++) {
      for (let c10 = 0; c10 <= max10; c10++) {
        for (let c5 = 0; c5 <= max5; c5++) {
          const counts = buildCounts(c35, c25, c10, c5);
          const totalCapsules = c35 + c25 + c10 + c5;

          if (totalCapsules === 0) continue;

          const covered = covers(counts);
          if (covered < enzymeLoad) continue;

          const over = round2(covered - enzymeLoad);

          const score =
            over * 10000 +
            totalCapsules * 10 +
            c5 * 0.4 +
            c10 * 0.3 +
            c25 * 0.2 +
            c35 * 0.1;

          options.push({
            ...counts,
            covered,
            over,
            score,
          });
        }
      }
    }
  }

  const best = [...options].sort((a, b) => a.score - b.score)[0] || {
    c35: 0,
    c25: 0,
    c10: 0,
    c5: 0,
    covered: 0,
    over: 0,
    score: 999999,
  };

  const descriptionParts = [];
  if (best.c35 > 0) descriptionParts.push(`${best.c35} x 35.000`);
  if (best.c25 > 0) descriptionParts.push(`${best.c25} x 25.000`);
  if (best.c10 > 0) descriptionParts.push(`${best.c10} x 10.000`);
  if (best.c5 > 0) descriptionParts.push(`${best.c5} x 5.000`);

  return {
    effectiveFat: enzymeLoad,
    enzymeLoad,
    best: {
      ...best,
      description:
        descriptionParts.length > 0
          ? descriptionParts.join(" + ")
          : "Geen passende combinatie",
    },
    options,
    ...baseResult,
  };
}
