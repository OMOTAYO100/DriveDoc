import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { AuthContext } from "./auth";

/**
 * Who is signed in, for the whole app.
 *
 * Previously this lived in App.jsx and `user` was drilled down through every
 * screen that needed it. Routed pages have no parent to receive props from,
 * so it has to be context now.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (!localStorage.getItem("token")) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        if (!cancelled) setUser(data.user);
      } catch (err) {
        if (cancelled) return;
        // Only discard the token when the server actively rejects it. A
        // network blip must not sign the user out.
        if (err.status === 401) {
          localStorage.removeItem("token");
        } else {
          console.warn("Session check failed, keeping token:", err.message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback((data) => setUser(data.user), []);

  const signOut = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  /** After a profile edit or account deletion. */
  const updateUser = useCallback((next) => setUser(next), []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: Boolean(user), isLoading, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
