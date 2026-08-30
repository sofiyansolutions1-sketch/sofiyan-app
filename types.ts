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
  otp?: string; // 4-digit OTP for starting job
  otpVerified?: boolean; // True if partner has entered OTP
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
  area?: string; // Added area field
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
  otp?: string; // 4-digit OTP for starting job
  otpVerified?: boolean; // True if partner has entered OTP
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'Forwarded' | 'on_hold' | 'admin_review';
  assignedPartnerId?: string;
  assignedPartnerName?: string;
  assignedPartnerPhone?: string;
  assignedPartnerArea?: string;
  commissionPaid: boolean;
  commission_screenshot?: string;
  partner_rating?: number; // Job-specific technician rating (1-5)
  partner_comment?: string; // Feedback review comment left by customer
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
  partner_type?: 'Primary'; // Kept only Primary partner
  categories?: string[];
  sub_categories?: string[];
  experience?: string;
  service_areas?: string[];
  service_radius?: number;
  service_pincodes?: string[];
  password?: string;
  aadhar_number?: string; // Aadhaar card number
  id_proof_url?: string;   // Identity verification document
  status: 'pending' | 'available' | 'busy' | 'on_hold' | 'blocked';
  age?: number;
  alt_phone?: string;
  rating?: number;
  review_count?: number;
  earnings: number;
  completedJobs: number;
  registration_fee_paid?: boolean;
  registration_fee_screenshot?: string;
}