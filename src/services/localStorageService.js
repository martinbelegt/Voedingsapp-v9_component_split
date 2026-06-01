import { supabase } from "./supabaseClient";
import { starterProducts, krachtsportProducts } from "../data/starterProducts";
import { starterCategories } from "../data/starterCategories";

const STORAGE_KEYS = {
  products: "dc_products_v4",
  categories: "dc_categories_v14",
  rows: "dc_rows_v4",
  savedMeals: "dc_saved_meals_v1",
  settings: "dc_settings_v4",
  testLog: "dc_test_log_v1",
  dailyLog: "dc_daily_log_v1",
};

function safeJsonParse(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function loadProducts() {
  const saved = localStorage.getItem(STORAGE_KEYS.products);
  const savedProducts = safeJsonParse(saved, null);

  const defaultProducts = [...starterProducts, ...krachtsportProducts];

  if (!savedProducts) {
    return defaultProducts;
  }

  const merged = [...savedProducts];

  for (const defaultProduct of defaultProducts) {
    const exists = merged.some((product) => {
      const sameId = product.id === defaultProduct.id;
      const sameName =
        product.name.trim().toLowerCase() ===
        defaultProduct.name.trim().toLowerCase();

      return sameId || sameName;
    });

    if (!exists) {
      merged.push(defaultProduct);
    }
  }

  return merged;
}

export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

export function loadCategories() {
  const saved = localStorage.getItem(STORAGE_KEYS.categories);
  return safeJsonParse(saved, starterCategories);
}

export function saveCategories(categories) {
  localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
}

export function loadRows() {
  const saved = localStorage.getItem(STORAGE_KEYS.rows);
  return safeJsonParse(saved, []);
}

export function saveRows(rows) {
  localStorage.setItem(STORAGE_KEYS.rows, JSON.stringify(rows));
}

export function loadSavedMeals() {
  const saved = localStorage.getItem(STORAGE_KEYS.savedMeals);
  return safeJsonParse(saved, []);
}

export function saveSavedMeals(savedMeals) {
  localStorage.setItem(STORAGE_KEYS.savedMeals, JSON.stringify(savedMeals));
}

export function loadSettings() {
  const saved = localStorage.getItem(STORAGE_KEYS.settings);
  return safeJsonParse(saved, null);
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function loadTestLog() {
  const saved = localStorage.getItem(STORAGE_KEYS.testLog);
  return safeJsonParse(saved, []);
}

export function saveTestLog(testLog) {
  localStorage.setItem(STORAGE_KEYS.testLog, JSON.stringify(testLog));
}

export function loadDailyLog() {
  const saved = localStorage.getItem(STORAGE_KEYS.dailyLog);
  return safeJsonParse(saved, []);
}

export function saveDailyLog(dailyLog) {
  localStorage.setItem(STORAGE_KEYS.dailyLog, JSON.stringify(dailyLog));
}

export async function loadDailyLogFromCloud() {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("date", "main")
    .maybeSingle();

  if (error) {
    console.error("loadDailyLogFromCloud error:", error);
    return null;
  }

  return data?.data || null;
}

export async function saveDailyLogToCloud(dailyLog) {
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("daily_logs")
    .upsert(
      {
        date: "main",
        data: dailyLog,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "date",
      },
    )
    .select();

  console.log("saveDailyLogToCloud data:", data);
  console.log("saveDailyLogToCloud error:", error);

  if (error) {
    console.error("saveDailyLogToCloud error:", error);
    return false;
  }

  return true;
}

export async function loadAppDataFromCloud(key) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("app_data")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.error("loadAppDataFromCloud error:", key, error);
    return null;
  }

  return data?.data || null;
}

export async function saveAppDataToCloud(key, value) {
  if (!supabase) return false;

  const { error } = await supabase.from("app_data").upsert(
    {
      key,
      data: value,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "key",
    },
  );

  if (error) {
    console.error("saveAppDataToCloud error:", key, error);
    return false;
  }

  return true;
}

export { STORAGE_KEYS };
