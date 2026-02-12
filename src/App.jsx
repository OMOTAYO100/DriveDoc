import { useState, useEffect, lazy, Suspense } from "react";
import LandingPage from "./components/LandingPage";
import Header from "./components/Header";
import StatsGrid from "./components/StatsGrid";
import DocumentsList from "./components/DocumentsList";
import { CATEGORIES } from "./utils/categoryMapping";
import { api } from "./services/api";
import { registerPush } from "./services/pushService";

const LoginPage = lazy(() => import("./components/auth/LoginPage"));
const SignupPage = lazy(() => import("./components/auth/SignupPage"));
const TestContainer = lazy(() => import("./components/TestContainer"));
const BookingPage = lazy(() => import("./components/booking/BookingPage"));
const AddDocumentModal = lazy(() => import("./components/AddDocumentModal"));
const PrivacyPolicy = lazy(() => import("./components/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/legal/TermsOfService"));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentAuthPage, setCurrentAuthPage] = useState("landing");
  const [isLoading, setIsLoading] = useState(true);
  
  // Dashboard state
  const [currentView, setCurrentView] = useState("dashboard");
  const [documents, setDocuments] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notificationsDenied, setNotificationsDenied] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    checkAuth();
    checkNotificationPermission();

    // Poll for new documents every 10 seconds
    const interval = setInterval(() => {
      if (isAuthenticated) {
        fetchDocuments();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("Verifying session...");
      const data = await api.getMe();
      console.log("Session verified, user:", data.user);
      setUser(data.user);
      setIsAuthenticated(true);
      fetchDocuments();
    } catch (err) {
      console.error("Session check failed:", err);
      // Only logout if token is explicitly invalid (401)
      if (err.message?.includes("401") || err.message?.includes("Invalid token") || err.message?.includes("jwt expired")) {
        console.log("Token invalid, logging out.");
        localStorage.removeItem("token");
      }
      // If it's a network error, we don't remove the token, but we can't authenticate the user yet.
      // They will see the Landing Page, which is expected behavior if backend is unreachable.
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const data = await api.getDocuments();
      if (data.success && Array.isArray(data.documents)) {
        setDocuments(data.documents);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setDocuments([]);
    }
  };

  // Initial check for browser support and block status
  const checkNotificationPermission = () => {
      if (!("Notification" in window)) {
          console.warn("This browser does not support notifications.");
          return;
      }
      if (Notification.permission === "denied") {
          setNotificationsDenied(true);
      }
      // Sync state with local storage
      const saved = localStorage.getItem("notifications_enabled");
      if (saved === "true" && Notification.permission === "granted") {
          setNotificationsEnabled(true);
      }
  };

    const handleToggleNotifications = async () => {
    try {
        console.log("Toggling notifications. Current state:", { enabled: notificationsEnabled, denied: notificationsDenied });
        
        if (notificationsEnabled) {
            console.log("Disabling notifications...");
            // Opt out in app state/local storage
            const sub = JSON.parse(localStorage.getItem("pushSubscription") || "{}");
            if (sub.endpoint) {
                await api.optOutNotifications(sub.endpoint);
                console.log("Opt-out API called.");
            }
            setNotificationsEnabled(false);
            localStorage.setItem("notifications_enabled", "false");
            console.log("Notifications disabled locally.");
        } else {
            console.log("Enabling notifications...");
            // Check browser support
            if (!("Notification" in window)) {
               alert("Your browser does not support notifications. On iPhone, you must use 'Add to Home Screen' to enable this feature.");
               return;
            }

            // Check browser permission next
            if (Notification.permission === "denied") {
                console.warn("Permission denied by browser.");
                setNotificationsDenied(true);
                alert("Notifications are blocked. Please enable them in your browser settings.");
                return;
            }

            // Register or Opt In
            console.log("Calling registerPush from service...");
            try {
                const sub = await registerPush();
                console.log("registerPush result:", sub);
                
                if (sub) {
                    setNotificationsEnabled(true);
                    setNotificationsDenied(false);
                    localStorage.setItem("notifications_enabled", "true");
                    console.log("Notifications enabled successfully.");
                }
            } catch (error) {
                console.error("Enable notifications failed:", error);
                const msg = error.message || "Unknown error";
                
                if (msg.toLowerCase().includes("permission denied")) {
                     setNotificationsDenied(true);
                     alert("Permission denied. Please enable notifications in your browser settings and refresh.");
                } else {
                     alert(`Failed to enable notifications. Error: ${msg}`);
                }
            }
        }
    } catch (err) {
        console.error("Notification toggle failed:", err);
        alert(`An error occurred while toggling notifications: ${err.message || "Unknown error"}`);
    }
  };

  const handleAuthSuccess = (data) => {
    setUser(data.user);
    setIsAuthenticated(true);
    fetchDocuments();
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView("dashboard");
    setDocuments([]);
  };

  const handleAddDocument = async (docData) => {
    try {
      const res = await api.addDocument(docData);
      if (res.success && res.document) {
        setDocuments(prev => [res.document, ...prev]);
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to add document:", error);
      alert(error.message);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.deleteDocument(id);
      setDocuments(documents.filter((doc) => doc._id !== id));
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        {currentAuthPage === "landing" ? (
          <LandingPage 
            onGetStarted={() => setCurrentAuthPage("login")} 
            onShowPrivacy={() => setCurrentAuthPage("privacy")}
            onShowTerms={() => setCurrentAuthPage("terms")}
          />
        ) : currentAuthPage === "signup" ? (
          <SignupPage
            onSignup={handleAuthSuccess}
            onSwitchToLogin={() => setCurrentAuthPage("login")}
            onShowPrivacy={() => setCurrentAuthPage("privacy")}
            onShowTerms={() => setCurrentAuthPage("terms")}
          />
        ) : currentAuthPage === "privacy" ? (
          <PrivacyPolicy onBack={() => setCurrentAuthPage("login")} />
        ) : currentAuthPage === "terms" ? (
          <TermsOfService onBack={() => setCurrentAuthPage("login")} />
        ) : (
          <LoginPage
            onLogin={handleAuthSuccess}
            onSwitchToSignup={() => setCurrentAuthPage("signup")}
            onShowPrivacy={() => setCurrentAuthPage("privacy")}
            onShowTerms={() => setCurrentAuthPage("terms")}
          />
        )}
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onAddDocument={() => setIsAddModalOpen(true)}
        notificationsEnabled={notificationsEnabled}
        notificationsDenied={notificationsDenied}
        onToggleNotifications={handleToggleNotifications}
        onStartTest={() => setCurrentView("test")}
        onBookLesson={() => setCurrentView("booking")}
        onRenewDocuments={() => alert("Renewal feature is currently disabled.")}
        onLogout={handleLogout}
        user={user}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          {currentView === "dashboard" && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  {user?.fullName ? `Welcome back, ${user.fullName.split(' ')[0]}!` : 'Dashboard'}
                </h2>
                <p className="mt-2 text-gray-600">
                  Here's an overview of your driving documents and upcoming lessons.
                </p>
              </div>

              <StatsGrid documents={documents} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <DocumentsList 
                    documents={documents} 
                    onDelete={handleDeleteDocument}
                    onAddDocument={() => setIsAddModalOpen(true)}
                  />
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Practice Theory Test
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm">
                      Select a category to start practicing for your driving theory test.
                    </p>
                    <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat.label);
                              setCurrentView("test");
                            }}
                            className="flex items-center gap-3 p-3 w-full text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                          >
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-gray-700">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => {
                          setSelectedCategory(null);
                          setCurrentView("test");
                      }} 
                      className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                    >
                      Start Full Practice Test
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {currentView === "test" && (
            <TestContainer
              initialCategory={selectedCategory}
              onComplete={() => setCurrentView("dashboard")}
              onExit={() => {
                  setSelectedCategory(null);
                  setCurrentView("dashboard");
              }}
            />
          )}
          
          {currentView === "booking" && (
            <BookingPage onBack={() => setCurrentView("dashboard")} />
          )}
        </Suspense>
      </main>

      <Suspense fallback={null}>
        {isAddModalOpen && (
          <AddDocumentModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handleAddDocument}
          />
        )}
      </Suspense>
    </div>
  );
}
