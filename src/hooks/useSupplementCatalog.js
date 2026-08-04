import { useEffect, useRef, useState } from "react";
import { migrateSupplementCatalog } from "../data/supplements";
import { saveSupplementCatalogToCloud } from "../services/localStorageService";
import { loadSupplementCatalog, saveSupplementCatalog } from "../services/supplementStorageService";

const SUPPLEMENT_SYNC_VERSION = 1;
const STARTER_ITEM_COUNT = migrateSupplementCatalog({}).items.length;

function isCatalog(value) {
  return value && typeof value === "object" && Array.isArray(value.categories) && Array.isArray(value.items);
}

export function useSupplementCatalog({ settings, settingsSyncStatus, setSettings }) {
  const initialCatalog = useRef(loadSupplementCatalog());
  const [catalog, setCatalogState] = useState(initialCatalog.current);
  const catalogRef = useRef(initialCatalog.current);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || settingsSyncStatus !== "synced") return;

    const rawCloudCatalog = settings?.supplementCatalog;
    const cloudCatalog = isCatalog(rawCloudCatalog) ? migrateSupplementCatalog(rawCloudCatalog) : null;
    const localCatalog = loadSupplementCatalog();

    if (settings?.supplementCatalogSyncVersion === SUPPLEMENT_SYNC_VERSION && cloudCatalog) {
      initialized.current = true;
      catalogRef.current = cloudCatalog;
      setCatalogState(cloudCatalog);
      saveSupplementCatalog(cloudCatalog);
      if (JSON.stringify(cloudCatalog) !== JSON.stringify(rawCloudCatalog)) {
        setSettings((current) => ({ ...current, supplementCatalog: cloudCatalog }));
        saveSupplementCatalogToCloud(cloudCatalog);
      }
      return;
    }

    const migrationCatalog = cloudCatalog && cloudCatalog.items.length >= localCatalog.items.length
      ? cloudCatalog
      : localCatalog;
    initialized.current = true;
    catalogRef.current = migrationCatalog;
    setCatalogState(migrationCatalog);
    saveSupplementCatalog(migrationCatalog);

    // De starterslijst van vijf mag een uitgebreidere catalogus op een ander
    // apparaat niet definitief blokkeren. Rond de migratie pas af zodra er
    // aantoonbaar persoonlijke catalogusinhoud aanwezig is.
    if (migrationCatalog.items.length > STARTER_ITEM_COUNT) {
      setSettings((current) => ({
        ...current,
        supplementCatalog: migrationCatalog,
        supplementCatalogSyncVersion: SUPPLEMENT_SYNC_VERSION,
      }));
    }
  }, [settings, settingsSyncStatus, setSettings]);

  function setCatalog(update) {
    const next = typeof update === "function" ? update(catalogRef.current) : update;
    catalogRef.current = next;
    setCatalogState(next);
    saveSupplementCatalog(next);
    setSettings((currentSettings) => ({
      ...currentSettings,
      supplementCatalog: next,
      supplementCatalogSyncVersion: SUPPLEMENT_SYNC_VERSION,
    }));
    saveSupplementCatalogToCloud(next).then((saved) => {
      if (!saved) console.error("Supplementencatalogus kon niet in de cloud worden bewaard.");
    });
  }

  return { catalog, setCatalog };
}
