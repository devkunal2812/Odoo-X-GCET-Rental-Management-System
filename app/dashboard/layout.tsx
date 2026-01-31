"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingBagIcon },
  { name: "Products", href: "/dashboard/products", icon: CubeIcon },
  { name: "Reports", href: "/dashboard/reports", icon: ChartBarIcon },
  { name: "Invoices", href: "/dashboard/invoices", icon: DocumentTextIcon },
  { name: "Customers", href: "/dashboard/customers", icon: UsersIcon },
  { name: "Settings", href: "/dashboard/settings", icon: CogIcon },
];

// Mock user data
const mockUser = {
  name: "John Vendor",
  email: "john@techrentpro.com",
  role: "vendor" as const,
  avatar: "/api/placeholder/40/40",
  company: "TechRent Pro"
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href="/dashboard" className="text-xl font-bold text-primary-600">
              RentMarket
            </Link>
            <button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6 text-secondary-600" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'text-secondary-600 hover:opacity-80'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-secondary-300">
          <div className="flex h-16 items-center px-4 border-b border-secondary-300">
            <Link href="/dashboard" className="text-xl font-bold text-primary-600">
              RentMarket
            </Link>
          </div>
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'text-secondary-600 hover:opacity-80'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* User info */}
          <div className="border-t border-secondary-300 p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full mr-3 bg-secondary-400"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-secondary-900">
                  {mockUser.name}
                </p>
                <p className="text-xs truncate text-secondary-600">
                  {mockUser.company}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-secondary-300">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-secondary-600"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <button className="p-2 hover:opacity-80 transition-opacity text-secondary-600">
                <BellIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-secondary-400"></div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-secondary-900">{mockUser.name}</p>
                  <p className="text-xs capitalize text-secondary-600">{mockUser.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
