export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        await navigator.serviceWorker.register("/service-worker.js");

        console.log("Service worker actief");
      } catch (err) {
        console.error("SW fout", err);
      }
    });
  }
}
