import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { resubscribeIfEnabled } from "./services/pushService";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (import.meta.env.DEV) {
  console.log(
    "Google Client ID status:",
    googleClientId ? `Loaded (${googleClientId.slice(0, 10)}...)` : "MISSING"
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={googleClientId || "missing-client-id"}>
          <App />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);

// Refresh the push subscription on load, but only for users who have actually
// turned notifications on. Never prompts.
if (localStorage.getItem("token") && localStorage.getItem("notifications_enabled") === "true") {
  resubscribeIfEnabled().catch((err) =>
    console.warn("Could not refresh push subscription:", err.message)
  );
}
