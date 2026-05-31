import React, { useState } from "react";
import { getCategoryColor, getCategoryName } from "../services/productHelpers";

export function QuickAddSection(props) {
  const {
    dayMealMoment,
    setDayMealMoment,
    dayMealTime,
    setDayMealTime,
    logCurrentMealToDay,
    setLogCurrentMealToDay,
    addCurrentMealToSelectedDay,
    addCurrentMealToSelectedDayAndClear,
    cardStyle,
    inputStyle,
    buttonStyle,
    dayMealDate,
    setDayMealDate,
  } = props;

  const [flashAction, setFlashAction] = useState(null);

  function flash(name) {
    setFlashAction(name);
    setTimeout(() => setFlashAction(null), 650);
  }

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "150px 140px 110px 1fr 1fr",
          gap: 8,
          alignItems: "center",
        }}
      >
        <select
          value={dayMealMoment}
          onChange={(e) => setDayMealMoment(e.target.value)}
          style={inputStyle}
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

        {/* Datum voor Dag / Archief */}
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
          }}
        >
          Voeg toe aan dag
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
          }}
        >
          Voeg toe en start nieuwe maaltijd
        </button>
      </div>
    </div>
  );
}
