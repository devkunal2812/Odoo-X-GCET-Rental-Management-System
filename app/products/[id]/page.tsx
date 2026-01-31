"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "../../../components/Header";
import { ShoppingCartIcon, HeartIcon, StarIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { addToCart } from "../../../lib/cart";

// Mock product data
const mockProduct = {
  id: "1",
  name: "Professional Camera Kit",
  description: "Complete professional camera kit including DSLR camera, multiple lenses, tripod, and lighting equipment. Perfect for photography sessions, events, and video production.",
  images: [
    "/api/placeholder/600/400",
    "/api/placeholder/600/400", 
    "/api/placeholder/600/400"
  ],
  price: 25,
  priceUnit: "day" as const,
  vendor: {
    id: "v1",
    name: "TechRent Pro",
    logo: "/api/placeholder/100/100",
    rating: 4.8,
    reviews: 324
  },
  category: "Electronics",
  rating: 4.8,
  reviews: 124,
  quantityOnHand: 5,
  attributes: [
    {
      id: "color",
      name: "Color",
      displayType: "pills" as const,
      values: ["Black", "Silver"]
    },
    {
      id: "lens",
      name: "Lens Type", 
      displayType: "radio" as const,
      values: ["Standard Kit", "Professional Kit", "Premium Kit"]
    }
  ],
  rentalPeriods: [
    { unit: "hour" as const, price: 5, minDuration: 4 },
    { unit: "day" as const, price: 25, minDuration: 1 },
    { unit: "week" as const, price: 150, minDuration: 1 }
  ]
};

const mockReviews = [
  {
    id: "1",
    customerName: "John D.",
    rating: 5,
    comment: "Excellent camera kit! Everything was in perfect condition and the vendor was very helpful.",
    date: "2024-01-15"
  },
  {
    id: "2", 
    customerName: "Sarah M.",
    rating: 4,
    comment: "Great quality equipment. The pickup process was smooth and professional.",
    date: "2024-01-10"
  },
  {
    id: "3",
    customerName: "Mike R.",
    rating: 5,
    comment: "Perfect for my wedding photography. Highly recommend this rental!",
    date: "2024-01-05"
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedRentalPeriod, setSelectedRentalPeriod] = useState(mockProduct.rentalPeriods[1]);
  const [rentalDuration, setRentalDuration] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const totalPrice = selectedRentalPeriod.price * rentalDuration * quantity;

  const handleAttributeChange = (attributeId: string, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeId]: value
    }));
  };

  const handleAddToCart = () => {
    console.log('Adding product to cart from detail page:', {
      productId: params.id,
      quantity,
      rentalDuration,
      selectedRentalPeriod,
      selectedAttributes
    }); // Debug log
    
    addToCart({
      productId: params.id as string,
      product: {
        id: mockProduct.id,
        name: mockProduct.name,
        image: mockProduct.images[0],
        vendor: mockProduct.vendor.name
      },
      quantity,
      rentalDuration,
      rentalUnit: selectedRentalPeriod.unit,
      unitPrice: selectedRentalPeriod.price,
      selectedAttributes
    });
    
    alert(`${mockProduct.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header currentPage="products" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm bg-white px-4 py-3 rounded-lg shadow-sm">
            <li><Link href="/" className="hover:underline font-medium text-secondary-600">Home</Link></li>
            <li className="text-secondary-400">/</li>
            <li><Link href="/products" className="hover:underline font-medium text-secondary-600">Products</Link></li>
            <li className="text-secondary-400">/</li>
            <li className="font-semibold text-secondary-900">{mockProduct.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="mb-4">
              <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden shadow-md">
                <div className="w-full h-96 rounded-xl flex items-center justify-center text-white text-lg font-semibold bg-secondary-400">
                  {mockProduct.name} - Image {selectedImage + 1}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {mockProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden transition-all hover:shadow-md ${
                    selectedImage === index ? 'ring-4 ring-primary-500 ring-opacity-50' : 'ring-2 ring-transparent'
                  }`}
                  style={{ 
                    borderColor: selectedImage === index ? "var(--primary-500)" : "var(--secondary-200)",
                    borderWidth: "2px"
                  } as React.CSSProperties}
                >
                  <div className="w-full h-24 rounded-lg flex items-center justify-center text-white text-sm font-medium bg-secondary-400">
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-secondary-900">{mockProduct.name}</h1>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                {isWishlisted ? (
                  <HeartSolidIcon className="h-6 w-6 text-primary-600" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-secondary-600" />
                )}
              </button>
            </div>

            {/* Vendor Info */}
            <div className="flex items-center mb-6 p-4 rounded-xl bg-secondary-100">
              <div className="w-12 h-12 rounded-full mr-4 flex items-center justify-center text-white font-bold bg-secondary-600">
                {mockProduct.vendor.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-lg text-secondary-900">{mockProduct.vendor.name}</p>
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <StarSolidIcon key={i} className={`h-4 w-4 ${i < Math.floor(mockProduct.vendor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-secondary-600">
                    {mockProduct.vendor.rating} ({mockProduct.vendor.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-6">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <StarSolidIcon key={i} className={`h-5 w-5 ${i < Math.floor(mockProduct.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-secondary-600">
                {mockProduct.rating} ({mockProduct.reviews} reviews)
              </span>
            </div>

            {/* Description */}
            <p className="mb-6 text-secondary-700">{mockProduct.description}</p>

            {/* Rental Period Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-secondary-900">Rental Period</h3>
              <div className="grid grid-cols-3 gap-2">
                {mockProduct.rentalPeriods.map((period) => (
                  <button
                    key={period.unit}
                    onClick={() => setSelectedRentalPeriod(period)}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      selectedRentalPeriod.unit === period.unit
                        ? 'text-white bg-primary-600 border-primary-600'
                        : 'hover:opacity-80 border-secondary-300 text-secondary-900'
                    }`}
                  >
                    <div className="font-semibold">${period.price}</div>
                    <div className="text-sm">per {period.unit}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Attributes */}
            {mockProduct.attributes.map((attribute) => (
              <div key={attribute.id} className="mb-6">
                <h3 className="font-semibold mb-3 text-secondary-900">{attribute.name}</h3>
                {attribute.displayType === 'pills' && (
                  <div className="flex flex-wrap gap-2">
                    {attribute.values.map((value) => (
                      <button
                        key={value}
                        onClick={() => handleAttributeChange(attribute.id, value)}
                        className={`px-4 py-2 border-2 rounded-full transition-colors ${
                          selectedAttributes[attribute.id] === value
                            ? 'bg-secondary-600 border-secondary-600 text-white'
                            : 'border-secondary-300 text-secondary-900 hover:opacity-80'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                )}
                {attribute.displayType === 'radio' && (
                  <div className="space-y-2">
                    {attribute.values.map((value) => (
                      <label key={value} className="flex items-center">
                        <input
                          type="radio"
                          name={attribute.id}
                          value={value}
                          checked={selectedAttributes[attribute.id] === value}
                          onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
                          className="mr-2 accent-secondary-600"
                        />
                        <span className="text-secondary-900">{value}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Quantity and Duration */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900">Quantity</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white"
                >
                  {[...Array(mockProduct.quantityOnHand)].map((_, i) => (
                    <option key={i + 1} value={i + 1} className="text-secondary-900 bg-white">{i + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900">
                  Duration ({selectedRentalPeriod.unit}s)
                </label>
                <input
                  type="number"
                  min={selectedRentalPeriod.minDuration}
                  value={rentalDuration}
                  onChange={(e) => setRentalDuration(Number(e.target.value))}
                  className="w-full border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white"
                />
              </div>
            </div>

            {/* Price Summary */}
            <div className="p-4 rounded-lg mb-6 bg-white border-2 border-secondary-300">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-secondary-900">Total Price:</span>
                <span className="text-2xl font-bold text-primary-600">${totalPrice}</span>
              </div>
              <p className="text-sm mt-1 text-secondary-600">
                {quantity} × ${selectedRentalPeriod.price} × {rentalDuration} {selectedRentalPeriod.unit}(s)
              </p>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all hover:shadow-lg transform hover:scale-105 flex items-center justify-center space-x-3 bg-gradient-to-r from-primary-600 to-primary-700"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              <span>Add to Cart - ${totalPrice}</span>
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-8 flex items-center text-secondary-900">
              <StarSolidIcon className="h-8 w-8 text-yellow-400 mr-3" />
              Customer Reviews ({mockReviews.length})
            </h2>
            <div className="space-y-6">
              {mockReviews.map((review) => (
                <div key={review.id} className="p-6 rounded-xl border-2 border-secondary-200 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full mr-4 flex items-center justify-center text-white font-bold bg-secondary-600">
                        {review.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-lg text-secondary-900">{review.customerName}</p>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <StarSolidIcon key={i} className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium px-3 py-1 rounded-full text-secondary-600 bg-secondary-100">
                      {review.date}
                    </span>
                  </div>
                  <p className="text-lg leading-relaxed text-secondary-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
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