import React from "react";
import { CompanionNumberInput } from "../ui/inputs/CompanionInput";

export function GiTimingTab({
  categories,
  giSearch,
  setGiSearch,
  giFilteredProducts,
  rowsWithCalc,
  totals,
  updateProductGi,
  getCategoryColor,
  getCategoryName,
  getGiClassMeta,
  getTimingLabel,
  giClassOptions,
  timingOptions,
  inputStyle,
  labelStyle,
  buttonStyle,
  cardStyle,
  round2,
}) {
  return (
    <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>GI / Timing</h2>
        <p style={{ marginTop: 0, color: "#475569" }}>
          Dit tabblad is een praktische geheugensteun. De timing is een
          persoonlijke richtlijn, geen automatisch medisch doseeradvies.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1fr",
            gap: 12,
          }}
        >
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Maaltijd GI-profiel
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              {totals.mealGiLabel}
            </div>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Algemeen advies
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              {totals.timingAdvice}
            </div>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Persoonlijk advies
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              {totals.personalTimingAdvice}
            </div>
          </div>
        </div>

        <div
          style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 999,
              background: totals.timingDiffers ? "#fee2e2" : "#dcfce7",
              border: totals.timingDiffers
                ? "1px solid #fecaca"
                : "1px solid #86efac",
              color: totals.timingDiffers ? "#991b1b" : "#166534",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {totals.timingDiffers
              ? "Persoonlijk profiel wijkt af"
              : "Persoonlijk profiel sluit aan"}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", alignSelf: "center" }}>
            Persoonlijk gewogen timing:{" "}
            <strong>{totals.personalWeightedMinutes}</strong> min
          </div>
        </div>

        {rowsWithCalc.some((r) => r.product) && (
          <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 700 }}>
              Huidige maaltijd — GI per regel
            </div>
            {rowsWithCalc
              .filter((r) => r.product)
              .map((r) => {
                const productDiffers =
                  (r.product.personalTimingTag || r.product.timingTag) !==
                  (r.product.timingTag || "meal");
                return (
                  <div
                    key={r.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.4fr 0.75fr 1fr 1fr 0.9fr",
                      gap: 8,
                      padding: 10,
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      background: getCategoryColor(
                        categories,
                        r.product.categoryId,
                      ),
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.product.name}</div>
                      <div style={{ fontSize: 12, color: "#475569" }}>
                        {round2(r.kh)} g KH in deze regel
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>GI</div>
                      <div style={{ fontWeight: 700 }}>
                        {
                          getGiClassMeta(r.product.giClass, giClassOptions)
                            .label
                        }
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Standaard
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {getTimingLabel(r.product.timingTag, timingOptions)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Persoonlijk
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {getTimingLabel(
                          r.product.personalTimingTag || r.product.timingTag,
                          timingOptions,
                        )}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Afwijking
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: productDiffers ? "#b91c1c" : "#166534",
                        }}
                      >
                        {productDiffers ? "Ja" : "Nee"}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr auto",
            gap: 8,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <input
            value={giSearch}
            onChange={(e) => setGiSearch(e.target.value)}
            placeholder="Zoek product voor GI / timing"
            style={inputStyle}
          />
          <button onClick={() => setGiSearch("")} style={buttonStyle}>
            Wis zoekveld
          </button>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {giFilteredProducts.map((p) => {
            const differs =
              (p.personalTimingTag || p.timingTag) !== (p.timingTag || "meal");
            return (
              <div
                key={p.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 12,
                  background: getCategoryColor(categories, p.categoryId),
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 10,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#475569" }}>
                      {getCategoryName(categories, p.categoryId)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: differs ? "#fee2e2" : "#dcfce7",
                      border: differs
                        ? "1px solid #fecaca"
                        : "1px solid #86efac",
                      color: differs ? "#991b1b" : "#166534",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {differs
                      ? "Persoonlijk wijkt af"
                      : "Persoonlijk = standaard"}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 0.85fr 1fr 1fr",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <label style={labelStyle}>GI-klasse</label>
                    <select
                      value={p.giClass || "unknown"}
                      onChange={(e) =>
                        updateProductGi(p.id, { giClass: e.target.value })
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
                    <CompanionNumberInput
                      decimal={false}
                      value={p.giValue ?? ""}
                      onChange={(e) =>
                        updateProductGi(p.id, { giValue: e.target.value })
                      }
                      style={inputStyle}
                      placeholder="bijv. 55"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Standaard timing</label>
                    <select
                      value={p.timingTag || "meal"}
                      onChange={(e) =>
                        updateProductGi(p.id, { timingTag: e.target.value })
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
                    <label style={labelStyle}>Persoonlijk timingprofiel</label>
                    <select
                      value={p.personalTimingTag || p.timingTag || "meal"}
                      onChange={(e) =>
                        updateProductGi(p.id, {
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
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginTop: 10,
                  }}
                >
                  <div>
                    <label style={labelStyle}>GI-notitie</label>
                    <input
                      value={p.giNotes || ""}
                      onChange={(e) =>
                        updateProductGi(p.id, { giNotes: e.target.value })
                      }
                      style={inputStyle}
                      placeholder="bij mij piekt dit snel / met yoghurt rustiger / etc."
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Persoonlijke timingnotitie</label>
                    <input
                      value={p.personalTimingNotes || ""}
                      onChange={(e) =>
                        updateProductGi(p.id, {
                          personalTimingNotes: e.target.value,
                        })
                      }
                      style={inputStyle}
                      placeholder="bij mij werkt dit sneller of trager dan gemiddeld"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
