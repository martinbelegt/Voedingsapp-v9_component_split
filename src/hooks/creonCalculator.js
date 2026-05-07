export function calculateCreon({ fat, protein, kh, settings }) {
  const round2 = (n) => Math.round(n * 100) / 100;

  const fatPerCap25 = Number(settings.fatPerCap25) || 0;
  const fatPerCap10 = Number(settings.fatPerCap10) || 0;
  const proteinCorrection = Number(settings.proteinCorrection) || 0;

  const khCreonFactor = Number(settings.khCreonFactor) || 0;
  const proteinCreonFactor = Number(settings.proteinCreonFactor) || 0;

  const includeProteinGlucoseInCreon = !!settings.includeProteinGlucoseInCreon;

  const creonMode = settings.creonMode || "standard";

  const fatContribution = round2(fat);
  const proteinGlucoseContribution = round2(protein * proteinCorrection);

  const khCreonContribution =
    creonMode === "extended" ? round2(kh * khCreonFactor) : 0;

  const proteinCreonContribution =
    creonMode === "extended" ? round2(protein * proteinCreonFactor) : 0;

  const effectiveFat = round2(
    fatContribution +
      khCreonContribution +
      proteinCreonContribution +
      (includeProteinGlucoseInCreon ? proteinGlucoseContribution : 0),
  );

  const options = [
    {
      label: "Alleen 10k",
      c25: 0,
      c10: fatPerCap10 > 0 ? Math.ceil(effectiveFat / fatPerCap10) : 0,
    },
    {
      label: "25k + rest 10k",
      c25: fatPerCap25 > 0 ? Math.floor(effectiveFat / fatPerCap25) : 0,
      c10: 0,
    },
    {
      label: "Alleen 25k",
      c25: fatPerCap25 > 0 ? Math.ceil(effectiveFat / fatPerCap25) : 0,
      c10: 0,
    },
  ].map((o) => {
    const c10 =
      o.label === "25k + rest 10k"
        ? Math.max(
            0,
            fatPerCap10 > 0 && fatPerCap25 > 0
              ? Math.ceil((effectiveFat - o.c25 * fatPerCap25) / fatPerCap10)
              : 0,
          )
        : o.c10;

    const covered = o.c25 * fatPerCap25 + c10 * fatPerCap10;
    const over = round2(covered - effectiveFat);
    const score = over * 1000 + o.c25 + c10;

    return { ...o, c10, over, score };
  });

  const best = [...options].sort((a, b) => a.score - b.score)[0] || {
    c25: 0,
    c10: 0,
  };

  return {
    effectiveFat,
    best,
    fatContribution,
    proteinGlucoseContribution,
    khCreonContribution,
    proteinCreonContribution,
  };
}
