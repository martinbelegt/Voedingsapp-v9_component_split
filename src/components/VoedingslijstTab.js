import React, { useState, useEffect, useRef } from "react";
import SortableHeader from "./SortableHeader";
import {
  CompanionNumberInput,
  CompanionSearchInput,
} from "../ui/inputs/CompanionInput";

function normalizeDecimalInput(value) {
  if (!/^\d*(?:[.,]\d*)?$/.test(value)) return null;
  return value.replace(",", ".");
}

export default VoedingslijstTab;

function VoedingslijstTab({
  categories,
  products,
  editingProductId,
  productSearch,
  setProductSearch,
  searchedProducts,
  newProduct,
  setNewProduct,
  addProduct,
  resetNewProductForm,
  toggleFavorite,
  copyProductToCurrentPack,
  deleteProduct,
  sortConfig,
  requestSort,
  categoryDraftName,
  setCategoryDraftName,
  addCategory,
  renameCategory,
  deleteCategory,
  productModalOpen,
  openNewProductModal,
  openEditProductModal,
  closeProductModal,
  activePackNames,
  activePackFilter,
  setActivePackFilter,
  packFilterOptions,
  packFilteredProducts,
  deleteCurrentPackList,
  exportCurrentPack,
  productImportFileRef,
  importBackupFromFile,
  getCategoryColor,
  getCategoryName,
  getGiClassMeta,
  getTimingLabel,
  getAbsorptionMeta,
  giClassOptions,
  timingOptions,
  absorptionProfileOptions,
  MEAL_MOMENTS,
  buttonStyle,
  primaryButtonStyle,
  cardStyle,
  inputStyle,
  labelStyle,
  sectionBadgeStyle,
  convertPer100ToPerPortion,
  convertPerPortionToPer100,
  createNewPackList,
}) {
  const productListGridTemplate =
    "54px 1.05fr 1.1fr 1.65fr 0.95fr 0.8fr 0.8fr 0.8fr 0.8fr 0.95fr 0.95fr 1.15fr 1.05fr";

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

  const manageableCategories = categories.filter((c) => c.id !== "cat-overig");

  const [showCategoryManager, setShowCategoryManager] = useState(() => {
    try {
      return localStorage.getItem("dc_show_category_manager_v1") === "true";
    } catch {
      return false;
    }
  });

  const [hoveredProductId, setHoveredProductId] = useState(null);

  const [showMobileListManager, setShowMobileListManager] = useState(false);
  const [showMobileSourceDetails, setShowMobileSourceDetails] =
    useState(false);
  const [showMobileGiDetails, setShowMobileGiDetails] = useState(false);
  const [showMobileTimingDetails, setShowMobileTimingDetails] =
    useState(false);
  const productModalScrollRef = useRef(null);
  const sourceDetailsRef = useRef(null);
  const giDetailsRef = useRef(null);
  const timingDetailsRef = useRef(null);

  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    try {
      localStorage.setItem(
        "dc_show_category_manager_v1",
        String(showCategoryManager),
      );
    } catch {}
  }, [showCategoryManager]);

  useEffect(() => {
    if (!productModalOpen || typeof document === "undefined") {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousHtmlTouchAction = document.documentElement.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.touchAction = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.touchAction = previousHtmlTouchAction;
    };
  }, [productModalOpen]);

  const headerCellStyle = {
    minWidth: 0,
    padding: "0 10px",
    borderRight: "1px solid #94a3b8",
    display: "flex",
    gap: 5,
    alignItems: "center",
    overflow: "hidden",
    whiteSpace: "nowrap",
  };

  const bodyCellStyle = {
    minWidth: 0,
    padding: "0 10px",
    borderRight: "1px solid #cbd5e1",
    display: "flex",
    gap: 5,
    alignItems: "center",
    overflow: "hidden",
  };

  const clickableHeaderCellStyle = {
    ...headerCellStyle,
    cursor: "pointer",
    userSelect: "none",
  };

  const modalCategoryColor = getCategoryColor(
    categories,
    newProduct.categoryId || "cat-overig",
  );

  const modalCardStyle = {
    ...cardStyle,
    padding: isMobile ? 5 : 14,
    ...(isMobile
      ? {
          borderRadius: 8,
          minWidth: 0,
          maxWidth: "100%",
          overflowX: "hidden",
          boxSizing: "border-box",
        }
      : {}),
  };

  const modalHeadingStyle = {
    marginTop: 0,
    marginBottom: isMobile ? 4 : 12,
    fontSize: isMobile ? 14 : undefined,
    lineHeight: 1.2,
  };

  const modalGridGap = isMobile ? 4 : 10;
  const modalStackGap = isMobile ? 4 : 16;
  const modalInputStyle = {
    ...inputStyle,
    ...(isMobile
      ? {
          fontSize: 16,
          lineHeight: 1.2,
          padding: "5px 8px",
          minHeight: 36,
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
        }
      : {}),
  };
  const modalFieldStyle = isMobile
    ? { minWidth: 0, maxWidth: "100%", boxSizing: "border-box" }
    : {};
  const modalLabelStyle = {
    ...labelStyle,
    ...(isMobile
      ? {
          display: "block",
          marginBottom: 2,
          lineHeight: 1.15,
          fontSize: 12,
        }
      : {}),
  };
  const mobileModalActionBarStyle = {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  };
  const mobileModalActionButtonStyle = {
    padding: "5px 6px",
    fontSize: 11,
    lineHeight: 1.15,
    whiteSpace: "nowrap",
    flexShrink: 0,
  };
  const mobileCollapseButtonStyle = {
    ...buttonStyle,
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: isMobile ? "5px 8px" : buttonStyle?.padding,
    fontSize: isMobile ? 13 : buttonStyle?.fontSize,
    fontWeight: 800,
    background: isMobile ? "#f8fafc" : buttonStyle?.background,
  };

  const deleteModalProduct = () => {
    if (!editingProductId) return;

    if (
      !window.confirm(
        `Product "${newProduct.name || "dit product"}" verwijderen?`,
      )
    ) {
      return;
    }

    deleteProduct(editingProductId);
    closeProductModal();
    resetNewProductForm();
  };

  const cancelProductModal = () => {
    resetNewProductForm();
    closeProductModal();
  };

  const saveProductModal = () => {
    addProduct();
    closeProductModal();
  };

  const scrollMobileModalTo = (ref) => {
    if (!isMobile) return;

    const scrollToTarget = () => {
      const container = productModalScrollRef.current;
      const target = ref.current;

      if (!container || !target) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const stickyHeaderOffset = 96;
      const nextTop =
        container.scrollTop +
        targetRect.top -
        containerRect.top -
        stickyHeaderOffset;

      container.scrollTo({
        top: Math.max(0, nextTop),
        behavior: "smooth",
      });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToTarget);
    });
    setTimeout(scrollToTarget, 180);
  };

  const toggleMobileSourceDetails = () => {
    setShowMobileSourceDetails((open) => {
      const nextOpen = !open;
      if (nextOpen) scrollMobileModalTo(sourceDetailsRef);
      return nextOpen;
    });
  };

  const toggleMobileGiDetails = () => {
    setShowMobileGiDetails((open) => {
      const nextOpen = !open;
      if (nextOpen) scrollMobileModalTo(giDetailsRef);
      return nextOpen;
    });
  };

  const toggleMobileTimingDetails = () => {
    setShowMobileTimingDetails((open) => {
      const nextOpen = !open;
      if (nextOpen) scrollMobileModalTo(timingDetailsRef);
      return nextOpen;
    });
  };

  return (
    <div
      style={{
        display: "grid",
        gap: isMobile ? 10 : 16,
        marginTop: isMobile ? 8 : 16,
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      <div style={cardStyle}>
        {isMobile && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 4,
              marginBottom: 6,
            }}
          >
            <button
              onClick={() => setShowCategoryManager((v) => !v)}
              style={{
                ...buttonStyle,
                width: "100%",
                minWidth: 0,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 4,
                background: "#f8fafc",
                fontWeight: 700,
                padding: "5px 7px",
                fontSize: 12,
                lineHeight: 1.05,
                borderRadius: 6,
              }}
            >
              <span
                style={{
                  ...sectionBadgeStyle,
                  padding: "2px 6px",
                  fontSize: 11,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Categoriebeheer
              </span>
              <span>{showCategoryManager ? "▲" : "▼"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMobileListManager((v) => !v)}
              style={{
                ...buttonStyle,
                width: "100%",
                minWidth: 0,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 4,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "5px 7px",
                fontWeight: 800,
                fontSize: 12,
                lineHeight: 1.05,
                borderRadius: 6,
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                📚 {activePackFilter}
              </span>
              <span>{showMobileListManager ? "▲" : "▼"}</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowCategoryManager((v) => !v)}
          style={{
            ...buttonStyle,
            width: "100%",
            textAlign: "left",
            display: isMobile ? "none" : "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8fafc",
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          <span style={sectionBadgeStyle}>Categoriebeheer</span>
          <span>{showCategoryManager ? "▲" : "▼"}</span>
        </button>

        {showCategoryManager && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr auto",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <input
                value={categoryDraftName}
                onChange={(e) => setCategoryDraftName(e.target.value)}
                style={inputStyle}
                placeholder="Nieuwe categorienaam"
              />
              <button onClick={addCategory} style={primaryButtonStyle}>
                Categorie toevoegen
              </button>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {categories.map((c) => {
                const count = products.filter((p) => {
                  const productCategoryId = p.categoryId || "cat-overig";
                  return productCategoryId === c.id;
                }).length;
                const isProtected = c.id === "cat-overig";

                return (
                  <div
                    key={c.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.6fr auto auto",
                      gap: 8,
                      alignItems: "center",
                      padding: 10,
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      background: c.color,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "#475569" }}>
                        {count} product(en)
                      </div>
                    </div>

                    {!isProtected ? (
                      <button
                        onClick={() => renameCategory(c.id)}
                        style={{
                          ...buttonStyle,
                          background: "rgba(255,255,255,0.7)",
                        }}
                      >
                        Wijzigen
                      </button>
                    ) : (
                      <div />
                    )}

                    {!isProtected ? (
                      <button
                        onClick={() => deleteCategory(c.id)}
                        style={{
                          ...buttonStyle,
                          background: "#fee2e2",
                          border: "1px solid #fecaca",
                        }}
                      >
                        Verwijder
                      </button>
                    ) : (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#475569",
                          textAlign: "right",
                        }}
                      >
                        reserve
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gap: 6,
            marginBottom: 8,
          }}
        >
          <button
            type="button"
            onClick={() =>
              isMobile
                ? setShowMobileListManager((v) => !v)
                : setShowMobileListManager(true)
            }
            style={{
              ...buttonStyle,
              width: "100%",
              display: isMobile ? "none" : "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              padding: isMobile ? "7px 9px" : "8px 12px",
              fontWeight: 800,
              fontSize: isMobile ? 13 : 14,
            }}
          >
            <span>📚 {activePackFilter}</span>
            <span>{isMobile && showMobileListManager ? "▲" : "▼"}</span>
          </button>

          {(!isMobile || showMobileListManager) && (
            <div
              style={{
                display: "grid",
                gap: 8,
                padding: isMobile ? 8 : 10,
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                background: "#f8fafc",
              }}
            >
              <select
                value={activePackFilter}
                onChange={(e) => setActivePackFilter(e.target.value)}
                style={{
                  ...inputStyle,
                  width: "100%",
                  padding: "6px 8px",
                  fontSize: isMobile ? 13 : 14,
                }}
              >
                {packFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {activePackNames.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {activePackNames.map((name) => {
                    const isActive = activePackFilter === name;

                    return (
                      <button
                        key={name}
                        onClick={() => setActivePackFilter(name)}
                        style={{
                          ...buttonStyle,
                          padding: "4px 8px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: isActive ? "#3730a3" : "#e0e7ff",
                          border: "1px solid #c7d2fe",
                          color: isActive ? "white" : "#3730a3",
                        }}
                        title={`Toon alleen lijst: ${name}`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, auto)",
                  gap: 6,
                }}
              >
                <button
                  onClick={createNewPackList}
                  style={{
                    ...buttonStyle,
                    padding: "7px 8px",
                    fontSize: 12,
                    background: "#ecfdf5",
                    border: "1px solid #bbf7d0",
                    color: "#166534",
                    fontWeight: 700,
                  }}
                >
                  Nieuwe lijst
                </button>

                <button
                  onClick={() => productImportFileRef.current?.click()}
                  style={{
                    ...buttonStyle,
                    padding: "7px 8px",
                    fontSize: 12,
                  }}
                >
                  Import
                </button>

                <input
                  ref={productImportFileRef}
                  type="file"
                  accept="application/json"
                  onChange={importBackupFromFile}
                  style={{ display: "none" }}
                />

                <button
                  onClick={exportCurrentPack}
                  style={{
                    ...buttonStyle,
                    padding: "7px 8px",
                    fontSize: 12,
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#1d4ed8",
                  }}
                >
                  Export
                </button>

                <button
                  onClick={deleteCurrentPackList}
                  style={{
                    ...buttonStyle,
                    padding: "7px 8px",
                    fontSize: 12,
                    background:
                      activePackFilter === "all" ? "#f8fafc" : "#fee2e2",
                    border:
                      activePackFilter === "all"
                        ? "1px solid #e5e7eb"
                        : "1px solid #fecaca",
                    color: activePackFilter === "all" ? "#94a3b8" : "#991b1b",
                    cursor:
                      activePackFilter === "all" ? "not-allowed" : "pointer",
                  }}
                  disabled={activePackFilter === "all"}
                >
                  Verwijder
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            ...cardStyle,
            padding: isMobile ? 6 : 12,
            marginBottom: isMobile ? 8 : 12,
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "auto 1fr auto",
              gap: isMobile ? 5 : 8,
              alignItems: "center",
            }}
          >
            <button
              onClick={openNewProductModal}
              style={{
                ...primaryButtonStyle,
                ...(isMobile
                  ? {
                      order: 1,
                      background: "#dcfce7",
                      border: "1px solid #86efac",
                      color: "#14532d",
                      padding: "5px 8px",
                      minHeight: 32,
                      fontSize: 12,
                      lineHeight: 1.05,
                      borderRadius: 6,
                    }
                  : {}),
              }}
            >
              Nieuw product
            </button>

            <CompanionSearchInput
              placeholder="Zoek product of categorie"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              style={{
                ...inputStyle,
                ...(isMobile
                  ? {
                      order: 3,
                      gridColumn: "1 / -1",
                      padding: "6px 8px",
                      minHeight: 34,
                      fontSize: 16,
                      lineHeight: 1.1,
                      borderRadius: 6,
                    }
                  : {}),
              }}
            />

            <button
              onClick={() => setProductSearch("")}
              style={{
                ...buttonStyle,
                ...(isMobile
                  ? {
                      order: 2,
                      padding: "5px 8px",
                      minHeight: 32,
                      fontSize: 12,
                      lineHeight: 1.05,
                      borderRadius: 6,
                    }
                  : {}),
              }}
            >
              Wis zoekveld
            </button>
          </div>

          {productSearch.trim() && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#475569" }}>
              {searchedProducts.length} resultaat / resultaten voor{" "}
              <strong>{productSearch}</strong>
            </div>
          )}
        </div>

        <div
          style={{
            fontSize: 11,
            marginBottom: 6,
            color: "#64748b",
          }}
        >
          Tik op een product voor details.
        </div>

        <div
          style={{
            marginBottom: 10,
            padding: "8px 10px",
            borderRadius: 10,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: 13,
            color: "#334155",
          }}
        >
          Totaal producten: <strong>{products.length}</strong>
          {" • "}
          Getoond: <strong>{packFilteredProducts.length}</strong>
          {" • "}
          Filter: <strong>{activePackFilter}</strong>
        </div>

        {isMobile && (
          <div style={{ display: "grid", gap: 5 }}>
            {packFilteredProducts.map((p) => {
              const bg = getCategoryColor(categories, p.categoryId);

              return (
                <div
                  key={p.id}
                  onClick={() => openEditProductModal(p)}
                  style={{
                    background: bg,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "7px 8px",
                    display: "grid",
                    gap: 3,
                    cursor: "pointer",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 6,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 850,
                        fontSize: 14,
                        color: "#0f172a",
                        lineHeight: 1.15,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.name}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(p.id);
                      }}
                      style={{
                        ...buttonStyle,
                        padding: "2px 6px",
                        fontSize: 14,
                        lineHeight: 1,
                        minHeight: 24,
                        background: "white",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      {p.favorite ? "★" : "☆"}
                    </button>
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#334155",
                      fontWeight: 700,
                      lineHeight: 1.15,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getCategoryName(categories, p.categoryId)} ·{" "}
                    {getMealMomentLabel(p.mealMoment)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!isMobile && (
          <div
            style={{
              maxHeight: "65vh",
              overflowY: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              background: "white",
              padding: 6,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: productListGridTemplate,
                gap: 5,
                padding: "10px 6px",
                marginBottom: 8,
                fontSize: 11,
                fontWeight: 700,
                color: "#475569",
                borderBottom: "2px solid #94a3b8",
                background: "#f8fafc",
                position: "sticky",
                top: 0,
                zIndex: 5,
                alignItems: "center",
                justifyItems: "stretch",
                textAlign: "left",
              }}
            >
              <div
                style={clickableHeaderCellStyle}
                onClick={() => requestSort("favorite")}
                title="Sorteer op favoriet"
              >
                <SortableHeader
                  label="Fav"
                  sortKey="favorite"
                  sortConfig={sortConfig}
                  textAlign="left"
                />
              </div>

              <div
                style={clickableHeaderCellStyle}
                onClick={() => requestSort("category")}
                title="Sorteer op categorie"
              >
                <SortableHeader
                  label="Categorie"
                  sortKey="category"
                  sortConfig={sortConfig}
                />
              </div>

              <div
                style={clickableHeaderCellStyle}
                onClick={() => requestSort("mealMoment")}
                title="Sorteer op moment"
              >
                <SortableHeader
                  label="Moment"
                  sortKey="mealMoment"
                  sortConfig={sortConfig}
                />
              </div>

              <div
                style={clickableHeaderCellStyle}
                onClick={() => requestSort("name")}
                title="Sorteer op naam"
              >
                <SortableHeader
                  label="Naam"
                  sortKey="name"
                  sortConfig={sortConfig}
                />
              </div>

              <div
                style={clickableHeaderCellStyle}
                onClick={() => requestSort("portion")}
                title="Sorteer op portie"
              >
                <SortableHeader
                  label="Portie"
                  sortKey="portion"
                  sortConfig={sortConfig}
                  textAlign="left"
                />
              </div>

              <div
                style={clickableHeaderCellStyle}
                onClick={() => requestSort("portionGram")}
                title="Sorteer op gram"
              >
                <SortableHeader
                  label="Gram"
                  sortKey="portionGram"
                  sortConfig={sortConfig}
                  textAlign="left"
                />
              </div>

              <div
                style={clickableHeaderCellStyle}
                onClick={() => requestSort("kh100")}
                title="Sorteer op koolhydraten"
              >
                <SortableHeader
                  label="KH"
                  sortKey="kh100"
                  sortConfig={sortConfig}
                  textAlign="left"
                />
              </div>

              <div
                style={clickableHeaderCellStyle}
                onClick={() => requestSort("protein100")}
                title="Sorteer op eiwit"
              >
                <SortableHeader
                  label="Eiwit"
                  sortKey="protein100"
                  sortConfig={sortConfig}
                  textAlign="left"
                />
              </div>

              <div
                style={clickableHeaderCellStyle}
                onClick={() => requestSort("fat100")}
                title="Sorteer op vet"
              >
                <SortableHeader
                  label="Vet"
                  sortKey="fat100"
                  sortConfig={sortConfig}
                  textAlign="left"
                />
              </div>

              <div
                style={clickableHeaderCellStyle}
                onClick={() => requestSort("kcal100")}
                title="Sorteer op kcal"
              >
                <SortableHeader
                  label="Kcal"
                  sortKey="kcal100"
                  sortConfig={sortConfig}
                  textAlign="left"
                />
              </div>

              <div
                style={clickableHeaderCellStyle}
                onClick={() => requestSort("giClass")}
                title="Sorteer op GI"
              >
                <SortableHeader
                  label="GI"
                  sortKey="giClass"
                  sortConfig={sortConfig}
                  textAlign="left"
                />
              </div>

              <div
                style={clickableHeaderCellStyle}
                onClick={() => requestSort("timing")}
                title="Sorteer op timing"
              >
                <SortableHeader
                  label="Timing"
                  sortKey="timing"
                  sortConfig={sortConfig}
                  textAlign="left"
                />
              </div>

              <div
                style={{
                  ...clickableHeaderCellStyle,
                  borderRight: "none",
                }}
                onClick={() => requestSort("absorptionProfile")}
                title="Sorteer op absorptie"
              >
                <SortableHeader
                  label="Absorptie"
                  sortKey="absorptionProfile"
                  sortConfig={sortConfig}
                  textAlign="left"
                />
              </div>
            </div>

            {packFilteredProducts.map((p) => {
              const rowBg =
                hoveredProductId === p.id
                  ? "rgba(255,255,255,0.68)"
                  : getCategoryColor(categories, p.categoryId);

              const canCopyToCurrentPack =
                activePackFilter === "all" ||
                (activePackFilter !== "__base__" &&
                  p.packName !== activePackFilter);

              return (
                <div
                  key={p.id}
                  onMouseEnter={() => setHoveredProductId(p.id)}
                  onMouseLeave={() => setHoveredProductId(null)}
                  onClick={() => openEditProductModal(p)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: productListGridTemplate,
                    gap: 5,
                    padding: 6,
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    marginBottom: 5,
                    fontSize: 12,
                    alignItems: "stretch",
                    justifyItems: "stretch",
                    background: rowBg,
                    transition: "background 120ms ease, box-shadow 120ms ease",
                    boxShadow:
                      hoveredProductId === p.id
                        ? "0 1px 4px rgba(0,0,0,0.08)"
                        : "none",
                    cursor: "pointer",
                  }}
                  title="Klik om productdetails te openen"
                >
                  <div
                    style={{
                      ...bodyCellStyle,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => toggleFavorite(p.id)}
                      style={{
                        ...buttonStyle,
                        padding: "4px 8px",
                        fontSize: 16,
                        fontWeight: 700,
                        lineHeight: 1,
                        background: "white",
                        border: "1px solid #cbd5e1",
                      }}
                      title={
                        p.favorite ? "Favoriet verwijderen" : "Favoriet maken"
                      }
                    >
                      {p.favorite ? "★" : "☆"}
                    </button>

                    {canCopyToCurrentPack && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyProductToCurrentPack(p);
                        }}
                        style={{
                          ...buttonStyle,
                          padding: "4px 6px",
                          fontSize: 13,
                          minWidth: 26,
                          fontWeight: 700,
                          lineHeight: 1,
                          background: "#eef2ff",
                          border: "1px solid #c7d2fe",
                          color: "#3730a3",
                        }}
                        title="Kopieer naar lijst"
                      >
                        ↪
                      </button>
                    )}
                  </div>

                  <div style={bodyCellStyle}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 6,
                        background: "rgba(255,255,255,0.5)",
                        display: "inline-block",
                      }}
                    >
                      {getCategoryName(categories, p.categoryId)}
                    </div>
                  </div>

                  <div style={bodyCellStyle}>
                    {getMealMomentLabel(p.mealMoment)}
                  </div>

                  <div
                    style={{
                      ...bodyCellStyle,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {p.name}
                  </div>

                  <div style={bodyCellStyle}>{p.portion}</div>
                  <div style={bodyCellStyle}>{p.portionGram} g</div>
                  <div style={bodyCellStyle}>KH/100g {p.kh100}</div>
                  <div style={bodyCellStyle}>E/100g {p.protein100}</div>
                  <div style={bodyCellStyle}>V/100g {p.fat100}</div>
                  <div style={bodyCellStyle}>Kcal/100g {p.kcal100}</div>

                  <div
                    style={bodyCellStyle}
                    title={
                      p.giValue !== "" && p.giValue != null
                        ? `GI ${p.giValue}`
                        : "GI onbekend"
                    }
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 6px",
                        borderRadius: 999,
                        background: getGiClassMeta(p.giClass, giClassOptions)
                          .color,
                      }}
                    >
                      {getGiClassMeta(p.giClass, giClassOptions).label}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      minHeight: 40,
                      width: "100%",
                      boxSizing: "border-box",
                      paddingLeft: 6,
                      lineHeight: 1.2,
                      paddingTop: 8,
                      borderRight: "2px solid rgba(148,163,184,0.5)",
                      paddingRight: 8,
                      overflow: "hidden",
                    }}
                  >
                    {getTimingLabel(
                      p.personalTimingTag || p.timingTag,
                      timingOptions,
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      minHeight: 40,
                      width: "100%",
                      boxSizing: "border-box",
                      paddingLeft: 6,
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 6px",
                        borderRadius: 999,
                        background: getAbsorptionMeta(
                          p.absorptionProfile,
                          absorptionProfileOptions,
                        ).color,
                      }}
                    >
                      {
                        getAbsorptionMeta(
                          p.absorptionProfile,
                          absorptionProfileOptions,
                        ).label
                      }
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {productModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15,23,42,0.45)",
            display: "block",
            zIndex: 20000,
            boxSizing: "border-box",
            overflow: "hidden",
            overscrollBehavior: "contain",
            touchAction: "none",
          }}
        >
          <div
            ref={productModalScrollRef}
            style={{
              width: "100%",
              height: "100%",
              maxHeight: "100%",
              overflowY: "auto",
              overflowX: "hidden",
              boxSizing: "border-box",
              background: modalCategoryColor,
              borderRadius: isMobile ? 0 : 18,
              border: "1px solid #e5e7eb",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              padding: isMobile ? 0 : 18,
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
              touchAction: "pan-y",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "stretch" : "center",
                gap: isMobile ? 6 : 8,
                marginBottom: isMobile ? 6 : 14,
                position: isMobile ? "sticky" : undefined,
                top: isMobile ? 0 : undefined,
                zIndex: isMobile ? 20001 : undefined,
                background: isMobile ? modalCategoryColor : undefined,
                padding: isMobile
                  ? "calc(env(safe-area-inset-top, 0px) + 8px) 8px 8px"
                  : undefined,
                borderBottom: isMobile ? "1px solid #e2e8f0" : undefined,
                boxShadow: isMobile
                  ? "0 2px 10px rgba(15,23,42,0.12)"
                  : undefined,
              }}
            >
              {isMobile && (
                <div style={mobileModalActionBarStyle}>
                  <button
                    onClick={deleteModalProduct}
                    disabled={!editingProductId}
                    style={{
                      ...buttonStyle,
                      ...mobileModalActionButtonStyle,
                      background: editingProductId ? "#fee2e2" : "#fef2f2",
                      border: editingProductId
                        ? "1px solid #fecaca"
                        : "1px solid #fecaca",
                      color: editingProductId ? "#991b1b" : "#b91c1c",
                      cursor: editingProductId ? "pointer" : "not-allowed",
                      opacity: editingProductId ? 1 : 0.65,
                    }}
                  >
                    Verwijderen
                  </button>

                  <button
                    onClick={saveProductModal}
                    style={{
                      ...primaryButtonStyle,
                      ...mobileModalActionButtonStyle,
                      background: "#dcfce7",
                      border: "1px solid #86efac",
                      color: "#14532d",
                    }}
                  >
                    Opslaan
                  </button>

                  <button
                    onClick={cancelProductModal}
                    style={{
                      ...buttonStyle,
                      ...mobileModalActionButtonStyle,
                    }}
                  >
                    Annuleren
                  </button>
                </div>
              )}

              <div style={{ minWidth: 0 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: isMobile ? 16 : undefined,
                    lineHeight: 1.15,
                  }}
                >
                  {newProduct.name
                    ? `Product bewerken: ${newProduct.name}`
                    : "Nieuw product"}
                </h2>
                <div
                  style={{
                    fontSize: 12,
                    color: "#475569",
                    marginTop: 3,
                    display: isMobile ? "none" : undefined,
                  }}
                >
                  Alle productgegevens overzichtelijk op één plek.
                </div>
              </div>

              {!isMobile && (
                <button
                  onClick={closeProductModal}
                  style={{
                    ...buttonStyle,
                    flexShrink: 0,
                  }}
                >
                  Sluiten
                </button>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gap: modalStackGap,
                padding: isMobile ? "0 6px 10px" : undefined,
              }}
            >
              <div style={modalCardStyle}>
                <h3 style={modalHeadingStyle}>Basis</h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "minmax(0, 1fr) minmax(0, 1fr)"
                      : "1.4fr 1fr 1fr 1fr 0.9fr 1fr",
                    gap: modalGridGap,
                  }}
                >
                  <div style={{ gridColumn: isMobile ? "1 / -1" : undefined }}>
                    <label style={modalLabelStyle}>Naam</label>
                    <input
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                    />
                  </div>

                  <div style={{ gridColumn: isMobile ? "1 / -1" : undefined }}>
                    <label style={modalLabelStyle}>Merk / producent</label>
                    <input
                      value={newProduct.brand || ""}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          brand: e.target.value,
                        })
                      }
                      style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                      placeholder="bijv. Calvé, Lidl, AH, MyProtein"
                    />
                  </div>

                  <div style={{ gridColumn: isMobile ? "1 / -1" : undefined }}>
                    <label style={modalLabelStyle}>Categorie</label>
                    <select
                      value={newProduct.categoryId}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          categoryId: e.target.value,
                        })
                      }
                      style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                    >
                      {manageableCategories
                        .concat(
                          categories.find((c) => c.id === "cat-overig") || [],
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div style={modalFieldStyle}>
                    <label style={modalLabelStyle}>Portie naam</label>
                    <input
                      value={newProduct.portion}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          portion: e.target.value,
                        })
                      }
                      style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                    />
                  </div>

                  <div style={modalFieldStyle}>
                    <label style={modalLabelStyle}>Portie gram</label>
                    <CompanionNumberInput
                      value={newProduct.portionGram}
                      onChange={(e) => {
                        const value = normalizeDecimalInput(e.target.value);
                        if (value === null) return;
                        setNewProduct({
                          ...newProduct,
                          portionGram: value,
                        });
                      }}
                      style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                    />
                  </div>

                  <div style={modalFieldStyle}>
                    <label style={modalLabelStyle}>Moment</label>
                    <select
                      value={newProduct.mealMoment || "neutral"}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          mealMoment: e.target.value,
                        })
                      }
                      style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                    >
                      {MEAL_MOMENTS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isMobile && (
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 8px",
                        border: "1px solid #cbd5e1",
                        borderRadius: 8,
                        background: "#f8fafc",
                        cursor: "pointer",
                        fontSize: 12,
                        lineHeight: 1.15,
                        maxWidth: "100%",
                        minWidth: 0,
                        minHeight: 36,
                        boxSizing: "border-box",
                        alignSelf: "end",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!newProduct.favorite}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            favorite: e.target.checked,
                          })
                        }
                        style={{ fontSize: 16 }}
                      />
                      <span>
                        {newProduct.favorite ? "Favoriet" : "Geen favoriet"}
                      </span>
                    </label>
                  )}
                </div>

                {!isMobile && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 12,
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: 12,
                      background: "#f8fafc",
                      cursor: "pointer",
                      fontSize: 14,
                      maxWidth: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!newProduct.favorite}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          favorite: e.target.checked,
                        })
                      }
                    />
                    <span>
                      {newProduct.favorite ? "Favoriet" : "Geen favoriet"}
                    </span>
                  </label>
                )}
              </div>

              <div style={modalCardStyle}>
                <h3 style={modalHeadingStyle}>
                  Voedingswaarden
                </h3>

                {/* Bron / herkomst van voedingsgegevens */}
                <div ref={sourceDetailsRef} style={modalCardStyle}>
                  {isMobile ? (
                    <button
                      type="button"
                      onClick={toggleMobileSourceDetails}
                      style={mobileCollapseButtonStyle}
                    >
                      <span>Bron / herkomst</span>
                      <span>{showMobileSourceDetails ? "▲" : "▼"}</span>
                    </button>
                  ) : (
                    <h3 style={modalHeadingStyle}>Bron / herkomst</h3>
                  )}

                  {(!isMobile || showMobileSourceDetails) && (
                    <>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          marginBottom: isMobile ? 6 : 10,
                          display: isMobile ? "none" : undefined,
                        }}
                      >
                        Leg vast waar je voedingswaarden of GI-inschatting vandaan
                        komen. Handig voor controle, latere correcties en
                        betrouwbare productlijsten.
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isMobile
                            ? "minmax(0, 1fr)"
                            : "1fr 1.4fr 1.4fr",
                          gap: modalGridGap,
                        }}
                      >
                        <div style={modalFieldStyle}>
                          <label style={modalLabelStyle}>Bron</label>
                          <input
                            value={newProduct.sourceName || ""}
                            onChange={(e) =>
                              setNewProduct({
                                ...newProduct,
                                sourceName: e.target.value,
                              })
                            }
                            style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                            placeholder="bijv. etiket, Open Food Facts, USDA"
                          />
                        </div>

                        <div style={modalFieldStyle}>
                          <label style={modalLabelStyle}>Bronlink</label>
                          <input
                            value={newProduct.sourceUrl || ""}
                            onChange={(e) =>
                              setNewProduct({
                                ...newProduct,
                                sourceUrl: e.target.value,
                              })
                            }
                            style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                            placeholder="https://..."
                          />
                        </div>

                        <div style={modalFieldStyle}>
                          <label style={modalLabelStyle}>Bronnotitie</label>
                          <input
                            value={newProduct.sourceNotes || ""}
                            onChange={(e) =>
                              setNewProduct({
                                ...newProduct,
                                sourceNotes: e.target.value,
                              })
                            }
                            style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                            placeholder="bijv. GI geschat op vergelijkbaar product"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    marginBottom: isMobile ? 6 : 8,
                    display: isMobile ? "none" : undefined,
                  }}
                >
                  Kies of je invoert per 100 g of per portie. Bij omschakelen
                  worden de waarden automatisch omgerekend.
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: isMobile ? 6 : 14,
                  }}
                >
                  <div>
                    <label style={modalLabelStyle}>Invoer</label>
                    <select
                      value={newProduct.inputMode}
                      onChange={(e) => {
                        const nextMode = e.target.value;
                        const portionGram =
                          Number(
                            String(newProduct.portionGram).replace(",", "."),
                          ) || 0;

                        if (nextMode === newProduct.inputMode) return;

                        if (portionGram <= 0) {
                          setNewProduct({
                            ...newProduct,
                            inputMode: nextMode,
                          });
                          return;
                        }

                        const kh =
                          Number(
                            String(newProduct.khInput).replace(",", "."),
                          ) || 0;
                        const protein =
                          Number(
                            String(newProduct.proteinInput).replace(",", "."),
                          ) || 0;
                        const fat =
                          Number(
                            String(newProduct.fatInput).replace(",", "."),
                          ) || 0;
                        const kcal =
                          Number(
                            String(newProduct.kcalInput).replace(",", "."),
                          ) || 0;

                        if (nextMode === "perPortion") {
                          setNewProduct({
                            ...newProduct,
                            inputMode: nextMode,
                            khInput: String(
                              convertPer100ToPerPortion(kh, portionGram),
                            ),
                            proteinInput: String(
                              convertPer100ToPerPortion(protein, portionGram),
                            ),
                            fatInput: String(
                              convertPer100ToPerPortion(fat, portionGram),
                            ),
                            kcalInput: String(
                              convertPer100ToPerPortion(kcal, portionGram),
                            ),
                          });
                        } else {
                          setNewProduct({
                            ...newProduct,
                            inputMode: nextMode,
                            khInput: String(
                              convertPerPortionToPer100(kh, portionGram),
                            ),
                            proteinInput: String(
                              convertPerPortionToPer100(protein, portionGram),
                            ),
                            fatInput: String(
                              convertPerPortionToPer100(fat, portionGram),
                            ),
                            kcalInput: String(
                              convertPerPortionToPer100(kcal, portionGram),
                            ),
                          });
                        }
                      }}
                      style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                    >
                      <option value="per100">Per 100 g</option>
                      <option value="perPortion">Per portie</option>
                    </select>
                  </div>

                  {/* Macro's */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "minmax(0, 1fr) minmax(0, 1fr)"
                        : "repeat(4, 1fr)",
                      gap: modalGridGap,
                    }}
                  >
                    <div>
                      <label style={modalLabelStyle}>
                        {newProduct.inputMode === "per100"
                          ? "KH / 100 g"
                          : "KH / portie"}
                      </label>
                      <CompanionNumberInput
                        value={newProduct.khInput}
                        onChange={(e) => {
                          const value = normalizeDecimalInput(e.target.value);
                          if (value === null) return;
                          setNewProduct({
                            ...newProduct,
                            khInput: value,
                          });
                        }}
                        style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                      />
                    </div>

                    <div>
                      <label style={modalLabelStyle}>
                        {newProduct.inputMode === "per100"
                          ? "Eiwit / 100 g"
                          : "Eiwit / portie"}
                      </label>
                      <CompanionNumberInput
                        value={newProduct.proteinInput}
                        onChange={(e) => {
                          const value = normalizeDecimalInput(e.target.value);
                          if (value === null) return;
                          setNewProduct({
                            ...newProduct,
                            proteinInput: value,
                          });
                        }}
                        style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                      />
                    </div>

                    <div>
                      <label style={modalLabelStyle}>
                        {newProduct.inputMode === "per100"
                          ? "Vet / 100 g"
                          : "Vet / portie"}
                      </label>
                      <CompanionNumberInput
                        value={newProduct.fatInput}
                        onChange={(e) => {
                          const value = normalizeDecimalInput(e.target.value);
                          if (value === null) return;
                          setNewProduct({
                            ...newProduct,
                            fatInput: value,
                          });
                        }}
                        style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                      />
                    </div>

                    <div>
                      <label style={modalLabelStyle}>
                        {newProduct.inputMode === "per100"
                          ? "Kcal / 100 g"
                          : "Kcal / portie"}
                      </label>
                      <CompanionNumberInput
                        value={newProduct.kcalInput}
                        onChange={(e) => {
                          const value = normalizeDecimalInput(e.target.value);
                          if (value === null) return;
                          setNewProduct({
                            ...newProduct,
                            kcalInput: value,
                          });
                        }}
                        style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                      />
                    </div>
                  </div>

                  {/* Vezels en zout */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "minmax(0, 1fr) minmax(0, 1fr)"
                        : "1fr 1fr",
                      gap: modalGridGap,
                    }}
                  >
                    <div>
                      <label style={modalLabelStyle}>
                        {newProduct.inputMode === "per100"
                          ? "Vezels / 100 g"
                          : "Vezels / portie"}
                      </label>
                      <CompanionNumberInput
                        value={newProduct.fiberInput || ""}
                        onChange={(e) => {
                          const value = normalizeDecimalInput(e.target.value);
                          if (value === null) return;
                          setNewProduct({
                            ...newProduct,
                            fiberInput: value,
                          });
                        }}
                        style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                      />
                    </div>

                    <div>
                      <label style={modalLabelStyle}>
                        {newProduct.inputMode === "per100"
                          ? "Zout / 100 g"
                          : "Zout / portie"}
                      </label>
                      <CompanionNumberInput
                        value={newProduct.saltInput || ""}
                        onChange={(e) => {
                          const value = normalizeDecimalInput(e.target.value);
                          if (value === null) return;
                          setNewProduct({
                            ...newProduct,
                            saltInput: value,
                          });
                        }}
                        style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "1fr 1fr",
                  gap: modalStackGap,
                }}
              >
                <div ref={giDetailsRef} style={modalCardStyle}>
                  {isMobile ? (
                    <button
                      type="button"
                      onClick={toggleMobileGiDetails}
                      style={mobileCollapseButtonStyle}
                    >
                      <span>GI</span>
                      <span>{showMobileGiDetails ? "▲" : "▼"}</span>
                    </button>
                  ) : (
                    <h3 style={modalHeadingStyle}>GI</h3>
                  )}

                  {(!isMobile || showMobileGiDetails) && (
                    <div
                      style={{
                        display: "grid",
                        gap: modalGridGap,
                          marginTop: isMobile ? 4 : 0,
                      }}
                    >
                      <div style={modalFieldStyle}>
                        <label style={modalLabelStyle}>GI-klasse</label>
                        <select
                          value={newProduct.giClass}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              giClass: e.target.value,
                            })
                          }
                          style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                        >
                          {giClassOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={modalFieldStyle}>
                        <label style={modalLabelStyle}>GI-waarde</label>
                        <CompanionNumberInput
                          decimal={false}
                          value={newProduct.giValue}
                          onChange={(e) => {
                            if (!/^\d*$/.test(e.target.value)) return;
                            setNewProduct({
                              ...newProduct,
                              giValue: e.target.value,
                            });
                          }}
                          style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                        />
                      </div>

                      <div style={modalFieldStyle}>
                        <label style={modalLabelStyle}>GI-notitie</label>
                        <input
                          value={newProduct.giNotes}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              giNotes: e.target.value,
                            })
                          }
                          style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                        />
                      </div>
                      <div style={{ display: "grid", gap: 4, ...modalFieldStyle }}>
                        <label
                          style={{
                            ...modalLabelStyle,
                            display: "block",
                            alignSelf: "start",
                          }}
                        >
                          GI-bronnotitie
                        </label>

                        <textarea
                          value={newProduct.giSourceNotes || ""}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              giSourceNotes: e.target.value,
                            })
                          }
                          style={{
                            ...modalInputStyle,
                            fontSize: isMobile ? 16 : modalInputStyle.fontSize,
                            minHeight: isMobile ? 48 : 70,
                            resize: "vertical",
                            lineHeight: 1.35,
                          }}
                          placeholder="Bijv. gevonden via Sydney GI Database; vergelijkbaar product gebruikt"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div ref={timingDetailsRef} style={modalCardStyle}>
                  {isMobile ? (
                    <button
                      type="button"
                      onClick={toggleMobileTimingDetails}
                      style={mobileCollapseButtonStyle}
                    >
                      <span>Timing</span>
                      <span>{showMobileTimingDetails ? "▲" : "▼"}</span>
                    </button>
                  ) : (
                    <h3 style={modalHeadingStyle}>Timing</h3>
                  )}

                  {(!isMobile || showMobileTimingDetails) && (
                    <div
                      style={{
                        display: "grid",
                        gap: modalGridGap,
                        marginTop: isMobile ? 4 : 0,
                      }}
                    >
                      <div style={modalFieldStyle}>
                        <label style={modalLabelStyle}>Standaard timing</label>
                        <select
                          value={newProduct.timingTag}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              timingTag: e.target.value,
                            })
                          }
                          style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                        >
                          {timingOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={modalFieldStyle}>
                        <label style={modalLabelStyle}>Persoonlijke timing</label>
                        <select
                          value={
                            newProduct.personalTimingTag || newProduct.timingTag
                          }
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              personalTimingTag: e.target.value,
                            })
                          }
                          style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                        >
                          {timingOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={modalFieldStyle}>
                        <label style={modalLabelStyle}>Opnameprofiel</label>
                        <select
                          value={newProduct.absorptionProfile || "steady"}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              absorptionProfile: e.target.value,
                            })
                          }
                          style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                        >
                          {absorptionProfileOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={modalFieldStyle}>
                        <label style={modalLabelStyle}>
                          Persoonlijke timingnotitie
                        </label>
                        <input
                          value={newProduct.personalTimingNotes || ""}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              personalTimingNotes: e.target.value,
                            })
                          }
                          style={{ ...modalInputStyle, fontSize: isMobile ? 16 : modalInputStyle.fontSize }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {!isMobile && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                <div>
                  <button
                    onClick={() => {
                      if (
                        !window.confirm(
                          `Product "${newProduct.name || "dit product"}" verwijderen?`,
                        )
                      ) {
                        return;
                      }

                      deleteProduct(editingProductId);
                      closeProductModal();
                      resetNewProductForm();
                    }}
                    disabled={!editingProductId}
                    style={{
                      ...buttonStyle,
                      background: editingProductId ? "#fee2e2" : "#f8fafc",
                      border: editingProductId
                        ? "1px solid #fecaca"
                        : "1px solid #e5e7eb",
                      color: editingProductId ? "#991b1b" : "#94a3b8",
                      cursor: editingProductId ? "pointer" : "not-allowed",
                    }}
                  >
                    Verwijderen
                  </button>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      resetNewProductForm();
                      closeProductModal();
                    }}
                    style={buttonStyle}
                  >
                    Annuleren
                  </button>

                  <button
                    onClick={() => {
                      addProduct();
                      closeProductModal();
                    }}
                    style={primaryButtonStyle}
                  >
                    Opslaan product
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
