"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, CalendarIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface RentalDurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    startDate: string;
    endDate: string;
    quantity: number;
  }) => void;
  product: {
    id: string;
    name: string;
    maxQuantity: number;
  };
  initialQuantity?: number;
}

interface AvailabilityResult {
  success: boolean;
  requestedQuantity: number;
  availableQuantity: number;
  totalQuantity: number;
  bookedQuantity: number;
  status: "FULL" | "PARTIAL" | "NONE";
  message: string;
  overlappingBookings?: Array<{
    orderNumber: string;
    quantity: number;
    startDate: string;
    endDate: string;
    status: string;
  }>;
}

export default function RentalDurationModal({
  isOpen,
  onClose,
  onConfirm,
  product,
  initialQuantity = 1
}: RentalDurationModalProps) {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("18:00");
  const [quantity, setQuantity] = useState(initialQuantity);
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      setStartDate(tomorrow.toISOString().split('T')[0]);
      setEndDate(dayAfter.toISOString().split('T')[0]);
      setStartTime("09:00");
      setEndTime("18:00");
      setQuantity(initialQuantity);
      setAvailability(null);
      setError(null);
    }
  }, [isOpen, initialQuantity]);

  // Check availability when dates or quantity change
  useEffect(() => {
    // Only check availability if we have all required values and the modal is open
    if (isOpen && startDate && endDate && startTime && endTime && quantity > 0 && product.id) {
      const timeoutId = setTimeout(() => {
        checkAvailability();
      }, 500); // Debounce API calls

      return () => clearTimeout(timeoutId);
    }
  }, [startDate, startTime, endDate, endTime, quantity, isOpen, product.id]);

  const checkAvailability = async () => {
    // Comprehensive validation before making API call
    if (!product.id) {
      return;
    }
    
    if (!startDate || !endDate || !startTime || !endTime) {
      return;
    }
    
    if (quantity <= 0) {
      return;
    }

    setChecking(true);
    setError(null);

    try {
      const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
      const endDateTime = new Date(`${endDate}T${endTime}`).toISOString();

      const requestBody = {
        startDate: startDateTime,
        endDate: endDateTime,
        requestedQuantity: quantity
      };

      const response = await fetch(`/api/products/${product.id}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAvailability(data);
      } else {
        setError(data.error || 'Failed to check availability');
        setAvailability(null);
      }
    } catch (err) {
      console.error('❌ Availability check error:', err);
      setError('Network error occurred');
      setAvailability(null);
    } finally {
      setChecking(false);
    }
  };

  const handleConfirm = () => {
    if (!availability || availability.status === "NONE") return;

    const finalQuantity = availability.status === "PARTIAL" 
      ? availability.availableQuantity 
      : quantity;

    onConfirm({
      startDate: new Date(`${startDate}T${startTime}`).toISOString(),
      endDate: new Date(`${endDate}T${endTime}`).toISOString(),
      quantity: finalQuantity
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    const maxAllowed = Math.min(product.maxQuantity, availability?.availableQuantity || product.maxQuantity);
    setQuantity(Math.max(1, Math.min(newQuantity, maxAllowed)));
  };

  if (!isOpen) return null;

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const isValidDateRange = startDate && endDate && new Date(startDate) < new Date(endDate);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700">
            <h2 className="text-xl font-bold text-white">Select Rental Duration</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-700">Maximum available: {product.maxQuantity} units</p>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={minDateStr}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  <ClockIcon className="h-4 w-4 inline mr-1" />
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || minDateStr}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  <ClockIcon className="h-4 w-4 inline mr-1" />
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                />
              </div>
            </div>

            {/* Quantity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 bg-white"
                >
                  <span className="text-lg">−</span>
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.maxQuantity}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.maxQuantity}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 bg-white"
                >
                  <span className="text-lg">+</span>
                </button>
              </div>
            </div>

            {/* Availability Status */}
            {checking && (
              <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-700">Checking availability...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {availability && !checking && (
              <div className={`p-4 rounded-lg border ${
                availability.status === "NONE" 
                  ? "bg-red-50 border-red-200"
                  : availability.status === "PARTIAL"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-green-50 border-green-200"
              }`}>
                <div className="flex items-start">
                  {availability.status === "NONE" ? (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                  ) : availability.status === "PARTIAL" ? (
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      availability.status === "NONE" 
                        ? "text-red-800"
                        : availability.status === "PARTIAL"
                          ? "text-yellow-800"
                          : "text-green-800"
                    }`}>
                      {availability.message}
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      <div>Total stock: {availability.totalQuantity}</div>
                      <div>Already booked: {availability.bookedQuantity}</div>
                      <div>Available: {availability.availableQuantity}</div>
                    </div>
                    {availability.overlappingBookings && availability.overlappingBookings.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 cursor-pointer">
                          View conflicting bookings ({availability.overlappingBookings.length})
                        </summary>
                        <div className="mt-2 space-y-1">
                          {availability.overlappingBookings.map((booking, index) => (
                            <div key={index} className="text-xs bg-white p-2 rounded border">
                              <div>Order: {booking.orderNumber}</div>
                              <div>Quantity: {booking.quantity}</div>
                              <div>Period: {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            
            {availability?.status === "PARTIAL" && (
              <button
                onClick={() => setQuantity(availability.availableQuantity)}
                className="px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Rent {availability.availableQuantity} Available
              </button>
            )}
            
            <button
              onClick={handleConfirm}
              disabled={!isValidDateRange || !availability || availability.status === "NONE" || checking}
              className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {availability?.status === "PARTIAL" ? `Add ${availability.availableQuantity} to Cart` : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}