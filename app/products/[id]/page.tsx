"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "../../../components/Header";
import { ShoppingCartIcon, HeartIcon, CheckIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { addToCart, isProductInCart } from "../../../lib/cart";
import { productService } from "@/app/lib/services/products";
import type { Product } from "@/types/api";
import RentalDurationModal from "../../../components/RentalDurationModal";

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRentalPeriodIndex, setSelectedRentalPeriodIndex] = useState(0);
  const [rentalDuration, setRentalDuration] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  
  // Rental Duration Modal state
  const [showRentalModal, setShowRentalModal] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getById(params.id as string);
        if (response.success && response.product) {
          // Check if product is published
          if (!response.product.published) {
            setError("This product is not available");
            return;
          }
          setProduct(response.product);
        } else {
          setError("Product not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  // Check if product is in cart
  useEffect(() => {
    const checkCartStatus = () => {
      const inCart = isProductInCart(params.id as string);
      setIsInCart(inCart);
    };

    checkCartStatus();
    
    const handleCartUpdate = () => checkCartStatus();
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 mt-10">
        <Header currentPage="products" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-secondary-50 mt-10">
        <Header currentPage="products" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Product Not Found</h2>
            <p className="text-red-600 mb-6">{error || "The product you're looking for doesn't exist."}</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extract product data
  const selectedRentalPeriod = product.pricing?.[selectedRentalPeriodIndex];
  const totalPrice = selectedRentalPeriod ? selectedRentalPeriod.price * rentalDuration * quantity : 0;
  const vendorName = product.vendor?.companyName || 'Unknown Vendor';
  const quantityOnHand = product.inventory?.quantityOnHand || 0;
  const extraOptions = product.extraOptions ? JSON.parse(product.extraOptions as string) : [];

  const handleAddToCart = () => {
    if (isInCart || !selectedRentalPeriod || quantityOnHand === 0) return;
    
    // Open rental duration modal instead of directly adding to cart
    setShowRentalModal(true);
  };

  const handleRentalConfirm = (rentalData: {
    startDate: string;
    endDate: string;
    quantity: number;
  }) => {
    if (!selectedRentalPeriod) return;

    // Calculate rental duration in days
    const start = new Date(rentalData.startDate);
    const end = new Date(rentalData.endDate);
    const durationInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    addToCart({
      productId: params.id as string,
      product: {
        id: product.id,
        name: product.name,
        image: '/api/placeholder/400/300',
        vendor: vendorName,
        vendorId: product.vendorId
      },
      quantity: rentalData.quantity,
      rentalDuration: durationInDays,
      rentalUnit: 'day' as const,
      unitPrice: selectedRentalPeriod.price,
      selectedAttributes: {},
      // Add rental dates
      rentalStartDate: rentalData.startDate,
      rentalEndDate: rentalData.endDate
    });
    
    setJustAdded(true);
    setShowRentalModal(false);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-secondary-50 mt-10">
      <Header currentPage="products" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm bg-white px-4 py-3 rounded-lg shadow-sm">
            <li><Link href="/" className="hover:underline font-medium text-secondary-600">Home</Link></li>
            <li className="text-secondary-400">/</li>
            <li><Link href="/products" className="hover:underline font-medium text-secondary-600">Products</Link></li>
            <li className="text-secondary-400">/</li>
            <li className="font-semibold text-secondary-900">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="mb-4">
              <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden shadow-md">
                <div className="w-full h-96 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
                  <span className="text-6xl">📦</span>
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-secondary-600 mt-4">
              {product.name}
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-secondary-900">{product.name}</h1>
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
                {vendorName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-lg text-secondary-900">{vendorName}</p>
                <p className="text-sm text-secondary-600">{product.productType}</p>
              </div>
            </div>

            {/* Description */}
            <p className="mb-6 text-secondary-700">{product.description || 'No description available'}</p>

            {/* Stock Status */}
            <div className="mb-6 p-4 rounded-lg bg-secondary-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-700">Availability:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  quantityOnHand > 0 ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'
                }`}>
                  {quantityOnHand > 0 ? `${quantityOnHand} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Rental Period Selection */}
            {product.pricing && product.pricing.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-secondary-900">Rental Period</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {product.pricing.map((pricing: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedRentalPeriodIndex(index)}
                      className={`p-3 border-2 rounded-lg text-center transition-colors ${
                        selectedRentalPeriodIndex === index
                          ? 'text-white bg-primary-600 border-primary-600'
                          : 'hover:opacity-80 border-secondary-300 text-secondary-900'
                      }`}
                    >
                      <div className="font-semibold">₹{pricing.price}</div>
                      <div className="text-sm">per {pricing.rentalPeriod?.name || 'period'}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Duration */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900">Quantity</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={quantityOnHand === 0}
                  className="w-full border-2 border-secondary-300 rounded-lg px-3 py-2 text-secondary-900 bg-white disabled:opacity-50"
                >
                  {[...Array(Math.min(quantityOnHand, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900">
                  Duration ({selectedRentalPeriod?.rentalPeriod?.name || 'period'}s)
                </label>
                <input
                  type="number"
                  min={1}
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
                <span className="text-2xl font-bold text-primary-600">₹{totalPrice.toFixed(2)}</span>
              </div>
              {selectedRentalPeriod && (
                <p className="text-sm mt-1 text-secondary-600">
                  {quantity} × ₹{selectedRentalPeriod.price} × {rentalDuration} {selectedRentalPeriod.rentalPeriod?.name || 'period'}(s)
                </p>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isInCart || quantityOnHand === 0}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all hover:shadow-lg transform hover:scale-105 flex items-center justify-center space-x-3 ${
                quantityOnHand === 0
                  ? 'bg-secondary-300 text-secondary-500 cursor-not-allowed'
                  : isInCart 
                    ? 'bg-success-600 text-white cursor-default'
                    : justAdded
                      ? 'bg-success-600 text-white'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
              }`}
              style={isInCart || justAdded || quantityOnHand === 0 ? { transform: 'none' } : {}}
            >
              {quantityOnHand === 0 ? (
                <>
                  <ShoppingCartIcon className="h-6 w-6" />
                  <span>Out of Stock</span>
                </>
              ) : isInCart ? (
                <>
                  <CheckIcon className="h-6 w-6" />
                  <span>Already in Cart</span>
                </>
              ) : justAdded ? (
                <>
                  <CheckIcon className="h-6 w-6" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="h-6 w-6" />
                  <span>Add to Cart - ₹{totalPrice.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6 text-secondary-900">Product Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-secondary-900">Product Type</h3>
                <p className="text-secondary-700">{product.productType}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2 text-secondary-900">Rentable</h3>
                <p className="text-secondary-700">{product.isRentable ? 'Yes' : 'No'}</p>
              </div>
              
              {product.variants && product.variants.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-lg mb-3 text-secondary-900">Available Variants</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.variants.map((variant: any) => (
                      <div key={variant.id} className="p-3 border border-secondary-200 rounded-lg">
                        <div className="font-medium text-secondary-900">{variant.name}</div>
                        <div className="text-sm text-secondary-600">SKU: {variant.sku}</div>
                        {variant.priceModifier !== 0 && (
                          <div className="text-sm text-primary-600">
                            {variant.priceModifier > 0 ? '+' : ''}₹{variant.priceModifier}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {extraOptions.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-lg mb-3 text-secondary-900">Extra Options</h3>
                  <div className="space-y-3">
                    {extraOptions.map((option: any, index: number) => (
                      <div key={index} className="p-3 border border-secondary-200 rounded-lg">
                        <div className="font-medium text-secondary-900 mb-2">{option.label}</div>
                        <div className="flex flex-wrap gap-2">
                          {option.options?.map((opt: any, optIndex: number) => (
                            <span
                              key={optIndex}
                              className="inline-flex items-center gap-1 text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded-full"
                            >
                              {opt.value}
                              {opt.priceImpact ? (
                                <span className="text-xs text-primary-500">
                                  (+₹{opt.priceImpact})
                                </span>
                              ) : null}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rental Duration Modal */}
      {product && (
        <RentalDurationModal
          isOpen={showRentalModal}
          onClose={() => setShowRentalModal(false)}
          onConfirm={handleRentalConfirm}
          product={{
            id: product.id,
            name: product.name,
            maxQuantity: quantityOnHand
          }}
          initialQuantity={quantity}
        />
      )}

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
