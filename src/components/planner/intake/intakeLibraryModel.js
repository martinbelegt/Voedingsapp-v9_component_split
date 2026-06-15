export const intakeCategories = [
  { id: "medication", label: "Medicatie", icon: "💊" },
  { id: "enzyme", label: "Enzym", icon: "🧬" },
  { id: "supplement", label: "Supplement", icon: "🌿" },
];

export const starterIntakeItems = [
  {
    id: "intake-creatine",
    name: "Creatine Monohydraat",
    category: "supplement",
    defaultDosage: "5 gram",
    defaultTime: "09:00",
    note: "Bij voorkeur met natrium / voldoende vocht.",
    active: true,
  },
  {
    id: "intake-vitamine-d",
    name: "Vitamine D",
    category: "supplement",
    defaultDosage: "75 mcg",
    defaultTime: "12:00",
    note: "Bij voorkeur innemen bij vetrijke maaltijd.",
    active: true,
  },
  {
    id: "intake-magnesium",
    name: "Magnesium",
    category: "supplement",
    defaultDosage: "1 capsule",
    defaultTime: "22:00",
    note: "Avondroutine.",
    active: true,
  },
  {
    id: "intake-creon-25000",
    name: "Creon 25.000",
    category: "enzyme",
    defaultDosage: "1 capsule",
    defaultTime: "",
    note: "Rond of tijdens maaltijd innemen.",
    active: true,
  },
  {
    id: "intake-tamsulosine",
    name: "Tamsulosine",
    category: "medication",
    defaultDosage: "1 tablet",
    defaultTime: "08:00",
    note: "Vast dagelijks innamemoment.",
    active: true,
  },
];
