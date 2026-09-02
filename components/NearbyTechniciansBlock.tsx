import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Partner } from '../types';
import { PhoneCall, CheckCircle, XCircle, MapPin, Star, MessageCircle, Loader2, CheckSquare, Square, Phone, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useStore } from '../hooks/useStore';

interface NearbyTechniciansBlockProps {
  customerLat?: number | null;
  customerLng?: number | null;
  customerCity: string;
  categoryName: string;
  bookingId: string;
}

const calculateDistance = (lat1?: number | null, lon1?: number | null, lat2?: number | null, lon2?: number | null): number => {
  console.log(`[Diagnostic - CustomerPanel] calculateDistance inputs: Customer(${lat1}, ${lon1}), Partner(${lat2}, ${lon2})`);
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    console.warn(`[Diagnostic - CustomerPanel] calculateDistance aborted due to missing/null coordinates.`);
    return 9999;
  }
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  
  if (isNaN(d) || d === null) {
    console.error(`[Diagnostic - CustomerPanel] calculateDistance result is NaN/null. Calculated d = ${d}`);
  } else {
    console.log(`[Diagnostic - CustomerPanel] calculateDistance output: ${d} km`);
  }
  
  return d;
}

const formatDistance = (distKm: number): string => {
  if (distKm < 0.01) {
    return "< 10 m away";
  }
  if (distKm < 1) {
    const meters = Math.round(distKm * 1000);
    return `${meters} m away`;
  }
  return `${distKm.toFixed(1)} km away`;
}

