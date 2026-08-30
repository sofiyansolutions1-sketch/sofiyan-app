const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

// 1. Make cart persistent
content = content.replace(
  /const \[cart, setCart\] = useState<\s*\{name: string, price: number, qty\?: number\}\s*\[\]>\(\[\]\);/,
  `const [cart, setCart] = useState<{name: string, price: number, qty?: number}[]>(() => {
    try {
      const saved = localStorage.getItem('customer_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('customer_cart', JSON.stringify(cart));
  }, [cart]);`
);

// 2. Make formData persistent
content = content.replace(
  /const \[formData, setFormData\] = useState\(\{[\s\S]*?lat: null as number \| null,\n\s*lng: null as number \| null\n\s*\}\);/,
  `const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('customer_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          locationLink: '',
          date: '',
          time: '',
          lat: null as number | null,
          lng: null as number | null
        };
      } catch (e) {}
    }
    return {
      name: '',
      contact: localStorage.getItem('customerPhone') || '',
      address: '',
      area: '',
      locationLink: '',
      city: localStorage.getItem('preferredCity') || 'Bangalore',
      pincode: '',
      description: '',
      date: '',
      time: '',
      referralCode: '',
      lat: null as number | null,
      lng: null as number | null
    };
  });

  useEffect(() => {
    const { name, contact, address, area, pincode, city, referralCode } = formData;
    localStorage.setItem('customer_profile', JSON.stringify({ name, contact, address, area, pincode, city, referralCode }));
    if (contact) {
        localStorage.setItem('customerPhone', contact);
    }
  }, [formData]);`
);

// 3. Import icons (User, ShoppingCart, X, CheckCircle, etc)
content = content.replace(
  /import \{ (.*?) \} from 'lucide-react';/,
  "import { $1, ShoppingCart, User as UserIcon, Calendar, Info } from 'lucide-react';"
);

// 4. Add Profile State and Modal component
const profileModalCode = `
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const myBookings = bookings.filter(b => b.contactNumber === (formData.contact || localStorage.getItem('customerPhone')));

  const handleCancelBooking = async (b: any) => {
    if (confirm('Are you sure you want to cancel this booking? Cancellation charges may apply as per terms.')) {
        await updateBooking({ ...b, status: 'cancelled' });
    }
  };

  const renderProfileModal = () => {
    if (!isProfileOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-gray-50 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-scaleIn">
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10 shrink-0">
             <h2 className="text-xl sm:text-2xl font-black text-indigo-950 uppercase tracking-tighter">My Profile</h2>
             <button onClick={() => setIsProfileOpen(false)} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
               <X size={20} className="text-gray-600" />
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-6">
             {/* Personal Details */}
             <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4">Personal Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                     <label className="text-[10px] uppercase font-bold text-gray-400">Name</label>
                     <input type="text" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 font-bold text-gray-900 mt-1 outline-none" placeholder="Your Name" />
                   </div>
                   <div>
                     <label className="text-[10px] uppercase font-bold text-gray-400">Phone</label>
                     <input type="text" value={formData.contact} onChange={e => setFormData(p => ({...p, contact: e.target.value}))} className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 font-bold text-gray-900 mt-1 outline-none" placeholder="Your Phone" />
                   </div>
                   <div className="sm:col-span-2">
                     <label className="text-[10px] uppercase font-bold text-gray-400">Address</label>
                     <input type="text" value={formData.address} onChange={e => setFormData(p => ({...p, address: e.target.value}))} className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 font-bold text-gray-900 mt-1 outline-none" placeholder="Your Address" />
                   </div>
                </div>
             </div>

             {/* Referral Program */}
             <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                 <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
                 <h3 className="text-sm font-black text-indigo-200 uppercase tracking-widest mb-2 relative z-10">Refer & Earn</h3>
                 <p className="text-white text-sm mb-4 relative z-10 leading-relaxed font-medium">Share your referral code with friends and get ₹100 off on your next booking!</p>
                 <div className="bg-indigo-950/50 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-3 flex justify-between items-center relative z-10">
                    <span className="text-xl font-black tracking-widest text-white">REF-{formData.contact ? formData.contact.slice(-4) : 'NEW'}</span>
                    <button className="text-xs font-bold bg-white text-indigo-600 px-3 py-1.5 rounded-lg shadow-sm">Copy</button>
                 </div>
             </div>

             {/* Booking History */}
             <div>
                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4">Your Bookings</h3>
                {myBookings.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 border-dashed">
                     <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                     <p className="text-sm font-bold text-gray-500">No bookings found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                     {myBookings.map(b => (
                       <div key={b.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                          {b.status === 'pending' || b.status === 'accepted' || b.status === 'Forwarded' ? (
                              <div className="absolute top-0 right-0 w-2 h-full bg-yellow-400"></div>
                          ) : b.status === 'in_progress' ? (
                              <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
                          ) : b.status === 'completed' ? (
                              <div className="absolute top-0 right-0 w-2 h-full bg-green-500"></div>
                          ) : (
                              <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
                          )}
                          <div className="flex justify-between items-start mb-3">
                             <div>
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {b.id.split('-')[0]}</p>
                               <h4 className="font-bold text-gray-900 mt-1">{b.serviceCategory}</h4>
                             </div>
                             <span className="text-xs font-black px-2 py-1 bg-gray-100 rounded-md uppercase tracking-wider text-gray-600">{b.status}</span>
                          </div>
                          
                          <p className="text-sm text-gray-500 font-medium mb-1">Date: <span className="text-gray-800">{b.date} {b.time}</span></p>
                          <p className="text-sm text-gray-500 font-medium mb-4">Total: <span className="text-green-600 font-bold">₹{b.price}</span></p>

                          {(b.status === 'pending' || b.status === 'accepted' || b.status === 'Forwarded') && (
                            <div className="flex gap-3">
                              {b.otp && (
                                <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-xl p-2 text-center">
                                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Start OTP</p>
                                  <p className="text-lg font-black text-indigo-900 tracking-widest">{b.otp}</p>
                                </div>
                              )}
                              <button onClick={() => handleCancelBooking(b)} className="flex-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors h-auto py-2">
                                Cancel Lead
                              </button>
                            </div>
                          )}
                       </div>
                     ))}
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    );
  };
`;

content = content.replace(
  /const renderPaymentModal = \(\) => \{/,
  `${profileModalCode}\n  const renderPaymentModal = () => {`
);

// 5. Add Sticky Header to CustomerPanel main view
const headerBlock = `
      {/* Sticky Header Actions */}
      <div className="fixed top-20 right-4 sm:right-8 z-50 flex flex-col gap-3 pointer-events-none">
         <button onClick={() => setIsProfileOpen(true)} className="pointer-events-auto bg-white/90 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border border-gray-100 text-indigo-900 hover:scale-105 hover:bg-indigo-50 transition-all group">
            <UserIcon size={22} className="group-hover:text-indigo-600 transition-colors" />
         </button>
         <button onClick={() => { if(cart.length > 0) setBookingStep('details') }} className="pointer-events-auto bg-indigo-950 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-900/30 border border-indigo-800 text-white hover:scale-105 transition-all relative">
            <ShoppingCart size={20} />
            {cart.length > 0 && (
               <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md animate-bounce">
                 {cart.length}
               </div>
            )}
         </button>
      </div>

      {renderProfileModal()}
`;

content = content.replace(
  /(\{\/\* Mobile-Friendly Urban Company Style Hero Content \*\/)/,
  `${headerBlock}\n      $1`
);

fs.writeFileSync('pages/CustomerPanel.tsx', content);
