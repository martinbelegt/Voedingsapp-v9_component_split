import React, { useState } from "react";
import { intakeCategories, starterIntakeItems } from "./intakeLibraryModel";
import IntakeLibraryModal from "./IntakeLibraryModal";

export default function IntakeLibrary() {
  const [items, setItems] = useState(starterIntakeItems);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        padding: 10,
        borderRadius: 12,
        border: "1px solid #cbd5e1",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isOpen ? 10 : 0,
        }}
      >
        <button
          onClick={() => setIsOpen((v) => !v)}
          style={{
            border: "none",
            background: "transparent",
            fontWeight: 900,
            fontSize: 18,
            cursor: "pointer",
            padding: 0,
          }}
        >
          📚 Innamebibliotheek {isOpen ? "▲" : "▼"}
        </button>

        {isOpen && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "2px 10px",
              borderRadius: 999,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
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
          {intakeCategories.map((category) => {
            const categoryItems = items.filter(
              (item) => item.category === category.id,
            );

            return (
              <div
                key={category.id}
                style={{
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    marginBottom: 6,
                  }}
                >
                  {category.icon} {category.label}
                </div>

                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "6px 8px",
                      marginBottom: 4,
                      borderRadius: 8,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
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
                        <div>
                          <strong>{item.name}</strong>
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            color: "#64748b",
                          }}
                        >
                          {item.defaultDosage}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(item);
                            setShowModal(true);
                          }}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: 16,
                            padding: 4,
                          }}
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setItems((prev) =>
                              prev.filter((x) => x.id !== item.id),
                            );
                          }}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: 16,
                            padding: 4,
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </>
      )}

      <IntakeLibraryModal
        open={showModal}
        editingItem={editingItem}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
        onSave={(savedItem) => {
          if (editingItem) {
            setItems((prev) =>
              prev.map((item) => (item.id === savedItem.id ? savedItem : item)),
            );
          } else {
            setItems((prev) => [...prev, savedItem]);
          }

          setEditingItem(null);
        }}
      />
    </div>
  );
}
