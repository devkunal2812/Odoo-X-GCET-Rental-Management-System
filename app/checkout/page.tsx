"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import { CheckIcon } from "@heroicons/react/24/outline";

// Mock cart data
const mockCartItems = [
  {
    id: "1",
    product: { name: "Professional Camera Kit", vendor: "TechRent Pro" },
    quantity: 1,
    rentalDuration: 3,
    rentalUnit: "day" as const,
    unitPrice: 25,
    total: 75
  },
  {
    id: "2",
    product: { name: "Power Drill Set", vendor: "ToolMaster" },
    quantity: 2,
    rentalDuration: 1,
    rentalUnit: "week" as const,
    unitPrice: 80,
    total: 160
  }
];

const deliveryMethods = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "Delivered to your address",
    price: 15,
    estimatedTime: "2-3 business days"
  },
  {
    id: "pickup",
    name: "Pickup from Store",
    description: "Collect from vendor location",
    price: 0,
    estimatedTime: "Available immediately"
  }
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [formData, setFormData] = useState({
    // Delivery Address
    deliveryFirstName: "",
    deliveryLastName: "",
    deliveryEmail: "",
    deliveryPhone: "",
    deliveryStreet: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryZip: "",
    deliveryCountry: "United States",
    
    // Billing Address
    billingFirstName: "",
    billingLastName: "",
    billingEmail: "",
    billingPhone: "",
    billingStreet: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    billingCountry: "United States",
    
    // Payment
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    savePayment: false
  });

  const subtotal = mockCartItems.reduce((sum, item) => sum + item.total, 0);
  const deliveryFee = deliveryMethods.find(m => m.id === deliveryMethod)?.price || 0;
  const total = subtotal + deliveryFee;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = () => {
    // Process order
    console.log("Placing order:", { formData, deliveryMethod, cartItems: mockCartItems });
    alert("Order placed successfully!");
    // Redirect to confirmation page
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8 text-secondary-900">Checkout</h1>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step <= currentStep 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-secondary-300 text-secondary-600'
                  }`}>
                    {step < currentStep ? <CheckIcon className="h-5 w-5" /> : step}
                  </div>
                  <div className={`ml-2 text-sm font-medium ${
                    step <= currentStep ? 'text-primary-600' : 'text-secondary-500'
                  }`}>
                    {step === 1 && "Delivery"}
                    {step === 2 && "Payment"}
                    {step === 3 && "Review"}
                  </div>
                  {step < 3 && (
                    <div className={`mx-4 h-0.5 w-16 ${
                      step < currentStep ? 'bg-primary-600' : 'bg-secondary-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Delivery */}
              {currentStep === 1 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-6 text-secondary-900">Delivery Information</h2>

                  {/* Delivery Method */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-4 text-secondary-900">Delivery Method</h3>
                    <div className="space-y-3">
                      {deliveryMethods.map((method) => (
                        <label key={method.id} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors ${
                          deliveryMethod === method.id ? 'border-primary-500 bg-primary-50' : 'border-secondary-300'
                        }`}>
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value={method.id}
                            checked={deliveryMethod === method.id}
                            onChange={(e) => setDeliveryMethod(e.target.value)}
                            className="mr-3 accent-primary-600"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-secondary-900">{method.name}</p>
                                <p className="text-sm text-secondary-600">{method.description}</p>
                                <p className="text-sm text-secondary-600">{method.estimatedTime}</p>
                              </div>
                              <span className="font-semibold text-secondary-900">
                                {method.price === 0 ? "Free" : `₹${method.price}`}
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-4 text-secondary-900">Delivery Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={formData.deliveryFirstName}
                        onChange={(e) => handleInputChange("deliveryFirstName", e.target.value)}
                        className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={formData.deliveryLastName}
                        onChange={(e) => handleInputChange("deliveryLastName", e.target.value)}
                        className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.deliveryEmail}
                        onChange={(e) => handleInputChange("deliveryEmail", e.target.value)}
                        className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={formData.deliveryPhone}
                        onChange={(e) => handleInputChange("deliveryPhone", e.target.value)}
                        className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={formData.deliveryStreet}
                        onChange={(e) => handleInputChange("deliveryStreet", e.target.value)}
                        className="md:col-span-2 border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.deliveryCity}
                        onChange={(e) => handleInputChange("deliveryCity", e.target.value)}
                        className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={formData.deliveryState}
                        onChange={(e) => handleInputChange("deliveryState", e.target.value)}
                        className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        value={formData.deliveryZip}
                        onChange={(e) => handleInputChange("deliveryZip", e.target.value)}
                        className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <select
                        value={formData.deliveryCountry}
                        onChange={(e) => handleInputChange("deliveryCountry", e.target.value)}
                        className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                      </select>
                    </div>
                  </div>

                  {/* Billing Address Toggle */}
                  <div className="mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sameAsBilling}
                        onChange={(e) => setSameAsBilling(e.target.checked)}
                        className="mr-2 accent-primary-600"
                      />
                      <span className="text-secondary-900">Billing address same as delivery address</span>
                    </label>
                  </div>

                  {/* Billing Address (if different) */}
                  {!sameAsBilling && (
                    <div className="mb-6">
                      <h3 className="font-medium mb-4 text-secondary-900">Billing Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={formData.billingFirstName}
                          onChange={(e) => handleInputChange("billingFirstName", e.target.value)}
                          className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={formData.billingLastName}
                          onChange={(e) => handleInputChange("billingLastName", e.target.value)}
                          className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={formData.billingStreet}
                          onChange={(e) => handleInputChange("billingStreet", e.target.value)}
                          className="md:col-span-2 border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="City"
                          value={formData.billingCity}
                          onChange={(e) => handleInputChange("billingCity", e.target.value)}
                          className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={formData.billingState}
                          onChange={(e) => handleInputChange("billingState", e.target.value)}
                          className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={formData.billingZip}
                          onChange={(e) => handleInputChange("billingZip", e.target.value)}
                          className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <select
                          value={formData.billingCountry}
                          onChange={(e) => handleInputChange("billingCountry", e.target.value)}
                          className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-6 text-secondary-900">Payment Information</h2>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Card Number"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                      className="w-full border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                        className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange("cvv", e.target.value)}
                        className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Name on Card"
                      value={formData.cardName}
                      onChange={(e) => handleInputChange("cardName", e.target.value)}
                      className="w-full border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.savePayment}
                        onChange={(e) => handleInputChange("savePayment", e.target.checked)}
                        className="mr-2 accent-primary-600"
                      />
                      <span className="text-secondary-900">Save payment method for future orders</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-6 text-secondary-900">Review Order</h2>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-4 text-secondary-900">Order Items</h3>
                    <div className="space-y-3">
                      {mockCartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-secondary-200">
                          <div>
                            <p className="font-medium text-secondary-900">{item.product.name}</p>
                            <p className="text-sm text-secondary-600">
                              {item.quantity} × {item.rentalDuration} {item.rentalUnit}(s) - {item.product.vendor}
                            </p>
                          </div>
                          <span className="font-semibold text-secondary-900">${item.total}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2 text-secondary-900">Delivery Method</h3>
                    <p className="text-secondary-600">
                      {deliveryMethods.find(m => m.id === deliveryMethod)?.name}
                    </p>
                  </div>

                  {/* Address Info */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2 text-secondary-900">Delivery Address</h3>
                    <p className="text-secondary-600">
                      {formData.deliveryFirstName} {formData.deliveryLastName}<br />
                      {formData.deliveryStreet}<br />
                      {formData.deliveryCity}, {formData.deliveryState} {formData.deliveryZip}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    currentStep === 1
                      ? 'cursor-not-allowed opacity-50 bg-secondary-300 text-secondary-500'
                      : 'bg-secondary-600 text-white hover:bg-secondary-700'
                  }`}
                >
                  Previous
                </button>
                
                {currentStep < 3 ? (
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-2 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    className="px-6 py-2 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    Place Order
                  </button>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-6 text-secondary-900">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  {mockCartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-secondary-600">{item.product.name} × {item.quantity}</span>
                      <span className="text-secondary-900">${item.total}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-secondary-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-secondary-900">Subtotal</span>
                    <span className="text-secondary-900">${subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-900">Delivery</span>
                    <span className="text-secondary-900">{deliveryFee === 0 ? "Free" : `$${deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-secondary-200 pt-2">
                    <span className="text-secondary-900">Total</span>
                    <span className="text-secondary-900">${total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}