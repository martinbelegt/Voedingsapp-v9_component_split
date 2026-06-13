import React from "react";

export default function SupplementPlanner() {
  const supplementPlans = [
    {
      id: "1",
      time: "09:00",
      name: "Creatine",
      dosage: "5 gram",
      note: "met natrium",
    },
    {
      id: "2",
      time: "09:00",
      name: "Vitamine D",
      dosage: "75 mcg",
      note: "bij vetrijke maaltijd",
    },
    {
      id: "3",
      time: "22:00",
      name: "Magnesium",
      dosage: "1 capsule",
      note: "avondroutine",
    },
  ];

  return (
    <div
      style={{
        padding: 10,
        borderRadius: 10,
        background: "#f5f3ff",
        border: "1px solid #c4b5fd",
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 6 }}>
        💊 Supplementplanner
      </div>

      <div style={{ display: "grid", gap: 5 }}>
        {supplementPlans.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              background: "#ffffff",
              border: "1px solid #ddd6fe",
              fontSize: 13,
            }}
          >
            <strong>{item.time}</strong> — {item.name} · {item.dosage}
            {item.note ? (
              <div style={{ color: "#64748b", marginTop: 2 }}>{item.note}</div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
