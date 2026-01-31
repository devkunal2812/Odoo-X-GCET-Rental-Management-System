"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import { 
  TrashIcon,
  StarIcon,
  HeartIcon,
  ShoppingCartIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

// Mock wishlist data
const mockWishlistItems = [
  {
    id: "1",
    productId: "1",
    name: "Professional Camera Kit",
    price: 25,
    priceUnit: "day" as const,
    image: "/api/placeholder/300/300",
    vendor: "TechRent Pro",
    category: "Electronics",
    rating: 4.8,
    reviews: 124,
    available: true
  },
  {
    id: "2",
    productId: "3",
    name: "Party Sound System",
    price: 50,
    priceUnit: "day" as const,
    image: "/api/placeholder/300/300", 
    vendor: "EventPro",
    category: "Party Supplies",
    rating: 4.9,
    reviews: 156,
    available: true
  },
  {
    id: "3",
    productId: "5",
    name: "Projector & Screen",
    price: 40,
    priceUnit: "day" as const,
    image: "/api/placeholder/300/300",
    vendor: "TechRent Pro", 
    category: "Electronics",
    rating: 4.5,
    reviews: 67,
    available: false
  }
];

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const addToCart = (productId: string) => {
    console.log("Adding to cart:", productId);
    alert("Added to cart!");
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header currentPage="wishlist" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-secondary-900">My Wishlist</h1>
          <p className="text-secondary-600">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <HeartIcon className="h-24 w-24 mx-auto mb-6 text-secondary-400" />
            <h2 className="text-2xl font-semibold mb-4 text-secondary-900">Your wishlist is empty</h2>
            <p className="mb-8 text-secondary-600">
              Start browsing and save your favorite products for later!
            </p>
            <Link
              href="/products"
              className="px-8 py-3 rounded-lg font-semibold text-white transition-colors hover:opacity-90 bg-primary-600"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Wishlist Actions */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setWishlistItems([])}
                  className="text-sm hover:opacity-80 transition-opacity text-secondary-600"
                >
                  Clear All
                </button>
              </div>
              <div className="text-sm text-secondary-600">
                Share your wishlist with friends
              </div>
            </div>

            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="h-48 bg-secondary-300"></div>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                    >
                      <HeartSolidIcon className="h-5 w-5 text-primary-600" />
                    </button>
                    {!item.available && (
                      <div className="absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-full text-white bg-secondary-500">
                        Unavailable
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-secondary-900">{item.name}</h3>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary-600">
                          ${item.price}
                        </div>
                        <div className="text-sm text-secondary-600">
                          per {item.priceUnit}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-2 text-secondary-600">by {item.vendor}</p>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <StarSolidIcon 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-secondary-600">
                        {item.rating} ({item.reviews} reviews)
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        href={`/products/${item.productId}`}
                        className="flex-1 text-center py-2 px-4 rounded-lg border-2 border-primary-600 text-primary-600 transition-colors hover:opacity-80 bg-transparent"
                      >
                        View Details
                      </Link>
                      {item.available ? (
                        <button 
                          onClick={() => addToCart(item.productId)}
                          className="py-2 px-4 rounded-lg text-white transition-colors hover:opacity-90 bg-primary-600"
                        >
                          <ShoppingCartIcon className="h-5 w-5" />
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="py-2 px-4 rounded-lg text-white opacity-50 cursor-not-allowed bg-secondary-500"
                        >
                          <ShoppingCartIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-12 text-center">
              <Link
                href="/products"
                className="px-8 py-3 rounded-lg font-semibold border-2 border-primary-600 text-primary-600 transition-colors hover:opacity-80 bg-transparent"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Recommendations */}
            <section className="mt-16">
              <h2 className="text-2xl font-bold mb-8 text-secondary-900">You Might Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: "Power Drill Set", price: 15, vendor: "ToolMaster", rating: 4.6 },
                  { name: "Mountain Bike", price: 30, vendor: "BikeRentals", rating: 4.7 },
                  { name: "Lawn Mower", price: 20, vendor: "GardenTools", rating: 4.4 },
                  { name: "Gaming Console", price: 35, vendor: "GameRent", rating: 4.8 }
                ].map((product, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-secondary-400"></div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1 text-secondary-900">{product.name}</h3>
                      <p className="text-sm mb-2 text-secondary-600">by {product.vendor}</p>
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-primary-600">
                          ${product.price}/day
                        </div>
                        <div className="flex items-center">
                          <StarSolidIcon className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-secondary-600">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">RentMarket</h3>
              <p className="text-secondary-400">
                Your trusted marketplace for renting everything you need.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="hover:opacity-80 transition-opacity text-secondary-400">Products</Link></li>
                <li><Link href="/about" className="hover:opacity-80 transition-opacity text-secondary-400">About Us</Link></li>
                <li><Link href="/contact" className="hover:opacity-80 transition-opacity text-secondary-400">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="hover:opacity-80 transition-opacity text-secondary-400">Help Center</Link></li>
                <li><Link href="/terms" className="hover:opacity-80 transition-opacity text-secondary-400">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:opacity-80 transition-opacity text-secondary-400">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Contact Info</h4>
              <div className="space-y-2 text-secondary-400">
                <p>Email: support@rentmarket.com</p>
                <p>Phone: (555) 123-4567</p>
              </div>
            </div>
          </div>
          <div className="border-t border-secondary-700 mt-8 pt-8 text-center text-secondary-400">
            <p>&copy; 2024 RentMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}