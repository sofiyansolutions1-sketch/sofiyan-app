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
    contactNumber: data.customer_phone,
    address: data.customer_address,
    city: data.city,
    pinCode: data.pincode,
    description: data.notes,
    date: data.service_date,
    time: data.service_time,
    serviceCategory: data.service_category,
    subServiceName: data.sub_service_name,
    cartItems: data.cart_items,
    price: data.total_price,
    status: data.status,
    assignedPartnerId: data.assigned_partner_id,
    assignedPartnerName: data.assigned_partner_name,
    assignedPartnerPhone: data.assigned_partner_phone,
    commissionPaid: data.commission_paid,
    createdAt: data.created_at,
    couponUsed: data.coupon_used,
    discountAmount: data.discount_amount
  });

  const mapPrimaryPartnerFromDB = (data: any): Partner => ({
    id: data.id,
    name: `${data.first_name} ${data.last_name}`,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    city: data.city,
    categories: data.categories,
    status: data.status,
    earnings: data.earnings || 0,
    completedJobs: data.completed_jobs || 0,
    partner_type: 'Primary'
  });

  const mapSecondaryPartnerFromDB = (data: any): Partner => ({
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    city: data.city,
    categories: data.categories,
    status: data.status,
    earnings: data.earnings || 0,
    completedJobs: data.completed_jobs || 0,
    partner_type: 'Secondary'
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
    const [primaryRes, secondaryRes] = await Promise.all([
      supabase.from('primary_partners').select('*'),
      supabase.from('secondary_partners').select('*')
    ]);
    
    const primary = primaryRes.data ? primaryRes.data.map(mapPrimaryPartnerFromDB) : [];
    const secondary = secondaryRes.data ? secondaryRes.data.map(mapSecondaryPartnerFromDB) : [];
    
    setPartners([...primary, ...secondary]);
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

    const secondaryPartnersSub = supabase.channel('secondary-partners-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'secondary_partners' }, () => fetchPartners())
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSub);
      supabase.removeChannel(primaryPartnersSub);
      supabase.removeChannel(secondaryPartnersSub);
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
        assigned_partner_id: updatedBooking.assignedPartnerId,
        commission_paid: updatedBooking.commissionPaid,
        service_date: updatedBooking.date,
        service_time: updatedBooking.time
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

     const table = updatedPartner.partner_type === 'Secondary' ? 'secondary_partners' : 'primary_partners';

     const { error } = await supabase.from(table).update({
         status: updatedPartner.status,
         earnings: updatedPartner.earnings,
         completed_jobs: updatedPartner.completedJobs
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