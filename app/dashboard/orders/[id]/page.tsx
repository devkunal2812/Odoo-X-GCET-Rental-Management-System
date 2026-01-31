"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  CheckIcon,
  PrinterIcon,
  DocumentTextIcon,
  PencilIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";

// Mock order data
const mockOrder = {
  id: "ORD-001",
  reference: "RO-2024-001",
  status: "quotation" as const,
  orderDate: "2024-01-20",
  customer: {
    id: "CUST-001",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1 (555) 123-4567"
  },
  deliveryAddress: {
    street: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States"
  },
  billingAddress: {
    street: "123 Main Street", 
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States"
  },
  rentalPeriod: {
    startDate: "2024-01-25",
    endDate: "2024-01-28"
  },
  items: [
    {
      id: "1",
      product: {
        id: "PROD-001",
        name: "Professional Camera Kit",
        description: "Complete DSLR camera kit with lenses and accessories"
      },
      quantity: 1,
      unitPrice: 25,
      rentalDuration: 3,
      rentalUnit: "day" as const,
      taxes: 5.25,
      amount: 75
    }
  ],
  subtotal: 75,
  taxes: 5.25,
  discounts: 0,
  shipping: 15,
  total: 95.25,
  notes: "Customer requested early morning delivery. Handle with care - professional equipment.",
  vendor: {
    id: "VENDOR-001",
    name: "TechRent Pro",
    logo: "/api/placeholder/100/50"
  }
};

const statusFlow = [
  { id: "quotation", name: "Quotation", completed: true },
  { id: "quotation_sent", name: "Quotation Sent", completed: false },
  { id: "sale_order", name: "Sale Order", completed: false },
  { id: "confirmed", name: "Confirmed", completed: false },
  { id: "invoiced", name: "Invoiced", completed: false }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "quotation": return "bg-yellow-100 text-yellow-800";
    case "quotation_sent": return "bg-blue-100 text-blue-800";
    case "sale_order": return "bg-purple-100 text-purple-800";
    case "confirmed": return "bg-green-100 text-green-800";
    case "invoiced": return "bg-indigo-100 text-indigo-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function OrderDetailPage() {
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);

  const handleSendQuotation = () => {
    alert("Quotation sent to customer!");
  };

  const handleConfirmOrder = () => {
    alert("Order confirmed!");
  };

  const handleCreateInvoice = () => {
    alert("Invoice created!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link
            href="/dashboard/orders"
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mockOrder.reference}</h1>
            <p className="text-gray-600">Order Details</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleSendQuotation}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <PaperAirplaneIcon className="h-4 w-4 mr-2" />
            Send
          </button>
          <button
            onClick={handleConfirmOrder}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            Confirm
          </button>
          <button
            onClick={handlePrint}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            onClick={handleCreateInvoice}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Status Flow */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Status</h2>
        <div className="flex items-center space-x-4 overflow-x-auto">
          {statusFlow.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step.completed ? 'bg-green-600 text-white' : 
                step.id === mockOrder.status ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {step.completed ? <CheckIcon className="h-4 w-4" /> : index + 1}
              </div>
              <div className={`ml-2 text-sm font-medium ${
                step.completed || step.id === mockOrder.status ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.name}
              </div>
              {index < statusFlow.length - 1 && (
                <div className={`mx-4 h-0.5 w-16 ${
                  step.completed ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(mockOrder.status)}`}>
            Current Status: {mockOrder.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Order Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-600 hover:text-blue-800"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Reference</label>
                <p className="text-gray-900">{mockOrder.reference}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                <p className="text-gray-900">{mockOrder.orderDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rental Start Date</label>
                <p className="text-gray-900">{mockOrder.rentalPeriod.startDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rental End Date</label>
                <p className="text-gray-900">{mockOrder.rentalPeriod.endDate}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-gray-700">Product</th>
                    <th className="text-center py-2 text-sm font-medium text-gray-700">Quantity</th>
                    <th className="text-center py-2 text-sm font-medium text-gray-700">Duration</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-700">Unit Price</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrder.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-500">{item.product.description}</p>
                        </div>
                      </td>
                      <td className="py-4 text-center">{item.quantity}</td>
                      <td className="py-4 text-center">
                        {item.rentalDuration} {item.rentalUnit}(s)
                      </td>
                      <td className="py-4 text-right">${item.unitPrice}</td>
                      <td className="py-4 text-right font-medium">${item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Totals */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${mockOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes:</span>
                    <span className="font-medium">${mockOrder.taxes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">${mockOrder.shipping}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-bold text-blue-600">${mockOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            <p className="text-gray-700">{mockOrder.notes}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Customer
            </h2>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{mockOrder.customer.name}</p>
                <p className="text-sm text-gray-600">{mockOrder.customer.email}</p>
                <p className="text-sm text-gray-600">{mockOrder.customer.phone}</p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Addresses
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
                <div className="text-sm text-gray-600">
                  <p>{mockOrder.deliveryAddress.street}</p>
                  <p>{mockOrder.deliveryAddress.city}, {mockOrder.deliveryAddress.state} {mockOrder.deliveryAddress.zipCode}</p>
                  <p>{mockOrder.deliveryAddress.country}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Billing Address</h3>
                <div className="text-sm text-gray-600">
                  <p>{mockOrder.billingAddress.street}</p>
                  <p>{mockOrder.billingAddress.city}, {mockOrder.billingAddress.state} {mockOrder.billingAddress.zipCode}</p>
                  <p>{mockOrder.billingAddress.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Period */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Rental Period
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium">{mockOrder.rentalPeriod.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Date:</span>
                <span className="font-medium">{mockOrder.rentalPeriod.endDate}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">3 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}