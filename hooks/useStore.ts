import { useState, useEffect, useCallback } from 'react';
import { Booking, Partner } from '../types';
import { supabase } from '../supabaseClient';

export const useStore = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  // Mappers to convert DB snake_case to App camelCase
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

  const fetchBookings = useCallback(async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });
    if (data) setBookings(data.map(mapBookingFromDB));
  }, []);

  const fetchPartners = useCallback(async () => {
    const { data, error } = await supabase.from('primary_partners').select('*');
    if (error) {
      console.error("Error fetching partners:", error);
    }
    const primary = data ? data.map(mapPrimaryPartnerFromDB) : [];
    setPartners(primary);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchBookings(), fetchPartners()]);
      setLoading(false);
    };
    init();

    const bookingsSub = supabase.channel('bookings-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchBookings())
      .subscribe();
      
    const primaryPartnersSub = supabase.channel('primary-partners-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'primary_partners' }, () => fetchPartners())
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSub);
      supabase.removeChannel(primaryPartnersSub);
    };
  }, [fetchBookings, fetchPartners]);

  const addBooking = async () => {
      // Logic handled by components via direct insert mostly, but refetching ensures sync
      await fetchBookings(); 
  };

  const updateBooking = async (updatedBooking: Booking) => {
    // Optimistic UI update
    setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));

    const { error } = await supabase.from('bookings').update({
        status: updatedBooking.status,
        assigned_partner_id: updatedBooking.assignedPartnerId || null,
        assigned_partner_name: updatedBooking.assignedPartnerName || null,
        assigned_partner_phone: updatedBooking.assignedPartnerPhone || null,
        assigned_partner_area: updatedBooking.assignedPartnerArea || null,
        service_date: updatedBooking.date,
        service_time: updatedBooking.time,
        date: updatedBooking.date,
        time: updatedBooking.time,
        commission_paid: updatedBooking.commissionPaid,
        commission_screenshot: updatedBooking.commission_screenshot || null
    }).eq('id', updatedBooking.id);
    
    if (error) {
        console.error("Error updating booking:", error);
        fetchBookings(); // Revert on error
    }
  };

  const addPartner = async () => {
     await fetchPartners();
  };

  const updatePartner = async (updatedPartner: Partner) => {
     setPartners(prev => prev.map(p => p.id === updatedPartner.id ? updatedPartner : p));

     const { error } = await supabase.from('primary_partners').update({
         status: updatedPartner.status,
         earnings: updatedPartner.earnings,
         completed_jobs: updatedPartner.completedJobs,
         rating: updatedPartner.rating,
         review_count: updatedPartner.review_count
     }).eq('id', updatedPartner.id);

     if (error) {
        console.error("Error updating partner:", error);
        fetchPartners();
     }
  };

  const getPartner = (email: string) => partners.find(p => p.email === email);

  return {
    bookings,
    partners,
    addBooking,
    updateBooking,
    addPartner,
    updatePartner,
    getPartner,
    loading
  };
};