import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import { api } from "./services/api";
import PrivacyPolicy from "./components/legal/PrivacyPolicy";
import TermsOfService from "./components/legal/TermsOfService";
import Header from "./components/Header";
import StatsGrid from "./components/StatsGrid";
import DocumentsList from "./components/DocumentsList";
import CategorySelection from "./components/CategorySelection";
import TestContainer from "./components/TestContainer";
import BookingPage from "./components/booking/BookingPage";
import AddDocumentModal from "./components/AddDocumentModal";

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
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setIsAuthenticated(true);
      fetchDocuments();
    } catch (err) {
      if (!err.message?.includes("401")) {
        console.error("Session check failed:", err);
      }
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const data = await api.getDocuments();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  const checkNotificationPermission = () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
    } else if (Notification.permission === "denied") {
      setNotificationsDenied(true);
    }
  };

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      if (window.optOutNotifications) await window.optOutNotifications();
      setNotificationsEnabled(false);
    } else {
      if (window.registerPush) {
        const success = await window.registerPush();
        if (success) setNotificationsEnabled(true);
        else if (Notification.permission === "denied") setNotificationsDenied(true);
      }
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
      if (res.success) {
        setDocuments([...documents, res.data]);
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
    if (currentAuthPage === "landing") {
      return <LandingPage onGetStarted={() => setCurrentAuthPage("login")} />;
    }

    if (currentAuthPage === "signup") {
      return (
        <SignupPage
          onSignup={handleAuthSuccess}
          onSwitchToLogin={() => setCurrentAuthPage("login")}
          onShowPrivacy={() => setCurrentAuthPage("privacy")}
          onShowTerms={() => setCurrentAuthPage("terms")}
        />
      );
    }

    if (currentAuthPage === "privacy") {
      return <PrivacyPolicy onBack={() => setCurrentAuthPage("login")} />;
    }

    if (currentAuthPage === "terms") {
      return <TermsOfService onBack={() => setCurrentAuthPage("login")} />;
    }

    return (
      <LoginPage
        onLogin={handleAuthSuccess}
        onSwitchToSignup={() => setCurrentAuthPage("signup")}
        onShowPrivacy={() => setCurrentAuthPage("privacy")}
        onShowTerms={() => setCurrentAuthPage("terms")}
      />
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
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" && (
          <>
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
                  <CategorySelection
                    onSelect={(category) => {
                      setSelectedCategory(category);
                      setCurrentView("test");
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === "test" && (
          <TestContainer
            category={selectedCategory}
            onComplete={() => setCurrentView("dashboard")}
            onBack={() => setCurrentView("dashboard")}
          />
        )}
        
        {currentView === "booking" && (
          <BookingPage onBack={() => setCurrentView("dashboard")} />
        )}
      </main>

      {isAddModalOpen && (
        <AddDocumentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddDocument}
        />
      )}
    </div>
  );
}