export const NearbyTechniciansBlock: React.FC<NearbyTechniciansBlockProps> = ({ customerLat, customerLng, customerCity, categoryName, bookingId }) => {
  const { partners, bookings, addCallLog } = useStore();
  const [calledTechnician, setCalledTechnician] = useState<Partner | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [technicianTalked, setTechnicianTalked] = useState<boolean>(false);
  const [technicianConfirmed, setTechnicianConfirmed] = useState<boolean>(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  // Find booking details for the log
  const booking = useMemo(() => bookings.find(b => b.id === bookingId), [bookings, bookingId]);

  // Filter partners within 10km and matching category
  const nearbyPartners = useMemo(() => {
    return partners.filter(p => {
      // Must be an approved partner available for work
      if (p.status === 'blocked' || p.status === 'pending') return false; 
      
      // Match category
      if (!p.categories?.includes(categoryName)) return false;

      // Distance matching (if lat/lng is available)
      const dist = calculateDistance(customerLat, customerLng, p.lat, p.lng);
      
      // If customer lacks lat/lng, fallback to city matching, else strict 10km
      if (customerLat && customerLng) {
        return dist <= 10;
      } else {
        // Fallback to city
        return p.city?.toLowerCase() === customerCity?.toLowerCase();
      }
    }).map(p => ({
      ...p,
      distance: calculateDistance(customerLat, customerLng, p.lat, p.lng)
    })).sort((a, b) => (a as any).distance - (b as any).distance);
  }, [partners, customerLat, customerLng, categoryName, customerCity]);

  const recordCallLog = (tech: Partner, type: 'call' | 'whatsapp') => {
    addCallLog({
      id: crypto.randomUUID(),
      partnerId: tech.id,
      partnerName: tech.name,
      customerName: booking?.customerName || 'Customer',
      customerPhone: booking?.contactNumber || 'Unknown',
      categoryName: categoryName,
      timestamp: new Date().toISOString(),
      type
    });
  };

  const handleCall = (tech: Partner) => {
    setCalledTechnician(tech);
    setTechnicianTalked(false);
    setTechnicianConfirmed(false);
    setShowDialog(true);
    recordCallLog(tech, 'call');
    // Actually trigger phone dialer
    if (tech.phone) {
      window.location.href = `tel:${tech.phone}`;
    }
  };
  
  const handleWhatsApp = (tech: Partner) => {
    setCalledTechnician(tech);
    setTechnicianTalked(false);
    setTechnicianConfirmed(false);
    setShowDialog(true);
    recordCallLog(tech, 'whatsapp');
    if (tech.phone) {
      const formatted = tech.phone.replace(/\D/g, '');
      window.open(`https://wa.me/91${formatted}?text=Hi,%20I%20have%20booked%20a%20service%20for%20${encodeURIComponent(categoryName)}%20via%20Sofiyan%20Home%20Services.%20Are%20you%20available?`, '_blank');
    }
  };

  const handleConfirmAssignment = useCallback(async () => {
    if (!calledTechnician || !technicianTalked || !technicianConfirmed) return;
    
    setIsAssigning(true);
    try {
       // Format booking IDs to handle 4-digit codes
       const ids = bookingId.split(',').map(id => {
           const queryId = id.trim();
           if (queryId.length === 4) {
               return `b0000000-0000-4000-8000-00000000${queryId}`;
           }
           return queryId;
       });

       // Update booking status in supabase
       const { error } = await supabase.from('bookings').update({
         assigned_partner_id: calledTechnician.id,
         assigned_partner_name: calledTechnician.name,
         assigned_partner_phone: calledTechnician.phone,
         status: 'accepted'
       }).in('id', ids);
       
       if (error) throw error;
       
       // Force a refresh of the bookings in the global store to sync instantly
       useStore.getState().fetchBookings();
       
       // Update partner status to busy so they don't get double booked
       await supabase.from('primary_partners').update({ status: 'busy' }).eq('id', calledTechnician.id);
       useStore.getState().fetchPartners();
       
       setAssignmentSuccess(true);
    } catch (err) {
       console.error("Assignment error:", err);
       alert("Failed to assign technician. Please try again.");
    } finally {
       setIsAssigning(false);
    }
  }, [calledTechnician, technicianTalked, technicianConfirmed, bookingId]);

  // Auto-assign when both checkboxes are checked
  useEffect(() => {
    let isMounted = true;
    if (technicianTalked && technicianConfirmed && calledTechnician && !isAssigning && !assignmentSuccess) {
      handleConfirmAssignment().then(() => {
        if (isMounted) {
          setShowDialog(false);
        }
      });
    }
    return () => { isMounted = false; };
  }, [technicianTalked, technicianConfirmed, calledTechnician, isAssigning, assignmentSuccess, handleConfirmAssignment]);

  if (assignmentSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-8 max-w-2xl mx-auto w-full text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-green-900 mb-2">Technician Assigned!</h3>
        <p className="text-green-700 font-medium">
          {calledTechnician?.name} will be arriving for your service soon. You can track this in your bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 max-w-4xl mx-auto w-full text-left">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
         <div className="bg-indigo-50 border-b border-indigo-100 p-4 sm:px-6">
            <h3 className="text-lg font-black text-indigo-950 flex items-center gap-2">
              <MapPin className="text-indigo-600 w-5 h-5" />
              Available Technicians Nearby
            </h3>
            <p className="text-sm text-indigo-700 font-medium mt-1">
              We found {nearbyPartners.length} technician(s) within 10km for {categoryName}. Call them directly to assign instantly!
            </p>
         </div>
         <div className="p-4 sm:p-6">
            {nearbyPartners.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center justify-center">
                 <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 border border-red-100">
                    <AlertCircle className="w-8 h-8" />
                 </div>
                 <h4 className="text-lg font-black text-gray-900 mb-2">No Technician Found Nearby</h4>
                 <p className="text-gray-500 font-medium mb-6 max-w-sm mx-auto">Currently, there are no technicians available within 10km of your location. Please contact our Customer Care for immediate assistance.</p>
                 
                 <a 
                   href="tel:8115983887"
                   className="flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-95"
                 >
                   <Phone className="w-5 h-5" /> Call Customer Care
                 </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {nearbyPartners.map((tech: any) => (
                   <div key={tech.id} className="border border-gray-100 bg-gray-50 rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex gap-3 items-center">
                         <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600 flex-shrink-0 overflow-hidden border border-indigo-200">
                           {tech.id_proof_url ? (
                              <img src={tech.id_proof_url} alt={tech.name} className="w-full h-full object-cover" />
                           ) : (
                              tech.name.charAt(0).toUpperCase()
                           )}
                         </div>
                         <div>
                           <h4 className="font-bold text-gray-900 leading-tight">{tech.name}</h4>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center text-yellow-500 text-xs font-black bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200">
                                 <Star className="w-3 h-3 fill-current mr-1" /> {(tech.rating ? Number(tech.rating).toFixed(1) : '4.5')} <span className="text-gray-500 ml-1 text-[10px]">({tech.review_count || 0})</span>
                              </span>
                              <span className="text-xs font-black flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md shadow-sm">
                                 <MapPin className="w-3 h-3" /> 
                                 {tech.distance < 9000 ? formatDistance(tech.distance) : (tech.city || 'Local')}
                              </span>
                           </div>
                         </div>
                      </div>
                      
                      {tech.address && (
                        <p className="text-xs text-gray-500 line-clamp-1">{tech.address}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-gray-200">
                         <button onClick={() => handleCall(tech as Partner)} className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">
                           <PhoneCall className="w-4 h-4" /> Call
                         </button>
                         <button onClick={() => handleWhatsApp(tech as Partner)} className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#20b858] transition-colors">
                           <MessageCircle className="w-4 h-4" /> WhatsApp
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
            )}
         </div>
      </div>

      {/* Confirmation Dialog Overlay */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                     <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-lg font-black text-gray-900 leading-tight">Confirmation</h3>
                     <p className="text-xs text-gray-500 font-medium">Assigning to {calledTechnician?.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowDialog(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
             </div>
             
             <p className="text-sm text-gray-600 mb-6">
                Please check the boxes below after returning from your call. The booking will be assigned automatically.
             </p>
             
             <div className="space-y-3 mb-8">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${technicianTalked ? 'bg-indigo-50 border-indigo-600 text-indigo-900' : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'}`}>
                   <input type="checkbox" className="sr-only" checked={technicianTalked} onChange={(e) => setTechnicianTalked(e.target.checked)} />
                   {technicianTalked ? <CheckSquare className="w-6 h-6 text-indigo-600" /> : <Square className="w-6 h-6 text-gray-400" />}
                   <span className="font-bold text-sm">Technician talked</span>
                </label>
                
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${technicianConfirmed ? 'bg-indigo-50 border-indigo-600 text-indigo-900' : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'}`}>
                   <input type="checkbox" className="sr-only" checked={technicianConfirmed} onChange={(e) => setTechnicianConfirmed(e.target.checked)} disabled={!technicianTalked} />
                   {technicianConfirmed ? <CheckSquare className="w-6 h-6 text-indigo-600" /> : <Square className="w-6 h-6 text-gray-400" />}
                   <span className="font-bold text-sm">Technician confirmed visit</span>
                </label>
             </div>
             
             {isAssigning && (
               <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold bg-indigo-50 py-3 rounded-xl border border-indigo-100">
                 <Loader2 className="w-5 h-5 animate-spin" /> Assigning technician...
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};
