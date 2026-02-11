import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (import.meta.env.DEV) {
  console.log("Google Client ID status:", googleClientId ? `Loaded (${googleClientId.substring(0, 10)}...)` : "MISSING");
}

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

// registerPush remains here as a bootstrap function, but we'll export it for App.jsx
export const registerPush = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window))
    return null;
    
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const reg = await navigator.serviceWorker.register("/sw.js");
    const { publicKey } = await api.getNotificationPublicKey();
    
    if (!publicKey) {
      console.log("No VAPID public key found, skipping push registration.");
      return null;
    }

    const key = urlBase64ToUint8Array(publicKey);
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: key,
    });

    localStorage.setItem("pushSubscription", JSON.stringify(sub));
    await api.subscribeToPush(sub);
    
    return sub;
  } catch (err) {
    console.error("Push registration failed:", err);
    return null;
  }
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

// Auto-register on load if already authenticated or token exists
if (localStorage.getItem("token")) {
    registerPush().catch(console.error);
}

// Attach to window only for legacy or quick access if absolutely necessary, 
// but App.jsx should import it.
window.registerPush = registerPush;

export { loadScript };
