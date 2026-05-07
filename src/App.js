import React, { useEffect, useMemo, useRef, useState } from "react";
import VoedingslijstTab from "./components/VoedingslijstTab";
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
import { calculateCreon } from "./creonCalculator2.js";
import { CreonResultCard } from "./CreonResultCard";
import { CreonSettingsCard } from "./CreonSettingsCard";
import { starterProducts } from "./data/starterProducts";
import { starterCategories } from "./data/starterCategories";
import { giStarterData } from "./data/giStarterData";
import { defaultSettings } from "./data/defaults";
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

const MEAL_MOMENTS = [
  { id: "neutral", label: "Algemeen" },
  { id: "breakfast", label: "Ontbijt" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Diner" },
  { id: "snack", label: "Tussendoor" },
  { id: "sport", label: "Sport" },
  { id: "dessert", label: "Toetje" },
  { id: "fruit", label: "Fruit" },
];

const STORAGE_KEYS = {
  settings: "dc_settings_v2",
  products: "dc_products_v2",
  categories: "dc_categories_v2",
  savedMeals: "dc_saved_meals_v2",
  dailyLog: "dc_daily_log_v2",
  foodListsBackup: "dc_food_lists_backup_v1",
};

function saveFoodListsBackup({ products, categories }) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.foodListsBackup,
      JSON.stringify({
        products,
        categories,
        savedAt: new Date().toISOString(),
      }),
    );
  } catch (e) {
    console.error("Kon voedingslijsten-backup niet opslaan", e);
  }
}

function loadFoodListsBackup() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.foodListsBackup);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Kon voedingslijsten-backup niet laden", e);
    return null;
  }
}

function migrateSettings(saved) {
  const base = { ...(saved || {}) };
  const version = Number(base.settingsVersion) || 1;

  let migrated = { ...base };

  if (version < 2) {
    migrated = {
      ...migrated,
      useCreon35000:
        migrated.useCreon35000 !== undefined ? migrated.useCreon35000 : true,
      useCreon25000:
        migrated.useCreon25000 !== undefined ? migrated.useCreon25000 : true,
      useCreon10000:
        migrated.useCreon10000 !== undefined ? migrated.useCreon10000 : true,
      useCreon5000:
        migrated.useCreon5000 !== undefined ? migrated.useCreon5000 : false,
      fatPerCap35:
        migrated.fatPerCap35 !== undefined ? migrated.fatPerCap35 : "",
      fatPerCap5: migrated.fatPerCap5 !== undefined ? migrated.fatPerCap5 : "",
      creonGoal:
        migrated.creonGoal !== undefined ? migrated.creonGoal : "comfort",
      minKhForLightMealCreon:
        migrated.minKhForLightMealCreon !== undefined
          ? migrated.minKhForLightMealCreon
          : "12",
      minProteinForLightMealCreon:
        migrated.minProteinForLightMealCreon !== undefined
          ? migrated.minProteinForLightMealCreon
          : "8",
      lightMealMinEnzymeLoad:
        migrated.lightMealMinEnzymeLoad !== undefined
          ? migrated.lightMealMinEnzymeLoad
          : "8",
    };
  }

  migrated.settingsVersion = defaultSettings.settingsVersion;

  const merged = { ...defaultSettings, ...migrated };

  Object.keys(defaultSettings).forEach((key) => {
    if (merged[key] === undefined || merged[key] === null) {
      merged[key] = defaultSettings[key];
    }
  });

  return merged;
}

const BRISTOL_OPTIONS = [
  { value: "1", label: "1 - zeer hard / keutels" },
  { value: "2", label: "2 - hard / klonterig" },
  { value: "3", label: "3 - worst met barstjes" },
  { value: "4", label: "4 - glad / ideaal" },
  { value: "5", label: "5 - zachte stukjes" },
  { value: "6", label: "6 - brijig / papperig" },
  { value: "7", label: "7 - waterdun" },
];

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

