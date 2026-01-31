"use client";

import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

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

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login attempt:", { role: selectedRole, ...formData });
    
    // Mock authentication - redirect based on role
    if (selectedRole === "admin" || selectedRole === "vendor") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  const roleConfig = {
    customer: {
      title: "Customer Login",
      subtitle: "Access your rental account",
      bgColor: "from-blue-slate to-dusty-denim",
      buttonColor: "bg-blue-slate hover:bg-deep-space-blue"
    },
    vendor: {
      title: "Vendor Login", 
      subtitle: "Manage your rental business",
      bgColor: "from-deep-space-blue to-blue-slate",
      buttonColor: "bg-deep-space-blue hover:bg-blue-slate"
    },
    admin: {
      title: "Admin Login",
      subtitle: "System administration panel",
      bgColor: "from-ink-black to-deep-space-blue", 
      buttonColor: "bg-ink-black hover:bg-deep-space-blue"
    }
  };

  const currentConfig = roleConfig[selectedRole];

  return (
   <>
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--eggshell)" }}>
      {/* Left Side - Role Selection & Branding */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${currentConfig.bgColor} p-12 flex-col justify-between`}>
        <div>
          <Link href="/" className="text-3xl font-bold" style={{ color: "var(--eggshell)" }}>
            RentMarket
          </Link>
          <p className="mt-4 text-lg opacity-90" style={{ color: "var(--eggshell)" }}>
            Multi-vendor rental marketplace platform
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold" style={{ color: "var(--eggshell)" }}>
            {currentConfig.title}
          </h2>
          <p className="text-xl opacity-90" style={{ color: "var(--eggshell)" }}>
            {currentConfig.subtitle}
          </p>

          {/* Role Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium opacity-75" style={{ color: "var(--eggshell)" }}>
              Select your role:
            </p>
            <div className="flex flex-col space-y-2">
              {(["customer", "vendor", "admin"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`text-left px-4 py-2 rounded-lg transition-all ${
                    selectedRole === role
                      ? "bg-white bg-opacity-20 border-2 border-white border-opacity-50"
                      : "bg-white bg-opacity-10 border-2 border-transparent hover:bg-opacity-15"
                  }`}
                  style={{ color: "var(--eggshell)" }}
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

        <div className="text-sm opacity-75" style={{ color: "var(--eggshell)" }}>
          © 2024 RentMarket. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Role Selection */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="text-2xl font-bold block text-center mb-4" style={{ color: "var(--ink-black)" }}>
              RentMarket
            </Link>
            <div className="flex space-x-2 mb-6">
              {(["customer", "vendor", "admin"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedRole === role
                      ? "text-white"
                      : "border-2 hover:bg-opacity-10"
                  }`}
                  style={{
                    backgroundColor: selectedRole === role ? "var(--blue-slate)" : "transparent",
                    borderColor: "var(--blue-slate)",
                    color: selectedRole === role ? "var(--eggshell)" : "var(--blue-slate)"
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8" style={{ backgroundColor: "white" }}>
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" 
                   style={{ backgroundColor: "var(--dusty-denim)" }}>
                <UserIcon className="w-8 h-8" style={{ color: "var(--eggshell)" }} />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--ink-black)" }}>
                {currentConfig.title}
              </h1>
              <p className="mt-2" style={{ color: "var(--blue-slate)" }}>
                {currentConfig.subtitle}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--ink-black)" }}>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={{ 
                      borderColor: "var(--dusty-denim)",
                      color: "var(--ink-black)",
                      backgroundColor: "var(--eggshell)"
                    }}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--ink-black)" }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("password", e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors pr-12"
                    style={{ 
                      borderColor: "var(--dusty-denim)",
                      color: "var(--ink-black)",
                      backgroundColor: "var(--eggshell)"
                    }}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: "var(--dusty-denim)" }}
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("rememberMe", e.target.checked)}
                    className="mr-2 rounded"
                    style={{ accentColor: "var(--blue-slate)" }}
                  />
                  <span className="text-sm" style={{ color: "var(--blue-slate)" }}>
                    Remember me
                  </span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm hover:underline"
                  style={{ color: "var(--blue-slate)" }}
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
                <p className="text-sm" style={{ color: "var(--blue-slate)" }}>
                  Don't have an account?{" "}
                  <Link 
                    href="/register" 
                    className="font-medium hover:underline"
                    style={{ color: "var(--deep-space-blue)" }}
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            )}

            {(selectedRole === "vendor" || selectedRole === "admin") && (
              <div className="mt-6 text-center">
                <p className="text-sm" style={{ color: "var(--blue-slate)" }}>
                  Need access?{" "}
                  <Link 
                    href="/contact" 
                    className="font-medium hover:underline"
                    style={{ color: "var(--deep-space-blue)" }}
                  >
                    Contact administrator
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