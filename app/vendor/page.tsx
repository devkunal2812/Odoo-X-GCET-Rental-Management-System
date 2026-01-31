"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CubeIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  XMarkIcon,
  PhotoIcon,
  PlusIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import { generateInvoicePDF, generateSampleInvoiceData } from "../../lib/invoiceGenerator";

// Product Creation Modal Component
const ProductCreationModal = ({ isOpen, onClose }: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    dailyRate: '',
    purchasePrice: '',
    serialNumber: '',
    condition: 'Excellent',
    location: '',
    images: [] as File[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files].slice(0, 5) // Max 5 images
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset form and close modal
    setFormData({
      name: '',
      category: '',
      description: '',
      dailyRate: '',
      purchasePrice: '',
      serialNumber: '',
      condition: 'Excellent',
      location: '',
      images: []
    });
    setIsSubmitting(false);
    onClose();
    
    // Show success message (you can implement toast notification here)
    alert('Product added successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D3DAD9]">
          <h2 className="text-xl font-semibold text-[#37353E]">Add New Product</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#D3DAD9] rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-[#715A5A]" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
              >
                <option value="">Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Tools">Tools</option>
                <option value="Sports">Sports & Recreation</option>
                <option value="Photography">Photography</option>
                <option value="Audio/Video">Audio/Video</option>
                <option value="Transportation">Transportation</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#715A5A] mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
              placeholder="Describe your product..."
            />
          </div>

          {/* Pricing and Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-2">
                Daily Rate (₹) *
              </label>
              <input
                type="number"
                name="dailyRate"
                value={formData.dailyRate}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-2">
                Purchase Price (₹)
              </label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-2">
                Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Repair">Needs Repair</option>
              </select>
            </div>
          </div>

          {/* Serial Number and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-2">
                Serial Number
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
                placeholder="Enter serial number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
                placeholder="Storage location"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-[#715A5A] mb-2">
              Product Images (Max 5)
            </label>
            <div className="border-2 border-dashed border-[#D3DAD9] rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <PhotoIcon className="h-8 w-8 text-[#715A5A] mb-2" />
                <span className="text-sm text-[#715A5A]">Click to upload images</span>
              </label>
              
              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-[#D3DAD9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#715A5A] hover:text-[#37353E] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Mock data
const dashboardStats = [
  {
    title: "Total Products",
    value: "24",
    change: "+3",
    changeType: "increase",
    icon: CubeIcon,
    href: "/vendor/products"
  },
  {
    title: "Active Orders",
    value: "18",
    change: "+5",
    changeType: "increase", 
    icon: ClipboardDocumentListIcon,
    href: "/vendor/orders"
  },
  {
    title: "Monthly Earnings",
    value: "₹3,240",
    change: "+12%",
    changeType: "increase",
    icon: CurrencyDollarIcon,
    href: "/vendor/earnings"
  },
  {
    title: "Pending Pickups",
    value: "7",
    change: "-2",
    changeType: "decrease",
    icon: TruckIcon,
    href: "/vendor/logistics"
  }
];

const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Smith",
    product: "Professional Camera Kit",
    amount: "₹150",
    status: "confirmed",
    date: "2024-01-30",
    duration: "3 days"
  },
  {
    id: "ORD-002", 
    customer: "Sarah Johnson",
    product: "Power Drill Set",
    amount: "₹45",
    status: "in-progress",
    date: "2024-01-29",
    duration: "1 day"
  },
  {
    id: "ORD-003",
    customer: "Mike Wilson",
    product: "Party Sound System", 
    amount: "₹200",
    status: "completed",
    date: "2024-01-28",
    duration: "2 days"
  },
  {
    id: "ORD-004",
    customer: "Emily Davis",
    product: "Mountain Bike",
    amount: "₹90",
    status: "pending",
    date: "2024-01-27",
    duration: "3 days"
  }
];

const topProducts = [
  {
    name: "Professional Camera Kit",
    rentals: 45,
    revenue: "₹1,125",
    rating: 4.8
  },
  {
    name: "Power Drill Set", 
    rentals: 38,
    revenue: "₹570",
    rating: 4.6
  },
  {
    name: "Party Sound System",
    rentals: 32,
    revenue: "₹1,600",
    rating: 4.9
  },
  {
    name: "Mountain Bike",
    rentals: 28,
    revenue: "₹840",
    rating: 4.7
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return { bg: "#dcfce7", text: "#16a34a" };
    case "in-progress":
      return { bg: "#fef3c7", text: "#d97706" };
    case "completed":
      return { bg: "#dbeafe", text: "#2563eb" };
    case "pending":
      return { bg: "#fee2e2", text: "#dc2626" };
    default:
      return { bg: "#f0f9ff", text: "#1e40af" };
  }
};

export default function VendorDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownloadInvoice = (orderId: string) => {
    try {
      // Generate sample invoice data (in real app, this would come from API)
      const invoiceData = generateSampleInvoiceData(`INV-${orderId.split('-')[1]}`);
      
      // Find the actual order from recentOrders to get real data
      const actualOrder = recentOrders.find(order => order.id === orderId);
      if (actualOrder) {
        // Update the sample data with actual order data
        invoiceData.id = `INV-${orderId}`;
        invoiceData.orderId = actualOrder.id;
        invoiceData.product = actualOrder.product;
        invoiceData.amount = parseInt(actualOrder.amount.replace('₹', ''));
        invoiceData.total = invoiceData.amount + (invoiceData.amount * 0.18) + 25; // Add tax and service fee
        invoiceData.status = actualOrder.status === 'completed' ? 'paid' : 'pending';
        invoiceData.rentalPeriod = `${actualOrder.duration}`;
        
        // Update customer info
        invoiceData.customerInfo.name = actualOrder.customer;
        invoiceData.customerInfo.email = 'customer@email.com';
        invoiceData.customerInfo.phone = '+91 98765 43210';
        invoiceData.customerInfo.address = '123, Customer Address, City, State - 560001';
      }
      
      // Generate and download PDF
      generateInvoicePDF(invoiceData);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = `Invoice for ${orderId} downloaded successfully!`;
      document.body.appendChild(successMessage);
      
      // Remove success message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'Error generating PDF. Please try again.';
      document.body.appendChild(errorMessage);
      
      // Remove error message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      {/* <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-2">Welcome to Your Dashboard</h1>
          <p className="text-lg opacity-90">
            Manage your rental business efficiently
          </p>
        </div>
      </div> */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary-100">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  stat.changeType === "increase" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.changeType === "increase" ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1 text-secondary-900">
                {stat.value}
              </h3>
              <p className="text-sm text-secondary-600">
                {stat.title}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-secondary-900">
                Recent Orders
              </h2>
              <Link
                href="/vendor/orders"
                className="text-sm font-medium hover:opacity-80 transition-opacity text-primary-600"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-secondary-200">
            {recentOrders.map((order) => {
              const statusColor = getStatusColor(order.status);
              return (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-bold text-sm text-secondary-900">
                        {order.id}
                      </span>
                      <span
                        className="ml-3 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-primary-600">
                        {order.amount}
                      </span>
                      {(order.status === 'completed' || order.status === 'confirmed') && (
                        <button
                          onClick={() => handleDownloadInvoice(order.id)}
                          className="p-1 rounded hover:bg-gray-100 transition-colors text-primary-600"
                          title="Download Invoice"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h4 className="font-medium mb-1 text-secondary-900">
                    {order.product}
                  </h4>
                  <div className="flex items-center justify-between text-sm text-secondary-600">
                    <span>{order.customer}</span>
                    <span>{order.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-secondary-900">
                Top Performing Products
              </h2>
              <Link
                href="/vendor/analytics"
                className="text-sm font-medium hover:opacity-80 transition-opacity text-primary-600"
              >
                View Analytics
              </Link>
            </div>
          </div>
          <div className="divide-y divide-secondary-200">
            {topProducts.map((product, index) => (
              <div key={product.name} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 bg-primary-100 text-primary-600">
                      {index + 1}
                    </div>
                    <h4 className="font-medium text-secondary-900">
                      {product.name}
                    </h4>
                  </div>
                  <span className="font-bold text-primary-600">
                    {product.revenue}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-secondary-600">
                  <span>{product.rentals} rentals</span>
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span>{product.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6 text-secondary-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-primary-300 text-primary-600 transition-all hover:shadow-md hover:border-primary-400"
          >
            <CubeIcon className="h-6 w-6 mr-2" />
            Add New Product
          </button>
          <Link
            href="/vendor/orders"
            className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-primary-300 text-primary-600 transition-all hover:shadow-md hover:border-primary-400"
          >
            <EyeIcon className="h-6 w-6 mr-2" />
            View All Orders
          </Link>
          <Link
            href="/vendor/earnings"
            className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-primary-300 text-primary-600 transition-all hover:shadow-md hover:border-primary-400"
          >
            <CurrencyDollarIcon className="h-6 w-6 mr-2" />
            Check Earnings
          </Link>
        </div>
      </div>

      {/* Product Creation Modal */}
      <ProductCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}