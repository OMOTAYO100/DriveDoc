import { useState, useCallback } from "react";
import Toast from "../components/Toast";
import { ToastContext } from "./toast";

/**
 * One toast host for the whole app, so a routed page can report an outcome
 * without its parent having to pass a handler down.
 */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, tone = "info") => setToast({ message, tone }), []);
  const dismiss = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <Toast toast={toast} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
