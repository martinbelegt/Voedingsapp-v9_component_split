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

function getSupabaseErrorDetails(error) {
  if (!error) return null;

  return {
    message: error.message || "",
    code: error.code || "",
    details: error.details || "",
    hint: error.hint || "",
  };
}

function toJsonCompatibleValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function getAppDataPayloadSummary(value) {
  return {
    type: Array.isArray(value) ? "array" : typeof value,
    count: Array.isArray(value) ? value.length : undefined,
    jsonCompatible: (() => {
      try {
        toJsonCompatibleValue(value);
        return true;
      } catch {
        return false;
      }
    })(),
  };
}

function loadStoredValue(key, fallback = null) {
  const saved = localStorage.getItem(key);
  return safeJsonParse(saved, fallback);
}

export function loadStoredProducts() {
  return loadStoredValue(STORAGE_KEYS.products, null);
}

export function loadStoredCategories() {
  return loadStoredValue(STORAGE_KEYS.categories, null);
}

export function loadStoredSavedMeals() {
  return loadStoredValue(STORAGE_KEYS.savedMeals, null);
}

export function loadStoredSettings() {
  return loadStoredValue(STORAGE_KEYS.settings, null);
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
  if (!supabase) {
    return { status: "error", error: new Error("Supabase is niet beschikbaar") };
  }

  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("date", "main")
    .maybeSingle();

  if (error) {
    console.error("loadDailyLogFromCloud error:", error);
    return { status: "error", error };
  }

  if (!data) return { status: "missing" };

  if (!Array.isArray(data.data)) {
    return {
      status: "invalid",
      error: new Error("daily_logs.data is geen array"),
    };
  }

  return {
    status: data.data.length === 0 ? "empty" : "success",
    dailyLog: data.data,
    revision: Number(data.revision) || 0,
    updatedAt: data.updated_at || null,
  };
}

export async function saveDailyLogToCloud(dailyLog, expectedRevision) {
  if (!supabase) return { ok: false, conflict: false };

  if (!Number.isInteger(expectedRevision)) {
    console.warn("saveDailyLogToCloud skipped: missing expected revision", {
      expectedRevision,
    });
    return { ok: false, conflict: false };
  }

  const { data, error } = await supabase.rpc(
    "save_daily_log_if_revision_matches",
    {
      expected_revision: expectedRevision,
      next_data: dailyLog,
    },
  );

  console.log("saveDailyLogToCloud data:", data);
  console.log("saveDailyLogToCloud error:", error);

  if (error) {
    console.error("saveDailyLogToCloud error:", error);
    return { ok: false, conflict: false, error };
  }

  const result = Array.isArray(data) ? data[0] : data;
  const ok = !!result?.success;
  const nextRevision = Number(result?.next_revision);

  if (!ok) {
    console.warn("saveDailyLogToCloud blocked: revision mismatch", {
      expectedRevision,
      result,
    });
    return { ok: false, conflict: true, revision: nextRevision };
  }

  return {
    ok: true,
    conflict: false,
    revision: Number.isInteger(nextRevision) ? nextRevision : expectedRevision + 1,
  };
}

export async function loadAppDataFromCloud(key) {
  if (!supabase) {
    return { status: "error", error: new Error("Supabase is niet beschikbaar") };
  }

  const { data, error } = await supabase
    .from("app_data")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.error(
      "loadAppDataFromCloud error:",
      key,
      getSupabaseErrorDetails(error),
    );
    return { status: "error", error };
  }

  if (!data) return { status: "missing" };
  if (data.data === null || data.data === undefined) {
    return {
      status: "invalid",
      error: new Error(`app_data.${key} bevat geen bruikbare data`),
    };
  }

  const arrayKeys = ["products", "categories", "savedMeals"];
  if (arrayKeys.includes(key) && !Array.isArray(data.data)) {
    return {
      status: "invalid",
      error: new Error(`app_data.${key} is geen array`),
    };
  }

  if (
    key === "settings" &&
    (typeof data.data !== "object" ||
      Array.isArray(data.data) ||
      data.data === null)
  ) {
    return {
      status: "invalid",
      error: new Error("app_data.settings is geen object"),
    };
  }

  return {
    status:
      Array.isArray(data.data) && data.data.length === 0 ? "empty" : "success",
    value: data.data,
    updatedAt: data.updated_at || null,
  };
}

export async function saveAppDataToCloud(key, value) {
  if (!supabase) return false;

  let jsonValue;

  try {
    jsonValue = toJsonCompatibleValue(value);
  } catch (error) {
    console.error("saveAppDataToCloud payload is not valid JSON:", {
      key,
      summary: getAppDataPayloadSummary(value),
      error: error?.message || String(error),
    });
    return false;
  }

  const { error } = await supabase.from("app_data").upsert(
    {
      key,
      data: jsonValue,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "key",
    },
  );

  if (error) {
    console.error("saveAppDataToCloud error:", {
      key,
      payload: getAppDataPayloadSummary(jsonValue),
      supabase: getSupabaseErrorDetails(error),
    });
    return false;
  }

  return true;
}

export { STORAGE_KEYS };
