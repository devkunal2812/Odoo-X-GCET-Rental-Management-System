"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api, APIError } from '@/app/lib/api-client';
import type {
  User,
  LoginRequest,
  SignupRequest,
  AuthResponse,
  LogoutResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  APIResponse,
} from '@/types/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  verifyEmail: (data: VerifyEmailRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch current user on mount
  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; user: User }>('/users/me');
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (err) {
      // User not authenticated - this is okay
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      if (response.success && response.user) {
        setUser(response.user);
        
        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect based on role
        switch (response.user.role) {
          case 'ADMIN':
            window.location.href = '/admin/dashboard';
            break;
          case 'VENDOR':
            window.location.href = '/vendor';
            break;
          case 'CUSTOMER':
            window.location.href = '/';
            break;
        }
      }
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Login failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post<AuthResponse>('/auth/signup', data);
      
      if (response.success) {
        // Don't set user yet - they need to verify email
        // Show success message and redirect to login
        router.push('/login?message=Please check your email to verify your account');
      }
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Signup failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await api.post<LogoutResponse>('/auth/logout');
      setUser(null);
      router.push('/login');
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Logout failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (data: ForgotPasswordRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.post<APIResponse>('/auth/forgot-password', data);
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Failed to send reset email. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.post<APIResponse>('/auth/reset-password', data);
      router.push('/login?message=Password reset successful. Please login with your new password.');
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Failed to reset password. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (data: VerifyEmailRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.post<APIResponse>('/auth/verify-email', data);
      router.push('/login?message=Email verified successfully. You can now login.');
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Email verification failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    refreshUser,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isVendor: user?.role === 'VENDOR',
    isCustomer: user?.role === 'CUSTOMER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: ('ADMIN' | 'VENDOR' | 'CUSTOMER')[]
) {
  return function ProtectedRoute(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/login');
        } else if (allowedRoles && !allowedRoles.includes(user.role)) {
          router.push('/');
        }
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
      return null;
    }

    return <Component {...props} />;
  };
}
