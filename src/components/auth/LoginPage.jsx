import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "../../services/api";

export default function LoginPage({ onLogin, onSwitchToSignup, onShowPrivacy, onShowTerms }) {
  const [mode, setMode] = useState("login"); // 'login' | 'forgot'
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const validateLogin = () => {
    const next = {};
    if (!formData.email) next.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) next.email = "Email is invalid";

    if (!formData.password) next.password = "Password is required";
    // Matches the signup rule. The old 6-character minimum here just produced a
    // different, more confusing error than the server's.
    else if (formData.password.length < 8) next.password = "Password must be at least 8 characters";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validateLogin()) return;

    setIsLoading(true);
    try {
      const data = await api.login(formData);
      onLogin(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setApiError("");
    setErrors({});

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: "Enter the email address on your account" });
      return;
    }

    setIsLoading(true);
    try {
      await api.forgotPassword(formData.email);
      setForgotSent(true);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // The ID-token (credential) flow. An access token can't be verified as having
  // been issued for this app, so the server only accepts a credential now.
  const handleGoogleSuccess = async (credentialResponse) => {
    setApiError("");
    setIsLoading(true);
    try {
      const data = await api.oauthGoogle(credentialResponse.credential);
      onLogin(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (hasError) =>
    `w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      hasError ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <section className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Drive<span className="text-blue-600">Doc</span>
          </h1>
          <p className="text-gray-600">
            {mode === "login" ? "Please sign in to your account" : "Reset your password"}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {mode === "forgot" ? (
            <>
              <button
                onClick={() => {
                  setMode("login");
                  setForgotSent(false);
                  setApiError("");
                  setErrors({});
                }}
                className="mb-5 flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </button>

              {forgotSent ? (
                <div className="py-4 text-center">
                  <h2 className="mb-2 text-xl font-bold text-gray-900">Check your email</h2>
                  <p className="text-sm leading-relaxed text-gray-600">
                    If an account exists for{" "}
                    <span className="font-medium text-gray-900">{formData.email}</span>, we've sent
                    a link to reset your password. It expires in an hour.
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    Didn't get it? Check your spam folder, or{" "}
                    <button
                      onClick={() => setForgotSent(false)}
                      className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      try again
                    </button>
                    .
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="mb-2 text-xl font-bold text-gray-900">Forgot your password?</h2>
                  <p className="mb-5 text-sm text-gray-600">
                    Enter your email and we'll send you a link to choose a new one.
                  </p>

                  {apiError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                      {apiError}
                    </div>
                  )}

                  <form onSubmit={handleForgot} className="space-y-4" noValidate>
                    <div>
                      <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          id="forgot-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          autoComplete="email"
                          className={inputCls(errors.email)}
                          placeholder="you@example.com"
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? "Sending..." : "Send reset link"}
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            <>
              <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Welcome back 🎉</h2>

              {apiError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {apiError}
                </div>
              )}

              {/* A real form, so Enter submits. Previously handleSubmit only ran
                  on the button's onClick and pressing Enter did nothing. */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="login-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      autoComplete="email"
                      className={inputCls(errors.email)}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      autoComplete="current-password"
                      className={`${inputCls(errors.password)} pr-12`}
                      placeholder="Enter your password"
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

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setApiError("");
                      setErrors({});
                    }}
                    className="text-sm font-medium text-blue-600 transition hover:text-blue-700 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google's own button. It returns a verifiable ID token and keeps
                  the mark correct, rather than a hand-copied SVG path. */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setApiError("Google sign-in failed. Please try again.")}
                  useOneTap={false}
                  width="320"
                  text="continue_with"
                  shape="rectangular"
                />
              </div>

              <p className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={onSwitchToSignup}
                  className="font-semibold text-blue-600 transition hover:text-blue-700 cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            </>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2026 DriveDoc. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <button
              onClick={onShowPrivacy}
              className="text-xs underline transition hover:text-blue-600 cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={onShowTerms}
              className="text-xs underline transition hover:text-blue-600 cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
