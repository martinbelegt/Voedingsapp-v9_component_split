export function getGiClassFromValue(gi) {
  const value = Number(gi);

  if (!Number.isFinite(value) || value <= 0) {
    return "unknown";
  }

  if (value <= 55) {
    return "low";
  }

  if (value <= 69) {
    return "medium";
  }

  return "high";
}

export function getGiLabelFromClass(giClass) {
  switch (giClass) {
    case "low":
      return "Laag";
    case "medium":
      return "Middel";
    case "high":
      return "Hoog";
    default:
      return "Onbekend";
  }
}

export function getGiClassLabelFromValue(gi) {
  return getGiLabelFromClass(getGiClassFromValue(gi));
}
export function getMealGiLabel(weightedGi) {
  const value = Number(weightedGi);

  if (!Number.isFinite(value) || value <= 0) {
    return "Onbekend / gemengd";
  }

  if (value < 45) {
    return "Laag / geleidelijk";
  }

  if (value < 60) {
    return "Midden / normaal";
  }

  return "Hoog / sneller";
}
