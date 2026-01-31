"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    CubeIcon,
    TagIcon,
    ClockIcon,
    CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import { productService } from "@/app/lib/services/products";
import type { Product } from "@/types/api";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await productService.getById(productId);
            if (response.success && response.product) {
                setProduct(response.product);
            } else {
                setError("Product not found");
            }
        } catch (err: any) {
            console.error("Failed to fetch product:", err);
            setError(err.message || "Failed to load product");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this product?")) {
            try {
                await productService.delete(productId);
                router.push("/vendor/products");
            } catch (err: any) {
                alert(err.message || "Failed to delete product");
            }
        }
    };

    const handleTogglePublish = async () => {
        if (!product) return;
        
        const newStatus = !product.published;
        const confirmMessage = newStatus
            ? "Publish this product? It will be visible to customers."
            : "Unpublish this product? It will be hidden from customers.";
        
        if (confirm(confirmMessage)) {
            try {
                setIsPublishing(true);
                const response = await productService.togglePublish(productId, newStatus);
                if (response.success && response.product) {
                    setProduct(response.product);
                    alert(response.message || `Product ${newStatus ? "published" : "unpublished"} successfully`);
                }
            } catch (err: any) {
                alert(err.message || "Failed to update product status");
            } finally {
                setIsPublishing(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/vendor/products"
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Back to Products
                    </Link>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
                        <h2 className="text-xl font-bold text-red-800">Product Not Found</h2>
                        <p className="text-red-600 mt-2">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Get pricing info
    const defaultPricing = product.pricing?.[0];
    const extraOptions = product.extraOptions ? JSON.parse(product.extraOptions as string) : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/vendor/products"
                        className="inline-flex items-center text-primary-600 hover:text-primary-700"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Back to Products
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleTogglePublish}
                            disabled={isPublishing}
                            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                                product.published
                                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isPublishing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {product.published ? "Unpublishing..." : "Publishing..."}
                                </>
                            ) : (
                                <>
                                    {product.published ? (
                                        <>
                                            <XCircleIcon className="h-4 w-4 mr-2" />
                                            Unpublish
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                                            Publish
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                        <Link
                            href={`/vendor/products/${productId}/edit`}
                            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Product Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                                <div className="flex items-center gap-4 text-white/80">
                                    <span className="flex items-center gap-1">
                                        <CubeIcon className="h-4 w-4" />
                                        {product.productType}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <TagIcon className="h-4 w-4" />
                                        {product.isRentable ? "Rentable" : "Not Rentable"}
                                    </span>
                                </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-sm font-medium ${product.published
                                ? "bg-green-500"
                                : "bg-amber-500"
                                }`}>
                                {product.published ? (
                                    <span className="flex items-center gap-1">
                                        <CheckCircleIcon className="h-4 w-4" />
                                        Published
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <XCircleIcon className="h-4 w-4" />
                                        Unpublished
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-6 space-y-6">
                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Description
                            </h3>
                            <p className="text-gray-700">
                                {product.description || "No description provided."}
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-primary-600">
                                    {product.inventory?.quantityOnHand || 0}
                                </div>
                                <div className="text-sm text-gray-500">In Stock</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-primary-600">
                                    {product.pricing?.length || 0}
                                </div>
                                <div className="text-sm text-gray-500">Pricing Tiers</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-primary-600">
                                    {product.variants?.length || 0}
                                </div>
                                <div className="text-sm text-gray-500">Variants</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-primary-600">
                                    {extraOptions.length}
                                </div>
                                <div className="text-sm text-gray-500">Extra Options</div>
                            </div>
                        </div>

                        {/* Pricing */}
                        {product.pricing && product.pricing.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                                    Pricing Tiers
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {product.pricing.map((tier: any, index: number) => (
                                        <div
                                            key={index}
                                            className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <ClockIcon className="h-5 w-5 text-gray-400" />
                                                <span className="font-medium text-gray-700">
                                                    {tier.rentalPeriod?.name || "Period"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-primary-600 font-bold">
                                                <CurrencyRupeeIcon className="h-4 w-4" />
                                                {tier.price.toLocaleString("en-IN")}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                                    Variants
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-600">SKU</th>
                                                <th className="px-4 py-2 text-right font-medium text-gray-600">Price Modifier</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {product.variants.map((variant: any, index: number) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3 text-gray-900">{variant.name}</td>
                                                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{variant.sku}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className={variant.priceModifier >= 0 ? "text-green-600" : "text-red-600"}>
                                                            {variant.priceModifier >= 0 ? "+" : ""}₹{variant.priceModifier}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Extra Options */}
                        {extraOptions.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                                    Extra Options
                                </h3>
                                <div className="space-y-3">
                                    {extraOptions.map((option: any, index: number) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-gray-900">{option.label}</span>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                    {option.inputType}
                                                </span>
                                            </div>
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

                        {/* Metadata */}
                        <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
                            <div className="flex justify-between">
                                <span>Created: {new Date(product.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}</span>
                                <span>Last Updated: {new Date(product.updatedAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
