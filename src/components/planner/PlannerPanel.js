import React from "react";
import SupplementPlanner from "./supplements/SupplementPlanner";

export default function PlannerPanel() {
  return (
    <div
      style={{
        padding: 10,
        border: "1px solid #cbd5e1",
        borderRadius: 14,
        background: "#f8fafc",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          fontWeight: 900,
          fontSize: 18,
          color: "#0f766e",
          marginBottom: 8,
        }}
      >
        📅 Planner
      </div>

      <SupplementPlanner />
    </div>
  );
}
