import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth";
import LoadingScreen from "./LoadingScreen";

/**
 * Gate for the signed-in area. Remembers where the user was heading so a
 * notification deep link survives the sign-in detour.
 */
export default function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
