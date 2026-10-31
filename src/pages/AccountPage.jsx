import { useNavigate } from "react-router-dom";
import AccountModal from "../components/AccountModal";
import { useAuth } from "../context/auth";
import { useToast } from "../context/toast";

/** /account — the settings panel as a linkable route. */
export default function AccountPage() {
  const { user, updateUser, signOut } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  return (
    <AccountModal
      user={user}
      onClose={() => navigate("/dashboard")}
      onUpdated={(next) => {
        updateUser(next);
        notify("Profile updated.", "success");
      }}
      onDeleted={async () => {
        await signOut();
        navigate("/", { replace: true });
      }}
    />
  );
}
