"use client";

import { 
  ShoppingBagIcon, 
  CubeIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from "@heroicons/react/24/outline";

// Mock data
const stats = [
  {
    name: "Total Orders",
    value: "156",
    change: "+12%",
    changeType: "increase" as const,
    icon: ShoppingBagIcon
  },
  {
    name: "Active Rentals",
    value: "89",
    change: "+8%", 
    changeType: "increase" as const,
    icon: CubeIcon
  },
  {
    name: "Total Customers",
    value: "234",
    change: "+15%",
    changeType: "increase" as const,
    icon: UsersIcon
  },
  {
    name: "Revenue",
    value: "$12,450",
    change: "-3%",
    changeType: "decrease" as const,
    icon: CurrencyDollarIcon
  }
];

const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Smith",
    product: "Professional Camera Kit",
    amount: "$75",
    status: "confirmed" as const,
    date: "2024-01-20"
  },
  {
    id: "ORD-002", 
    customer: "Sarah Johnson",
    product: "Power Drill Set",
    amount: "$160",
    status: "invoiced" as const,
    date: "2024-01-19"
  },
  {
    id: "ORD-003",
    customer: "Mike Davis",
    product: "Party Sound System",
    amount: "$200",
    status: "quotation" as const,
    date: "2024-01-18"
  },
  {
    id: "ORD-004",
    customer: "Lisa Wilson",
    product: "Mountain Bike",
    amount: "$90",
    status: "confirmed" as const,
    date: "2024-01-17"
  }
];

const lowStockProducts = [
  { name: "Professional Camera Kit", stock: 2, threshold: 5 },
  { name: "Power Drill Set", stock: 1, threshold: 3 },
  { name: "Projector & Screen", stock: 3, threshold: 5 }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "quotation": return "bg-yellow-100 text-yellow-800";
    case "confirmed": return "bg-green-100 text-green-800";
    case "invoiced": return "bg-blue-100 text-blue-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--ink-black)" }}>Dashboard</h1>
        <p style={{ color: "var(--blue-slate)" }}>Welcome back! Here's what's happening with your rental business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--blue-slate)" }}>{stat.name}</p>
                <p className="text-2xl font-bold" style={{ color: "var(--ink-black)" }}>{stat.value}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--dusty-denim)" }}>
                <stat.icon className="h-6 w-6" style={{ color: "var(--eggshell)" }} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === "increase" ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" style={{ color: "var(--deep-space-blue)" }} />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" style={{ color: "var(--blue-slate)" }} />
              )}
              <span className={`text-sm font-medium`} style={{
                color: stat.changeType === "increase" ? "var(--deep-space-blue)" : "var(--blue-slate)"
              }}>
                {stat.change}
              </span>
              <span className="text-sm ml-1" style={{ color: "var(--blue-slate)" }}>from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b" style={{ borderColor: "var(--dusty-denim)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: "var(--ink-black)" }}>Recent Orders</h2>
              <a href="/dashboard/orders" className="text-sm font-medium hover:opacity-80 transition-opacity" 
                 style={{ color: "var(--deep-space-blue)" }}>
                View all
              </a>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0" 
                     style={{ borderColor: "var(--dusty-denim)" }}>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium" style={{ color: "var(--ink-black)" }}>{order.id}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--blue-slate)" }}>{order.customer}</p>
                    <p className="text-sm" style={{ color: "var(--blue-slate)" }}>{order.product}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold" style={{ color: "var(--ink-black)" }}>{order.amount}</p>
                    <p className="text-sm" style={{ color: "var(--blue-slate)" }}>{order.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b" style={{ borderColor: "var(--dusty-denim)" }}>
            <h2 className="text-lg font-semibold" style={{ color: "var(--ink-black)" }}>Low Stock Alert</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {lowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0" 
                     style={{ borderColor: "var(--dusty-denim)" }}>
                  <div>
                    <p className="font-medium" style={{ color: "var(--ink-black)" }}>{product.name}</p>
                    <p className="text-sm" style={{ color: "var(--blue-slate)" }}>Threshold: {product.threshold} units</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: "var(--deep-space-blue)" }}>
                      {product.stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <a href="/dashboard/products" className="text-sm font-medium hover:opacity-80 transition-opacity" 
                 style={{ color: "var(--deep-space-blue)" }}>
                Manage inventory →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--ink-black)" }}>Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/orders/new"
            className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg hover:opacity-80 transition-colors"
            style={{ borderColor: "var(--dusty-denim)" }}
          >
            <div className="text-center">
              <ShoppingBagIcon className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--dusty-denim)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--blue-slate)" }}>Create New Order</p>
            </div>
          </a>
          <a
            href="/dashboard/products/new"
            className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg hover:opacity-80 transition-colors"
            style={{ borderColor: "var(--dusty-denim)" }}
          >
            <div className="text-center">
              <CubeIcon className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--dusty-denim)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--blue-slate)" }}>Add New Product</p>
            </div>
          </a>
          <a
            href="/dashboard/reports"
            className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg hover:opacity-80 transition-colors"
            style={{ borderColor: "var(--dusty-denim)" }}
          >
            <div className="text-center">
              <ChartBarIcon className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--dusty-denim)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--blue-slate)" }}>View Reports</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}