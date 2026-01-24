import { Plus, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header({
  onAddDocument,
  notificationsEnabled,
  notificationsDenied,
  onToggleNotifications,
  onStartTest,
  onBookLesson,
  onRenewDocuments,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const ActionButtons = ({ className = "", onAction }) => {
    const handleClick = (action) => {
      action?.();
      onAction?.();
    };

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <button
          onClick={() => handleClick(onBookLesson)}
          className="w-full sm:w-auto px-4 py-2 rounded-lg transition border bg-white text-gray-700 hover:bg-gray-50 border-gray-300 font-medium"
        >
          Book Lesson
        </button>

        <button
          onClick={() => handleClick(onStartTest)}
          className="w-full sm:w-auto px-4 py-2 rounded-lg transition border bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-700"
        >
          Take Theory Test
        </button>
        <button
          onClick={() => handleClick(onToggleNotifications)}
          disabled={notificationsDenied}
          className={`w-full sm:w-auto px-4 py-2 rounded-lg transition border ${
            notificationsDenied
              ? "bg-gray-300 text-gray-600 cursor-not-allowed border-gray-400"
              : notificationsEnabled
              ? "bg-green-600 text-white hover:bg-green-700 border-green-700"
              : "bg-red-600 text-white hover:bg-red-700 border-red-700"
          }`}
        >
          {notificationsEnabled ? "Notifications: ON" : "Notifications: OFF"}
        </button>
        <button
          onClick={() => handleClick(onAddDocument)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DriveDoc</h1>
            <p className="text-sm text-gray-600">
              Your Driving Document Manager
            </p>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:block">
            <ActionButtons />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
          <div className="md:hidden mt-4 pb-2">
            <ActionButtons 
              className="flex-col !items-stretch" 
              onAction={() => setIsMenuOpen(false)}
            />
          </div>
        )}

        {notificationsDenied && (
          <div className="mt-3 text-sm text-red-600">
            Notifications are blocked in your browser. Enable them in Page
            Info/Site settings, then refresh.
          </div>
        )}
      </div>
    </header>
  );
}
