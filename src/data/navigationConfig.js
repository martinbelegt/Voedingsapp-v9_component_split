import { term } from "../config/terminology";

export const mainNavigation = [
  { id: "daily", label: "Tijdlijn", color: "#0891b2" },
  { id: "registration", label: "Samenstellen", color: "#7c3aed" },
  { id: "routines", label: "Mijn routines", color: "#557a5b" },
  { id: "lists", label: "Mijn catalogi", color: "#16a34a" },
  { id: "record", label: "Mijn dossier", color: "#b45309" },
  { id: "community", label: "Onze community", color: "#a65338" },
  { id: "knowledge", label: "Kenniscentrum", color: "#557a5b" },
  { id: "settings", label: "Mijn profiel", color: "#475569" },
];

export const registrationModules = [
  { id: "meal", icon: "🍽️", label: term("food"), available: true },
];

export const libraryModules = [
  { id: "food", icon: "🥗", label: term("food"), available: true },
  { id: "supplements", icon: "💊", label: "Supplementen", available: true },
  { id: "medication", icon: "💊", label: term("medication") },
  { id: "exercises", icon: "💪", label: "Oefeningen" },
];

export const timelineRegistrationModules = [
  { id: "meal", icon: "🍽️", label: term("food") },
  { id: "supplement", icon: "💊", label: term("supplement") },
  { id: "medicine", icon: "💊", label: term("medication") },
  { id: "insulin", icon: "💉", label: term("insulin") },
  { id: "glucose", icon: "🩸", label: term("glucose") },
  { id: "weight", icon: "⚖️", label: term("weight") },
  { id: "movement", icon: "🚶", label: "Beweging" },
  { id: "bowel", icon: "🚽", label: "Stoelgang" },
  { id: "note", icon: "📝", label: term("note") },
];

export const recordModules = [
  { id: "medication", icon: "💊", label: term("medication") },
  { id: "glucose", icon: "🩸", label: term("glucose") },
  { id: "insulin", icon: "💉", label: term("insulin") },
  { id: "weight", icon: "⚖️", label: term("weight") },
  { id: "blood-pressure", icon: "🩺", label: term("bloodPressure") },
  { id: "laboratory", icon: "🧪", label: "Laboratorium" },
  { id: "symptoms", icon: "❤️", label: "Symptomen" },
];
