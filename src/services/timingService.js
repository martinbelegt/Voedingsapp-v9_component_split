export function getBaseTimingAdvice(giClass) {
  if (giClass === "hoog") {
    return {
      timingAdvice: "10 min vóór eten",
      timingMinutes: 10,
    };
  }

  if (giClass === "gemiddeld") {
    return {
      timingAdvice: "5 min vóór eten",
      timingMinutes: 5,
    };
  }

  return {
    timingAdvice: "Bij eerste hap",
    timingMinutes: 0,
  };
}
export function applyFatDelayToTiming({
  fat,
  giClass,
  timingAdvice,
  timingMinutes,
}) {
  if (fat > 20 && giClass !== "hoog") {
    return {
      timingAdvice: "Bij eerste hap (vet vertraagt opname)",
      timingMinutes: 0,
    };
  }

  return {
    timingAdvice,
    timingMinutes,
  };
}
export function getPersonalTimingAnalysis({
  rowsWithCalc,
  usePersonalTiming,
  timingAdvice,
  timingMinutes,
  fat,
  weightedGi,
  getTimingMinutes,
  timingOptions,
  round2,
}) {
  const personalTimingRows = rowsWithCalc.filter((r) => r.product && r.kh > 0);

  const totalKhForTiming = personalTimingRows.reduce(
    (a, r) => a + (r.kh || 0),
    0,
  );

  const personalWeightedMinutes =
    usePersonalTiming && totalKhForTiming > 0
      ? round2(
          personalTimingRows.reduce((a, r) => {
            const minutes = getTimingMinutes(
              r.product.personalTimingTag || r.product.timingTag,
              timingOptions,
            );

            return a + minutes * (r.kh || 0);
          }, 0) / totalKhForTiming,
        )
      : 0;

  let personalTimingAdvice = timingAdvice;
  let personalTimingMinutesFinal = timingMinutes;

  if (usePersonalTiming && totalKhForTiming > 0) {
    if (personalWeightedMinutes >= 17.5) {
      personalTimingAdvice = "20 min vóór eten (persoonlijk profiel)";
      personalTimingMinutesFinal = 20;
    } else if (personalWeightedMinutes >= 12.5) {
      personalTimingAdvice = "15 min vóór eten (persoonlijk profiel)";
      personalTimingMinutesFinal = 15;
    } else if (personalWeightedMinutes >= 7.5) {
      personalTimingAdvice = "10 min vóór eten (persoonlijk profiel)";
      personalTimingMinutesFinal = 10;
    } else if (personalWeightedMinutes >= 2.5) {
      personalTimingAdvice = "5 min vóór eten (persoonlijk profiel)";
      personalTimingMinutesFinal = 5;
    } else {
      personalTimingAdvice = "Bij eerste hap (persoonlijk profiel)";
      personalTimingMinutesFinal = 0;
    }

    if (fat > 20 && weightedGi < 70) {
      personalTimingAdvice =
        "Bij eerste hap (persoonlijk profiel + vetvertraging)";
      personalTimingMinutesFinal = 0;
    }
  }

  const timingDiffers =
    personalTimingAdvice !== timingAdvice ||
    personalTimingMinutesFinal !== timingMinutes;

  return {
    personalWeightedMinutes,
    personalTimingAdvice,
    personalTimingMinutesFinal,
    timingDiffers,
  };
}
