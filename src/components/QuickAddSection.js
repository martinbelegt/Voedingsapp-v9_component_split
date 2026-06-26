import React from "react";
import { CompanionButton } from "../ui/buttons/CompanionButton";

export function QuickAddSection(props) {
  const {
    addCurrentMealToSelectedDay,
    cardStyle,
  } = props;

  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  return (
    <div
      style={{
        ...cardStyle,
        padding: isMobile ? 5 : 0,
        background: "transparent",
        border: "none",
        boxShadow: "none",
      }}
    >
      <CompanionButton
        variant="primary"
        size={isMobile ? "sm" : "md"}
        fullWidth
        onClick={addCurrentMealToSelectedDay}
      >
        Zet op tijdlijn
      </CompanionButton>
    </div>
  );
}
