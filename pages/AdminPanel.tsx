import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { ADMIN_PASSWORD } from '../constants';
import { Booking, Partner } from '../types';
import { Modal } from '../components/Modal';
import { Lock, Users, Calendar, DollarSign, Activity, Clock, User, Edit2, Trash2, CalendarDays, Phone, Search, Send, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export const AdminPanel: React.FC = () => {
  const { bookings, updateBooking, partners, updatePartner } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Reschedule Modal State
  const [rescheduleData, setRescheduleData] = useState<{ booking: Booking | null, date: string, time: string }>({ 
    booking: null, date: '', time: '' 
  });

  // Partner Dispatch State
  const [dispatchBooking, setDispatchBooking] = useState<Booking | null>(null);
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
  const [partnerSearchResults, setPartnerSearchResults] = useState<any[]>([]);
  const [isSearchingPartners, setIsSearchingPartners] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Access Denied: Incorrect Password");
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;

    // 1. If a partner was assigned, free them up
    if (booking.assignedPartnerId) {
      const partner = partners.find(p => p.id === booking.assignedPartnerId);
      if (partner) {
        const updatedPartner: Partner = { ...partner, status: 'available' };
        updatePartner(updatedPartner);
      }
    }

    // 2. Update booking status
    const updatedBooking: Booking = { 
      ...booking, 
      status: 'cancelled',
      assignedPartnerId: undefined // Remove assignment
    };
    
    // Optimistic update to hide from list immediately
    updateBooking(updatedBooking);
    
    // Force refresh to ensure list is filtered correctly
    setTimeout(() => {
        window.location.reload(); 
    }, 500);
  };

  const openRescheduleModal = (booking: Booking) => {
    setRescheduleData({ booking, date: booking.date, time: booking.time });
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleData.booking) return;

    const updatedBooking: Booking = {
      ...rescheduleData.booking,
      date: rescheduleData.date,
      time: rescheduleData.time
    };

    updateBooking(updatedBooking);
    setRescheduleData({ booking: null, date: '', time: '' });
  };

  // Real Supabase Partner Search Logic
  const handlePartnerSearch = async () => {
    const query = partnerSearchQuery.trim();
    if (!query) {
        setPartnerSearchResults([]);
        setHasSearched(false);
        return;
    }

    setIsSearchingPartners(true);
    setHasSearched(true);
    setPartnerSearchResults([]);

    try {
        // Query Supabase: Search in 'pincode' OR 'address' OR 'city'
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .or(`pincode.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%`);

        if (error) throw error;
        setPartnerSearchResults(data || []);
    } catch (error) {
        console.error('Error searching partners:', error);
        alert('Failed to search partners. Please check connection.');
    } finally {
        setIsSearchingPartners(false);
    }
  };

  // Generate WhatsApp Message
  const getWhatsAppLink = (partner: any) => {
      // WhatsApp Message Template (Encoded for URL)
      const waMessage = encodeURIComponent(`📢 प्रिय पार्टनर,\nआपके nearby area से एक नई लीड आई है।\nतुरंत sofiyan.com पर जाकर लीड Accept करें और ग्राहक से संपर्क करें।\n⏰ ध्यान दें:\n5 मिनट के अंदर लीड Accept नहीं की गई तो यह किसी दूसरे पार्टनर को दे दी जाएगी。\n✔ Quality service mandatory\n💰 Service ke baad 25% commission immediate\n❌ Commission delay = Future leads STOP.`);
      return `https://wa.me/91${partner.phone}?text=${waMessage}`;
  };

  const renderPartnerCell = (booking: Booking) => {
    if (!booking.assignedPartnerId) {
      return <span className="text-gray-400 italic text-xs">Waiting for partner...</span>;
    }

    const partner = partners.find(p => p.id === booking.assignedPartnerId);
    if (!partner) {
      return <span className="text-red-400 text-xs">Partner not found</span>;
    }

    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-indigo-700 font-medium text-sm">
           <User size={14} /> {partner.name}
        </div>
        {partner.phone ? (
           <a 
             href={`tel:${partner.phone}`} 
             className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-white hover:bg-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-100 transition-all shadow-sm"
           >
             <Phone size={12} className="fill-current" /> Call Partner
           </a>
        ) : (
           <span className="text-xs text-gray-400">No contact info</span>
        )}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border-t-4 border-indigo-900">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-4 rounded-full">
              <Lock className="w-8 h-8 text-gray-800" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter secure key..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
            />
            <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-colors">
              Unlock Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Stats Calculation
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((acc, curr) => acc + (curr.price * 0.25), 0);
  
  const pendingJobs = bookings.filter(b => b.status === 'pending').length;
  const completedJobs = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Founder Dashboard</h1>
        <p className="text-gray-500">Overview of business performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Total Commission" 
          value={`₹${totalRevenue.toFixed(2)}`} 
          icon={<DollarSign className="text-green-600" />} 
          bg="bg-green-50"
        />
        <StatCard 
          title="Active Partners" 
          value={partners.length.toString()} 
          icon={<Users className="text-blue-600" />} 
          bg="bg-blue-50"
        />
        <StatCard 
          title="Pending Jobs" 
          value={pendingJobs.toString()} 
          icon={<Activity className="text-orange-600" />} 
          bg="bg-orange-50"
        />
        <StatCard 
          title="Completed Jobs" 
          value={completedJobs.toString()} 
          icon={<Calendar className="text-purple-600" />} 
          bg="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Lead Management Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Lead Management</h3>
            <span className="text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full">
              {bookings.length} Total Records
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Service Details</th>
                  <th className="px-6 py-3">Assigned To</th>
                  <th className="px-6 py-3">Schedule</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{booking.customerName}</div>
                      <div className="text-xs text-gray-500 mb-2">{booking.address}</div>
                      <a 
                        href={`tel:${booking.contactNumber}`} 
                        className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium hover:text-white hover:bg-green-600 bg-green-50 px-2.5 py-1.5 rounded-md border border-green-100 transition-all shadow-sm"
                      >
                         <Phone size={12} className="fill-current" /> Call Customer
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-indigo-600 font-medium">{booking.serviceCategory}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{booking.subServiceName}</div>
                      <div className="text-xs font-bold text-gray-700 mt-1">₹{booking.price}</div>
                    </td>
                    <td className="px-6 py-4">
                      {renderPartnerCell(booking)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1"><CalendarDays size={12}/> {booking.date}</div>
                      <div className="flex items-center gap-1 text-gray-500"><Clock size={12}/> {booking.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${booking.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'}`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => { setDispatchBooking(booking); setPartnerSearchQuery(''); setPartnerSearchResults([]); setHasSearched(false); }}
                            className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                            title="Assign Partner"
                          >
                             <Send size={16} />
                          </button>
                        )}
                        {booking.status !== 'completed' && (
                          <>
                            <button 
                              onClick={() => openRescheduleModal(booking)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Reschedule"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleCancelBooking(booking)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel Lead"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                   <tr>
                     <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No bookings yet</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Partners List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800">Partner Status</h3>
          </div>
           <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Current Status</th>
                  <th className="px-6 py-3 text-center">Completed Jobs</th>
                </tr>
              </thead>
              <tbody>
                {partners.map(partner => (
                  <tr key={partner.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{partner.name}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin size={10} className="text-red-400"/> {partner.city || 'City N/A'}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-gray-600 font-mono text-xs">{partner.phone || '-'}</div>
                        <div className="text-xs text-indigo-600 mt-1 font-medium">
                            {partner.categories ? (Array.isArray(partner.categories) ? partner.categories.join(', ') : partner.categories) : 'N/A'}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{partner.email}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${partner.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {partner.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">{partner.completedJobs}</td>
                  </tr>
                ))}
                 {partners.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No partners registered</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      <Modal 
        isOpen={!!rescheduleData.booking} 
        onClose={() => setRescheduleData({ booking: null, date: '', time: '' })}
        title="Reschedule Booking"
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-4">
            <p><strong>Customer:</strong> {rescheduleData.booking?.customerName}</p>
            <p><strong>Service:</strong> {rescheduleData.booking?.subServiceName}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">New Date</label>
            <input 
              type="date" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={rescheduleData.date}
              onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">New Time</label>
            <input 
              type="time" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={rescheduleData.time}
              onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
             <button 
               type="button"
               onClick={() => setRescheduleData({ booking: null, date: '', time: '' })}
               className="flex-1 px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg"
             >
               Cancel
             </button>
             <button 
               type="submit"
               className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md"
             >
               Update Schedule
             </button>
          </div>
        </form>
      </Modal>

      {/* Partner Dispatch Modal - Upgraded with Real DB Search */}
      <Modal 
        isOpen={!!dispatchBooking} 
        onClose={() => setDispatchBooking(null)}
        title="Dispatch Lead"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-800 mb-4 border border-gray-200">
             <p className="font-bold">{dispatchBooking?.serviceCategory} Request</p>
             <p className="text-xs text-gray-500 mt-1"><MapPin size={12} className="inline mr-1"/>{dispatchBooking?.address} ({dispatchBooking?.pinCode})</p>
          </div>

          <div className="pt-2 border-t border-gray-100">
             <h4 className="text-sm font-bold text-gray-700 mb-2">Find Partner (Real-time Database)</h4>
             <div className="flex space-x-2 mb-3">
                 <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Enter Area or Pincode" 
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                      value={partnerSearchQuery}
                      onChange={(e) => setPartnerSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePartnerSearch()}
                    />
                 </div>
                 <button 
                    onClick={handlePartnerSearch}
                    disabled={isSearchingPartners}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[50px]"
                 >
                    {isSearchingPartners ? <Loader2 className="animate-spin w-4 h-4"/> : 'Go'}
                 </button>
             </div>
             
             <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {isSearchingPartners && (
                    <div className="text-center py-4">
                        <Loader2 className="animate-spin w-6 h-6 text-indigo-500 mx-auto"/>
                        <p className="text-xs text-gray-400 mt-2">Searching database...</p>
                    </div>
                )}

                {!isSearchingPartners && !hasSearched && (
                   <p className="text-xs text-gray-400 text-center py-4">Enter location to find registered partners.</p>
                )}

                {!isSearchingPartners && hasSearched && partnerSearchResults.length === 0 && (
                   <p className="text-xs text-red-500 text-center py-4">No registered partners found in this area.</p>
                )}

                {!isSearchingPartners && partnerSearchResults.length > 0 && (
                   partnerSearchResults.map(partner => {
                     // Format categories for display
                     let cats = "Partner";
                     if(partner.categories) {
                        cats = Array.isArray(partner.categories) ? partner.categories.join(', ') : partner.categories;
                     }
                     
                     return (
                        <div key={partner.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-indigo-50 transition-colors animate-fadeIn">
                            <div>
                                <p className="text-sm font-bold text-gray-800">{partner.first_name} {partner.last_name || ''} <span className="text-xs font-normal text-indigo-600">({cats})</span></p>
                                <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                                    <MapPin size={10} className="text-red-400"/> 
                                    {partner.city ? partner.city + ', ' : ''}{partner.address ? (partner.address.length > 25 ? partner.address.substring(0, 25) + '...' : partner.address) : 'Location NA'} - {partner.pincode}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <a 
                                  href={`tel:${partner.phone}`} 
                                  className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition" 
                                  title="Call Partner"
                                >
                                    <Phone size={14} />
                                </a>
                                <a 
                                  href={getWhatsAppLink(partner)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition" 
                                  title="Send WhatsApp Alert"
                                >
                                    <Send size={14} />
                                </a>
                            </div>
                        </div>
                     );
                   })
                )}
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const StatCard = ({ title, value, icon, bg }: { title: string, value: string, icon: React.ReactNode, bg: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${bg} w-12 h-12 flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);