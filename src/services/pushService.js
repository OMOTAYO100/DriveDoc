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

export const registerPush = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push messaging is not supported in this browser.");
  }
    
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        throw new Error("Notification permission denied.");
    }

    console.log("Registering Service Worker...");
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    console.log("Service Worker registered:", reg);

    // Check if VAPID key is available
    let publicKey;
    try {
        const response = await api.getNotificationPublicKey();
        publicKey = response.publicKey;
    } catch (apiError) {
        throw new Error(`Failed to fetch VAPID key: ${apiError.message}`);
    }
    
    if (!publicKey) {
      throw new Error("Server returned no VAPID public key. Please check backend configuration.");
    }

    const key = urlBase64ToUint8Array(publicKey);
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: key,
    });

    console.log("User subscribed:", sub);
    localStorage.setItem("pushSubscription", JSON.stringify(sub));
    
    await api.subscribeToPush(sub);
    return sub;
  } catch (err) {
    console.error("Push registration failed:", err);
    throw err; // Re-throw to be caught by App.jsx
  }
};
