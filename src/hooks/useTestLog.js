import { useEffect, useState } from "react";

const TEST_LOG_KEY = "dc_test_log_v1";

const defaultTestLogForm = {
  mealLabel: "",
  insulin: "",
  creon: "",
  stoolType: "4",
  outcome: "",
  notes: "",
};

export function useTestLog() {
  const [testLog, setTestLog] = useState(() => {
    const saved = localStorage.getItem(TEST_LOG_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [testLogForm, setTestLogForm] = useState(defaultTestLogForm);

  useEffect(() => {
    localStorage.setItem(TEST_LOG_KEY, JSON.stringify(testLog));
  }, [testLog]);

  function resetTestLogForm() {
    setTestLogForm(defaultTestLogForm);
  }

  function addTestLogEntry() {
    const entry = {
      id: `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toLocaleString("nl-NL"),
      ...testLogForm,
    };

    setTestLog((prev) => [entry, ...prev]);
    resetTestLogForm();
  }

  function deleteTestLogEntry(id) {
    setTestLog((prev) => prev.filter((e) => e.id !== id));
  }

  return {
    testLog,
    setTestLog,
    testLogForm,
    setTestLogForm,
    addTestLogEntry,
    deleteTestLogEntry,
    resetTestLogForm,
  };
}
