import React, { useState } from "react";
import { DailyEventTimeEditorModal } from "./daily/DailyEventTimeEditorModal";

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
  const [showTimeEditor, setShowTimeEditor] = useState(false);

  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  const dashboardInputStyle = {
    ...inputStyle,
    ...(isMobile
      ? {
          padding: "2px 6px",
          height: 32,
          minHeight: 32,
          maxHeight: 32,
          fontSize: 16,
          lineHeight: 1,
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
          height: 32,
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

  const dateTimeValue = `${dayMealDate}T${dayMealTime || "00:00"}`;
  const dateTimeLabel = (() => {
    const date = dayMealDate
      ? new Date(`${dayMealDate}T12:00:00`).toLocaleDateString("nl-NL", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Kies datum";

    return `${date} • ${dayMealTime || "--:--"}`;
  })();

  if (isMobile) {
    return (
      <div
        style={{
          ...cardStyle,
          padding: 5,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.9fr 1.45fr",
            gap: 4,
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

          <button
            type="button"
            onClick={() => setShowTimeEditor(true)}
            style={{
              ...dashboardInputStyle,
              cursor: "pointer",
              textAlign: "left",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {dateTimeLabel}
          </button>

          <button
            onClick={() => {
              addCurrentMealToSelectedDay();
              flash("add");
            }}
            style={{
              ...dashboardButtonStyle,
              gridColumn: "1 / -1",
              background: flashAction === "add" ? "#22c55e" : "#dcfce7",
              color: flashAction === "add" ? "white" : "#166534",
              border: "1px solid #86efac",
              fontWeight: 700,
            }}
          >
            Voeg toe
          </button>
        </div>

        {showTimeEditor && (
          <DailyEventTimeEditorModal
            initialValue={dateTimeValue}
            buttonStyle={buttonStyle}
            onSave={(nextValue) => {
              const [nextDate, nextTime] = String(nextValue).split("T");
              if (nextDate) setDayMealDate(nextDate);
              if (nextTime) setDayMealTime(nextTime.slice(0, 5));
            }}
            onClose={() => setShowTimeEditor(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        ...cardStyle,
        padding: cardStyle?.padding,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "150px 140px 110px 130px 1fr 1fr",
          gap: 8,
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

        <input
          type="date"
          value={dayMealDate}
          onChange={(e) => setDayMealDate(e.target.value)}
          onClick={(e) => {
            if (e.currentTarget.showPicker) {
              e.currentTarget.showPicker();
            }
          }}
          style={{
            ...dashboardInputStyle,
            cursor: "pointer",
          }}
        />

        <input
          type="time"
          value={dayMealTime}
          onChange={(e) => setDayMealTime(e.target.value)}
          style={dashboardInputStyle}
          title="Tijd van eetmoment"
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

        <button
          onClick={() => {
            addCurrentMealToSelectedDay();
            flash("add");
          }}
          style={{
            ...dashboardButtonStyle,
            background: flashAction === "add" ? "#22c55e" : "#dcfce7",
            color: flashAction === "add" ? "white" : "#166534",
            border: "1px solid #86efac",
            fontWeight: 700,
          }}
        >
          Voeg toe
        </button>

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
      </div>
    </div>
  );
}
