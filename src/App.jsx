import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import { api } from "./services/api";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentAuthPage, setCurrentAuthPage] = useState("landing");
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
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
      } catch (err) {
        if (!err.message?.includes("401")) {
          console.error("Session check failed:", err);
        }
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleAuthSuccess = (data) => {
    setUser(data.user);
    setIsAuthenticated(true);
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
          onShowPrivacy={() => {}}
          onShowTerms={() => {}}
        />
      );
    }

    return (
      <LoginPage
        onLogin={handleAuthSuccess}
        onSwitchToSignup={() => setCurrentAuthPage("signup")}
        onShowPrivacy={() => {}}
        onShowTerms={() => {}}
      />
    );
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1 className="text-3xl font-bold">Dashboard (Login Success!)</h1>
      <button 
        onClick={() => setIsAuthenticated(false)}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}
