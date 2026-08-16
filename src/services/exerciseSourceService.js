export function buildExerciseSourceMomentUrl(urlValue, timestamp) {
  try {
    const url = new URL(String(urlValue || "").trim());
    if (!["http:", "https:"].includes(url.protocol)) return "";
    const parts = String(timestamp || "").trim().split(":").map(Number);
    const seconds = parts.length && parts.every(Number.isFinite)
      ? parts.reduce((total, part) => total * 60 + part, 0)
      : 0;
    if (seconds && (url.hostname.includes("youtube.com") || url.hostname === "youtu.be")) {
      url.searchParams.set("t", `${seconds}s`);
    }
    return url.href;
  } catch {
    return "";
  }
}
