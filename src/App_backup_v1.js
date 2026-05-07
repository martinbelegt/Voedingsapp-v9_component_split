import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDailyLog } from "./hooks/useDailyLog";
import { useSavedMeals } from "./hooks/useSavedMeals";
import { useProducts } from "./hooks/useProducts";
import { useCategories } from "./hooks/useCategories";
import { useSettings } from "./hooks/useSettings";
import { useMealRows } from "./hooks/useMealRows";
import { MealTotalsCard } from "./components/MealTotalsCard";
import { MealRowCard } from "./components/MealRowCard";
import { SavedMealCard } from "./components/SavedMealCard";
import { DailyMealCard } from "./components/DailyMealCard";
import {
  getCategoryById,
  getCategoryName,
  getCategoryColor,
  getProductById,
} from "./services/productHelpers";
import {
  getGiClassMeta,
  getTimingLabel,
  getTimingMinutes,
  getAbsorptionMeta,
} from "./services/uiHelpers";

const CATEGORY_FALLBACK_COLORS = [
  "#fef3c7",
  "#fde68a",
  "#dbeafe",
  "#dcfce7",
  "#bbf7d0",
  "#fee2e2",
  "#e9d5ff",
  "#fef9c3",
  "#e0f2fe",
  "#ede9fe",
  "#fce7f3",
  "#e2e8f0",
];

const starterCategories = [
  { id: "cat-brood", name: "Brood & graanproducten", color: "#fef3c7" },
  { id: "cat-beleg", name: "Beleg", color: "#fde68a" },
  { id: "cat-zuivel", name: "Zuivel", color: "#dbeafe" },
  { id: "cat-fruit", name: "Fruit", color: "#dcfce7" },
  { id: "cat-groente", name: "Groente", color: "#bbf7d0" },
  { id: "cat-snacks", name: "Snacks & tussendoor", color: "#fee2e2" },
  { id: "cat-maaltijden", name: "Maaltijden", color: "#e9d5ff" },
  { id: "cat-vetten", name: "Vetten & sauzen", color: "#fef9c3" },
  { id: "cat-dranken", name: "Dranken", color: "#e0f2fe" },
  { id: "cat-sport", name: "Sport & supplementen", color: "#ede9fe" },
  { id: "cat-overig", name: "Overig", color: "#e2e8f0" },
];

const giClassOptions = [
  { value: "unknown", label: "Onbekend", color: "#e2e8f0" },
  { value: "low", label: "Laag", color: "#dcfce7" },
  { value: "medium", label: "Midden", color: "#fef3c7" },
  { value: "high", label: "Hoog", color: "#fee2e2" },
];

const timingOptions = [
  { value: "meal", label: "Bij eerste hap", minutes: 0 },
  { value: "early5", label: "5 min eerder", minutes: 5 },
  { value: "early10", label: "10 min eerder", minutes: 10 },
  { value: "early15", label: "15 min eerder", minutes: 15 },
  { value: "early20", label: "20 min eerder", minutes: 20 },
  { value: "split", label: "Gespreid / opletten", minutes: 0 },
  { value: "late", label: "Niet eerder / mogelijk later", minutes: 0 },
];

const absorptionProfileOptions = [
  { value: "fast", label: "Snel", color: "#fee2e2" },
  { value: "steady", label: "Geleidelijk", color: "#dcfce7" },
  { value: "delayed", label: "Vertraagd / PPP", color: "#e0e7ff" },
];