const krachtsportProducts = [
  {
    id: "ks1",
    categoryId: "cat-maaltijden",
    name: "Kipfilet gebakken",
    portion: "100 g",
    portionGram: 100,
    kh100: 0,
    protein100: 31,
    fat100: 3.6,
    kcal100: 165,
    favorite: true,
    packName: "Krachtsport",
  },
  {
    id: "ks2",
    categoryId: "cat-maaltijden",
    name: "Rundergehakt mager",
    portion: "100 g",
    portionGram: 100,
    kh100: 0,
    protein100: 26,
    fat100: 10,
    kcal100: 217,
    favorite: false,
    packName: "Krachtsport",
  },
  {
    id: "ks3",
    categoryId: "cat-maaltijden",
    name: "Zalm",
    portion: "100 g",
    portionGram: 100,
    kh100: 0,
    protein100: 25,
    fat100: 13,
    kcal100: 208,
    favorite: true,
    packName: "Krachtsport",
  },
  {
    id: "ks4",
    categoryId: "cat-maaltijden",
    name: "Eieren",
    portion: "1 stuk",
    portionGram: 60,
    kh100: 1,
    protein100: 13,
    fat100: 11,
    kcal100: 155,
    favorite: true,
    packName: "Krachtsport",
  },
  {
    id: "ks5",
    categoryId: "cat-zuivel",
    name: "Magere kwark",
    portion: "250 g",
    portionGram: 250,
    kh100: 4,
    protein100: 10,
    fat100: 0.3,
    kcal100: 60,
    favorite: true,
    packName: "Krachtsport",
  },
  {
    id: "ks6",
    categoryId: "cat-zuivel",
    name: "Griekse yoghurt 10%",
    portion: "150 g",
    portionGram: 150,
    kh100: 4,
    protein100: 9,
    fat100: 10,
    kcal100: 120,
    favorite: false,
    packName: "Krachtsport",
  },
  {
    id: "ks7",
    categoryId: "cat-sport",
    name: "Whey protein",
    portion: "30 g",
    portionGram: 30,
    kh100: 8,
    protein100: 75,
    fat100: 5,
    kcal100: 380,
    favorite: true,
    packName: "Krachtsport",
  },
  {
    id: "ks8",
    categoryId: "cat-brood",
    name: "Witte rijst gekookt",
    portion: "150 g",
    portionGram: 150,
    kh100: 28,
    protein100: 2.5,
    fat100: 0.3,
    kcal100: 130,
    favorite: false,
    packName: "Krachtsport",
  },
  {
    id: "ks9",
    categoryId: "cat-brood",
    name: "Zilvervliesrijst",
    portion: "150 g",
    portionGram: 150,
    kh100: 23,
    protein100: 2.7,
    fat100: 1,
    kcal100: 110,
    favorite: false,
    packName: "Krachtsport",
  },
  {
    id: "ks10",
    categoryId: "cat-maaltijden",
    name: "Aardappelen gekookt",
    portion: "200 g",
    portionGram: 200,
    kh100: 17,
    protein100: 2,
    fat100: 0.1,
    kcal100: 77,
    favorite: false,
    packName: "Krachtsport",
  },
  {
    id: "ks11",
    categoryId: "cat-maaltijden",
    name: "Zoete aardappel",
    portion: "200 g",
    portionGram: 200,
    kh100: 20,
    protein100: 1.6,
    fat100: 0.1,
    kcal100: 86,
    favorite: false,
    packName: "Krachtsport",
  },
  {
    id: "ks12",
    categoryId: "cat-brood",
    name: "Havermout",
    portion: "50 g",
    portionGram: 50,
    kh100: 60,
    protein100: 13,
    fat100: 7,
    kcal100: 370,
    favorite: true,
    packName: "Krachtsport",
  },
  {
    id: "ks13",
    categoryId: "cat-brood",
    name: "Volkoren brood",
    portion: "1 snee",
    portionGram: 35,
    kh100: 40,
    protein100: 8,
    fat100: 2,
    kcal100: 210,
    favorite: false,
    packName: "Krachtsport",
  },
  {
    id: "ks14",
    categoryId: "cat-fruit",
    name: "Banaan",
    portion: "1 stuk",
    portionGram: 120,
    kh100: 23,
    protein100: 1,
    fat100: 0.3,
    kcal100: 96,
    favorite: true,
    packName: "Krachtsport",
  },
  {
    id: "ks15",
    categoryId: "cat-vetten",
    name: "Olijfolie",
    portion: "10 ml",
    portionGram: 10,
    kh100: 0,
    protein100: 0,
    fat100: 100,
    kcal100: 884,
    favorite: false,
    packName: "Krachtsport",
  },
  {
    id: "ks16",
    categoryId: "cat-vetten",
    name: "Roomboter",
    portion: "10 g",
    portionGram: 10,
    kh100: 0,
    protein100: 1,
    fat100: 81,
    kcal100: 717,
    favorite: false,
    packName: "Krachtsport",
  },
  {
    id: "ks17",
    categoryId: "cat-beleg",
    name: "Pindakaas",
    portion: "20 g",
    portionGram: 20,
    kh100: 20,
    protein100: 25,
    fat100: 50,
    kcal100: 588,
    favorite: false,
    packName: "Krachtsport",
  },
  {
    id: "ks18",
    categoryId: "cat-snacks",
    name: "Amandelen",
    portion: "25 g",
    portionGram: 25,
    kh100: 22,
    protein100: 21,
    fat100: 49,
    kcal100: 579,
    favorite: false,
    packName: "Krachtsport",
  },
  {
    id: "ks19",
    categoryId: "cat-sport",
    name: "Proteïnereep",
    portion: "1 stuk",
    portionGram: 60,
    kh100: 30,
    protein100: 30,
    fat100: 10,
    kcal100: 350,
    favorite: false,
    packName: "Krachtsport",
  },
  {
    id: "ks20",
    categoryId: "cat-zuivel",
    name: "Halfvolle melk",
    portion: "250 ml",
    portionGram: 250,
    kh100: 5,
    protein100: 3.5,
    fat100: 1.5,
    kcal100: 47,
    favorite: false,
    packName: "Krachtsport",
  },
];

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
  const seen = new Set();

  return rows.map((r) => {
    let id = r.id || `${Date.now()}-${Math.random()}`;

    // 🔒 voorkom dubbele ids
    while (seen.has(id)) {
      id = `${Date.now()}-${Math.random()}`;
    }
    seen.add(id);

    return {
      id,
      productId: r.productId || "",
      mode: r.mode || "portion",
      amount: r.amount ?? "",
    };
  });
}

