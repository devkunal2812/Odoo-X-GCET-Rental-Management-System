"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ClockIcon,
  EnvelopeIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const token = searchParams.get('token');

    if (success) {
      switch (success) {
        case 'verified':
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now login to your account.');
          break;
        case 'already-verified':
          setStatus('already-verified');
          setMessage('Your email is already verified. You can login to your account.');
          break;
        default:
          setStatus('success');
          setMessage('Email verification completed successfully!');
      }
    } else if (error) {
      setStatus('error');
      switch (error) {
        case 'missing-token':
          setMessage('Verification link is missing required information. Please check your email for the correct link.');
          break;
        case 'invalid-token':
          setMessage('This verification link is invalid or has already been used. Please request a new verification email.');
          break;
        case 'expired-token':
          setMessage('This verification link has expired. Please sign up again or request a new verification email.');
          break;
        case 'server-error':
          setMessage('A server error occurred during verification. Please try again or contact support.');
          break;
        default:
          setMessage('Email verification failed. Please try again or contact support.');
      }
    } else if (token) {
      // Token provided but no success/error - verification is in progress
      setMessage('Verifying your email address...');
    } else {
      // No parameters - show manual verification form
      setStatus('loading');
      setMessage('Enter your verification token below or check your email for the verification link.');
    }
  }, [searchParams]);

  const handleManualVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = formData.get('token') as string;

    if (!token) {
      setStatus('error');
      setMessage('Please enter your verification token.');
      return;
    }

    setStatus('loading');
    setMessage('Verifying your email...');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Email verified successfully!');
      } else {
        setStatus('error');
        setMessage(result.error || 'Verification failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      alert('Please enter your email address first.');
      return;
    }

    try {
      // This would call a resend verification email API
      alert('Resend functionality will be implemented. For now, please sign up again if your token expired.');
    } catch (error) {
      alert('Failed to resend verification email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#D3DAD9] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#37353E] to-[#44444E] p-8 text-center">
          <Link href="/" className="text-2xl font-bold text-white mb-4 block">
            RentMarket
          </Link>
          <h1 className="text-xl font-semibold text-white">Email Verification</h1>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Success State */}
          {(status === 'success' || status === 'already-verified') && (
            <div className="text-center">
              <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold text-[#37353E] mb-4">
                {status === 'success' ? 'Email Verified!' : 'Already Verified!'}
              </h2>
              <p className="text-[#715A5A] mb-6">{message}</p>
              
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center px-6 py-3 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors"
                >
                  Login to Your Account
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  href="/products"
                  className="w-full flex items-center justify-center px-6 py-3 border-2 border-[#37353E] text-[#37353E] rounded-lg hover:bg-[#37353E] hover:text-white transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <ExclamationCircleIcon className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <h2 className="text-2xl font-bold text-[#37353E] mb-4">Verification Failed</h2>
              <p className="text-[#715A5A] mb-6">{message}</p>
              
              <div className="space-y-3">
                <Link
                  href="/signup"
                  className="w-full flex items-center justify-center px-6 py-3 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors"
                >
                  Sign Up Again
                </Link>
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center px-6 py-3 border-2 border-[#37353E] text-[#37353E] rounded-lg hover:bg-[#37353E] hover:text-white transition-colors"
                >
                  Try to Login
                </Link>
              </div>

              {/* Manual Verification Form */}
              <div className="mt-8 pt-6 border-t border-[#D3DAD9]">
                <h3 className="text-lg font-semibold text-[#37353E] mb-4">Manual Verification</h3>
                <form onSubmit={handleManualVerification} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-2">
                      Verification Token
                    </label>
                    <input
                      type="text"
                      name="token"
                      placeholder="Enter your verification token"
                      className="w-full px-4 py-3 border-2 border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37353E] focus:border-transparent text-[#37353E]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full px-6 py-3 bg-[#715A5A] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {status === 'loading' ? 'Verifying...' : 'Verify Email'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center">
              <ClockIcon className="w-16 h-16 mx-auto mb-4 text-[#715A5A] animate-pulse" />
              <h2 className="text-2xl font-bold text-[#37353E] mb-4">Verifying Email</h2>
              <p className="text-[#715A5A] mb-6">{message}</p>
              
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#37353E]"></div>
              </div>

              {/* Manual Verification Option */}
              <div className="mt-8 pt-6 border-t border-[#D3DAD9]">
                <h3 className="text-lg font-semibold text-[#37353E] mb-4">Have a Verification Token?</h3>
                <form onSubmit={handleManualVerification} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-2">
                      Verification Token
                    </label>
                    <input
                      type="text"
                      name="token"
                      placeholder="Paste your verification token here"
                      className="w-full px-4 py-3 border-2 border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37353E] focus:border-transparent text-[#37353E]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-[#715A5A] text-white rounded-lg hover:opacity-90 transition-colors"
                  >
                    Verify Email
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#D3DAD9] p-6 text-center">
          <p className="text-sm text-[#715A5A] mb-2">
            Need help? Contact us at{' '}
            <a href="mailto:support@rentmarket.com" className="text-[#37353E] hover:underline">
              support@rentmarket.com
            </a>
          </p>
          <p className="text-xs text-[#715A5A]">
            © 2024 RentMarket. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}