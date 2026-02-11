import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
import { api } from "./services/api";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (import.meta.env.DEV) {
  console.log("Google Client ID status:", googleClientId ? `Loaded (${googleClientId.substring(0, 10)}...)` : "MISSING");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId || "missing-client-id"}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

// Auto-register on load if already authenticated or token exists
// We import registerPush dynamically to avoid circular dependencies if any, 
// though moving it to a service solves that.
import { registerPush } from "./services/pushService";

if (localStorage.getItem("token")) {
    registerPush().catch(console.error);
}

export { loadScript };
