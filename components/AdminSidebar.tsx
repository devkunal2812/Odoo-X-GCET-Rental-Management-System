"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Vendors', href: '/admin/vendors', icon: BuildingStorefrontIcon },
  { name: 'Products', href: '/admin/products', icon: CubeIcon },
  { name: 'Rental Orders', href: '/admin/orders', icon: ClipboardDocumentListIcon },
  { name: 'Invoices', href: '/admin/invoices', icon: DocumentTextIcon },
  { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
];

interface AdminSidebarProps {
  children: React.ReactNode;
}

export default function AdminSidebar({ children }: AdminSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex h-screen bg-[#D3DAD9]">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black opacity-50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%'
        }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:static lg:translate-x-0 lg:shadow-none"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#D3DAD9]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#37353E] to-[#44444E] rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#37353E]">Admin Panel</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-[#D3DAD9]"
            >
              <XMarkIcon className="h-6 w-6 text-[#37353E]" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-[#D3DAD9]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#37353E] to-[#44444E] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#37353E]">{user?.name}</p>
                <p className="text-xs text-[#715A5A]">System Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#37353E] text-white'
                      : 'text-[#715A5A] hover:bg-[#D3DAD9] hover:text-[#37353E]'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-white' : 'text-[#715A5A] group-hover:text-[#37353E]'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 py-4 border-t border-[#D3DAD9]">
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-3 py-2 text-sm font-medium text-[#715A5A] rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-[#715A5A] group-hover:text-red-600" />
              Logout
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-[#D3DAD9] px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-[#D3DAD9]"
            >
              <Bars3Icon className="h-6 w-6 text-[#37353E]" />
            </button>
            <h1 className="text-2xl font-bold text-[#37353E]">
              {navigation.find(item => item.href === pathname)?.name || 'Admin Panel'}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[#715A5A]">Welcome, {user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-[#D3DAD9] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}