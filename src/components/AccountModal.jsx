import { useState } from "react";
import { X, Download, Trash2, Loader2 } from "lucide-react";
import { ALL_COUNTRIES } from "../utils/countryData";
import { api } from "../services/api";

/**
 * Account settings: finish an OAuth profile, export your data, delete your
 * account. The last two exist because the app holds name, email, phone,
 * country and document numbers — a user has to be able to get them out and
 * get rid of them without emailing anyone.
 */
export default function AccountModal({ user, onClose, onUpdated, onDeleted }) {
  const [emailReminders, setEmailReminders] = useState(user?.emailReminders !== false);
  const [savingEmailPref, setSavingEmailPref] = useState(false);
  const placeholder = (v) => !v || v === "N/A" || v === "Unknown";

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: placeholder(user?.phone) ? "" : user.phone,
    country: placeholder(user?.country) ? "" : user.country,
  });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (form.fullName.trim().length < 3) {
      setError("Full name must be at least 3 characters.");
      return;
    }
    if (!form.phone.trim()) {
      setError("Please add a phone number.");
      return;
    }
    if (!form.country) {
      setError("Please choose your country.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.updateProfile({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        country: form.country,
      });
      onUpdated(res.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEmailRemindersChange = async (next) => {
    // Optimistic: the switch should feel instant, and roll back if it fails.
    setEmailReminders(next);
    setSavingEmailPref(true);
    setError('');
    try {
      await api.setEmailReminders(next);
    } catch (err) {
      setEmailReminders(!next);
      setError(err.message);
    } finally {
      setSavingEmailPref(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const data = await api.exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `drivedoc-export-${new Date().toISOString().slice(0, 10)}.json`;
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await api.deleteAccount();
      localStorage.removeItem("token");
      localStorage.removeItem("pushSubscription");
      localStorage.removeItem("notifications_enabled");
      onDeleted();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 id="account-title" className="text-lg font-semibold text-gray-900">
            Your account
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 p-6">
            <div>
              <label htmlFor="acc-email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="acc-email"
                type="email"
                value={user?.email || ""}
                disabled
                className={`${inputCls} cursor-not-allowed bg-gray-50 text-gray-500`}
              />
              <p className="mt-1 text-xs text-gray-500">
                {user?.authProvider === "google"
                  ? "Managed by your Google account."
                  : "Your email can't be changed here."}
              </p>
            </div>

            <div>
              <label htmlFor="acc-name" className="mb-1 block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                id="acc-name"
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="acc-phone" className="mb-1 block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <input
                id="acc-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+234 800 000 0000"
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="acc-country" className="mb-1 block text-sm font-medium text-gray-700">
                Country
              </label>
              <select
                id="acc-country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className={`${inputCls} cursor-pointer`}
              >
                <option value="">Select country</option>
                {ALL_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>

          <div className="border-t border-gray-200 p-6">
            <h4 className="mb-1 text-sm font-semibold text-gray-900">Reminders</h4>
            <p className="mb-3 text-sm text-gray-600">
              How we tell you before a document expires.
            </p>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50">
              <input
                type="checkbox"
                checked={emailReminders}
                disabled={savingEmailPref}
                onChange={(e) => handleEmailRemindersChange(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                  <Mail className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  Email reminders
                  {savingEmailPref && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
                </span>
                <span className="mt-0.5 block text-sm text-gray-600">
                  Sent to {user?.email}. One email covering everything that needs attention, with
                  how to renew it.
                </span>
              </span>
            </label>

            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              Push notifications are a separate switch — the Reminders button in the header. Email
              is the more reliable of the two: push needs a browser permission, and on iPhone it
              only works once DriveDoc is added to your Home Screen.
            </p>
          </div>

          <div className="border-t border-gray-200 p-6">
            <h4 className="mb-1 text-sm font-semibold text-gray-900">Your data</h4>
            <p className="mb-3 text-sm text-gray-600">
              Download everything DriveDoc holds about you as a JSON file.
            </p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting ? "Preparing..." : "Download my data"}
            </button>
          </div>

          <div className="border-t border-gray-200 bg-red-50/40 p-6">
            <h4 className="mb-1 text-sm font-semibold text-red-900">Delete account</h4>
            <p className="mb-3 text-sm text-red-800">
              Permanently deletes your account, your documents and your lesson requests. This
              can't be undone.
            </p>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Delete my account
              </button>
            ) : (
              <div className="space-y-3">
                <label htmlFor="acc-confirm" className="block text-sm text-red-900">
                  Type <span className="font-mono font-semibold">DELETE</span> to confirm:
                </label>
                <input
                  id="acc-confirm"
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  autoComplete="off"
                  className="w-full rounded-lg border border-red-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-red-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setConfirmDelete(false);
                      setDeleteText("");
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteText !== "DELETE" || deleting}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    {deleting ? "Deleting..." : "Delete forever"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
