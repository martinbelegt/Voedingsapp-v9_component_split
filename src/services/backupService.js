export function createFullBackupSnapshot({
  categories,
  products,
  rows,
  settings,
  savedMeals,
  testLog,
}) {
  return {
    exportedAt: new Date().toISOString(),
    app: "diabetes-creon-webapp",
    version: 2,
    categories,
    products,
    rows,
    settings,
    savedMeals,
    testLog,
  };
}

export function downloadJsonFile(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
}

export function createBackupFileName() {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  return `diabetes-creon-backup-${stamp}.json`;
}
