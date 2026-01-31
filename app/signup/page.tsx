"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  UserIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  BuildingOfficeIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

export default function SignupPage() {
  const [userType, setUserType] = useState<"customer" | "vendor">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    gstin: "",
    password: "",
    confirmPassword: "",
    couponCode: "",
    agreeToTerms: false,
    subscribeNewsletter: false
  });

  const router = useRouter();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Company name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    // GSTIN validation for vendors
    if (userType === "vendor") {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!formData.gstin) {
        newErrors.gstin = "GSTIN is required for vendors";
      } else if (!gstinRegex.test(formData.gstin.toUpperCase())) {
        newErrors.gstin = "Please enter a valid GSTIN (15 characters)";
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful registration
      setSuccessMessage(`${userType === "customer" ? "Customer" : "Vendor"} account created successfully! Please check your email for verification.`);
      
      // Redirect after success
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      
    } catch (error) {
      setErrors({ submit: "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const userTypeConfig = {
    customer: {
      title: "Create Customer Account",
      subtitle: "Join thousands of customers renting products",
      bgColor: "from-primary-600 to-primary-700",
      buttonColor: "bg-primary-600 hover:bg-primary-700",
      benefits: [
        "Browse thousands of products",
        "Flexible rental periods",
        "Secure payment processing",
        "24/7 customer support"
      ]
    },
    vendor: {
      title: "Create Vendor Account",
      subtitle: "Start your rental business today",
      bgColor: "from-secondary-700 to-secondary-800",
      buttonColor: "bg-secondary-700 hover:bg-secondary-800",
      benefits: [
        "List unlimited products",
        "Automated order management",
        "Real-time analytics",
        "Marketing tools included"
      ]
    }
  };

  const currentConfig = userTypeConfig[userType];

  if (successMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-success-600" />
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Registration Successful!</h2>
          <p className="text-secondary-600 mb-6">{successMessage}</p>
          <div className="animate-pulse">
            <p className="text-sm text-secondary-500">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-secondary-50">
      {/* Left Side - User Type Selection & Benefits */}
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

          {/* User Type Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium opacity-75 text-white">
              I want to:
            </p>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setUserType("customer")}
                className={`text-left px-4 py-3 rounded-lg transition-all text-black ${
                  userType === "customer"
                    ? "bg-white bg-opacity-20 border-2 border-white border-opacity-50"
                    : "bg-white bg-opacity-10 border-2 border-transparent hover:bg-opacity-15"
                }`}
              >
                <span className="font-medium">Rent Products</span>
                <span className="block text-sm opacity-75">
                  Browse and rent from various vendors
                </span>
              </button>
              <button
                onClick={() => setUserType("vendor")}
                className={`text-left px-4 py-3 rounded-lg transition-all text-black ${
                  userType === "vendor"
                    ? "bg-white bg-opacity-20 border-2 border-white border-opacity-50"
                    : "bg-white bg-opacity-10 border-2 border-transparent hover:bg-opacity-15"
                }`}
              >
                <span className="font-medium">List Products</span>
                <span className="block text-sm opacity-75">
                  Start your rental business
                </span>
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <p className="text-sm font-medium opacity-75 text-white">
              What you get:
            </p>
            <ul className="space-y-2">
              {currentConfig.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-white opacity-90">
                  <CheckCircleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-sm opacity-75 text-white">
          © 2024 RentMarket. All rights reserved.
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile User Type Selection */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="text-2xl font-bold block text-center mb-4 text-secondary-900">
              RentMarket
            </Link>
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setUserType("customer")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  userType === "customer"
                    ? "text-white bg-primary-600"
                    : "border-2 border-primary-600 text-primary-600 hover:bg-primary-50"
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => setUserType("vendor")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  userType === "vendor"
                    ? "text-white bg-secondary-700"
                    : "border-2 border-secondary-700 text-secondary-700 hover:bg-secondary-50"
                }`}
              >
                Vendor
              </button>
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

            {errors.submit && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 text-error-600 mr-2" />
                <span className="text-error-700 text-sm">{errors.submit}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-secondary-900 bg-white ${
                      errors.name ? "border-error-500" : "border-secondary-300"
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-error-600">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900">
                  Email Address *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-secondary-900 bg-white ${
                      errors.email ? "border-error-500" : "border-secondary-300"
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-error-600">{errors.email}</p>
                )}
              </div>

              {/* Company Name Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900">
                  Company Name *
                </label>
                <div className="relative">
                  <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-secondary-900 bg-white ${
                      errors.companyName ? "border-error-500" : "border-secondary-300"
                    }`}
                    placeholder="Enter your company name"
                  />
                </div>
                {errors.companyName && (
                  <p className="mt-1 text-sm text-error-600">{errors.companyName}</p>
                )}
              </div>

              {/* GSTIN Field (Vendors Only) */}
              {userType === "vendor" && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary-900">
                    GSTIN *
                  </label>
                  <div className="relative">
                    <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="text"
                      required
                      value={formData.gstin}
                      onChange={(e) => handleInputChange("gstin", e.target.value.toUpperCase())}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-secondary-900 bg-white ${
                        errors.gstin ? "border-error-500" : "border-secondary-300"
                      }`}
                      placeholder="Enter your GSTIN (15 characters)"
                      maxLength={15}
                    />
                  </div>
                  {errors.gstin && (
                    <p className="mt-1 text-sm text-error-600">{errors.gstin}</p>
                  )}
                  <p className="mt-1 text-xs text-secondary-500">
                    Required for invoicing and tax compliance
                  </p>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors pr-12 text-secondary-900 bg-white ${
                      errors.password ? "border-error-500" : "border-secondary-300"
                    }`}
                    placeholder="Create a strong password"
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
                <p className="mt-1 text-xs text-secondary-500">
                  Must be 8+ characters with uppercase, lowercase, and number
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors pr-12 text-secondary-900 bg-white ${
                      errors.confirmPassword ? "border-error-500" : "border-secondary-300"
                    }`}
                    placeholder="Confirm your password"
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

              {/* Coupon Code Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900">
                  Coupon Code (Optional)
                </label>
                <div className="relative">
                  <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => handleInputChange("couponCode", e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-3 border-2 border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-secondary-900 bg-white"
                    placeholder="Enter coupon code"
                  />
                </div>
                <p className="mt-1 text-xs text-secondary-500">
                  Get special discounts and offers
                </p>
              </div>

              {/* Terms Agreement */}
              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                    className={`mr-3 mt-1 rounded ${
                      errors.agreeToTerms ? "accent-error-600" : "accent-primary-600"
                    }`}
                  />
                  <span className="text-sm text-secondary-600">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary-600 hover:underline">
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary-600 hover:underline">
                      Privacy Policy
                    </Link>
                    *
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-error-600">{errors.agreeToTerms}</p>
                )}
              </div>

              {/* Newsletter Subscription */}
              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.subscribeNewsletter}
                    onChange={(e) => handleInputChange("subscribeNewsletter", e.target.checked)}
                    className="mr-3 mt-1 rounded accent-primary-600"
                  />
                  <span className="text-sm text-secondary-600">
                    Subscribe to our newsletter for updates and special offers
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${currentConfig.buttonColor} ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  `Create ${userType === "customer" ? "Customer" : "Vendor"} Account`
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-secondary-600">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="font-medium hover:underline text-primary-600"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}