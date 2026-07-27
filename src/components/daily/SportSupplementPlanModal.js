import React, { useEffect, useMemo, useState } from "react";
import { CompanionButton } from "../../ui/buttons/CompanionButton";
import {
  CompanionInput,
  CompanionNumberInput,
} from "../../ui/inputs/CompanionInput";
import { CompanionModalShell } from "../../ui/modals/CompanionModalShell";
import { CompanionDateTimePicker } from "../../ui/pickers/CompanionDateTimePicker";
import { starterIntakeItems } from "../planner/intake/intakeLibraryModel";

const supplementItems = starterIntakeItems.filter(
  (item) => item.category === "supplement" && item.active !== false,
);
const fieldStyle = { display: "grid", gap: 6 };
const labelStyle = { color: "#334155", fontSize: 13, fontWeight: 800 };

function splitDosage(value = "") {
  const match = String(value).trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  return match
    ? { amount: match[1], unit: match[2] }
    : { amount: "", unit: String(value).trim() };
}

export function SportSupplementPlanModal({
  open,
  selectedDate,
  training,
  plan,
  onClose,
  onSave,
}) {
  const defaultItem = supplementItems[0];
  const initialDosage = useMemo(
    () => splitDosage(defaultItem?.defaultDosage),
    [defaultItem],
  );
  const [form, setForm] = useState({
    intakeItemId: defaultItem?.id || "",
    name: defaultItem?.name || "",
    amount: initialDosage.amount,
    unit: initialDosage.unit,
    eventTime: `${selectedDate}T${defaultItem?.defaultTime || "09:00"}`,
    note: "",
  });

  useEffect(() => {
    if (plan) {
      setForm({
        intakeItemId: plan.intakeItemId || "",
        name: plan.name || "",
        amount: plan.amount || "",
        unit: plan.unit || "",
        eventTime: plan.eventTime || `${selectedDate}T09:00`,
        note: plan.note || "",
      });
      return;
    }

    const item = supplementItems[0];
    const dosage = splitDosage(item?.defaultDosage);
    setForm({
      intakeItemId: item?.id || "",
      name: item?.name || "",
      amount: dosage.amount,
      unit: dosage.unit,
      eventTime: `${selectedDate}T${item?.defaultTime || "09:00"}`,
      note: item?.note || "",
    });
  }, [open, plan, selectedDate]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function chooseSupplement(itemId) {
    const item = supplementItems.find((candidate) => candidate.id === itemId);
    const dosage = splitDosage(item?.defaultDosage);
    setForm((current) => ({
      ...current,
      intakeItemId: item?.id || "",
      name: item?.name || "",
      amount: dosage.amount,
      unit: dosage.unit,
      note: item?.note || "",
    }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.eventTime || !form.name.trim()) return;
    onSave({
      ...form,
      trainingPlanId: training?.id || plan?.trainingPlanId || null,
      name: form.name.trim(),
      amount: form.amount.trim(),
      unit: form.unit.trim(),
      note: form.note.trim(),
    });
  }

  return (
    <CompanionModalShell
      open={open}
      onClose={onClose}
      title={plan ? "Supplementplanning bewerken" : "Supplement plannen"}
      subtitle={`Gepland rond ${training?.title || "training"}. Dit registreert geen werkelijke inname.`}
      footer={
        <>
          <CompanionButton onClick={onClose}>Annuleren</CompanionButton>
          <CompanionButton
            variant="primary"
            onClick={submit}
            disabled={!form.eventTime || !form.name.trim()}
          >
            Planning opslaan
          </CompanionButton>
        </>
      }
    >
      <form
        onSubmit={submit}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
      >
        <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
          <span style={labelStyle}>Supplement</span>
          <select
            value={form.intakeItemId}
            onChange={(event) => chooseSupplement(event.target.value)}
            style={{
              minHeight: 42,
              padding: "9px 12px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              background: "#fff",
              fontSize: 15,
            }}
          >
            {supplementItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
          <CompanionDateTimePicker
            mode="datetime"
            presentation="compact"
            label="Gepland tijdstip"
            value={form.eventTime}
            onChange={(value) => setField("eventTime", value)}
            contextItems={[]}
          />
        </div>

        <label style={fieldStyle}>
          <span style={labelStyle}>Hoeveelheid</span>
          <CompanionNumberInput
            value={form.amount}
            onChange={(event) => setField("amount", event.target.value)}
            placeholder="5"
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>Eenheid</span>
          <CompanionInput
            value={form.unit}
            onChange={(event) => setField("unit", event.target.value)}
            placeholder="gram"
          />
        </label>

        <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
          <span style={labelStyle}>Notitie (optioneel)</span>
          <textarea
            rows={3}
            value={form.note}
            onChange={(event) => setField("note", event.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              font: "inherit",
              resize: "vertical",
            }}
          />
        </label>
      </form>
    </CompanionModalShell>
  );
}
