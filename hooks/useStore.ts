import { create } from 'zustand';
import { Booking, Partner } from '../types';
import { supabase } from '../supabaseClient';

interface StoreState {
  bookings: Booking[];
  partners: Partner[];
  loading: boolean;
  initialized: boolean;
  
  fetchBookings: () => Promise<void>;
  fetchPartners: () => Promise<void>;
  init: () => Promise<void>;
  
  addBooking: () => Promise<void>;
  updateBooking: (updatedBooking: Booking) => Promise<void>;
  addPartner: (newPartner: Partner) => Promise<Partner>;
  updatePartner: (updatedPartner: Partner) => Promise<void>;
  getPartner: (email: string) => Partner | undefined;
}

const mapBookingFromDB = (data: any): Booking => ({
  id: data.id,
  customerName: data.customer_name,
  contactNumber: data.customer_phone || data.contact_number,
  address: data.customer_address || data.address,
  area: data.area || '', 
  city: data.city,
  location_link: data.location_link,
  pinCode: data.pincode || data.pin_code,
  description: '', // Not in schema
  date: data.service_date || data.date,
  time: data.service_time || data.time,
  serviceCategory: data.service_category,
  subServiceName: data.sub_service_name,
  cartItems: data.cart_items,
  price: data.total_price || data.price,
  status: data.status,
  assignedPartnerId: data.assigned_partner_id,
  assignedPartnerName: data.assigned_partner_name,
  assignedPartnerPhone: data.assigned_partner_phone,
  assignedPartnerArea: data.assigned_partner_area || '', 
  commissionPaid: data.commission_paid || false,
  commission_screenshot: data.commission_screenshot || '',
  createdAt: data.created_at,
  couponUsed: data.coupon_used || '',
  discountAmount: data.discount_amount,
  appliedReferralCode: data.applied_referral_code
});

const mapPrimaryPartnerFromDB = (data: any): Partner => ({
  id: data.id,
  name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.name,
  first_name: data.first_name,
  last_name: data.last_name,
  email: data.email,
  phone: data.phone,
  password: data.password,
  city: data.city,
  pincode: data.pincode,
  categories: data.categories,
  sub_categories: data.sub_categories,
  service_areas: data.service_areas,
  service_pincodes: data.service_pincodes,
  status: data.status,
  rating: data.rating || 0,
  review_count: data.review_count || 0,
  earnings: data.earnings || 0,
  completedJobs: data.completed_jobs || 0,
  aadhar_number: data.aadhar_number,
  id_proof_url: data.id_proof_url,
  partner_type: 'Primary'
});

