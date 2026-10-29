import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const TONES = {
  success: { icon: CheckCircle2, cls: "border-green-200 bg-green-50 text-green-900", iconCls: "text-green-600" },
  error: { icon: AlertCircle, cls: "border-red-200 bg-red-50 text-red-900", iconCls: "text-red-600" },
  info: { icon: Info, cls: "border-blue-200 bg-blue-50 text-blue-900", iconCls: "text-blue-600" },
};

/**
 * Replaces the window.alert() calls the app used for every outcome. Errors
 * stay until dismissed; successes clear themselves.
 */
export default function Toast({ toast, onDismiss }) {
  const isError = toast?.tone === "error";

  useEffect(() => {
    if (!toast || isError) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [toast, isError, onDismiss]);

  if (!toast) return null;

  const { icon: Icon, cls, iconCls } = TONES[toast.tone] || TONES.info;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 sm:bottom-6"
      role="status"
      aria-live="polite"
    >
      <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${cls}`}>
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconCls}`} aria-hidden="true" />
        <p className="flex-1 text-sm leading-relaxed">{toast.message}</p>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
