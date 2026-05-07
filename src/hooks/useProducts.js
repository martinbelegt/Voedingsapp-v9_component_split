import { useEffect, useState } from "react";
import { loadProducts, saveProducts } from "../services/localStorageService";

export function useProducts() {
  const [products, setProducts] = useState(() => loadProducts());

  useEffect(() => {
    saveProducts(products);
  }, [products]);

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
