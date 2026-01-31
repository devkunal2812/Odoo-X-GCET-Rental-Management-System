"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeftIcon,
    DocumentPlusIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { api } from "@/app/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    startDate: string;
    endDate: string;
    createdAt: string;
    customer: {
        user: {
            firstName: string;
            lastName: string;
            email: string;
        };
    };
    lines: {
        product: {
            name: string;
        };
        quantity: number;
        unitPrice: number;
    }[];
}

export default function NewInvoicePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch confirmed orders that can be invoiced
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await api.get<{ success: boolean; orders: Order[] }>('/orders', {
                    status: 'CONFIRMED'
                });

                if (response.success) {
                    setOrders(response.orders || []);
                }
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleCreateInvoice = async (orderId: string) => {
        setCreating(orderId);
        setError(null);
        setSuccess(null);

        try {
            const response = await api.post<{ success: boolean; invoice: any; error?: string }>(
                `/invoices/from-order/${orderId}`,
                {}
            );

            if (response.success) {
                setSuccess(`Invoice created successfully: ${response.invoice.invoiceNumber}`);
                // Remove the order from the list
                setOrders(prev => prev.filter(o => o.id !== orderId));

                // Redirect to invoices page after 2 seconds
                setTimeout(() => {
                    router.push('/vendor/invoices');
                }, 2000);
            } else {
                setError(response.error || 'Failed to create invoice');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create invoice');
        } finally {
            setCreating(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return '₹' + amount.toLocaleString('en-IN');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/vendor/invoices"
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
                        <p className="text-gray-600">Select a confirmed order to generate an invoice</p>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    <span className="text-red-700">{error}</span>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-green-700">{success}</span>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            ) : orders.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <DocumentPlusIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders to Invoice</h3>
                    <p className="text-gray-600 mb-6">
                        There are no confirmed orders available for invoicing. Orders must be in "Confirmed" status to create an invoice.
                    </p>
                    <Link
                        href="/vendor/orders"
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        View All Orders
                    </Link>
                </div>
            ) : (
                /* Orders List */
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Confirmed Orders ({orders.length})
                        </h2>
                        <p className="text-sm text-gray-600">
                            Click "Create Invoice" to generate an invoice for the order
                        </p>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {orders.map((order) => (
                            <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                Confirmed
                                            </span>
                                        </div>

                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>
                                                <span className="font-medium">Customer:</span>{' '}
                                                {order.customer?.user?.firstName} {order.customer?.user?.lastName}
                                            </p>
                                            <p>
                                                <span className="font-medium">Products:</span>{' '}
                                                {order.lines?.map(l => l.product?.name).join(', ') || 'N/A'}
                                            </p>
                                            <p>
                                                <span className="font-medium">Rental Period:</span>{' '}
                                                {order.startDate && order.endDate
                                                    ? `${formatDate(order.startDate)} - ${formatDate(order.endDate)}`
                                                    : 'Not specified'}
                                            </p>
                                            <p>
                                                <span className="font-medium">Order Date:</span>{' '}
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right ml-6">
                                        <p className="text-2xl font-bold text-gray-900 mb-3">
                                            {formatCurrency(order.totalAmount)}
                                        </p>
                                        <button
                                            onClick={() => handleCreateInvoice(order.id)}
                                            disabled={creating === order.id}
                                            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {creating === order.id ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <DocumentPlusIcon className="h-4 w-4 mr-2" />
                                                    Create Invoice
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">How invoicing works:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Only confirmed orders can be invoiced</li>
                    <li>Creating an invoice calculates GST (18%) and updates order status to "Invoiced"</li>
                    <li>Invoices can be downloaded as PDF from the Invoices page</li>
                    <li>Customers will receive email notification of the invoice</li>
                </ul>
            </div>
        </div>
    );
}
