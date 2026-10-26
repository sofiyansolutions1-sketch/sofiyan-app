import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Copy, 
  Check, 
  RefreshCw, 
  Plus, 
  ExternalLink, 
  Phone, 
  MessageSquare, 
  X, 
  Eye, 
  ShieldCheck, 
  Award,
  Sparkles,
  ChevronRight,
  Filter,
  CreditCard,
  Send,
  FileText,
  Edit3,
  Save,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface InfluencerBooking {
  id: string;
  date: string;
  customer_name: string;
  contact_number: string;
  city: string;
  area: string;
  service: string;
  price: number;
  commission: number;
  status: string;
}

interface InfluencerAdminItem {
  id: string;
  page_name: string;
  contact_number: string;
  referral_code: string;
  upi_id?: string;
  commission_rate: number;
  status: 'Active' | 'Paused';
  created_at: string;
  total_bookings: number;
  total_volume: number;
  commission_amount: number;
  recent_bookings: InfluencerBooking[];
}

export function InfluencerManager() {
  const [influencers, setInfluencers] = useState<InfluencerAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Paused'>('All');
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerAdminItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Add influencer modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newUpi, setNewUpi] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  // Caption Template Management State (For Influencer Bio / Reels / Promo)
  const [captionTemplate, setCaptionTemplate] = useState('');
  const [captionLoading, setCaptionLoading] = useState(false);
  const [captionSaving, setCaptionSaving] = useState(false);
  const [captionSuccessMsg, setCaptionSuccessMsg] = useState('');
  const [captionErrorMsg, setCaptionErrorMsg] = useState('');
  const [captionLastUpdated, setCaptionLastUpdated] = useState<string | null>(null);
  const [isCaptionOpen, setIsCaptionOpen] = useState(true);

  const fetchCaptionTemplate = async () => {
    setCaptionLoading(true);
    try {
      const res = await fetch('/api/influencers/caption');
      const data = await res.json();
      if (res.ok && data.caption) {
        setCaptionTemplate(data.caption);
        if (data.updated_at) setCaptionLastUpdated(data.updated_at);
      }
    } catch (err) {
      console.error("Failed to load caption template:", err);
    } finally {
      setCaptionLoading(false);
    }
  };

  const handleSaveCaption = async () => {
    if (!captionTemplate.trim()) {
      setCaptionErrorMsg('Caption cannot be empty.');
      return;
    }
    setCaptionSaving(true);
    setCaptionSuccessMsg('');
    setCaptionErrorMsg('');
    try {
      const res = await fetch('/api/influencers/caption', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: captionTemplate })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update caption template');
      }
      setCaptionSuccessMsg('कैप्शन सफलतापूर्वक सेव और अपडेट हो गया! सभी इन्फ्लुएंसर्स के पैनल पर यह कैप्शन तुरंत लाइव हो गया है।');
      if (data.updated_at) setCaptionLastUpdated(data.updated_at);
      setTimeout(() => setCaptionSuccessMsg(''), 4000);
    } catch (err: any) {
      setCaptionErrorMsg(err.message || 'Error updating caption template');
    } finally {
      setCaptionSaving(false);
    }
  };

  const handleResetDefaultCaption = () => {
    const defaultText = `🛠️ Verified AC & Home Appliance Repair in Lucknow by Sofiyan Home Service!\n\nUse my code {CODE} while booking for priority technician assignment:\n🔗 {LINK}\n\n#SofiyanHomeService #LucknowService #ACRepairLucknow #HomeAppliances`;
    setCaptionTemplate(defaultText);
  };

  const handleInsertTag = (tag: '{CODE}' | '{LINK}') => {
    setCaptionTemplate((prev) => prev ? `${prev} ${tag}` : tag);
  };

  const fetchInfluencers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/influencers');
      const data = await res.json();
      if (res.ok && Array.isArray(data.influencers)) {
        setInfluencers(data.influencers);
        if (selectedInfluencer) {
          const updatedSelected = data.influencers.find((inf: InfluencerAdminItem) => inf.id === selectedInfluencer.id);
          if (updatedSelected) setSelectedInfluencer(updatedSelected);
        }
      }
    } catch (err) {
      console.error("Failed to load influencers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfluencers();
    fetchCaptionTemplate();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    try {
      const res = await fetch('/api/influencers/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        fetchInfluencers();
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const handleAddInfluencer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/influencers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_name: newPageName,
          contact_number: newPhone,
          referral_code: newCode,
          upi_id: newUpi,
          password: newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register influencer');
      }

      setIsAddModalOpen(false);
      setNewPageName('');
      setNewPhone('');
      setNewCode('');
      setNewUpi('');
      setNewPassword('');
      fetchInfluencers();
      alert('Influencer added successfully!');
    } catch (err: any) {
      setAddError(err.message || 'Failed to create influencer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered influencers
  const filteredInfluencers = influencers.filter(inf => {
    const matchesSearch = 
      (inf.page_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inf.contact_number || '').includes(searchQuery) ||
      (inf.referral_code || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inf.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Aggregated totals
  const totalInfluencersCount = influencers.length;
  const totalReferredBookings = influencers.reduce((acc, inf) => acc + (inf.total_bookings || 0), 0);
  const totalReferredSales = influencers.reduce((acc, inf) => acc + (inf.total_volume || 0), 0);
  const totalCommissionPayable = influencers.reduce((acc, inf) => acc + (inf.commission_amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider mb-2">
            <Award size={14} />
            <span>Influencer Network & Commissions</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            Creator & Influencer Activity
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor real-time bookings generated through influencer unique referral codes and verify 25% commissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInfluencers}
            disabled={loading}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all"
            title="Refresh List"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-950 hover:bg-black text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-950/10 transition-all"
          >
            <Plus size={16} />
            <span>Add Influencer</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Creators</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalInfluencersCount}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Registered Influencers</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total Bookings</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalReferredBookings}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Generated via referral codes</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Gross Sales</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">₹{totalReferredSales.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Customer purchasing spend</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-5 rounded-3xl shadow-lg shadow-emerald-700/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">25% Commission</span>
            <div className="p-2 bg-white/20 text-white rounded-xl backdrop-blur-md">
              <Award size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2">₹{totalCommissionPayable.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-100 mt-0.5 font-medium">Influencer payouts due</p>
        </div>
      </div>

      {/* ADMIN PROMO CAPTION & BIO TEMPLATE MANAGER */}
      <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-amber-400 shrink-0 mt-0.5">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                  Global Influencer Broadcast
                </span>
                {captionLastUpdated && (
                  <span className="text-[10px] text-slate-400">
                    Updated: {new Date(captionLastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>Promo Caption & Bio Manager</span>
                <span className="text-xs font-medium text-slate-300 lowercase font-normal">(कैप्शन और बायो एडिटर)</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                एडमिन जो भी कैप्शन यहाँ एडिट और अपडेट करेगा, वह तुरंत सभी इन्फ्लुएंसर्स के पैनल पर <strong className="text-white">"Ready Promo Caption"</strong> के रूप में लाइव दिखेगा, जिसे वे सीधे अपने Instagram Reels, YouTube Shorts और Bio में कॉपी करके पेस्ट करेंगे।
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCaptionOpen(!isCaptionOpen)}
            className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border border-white/10"
          >
            <span>{isCaptionOpen ? 'Hide Editor' : 'Open Editor'}</span>
            {isCaptionOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {isCaptionOpen && (
          <div className="p-6 space-y-6">
            {captionSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-xs font-bold animate-in fade-in">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{captionSuccessMsg}</span>
              </div>
            )}

            {captionErrorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-xs font-bold">
                <X size={18} className="text-red-600 shrink-0" />
                <span>{captionErrorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Cols: Caption Input & Variables */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Edit3 size={14} className="text-indigo-600" />
                    <span>Master Caption Template (एडिट करें)</span>
                  </label>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {captionTemplate.length} characters
                  </span>
                </div>

                {/* Variable Tags Help */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>Dynamic Tags:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleInsertTag('{CODE}')}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-mono font-bold transition-all shadow-2xs hover:border-indigo-300"
                      title="Insert {CODE} tag into caption"
                    >
                      + Insert {'{CODE}'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertTag('{LINK}')}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-mono font-bold transition-all shadow-2xs hover:border-indigo-300"
                      title="Insert {LINK} tag into caption"
                    >
                      + Insert {'{LINK}'}
                    </button>
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={captionTemplate}
                  onChange={(e) => setCaptionTemplate(e.target.value)}
                  placeholder="Type promotional caption here... e.g. Book home appliance service in Lucknow using my code {CODE}! Link: {LINK}"
                  className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-xs font-mono text-slate-800 leading-relaxed outline-none transition-all resize-y shadow-inner"
                />

                <div className="text-[11px] text-slate-500 leading-relaxed space-y-1">
                  <p>
                    💡 <strong className="text-slate-700">{'{CODE}'}</strong>: जब कोई इन्फ्लुएंसर अपना पैनल खोलेगा, तो यह टैग खुद-ब-खुद उसके पर्सनल रेफरल कोड (उदा. <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">SOFIYA10</code>) में बदल जाएगा।
                  </p>
                  <p>
                    💡 <strong className="text-slate-700">{'{LINK}'}</strong>: यह टैग इन्फ्लुएंसर के ऑटो-ट्रैकिंग बुकिंग यूआरएल (उदा. <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">.../?ref=SOFIYA10</code>) में बदल जाएगा।
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetDefaultCaption}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
                  >
                    <RotateCcw size={14} />
                    <span>Reset to Default Template</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCaption}
                    disabled={captionSaving || captionLoading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                  >
                    {captionSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>{captionSaving ? 'Saving...' : 'Update & Broadcast Caption'}</span>
                  </button>
                </div>
              </div>

              {/* Right 5 Cols: Live Influencer Panel Preview */}
              <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 flex items-center gap-1">
                      <Eye size={12} />
                      <span>Influencer Dashboard Preview</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">Sample Code: SOFIYA10</span>
                  </div>

                  <p className="text-[11px] text-gray-500 mb-2">
                    इन्फ्लुएंसर के पैनल पर यह कार्ड इस तरह दिखेगा:
                  </p>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-tight">
                        <Sparkles size={13} className="text-amber-500" />
                        <span>Ready Promo Caption (Reels/Bio)</span>
                      </div>
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        1-Tap Copy
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                      {captionTemplate
                        .replace(/\{CODE\}|\{\{CODE\}\}/gi, 'SOFIYA10')
                        .replace(/\{LINK\}|\{\{LINK\}\}/gi, `${typeof window !== 'undefined' ? window.location.origin : 'https://example.com'}/?ref=SOFIYA10`) || (
                          <span className="text-gray-400 italic">Enter caption text to preview...</span>
                        )}
                    </div>

                    <div className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 opacity-90 cursor-default">
                      <Copy size={13} />
                      <span>Copy Instagram Caption</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 text-[10px] text-gray-500">
                  ⚡ जब भी आप अपडेट करेंगे, सभी इन्फ्लुएंसर्स को यही नया कैप्शन दिखाई देगा।
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by handle, phone, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {(['All', 'Active', 'Paused'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-indigo-950 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Influencer Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-[10px] uppercase font-black tracking-wider text-gray-400">
                <th className="px-6 py-4">Influencer Page</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Referral Code</th>
                <th className="px-6 py-4">Payout UPI ID</th>
                <th className="px-6 py-4 text-center">Bookings</th>
                <th className="px-6 py-4 text-right">Order Spend</th>
                <th className="px-6 py-4 text-right">25% Commission</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>Loading influencer activity...</span>
                  </td>
                </tr>
              ) : filteredInfluencers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    No influencers found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredInfluencers.map((inf) => (
                  <tr key={inf.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {inf.page_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">@{inf.page_name}</p>
                          <p className="text-[10px] text-gray-400">
                            Joined {new Date(inf.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-700 font-mono">{inf.contact_number}</span>
                        <a
                          href={`https://wa.me/91${inf.contact_number.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 p-1"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare size={14} />
                        </a>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 bg-indigo-50/80 text-indigo-900 border border-indigo-100 px-2.5 py-1 rounded-lg font-mono font-bold text-xs">
                        <span>{inf.referral_code}</span>
                        <button
                          onClick={() => handleCopy(inf.referral_code)}
                          className="hover:text-indigo-600"
                          title="Copy Code"
                        >
                          {copiedCode === inf.referral_code ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {inf.upi_id ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg font-mono text-xs w-fit">
                          <span>{inf.upi_id}</span>
                          <button
                            onClick={() => handleCopy(inf.upi_id!)}
                            className="hover:text-emerald-950 p-0.5"
                            title="Copy UPI ID"
                          >
                            {copiedCode === inf.upi_id ? <Check size={12} className="text-emerald-700" /> : <Copy size={12} />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">Not set</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="font-black text-slate-800 text-sm">
                        {inf.total_bookings}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      ₹{(inf.total_volume || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="px-6 py-4 text-right font-black text-emerald-600 whitespace-nowrap">
                      ₹{(inf.commission_amount || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(inf.id, inf.status)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                          inf.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                        title="Click to toggle status"
                      >
                        {inf.status}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedInfluencer(inf)}
                        className="inline-flex items-center gap-1 bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                      >
                        <Eye size={12} />
                        <span>View Activity</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Activity Modal */}
      {selectedInfluencer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black uppercase tracking-tight">@{selectedInfluencer.page_name}</h3>
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-400/30">
                    {selectedInfluencer.referral_code}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Contact: {selectedInfluencer.contact_number} • Total Bookings: {selectedInfluencer.total_bookings} • Sales: ₹{(selectedInfluencer.total_volume || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <button
                onClick={() => setSelectedInfluencer(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Bookings List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Payout UPI ID Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                      Designated Payout UPI ID
                    </p>
                    <p className="text-xs sm:text-sm font-mono font-bold text-emerald-950">
                      {selectedInfluencer.upi_id || 'Not entered yet by influencer'}
                    </p>
                  </div>
                </div>

                {selectedInfluencer.upi_id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(selectedInfluencer.upi_id!)}
                      className="flex items-center gap-1 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      {copiedCode === selectedInfluencer.upi_id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>Copy UPI</span>
                    </button>

                    <a
                      href={`upi://pay?pa=${encodeURIComponent(selectedInfluencer.upi_id)}&pn=${encodeURIComponent(selectedInfluencer.page_name)}&am=${selectedInfluencer.commission_amount || 0}&cu=INR`}
                      className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      <Send size={12} />
                      <span>Pay Commission (₹{selectedInfluencer.commission_amount || 0})</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
                  Customer Orders Attributed via Code
                </h4>
                <span className="text-xs font-bold text-emerald-600">
                  Total Commission: ₹{(selectedInfluencer.commission_amount || 0).toLocaleString('en-IN')} (25%)
                </span>
              </div>

              {selectedInfluencer.recent_bookings && selectedInfluencer.recent_bookings.length > 0 ? (
                <div className="space-y-3">
                  {selectedInfluencer.recent_bookings.map((b) => (
                    <div key={b.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{b.customer_name}</span>
                          {b.contact_number && (
                            <span className="text-[11px] font-mono text-gray-500">({b.contact_number})</span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase font-black">
                            {b.status}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-950 font-medium mt-0.5">
                          {b.service}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(b.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          {b.city && ` • ${b.city}`}
                        </p>
                      </div>

                      <div className="text-right sm:self-center">
                        <p className="text-sm font-black text-slate-900">
                          ₹{b.price.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs font-bold text-emerald-600">
                          25% Cut: +₹{b.commission.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 space-y-2">
                  <Calendar size={32} className="mx-auto text-gray-300" />
                  <p className="text-sm font-medium">No bookings recorded for this code yet.</p>
                  <p className="text-xs text-gray-400">
                    As soon as customers checkout using referral code <strong>{selectedInfluencer.referral_code}</strong>, they will populate here in real-time.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <a
                href={`https://wa.me/91${selectedInfluencer.contact_number.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello @${selectedInfluencer.page_name}, your current Sofiyan Home Service partner balance is ₹${selectedInfluencer.commission_amount} for ${selectedInfluencer.total_bookings} referred bookings.`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                <MessageSquare size={14} />
                <span>Message on WhatsApp</span>
              </a>
              <button
                onClick={() => setSelectedInfluencer(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add Influencer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 bg-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Onboard Influencer</h3>
                <p className="text-xs text-indigo-200 mt-0.5">Register a new creator and assign referral code</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-indigo-300 hover:text-white rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddInfluencer} className="p-6 space-y-4">
              {addError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl">
                  {addError}
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                  Instagram Page / Creator Handle
                </label>
                <input
                  type="text"
                  required
                  placeholder="lucknow_buzz"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                  Assign Unique Referral Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="LUCKNOW25"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-indigo-100 bg-indigo-50/50 font-mono font-bold text-xs uppercase text-indigo-900 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                  Enter your UPI ID (For 25% Payouts)
                </label>
                <input
                  type="text"
                  placeholder="e.g. name@okhdfcbank, 9876543210@paytm"
                  value={newUpi}
                  onChange={(e) => setNewUpi(e.target.value.trim())}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                  Set Initial Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-950 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Add Influencer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
