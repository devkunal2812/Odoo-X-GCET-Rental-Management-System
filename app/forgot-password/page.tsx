"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, loading, error: authError, clearError } = useAuth();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      setError("Email address is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    clearError();

    try {
      await forgotPassword({ email });
      setIsSubmitted(true);
    } catch (err) {
      setError(authError || "Failed to send reset email. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-success-600" />
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">
              Check Your Email
            </h2>
            <p className="text-secondary-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-secondary-500 mb-8">
              If you don't see the email, check your spam folder or try again with a different email address.
            </p>
            
            <div className="space-y-4">
              <Link
                href="/login"
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                Back to Login
              </Link>
              
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                className="w-full border-2 border-secondary-300 text-secondary-700 py-3 px-4 rounded-lg font-semibold hover:bg-secondary-50 transition-colors"
              >
                Try Different Email
              </button>
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
            Forgot Your Password?
          </h2>
          <p className="text-xl opacity-90 text-white">
            No worries! We'll help you reset it quickly and securely.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-white font-semibold text-sm">1</span>
              </div>
              <div>
                <p className="text-white font-medium">Enter your email address</p>
                <p className="text-white opacity-75 text-sm">The email you used to create your account</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-white font-semibold text-sm">2</span>
              </div>
              <div>
                <p className="text-white font-medium">Check your email</p>
                <p className="text-white opacity-75 text-sm">We'll send you a secure reset link</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-white font-semibold text-sm">3</span>
              </div>
              <div>
                <p className="text-white font-medium">Create new password</p>
                <p className="text-white opacity-75 text-sm">Follow the link to set a new password</p>
              </div>
            </div>
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
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-primary-100">
                <EnvelopeIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-secondary-900">
                Reset Your Password
              </h1>
              <p className="mt-2 text-secondary-600">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 text-error-600 mr-2" />
                <span className="text-error-700 text-sm">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-secondary-900 bg-white ${
                      error ? "border-error-500" : "border-secondary-300"
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors bg-primary-600 hover:bg-primary-700 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending Reset Link...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-secondary-200">
              <div className="text-center">
                <p className="text-sm text-secondary-600 mb-2">
                  Still having trouble?
                </p>
                <Link 
                  href="/contact" 
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Branding */}
          <div className="lg:hidden mt-8 text-center">
            <Link href="/" className="text-2xl font-bold text-secondary-900">
              RentMarket
            </Link>
            <p className="mt-2 text-secondary-600">
              Multi-vendor rental marketplace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}