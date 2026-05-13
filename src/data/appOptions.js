export const giClassOptions = [
  { value: "unknown", label: "Onbekend", color: "#e2e8f0" },
  { value: "low", label: "Laag", color: "#dcfce7" },
  { value: "medium", label: "Midden", color: "#fef3c7" },
  { value: "high", label: "Hoog", color: "#fee2e2" },
];

export const timingOptions = [
  { value: "meal", label: "Bij eerste hap", minutes: 0 },
  { value: "early5", label: "5 min eerder", minutes: 5 },
  { value: "early10", label: "10 min eerder", minutes: 10 },
  { value: "early15", label: "15 min eerder", minutes: 15 },
  { value: "early20", label: "20 min eerder", minutes: 20 },
  { value: "split", label: "Gespreid / opletten", minutes: 0 },
  { value: "late", label: "Niet eerder / mogelijk later", minutes: 0 },
];

export const absorptionProfileOptions = [
  { value: "fast", label: "Snel", color: "#fee2e2" },
  { value: "steady", label: "Geleidelijk", color: "#dcfce7" },
  { value: "delayed", label: "Vertraagd / PPP", color: "#e0e7ff" },
];

export const enzymeTriggerPresets = {
  voorzichtig: {
    minKhTriggerThreshold: "25",
    minProteinTriggerThreshold: "20",
    minEnzymeLoadValue: "10",
  },
  standaard: {
    minKhTriggerThreshold: "20",
    minProteinTriggerThreshold: "15",
    minEnzymeLoadValue: "10",
  },
  gevoelig: {
    minKhTriggerThreshold: "15",
    minProteinTriggerThreshold: "10",
    minEnzymeLoadValue: "15",
  },
};
export const BRISTOL_OPTIONS = [
  { value: "1", label: "1 - zeer hard / keutels" },
  { value: "2", label: "2 - hard / klonterig" },
  { value: "3", label: "3 - worst met barstjes" },
  { value: "4", label: "4 - glad / ideaal" },
  { value: "5", label: "5 - zachte stukjes" },
  { value: "6", label: "6 - brijig / papperig" },
  { value: "7", label: "7 - waterdun" },
];
