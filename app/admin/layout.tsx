"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  CubeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Rental Orders', href: '/admin/rental-orders', icon: DocumentTextIcon },
  { name: 'Asset Management', href: '/admin/assets', icon: CubeIcon },
  { name: 'Rental Partners', href: '/admin/partners', icon: BuildingStorefrontIcon },
  { name: 'Customers', href: '/admin/customers', icon: UsersIcon },
  { name: 'Billing & Invoices', href: '/admin/billing', icon: CurrencyDollarIcon },
  { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  // Protect admin routes
  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show loading while checking auth
  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D3DAD9]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between h-16 px-6 border-b border-[#D3DAD9]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#37353E] to-[#44444E] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-xl font-bold text-[#37353E]">Admin</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-[#D3DAD9] transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-[#715A5A]" />
              </button>
            </div>
            <nav className="mt-6 px-3">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#37353E] text-white'
                        : 'text-[#715A5A] hover:bg-[#D3DAD9] hover:text-[#37353E]'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-6 left-3 right-3">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-[#715A5A] hover:bg-[#D3DAD9] hover:text-[#37353E] rounded-lg transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-[#D3DAD9] shadow-sm">
          <div className="flex items-center h-16 px-6 border-b border-[#D3DAD9]">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#37353E] to-[#44444E] flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold text-[#37353E]">Rental ERP</span>
            </div>
          </div>
          <nav className="mt-6 flex-1 px-3">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#37353E] text-white'
                      : 'text-[#715A5A] hover:bg-[#D3DAD9] hover:text-[#37353E]'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-[#D3DAD9]">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-[#715A5A] hover:bg-[#D3DAD9] hover:text-[#37353E] rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#D3DAD9] shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#D3DAD9] transition-colors"
            >
              <Bars3Icon className="h-6 w-6 text-[#715A5A]" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-[#715A5A]">
                Welcome back, {user.firstName} {user.lastName}
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#37353E] to-[#44444E] flex items-center justify-center">
                <span className="text-white font-bold text-sm">{user.firstName.charAt(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}