const enzymeTriggerPresets = {
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

const giStarterData = {
  Volkorenbrood: {
    giClass: "high",
    giValue: 74,
    timingTag: "early10",
    giNotes: "Diabetes Fonds: brood, volkoren GI 74 (hoog).",
  },
  Witbrood: {
    giClass: "high",
    giValue: 75,
    timingTag: "early10",
    giNotes: "Diabetes Fonds: brood, wit GI 75 (hoog).",
  },
  Roggebrood: {
    giClass: "low",
    giValue: 50,
    timingTag: "meal",
    giNotes: "Diabetes Fonds: GI 50 (laag).",
  },
  Havermout: {
    giClass: "low",
    giValue: 48,
    timingTag: "meal",
    giNotes:
      "Benaderd op basis van volkoren granen / volkorenpasta-profiel: laag.",
  },
  "Muesli ongezoet": {
    giClass: "low",
    giValue: 49,
    timingTag: "meal",
    giNotes: "Benaderd op basis van volkoren graanproduct: laag.",
  },
  Cornflakes: {
    giClass: "high",
    giValue: 81,
    timingTag: "early15",
    giNotes: "Diabetes Fonds: GI 81 (hoog).",
  },
  "Rijst gekookt": {
    giClass: "high",
    giValue: 73,
    timingTag: "early10",
    giNotes:
      "Benaderd op basis van witte rijst in Diabetes Fonds-lijst: GI 73 (hoog).",
  },
  "Pasta gekookt": {
    giClass: "low",
    giValue: 49,
    timingTag: "meal",
    giNotes: "Benaderd op basis van pasta wit: GI 49 (laag).",
  },
  "Wraps tarwe": {
    giClass: "medium",
    giValue: 69,
    timingTag: "early5",
    giNotes: "Benaderd op basis van bagel / tarwebasis: gemiddeld.",
  },
  Tortilla: {
    giClass: "medium",
    giValue: 69,
    timingTag: "early5",
    giNotes: "Benaderd op basis van vergelijkbaar tarweproduct: gemiddeld.",
  },
  "Couscous gekookt": {
    giClass: "medium",
    giValue: 65,
    timingTag: "early5",
    giNotes: "Diabetes Fonds: GI 65 (gemiddeld).",
  },
  "Quinoa gekookt": {
    giClass: "low",
    giValue: 53,
    timingTag: "meal",
    giNotes: "Diabetes Fonds: GI 53 (laag).",
  },
  "48+ kaas": {
    giClass: "low",
    giValue: 15,
    timingTag: "late",
    giNotes: "Nauwelijks koolhydraten; praktisch zeer laag effect.",
  },
  "30+ kaas": {
    giClass: "low",
    giValue: 15,
    timingTag: "late",
    giNotes: "Nauwelijks koolhydraten; praktisch zeer laag effect.",
  },
  "Kipfilet beleg": {
    giClass: "low",
    giValue: 10,
    timingTag: "late",
    giNotes: "Vrijwel geen koolhydraten; praktisch zeer laag effect.",
  },
  Ham: {
    giClass: "low",
    giValue: 10,
    timingTag: "late",
    giNotes: "Vrijwel geen koolhydraten; praktisch zeer laag effect.",
  },
  Pindakaas: {
    giClass: "low",
    giValue: 14,
    timingTag: "split",
    giNotes: "Benaderd op basis van pinda's: GI 14 (laag).",
  },
  Jam: {
    giClass: "medium",
    giValue: 61,
    timingTag: "early5",
    giNotes: "Benaderd op basis van honing / suikerrijk beleg: gemiddeld.",
  },
  "Hagelslag melk": {
    giClass: "medium",
    giValue: 49,
    timingTag: "meal",
    giNotes:
      "Benaderd op basis van melkchocolade: laag tot gemiddeld; hier gemiddeld-praktisch gekozen.",
  },
  Nutella: {
    giClass: "medium",
    giValue: 49,
    timingTag: "split",
    giNotes:
      "Benaderd op basis van melkchocolade met vet: meestal niet snel, maar ook niet nul.",
  },
  Hummus: {
    giClass: "low",
    giValue: 32,
    timingTag: "meal",
    giNotes: "Benaderd op basis van linzen / peulvruchtenprofiel: laag.",
  },
  "Halfvolle melk": {
    giClass: "low",
    giValue: 38,
    timingTag: "meal",
    giNotes: "Diabetes Fonds: GI 38 (laag).",
  },
  "Magere yoghurt": {
    giClass: "low",
    giValue: 33,
    timingTag: "meal",
    giNotes: "Diabetes Fonds: GI 33 (laag).",
  },
  "Griekse yoghurt 10%": {
    giClass: "low",
    giValue: 33,
    timingTag: "late",
    giNotes: "Benaderd op basis van yoghurt, mager; vet vertraagt vaak extra.",
  },
  "Magere kwark": {
    giClass: "low",
    giValue: 33,
    timingTag: "meal",
    giNotes: "Benaderd op basis van yoghurt, mager: laag.",
  },
  Roomkaas: {
    giClass: "low",
    giValue: 15,
    timingTag: "late",
    giNotes: "Zeer weinig koolhydraten; praktisch laag effect.",
  },
  "Haverdrink ongezoet": {
    giClass: "low",
    giValue: 38,
    timingTag: "meal",
    giNotes: "Benaderd tussen melk en havergraanprofiel in: laag.",
  },
  Appel: {
    giClass: "low",
    giValue: 36,
    timingTag: "meal",
    giNotes: "Diabetes Fonds: GI 36 (laag).",
  },
  Banaan: {
    giClass: "low",
    giValue: 51,
    timingTag: "meal",
    giNotes: "Diabetes Fonds: rijpe banaan GI 51 (laag).",
  },
  Aardbeien: {
    giClass: "low",
    giValue: 40,
    timingTag: "meal",
    giNotes: "Benaderd op basis van laag GI-fruit: laag.",
  },
  "Blauwe bessen": {
    giClass: "low",
    giValue: 53,
    timingTag: "meal",
    giNotes:
      "Benaderd op basis van laag fruitprofiel, richting gemiddeld maar nog laag.",
  },
  Sinaasappel: {
    giClass: "low",
    giValue: 43,
    timingTag: "meal",
    giNotes: "Diabetes Fonds: GI 43 (laag).",
  },
  Druiven: {
    giClass: "medium",
    giValue: 59,
    timingTag: "meal",
    giNotes: "Diabetes Fonds: GI 59 (gemiddeld).",
  },
  Mango: {
    giClass: "medium",
    giValue: 60,
    timingTag: "meal",
    giNotes: "Benaderd op basis van papaja / tropisch fruitprofiel: gemiddeld.",
  },
  Tomaat: {
    giClass: "low",
    giValue: 10,
    timingTag: "meal",
    giNotes: "Diabetes Fonds: GI 10 (laag).",
  },
  Komkommer: {
    giClass: "low",
    giValue: 10,
    timingTag: "meal",
    giNotes: "Benaderd op basis van zeer koolhydraatarme groente: laag.",
  },
  Paprika: {
    giClass: "low",
    giValue: 15,
    timingTag: "meal",
    giNotes: "Benaderd op basis van groenteprofiel: laag.",
  },
  Wortel: {
    giClass: "low",
    giValue: 39,
    timingTag: "meal",
    giNotes: "Diabetes Fonds: wortels, gekookt GI 39 (laag).",
  },
  Spinazie: {
    giClass: "low",
    giValue: 10,
    timingTag: "meal",
    giNotes: "Benaderd op basis van zeer koolhydraatarme groente: laag.",
  },
  Broccoli: {
    giClass: "low",
    giValue: 15,
    timingTag: "meal",
    giNotes: "Benaderd op basis van groenteprofiel: laag.",
  },
  Courgette: {
    giClass: "low",
    giValue: 15,
    timingTag: "meal",
    giNotes: "Benaderd op basis van groenteprofiel: laag.",
  },
  Snickers: {
    giClass: "medium",
    giValue: 65,
    timingTag: "split",
    giNotes: "Benaderd op basis van candybar: GI 65 (gemiddeld).",
  },
  Mars: {
    giClass: "medium",
    giValue: 65,
    timingTag: "split",
    giNotes: "Benaderd op basis van candybar: GI 65 (gemiddeld).",
  },
  "Chips naturel": {
    giClass: "medium",
    giValue: 56,
    timingTag: "split",
    giNotes: "Diabetes Fonds: chips GI 56 (gemiddeld).",
  },
  "Chocolade puur": {
    giClass: "low",
    giValue: 22,
    timingTag: "late",
    giNotes: "Diabetes Fonds: GI 22 (laag).",
  },
  "Chocolade melk": {
    giClass: "low",
    giValue: 49,
    timingTag: "meal",
    giNotes: "Diabetes Fonds: GI 49 (laag).",
  },
  Biscuitkoekje: {
    giClass: "medium",
    giValue: 66,
    timingTag: "early5",
    giNotes: "Benaderd op basis van Evergreen met krenten: GI 66 (gemiddeld).",
  },
  "Notenmix ongezouten": {
    giClass: "low",
    giValue: 20,
    timingTag: "late",
    giNotes: "Benaderd op basis van walnoten / cashewnoten / pinda's: laag.",
  },
  "Kipfilet gebakken": {
    giClass: "low",
    giValue: 10,
    timingTag: "late",
    giNotes: "Geen noemenswaardige koolhydraten; praktisch laag effect.",
  },
  "Rundergehakt 15%": {
    giClass: "low",
    giValue: 10,
    timingTag: "late",
    giNotes: "Geen noemenswaardige koolhydraten; praktisch laag effect.",
  },
  Zalm: {
    giClass: "low",
    giValue: 10,
    timingTag: "late",
    giNotes: "Geen noemenswaardige koolhydraten; praktisch laag effect.",
  },
  "Aardappelen gekookt": {
    giClass: "high",
    giValue: 78,
    timingTag: "early10",
    giNotes: "Diabetes Fonds: GI 78 (hoog).",
  },
  Omelet: {
    giClass: "low",
    giValue: 15,
    timingTag: "late",
    giNotes: "Nauwelijks koolhydraten; praktisch laag effect.",
  },
  Boter: {
    giClass: "low",
    giValue: 10,
    timingTag: "late",
    giNotes: "Vrijwel geen koolhydraten; praktisch laag effect.",
  },
  Margarine: {
    giClass: "low",
    giValue: 10,
    timingTag: "late",
    giNotes: "Vrijwel geen koolhydraten; praktisch laag effect.",
  },
  Olijfolie: {
    giClass: "low",
    giValue: 10,
    timingTag: "late",
    giNotes: "Geen koolhydraten; GI praktisch verwaarloosbaar.",
  },
  Mayonaise: {
    giClass: "low",
    giValue: 10,
    timingTag: "late",
    giNotes: "Zeer weinig koolhydraten; praktisch laag effect.",
  },
  Ketchup: {
    giClass: "medium",
    giValue: 61,
    timingTag: "early5",
    giNotes:
      "Benaderd op basis van suikerrijke saus / honingprofiel: gemiddeld.",
  },
  Pindasaus: {
    giClass: "low",
    giValue: 24,
    timingTag: "split",
    giNotes: "Benaderd op basis van pinda's / peulvruchtenprofiel: laag.",
  },
  Water: {
    giClass: "low",
    giValue: 0,
    timingTag: "late",
    giNotes: "Geen koolhydraten.",
  },
  "Koffie zwart": {
    giClass: "low",
    giValue: 0,
    timingTag: "late",
    giNotes: "Geen koolhydraten.",
  },
  Thee: {
    giClass: "low",
    giValue: 0,
    timingTag: "late",
    giNotes: "Geen koolhydraten.",
  },
  Cola: {
    giClass: "medium",
    giValue: 63,
    timingTag: "early5",
    giNotes: "Diabetes Fonds: Coca Cola GI 63 (gemiddeld).",
  },
  Sinaasappelsap: {
    giClass: "low",
    giValue: 50,
    timingTag: "meal",
    giNotes: "Diabetes Fonds: GI 50 (laag).",
  },
  Energiedrank: {
    giClass: "high",
    giValue: 78,
    timingTag: "early10",
    giNotes: "Benaderd op basis van Gatorade sportdrank: GI 78 (hoog).",
  },
  "Whey eiwitpoeder": {
    giClass: "low",
    giValue: 20,
    timingTag: "meal",
    giNotes: "Meestal laag door weinig snelle koolhydraten; merkafhankelijk.",
  },
  "Creatine monohydraat": {
    giClass: "low",
    giValue: 0,
    timingTag: "late",
    giNotes: "Geen koolhydraten.",
  },
  "Pre-workout": {
    giClass: "medium",
    giValue: 61,
    timingTag: "early5",
    giNotes: "Sterk merkafhankelijk; hier conservatief gemiddeld gezet.",
  },
  Eiwitreep: {
    giClass: "medium",
    giValue: 65,
    timingTag: "split",
    giNotes:
      "Benaderd op basis van candybar, met eiwit/vet als mogelijke vertragers.",
  },
  "Tastino Knackebrod Zonnebloempit Lidl": {
    giClass: "medium",
    giValue: 65,
    timingTag: "early5",
    giNotes:
      "Benaderd op basis van knäckebröd/crispbread met zaden: gemiddeld.",
  },
  "Tastino Knäckebröd Zonnebloempit Lidl": {
    giClass: "medium",
    giValue: 65,
    timingTag: "early5",
    giNotes:
      "Benaderd op basis van knäckebröd/crispbread met zaden: gemiddeld.",
  },
  "Zonnebloempit Brood (Lidl)": {
    giClass: "medium",
    giValue: 58,
    timingTag: "meal",
    giNotes:
      "Benaderd op basis van volkoren/zadenbrood: midden, lager dan wit brood.",
  },
  Kippenpoot: {
    giClass: "low",
    giValue: 10,
    timingTag: "late",
    giNotes: "Geen noemenswaardige koolhydraten; GI praktisch nul.",
  },
  Walnoten: {
    giClass: "low",
    giValue: 15,
    timingTag: "late",
    giNotes: "Zeer lage GI; vet vertraagt opname sterk.",
  },
  "Sondey Reuze Mergpijpen": {
    giClass: "medium",
    giValue: 63,
    timingTag: "split",
    giNotes: "Suiker + vet combinatie: gematigde maar vertraagde stijging.",
  },
};

const starterProducts = [
  {
    id: "1",
    categoryId: "cat-brood",
    name: "Volkorenbrood",
    portion: "1 snee",
    portionGram: 35,
    kh100: 41,
    protein100: 8.5,
    fat100: 1.7,
    kcal100: 247,
    favorite: true,
  },
  {
    id: "2",
    categoryId: "cat-brood",
    name: "Witbrood",
    portion: "1 snee",
    portionGram: 35,
    kh100: 49,
    protein100: 8,
    fat100: 2.5,
    kcal100: 265,
    favorite: false,
  },
  {
    id: "3",
    categoryId: "cat-brood",
    name: "Roggebrood",
    portion: "1 snee",
    portionGram: 30,
    kh100: 48,
    protein100: 4.7,
    fat100: 1.1,
    kcal100: 214,
    favorite: false,
  },
  {
    id: "4",
    categoryId: "cat-brood",
    name: "Havermout",
    portion: "1 portie",
    portionGram: 40,
    kh100: 60,
    protein100: 13,
    fat100: 7,
    kcal100: 379,
    favorite: true,
  },
  {
    id: "5",
    categoryId: "cat-brood",
    name: "Muesli ongezoet",
    portion: "1 portie",
    portionGram: 45,
    kh100: 55,
    protein100: 10,
    fat100: 6,
    kcal100: 350,
    favorite: false,
  },
  {
    id: "6",
    categoryId: "cat-brood",
    name: "Cornflakes",
    portion: "1 portie",
    portionGram: 30,
    kh100: 84,
    protein100: 7,
    fat100: 0.4,
    kcal100: 357,
    favorite: false,
  },
  {
    id: "7",
    categoryId: "cat-brood",
    name: "Rijst gekookt",
    portion: "1 portie",
    portionGram: 150,
    kh100: 28,
    protein100: 2.7,
    fat100: 0.3,
    kcal100: 130,
    favorite: false,
  },
  {
    id: "8",
    categoryId: "cat-brood",
    name: "Pasta gekookt",
    portion: "1 portie",
    portionGram: 150,
    kh100: 25,
    protein100: 5,
    fat100: 1.1,
    kcal100: 131,
    favorite: false,
  },
  {
    id: "9",
    categoryId: "cat-brood",
    name: "Wraps tarwe",
    portion: "1 wrap",
    portionGram: 40,
    kh100: 49,
    protein100: 8,
    fat100: 4.9,
    kcal100: 310,
    favorite: false,
  },
  {
    id: "10",
    categoryId: "cat-brood",
    name: "Tortilla",
    portion: "1 stuk",
    portionGram: 40,
    kh100: 45,
    protein100: 7,
    fat100: 4,
    kcal100: 290,
    favorite: false,
  },
  {
    id: "11",
    categoryId: "cat-brood",
    name: "Couscous gekookt",
    portion: "1 portie",
    portionGram: 150,
    kh100: 23,
    protein100: 3.8,
    fat100: 0.2,
    kcal100: 112,
    favorite: false,
  },
  {
    id: "12",
    categoryId: "cat-brood",
    name: "Quinoa gekookt",
    portion: "1 portie",
    portionGram: 150,
    kh100: 21,
    protein100: 4.4,
    fat100: 1.9,
    kcal100: 120,
    favorite: false,
  },
  {
    id: "13",
    categoryId: "cat-beleg",
    name: "48+ kaas",
    portion: "1 plak",
    portionGram: 20,
    kh100: 1.5,
    protein100: 25,
    fat100: 33,
    kcal100: 412,
    favorite: true,
  },
  {
    id: "14",
    categoryId: "cat-beleg",
    name: "30+ kaas",
    portion: "1 plak",
    portionGram: 20,
    kh100: 1.5,
    protein100: 30,
    fat100: 20,
    kcal100: 300,
    favorite: false,
  },
  {
    id: "15",
    categoryId: "cat-beleg",
    name: "Kipfilet beleg",
    portion: "1 plak",
    portionGram: 15,
    kh100: 2,
    protein100: 19,
    fat100: 2,
    kcal100: 110,
    favorite: false,
  },
  {
    id: "16",
    categoryId: "cat-beleg",
    name: "Ham",
    portion: "1 plak",
    portionGram: 15,
    kh100: 1,
    protein100: 18,
    fat100: 3,
    kcal100: 113,
    favorite: false,
  },
  {
    id: "17",
    categoryId: "cat-beleg",
    name: "Pindakaas",
    portion: "1 portie",
    portionGram: 15,
    kh100: 14,
    protein100: 25,
    fat100: 50,
    kcal100: 588,
    favorite: true,
  },
  {
    id: "18",
    categoryId: "cat-beleg",
    name: "Jam",
    portion: "1 portie",
    portionGram: 20,
    kh100: 60,
    protein100: 0.5,
    fat100: 0.2,
    kcal100: 250,
    favorite: false,
  },
  {
    id: "19",
    categoryId: "cat-beleg",
    name: "Hagelslag melk",
    portion: "1 portie",
    portionGram: 15,
    kh100: 75,
    protein100: 4,
    fat100: 11,
    kcal100: 460,
    favorite: false,
  },
  {
    id: "20",
    categoryId: "cat-beleg",
    name: "Nutella",
    portion: "1 portie",
    portionGram: 15,
    kh100: 57,
    protein100: 6,
    fat100: 31,
    kcal100: 539,
    favorite: false,
  },
  {
    id: "21",
    categoryId: "cat-beleg",
    name: "Hummus",
    portion: "1 portie",
    portionGram: 20,
    kh100: 14,
    protein100: 8,
    fat100: 9,
    kcal100: 166,
    favorite: false,
  },
  {
    id: "22",
    categoryId: "cat-zuivel",
    name: "Halfvolle melk",
    portion: "1 glas",
    portionGram: 200,
    kh100: 5,
    protein100: 3.5,
    fat100: 1.5,
    kcal100: 47,
    favorite: false,
  },
  {
    id: "23",
    categoryId: "cat-zuivel",
    name: "Magere yoghurt",
    portion: "1 portie",
    portionGram: 150,
    kh100: 4,
    protein100: 4,
    fat100: 0.2,
    kcal100: 40,
    favorite: false,
  },
  {
    id: "24",
    categoryId: "cat-zuivel",
    name: "Griekse yoghurt 10%",
    portion: "1 portie",
    portionGram: 150,
    kh100: 4,
    protein100: 6,
    fat100: 10,
    kcal100: 120,
    favorite: true,
  },
  {
    id: "25",
    categoryId: "cat-zuivel",
    name: "Magere kwark",
    portion: "1 portie",
    portionGram: 200,
    kh100: 4,
    protein100: 11,
    fat100: 0.2,
    kcal100: 60,
    favorite: true,
  },
  {
    id: "26",
    categoryId: "cat-zuivel",
    name: "Roomkaas",
    portion: "1 portie",
    portionGram: 15,
    kh100: 3,
    protein100: 6,
    fat100: 34,
    kcal100: 342,
    favorite: false,
  },
  {
    id: "27",
    categoryId: "cat-zuivel",
    name: "Haverdrink ongezoet",
    portion: "1 glas",
    portionGram: 200,
    kh100: 6,
    protein100: 1,
    fat100: 1.5,
    kcal100: 45,
    favorite: false,
  },
  {
    id: "28",
    categoryId: "cat-fruit",
    name: "Appel",
    portion: "1 stuk",
    portionGram: 150,
    kh100: 12,
    protein100: 0.3,
    fat100: 0.2,
    kcal100: 52,
    favorite: true,
  },
  {
    id: "29",
    categoryId: "cat-fruit",
    name: "Banaan",
    portion: "1 stuk",
    portionGram: 120,
    kh100: 23,
    protein100: 1.1,
    fat100: 0.3,
    kcal100: 96,
    favorite: false,
  },
  {
    id: "30",
    categoryId: "cat-fruit",
    name: "Aardbeien",
    portion: "1 portie",
    portionGram: 100,
    kh100: 8,
    protein100: 0.7,
    fat100: 0.3,
    kcal100: 32,
    favorite: false,
  },
  {
    id: "31",
    categoryId: "cat-fruit",
    name: "Blauwe bessen",
    portion: "1 portie",
    portionGram: 100,
    kh100: 14,
    protein100: 0.7,
    fat100: 0.3,
    kcal100: 57,
    favorite: false,
  },
  {
    id: "32",
    categoryId: "cat-fruit",
    name: "Sinaasappel",
    portion: "1 stuk",
    portionGram: 130,
    kh100: 12,
    protein100: 0.9,
    fat100: 0.1,
    kcal100: 47,
    favorite: true,
  },
  {
    id: "33",
    categoryId: "cat-fruit",
    name: "Druiven",
    portion: "1 portie",
    portionGram: 100,
    kh100: 17,
    protein100: 0.7,
    fat100: 0.2,
    kcal100: 69,
    favorite: false,
  },
  {
    id: "34",
    categoryId: "cat-fruit",
    name: "Mango",
    portion: "1 portie",
    portionGram: 100,
    kh100: 15,
    protein100: 0.8,
    fat100: 0.4,
    kcal100: 60,
    favorite: false,
  },
  {
    id: "35",
    categoryId: "cat-groente",
    name: "Tomaat",
    portion: "1 portie",
    portionGram: 100,
    kh100: 3,
    protein100: 0.9,
    fat100: 0.2,
    kcal100: 18,
    favorite: false,
  },
  {
    id: "36",
    categoryId: "cat-groente",
    name: "Komkommer",
    portion: "1 portie",
    portionGram: 100,
    kh100: 2,
    protein100: 0.7,
    fat100: 0.1,
    kcal100: 15,
    favorite: false,
  },
  {
    id: "37",
    categoryId: "cat-groente",
    name: "Paprika",
    portion: "1 portie",
    portionGram: 100,
    kh100: 6,
    protein100: 1,
    fat100: 0.3,
    kcal100: 31,
    favorite: false,
  },
  {
    id: "38",
    categoryId: "cat-groente",
    name: "Wortel",
    portion: "1 portie",
    portionGram: 100,
    kh100: 10,
    protein100: 0.9,
    fat100: 0.2,
    kcal100: 41,
    favorite: false,
  },
  {
    id: "39",
    categoryId: "cat-groente",
    name: "Spinazie",
    portion: "1 portie",
    portionGram: 100,
    kh100: 3,
    protein100: 2.9,
    fat100: 0.4,
    kcal100: 23,
    favorite: false,
  },
  {
    id: "40",
    categoryId: "cat-groente",
    name: "Broccoli",
    portion: "1 portie",
    portionGram: 200,
    kh100: 7,
    protein100: 2.8,
    fat100: 0.4,
    kcal100: 34,
    favorite: false,
  },
  {
    id: "41",
    categoryId: "cat-groente",
    name: "Courgette",
    portion: "1 portie",
    portionGram: 100,
    kh100: 3,
    protein100: 1.2,
    fat100: 0.3,
    kcal100: 17,
    favorite: false,
  },
  {
    id: "42",
    categoryId: "cat-snacks",
    name: "Snickers",
    portion: "1 stuk",
    portionGram: 50,
    kh100: 57,
    protein100: 7,
    fat100: 28,
    kcal100: 488,
    favorite: false,
  },
  {
    id: "43",
    categoryId: "cat-snacks",
    name: "Mars",
    portion: "1 stuk",
    portionGram: 51,
    kh100: 69,
    protein100: 4,
    fat100: 17,
    kcal100: 448,
    favorite: false,
  },
  {
    id: "44",
    categoryId: "cat-snacks",
    name: "Chips naturel",
    portion: "1 portie",
    portionGram: 30,
    kh100: 49,
    protein100: 6,
    fat100: 34,
    kcal100: 536,
    favorite: false,
  },
  {
    id: "45",
    categoryId: "cat-snacks",
    name: "Chocolade puur",
    portion: "1 portie",
    portionGram: 25,
    kh100: 46,
    protein100: 5,
    fat100: 43,
    kcal100: 600,
    favorite: false,
  },
  {
    id: "46",
    categoryId: "cat-snacks",
    name: "Chocolade melk",
    portion: "1 portie",
    portionGram: 25,
    kh100: 59,
    protein100: 7,
    fat100: 30,
    kcal100: 535,
    favorite: false,
  },
  {
    id: "47",
    categoryId: "cat-snacks",
    name: "Biscuitkoekje",
    portion: "1 stuk",
    portionGram: 10,
    kh100: 70,
    protein100: 6,
    fat100: 15,
    kcal100: 450,
    favorite: false,
  },
  {
    id: "48",
    categoryId: "cat-snacks",
    name: "Notenmix ongezouten",
    portion: "1 portie",
    portionGram: 25,
    kh100: 18,
    protein100: 20,
    fat100: 50,
    kcal100: 600,
    favorite: false,
  },
  {
    id: "49",
    categoryId: "cat-maaltijden",
    name: "Kipfilet gebakken",
    portion: "1 portie",
    portionGram: 150,
    kh100: 0,
    protein100: 31,
    fat100: 3.6,
    kcal100: 165,
    favorite: true,
  },
  {
    id: "50",
    categoryId: "cat-maaltijden",
    name: "Rundergehakt 15%",
    portion: "1 portie",
    portionGram: 150,
    kh100: 0,
    protein100: 26,
    fat100: 15,
    kcal100: 250,
    favorite: false,
  },
  {
    id: "51",
    categoryId: "cat-maaltijden",
    name: "Zalm",
    portion: "1 portie",
    portionGram: 150,
    kh100: 0,
    protein100: 20,
    fat100: 13,
    kcal100: 208,
    favorite: true,
  },
  {
    id: "52",
    categoryId: "cat-maaltijden",
    name: "Aardappelen gekookt",
    portion: "1 portie",
    portionGram: 200,
    kh100: 17,
    protein100: 2,
    fat100: 0.1,
    kcal100: 87,
    favorite: false,
  },
  {
    id: "53",
    categoryId: "cat-maaltijden",
    name: "Omelet",
    portion: "1 portie",
    portionGram: 120,
    kh100: 1,
    protein100: 11,
    fat100: 10,
    kcal100: 150,
    favorite: false,
  },
  {
    id: "54",
    categoryId: "cat-vetten",
    name: "Boter",
    portion: "1 portie",
    portionGram: 10,
    kh100: 0.1,
    protein100: 0.5,
    fat100: 81,
    kcal100: 717,
    favorite: false,
  },
  {
    id: "55",
    categoryId: "cat-vetten",
    name: "Margarine",
    portion: "1 portie",
    portionGram: 10,
    kh100: 0.5,
    protein100: 0.5,
    fat100: 80,
    kcal100: 720,
    favorite: false,
  },
  {
    id: "56",
    categoryId: "cat-vetten",
    name: "Olijfolie",
    portion: "1 eetlepel",
    portionGram: 10,
    kh100: 0,
    protein100: 0,
    fat100: 100,
    kcal100: 884,
    favorite: true,
  },
  {
    id: "57",
    categoryId: "cat-vetten",
    name: "Mayonaise",
    portion: "1 portie",
    portionGram: 15,
    kh100: 1,
    protein100: 1,
    fat100: 75,
    kcal100: 680,
    favorite: false,
  },
  {
    id: "58",
    categoryId: "cat-vetten",
    name: "Ketchup",
    portion: "1 portie",
    portionGram: 15,
    kh100: 25,
    protein100: 1,
    fat100: 0.1,
    kcal100: 112,
    favorite: false,
  },
  {
    id: "59",
    categoryId: "cat-vetten",
    name: "Pindasaus",
    portion: "1 portie",
    portionGram: 25,
    kh100: 12,
    protein100: 8,
    fat100: 20,
    kcal100: 260,
    favorite: false,
  },
  {
    id: "60",
    categoryId: "cat-dranken",
    name: "Water",
    portion: "1 glas",
    portionGram: 250,
    kh100: 0,
    protein100: 0,
    fat100: 0,
    kcal100: 0,
    favorite: true,
  },
  {
    id: "61",
    categoryId: "cat-dranken",
    name: "Koffie zwart",
    portion: "1 kop",
    portionGram: 200,
    kh100: 0,
    protein100: 0.1,
    fat100: 0,
    kcal100: 1,
    favorite: true,
  },
  {
    id: "62",
    categoryId: "cat-dranken",
    name: "Thee",
    portion: "1 kop",
    portionGram: 200,
    kh100: 0,
    protein100: 0,
    fat100: 0,
    kcal100: 1,
    favorite: true,
  },
  {
    id: "63",
    categoryId: "cat-dranken",
    name: "Cola",
    portion: "1 glas",
    portionGram: 250,
    kh100: 11,
    protein100: 0,
    fat100: 0,
    kcal100: 42,
    favorite: false,
  },
  {
    id: "64",
    categoryId: "cat-dranken",
    name: "Sinaasappelsap",
    portion: "1 glas",
    portionGram: 200,
    kh100: 10,
    protein100: 0.7,
    fat100: 0.2,
    kcal100: 45,
    favorite: false,
  },
  {
    id: "65",
    categoryId: "cat-dranken",
    name: "Energiedrank",
    portion: "1 blikje",
    portionGram: 250,
    kh100: 11,
    protein100: 0,
    fat100: 0,
    kcal100: 45,
    favorite: false,
  },
  {
    id: "66",
    categoryId: "cat-sport",
    name: "Whey eiwitpoeder",
    portion: "1 scoop",
    portionGram: 30,
    kh100: 8,
    protein100: 75,
    fat100: 6,
    kcal100: 400,
    favorite: true,
  },
  {
    id: "67",
    categoryId: "cat-sport",
    name: "Creatine monohydraat",
    portion: "1 portie",
    portionGram: 5,
    kh100: 0,
    protein100: 0,
    fat100: 0,
    kcal100: 0,
    favorite: false,
  },
  {
    id: "68",
    categoryId: "cat-sport",
    name: "Pre-workout",
    portion: "1 portie",
    portionGram: 10,
    kh100: 10,
    protein100: 0,
    fat100: 0,
    kcal100: 40,
    favorite: false,
  },
  {
    id: "69",
    categoryId: "cat-sport",
    name: "Eiwitreep",
    portion: "1 reep",
    portionGram: 60,
    kh100: 25,
    protein100: 35,
    fat100: 10,
    kcal100: 350,
    favorite: false,
  },
].map((p) => ({
  giClass: giStarterData[p.name]?.giClass || "unknown",
  giValue: giStarterData[p.name]?.giValue ?? "",
  timingTag: giStarterData[p.name]?.timingTag || "meal",
  giNotes: giStarterData[p.name]?.giNotes || "",
  personalTimingTag: giStarterData[p.name]?.timingTag || "meal",
  personalTimingNotes: "",
  absorptionProfile: "steady",
  ...p,
}));

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function convertPer100ToPerPortion(valuePer100, portionGram) {
  const value = Number(valuePer100) || 0;
  const grams = Number(portionGram) || 0;
  if (grams <= 0) return 0;
  return round2((value * grams) / 100);
}

function convertPerPortionToPer100(valuePerPortion, portionGram) {
  const value = Number(valuePerPortion) || 0;
  const grams = Number(portionGram) || 0;
  if (grams <= 0) return 0;
  return round2((value / grams) * 100);
}

function toNumber(value) {
  return Number(String(value).replace(",", ".")) || 0;
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function makeRow() {
  return {
    id: Date.now() + Math.random(),
    productId: "",
    mode: "portion",
    amount: "",
  };
}

function normalizeProduct(p) {
  return {
    giClass: p.giClass || "unknown",
    giValue: p.giValue ?? "",
    timingTag: p.timingTag || "meal",
    giNotes: p.giNotes || "",
    personalTimingTag: p.personalTimingTag || p.timingTag || "meal",
    personalTimingNotes: p.personalTimingNotes || "",
    absorptionProfile: p.absorptionProfile || "steady",
    ...p,
    packId: p.packId ?? null,
    packName: p.packName ?? null,
    sourceType: p.sourceType ?? "manual",
  };
}

function normalizeMealRows(rows) {
  return rows.map((r) => ({
    id: r.id || Date.now() + Math.random(),
    productId: r.productId || "",
    mode: r.mode || "portion",
    amount: r.amount ?? "",
  }));
}

function buildCategoriesAndProductsFromLegacy(legacyProducts) {
  const nameToStarter = Object.fromEntries(
    starterCategories.map((c) => [c.name, c])
  );
  const categories = [...starterCategories];
  const addedNames = new Set(starterCategories.map((c) => c.name));

  const products = legacyProducts.map((p, index) => {
    const legacyCategoryName = p.category || "Overig";
    let category =
      nameToStarter[legacyCategoryName] ||
      categories.find((c) => c.name === legacyCategoryName);

    if (!category) {
      category = {
        id: `cat-custom-${slugify(legacyCategoryName) || index}`,
        name: legacyCategoryName,
        color:
          CATEGORY_FALLBACK_COLORS[
            categories.length % CATEGORY_FALLBACK_COLORS.length
          ],
      };
      if (!addedNames.has(category.name)) {
        categories.push(category);
        addedNames.add(category.name);
      }
    }

    return normalizeProduct({
      id: p.id,
      categoryId: category.id,
      name: p.name,
      portion: p.portion,
      portionGram: p.portionGram,
      kh100: p.kh100,
      protein100: p.protein100,
      fat100: p.fat100,
      kcal100: p.kcal100,
      favorite: !!p.favorite,
    });
  });

  return { categories, products };
}

function applyGiToProducts(products) {
  return products.map((p) => {
    const gi = giStarterData[p.name];
    if (!gi) return normalizeProduct(p);
    return normalizeProduct({
      ...p,
      giClass: gi.giClass,
      giValue: gi.giValue,
      timingTag: gi.timingTag,
      giNotes: gi.giNotes,
      personalTimingTag: p.personalTimingTag || gi.timingTag,
    });
  });
}

function initCategoriesAndProducts() {
  const savedCategories = localStorage.getItem("dc_categories_v14");
  const savedProducts = localStorage.getItem("dc_products_v14");

  if (savedCategories && savedProducts) {
    try {
      return {
        categories: JSON.parse(savedCategories),
        products: applyGiToProducts(
          JSON.parse(savedProducts).map(normalizeProduct)
        ),
      };
    } catch {}
  }

  const prevVersions = [
    ["dc_categories_v13", "dc_products_v13"],
    ["dc_categories_v12", "dc_products_v12"],
    ["dc_categories_v11", "dc_products_v11"],
    ["dc_categories_v10", "dc_products_v10"],
    ["dc_categories_v9", "dc_products_v9"],
  ];

  for (const [catKey, prodKey] of prevVersions) {
    const c = localStorage.getItem(catKey);
    const p = localStorage.getItem(prodKey);
    if (c && p) {
      try {
        return {
          categories: JSON.parse(c),
          products: applyGiToProducts(JSON.parse(p).map(normalizeProduct)),
        };
      } catch {}
    }
  }

  const legacyProductsRaw = localStorage.getItem("dc_products_v4");
  if (legacyProductsRaw) {
    try {
      const legacyProducts = JSON.parse(legacyProductsRaw);
      return buildCategoriesAndProductsFromLegacy(legacyProducts);
    } catch {}
  }

  return {
    categories: starterCategories,
    products: applyGiToProducts(starterProducts),
  };
}

const cardStyle = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const compactCardStyle = {
  ...cardStyle,
  padding: 14,
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  color: "#475569",
  marginBottom: 6,
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "white",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
};

const primaryButtonStyle = {
  ...buttonStyle,
  background: "#0f172a",
  color: "white",
  border: "1px solid #0f172a",
};

function SortableHeader({
  label,
  sortKey,
  sortConfig,
  onSort,
  textAlign = "left",
}) {
  const isActive = sortConfig.key === sortKey;
  const arrow = isActive ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : "";

  return (
    <button
      onClick={() => onSort(sortKey)}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        margin: 0,
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 700,
        color: isActive ? "#0f172a" : "#475569",
        textTransform: "uppercase",
        letterSpacing: 0.3,
        textAlign,
      }}
      title={`Sorteer op ${label}`}
    >
      {label}
      {arrow}
    </button>
  );
}

