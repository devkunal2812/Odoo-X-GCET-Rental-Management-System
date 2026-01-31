"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { productService } from "@/app/lib/services/products";
import { api } from "@/app/lib/api-client";
import type { Product } from "@/types/api";

interface RentalPeriod {
  id: string;
  name: string;
  unit: string;
  duration: number;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rentalPeriods, setRentalPeriods] = useState<RentalPeriod[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productType: "GOODS" as "GOODS" | "SERVICE",
    isRentable: true,
    quantityOnHand: 0,
  });

  const [pricing, setPricing] = useState<Array<{ rentalPeriodId: string; price: number }>>([]);
  const [variants, setVariants] = useState<Array<{ name: string; sku: string; priceModifier: number }>>([]);

  useEffect(() => {
    fetchRentalPeriods();
    if (productId) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [productId]);

  const fetchRentalPeriods = async () => {
    try {
      const response = await api.get<{ success: boolean; periods: RentalPeriod[] }>('/rental-periods');
      if (response.success && response.periods) {
        setRentalPeriods(response.periods);
      }
    } catch (err) {
      console.error('Failed to fetch rental periods:', err);
      // Fallback to empty array - user will need to contact admin
      setRentalPeriods([]);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getById(productId);
      if (response.success && response.product) {
        const product = response.product;
        setFormData({
          name: product.name,
          description: product.description || "",
          productType: product.productType,
          isRentable: product.isRentable,
          quantityOnHand: product.inventory?.quantityOnHand || 0,
        });
        setPricing(
          product.pricing?.map((p: any) => ({
            rentalPeriodId: p.rentalPeriodId,
            price: p.price,
          })) || []
        );
        setVariants(
          product.variants?.map((v: any) => ({
            name: v.name,
            sku: v.sku,
            priceModifier: v.priceModifier,
          })) || []
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pricing.length === 0) {
      alert("Please add at least one pricing tier");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const data = {
        ...formData,
        pricing,
        variants: variants.length > 0 ? variants : undefined,
        extraOptions: [], // Can be extended later
      };

      const response = await productService.update(productId, data);
      
      if (response.success) {
        alert("Product updated successfully!");
        router.push(`/vendor/products/${productId}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update product");
      alert(err.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const addPricing = () => {
    setPricing([...pricing, { rentalPeriodId: "", price: 0 }]);
  };

  const removePricing = (index: number) => {
    setPricing(pricing.filter((_, i) => i !== index));
  };

  const updatePricing = (index: number, field: string, value: any) => {
    const updated = [...pricing];
    updated[index] = { ...updated[index], [field]: value };
    setPricing(updated);
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", sku: "", priceModifier: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/vendor/products/${productId}`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-2"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Product
          </Link>
          <h1 className="text-3xl font-bold text-secondary-900">Edit Product</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-secondary-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter product name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Describe your product..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Product Type *
              </label>
              <select
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value as "GOODS" | "SERVICE" })}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="GOODS">Goods</option>
                <option value="SERVICE">Service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Quantity on Hand *
              </label>
              <input
                type="number"
                value={formData.quantityOnHand}
                onChange={(e) => setFormData({ ...formData, quantityOnHand: parseInt(e.target.value) || 0 })}
                min="0"
                required
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isRentable}
                  onChange={(e) => setFormData({ ...formData, isRentable: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">This product is rentable</span>
              </label>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-secondary-900">Pricing Tiers</h2>
            <button
              type="button"
              onClick={addPricing}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Pricing
            </button>
          </div>

          {pricing.length === 0 && (
            <p className="text-secondary-600 text-center py-4">No pricing tiers added yet</p>
          )}

          <div className="space-y-3">
            {pricing.map((tier, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-secondary-200 rounded-lg">
                <select
                  value={tier.rentalPeriodId}
                  onChange={(e) => updatePricing(index, "rentalPeriodId", e.target.value)}
                  required
                  className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select period</option>
                  {rentalPeriods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={tier.price}
                  onChange={(e) => updatePricing(index, "price", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  required
                  placeholder="Price"
                  className="w-32 px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => removePricing(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Variants (Optional) */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-secondary-900">Variants (Optional)</h2>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Variant
            </button>
          </div>

          {variants.length === 0 && (
            <p className="text-secondary-600 text-center py-4">No variants added</p>
          )}

          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-secondary-200 rounded-lg">
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => updateVariant(index, "name", e.target.value)}
                  placeholder="Variant name"
                  required
                  className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={variant.sku}
                  onChange={(e) => updateVariant(index, "sku", e.target.value)}
                  placeholder="SKU"
                  required
                  className="w-32 px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="number"
                  value={variant.priceModifier}
                  onChange={(e) => updateVariant(index, "priceModifier", parseFloat(e.target.value) || 0)}
                  placeholder="Price modifier"
                  step="0.01"
                  className="w-32 px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/vendor/products/${productId}`}
            className="px-6 py-3 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="h-5 w-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
