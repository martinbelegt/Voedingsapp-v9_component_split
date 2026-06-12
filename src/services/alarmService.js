import { showNotification } from "./notificationService";

let alarmAudio = null;

const activeAlarmTimers = new Map();
const activeRepeatTimers = new Map();

export function scheduleLocalAlarm({ id, alarmAt, title, body }) {
  if (!id || !alarmAt) return;

  const targetTime = new Date(alarmAt).getTime();
  const msUntilAlarm = targetTime - Date.now();

  if (msUntilAlarm <= 0) return;

  clearLocalAlarm(id);

  const timeoutId = setTimeout(() => {
    triggerAlarm({
      id,
      title: title || "VoedingsApp reminder",
      body: body || "Tijd voor je geplande actie.",
    });

    activeAlarmTimers.delete(id);
  }, msUntilAlarm);

  activeAlarmTimers.set(id, timeoutId);
}
export function enableAlarmSound() {
  try {
    alarmAudio = new Audio("/sounds/alarm.mp3");

    alarmAudio.volume = 1;

    alarmAudio.play().then(() => {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
      console.log("Alarmgeluid geactiveerd");
    });
  } catch (err) {
    console.error(err);
  }
}

export function clearLocalAlarm(id) {
  if (activeAlarmTimers.has(id)) {
    clearTimeout(activeAlarmTimers.get(id));
    activeAlarmTimers.delete(id);
  }

  if (activeRepeatTimers.has(id)) {
    clearInterval(activeRepeatTimers.get(id));
    activeRepeatTimers.delete(id);
  }
}

export function snoozeLocalAlarm({ id, title, body, minutes = 5 }) {
  clearLocalAlarm(id);

  scheduleLocalAlarm({
    id,
    alarmAt: new Date(Date.now() + minutes * 60 * 1000).toISOString(),
    title,
    body,
  });
}

function triggerAlarm({ id, title, body }) {
  if (alarmAudio) {
    try {
      alarmAudio.currentTime = 0;
      alarmAudio.play();
    } catch (err) {
      console.error(err);
    }
  }
  showNotification(title, body);

  window.dispatchEvent(
    new CustomEvent("voedingsapp-alarm", {
      detail: {
        id,
        title,
        body,
      },
    }),
  );

  const repeatId = setInterval(() => {
    showNotification(title, body);

    window.dispatchEvent(
      new CustomEvent("voedingsapp-alarm-repeat", {
        detail: {
          id,
          title,
          body,
        },
      }),
    );
  }, 60 * 1000);

  activeRepeatTimers.set(id, repeatId);
}
