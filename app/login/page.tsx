"use client";

import React, { useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<"customer" | "vendor" | "admin">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const router = useRouter();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login attempt:", { role: selectedRole, ...formData });
    
    // Mock authentication - redirect based on role
    if (selectedRole === "admin") {
      router.push("/admin");
    } else if (selectedRole === "vendor") {
      router.push("/dashboard");
    } else {
      router.push("/");
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
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${currentConfig.buttonColor}`}
              >
                Sign In as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
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