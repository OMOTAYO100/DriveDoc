import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/auth";
import { ToastProvider } from "./context/ToastProvider";
import RequireAuth from "./components/RequireAuth";
import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";
import LandingPage from "./components/LandingPage";
import Dashboard from "./pages/Dashboard";

const LoginPage = lazy(() => import("./components/auth/LoginPage"));
const SignupPage = lazy(() => import("./components/auth/SignupPage"));
const ResetPasswordPage = lazy(() => import("./components/auth/ResetPasswordPage"));
const TestContainer = lazy(() => import("./components/TestContainer"));
const SchoolsPage = lazy(() => import("./components/schools/SchoolsPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const PrivacyPolicy = lazy(() => import("./components/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/legal/TermsOfService"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** `/` is the landing page when signed out and the dashboard when signed in. */
function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

/** Keeps a signed-in user off the sign-in screens. */
function GuestOnly({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
            <Route path="/signup" element={<GuestOnly><SignupPage /></GuestOnly>} />
            {/* The reset link from the email lands here: /reset-password?token=… */}
            <Route
              path="/reset-password"
              element={<GuestOnly><ResetPasswordPage /></GuestOnly>}
            />

            {/* Signed in */}
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Deep link from an expiry notification. */}
                <Route path="/documents/:documentId" element={<Dashboard />} />
                <Route path="/practice" element={<TestContainer />} />
                <Route path="/schools" element={<SchoolsPage />} />
                <Route path="/account" element={<AccountPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  );
}
