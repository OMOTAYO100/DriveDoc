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
    console.warn("Push messaging is not supported");
    return null;
  }
    
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        console.warn("Notification permission not granted");
        return null;
    }

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
