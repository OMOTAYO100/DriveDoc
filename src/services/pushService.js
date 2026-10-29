import { api } from "./api";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/** True when this browser can do web push at all. */
export const isPushSupported = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

/**
 * iOS only exposes the Notification API to an installed PWA. Detecting that
 * lets us give iPhone users the one instruction that actually helps instead of
 * a generic "not supported".
 */
export const isIosSafari = () => {
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return iOS && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);
};

export const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

const registerServiceWorker = async () => {
  const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  // Wait until it's actually controlling the page, otherwise pushManager calls
  // can race the install.
  await navigator.serviceWorker.ready;
  return reg;
};

const getVapidKey = async () => {
  const response = await api.getNotificationPublicKey();
  if (!response.publicKey) {
    throw new Error("Notifications aren't configured on the server yet.");
  }
  return urlBase64ToUint8Array(response.publicKey);
};

/**
 * Ask for permission and subscribe. Must be called from a user gesture —
 * browsers reject (and some permanently deny) permission prompts that aren't.
 */
export const registerPush = async () => {
  if (!isPushSupported()) {
    if (isIosSafari() && !isStandalone()) {
      throw new Error(
        "On iPhone, add DriveDoc to your Home Screen first: tap Share, then 'Add to Home Screen'. Then open it from there and turn reminders on."
      );
    }
    throw new Error("This browser doesn't support notifications.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    const err = new Error("Notification permission denied.");
    err.code = "permission-denied";
    throw err;
  }

  const reg = await registerServiceWorker();
  const applicationServerKey = await getVapidKey();

  // Reuse an existing subscription if the browser still has one; re-subscribing
  // with a different key throws.
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
  }

  const payload = sub.toJSON();
  localStorage.setItem("pushSubscription", JSON.stringify(payload));

  await api.subscribeToPush(payload);
  // Subscribing refreshes the keys but does not re-enable a subscription the
  // user opted out of, so say so explicitly.
  await api.optInNotifications(payload.endpoint);

  return payload;
};

/**
 * Silent refresh on page load for users who already have notifications on.
 * Never prompts: if permission isn't already granted, it does nothing.
 */
export const resubscribeIfEnabled = async () => {
  if (!isPushSupported() || Notification.permission !== "granted") return null;

  const reg = await registerServiceWorker();
  let sub = await reg.pushManager.getSubscription();

  if (!sub) {
    const applicationServerKey = await getVapidKey();
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
  }

  const payload = sub.toJSON();
  localStorage.setItem("pushSubscription", JSON.stringify(payload));
  await api.subscribeToPush(payload);
  return payload;
};

/** Stop notifications for this device, on the server and in the browser. */
export const unregisterPush = async () => {
  const stored = localStorage.getItem("pushSubscription");
  let endpoint = stored ? JSON.parse(stored).endpoint : null;

  if (!endpoint && isPushSupported()) {
    const reg = await navigator.serviceWorker.getRegistration("/");
    const sub = await reg?.pushManager.getSubscription();
    endpoint = sub?.endpoint ?? null;
  }

  if (endpoint) {
    await api.optOutNotifications(endpoint);
  }
  localStorage.setItem("notifications_enabled", "false");
};
