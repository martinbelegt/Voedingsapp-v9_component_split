import React, { useState } from "react";
import {
  addSupplementCategory,
  countCategoryLinks,
  removeSupplementCategory,
  renameSupplementCategory,
} from "../../services/supplementCategoryService";
import CatalogCategoryManager from "../catalog/CatalogCategoryManager";

export default function SupplementCategoryManager({
  categories,
  supplements,
  onChange,
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function addCategory() {
    const result = addSupplementCategory(categories, name);
    if (result.error) return setError(result.error);
    onChange({ categories: result.categories, supplements });
    setName("");
    setError("");
  }

  function rename(category) {
    const nextName = window.prompt("Nieuwe categorienaam", category.name);
    if (nextName === null) return;
    const result = renameSupplementCategory(categories, category.id, nextName);
    if (result.error) return setError(result.error);
    onChange({ categories: result.categories, supplements });
    setError("");
  }

  function remove(category) {
    const linked = countCategoryLinks(supplements, category.id);
    const effect = linked
      ? ` De koppeling wordt bij ${linked} supplement${linked === 1 ? "" : "en"} verwijderd; de supplementen zelf blijven bestaan.`
      : "";
    if (!window.confirm(`Categorie “${category.name}” verwijderen?${effect}`)) return;
    onChange(removeSupplementCategory(categories, supplements, category.id));
  }

  return (
    <CatalogCategoryManager
      categories={categories}
      value={name}
      onValueChange={setName}
      onAdd={addCategory}
      onRename={rename}
      onDelete={remove}
      error={error}
    />
  );
}
