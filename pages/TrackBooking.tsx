import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Search, Package, Clock, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react';
import { Booking } from '../types';

export const TrackBooking: React.FC = () => {
  const location = useLocation();
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If navigated with state.bookingId, auto-fetch
    if (location.state && location.state.bookingId) {
      setBookingId(location.state.bookingId);
      handleSearch(location.state.bookingId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleSearch = async (searchId: string = bookingId) => {
    if (!searchId) return;
    setLoading(true);
    setError('');
    setBooking(null);

    try {
      let queryId = searchId.trim();
      if (queryId.length === 4) {
          queryId = `b0000000-0000-4000-8000-00000000${queryId}`;
      }

      const { data, error: sbError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', queryId)
        .single();
      
      if (sbError) throw sbError;
      if (!data) throw new Error('Booking not found');
      
      setBooking(data);
    } catch (err: any) {
      console.error(err);
      if (err.code === '22P02') {
         setError('Invalid Booking ID format. Please check your ID and try again.');
      } else {
         setError('Booking not found. Please verify the ID and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { icon: <Clock className="text-amber-500 w-8 h-8" />, text: 'Pending Confirmation', color: 'bg-amber-100', progress: 25 };
      case 'forwarded': return { icon: <Truck className="text-blue-500 w-8 h-8" />, text: 'Assigned to Partner', color: 'bg-blue-100', progress: 50 };
      case 'accepted': return { icon: <Package className="text-indigo-500 w-8 h-8" />, text: 'Partner En Route', color: 'bg-indigo-100', progress: 65 };
      case 'in_progress': return { icon: <Package className="text-indigo-500 w-8 h-8" />, text: 'Job In Progress', color: 'bg-indigo-100', progress: 85 };
      case 'completed': return { icon: <CheckCircle className="text-green-500 w-8 h-8" />, text: 'Service Completed', color: 'bg-green-100', progress: 100 };
      case 'cancelled': return { icon: <XCircle className="text-red-500 w-8 h-8" />, text: 'Cancelled', color: 'bg-red-100', progress: 100 };
      default: return { icon: <AlertCircle className="text-gray-500 w-8 h-8" />, text: 'Unknown Status', color: 'bg-gray-100', progress: 0 };
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fadeIn">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-indigo-950 uppercase tracking-tighter mb-3">Track Your Booking</h1>
        <p className="text-sm text-gray-500 font-medium">Enter your Booking ID to check real-time progress.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-indigo-50 mb-8">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="e.g. 1234"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-sm md:text-base font-medium transition-all"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !bookingId.trim()}
            className="bg-indigo-950 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider disabled:opacity-50 hover:bg-black transition-all shadow-lg"
          >
            {loading ? 'Searching...' : 'Track Now'}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm font-bold mt-4 text-center">{error}</p>}
      </div>

      {booking && (
        <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-indigo-50 animate-slideUp">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8 pb-8 border-b border-gray-100">
            <div>
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Booking ID</p>
              <p className="text-lg font-bold text-gray-900 break-all">
                {booking.id.startsWith('b0000000-0000-4000-8000-00000000') ? booking.id.substring(32) : booking.id}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Scheduled Date</p>
              <p className="text-base font-bold text-gray-900">{booking.date} at {booking.time}</p>
            </div>
          </div>

          <div className="mb-10 relative">
            <div className="flex items-center gap-6 relative z-10">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getStatusInfo(booking.status).color}`}>
                {getStatusInfo(booking.status).icon}
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Current Status</p>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{getStatusInfo(booking.status).text}</h3>
              </div>
            </div>
            {/* Progress bar visual */}
            <div className="w-full bg-gray-100 h-2 rounded-full mt-8 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${booking.status?.toLowerCase() === 'cancelled' ? 'bg-red-500' : 'bg-indigo-600'}`} 
                  style={{ width: `${getStatusInfo(booking.status).progress}%` }}
                ></div>
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Booked</span>
              <span>Assigned</span>
              <span>En Route</span>
              <span>Completed</span>
            </div>
          </div>

          {booking.otp && !booking.otpVerified && (booking.status === 'accepted' || booking.status === 'Forwarded' || booking.status === 'pending') && (
            <div className="mb-8 bg-indigo-950 p-6 rounded-[1.5rem] text-center shadow-lg border border-indigo-900">
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Service Start OTP</p>
              <div className="inline-block bg-white/10 px-8 py-3 rounded-xl border border-indigo-400/30">
                 <p className="text-3xl font-black text-white tracking-[0.2em]">{booking.otp}</p>
              </div>
              <p className="text-xs text-indigo-300 mt-4 font-medium">Please share this 4-digit PIN with your partner to start the service.</p>
            </div>
          )}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h4 className="font-black text-gray-900 uppercase tracking-wide mb-4">Service Details</h4>
            {booking.cartItems && booking.cartItems.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
                <div className="flex-1 pr-4">
                  <p className="font-bold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="font-black text-indigo-900">₹{item.price * item.quantity}</div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 mt-2">
              <p className="font-black text-gray-900 uppercase">Total Amount</p>
              <p className="text-xl font-black text-indigo-600">₹{booking.price}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
