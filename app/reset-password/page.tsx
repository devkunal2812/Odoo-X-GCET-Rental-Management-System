"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword, loading, error: authError, clearError } = useAuth();
  
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setErrors({ token: 'Invalid or missing reset token' });
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setErrors({ token: 'Invalid reset token' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    clearError();
    setErrors({});

    try {
      await resetPassword({ token, newPassword: password });
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?message=Password reset successful. Please login with your new password.');
      }, 3000);
    } catch (err) {
      setErrors({ submit: authError || 'Failed to reset password. Please try again.' });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-success-600" />
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">Password Reset Successful!</h2>
            <p className="text-secondary-600 mb-6">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            <div className="animate-pulse">
              <p className="text-sm text-secondary-500">Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-secondary-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-700 p-12 flex-col justify-between">
        <div>
          <Link href="/" className="text-3xl font-bold text-white">
            RentMarket
          </Link>
          <p className="mt-4 text-lg opacity-90 text-white">
            Multi-vendor rental marketplace platform
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-white">
            Create New Password
          </h2>
          <p className="text-xl opacity-90 text-white">
            Choose a strong password to secure your account
          </p>
          
          <div className="space-y-3 bg-white bg-opacity-10 rounded-lg p-4">
            <p className="text-white font-medium text-sm">Password Requirements:</p>
            <ul className="space-y-2 text-white opacity-90 text-sm">
              <li className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                At least 8 characters long
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Contains uppercase letter
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Contains lowercase letter
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Contains number
              </li>
            </ul>
          </div>
        </div>

        <div className="text-sm opacity-75 text-white">
          © 2024 RentMarket. All rights reserved.
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-primary-100">
                <LockClosedIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-secondary-900">
                Reset Your Password
              </h1>
              <p className="mt-2 text-secondary-600">
                Enter your new password below
              </p>
            </div>

            {/* Error Messages */}
            {errors.token && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 text-error-600 mr-2" />
                <span className="text-error-700 text-sm">{errors.token}</span>
              </div>
            )}

            {errors.submit && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 text-error-600 mr-2" />
                <span className="text-error-700 text-sm">{errors.submit}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: '' }));
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors pr-12 text-secondary-900 bg-white ${
                      errors.password ? "border-error-500" : "border-secondary-300"
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-500"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-error-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors pr-12 text-secondary-900 bg-white ${
                      errors.confirmPassword ? "border-error-500" : "border-secondary-300"
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-500"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-error-600">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors bg-primary-600 hover:bg-primary-700 ${
                  (loading || !token) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Resetting Password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="text-sm text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
