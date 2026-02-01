"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function TestAuthPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch('/api/orders/user');
      const result = await response.json();
      console.log('Orders API Response:', result);
      setOrders(result.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-secondary-900">Authentication Test</h1>
        
        {/* Authentication Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-secondary-900">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            {user && (
              <>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </>
            )}
          </div>
        </div>

        {/* Orders Test */}
        {isAuthenticated && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-secondary-900">User Orders Test</h2>
              <button
                onClick={fetchOrders}
                disabled={ordersLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {ordersLoading ? 'Loading...' : 'Refresh Orders'}
              </button>
            </div>
            
            <div className="space-y-4">
              <p><strong>Orders Count:</strong> {orders.length}</p>
              
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <div key={order.id} className="border border-secondary-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Order ID:</strong> {order.id}</p>
                          <p><strong>Product:</strong> {order.product.name}</p>
                          <p><strong>Amount:</strong> ₹{order.amount}</p>
                          <p><strong>Status:</strong> {order.status}</p>
                        </div>
                        <div>
                          <p><strong>Customer:</strong> {order.deliveryAddress?.name}</p>
                          <p><strong>Email:</strong> {order.deliveryAddress?.email}</p>
                          <p><strong>Order Date:</strong> {order.orderDate}</p>
                          <p><strong>Notes:</strong> {order.notes}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-600">No orders found for this user.</p>
              )}
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <p className="text-yellow-800">
              Please <a href="/login" className="text-primary-600 hover:underline">login</a> to test user-specific orders.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}