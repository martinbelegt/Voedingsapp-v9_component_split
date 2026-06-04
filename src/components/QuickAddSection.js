import React, { useState } from "react";

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
  } = props;

  const [flashAction, setFlashAction] = useState(null);

  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  function flash(name) {
    setFlashAction(name);
    setTimeout(() => setFlashAction(null), 650);
  }

  return (
    <div
      style={{
        ...cardStyle,
        padding: isMobile ? 8 : cardStyle?.padding,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr 1fr"
            : "150px 140px 110px 1fr 1fr",
          gap: isMobile ? 6 : 8,
          alignItems: "center",
        }}
      >
        <select
          value={dayMealMoment}
          onChange={(e) => setDayMealMoment(e.target.value)}
          style={{
            ...inputStyle,
            gridColumn: isMobile ? "1 / -1" : "auto",
          }}
        >
          <option value="breakfast">Ontbijt</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Diner</option>
          <option value="eveningMeal">Avondeten</option>
          <option value="nightMeal">Nocturnal Protection 21:30</option>
          <option value="preWorkout">Pre krachttraining</option>
          <option value="postWorkout">Post krachttraining</option>
          <option value="recovery">Herstelmoment</option>
          <option value="lateMeal">Late maaltijd/snack</option>
          <option value="pppMeal">PPP / vertraagde maaltijd</option>
          <option value="snack">Snack</option>
          <option value="sport">Sport</option>
          <option value="dessert">Toetje</option>
          <option value="fruit">Fruit</option>
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
            ...inputStyle,
            cursor: "pointer",
          }}
        />

        <input
          type="time"
          value={dayMealTime}
          onChange={(e) => setDayMealTime(e.target.value)}
          style={inputStyle}
          title="Tijd van eetmoment"
        />

        <button
          onClick={() => {
            addCurrentMealToSelectedDay();
            flash("add");
          }}
          style={{
            ...buttonStyle,
            background: flashAction === "add" ? "#22c55e" : "#dcfce7",
            color: flashAction === "add" ? "white" : "#166534",
            border: "1px solid #86efac",
            fontWeight: 700,
            fontSize: isMobile ? 12 : undefined,
            padding: isMobile ? "7px 8px" : undefined,
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
            ...buttonStyle,
            background: flashAction === "addClear" ? "#2563eb" : "#eff6ff",
            color: flashAction === "addClear" ? "white" : "#1d4ed8",
            border: "1px solid #bfdbfe",
            fontWeight: 700,
            fontSize: isMobile ? 12 : undefined,
            padding: isMobile ? "7px 8px" : undefined,
          }}
        >
          + nieuwe maaltijd
        </button>
      </div>
    </div>
  );
}
