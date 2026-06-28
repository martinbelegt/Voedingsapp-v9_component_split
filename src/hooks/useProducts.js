import { useEffect, useRef, useState } from "react";
import {
  loadProducts,
  loadStoredProducts,
  saveProducts,
  loadAppDataFromCloud,
  saveAppDataToCloud,
} from "../services/localStorageService";
import { isMigrationProducts } from "../services/appDataSyncService";

export function useProducts() {
  const storedProducts = useRef(loadStoredProducts());
  const [products, setProductsState] = useState(() => loadProducts());
  const [cloudLoaded, setCloudLoaded] = useState(false);
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

  useEffect(() => {
    let cancelled = false;

    async function loadCloudProducts() {
      const cloudProducts = await loadAppDataFromCloud("products");

      console.log("cloudProducts loaded:", cloudProducts?.length);

      if (cancelled) return;

      if (Array.isArray(cloudProducts)) {
        hasHydratedCloudData.current = true;
        setProductsSource("Cloud");
        setProductsCloudDebug({
          count: cloudProducts.length,
          favorites: cloudProducts.filter((product) => !!product?.favorite)
            .length,
          ok: true,
        });
        setProductsState(cloudProducts);
        saveProducts(cloudProducts);
      } else if (isMigrationProducts(storedProducts.current)) {
        const ok = await saveAppDataToCloud("products", storedProducts.current);
        console.log("products one-time local migration:", {
          ok,
          count: storedProducts.current.length,
        });

        if (ok) {
          hasHydratedCloudData.current = true;
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
        }
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

    if (!cloudLoaded) return;

    if (!hasHydratedCloudData.current && !hasLocalUserChange.current) {
      console.log("products cloud save skipped: app data not hydrated");
      return;
    }

    if (products?.length > 0) {
      saveAppDataToCloud("products", products).then((ok) => {
        console.log("products cloud save:", ok);
        if (ok) {
          setProductsSource("Cloud");
          setProductsCloudDebug({
            count: products.length,
            favorites: products.filter((product) => !!product?.favorite)
              .length,
            ok: true,
          });
        }
      });
    }
  }, [products, cloudLoaded]);

  function setProducts(nextProducts) {
    hasLocalUserChange.current = true;
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
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
  };
}
