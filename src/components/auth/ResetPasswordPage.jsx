import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { api } from "../../services/api";

export default function ResetPasswordPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // The emailed link lands here as /reset-password?token=...
  const token = searchParams.get("token") || "";

  const onReset = (data) => {
    signIn(data);
    navigate("/dashboard", { replace: true });
  };

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!password) next.password = "Please choose a new password";
    else if (password.length < 8) next.password = "Password must be at least 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      next.password = "Password must contain uppercase, lowercase, and a number";

    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = await api.resetPassword(token, password);
      onReset(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (hasError) =>
    `w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      hasError ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <section className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Drive<span className="text-blue-600">Doc</span>
          </h1>
          <p className="text-gray-600">Choose a new password</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {apiError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-gray-700">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className={inputCls(errors.password)}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-gray-700">
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className={inputCls(errors.confirmPassword)}
                  placeholder="Type it again"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Saving..." : "Set new password"}
            </button>
          </form>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-gray-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            You'll be signed in automatically once it's saved.
          </p>

          <p className="mt-4 text-center text-sm text-gray-600">
            <Link to="/login" className="font-semibold text-blue-600 transition hover:text-blue-700">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
