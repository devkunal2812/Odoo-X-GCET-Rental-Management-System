// Admin data types and mock data

export interface Vendor {
  id: string;
  name: string;
  companyName: string;
  email: string;
  gstin: string;
  status: 'Active' | 'Pending' | 'Suspended';
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  joinedDate: string;
}

export const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'John Smith',
    companyName: 'TechRent Pro',
    email: 'john@techrentpro.com',
    gstin: '29ABCDE1234F1Z5',
    status: 'Active',
    totalProducts: 45,
    totalOrders: 234,
    totalRevenue: 125000,
    rating: 4.8,
    joinedDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    companyName: 'ToolMaster',
    email: 'sarah@toolmaster.com',
    gstin: '27FGHIJ5678K2L9',
    status: 'Active',
    totalProducts: 32,
    totalOrders: 189,
    totalRevenue: 89000,
    rating: 4.6,
    joinedDate: '2024-01-20'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    companyName: 'EventPro',
    email: 'mike@eventpro.com',
    gstin: '19MNOPQ9012R3S4',
    status: 'Pending',
    totalProducts: 28,
    totalOrders: 156,
    totalRevenue: 67000,
    rating: 4.7,
    joinedDate: '2024-01-25'
  },
  {
    id: '4',
    name: 'Lisa Chen',
    companyName: 'BikeRentals',
    email: 'lisa@bikerentals.com',
    gstin: '33TUVWX3456Y7Z8',
    status: 'Active',
    totalProducts: 18,
    totalOrders: 203,
    totalRevenue: 45000,
    rating: 4.5,
    joinedDate: '2024-01-30'
  },
  {
    id: '5',
    name: 'David Brown',
    companyName: 'UrbanRide',
    email: 'david@urbanride.com',
    gstin: '12ABCDE7890F1G2',
    status: 'Suspended',
    totalProducts: 12,
    totalOrders: 94,
    totalRevenue: 23000,
    rating: 3.8,
    joinedDate: '2024-02-05'
  }
];