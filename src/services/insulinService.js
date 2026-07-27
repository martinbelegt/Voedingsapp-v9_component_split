// Insulinebetekenissen in Companion:
// - meal.totals.insulin: berekende adviessnapshot, nooit een toegediende dosis.
// - insulinEvents: primaire waarheid voor werkelijk toegediende insuline.
// - meal.actualInsulin: alleen behouden als legacy compatibility data.
export function getAdministeredInsulinTotal(day) {
  const total = (day?.insulinEvents || []).reduce(
    (sum, event) => sum + (Number(event?.units) || 0),
    0,
  );

  return Math.round((total + Number.EPSILON) * 100) / 100;
}
