import React, { useState } from "react";
import { CompanionButton } from "../ui/buttons/CompanionButton";
import { CompanionDateTimePicker } from "../ui/pickers/CompanionDateTimePicker";

export function QuickAddSection(props) {
  const {
    dayMealMoment,
    setDayMealMoment,
    dayMealTime,
    setDayMealTime,
    addCurrentMealToSelectedDay,
    addCurrentMealToSelectedDayAndClear,
    cardStyle,
    inputStyle,
    buttonStyle,
    dayMealDate,
    setDayMealDate,
    dayMealRepeat,
    setDayMealRepeat,
  } = props;

  const [flashAction, setFlashAction] = useState(null);

  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  const dashboardInputStyle = {
    ...inputStyle,
    ...(isMobile
      ? {
          padding: "5px 8px",
          minHeight: 34,
          fontSize: 16,
          lineHeight: 1.1,
          borderRadius: 6,
          boxSizing: "border-box",
          width: "100%",
          background: "#f8fafc",
          border: "1px solid #cbd5e1",
          color: "#0f172a",
        }
      : {}),
  };

  const dashboardButtonStyle = {
    ...buttonStyle,
    ...(isMobile
      ? {
          padding: "4px 8px",
          minHeight: 32,
          fontSize: 12,
          lineHeight: 1,
          borderRadius: 6,
        }
      : {}),
  };

  function flash(name) {
    setFlashAction(name);
    setTimeout(() => setFlashAction(null), 650);
  }

  function updateMealDateTime(nextValue) {
    const [nextDate, nextTime] = String(nextValue).split("T");
    if (nextDate) setDayMealDate(nextDate);
    if (nextTime) setDayMealTime(nextTime.slice(0, 5));
  }

  const dateTimeValue = `${dayMealDate}T${dayMealTime || "00:00"}`;

  return (
    <div
      style={{
        ...cardStyle,
        padding: isMobile ? 5 : cardStyle?.padding,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "150px minmax(280px, 1fr) 130px 1fr 1fr",
          gap: isMobile ? 6 : 8,
          alignItems: "center",
        }}
      >
        <select
          value={dayMealMoment}
          onChange={(e) => setDayMealMoment(e.target.value)}
          style={dashboardInputStyle}
        >
          <option value="breakfast">Ontbijt</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Diner</option>
          <option value="eveningMeal">Avondeten</option>
          <option value="nightMeal">Nocturnal Protection 21:30</option>
          <option value="lateMeal">Late maaltijd/snack</option>
          <option value="pppMeal">PPP / vertraagde maaltijd</option>
          <option value="snack">Snack</option>
          <option value="dessert">Toetje</option>
          <option value="fruit">Fruit</option>
          <option value="sport">Sportvoeding</option>
          <option value="recovery">Herstelmoment</option>
          <option value="neutral">Algemeen</option>
        </select>

        <CompanionDateTimePicker
          value={dateTimeValue}
          onChange={updateMealDateTime}
          mode="datetime"
          label="Datum en tijd"
          compact
          contextItems={[]}
        />

        <select
          value={dayMealRepeat}
          onChange={(e) => setDayMealRepeat(e.target.value)}
          style={dashboardInputStyle}
          title="Herhalen"
        >
          <option value="none">Niet herhalen</option>
          <option value="daily">Dagelijks</option>
        </select>

        <CompanionButton
          variant="primary"
          size={isMobile ? "sm" : "md"}
          onClick={() => {
            addCurrentMealToSelectedDay();
            flash("add");
          }}
        >
          Voeg toe
        </CompanionButton>

        {!isMobile && (
          <button
            onClick={() => {
              addCurrentMealToSelectedDayAndClear();
              flash("addClear");
            }}
            style={{
              ...dashboardButtonStyle,
              background: flashAction === "addClear" ? "#2563eb" : "#eff6ff",
              color: flashAction === "addClear" ? "white" : "#1d4ed8",
              border: "1px solid #bfdbfe",
              fontWeight: 700,
            }}
          >
            + nieuwe maaltijd
          </button>
        )}
      </div>
    </div>
  );
}
