export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("Notificaties worden niet ondersteund op dit apparaat/browser.");
    return "unsupported";
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    new Notification("VoedingsManager", {
      body: "Testmelding werkt.",
    });
  }

  return permission;
}
export function showNotification(title, body) {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}