function buildCategoriesAndProductsFromLegacy(legacyProducts) {
  const nameToStarter = Object.fromEntries(
    starterCategories.map((c) => [c.name, c]),
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
          JSON.parse(savedProducts).map(normalizeProduct),
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

const sectionBadgeStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 999,
  padding: "4px 10px",
  background: "#f1f5f9",
  fontSize: 13,
  fontWeight: 800,
  color: "#0f172a",
  display: "inline-block",
  whiteSpace: "nowrap",
};

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

function ResultCard({ totals, rowsWithCalc }) {
  const [showResultDetail, setShowResultDetail] = useState(false);

  const cardBox = {
    borderRadius: 10,
    padding: 10,
    border: "1px solid #e2e8f0",
    background: "white",
    minHeight: 72,
  };

  const labelStyleMini = {
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 6,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  };

  const valueStyleMini = {
    fontSize: 13,
    color: "#0f172a",
    lineHeight: 1.35,
  };

  function getMacroStyle(level) {
    switch (level) {
      case "high":
        return { color: "#dc2626", fontWeight: 800 }; // rood
      case "medium":
        return { color: "#f59e0b", fontWeight: 700 }; // oranje
      case "low":
        return { color: "#16a34a", fontWeight: 700 }; // groen
      default:
        return { color: "#64748b" }; // grijs
    }
  }

  return (
    <>
      <div
        style={{
          border: "1px solid #94a3b8",
          borderRadius: 14,
          padding: 12,
          background: "#f1f5f9",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 16,
              color: "#0f172a",
            }}
          >
            Maaltijd resultaat
          </div>

          <button
            onClick={() => setShowResultDetail(true)}
            style={{
              border: "1px solid #94a3b8",
              borderRadius: 10,
              padding: "8px 12px",
              background: "white",
              cursor: "pointer",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Vergroot / analyse
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
            gap: 12,
            alignItems: "start",
          }}
        >
          {/* LINKER KOLOM */}
          <div style={{ display: "grid", gap: 10 }}>
            {/* Macro's */}
            <div style={{ ...cardBox, borderTop: "3px solid #1d4ed8" }}>
              <div style={{ ...labelStyleMini, color: "#1d4ed8" }}>
                Macro&apos;s
              </div>
              <div style={valueStyleMini}>
                <div style={getMacroStyle(totals.enzymeColorMap?.kh)}>
                  <strong>KH:</strong> {totals.kh} g
                </div>

                <div style={getMacroStyle(totals.enzymeColorMap?.protein)}>
                  <strong>Eiwit:</strong> {totals.protein} g
                </div>
              </div>
            </div>

            {/* Energie */}
            <div style={{ ...cardBox, borderTop: "3px solid #b45309" }}>
              <div style={{ ...labelStyleMini, color: "#b45309" }}>Energie</div>
              <div style={valueStyleMini}>
                <div>
                  <strong>Vet:</strong> {totals.fat} g
                </div>
                <div>
                  <strong>Kcal:</strong> {totals.kcal}
                </div>
              </div>
            </div>

            {/* Insuline / timing / GI */}
            <div style={{ ...cardBox, borderTop: "3px solid #7c3aed" }}>
              <div style={{ ...labelStyleMini, color: "#7c3aed" }}>
                Insuline / timing / GI
              </div>
              <div style={valueStyleMini}>
                <div>
                  <strong>Insuline:</strong> {totals.insulin} E
                </div>
                <div>
                  <strong>Timing:</strong> {totals.personalTimingAdvice}
                </div>
                <div>
                  <strong>GI:</strong> {totals.mealGiLabel}
                </div>
              </div>
            </div>
          </div>

          {/* RECHTER KOLOM */}
          <div
            style={{
              ...cardBox,
              borderTop: "3px solid #166534",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
            }}
          >
            <div style={{ ...labelStyleMini, color: "#166534" }}>Creon</div>
            <div style={valueStyleMini}>
              <CreonResultCard totals={totals} />
            </div>
          </div>
        </div>
      </div>

      {showResultDetail && (
        <div
          onClick={() => setShowResultDetail(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(1000px, 96vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: 18,
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              padding: 20,
              border: "1px solid #cbd5e1",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                Uitgebreide maaltijdanalyse
              </div>

              <button
                onClick={() => setShowResultDetail(false)}
                style={{
                  border: "1px solid #94a3b8",
                  borderRadius: 10,
                  padding: "8px 12px",
                  background: "#f8fafc",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Sluiten
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 16,
                alignItems: "start",
              }}
            >
              {/* Linker blok */}
              <div
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: 14,
                  padding: 14,
                  background: "#f8fafc",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 10 }}>
                  Samenvatting
                </div>

                <div style={{ display: "grid", gap: 6, fontSize: 14 }}>
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
                  <div>
                    <strong>Insuline:</strong> {totals.insulin} E
                  </div>
                  <div>
                    <strong>Timing:</strong> {totals.personalTimingAdvice}
                  </div>
                  <div>
                    <strong>GI:</strong> {totals.mealGiLabel}
                  </div>
                </div>

                <div
                  style={{ fontWeight: 800, marginTop: 16, marginBottom: 10 }}
                >
                  Producten in deze maaltijd
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  {(rowsWithCalc || [])
                    .filter((r) => r.product)
                    .map((r, idx) => (
                      <div
                        key={r.id || idx}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          padding: 10,
                          background: "white",
                          fontSize: 13,
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{r.product.name}</div>
                        <div style={{ color: "#475569", marginTop: 4 }}>
                          {r.grams} g • KH {r.kh} • Eiwit {r.protein} • Vet{" "}
                          {r.fat}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Rechter blok */}
              <div
                style={{
                  border: "1px solid #bbf7d0",
                  borderRadius: 14,
                  padding: 14,
                  background: "#f0fdf4",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 10 }}>
                  Creon-analyse
                </div>

                <CreonResultCard totals={totals} />

                <div
                  style={{
                    marginTop: 16,
                    borderTop: "1px solid #d1fae5",
                    paddingTop: 12,
                    fontSize: 14,
                    color: "#14532d",
                    display: "grid",
                    gap: 6,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>Korte interpretatie</div>

                  <div>
                    {totals.fat > totals.kh && totals.fat > totals.protein
                      ? "Deze maaltijd lijkt vooral vet-gedreven. Creon wordt hier waarschijnlijk vooral door vetbelasting bepaald."
                      : totals.protein > totals.fat &&
                          totals.protein > totals.kh
                        ? "Deze maaltijd lijkt relatief eiwit-zwaar. Let mogelijk ook op latere glucose-invloed."
                        : totals.kh > totals.fat && totals.kh > totals.protein
                          ? "Deze maaltijd lijkt relatief KH-zwaar. Timing en GI kunnen hier extra belangrijk zijn."
                          : "Deze maaltijd heeft een gemengd profiel. De uitkomst is gebaseerd op meerdere bijdragen tegelijk."}
                  </div>

                  {totals.needsLightMealSupport && (
                    <div>
                      Lichte maaltijd-ondersteuning was actief. Dat betekent dat
                      de app extra rekening hield met KH/eiwit ondanks lage
                      vetbelasting.
                    </div>
                  )}

                  {totals.mealHasDelayedCarbs && (
                    <div>
                      Er zitten producten met vertraagde opname in deze
                      maaltijd: <strong>{totals.delayedItemsText}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
  bristolOptions,
  addTestLogEntry,
  deleteTestLogEntry,
}) {
  const [showCategoryFilter, setShowCategoryFilter] = React.useState(false);

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
        <ResultCard totals={totals} rowsWithCalc={rowsWithCalc} />

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

        <div style={cardStyle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              value={dayMealName}
              onChange={(e) => setDayMealName(e.target.value)}
              style={inputStyle}
              placeholder="Naam voor daglog, bv. Ontbijt / Lunch / Avondeten"
            />

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

          <div style={{ marginTop: 10 }}>
            <input
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Snel product toevoegen..."
              style={inputStyle}
            />

            {quickSearch && (
              <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
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
                      padding: "6px 8px",
                      fontSize: 13,
                      background: getCategoryColor(categories, p.categoryId),
                    }}
                  >
                    {getCategoryName(categories, p.categoryId)} | {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
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

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "flex-start",
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

        <div style={cardStyle}>
          <button
            onClick={() => setShowCategoryFilter((v) => !v)}
            style={{
              ...buttonStyle,
              width: "100%",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Categorie filter</span>
            <span>{showCategoryFilter ? "▲" : "▼"}</span>
          </button>

          {showCategoryFilter && (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
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
          )}
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
              gridTemplateColumns: "1.3fr 0.7fr 0.7fr 0.9fr 1.2fr 1fr auto",
              gap: 8,
              marginBottom: 12,
              alignItems: "end",
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
            <div style={{ marginBottom: 0 }}>
              <label style={labelStyle}>Bristol Stool Chart</label>
              <select
                value={testLogForm.stoolType || "4"}
                onChange={(e) =>
                  setTestLogForm((prev) => ({
                    ...prev,
                    stoolType: e.target.value,
                  }))
                }
                style={inputStyle}
              >
                {bristolOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
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
                  gridTemplateColumns: "1.3fr 0.7fr 0.7fr 0.9fr 1.2fr 1fr auto",
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
                  <strong>Bristol:</strong>{" "}
                  {entry.stoolType
                    ? bristolOptions.find(
                        (opt) => opt.value === String(entry.stoolType),
                      )?.label || entry.stoolType
                    : "-"}
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

function SettingsTab({ settings, setSettings, resetSettings, resetAppData }) {
  const settingsCardBase = {
    borderRadius: 16,
    padding: 16,
    border: "1px solid #e5e7eb",
    display: "grid",
    gap: 12,
  };

  const helperStyle = {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 1.4,
  };

  const sectionTitleStyle = {
    fontSize: 12,
    fontWeight: 800,
    color: "#166534",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginTop: 4,
  };

  const creonInfoBoxStyle = {
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: "#166534",
    lineHeight: 1.5,
  };

  const softInfoBoxStyle = {
    fontSize: 12,
    color: "#166534",
    background: "#ffffff",
    border: "1px solid #d1fae5",
    borderRadius: 10,
    padding: "8px 10px",
    lineHeight: 1.45,
  };

  return (
    <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>Instellingen</h2>

        <div style={{ display: "grid", gap: 16 }}>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              alignItems: "start",
            }}
          >
            <div
              style={{
                ...settingsCardBase,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 16, color: "#1d4ed8" }}>
                Insuline
              </div>

              <div>
                <label style={labelStyle}>Gram KH per 1E insuline</label>
                <input
                  value={settings.gramsKhPerUnit}
                  onChange={(e) =>
                    setSettings({ ...settings, gramsKhPerUnit: e.target.value })
                  }
                  style={inputStyle}
                />
                <div style={helperStyle}>
                  Basisverhouding voor koolhydraten → insuline.
                </div>
              </div>
            </div>

            <div
              style={{
                ...settingsCardBase,
                background: "#fefce8",
                border: "1px solid #fde68a",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 16, color: "#a16207" }}>
                Timing
              </div>

              <div>
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
                    background: "#ffffff",
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
                <div style={helperStyle}>
                  Hiermee laat je de app jouw persoonlijke timingprofielen
                  meewegen naast het algemene GI-advies.
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              alignItems: "start",
            }}
          >
            <CreonSettingsCard
              settings={settings}
              setSettings={setSettings}
              settingsCardBase={settingsCardBase}
              helperStyle={helperStyle}
              labelStyle={labelStyle}
              inputStyle={inputStyle}
              enzymeTriggerPresets={enzymeTriggerPresets}
            />
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
                        r.product.categoryId,
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
                          timingOptions,
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
  function resetAppData() {
    const confirmReset = window.confirm(
      "Weet je zeker dat je de app wilt resetten? Voedingslijsten blijven bewaard.",
    );

    if (!confirmReset) return;

    try {
      saveFoodListsBackup({ products, categories });

      localStorage.removeItem(STORAGE_KEYS.settings);
      localStorage.removeItem(STORAGE_KEYS.savedMeals);
      localStorage.removeItem(STORAGE_KEYS.dailyLog);

      alert(
        "Instellingen, maaltijden en daglog zijn gewist. Voedingslijsten blijven bewaard.",
      );
      window.location.reload();
    } catch (e) {
      alert("Fout bij resetten van de app.");
    }
  }

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

  useEffect(() => {
    const backup = loadFoodListsBackup();
    if (!backup) return;

    if ((!products || products.length === 0) && backup.products?.length) {
      try {
        localStorage.setItem(
          STORAGE_KEYS.products,
          JSON.stringify(backup.products),
        );
      } catch (e) {
        console.error("Kon producten niet herstellen uit backup", e);
      }
    }

    if ((!categories || categories.length === 0) && backup.categories?.length) {
      try {
        localStorage.setItem(
          STORAGE_KEYS.categories,
          JSON.stringify(backup.categories),
        );
      } catch (e) {
        console.error("Kon categorieën niet herstellen uit backup", e);
      }
    }
  }, [products, categories]);

  const [testLog, setTestLog] = useState(() => {
    const saved = localStorage.getItem("dc_test_log_v1");
    return saved ? JSON.parse(saved) : [];
  });

  const [testLogForm, setTestLogForm] = useState({
    mealLabel: "",
    insulin: "",
    creon: "",
    stoolType: "4",
    outcome: "",
    notes: "",
  });

  const [mealName, setMealName] = useState("");
  const [dayMealName, setDayMealName] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
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
    packName: "Martin",
    mealMoment: "neutral",
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
    [categories],
  );

  const sortedProducts = useMemo(() => {
    const items = [...products];
    items.sort((a, b) => {
      let compare = 0;
      if (sortConfig.key === "category") {
        compare = getCategoryName(categories, a.categoryId).localeCompare(
          getCategoryName(categories, b.categoryId),
          "nl",
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
          "nl",
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
          timingOptions,
        ).localeCompare(
          getTimingLabel(b.personalTimingTag || b.timingTag, timingOptions),
          "nl",
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
      } else if (sortConfig.key === "mealMoment") {
        const getMealMomentLabel = (value) => {
          if (value === "breakfast") return "Ontbijt";
          if (value === "lunch") return "Lunch";
          if (value === "dinner") return "Diner";
          if (value === "snack") return "Tussendoor";
          if (value === "sport") return "Sport";
          if (value === "dessert") return "Toetje";
          if (value === "fruit") return "Fruit";
          return "Algemeen";
        };

        compare = getMealMomentLabel(a.mealMoment).localeCompare(
          getMealMomentLabel(b.mealMoment),
          "nl",
        );
        if (compare === 0) compare = a.name.localeCompare(b.name, "nl");
      }

      return sortConfig.direction === "asc" ? compare : -compare;
    });
    return items;
  }, [products, categories, sortConfig]);

  const filteredProducts = useMemo(
    () =>
      sortedProducts.filter(
        (p) => categoryFilter === "all" || p.categoryId === categoryFilter,
      ),
    [sortedProducts, categoryFilter],
  );

  const searchedProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return sortedProducts;
    return sortedProducts.filter((p) => {
      const categoryName = getCategoryName(
        categories,
        p.categoryId,
      ).toLowerCase();
      return p.name.toLowerCase().includes(q) || categoryName.includes(q);
    });
  }, [sortedProducts, productSearch, categories]);

  const activePackNames = useMemo(() => {
    const names = Array.from(
      new Set(
        products
          .map((p) => p.packName)
          .filter((name) => typeof name === "string" && name.trim() !== ""),
      ),
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
        a.name.localeCompare(b.name, "nl", { sensitivity: "base" }),
      );
  }, [products]);

  const packFilteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();

    const baseList = q
      ? sortedProducts.filter((p) => {
          const categoryName = getCategoryName(
            categories,
            p.categoryId,
          ).toLowerCase();
          return p.name.toLowerCase().includes(q) || categoryName.includes(q);
        })
      : sortedProducts;

    if (activePackFilter === "all") {
      return baseList;
    }

    if (activePackFilter === "__base__") {
      return baseList.filter(
        (p) => !p.packName || String(p.packName).trim() === "",
      );
    }

    return baseList.filter((p) => p.packName === activePackFilter);
  }, [sortedProducts, activePackFilter, productSearch, categories]);

  const quickSearchResults = useMemo(() => {
    const q = quickSearch.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => {
        const categoryName = getCategoryName(
          categories,
          p.categoryId,
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
              p.categoryId,
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
      rowsWithCalc.reduce((a, r) => a + (r.protein || 0), 0),
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
      settings.minProteinTriggerThreshold,
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

    const enzymeContributions = [
      { key: "fat", value: fatContribution },
      { key: "kh", value: khCreonContribution },
      { key: "protein", value: proteinCreonContribution },
    ].sort((a, b) => b.value - a.value);

    const enzymeColorMap = {};

    const max = enzymeContributions[0]?.value || 0;
    const second = enzymeContributions[1]?.value || 0;

    enzymeContributions.forEach((item) => {
      if (item.value <= 0) {
        enzymeColorMap[item.key] = "neutral";
      } else if (item.value === max) {
        enzymeColorMap[item.key] = "high";
      } else if (item.value === second) {
        enzymeColorMap[item.key] = "medium";
      } else {
        enzymeColorMap[item.key] = "low";
      }
    });

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

    const creon = calculateCreon({
      fat,
      protein,
      kh,
      settings,
    });

    const effectiveFat = creon.effectiveFat;
    const best = creon.best;

    let dominantEnzymeSource = "fat";
    let dominantEnzymeLabel = "Vooral vet-enzymen nodig";

    const enzymeProfileParts = [
      { key: "fat", label: "Vet", value: fat },
      { key: "kh", label: "KH", value: kh },
      { key: "protein", label: "Eiwit", value: protein },
    ].sort((a, b) => b.value - a.value);

    const topValue = enzymeProfileParts[0]?.value || 0;
    const secondValue = enzymeProfileParts[1]?.value || 0;

    if (topValue <= 0) {
      dominantEnzymeSource = "none";
      dominantEnzymeLabel = "Geen duidelijke enzymdominantie";
    } else if (secondValue > 0 && Math.abs(topValue - secondValue) <= 5) {
      dominantEnzymeSource = "mixed";
      dominantEnzymeLabel = "Gemengd enzymprofiel";
    } else if (enzymeProfileParts[0].key === "fat") {
      dominantEnzymeSource = "fat";
      dominantEnzymeLabel = "Vooral vet-enzymen nodig";
    } else if (enzymeProfileParts[0].key === "kh") {
      dominantEnzymeSource = "kh";
      dominantEnzymeLabel = "Vooral KH-enzymen nodig";
    } else if (enzymeProfileParts[0].key === "protein") {
      dominantEnzymeSource = "protein";
      dominantEnzymeLabel = "Vooral eiwit-enzymen nodig";
    }

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
            }, 0) / totalGiWeight,
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
      (r) => r.product && r.kh > 0,
    );
    const totalKhForTiming = personalTimingRows.reduce(
      (a, r) => a + (r.kh || 0),
      0,
    );
    const personalWeightedMinutes =
      usePersonalTiming && totalKhForTiming > 0
        ? round2(
            personalTimingRows.reduce((a, r) => {
              const minutes = getTimingMinutes(
                r.product.personalTimingTag || r.product.timingTag,
                timingOptions,
              );

              return a + minutes * (r.kh || 0);
            }, 0) / totalKhForTiming,
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
        (r.kh || 0) > 0,
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
      enzymeLoad: creon.enzymeLoad,
      rawEnzymeLoad: creon.rawEnzymeLoad,
      inputMacros: creon.inputMacros,
      usedFactors: creon.usedFactors,
      creonGoal: creon.creonGoal,
      needsLightMealSupport: creon.needsLightMealSupport,
      lightMealReason: creon.lightMealReason,
      lightMealMinEnzymeLoad: creon.lightMealMinEnzymeLoad,

      dominantEnzymeSource,
      dominantEnzymeLabel,
      fatContribution: creon.fatContribution,
      proteinGlucoseContribution: creon.proteinGlucoseContribution,
      khCreonContribution: creon.khCreonContribution,
      proteinCreonContribution: creon.proteinCreonContribution,

      enzymeColorMap,

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
      packName: "Martin",
      mealMoment: "neutral",
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
      mealMoment: product.mealMoment || "neutral",
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
        }),
      ),
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
      80,
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
      80,
    );
  }

  function getFilledMealRows() {
    return rowsWithCalc.filter(
      (r) => r.product && String(r.amount).trim() !== "",
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
      80,
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
      packName:
        activePackFilter === "all" || activePackFilter === "__base__"
          ? "Martin"
          : activePackFilter,
      sourceType: "manual",
      mealMoment: newProduct.mealMoment || "neutral",
    });

    if (editingProductId) {
      updateProduct(editingProductId, payload);
    } else {
      const existing = products.find(
        (p) =>
          p.name.toLowerCase() === newProduct.name.trim().toLowerCase() &&
          p.categoryId === newProduct.categoryId,
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
        r.productId === id ? { ...r, productId: "", amount: "" } : r,
      ),
    );

    savedMeals.forEach((meal) => {
      const updatedRows = meal.rows.filter((r) => r.productId !== id);

      if (updatedRows.length === 0) {
        deleteSavedMeal(meal.id);
      } else if (updatedRows.length !== meal.rows.length) {
        overwriteSavedMeal(meal.id, updatedRows);
      }
    });

    if (editingProductId === id) resetNewProductForm();
  }

  function addCategory() {
    const name = categoryDraftName.trim();
    if (!name) return;
    const exists = categories.some(
      (c) => c.name.toLowerCase() === name.toLowerCase(),
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
      category.name,
    );
    if (!nextName) return;
    const trimmed = nextName.trim();
    if (!trimmed || trimmed === category.name) return;
    const exists = categories.some(
      (c) =>
        c.id !== categoryId && c.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      alert("Er bestaat al een categorie met die naam.");
      return;
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, name: trimmed } : c)),
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
        p.categoryId === categoryId ? { ...p, categoryId: "cat-overig" } : p,
      ),
    );
    removeCategoryFromStore(categoryId);
    setNewProduct((prev) =>
      prev.categoryId === categoryId
        ? { ...prev, categoryId: "cat-overig" }
        : prev,
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
        "Alle basis / handmatige producten verwijderen? Geïmporteerde lijsten blijven bestaan.",
      );
      if (!ok) return;

      setProducts((prev) =>
        prev.filter((p) => p.packName && String(p.packName).trim() !== ""),
      );

      return;
    }

    const ok = window.confirm(
      `Lijst "${activePackFilter}" verwijderen? Alle producten uit deze lijst worden verwijderd.`,
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
      stoolType: testLogForm.stoolType || "4",
      outcome: testLogForm.outcome.trim(),
      notes: testLogForm.notes.trim(),
    };

    setTestLog((prev) => [payload, ...prev]);

    setTestLogForm({
      mealLabel: "",
      insulin: "",
      creon: "",
      stoolType: "4",
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

  function exportCurrentPack() {
    const data =
      activePackFilter === "all"
        ? products
        : activePackFilter === "__base__"
          ? products.filter(
              (p) => !p.packName || String(p.packName).trim() === "",
            )
          : products.filter((p) => p.packName === activePackFilter);

    const exportObject = {
      type: "product_import",
      name:
        activePackFilter === "all"
          ? "Alles"
          : activePackFilter === "__base__"
            ? "Basis"
            : activePackFilter,
      products: data.map((p) => ({
        name: p.name,
        categoryId: p.categoryId,
        portion: p.portion,
        portionGram: p.portionGram,
        kh100: p.kh100,
        protein100: p.protein100,
        fat100: p.fat100,
        kcal100: p.kcal100,
        favorite: !!p.favorite,
        packName:
          activePackFilter === "all"
            ? p.packName || ""
            : activePackFilter === "__base__"
              ? ""
              : activePackFilter,
      })),
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    const fileName =
      activePackFilter === "all"
        ? "export_alles.json"
        : activePackFilter === "__base__"
          ? "export_basis.json"
          : `export_${String(activePackFilter).toLowerCase()}.json`;

    a.href = url;
    a.download = fileName;
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

        // 1. Productlijst-import
        if (raw.type === "product_import" && Array.isArray(raw.products)) {
          const confirmImport = window.confirm(
            `Productlijst "${raw.name}" importeren?`,
          );
          if (!confirmImport) return;

          setProducts((prev) => {
            const existingKeys = new Set(
              prev.map(
                (p) =>
                  `${String(p.name).trim().toLowerCase()}__${
                    p.categoryId || ""
                  }`,
              ),
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
                }),
              );

            const skippedCount = raw.products.length - productsToAdd.length;

            setTimeout(() => {
              alert(
                `${productsToAdd.length} producten geïmporteerd.` +
                  (skippedCount > 0
                    ? ` ${skippedCount} product(en) overgeslagen omdat ze al bestonden.`
                    : ""),
              );
            }, 0);

            return [...prev, ...productsToAdd];
          });

          return;
        }

        // 2. Volledige backup-import
        if (!raw || raw.app !== "diabetes-creon-webapp") {
          alert("Dit lijkt geen geldige backup van deze app.");
          return;
        }

        const confirmImport = window.confirm(
          "Backup importeren? De huidige producten, maaltijden en instellingen worden vervangen.",
        );
        if (!confirmImport) return;

        setCategories(
          Array.isArray(raw.categories) ? raw.categories : starterCategories,
        );

        setProducts(
          Array.isArray(raw.products)
            ? raw.products.map(normalizeProduct)
            : applyGiToProducts(starterProducts),
        );

        setRows(
          Array.isArray(raw.rows)
            ? ensureLastEmptyRow(normalizeMealRows(raw.rows))
            : [makeRow(), makeRow(), makeRow()],
        );

        setSettings(migrateSettings(raw.settings));

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
        "Laatste lokale noodkopie herstellen? De huidige gegevens worden vervangen.",
      );
      if (!confirmRestore) return;

      setCategories(
        Array.isArray(backup.categories)
          ? backup.categories
          : starterCategories,
      );

      setProducts(
        Array.isArray(backup.products)
          ? backup.products.map(normalizeProduct)
          : applyGiToProducts(starterProducts),
      );

      setRows(
        Array.isArray(backup.rows)
          ? ensureLastEmptyRow(normalizeMealRows(backup.rows))
          : [makeRow(), makeRow(), makeRow()],
      );

      setSettings(migrateSettings(backup.settings));

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

            <button
              onClick={resetAppData}
              style={{
                ...buttonStyle,
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontWeight: 700,
              }}
            >
              Reset app / wis alle data
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
            ook automatisch een lokale noodkopie in deze browser. Reset wist
            instellingen, opgeslagen maaltijden en daglog. Voedingslijsten
            blijven bewaard.
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
            resetAppData={resetAppData}
            totals={totals}
            quickSearch={quickSearch}
            setQuickSearch={setQuickSearch}
            quickSearchResults={quickSearchResults}
            testLog={testLog}
            testLogForm={testLogForm}
            setTestLogForm={setTestLogForm}
            bristolOptions={BRISTOL_OPTIONS}
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
            exportCurrentPack={exportCurrentPack}
            getCategoryColor={getCategoryColor}
            getCategoryName={getCategoryName}
            getGiClassMeta={getGiClassMeta}
            getTimingLabel={getTimingLabel}
            getAbsorptionMeta={getAbsorptionMeta}
            giClassOptions={giClassOptions}
            timingOptions={timingOptions}
            absorptionProfileOptions={absorptionProfileOptions}
            MEAL_MOMENTS={MEAL_MOMENTS}
            buttonStyle={buttonStyle}
            primaryButtonStyle={primaryButtonStyle}
            cardStyle={cardStyle}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
            sectionBadgeStyle={sectionBadgeStyle}
            convertPer100ToPerPortion={convertPer100ToPerPortion}
            convertPerPortionToPer100={convertPerPortionToPer100}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            settings={settings}
            setSettings={setSettings}
            resetSettings={resetSettings}
            resetAppData={resetAppData}
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
                      `Alle maaltijden van ${selectedDate} verwijderen?`,
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
