"use client";

import React, { useState, useEffect } from "react";
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
import { generateInvoicePDF, buildInvoiceData } from "../../lib/invoiceGenerator";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/app/lib/api-client";

// Types for API responses
interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  customer: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  lines: {
    product: {
      name: string;
    };
    quantity: number;
  }[];
}

interface Product {
  id: string;
  name: string;
  published: boolean;
  inventory?: {
    quantityOnHand: number;
  };
  pricing: {
    price: number;
  }[];
}

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

// Helper to get status color based on order status from API
const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return { bg: "#dcfce7", text: "#16a34a" };
    case "PICKED_UP":
      return { bg: "#fef3c7", text: "#d97706" };
    case "RETURNED":
      return { bg: "#dbeafe", text: "#2563eb" };
    case "QUOTATION":
    case "SENT":
      return { bg: "#fee2e2", text: "#dc2626" };
    case "INVOICED":
      return { bg: "#e0e7ff", text: "#4f46e5" };
    case "CANCELLED":
      return { bg: "#fecaca", text: "#b91c1c" };
    default:
      return { bg: "#f0f9ff", text: "#1e40af" };
  }
};

// Calculate days between two dates
const calculateDays = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
};

export default function VendorDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();

  // Fetch vendor data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.vendorProfile?.id) return;

      try {
        setLoading(true);

        // Fetch orders and products in parallel
        const [ordersRes, productsRes] = await Promise.all([
          api.get<{ success: boolean; orders: Order[] }>('/orders'),
          api.get<{ success: boolean; products: Product[] }>('/products', {
            vendorId: user.vendorProfile.id,
            published: 'false' // Get all products, not just published
          })
        ]);

        if (ordersRes.success) {
          setOrders(ordersRes.orders || []);
        }
        if (productsRes.success) {
          setProducts(productsRes.products || []);
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.vendorProfile?.id]);

  // Compute dashboard stats from real data
  const dashboardStats = [
    {
      title: "Total Products",
      value: String(products.length),
      change: products.length > 0 ? `${products.length} items` : "0",
      changeType: "increase" as const,
      icon: CubeIcon,
      href: "/vendor/products"
    },
    {
      title: "Active Orders",
      value: String(orders.filter(o => ['CONFIRMED', 'SENT', 'PICKED_UP'].includes(o.status)).length),
      change: `${orders.filter(o => ['QUOTATION'].includes(o.status)).length} pending`,
      changeType: "increase" as const,
      icon: ClipboardDocumentListIcon,
      href: "/vendor/orders"
    },
    {
      title: "Monthly Earnings",
      value: `₹${orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}`,
      change: "Total",
      changeType: "increase" as const,
      icon: CurrencyDollarIcon,
      href: "/vendor/earnings"
    },
    {
      title: "Pending Pickups",
      value: String(orders.filter(o => o.status === 'CONFIRMED').length),
      change: `${orders.filter(o => o.status === 'PICKED_UP').length} in progress`,
      changeType: orders.filter(o => o.status === 'CONFIRMED').length > 0 ? "decrease" as const : "increase" as const,
      icon: TruckIcon,
      href: "/vendor/logistics"
    }
  ];

  // Transform orders for display
  const recentOrders = orders.slice(0, 5).map(order => ({
    id: order.orderNumber,
    orderId: order.id,
    customer: order.customer?.user ? `${order.customer.user.firstName} ${order.customer.user.lastName}` : 'Unknown',
    product: order.lines?.[0]?.product?.name || 'N/A',
    amount: `₹${order.totalAmount?.toLocaleString() || 0}`,
    status: order.status,
    date: new Date(order.createdAt).toLocaleDateString(),
    duration: order.startDate && order.endDate ? calculateDays(order.startDate, order.endDate) : 'N/A'
  }));

  // Transform products for display (sorted by name for now - can enhance with order count later)
  const topProducts = products.slice(0, 4).map(product => ({
    name: product.name,
    rentals: orders.filter(o => o.lines?.some(l => l.product?.name === product.name)).length,
    revenue: `₹${(product.pricing?.[0]?.price || 0).toLocaleString()}`,
    rating: 4.5 // Placeholder - would need real rating data
  }));

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      // Find the actual order from orders array
      const actualOrder = orders.find(o => o.id === orderId);
      if (!actualOrder) {
        throw new Error('Order not found');
      }

      const customerName = actualOrder.customer?.user ?
        `${actualOrder.customer.user.firstName} ${actualOrder.customer.user.lastName}` : 'Customer';
      const tax = actualOrder.totalAmount * 0.18;

      const invoiceData = buildInvoiceData({
        invoiceNumber: `INV-${actualOrder.orderNumber}`,
        orderNumber: actualOrder.orderNumber,
        status: actualOrder.status === 'RETURNED' ? 'paid' : 'pending',
        invoiceDate: actualOrder.createdAt,
        totalAmount: actualOrder.totalAmount + tax,
        subtotal: actualOrder.totalAmount,
        taxAmount: tax,
        startDate: actualOrder.startDate,
        endDate: actualOrder.endDate,
        customer: {
          name: customerName,
          email: 'customer@email.com'
        },
        vendor: {
          name: user?.vendorProfile?.companyName || 'Vendor',
          gstin: user?.vendorProfile?.gstin,
          logoUrl: user?.vendorProfile?.logoUrl
        },
        lines: actualOrder.lines?.map(line => ({
          name: line.product?.name || 'Item',
          quantity: line.quantity,
          unitPrice: actualOrder.totalAmount / (actualOrder.lines?.reduce((sum, l) => sum + l.quantity, 0) || 1),
          amount: actualOrder.totalAmount / (actualOrder.lines?.length || 1)
        })) || []
      });

      await generateInvoicePDF(invoiceData);

      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = `Invoice for ${actualOrder.orderNumber} downloaded successfully!`;
      document.body.appendChild(successMessage);
      setTimeout(() => document.body.removeChild(successMessage), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'Error generating PDF. Please try again.';
      document.body.appendChild(errorMessage);
      setTimeout(() => document.body.removeChild(errorMessage), 3000);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
                <div className={`flex items-center text-sm font-medium ${stat.changeType === "increase" ? "text-green-600" : "text-red-600"
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
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-secondary-600">
                No orders yet. Your orders will appear here.
              </div>
            ) : (
              recentOrders.map((order) => {
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
                        {['RETURNED', 'CONFIRMED', 'INVOICED'].includes(order.status) && (
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
              })
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-secondary-900">
                Your Products
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
            {topProducts.length === 0 ? (
              <div className="p-6 text-center text-secondary-600">
                No products yet. Add your first product to get started.
              </div>
            ) : (
              topProducts.map((product, index) => (
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
              ))
            )}
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