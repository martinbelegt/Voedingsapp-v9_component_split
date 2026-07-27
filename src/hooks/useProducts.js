import { useEffect, useRef, useState } from "react";
import {
  loadProducts,
  loadStoredProducts,
  saveProducts,
  loadAppDataFromCloud,
  saveAppDataToCloud,
} from "../services/localStorageService";
import { isMigrationProducts } from "../services/appDataSyncService";
import {
  canSaveAppData,
  decideInitialArrayAuthority,
  shouldAttemptMigration,
} from "../services/syncSafetyService";

export function useProducts() {
  const storedProducts = useRef(loadStoredProducts());
  const [products, setProductsState] = useState(() => loadProducts());
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("loading");
  const [productsSource, setProductsSource] = useState(
    storedProducts.current ? "Local cache" : "Defaults",
  );
  const [productsCloudDebug, setProductsCloudDebug] = useState({
    count: null,
    favorites: null,
    ok: false,
  });
  const hasHydratedCloudData = useRef(false);
  const hasLocalUserChange = useRef(false);
  const localChangeVersion = useRef(0);
  const cloudWriteBlockedByConflict = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCloudProducts() {
      const mutationVersionAtLoadStart = localChangeVersion.current;
      const cloudResult = await loadAppDataFromCloud("products");
      const cloudProducts = cloudResult.value;

      console.log("cloudProducts loaded:", cloudProducts?.length);

      if (cancelled) return;

      const decision = decideInitialArrayAuthority({
        localValue: products,
        cloudResult,
        localChangedDuringLoad:
          localChangeVersion.current !== mutationVersionAtLoadStart,
      });

      if (
        (cloudResult.status === "success" ||
          cloudResult.status === "empty") &&
        decision.action !== "keep-local"
      ) {
        hasHydratedCloudData.current = true;
        setSyncStatus("synced");
        setProductsSource("Cloud");
        setProductsCloudDebug({
          count: cloudProducts.length,
          favorites: cloudProducts.filter((product) => !!product?.favorite)
            .length,
          ok: true,
        });
        setProductsState(cloudProducts);
        saveProducts(cloudProducts);
      } else if (
        shouldAttemptMigration(
          cloudResult.status,
          isMigrationProducts(storedProducts.current),
        )
      ) {
        const ok = await saveAppDataToCloud("products", storedProducts.current);
        console.log("products one-time local migration:", {
          ok,
          count: storedProducts.current.length,
        });

        if (ok) {
          hasHydratedCloudData.current = true;
          setSyncStatus("synced");
          setProductsSource("Cloud");
          setProductsCloudDebug({
            count: storedProducts.current.length,
            favorites: storedProducts.current.filter(
              (product) => !!product?.favorite,
            ).length,
            ok: true,
          });
          setProductsState(storedProducts.current);
          saveProducts(storedProducts.current);
        } else {
          setSyncStatus("error");
        }
      } else {
        cloudWriteBlockedByConflict.current = decision.status === "conflict";
        setSyncStatus(
          cloudResult.status === "error" || cloudResult.status === "invalid"
            ? "error"
            : decision.status,
        );
      }

      setCloudLoaded(true);
    }

    loadCloudProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveProducts(products);

    if (
      cloudWriteBlockedByConflict.current ||
      !canSaveAppData({
        cloudLoaded,
        hasHydratedCloudData: hasHydratedCloudData.current,
        hasLocalUserChange: hasLocalUserChange.current,
      })
    ) {
      console.log("products cloud save skipped: app data not hydrated");
      return;
    }

    saveAppDataToCloud("products", products).then((ok) => {
      console.log("products cloud save:", ok);
      setSyncStatus(ok ? "synced" : "error");
      if (ok) {
        hasLocalUserChange.current = false;
        setProductsSource("Cloud");
        setProductsCloudDebug({
          count: products.length,
          favorites: products.filter((product) => !!product?.favorite).length,
          ok: true,
        });
      }
    });
  }, [products, cloudLoaded]);

  function setProducts(nextProducts) {
    hasLocalUserChange.current = true;
    localChangeVersion.current += 1;
    setProductsState(nextProducts);
  }

  function addProduct(product) {
    setProducts((prev) => [...prev, product]);
  }

  function updateProduct(id, patch) {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, ...patch } : product,
      ),
    );
  }

  function deleteProduct(id) {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  }

  function getProduct(id) {
    return products.find((product) => product.id === id);
  }

  return {
    products,
    setProducts,
    productsSource,
    productsCloudDebug,
    syncStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
  };
}
