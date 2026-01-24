import { useState, useEffect } from "react";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import Header from "./components/Header";
import StatsGrid from "./components/StatsGrid";
import DocumentsList from "./components/DocumentsList";
import AddDocumentModal from "./components/AddDocumentModal";

import TestContainer from "./components/TestContainer";
import BookingPage from "./components/booking/BookingPage";

import { calculateStatus } from "./utils/documentHelpers";
import { api } from "./services/api";

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAuthPage, setCurrentAuthPage] = useState("login"); // 'login' or 'signup'
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard', 'test', 'booking', 'renewal'
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    !!localStorage.getItem("pushSubscription")
  );
  const [notificationsDenied, setNotificationsDenied] = useState(
    typeof Notification !== "undefined" && Notification.permission === "denied"
  );

  const fetchDocuments = async () => {
    try {
      const data = await api.getDocuments();
      if (data.success && Array.isArray(data.documents)) {
        const enhancedDocs = data.documents.map((doc) => ({
          ...doc,
          id: doc._id,
          status: calculateStatus(doc.expiryDate),
        }));
        setDocuments(enhancedDocs);
      }
    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData.user);
          setIsAuthenticated(true);
          if (window.registerPush) {
            const ok = await window.registerPush();
            setNotificationsEnabled(
              ok && !!localStorage.getItem("pushSubscription")
            );
            if (typeof Notification !== "undefined") {
              setNotificationsDenied(Notification.permission === "denied");
            }
          }
          fetchDocuments();
        } catch (error) {
          console.error("Session expired or invalid", error);
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Authentication handlers
  // Authentication handlers
  const handleLogin = (data) => {
    // data is { success: true, token: '...', user: { ... } }
    if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        // Optimistically start fetching documents
        fetchDocuments();
        
        // Handle notifications in background
        if (window.registerPush) {
            window.registerPush().then((ok) => {
            setNotificationsEnabled(
                ok && !!localStorage.getItem("pushSubscription")
            );
            if (typeof Notification !== "undefined") {
                setNotificationsDenied(Notification.permission === "denied");
            }
            });
        }
    } else {
        // Fallback if user object isn't in response (unlikely with our api)
        api.getMe().then((userData) => {
            setUser(userData.user);
            setIsAuthenticated(true);
            fetchDocuments();
        });
    }
  };

  const handleSignup = (data) => {
    // Signup also returns the user
    handleLogin(data);
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUser(null);
    setDocuments([]);
  };

  // Document handlers
  const handleAddDocument = async (formData) => {
    try {
      const response = await api.addDocument(formData);
      if (response.success) {
        const newDoc = {
          ...response.document,
          id: response.document._id,
          status: calculateStatus(response.document.expiryDate),
        };
        setDocuments([...documents, newDoc]);
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Failed to add document", error);
      alert("Failed to add document");
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      await api.deleteDocument(id);
      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Failed to delete document", error);
      alert("Failed to delete document");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Show authentication pages if not logged in
  if (!isAuthenticated) {
    return currentAuthPage === "login" ? (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToSignup={() => setCurrentAuthPage("signup")}
      />
    ) : (
      <SignupPage
        onSignup={handleSignup}
        onSwitchToLogin={() => setCurrentAuthPage("login")}
      />
    );
  }

  // Show dashboard if authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onAddDocument={() => setShowAddForm(true)}
        notificationsEnabled={notificationsEnabled}
        notificationsDenied={notificationsDenied}
        onToggleNotifications={async () => {
          const has = notificationsEnabled;
          if (has) {
            setNotificationsEnabled(false);
            if (window.optOutNotifications) {
              await window.optOutNotifications();
            }
            localStorage.removeItem("pushSubscription");
          } else {
            if (window.optInNotifications) {
              await window.optInNotifications();
              setNotificationsEnabled(true);
            } else if (window.registerPush) {
              const ok = await window.registerPush();
              setNotificationsEnabled(
                ok && !!localStorage.getItem("pushSubscription")
              );
            }
          }
        }}
        onStartTest={() => setCurrentView("test")}
        onBookLesson={() => setCurrentView("booking")}

      />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {currentView === "test" ? (
          <TestContainer onExit={() => setCurrentView("dashboard")} />
        ) : currentView === "booking" ? (
          <BookingPage onBack={() => setCurrentView("dashboard")} />

        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.fullName || "User"}!
                </h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
            <StatsGrid documents={documents} />
            <DocumentsList
              documents={documents}
              onDelete={handleDeleteDocument}
              onAddDocument={() => setShowAddForm(true)}
            />
          </>
        )}
      </main>

      <AddDocumentModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAdd={handleAddDocument}
      />
    </div>
  );
}