function ResultCard({ totals }) {
  return (
    <div
      style={{
        border: "1px solid #94a3b8",
        borderRadius: 14,
        padding: 14,
        background: "#f1f5f9",
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 16,
          marginBottom: 10,
          color: "#0f172a",
        }}
      >
        Maaltijd resultaat
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: 10,
            padding: 10,
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "grid", gap: 4, fontSize: 14 }}>
            <div>
              <strong>KH:</strong> {totals.kh} g
            </div>
            <div>
              <strong>Eiwit:</strong> {totals.protein} g
            </div>
            <div>
              <strong>Vet:</strong> {totals.fat} g
            </div>
            <div>
              <strong>Kcal:</strong> {totals.kcal}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: 10,
            padding: 10,
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "grid", gap: 4, fontSize: 14 }}>
            <div>
              <strong>Insuline:</strong> {totals.insulin} E
            </div>
            <div>
              <strong>Timing:</strong> {totals.personalTimingAdvice}
            </div>
            <div>
              <strong>GI:</strong> {totals.mealGiLabel}
            </div>
            <div>
              <strong>Creon:</strong> {totals.best.c25} x 25k +{" "}
              {totals.best.c10} x 10k
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardTab({
  selectedDate,
  dayMealName,
  setDayMealName,
  addCurrentMealToSelectedDay,
  addCurrentMealToSelectedDayAndClear,
  categories,
  products,
  savedMeals,
  showSavedMeals,
  setShowSavedMeals,
  mealName,
  setMealName,
  saveCurrentMeal,
  loadSavedMeal,
  deleteSavedMeal,
  favoriteProducts,
  showFavorites,
  setShowFavorites,
  quickAddProduct,
  categoryFilter,
  setCategoryFilter,
  categoryFilterOptions,
  rowsWithCalc,
  filteredProducts,
  updateRow,
  removeRow,
  addRow,
  clearMeal,
  newRowRef,
  settings,
  setSettings,
  totals,
  quickSearch,
  setQuickSearch,
  quickSearchResults,
  testLog,
  testLogForm,
  setTestLogForm,
  addTestLogEntry,
  deleteTestLogEntry,
}) {
  return (
    <>
      <div
        style={{
          display: "grid",
          gap: 16,
          marginBottom: 16,
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#f8fafc",
          paddingBottom: 8,
        }}
      >
        <ResultCard totals={totals} />

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>Maaltijd</h2>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <button onClick={addRow} style={buttonStyle}>
              Rij toevoegen
            </button>
            <button
              onClick={clearMeal}
              style={{
                ...buttonStyle,
                background: "#dbeafe",
                color: "#1d4ed8",
                border: "1px solid #93c5fd",
                fontWeight: 700,
              }}
            >
              Nieuwe maaltijd
            </button>
          </div>
        </div>
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <button
            onClick={() => setShowSavedMeals((v) => !v)}
            style={{
              ...buttonStyle,
              width: "100%",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: getCategoryColor(categories, "cat-maaltijden"),
              border: "1px solid #d8b4fe",
              color: "#4c1d95",
              fontWeight: 700,
            }}
          >
            <span>Standaardmaaltijden ({savedMeals.length})</span>
            <span>{showSavedMeals ? "▲" : "▼"}</span>
          </button>

          {showSavedMeals && (
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr auto",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <input
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  style={inputStyle}
                  placeholder="Naam van maaltijd, bv. Ontbijt standaard"
                />
                <button
                  onClick={saveCurrentMeal}
                  style={{
                    ...buttonStyle,
                    background: "#dcfce7",
                    color: "#166534",
                    border: "1px solid #86efac",
                    fontWeight: 700,
                  }}
                >
                  Opslaan huidige maaltijd
                </button>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {savedMeals.length === 0 && (
                  <div style={{ color: "#64748b", fontSize: 14 }}>
                    Nog geen standaardmaaltijden opgeslagen.
                  </div>
                )}

                {savedMeals.map((meal, index) => (
                  <SavedMealCard
                    key={meal.id}
                    meal={meal}
                    index={index}
                    products={products}
                    onLoad={loadSavedMeal}
                    onDelete={deleteSavedMeal}
                    buttonStyle={buttonStyle}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <button
            onClick={() => setShowFavorites((v) => !v)}
            style={{
              ...buttonStyle,
              width: "100%",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#9a3412",
              fontWeight: 700,
            }}
          >
            <span>Favorieten ({favoriteProducts.length})</span>
            <span>{showFavorites ? "▲" : "▼"}</span>
          </button>

          {showFavorites && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 12,
              }}
            >
              {favoriteProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => quickAddProduct(p.id)}
                  style={{
                    ...buttonStyle,
                    background: getCategoryColor(categories, p.categoryId),
                    border: "1px solid rgba(148,163,184,0.35)",
                    color: "#0f172a",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    padding: "10px 12px",
                    fontWeight: 700,
                  }}
                  title={`${getCategoryName(categories, p.categoryId)} | ${
                    p.name
                  }`}
                >
                  ★ {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <h2 style={{ marginTop: 0 }}>Snel product toevoegen</h2>
          <input
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            placeholder="Typ om te zoeken (bv. ei, brood, kip...)"
            style={inputStyle}
          />

          {quickSearch && (
            <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
              {quickSearchResults.length === 0 && (
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Geen resultaten
                </div>
              )}
              {quickSearchResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    quickAddProduct(p.id);
                    setQuickSearch("");
                  }}
                  style={{
                    ...buttonStyle,
                    textAlign: "left",
                    background: getCategoryColor(categories, p.categoryId),
                  }}
                >
                  {getCategoryName(categories, p.categoryId)} | {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>Categorie filter</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {categoryFilterOptions.map((c) => {
              const isActive = c.id === categoryFilter;
              const bg = c.id === "all" ? "#f8fafc" : c.color;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id)}
                  style={{
                    ...buttonStyle,
                    background: isActive ? "#0f172a" : bg,
                    color: isActive ? "white" : "#0f172a",
                    border: isActive
                      ? "1px solid #0f172a"
                      : "1px solid #dbe3ee",
                  }}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            padding: 12,
            border: "1px solid #cbd5e1",
            borderRadius: 14,
            background: "#f8fafc",
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 13, color: "#475569", fontWeight: 700 }}>
            Toevoegen aan daglog ({selectedDate})
          </div>

          <input
            value={dayMealName}
            onChange={(e) => setDayMealName(e.target.value)}
            style={inputStyle}
            placeholder="Naam voor daglog, bv. Ontbijt / Lunch / Avondeten"
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={addCurrentMealToSelectedDay}
              style={{
                ...buttonStyle,
                background: "#dcfce7",
                color: "#166534",
                border: "1px solid #86efac",
                fontWeight: 700,
              }}
            >
              Voeg toe aan dag
            </button>

            <button
              onClick={addCurrentMealToSelectedDayAndClear}
              style={{
                ...buttonStyle,
                background: "#eff6ff",
                color: "#1d4ed8",
                border: "1px solid #bfdbfe",
                fontWeight: 700,
              }}
            >
              Voeg toe en start nieuwe maaltijd
            </button>
          </div>
        </div>

        {rowsWithCalc.map((r, idx) => (
          <MealRowCard
            key={r.id}
            index={idx}
            row={r}
            products={filteredProducts}
            categories={categories}
            onChange={updateRow}
            onRemove={removeRow}
            newRowRef={newRowRef}
            isLastRow={idx === rowsWithCalc.length - 1}
            labelStyle={labelStyle}
            inputStyle={inputStyle}
            buttonStyle={buttonStyle}
            getCategoryColor={getCategoryColor}
          />
        ))}

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            alignItems: "start",
          }}
        >
          <div style={compactCardStyle}>
            <h2 style={{ marginTop: 0 }}>Resultaat</h2>

            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #fde68a",
                borderRadius: 16,
                padding: 14,
                marginBottom: 12,
              }}
            >
              <div style={{ color: "#475569" }}>GI profiel maaltijd</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {totals.giClass} (score {totals.weightedGi})
              </div>
              <div style={{ marginTop: 6, fontSize: 13 }}>
                Basisadvies: <strong>{totals.timingAdvice}</strong>
              </div>
              <div style={{ marginTop: 4, fontSize: 13 }}>
                Persoonlijk advies:{" "}
                <strong>{totals.personalTimingAdvice}</strong>
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
                Persoonlijk gewogen timing:{" "}
                <strong>{totals.personalWeightedMinutes}</strong> min
              </div>
              <div
                style={{
                  marginTop: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: 999,
                  background: totals.timingDiffers ? "#fee2e2" : "#dcfce7",
                  border: totals.timingDiffers
                    ? "1px solid #fecaca"
                    : "1px solid #86efac",
                  color: totals.timingDiffers ? "#991b1b" : "#166534",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {totals.timingDiffers
                  ? "Persoonlijk advies wijkt af van algemeen advies"
                  : "Persoonlijk advies gelijk aan algemeen advies"}
              </div>
            </div>

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 16,
                padding: 14,
                marginBottom: 12,
              }}
            >
              <div style={{ color: "#475569" }}>Benodigde insuline</div>
              <div style={{ fontSize: 30, fontWeight: 700 }}>
                {totals.insulin} E
              </div>
            </div>

            <div
              style={{
                background: "#fefce8",
                border: "1px solid #fde68a",
                borderRadius: 16,
                padding: 14,
                marginBottom: 12,
              }}
            >
              <div style={{ color: "#475569" }}>Timing-indicatie</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {totals.personalTimingAdvice}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
                Algemeen advies: <strong>{totals.timingAdvice}</strong>
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: totals.timingDiffers ? "#b91c1c" : "#166534",
                  fontWeight: 700,
                }}
              >
                {totals.timingDiffers
                  ? "Afwijking gedetecteerd op basis van persoonlijk profiel"
                  : "Geen afwijking ten opzichte van algemeen advies"}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
                GI-profiel maaltijd: <strong>{totals.mealGiLabel}</strong>
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
                Gewogen GI-score: <strong>{totals.weightedGiDisplay}</strong>
              </div>
              {totals.mealHasDelayedCarbs && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "8px 10px",
                    borderRadius: 12,
                    background: "#e0e7ff",
                    border: "1px solid #c7d2fe",
                    color: "#3730a3",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  PPP / vertraagde afgifte mogelijk. Let op een latere stijging.
                  {totals.delayedItemsText
                    ? ` Betrokken product(en): ${totals.delayedItemsText}`
                    : ""}
                </div>
              )}
              <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
                Let op: dit is een hulpmiddel, geen automatisch medisch
                doseeradvies.
              </div>
            </div>

            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 16,
                padding: 14,
              }}
            >
              <div style={{ color: "#475569" }}>Geadviseerd Creon</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {totals.best.c25} x 25k + {totals.best.c10} x 10k
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
                Modus: <strong>{totals.creonModeLabel}</strong>
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
                Basisadvies op vet: <strong>{totals.baseFatDrivenText}</strong>
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
                Effectieve Creon-belasting: {totals.effectiveFat} g
              </div>

              <div
                style={{
                  marginTop: 12,
                  background: "rgba(255,255,255,0.6)",
                  borderRadius: 12,
                  padding: 10,
                  fontSize: 12,
                  color: "#334155",
                  display: "grid",
                  gap: 6,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 2 }}>
                  Opbouw Creon-belasting
                </div>
                <div>
                  Vet (basis): <strong>{totals.fatContribution}</strong>
                </div>
                <div>
                  KH-bijdrage: <strong>{totals.khCreonContribution}</strong>
                </div>
                <div>
                  Eiwit-bijdrage:{" "}
                  <strong>{totals.proteinCreonContribution}</strong>
                </div>
                <div>
                  Minimale KH-trigger: <strong>{totals.minKhTrigger}</strong>
                  <span style={{ color: "#64748b" }}>
                    {" "}
                    (drempel: {totals.minKhTriggerThreshold} g KH)
                  </span>
                </div>
                <div>
                  Minimale eiwit-trigger:{" "}
                  <strong>{totals.minProteinTrigger}</strong>
                  <span style={{ color: "#64748b" }}>
                    {" "}
                    (drempel: {totals.minProteinTriggerThreshold} g eiwit)
                  </span>
                </div>
                <div>
                  Minimale enzym-trigger actief:{" "}
                  <strong>{totals.minimalEnzymeLoad}</strong>
                  <span style={{ color: "#64748b" }}>
                    {" "}
                    (waarde: {totals.minEnzymeLoadValue}) (
                    {totals.minimalEnzymeReason})
                  </span>
                </div>
                <div>
                  Eiwitcorrectie glucose:{" "}
                  <strong>{totals.proteinGlucoseContribution}</strong>
                  <span style={{ color: "#64748b" }}>
                    {" "}
                    (
                    {totals.includeProteinGlucoseInCreon
                      ? "meegeteld"
                      : "alleen info"}
                    )
                  </span>
                </div>
                <div style={{ borderTop: "1px solid #cbd5e1", paddingTop: 6 }}>
                  Totaal: <strong>{totals.effectiveFat}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Testlogboek</h2>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
            Leg per test vast wat je at, hoeveel insuline en Creon je nam, en
            hoe het uitpakte. Zo kun je je drempels en persoonlijke timing later
            beter finetunen.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.3fr 0.7fr 0.7fr 0.9fr 1.2fr auto",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <input
              value={testLogForm.mealLabel}
              onChange={(e) =>
                setTestLogForm({ ...testLogForm, mealLabel: e.target.value })
              }
              style={inputStyle}
              placeholder="Maaltijd / testnaam"
            />
            <input
              value={testLogForm.insulin}
              onChange={(e) =>
                setTestLogForm({ ...testLogForm, insulin: e.target.value })
              }
              style={inputStyle}
              placeholder="Insuline"
            />
            <input
              value={testLogForm.creon}
              onChange={(e) =>
                setTestLogForm({ ...testLogForm, creon: e.target.value })
              }
              style={inputStyle}
              placeholder="Creon"
            />
            <input
              value={testLogForm.outcome}
              onChange={(e) =>
                setTestLogForm({ ...testLogForm, outcome: e.target.value })
              }
              style={inputStyle}
              placeholder="Uitkomst"
            />
            <input
              value={testLogForm.notes}
              onChange={(e) =>
                setTestLogForm({ ...testLogForm, notes: e.target.value })
              }
              style={inputStyle}
              placeholder="Notitie"
            />
            <button onClick={addTestLogEntry} style={primaryButtonStyle}>
              Opslaan
            </button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {testLog.length === 0 && (
              <div style={{ color: "#64748b", fontSize: 14 }}>
                Nog geen tests opgeslagen.
              </div>
            )}
            {testLog.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.3fr 0.7fr 0.7fr 0.9fr 1.2fr auto",
                  gap: 8,
                  alignItems: "center",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 10,
                  background: "#f8fafc",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{entry.mealLabel}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {entry.loggedAt}
                  </div>
                </div>
                <div>
                  <strong>{entry.insulin || "-"}</strong>
                </div>
                <div>
                  <strong>{entry.creon || "-"}</strong>
                </div>
                <div>
                  <strong>{entry.outcome || "-"}</strong>
                </div>
                <div style={{ fontSize: 12 }}>{entry.notes || "-"}</div>
                <button
                  onClick={() => deleteTestLogEntry(entry.id)}
                  style={{
                    ...buttonStyle,
                    background: "#fee2e2",
                    border: "1px solid #fecaca",
                  }}
                >
                  Wis
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function VoedingslijstTab({
  categories,
  products,
  editingProductId,
  productSearch,
  setProductSearch,
  searchedProducts,
  newProduct,
  setNewProduct,
  addProduct,
  resetNewProductForm,
  toggleFavorite,
  deleteProduct,
  sortConfig,
  requestSort,
  categoryDraftName,
  setCategoryDraftName,
  addCategory,
  renameCategory,
  deleteCategory,
  productModalOpen,
  openNewProductModal,
  openEditProductModal,
  closeProductModal,
  activePackNames,
  activePackFilter,
  setActivePackFilter,
  packFilterOptions,
  packFilteredProducts,
  deleteCurrentPackList,
}) {
  const manageableCategories = categories.filter((c) => c.id !== "cat-overig");
  const [showCategoryManager, setShowCategoryManager] = useState(() => {
    try {
      return localStorage.getItem("dc_show_category_manager_v1") === "true";
    } catch {
      return false;
    }
  });
  const [hoveredProductId, setHoveredProductId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        "dc_show_category_manager_v1",
        String(showCategoryManager)
      );
    } catch {}
  }, [showCategoryManager]);

  const dividerStyle = {
    borderRight: "2px solid rgba(148,163,184,0.5)",
    paddingRight: 8,
  };

  const headerCellStyle = {
    ...dividerStyle,
    display: "flex",
    alignItems: "center",
    minHeight: 30,
    width: "100%",
    boxSizing: "border-box",
    paddingLeft: 6,
  };

  const bodyCellStyle = {
    ...dividerStyle,
    display: "flex",
    alignItems: "center",
    minHeight: 40,
    width: "100%",
    boxSizing: "border-box",
    paddingLeft: 6,
    lineHeight: 1.2,
  };

  const modalCategoryColor = getCategoryColor(
    categories,
    newProduct.categoryId || "cat-overig"
  );

  return (
    <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
      <div style={cardStyle}>
        <button
          onClick={() => setShowCategoryManager((v) => !v)}
          style={{
            ...buttonStyle,
            width: "100%",
            textAlign: "left",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8fafc",
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          <span>Categoriebeheer</span>
          <span>{showCategoryManager ? "▲" : "▼"}</span>
        </button>

        {showCategoryManager && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr auto",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <input
                value={categoryDraftName}
                onChange={(e) => setCategoryDraftName(e.target.value)}
                style={inputStyle}
                placeholder="Nieuwe categorienaam"
              />
              <button onClick={addCategory} style={primaryButtonStyle}>
                Categorie toevoegen
              </button>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {categories.map((c) => {
                const count = products.filter(
                  (p) => p.categoryId === c.id
                ).length;
                const isProtected = c.id === "cat-overig";
                return (
                  <div
                    key={c.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.6fr auto auto",
                      gap: 8,
                      alignItems: "center",
                      padding: 10,
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      background: c.color,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "#475569" }}>
                        {count} product(en)
                      </div>
                    </div>
                    {!isProtected ? (
                      <button
                        onClick={() => renameCategory(c.id)}
                        style={{
                          ...buttonStyle,
                          background: "rgba(255,255,255,0.7)",
                        }}
                      >
                        Wijzigen
                      </button>
                    ) : (
                      <div />
                    )}
                    {!isProtected ? (
                      <button
                        onClick={() => deleteCategory(c.id)}
                        style={{
                          ...buttonStyle,
                          background: "#fee2e2",
                          border: "1px solid #fecaca",
                        }}
                      >
                        Verwijder
                      </button>
                    ) : (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#475569",
                          textAlign: "right",
                        }}
                      >
                        reserve
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <h2 style={{ margin: 0 }}>Voedingslijst</h2>
          <div
            style={{
              marginBottom: 12,
              padding: 10,
              borderRadius: 12,
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              fontSize: 13,
              color: "#334155",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              Actieve lijsten
            </div>

            <div
              style={{
                marginBottom: 12,
                padding: 10,
                borderRadius: 12,
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                fontSize: 13,
                color: "#334155",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Toon lijst</div>

              <select
                value={activePackFilter}
                onChange={(e) => setActivePackFilter(e.target.value)}
                style={inputStyle}
              >
                {packFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {activePackNames.length === 0 ? (
              <div>Alleen basis / handmatige producten</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {activePackNames.map((name) => (
                  <span
                    key={name}
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "#e0e7ff",
                      border: "1px solid #c7d2fe",
                      color: "#3730a3",
                      fontWeight: 600,
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button onClick={openNewProductModal} style={primaryButtonStyle}>
            Nieuw product
          </button>
        </div>

        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
          Klik op een hele rij om het detailvenster te openen. Daar beheer je
          basisgegevens, voedingswaarden, GI, timing, opnameprofiel (PPP) en
          verwijderen op één plek.
        </div>

        <div style={{ marginBottom: 12 }}>
          <button
            onClick={deleteCurrentPackList}
            style={{
              ...buttonStyle,
              background: activePackFilter === "all" ? "#f8fafc" : "#fee2e2",
              border:
                activePackFilter === "all"
                  ? "1px solid #e5e7eb"
                  : "1px solid #fecaca",
              color: activePackFilter === "all" ? "#94a3b8" : "#991b1b",
              cursor: activePackFilter === "all" ? "not-allowed" : "pointer",
            }}
            disabled={activePackFilter === "all"}
          >
            Verwijder huidige lijst
          </button>
        </div>

        <div
          style={{
            ...cardStyle,
            padding: 12,
            marginBottom: 12,
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr auto",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              placeholder="Zoek product of categorie"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              style={inputStyle}
            />
            <button onClick={() => setProductSearch("")} style={buttonStyle}>
              Wis zoekveld
            </button>
          </div>
          {productSearch.trim() && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#475569" }}>
              {searchedProducts.length} resultaat / resultaten voor{" "}
              <strong>{productSearch}</strong>
            </div>
          )}
        </div>

        <div
          style={{
            maxHeight: "65vh",
            overflowY: "auto",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "white",
            padding: 6,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "54px 1.05fr 1.65fr 0.95fr 0.8fr 0.8fr 0.8fr 0.8fr 0.95fr 0.95fr 1.15fr 1.05fr",
              gap: 5,
              padding: "10px 6px",
              marginBottom: 8,
              fontSize: 11,
              fontWeight: 700,
              color: "#475569",
              borderBottom: "2px solid #94a3b8",
              background: "#f8fafc",
              position: "sticky",
              top: 0,
              zIndex: 5,
              alignItems: "center",
              justifyItems: "stretch",
              textAlign: "left",
            }}
          >
            <div style={headerCellStyle}>
              <SortableHeader
                label="Fav"
                sortKey="favorite"
                sortConfig={sortConfig}
                onSort={requestSort}
                textAlign="left"
              />
            </div>
            <div style={headerCellStyle}>
              <SortableHeader
                label="Categorie"
                sortKey="category"
                sortConfig={sortConfig}
                onSort={requestSort}
              />
            </div>
            <div style={headerCellStyle}>
              <SortableHeader
                label="Naam"
                sortKey="name"
                sortConfig={sortConfig}
                onSort={requestSort}
              />
            </div>
            <div style={headerCellStyle}>
              <SortableHeader
                label="Portie"
                sortKey="portion"
                sortConfig={sortConfig}
                onSort={requestSort}
                textAlign="left"
              />
            </div>
            <div style={headerCellStyle}>
              <SortableHeader
                label="Gram"
                sortKey="portionGram"
                sortConfig={sortConfig}
                onSort={requestSort}
                textAlign="left"
              />
            </div>
            <div style={headerCellStyle}>
              <SortableHeader
                label="KH"
                sortKey="kh100"
                sortConfig={sortConfig}
                onSort={requestSort}
                textAlign="left"
              />
            </div>
            <div style={headerCellStyle}>
              <SortableHeader
                label="Eiwit"
                sortKey="protein100"
                sortConfig={sortConfig}
                onSort={requestSort}
                textAlign="left"
              />
            </div>
            <div style={headerCellStyle}>
              <SortableHeader
                label="Vet"
                sortKey="fat100"
                sortConfig={sortConfig}
                onSort={requestSort}
                textAlign="left"
              />
            </div>
            <div style={headerCellStyle}>
              <SortableHeader
                label="Kcal"
                sortKey="kcal100"
                sortConfig={sortConfig}
                onSort={requestSort}
                textAlign="left"
              />
            </div>
            <div style={headerCellStyle}>
              <SortableHeader
                label="GI"
                sortKey="giClass"
                sortConfig={sortConfig}
                onSort={requestSort}
                textAlign="left"
              />
            </div>
            <div style={headerCellStyle}>
              <SortableHeader
                label="Timing"
                sortKey="timing"
                sortConfig={sortConfig}
                onSort={requestSort}
                textAlign="left"
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: 30,
                paddingLeft: 6,
              }}
            >
              <SortableHeader
                label="Opname"
                sortKey="absorptionProfile"
                sortConfig={sortConfig}
                onSort={requestSort}
                textAlign="left"
              />
            </div>
          </div>

          {packFilteredProducts.map((p) => {
            const rowBg =
              hoveredProductId === p.id
                ? "rgba(255,255,255,0.68)"
                : getCategoryColor(categories, p.categoryId);
            return (
              <div
                key={p.id}
                onMouseEnter={() => setHoveredProductId(p.id)}
                onMouseLeave={() => setHoveredProductId(null)}
                onClick={() => openEditProductModal(p)}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "54px 1.05fr 1.65fr 0.95fr 0.8fr 0.8fr 0.8fr 0.8fr 0.95fr 0.95fr 1.15fr 1.05fr",
                  gap: 5,
                  padding: 6,
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  marginBottom: 5,
                  fontSize: 12,
                  alignItems: "stretch",
                  justifyItems: "stretch",
                  background: rowBg,
                  transition: "background 120ms ease, box-shadow 120ms ease",
                  boxShadow:
                    hoveredProductId === p.id
                      ? "0 1px 4px rgba(0,0,0,0.08)"
                      : "none",
                  cursor: "pointer",
                }}
                title="Klik om productdetails te openen"
              >
                <div style={bodyCellStyle} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleFavorite(p.id)}
                    style={{
                      ...buttonStyle,
                      padding: "4px 8px",
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: 1,
                      background: "white",
                      border: "1px solid #cbd5e1",
                    }}
                    title={
                      p.favorite ? "Favoriet verwijderen" : "Favoriet maken"
                    }
                  >
                    {p.favorite ? "★" : "☆"}
                  </button>
                </div>
                <div style={bodyCellStyle}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.5)",
                      display: "inline-block",
                    }}
                  >
                    {getCategoryName(categories, p.categoryId)}
                  </div>
                </div>
                <div
                  style={{ ...bodyCellStyle, fontWeight: 700, fontSize: 13 }}
                >
                  {p.name}
                </div>
                <div style={bodyCellStyle}>{p.portion}</div>
                <div style={bodyCellStyle}>{p.portionGram} g</div>
                <div style={bodyCellStyle}>KH/100g {p.kh100}</div>
                <div style={bodyCellStyle}>E/100g {p.protein100}</div>
                <div style={bodyCellStyle}>V/100g {p.fat100}</div>
                <div style={bodyCellStyle}>Kcal/100g {p.kcal100}</div>
                <div
                  style={bodyCellStyle}
                  title={
                    p.giValue !== "" && p.giValue != null
                      ? `GI ${p.giValue}`
                      : "GI onbekend"
                  }
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 6px",
                      borderRadius: 999,
                      background: getGiClassMeta(p.giClass, giClassOptions)
                        .color,
                    }}
                  >
                    {getGiClassMeta(p.giClass, giClassOptions).label}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    minHeight: 40,
                    width: "100%",
                    boxSizing: "border-box",
                    paddingLeft: 6,
                    lineHeight: 1.2,
                    paddingTop: 8,
                    borderRight: "2px solid rgba(148,163,184,0.5)",
                    paddingRight: 8,
                  }}
                >
                  {getTimingLabel(
                    p.personalTimingTag || p.timingTag,
                    timingOptions
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    minHeight: 40,
                    width: "100%",
                    boxSizing: "border-box",
                    paddingLeft: 6,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 6px",
                      borderRadius: 999,
                      background: getAbsorptionMeta(
                        p.absorptionProfile,
                        absorptionProfileOptions
                      ).color,
                    }}
                  >
                    {
                      getAbsorptionMeta(
                        p.absorptionProfile,
                        absorptionProfileOptions
                      ).label
                    }
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {productModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "min(980px, 96vw)",
              maxHeight: "92vh",
              overflowY: "auto",
              background: modalCategoryColor,
              borderRadius: 18,
              border: "1px solid #e5e7eb",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              padding: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  {newProduct.name
                    ? `Product bewerken: ${newProduct.name}`
                    : "Nieuw product"}
                </h2>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                  Alle productgegevens overzichtelijk op één plek.
                </div>
              </div>
              <button onClick={closeProductModal} style={buttonStyle}>
                Sluiten
              </button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ ...cardStyle, padding: 14 }}>
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>Basis</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1fr 1fr 0.9fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <label style={labelStyle}>Naam</label>
                    <input
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Categorie</label>
                    <select
                      value={newProduct.categoryId}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          categoryId: e.target.value,
                        })
                      }
                      style={inputStyle}
                    >
                      {manageableCategories
                        .concat(
                          categories.find((c) => c.id === "cat-overig") || []
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Portie naam</label>
                    <input
                      value={newProduct.portion}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          portion: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Portie gram</label>
                    <input
                      value={newProduct.portionGram}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          portionGram: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              <div style={{ ...cardStyle, padding: 14 }}>
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>
                  Voedingswaarden
                </h3>

                <div
                  style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}
                >
                  Kies of je invoert per 100 g of per portie. Bij omschakelen
                  worden de waarden automatisch omgerekend.
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "0.9fr 1fr 1fr 1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <label style={labelStyle}>Invoer</label>
                    <select
                      value={newProduct.inputMode}
                      onChange={(e) => {
                        const nextMode = e.target.value;
                        const portionGram =
                          Number(
                            String(newProduct.portionGram).replace(",", ".")
                          ) || 0;

                        if (nextMode === newProduct.inputMode) return;

                        if (portionGram <= 0) {
                          setNewProduct({
                            ...newProduct,
                            inputMode: nextMode,
                          });
                          return;
                        }

                        const kh =
                          Number(
                            String(newProduct.khInput).replace(",", ".")
                          ) || 0;
                        const protein =
                          Number(
                            String(newProduct.proteinInput).replace(",", ".")
                          ) || 0;
                        const fat =
                          Number(
                            String(newProduct.fatInput).replace(",", ".")
                          ) || 0;
                        const kcal =
                          Number(
                            String(newProduct.kcalInput).replace(",", ".")
                          ) || 0;

                        if (nextMode === "perPortion") {
                          setNewProduct({
                            ...newProduct,
                            inputMode: nextMode,
                            khInput: String(
                              convertPer100ToPerPortion(kh, portionGram)
                            ),
                            proteinInput: String(
                              convertPer100ToPerPortion(protein, portionGram)
                            ),
                            fatInput: String(
                              convertPer100ToPerPortion(fat, portionGram)
                            ),
                            kcalInput: String(
                              convertPer100ToPerPortion(kcal, portionGram)
                            ),
                          });
                        } else {
                          setNewProduct({
                            ...newProduct,
                            inputMode: nextMode,
                            khInput: String(
                              convertPerPortionToPer100(kh, portionGram)
                            ),
                            proteinInput: String(
                              convertPerPortionToPer100(protein, portionGram)
                            ),
                            fatInput: String(
                              convertPerPortionToPer100(fat, portionGram)
                            ),
                            kcalInput: String(
                              convertPerPortionToPer100(kcal, portionGram)
                            ),
                          });
                        }
                      }}
                      style={inputStyle}
                    >
                      <option value="per100">Per 100 g</option>
                      <option value="perPortion">Per portie</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      {newProduct.inputMode === "per100"
                        ? "KH / 100 g"
                        : "KH / portie"}
                    </label>
                    <input
                      value={newProduct.khInput}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          khInput: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      {newProduct.inputMode === "per100"
                        ? "Eiwit / 100 g"
                        : "Eiwit / portie"}
                    </label>
                    <input
                      value={newProduct.proteinInput}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          proteinInput: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      {newProduct.inputMode === "per100"
                        ? "Vet / 100 g"
                        : "Vet / portie"}
                    </label>
                    <input
                      value={newProduct.fatInput}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          fatInput: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      {newProduct.inputMode === "per100"
                        ? "Kcal / 100 g"
                        : "Kcal / portie"}
                    </label>
                    <input
                      value={newProduct.kcalInput}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          kcalInput: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div style={{ ...cardStyle, padding: 14 }}>
                  <h3 style={{ marginTop: 0, marginBottom: 12 }}>GI</h3>
                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <label style={labelStyle}>GI-klasse</label>
                      <select
                        value={newProduct.giClass}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            giClass: e.target.value,
                          })
                        }
                        style={inputStyle}
                      >
                        {giClassOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>GI-waarde</label>
                      <input
                        value={newProduct.giValue}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            giValue: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>GI-notitie</label>
                      <input
                        value={newProduct.giNotes}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            giNotes: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ ...cardStyle, padding: 14 }}>
                  <h3 style={{ marginTop: 0, marginBottom: 12 }}>Timing</h3>
                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <label style={labelStyle}>Standaard timing</label>
                      <select
                        value={newProduct.timingTag}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            timingTag: e.target.value,
                          })
                        }
                        style={inputStyle}
                      >
                        {timingOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Persoonlijke timing</label>
                      <select
                        value={
                          newProduct.personalTimingTag || newProduct.timingTag
                        }
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            personalTimingTag: e.target.value,
                          })
                        }
                        style={inputStyle}
                      >
                        {timingOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Opnameprofiel</label>
                      <select
                        value={newProduct.absorptionProfile || "steady"}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            absorptionProfile: e.target.value,
                          })
                        }
                        style={inputStyle}
                      >
                        {absorptionProfileOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>
                        Persoonlijke timingnotitie
                      </label>
                      <input
                        value={newProduct.personalTimingNotes || ""}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            personalTimingNotes: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ ...cardStyle, padding: 14 }}>
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>Extra</h3>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 12,
                    background: "#f8fafc",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!newProduct.favorite}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        favorite: e.target.checked,
                      })
                    }
                  />
                  <span>
                    {newProduct.favorite ? "Favoriet" : "Geen favoriet"}
                  </span>
                </label>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                marginTop: 16,
              }}
            >
              <div>
                <button
                  onClick={() => {
                    if (
                      !window.confirm(
                        `Product "${
                          newProduct.name || "dit product"
                        }" verwijderen?`
                      )
                    )
                      return;
                    deleteProduct(editingProductId);
                    closeProductModal();
                    resetNewProductForm();
                  }}
                  disabled={!editingProductId}
                  style={{
                    ...buttonStyle,
                    background: editingProductId ? "#fee2e2" : "#f8fafc",
                    border: editingProductId
                      ? "1px solid #fecaca"
                      : "1px solid #e5e7eb",
                    color: editingProductId ? "#991b1b" : "#94a3b8",
                    cursor: editingProductId ? "pointer" : "not-allowed",
                  }}
                >
                  Verwijderen
                </button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    resetNewProductForm();
                    closeProductModal();
                  }}
                  style={buttonStyle}
                >
                  Annuleren
                </button>
                <button
                  onClick={() => {
                    addProduct();
                    closeProductModal();
                  }}
                  style={primaryButtonStyle}
                >
                  Opslaan product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsTab({ settings, setSettings, resetSettings }) {
  return (
    <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Instellingen</h2>

        <div style={compactCardStyle}>
          <h2 style={{ marginTop: 0 }}>Instellingen</h2>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Gram KH per 1E insuline</label>
            <input
              value={settings.gramsKhPerUnit}
              onChange={(e) =>
                setSettings({ ...settings, gramsKhPerUnit: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Creon 25k: gram vet per capsule</label>
            <input
              value={settings.fatPerCap25}
              onChange={(e) =>
                setSettings({ ...settings, fatPerCap25: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Creon 10k: gram vet per capsule</label>
            <input
              value={settings.fatPerCap10}
              onChange={(e) =>
                setSettings({ ...settings, fatPerCap10: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>
              Persoonlijke timingprofielen gebruiken
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: 12,
                background: "#f8fafc",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              <input
                type="checkbox"
                checked={settings.usePersonalTiming !== false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    usePersonalTiming: e.target.checked,
                  })
                }
              />
              <span>
                {settings.usePersonalTiming !== false
                  ? "Ja, persoonlijke timing gebruiken"
                  : "Nee, alleen algemene GI-regel gebruiken"}
              </span>
            </label>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Creon-modus</label>
            <select
              value={settings.creonMode}
              onChange={(e) =>
                setSettings({ ...settings, creonMode: e.target.value })
              }
              style={inputStyle}
            >
              <option value="standard">Standaard (alleen vet als basis)</option>
              <option value="extended">
                Persoonlijk uitgebreid (vet + KH + eiwit)
              </option>
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>
              Eiwitcorrectie glucose (extra g vet-equivalent per 1 g eiwit)
            </label>
            <input
              value={settings.proteinCorrection}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  proteinCorrection: e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Enzym-trigger preset</label>
            <select
              value={settings.enzymeTriggerPreset || "standaard"}
              onChange={(e) => {
                const preset =
                  enzymeTriggerPresets[e.target.value] ||
                  enzymeTriggerPresets.standaard;
                setSettings({
                  ...settings,
                  enzymeTriggerPreset: e.target.value,
                  minKhTriggerThreshold: preset.minKhTriggerThreshold,
                  minProteinTriggerThreshold: preset.minProteinTriggerThreshold,
                  minEnzymeLoadValue: preset.minEnzymeLoadValue,
                });
              }}
              style={inputStyle}
            >
              <option value="voorzichtig">Voorzichtig</option>
              <option value="standaard">Standaard</option>
              <option value="gevoelig">Gevoelig</option>
              <option value="handmatig">Handmatig</option>
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>KH → Creon factor</label>
            <input
              value={settings.khCreonFactor}
              onChange={(e) =>
                setSettings({ ...settings, khCreonFactor: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Eiwit → Creon factor</label>
            <input
              value={settings.proteinCreonFactor}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  proteinCreonFactor: e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>
              Min. KH-trigger voor enzymen (gram KH)
            </label>
            <input
              value={settings.minKhTriggerThreshold || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  enzymeTriggerPreset: "handmatig",
                  minKhTriggerThreshold: e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>
              Min. eiwit-trigger voor enzymen (gram eiwit)
            </label>
            <input
              value={settings.minProteinTriggerThreshold || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  enzymeTriggerPreset: "handmatig",
                  minProteinTriggerThreshold: e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>
              Minimale enzym-trigger waarde (vet-equivalent)
            </label>
            <input
              value={settings.minEnzymeLoadValue || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  enzymeTriggerPreset: "handmatig",
                  minEnzymeLoadValue: e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 12, fontSize: 12, color: "#64748b" }}>
            Preset bepaalt snel je drempels. Zodra je hieronder handmatig iets
            wijzigt, springt de preset naar <strong>Handmatig</strong>.
          </div>

          <div>
            <label style={{ ...labelStyle, marginBottom: 8 }}>
              Eiwitcorrectie glucose meetellen in Creon-opbouw
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: 12,
                background: "#f8fafc",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              <input
                type="checkbox"
                checked={!!settings.includeProteinGlucoseInCreon}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    includeProteinGlucoseInCreon: e.target.checked,
                  })
                }
              />
              <span>
                {settings.includeProteinGlucoseInCreon
                  ? "Ja, meetellen"
                  : "Nee, niet meetellen"}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function GiTimingTab({
  categories,
  giSearch,
  setGiSearch,
  giFilteredProducts,
  rowsWithCalc,
  totals,
  updateProductGi,
}) {
  return (
    <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>GI / Timing</h2>
        <p style={{ marginTop: 0, color: "#475569" }}>
          Dit tabblad is een praktische geheugensteun. De timing is een
          persoonlijke richtlijn, geen automatisch medisch doseeradvies.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1fr",
            gap: 12,
          }}
        >
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Maaltijd GI-profiel
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              {totals.mealGiLabel}
            </div>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Algemeen advies
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              {totals.timingAdvice}
            </div>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Persoonlijk advies
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              {totals.personalTimingAdvice}
            </div>
          </div>
        </div>

        <div
          style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 999,
              background: totals.timingDiffers ? "#fee2e2" : "#dcfce7",
              border: totals.timingDiffers
                ? "1px solid #fecaca"
                : "1px solid #86efac",
              color: totals.timingDiffers ? "#991b1b" : "#166534",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {totals.timingDiffers
              ? "Persoonlijk profiel wijkt af"
              : "Persoonlijk profiel sluit aan"}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", alignSelf: "center" }}>
            Persoonlijk gewogen timing:{" "}
            <strong>{totals.personalWeightedMinutes}</strong> min
          </div>
        </div>

        {rowsWithCalc.some((r) => r.product) && (
          <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 700 }}>
              Huidige maaltijd — GI per regel
            </div>
            {rowsWithCalc
              .filter((r) => r.product)
              .map((r) => {
                const productDiffers =
                  (r.product.personalTimingTag || r.product.timingTag) !==
                  (r.product.timingTag || "meal");
                return (
                  <div
                    key={r.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.4fr 0.75fr 1fr 1fr 0.9fr",
                      gap: 8,
                      padding: 10,
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      background: getCategoryColor(
                        categories,
                        r.product.categoryId
                      ),
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.product.name}</div>
                      <div style={{ fontSize: 12, color: "#475569" }}>
                        {round2(r.kh)} g KH in deze regel
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>GI</div>
                      <div style={{ fontWeight: 700 }}>
                        {
                          getGiClassMeta(r.product.giClass, giClassOptions)
                            .label
                        }
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Standaard
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {getTimingLabel(r.product.timingTag, timingOptions)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Persoonlijk
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {getTimingLabel(
                          r.product.personalTimingTag || r.product.timingTag,
                          timingOptions
                        )}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Afwijking
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: productDiffers ? "#b91c1c" : "#166534",
                        }}
                      >
                        {productDiffers ? "Ja" : "Nee"}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr auto",
            gap: 8,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <input
            value={giSearch}
            onChange={(e) => setGiSearch(e.target.value)}
            placeholder="Zoek product voor GI / timing"
            style={inputStyle}
          />
          <button onClick={() => setGiSearch("")} style={buttonStyle}>
            Wis zoekveld
          </button>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {giFilteredProducts.map((p) => {
            const differs =
              (p.personalTimingTag || p.timingTag) !== (p.timingTag || "meal");
            return (
              <div
                key={p.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 12,
                  background: getCategoryColor(categories, p.categoryId),
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 10,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#475569" }}>
                      {getCategoryName(categories, p.categoryId)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: differs ? "#fee2e2" : "#dcfce7",
                      border: differs
                        ? "1px solid #fecaca"
                        : "1px solid #86efac",
                      color: differs ? "#991b1b" : "#166534",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {differs
                      ? "Persoonlijk wijkt af"
                      : "Persoonlijk = standaard"}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 0.85fr 1fr 1fr",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <label style={labelStyle}>GI-klasse</label>
                    <select
                      value={p.giClass || "unknown"}
                      onChange={(e) =>
                        updateProductGi(p.id, { giClass: e.target.value })
                      }
                      style={inputStyle}
                    >
                      {giClassOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>GI-waarde</label>
                    <input
                      value={p.giValue ?? ""}
                      onChange={(e) =>
                        updateProductGi(p.id, { giValue: e.target.value })
                      }
                      style={inputStyle}
                      placeholder="bijv. 55"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Standaard timing</label>
                    <select
                      value={p.timingTag || "meal"}
                      onChange={(e) =>
                        updateProductGi(p.id, { timingTag: e.target.value })
                      }
                      style={inputStyle}
                    >
                      {timingOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Persoonlijk timingprofiel</label>
                    <select
                      value={p.personalTimingTag || p.timingTag || "meal"}
                      onChange={(e) =>
                        updateProductGi(p.id, {
                          personalTimingTag: e.target.value,
                        })
                      }
                      style={inputStyle}
                    >
                      {timingOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginTop: 10,
                  }}
                >
                  <div>
                    <label style={labelStyle}>GI-notitie</label>
                    <input
                      value={p.giNotes || ""}
                      onChange={(e) =>
                        updateProductGi(p.id, { giNotes: e.target.value })
                      }
                      style={inputStyle}
                      placeholder="bij mij piekt dit snel / met yoghurt rustiger / etc."
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Persoonlijke timingnotitie</label>
                    <input
                      value={p.personalTimingNotes || ""}
                      onChange={(e) =>
                        updateProductGi(p.id, {
                          personalTimingNotes: e.target.value,
                        })
                      }
                      style={inputStyle}
                      placeholder="bij mij werkt dit sneller of trager dan gemiddeld"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingProductId, setEditingProductId] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "category",
    direction: "asc",
  });

  const {
    categories,
    setCategories,
    addCategory: addCategoryToStore,
    updateCategory,
    deleteCategory: removeCategoryFromStore,
    getCategory,
  } = useCategories();

  const {
    products,
    setProducts,
    addProduct: addProductToStore,
    updateProduct,
    deleteProduct: removeProductFromStore,
    getProduct,
  } = useProducts();

  const { rows, setRows, setRowsSafe, resetRows } = useMealRows();

  const { settings, setSettings, updateSettings, resetSettings } =
    useSettings();

  const [testLog, setTestLog] = useState(() => {
    const saved = localStorage.getItem("dc_test_log_v1");
    return saved ? JSON.parse(saved) : [];
  });

  const [testLogForm, setTestLogForm] = useState({
    mealLabel: "",
    insulin: "",
    creon: "",
    outcome: "",
    notes: "",
  });

  const [mealName, setMealName] = useState("");
  const [dayMealName, setDayMealName] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const {
    selectedDay,
    dayTotals,
    sortedDates,
    addMealToDay,
    deleteMealFromDay,
    clearDailyLog,
  } = useDailyLog(selectedDate);

  const {
    savedMeals,
    setSavedMeals,
    addSavedMeal,
    deleteSavedMeal,
    getSavedMeal,
    overwriteSavedMeal,
  } = useSavedMeals();

  const [showSavedMeals, setShowSavedMeals] = useState(true);
  const [showFavorites, setShowFavorites] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [productSearch, setProductSearch] = useState("");
  const [categoryDraftName, setCategoryDraftName] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const [giSearch, setGiSearch] = useState("");
  const [activePackFilter, setActivePackFilter] = useState("all");

  const [newProduct, setNewProduct] = useState({
    name: "",
    categoryId: "cat-brood",
    portion: "1 portie",
    portionGram: "",
    inputMode: "per100",
    khInput: "",
    proteinInput: "",
    fatInput: "",
    kcalInput: "",
    giClass: "unknown",
    giValue: "",
    timingTag: "meal",
    giNotes: "",
    personalTimingTag: "meal",
    personalTimingNotes: "",
    absorptionProfile: "steady",
    favorite: false,
  });

  const [productModalOpen, setProductModalOpen] = useState(false);

  const newRowRef = useRef(null);
  const backupFileRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("dc_rows_v4", JSON.stringify(rows));
  }, [rows]);

  useEffect(() => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      app: "diabetes-creon-webapp",
      version: 2,
      categories,
      products,
      rows,
      settings,
      savedMeals,
      testLog,
    };
    localStorage.setItem("dc_emergency_backup_v1", JSON.stringify(snapshot));
  }, [categories, products, rows, settings, savedMeals, testLog]);

  const categoryFilterOptions = useMemo(
    () => [{ id: "all", name: "Alle", color: "#f8fafc" }, ...categories],
    [categories]
  );

  const sortedProducts = useMemo(() => {
    const items = [...products];
    items.sort((a, b) => {
      let compare = 0;
      if (sortConfig.key === "category") {
        compare = getCategoryName(categories, a.categoryId).localeCompare(
          getCategoryName(categories, b.categoryId),
          "nl"
        );
        if (compare === 0) compare = a.name.localeCompare(b.name, "nl");
      } else if (sortConfig.key === "name") {
        compare = a.name.localeCompare(b.name, "nl");
      } else if (sortConfig.key === "favorite") {
        compare = Number(!!a.favorite) - Number(!!b.favorite);
        if (compare === 0) compare = a.name.localeCompare(b.name, "nl");
      } else if (sortConfig.key === "portion") {
        compare = String(a.portion || "").localeCompare(
          String(b.portion || ""),
          "nl"
        );
        if (compare === 0) compare = a.name.localeCompare(b.name, "nl");
      } else if (sortConfig.key === "portionGram") {
        compare = Number(a.portionGram || 0) - Number(b.portionGram || 0);
        if (compare === 0) compare = a.name.localeCompare(b.name, "nl");
      } else if (sortConfig.key === "kh100") {
        compare = a.kh100 - b.kh100;
        if (compare === 0) compare = a.name.localeCompare(b.name, "nl");
      } else if (sortConfig.key === "protein100") {
        compare = a.protein100 - b.protein100;
        if (compare === 0) compare = a.name.localeCompare(b.name, "nl");
      } else if (sortConfig.key === "fat100") {
        compare = a.fat100 - b.fat100;
        if (compare === 0) compare = a.name.localeCompare(b.name, "nl");
      } else if (sortConfig.key === "kcal100") {
        compare = a.kcal100 - b.kcal100;
        if (compare === 0) compare = a.name.localeCompare(b.name, "nl");
      } else if (sortConfig.key === "giClass") {
        const rank = { unknown: 0, low: 1, medium: 2, high: 3 };
        compare = (rank[a.giClass] ?? 0) - (rank[b.giClass] ?? 0);
        if (compare === 0) compare = a.name.localeCompare(b.name, "nl");
      } else if (sortConfig.key === "timing") {
        compare = getTimingLabel(
          a.personalTimingTag || a.timingTag,
          timingOptions
        ).localeCompare(
          getTimingLabel(b.personalTimingTag || b.timingTag, timingOptions),
          "nl"
        );
        if (compare === 0) compare = a.name.localeCompare(b.name, "nl");
      } else if (sortConfig.key === "giValue") {
        const aVal =
          a.giValue === "" || a.giValue == null ? -1 : Number(a.giValue);
        const bVal =
          b.giValue === "" || b.giValue == null ? -1 : Number(b.giValue);
        compare = aVal - bVal;
        if (compare === 0) compare = a.name.localeCompare(b.name, "nl");
      } else if (sortConfig.key === "absorptionProfile") {
        const rank = { fast: 0, steady: 1, delayed: 2 };
        compare =
          (rank[a.absorptionProfile] ?? 1) - (rank[b.absorptionProfile] ?? 1);
        if (compare === 0) compare = a.name.localeCompare(b.name, "nl");
      }
      return sortConfig.direction === "asc" ? compare : -compare;
    });
    return items;
  }, [products, categories, sortConfig]);

  const filteredProducts = useMemo(
    () =>
      sortedProducts.filter(
        (p) => categoryFilter === "all" || p.categoryId === categoryFilter
      ),
    [sortedProducts, categoryFilter]
  );

  const searchedProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return sortedProducts;
    return sortedProducts.filter((p) => {
      const categoryName = getCategoryName(
        categories,
        p.categoryId
      ).toLowerCase();
      return p.name.toLowerCase().includes(q) || categoryName.includes(q);
    });
  }, [sortedProducts, productSearch, categories]);

  const activePackNames = useMemo(() => {
    const names = Array.from(
      new Set(
        products
          .map((p) => p.packName)
          .filter((name) => typeof name === "string" && name.trim() !== "")
      )
    ).sort((a, b) => a.localeCompare(b, "nl", { sensitivity: "base" }));

    return names;
  }, [products]);

  const packFilterOptions = useMemo(() => {
    return [
      { value: "all", label: "Alles" },
      { value: "__base__", label: "Basis / handmatig" },
      ...activePackNames.map((name) => ({
        value: name,
        label: name,
      })),
    ];
  }, [activePackNames]);

  const favoriteProducts = useMemo(() => {
    return [...products]
      .filter((p) => p.favorite)
      .sort((a, b) =>
        a.name.localeCompare(b.name, "nl", { sensitivity: "base" })
      );
  }, [products]);

  const packFilteredProducts = useMemo(() => {
    if (activePackFilter === "all") return products;

    if (activePackFilter === "__base__") {
      return products.filter(
        (p) => !p.packName || String(p.packName).trim() === ""
      );
    }

    return products.filter((p) => p.packName === activePackFilter);
  }, [products, activePackFilter]);

  const quickSearchResults = useMemo(() => {
    const q = quickSearch.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => {
        const categoryName = getCategoryName(
          categories,
          p.categoryId
        ).toLowerCase();
        return p.name.toLowerCase().includes(q) || categoryName.includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name, "nl"))
      .slice(0, 8);
  }, [quickSearch, products, categories]);

  const giFilteredProducts = useMemo(() => {
    const q = giSearch.trim().toLowerCase();
    const base = !q
      ? [...products].sort((a, b) => a.name.localeCompare(b.name, "nl"))
      : products
          .filter((p) => {
            const categoryName = getCategoryName(
              categories,
              p.categoryId
            ).toLowerCase();
            return p.name.toLowerCase().includes(q) || categoryName.includes(q);
          })
          .sort((a, b) => a.name.localeCompare(b.name, "nl"));
    return base.slice(0, 60);
  }, [giSearch, products, categories]);

  const rowsWithCalc = useMemo(() => {
    return rows.map((r) => {
      const p = products.find((x) => x.id === r.productId);
      const amount = Number(String(r.amount).replace(",", ".")) || 0;
      if (!p) return { ...r, grams: 0, kh: 0, protein: 0, fat: 0, kcal: 0 };
      const grams = r.mode === "portion" ? amount * p.portionGram : amount;
      return {
        ...r,
        product: p,
        grams: round2(grams),
        kh: round2((p.kh100 / 100) * grams),
        protein: round2((p.protein100 / 100) * grams),
        fat: round2((p.fat100 / 100) * grams),
        kcal: round2((p.kcal100 / 100) * grams),
      };
    });
  }, [rows, products]);

  const totals = useMemo(() => {
    const kh = round2(rowsWithCalc.reduce((a, r) => a + (r.kh || 0), 0));
    const protein = round2(
      rowsWithCalc.reduce((a, r) => a + (r.protein || 0), 0)
    );
    const fat = round2(rowsWithCalc.reduce((a, r) => a + (r.fat || 0), 0));
    const kcal = round2(rowsWithCalc.reduce((a, r) => a + (r.kcal || 0), 0));

    const gramsKhPerUnit = toNumber(settings.gramsKhPerUnit);
    const fatPerCap25 = toNumber(settings.fatPerCap25);
    const fatPerCap10 = toNumber(settings.fatPerCap10);
    const proteinCorrection = toNumber(settings.proteinCorrection);
    const khCreonFactor = toNumber(settings.khCreonFactor);
    const proteinCreonFactor = toNumber(settings.proteinCreonFactor);
    const includeProteinGlucoseInCreon =
      !!settings.includeProteinGlucoseInCreon;
    const creonMode = settings.creonMode || "standard";
    const usePersonalTiming = settings.usePersonalTiming !== false;
    const minKhTriggerThreshold = toNumber(settings.minKhTriggerThreshold);
    const minProteinTriggerThreshold = toNumber(
      settings.minProteinTriggerThreshold
    );
    const minEnzymeLoadValue = toNumber(settings.minEnzymeLoadValue);

    const insulin = gramsKhPerUnit > 0 ? round2(kh / gramsKhPerUnit) : 0;

    const fatContribution = round2(fat);
    const proteinGlucoseContribution = round2(protein * proteinCorrection);
    const khCreonContributionRaw = round2(kh * khCreonFactor);
    const proteinCreonContributionRaw = round2(protein * proteinCreonFactor);

    const khCreonContribution =
      creonMode === "extended" ? khCreonContributionRaw : 0;
    const proteinCreonContribution =
      creonMode === "extended" ? proteinCreonContributionRaw : 0;

    const minKhTrigger =
      minKhTriggerThreshold > 0 && kh > minKhTriggerThreshold
        ? minEnzymeLoadValue
        : 0;
    const minProteinTrigger =
      minProteinTriggerThreshold > 0 && protein > minProteinTriggerThreshold
        ? minEnzymeLoadValue
        : 0;
    const minimalEnzymeLoad =
      creonMode === "extended" ? Math.max(minKhTrigger, minProteinTrigger) : 0;

    const minimalEnzymeReason =
      creonMode !== "extended"
        ? "uit"
        : minKhTrigger > 0 && minProteinTrigger > 0
        ? "KH + eiwit trigger"
        : minKhTrigger > 0
        ? "KH trigger"
        : minProteinTrigger > 0
        ? "Eiwit trigger"
        : "geen";

    const effectiveFat = round2(
      Math.max(
        fatContribution +
          khCreonContribution +
          proteinCreonContribution +
          (includeProteinGlucoseInCreon ? proteinGlucoseContribution : 0),
        minimalEnzymeLoad
      )
    );

    const giWeightedRows = rowsWithCalc.filter((r) => r.product && r.kh > 0);
    const totalGiWeight = giWeightedRows.reduce((a, r) => a + (r.kh || 0), 0);
    const weightedGi =
      totalGiWeight > 0
        ? round2(
            giWeightedRows.reduce((a, r) => {
              const gi = Number(r.product.giValue);
              const fallback =
                r.product.giClass === "high"
                  ? 75
                  : r.product.giClass === "medium"
                  ? 60
                  : r.product.giClass === "low"
                  ? 35
                  : 50;
              const useGi = Number.isFinite(gi) && gi >= 0 ? gi : fallback;
              return a + useGi * r.kh;
            }, 0) / totalGiWeight
          )
        : 0;

    let giClass = "laag";
    if (weightedGi >= 70) giClass = "hoog";
    else if (weightedGi >= 55) giClass = "gemiddeld";

    let mealGiLabel = "Onbekend / gemengd";
    if (weightedGi > 0 && weightedGi < 45) mealGiLabel = "Laag / geleidelijk";
    else if (weightedGi >= 45 && weightedGi < 60)
      mealGiLabel = "Midden / normaal";
    else if (weightedGi >= 60) mealGiLabel = "Hoog / sneller";

    let timingAdvice = "Bij eerste hap";
    let timingMinutes = 0;
    if (giClass === "hoog") {
      timingAdvice = "10 min vóór eten";
      timingMinutes = 10;
    } else if (giClass === "gemiddeld") {
      timingAdvice = "5 min vóór eten";
      timingMinutes = 5;
    }

    if (fat > 20 && giClass !== "hoog") {
      timingAdvice = "Bij eerste hap (vet vertraagt opname)";
      timingMinutes = 0;
    }

    const personalTimingRows = rowsWithCalc.filter(
      (r) => r.product && r.kh > 0
    );
    const totalKhForTiming = personalTimingRows.reduce(
      (a, r) => a + (r.kh || 0),
      0
    );
    const personalWeightedMinutes =
      usePersonalTiming && totalKhForTiming > 0
        ? round2(
            personalTimingRows.reduce((a, r) => {
              const minutes = getTimingMinutes(
                r.product.personalTimingTag || r.product.timingTag,
                timingOptions
              );

              return a + minutes * (r.kh || 0);
            }, 0) / totalKhForTiming
          )
        : 0;

    let personalTimingAdvice = timingAdvice;
    let personalTimingMinutesFinal = timingMinutes;

    if (usePersonalTiming && totalKhForTiming > 0) {
      if (personalWeightedMinutes >= 17.5) {
        personalTimingAdvice = "20 min vóór eten (persoonlijk profiel)";
        personalTimingMinutesFinal = 20;
      } else if (personalWeightedMinutes >= 12.5) {
        personalTimingAdvice = "15 min vóór eten (persoonlijk profiel)";
        personalTimingMinutesFinal = 15;
      } else if (personalWeightedMinutes >= 7.5) {
        personalTimingAdvice = "10 min vóór eten (persoonlijk profiel)";
        personalTimingMinutesFinal = 10;
      } else if (personalWeightedMinutes >= 2.5) {
        personalTimingAdvice = "5 min vóór eten (persoonlijk profiel)";
        personalTimingMinutesFinal = 5;
      } else {
        personalTimingAdvice = "Bij eerste hap (persoonlijk profiel)";
        personalTimingMinutesFinal = 0;
      }

      if (fat > 20 && weightedGi < 70) {
        personalTimingAdvice =
          "Bij eerste hap (persoonlijk profiel + vetvertraging)";
        personalTimingMinutesFinal = 0;
      }
    }

    const timingDiffers =
      personalTimingAdvice !== timingAdvice ||
      personalTimingMinutesFinal !== timingMinutes;

    const delayedRows = rowsWithCalc.filter(
      (r) =>
        r.product &&
        (r.product.absorptionProfile || "steady") === "delayed" &&
        (r.kh || 0) > 0
    );
    const mealHasDelayedCarbs = delayedRows.length > 0;
    const delayedItemsText = delayedRows
      .map((r) => r.product?.name)
      .filter(Boolean)
      .join(", ");

    const baseFatDriven25 =
      fatPerCap25 > 0 ? Math.floor(fatContribution / fatPerCap25) : 0;
    const baseFatRemainder = fatContribution - baseFatDriven25 * fatPerCap25;
    const baseFatDriven10 =
      fatPerCap10 > 0
        ? Math.max(0, Math.ceil(baseFatRemainder / fatPerCap10))
        : 0;

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
                : 0
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
      kh,
      protein,
      fat,
      kcal,
      insulin,
      weightedGi,
      weightedGiDisplay: weightedGi > 0 ? weightedGi : "-",
      giClass,
      mealGiLabel,
      timingAdvice,
      timingMinutes,
      usePersonalTiming,
      personalWeightedMinutes,
      personalTimingAdvice,
      personalTimingMinutesFinal,
      timingDiffers,
      mealHasDelayedCarbs,
      delayedItemsText,
      effectiveFat,
      fatContribution,
      proteinGlucoseContribution,
      khCreonContribution,
      proteinCreonContribution,
      minKhTrigger,
      minProteinTrigger,
      minimalEnzymeLoad,
      minimalEnzymeReason,
      minKhTriggerThreshold,
      minProteinTriggerThreshold,
      minEnzymeLoadValue,
      includeProteinGlucoseInCreon,
      best,
      creonModeLabel:
        creonMode === "extended" ? "Persoonlijk uitgebreid" : "Standaard",
      baseFatDrivenText: `${baseFatDriven25} x 25k + ${baseFatDriven10} x 10k`,
    };
  }, [rowsWithCalc, settings]);

  function requestSort(key) {
    setSortConfig((prev) => {
      if (prev.key === key)
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      return { key, direction: "asc" };
    });
  }

  function ensureLastEmptyRow(inputRows) {
    const last = inputRows[inputRows.length - 1];
    if (!last || last.productId !== "" || last.amount !== "")
      return [...inputRows, makeRow()];
    return inputRows;
  }

  function resetNewProductForm() {
    setNewProduct({
      name: "",
      categoryId: categories[0]?.id || "cat-overig",
      portion: "1 portie",
      portionGram: "",
      inputMode: "per100",
      khInput: "",
      proteinInput: "",
      fatInput: "",
      kcalInput: "",
      giClass: "unknown",
      giValue: "",
      timingTag: "meal",
      giNotes: "",
      personalTimingTag: "meal",
      personalTimingNotes: "",
      absorptionProfile: "steady",
      favorite: false,
    });
    setEditingProductId(null);
  }

  function openNewProductModal() {
    resetNewProductForm();
    setProductModalOpen(true);
  }

  function openEditProductModal(product) {
    setEditingProductId(product.id);

    const portionGram = Number(product.portionGram) || 0;

    setNewProduct({
      name: product.name,
      categoryId: product.categoryId,
      portion: product.portion,
      portionGram: String(product.portionGram),
      inputMode: "per100",
      khInput: String(product.kh100),
      proteinInput: String(product.protein100),
      fatInput: String(product.fat100),
      kcalInput: String(product.kcal100),
      giClass: product.giClass || "unknown",
      giValue: String(product.giValue ?? ""),
      timingTag: product.timingTag || "meal",
      giNotes: product.giNotes || "",
      personalTimingTag:
        product.personalTimingTag || product.timingTag || "meal",
      personalTimingNotes: product.personalTimingNotes || "",
      absorptionProfile: product.absorptionProfile || "steady",
      favorite: !!product.favorite,
    });

    setProductModalOpen(true);
  }

  function closeProductModal() {
    setProductModalOpen(false);
  }

  function updateRow(id, patch) {
    setRows((prev) =>
      ensureLastEmptyRow(
        prev.map((r) => {
          if (r.id !== id) return r;
          const next = { ...r, ...patch };
          if (patch.productId && !next.amount) next.amount = "1";
          if (patch.productId === "") next.amount = "";
          return next;
        })
      )
    );
  }

  function updateProductGi(id, patch) {
    const product = getProduct(id);
    if (!product) return;

    updateProduct(id, normalizeProduct({ ...product, ...patch }));
  }

  function quickAddProduct(productId) {
    setRows((prev) => {
      const copy = [...prev];
      const filledCount = copy.filter((r) => r.productId).length;
      const targetIndex = filledCount;
      if (!copy[targetIndex]) copy.push(makeRow());
      copy[targetIndex] = {
        ...copy[targetIndex],
        productId,
        mode: "portion",
        amount: "1",
      };
      return ensureLastEmptyRow(copy);
    });
    setTimeout(
      () =>
        newRowRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        }),
      80
    );
  }

  function clearMeal() {
    setRows([makeRow(), makeRow(), makeRow()]);
    setTimeout(
      () =>
        newRowRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        }),
      80
    );
  }

  function getFilledMealRows() {
    return rowsWithCalc.filter(
      (r) => r.product && String(r.amount).trim() !== ""
    );
  }

  function buildMealSnapshot(customName) {
    const filledRows = getFilledMealRows();
    if (filledRows.length === 0) return null;

    return {
      id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name:
        customName?.trim() ||
        mealName?.trim() ||
        dayMealName?.trim() ||
        `Maaltijd ${new Date().toLocaleTimeString("nl-NL", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      createdAt: new Date().toLocaleString("nl-NL"),
      rows: filledRows.map((r) => ({
        id: r.id,
        productId: r.productId,
        mode: r.mode,
        amount: r.amount,
      })),
      totals: {
        kh: totals.kh,
        protein: totals.protein,
        fat: totals.fat,
        kcal: totals.kcal,
        insulin: totals.insulin,
        weightedGi: totals.weightedGi,
        giClass: totals.giClass,
        timingAdvice: totals.timingAdvice,
        personalTimingAdvice: totals.personalTimingAdvice,
        effectiveFat: totals.effectiveFat,
        creon25: totals.best.c25,
        creon10: totals.best.c10,
      },
    };
  }

  function addCurrentMealToSelectedDay() {
    const snapshot = buildMealSnapshot(dayMealName);
    if (!snapshot) {
      alert("Er is nog geen maaltijd ingevuld.");
      return;
    }

    addMealToDay({
      date: selectedDate,
      name: snapshot.name,
      rows: snapshot.rows,
      totals: snapshot.totals,
      createdAt: snapshot.createdAt,
    });

    setDayMealName("");
  }

  function addCurrentMealToSelectedDayAndClear() {
    const snapshot = buildMealSnapshot(dayMealName);
    if (!snapshot) {
      alert("Er is nog geen maaltijd ingevuld.");
      return;
    }

    addMealToDay({
      date: selectedDate,
      name: snapshot.name,
      rows: snapshot.rows,
      totals: snapshot.totals,
      createdAt: snapshot.createdAt,
    });

    setDayMealName("");
    clearMeal();
  }

  function saveCurrentMeal() {
    const cleanedRows = rows.filter((r) => r.productId && r.amount !== "");
    if (!mealName.trim() || cleanedRows.length === 0) return;

    addSavedMeal(mealName.trim(), cleanedRows);
    setMealName("");
  }

  function loadSavedMeal(mealId) {
    const meal = getSavedMeal(mealId);
    if (!meal) return;

    setRows(ensureLastEmptyRow(normalizeMealRows(meal.rows)));

    setTimeout(
      () =>
        newRowRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        }),
      80
    );
  }

  function addRow() {
    setRows((prev) => [...prev, makeRow()]);
  }

  function removeRow(id) {
    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      return filtered.length ? ensureLastEmptyRow(filtered) : [makeRow()];
    });
  }

  function addProduct() {
    if (!newProduct.name.trim()) return;

    const portionGram =
      Number(String(newProduct.portionGram).replace(",", ".")) || 0;

    if (newProduct.inputMode === "perPortion" && portionGram <= 0) {
      alert("Vul bij invoer per portie een geldig portiegewicht in.");
      return;
    }

    const khInput = Number(String(newProduct.khInput).replace(",", ".")) || 0;
    const proteinInput =
      Number(String(newProduct.proteinInput).replace(",", ".")) || 0;
    const fatInput = Number(String(newProduct.fatInput).replace(",", ".")) || 0;
    const kcalInput =
      Number(String(newProduct.kcalInput).replace(",", ".")) || 0;
    const giValue = String(newProduct.giValue).trim();

    const convertTo100 = (value) => {
      if (newProduct.inputMode === "per100") return value;
      return round2((value / portionGram) * 100);
    };

    const payload = normalizeProduct({
      categoryId: newProduct.categoryId || "cat-overig",
      name: newProduct.name.trim(),
      portion: newProduct.portion || "1 portie",
      portionGram,
      kh100: convertTo100(khInput),
      protein100: convertTo100(proteinInput),
      fat100: convertTo100(fatInput),
      kcal100: convertTo100(kcalInput),
      giClass: newProduct.giClass || "unknown",
      giValue,
      timingTag: newProduct.timingTag || "meal",
      giNotes: newProduct.giNotes || "",
      personalTimingTag:
        newProduct.personalTimingTag || newProduct.timingTag || "meal",
      personalTimingNotes: newProduct.personalTimingNotes || "",
      absorptionProfile: newProduct.absorptionProfile || "steady",
      favorite: !!newProduct.favorite,
      packId: null,
      packName: null,
      sourceType: "manual",
    });

    if (editingProductId) {
      updateProduct(editingProductId, payload);
    } else {
      const existing = products.find(
        (p) =>
          p.name.toLowerCase() === newProduct.name.trim().toLowerCase() &&
          p.categoryId === newProduct.categoryId
      );

      if (existing) {
        updateProduct(existing.id, payload);
      } else {
        addProductToStore({
          id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ...payload,
        });
      }
    }

    resetNewProductForm();
  }

  function toggleFavorite(id) {
    const product = getProduct(id);
    if (!product) return;

    updateProduct(id, { favorite: !product.favorite });
  }

  function deleteProduct(id) {
    removeProductFromStore(id);
    setRows((prev) =>
      prev.map((r) =>
        r.productId === id ? { ...r, productId: "", amount: "" } : r
      )
    );

    savedMeals.forEach((meal) => {
      const updatedRows = meal.rows.filter((r) => r.productId !== id);

      if (updatedRows.length === 0) {
        deleteSavedMeal(meal.id);
      } else if (updatedRows.length !== meal.rows.length) {
        overwriteSavedMeal({
          ...meal,
          rows: updatedRows,
        });
      }
    });

    if (editingProductId === id) resetNewProductForm();
  }

  function addCategory() {
    const name = categoryDraftName.trim();
    if (!name) return;
    const exists = categories.some(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      alert("Deze categorie bestaat al.");
      return;
    }
    const newCategory = {
      id: `cat-custom-${Date.now()}`,
      name,
      color:
        CATEGORY_FALLBACK_COLORS[
          categories.length % CATEGORY_FALLBACK_COLORS.length
        ],
    };
    addCategoryToStore(newCategory);
    setCategoryDraftName("");
  }

  function renameCategory(categoryId) {
    const category = getCategoryById(categories, categoryId);
    if (!category) return;
    const nextName = window.prompt(
      "Nieuwe naam voor categorie:",
      category.name
    );
    if (!nextName) return;
    const trimmed = nextName.trim();
    if (!trimmed || trimmed === category.name) return;
    const exists = categories.some(
      (c) =>
        c.id !== categoryId && c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      alert("Er bestaat al een categorie met die naam.");
      return;
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, name: trimmed } : c))
    );
  }

  function deleteCategory(categoryId) {
    if (categoryId === "cat-overig") return;
    const category = getCategoryById(categories, categoryId);
    if (!category) return;
    const confirmDelete =
      window.confirm(`Categorie "${category.name}" verwijderen?

Producten uit deze categorie gaan naar "Overig".`);
    if (!confirmDelete) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.categoryId === categoryId ? { ...p, categoryId: "cat-overig" } : p
      )
    );
    removeCategoryFromStore(categoryId);
    setNewProduct((prev) =>
      prev.categoryId === categoryId
        ? { ...prev, categoryId: "cat-overig" }
        : prev
    );
    if (categoryFilter === categoryId) setCategoryFilter("all");
  }
  function deleteCurrentPackList() {
    if (activePackFilter === "all") {
      alert("Kies eerst een specifieke lijst om te verwijderen.");
      return;
    }

    if (activePackFilter === "__base__") {
      const ok = window.confirm(
        "Alle basis / handmatige producten verwijderen? Geïmporteerde lijsten blijven bestaan."
      );
      if (!ok) return;

      setProducts((prev) =>
        prev.filter((p) => p.packName && String(p.packName).trim() !== "")
      );

      return;
    }

    const ok = window.confirm(
      `Lijst "${activePackFilter}" verwijderen? Alle producten uit deze lijst worden verwijderd.`
    );
    if (!ok) return;

    setProducts((prev) => prev.filter((p) => p.packName !== activePackFilter));
    setActivePackFilter("all");
  }
  function addTestLogEntry() {
    if (!testLogForm.mealLabel.trim()) return;
    const stamp = new Date().toLocaleString("nl-NL");
    const payload = {
      id: String(Date.now()) + Math.random(),
      loggedAt: stamp,
      mealLabel: testLogForm.mealLabel.trim(),
      insulin: testLogForm.insulin.trim(),
      creon: testLogForm.creon.trim(),
      outcome: testLogForm.outcome.trim(),
      notes: testLogForm.notes.trim(),
    };
    setTestLog((prev) => [payload, ...prev]);
    setTestLogForm({
      mealLabel: "",
      insulin: "",
      creon: "",
      outcome: "",
      notes: "",
    });
  }

  function deleteTestLogEntry(id) {
    setTestLog((prev) => prev.filter((entry) => entry.id !== id));
  }

  function exportBackup() {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      app: "diabetes-creon-webapp",
      version: 2,
      categories,
      products,
      rows,
      settings,
      savedMeals,
      testLog,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
    a.href = url;
    a.download = `diabetes-creon-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importBackupFromFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result || "{}"));
        // 1. Check: is het een product import?
        if (raw.type === "product_import" && Array.isArray(raw.products)) {
          const confirmImport = window.confirm(
            `Productlijst "${raw.name}" importeren?`
          );
          if (!confirmImport) return;

          setProducts((prev) => {
            const existingKeys = new Set(
              prev.map(
                (p) =>
                  `${String(p.name).trim().toLowerCase()}__${
                    p.categoryId || ""
                  }`
              )
            );

            const productsToAdd = raw.products
              .filter((p) => {
                const key = `${String(p.name).trim().toLowerCase()}__${
                  p.categoryId || ""
                }`;
                return !existingKeys.has(key);
              })
              .map((p) =>
                normalizeProduct({
                  id: `prod-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 7)}`,
                  ...p,
                })
              );

            const skippedCount = raw.products.length - productsToAdd.length;

            setTimeout(() => {
              alert(
                `${productsToAdd.length} producten geïmporteerd.` +
                  (skippedCount > 0
                    ? ` ${skippedCount} product(en) overgeslagen omdat ze al bestonden.`
                    : "")
              );
            }, 0);

            return [...prev, ...productsToAdd];
          });

          return;
        }

        // 2. Anders: normale backup
        if (!raw || raw.app !== "diabetes-creon-webapp") {
          alert("Dit lijkt geen geldige backup van deze app.");
          return;
        }
        const confirmImport = window.confirm(
          "Backup importeren? De huidige producten, maaltijden en instellingen worden vervangen."
        );
        if (!confirmImport) return;

        setCategories(
          Array.isArray(raw.categories) ? raw.categories : starterCategories
        );
        setProducts(
          Array.isArray(raw.products)
            ? raw.products.map(normalizeProduct)
            : applyGiToProducts(starterProducts)
        );
        setRows(
          Array.isArray(raw.rows)
            ? ensureLastEmptyRow(normalizeMealRows(raw.rows))
            : [makeRow(), makeRow(), makeRow()]
        );
        setSettings(
          raw.settings || {
            gramsKhPerUnit: "8",
            fatPerCap25: "25",
            fatPerCap10: "10",
            creonMode: "standard",
            proteinCorrection: "0",
            khCreonFactor: "0",
            proteinCreonFactor: "0",
            includeProteinGlucoseInCreon: false,
            usePersonalTiming: true,
            minKhTriggerThreshold: "20",
            minProteinTriggerThreshold: "15",
            minEnzymeLoadValue: "10",
            enzymeTriggerPreset: "standaard",
          }
        );
        setSavedMeals(Array.isArray(raw.savedMeals) ? raw.savedMeals : []);
        setTestLog(Array.isArray(raw.testLog) ? raw.testLog : []);
        setMealName("");
        setEditingProductId(null);
        alert("Backup succesvol geïmporteerd.");
      } catch {
        alert("Import mislukt. Kies een geldig backupbestand van deze app.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  function restoreEmergencyBackup() {
    const raw = localStorage.getItem("dc_emergency_backup_v1");
    if (!raw) {
      alert("Geen lokale noodkopie gevonden.");
      return;
    }
    try {
      const backup = JSON.parse(raw);
      const confirmRestore = window.confirm(
        "Laatste lokale noodkopie herstellen? De huidige gegevens worden vervangen."
      );
      if (!confirmRestore) return;
      setCategories(
        Array.isArray(backup.categories) ? backup.categories : starterCategories
      );
      setProducts(
        Array.isArray(backup.products)
          ? backup.products.map(normalizeProduct)
          : applyGiToProducts(starterProducts)
      );
      setRows(
        Array.isArray(backup.rows)
          ? ensureLastEmptyRow(normalizeMealRows(backup.rows))
          : [makeRow(), makeRow(), makeRow()]
      );
      setSettings(
        backup.settings || {
          gramsKhPerUnit: "8",
          fatPerCap25: "25",
          fatPerCap10: "10",
          creonMode: "standard",
          proteinCorrection: "0",
          khCreonFactor: "0",
          proteinCreonFactor: "0",
          includeProteinGlucoseInCreon: false,
          usePersonalTiming: true,
          minKhTriggerThreshold: "20",
          minProteinTriggerThreshold: "15",
          minEnzymeLoadValue: "10",
          enzymeTriggerPreset: "standaard",
        }
      );
      setSavedMeals(Array.isArray(backup.savedMeals) ? backup.savedMeals : []);
      setTestLog(Array.isArray(backup.testLog) ? backup.testLog : []);
      setMealName("");
      setEditingProductId(null);
      alert("Lokale noodkopie hersteld.");
    } catch {
      alert("De lokale noodkopie kon niet worden gelezen.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: 16,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>
            Diabetes + Creon web-app prototype
          </h1>
          <p style={{ marginTop: 8, color: "#475569" }}>
            Nu met standaardmaaltijden, categorieën met ids, porties of gram,
            favorieten, opslag in je browser, sticky kopregel, categoriebeheer,
            snelle productzoeker, uitgebreider Creon-model, GI / Timing-tabblad,
            testlogboek en backupfunctie.
          </p>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            <button
              onClick={exportBackup}
              style={{
                ...buttonStyle,
                background: "#dcfce7",
                border: "1px solid #86efac",
                color: "#166534",
              }}
            >
              Backup exporteren
            </button>
            <button
              onClick={() => backupFileRef.current?.click()}
              style={buttonStyle}
            >
              Backup importeren
            </button>
            <button
              onClick={restoreEmergencyBackup}
              style={{
                ...buttonStyle,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1d4ed8",
              }}
            >
              Laatste noodkopie herstellen
            </button>
            <input
              ref={backupFileRef}
              type="file"
              accept="application/json"
              onChange={importBackupFromFile}
              style={{ display: "none" }}
            />
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
            Tip: exporteer geregeld een backupbestand naar je pc. De app bewaart
            ook automatisch een lokale noodkopie in deze browser.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setActiveTab("dashboard")}
            style={activeTab === "dashboard" ? primaryButtonStyle : buttonStyle}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("voedingslijst")}
            style={
              activeTab === "voedingslijst" ? primaryButtonStyle : buttonStyle
            }
          >
            Voedingslijst
          </button>
          <button
            onClick={() => setActiveTab("gi")}
            style={activeTab === "gi" ? primaryButtonStyle : buttonStyle}
          >
            GI / Timing
          </button>
          <button
            onClick={() => setActiveTab("daily")}
            style={activeTab === "daily" ? primaryButtonStyle : buttonStyle}
          >
            Dag / Archief
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            style={activeTab === "settings" ? primaryButtonStyle : buttonStyle}
          >
            Instellingen
          </button>
        </div>

        {activeTab === "dashboard" && (
          <DashboardTab
            categories={categories}
            products={products}
            savedMeals={savedMeals}
            showSavedMeals={showSavedMeals}
            setShowSavedMeals={setShowSavedMeals}
            mealName={mealName}
            setMealName={setMealName}
            saveCurrentMeal={saveCurrentMeal}
            loadSavedMeal={loadSavedMeal}
            deleteSavedMeal={deleteSavedMeal}
            favoriteProducts={favoriteProducts}
            showFavorites={showFavorites}
            setShowFavorites={setShowFavorites}
            quickAddProduct={quickAddProduct}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categoryFilterOptions={categoryFilterOptions}
            rowsWithCalc={rowsWithCalc}
            filteredProducts={filteredProducts}
            updateRow={updateRow}
            removeRow={removeRow}
            addRow={addRow}
            clearMeal={clearMeal}
            newRowRef={newRowRef}
            settings={settings}
            setSettings={setSettings}
            totals={totals}
            quickSearch={quickSearch}
            setQuickSearch={setQuickSearch}
            quickSearchResults={quickSearchResults}
            testLog={testLog}
            testLogForm={testLogForm}
            setTestLogForm={setTestLogForm}
            addTestLogEntry={addTestLogEntry}
            deleteTestLogEntry={deleteTestLogEntry}
            selectedDate={selectedDate}
            dayMealName={dayMealName}
            setDayMealName={setDayMealName}
            addCurrentMealToSelectedDay={addCurrentMealToSelectedDay}
            addCurrentMealToSelectedDayAndClear={
              addCurrentMealToSelectedDayAndClear
            }
          />
        )}

        {activeTab === "voedingslijst" && (
          <VoedingslijstTab
            categories={categories}
            products={products}
            editingProductId={editingProductId}
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            searchedProducts={searchedProducts}
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            addProduct={addProduct}
            resetNewProductForm={resetNewProductForm}
            toggleFavorite={toggleFavorite}
            deleteProduct={deleteProduct}
            sortConfig={sortConfig}
            requestSort={requestSort}
            categoryDraftName={categoryDraftName}
            setCategoryDraftName={setCategoryDraftName}
            addCategory={addCategory}
            renameCategory={renameCategory}
            deleteCategory={deleteCategory}
            productModalOpen={productModalOpen}
            openNewProductModal={openNewProductModal}
            openEditProductModal={openEditProductModal}
            closeProductModal={closeProductModal}
            activePackNames={activePackNames}
            activePackFilter={activePackFilter}
            setActivePackFilter={setActivePackFilter}
            packFilterOptions={packFilterOptions}
            packFilteredProducts={packFilteredProducts}
            deleteCurrentPackList={deleteCurrentPackList}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            settings={settings}
            setSettings={setSettings}
            resetSettings={resetSettings}
          />
        )}

        {activeTab === "gi" && (
          <GiTimingTab
            categories={categories}
            giSearch={giSearch}
            setGiSearch={setGiSearch}
            giFilteredProducts={giFilteredProducts}
            rowsWithCalc={rowsWithCalc}
            totals={totals}
            updateProductGi={updateProductGi}
          />
        )}

        {activeTab === "daily" && (
          <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Dag / Archief</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div>Datum</div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ fontSize: 13, color: "#475569" }}>
                Opgeslagen dagen: {sortedDates.length}
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Dagtotaal</h2>
              <div>KH: {dayTotals.kh} g</div>
              <div>Eiwit: {dayTotals.protein} g</div>
              <div>Vet: {dayTotals.fat} g</div>
              <div>kcal: {dayTotals.kcal}</div>
            </div>

            <div style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                <h2 style={{ margin: 0 }}>Maaltijden van deze dag</h2>

                <button
                  onClick={() => {
                    if (!selectedDay || !selectedDay.meals?.length) return;
                    const ok = window.confirm(
                      `Alle maaltijden van ${selectedDate} verwijderen?`
                    );
                    if (!ok) return;
                    clearDailyLog();
                  }}
                  style={{
                    ...buttonStyle,
                    background: "#fee2e2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                  }}
                >
                  Wis deze dag
                </button>
              </div>

              {!selectedDay && (
                <div style={{ color: "#64748b" }}>
                  Geen maaltijden opgeslagen voor deze dag.
                </div>
              )}

              {selectedDay &&
                selectedDay.meals.map((meal, index) => (
                  <DailyMealCard
                    key={meal.id}
                    meal={meal}
                    index={index}
                    products={products}
                    onDelete={deleteMealFromDay}
                    buttonStyle={buttonStyle}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
