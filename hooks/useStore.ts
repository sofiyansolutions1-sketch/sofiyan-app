import { useState, useEffect } from 'react';
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
    commissionPaid: data.commission_paid,
    createdAt: data.created_at
  });

  const mapPartnerFromDB = (data: any): Partner => ({
    id: data.id,
    name: `${data.first_name} ${data.last_name}`,
    email: data.email,
    phone: data.phone,
    city: data.city,
    categories: data.categories,
    status: data.status,
    earnings: data.earnings || 0,
    completedJobs: data.completed_jobs || 0
  });

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });
    if (data) setBookings(data.map(mapBookingFromDB));
  };

  const fetchPartners = async () => {
    const { data } = await supabase.from('partners').select('*');
    if (data) setPartners(data.map(mapPartnerFromDB));
  };

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
      
    const partnersSub = supabase.channel('partners-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partners' }, () => fetchPartners())
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSub);
      supabase.removeChannel(partnersSub);
    };
  }, []);

  const addBooking = async (booking: Booking) => {
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

  const addPartner = async (partner: Partner) => {
     await fetchPartners();
  };

  const updatePartner = async (updatedPartner: Partner) => {
     setPartners(prev => prev.map(p => p.id === updatedPartner.id ? updatedPartner : p));

     const { error } = await supabase.from('partners').update({
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