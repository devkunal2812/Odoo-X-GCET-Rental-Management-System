"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { TrashIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { 
  getCartItems, 
  updateCartItemQuantityWithStockCheck, 
  updateCartItemDuration, 
  removeFromCart,
  type CartItem 
} from "../../lib/cart";

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [gstPercentage, setGstPercentage] = useState(18); // Default 18% GST
  const [stockErrors, setStockErrors] = useState<{[itemId: string]: string}>({});

  // Load cart items from localStorage
  useEffect(() => {
    const loadCartItems = () => {
      const items = getCartItems();
      setCartItems(items);
    };

    loadCartItems();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCartItems();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
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

  const updateQuantity = (itemId: string, newQuantity: number) => {
    const item = cartItems.find(cartItem => cartItem.id === itemId);
    if (!item) return;

    const availableStock = item.product.stock || 0;
    const result = updateCartItemQuantityWithStockCheck(itemId, newQuantity, availableStock);
    
    if (!result.success) {
      // Show error message
      setStockErrors(prev => ({
        ...prev,
        [itemId]: result.message
      }));
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setStockErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[itemId];
          return newErrors;
        });
      }, 3000);
    } else {
      // Clear any existing error for this item
      setStockErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[itemId];
        return newErrors;
      });
    }
  };

  const updateDuration = (itemId: string, newDuration: number) => {
    updateCartItemDuration(itemId, newDuration);
  };

  const removeItem = (itemId: string) => {
    removeFromCart(itemId); 
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      alert("Please enter a coupon code");
      return;
    }

    // Get the vendor ID from the first cart item (assuming single vendor per cart)
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const vendorId = cartItems[0].product.vendorId;
    
    if (!vendorId) {
      alert("Unable to validate coupon. Please remove items from cart and add them again.");
      return;
    }

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          orderAmount: subtotal,
          vendorId: vendorId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAppliedCoupon({ 
          code: couponCode, 
          discount: data.discount 
        });
        setCouponCode("");
      } else {
        alert(data.error || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      alert("Failed to validate coupon. Please try again.");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleCheckout = () => {
    if (!user) {
      // Save current path to redirect back after login
      localStorage.setItem('redirectAfterLogin', '/checkout');
      router.push('/login');
    } else {
      // Save coupon data to localStorage for checkout
      if (appliedCoupon) {
        localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('appliedCoupon');
      }
      router.push('/checkout');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.unitPrice * item.quantity * item.rentalDuration);
  }, 0);

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const gstAmount = subtotalAfterDiscount * (gstPercentage / 100);
  const total = subtotalAfterDiscount + gstAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header currentPage="cart" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with gradient background */}
        <div className="text-center mb-12 py-8 px-6 rounded-2xl shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <ShoppingCartIcon className="h-16 w-16 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-lg opacity-90 text-blue-100">
            {cartItems.length > 0 ? `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart` : 'Your cart awaits'}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center bg-gray-100">
                <ShoppingCartIcon className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Your cart is empty</h2>
              <p className="text-lg mb-8 text-gray-600">
                Discover amazing products and start your rental journey!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b-2 bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
                  <h2 className="text-2xl font-bold flex items-center text-gray-900">
                    <ShoppingCartIcon className="h-6 w-6 mr-3 text-blue-600" />
                    Cart Items ({cartItems.length})
                  </h2>
                </div>
                
                <div className="divide-y-2 divide-gray-100">
                  {cartItems.map((item, index) => (
                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-6">
                        {/* Product Image with gradient overlay */}
                        <div className="relative w-28 h-28 rounded-xl flex-shrink-0 overflow-hidden shadow-lg">
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          <div className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gray-900">
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold mb-1 text-gray-900">{item.product.name}</h3>
                          <p className="text-sm font-medium mb-3 text-gray-600">by {item.product.vendor}</p>
                          
                          {/* Selected Attributes and Rental Dates */}
                          <div className="mb-4">
                            {item.selectedAttributes && Object.entries(item.selectedAttributes).map(([key, value]) => (
                              <span key={key} className="inline-block text-xs px-3 py-1 rounded-full mr-2 mb-1 font-medium shadow-sm bg-blue-50 text-blue-700">
                                {key}: {value}
                              </span>
                            ))}
                            {item.rentalStartDate && item.rentalEndDate && (
                              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                <div className="text-xs font-medium text-green-800 mb-1">Rental Period</div>
                                <div className="text-xs text-green-700">
                                  <div>Start: {new Date(item.rentalStartDate).toLocaleString()}</div>
                                  <div>End: {new Date(item.rentalEndDate).toLocaleString()}</div>
                                  <div>Duration: {item.rentalDuration} day{item.rentalDuration > 1 ? 's' : ''}</div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Quantity and Duration Controls with better styling */}
                          <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center">
                              <label className="text-sm font-bold mr-3 text-gray-900">Quantity:</label>
                              <div className="flex items-center bg-white border-2 rounded-lg shadow-sm border-gray-200">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg text-gray-600"
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="px-4 py-2 text-sm font-bold min-w-[3rem] text-center text-gray-900">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={(item.product.stock || 0) <= item.quantity}
                                  className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>
                              {item.product.stock && (
                                <span className="ml-2 text-xs text-gray-500">
                                  (Stock: {item.product.stock})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center">
                              <label className="text-sm font-bold mr-3 text-gray-900">
                                Duration ({item.rentalUnit}s):
                              </label>
                              <div className="flex items-center bg-white border-2 rounded-lg shadow-sm border-gray-200">
                                <button
                                  onClick={() => updateDuration(item.id, item.rentalDuration - 1)}
                                  className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg text-gray-600"
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="px-4 py-2 text-sm font-bold min-w-[3rem] text-center text-gray-900">{item.rentalDuration}</span>
                                <button
                                  onClick={() => updateDuration(item.id, item.rentalDuration + 1)}
                                  className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg text-gray-600"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Stock Error Message */}
                          {stockErrors[item.id] && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-600">{stockErrors[item.id]}</p>
                            </div>
                          )}
                        </div>

                        {/* Price and Remove Button */}
                        <div className="text-right flex flex-col items-end">
                          <div className="text-2xl font-bold mb-1 text-gray-900">
                            ₹{item.unitPrice * item.quantity * item.rentalDuration}
                          </div>
                          <div className="text-sm mb-4 text-gray-600">
                            ₹{item.unitPrice} × {item.quantity} × {item.rentalDuration} {item.rentalUnit}(s)
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-all transform hover:scale-110 shadow-sm text-red-600 bg-white border border-red-200"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Shopping with better styling */}
              <div className="mt-8 text-center">
                <Link
                  href="/products"
                  className="inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg transform hover:scale-105 bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-6">
                {/* Header with gradient */}
                <div className="p-6 border-b-2 bg-gradient-to-r from-blue-600 to-purple-600 border-gray-200">
                  <h2 className="text-2xl font-bold text-white">Order Summary</h2>
                </div>

                <div className="p-6">
                  {/* Coupon Code Section */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold mb-3 text-gray-900">
                      🎟️ Coupon Code
                    </label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-4 rounded-xl shadow-sm bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-green-500">
                            <span className="text-white text-sm font-bold">✓</span>
                          </div>
                          <span className="font-bold text-gray-900">{appliedCoupon.code}</span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="px-3 py-1 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity bg-red-100 text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex rounded-xl overflow-hidden shadow-sm border-2 border-gray-200">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon code"
                          className="flex-1 px-4 py-3 focus:outline-none text-gray-900 bg-white"
                        />
                        <button
                          onClick={applyCoupon}
                          className="px-6 py-3 font-bold transition-all hover:opacity-90 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown with better styling */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium text-gray-900">Subtotal</span>
                      <span className="font-bold text-lg text-gray-900">₹{subtotal.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-green-100 text-green-700">
                        <span className="font-medium">💰 Discount</span>
                        <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium text-gray-900">GST ({gstPercentage}%)</span>
                      <span className="font-bold text-lg text-gray-900">₹{gstAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t-2 pt-4 border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-blue-600">₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button with gradient */}
                  {!user && !authLoading && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <p className="text-sm text-blue-800">
                        🔐 Please login to proceed with checkout
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleCheckout}
                    disabled={authLoading}
                    className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all hover:shadow-lg transform hover:scale-105 text-center block mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {authLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Loading...
                      </span>
                    ) : !user ? (
                      '🔐 Login to Checkout'
                    ) : (
                      '🚀 Proceed to Checkout'
                    )}
                  </button>

                  {/* Security Note with icon */}
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-600">
                      🔒 Secure checkout with SSL encryption
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-white py-12 mt-16 bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">RentMarket</h3>
              <p className="text-secondary-300">
                Your trusted marketplace for renting everything you need.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="hover:opacity-80 transition-opacity text-secondary-300">Products</Link></li>
                <li><Link href="/about" className="hover:opacity-80 transition-opacity text-secondary-300">About Us</Link></li>
                <li><Link href="/contact" className="hover:opacity-80 transition-opacity text-secondary-300">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="hover:opacity-80 transition-opacity text-secondary-300">Help Center</Link></li>
                <li><Link href="/terms" className="hover:opacity-80 transition-opacity text-secondary-300">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:opacity-80 transition-opacity text-secondary-300">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Contact Info</h4>
              <div className="space-y-2 text-secondary-300">
                <p>Email: support@rentmarket.com</p>
                <p>Phone: (555) 123-4567</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center border-secondary-700 text-secondary-300">
            <p>&copy; 2024 RentMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
