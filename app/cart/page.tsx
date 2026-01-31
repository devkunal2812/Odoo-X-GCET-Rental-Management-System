"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCartIcon, HeartIcon, UserIcon, TrashIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

// Mock cart data
const mockCartItems = [
  {
    id: "1",
    productId: "1",
    product: {
      id: "1",
      name: "Professional Camera Kit",
      image: "/api/placeholder/150/150",
      vendor: "TechRent Pro"
    },
    quantity: 1,
    rentalDuration: 3,
    rentalUnit: "day" as const,
    unitPrice: 25,
    selectedAttributes: { color: "Black", lens: "Professional Kit" }
  },
  {
    id: "2", 
    productId: "2",
    product: {
      id: "2",
      name: "Power Drill Set",
      image: "/api/placeholder/150/150",
      vendor: "ToolMaster"
    },
    quantity: 2,
    rentalDuration: 1,
    rentalUnit: "week" as const,
    unitPrice: 80,
    selectedAttributes: { color: "Red" }
  }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const updateDuration = (itemId: string, newDuration: number) => {
    if (newDuration < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, rentalDuration: newDuration } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const applyCoupon = () => {
    // Mock coupon validation
    if (couponCode.toLowerCase() === "save10") {
      setAppliedCoupon({ code: couponCode, discount: 0.1 });
      setCouponCode("");
    } else {
      alert("Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.unitPrice * item.quantity * item.rentalDuration);
  }, 0);

  const discountAmount = appliedCoupon ? subtotal * appliedCoupon.discount : 0;
  const total = subtotal - discountAmount;

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
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/products" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                Products
              </Link>
              <Link href="/about" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                About Us
              </Link>
              <Link href="/contact" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                Contact Us
              </Link>
              <Link href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                Terms & Conditions
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/wishlist" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                <HeartIcon className="h-6 w-6" />
              </Link>
              <Link href="/cart" className="relative" style={{ color: "var(--deep-space-blue)" }}>
                <ShoppingCartIcon className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      style={{ backgroundColor: "var(--deep-space-blue)" }}>
                  {cartItems.length}
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
        <h1 className="text-3xl font-bold mb-8" style={{ color: "var(--ink-black)" }}>Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCartIcon className="h-24 w-24 mx-auto mb-4" style={{ color: "var(--dusty-denim)" }} />
            <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--ink-black)" }}>Your cart is empty</h2>
            <p className="mb-6" style={{ color: "var(--blue-slate)" }}>Add some products to get started!</p>
            <Link
              href="/products"
              className="px-6 py-3 rounded-lg text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--deep-space-blue)" }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b" style={{ borderColor: "var(--dusty-denim)" }}>
                  <h2 className="text-xl font-semibold" style={{ color: "var(--ink-black)" }}>Cart Items ({cartItems.length})</h2>
                </div>
                
                <div className="divide-y" style={{ borderColor: "var(--dusty-denim)" }}>
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-24 h-24 rounded-lg flex-shrink-0" style={{ backgroundColor: "var(--dusty-denim)" }}></div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium" style={{ color: "var(--ink-black)" }}>{item.product.name}</h3>
                          <p className="text-sm" style={{ color: "var(--blue-slate)" }}>by {item.product.vendor}</p>
                          
                          {/* Selected Attributes */}
                          <div className="mt-2">
                            {Object.entries(item.selectedAttributes).map(([key, value]) => (
                              <span key={key} className="inline-block text-xs px-2 py-1 rounded mr-2"
                                    style={{ backgroundColor: "var(--dusty-denim)", color: "var(--eggshell)" }}>
                                {key}: {value}
                              </span>
                            ))}
                          </div>

                          {/* Quantity and Duration Controls */}
                          <div className="mt-4 flex items-center space-x-6">
                            <div className="flex items-center">
                              <label className="text-sm font-medium mr-2" style={{ color: "var(--ink-black)" }}>Qty:</label>
                              <div className="flex items-center border-2 rounded" style={{ borderColor: "var(--dusty-denim)" }}>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 hover:opacity-80"
                                  style={{ color: "var(--blue-slate)" }}
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="px-3 py-1 text-sm" style={{ color: "var(--ink-black)" }}>{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 hover:opacity-80"
                                  style={{ color: "var(--blue-slate)" }}
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <label className="text-sm font-medium mr-2" style={{ color: "var(--ink-black)" }}>
                                Duration ({item.rentalUnit}s):
                              </label>
                              <div className="flex items-center border-2 rounded" style={{ borderColor: "var(--dusty-denim)" }}>
                                <button
                                  onClick={() => updateDuration(item.id, item.rentalDuration - 1)}
                                  className="p-1 hover:opacity-80"
                                  style={{ color: "var(--blue-slate)" }}
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="px-3 py-1 text-sm" style={{ color: "var(--ink-black)" }}>{item.rentalDuration}</span>
                                <button
                                  onClick={() => updateDuration(item.id, item.rentalDuration + 1)}
                                  className="p-1 hover:opacity-80"
                                  style={{ color: "var(--blue-slate)" }}
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-semibold" style={{ color: "var(--ink-black)" }}>
                            ${item.unitPrice * item.quantity * item.rentalDuration}
                          </div>
                          <div className="text-sm" style={{ color: "var(--blue-slate)" }}>
                            ${item.unitPrice} × {item.quantity} × {item.rentalDuration} {item.rentalUnit}(s)
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="mt-2 hover:opacity-80 transition-opacity"
                            style={{ color: "var(--deep-space-blue)" }}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link
                  href="/products"
                  className="font-medium hover:opacity-80 transition-opacity"
                  style={{ color: "var(--deep-space-blue)" }}
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--ink-black)" }}>Order Summary</h2>

                {/* Coupon Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--ink-black)" }}>
                    Coupon Code
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-lg border-2"
                         style={{ backgroundColor: "var(--dusty-denim)", borderColor: "var(--dusty-denim)" }}>
                      <span className="font-medium" style={{ color: "var(--eggshell)" }}>{appliedCoupon.code}</span>
                      <button
                        onClick={removeCoupon}
                        className="hover:opacity-80 transition-opacity"
                        style={{ color: "var(--deep-space-blue)" }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 border-2 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2"
                        style={{ 
                          borderColor: "var(--dusty-denim)",
                          color: "var(--ink-black)",
                          backgroundColor: "var(--eggshell)"
                        }}
                      />
                      <button
                        onClick={applyCoupon}
                        className="border-2 border-l-0 rounded-r-lg px-4 py-2 hover:opacity-80 transition-opacity"
                        style={{ 
                          backgroundColor: "var(--dusty-denim)", 
                          borderColor: "var(--dusty-denim)",
                          color: "var(--eggshell)"
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--ink-black)" }}>Subtotal</span>
                    <span style={{ color: "var(--ink-black)" }}>${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between" style={{ color: "var(--deep-space-blue)" }}>
                      <span>Discount ({(appliedCoupon.discount * 100).toFixed(0)}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3" style={{ borderColor: "var(--dusty-denim)" }}>
                    <div className="flex justify-between text-lg font-semibold">
                      <span style={{ color: "var(--ink-black)" }}>Total</span>
                      <span style={{ color: "var(--ink-black)" }}>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors hover:opacity-90 text-center block"
                  style={{ backgroundColor: "var(--deep-space-blue)" }}
                >
                  Proceed to Checkout
                </Link>

                {/* Security Note */}
                <p className="text-xs mt-4 text-center" style={{ color: "var(--blue-slate)" }}>
                  Secure checkout with SSL encryption
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-white py-12 mt-16" style={{ backgroundColor: "var(--ink-black)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ color: "var(--eggshell)" }}>RentMarket</h3>
              <p style={{ color: "var(--dusty-denim)" }}>
                Your trusted marketplace for renting everything you need.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--eggshell)" }}>Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>Products</Link></li>
                <li><Link href="/about" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>About Us</Link></li>
                <li><Link href="/contact" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--eggshell)" }}>Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>Help Center</Link></li>
                <li><Link href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--eggshell)" }}>Contact Info</h4>
              <div className="space-y-2" style={{ color: "var(--dusty-denim)" }}>
                <p>Email: support@rentmarket.com</p>
                <p>Phone: (555) 123-4567</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center" style={{ borderColor: "var(--blue-slate)", color: "var(--dusty-denim)" }}>
            <p>&copy; 2024 RentMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}