export function getGiClassMeta(giClass, giClassOptions) {
  return giClassOptions.find((x) => x.value === giClass) || giClassOptions[0];
}

export function getTimingLabel(value, timingOptions) {
  return (
    timingOptions.find((x) => x.value === value)?.label || "Bij eerste hap"
  );
}

export function getTimingMinutes(value, timingOptions) {
  return timingOptions.find((x) => x.value === value)?.minutes ?? 0;
}

export function getAbsorptionMeta(value, absorptionProfileOptions) {
  return (
    absorptionProfileOptions.find((x) => x.value === value) ||
    absorptionProfileOptions[1]
  );
}
