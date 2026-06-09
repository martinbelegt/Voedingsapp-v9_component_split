import { showNotification } from "./notificationService";

const activeAlarmTimers = new Map();

export function scheduleLocalAlarm({ id, alarmAt, title, body }) {
  if (!id || !alarmAt) return;

  const targetTime = new Date(alarmAt).getTime();
  const msUntilAlarm = targetTime - Date.now();

  if (msUntilAlarm <= 0) return;

  if (activeAlarmTimers.has(id)) {
    clearTimeout(activeAlarmTimers.get(id));
  }

  const timeoutId = setTimeout(() => {
    showNotification(
      title || "VoedingsApp reminder",
      body || "Tijd voor je geplande actie.",
    );

    activeAlarmTimers.delete(id);
  }, msUntilAlarm);

  activeAlarmTimers.set(id, timeoutId);
}
