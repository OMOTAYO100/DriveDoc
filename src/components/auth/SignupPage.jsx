import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { ALL_COUNTRIES } from '../../utils/countryData';
import { api } from '../../services/api';

export default function SignupPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const onSignup = (data) => {
    signIn(data);
    navigate("/dashboard", { replace: true });
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s()+-]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Consent is now required and recorded. The checkbox used to be
    // uncontrolled and never validated, so nobody had actually agreed to
    // anything we could point to later.
    if (!termsAccepted) {
      newErrors.terms = 'Please accept the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const data = await api.signup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        country: formData.country,
        password: formData.password,
        termsAccepted: true
      });
      onSignup(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setApiError('');
    setIsLoading(true);
    try {
      const data = await api.oauthGoogle(credentialResponse.credential);
      onSignup(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (hasError, pr = 'pr-4') =>
    `w-full pl-10 ${pr} py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Drive<span className="text-blue-600">Doc</span>
          </h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {/* Signup Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Create Account</h2>

          {apiError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="su-name" className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="su-name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  autoComplete="name"
                  className={inputCls(errors.fullName)}
                  placeholder="Jane Doe"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="su-email" className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="su-email"
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

            {/* Phone */}
            <div>
              <label htmlFor="su-phone" className="mb-2 block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="su-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  autoComplete="tel"
                  className={inputCls(errors.phone)}
                  placeholder="+234 800 000 0000"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* Country — the same full list used when adding a document, so a
                user whose country is supported for documents can also sign up. */}
            <div>
              <label htmlFor="su-country" className="mb-2 block text-sm font-medium text-gray-700">
                Country
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  id="su-country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  autoComplete="country-name"
                  className={`${inputCls(errors.country)} cursor-pointer`}
                >
                  <option value="">Select your country</option>
                  {ALL_COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="su-password" className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="su-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="new-password"
                  className={inputCls(errors.password, 'pr-12')}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Use at least 8 characters with an uppercase letter, a lowercase letter and a number.
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="su-confirm" className="mb-2 block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="su-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                  className={inputCls(errors.confirmPassword, 'pr-12')}
                  placeholder="Type your password again"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="font-medium text-blue-600 transition hover:text-blue-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="font-medium text-blue-600 transition hover:text-blue-700">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms && <p className="mt-1 text-sm text-red-500">{errors.terms}</p>}
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
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

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setApiError('Google sign-up failed. Please try again.')}
              useOneTap={false}
              width="320"
              text="signup_with"
              shape="rectangular"
            />
          </div>
          <p className="mt-3 text-center text-xs text-gray-500">
            Continuing with Google means you accept our Terms of Service and Privacy Policy.
          </p>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 transition hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2026 DriveDoc. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/privacy" className="underline transition hover:text-blue-600">
              Privacy Policy
            </Link>
            <Link to="/terms" className="underline transition hover:text-blue-600">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
