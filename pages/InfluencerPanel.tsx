import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, 
  Share2, 
  Copy, 
  Check, 
  LogOut, 
  RefreshCw, 
  TrendingUp, 
  Calendar, 
  Phone, 
  Award, 
  ArrowRight,
  Sparkles,
  AlertCircle,
  CreditCard,
  Lock,
  MessageCircle,
  Zap,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Calculator,
  Layers
} from 'lucide-react';

interface InfluencerBooking {
  id: string;
  created_at: string;
  customer_name: string;
  city?: string;
  service: string;
  price: number;
  commission: number;
  status: string;
}

interface InfluencerData {
  id: string;
  page_name: string;
  contact_number: string;
  referral_code: string;
  upi_id?: string;
  commission_rate: number;
  status: string;
  created_at?: string;
}

export function InfluencerPanel() {
  const [influencer, setInfluencer] = useState<InfluencerData | null>(() => {
    try {
      const saved = localStorage.getItem('influencer_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('signup');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Form states
  const [pageName, setPageName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [password, setPassword] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Dashboard Stats
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [commissionAmount, setCommissionAmount] = useState(0);
  const [bookingsList, setBookingsList] = useState<InfluencerBooking[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // UPI Management in Dashboard
  const [dashboardUpiInput, setDashboardUpiInput] = useState(influencer?.upi_id || '');
  const [isSavingUpi, setIsSavingUpi] = useState(false);
  const [upiStatusMsg, setUpiStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Admin Broadcast Caption Template
  const [captionTemplate, setCaptionTemplate] = useState<string>(
    `🛠️ Verified AC & Home Appliance Repair in Lucknow by Sofiyan Home Service!\n\nUse my code {CODE} while booking for priority technician assignment:\n🔗 {LINK}\n\n#SofiyanHomeService #LucknowService #ACRepairLucknow #HomeAppliances`
  );

  const fetchCaptionTemplate = async () => {
    try {
      const res = await fetch('/api/influencers/caption');
      const data = await res.json();
      if (res.ok && data.caption) {
        setCaptionTemplate(data.caption);
      }
    } catch (err) {
      console.warn("Could not load admin caption template:", err);
    }
  };

  useEffect(() => {
    fetchCaptionTemplate();
  }, []);

  // Calculator Simulation state
  const [simulatedBookings, setSimulatedBookings] = useState(15);
  const avgOrderValue = 1000;
  const estimatedEarnings = Math.round(simulatedBookings * avgOrderValue * 0.25);

  // Load stats whenever influencer is logged in
  const fetchDashboardStats = async (code: string) => {
    if (!code) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/influencers/stats/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (res.ok) {
        setTotalBookings(data.total_bookings || 0);
        setTotalVolume(data.total_volume || 0);
        setCommissionAmount(data.commission_amount || 0);
        setBookingsList(data.bookings || []);
        if (data.upi_id) {
          setDashboardUpiInput(data.upi_id);
          setInfluencer((prev) => prev ? { ...prev, upi_id: data.upi_id } : prev);
        }
      }
    } catch (err) {
      console.error("Error fetching influencer stats:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (influencer?.referral_code) {
      fetchDashboardStats(influencer.referral_code);
      if (influencer.upi_id) {
        setDashboardUpiInput(influencer.upi_id);
      }
    }
  }, [influencer?.referral_code]);

  // Sign up handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!pageName || !contactNumber || !referralCode || !password) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/influencers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_name: pageName,
          contact_number: contactNumber,
          referral_code: referralCode,
          upi_id: upiIdInput,
          password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setInfluencer(data.influencer);
      localStorage.setItem('influencer_session', JSON.stringify(data.influencer));
      setSuccessMsg('Account created successfully! Welcome to the Partner Program.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginIdentifier || !loginPassword) {
      setErrorMsg('Please enter your Page Name / Code and Password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/influencers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      setInfluencer(data.influencer);
      localStorage.setItem('influencer_session', JSON.stringify(data.influencer));
      if (data.influencer?.upi_id) {
        setDashboardUpiInput(data.influencer.upi_id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('influencer_session');
    setInfluencer(null);
    setBookingsList([]);
    setTotalBookings(0);
    setTotalVolume(0);
    setCommissionAmount(0);
  };

  const referralUrl = typeof window !== 'undefined' && influencer?.referral_code
    ? `${window.location.origin}/?ref=${encodeURIComponent(influencer.referral_code)}`
    : '';

  const handleCopyCode = () => {
    if (!influencer?.referral_code) return;
    navigator.clipboard.writeText(influencer.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!influencer?.referral_code) return;
    const msg = `🔥 Need fast, reliable AC, Fridge, or Washing Machine repair in Lucknow? \n\nBook certified technicians at Sofiyan Home Service! Use my exclusive partner code *${influencer.referral_code}* for priority booking & discounts:\n👉 ${referralUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const readyCaption = useMemo(() => {
    if (!influencer?.referral_code) return '';
    const template = captionTemplate || `🛠️ Verified AC & Home Appliance Repair in Lucknow by Sofiyan Home Service!\n\nUse my code {CODE} while booking for priority technician assignment:\n🔗 {LINK}\n\n#SofiyanHomeService #LucknowService #ACRepairLucknow #HomeAppliances`;
    
    let text = template;
    if (text.includes('{CODE}') || text.includes('{{CODE}}')) {
      text = text.replace(/\{CODE\}|\{\{CODE\}\}/gi, influencer.referral_code);
    } else {
      text += `\n\nUse my code: ${influencer.referral_code}`;
    }

    if (text.includes('{LINK}') || text.includes('{{LINK}}')) {
      text = text.replace(/\{LINK\}|\{\{LINK\}\}/gi, referralUrl);
    } else if (referralUrl) {
      text += `\n🔗 ${referralUrl}`;
    }

    return text;
  }, [captionTemplate, influencer?.referral_code, referralUrl]);

  const handleCopyCaption = () => {
    if (!readyCaption) return;
    navigator.clipboard.writeText(readyCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  // Save / Update UPI ID
  const handleSaveUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!influencer?.id) return;
    if (!dashboardUpiInput || !dashboardUpiInput.includes('@')) {
      setUpiStatusMsg({ type: 'error', text: 'Please enter a valid UPI ID with @ symbol (e.g. name@okhdfcbank, 9876543210@paytm)' });
      return;
    }

    setIsSavingUpi(true);
    setUpiStatusMsg(null);
    try {
      const res = await fetch('/api/influencers/upi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: influencer.id,
          upi_id: dashboardUpiInput.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update UPI ID');
      }

      setInfluencer(data.influencer);
      localStorage.setItem('influencer_session', JSON.stringify(data.influencer));
      setUpiStatusMsg({ type: 'success', text: '✅ UPI ID saved! All 25% payouts will be transferred to this UPI ID.' });
      setTimeout(() => setUpiStatusMsg(null), 4000);
    } catch (err: any) {
      setUpiStatusMsg({ type: 'error', text: err.message || 'Error saving UPI ID' });
    } finally {
      setIsSavingUpi(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16 pt-3 sm:pt-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Compact Mobile-Friendly Hero Card */}
        <div className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden border border-purple-900/40">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span>Creator & Influencer Program</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight uppercase leading-tight">
                Earn Flat <span className="text-amber-400">25% Commission</span> On Every Booking
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-indigo-200/90 leading-relaxed max-w-xl">
                Share your referral code. When your followers book appliance repairs, earn 25% of their total bill directly to your UPI ID!
              </p>
            </div>

            {influencer && (
              <div className="flex items-center justify-between sm:justify-start gap-3 bg-white/10 backdrop-blur-md p-2.5 px-3.5 rounded-xl border border-white/15 shrink-0 mt-1 sm:mt-0">
                <div>
                  <p className="text-[9px] text-indigo-300 uppercase font-black tracking-wider">Influencer Account</p>
                  <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[150px]">@{influencer.page_name}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 text-indigo-200 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Not Logged In: Sign Up & Login Forms */}
        {!influencer ? (
          <div className="max-w-md mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
            {/* Tab switchers */}
            <div className="flex border-b border-gray-100 bg-slate-50/60 p-1.5 m-2.5 rounded-xl">
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === 'signup' 
                    ? 'bg-white text-indigo-950 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign Up & Get Code
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === 'login' 
                    ? 'bg-white text-indigo-950 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Login
              </button>
            </div>

            <div className="p-4 sm:p-6 pt-2">
              {errorMsg && (
                <div className="mb-3.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <Check size={16} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {activeTab === 'signup' ? (
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                      Instagram / Social Page Name *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-bold text-xs">@</span>
                      <input 
                        type="text"
                        required
                        value={pageName}
                        onChange={(e) => setPageName(e.target.value)}
                        placeholder="your_page_name"
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-xs sm:text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                      Contact / WhatsApp Number *
                    </label>
                    <input 
                      type="tel"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-xs sm:text-sm transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider">
                        Create Unique Referral Code *
                      </label>
                      <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">
                        25% Cut
                      </span>
                    </div>
                    <input 
                      type="text"
                      required
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                      placeholder="e.g. LUCKNOW25 or YOURNAME25"
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-indigo-100 bg-indigo-50/40 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-indigo-900 transition-all"
                    />
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                      <Lock size={12} className="shrink-0" />
                      <span>Note: Referral codes are permanently locked once set to prevent breaking customer links.</span>
                    </div>
                  </div>

                  {/* Extra Column: Enter your UPI ID */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                        <CreditCard size={13} className="text-emerald-600" />
                        <span>Enter your UPI ID (For 25% Payouts)</span>
                      </label>
                      <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        Direct Transfer
                      </span>
                    </div>
                    <input 
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank, 9876543210@paytm"
                      className="w-full px-3 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none text-xs sm:text-sm font-medium transition-all"
                    />
                    <p className="mt-1 text-[10px] text-gray-500">
                      All your 25% commissions will be sent directly to this UPI ID. (Can also be added later in dashboard).
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                      Create Password *
                    </label>
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-xs sm:text-sm transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-indigo-950 hover:bg-black text-white font-black py-3 px-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Creating Influencer Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Activate & Get Referral Code</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                      Page Name / Referral Code / Mobile
                    </label>
                    <input 
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Instagram handle, code, or phone"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-xs sm:text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <input 
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-xs sm:text-sm transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-indigo-950 hover:bg-black text-white font-black py-3 px-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Logging In...</span>
                      </>
                    ) : (
                      <>
                        <span>Login to Dashboard</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* Logged In: Modern Mobile-Friendly Influencer Live Dashboard */
          <div className="space-y-4 sm:space-y-6">
            
            {/* 1. Referral Code & Instant Share Hub (Mobile Optimized) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    Your Referral Code
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live & Tracking
                  </span>
                </div>

                {/* Permanent Lock Badge */}
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full w-fit">
                  <Lock size={11} className="text-slate-600" />
                  <span>Referral Code Locked (Permanent)</span>
                </div>
              </div>

              {/* Code display with quick copy */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Share with followers</p>
                  <p className="text-2xl sm:text-3xl font-mono font-black text-indigo-950 tracking-wider">
                    {influencer.referral_code}
                  </p>
                </div>
                <button 
                  onClick={handleCopyCode}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 shadow-sm"
                >
                  {copiedCode ? <Check size={14} className="text-white" /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Mobile Quick Action Buttons (Touch Friendly) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98 min-h-[44px]"
                >
                  <MessageCircle size={17} />
                  <span>Share on WhatsApp Story</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-950 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-indigo-200/70 active:scale-98 min-h-[44px]"
                >
                  {copiedLink ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Booking Link'}</span>
                </button>
              </div>
            </div>

            {/* 2. Payouts & "Enter your UPI ID" Card (Explicit User Requirement) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-emerald-100 bg-gradient-to-b from-emerald-50/30 to-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Payout Destination (UPI ID)
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      All your 25% referral earnings are transferred directly to this UPI ID
                    </p>
                  </div>
                </div>

                {influencer.upi_id && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full w-fit">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>UPI Verified For Payouts</span>
                  </span>
                )}
              </div>

              {/* Status Banner */}
              {upiStatusMsg && (
                <div className={`mb-3 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  upiStatusMsg.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {upiStatusMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                  <span>{upiStatusMsg.text}</span>
                </div>
              )}

              {/* Enter your UPI ID Form */}
              <form onSubmit={handleSaveUpi} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                    Enter your UPI ID
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text"
                      required
                      value={dashboardUpiInput}
                      onChange={(e) => setDashboardUpiInput(e.target.value.trim())}
                      placeholder="e.g. yourname@okhdfcbank, 9876543210@paytm, name@upi"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none text-xs sm:text-sm font-mono font-bold text-slate-900 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={isSavingUpi}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 min-h-[42px] active:scale-98"
                    >
                      {isSavingUpi ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          <span>Save UPI ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[10px] text-gray-500 pt-1">
                  <span>Supported: Google Pay, PhonePe, Paytm, BHIM, Cred, AmazonPay</span>
                  <span className="text-emerald-700 font-bold">Weekly Automated Payouts</span>
                </div>
              </form>
            </div>

            {/* 3. Live Metrics (Mobile-Optimized 3 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              
              {/* Metric 1: Bookings */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-center sm:flex-col sm:items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Referred Orders</span>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                    {totalBookings}
                  </p>
                  <p className="text-[10px] text-gray-500">Bookings via your code</p>
                </div>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0 sm:mt-2">
                  <Calendar size={18} />
                </div>
              </div>

              {/* Metric 2: Total Volume (Purchasing Spend) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-center sm:flex-col sm:items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total Customer Spend</span>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                    ₹{totalVolume.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-gray-500">Customer booking amount</p>
                </div>
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0 sm:mt-2">
                  <TrendingUp size={18} />
                </div>
              </div>

              {/* Metric 3: 25% Commission */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 sm:p-5 shadow-md flex items-center sm:flex-col sm:items-start justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100">
                    Your 25% Commission
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                    ₹{commissionAmount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-emerald-100">Directly transferred to UPI</p>
                </div>
                <div className="p-2.5 bg-white/20 text-white rounded-xl backdrop-blur-md shrink-0 sm:mt-2 relative z-10">
                  <Award size={18} />
                </div>
              </div>

            </div>

            {/* 4. Advanced Creator Tools (Caption Kit & Earnings Calculator) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              
              {/* Feature A: Instagram Reel / Story Caption Kit */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-wider">
                      <Sparkles size={14} className="text-amber-500" />
                      <span>Ready Promo Caption (Reels/Bio)</span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      1-Tap Copy
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mb-2">
                    Paste this ready-made caption into your Instagram Reels, YouTube Shorts description, or bio:
                  </p>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 font-mono leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {readyCaption}
                  </div>
                </div>

                <button
                  onClick={handleCopyCaption}
                  className="mt-3 w-full py-2 bg-slate-900 hover:bg-black active:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-h-[40px] active:scale-98"
                >
                  {copiedCaption ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedCaption ? 'Caption Copied!' : 'Copy Instagram Caption'}</span>
                </button>
              </div>

              {/* Feature B: 25% Earnings Potential Simulator */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-wider">
                      <Calculator size={14} className="text-indigo-600" />
                      <span>Commission Calculator (25%)</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Estimate
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mb-2.5">
                    Tap a booking volume to see how much commission you take home:
                  </p>

                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {[5, 15, 30, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSimulatedBookings(num)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                          simulatedBookings === num
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {num} Bookings
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50/80 border border-emerald-100 rounded-xl flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-950">
                    {simulatedBookings} bookings (~₹{simulatedBookings * avgOrderValue}):
                  </span>
                  <span className="text-sm font-black text-emerald-700">
                    +₹{estimatedEarnings.toLocaleString('en-IN')} Payout
                  </span>
                </div>
              </div>

            </div>

            {/* 5. Customer Activity (Mobile Card View & Responsive Table) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                    Referred Customer Orders
                  </h2>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                    Live orders placed with referral code: <span className="font-bold text-indigo-700">{influencer.referral_code}</span>
                  </p>
                </div>

                <button
                  onClick={() => {
                    fetchDashboardStats(influencer.referral_code);
                    fetchCaptionTemplate();
                  }}
                  disabled={isRefreshing}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 p-1.5 px-2.5 rounded-lg hover:bg-indigo-50 transition-all shrink-0"
                >
                  <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {bookingsList.length === 0 ? (
                <div className="p-8 sm:p-12 text-center text-gray-400 space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                    <Share2 size={22} />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-gray-700">No bookings recorded yet</p>
                  <p className="text-[11px] sm:text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Share your referral code <strong className="text-indigo-900">{influencer.referral_code}</strong> on your social bio and WhatsApp stories. As soon as followers book, their purchasing amount and your 25% cut will appear here in real-time!
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile View: Clean Card Layout for small screens */}
                  <div className="block md:hidden divide-y divide-gray-100">
                    {bookingsList.map((b) => (
                      <div key={b.id} className="p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{b.service}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            b.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {b.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span>
                            {b.customer_name} {b.city && `• ${b.city}`}
                          </span>
                          <span>
                            {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-xs text-slate-600 font-medium">
                            Customer Bill: <strong className="text-slate-900">₹{b.price.toLocaleString('en-IN')}</strong>
                          </span>
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            25% Cut: +₹{b.commission.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View: Full Data Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] uppercase font-black tracking-wider text-gray-400 border-b border-gray-100">
                          <th className="px-5 py-3">Date</th>
                          <th className="px-5 py-3">Customer</th>
                          <th className="px-5 py-3">Service</th>
                          <th className="px-5 py-3 text-right">Bill Value</th>
                          <th className="px-5 py-3 text-right">Your 25% Cut</th>
                          <th className="px-5 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs">
                        {bookingsList.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                              {new Date(b.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-slate-800 whitespace-nowrap">
                              {b.customer_name}
                              {b.city && <span className="block text-[10px] font-normal text-gray-400">{b.city}</span>}
                            </td>
                            <td className="px-5 py-3.5 text-gray-600 max-w-[160px] truncate">
                              {b.service}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-slate-900 text-right whitespace-nowrap">
                              ₹{b.price.toLocaleString('en-IN')}
                            </td>
                            <td className="px-5 py-3.5 font-black text-emerald-600 text-right whitespace-nowrap">
                              +₹{b.commission.toLocaleString('en-IN')}
                            </td>
                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                b.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Helpline & Payout Schedule Info */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 text-white text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-400 shrink-0" />
                <span className="text-slate-300">
                  Commissions are settled to your UPI ID every Monday. Helpline: <strong className="text-white font-mono">+91 8115983887</strong>
                </span>
              </div>
              <a
                href="https://wa.me/918115983887?text=Hello%20Sofiyan%20Home%20Service,%20I%20am%20an%20Influencer%20partner."
                target="_blank"
                rel="noreferrer"
                className="text-amber-300 hover:underline font-bold text-[11px] whitespace-nowrap"
              >
                Chat on WhatsApp Support &rarr;
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
