import { useState, useCallback } from "react";
import {
  registerPush,
  unregisterPush,
  isPushSupported,
  isIosSafari,
  isStandalone,
} from "../services/pushService";

/**
 * Push notification state for the header toggle.
 *
 * Email reminders are a separate, server-side preference — see AccountModal.
 * Push is the opt-in channel because it needs a browser permission and, on
 * iOS, an installed PWA.
 */
// Notification.permission and localStorage are both readable synchronously,
// so seed from them during state initialisation rather than in an effect that
// would render once wrong and then correct itself.
const readInitialState = () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { enabled: false, denied: false };
  }
  let saved = null;
  try {
    saved = localStorage.getItem("notifications_enabled");
  } catch {
    // Private mode, or site data blocked.
  }
  return {
    enabled: saved === "true" && Notification.permission === "granted",
    denied: Notification.permission === "denied",
  };
};

export function useNotifications(notify) {
  const initial = readInitialState();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [denied, setDenied] = useState(initial.denied);

  const toggle = useCallback(async () => {
    if (enabled) {
      try {
        await unregisterPush();
        setEnabled(false);
        notify("Reminders turned off for this device.", "info");
      } catch (error) {
        notify(`Couldn't turn reminders off: ${error.message}`, "error");
      }
      return;
    }

    if (!isPushSupported()) {
      notify(
        isIosSafari() && !isStandalone()
          ? "On iPhone, tap Share then 'Add to Home Screen', open DriveDoc from there, and turn reminders on."
          : "This browser doesn't support notifications.",
        "error"
      );
      return;
    }

    if (Notification.permission === "denied") {
      setDenied(true);
      notify("Notifications are blocked in your browser settings. Unblock them, then try again.", "error");
      return;
    }

    try {
      await registerPush();
      setEnabled(true);
      setDenied(false);
      localStorage.setItem("notifications_enabled", "true");
      notify("Reminders are on. We'll tell you before anything expires.", "success");
    } catch (error) {
      if (error.code === "permission-denied") {
        setDenied(true);
        notify("You declined notifications. Allow them in your browser settings to turn reminders on.", "error");
      } else {
        notify(error.message, "error");
      }
    }
  }, [enabled, notify]);

  return { enabled, denied, toggle, reset: () => setEnabled(false) };
}
