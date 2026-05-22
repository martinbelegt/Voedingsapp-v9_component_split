import React, { useEffect, useMemo, useRef, useState } from "react";
import VoedingslijstTab from "./components/VoedingslijstTab";
import { DashboardTab } from "./components/DashboardTab";
import { GiTimingTab } from "./components/GiTimingTab";
import { SettingsTab } from "./components/SettingsTab";
import { useDailyLog } from "./hooks/useDailyLog";
import { DailyTab } from "./components/DailyTab";
import { useSavedMeals } from "./hooks/useSavedMeals";
import { useProducts } from "./hooks/useProducts";
import { useCategories } from "./hooks/useCategories";
import { useSettings } from "./hooks/useSettings";
import { useMealRows } from "./hooks/useMealRows";
import { starterProducts } from "./data/starterProducts";
import { starterCategories } from "./data/starterCategories";
import { giStarterData } from "./data/giStarterData";
import { defaultSettings } from "./data/defaults";
import { MEAL_MOMENTS } from "./data/mealMoments";
import { calculateMealTotals } from "./services/mealTotalsService";
import { TestLogSection } from "./components/TestLogSection";
import { parseDecimalInput } from "./utils/numberUtils";
import { createId } from "./services/idService";
import { scrollRefIntoView } from "./services/scrollService";
import { useTestLog } from "./hooks/useTestLog";
import { useMealTimers } from "./hooks/useMealTimers";

import {
  getCategoryById,
  getCategoryName,
  getCategoryColor,
} from "./services/productHelpers";
import {
  getGiClassMeta,
  getTimingLabel,
  getTimingMinutes,
  getAbsorptionMeta,
} from "./services/uiHelpers";
import {
  sectionBadgeStyle,
  cardStyle,
  labelStyle,
  inputStyle,
  buttonStyle,
  primaryButtonStyle,
} from "./styles/uiStyles";

import {
  giClassOptions,
  timingOptions,
  absorptionProfileOptions,
  enzymeTriggerPresets,
  BRISTOL_OPTIONS,
} from "./data/appOptions";

import { CATEGORY_FALLBACK_COLORS } from "./data/categoryColors";

import {
  createNewProductForm,
  createProductEditForm,
} from "./services/productFormService";

import { buildMealSnapshot } from "./services/mealSnapshotService";

import {
  createProductPayload,
  findExistingProductMatch,
  confirmOverwriteProduct,
} from "./services/productPayloadService";

import {
  addEmptyMealRow,
  removeMealRowById,
  createEmptyMealRows,
  quickAddProductToRows,
  updateMealRowById,
} from "./services/mealRowStateService";

import {
  createFullBackupSnapshot,
  downloadJsonFile,
  createBackupFileName,
  createPackExportObject,
  createPackExportFileName,
  isFullBackupObject,
  isProductImportObject,
  createProductImportResultMessage,
  getBackupCategories,
  getBackupProducts,
  getBackupRows,
  getBackupSettings,
  getBackupSavedMeals,
  getBackupTestLog,
  getNewProductsFromImport,
  prepareRestoredBackupData,
} from "./services/backupService";

import {
  removeBaseProducts,
  removeProductsFromPack,
  createPackFilterOptions,
} from "./services/productPackService";

const STORAGE_KEYS = {
  settings: "dc_settings_v2",
  products: "dc_products_v2",
  categories: "dc_categories_v2",
  savedMeals: "dc_saved_meals_v2",
  dailyLog: "dc_daily_log_v2",
  foodListsBackup: "dc_food_lists_backup_v1",
};

