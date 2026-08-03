import { useEffect, useState } from "react";
import { createRoutine, loadRoutines, saveRoutines } from "../services/routineService";

export function useRoutines() {
  const [routines, setRoutines] = useState(() => loadRoutines());

  useEffect(() => {
    saveRoutines(routines);
  }, [routines]);

  function addRoutine(overrides) {
    const routine = createRoutine(overrides);
    setRoutines((current) => [...current, routine]);
    return routine;
  }

  function updateRoutine(id, patch) {
    setRoutines((current) => current.map((routine) =>
      routine.id === id
        ? { ...routine, ...patch, updatedAt: new Date().toISOString() }
        : routine,
    ));
  }

  function deleteRoutine(id) {
    setRoutines((current) => current.filter((routine) => routine.id !== id));
  }

  return { routines, addRoutine, updateRoutine, deleteRoutine };
}
