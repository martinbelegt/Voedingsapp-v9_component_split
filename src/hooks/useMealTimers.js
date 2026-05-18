import { useEffect, useState } from "react";
import { createMealTimer, sortTimersByEndTime } from "../services/timerService";

const STORAGE_KEY = "dc_meal_timers_v1";

function loadMealTimers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useMealTimers() {
  const [timers, setTimers] = useState(loadMealTimers);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  }, [timers]);

  function startTimer({ type, durationHours, note }) {
    const timer = createMealTimer({ type, durationHours, note });

    setTimers((prev) => sortTimersByEndTime([timer, ...prev]));

    return timer;
  }

  function deleteTimer(timerId) {
    setTimers((prev) => prev.filter((timer) => timer.id !== timerId));
  }

  function clearTimers() {
    const ok = window.confirm("Alle maaltijd-timers verwijderen?");
    if (!ok) return;

    setTimers([]);
  }

  return {
    timers,
    setTimers,
    startTimer,
    deleteTimer,
    clearTimers,
  };
}