function getDayMealMomentLabel(value) {
  if (value === "breakfast") return "Ontbijt";
  if (value === "lunch") return "Lunch";
  if (value === "dinner") return "Diner";
  if (value === "snack") return "Snack";
  if (value === "sport") return "Sport";
  if (value === "dessert") return "Toetje";
  if (value === "fruit") return "Fruit";
  return "Algemeen";
}

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
    giSourceUrl: p.giSourceUrl || "",
    giSourceNotes: p.giSourceNotes || "",
    personalTimingTag: p.personalTimingTag || p.timingTag || "meal",
    personalTimingNotes: p.personalTimingNotes || "",
    absorptionProfile: p.absorptionProfile || "steady",
    ...p,
    packId: p.packId ?? null,
    packName: p.packName ?? null,
    sourceType: p.sourceType ?? "manual",
    sourceName: p.sourceName || "",
    sourceUrl: p.sourceUrl || "",
    sourceNotes: p.sourceNotes || "",
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

  const {
    testLog,
    setTestLog,
    testLogForm,
    setTestLogForm,
    addTestLogEntry,
    deleteTestLogEntry,
  } = useTestLog();

  const { timers, startTimer, deleteTimer, clearTimers } = useMealTimers();

  const [mealName, setMealName] = useState("");
  const [dayMealName, setDayMealName] = useState("");
  const [dayMealMoment, setDayMealMoment] = useState("snack");
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
  const [activePackFilter, setActivePackFilter] = useState(() => {
    try {
      return localStorage.getItem("dc_active_pack_filter_v1") || "all";
    } catch {
      return "all";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("dc_active_pack_filter_v1", activePackFilter);
    } catch {}
  }, [activePackFilter]);

  const [newProduct, setNewProduct] = useState(() =>
    createNewProductForm(categories),
  );

  const [productModalOpen, setProductModalOpen] = useState(false);

  const newRowRef = useRef(null);
  const backupFileRef = useRef(null);
  const productImportFileRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("dc_rows_v4", JSON.stringify(rows));
  }, [rows]);

  useEffect(() => {
    const snapshot = createFullBackupSnapshot({
      categories,
      products,
      rows,
      settings,
      savedMeals,
      testLog,
    });

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

  const packFilterOptions = useMemo(
    () => createPackFilterOptions(activePackNames),
    [activePackNames],
  );

  const favoriteProducts = useMemo(() => {
    return [...products]
      .filter((p) => {
        if (!p.favorite) return false;

        // Alle lijsten: toon alle favorieten
        if (activePackFilter === "all") return true;

        // Basis / handmatig: producten zonder packName
        if (activePackFilter === "__base__") {
          return !p.packName || String(p.packName).trim() === "";
        }

        // Specifieke lijst: alleen favorieten uit die lijst
        return p.packName === activePackFilter;
      })
      .sort((a, b) =>
        a.name.localeCompare(b.name, "nl", { sensitivity: "base" }),
      );
  }, [products, activePackFilter]);

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
      const amount = parseDecimalInput(r.amount);
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

  const totals = useMemo(
    () =>
      calculateMealTotals({
        rowsWithCalc,
        settings,
        timingOptions,
        getTimingMinutes,
        round2,
        toNumber,
      }),
    [rowsWithCalc, settings],
  );

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
    setNewProduct(createNewProductForm(categories));
    setEditingProductId(null);
  }

  function openNewProductModal() {
    resetNewProductForm();
    setProductModalOpen(true);
  }

  function openEditProductModal(product) {
    setEditingProductId(product.id);

    setNewProduct(createProductEditForm(product));

    setProductModalOpen(true);
  }

  function closeProductModal() {
    setProductModalOpen(false);
  }

  function updateRow(id, patch) {
    setRows((prev) => updateMealRowById(prev, id, patch, ensureLastEmptyRow));
  }

  function updateProductGi(id, patch) {
    const product = getProduct(id);
    if (!product) return;

    updateProduct(id, normalizeProduct({ ...product, ...patch }));
  }

  function quickAddProduct(productId) {
    setRows((prev) =>
      quickAddProductToRows(prev, productId, makeRow, ensureLastEmptyRow),
    );

    scrollRefIntoView(newRowRef);
  }

  function clearMeal() {
    setRows(createEmptyMealRows(makeRow, 3));
    scrollRefIntoView(newRowRef);
  }

  function createMealSnapshot(customName) {
    return buildMealSnapshot({
      rowsWithCalc,
      customName,
      mealName,
      dayMealName,
      totals,
    });
  }

  function addCurrentMealToSelectedDay() {
    const snapshot = createMealSnapshot(getDayMealMomentLabel(dayMealMoment));
    if (!snapshot) {
      alert("Er is nog geen maaltijd ingevuld.");
      return;
    }

    addMealToDay({
      date: selectedDate,
      name: snapshot.name,
      mealMoment: dayMealMoment,
      rows: snapshot.rows,
      totals: snapshot.totals,
      createdAt: snapshot.createdAt,
    });
  }

  function addCurrentMealToSelectedDayAndClear() {
    const snapshot = createMealSnapshot(getDayMealMomentLabel(dayMealMoment));
    if (!snapshot) {
      alert("Er is nog geen maaltijd ingevuld.");
      return;
    }

    addMealToDay({
      date: selectedDate,
      name: snapshot.name,
      mealMoment: dayMealMoment,
      rows: snapshot.rows,
      totals: snapshot.totals,
      createdAt: snapshot.createdAt,
    });

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

    scrollRefIntoView(newRowRef);
  }

  function addRow() {
    setRows((prev) => addEmptyMealRow(prev, makeRow));
  }

  function removeRow(id) {
    setRows((prev) => removeMealRowById(prev, id, makeRow, ensureLastEmptyRow));
  }

  function addProduct() {
    if (!newProduct.name.trim()) return;

    const portionGram = parseDecimalInput(newProduct.portionGram);

    if (newProduct.inputMode === "perPortion" && portionGram <= 0) {
      alert("Vul bij invoer per portie een geldig portiegewicht in.");
      return;
    }

    const khInput = parseDecimalInput(newProduct.khInput);
    const proteinInput = parseDecimalInput(newProduct.proteinInput);
    const fatInput = parseDecimalInput(newProduct.fatInput);
    const kcalInput = parseDecimalInput(newProduct.kcalInput);
    const giValue = String(newProduct.giValue).trim();

    const convertTo100 = (value) => {
      if (newProduct.inputMode === "per100") return value;
      return round2((value / portionGram) * 100);
    };

    const payload = createProductPayload({
      newProduct,
      portionGram,
      kh100: convertTo100(khInput),
      protein100: convertTo100(proteinInput),
      fat100: convertTo100(fatInput),
      kcal100: convertTo100(kcalInput),
      giValue,
      activePackFilter,
      normalizeProduct,
    });

    if (editingProductId) {
      updateProduct(editingProductId, payload);
    } else {
      const existing = findExistingProductMatch(products, newProduct);

      if (existing) {
        const shouldOverwrite = confirmOverwriteProduct(existing);

        if (!shouldOverwrite) return;

        updateProduct(existing.id, payload);
      } else {
        addProductToStore({
          id: createId("prod"),
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

  function createNewPackList() {
    const name = window.prompt("Naam van de nieuwe productlijst:");

    const cleanName = String(name || "").trim();

    if (!cleanName) return;

    if (cleanName === "all" || cleanName === "__base__") {
      alert("Deze naam is gereserveerd. Kies een andere naam.");
      return;
    }

    const exists = activePackNames.some(
      (packName) => packName.toLowerCase() === cleanName.toLowerCase(),
    );

    if (exists) {
      alert("Er bestaat al een lijst met deze naam.");
      setActivePackFilter(cleanName);
      return;
    }

    setActivePackFilter(cleanName);
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

      setProducts((prev) => removeBaseProducts(prev));
      return;
    }

    const ok = window.confirm(
      `Lijst "${activePackFilter}" verwijderen? Alle producten uit deze lijst worden verwijderd.`,
    );
    if (!ok) return;

    setProducts((prev) => removeProductsFromPack(prev, activePackFilter));
    setActivePackFilter("all");
  }

  function copyProductToCurrentPack(product) {
    const defaultTarget =
      activePackFilter !== "all" && activePackFilter !== "__base__"
        ? activePackFilter
        : "";

    const targetPackName = window.prompt(
      "Naar welke lijst wil je dit product kopiëren?",
      defaultTarget,
    );

    if (!targetPackName || !targetPackName.trim()) return;

    const cleanTargetPackName = targetPackName.trim();

    if (cleanTargetPackName === "all" || cleanTargetPackName === "__base__") {
      alert("Kies een persoonlijke lijstnaam, niet 'all' of '__base__'.");
      return;
    }

    const alreadyExists = products.some(
      (p) =>
        p.packName === cleanTargetPackName &&
        String(p.name).trim().toLowerCase() ===
          String(product.name).trim().toLowerCase(),
    );

    if (alreadyExists) {
      const ok = window.confirm(
        `Er staat al een product met deze naam in lijst "${cleanTargetPackName}". Toch kopiëren?`,
      );

      if (!ok) return;
    }

    const copiedProduct = normalizeProduct({
      ...product,
      id: createId("prod"),
      packId: null,
      packName: cleanTargetPackName,
      sourceType: "copied",
      copiedFromProductId: product.id,
      copiedFromPackName: product.packName || "Basis / handmatig",
      favorite: false,
      sourceNotes: [
        product.sourceNotes,
        `Gekopieerd uit lijst: ${product.packName || "Basis / handmatig"}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    addProductToStore(copiedProduct);

    alert(`Product gekopieerd naar lijst "${cleanTargetPackName}".`);
  }

  function exportBackup() {
    const snapshot = createFullBackupSnapshot({
      categories,
      products,
      rows,
      settings,
      savedMeals,
      testLog,
    });

    downloadJsonFile(snapshot, createBackupFileName());
  }

  function exportCurrentPack() {
    const exportObject = createPackExportObject(products, activePackFilter);
    const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");

    const safePackName =
      activePackFilter === "all"
        ? "alles"
        : activePackFilter === "__base__"
          ? "basis"
          : String(activePackFilter)
              .toLowerCase()
              .replace(/[^a-z0-9]+/gi, "_")
              .replace(/^_+|_+$/g, "");

    const fileName = `voedingslijst_${safePackName}_${stamp}.json`;

    downloadJsonFile(exportObject, fileName);
  }

  function importBackupFromFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result || "{}"));

        // 1. Productlijst-import
        if (isProductImportObject(raw)) {
          const confirmImport = window.confirm(
            `Productlijst "${raw.name}" importeren?`,
          );
          if (!confirmImport) return;

          setProducts((prev) => {
            const productsToAdd = getNewProductsFromImport(
              raw.products,
              prev,
              normalizeProduct,
              createId,
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
        if (!isFullBackupObject(raw)) {
          alert("Dit lijkt geen geldige backup van deze app.");
          return;
        }

        const confirmImport = window.confirm(
          "Backup importeren? De huidige producten, maaltijden en instellingen worden vervangen.",
        );
        if (!confirmImport) return;

        setCategories(getBackupCategories(raw, starterCategories));

        setProducts(
          getBackupProducts(raw, {
            starterProducts,
            normalizeProduct,
            applyGiToProducts,
          }),
        );

        setRows(
          getBackupRows(raw, {
            normalizeMealRows,
            ensureLastEmptyRow,
            makeRow,
          }),
        );

        setSettings(getBackupSettings(raw, migrateSettings));

        setSavedMeals(getBackupSavedMeals(raw));
        setTestLog(getBackupTestLog(raw));
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

      setCategories(getBackupCategories(backup, starterCategories));

      setProducts(
        getBackupProducts(backup, {
          starterProducts,
          normalizeProduct,
          applyGiToProducts,
        }),
      );

      setRows(
        getBackupRows(backup, {
          normalizeMealRows,
          ensureLastEmptyRow,
          makeRow,
        }),
      );

      setSettings(getBackupSettings(backup, migrateSettings));

      setSavedMeals(getBackupSavedMeals(backup));
      setTestLog(getBackupTestLog(backup));
      setMealName("");
      setEditingProductId(null);

      alert("Lokale noodkopie hersteld.");
    } catch {
      alert("De lokale noodkopie kon niet worden gelezen.");
    }
  }
  function getTabButtonStyle(tabKey, color) {
    const isActive = activeTab === tabKey;

    return {
      ...(isActive ? primaryButtonStyle : buttonStyle),
      padding: "10px 16px",
      fontSize: 14,
      fontWeight: 800,
      borderRadius: 999,
      background: isActive ? color : "#ffffff",
      border: `1px solid ${color}`,
      color: isActive ? "#ffffff" : color,
      boxShadow: isActive ? "0 2px 8px rgba(15, 23, 42, 0.16)" : "none",
    };
  }

  // UI-stijlen die door dashboardonderdelen worden hergebruikt
  const uiStyles = {
    cardStyle,
    buttonStyle,
    primaryButtonStyle,
    inputStyle,
    labelStyle,
  };

  // Maaltijd-timers: verzadiging, eetpauze, glucose en vertering
  const timerProps = {
    timers,
    startTimer,
    deleteTimer,
    clearTimers,
  };

  // Daglogboek-acties vanuit het dashboard
  const dailyMealProps = {
    dayMealMoment,
    setDayMealMoment,
    addCurrentMealToSelectedDay,
    addCurrentMealToSelectedDayAndClear,
  };

  // Opgeslagen standaardmaaltijden
  const savedMealProps = {
    savedMeals,
    showSavedMeals,
    setShowSavedMeals,
    mealName,
    setMealName,
    saveCurrentMeal,
    loadSavedMeal,
    deleteSavedMeal,
  };

  // Favorietenblok
  const favoritesProps = {
    favoriteProducts,
    showFavorites,
    setShowFavorites,
    quickAddProduct,
  };

  // Snel zoeken en snel toevoegen
  const quickAddProps = {
    quickSearch,
    setQuickSearch,
    quickSearchResults,
    quickAddProduct,
  };

  // Huidige maaltijdregels
  const mealRowsProps = {
    rowsWithCalc,
    filteredProducts,
    updateRow,
    removeRow,
    addRow,
    clearMeal,
    newRowRef,
  };

  // Categoriefilter voor productkeuze
  const categoryFilterProps = {
    categoryFilter,
    setCategoryFilter,
    categoryFilterOptions,
  };

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
            testlogboek en backup/herstel via Instellingen.
          </p>
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
            style={getTabButtonStyle("dashboard", "#2563eb")}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("voedingslijst")}
            style={getTabButtonStyle("voedingslijst", "#16a34a")}
          >
            Voedingslijst
          </button>

          <button
            onClick={() => setActiveTab("gi")}
            style={getTabButtonStyle("gi", "#9333ea")}
          >
            GI / Timing
          </button>

          <button
            onClick={() => setActiveTab("testlog")}
            style={getTabButtonStyle("testlog", "#ea580c")}
          >
            Testlogboek
          </button>

          <button
            onClick={() => setActiveTab("daily")}
            style={getTabButtonStyle("daily", "#0891b2")}
          >
            Dag / Archief
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            style={getTabButtonStyle("settings", "#475569")}
          >
            Instellingen
          </button>
        </div>

        {activeTab === "dashboard" && (
          <DashboardTab
            categories={categories}
            products={products}
            savedMealProps={savedMealProps}
            favoritesProps={favoritesProps}
            quickAddProps={quickAddProps}
            categoryFilterProps={categoryFilterProps}
            mealRowsProps={mealRowsProps}
            totals={totals}
            dailyMealProps={dailyMealProps}
            timerProps={timerProps}
            uiStyles={uiStyles}
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
            copyProductToCurrentPack={copyProductToCurrentPack}
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
            createNewPackList={createNewPackList}
            productImportFileRef={productImportFileRef}
            importBackupFromFile={importBackupFromFile}
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
            exportBackup={exportBackup}
            importBackupFromFile={importBackupFromFile}
            restoreEmergencyBackup={restoreEmergencyBackup}
            backupFileRef={backupFileRef}
            cardStyle={cardStyle}
            labelStyle={labelStyle}
            inputStyle={inputStyle}
            buttonStyle={buttonStyle}
            primaryButtonStyle={primaryButtonStyle}
            enzymeTriggerPresets={enzymeTriggerPresets}
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
            getCategoryColor={getCategoryColor}
            getCategoryName={getCategoryName}
            getGiClassMeta={getGiClassMeta}
            getTimingLabel={getTimingLabel}
            giClassOptions={giClassOptions}
            timingOptions={timingOptions}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
            buttonStyle={buttonStyle}
            cardStyle={cardStyle}
            round2={round2}
          />
        )}

        {activeTab === "testlog" && (
          <TestLogSection
            testLog={testLog}
            testLogForm={testLogForm}
            setTestLogForm={setTestLogForm}
            bristolOptions={BRISTOL_OPTIONS}
            addTestLogEntry={addTestLogEntry}
            deleteTestLogEntry={deleteTestLogEntry}
            cardStyle={cardStyle}
            inputStyle={inputStyle}
            buttonStyle={buttonStyle}
            primaryButtonStyle={primaryButtonStyle}
            labelStyle={labelStyle}
          />
        )}

        {activeTab === "daily" && (
          <DailyTab
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            sortedDates={sortedDates}
            dayTotals={dayTotals}
            selectedDay={selectedDay}
            clearDailyLog={clearDailyLog}
            products={products}
            deleteMealFromDay={deleteMealFromDay}
            cardStyle={cardStyle}
            inputStyle={inputStyle}
            buttonStyle={buttonStyle}
          />
        )}
      </div>
    </div>
  );
}
