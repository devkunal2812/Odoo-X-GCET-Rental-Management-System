"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import { ShoppingCartIcon, HeartIcon, UserIcon, CheckIcon } from "@heroicons/react/24/outline";

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
    <div className="min-h-screen" style={{ backgroundColor: "var(--eggshell)" }}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold" style={{ color: "var(--deep-space-blue)" }}>
                RentMarket
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/wishlist" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                <HeartIcon className="h-6 w-6" />
              </Link>
              <Link href="/cart" className="hover:opacity-80 transition-opacity relative" style={{ color: "var(--blue-slate)" }}>
                <ShoppingCartIcon className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      style={{ backgroundColor: "var(--deep-space-blue)" }}>
                  {mockCartItems.length}
                </span>
              </Link>
              <Link href="/login" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                <UserIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8" style={{ color: "var(--ink-black)" }}>Checkout</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step <= currentStep ? 'text-white' : ''
                }`} style={{
                  backgroundColor: step <= currentStep ? "var(--deep-space-blue)" : "var(--dusty-denim)",
                  color: step <= currentStep ? "var(--eggshell)" : "var(--blue-slate)"
                }}>
                  {step < currentStep ? <CheckIcon className="h-5 w-5" /> : step}
                </div>
                <div className={`ml-2 text-sm font-medium ${
                  step <= currentStep ? '' : ''
                }`} style={{
                  color: step <= currentStep ? "var(--deep-space-blue)" : "var(--blue-slate)"
                }}>
                  {step === 1 && "Delivery"}
                  {step === 2 && "Payment"}
                  {step === 3 && "Review"}
                </div>
                {step < 3 && (
                  <div className={`mx-4 h-0.5 w-16`} style={{
                    backgroundColor: step < currentStep ? "var(--deep-space-blue)" : "var(--dusty-denim)"
                  }} />
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
                <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--ink-black)" }}>Delivery Information</h2>

                {/* Delivery Method */}
                <div className="mb-6">
                  <h3 className="font-medium mb-4" style={{ color: "var(--ink-black)" }}>Delivery Method</h3>
                  <div className="space-y-3">
                    {deliveryMethods.map((method) => (
                      <label key={method.id} className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:opacity-80"
                             style={{ borderColor: deliveryMethod === method.id ? "var(--deep-space-blue)" : "var(--dusty-denim)" }}>
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value={method.id}
                          checked={deliveryMethod === method.id}
                          onChange={(e) => setDeliveryMethod(e.target.value)}
                          className="mr-3"
                          style={{ accentColor: "var(--deep-space-blue)" }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium" style={{ color: "var(--ink-black)" }}>{method.name}</p>
                              <p className="text-sm" style={{ color: "var(--blue-slate)" }}>{method.description}</p>
                              <p className="text-sm" style={{ color: "var(--blue-slate)" }}>{method.estimatedTime}</p>
                            </div>
                            <span className="font-semibold" style={{ color: "var(--ink-black)" }}>
                              {method.price === 0 ? "Free" : `$${method.price}`}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-6">
                  <h3 className="font-medium mb-4" style={{ color: "var(--ink-black)" }}>Delivery Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={formData.deliveryFirstName}
                      onChange={(e) => handleInputChange("deliveryFirstName", e.target.value)}
                      className="border-2 rounded-lg px-3 py-2"
                      style={{ 
                        borderColor: "var(--dusty-denim)",
                        color: "var(--ink-black)",
                        backgroundColor: "var(--eggshell)"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={formData.deliveryLastName}
                      onChange={(e) => handleInputChange("deliveryLastName", e.target.value)}
                      className="border-2 rounded-lg px-3 py-2"
                      style={{ 
                        borderColor: "var(--dusty-denim)",
                        color: "var(--ink-black)",
                        backgroundColor: "var(--eggshell)"
                      }}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.deliveryEmail}
                      onChange={(e) => handleInputChange("deliveryEmail", e.target.value)}
                      className="border-2 rounded-lg px-3 py-2"
                      style={{ 
                        borderColor: "var(--dusty-denim)",
                        color: "var(--ink-black)",
                        backgroundColor: "var(--eggshell)"
                      }}
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={formData.deliveryPhone}
                      onChange={(e) => handleInputChange("deliveryPhone", e.target.value)}
                      className="border-2 rounded-lg px-3 py-2"
                      style={{ 
                        borderColor: "var(--dusty-denim)",
                        color: "var(--ink-black)",
                        backgroundColor: "var(--eggshell)"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={formData.deliveryStreet}
                      onChange={(e) => handleInputChange("deliveryStreet", e.target.value)}
                      className="md:col-span-2 border-2 rounded-lg px-3 py-2"
                      style={{ 
                        borderColor: "var(--dusty-denim)",
                        color: "var(--ink-black)",
                        backgroundColor: "var(--eggshell)"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.deliveryCity}
                      onChange={(e) => handleInputChange("deliveryCity", e.target.value)}
                      className="border-2 rounded-lg px-3 py-2"
                      style={{ 
                        borderColor: "var(--dusty-denim)",
                        color: "var(--ink-black)",
                        backgroundColor: "var(--eggshell)"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.deliveryState}
                      onChange={(e) => handleInputChange("deliveryState", e.target.value)}
                      className="border-2 rounded-lg px-3 py-2"
                      style={{ 
                        borderColor: "var(--dusty-denim)",
                        color: "var(--ink-black)",
                        backgroundColor: "var(--eggshell)"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={formData.deliveryZip}
                      onChange={(e) => handleInputChange("deliveryZip", e.target.value)}
                      className="border-2 rounded-lg px-3 py-2"
                      style={{ 
                        borderColor: "var(--dusty-denim)",
                        color: "var(--ink-black)",
                        backgroundColor: "var(--eggshell)"
                      }}
                    />
                    <select
                      value={formData.deliveryCountry}
                      onChange={(e) => handleInputChange("deliveryCountry", e.target.value)}
                      className="border-2 rounded-lg px-3 py-2"
                      style={{ 
                        borderColor: "var(--dusty-denim)",
                        color: "var(--ink-black)",
                        backgroundColor: "var(--eggshell)"
                      }}
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
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
                      className="mr-2"
                      style={{ accentColor: "var(--deep-space-blue)" }}
                    />
                    <span style={{ color: "var(--ink-black)" }}>Billing address same as delivery address</span>
                  </label>
                </div>

                {/* Billing Address (if different) */}
                {!sameAsBilling && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-4">Billing Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={formData.billingFirstName}
                        onChange={(e) => handleInputChange("billingFirstName", e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={formData.billingLastName}
                        onChange={(e) => handleInputChange("billingLastName", e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={formData.billingStreet}
                        onChange={(e) => handleInputChange("billingStreet", e.target.value)}
                        className="md:col-span-2 border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.billingCity}
                        onChange={(e) => handleInputChange("billingCity", e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={formData.billingState}
                        onChange={(e) => handleInputChange("billingState", e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        value={formData.billingZip}
                        onChange={(e) => handleInputChange("billingZip", e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <select
                        value={formData.billingCountry}
                        onChange={(e) => handleInputChange("billingCountry", e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--ink-black)" }}>Payment Information</h2>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                    className="w-full border-2 rounded-lg px-3 py-2"
                    style={{ 
                      borderColor: "var(--dusty-denim)",
                      color: "var(--ink-black)",
                      backgroundColor: "var(--eggshell)"
                    }}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                      className="border-2 rounded-lg px-3 py-2"
                      style={{ 
                        borderColor: "var(--dusty-denim)",
                        color: "var(--ink-black)",
                        backgroundColor: "var(--eggshell)"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange("cvv", e.target.value)}
                      className="border-2 rounded-lg px-3 py-2"
                      style={{ 
                        borderColor: "var(--dusty-denim)",
                        color: "var(--ink-black)",
                        backgroundColor: "var(--eggshell)"
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Name on Card"
                    value={formData.cardName}
                    onChange={(e) => handleInputChange("cardName", e.target.value)}
                    className="w-full border-2 rounded-lg px-3 py-2"
                    style={{ 
                      borderColor: "var(--dusty-denim)",
                      color: "var(--ink-black)",
                      backgroundColor: "var(--eggshell)"
                    }}
                  />
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.savePayment}
                      onChange={(e) => handleInputChange("savePayment", e.target.checked)}
                      className="mr-2"
                      style={{ accentColor: "var(--deep-space-blue)" }}
                    />
                    <span style={{ color: "var(--ink-black)" }}>Save payment method for future orders</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--ink-black)" }}>Review Order</h2>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-medium mb-4" style={{ color: "var(--ink-black)" }}>Order Items</h3>
                  <div className="space-y-3">
                    {mockCartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b" style={{ borderColor: "var(--dusty-denim)" }}>
                        <div>
                          <p className="font-medium" style={{ color: "var(--ink-black)" }}>{item.product.name}</p>
                          <p className="text-sm" style={{ color: "var(--blue-slate)" }}>
                            {item.quantity} × {item.rentalDuration} {item.rentalUnit}(s) - {item.product.vendor}
                          </p>
                        </div>
                        <span className="font-semibold" style={{ color: "var(--ink-black)" }}>${item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2" style={{ color: "var(--ink-black)" }}>Delivery Method</h3>
                  <p style={{ color: "var(--blue-slate)" }}>
                    {deliveryMethods.find(m => m.id === deliveryMethod)?.name}
                  </p>
                </div>

                {/* Address Info */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2" style={{ color: "var(--ink-black)" }}>Delivery Address</h3>
                  <p style={{ color: "var(--blue-slate)" }}>
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
                className={`px-6 py-2 rounded-lg ${
                  currentStep === 1
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: currentStep === 1 ? "var(--dusty-denim)" : "var(--blue-slate)",
                  color: "var(--eggshell)"
                }}
              >
                Previous
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2 rounded-lg text-white hover:opacity-90 transition-colors"
                  style={{ backgroundColor: "var(--deep-space-blue)" }}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="px-6 py-2 rounded-lg text-white hover:opacity-90 transition-colors"
                  style={{ backgroundColor: "var(--deep-space-blue)" }}
                >
                  Place Order
                </button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--ink-black)" }}>Order Summary</h2>

              <div className="space-y-3 mb-6">
                {mockCartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span style={{ color: "var(--blue-slate)" }}>{item.product.name} × {item.quantity}</span>
                    <span style={{ color: "var(--ink-black)" }}>${item.total}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-4" style={{ borderColor: "var(--dusty-denim)" }}>
                <div className="flex justify-between">
                  <span style={{ color: "var(--ink-black)" }}>Subtotal</span>
                  <span style={{ color: "var(--ink-black)" }}>${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--ink-black)" }}>Delivery</span>
                  <span style={{ color: "var(--ink-black)" }}>{deliveryFee === 0 ? "Free" : `$${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2" style={{ borderColor: "var(--dusty-denim)" }}>
                  <span style={{ color: "var(--ink-black)" }}>Total</span>
                  <span style={{ color: "var(--ink-black)" }}>${total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
