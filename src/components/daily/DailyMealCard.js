import React, { useEffect, useState } from "react";
import { DailyMealActions } from "./DailyMealActions";
import { DailyMealDetailModal } from "./DailyMealDetailModal";
import { DailyTimelineItem } from "./DailyTimelineItem";
import { DailyEventTimeEditorModal } from "./DailyEventTimeEditorModal";

export function DailyMealCard({
  meal,
  products,
  onDelete,
  onUpdateTime,
  onUpdateMedicalLog,
  buttonStyle,
  compact = false,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [showTimeEditor, setShowTimeEditor] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setShowDetails(false);
      }
    }

    if (showDetails) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDetails]);

  const momentLabelMap = {
    breakfast: "Ontbijt",
    lunch: "Lunch",
    dinner: "Diner",
    eveningMeal: "Avondeten",
    nightMeal: "Nocturnal Protection 21:30",
    recovery: "Herstelmoment",
    lateMeal: "Late maaltijd/snack",
    pppMeal: "PPP / vertraagde maaltijd",
    snack: "Snack",
    sport: "Sportvoeding",
    dessert: "Toetje",
    fruit: "Fruit",
    neutral: "Algemeen",
  };

  const mealMomentLabel = momentLabelMap[meal.mealMoment] || "Maaltijd";
  const eatenAtValue = meal.eatenAt || "";

  function changeMealTime() {
    setShowTimeEditor(true);
  }

  function changeMedicalLog() {
    const mealNote = window.prompt(
      "Contextnotitie bij dit eetmoment:",
      meal.mealNote || "",
    );

    if (mealNote === null) return;

    onUpdateMedicalLog(meal.id, {
      mealNote,
    });
  }

  const mealTimeLabel = meal.eatenAt
    ? new Date(meal.eatenAt).toLocaleString("nl-NL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : meal.createdAt;

  const mealProductLines = (meal.rows || [])
    .filter((row) => row.productId)
    .map((row) => {
      const product = products.find((p) => p.id === row.productId);
      const productName = product?.name || "Onbekend product";
      const amount = Number(row.amount) || 0;

      if (!amount) return productName;
      if (row.mode === "gram") return `${amount} g ${productName}`;

      return amount === 1 ? productName : `${amount}x ${productName}`;
    });

  const mealTitle = (
    <span
      style={{
        display: "inline-grid",
        gap: 2,
        verticalAlign: "top",
      }}
    >
      {mealProductLines.length > 0 ? (
        mealProductLines.map((line, lineIndex) => (
          <React.Fragment key={`${line}-${lineIndex}`}>
            {lineIndex > 0 ? <span>+</span> : null}
            <span>{line}</span>
          </React.Fragment>
        ))
      ) : (
        <span>Geen producten vastgelegd</span>
      )}
    </span>
  );

  const mealSubtitle =
    meal.alarmEnabled || meal.mealNote ? (
      <span style={{ color: "#166534", fontWeight: 700 }}>
        {meal.alarmEnabled ? "Alarm actief" : ""}
        {meal.alarmEnabled && meal.mealNote ? " - " : ""}
        {meal.mealNote || ""}
      </span>
    ) : null;

  return (
    <>
      <DailyTimelineItem
        icon={null}
        timeLabel={
          meal.eatenAt
            ? new Date(meal.eatenAt).toLocaleString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--:--"
        }
        title={<span style={{ color: "#0f172a" }}>{mealTitle}</span>}
        subtitle={mealSubtitle}
        accentColor="#166534"
        backgroundColor="#f0fdf4"
        borderColor="#bbf7d0"
        compact={compact}
        expanded={false}
        onToggle={() => setShowDetails(true)}
        actions={
          !compact ? (
            <DailyMealActions
              changeMealTime={changeMealTime}
              changeMedicalLog={changeMedicalLog}
              onDelete={onDelete}
              meal={meal}
              buttonStyle={buttonStyle}
            />
          ) : null
        }
        detailContent={null}
      />

      {showDetails && (
        <DailyMealDetailModal
          meal={meal}
          products={products}
          mealMomentLabel={mealMomentLabel}
          mealTimeLabel={mealTimeLabel}
          buttonStyle={buttonStyle}
          onClose={() => setShowDetails(false)}
          onChangeTime={() => setShowTimeEditor(true)}
          onUpdateAlarm={(updates) => {
            onUpdateMedicalLog(meal.id, updates);
          }}
          onDelete={() => {
            const ok = window.confirm("Deze maaltijd verwijderen?");
            if (!ok) return;

            onDelete(meal.id);
            setShowDetails(false);
          }}
        />
      )}

      {showTimeEditor && (
        <DailyEventTimeEditorModal
          initialValue={
            eatenAtValue
              ? eatenAtValue.slice(0, 16)
              : new Date().toISOString().slice(0, 16)
          }
          buttonStyle={buttonStyle}
          onSave={(nextValue) => onUpdateTime(meal.id, nextValue)}
          onClose={() => setShowTimeEditor(false)}
        />
      )}
    </>
  );
}
