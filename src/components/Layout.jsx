import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import { useAuth } from "../context/auth";
import { useToast } from "../context/toast";
import { useNotifications } from "../hooks/useNotifications";

/** Chrome for the signed-in area: header on top, routed page below. */
export default function Layout() {
  const { user, signOut } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const notifications = useNotifications(notify);

  const handleLogout = async () => {
    await signOut();
    notifications.reset();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        notificationsEnabled={notifications.enabled}
        notificationsDenied={notifications.denied}
        onToggleNotifications={notifications.toggle}
        onLogout={handleLogout}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
