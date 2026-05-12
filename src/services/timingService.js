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
