"use client";

import React, { useState, useEffect } from "react";
import {
    XMarkIcon,
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from "@heroicons/react/24/outline";
import { productService } from "@/app/lib/services/products";
import { api } from "@/app/lib/api-client";

interface RentalPeriod {
    id: string;
    name: string;
    unit: string;
    duration: number;
}

interface PricingTier {
    rentalPeriodId: string;
    price: number;
}

interface Variant {
    name: string;
    sku: string;
    priceModifier: number;
}

interface ExtraOption {
    label: string;
    inputType: 'radio' | 'checkbox' | 'dropdown';
    options: Array<{ value: string; priceImpact?: number }>;
}

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [productType, setProductType] = useState<"GOODS" | "SERVICE">("GOODS");
    const [category, setCategory] = useState<string>(""); // Add category state
    const [isRentable, setIsRentable] = useState(true);
    const [quantityOnHand, setQuantityOnHand] = useState(0);
    const [pricing, setPricing] = useState<PricingTier[]>([{ rentalPeriodId: "", price: 0 }]);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [extraOptions, setExtraOptions] = useState<ExtraOption[]>([]);

    // UI state for collapsible sections
    const [showVariants, setShowVariants] = useState(false);
    const [showExtraOptions, setShowExtraOptions] = useState(false);

    // Data & UI state
    const [rentalPeriods, setRentalPeriods] = useState<RentalPeriod[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPeriods, setLoadingPeriods] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Fetch rental periods on mount
    useEffect(() => {
        if (isOpen) {
            fetchRentalPeriods();
        }
    }, [isOpen]);

    const fetchRentalPeriods = async () => {
        try {
            setLoadingPeriods(true);
            // Use vendor-accessible endpoint instead of admin settings
            const response = await api.get<{
                success: boolean;
                rentalPeriods: RentalPeriod[];
            }>('/vendor/rental-periods');
            if (response.success && response.rentalPeriods) {
                setRentalPeriods(response.rentalPeriods);
                if (response.rentalPeriods.length > 0 && pricing[0].rentalPeriodId === "") {
                    setPricing([{ rentalPeriodId: response.rentalPeriods[0].id, price: 0 }]);
                }
            }
        } catch (err) {
            console.error("Failed to fetch rental periods:", err);
        } finally {
            setLoadingPeriods(false);
        }
    };

    // Pricing handlers
    const addPricingTier = () => {
        if (rentalPeriods.length > 0) {
            setPricing([...pricing, { rentalPeriodId: rentalPeriods[0].id, price: 0 }]);
        }
    };

    const removePricingTier = (index: number) => {
        if (pricing.length > 1) {
            setPricing(pricing.filter((_, i) => i !== index));
        }
    };

    const updatePricingTier = (index: number, field: keyof PricingTier, value: string | number) => {
        const updated = [...pricing];
        updated[index] = { ...updated[index], [field]: value };
        setPricing(updated);
    };

    // Variant handlers
    const addVariant = () => {
        setVariants([...variants, { name: "", sku: "", priceModifier: 0 }]);
        setShowVariants(true);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
    };

    // Extra Options handlers
    const addExtraOption = () => {
        setExtraOptions([...extraOptions, { label: "", inputType: "radio", options: [{ value: "", priceImpact: 0 }] }]);
        setShowExtraOptions(true);
    };

    const removeExtraOption = (index: number) => {
        setExtraOptions(extraOptions.filter((_, i) => i !== index));
    };

    const updateExtraOption = (index: number, field: keyof ExtraOption, value: any) => {
        const updated = [...extraOptions];
        updated[index] = { ...updated[index], [field]: value };
        setExtraOptions(updated);
    };

    const addOptionValue = (optionIndex: number) => {
        const updated = [...extraOptions];
        updated[optionIndex].options.push({ value: "", priceImpact: 0 });
        setExtraOptions(updated);
    };

    const removeOptionValue = (optionIndex: number, valueIndex: number) => {
        const updated = [...extraOptions];
        if (updated[optionIndex].options.length > 1) {
            updated[optionIndex].options = updated[optionIndex].options.filter((_, i) => i !== valueIndex);
            setExtraOptions(updated);
        }
    };

    const updateOptionValue = (optionIndex: number, valueIndex: number, field: string, value: string | number) => {
        const updated = [...extraOptions];
        updated[optionIndex].options[valueIndex] = { ...updated[optionIndex].options[valueIndex], [field]: value };
        setExtraOptions(updated);
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setProductType("GOODS");
        setCategory(""); // Reset category
        setIsRentable(true);
        setQuantityOnHand(0);
        setPricing([{ rentalPeriodId: rentalPeriods[0]?.id || "", price: 0 }]);
        setVariants([]);
        setExtraOptions([]);
        setShowVariants(false);
        setShowExtraOptions(false);
        setError(null);
        setSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validation
        if (!name.trim()) {
            setError("Product name is required");
            setLoading(false);
            return;
        }

        const validPricing = pricing.filter(p => p.rentalPeriodId && p.price > 0);
        if (validPricing.length === 0) {
            setError("At least one pricing tier with valid price is required");
            setLoading(false);
            return;
        }

        // Filter valid variants (those with name and sku)
        const validVariants = variants.filter(v => v.name.trim() && v.sku.trim());

        // Filter valid extra options (those with label and at least one option value)
        const validExtraOptions = extraOptions.filter(e =>
            e.label.trim() && e.options.some(o => o.value.trim())
        ).map(e => ({
            ...e,
            options: e.options.filter(o => o.value.trim())
        }));

        try {
            await productService.create({
                name: name.trim(),
                description: description.trim() || undefined,
                productType,
                category: category || undefined, // Add category to API call
                isRentable,
                quantityOnHand,
                pricing: validPricing,
                variants: validVariants.length > 0 ? validVariants : undefined,
                extraOptions: validExtraOptions.length > 0 ? validExtraOptions : undefined,
            });

            setSuccess(true);
            setTimeout(() => {
                resetForm();
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Failed to create product");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700">
                        <h2 className="text-xl font-bold text-white">Add New Product</h2>
                        <button
                            onClick={handleClose}
                            className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                            disabled={loading}
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content - Form wraps both scrollable area and footer */}
                    <form onSubmit={handleSubmit} id="add-product-form">
                        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                            {/* Success message */}
                            {success && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">
                                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                    <span>Product created successfully!</span>
                                </div>
                            )}

                            {/* Error message */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-800 rounded-lg border border-red-200">
                                    <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                                    placeholder="Enter product name"
                                    disabled={loading}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                                    placeholder="Describe your product (optional)"
                                    disabled={loading}
                                />
                            </div>

                            {/* Product Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                                    disabled={loading}
                                >
                                    <option value="">Select a category (optional)</option>
                                    <option value="ELECTRONICS">Electronics</option>
                                    <option value="FURNITURE">Furniture</option>
                                    <option value="VEHICLES">Vehicles</option>
                                    <option value="GYM_AND_SPORTS_EQUIPMENTS">Gym & Sports Equipments</option>
                                    <option value="CONSTRUCTION_TOOLS">Construction Tools</option>
                                </select>
                            </div>

                            {/* Type and Quantity Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Type
                                    </label>
                                    <select
                                        value={productType}
                                        onChange={(e) => setProductType(e.target.value as "GOODS" | "SERVICE")}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                                        disabled={loading}
                                    >
                                        <option value="GOODS">Goods</option>
                                        <option value="SERVICE">Service</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity on Hand
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={quantityOnHand}
                                        onChange={(e) => setQuantityOnHand(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Is Rentable Toggle */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsRentable(!isRentable)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isRentable ? 'bg-primary-600' : 'bg-gray-300'
                                        }`}
                                    disabled={loading}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isRentable ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                                <span className="text-sm font-medium text-gray-700">Available for Rental</span>
                            </div>

                            {/* Pricing Section */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Pricing <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addPricingTier}
                                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                        disabled={loading || loadingPeriods}
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Add Tier
                                    </button>
                                </div>

                                {loadingPeriods ? (
                                    <div className="text-center py-4 text-gray-500">Loading rental periods...</div>
                                ) : rentalPeriods.length === 0 ? (
                                    <div className="text-center py-4 text-amber-600 bg-amber-50 rounded-lg p-3">
                                        <p className="font-medium">No rental periods available</p>
                                        <p className="text-sm mt-1">Rental periods (e.g., Daily, Weekly, Monthly) need to be configured by the system administrator first.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {pricing.map((tier, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <select
                                                    value={tier.rentalPeriodId}
                                                    onChange={(e) => updatePricingTier(index, 'rentalPeriodId', e.target.value)}
                                                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-900 bg-white"
                                                    disabled={loading}
                                                >
                                                    {rentalPeriods.map((period) => (
                                                        <option key={period.id} value={period.id}>
                                                            {period.name} ({period.duration} {period.unit})
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={tier.price || ""}
                                                        onChange={(e) => updatePricingTier(index, 'price', parseFloat(e.target.value) || 0)}
                                                        className="w-full pl-8 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-900"
                                                        placeholder="Price"
                                                        disabled={loading}
                                                    />
                                                </div>
                                                {pricing.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removePricingTier(index)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                        disabled={loading}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Variants Section (Collapsible) */}
                            <div className="border-t border-gray-200 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowVariants(!showVariants)}
                                    className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
                                >
                                    <span className="flex items-center gap-2">
                                        Product Variants
                                        <span className="text-xs text-gray-400 font-normal">(Optional - e.g., Size, Color)</span>
                                    </span>
                                    {showVariants ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                                </button>

                                {showVariants && (
                                    <div className="mt-3 space-y-3">
                                        {variants.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">No variants added yet.</p>
                                        ) : (
                                            variants.map((variant, index) => (
                                                <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-medium text-gray-500">Variant #{index + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVariant(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                            disabled={loading}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <input
                                                            type="text"
                                                            value={variant.name}
                                                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400"
                                                            placeholder="Name (e.g., Large)"
                                                            disabled={loading}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={variant.sku}
                                                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400"
                                                            placeholder="SKU"
                                                            disabled={loading}
                                                        />
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹±</span>
                                                            <input
                                                                type="number"
                                                                value={variant.priceModifier || ""}
                                                                onChange={(e) => updateVariant(index, 'priceModifier', parseFloat(e.target.value) || 0)}
                                                                className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
                                                                placeholder="0"
                                                                disabled={loading}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <button
                                            type="button"
                                            onClick={addVariant}
                                            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                            disabled={loading}
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                            Add Variant
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Extra Options Section (Collapsible) */}
                            <div className="border-t border-gray-200 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowExtraOptions(!showExtraOptions)}
                                    className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
                                >
                                    <span className="flex items-center gap-2">
                                        Extra Options
                                        <span className="text-xs text-gray-400 font-normal">(Optional - e.g., Insurance, Addons)</span>
                                    </span>
                                    {showExtraOptions ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                                </button>

                                {showExtraOptions && (
                                    <div className="mt-3 space-y-4">
                                        {extraOptions.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">No extra options added yet.</p>
                                        ) : (
                                            extraOptions.map((option, optIndex) => (
                                                <div key={optIndex} className="p-3 bg-gray-50 rounded-lg space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-medium text-gray-500">Option #{optIndex + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExtraOption(optIndex)}
                                                            className="text-red-500 hover:text-red-700"
                                                            disabled={loading}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="text"
                                                            value={option.label}
                                                            onChange={(e) => updateExtraOption(optIndex, 'label', e.target.value)}
                                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400"
                                                            placeholder="Label (e.g., Insurance)"
                                                            disabled={loading}
                                                        />
                                                        <select
                                                            value={option.inputType}
                                                            onChange={(e) => updateExtraOption(optIndex, 'inputType', e.target.value)}
                                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white"
                                                            disabled={loading}
                                                        >
                                                            <option value="radio">Radio (Single select)</option>
                                                            <option value="checkbox">Checkbox (Multi select)</option>
                                                            <option value="dropdown">Dropdown</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <span className="text-xs text-gray-500">Option Values:</span>
                                                        {option.options.map((optValue, valIndex) => (
                                                            <div key={valIndex} className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={optValue.value}
                                                                    onChange={(e) => updateOptionValue(optIndex, valIndex, 'value', e.target.value)}
                                                                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-900 placeholder-gray-400"
                                                                    placeholder="Value"
                                                                    disabled={loading}
                                                                />
                                                                <div className="w-24 relative">
                                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
                                                                    <input
                                                                        type="number"
                                                                        value={optValue.priceImpact || ""}
                                                                        onChange={(e) => updateOptionValue(optIndex, valIndex, 'priceImpact', parseFloat(e.target.value) || 0)}
                                                                        className="w-full pl-6 pr-2 py-1.5 border border-gray-200 rounded text-sm text-gray-900"
                                                                        placeholder="0"
                                                                        disabled={loading}
                                                                    />
                                                                </div>
                                                                {option.options.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeOptionValue(optIndex, valIndex)}
                                                                        className="text-red-500 hover:text-red-700 p-1"
                                                                        disabled={loading}
                                                                    >
                                                                        <TrashIcon className="h-3 w-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => addOptionValue(optIndex)}
                                                            className="text-xs text-primary-600 hover:text-primary-700"
                                                            disabled={loading}
                                                        >
                                                            + Add Value
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <button
                                            type="button"
                                            onClick={addExtraOption}
                                            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                            disabled={loading}
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                            Add Extra Option
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer - Inside form for proper submission */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-5 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || success}
                                className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="h-4 w-4" />
                                        Create Product
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
