import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId || "missing-client-id"}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

const registerPush = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window))
    return false;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;
  const reg = await navigator.serviceWorker.register("/sw.js");
  const r = await fetch("/api/notifications/public-key");
  const { publicKey } = await r.json();
  const key = publicKey ? urlBase64ToUint8Array(publicKey) : null;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: key,
  });
  localStorage.setItem("pushSubscription", JSON.stringify(sub));
  await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(localStorage.getItem("token")
        ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
        : {}),
    },
    body: JSON.stringify(sub),
  });
  return true;
};

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

registerPush();
window.registerPush = registerPush;

// Expose loadScript for components to use if needed, or we can move it to utils later.
// For now, I'm removing the global window.googleSignIn and window.facebookSignIn
// as they will be handled by the components directly.
export { loadScript };
window.optOutNotifications = async () => {
  const sub = JSON.parse(localStorage.getItem("pushSubscription") || "{}");
  if (!sub.endpoint) return;
  await fetch("/api/notifications/opt-out", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(localStorage.getItem("token")
        ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
        : {}),
    },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const current = reg ? await reg.pushManager.getSubscription() : null;
    if (current) await current.unsubscribe();
  } catch (err) {
    console.warn("Failed to unsubscribe from push", err);
  }
};
window.optInNotifications = async () => {
  const sub = JSON.parse(localStorage.getItem("pushSubscription") || "{}");
  if (!sub.endpoint) return;
  await fetch("/api/notifications/opt-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(localStorage.getItem("token")
        ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
        : {}),
    },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });
};