export const useStore = create<StoreState>((set, get) => ({
  bookings: [],
  partners: [],
  loading: true,
  initialized: false,

  fetchBookings: async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });
    if (data) {
      set({ bookings: data.map(mapBookingFromDB) });
    }
  },

  fetchPartners: async () => {
    const { data, error } = await supabase.from('primary_partners').select('*');
    if (error) {
      console.error("Error fetching partners:", error);
    }
    const primary = data ? data.map(mapPrimaryPartnerFromDB) : [];
    set({ partners: primary });
  },

  init: async () => {
    if (get().initialized) return;
    set({ loading: true, initialized: true });
    await Promise.all([get().fetchBookings(), get().fetchPartners()]);
    set({ loading: false });

    supabase.channel('bookings-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => get().fetchBookings())
      .subscribe();
      
    supabase.channel('primary-partners-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'primary_partners' }, () => get().fetchPartners())
      .subscribe();
  },

  addBooking: async () => {
      await get().fetchBookings(); 
  },

  updateBooking: async (updatedBooking: Booking) => {
    set(state => ({
      bookings: state.bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b)
    }));

    const { error } = await supabase.from('bookings').update({
        status: updatedBooking.status,
        assigned_partner_id: updatedBooking.assignedPartnerId || null,
        assigned_partner_name: updatedBooking.assignedPartnerName || null,
        assigned_partner_phone: updatedBooking.assignedPartnerPhone || null,
        assigned_partner_area: updatedBooking.assignedPartnerArea || null,
        date: updatedBooking.date,
        time: updatedBooking.time,
        commission_paid: updatedBooking.commissionPaid,
        commission_screenshot: updatedBooking.commission_screenshot || null
    }).eq('id', updatedBooking.id);
    
    if (error) {
        console.error("Error updating booking:", error);
        get().fetchBookings(); 
    }
  },

  
  addPartner: async (newPartner: Partner) => {
    const dbPartner: any = {
      name: newPartner.name,
      first_name: newPartner.first_name,
      last_name: newPartner.last_name,
      email: newPartner.email || `${newPartner.phone || Date.now()}@example.com`,
      phone: newPartner.phone,
      password: newPartner.password,
      alt_phone: newPartner.alt_phone,
      gender: newPartner.gender,
      age: newPartner.age,
      city: newPartner.city,
      pincode: newPartner.pincode,
      categories: newPartner.categories,
      sub_categories: newPartner.sub_categories,
      service_pincodes: newPartner.service_pincodes,
      experience: newPartner.experience,
      aadhar_number: newPartner.aadhar_number,
      status: newPartner.status,
      earnings: newPartner.earnings,
      completed_jobs: newPartner.completedJobs,
      registration_fee_paid: false
    };
    
    // Only pass ID if it's a valid UUID (not our fallback "P12345...")
    if (newPartner.id && !newPartner.id.startsWith('P')) {
       dbPartner.id = newPartner.id;
    }

    let data, error;
    try {
      const result = await supabase.from('primary_partners').insert(dbPartner).select().single();
      data = result.data;
      error = result.error;
    } catch (err) {
      error = err;
    }
    
    let partnerId = newPartner.id;
    if (error) {
       console.warn("Supabase insert failed:", error);
       throw error;
    } else if (data) {
       partnerId = data.id;
    }
    
    const createdPartner: Partner = {
      ...newPartner,
      id: partnerId
    };
    
    set(state => ({
      partners: [...state.partners.filter(p => p.id !== newPartner.id), createdPartner]
    }));
    
    return createdPartner;
  },


  updatePartner: async (updatedPartner: Partner) => {
     set(state => ({
       partners: state.partners.map(p => p.id === updatedPartner.id ? updatedPartner : p)
     }));
      let error;
      try {
        const result = await supabase.from('primary_partners').update({
            status: updatedPartner.status,
            earnings: updatedPartner.earnings,
            completed_jobs: updatedPartner.completedJobs,
            rating: updatedPartner.rating,
            review_count: updatedPartner.review_count,
            name: updatedPartner.name,
            first_name: updatedPartner.first_name,
            last_name: updatedPartner.last_name,
            email: updatedPartner.email,
            phone: updatedPartner.phone,
            password: updatedPartner.password,
            alt_phone: updatedPartner.alt_phone,
            gender: updatedPartner.gender,
            age: updatedPartner.age,
            experience: updatedPartner.experience,
            aadhar_number: updatedPartner.aadhar_number,
            address: updatedPartner.address,
            pincode: updatedPartner.pincode,
            city: updatedPartner.city,
            categories: updatedPartner.categories,
            sub_categories: updatedPartner.sub_categories,
            service_pincodes: updatedPartner.service_pincodes,
            id_proof_url: updatedPartner.id_proof_url,
            registration_fee_paid: updatedPartner.registration_fee_paid,
            registration_fee_screenshot: updatedPartner.registration_fee_screenshot
        }).eq('id', updatedPartner.id);
        error = result.error;
      } catch (err) {
        error = err;
      }
     
     if (error) {
        console.warn("Error updating partner in Supabase, using local state fallback:", error);
        // Do not throw so that local state remains updated
     }
  },

  getPartner: (email: string) => get().partners.find(p => p.email === email)
}));

// Initialize the store immediately
useStore.getState().init();
