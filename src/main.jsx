import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
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
    <GoogleOAuthProvider clientId={googleClientId || "missing-client-id"}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);

// Refresh the push subscription on load, but only for users who have actually
// turned notifications on. The previous version called registerPush() for
// anyone holding a token, which prompted for permission without a user gesture
// and re-enabled a subscription the user had just opted out of.
if (localStorage.getItem("token") && localStorage.getItem("notifications_enabled") === "true") {
  resubscribeIfEnabled().catch((err) =>
    console.warn("Could not refresh push subscription:", err.message)
  );
}
