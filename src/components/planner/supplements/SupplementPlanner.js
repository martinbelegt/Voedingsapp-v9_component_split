import React, { useState } from "react";

export default function SupplementPlanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [newTime, setNewTime] = useState("09:00");
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newNote, setNewNote] = useState("");

  const [supplementPlans, setSupplementPlans] = useState([
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
  ]);

  function addSupplementPlan() {
    if (!newName.trim()) return;

    setSupplementPlans((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        time: newTime,
        name: newName,
        dosage: newDosage,
        note: newNote,
      },
    ]);

    setNewName("");
    setNewDosage("");
    setNewNote("");
    setShowForm(false);
  }

  function deleteSupplementPlan(id) {
    setSupplementPlans((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div
      style={{
        padding: 10,
        borderRadius: 10,
        background: "#f5f3ff",
        border: "1px solid #c4b5fd",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isOpen ? 6 : 0,
        }}
      >
        <button
          onClick={() => setIsOpen((v) => !v)}
          style={{
            border: "none",
            background: "transparent",
            color: "#5b21b6",
            fontWeight: 900,
            padding: 0,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          💊 Supplementplanner {isOpen ? "▲" : "▼"}
        </button>

        {isOpen && (
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{
              padding: "2px 10px",
              borderRadius: 999,
              border: "1px solid #c4b5fd",
              background: "#ffffff",
              color: "#5b21b6",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            +
          </button>
        )}
      </div>

      {isOpen && (
        <>
          {showForm && (
            <div
              style={{
                display: "grid",
                gap: 6,
                marginBottom: 10,
                padding: 8,
                background: "#ffffff",
                borderRadius: 8,
                border: "1px solid #ddd6fe",
              }}
            >
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />

              <input
                placeholder="Supplement"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />

              <input
                placeholder="Dosering"
                value={newDosage}
                onChange={(e) => setNewDosage(e.target.value)}
              />

              <input
                placeholder="Notitie"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />

              <button onClick={addSupplementPlan}>Opslaan</button>
            </div>
          )}

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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div>
                    <strong>{item.time}</strong> — {item.name} · {item.dosage}
                  </div>

                  <button
                    onClick={() => deleteSupplementPlan(item.id)}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    🗑️
                  </button>
                </div>

                {item.note ? (
                  <div
                    style={{
                      color: "#64748b",
                      marginTop: 2,
                    }}
                  >
                    {item.note}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
