import { Plus, Menu, X, Bell, BellOff, UserCog } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Defined at module scope, not inside Header. A component created during
 * render is a new type on every render, so React unmounts and remounts the
 * whole subtree whenever parent state changes.
 */
function ActionButtons({
  className = "",
  onAction,
  onToggleNotifications,
  onLogout,
  notificationsEnabled,
  notificationsDenied,
}) {
  const handleClick = (action) => {
    action?.();
    onAction?.();
  };

  const NotifIcon = notificationsEnabled ? Bell : BellOff;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Link
        to="/schools"
        onClick={onAction}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-center font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
      >
        Find a School
      </Link>

      <Link
        to="/practice"
        onClick={onAction}
        className="w-full rounded-lg border border-indigo-700 bg-indigo-600 px-4 py-2 text-center text-white transition hover:bg-indigo-700 sm:w-auto"
      >
        Take Theory Test
      </Link>

      <button
        onClick={() => handleClick(onToggleNotifications)}
        disabled={notificationsDenied}
        aria-pressed={notificationsEnabled}
        title={
          notificationsDenied
            ? "Notifications are blocked in your browser settings"
            : notificationsEnabled
              ? "Turn expiry reminders off"
              : "Turn expiry reminders on"
        }
        className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 transition sm:w-auto ${
          notificationsDenied
            ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
            : notificationsEnabled
              ? "cursor-pointer border-green-700 bg-green-600 text-white hover:bg-green-700"
              : "cursor-pointer border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <NotifIcon className="h-4 w-4" aria-hidden="true" />
        {notificationsEnabled ? "Reminders on" : "Reminders off"}
      </button>

      <Link
        to="/dashboard?add=1"
        onClick={onAction}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 sm:w-auto"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add Document
      </Link>

      <Link
        to="/account"
        onClick={onAction}
        title="Account settings"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
      >
        <UserCog className="h-4 w-4" aria-hidden="true" />
        <span className="sm:hidden">Account</span>
      </Link>

      <button
        onClick={() => handleClick(onLogout)}
        className="w-full rounded-lg border border-red-200 px-4 py-2 font-medium text-red-600 transition hover:bg-red-50 sm:w-auto cursor-pointer"
      >
        Sign Out
      </button>
    </div>
  );
}

export default function Header({
  notificationsEnabled,
  notificationsDenied,
  onToggleNotifications,
  onLogout,
  user,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const actionProps = {
        onToggleNotifications,
        onLogout,
    notificationsEnabled,
    notificationsDenied,
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/dashboard" className="text-2xl font-bold text-gray-900">
              Drive<span className="text-blue-600">Doc</span>
            </Link>
            <p className="text-sm text-gray-600">
              {user?.fullName
                ? `Welcome back, ${user.fullName.split(" ")[0]}!`
                : "Your Driving Document Manager"}
            </p>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:block">
            <ActionButtons {...actionProps} />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="rounded-md p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 cursor-pointer"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Actions */}
        {isMenuOpen && (
          <div className="mt-4 pb-2 md:hidden">
            <ActionButtons
              {...actionProps}
              className="flex-col items-stretch!"
              onAction={() => setIsMenuOpen(false)}
            />
          </div>
        )}

        {notificationsDenied && (
          <div className="mt-3 text-sm text-red-600">
            Notifications are blocked for this site. Allow them in your browser's site settings,
            then reload the page.
          </div>
        )}
      </div>
    </header>
  );
}
