"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  HomeIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  TicketIcon
} from "@heroicons/react/24/outline";

const sidebarItems = [
  { name: "Dashboard", href: "/vendor", icon: HomeIcon },
  { name: "Products", href: "/vendor/products", icon: CubeIcon },
  { name: "Orders", href: "/vendor/orders", icon: ClipboardDocumentListIcon },
  { name: "Invoices", href: "/vendor/invoices", icon: DocumentTextIcon },
  { name: "Coupons", href: "/vendor/coupons", icon: TicketIcon },
  { name: "Pickups & Returns", href: "/vendor/logistics", icon: TruckIcon },
  { name: "Earnings", href: "/vendor/earnings", icon: CurrencyDollarIcon },
  { name: "Analytics", href: "/vendor/analytics", icon: ChartBarIcon },
  { name: "Settings", href: "/vendor/settings", icon: Cog6ToothIcon },
];

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  // Protect vendor routes
  useEffect(() => {
    if (!loading && (!user || user.role !== 'VENDOR')) {
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
  if (loading || !user || user.role !== 'VENDOR') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const vendorName = user.vendorProfile?.companyName || 'Vendor';

  const isActive = (href: string) => {
    if (href === "/vendor") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-secondary-50 pt-24">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full bg-secondary-800">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-secondary-700">
            <Link href="/vendor" className="text-xl font-bold text-white">
              Vendor Portal
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md hover:bg-secondary-700 text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Vendor Info */}
          <div className="p-6 border-b border-secondary-700">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-3 bg-secondary-600">
                <span className="text-white font-bold text-lg">{vendorName.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{vendorName}</h3>
                <p className="text-sm text-secondary-300 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-secondary-600 text-white'
                      : 'text-secondary-300 hover:bg-secondary-700 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-secondary-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-secondary-700 text-secondary-300 hover:text-white"
            >
              <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-secondary-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-secondary-100 text-secondary-600"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-3 ">
              
              <div className="text-left">
                <p className="text-lg font-bold text-secondary-900">Welcome back, {user.firstName}!</p>
                <p className="text-sm text-secondary-600">Manage your rental business efficiently</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}