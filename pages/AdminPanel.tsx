import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { ADMIN_PASSWORD } from '../constants';
import { Booking } from '../types';
import { Modal } from '../components/Modal';
import { 
  Lock, Users, Calendar, DollarSign, Activity, Clock, Phone,
  Search, Send, MapPin, CheckCircle, FileSpreadsheet, Plus, MessageCircle, FileText
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { BlogManager } from '../components/BlogManager';
import { PartnerManager } from '../components/PartnerManager';

export const AdminPanel: React.FC = () => {
  const { bookings, updateBooking, partners } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [mainTab, setMainTab] = useState<'Dashboard' | 'BlogManager' | 'PartnerManagement'>('Dashboard');
  
  const [rescheduleData, setRescheduleData] = useState<{ booking: Booking | null, date: string, time: string }>({ 
    booking: null, date: '', time: '' 
  });

  const [dispatchBooking, setDispatchBooking] = useState<Booking | null>(null);
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
  const [partnerSearchResults, setPartnerSearchResults] = useState<any[]>([]);
  const [isSearchingPartners, setIsSearchingPartners] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [currentAdminTab, setCurrentAdminTab] = useState<'Pending' | 'Forwarded'>('Pending');

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
      const q = partnerSearchQuery.trim();
      let res;
      if (q) {
        res = await supabase.from('secondary_partners').select('*').or(`pincode.ilike.%${q}%,address.ilike.%${q}%,name.ilike.%${q}%`);
      } else if (dispatchBooking) {
        res = await supabase.from('secondary_partners').select('*').eq('pincode', dispatchBooking.pinCode);
      } else {
        res = await supabase.from('secondary_partners').select('*');
      }
      setPartnerSearchResults(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingPartners(false);
    }
  }, [partnerSearchQuery, dispatchBooking]);

  useEffect(() => {
    if (dispatchBooking) {
      setPartnerSearchQuery(dispatchBooking.pinCode);
      handlePartnerSearch();
    }
  }, [dispatchBooking, handlePartnerSearch]);

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalIncome = completedBookings.reduce((acc, curr) => acc + curr.price, 0);
  const totalRevenue = completedBookings.reduce((acc, curr) => acc + (curr.price * 0.25), 0);
  
  const pendingJobs = bookings.filter(b => b.status === 'pending').length;
  const assignedJobs = bookings.filter(b => b.status === 'Forwarded' || b.status === 'accepted').length;
  const completedJobs = completedBookings.length;

  const displayedBookings = bookings.filter(b => {
    if (currentAdminTab === 'Pending') return b.status === 'pending';
    if (currentAdminTab === 'Forwarded') return b.status === 'Forwarded' || b.status === 'accepted' || b.status === 'completed';
    return false;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border-t-4 border-indigo-900 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="text-indigo-600" size={32} />
            </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Founder Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Access Key..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center"
            />
            <button className="w-full bg-indigo-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-indigo-100">
              Unlock Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">FOUNDER DASHBOARD</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Operational Control Center</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition">
                <FileSpreadsheet className="inline mr-2" size={14} /> Export Data
            </button>
        </div>
      </div>

      <div className="flex space-x-1 mb-10 bg-gray-100 p-1 rounded-2xl w-fit">
        <button onClick={() => setMainTab('Dashboard')} className={`py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${mainTab === 'Dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Operational</button>
        <button onClick={() => setMainTab('BlogManager')} className={`py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${mainTab === 'BlogManager' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Marketing</button>
        <button onClick={() => setMainTab('PartnerManagement')} className={`py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${mainTab === 'PartnerManagement' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Supply</button>
      </div>

      {mainTab === 'BlogManager' && <BlogManager />}
      {mainTab === 'PartnerManagement' && <PartnerManager />}

      {mainTab === 'Dashboard' && (
        <div className="space-y-10">
          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
              title="Total Income" 
              value={`₹${totalIncome.toFixed(0)}`} 
              icon={<FileText size={24} />} 
              color="text-blue-600" 
              bg="bg-blue-50"
            />
            <StatCard 
              title="Net Revenue" 
              value={`₹${totalRevenue.toFixed(0)}`} 
              icon={<DollarSign size={24} />} 
              color="text-emerald-600" 
              bg="bg-emerald-50"
            />
            <StatCard 
              title="Active Partners" 
              value={partners.filter(p => p.status === 'available').length.toString()} 
              icon={<Users size={24} />} 
              color="text-indigo-600" 
              bg="bg-indigo-50"
            />
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
            <div className="px-8 py-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900">Lead Registry</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Incoming Service Traffic</p>
              </div>
              
              <div className="flex bg-white rounded-2xl p-1 border border-gray-200">
                <button 
                    onClick={() => setCurrentAdminTab('Pending')} 
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentAdminTab === 'Pending' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    New Leads ({pendingJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Forwarded')} 
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentAdminTab === 'Forwarded' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    Dispatched
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
                         <div className="min-w-0">
                           <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">City</p>
                           <p className="text-[11px] font-black text-gray-900 truncate">{booking.area || booking.city}</p>
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
                    </div>

                    {/* Forward Section - Redesigned Partner Details */}
                    {(booking.assignedPartnerName || booking.status === 'Forwarded' || booking.status === 'accepted') && (
                      <div className="p-3.5 rounded-2xl bg-indigo-600 text-white shadow-md">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2.5">
                             <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/20">
                               <Users size={16} />
                             </div>
                             <div>
                               <p className="text-[7px] font-black text-indigo-200 uppercase tracking-widest">Partner</p>
                               <h5 className="text-[13px] font-black tracking-tight leading-none">{booking.assignedPartnerName}</h5>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[7px] font-black text-indigo-300 uppercase tracking-widest">Cat.</p>
                             <p className="text-[10px] font-black text-white">{booking.subServiceName}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                           <a 
                             href={`tel:${booking.assignedPartnerPhone}`}
                             className="flex-1 h-9 bg-white text-indigo-900 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-all"
                           >
                             <Phone size={12} /> Call 
                           </a>
                           <a 
                             href={`https://wa.me/91${booking.assignedPartnerPhone}?text=${encodeURIComponent(`Job for ${booking.customerName}...`)}`}
                             target="_blank"
                             rel="noreferrer"
                             className="flex-1 h-9 bg-emerald-500 text-white rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all"
                           >
                             <MessageCircle size={12} /> WhatsApp
                           </a>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between gap-2 pt-1">
                       {booking.status === 'pending' && (
                         <button 
                           onClick={() => setDispatchBooking(booking)} 
                           className="flex-1 bg-indigo-900 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-md flex items-center justify-center gap-2"
                         >
                           <Send size={12} /> Partner Assignment
                         </button>
                       )}
                       {booking.status === 'completed' && (
                         <div className="flex-1 bg-emerald-50 text-emerald-700 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border border-emerald-100 flex items-center justify-center gap-2">
                            <CheckCircle size={12} /> Done
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

      <Modal isOpen={!!dispatchBooking} onClose={() => { setDispatchBooking(null); setPartnerSearchResults([]); setHasSearched(false); }} title="Partner Acquisition">
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
                    <div key={partner.id} className="p-5 border border-gray-100 rounded-3xl bg-white hover:bg-indigo-50/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {partner.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-black text-gray-900 tracking-tight">{partner.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">{partner.city} | {partner.pincode}</p>
                            </div>
                        </div>
                        <button 
                            onClick={async () => {
                                const waText = `✨ *SOFIYAN HOME SERVICE - JOB ALERT* ✨\n\nHello *${partner.name}*, you have been chosen for a new job!\n\n📍 *Customer:* ${dispatchBooking?.customerName}\n🛠️ *Service:* ${dispatchBooking?.subServiceName}\n🏠 *Location:* ${dispatchBooking?.address}, ${dispatchBooking?.city} (${dispatchBooking?.pinCode})\nMap Link: ${dispatchBooking?.location_link ? dispatchBooking.location_link : 'N/A'}\n\n💵 *Pay:* ₹${dispatchBooking?.price}\n\n🚀 *Contact customer now!*`;
                                window.open(`https://wa.me/91${partner.phone}?text=${encodeURIComponent(waText)}`, '_blank');
                                if (dispatchBooking) {
                                  updateBooking({ 
                                    ...dispatchBooking, 
                                    status: 'Forwarded', 
                                    assignedPartnerName: partner.name, 
                                    assignedPartnerPhone: partner.phone,
                                    assignedPartnerArea: partner.city || partner.pincode // Using city/pincode as area
                                  });
                                }
                                setDispatchBooking(null);
                            }}
                            className="w-full md:w-auto bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >Assign Now</button>
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
    </div>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <Activity className={className} size={size} />
);

const StatCard = ({ title, value, icon, color, bg }: { title: string, value: string, icon: React.ReactNode, color: string, bg: string }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
    <div className={`p-4 rounded-2xl ${bg} ${color} shadow-inner`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{value}</h3>
    </div>
  </div>
);
