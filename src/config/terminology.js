export const TERMINOLOGY = Object.freeze({
  food: Object.freeze({
    singular: "Voeding",
    register: "Voeding registreren",
    edit: "Voeding wijzigen",
    total: "Voedingstotaal",
    template: "Voedingssjabloon",
    templates: "Voedingssjablonen",
    nameLabel: "Naam van voeding",
  }),
  supplement: Object.freeze({
    singular: "Supplement",
    register: "Supplement registreren",
    edit: "Supplement wijzigen",
  }),
  medication: Object.freeze({
    singular: "Medicatie",
    register: "Medicatie registreren",
    edit: "Medicatie wijzigen",
  }),
  strengthTraining: Object.freeze({
    singular: "Krachttraining",
    register: "Krachttraining registreren",
    plan: "Krachttraining plannen",
  }),
  movement: Object.freeze({
    singular: "Beweging",
    register: "Beweging registreren",
  }),
  insulin: Object.freeze({
    singular: "Insuline",
    register: "Insuline registreren",
    edit: "Insuline wijzigen",
  }),
  glucose: Object.freeze({
    singular: "Glucose",
    register: "Glucose registreren",
    edit: "Glucose wijzigen",
  }),
  symptom: Object.freeze({
    singular: "Symptoom",
    register: "Symptoom registreren",
  }),
  bloodPressure: Object.freeze({
    singular: "Bloeddruk",
    register: "Bloeddruk registreren",
  }),
  weight: Object.freeze({
    singular: "Gewicht",
    register: "Gewicht registreren",
  }),
  sleep: Object.freeze({
    singular: "Slaap",
    register: "Slaap registreren",
  }),
  note: Object.freeze({
    singular: "Notitie",
    register: "Notitie registreren",
    edit: "Notitie wijzigen",
  }),
});

export const term = (domain, variant = "singular") =>
  TERMINOLOGY[domain]?.[variant] || domain;
