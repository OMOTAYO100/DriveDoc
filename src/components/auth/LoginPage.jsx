import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { api } from "../../services/api";
import { loadScript } from "../../utils/loadScript";

const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

export default function LoginPage({ onLogin, onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isFbSdkLoaded, setIsFbSdkLoaded] = useState(false);

  useEffect(() => {
    const initFacebook = async () => {
      if (!facebookAppId) return;

      try {
        if (!window.FB) {
          await loadScript("https://connect.facebook.net/en_US/sdk.js");
        }

        if (window.FB) {
          window.FB.init({
            appId: facebookAppId,
            cookie: true,
            xfbml: true,
            version: "v18.0",
          });
          setIsFbSdkLoaded(true);
        }
      } catch (e) {
        console.error("Failed to load Facebook SDK", e);
      }
    };
    initFacebook();
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        setApiError("");
        const data = await api.oauthGoogle(tokenResponse.access_token);
        onLogin(data);
      } catch (err) {
        setApiError(err.message || "Google sign-in failed.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setApiError("Google sign-in failed.");
      setIsLoading(false);
    },
  });

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      setApiError("");

      if (!facebookAppId) {
        throw new Error("Facebook App ID is not configured");
      }

      if (!isFbSdkLoaded && !window.FB) {
        throw new Error(
          "Facebook SDK not ready. Please try again in a moment."
        );
      }

      window.FB.login(
        (response) => {
          (async () => {
            if (response.authResponse) {
              try {
                const data = await api.oauthFacebook(
                  response.authResponse.accessToken
                );
                onLogin(data);
              } catch (err) {
                setApiError(err.message || "Facebook backend auth failed.");
              }
            } else {
              setIsLoading(false);
            }
          })();
        },
        { scope: "email,public_profile" }
      );
    } catch (err) {
      setApiError(err.message || "Facebook sign-in failed.");
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    setApiError("");
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      setApiError("");

      try {
        const data = await api.login(formData);
        onLogin(data);
      } catch (err) {
        setApiError(
          err.message || "Login failed. Please check your credentials."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-2">
            Drive<span className="text-blue-400">Doc</span>
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Manage your driving documents effortlessly
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-16">
          <div className="max-w-3xl text-center md:text-left">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-blue-600 leading-tight">
              Never Miss a Car Document Deadline Again
            </h1>

            <p className="text-gray-500 mt-4 text-base md:text-xl max-w-2xl mx-auto md:mx-0">
              From insurance to licenses, Drive
              <span className="text-blue-400">Doc</span> tracks your car-related
              documents and sends smart reminders before they expire.
            </p>

            <button className="mt-8 inline-flex items-center justify-center rounded-xl bg-blue-400 px-8 py-3 md:py-4 text-base font-semibold text-white shadow-lg transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-auto">
              Get Started for Free
            </button>
          </div>

          <div className="w-full max-w-md">
            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl text-center font-bold text-gray-900 mb-6">
                Welcome Back🎉
              </h2>

              {apiError && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm border border-red-200">
                  {apiError}
                </div>
              )}

              <div className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Remember me
                    </span>
                  </label>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => googleLogin()}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Google
                    </span>
                  </button>
                  <button
                    onClick={handleFacebookLogin}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Facebook
                    </span>
                  </button>
                </div>
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account?{" "}
                <button
                  onClick={onSwitchToSignup}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8 md:mt-12">
          © 2026 DriveDoc. All rights reserved.
        </p>
      </div>
    </section>
  );
}
