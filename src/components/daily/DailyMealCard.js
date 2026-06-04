import React, { useEffect, useState } from "react";
import { DailyMealMedicalLogBlock } from "./DailyMealMedicalLogBlock";
import { DailyMealActions } from "./DailyMealActions";
import { DailyMealDetailModal } from "./DailyMealDetailModal";
import { DailyTimelineItem } from "./DailyTimelineItem";
import { DailyEventTimeEditorModal } from "./DailyEventTimeEditorModal";

export function DailyMealCard({
  meal,
  index,
  products,
  onDelete,
  onUpdateTime,
  onUpdateMedicalLog,
  buttonStyle,
  compact = false,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const [showTimeEditor, setShowTimeEditor] = useState(false);

  // ESC sluit detailvenster
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
    preWorkout: "Pre krachttraining",
    postWorkout: "Post krachttraining",
    recovery: "Herstelmoment",
    lateMeal: "Late maaltijd/snack",
    pppMeal: "PPP / vertraagde maaltijd",
    snack: "Snack",
    sport: "Sport",
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

  return (
    <>
      {/* Eetmoment als uniforme tijdlijnkaart */}
      <DailyTimelineItem
        icon="🍽️"
        timeLabel={
          meal.eatenAt
            ? new Date(meal.eatenAt).toLocaleString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--:--"
        }
        title={`${mealMomentLabel} · ${meal.totals.kh}g KH · ${meal.totals.protein}g eiwit · ${meal.totals.fat}g vet · ${meal.totals.kcal} kcal`}
        subtitle={meal.mealNote || ""}
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
