"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShoppingCartIcon, HeartIcon, UserIcon, StarIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

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
    // Add to cart logic here
    console.log("Adding to cart:", {
      productId: params.id,
      quantity,
      rentalDuration,
      rentalUnit: selectedRentalPeriod.unit,
      selectedAttributes,
      totalPrice
    });
    alert("Added to cart!");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--white-smoke)" }}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold" style={{ color: "var(--night-bordeaux)" }}>
                RentMarket
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/products" className="hover:opacity-80 transition-opacity" style={{ color: "var(--stone-brown)" }}>
                Products
              </Link>
              <Link href="/about" className="hover:opacity-80 transition-opacity" style={{ color: "var(--stone-brown)" }}>
                About Us
              </Link>
              <Link href="/contact" className="hover:opacity-80 transition-opacity" style={{ color: "var(--stone-brown)" }}>
                Contact Us
              </Link>
              <Link href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: "var(--stone-brown)" }}>
                Terms & Conditions
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/wishlist" className="hover:opacity-80 transition-opacity" style={{ color: "var(--stone-brown)" }}>
                <HeartIcon className="h-6 w-6" />
              </Link>
              <Link href="/cart" className="hover:opacity-80 transition-opacity relative" style={{ color: "var(--stone-brown)" }}>
                <ShoppingCartIcon className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      style={{ backgroundColor: "var(--night-bordeaux)" }}>
                  0
                </span>
              </Link>
              <Link href="/login" className="hover:opacity-80 transition-opacity" style={{ color: "var(--stone-brown)" }}>
                <UserIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="hover:underline" style={{ color: "var(--night-bordeaux)" }}>Home</Link></li>
            <li style={{ color: "var(--stone-brown)" }}>/</li>
            <li><Link href="/products" className="hover:underline" style={{ color: "var(--night-bordeaux)" }}>Products</Link></li>
            <li style={{ color: "var(--stone-brown)" }}>/</li>
            <li style={{ color: "var(--black)" }}>{mockProduct.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="mb-4">
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                <div className="w-full h-96 rounded-lg" style={{ backgroundColor: "var(--dusty-taupe)" }}></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {mockProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2' : ''
                  }`}
                  style={{ ringColor: selectedImage === index ? "var(--night-bordeaux)" : "transparent" }}
                >
                  <div className="w-full h-24 rounded-lg" style={{ backgroundColor: "var(--dusty-taupe)" }}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold" style={{ color: "var(--black)" }}>{mockProduct.name}</h1>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                {isWishlisted ? (
                  <HeartSolidIcon className="h-6 w-6" style={{ color: "var(--night-bordeaux)" }} />
                ) : (
                  <HeartIcon className="h-6 w-6" style={{ color: "var(--stone-brown)" }} />
                )}
              </button>
            </div>

            {/* Vendor Info */}
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full mr-3" style={{ backgroundColor: "var(--dusty-taupe)" }}></div>
              <div>
                <p className="font-medium" style={{ color: "var(--black)" }}>{mockProduct.vendor.name}</p>
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <StarSolidIcon key={i} className={`h-4 w-4 ${i < Math.floor(mockProduct.vendor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm" style={{ color: "var(--stone-brown)" }}>
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
              <span style={{ color: "var(--stone-brown)" }}>
                {mockProduct.rating} ({mockProduct.reviews} reviews)
              </span>
            </div>

            {/* Description */}
            <p className="mb-6" style={{ color: "var(--stone-brown)" }}>{mockProduct.description}</p>

            {/* Rental Period Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3" style={{ color: "var(--black)" }}>Rental Period</h3>
              <div className="grid grid-cols-3 gap-2">
                {mockProduct.rentalPeriods.map((period) => (
                  <button
                    key={period.unit}
                    onClick={() => setSelectedRentalPeriod(period)}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      selectedRentalPeriod.unit === period.unit
                        ? 'text-white'
                        : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: selectedRentalPeriod.unit === period.unit ? "var(--night-bordeaux)" : "transparent",
                      borderColor: selectedRentalPeriod.unit === period.unit ? "var(--night-bordeaux)" : "var(--dusty-taupe)",
                      color: selectedRentalPeriod.unit === period.unit ? "var(--white-smoke)" : "var(--black)"
                    }}
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
                <h3 className="font-semibold mb-3" style={{ color: "var(--black)" }}>{attribute.name}</h3>
                {attribute.displayType === 'pills' && (
                  <div className="flex flex-wrap gap-2">
                    {attribute.values.map((value) => (
                      <button
                        key={value}
                        onClick={() => handleAttributeChange(attribute.id, value)}
                        className={`px-4 py-2 border-2 rounded-full transition-colors ${
                          selectedAttributes[attribute.id] === value
                            ? 'text-white'
                            : 'hover:opacity-80'
                        }`}
                        style={{
                          backgroundColor: selectedAttributes[attribute.id] === value ? "var(--night-bordeaux)" : "transparent",
                          borderColor: selectedAttributes[attribute.id] === value ? "var(--night-bordeaux)" : "var(--dusty-taupe)",
                          color: selectedAttributes[attribute.id] === value ? "var(--white-smoke)" : "var(--black)"
                        }}
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
                          className="mr-2"
                          style={{ accentColor: "var(--night-bordeaux)" }}
                        />
                        <span style={{ color: "var(--black)" }}>{value}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Quantity and Duration */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--black)" }}>Quantity</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border-2 rounded-lg px-3 py-2"
                  style={{ 
                    borderColor: "var(--dusty-taupe)",
                    color: "var(--black)",
                    backgroundColor: "var(--white-smoke)"
                  }}
                >
                  {[...Array(mockProduct.quantityOnHand)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--black)" }}>
                  Duration ({selectedRentalPeriod.unit}s)
                </label>
                <input
                  type="number"
                  min={selectedRentalPeriod.minDuration}
                  value={rentalDuration}
                  onChange={(e) => setRentalDuration(Number(e.target.value))}
                  className="w-full border-2 rounded-lg px-3 py-2"
                  style={{ 
                    borderColor: "var(--dusty-taupe)",
                    color: "var(--black)",
                    backgroundColor: "var(--white-smoke)"
                  }}
                />
              </div>
            </div>

            {/* Price Summary */}
            <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: "var(--dusty-taupe)" }}>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold" style={{ color: "var(--white-smoke)" }}>Total Price:</span>
                <span className="text-2xl font-bold" style={{ color: "var(--night-bordeaux)" }}>${totalPrice}</span>
              </div>
              <p className="text-sm mt-1" style={{ color: "var(--stone-brown)" }}>
                {quantity} × ${selectedRentalPeriod.price} × {rentalDuration} {selectedRentalPeriod.unit}(s)
              </p>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--night-bordeaux)" }}
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8" style={{ color: "var(--black)" }}>Customer Reviews</h2>
          <div className="space-y-6">
            {mockReviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full mr-3" style={{ backgroundColor: "var(--dusty-taupe)" }}></div>
                    <div>
                      <p className="font-medium" style={{ color: "var(--black)" }}>{review.customerName}</p>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <StarSolidIcon key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm" style={{ color: "var(--stone-brown)" }}>{review.date}</span>
                </div>
                <p style={{ color: "var(--stone-brown)" }}>{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-12 mt-16" style={{ backgroundColor: "var(--black)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ color: "var(--white-smoke)" }}>RentMarket</h3>
              <p style={{ color: "var(--dusty-taupe)" }}>
                Your trusted marketplace for renting everything you need.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--white-smoke)" }}>Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-taupe)" }}>Products</Link></li>
                <li><Link href="/about" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-taupe)" }}>About Us</Link></li>
                <li><Link href="/contact" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-taupe)" }}>Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--white-smoke)" }}>Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-taupe)" }}>Help Center</Link></li>
                <li><Link href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-taupe)" }}>Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-taupe)" }}>Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--white-smoke)" }}>Contact Info</h4>
              <div className="space-y-2" style={{ color: "var(--dusty-taupe)" }}>
                <p>Email: support@rentmarket.com</p>
                <p>Phone: (555) 123-4567</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center" style={{ borderColor: "var(--stone-brown)", color: "var(--dusty-taupe)" }}>
            <p>&copy; 2024 RentMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}