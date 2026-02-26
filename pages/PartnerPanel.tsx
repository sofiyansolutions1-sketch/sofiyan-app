import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { Partner, Booking } from '../types';
import { DB_DATA } from '../constants';
import { Modal } from '../components/Modal';
import { Briefcase, CheckCircle, MapPin, User, LogOut, Trash2, Upload, AlertCircle, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

export const PartnerPanel: React.FC = () => {
  const navigate = useNavigate();
  const { bookings, updateBooking, partners, addPartner, updatePartner } = useStore();
  
  // Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const submittingRef = useRef(false); 
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authData, setAuthData] = useState({ name: '', email: '', phone: '', password: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // App Logic State
  const [currentUser, setCurrentUser] = useState<Partner | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [leadToAccept, setLeadToAccept] = useState<Booking | null>(null);
  
  // Billing Modal State
  const [paymentModal, setPaymentModal] = useState<Booking | null>(null);
  const [extraWorks, setExtraWorks] = useState<{name: string, price: number}[]>([]);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  // Partner Registration Modal State
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gender: 'Male',
    experience: '',
    address: '',
    city: '',
    customCity: '',
    pincode: '',
    categories: [] as string[],
    subCategories: [] as string[]
  });

  const CATEGORY_LIST = ["Electrician", "Plumber", "Carpenters", "Cleaning & Pest Control", "Pooja", "Home Appliances"];
  const APPLIANCE_LIST = ["A.C. Service & Repair", "Air Cooler Repair", "Air Purifier", "Water Purifier (RO)", "Television", "Chimney Repair", "Geyser", "Washing Machine", "Refrigerator", "Mixer Grinder", "CCTV"];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        syncUserWithStore(session.user.email);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.email) {
        syncUserWithStore(session.user.email);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUserWithStore = async (email: string) => {
    try {
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .eq('email', email)
            .single();
        
        if (data) {
           const partner: Partner = {
               id: data.id,
               name: `${data.first_name} ${data.last_name}`,
               email: data.email,
               phone: data.phone,
               city: data.city,
               status: data.status,
               earnings: data.earnings || 0,
               completedJobs: data.completed_jobs || 0
           };
           setCurrentUser(partner);
        } else {
           setIsRegistrationOpen(true);
           setRegData(prev => ({ ...prev, email: email }));
        }
    } catch (err) {
        console.error("Error syncing profile:", err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return; 

    submittingRef.current = true;
    setIsSubmitting(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: authData.email,
          password: authData.password,
          options: {
            data: {
              phone: authData.phone,
              full_name: authData.name
            }
          }
        });

        if (error) throw error;

        if (data.session) {
          setRegData(prev => ({
            ...prev,
            email: authData.email,
            firstName: authData.name.split(' ')[0] || '',
            lastName: authData.name.split(' ').slice(1).join(' ') || '',
            phone: authData.phone
          }));
        } else {
          setAuthMessage("Account created. If you are not redirected, please check your email for confirmation.");
        }

      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authData.email,
          password: authData.password,
        });

        if (error) throw error;
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      const msg = error.message?.toLowerCase() || "";
      
      if (msg.includes("rate limit") || msg.includes("too many requests")) {
        setAuthError("System busy. Please wait a minute before trying again.");
      } else if (msg.includes("already registered") || msg.includes("user already exists")) {
        setAuthMode('signin');
        setAuthMessage("Account already exists. Please sign in with your password.");
        setAuthError(null);
      } else if (msg.includes("invalid login credentials") || msg.includes("invalid_grant")) {
        setAuthError("Incorrect email or password. Please check your credentials.");
      } else {
        setAuthError(error.message || "Authentication failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    navigate('/partner');
  };

  const handleCategoryChange = (category: string) => {
    setRegData(prev => {
      const isSelected = prev.categories.includes(category);
      let newCategories;
      if (isSelected) {
        newCategories = prev.categories.filter(c => c !== category);
        if (category === "Home Appliances") {
             return { ...prev, categories: newCategories, subCategories: [] };
        }
      } else {
        newCategories = [...prev.categories, category];
      }
      return { ...prev, categories: newCategories };
    });
  };

  const handleSubCategoryChange = (sub: string) => {
    setRegData(prev => {
        const isSelected = prev.subCategories.includes(sub);
        if (isSelected) {
            return { ...prev, subCategories: prev.subCategories.filter(s => s !== sub) };
        } else {
            return { ...prev, subCategories: [...prev.subCategories, sub] };
        }
    });
  };

  const submitPartnerRegistration = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!session?.user?.email) return;

      let finalCityValue = regData.city;
      
      // If 'Others' is selected, override it with the typed text
      if (finalCityValue === 'Others') {
          finalCityValue = regData.customCity.trim();
          // Basic validation to ensure they didn't leave the "Others" box blank
          if (!finalCityValue) {
              alert("Please type your city name in the box provided.");
              return; // Stop form submission
          }
      }

      setIsSubmitting(true);

      try {
        const { error } = await supabase
           .from('partners')
           .insert([
               { 
                   id: session.user.id,
                   first_name: regData.firstName, 
                   last_name: regData.lastName,
                   phone: regData.phone,
                   email: session.user.email,
                   gender: regData.gender,
                   categories: regData.categories, 
                   sub_categories: regData.subCategories, 
                   experience: regData.experience,
                   address: regData.address,
                   city: finalCityValue,
                   pincode: regData.pincode,
                   status: 'available',
                   earnings: 0,
                   completed_jobs: 0
               }
           ]);

        if (error) throw error;

        // Force sync after insertion
        await syncUserWithStore(session.user.email);
        
        setIsRegistrationOpen(false);
        setNotification("Registration Successful! Welcome to Sofiyan Home Service.");

      } catch (error: any) {
        console.error("Error saving partner:", error);
        alert("Registration failed: " + (error.message || "Unknown error"));
      } finally {
        setIsSubmitting(false);
      }
  };

  const handleAcceptLead = (booking: Booking) => {
    if (!currentUser) return;
    const hasActiveJob = bookings.some(b => b.assignedPartnerId === currentUser.id && b.status === 'accepted');
    if (currentUser.status === 'busy' || hasActiveJob) {
      alert("🚫 You have an ongoing job! Please complete your current task before accepting a new one.");
      return;
    }
    setLeadToAccept(booking);
  };

  const confirmLeadAcceptance = async () => {
    if (!leadToAccept || !currentUser) return;
    
    setIsSubmitting(true);
    
    try {
        const { error } = await supabase
             .from('bookings')
             .update({ 
                 status: 'accepted', 
                 assigned_partner_id: currentUser.id 
             })
             .eq('id', leadToAccept.id);

         if (error) throw error;

         // Optimistic UI updates
         const updatedBooking: Booking = { ...leadToAccept, status: 'accepted', assignedPartnerId: currentUser.id };
         const updatedPartner: Partner = { ...currentUser, status: 'busy' };
         
         setCurrentUser(updatedPartner);
         updateBooking(updatedBooking);
         updatePartner(updatedPartner);
         
         setNotification(`Lead accepted! Contact the customer now.`);
         setLeadToAccept(null);

    } catch (error) {
         console.error('Error accepting lead:', error);
         alert('Failed to accept lead. Someone else might have taken it.');
    } finally {
         setIsSubmitting(false);
    }
  };

  const handleCompleteService = (booking: Booking) => {
    setExtraWorks([]);
    setScreenshot(null);
    setPaymentModal(booking);
  };

  const processPayment = () => {
    if (!paymentModal || !currentUser) return;
    if (!screenshot) {
      alert("Please upload the payment screenshot to proceed.");
      return;
    }
    const extraTotal = extraWorks.reduce((acc, curr) => acc + curr.price, 0);
    const finalTotalPrice = paymentModal.price + extraTotal;
    const commission = finalTotalPrice * 0.25;
    
    const completedBooking: Booking = { 
      ...paymentModal, 
      price: finalTotalPrice,
      status: 'completed', 
      commissionPaid: true 
    };

    const updatedPartner: Partner = { 
      ...currentUser, 
      status: 'available',
      earnings: currentUser.earnings + (finalTotalPrice - commission),
      completedJobs: currentUser.completedJobs + 1
    };

    setCurrentUser(updatedPartner);
    updateBooking(completedBooking);
    updatePartner(updatedPartner);
    setPaymentModal(null);
    setNotification("Job Completed! Commission Submitted.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="bg-indigo-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="text-indigo-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Partner Portal</h2>
            <p className="text-gray-500">Join our network of professionals</p>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button 
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${authMode === 'signin' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
              onClick={() => { setAuthMode('signin'); setAuthError(null); setAuthMessage(null); }}
              disabled={isSubmitting}
            >
              Sign In
            </button>
            <button 
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${authMode === 'signup' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
              onClick={() => { setAuthMode('signup'); setAuthError(null); setAuthMessage(null); }}
              disabled={isSubmitting}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <>
                <input
                  placeholder="Full Name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={authData.name}
                  onChange={e => setAuthData({...authData, name: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
                <input
                  placeholder="Mobile Number"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={authData.phone}
                  onChange={e => setAuthData({...authData, phone: e.target.value})}
                  required
                  pattern="[0-9]{10}"
                  title="10 digit mobile number"
                  disabled={isSubmitting}
                />
              </>
            )}
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={authData.email}
              onChange={e => setAuthData({...authData, email: e.target.value})}
              required
              disabled={isSubmitting}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={authData.password}
              onChange={e => setAuthData({...authData, password: e.target.value})}
              required
              disabled={isSubmitting}
            />
            
            {authError && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 text-center animate-fadeIn">
                {authError}
              </div>
            )}
            {authMessage && (
              <div className="text-green-700 text-sm bg-green-50 p-3 rounded-lg border border-green-200 text-center font-medium animate-fadeIn">
                {authMessage}
              </div>
            )}

            <button 
              disabled={isSubmitting}
              className={`w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </span>
              ) : (
                authMode === 'signin' ? 'Access Dashboard' : 'Register Now'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!currentUser && !isRegistrationOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
         <div className="text-center">
             <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
             <p className="text-gray-500">Syncing profile...</p>
         </div>
      </div>
    );
  }

  const myActiveJob = currentUser ? bookings.find(b => b.status === 'accepted' && b.assignedPartnerId === currentUser.id) : null;
  
  // Filter leads by city as requested
  const availableLeads = bookings.filter(b => {
      const partnerCity = currentUser?.city || localStorage.getItem('loggedInPartnerCity');
      if (!partnerCity) return false;
      return b.status === 'pending' && b.city?.toLowerCase() === partnerCity.toLowerCase();
  });

  const { total: modalTotal, commission: modalCommission } = paymentModal ? { total: paymentModal.price + extraWorks.reduce((a,c)=>a+c.price,0), commission: (paymentModal.price + extraWorks.reduce((a,c)=>a+c.price,0)) * 0.25 } : { total: 0, commission: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {currentUser?.name}</h1>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            Status: 
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${currentUser?.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {currentUser?.status.toUpperCase()}
            </span>
          </p>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      {notification && (
        <Modal isOpen={!!notification} onClose={() => setNotification(null)} title="Notice">
          <div className="text-center py-6">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
             </div>
             <p className="text-lg font-semibold text-gray-800 mb-2">{notification}</p>
             <button onClick={() => setNotification(null)} className="mt-6 px-8 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">OK</button>
          </div>
        </Modal>
      )}

      {myActiveJob ? (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-8 shadow-inner">
          <h2 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
            <Briefcase /> Current Active Job
          </h2>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{myActiveJob.serviceCategory}</h3>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2 mb-4">
                   <p className="text-indigo-700 font-bold mb-1 text-sm uppercase tracking-wide">Work Order:</p>
                   {myActiveJob.cartItems ? (
                      <ul className="space-y-1">
                        {myActiveJob.cartItems.map((item, idx) => (
                           <li key={idx} className="flex justify-between text-sm text-gray-700">
                             <span>{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                           </li>
                        ))}
                      </ul>
                   ) : (
                      <p className="text-indigo-600 font-medium">{myActiveJob.subServiceName}</p>
                   )}
                </div>
                <div className="space-y-2 text-gray-600">
                   <p className="flex items-center gap-2"><User size={16}/> {myActiveJob.customerName}</p>
                   <p className="flex items-center gap-2"><MapPin size={16}/> {myActiveJob.address}, {myActiveJob.pinCode}</p>
                   <p className="flex items-center gap-2"><Clock size={16}/> {myActiveJob.date} at {myActiveJob.time}</p>
                </div>
              </div>
              <div className="flex flex-col justify-between items-end w-full md:w-auto">
                <div className="text-right w-full md:w-auto">
                   <p className="text-sm text-gray-500">Potential Earnings</p>
                   <p className="text-2xl font-bold text-green-600">₹{(myActiveJob.price * 0.75).toFixed(2)}</p>
                   <p className="text-xs text-gray-400">after commission</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full md:w-auto">
                  <a 
                    href={`tel:${myActiveJob.contactNumber}`} 
                    className="flex-1 bg-blue-100 text-blue-600 font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-200 transition border border-blue-200"
                  >
                    <i className="fas fa-phone-alt"></i> Call Customer
                  </a>
                  <button
                    onClick={() => handleCompleteService(myActiveJob)}
                    className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-green-700 transition-all flex justify-center items-center gap-2"
                  >
                    <CheckCircle size={20} /> Complete Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Available Leads</h2>
          {availableLeads.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No new leads available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableLeads.map(lead => (
                <div key={lead.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                     New Lead
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-2">
                          <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded uppercase">
                            {lead.city || 'City N/A'}
                          </span>
                          <span className="text-2xl font-bold text-green-600">₹{lead.price}</span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <Briefcase size={16} className="text-gray-400" />
                        {lead.cartItems ? lead.cartItems.map(i => i.name).join(', ') : lead.subServiceName}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">{lead.serviceCategory}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-6 border-t border-gray-50 pt-3">
                    <p className="flex items-center gap-2 font-medium">
                        <MapPin size={16} className="text-red-400" /> 
                        {lead.address} - {lead.pinCode}
                    </p>
                    <p className="flex items-center gap-2"><Clock size={14} className="text-indigo-400" /> {lead.date} | {lead.time}</p>
                  </div>
                  <button
                    onClick={() => handleAcceptLead(lead)}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Accept Lead
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isRegistrationOpen && (
          <div id="partner-reg-modal" className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center px-4 animate-fadeIn backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                   <h2 className="text-2xl font-bold text-gray-800">Complete Your Partner Profile 🛠️</h2>
                   <button onClick={() => { setIsRegistrationOpen(false); handleSignOut(); }} className="text-gray-400 hover:text-gray-600">
                     <span className="sr-only">Close</span>
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>

                <form onSubmit={submitPartnerRegistration} className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="First Name" 
                        required 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={regData.firstName}
                        onChange={(e) => setRegData({...regData, firstName: e.target.value})}
                      />
                      <input 
                        type="text" 
                        placeholder="Last Name" 
                        required 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={regData.lastName}
                        onChange={(e) => setRegData({...regData, lastName: e.target.value})}
                      />
                      <input 
                        type="tel" 
                        placeholder="Phone Number" 
                        readOnly 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        value={regData.phone}
                      />
                      <input 
                        type="email" 
                        placeholder="Email Address" 
                        readOnly 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        value={regData.email}
                      />
                      <select 
                         className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                         value={regData.gender}
                         onChange={(e) => setRegData({...regData, gender: e.target.value})}
                      >
                         <option value="Male">Male</option>
                         <option value="Female">Female</option>
                         <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Work Categories */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Select Your Expertise</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                       {CATEGORY_LIST.map((cat) => (
                         <label key={cat} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                           <input 
                             type="checkbox" 
                             id={cat === "Home Appliances" ? "cat-home-appliances" : undefined}
                             className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                             checked={regData.categories.includes(cat)}
                             onChange={() => handleCategoryChange(cat)}
                           />
                           <span className="text-sm font-medium text-gray-700">{cat}</span>
                         </label>
                       ))}
                    </div>

                    {/* Conditional Sub-Categories */}
                    {regData.categories.includes("Home Appliances") && (
                      <div id="sub-home-appliances" className="bg-blue-50 p-4 rounded-xl mt-4 border border-blue-100 animate-fadeIn">
                         <h4 className="text-sm font-bold text-blue-800 mb-3">Select Appliances you can repair:</h4>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                           {APPLIANCE_LIST.map((sub) => (
                             <label key={sub} className="flex items-center gap-2">
                               <input 
                                 type="checkbox" 
                                 className="w-4 h-4 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
                                 checked={regData.subCategories.includes(sub)}
                                 onChange={() => handleSubCategoryChange(sub)}
                               />
                               <span className="text-sm text-blue-700">{sub}</span>
                             </label>
                           ))}
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Professional & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Professional Details</h3>
                       <div className="relative">
                          <input 
                            type="number" 
                            placeholder="Work Experience (Years)" 
                            required 
                            min="0"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={regData.experience}
                            onChange={(e) => setRegData({...regData, experience: e.target.value})}
                          />
                       </div>
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Location Details</h3>
                       <div className="space-y-3">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Select Your City <span className="text-red-500">*</span></label>
                              <select 
                                id="partner-city" 
                                required 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none bg-white cursor-pointer appearance-none"
                                value={regData.city}
                                onChange={(e) => setRegData({...regData, city: e.target.value})}
                              >
                                  <option value="" disabled>Tap to select your city...</option>
                                  <option value="Ahmedabad">Ahmedabad</option>
                                  <option value="Bangalore">Bangalore</option>
                                  <option value="Bhubaneswar">Bhubaneswar</option>
                                  <option value="Chennai">Chennai</option>
                                  <option value="Delhi">Delhi</option>
                                  <option value="Faridabad">Faridabad</option>
                                  <option value="Ghaziabad">Ghaziabad</option>
                                  <option value="Gurgaon">Gurgaon</option>
                                  <option value="Hyderabad">Hyderabad</option>
                                  <option value="Kochi">Kochi</option>
                                  <option value="Kolkata">Kolkata</option>
                                  <option value="Lucknow">Lucknow</option>
                                  <option value="Mysore">Mysore</option>
                                  <option value="NCR">NCR</option>
                                  <option value="Noida">Noida</option>
                                  <option value="Patna">Patna</option>
                                  <option value="Pune">Pune</option>
                                  <option value="Mumbai">Mumbai</option>
                                  <option value="Surat">Surat</option>
                                  <option value="Vadodara">Vadodara</option>
                                  <option value="Vizag">Vizag</option>
                                  <option value="Others" className="font-bold text-indigo-600">Others (Please specify)</option>
                              </select>
                              
                              {regData.city === 'Others' && (
                                <input 
                                    type="text" 
                                    id="other-city-input" 
                                    placeholder="Type your city name" 
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none animate-fadeIn"
                                    value={regData.customCity}
                                    onChange={(e) => setRegData({...regData, customCity: e.target.value})}
                                    required
                                />
                              )}
                          </div>
                          <input 
                            type="number" 
                            placeholder="Area Pincode" 
                            required 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={regData.pincode}
                            onChange={(e) => setRegData({...regData, pincode: e.target.value})}
                          />
                          <textarea 
                             placeholder="Full Address" 
                             required
                             rows={2}
                             className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                             value={regData.address}
                             onChange={(e) => setRegData({...regData, address: e.target.value})}
                          ></textarea>
                       </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all active:scale-95 text-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin" /> Saving Profile...
                        </span>
                    ) : 'Submit Registration'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      <Modal 
        isOpen={!!paymentModal} 
        onClose={() => setPaymentModal(null)} 
        title="Generate Final Bill"
      >
        {paymentModal && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-2 border-b border-gray-200 pb-2">Job Summary</h3>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Customer</span>
                <span className="font-medium">{paymentModal.customerName}</span>
              </div>
              
              <div className="bg-white p-3 rounded border border-gray-200 my-2">
                 {paymentModal.cartItems ? (
                    <ul className="space-y-1">
                      {paymentModal.cartItems.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-xs">
                          <span>{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                          <span className="font-medium">₹{item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                 ) : (
                    <div className="flex justify-between text-sm">
                       <span>{paymentModal.subServiceName}</span>
                       <span>₹{paymentModal.price}</span>
                    </div>
                 )}
              </div>

              <div className="flex justify-between text-sm font-semibold text-indigo-900 border-t border-gray-200 pt-2 mt-2">
                <span>Base Total</span>
                <span>₹{paymentModal.price}</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Briefcase size={16}/> Add Extra Works?
              </h3>
              <div className="flex gap-2 mb-3">
                <select 
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  onChange={(e) => {
                     const selectedServiceName = e.target.value;
                     let service = null;
                     for (const cat in DB_DATA.Services) {
                         const found = (DB_DATA.Services as any)[cat].find((s: any) => s.name === selectedServiceName);
                         if (found) {
                             service = found;
                             break;
                         }
                     }
                     
                     if (service) {
                       setExtraWorks([...extraWorks, { name: service.name, price: service.price }]);
                       e.target.value = "";
                     }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Select extra service...</option>
                  {Object.entries(DB_DATA.Services).map(([category, services]) => (
                    <optgroup key={category} label={category}>
                      {(services as any[]).map((s: any) => (
                         <option key={`${category}-${s.name}`} value={s.name}>{s.name} - ₹{s.price}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              
              {extraWorks.length > 0 && (
                <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {extraWorks.map((work, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm animate-fadeIn">
                      <span className="text-gray-700">{work.name}</span>
                      <div className="flex items-center gap-3">
                         <span className="font-medium text-gray-900">₹{work.price}</span>
                         <button 
                           onClick={() => setExtraWorks(extraWorks.filter((_, i) => i !== idx))}
                           className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                         >
                           <Trash2 size={14}/>
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-600">Total Service Charge</span>
                 <span className="font-bold text-gray-900">₹{modalTotal}</span>
               </div>
               <div className="flex justify-between items-center text-lg font-bold text-indigo-700 border-t border-blue-200 pt-3">
                 <span>Platform Commission (25%)</span>
                 <span>₹{modalCommission.toFixed(2)}</span>
               </div>
            </div>

            <div className="text-center space-y-4 pt-2">
               <div className="bg-white p-2 inline-block rounded-lg shadow-sm border border-gray-200">
                 <img src="https://i.postimg.cc/MZLYK3kY/Whats-App-Image-2026-01-02-at-3-54-45-PM-(1).png" alt="Scan to Pay" className="w-[150px] h-[150px] object-contain" />
               </div>
               <p className="font-medium text-gray-900">Scan to Pay Commission</p>
               
               <div className="relative">
                 <input 
                   type="file" 
                   id="payment-screenshot"
                   accept="image/*"
                   onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                   className="hidden"
                 />
                 <label 
                   htmlFor="payment-screenshot"
                   className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${screenshot ? 'border-green-500 bg-green-50 text-green-700 font-medium' : 'border-gray-300 hover:border-indigo-500 text-gray-500 hover:bg-gray-50'}`}
                 >
                   <Upload size={18} />
                   {screenshot ? screenshot.name : 'Upload Payment Screenshot'}
                 </label>
               </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex gap-3 items-start">
               <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
               <p className="text-xs text-red-700 leading-relaxed font-medium">
                 <strong>IMPORTANT NOTE:</strong> Dear Partner, is lead ko complete mark karne ke liye kripya commission amount turant pay karein. Jab tak yeh payment clear nahi hoti, nayi leads milna temporary hold par rahega. Thank you for your cooperation.
               </p>
            </div>

            <button
              onClick={processPayment}
              className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              Complete Service & Submit
            </button>
          </div>
        )}
      </Modal>

      {leadToAccept && (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center px-4 animate-fadeIn">
                <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all animate-scaleIn">
                    <div className="bg-indigo-600 p-4 text-center">
                        <h3 className="text-white text-lg font-bold flex items-center justify-center gap-2">
                            <AlertTriangle className="text-yellow-300" /> Confirm Lead Acceptance
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4 text-sm text-gray-700 space-y-2">
                            <p><strong>📍 City:</strong> {leadToAccept.city || 'N/A'}</p>
                            <p><strong>🛠️ Category:</strong> {leadToAccept.serviceCategory}</p>
                            <p><strong>🏠 Address:</strong> {leadToAccept.address}</p>
                        </div>
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                            <p className="text-red-700 font-semibold text-sm leading-relaxed">
                                "यह लीड कम्पलीट करने के बाद ही आप नेक्स्ट लीड एक्सेप्ट कर सकते हैं。<br/>ध्यान दें: हम सर्विस चार्ज का 25% कमीशन चार्ज करते हैं。"
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button 
                                onClick={() => setLeadToAccept(null)} 
                                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-300 transition"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmLeadAcceptance} 
                                disabled={isSubmitting}
                                className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-green-700 transition flex justify-center items-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18} /> Confirmed</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};