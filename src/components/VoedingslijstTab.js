import React, { useState, useEffect } from "react";
import SortableHeader from "./SortableHeader";

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

  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    try {
      localStorage.setItem(
        "dc_show_category_manager_v1",
        String(showCategoryManager),
      );
    } catch {}
  }, [showCategoryManager]);

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
        <button
          onClick={() => setShowCategoryManager((v) => !v)}
          style={{
            ...buttonStyle,
            width: "100%",
            textAlign: "left",
            display: "flex",
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
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div style={sectionBadgeStyle}>Voedingslijsten</div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <select
              value={activePackFilter}
              onChange={(e) => setActivePackFilter(e.target.value)}
              style={{
                ...inputStyle,
                width: 140,
                minWidth: 140,
                padding: "6px 8px",
                fontSize: 13,
              }}
            >
              {packFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {activePackNames.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {activePackNames.map((name) => {
                  const isActive = activePackFilter === name;

                  return (
                    <button
                      key={name}
                      onClick={() => setActivePackFilter(name)}
                      style={{
                        ...buttonStyle,
                        padding: "4px 9px",
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

            <button
              onClick={createNewPackList}
              style={{
                ...buttonStyle,
                padding: "8px 12px",
                fontSize: 13,
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
              style={buttonStyle}
            >
              Productlijst importeren
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
                padding: "8px 12px",
                fontSize: 13,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1d4ed8",
              }}
            >
              Exporteer huidige lijst
            </button>

            <button
              onClick={deleteCurrentPackList}
              style={{
                ...buttonStyle,
                padding: "8px 12px",
                fontSize: 13,
                background: activePackFilter === "all" ? "#f8fafc" : "#fee2e2",
                border:
                  activePackFilter === "all"
                    ? "1px solid #e5e7eb"
                    : "1px solid #fecaca",
                color: activePackFilter === "all" ? "#94a3b8" : "#991b1b",
                cursor: activePackFilter === "all" ? "not-allowed" : "pointer",
              }}
              disabled={activePackFilter === "all"}
            >
              Verwijder huidige lijst
            </button>
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            padding: 12,
            marginBottom: 12,
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "auto 1fr auto",
              gap: 8,
              alignItems: "center",
            }}
          >
            <button onClick={openNewProductModal} style={primaryButtonStyle}>
              Nieuw product
            </button>

            <input
              placeholder="Zoek product of categorie"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              style={inputStyle}
            />

            <button onClick={() => setProductSearch("")} style={buttonStyle}>
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
            fontSize: 12,
            marginBottom: 10,
            padding: "8px 10px",
            borderRadius: 10,
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1e3a8a",
          }}
        >
          Klik op een hele rij om het detailvenster te openen. Daar beheer je
          basisgegevens, voedingswaarden, GI, timing, opnameprofiel (PPP) en
          verwijderen op één plek.
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
          <div style={{ display: "grid", gap: 8 }}>
            {packFilteredProducts.map((p) => {
              const bg = getCategoryColor(categories, p.categoryId);

              return (
                <div
                  key={p.id}
                  onClick={() => openEditProductModal(p)}
                  style={{
                    background: bg,
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 10,
                    display: "grid",
                    gap: 6,
                    cursor: "pointer",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 15,
                        color: "#0f172a",
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
                        padding: "3px 7px",
                        fontSize: 16,
                        lineHeight: 1,
                        background: "white",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      {p.favorite ? "★" : "☆"}
                    </button>
                  </div>

                  <div
                    style={{ fontSize: 12, color: "#334155", fontWeight: 700 }}
                  >
                    {getCategoryName(categories, p.categoryId)} ·{" "}
                    {getMealMomentLabel(p.mealMoment)}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      fontSize: 12,
                      color: "#0f172a",
                    }}
                  >
                    <span>KH {p.kh100}/100g</span>
                    <span>Eiwit {p.protein100}/100g</span>
                    <span>Vet {p.fat100}/100g</span>
                    <span>{p.kcal100} kcal</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      fontSize: 11,
                      color: "#334155",
                    }}
                  >
                    <span>{p.portion || "portie"}</span>
                    <span>{p.portionGram}g</span>
                    <span>
                      GI {getGiClassMeta(p.giClass, giClassOptions).label}
                    </span>
                    <span>
                      {getTimingLabel(
                        p.personalTimingTag || p.timingTag,
                        timingOptions,
                      )}
                    </span>
                    <span>
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
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              width: isMobile ? "98vw" : "min(980px, 96vw)",
              maxHeight: "92vh",
              overflowY: "auto",
              background: modalCategoryColor,
              borderRadius: 18,
              border: "1px solid #e5e7eb",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              padding: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  {newProduct.name
                    ? `Product bewerken: ${newProduct.name}`
                    : "Nieuw product"}
                </h2>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                  Alle productgegevens overzichtelijk op één plek.
                </div>
              </div>

              <button onClick={closeProductModal} style={buttonStyle}>
                Sluiten
              </button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ ...cardStyle, padding: 14 }}>
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>Basis</h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : "1.4fr 1fr 1fr 0.9fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <label style={labelStyle}>Naam</label>
                    <input
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Categorie</label>
                    <select
                      value={newProduct.categoryId}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          categoryId: e.target.value,
                        })
                      }
                      style={inputStyle}
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

                  <div>
                    <label style={labelStyle}>Portie naam</label>
                    <input
                      value={newProduct.portion}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          portion: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Portie gram</label>
                    <input
                      value={newProduct.portionGram}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          portionGram: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Moment</label>
                    <select
                      value={newProduct.mealMoment || "neutral"}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          mealMoment: e.target.value,
                        })
                      }
                      style={inputStyle}
                    >
                      {MEAL_MOMENTS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ ...cardStyle, padding: 14 }}>
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>
                  Voedingswaarden
                </h3>

                {/* Bron / herkomst van voedingsgegevens */}
                <div style={{ ...cardStyle, padding: 14 }}>
                  <h3 style={{ marginTop: 0, marginBottom: 12 }}>
                    Bron / herkomst
                  </h3>

                  <div
                    style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}
                  >
                    Leg vast waar je voedingswaarden of GI-inschatting vandaan
                    komen. Handig voor controle, latere correcties en
                    betrouwbare productlijsten.
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1.4fr 1.4fr",
                      gap: 10,
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Bron</label>
                      <input
                        value={newProduct.sourceName || ""}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            sourceName: e.target.value,
                          })
                        }
                        style={inputStyle}
                        placeholder="bijv. etiket, Open Food Facts, USDA"
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Bronlink</label>
                      <input
                        value={newProduct.sourceUrl || ""}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            sourceUrl: e.target.value,
                          })
                        }
                        style={inputStyle}
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Bronnotitie</label>
                      <input
                        value={newProduct.sourceNotes || ""}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            sourceNotes: e.target.value,
                          })
                        }
                        style={inputStyle}
                        placeholder="bijv. GI geschat op vergelijkbaar product"
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}
                >
                  Kies of je invoert per 100 g of per portie. Bij omschakelen
                  worden de waarden automatisch omgerekend.
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 14,
                  }}
                >
                  <div>
                    <label style={labelStyle}>Invoer</label>
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
                      style={inputStyle}
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
                        ? "1fr 1fr"
                        : "repeat(4, 1fr)",
                      gap: 10,
                    }}
                  >
                    <div>
                      <label style={labelStyle}>
                        {newProduct.inputMode === "per100"
                          ? "KH / 100 g"
                          : "KH / portie"}
                      </label>
                      <input
                        value={newProduct.khInput}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            khInput: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>
                        {newProduct.inputMode === "per100"
                          ? "Eiwit / 100 g"
                          : "Eiwit / portie"}
                      </label>
                      <input
                        value={newProduct.proteinInput}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            proteinInput: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>
                        {newProduct.inputMode === "per100"
                          ? "Vet / 100 g"
                          : "Vet / portie"}
                      </label>
                      <input
                        value={newProduct.fatInput}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            fatInput: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>
                        {newProduct.inputMode === "per100"
                          ? "Kcal / 100 g"
                          : "Kcal / portie"}
                      </label>
                      <input
                        value={newProduct.kcalInput}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            kcalInput: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Vezels en zout */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div>
                      <label style={labelStyle}>
                        {newProduct.inputMode === "per100"
                          ? "Vezels / 100 g"
                          : "Vezels / portie"}
                      </label>
                      <input
                        value={newProduct.fiberInput || ""}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            fiberInput: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>
                        {newProduct.inputMode === "per100"
                          ? "Zout / 100 g"
                          : "Zout / portie"}
                      </label>
                      <input
                        value={newProduct.saltInput || ""}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            saltInput: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 16,
                }}
              >
                <div style={{ ...cardStyle, padding: 14 }}>
                  <h3 style={{ marginTop: 0, marginBottom: 12 }}>GI</h3>

                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <label style={labelStyle}>GI-klasse</label>
                      <select
                        value={newProduct.giClass}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            giClass: e.target.value,
                          })
                        }
                        style={inputStyle}
                      >
                        {giClassOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>GI-waarde</label>
                      <input
                        value={newProduct.giValue}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            giValue: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>GI-notitie</label>
                      <input
                        value={newProduct.giNotes}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            giNotes: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ display: "grid", gap: 4 }}>
                      <label
                        style={{
                          ...labelStyle,
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
                          ...inputStyle,
                          minHeight: 70,
                          resize: "vertical",
                          lineHeight: 1.35,
                        }}
                        placeholder="Bijv. gevonden via Sydney GI Database; vergelijkbaar product gebruikt"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ ...cardStyle, padding: 14 }}>
                  <h3 style={{ marginTop: 0, marginBottom: 12 }}>Timing</h3>

                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <label style={labelStyle}>Standaard timing</label>
                      <select
                        value={newProduct.timingTag}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            timingTag: e.target.value,
                          })
                        }
                        style={inputStyle}
                      >
                        {timingOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Persoonlijke timing</label>
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
                        style={inputStyle}
                      >
                        {timingOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Opnameprofiel</label>
                      <select
                        value={newProduct.absorptionProfile || "steady"}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            absorptionProfile: e.target.value,
                          })
                        }
                        style={inputStyle}
                      >
                        {absorptionProfileOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>
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
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ ...cardStyle, padding: 14 }}>
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>Extra</h3>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 12,
                    background: "#f8fafc",
                    cursor: "pointer",
                    fontSize: 14,
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
              </div>
            </div>

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
                        `Product "${
                          newProduct.name || "dit product"
                        }" verwijderen?`,
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
          </div>
        </div>
      )}
    </div>
  );
}
