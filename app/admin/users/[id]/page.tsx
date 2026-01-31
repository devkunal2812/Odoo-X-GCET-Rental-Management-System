"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  BanknotesIcon,
  MapPinIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { api } from '@/app/lib/api-client';

interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'VENDOR' | 'CUSTOMER';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  vendorProfile?: {
    id: string;
    companyName: string;
    gstin?: string;
    logoUrl?: string;
    address?: string;
    products?: Array<{
      id: string;
      name: string;
      published: boolean;
    }>;
    orders?: Array<{
      id: string;
      orderNumber: string;
      totalAmount: number;
      status: string;
    }>;
  };
  customerProfile?: {
    id: string;
    phone?: string;
    defaultAddress?: string;
    orders?: Array<{
      id: string;
      orderNumber: string;
      totalAmount: number;
      status: string;
    }>;
  };
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        // Since we don't have a specific user detail endpoint, we'll fetch from the list
        const response = await api.get<{
          success: boolean;
          users: UserDetail[];
        }>('/admin/users', { limit: 1000 });

        if (response.success) {
          const foundUser = response.users.find(u => u.id === userId);
          if (foundUser) {
            setUser(foundUser);
          } else {
            setError('User not found');
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch user details:', err);
        setError(err.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return ShieldCheckIcon;
      case 'VENDOR': return BuildingStorefrontIcon;
      default: return UserIcon;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'VENDOR': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37353E] mb-4"></div>
        <p className="text-[#715A5A]">Loading user details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white rounded-xl shadow-sm p-8 border border-[#D3DAD9]">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4 text-lg font-medium">{error || 'User not found'}</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="px-6 py-3 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(user.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="p-2 hover:bg-[#D3DAD9] rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-[#37353E]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#37353E]">User Details</h1>
            <p className="text-[#715A5A]">Complete information about this user</p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-[#D3DAD9]"
      >
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gradient-to-r from-[#37353E] to-[#44444E] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-3xl">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </span>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-[#37353E]">
                {user.firstName} {user.lastName}
              </h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                <RoleIcon className="h-4 w-4 mr-1" />
                {user.role}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center space-x-2 text-[#715A5A]">
                <EnvelopeIcon className="h-5 w-5" />
                <span>{user.email}</span>
              </div>
              
              {user.customerProfile?.phone && (
                <div className="flex items-center space-x-2 text-[#715A5A]">
                  <PhoneIcon className="h-5 w-5" />
                  <span>{user.customerProfile.phone}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-[#715A5A]">
                <CalendarIcon className="h-5 w-5" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}</span>
              </div>

              <div className="flex items-center space-x-2">
                {user.isActive ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">Active Account</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                    <span className="text-red-600 font-medium">Inactive Account</span>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {user.emailVerified ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-600 font-medium">Email Verified</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-600 font-medium">Email Not Verified</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Vendor Profile */}
      {user.role === 'VENDOR' && user.vendorProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-[#D3DAD9]"
        >
          <h3 className="text-lg font-semibold text-[#37353E] mb-4 flex items-center">
            <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
            Vendor Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#715A5A] mb-1">Company Name</p>
              <p className="font-medium text-[#37353E]">{user.vendorProfile.companyName}</p>
            </div>

            {user.vendorProfile.gstin && (
              <div>
                <p className="text-sm text-[#715A5A] mb-1">GSTIN</p>
                <p className="font-medium text-[#37353E]">{user.vendorProfile.gstin}</p>
              </div>
            )}

            {user.vendorProfile.address && (
              <div className="md:col-span-2">
                <p className="text-sm text-[#715A5A] mb-1">Address</p>
                <p className="font-medium text-[#37353E]">{user.vendorProfile.address}</p>
              </div>
            )}
          </div>

          {/* Vendor Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-[#D3DAD9] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#715A5A]">Total Products</p>
                  <p className="text-2xl font-bold text-[#37353E]">
                    {user.vendorProfile.products?.length || 0}
                  </p>
                </div>
                <CubeIcon className="h-8 w-8 text-[#37353E]" />
              </div>
            </div>

            <div className="bg-[#D3DAD9] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#715A5A]">Published</p>
                  <p className="text-2xl font-bold text-green-600">
                    {user.vendorProfile.products?.filter(p => p.published).length || 0}
                  </p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-[#D3DAD9] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#715A5A]">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {user.vendorProfile.orders?.length || 0}
                  </p>
                </div>
                <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Customer Profile */}
      {user.role === 'CUSTOMER' && user.customerProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-[#D3DAD9]"
        >
          <h3 className="text-lg font-semibold text-[#37353E] mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Customer Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.customerProfile.phone && (
              <div>
                <p className="text-sm text-[#715A5A] mb-1">Phone Number</p>
                <p className="font-medium text-[#37353E]">{user.customerProfile.phone}</p>
              </div>
            )}

            {user.customerProfile.defaultAddress && (
              <div className="md:col-span-2">
                <p className="text-sm text-[#715A5A] mb-1">Default Address</p>
                <p className="font-medium text-[#37353E]">{user.customerProfile.defaultAddress}</p>
              </div>
            )}
          </div>

          {/* Customer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-[#D3DAD9] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#715A5A]">Total Orders</p>
                  <p className="text-2xl font-bold text-[#37353E]">
                    {user.customerProfile.orders?.length || 0}
                  </p>
                </div>
                <ClipboardDocumentListIcon className="h-8 w-8 text-[#37353E]" />
              </div>
            </div>

            <div className="bg-[#D3DAD9] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#715A5A]">Total Spent</p>
                  <p className="text-2xl font-bold text-green-600">
                    Rs. {(user.customerProfile.orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <BanknotesIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-[#D3DAD9]"
      >
        <h3 className="text-lg font-semibold text-[#37353E] mb-4">Account Timeline</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-[#37353E]">Account Created</p>
              <p className="text-sm text-[#715A5A]">
                {new Date(user.createdAt).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {user.emailVerified && (
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-[#37353E]">Email Verified</p>
                <p className="text-sm text-[#715A5A]">User verified their email address</p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-[#37353E]">Last Updated</p>
              <p className="text-sm text-[#715A5A]">
                {new Date(user.updatedAt).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-[#D3DAD9]"
      >
        <h3 className="text-lg font-semibold text-[#37353E] mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="flex items-center justify-center p-4 border-2 border-[#D3DAD9] rounded-lg hover:bg-[#D3DAD9] transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 text-[#37353E]" />
            <span className="text-[#37353E] font-medium">Back to Users</span>
          </button>

          {user.role === 'VENDOR' && (
            <a
              href={`/admin/vendors`}
              className="flex items-center justify-center p-4 border-2 border-[#D3DAD9] rounded-lg hover:bg-[#D3DAD9] transition-colors"
            >
              <BuildingStorefrontIcon className="h-5 w-5 mr-2 text-[#37353E]" />
              <span className="text-[#37353E] font-medium">View All Vendors</span>
            </a>
          )}

          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors"
          >
            <span className="font-medium">Refresh Data</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
