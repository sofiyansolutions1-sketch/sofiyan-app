export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PARTNER = 'PARTNER',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST'
}

export interface Service {
  id: string;
  name: string;
  icon: string;
  image: string; // Added image property
  description: string;
  color: string;
  subServices: SubService[];
}

export interface SubService {
  id: string;
  name: string;
  price: number;
}

export interface CartItem extends SubService {
  quantity: number;
  categoryName: string;
}

export interface Booking {
  id: string;
  customerName: string;
  contactNumber: string;
  address: string;
  pinCode: string;
  description: string;
  date: string;
  time: string;
  serviceCategory: string; // Primary category or "Mixed"
  subServiceName: string; // Summary string for backward compatibility
  cartItems?: CartItem[]; // Full cart details
  price: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  assignedPartnerId?: string;
  commissionPaid: boolean;
  createdAt: string;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string; // Optional for backward compatibility
  password?: string;
  status: 'available' | 'busy';
  earnings: number;
  completedJobs: number;
}