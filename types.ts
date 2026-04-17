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
  city: string; // Added city field
  location?: string;
  location_link?: string;
  lat?: number;
  lng?: number;
  pinCode: string;
  description: string;
  date: string;
  time: string;
  serviceCategory: string; // Primary category or "Mixed"
  subServiceName: string; // Summary string for backward compatibility
  cartItems?: CartItem[]; // Full cart details
  price: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'Forwarded' | 'on_hold';
  assignedPartnerId?: string;
  assignedPartnerName?: string;
  assignedPartnerPhone?: string;
  commissionPaid: boolean;
  createdAt: string;
  couponUsed?: string;
  discountAmount?: number;
  appliedReferralCode?: string;
}

export interface Partner {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string; // Optional for backward compatibility
  gender?: string;
  address?: string;
  pincode?: string;
  city?: string;
  lat?: number;
  lng?: number;
  partner_type?: 'Primary' | 'Secondary';
  categories?: string[];
  sub_categories?: string[];
  experience?: string;
  password?: string;
  status: 'available' | 'busy' | 'on_hold' | 'blocked';
  rating?: number;
  review_count?: number;
  earnings: number;
  completedJobs: number;
}