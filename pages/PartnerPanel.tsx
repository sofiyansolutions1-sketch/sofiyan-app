import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { Partner } from '../types';

import { Briefcase, CheckCircle, MapPin, User, LogOut, Clock, User as UserIcon,  Loader2, ShieldCheck, Star } from 'lucide-react';
import { MapRadiusSelector } from '../components/MapRadiusSelector';

export const PartnerPanel: React.FC = () => {
  const { bookings, updateBooking, addPartner, updatePartner, partners } = useStore();

  const [currentUser, setCurrentUser] = useState<Partner | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    pincode: '',
    city: '',
    categories: [] as string[],
    sub_categories: [] as string[],
    service_pincodes: [] as string[]
  });
  const [authData, setAuthData] = useState({ phone: '', password: '', name: '', email: '' });
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState<string | null>(null);

  // Registration Modal State
  
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [jobToComplete, setJobToComplete] = useState<any>(null);
  const [verificationStep, setVerificationStep] = useState<'idle'|'uploading'|'verifying'|'success'>('idle');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [regStep, setRegStep] = useState<'personal' | 'expertise' | 'location' | 'verify' | 'verifying' | 'success'>('personal');
  
  const [regData, setRegData] = useState({
    firstName: '', lastName: '', phone: '', altPhone: '', password: '', age: '', gender: 'Male',
    experience: '',
    categories: [] as string[], subCategories: [] as string[],
    service_pincodes: [] as string[], aadharNumber: '', city: ''
  });

  const openEditProfile = () => {
    setEditData({
      name: currentUser.name || '',
      phone: currentUser.phone || '',
      pincode: currentUser.pincode || '',
      city: currentUser.city || '',
      categories: currentUser.categories || [],
      sub_categories: currentUser.sub_categories || [],
      service_pincodes: currentUser.service_pincodes || []
    });
    setIsEditProfileOpen(true);
  };

  const handleEditProfileSubmit = async () => {
    const updatedPartner = {
      ...currentUser,
      name: editData.name,
      phone: editData.phone,
      pincode: editData.pincode,
      city: editData.city,
      categories: editData.categories,
      sub_categories: editData.sub_categories,
      service_pincodes: editData.service_pincodes
    };
    await updatePartner(updatedPartner);
    setCurrentUser(updatedPartner);
    setIsEditProfileOpen(false);
  };

  
  useEffect(() => {
    const savedPhone = localStorage.getItem('partnerPhone');
    if (savedPhone && partners.length > 0 && !currentUser) {
      const user = partners.find(p => p.phone === savedPhone);
      if (user) {
        setTimeout(() => {
          setCurrentUser(user);
          setRegData(prev => ({
             ...prev,
             firstName: user.first_name || '',
             lastName: user.last_name || '',
             phone: user.phone || '',
             password: user.password || '',
             city: user.city || '',
             altPhone: user.alt_phone || '',
             gender: user.gender || '',
             age: user.age ? user.age.toString() : '',
             experience: user.experience || '',
             categories: user.categories || [],
             subCategories: user.sub_categories || [],
             service_pincodes: user.service_pincodes || [],
             aadharNumber: user.aadhar_number || ''
          }));
        }, 0);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partners]);

  const handleLogin = () => {
    const user = partners.find(p => p.phone === authData.phone && p.password === authData.password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('partnerPhone', user.phone);
      setAuthError(null);
      setRegData({
        ...regData,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: user.phone || '',
        password: user.password || '',
        city: user.city || '',
        altPhone: user.alt_phone || '',
        gender: user.gender || '',
        age: user.age ? user.age.toString() : '',
        experience: user.experience || '',
        categories: user.categories || [],
        subCategories: user.sub_categories || [],
        service_pincodes: user.service_pincodes || [],
        aadharNumber: user.aadhar_number || ''
      });
    } else {
      setAuthError("Invalid credentials");
    }
  };

  const handleSignup = async () => {
    if (!authData.phone || !authData.password || !authData.name) {
      setAuthError("Please fill all required fields");
      return;
    }
    const newPartner = {
      id: "P" + Date.now(),
      name: authData.name,
      first_name: authData.name.split(' ')[0],
      last_name: authData.name.split(' ').slice(1).join(' '),
      email: authData.email || authData.phone + "@example.com",
      phone: authData.phone,
      password: authData.password,
      status: 'pending' as const,
      earnings: 0,
      completedJobs: 0
    };
    try {
      const createdPartner = await addPartner(newPartner);
      setCurrentUser(createdPartner);
      localStorage.setItem('partnerPhone', createdPartner.phone || '');
      setAuthError(null);
      setRegData({
        ...regData,
        firstName: createdPartner.first_name || '',
        lastName: createdPartner.last_name || '',
        phone: createdPartner.phone || '',
        password: createdPartner.password || ''
      });
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign up");
    }
  };
const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('partnerPhone');
    setAuthData({ phone: '', password: '', name: '', email: '' });
  };


  const handleRegistrationSubmit = async () => {
    const isUpdating = !!currentUser;
    const partnerId = isUpdating ? currentUser.id : "P" + Date.now();
    const newPartner = {
      ...(isUpdating ? currentUser : {}),
      id: partnerId,
      name: regData.firstName + " " + regData.lastName,
      first_name: regData.firstName,
      last_name: regData.lastName,
      email: currentUser?.email || regData.phone + "@example.com",
      phone: regData.phone,
      city: regData.city,
      alt_phone: regData.altPhone,
      password: regData.password,
      gender: regData.gender,
      age: parseInt(regData.age) || 0,
      experience: regData.experience,
      categories: regData.categories,
      sub_categories: regData.subCategories,
      service_pincodes: regData.service_pincodes,
      aadhar_number: regData.aadharNumber,
      status: 'pending' as const,
      earnings: isUpdating ? currentUser.earnings : 0,
      completedJobs: isUpdating ? currentUser.completedJobs : 0
    };
    try {
      if (isUpdating) {
         await updatePartner(newPartner);
         setCurrentUser(newPartner);
      } else {
         const createdPartner = await addPartner(newPartner);
         setCurrentUser(createdPartner);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    }
    
  };
const EXPERTISE_CATEGORIES = ["Electrician", "Plumber", "Carpenters", "Cleaning & Pest Control", "Pooja", "Home Appliances"];
  const APPLIANCE_LIST = ["A.C. Service & Repair", "Air Cooler Repair", "Air Purifier", "Water Purifier (RO)", "Television", "Chimney Repair", "Geyser", "Washing Machine", "Refrigerator", "Mixer Grinder", "CCTV"];
  const CITIES = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat"];

  const renderAuth = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-white w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{authMode === 'login' ? 'Partner Portal' : 'Join as Partner'}</h2>
          <p className="text-gray-500">{authMode === 'login' ? 'Manage your bookings and earnings' : 'Create an account to start earning'}</p>
        </div>
        
        {authError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{authError}</div>}
        
        <div className="space-y-4">
          {authMode === 'signup' && (
            <>
              <input type="text" placeholder="Full Name" value={authData.name} onChange={e => setAuthData({...authData, name: e.target.value})} className="w-full border p-3 rounded-lg" />
              <input type="email" placeholder="Email Address (Optional)" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="w-full border p-3 rounded-lg" />
            </>
          )}
          <input type="text" placeholder="Phone Number" value={authData.phone} onChange={e => setAuthData({...authData, phone: e.target.value})} className="w-full border p-3 rounded-lg" />
          <input type="password" placeholder="Password" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="w-full border p-3 rounded-lg" />
          
          <button onClick={authMode === 'login' ? handleLogin : handleSignup} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">
            {authMode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </div>
        <div className="mt-6 text-center border-t pt-6">
          <p className="text-gray-600 mb-4">{authMode === 'login' ? 'Want to join as a professional?' : 'Already have an account?'}</p>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-3 rounded-lg font-bold hover:bg-indigo-50">
            {authMode === 'login' ? 'Sign Up as Partner' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderRegistrationModal = (isProfileIncomplete = false) => (
    <div className={isProfileIncomplete ? 'min-h-screen bg-slate-50 flex items-center justify-center p-4' : 'fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4'}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-8 relative shadow-2xl">
        {isProfileIncomplete ? (
            <button onClick={() => { setCurrentUser(null); localStorage.removeItem('partnerPhone'); }} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-sm text-red-500 hover:text-red-700 font-bold">Logout</button>
        ) : (
            <button onClick={() => setIsRegistrationOpen(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-gray-800 font-bold">✕</button>
        )}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Partner Onboarding 👋</h2>
        <p className="text-slate-500 mb-6 sm:mb-10 text-xs sm:text-sm">Join our network of expert professionals</p>
        
        <div className="flex justify-between items-center mb-6 sm:mb-10 relative px-2">
          <div className="absolute top-6 left-8 right-8 h-0.5 bg-slate-100 -z-10"></div>
          
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-sm ${['personal', 'expertise', 'location', 'verify', 'verifying', 'success'].includes(regStep) ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
              <UserIcon className="w-5 h-5" />
            </div>
            <span className={`text-[9px] sm:text-[10px] mt-2 sm:mt-3 font-bold hidden sm:block tracking-wider ${['personal', 'expertise', 'location', 'verify', 'verifying', 'success'].includes(regStep) ? 'text-indigo-700' : 'text-slate-400'}`}>PERSONAL</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-sm ${['expertise', 'location', 'verify', 'verifying', 'success'].includes(regStep) ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
              <Briefcase className="w-5 h-5" />
            </div>
            <span className={`text-[9px] sm:text-[10px] mt-2 sm:mt-3 font-bold hidden sm:block tracking-wider ${['expertise', 'location', 'verify', 'verifying', 'success'].includes(regStep) ? 'text-indigo-700' : 'text-slate-400'}`}>EXPERTISE</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-sm ${['location', 'verify', 'verifying', 'success'].includes(regStep) ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
              <MapPin className="w-5 h-5" />
            </div>
            <span className={`text-[9px] sm:text-[10px] mt-2 sm:mt-3 font-bold hidden sm:block tracking-wider ${['location', 'verify', 'verifying', 'success'].includes(regStep) ? 'text-indigo-700' : 'text-slate-400'}`}>SERVICE AREAS</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-sm ${['verify', 'verifying', 'success'].includes(regStep) ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className={`text-[9px] sm:text-[10px] mt-2 sm:mt-3 font-bold hidden sm:block tracking-wider ${['verify', 'verifying', 'success'].includes(regStep) ? 'text-indigo-700' : 'text-slate-400'}`}>VERIFY</span>
          </div>
        </div>
        
        {regStep === 'personal' && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300 fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">FIRST NAME</label>
                <input type="text" placeholder="First Name" value={regData.firstName} onChange={e => setRegData({...regData, firstName: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">LAST NAME</label>
                <input type="text" placeholder="Last Name" value={regData.lastName} onChange={e => setRegData({...regData, lastName: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">AGE <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Age (Min 18)" value={regData.age} onChange={e => setRegData({...regData, age: e.target.value.replace(/\D/g, '').slice(0, 3)})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">GENDER</label>
                <select value={regData.gender} onChange={e => setRegData({...regData, gender: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">PRIMARY PHONE</label>
                <input type="text" placeholder="Mobile number" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">ALTERNATIVE PHONE (OPTIONAL)</label>
                <input type="text" placeholder="Secondary contact" value={regData.altPhone} onChange={e => setRegData({...regData, altPhone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">PASSWORD <span className="text-red-500">*</span></label>
              <input type="password" placeholder="Strong Password (Min 6 chars)" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" />
            </div>
            
            <button onClick={() => setRegStep('expertise')} disabled={!regData.firstName || !regData.lastName || regData.phone.length < 10 || !regData.password || regData.password.length < 6 || parseInt(regData.age) < 18} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 mt-6 shadow-md hover:shadow-lg">Continue to Expertise</button>
          </div>
        )}
        
        {regStep === 'expertise' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-3 tracking-wide">CATEGORIES OF EXPERTISE</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXPERTISE_CATEGORIES.map(categoryName => (
                  <label key={categoryName} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${regData.categories.includes(categoryName) ? 'bg-indigo-50 border-indigo-200 text-indigo-800 shadow-sm' : 'hover:bg-slate-50 text-slate-700 border-slate-200'}`}>
                    <input type="checkbox" checked={regData.categories.includes(categoryName)} onChange={e => {
                      const newCats = e.target.checked ? [...regData.categories, categoryName] : regData.categories.filter(x => x !== categoryName);
                      setRegData({...regData, categories: newCats});
                    }} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                    <span className="font-semibold text-sm">{categoryName}</span>
                  </label>
                ))}
              </div>
            </div>
            {regData.categories.includes('Home Appliances') && (
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                <label className="flex items-center gap-2 text-[11px] font-bold text-indigo-800 mb-4 tracking-wide">
                  <Briefcase className="w-4 h-4" /> APPLIANCES YOU REPAIR
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {APPLIANCE_LIST.map(app => (
                    <label key={app} className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-indigo-700 transition-colors">
                      <input type="checkbox" checked={regData.subCategories.includes(app)} onChange={e => {
                        const newApps = e.target.checked ? [...regData.subCategories, app] : regData.subCategories.filter(x => x !== app);
                        setRegData({...regData, subCategories: newApps});
                      }} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                      <span className="text-sm font-medium">{app}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">YEARS OF EXPERIENCE</label>
              <input type="text" placeholder="e.g. 3" value={regData.experience} onChange={e => setRegData({...regData, experience: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" />
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setRegStep('personal')} className="flex-1 bg-slate-100 hover:bg-slate-200 py-4 rounded-xl font-bold text-slate-700 transition-all">Back</button>
              <button onClick={() => setRegStep('location')} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50" disabled={regData.categories.length === 0}>Continue to Location</button>
            </div>
          </div>
        )}

        {regStep === 'location' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-3 tracking-wide">CHOOSE YOUR CITY <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                {CITIES.map(city => (
                  <button
                    key={city}
                    onClick={() => setRegData({...regData, city})}
                    className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border ${regData.city === city ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.02]' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'}`}
                  >
                    {city}
                  </button>
                ))}
              </div>
              {regData.city && (
                <div className="animate-in fade-in duration-300">
                  <label className="block text-[11px] font-bold text-slate-500 mb-2 mt-6 tracking-wide">SERVICE DELIVERY AREAS</label>
                  <p className="text-sm text-slate-500 mb-4">Choose your area, select the radius, and we will find all pincodes within that range.</p>
                  
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <MapRadiusSelector onPincodesFound={(pins) => setRegData({...regData, service_pincodes: Array.from(new Set([...regData.service_pincodes, ...pins]))})} />
                  </div>
                  
                  {regData.service_pincodes.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-[11px] font-bold text-slate-500 mb-3 tracking-wide">SELECTED PINCODES ({regData.service_pincodes.length})</h4>
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 border border-slate-200 rounded-xl bg-white shadow-inner">
                        {regData.service_pincodes.map(pin => (
                          <span key={pin} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                            {pin}
                            <button onClick={() => setRegData({...regData, service_pincodes: regData.service_pincodes.filter(p => p !== pin)})} className="text-indigo-400 hover:text-red-500 transition-colors">✕</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setRegStep('expertise')} className="flex-1 bg-slate-100 hover:bg-slate-200 py-4 rounded-xl font-bold text-slate-700 transition-all">Back</button>
              <button onClick={() => setRegStep('verify')} disabled={!regData.city || regData.service_pincodes.length === 0} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md hover:shadow-lg">Continue to Verification</button>
            </div>
          </div>
        )}
        
        {regStep === 'verify' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in">
            <div className="bg-indigo-50/50 p-8 rounded-2xl border border-indigo-100 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-indigo-100">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-bold text-indigo-900 mb-2 uppercase tracking-wide text-sm">Identity Verification</h3>
              <p className="text-sm text-indigo-600/80">Please provide your 12-digit Aadhaar number below to verify your identity and activate your account.</p>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-2 tracking-wide">AADHAAR CARD NUMBER <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter 12-digit Aadhaar Number" value={regData.aadharNumber || ''} onChange={e => setRegData({...regData, aadharNumber: e.target.value.replace(/\D/g, '').slice(0, 12)})} className="w-full border border-slate-200 p-4 rounded-xl text-lg tracking-widest font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" maxLength={12} />
              <p className="text-xs text-slate-500 mt-2">Your Aadhaar number is secure and only used for background validation.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
              <Star className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                By submitting, you agree to our <a href="#" className="font-bold text-indigo-600 hover:underline">Partner Terms of Service</a> and consent to identity verification.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setRegStep('location')} className="flex-1 bg-slate-100 hover:bg-slate-200 py-4 rounded-xl font-bold text-slate-700 transition-all">Back</button>
              <button onClick={() => {
                setRegStep('verifying');
                setTimeout(() => {
                  setRegStep('success');
                  setTimeout(() => {
                    handleRegistrationSubmit();
                  }, 2000);
                }, 2500);
              }} disabled={!regData.aadharNumber || regData.aadharNumber.length !== 12} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50">Submit Application</button>
            </div>
          </div>
        )}
        
        {regStep === 'verifying' && (
          <div className="space-y-6 text-center py-20 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center shadow-inner">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">Verifying Identity</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed">Please wait while we validate your Aadhaar details with our background verification systems...</p>
          </div>
        )}

        {regStep === 'success' && (
          <div className="space-y-6 text-center py-20 animate-in zoom-in duration-500 fade-in">
            <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 relative shadow-lg"> 
               <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-50 delay-150"></div>
               <CheckCircle className="w-16 h-16 text-emerald-600 relative z-10 animate-bounce" />
            </div>
            <h3 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Congratulations! 🎉</h3>
            <p className="text-slate-500 max-w-md mx-auto text-lg leading-relaxed">Your identity has been verified successfully. Redirecting you to your brand new dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );

  const isProfileIncomplete = currentUser && (!currentUser.aadhar_number || !currentUser.categories?.length || !currentUser.city);

  if (!currentUser) {
    return (
      <>
        {renderAuth()}
      </>
    );
  }

  if (isProfileIncomplete || isRegistrationOpen) {
    return renderRegistrationModal(isProfileIncomplete);
  }

  const partnerBookings = bookings.filter(b => b.assignedPartnerId === currentUser.id);
  
  const newLeads = bookings.filter(b => {
    if (b.status !== 'pending') return false;
    
    const partnerPins = currentUser.service_pincodes || [];
    const bPin = String(b.pinCode || '').trim();
    const pPin = String(currentUser.pincode || '').trim();
    
    const hasPincodeMatch = bPin === pPin || partnerPins.includes(bPin);
    if (!hasPincodeMatch) return false;

    const partnerCategories = currentUser.categories || [];
    const hasCategoryMatch = partnerCategories.length === 0 || 
      partnerCategories.includes(b.serviceCategory) || 
      (b.cartItems && b.cartItems.some(item => partnerCategories.includes(item.categoryName)));
      
    if (!hasCategoryMatch) return false;

    return true; // As long as pincode and category matches, show the lead to the partner
  });
  

  const activeJob = partnerBookings.find(b => b.status === 'accepted' || b.status === 'Forwarded');

  const handleAcceptLead = async (lead: Booking) => {
    if (activeJob) {
      alert("You can only accept one lead at a time. Please complete your current job first.");
      return;
    }
    await updateBooking({
      ...lead,
      status: 'accepted',
      assignedPartnerId: currentUser.id,
      assignedPartnerName: currentUser.name,
      assignedPartnerPhone: currentUser.phone,
      assignedPartnerArea: currentUser.city || currentUser.pincode
    });
  };

  const handleCancelLead = async (b: Booking) => {
    const penalty = b.price * 0.05;
    if (confirm(`Are you sure you want to cancel this lead? A penalty of ₹${penalty.toFixed(2)} (5% of service charge) will be deducted from your earnings.`)) {
      await updateBooking({
        ...b,
        status: 'pending',
        assignedPartnerId: undefined,
        assignedPartnerName: undefined,
        assignedPartnerPhone: undefined,
        assignedPartnerArea: undefined
      });
      await updatePartner({
        ...currentUser,
        earnings: (currentUser.earnings || 0) - penalty
      });
      setCurrentUser({
        ...currentUser,
        earnings: (currentUser.earnings || 0) - penalty
      });
    }
  };

  const handleCompleteJob = async (b: any) => {
    setJobToComplete(b);
    setVerificationStep('idle');
    setUploadedImage(null);
  };
  
  const processCompletion = async () => {
    if (!jobToComplete) return;
    await updateBooking({ ...jobToComplete, status: 'admin_review' });
    await updatePartner({
      ...currentUser,
      completedJobs: (currentUser?.completedJobs || 0) + 1,
      earnings: (currentUser?.earnings || 0) + jobToComplete.price
    });
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        completedJobs: (currentUser.completedJobs || 0) + 1,
        earnings: (currentUser.earnings || 0) + jobToComplete.price
      });
    }
    setJobToComplete(null);
  };

  const simulateVerification = () => {
    setVerificationStep('verifying');
    setTimeout(() => {
      setVerificationStep('success');
      setTimeout(() => {
        processCompletion();
      }, 1500);
    }, 2500);
  };

  
  const renderEditProfileModal = () => {
    if (!isEditProfileOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
          <button onClick={() => setIsEditProfileOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 font-bold">✕</button>
          <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
              <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full border p-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
              <input type="text" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full border p-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
              <input type="text" value={editData.city} onChange={e => setEditData({...editData, city: e.target.value})} className="w-full border p-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Primary Pincode</label>
              <input type="text" value={editData.pincode} onChange={e => setEditData({...editData, pincode: e.target.value})} className="w-full border p-2 rounded-lg" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Service Pincodes (Comma separated)</label>
              <input 
                type="text" 
                value={(editData.service_pincodes || []).join(', ')} 
                onChange={e => setEditData({...editData, service_pincodes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                className="w-full border p-2 rounded-lg" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Categories (Comma separated)</label>
              <input 
                type="text" 
                value={(editData.categories || []).join(', ')} 
                onChange={e => setEditData({...editData, categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                className="w-full border p-2 rounded-lg" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Sub Categories (Comma separated)</label>
              <input 
                type="text" 
                value={(editData.sub_categories || []).join(', ')} 
                onChange={e => setEditData({...editData, sub_categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                className="w-full border p-2 rounded-lg" 
              />
            </div>

            <button onClick={handleEditProfileSubmit} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition">Save Changes</button>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentModal = () => {
    if (!jobToComplete) return null;
    const commission = (jobToComplete.price * 0.25).toFixed(2);
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
          <button onClick={() => setJobToComplete(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
          
          <div className="bg-indigo-600 p-6 text-white text-center">
            <h3 className="text-xl font-bold">Complete Job</h3>
            <p className="text-indigo-200 text-sm mt-1">Commission Payment Verification</p>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Service Charge</span>
              <span className="font-bold">₹{jobToComplete.price}</span>
            </div>
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
              <span className="text-gray-600 font-bold">Company Commission (25%)</span>
              <span className="font-bold text-indigo-600 text-lg">₹{commission}</span>
            </div>
            
            {verificationStep === 'idle' && (
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-500">Ask the customer to scan this QR code and pay the commission amount.</p>
                <div className="inline-block p-2 border-4 border-indigo-50 rounded-2xl bg-white shadow-sm">
                  <img src="https://iili.io/CEJ9e9I.png" onError={(e) => { e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CompanyUPI'; }} alt="Payment QR" className="w-48 h-48 object-contain" />
                </div>
                
                <div className="mt-6 text-left">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Upload Payment Screenshot</label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadedImage(URL.createObjectURL(e.target.files[0]));
                    }
                  }} className="w-full border rounded-xl p-2 text-sm" />
                </div>
                
                <button 
                  onClick={() => setVerificationStep('uploading')}
                  disabled={!uploadedImage}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-colors mt-2"
                >
                  Verify Payment
                </button>
              </div>
            )}
            
            {verificationStep === 'uploading' && (
              <div className="text-center py-8">
                <div className="w-full bg-gray-100 h-2 rounded-full mb-4 overflow-hidden">
                  <div className="bg-indigo-600 h-full w-full animate-[pulse_1s_ease-in-out_infinite]"></div>
                </div>
                <p className="font-bold text-indigo-600">Uploading screenshot...</p>
                {setTimeout(() => simulateVerification(), 1000) && null}
              </div>
            )}
            
            {verificationStep === 'verifying' && (
              <div className="text-center py-8 space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
                <div>
                  <p className="font-bold text-gray-900">AI Verification in progress</p>
                  <p className="text-sm text-gray-500 mt-1">Checking amount and timestamp...</p>
                </div>
              </div>
            )}
            
            {verificationStep === 'success' && (
              <div className="text-center py-8 space-y-4 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">Payment Verified!</p>
                  <div className="bg-gray-50 p-3 rounded-lg mt-4 text-left border border-gray-100">
                    <p className="text-xs text-gray-600 mb-1"><strong>Identified Amount:</strong> ₹{jobToComplete?.price}</p>
                    <p className="text-xs text-gray-600 mb-1"><strong>Service Commission:</strong> ₹{(jobToComplete?.price * 0.25).toFixed(2)}</p>
                    <p className="text-xs text-gray-600"><strong>Date & Time:</strong> {new Date().toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-green-600 mt-4 font-bold">Sent to Admin for Review & Rating</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 mt-2 md:mt-6 pb-20">
      {renderPaymentModal()}
      {renderEditProfileModal()}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
            <User className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Welcome, {currentUser.name}</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">★ {currentUser.rating || "New"} • {currentUser.service_pincodes?.length || 0} Pincodes covered</p>
            <p className="text-xs text-green-600 font-bold mt-0.5">Earnings: ₹{(currentUser.earnings || 0).toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex flex-row w-full md:w-auto gap-2 mt-2 md:mt-0">
          <button onClick={openEditProfile} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 px-3 py-2 sm:px-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors font-bold shadow-sm text-sm sm:text-base">
            <UserIcon size={16} /> Edit Profile
          </button>
          <button onClick={handleLogout} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 px-3 py-2 sm:px-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors font-bold shadow-sm text-sm sm:text-base">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2 flex flex-col">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Briefcase className="text-indigo-600 w-5 h-5" /> Process Lead</h2>
          {partnerBookings.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
              <p className="text-gray-500 text-sm font-medium">No jobs assigned yet.</p>
              <p className="text-xs text-gray-400 mt-2">Accept a lead from the Available Leads panel to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {partnerBookings.map(b => (
                <div key={b.id} className="border border-gray-200 p-4 sm:p-5 rounded-xl hover:border-indigo-300 transition-colors shadow-sm bg-white relative">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <p className="font-bold text-gray-900 text-base sm:text-lg leading-tight">{b.subServiceName}</p>
                    <span className={`shrink-0 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-md uppercase tracking-wider ${b.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-indigo-50 text-indigo-700'}`}>{b.status}</span>
                  </div>
                  
                  {(b.status === 'accepted' || b.status === 'Forwarded') && (
                    <div className="mb-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-sm">
                      <p className="font-bold text-indigo-900 mb-2 border-b border-indigo-100 pb-1">Customer Details</p>
                      <div className="space-y-1">
                        <p className="text-indigo-800 break-words"><strong className="text-indigo-900">Name:</strong> {b.customerName}</p>
                        <p className="text-indigo-800 break-words"><strong className="text-indigo-900">Phone:</strong> {b.contactNumber}</p>
                        <p className="text-indigo-800 break-words"><strong className="text-indigo-900">Address:</strong> {b.address}, {b.area}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                    <p className="text-sm text-gray-600 flex items-center gap-2"><MapPin size={16} className="text-gray-400 shrink-0" /> <span className="truncate">{b.pinCode}</span></p>
                    <p className="text-sm text-gray-600 flex items-center gap-2"><Clock size={16} className="text-gray-400 shrink-0" /> {b.date} at {b.time}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center pt-4 border-t border-gray-100 gap-3 sm:gap-0">
                    <p className="font-bold text-green-600 text-lg">₹{b.price}</p>
                    {(b.status === 'accepted' || b.status === 'Forwarded') && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => handleCancelLead(b)} className="flex-1 sm:flex-none text-xs sm:text-sm font-bold bg-red-50 text-red-700 border border-red-100 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-red-100 transition-colors">
                          Cancel
                        </button>
                        <button onClick={() => handleCompleteJob(b)} className="flex-[2] sm:flex-none text-xs sm:text-sm font-bold bg-green-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-green-600 transition-colors shadow-sm">
                          Mark Completed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-[800px]">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 shrink-0"><Star className="text-amber-500 w-5 h-5" /> Available Leads</h2>
          {newLeads.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
              <p className="text-gray-500 text-sm font-medium">No new leads.</p>
              <p className="text-xs text-gray-400 mt-2">We will notify you when a job matches your profile.</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-2 pb-4">
              {newLeads.map(b => (
                <div key={b.id} className="border p-4 rounded-xl bg-amber-50/30 border-amber-100 hover:border-amber-300 transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <p className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{b.subServiceName}</p>
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded uppercase tracking-wider">NEW</span>
                  </div>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5 mb-1"><MapPin size={12} className="text-gray-400 shrink-0" /> <span className="truncate">{b.pinCode}</span></p>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5 mb-3"><Clock size={12} className="text-gray-400 shrink-0" /> {b.date} • {b.time}</p>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-amber-100/50">
                    <p className="font-bold text-green-600 text-sm sm:text-base">₹{b.price}</p>
                    <button 
                      onClick={() => handleAcceptLead(b)} 
                      disabled={!!activeJob}
                      className="text-xs sm:text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      title={activeJob ? "Complete current job first" : "Accept Lead"}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
