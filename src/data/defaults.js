export const defaultSettings = {
  settingsVersion: 2,

  basalInsulinName: "Tresiba",
  bolusInsulinName: "Novorapid",

  gramsKhPerUnit: "8",

  useCreon35000: true,
  useCreon25000: true,
  useCreon10000: true,
  useCreon5000: false,

  fatPerCap35: "",
  fatPerCap25: "25",
  fatPerCap10: "10",
  fatPerCap5: "",

  creonMode: "standard",
  creonGoal: "comfort",
  proteinCorrection: "0",
  khCreonFactor: "0",
  proteinCreonFactor: "0",
  includeProteinGlucoseInCreon: false,
  minKhForLightMealCreon: "12",
  minProteinForLightMealCreon: "8",
  lightMealMinEnzymeLoad: "8",

  usePersonalTiming: true,

  minKhTriggerThreshold: "20",
  minProteinTriggerThreshold: "15",
  minEnzymeLoadValue: "10",
  enzymeTriggerPreset: "standaard",

  dailyTargets: {
    maintenanceKcal: 2250,
    targetKcal: 2000,
    proteinGoal: 140,
    proteinMealGoal: 35,
  },
};
