import { calculateCreon } from "../creonCalculator2";
import {
  getGiClassFromValue,
  getMealGiLabel,
  getFallbackGiValue,
} from "./giService";
import {
  getBaseTimingAdvice,
  applyFatDelayToTiming,
  getPersonalTimingAnalysis,
} from "./timingService";
import { getCreonModeLabel } from "./creonService";

export function calculateMealTotals({
  rowsWithCalc,
  settings,
  timingOptions,
  getTimingMinutes,
  round2,
  toNumber,
}) {
  const kh = round2(rowsWithCalc.reduce((a, r) => a + (r.kh || 0), 0));
  const protein = round2(
    rowsWithCalc.reduce((a, r) => a + (r.protein || 0), 0),
  );
  const fat = round2(rowsWithCalc.reduce((a, r) => a + (r.fat || 0), 0));
  const kcal = round2(rowsWithCalc.reduce((a, r) => a + (r.kcal || 0), 0));

  const gramsKhPerUnit = toNumber(settings.gramsKhPerUnit);
  const fatPerCap25 = toNumber(settings.fatPerCap25);
  const fatPerCap10 = toNumber(settings.fatPerCap10);
  const proteinCorrection = toNumber(settings.proteinCorrection);
  const khCreonFactor = toNumber(settings.khCreonFactor);
  const proteinCreonFactor = toNumber(settings.proteinCreonFactor);
  const includeProteinGlucoseInCreon = !!settings.includeProteinGlucoseInCreon;
  const creonMode = settings.creonMode || "standard";
  const usePersonalTiming = settings.usePersonalTiming !== false;
  const minKhTriggerThreshold = toNumber(settings.minKhTriggerThreshold);
  const minProteinTriggerThreshold = toNumber(
    settings.minProteinTriggerThreshold,
  );
  const minEnzymeLoadValue = toNumber(settings.minEnzymeLoadValue);

  const insulin = gramsKhPerUnit > 0 ? round2(kh / gramsKhPerUnit) : 0;

  const fatContribution = round2(fat);
  const proteinGlucoseContribution = round2(protein * proteinCorrection);
  const khCreonContributionRaw = round2(kh * khCreonFactor);
  const proteinCreonContributionRaw = round2(protein * proteinCreonFactor);

  const khCreonContribution =
    creonMode === "extended" ? khCreonContributionRaw : 0;
  const proteinCreonContribution =
    creonMode === "extended" ? proteinCreonContributionRaw : 0;

  const enzymeContributions = [
    { key: "fat", value: fatContribution },
    { key: "kh", value: khCreonContribution },
    { key: "protein", value: proteinCreonContribution },
  ].sort((a, b) => b.value - a.value);

  const enzymeColorMap = {};

  const max = enzymeContributions[0]?.value || 0;
  const second = enzymeContributions[1]?.value || 0;

  enzymeContributions.forEach((item) => {
    if (item.value <= 0) {
      enzymeColorMap[item.key] = "neutral";
    } else if (item.value === max) {
      enzymeColorMap[item.key] = "high";
    } else if (item.value === second) {
      enzymeColorMap[item.key] = "medium";
    } else {
      enzymeColorMap[item.key] = "low";
    }
  });

  const minKhTrigger =
    minKhTriggerThreshold > 0 && kh > minKhTriggerThreshold
      ? minEnzymeLoadValue
      : 0;
  const minProteinTrigger =
    minProteinTriggerThreshold > 0 && protein > minProteinTriggerThreshold
      ? minEnzymeLoadValue
      : 0;
  const minimalEnzymeLoad =
    creonMode === "extended" ? Math.max(minKhTrigger, minProteinTrigger) : 0;

  const minimalEnzymeReason =
    creonMode !== "extended"
      ? "uit"
      : minKhTrigger > 0 && minProteinTrigger > 0
        ? "KH + eiwit trigger"
        : minKhTrigger > 0
          ? "KH trigger"
          : minProteinTrigger > 0
            ? "Eiwit trigger"
            : "geen";

  const creon = calculateCreon({
    fat,
    protein,
    kh,
    settings,
  });

  const effectiveFat = creon.effectiveFat;
  const best = creon.best;

  let dominantEnzymeSource = "fat";
  let dominantEnzymeLabel = "Vooral vet-enzymen nodig";

  const enzymeProfileParts = [
    { key: "fat", label: "Vet", value: fat },
    { key: "kh", label: "KH", value: kh },
    { key: "protein", label: "Eiwit", value: protein },
  ].sort((a, b) => b.value - a.value);

  const topValue = enzymeProfileParts[0]?.value || 0;
  const secondValue = enzymeProfileParts[1]?.value || 0;

  if (topValue <= 0) {
    dominantEnzymeSource = "none";
    dominantEnzymeLabel = "Geen duidelijke enzymdominantie";
  } else if (secondValue > 0 && Math.abs(topValue - secondValue) <= 5) {
    dominantEnzymeSource = "mixed";
    dominantEnzymeLabel = "Gemengd enzymprofiel";
  } else if (enzymeProfileParts[0].key === "fat") {
    dominantEnzymeSource = "fat";
    dominantEnzymeLabel = "Vooral vet-enzymen nodig";
  } else if (enzymeProfileParts[0].key === "kh") {
    dominantEnzymeSource = "kh";
    dominantEnzymeLabel = "Vooral KH-enzymen nodig";
  } else if (enzymeProfileParts[0].key === "protein") {
    dominantEnzymeSource = "protein";
    dominantEnzymeLabel = "Vooral eiwit-enzymen nodig";
  }

  const giWeightedRows = rowsWithCalc.filter((r) => r.product && r.kh > 0);
  const totalGiWeight = giWeightedRows.reduce((a, r) => a + (r.kh || 0), 0);
  const weightedGi =
    totalGiWeight > 0
      ? round2(
          giWeightedRows.reduce((a, r) => {
            const gi = Number(r.product.giValue);
            const fallback = getFallbackGiValue(r.product.giClass);
            const useGi = Number.isFinite(gi) && gi >= 0 ? gi : fallback;
            return a + useGi * r.kh;
          }, 0) / totalGiWeight,
        )
      : 0;

  const giClassKey = getGiClassFromValue(weightedGi);

  const giClass =
    giClassKey === "high"
      ? "hoog"
      : giClassKey === "medium"
        ? "gemiddeld"
        : "laag";

  const mealGiLabel = getMealGiLabel(weightedGi);

  let { timingAdvice, timingMinutes } = getBaseTimingAdvice(giClass);

  ({ timingAdvice, timingMinutes } = applyFatDelayToTiming({
    fat,
    giClass,
    timingAdvice,
    timingMinutes,
  }));

  const {
    personalWeightedMinutes,
    personalTimingAdvice,
    personalTimingMinutesFinal,
    timingDiffers,
  } = getPersonalTimingAnalysis({
    rowsWithCalc,
    usePersonalTiming,
    timingAdvice,
    timingMinutes,
    fat,
    weightedGi,
    getTimingMinutes,
    timingOptions,
    round2,
  });

  const delayedRows = rowsWithCalc.filter(
    (r) =>
      r.product &&
      (r.product.absorptionProfile || "steady") === "delayed" &&
      (r.kh || 0) > 0,
  );
  const mealHasDelayedCarbs = delayedRows.length > 0;
  const delayedItemsText = delayedRows
    .map((r) => r.product?.name)
    .filter(Boolean)
    .join(", ");

  const baseFatDriven25 =
    fatPerCap25 > 0 ? Math.floor(fatContribution / fatPerCap25) : 0;
  const baseFatRemainder = fatContribution - baseFatDriven25 * fatPerCap25;
  const baseFatDriven10 =
    fatPerCap10 > 0
      ? Math.max(0, Math.ceil(baseFatRemainder / fatPerCap10))
      : 0;

  return {
    kh,
    protein,
    fat,
    kcal,
    insulin,
    weightedGi,
    weightedGiDisplay: weightedGi > 0 ? weightedGi : "-",
    giClass,
    mealGiLabel,
    timingAdvice,
    timingMinutes,
    usePersonalTiming,
    personalWeightedMinutes,
    personalTimingAdvice,
    personalTimingMinutesFinal,
    timingDiffers,
    mealHasDelayedCarbs,
    delayedItemsText,
    effectiveFat,
    enzymeLoad: creon.enzymeLoad,
    rawEnzymeLoad: creon.rawEnzymeLoad,
    inputMacros: creon.inputMacros,
    usedFactors: creon.usedFactors,
    creonGoal: creon.creonGoal,
    needsLightMealSupport: creon.needsLightMealSupport,
    lightMealReason: creon.lightMealReason,
    lightMealMinEnzymeLoad: creon.lightMealMinEnzymeLoad,

    dominantEnzymeSource,
    dominantEnzymeLabel,
    fatContribution: creon.fatContribution,
    proteinGlucoseContribution: creon.proteinGlucoseContribution,
    khCreonContribution: creon.khCreonContribution,
    proteinCreonContribution: creon.proteinCreonContribution,

    enzymeColorMap,

    minKhTrigger,
    minProteinTrigger,
    minimalEnzymeLoad,
    minimalEnzymeReason,
    minKhTriggerThreshold,
    minProteinTriggerThreshold,
    minEnzymeLoadValue,
    includeProteinGlucoseInCreon,
    best,
    creonModeLabel: getCreonModeLabel(creonMode),
    baseFatDrivenText: `${baseFatDriven25} x 25k + ${baseFatDriven10} x 10k`,
  };
}
