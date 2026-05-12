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
