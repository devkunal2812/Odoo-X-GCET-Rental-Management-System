"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import { CheckIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { useRazorpay } from "../../lib/useRazorpay";
import { getCartItems, getCartTotal, clearCart, CartItem, validateCartAvailability } from "../../lib/cart";

const deliveryMethods = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "Delivered to your address",
    price: 50,
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
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [gstPercentage, setGstPercentage] = useState(18); // Default 18% GST
  const { isLoaded, createOrder, verifyPayment, openRazorpay } = useRazorpay();
  
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
    deliveryCountry: "India",
    
    // Billing Address
    billingFirstName: "",
    billingLastName: "",
    billingEmail: "",
    billingPhone: "",
    billingStreet: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    billingCountry: "India"
  });

  // Load cart items when component mounts
  useEffect(() => {
    const loadCartItems = () => {
      const items = getCartItems();
      setCartItems(items);
      setCartLoaded(true);
      
      // Load applied coupon from localStorage
      const savedCoupon = localStorage.getItem('appliedCoupon');
      if (savedCoupon) {
        try {
          setAppliedCoupon(JSON.parse(savedCoupon));
        } catch (error) {
          console.error('Error loading coupon:', error);
        }
      }
    };

    loadCartItems();

    // Listen for cart updates
    const handleCartUpdate = () => loadCartItems();
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  // Fetch GST percentage from settings
  useEffect(() => {
    const fetchGSTSettings = async () => {
      try {
        const response = await fetch('/api/settings/public');
        const data = await response.json();
        
        if (data.success && data.settings.gst_percentage) {
          setGstPercentage(data.settings.gst_percentage);
        }
      } catch (error) {
        console.error('Error fetching GST settings:', error);
        // Keep default 18% if fetch fails
      }
    };

    fetchGSTSettings();
  }, []);

  // Calculate totals from real cart data
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.unitPrice * item.quantity * item.rentalDuration);
  }, 0);
  const deliveryFee = deliveryMethods.find(m => m.id === deliveryMethod)?.price || 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const gstAmount = (subtotalAfterDiscount + deliveryFee) * (gstPercentage / 100);
  const total = subtotalAfterDiscount + deliveryFee + gstAmount;

  // Show loading state while cart is loading
  if (!cartLoaded) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        
        <div className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-semibold text-secondary-900 mb-2">Loading Checkout...</h1>
              <p className="text-secondary-600">Please wait while we prepare your order.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to cart if no items
  if (cartLoaded && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        
        <div className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h1 className="text-3xl font-bold text-secondary-900 mb-4">Your Cart is Empty</h1>
              <p className="text-secondary-600 mb-6">
                Add some items to your cart before proceeding to checkout.
              </p>
              <Link
                href="/products"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  const saveOrderAfterPayment = async (paymentId: string, razorpayOrderId: string) => {
    try {
      // Call API to create order in database
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems,
          formData,
          deliveryMethod,
          total,
          paymentId,
          razorpayOrderId
        })
      });

      const result = await response.json();

      if (result.success) {
        setSavedOrderId(result.order.id);
        console.log('✅ Order saved to database successfully:', result.order);
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('❌ Error saving order to database:', error);
      // Show error to user but don't create fallback order
      alert('Order could not be saved. Please contact support with your payment ID: ' + paymentId);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!isLoaded) {
      alert('Payment system is loading. Please try again.');
      return;
    }

    setPaymentProcessing(true);

    try {
      // STEP 1: Validate cart availability before payment
      console.log('🔍 Validating cart availability before payment...');
      const availabilityCheck = await validateCartAvailability();
      
      if (!availabilityCheck.valid) {
        setPaymentProcessing(false);
        
        // Show detailed error message
        let errorMessage = availabilityCheck.message;
        if (availabilityCheck.invalidItems && availabilityCheck.invalidItems.length > 0) {
          errorMessage += '\n\nUnavailable items:';
          availabilityCheck.invalidItems.forEach(item => {
            errorMessage += `\n• ${item.error}`;
          });
        }
        errorMessage += '\n\nPlease update your cart and try again.';
        
        alert(errorMessage);
        return;
      }

      console.log('✅ Cart availability validated successfully');

      // STEP 2: Create order with Razorpay
      const orderData = await createOrder(total, `receipt_${Date.now()}`);
      
      if (!orderData.success) {
        throw new Error('Failed to create payment order');
      }

      // Configure Razorpay options with explicit UPI support
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RentMarket',
        description: 'Rental Equipment Payment',
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verificationResult.success) {
              // Save order after successful payment
              await saveOrderAfterPayment(response.razorpay_payment_id, response.razorpay_order_id);
              
              // Clear cart after successful payment
              clearCart();
              
              // Trigger order update event for other pages to refresh
              window.dispatchEvent(new CustomEvent('orderUpdated'));
              
              setOrderPlaced(true);
              setCurrentStep(4); // Move to success step
              console.log('✅ Payment successful and order saved to database:', verificationResult);
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          } finally {
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: `${formData.deliveryFirstName} ${formData.deliveryLastName}`,
          email: formData.deliveryEmail,
          contact: formData.deliveryPhone,
        },
        theme: {
          color: '#37353E', // Using our primary color
        },
        // Enable all payment methods explicitly
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: false,
          paylater: false
        },
        // Force UPI to be available
        config: {
          display: {
            blocks: {
              upi: {
                name: 'UPI & QR',
                instruments: [
                  {
                    method: 'upi'
                  }
                ]
              },
              card: {
                name: 'Cards',
                instruments: [
                  {
                    method: 'card'
                  }
                ]
              },
              netbanking: {
                name: 'Net Banking',
                instruments: [
                  {
                    method: 'netbanking'
                  }
                ]
              },
              wallet: {
                name: 'Wallets',
                instruments: [
                  {
                    method: 'wallet'
                  }
                ]
              }
            },
            hide: [
              {
                method: 'emi'
              },
              {
                method: 'paylater'
              }
            ],
            sequence: ['block.upi', 'block.card', 'block.netbanking', 'block.wallet'],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            console.log('Payment cancelled by user');
          },
        },
      };

      // Open Razorpay checkout
      openRazorpay(options);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
      setPaymentProcessing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        
        <div className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckIcon className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-4">Order Placed Successfully!</h1>
              <p className="text-secondary-600 mb-6">
                Thank you for your order. You will receive a confirmation email shortly.
              </p>
              {savedOrderId && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                  <p className="text-primary-800 font-semibold">Order ID: {savedOrderId}</p>
                  <p className="text-primary-600 text-sm">Keep this ID for your records</p>
                </div>
              )}
              <div className="space-y-2 mb-8">
                <p className="text-sm text-secondary-600">Subtotal: ₹{subtotal.toFixed(2)}</p>
                {appliedCoupon && (
                  <p className="text-sm text-green-600">Discount ({appliedCoupon.code}): -₹{discountAmount.toFixed(2)}</p>
                )}
                <p className="text-sm text-secondary-600">Delivery: {deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}</p>
                <p className="text-sm text-secondary-600">GST ({gstPercentage}%): ₹{gstAmount.toFixed(2)}</p>
                <p className="text-sm font-semibold text-secondary-900">Order Total: ₹{total.toFixed(2)}</p>
                <p className="text-sm text-secondary-600">Payment Method: Razorpay</p>
                <p className="text-sm text-secondary-600">Delivery Method: {deliveryMethods.find(m => m.id === deliveryMethod)?.name}</p>
              </div>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/orders"
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  View Orders
                </Link>
                <Link
                  href="/products"
                  className="px-6 py-3 bg-secondary-100 text-secondary-900 rounded-lg hover:bg-secondary-200 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                    {step === 2 && "Review"}
                    {step === 3 && "Payment"}
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
                        placeholder="PIN Code"
                        value={formData.deliveryZip}
                        onChange={(e) => handleInputChange("deliveryZip", e.target.value)}
                        className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <select
                        value={formData.deliveryCountry}
                        onChange={(e) => handleInputChange("deliveryCountry", e.target.value)}
                        className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="India">India</option>
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
                          placeholder="PIN Code"
                          value={formData.billingZip}
                          onChange={(e) => handleInputChange("billingZip", e.target.value)}
                          className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <select
                          value={formData.billingCountry}
                          onChange={(e) => handleInputChange("billingCountry", e.target.value)}
                          className="border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Review */}
              {currentStep === 2 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-6 text-secondary-900">Review Order</h2>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-4 text-secondary-900">Order Items</h3>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-secondary-200">
                          <div>
                            <p className="font-medium text-secondary-900">{item.product.name}</p>
                            <p className="text-sm text-secondary-600">
                              {item.quantity} × {item.rentalDuration} {item.rentalUnit}(s) - {item.product.vendor}
                            </p>
                          </div>
                          <span className="font-semibold text-secondary-900">₹{item.unitPrice * item.quantity * item.rentalDuration}</span>
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

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-6 text-secondary-900">Payment</h2>

                  <div className="text-center py-8">
                    <CreditCardIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">Secure Payment with Razorpay</h3>
                    <p className="text-secondary-600 mb-6">
                      Pay securely using multiple payment methods including UPI QR code, Google Pay, PhonePe, Paytm, cards, and net banking.
                    </p>
                    
                    {/* Payment Methods */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-secondary-50 p-3 rounded-lg">
                        <div className="text-2xl mb-1">📱</div>
                        <p className="text-xs text-secondary-600">UPI QR Code</p>
                      </div>
                      <div className="bg-secondary-50 p-3 rounded-lg">
                        <div className="text-2xl mb-1">💳</div>
                        <p className="text-xs text-secondary-600">Cards</p>
                      </div>
                      <div className="bg-secondary-50 p-3 rounded-lg">
                        <div className="text-2xl mb-1">🏦</div>
                        <p className="text-xs text-secondary-600">Net Banking</p>
                      </div>
                      <div className="bg-secondary-50 p-3 rounded-lg">
                        <div className="text-2xl mb-1">💰</div>
                        <p className="text-xs text-secondary-600">Wallets</p>
                      </div>
                    </div>
                    
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-secondary-700">Subtotal:</span>
                          <span className="text-secondary-900">₹{subtotal.toFixed(2)}</span>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between items-center text-sm text-green-600">
                            <span>Discount ({appliedCoupon.code}):</span>
                            <span>-₹{discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-secondary-700">Delivery:</span>
                          <span className="text-secondary-900">{deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-secondary-700">GST ({gstPercentage}%):</span>
                          <span className="text-secondary-900">₹{gstAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-primary-300">
                        <span className="text-secondary-900 font-semibold">Total Amount:</span>
                        <span className="text-2xl font-bold text-primary-600">₹{total.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleRazorpayPayment}
                      disabled={paymentProcessing || !isLoaded}
                      className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                        paymentProcessing || !isLoaded
                          ? 'bg-secondary-300 text-secondary-500 cursor-not-allowed'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {paymentProcessing ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing Payment...
                        </div>
                      ) : !isLoaded ? (
                        'Loading Payment System...'
                      ) : (
                        `Pay ₹${total} with Razorpay`
                      )}
                    </button>

                    <p className="text-xs text-secondary-500 mt-4">
                      Your payment information is secure and encrypted. Scan QR code with any UPI app like Google Pay, PhonePe, or Paytm.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 3 && (
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
                  
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-2 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}

              {currentStep === 3 && (
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handlePreviousStep}
                    className="px-6 py-2 rounded-lg font-medium bg-secondary-600 text-white hover:bg-secondary-700 transition-colors"
                  >
                    Previous
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-6 text-secondary-900">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-secondary-600">{item.product.name} × {item.quantity}</span>
                      <span className="text-secondary-900">₹{item.unitPrice * item.quantity * item.rentalDuration}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-secondary-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-secondary-900">Subtotal</span>
                    <span className="text-secondary-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-medium">Discount ({appliedCoupon.code})</span>
                      <span className="font-medium">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-secondary-900">Delivery</span>
                    <span className="text-secondary-900">{deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-900">GST ({gstPercentage}%)</span>
                    <span className="text-secondary-900">₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-secondary-200 pt-2">
                    <span className="text-secondary-900">Total</span>
                    <span className="text-primary-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Security Info */}
                <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
                  <h4 className="font-medium text-secondary-900 mb-2">Secure Payment</h4>
                  <p className="text-xs text-secondary-600">
                    Your payment is processed securely by Razorpay with 256-bit SSL encryption.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}