"use client";

import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<"customer" | "vendor" | "admin">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading, error, clearError, isAuthenticated } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  // Check for success message from URL
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      alert('Please enter your email address first.');
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(result.message);
        clearError();
      } else {
        alert(result.error || 'Failed to resend verification email.');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);
    
    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      
      // Show success notification based on role
      const roleMessage = selectedRole === 'admin' 
        ? 'Redirecting to Admin Dashboard...'
        : selectedRole === 'vendor'
        ? 'Redirecting to Vendor Portal...'
        : 'Redirecting to Home...';
      
      setSuccessMessage(roleMessage);
      
      // Redirect handled automatically by AuthContext based on user role
    } catch (err) {
      // Error is stored in error state and displayed below
      console.error('Login failed:', err);
    }
  };

  const roleConfig = {
    customer: {
      title: "Customer Login",
      subtitle: "Access your rental account",
      bgColor: "from-primary-600 to-primary-700",
      buttonColor: "bg-primary-600 hover:bg-primary-700"
    },
    vendor: {
      title: "Vendor Login", 
      subtitle: "Manage your rental business",
      bgColor: "from-secondary-700 to-secondary-800",
      buttonColor: "bg-secondary-700 hover:bg-secondary-800"
    },
    admin: {
      title: "Admin Login",
      subtitle: "System administration panel",
      bgColor: "from-secondary-800 to-secondary-900", 
      buttonColor: "bg-secondary-800 hover:bg-secondary-900"
    }
  };

  const currentConfig = roleConfig[selectedRole];

  return (
   <>
    <div className="min-h-screen flex bg-secondary-50">
      {/* Left Side - Role Selection & Branding */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${currentConfig.bgColor} p-12 flex-col justify-between`}>
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
            {currentConfig.title}
          </h2>
          <p className="text-xl opacity-90 text-white">
            {currentConfig.subtitle}
          </p>

          {/* Role Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium opacity-75 text-white">
              Select your role:
            </p>
            <div className="flex flex-col space-y-2">
              {(["customer", "vendor", "admin"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`text-left px-4 py-2 rounded-lg transition-all text-black ${
                    selectedRole === role
                      ? "bg-white bg-opacity-20 border-2 border-white border-opacity-50"
                      : "bg-white bg-opacity-10 border-2 border-transparent hover:bg-opacity-15"
                  }`}
                >
                  <span className="font-medium capitalize">{role}</span>
                  <span className="block text-sm opacity-75">
                    {role === "customer" && "Browse and rent products"}
                    {role === "vendor" && "Manage your inventory"}
                    {role === "admin" && "System administration"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-sm opacity-75 text-white">
          © 2024 RentMarket. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Role Selection */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="text-2xl font-bold block text-center mb-4 text-secondary-900">
              RentMarket
            </Link>
            <div className="flex space-x-2 mb-6">
              {(["customer", "vendor", "admin"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedRole === role
                      ? "text-white bg-primary-600"
                      : "border-2 border-primary-600 text-primary-600 hover:bg-primary-50"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-secondary-600">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-secondary-900">
                {currentConfig.title}
              </h1>
              <p className="mt-2 text-secondary-600">
                {currentConfig.subtitle}
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
                {error.includes('verify your email') && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-red-600 text-xs mb-2">
                      Haven't received the verification email?
                    </p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-secondary-900 bg-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("password", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors pr-12 text-secondary-900 bg-white"
                    placeholder="Enter your password"
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
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("rememberMe", e.target.checked)}
                    className="mr-2 rounded accent-primary-600"
                  />
                  <span className="text-sm text-secondary-600">
                    Remember me
                  </span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm hover:underline text-primary-600"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${currentConfig.buttonColor} ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
                )}
              </button>
            </form>

            {selectedRole === "customer" && (
              <div className="mt-6 text-center">
                <p className="text-sm text-secondary-600">
                  Don't have an account?{" "}
                  <Link 
                    href="/signup" 
                    className="font-medium hover:underline text-primary-600"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            )}

            {(selectedRole === "vendor" || selectedRole === "admin") && (
              <div className="mt-6 text-center">
                <p className="text-sm text-secondary-600">
                  {selectedRole === "vendor" ? "Want to become a vendor?" : "Need admin access?"}{" "}
                  <Link 
                    href={selectedRole === "vendor" ? "/signup" : "/contact"} 
                    className="font-medium hover:underline text-primary-600"
                  >
                    {selectedRole === "vendor" ? "Sign up" : "Contact administrator"}
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
   </>
  );
}