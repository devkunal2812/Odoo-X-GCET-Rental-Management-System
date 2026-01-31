"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail, loading, error } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setVerificationStatus('error');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail({ token });
        setVerificationStatus('success');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?message=Email verified successfully. You can now login.');
        }, 3000);
      } catch (err) {
        setVerificationStatus('error');
      }
    };

    verify();
  }, [searchParams, verifyEmail, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {verificationStatus === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">Verifying Email</h2>
            <p className="text-secondary-600">Please wait while we verify your email address...</p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-success-600" />
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">Email Verified!</h2>
            <p className="text-secondary-600 mb-6">
              Your email has been successfully verified. You can now login to your account.
            </p>
            <div className="animate-pulse">
              <p className="text-sm text-secondary-500">Redirecting to login...</p>
            </div>
            <Link
              href="/login"
              className="mt-4 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Go to Login
            </Link>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="text-center">
            <ExclamationCircleIcon className="w-16 h-16 mx-auto mb-4 text-error-600" />
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">Verification Failed</h2>
            <p className="text-secondary-600 mb-6">
              {error || 'The verification link is invalid or has expired. Please request a new verification email.'}
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Go to Login
              </Link>
              <Link
                href="/signup"
                className="block px-6 py-3 bg-secondary-100 text-secondary-900 rounded-lg hover:bg-secondary-200 transition-colors font-medium"
              >
                Create New Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
