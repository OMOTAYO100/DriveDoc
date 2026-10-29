import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import LandingPage from "./components/LandingPage";
import Header from "./components/Header";
import StatsGrid from "./components/StatsGrid";
import DocumentsList from "./components/DocumentsList";
import Toast from "./components/Toast";
import { CATEGORIES } from "./utils/categoryMapping";
import { api } from "./services/api";
import {
  registerPush,
  unregisterPush,
  isPushSupported,
  isIosSafari,
  isStandalone,
} from "./services/pushService";

const LoginPage = lazy(() => import("./components/auth/LoginPage"));
const SignupPage = lazy(() => import("./components/auth/SignupPage"));
const ResetPasswordPage = lazy(() => import("./components/auth/ResetPasswordPage"));
const TestContainer = lazy(() => import("./components/TestContainer"));
const SchoolsPage = lazy(() => import("./components/schools/SchoolsPage"));
const AddDocumentModal = lazy(() => import("./components/AddDocumentModal"));
const AccountModal = lazy(() => import("./components/AccountModal"));
const RenewalGuideModal = lazy(() => import("./components/RenewalGuideModal"));
const PrivacyPolicy = lazy(() => import("./components/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/legal/TermsOfService"));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div
      className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      role="status"
      aria-label="Loading"
    />
  </div>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentAuthPage, setCurrentAuthPage] = useState("landing");
  const [resetToken, setResetToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dashboard state
  const [currentView, setCurrentView] = useState("dashboard");
  const [documents, setDocuments] = useState([]);
  const [documentsError, setDocumentsError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [renewalDocument, setRenewalDocument] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notificationsDenied, setNotificationsDenied] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, tone = "info") => setToast({ message, tone }), []);

  const fetchDocuments = useCallback(async () => {
    try {
      const data = await api.getDocuments();
      if (data.success && Array.isArray(data.documents)) {
        setDocuments(data.documents);
        setDocumentsError("");
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      // Keep whatever is already on screen. Clearing the list here is what made
      // a transient error look like the user's documents had been deleted.
      setDocumentsError(error.message);
    }
  }, []);

  // One-time boot: pick up a password reset link, verify the session, and read
  // the notification permission state.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("reset");
    if (token) {
      setResetToken(token);
      setCurrentAuthPage("reset");
      // Drop the token from the address bar so it isn't shared or re-used.
      window.history.replaceState({}, "", window.location.pathname);
    }

    if ("Notification" in window) {
      if (Notification.permission === "denied") setNotificationsDenied(true);
      if (
        localStorage.getItem("notifications_enabled") === "true" &&
        Notification.permission === "granted"
      ) {
        setNotificationsEnabled(true);
      }
    }

    let cancelled = false;
    const checkAuth = async () => {
      if (!localStorage.getItem("token")) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        if (cancelled) return;
        setUser(data.user);
        setIsAuthenticated(true);
        fetchDocuments();
      } catch (err) {
        if (cancelled) return;
        // Only discard the token when the server actively rejects it. A network
        // blip must not sign the user out.
        if (err.status === 401) {
          localStorage.removeItem("token");
        } else {
          console.warn("Session check failed, keeping token:", err.message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [fetchDocuments]);

  // Refresh when the tab regains focus, instead of polling every 10 seconds.
  // The old poll sent 90 requests per 15 minutes and tripped the rate limiter
  // on its own.
  useEffect(() => {
    if (!isAuthenticated) return;

    const onFocus = () => {
      if (document.visibilityState === "visible") fetchDocuments();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [isAuthenticated, fetchDocuments]);

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      try {
        await unregisterPush();
        setNotificationsEnabled(false);
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
      setNotificationsDenied(true);
      notify("Notifications are blocked in your browser settings. Unblock them, then try again.", "error");
      return;
    }

    try {
      await registerPush();
      setNotificationsEnabled(true);
      setNotificationsDenied(false);
      localStorage.setItem("notifications_enabled", "true");
      notify("Reminders are on. We'll tell you before anything expires.", "success");
    } catch (error) {
      if (error.code === "permission-denied") {
        setNotificationsDenied(true);
        notify("You declined notifications. Allow them in your browser settings to turn reminders on.", "error");
      } else {
        notify(error.message, "error");
      }
    }
  };

  const handleAuthSuccess = (data) => {
    setUser(data.user);
    setIsAuthenticated(true);
    setResetToken(null);
    setCurrentAuthPage("landing");
    fetchDocuments();
  };

  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView("dashboard");
    setCurrentAuthPage("landing");
    setDocuments([]);
    setNotificationsEnabled(false);
  };

  const handleSaveDocument = async (docData) => {
    // Throws on failure so the modal can keep the user's input on screen.
    if (editingDocument) {
      const res = await api.updateDocument(editingDocument._id, docData);
      setDocuments((prev) => prev.map((d) => (d._id === res.document._id ? res.document : d)));
      notify("Document updated.", "success");
    } else {
      const res = await api.addDocument(docData);
      setDocuments((prev) => [res.document, ...prev]);
      notify("Document added.", "success");
    }
    setIsAddModalOpen(false);
    setEditingDocument(null);
  };

  const handleDeleteDocument = async (id) => {
    const doc = documents.find((d) => d._id === id);
    if (!window.confirm(`Delete your ${doc?.type || "document"}? This can't be undone.`)) return;
    try {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      notify("Document deleted.", "success");
    } catch (error) {
      notify(`Couldn't delete that document: ${error.message}`, "error");
    }
  };

  const handleEditDocument = (doc) => {
    setEditingDocument(doc);
    setIsAddModalOpen(true);
  };

  const handleAccountUpdated = (updatedUser) => {
    setUser(updatedUser);
    notify("Profile updated.", "success");
  };

  const handleAccountDeleted = () => {
    setIsAuthenticated(false);
    setUser(null);
    setDocuments([]);
    setIsAccountOpen(false);
    setCurrentAuthPage("landing");
  };

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    const legalProps = {
      onShowPrivacy: () => setCurrentAuthPage("privacy"),
      onShowTerms: () => setCurrentAuthPage("terms"),
    };

    return (
      <>
        <Suspense fallback={<LoadingSpinner />}>
          {currentAuthPage === "landing" ? (
            <LandingPage onGetStarted={() => setCurrentAuthPage("login")} {...legalProps} />
          ) : currentAuthPage === "signup" ? (
            <SignupPage
              onSignup={handleAuthSuccess}
              onSwitchToLogin={() => setCurrentAuthPage("login")}
              {...legalProps}
            />
          ) : currentAuthPage === "reset" ? (
            <ResetPasswordPage
              token={resetToken}
              onReset={handleAuthSuccess}
              onBackToLogin={() => {
                setResetToken(null);
                setCurrentAuthPage("login");
              }}
            />
          ) : currentAuthPage === "privacy" ? (
            <PrivacyPolicy onBack={() => setCurrentAuthPage("login")} />
          ) : currentAuthPage === "terms" ? (
            <TermsOfService onBack={() => setCurrentAuthPage("login")} />
          ) : (
            <LoginPage
              onLogin={handleAuthSuccess}
              onSwitchToSignup={() => setCurrentAuthPage("signup")}
              {...legalProps}
            />
          )}
        </Suspense>
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onAddDocument={() => {
          setEditingDocument(null);
          setIsAddModalOpen(true);
        }}
        notificationsEnabled={notificationsEnabled}
        notificationsDenied={notificationsDenied}
        onToggleNotifications={handleToggleNotifications}
        onStartTest={() => setCurrentView("test")}
        onFindSchool={() => setCurrentView("schools")}
        onOpenAccount={() => setIsAccountOpen(true)}
        onLogout={handleLogout}
        user={user}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user && user.profileComplete === false && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-900">
              Add your phone number and country so we can reach you about reminders.
            </p>
            <button
              onClick={() => setIsAccountOpen(true)}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-700 cursor-pointer"
            >
              Finish profile
            </button>
          </div>
        )}

        <Suspense fallback={<LoadingSpinner />}>
          {currentView === "dashboard" && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  {user?.fullName ? `Welcome back, ${user.fullName.split(" ")[0]}!` : "Dashboard"}
                </h2>
                <p className="mt-2 text-gray-600">
                  Here's an overview of your driving documents and upcoming lessons.
                </p>
              </div>

              {documentsError && (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-800">
                    Couldn't refresh your documents: {documentsError}
                  </p>
                  <button
                    onClick={fetchDocuments}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 cursor-pointer"
                  >
                    Try again
                  </button>
                </div>
              )}

              <StatsGrid documents={documents} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <DocumentsList
                    documents={documents}
                    onDelete={handleDeleteDocument}
                    onEdit={handleEditDocument}
                    onShowRenewal={setRenewalDocument}
                    onAddDocument={() => {
                      setEditingDocument(null);
                      setIsAddModalOpen(true);
                    }}
                  />
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Practice Theory Test</h2>
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
                            className="flex items-center gap-3 p-3 w-full text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
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
                      className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium cursor-pointer"
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

          {currentView === "schools" && <SchoolsPage onBack={() => setCurrentView("dashboard")} />}
        </Suspense>
      </main>

      <Suspense fallback={null}>
        {isAddModalOpen && (
          <AddDocumentModal
            isOpen={isAddModalOpen}
            document={editingDocument}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingDocument(null);
            }}
            onSave={handleSaveDocument}
          />
        )}
        {renewalDocument && (
          <RenewalGuideModal document={renewalDocument} onClose={() => setRenewalDocument(null)} />
        )}
        {isAccountOpen && (
          <AccountModal
            user={user}
            onClose={() => setIsAccountOpen(false)}
            onUpdated={handleAccountUpdated}
            onDeleted={handleAccountDeleted}
          />
        )}
      </Suspense>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
