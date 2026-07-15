import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { ADMIN_PASSWORD } from '../constants';
import { Booking } from '../types';
import { Modal } from '../components/Modal';
import { 
  Lock, Users, Calendar, Activity, Clock, Phone, DollarSign, Loader2, Star,
  Search, Send, MapPin, CheckCircle, FileSpreadsheet, Plus, MessageCircle, Share2, Map as MapIcon
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { BlogManager } from '../components/BlogManager';
import { PartnerManager } from '../components/PartnerManager';
import { FollowUpManager } from '../components/FollowUpManager';

export const AdminPanel: React.FC = () => {
  const { bookings, updateBooking, partners, updatePartner } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [mainTab, setMainTab] = useState<'Dashboard' | 'BlogManager' | 'PartnerManagement' | 'FollowUps'>('Dashboard');
  
  const [rescheduleData, setRescheduleData] = useState<{ booking: Booking | null, date: string, time: string }>({ 
    booking: null, date: '', time: '' 
  });

  const [dispatchBooking, setDispatchBooking] = useState<Booking | null>(null);
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
  const [partnerSearchResults, setPartnerSearchResults] = useState<any[]>([]);
  const [isSearchingPartners, setIsSearchingPartners] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [currentAdminTab, setCurrentAdminTab] = useState<'Pending' | 'Forwarded' | 'Accepted' | 'Review' | 'Completed'>('Pending');
  const [showPartnersDirectory, setShowPartnersDirectory] = useState(false);
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');
  const [directoryStatusFilter, setDirectoryStatusFilter] = useState<'all' | 'available' | 'busy' | 'pending' | 'on_hold' | 'blocked'>('all');

  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const handleCompleteBookingAndRate = async () => {
    if (!ratingBookingId) return;
    
    const targetBooking = bookings.find(b => b.id === ratingBookingId);
    if (!targetBooking) return;

    setIsSubmittingRating(true);
    try {
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          partner_rating: selectedRating
        })
        .eq('id', ratingBookingId);

      if (bookingError) throw bookingError;

      updateBooking({ ...targetBooking, status: 'completed', partner_rating: selectedRating });

      if (targetBooking.assignedPartnerId) {
        const currentPartner = partners.find(p => p.id === targetBooking.assignedPartnerId);
        if (currentPartner) {
          const oldReviewCount = currentPartner.review_count || 0;
          const oldRating = Number(currentPartner.rating) || 5.0;
          
          const newReviewCount = oldReviewCount + 1;
          const newRating = parseFloat(((oldRating * oldReviewCount + selectedRating) / newReviewCount).toFixed(2));
          const newJobsCount = (currentPartner.completedJobs || 0) + 1;

          await supabase
            .from('primary_partners')
            .update({
              rating: newRating,
              review_count: newReviewCount,
              completed_jobs: newJobsCount
            })
            .eq('id', currentPartner.id);
        }
      }

      alert("Lead Completed & Technician Rated successfully! 🎉");
      setRatingBookingId(null);
      setSelectedRating(5);
    } catch (err: any) {
      console.error("Error completing lead, rating:", err);
      alert("Failed to complete and rate lead: " + err.message);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Access Denied: Incorrect Password");
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    updateBooking({ ...booking, status: 'cancelled' });
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleData.booking) return;
    const updatedBooking: Booking = {
      ...rescheduleData.booking,
      date: rescheduleData.date,
      time: rescheduleData.time
    };
    updateBooking(updatedBooking);
    await supabase.from('bookings').update({ date: rescheduleData.date, time: rescheduleData.time }).eq('id', rescheduleData.booking.id);
    setRescheduleData({ booking: null, date: '', time: '' });
  };

  const handlePartnerSearch = useCallback(async () => {
    setIsSearchingPartners(true);
    setHasSearched(true);
    try {
      const q = partnerSearchQuery.trim().toLowerCase();
      
      const combined = partners.map(p => {
        let score = 0;

        // 1. Text Search matching
        if (q) {
          const nameMatch = p.name?.toLowerCase().includes(q);
          const cityMatch = p.city?.toLowerCase().includes(q);
          const areaMatch = (p.service_areas || []).some(a => a.toLowerCase().includes(q));
          const catMatch = (p.categories || []).some(c => c.toLowerCase().includes(q));
          const pinMatch = p.pincode === q || (p.service_pincodes || []).includes(q);

          if (nameMatch || cityMatch || areaMatch || catMatch || pinMatch) {
            score += 100;
          } else {
            return { ...p, matchScore: 0 };
          }
        }

        // 2. Automated Smart Ranking
        if (dispatchBooking) {
          const bookingLocation = (dispatchBooking.area || dispatchBooking.city || '').toLowerCase();
          const bookingCity = (dispatchBooking.city || '').toLowerCase();
          const bookingPin = dispatchBooking.pinCode;
          const bookingCat = (dispatchBooking.serviceCategory || '').toLowerCase();

          const areaMatch = (p.service_areas || []).some(a => a.toLowerCase().includes(bookingLocation) || bookingLocation.includes(a.toLowerCase())) ? 80 : 0;
          const cityMatch = (p.city?.toLowerCase() === bookingCity || bookingCity.includes(p.city?.toLowerCase() || '')) ? 40 : 0;
          const catMatch = (p.categories || []).some(c => 
            bookingCat.includes(c.toLowerCase()) || c.toLowerCase().includes(bookingCat)
          ) ? 30 : 0;
          const pinMatch = (p.pincode === bookingPin || (p.service_pincodes || []).includes(bookingPin)) ? 50 : 0; // Increased weight for pinMatch

          score += areaMatch + cityMatch + catMatch + pinMatch;
        }

        return { ...p, matchScore: score };
      });

      const filtered = q ? combined.filter(p => p.matchScore > 0) : combined;
      const finalResult = q ? filtered : filtered.filter(p => p.status === 'available');
      
      finalResult.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      setPartnerSearchResults(finalResult);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingPartners(false);
    }
  }, [partnerSearchQuery, dispatchBooking, partners]);

  useEffect(() => {
    if (dispatchBooking) {
      // Prioritize City/Area for search as requested
      setPartnerSearchQuery(dispatchBooking.area || dispatchBooking.city || dispatchBooking.pinCode);
      handlePartnerSearch();
    }
  }, [dispatchBooking, handlePartnerSearch]);

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const pendingJobs = bookings.filter(b => b.status === 'pending').length;
  const assignedJobs = bookings.filter(b => b.status === 'Forwarded' || b.status === 'accepted').length;
  const forwardedJobs = bookings.filter(b => b.status === 'Forwarded').length;
  const acceptedJobs = bookings.filter(b => b.status === 'accepted').length;
  const reviewJobs = bookings.filter(b => b.status === 'admin_review').length;
  const completedJobs = completedBookings.length;

  const displayedBookings = bookings.filter(b => {
    if (currentAdminTab === 'Pending') return b.status === 'pending';
    if (currentAdminTab === 'Forwarded') return b.status === 'Forwarded';
    if (currentAdminTab === 'Accepted') return b.status === 'accepted';
    if (currentAdminTab === 'Review') return b.status === 'admin_review';
    if (currentAdminTab === 'Completed') return b.status === 'completed';
    return false;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border-t-4 border-gray-900 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="text-gray-900" size={32} />
            </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Founder Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Access Key..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 transition-all text-center"
            />
            <button className="w-full bg-gray-950 text-white py-3 rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg">
              Unlock Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tighter leading-tight">FOUNDER DASHBOARD</h1>
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5 sm:mt-1">OPERATIONAL CONTROL CENTER</p>
        </div>
        <div className="flex flex-row w-full md:w-auto gap-2 sm:gap-3">
            <button 
              onClick={() => setShowPartnersDirectory(true)}
              className="flex-1 md:flex-none justify-center bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition shadow-sm border border-indigo-100 flex items-center gap-2 text-center"
            >
                <Users size={14} className="shrink-0" /> <span>Technician Directory</span>
            </button>
            <button className="flex-1 md:flex-none justify-center bg-gray-100 text-gray-600 px-3 sm:px-4 py-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition flex items-center gap-2 text-center">
                <FileSpreadsheet className="shrink-0" size={14} /> <span>Export Data</span>
            </button>
        </div>
      </div>

      <div className="flex space-x-1 mb-6 sm:mb-10 bg-gray-100 p-1 rounded-2xl w-full md:w-fit overflow-x-auto scrollbar-hide">
        <button onClick={() => setMainTab('Dashboard')} className={`flex-shrink-0 py-2.5 px-4 sm:px-6 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${mainTab === 'Dashboard' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Operational</button>
        <button onClick={() => setMainTab('FollowUps')} className={`flex-shrink-0 py-2.5 px-4 sm:px-6 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${mainTab === 'FollowUps' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Follow-ups</button>
        <button onClick={() => setMainTab('BlogManager')} className={`flex-shrink-0 py-2.5 px-4 sm:px-6 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${mainTab === 'BlogManager' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Marketing</button>
        <button onClick={() => setMainTab('PartnerManagement')} className={`flex-shrink-0 py-2.5 px-4 sm:px-6 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${mainTab === 'PartnerManagement' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Supply</button>
      </div>

      {mainTab === 'FollowUps' && <FollowUpManager />}
      {mainTab === 'BlogManager' && <BlogManager />}
      {mainTab === 'PartnerManagement' && <PartnerManager />}

      {mainTab === 'Dashboard' && (
        <div className="space-y-10">
          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div onClick={() => setShowPartnersDirectory(true)} className="cursor-pointer">
              <StatCard 
                title="Active Partners" 
                value={partners.filter(p => p.status === 'available').length.toString()} 
                icon={<Users size={24} />} 
                color="text-gray-900" 
                bg="bg-gray-50"
              />
            </div>
            <StatCard 
              title="Pending Leads" 
              value={pendingJobs.toString()} 
              icon={<Clock size={24} />} 
              color="text-amber-600" 
              bg="bg-amber-50"
            />
            <StatCard 
              title="Assigned Leads" 
              value={assignedJobs.toString()} 
              icon={<Send size={24} />} 
              color="text-purple-600" 
              bg="bg-purple-50"
            />
            <StatCard 
              title="Completed Leads" 
              value={completedJobs.toString()} 
              icon={<CheckCircle size={24} />} 
              color="text-sky-600" 
              bg="bg-sky-50"
            />
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="px-5 sm:px-8 py-6 sm:py-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-gray-900">Lead Registry</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Incoming Service Traffic</p>
              </div>
              
              <div className="flex bg-white rounded-2xl p-1 border border-gray-200 w-full md:w-auto overflow-x-auto scrollbar-hide">
                <button 
                    onClick={() => setCurrentAdminTab('Pending')} 
                    className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentAdminTab === 'Pending' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    New Leads ({pendingJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Forwarded')} 
                    className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentAdminTab === 'Forwarded' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    Dispatched ({forwardedJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Accepted')} 
                    className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentAdminTab === 'Accepted' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    Accepted ({acceptedJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Review')} 
                    className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentAdminTab === 'Review' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    Review ({reviewJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Completed')} 
                    className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentAdminTab === 'Completed' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    Completed ({completedJobs})
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-8 space-y-4 min-h-[500px] bg-gray-50/30">
              {displayedBookings.map((booking, index) => (
                <div key={booking.id} className="relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  
                  {/* Customer Info Header - Compact & Simple Numbering */}
                  <div className="p-4 border-b border-gray-50 bg-indigo-50/20">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3">
                        <div className="text-xl font-black text-gray-900 border-r border-gray-200 pr-3 mr-1 flex items-center h-8">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-base font-black text-gray-900 tracking-tight leading-none mb-1">{booking.customerName}</h4>
                          <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                            <Phone size={10} className="text-indigo-400" /> {booking.contactNumber}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        'bg-indigo-100 text-indigo-700 border-indigo-200'
                      }`}>
                        {booking.status}
                      </div>
                    </div>

                    {/* Visible Customer Action Buttons - Slimmer */}
                    <div className="flex gap-2">
                      <a 
                        href={`tel:${booking.contactNumber}`}
                        className="flex-1 h-9 bg-indigo-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm hover:bg-black transition-all"
                      >
                        <Phone size={12} /> Call 
                      </a>
                      <a 
                        href={`https://wa.me/91${booking.contactNumber}?text=${encodeURIComponent(`Hello ${booking.customerName}, regarding your booking...`)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 h-9 bg-emerald-500 text-white rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-600 transition-all"
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </a>
                       <button 
                         onClick={() => {
                          const msg = `🆕 NEW ONLINE BOOKING\n` +
                                     `───────────────────\n` +
                                     `👤 Customer Info:\n` +
                                     `Name: ${booking.customerName}\n` +
                                     `Phone: ${booking.contactNumber}\n\n` +
                                     `🛠️ Service Details:\n` +
                                     `Category: ${booking.serviceCategory}\n` +
                                     `Items: ${booking.subServiceName}\n` +
                                     `Total Amount: ₹${booking.price}\n\n` +
                                     `📍 Address:\n` +
                                     `City: ${booking.city || 'Bangalore'} -\n` +
                                     `Detail: ${booking.address || ''}\n\n` +
                                     (booking.location_link ? `🔗 Location: ${booking.location_link}\n\n` : '') +
                                     `⏰ Schedule:\n` +
                                     `Date: ${booking.date}\n` +
                                     `Time: ${booking.time}\n\n` +
                                     `───────────────────\n` +
                                     `Sent via Sofiyan Home Service App`;
                          
                          window.open(`https://wa.me/7625046788?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="h-9 w-9 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:shadow-md border border-indigo-200 transition-all shrink-0"
                        title="Forward to Admin WhatsApp"
                      >
                        <Share2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Core Lead Details - Even More Compact */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                         <div className="w-7 h-7 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
                           <Activity size={14} />
                         </div>
                         <div className="min-w-0">
                           <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Service</p>
                           <p className="text-[11px] font-black text-gray-900 truncate">{booking.subServiceName}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                           <Calendar size={14} />
                         </div>
                         <div className="min-w-0">
                           <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Schedule</p>
                           <p className="text-[11px] font-black text-gray-900 truncate">{booking.date} | {booking.time}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500 shrink-0">
                           <MapPin size={14} />
                         </div>
                         <div className="min-w-0 flex-1">
                           <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Address</p>
                           <p className="text-[11px] font-black text-gray-900 leading-tight truncate">
                             {booking.address ? `${booking.address}` : 'Address via Link'}
                           </p>
                           {booking.location_link && (
                             <a 
                               href={booking.location_link} 
                               target="_blank" 
                               rel="noreferrer" 
                               className="text-[9px] font-black text-indigo-600 flex items-center gap-1 mt-1 hover:underline"
                             >
                               <MapIcon size={10} /> View Map
                             </a>
                           )}
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                           <DollarSign size={14} />
                         </div>
                         <div className="min-w-0">
                           <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Price</p>
                           <p className="text-[11px] font-black text-gray-900">₹{booking.price}</p>
                         </div>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                         <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                           <MapIcon size={14} />
                         </div>
                         <div className="min-w-0 flex-1">
                           <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Service Area</p>
                           <p className="text-[11px] font-black text-gray-900 leading-tight">
                             {booking.area || booking.city || 'Not specified'}
                           </p>
                         </div>
                      </div>
                    </div>

                    {/* Forward Section - Redesigned Partner Details */}
                    {(booking.assignedPartnerName || booking.status === 'Forwarded' || booking.status === 'accepted') && (() => {
                      const pt = partners.find(p => p.id === booking.assignedPartnerId || p.phone === booking.assignedPartnerPhone || p.name === booking.assignedPartnerName);
                      return (
                        <div className="p-3.5 bg-indigo-950 text-white rounded-2xl shadow-lg border border-indigo-900 flex flex-col gap-2.5">
                          {/* Mini Profile Header */}
                          <div className="flex justify-between items-start pb-2 border-b border-white/10">
                            <div className="flex items-center gap-2.5 min-w-0 relative">
                              <div className="w-8 h-8 rounded-lg bg-white/15 text-white flex items-center justify-center font-black text-xs shrink-0 select-none">
                                {booking.assignedPartnerName ? booking.assignedPartnerName.charAt(0) : 'P'}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[7.5px] font-extrabold text-indigo-300 uppercase tracking-widest block leading-none mb-0.5">Dispatched Technician</span>
                                <h5 className="text-[11px] font-black tracking-tight leading-tight truncate text-white" title={booking.assignedPartnerName}>
                                  {booking.assignedPartnerName}
                                </h5>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-0.5 justify-end">
                                <Star size={9} className="text-yellow-400 fill-current" />
                                <span className="text-[10px] font-black text-yellow-300">{pt?.rating?.toFixed(1) || '5.0'}</span>
                                <span className="text-indigo-200 text-[8px]">({pt?.review_count || 0})</span>
                              </div>
                              <p className="text-[7.5px] font-bold uppercase tracking-wider text-emerald-400">
                                {pt?.status === 'available' ? 'Active' : pt?.status || 'Dispatched'}
                              </p>
                            </div>
                          </div>

                          {/* Profile Quick Stats */}
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] text-indigo-100">
                            <div>
                              <span className="text-[6.5px] font-black text-indigo-300 uppercase tracking-wider block">Contact Number</span>
                              <span className="font-extrabold text-white">{booking.assignedPartnerPhone}</span>
                            </div>
                            <div>
                              <span className="text-[6.5px] font-black text-indigo-300 uppercase tracking-wider block">Expertise / Coverage</span>
                              <span className="font-semibold text-white truncate block" title={pt?.city || booking.assignedPartnerArea}>
                                {pt?.city || booking.assignedPartnerArea || 'Local Area'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[6.5px] font-black text-indigo-300 uppercase tracking-wider block">Expert Credentials</span>
                              <span className="font-semibold text-white block truncate">
                                {pt?.experience || 'Certified Pro'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[6.5px] font-black text-indigo-300 uppercase tracking-wider block">ID Verification</span>
                              <span className={`font-black text-[7.5px] flex items-center gap-0.5 ${pt?.aadhar_number ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {pt?.aadhar_number ? '🛡️ Aadhaar Verified' : '⚠️ No Document'}
                              </span>
                            </div>
                          </div>

                          {/* Action and Document Trigger links */}
                          <div className="flex gap-2 pt-1">
                            <a 
                              href={`tel:${booking.assignedPartnerPhone}`}
                              className="flex-1 h-8 bg-white hover:bg-indigo-50 text-indigo-950 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-sm"
                            >
                              <Phone size={10} /> Call Now
                            </a>
                            <a 
                              href={`https://wa.me/91${booking.assignedPartnerPhone}?text=${encodeURIComponent(`Hello ${booking.assignedPartnerName}, job instructions for customer ${booking.customerName} located at ${booking.address}: ${booking.subServiceName}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-sm"
                            >
                              <MessageCircle size={10} /> WhatsApp
                            </a>
                            {pt?.id_proof_url && (
                              <a 
                                href={pt.id_proof_url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="w-8 h-8 bg-indigo-900 hover:bg-black text-indigo-200 hover:text-white rounded-lg flex items-center justify-center border border-indigo-800 transition shadow-sm"
                                title="View Identity Document"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex justify-between gap-2 pt-1">
                       {booking.status === 'pending' && (
                         <button 
                           onClick={() => setDispatchBooking(booking)} 
                           className="flex-1 bg-indigo-900 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-md flex items-center justify-center gap-2"
                         >
                           <Send size={12} /> Assign Technician
                         </button>
                       )}
                       {(booking.status === 'Forwarded' || booking.status === 'accepted' || booking.status === 'admin_review') && (
                         <button 
                           onClick={() => {
                             setSelectedRating(5);
                             setRatingBookingId(booking.id);
                           }} 
                           className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.15em] hover:from-emerald-700 hover:to-green-700 transition-all shadow-md flex items-center justify-center gap-2"
                         >
                           <CheckCircle size={12} /> {booking.status === 'admin_review' ? 'Verify Payment & Rate' : 'Complete & Rate'}
                         </button>
                       )}
                       {booking.status === 'completed' && (
                         <div className="flex-1 bg-emerald-50 text-emerald-700 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border border-emerald-100 flex items-center justify-center gap-2">
                            <CheckCircle size={12} /> Done (Rated {booking.partner_rating || 5}★)
                         </div>
                       )}
                       <div className="flex gap-2">
                          <button 
                            onClick={() => setRescheduleData({ booking, date: booking.date, time: booking.time })} 
                            className="w-10 h-10 bg-gray-50 text-gray-400 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 border border-gray-100 flex items-center justify-center"
                            title="Reschedule"
                          >
                             <Calendar size={16} />
                          </button>
                          <button 
                            onClick={() => handleCancelBooking(booking)} 
                            className="w-10 h-10 bg-gray-50 text-gray-400 rounded-lg hover:text-rose-600 hover:bg-rose-50 border border-gray-100 flex items-center justify-center"
                            title="Cancel"
                          >
                             <Plus className="rotate-45" size={18} />
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
              {displayedBookings.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="text-gray-200" size={48} />
                    </div>
                    <p className="text-lg font-bold text-gray-400 uppercase tracking-widest">No Active Leads</p>
                    <p className="text-sm text-gray-400 mt-2">All operational channels are clear.</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals remain similarly structured but cleaner */}
      <Modal isOpen={!!rescheduleData.booking} onClose={() => setRescheduleData({ booking: null, date: '', time: '' })} title="Adjust Operations">
          <form onSubmit={handleRescheduleSubmit} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Date</label>
                    <input type="date" value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" required />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Appointment Time</label>
                    <input type="time" value={rescheduleData.time} onChange={e => setRescheduleData({...rescheduleData, time: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" required />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-black transition-all">Update Schedule</button>
          </form>
      </Modal>

      <Modal isOpen={!!dispatchBooking} onClose={() => { setDispatchBooking(null); setPartnerSearchResults([]); setHasSearched(false); }} title="Assign Technician">
        <div className="space-y-8 pt-4">
            <div className="flex gap-2">
                <input type="text" value={partnerSearchQuery} onChange={e => setPartnerSearchQuery(e.target.value)} placeholder="Search Area / Service / Pincode..." className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                <button onClick={handlePartnerSearch} className="bg-indigo-900 text-white px-6 rounded-2xl font-bold shadow-lg shadow-indigo-100"><Search size={20} /></button>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {isSearchingPartners ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
                ) : (
                 partnerSearchResults.map(partner => (
                    <div key={partner.id} className="p-5 border border-gray-100 rounded-3xl bg-white hover:bg-indigo-50/30 transition-all flex flex-col gap-4 group">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                  {partner.name.charAt(0)}
                      </div>
                      {index < 3 && directoryStatusFilter === 'all' && !directorySearchQuery && (
                        <div className={`absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>
                          #{index + 1}
                        </div>
                      )}
                              <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-black text-gray-900 tracking-tight">{partner.name}</p>
                                    {partner.isPrimary && (
                                      <span className="text-[8px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-black uppercase">App Partner</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">{partner.city} | {partner.pincode}</p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {partner.matchScore !== undefined && (
                                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md text-[8px] font-black border border-emerald-100">
                                        <Activity size={8} /> {Math.min(100, partner.matchScore)}% MATCH
                                      </div>
                                    )}
                                    {partner.categories && Array.isArray(partner.categories) && partner.categories.slice(0, 2).map((cat: string) => (
                                      <span key={cat} className="text-[8px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md font-bold">{cat}</span>
                                    ))}
                                  </div>
                              </div>
                          </div>
                          <div className="flex gap-2">
                             <a 
                               href={`tel:${partner.phone}`}
                               className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                               title="Call"
                             >
                                <Phone size={16} />
                             </a>
                             <a 
                               href={`https://wa.me/91${partner.phone}?text=${encodeURIComponent(`Hello ${partner.name}, regarding a job...`)}`}
                               target="_blank"
                               rel="noreferrer"
                               className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                               title="WhatsApp"
                             >
                                <MessageCircle size={16} />
                             </a>
                          </div>
                        </div>
                        
                        <button 
                            onClick={async () => {
                                const waText = `✨ *SOFIYAN HOME SERVICE - JOB ALERT* ✨\n\nHello *${partner.name}*, you have been assigned to a new booking!\n\n📋 *JOB & CUSTOMER DETAILS*\n👤 *Customer Name:* ${dispatchBooking?.customerName}\n📞 *Customer Phone:* ${dispatchBooking?.contactNumber || 'Not available'}\n🛠️ *Service:* ${dispatchBooking?.subServiceName}\n⏰ *Schedule:* ${dispatchBooking?.date} | ${dispatchBooking?.time}\n📍 *Address:* ${dispatchBooking?.address}, ${dispatchBooking?.city} (${dispatchBooking?.pinCode})\n🗺️ *Map Link:* ${dispatchBooking?.location_link ? dispatchBooking.location_link : 'Not provided'}\n\n💵 *Pay Out:* ₹${dispatchBooking?.price}\n\n🚀 *Please contact the customer immediately to confirm your visit.*`;
                                window.open(`https://wa.me/91${partner.phone}?text=${encodeURIComponent(waText)}`, '_blank');
                                if (dispatchBooking) {
                                  updateBooking({ 
                                    ...dispatchBooking, 
                                    status: 'Forwarded', 
                                    assignedPartnerId: partner.id,
                                    assignedPartnerName: partner.name,
                                    assignedPartnerPhone: partner.phone,
                                    assignedPartnerArea: partner.city || partner.pincode // Using city/pincode as area
                                  });
                                }
                                setDispatchBooking(null);
                            }}
                            className="bg-indigo-900 text-white w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-md"
                        >Assign & Forward Job</button>
                    </div>
                ))
                )}
                {hasSearched && partnerSearchResults.length === 0 && (
                    <div className="text-center py-10">
                        <Search className="mx-auto text-gray-100 mb-4" size={48} />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Partners Found</p>
                    </div>
                )}
            </div>
        </div>
      </Modal>

      <Modal isOpen={showPartnersDirectory} onClose={() => setShowPartnersDirectory(false)} title="Technician Directory">
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center bg-indigo-950/5 p-4 rounded-2xl border border-indigo-950/5">
            <div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Partner Force</p>
              <h3 className="text-base font-black text-indigo-950 leading-none mt-1">
                {partners.filter(p => p.status === 'available').length} Available Professionals
              </h3>
            </div>
            <div className="flex -space-x-2">
               {partners.filter(p => p.status === 'available').slice(0, 5).map((p) => (
                 <div key={p.id} className="w-8 h-8 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-950 shadow-sm">
                   {p.name.charAt(0)}
                 </div>
               ))}
               {partners.filter(p => p.status === 'available').length > 5 && (
                 <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-indigo-100 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                   +{partners.filter(p => p.status === 'available').length - 5}
                 </div>
               )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 text-gray-400" size={14} />
              <input
                type="text"
                value={directorySearchQuery}
                onChange={(e) => setDirectorySearchQuery(e.target.value)}
                placeholder="Search technicians by name, skill, phone, pin code..."
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all placeholder-gray-400"
              />
            </div>
            
            {/* Status Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {[
                { label: 'All', value: 'all', count: partners.length },
                { label: 'Active', value: 'available', count: partners.filter(p => p.status === 'available').length },
                { label: 'Busy', value: 'busy', count: partners.filter(p => p.status === 'busy').length },
                { label: 'Pending', value: 'pending', count: partners.filter(p => p.status === 'pending').length },
                { label: 'On Hold', value: 'on_hold', count: partners.filter(p => p.status === 'on_hold').length },
                { label: 'Blocked', value: 'blocked', count: partners.filter(p => p.status === 'blocked').length },
              ].map((tab) => {
                const isSelected = directoryStatusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setDirectoryStatusFilter(tab.value as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                      isSelected 
                        ? 'bg-indigo-900 border-indigo-900 text-white font-extrabold shadow-md' 
                        : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid list container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {partners
              .filter(p => {
                if (directoryStatusFilter !== 'all' && p.status !== directoryStatusFilter) return false;
                if (directorySearchQuery.trim()) {
                  const q = directorySearchQuery.toLowerCase();
                  return (
                    p.name?.toLowerCase().includes(q) ||
                    p.phone?.includes(q) ||
                    p.city?.toLowerCase().includes(q) ||
                    p.pincode?.includes(q) ||
                    (p.categories || []).some(c => c.toLowerCase().includes(q)) ||
                    (p.sub_categories || []).some(sc => sc.toLowerCase().includes(q))
                  );
                }
                return true;
              })
              .sort((a, b) => {
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                if (ratingB !== ratingA) return ratingB - ratingA;
                const jobsA = a.completedJobs || 0;
                const jobsB = b.completedJobs || 0;
                if (jobsB !== jobsA) return jobsB - jobsA;
                const earnA = a.earnings || 0;
                const earnB = b.earnings || 0;
                return earnB - earnA;
              })
              .map((partner, index) => (
                <div 
                  key={partner.id} 
                  className="p-3 border border-gray-100 rounded-2xl bg-white hover:border-indigo-600/20 hover:shadow-md transition-all flex flex-col justify-between gap-3 group border-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5 min-w-0 relative">
                      {/* Status-colored visual circular avatar */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm border shadow-inner flex-shrink-0 ${
                        partner.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        partner.status === 'busy' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        partner.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        partner.status === 'on_hold' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                        'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {partner.name.charAt(0)}
                      </div>
                      {index < 3 && directoryStatusFilter === 'all' && !directorySearchQuery && (
                        <div className={`absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>
                          #{index + 1}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-black text-gray-900 tracking-tight leading-tight text-xs truncate max-w-[130px]" title={partner.name}>
                          {partner.name}
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 truncate">
                          {partner.city || 'Verified'} {partner.pincode && `| ${partner.pincode}`}
                        </p>
                      </div>
                    </div>
                    {/* Compact layout controls: call, whatsapp & status picker inline */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a 
                        href={`tel:${partner.phone}`}
                        className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center hover:bg-indigo-600 hover:text-white transition shadow-sm border border-indigo-100"
                      >
                        <Phone size={12} />
                      </a>
                      <a 
                        href={`https://wa.me/91${partner.phone}?text=${encodeURIComponent(`Hello ${partner.name}, from Sofiyan Home Service...`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-7 h-7 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center hover:bg-emerald-600 hover:text-white transition shadow-sm border border-emerald-100"
                      >
                        <MessageCircle size={12} />
                      </a>
                      
                      {/* Status inline editor */}
                      <select
                        value={partner.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as any;
                          try {
                            const { error } = await supabase
                              .from('primary_partners')
                              .update({ status: newStatus })
                              .eq('id', partner.id);
                            if (error) throw error;
                            updatePartner({ ...partner, status: newStatus });
                          } catch (err: any) {
                            alert("Failed to update status: " + err.message);
                          }
                        }}
                        className="text-[9px] font-bold border border-gray-200 rounded-lg px-1 py-1 bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-[72px]"
                      >
                        <option value="available">Active</option>
                        <option value="busy">Busy</option>
                        <option value="pending">Pending</option>
                        <option value="on_hold">On Hold</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                  </div>

                  {/* Profile data grid block */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[10px]">
                    {/* Col 1: Categories & Exp */}
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest block font-sans">Skills & Experience</p>
                      <div className="flex flex-wrap gap-1">
                        {(partner.categories || []).slice(0, 2).map((cat: string) => (
                          <span key={cat} className="text-[8px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded font-black uppercase tracking-wider">
                            {cat}
                          </span>
                        ))}
                      </div>
                      <p className="text-[9px] text-gray-500 font-bold">
                        {partner.experience ? `${partner.experience}` : 'Experienced'} {partner.age && `| Age: ${partner.age}`}
                      </p>
                    </div>

                    {/* Col 2: Business Stats & Verification */}
                    <div className="space-y-1 border-l border-gray-50 pl-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Quality score</span>
                        <div className="flex items-center gap-0.5">
                          <Star size={9} className="text-yellow-400 fill-current" />
                          <span className="font-extrabold text-gray-900">{partner.rating?.toFixed(1) || '5.0'}</span>
                          <span className="text-gray-400 text-[8px]">({partner.review_count || 0})</span>
                        </div>
                      </div>
                      <p className="font-mono text-[9px] text-indigo-900 font-bold block leading-none">
                        Completed: {partner.completedJobs || 0} jobs
                      </p>
                      <p className="text-[8px] font-black text-emerald-700 leading-none">
                        Payouts: ₹{partner.earnings || 0}
                      </p>
                    </div>
                  </div>

                  {/* Verifications and documents */}
                  <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-gray-50 mt-0.5">
                    {partner.aadhar_number ? (
                      <span className="text-emerald-700 bg-emerald-50/70 py-0.5 px-2 rounded-full font-black uppercase tracking-wider text-[8px] flex items-center gap-1 border border-emerald-100">
                        🛡️ Aadhaar Verified {partner.aadhar_number.replace(/.(?=.{4})/g, "•")}
                      </span>
                    ) : (
                      <span className="text-gray-400 bg-gray-50 py-0.5 px-2 rounded-full font-black uppercase tracking-wider text-[8px] flex items-center gap-1">
                        ⚠️ No Aadhaar Added
                      </span>
                    )}

                    {partner.id_proof_url ? (
                      <a 
                        href={partner.id_proof_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-indigo-600 font-black hover:underline tracking-wider uppercase text-[8px] flex items-center gap-0.5 bg-indigo-50/50 hover:bg-indigo-50 py-0.5 px-2 rounded transition"
                      >
                        📄 View Document
                      </a>
                    ) : (
                      <span className="text-[8px] text-gray-300 uppercase tracking-widest">No Document</span>
                    )}
                  </div>
                </div>
              ))}
            
            {partners.filter(p => {
              if (directoryStatusFilter !== 'all' && p.status !== directoryStatusFilter) return false;
              if (directorySearchQuery.trim()) {
                const q = directorySearchQuery.toLowerCase();
                return (
                  p.name?.toLowerCase().includes(q) ||
                  p.phone?.includes(q) ||
                  p.city?.toLowerCase().includes(q) ||
                  (p.categories || []).some(c => c.toLowerCase().includes(q))
                );
              }
              return true;
            }).length === 0 && (
              <div className="col-span-full py-12 text-center">
                 <Users className="mx-auto text-gray-100 mb-4 animate-bounce" size={48} />
                 <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Match Found</p>
                 <p className="text-xs text-gray-400 mt-2">Try adjusting your query or status selection.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={ratingBookingId !== null} onClose={() => setRatingBookingId(null)} title="Quality Control & Feedback Rating">
        <div className="space-y-6 pt-4 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 mb-2">
                <CheckCircle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 leading-none">Complete Booking Lead</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-2">Rate assigned technician service</p>
            </div>

            <div className="flex justify-center gap-3 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  className={`p-2 transition-transform hover:scale-110 active:scale-95 ${star <= selectedRating ? 'text-yellow-400' : 'text-gray-200'}`}
                >
                  <Star size={36} className={star <= selectedRating ? 'fill-current' : ''} />
                </button>
              ))}
            </div>

            <button
               onClick={handleCompleteBookingAndRate}
               disabled={isSubmittingRating}
               className="w-full bg-indigo-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md flex items-center justify-center gap-2"
            >
               {isSubmittingRating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Completion & Post Rating"}
            </button>
        </div>
      </Modal>
    </div>
  );
};


const StatCard = ({ title, value, icon, color, bg }: { title: string, value: string, icon: React.ReactNode, color: string, bg: string }) => (
  <div className="bg-white p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
    <div className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl ${bg} ${color} shadow-inner shrink-0 inline-flex`}>
      {/* Clone the icon to make it smaller on mobile if possible, or just let CSS scale it, but since it's ReactNode, we wrap it in a div that scales down */}
      <div className="transform scale-75 sm:scale-100 origin-center flex items-center justify-center">
        {icon}
      </div>
    </div>
    <div className="min-w-0 w-full mt-1 sm:mt-0">
      <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1 truncate">{title}</p>
      <h3 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tighter truncate">{value}</h3>
    </div>
  </div>
);
