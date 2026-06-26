import { useEffect, useRef, useState } from "react";
import {
  loadProducts,
  saveProducts,
  loadAppDataFromCloud,
  saveAppDataToCloud,
} from "../services/localStorageService";

export function useProducts() {
  const [products, setProductsState] = useState(() => loadProducts());
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const hasHydratedCloudData = useRef(false);
  const hasLocalUserChange = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCloudProducts() {
      const cloudProducts = await loadAppDataFromCloud("products");

      console.log("cloudProducts loaded:", cloudProducts?.length);

      if (cancelled) return;

      if (cloudProducts?.length) {
        hasHydratedCloudData.current = true;
        setProductsState(cloudProducts);
        saveProducts(cloudProducts);
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
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
  };
}
