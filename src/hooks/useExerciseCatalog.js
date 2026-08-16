import { useEffect, useState } from "react";
import { loadExerciseCatalog, saveExerciseCatalog } from "../services/exerciseStorageService";

export function useExerciseCatalog() {
  const [catalog, setCatalog] = useState(loadExerciseCatalog);
  useEffect(() => { saveExerciseCatalog(catalog); }, [catalog]);
  return { catalog, setCatalog };
}
