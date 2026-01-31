"use client";

import { useState, useEffect } from "react";

interface Vendor {
  id: string;
  companyName: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  value: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  maxUses?: number;
  usedCount: number;
  createdAt: string;
  vendor: Vendor;
  _count: {
    orders: number;
  };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/admin/coupons");
      const data = await response.json();

      if (data.success) {
        setCoupons(data.coupons);
      } else {
        setError(data.error || "Failed to fetch coupons");
      }
    } catch (err) {
      setError("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, ordersCount: number) => {
    if (ordersCount > 0) {
      alert(`Cannot delete this coupon. It is being used in ${ordersCount} order(s).`);
      return;
    }

    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Coupon deleted successfully!");
        fetchCoupons();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to delete coupon");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      setError("Failed to delete coupon");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Coupons</h1>
            <p className="text-gray-600 mt-2">
              View and manage all vendor coupons across the platform
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valid Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No coupons found in the system.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-blue-600">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {coupon.vendor.companyName}
                          </div>
                          <div className="text-gray-500">
                            {coupon.vendor.user.firstName} {coupon.vendor.user.lastName}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {coupon.vendor.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium">
                          {coupon.discountType === "PERCENTAGE"
                            ? `${coupon.value}%`
                            : `₹${coupon.value}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{new Date(coupon.validFrom).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">to</div>
                        <div>{new Date(coupon.validTo).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="font-medium">{coupon.usedCount}</span>
                          <span className="mx-1">/</span>
                          <span>{coupon.maxUses || "∞"}</span>
                        </div>
                        {coupon.maxUses && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (coupon.usedCount / coupon.maxUses) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            coupon._count.orders > 0
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {coupon._count.orders}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            coupon.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(coupon.id, coupon._count.orders)}
                          className={`${
                            coupon._count.orders > 0
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-red-600 hover:text-red-800"
                          }`}
                          disabled={coupon._count.orders > 0}
                          title={
                            coupon._count.orders > 0
                              ? "Cannot delete coupon with active orders"
                              : "Delete coupon"
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            ℹ️ Admin Coupon Management
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Vendors create and manage their own coupons</li>
            <li>• Coupons are vendor-specific and only apply to that vendor's products</li>
            <li>• You can view all coupons and delete unused ones</li>
            <li>• Coupons with active orders cannot be deleted</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
