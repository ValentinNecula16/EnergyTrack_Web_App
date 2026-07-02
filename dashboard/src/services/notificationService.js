const SW_PATH = "/sw.js";
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour between same notification type

export const isSupported = () =>
  "Notification" in window && "serviceWorker" in navigator;

export const getPermission = () =>
  isSupported() ? Notification.permission : "denied";

export const requestPermission = async () => {
  if (!isSupported()) return false;
  const result = await Notification.requestPermission();
  return result === "granted";
};

export const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(SW_PATH);
    return reg;
  } catch (e) {
    console.error("SW registration failed:", e);
    return null;
  }
};

export const ensureSwReady = async () => {
  if (!("serviceWorker" in navigator)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg;
};

const canNotify = (tag) => {
  const key = `notif_last_${tag}`;
  const last = parseInt(sessionStorage.getItem(key) || "0", 10);
  if (Date.now() - last < COOLDOWN_MS) return false;
  sessionStorage.setItem(key, Date.now().toString());
  return true;
};

export const sendNotification = async (title, body, options = {}) => {
  if (Notification.permission !== "granted") return;
  const { tag = "energytrack", url = "/", force = false } = options;
  if (!force && !canNotify(tag)) return;

  const reg = await ensureSwReady();
  if (reg) {
    reg.showNotification(title, {
      body,
      icon: "/logo192.png",
      badge: "/logo192.png",
      tag,
      renotify: true,
      data: { url },
      vibrate: [200, 100, 200],
    });
  } else {
    new Notification(title, { body, icon: "/logo192.png" });
  }
};

// ─── Convenience helpers for each alert type ─────────────────────────────────

export const notifyOverTarget = (currentKwh, targetKwh, currency, cost) =>
  sendNotification(
    "⚠️ Monthly target exceeded!",
    `You've used ${currentKwh.toFixed(1)} kWh — ${(currentKwh - targetKwh).toFixed(1)} kWh over your ${targetKwh} kWh target. Estimated cost: ${cost} ${currency}.`,
    { tag: "over-target", url: "/analytics" }
  );

export const notifyApproachingTarget = (currentKwh, targetKwh, percent) =>
  sendNotification(
    "📊 Approaching energy limit",
    `You've reached ${percent.toFixed(0)}% of your monthly target (${currentKwh.toFixed(1)} / ${targetKwh} kWh). Consider reducing usage.`,
    { tag: "approaching-target", url: "/analytics" }
  );

export const notifyPredictionOver = (predictedKwh, targetKwh, currency, predictedCost) =>
  sendNotification(
    "🔮 Forecast: target will be exceeded",
    `At your current rate you'll reach ~${predictedKwh.toFixed(0)} kWh this month — ${(predictedKwh - targetKwh).toFixed(1)} kWh over target (~${predictedCost} ${currency}).`,
    { tag: "prediction-over", url: "/analytics" }
  );
