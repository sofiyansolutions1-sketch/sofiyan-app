import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Modal } from './Modal';
import { 
  Plus, Phone, MessageCircle, Calendar, Clock, DollarSign, 
  AlertCircle, CheckCircle, Briefcase, FileText, Mic, Trash2,
  List, Share2, BellRing
} from 'lucide-react';
// import { GoogleGenAI } from '@google/genai';

interface WebDevLead {
  id: string;
  name: string;
  contact_number: string;
  service_type: string;
  service_charge: number;
  amount_paid: number;
  requirement: string;
  follow_up_datetime: string;
  notes: string;
  address?: string;
  city?: string;
  location_url?: string;
  status: string;
  project_status: string; // 'Lead', 'In Progress', 'Built', 'Delivered'
  payment_status: string; // 'Unpaid', 'Partial', 'Paid'
  created_at: string;
}

const AMPMDateTimePicker = ({ value, onChange, required = false }: { value: string, onChange: (val: string) => void, required?: boolean }) => {
  // Try to parse values accurately avoiding local timezone shifts incorrectly
  let dateVal = '';
  let timeVal = '';
  
  if (value) {
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
          dateVal = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
          timeVal = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      }
    } catch {
      // ignore
    }
  }
  
  let hourStr = '10';
  let minStr = '00';
  let ampm = 'AM';
  
  if (timeVal) {
    const [h, m] = timeVal.split(':');
    let hourNum = parseInt(h, 10);
    ampm = hourNum >= 12 ? 'PM' : 'AM';
    hourNum = hourNum % 12;
    if (hourNum === 0) hourNum = 12;
    hourStr = hourNum.toString().padStart(2, '0');
    minStr = m || '00';
  }

  const updateCompound = (d: string, h: string, m: string, ap: string) => {
    if (!d) {
      onChange('');
      return;
    }
    let hourNum = parseInt(h, 10);
    if (ap === 'PM' && hourNum !== 12) hourNum += 12;
    if (ap === 'AM' && hourNum === 12) hourNum = 0;
    
    const formattedHour = hourNum.toString().padStart(2, '0');
    // Ensure we create a clean ISO string using the local time mapped to the computer
    const dObj = new Date(`${d}T${formattedHour}:${m}:00`);
    if (!isNaN(dObj.getTime())) {
      onChange(dObj.toISOString());
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <input 
        type="date" 
        required={required}
        value={dateVal} 
        onChange={e => updateCompound(e.target.value, hourStr, minStr, ampm)} 
        className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900" 
      />
      <div className="flex bg-gray-50 border border-gray-100 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 overflow-hidden">
        <select 
          value={hourStr} 
          onChange={e => updateCompound(dateVal, e.target.value, minStr, ampm)}
          className="p-3 bg-transparent outline-none text-sm font-bold text-gray-900 appearance-none text-center"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
             const hs = h.toString().padStart(2, '0');
             return <option key={hs} value={hs}>{hs}</option>
          })}
        </select>
        <div className="flex items-center text-gray-400 font-bold">:</div>
        <select 
          value={minStr} 
          onChange={e => updateCompound(dateVal, hourStr, e.target.value, ampm)}
          className="p-3 bg-transparent outline-none text-sm font-bold text-gray-900 appearance-none text-center"
        >
          {['00', '15', '30', '45'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select 
          value={ampm} 
          onChange={e => updateCompound(dateVal, hourStr, minStr, e.target.value)}
          className="p-3 bg-indigo-50/50 outline-none text-sm font-black text-indigo-700 appearance-none text-center cursor-pointer hover:bg-indigo-100"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
};

export const FollowUpManager: React.FC = () => {
  const [leads, setLeads] = useState<WebDevLead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Pipeline' | 'Dashboard'>('Pipeline');
  const [rescheduleData, setRescheduleData] = useState<{ lead: WebDevLead | null, datetime: string }>({ lead: null, datetime: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    service_type: 'AC Service',
    service_charge: '',
    amount_paid: '',
    requirement: '',
    follow_up_datetime: '',
    notes: '',
    address: '',
    city: '',
    location_url: '',
    project_status: 'Lead',
    payment_status: 'Unpaid'
  });

  const [isListening, setIsListening] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");
  const intentionalStopRef = useRef<boolean>(false);

  const toggleVoiceDictation = () => {
    if (isListening && recognitionRef.current) {
      intentionalStopRef.current = true;
      recognitionRef.current.stop();
      return; // Stop and let the onend handler process the entire transcript
    }

    intentionalStopRef.current = false;
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Voice input is not supported in your browser. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    transcriptRef.current = "";

    recognition.lang = 'en-US';
    recognition.continuous = true; // IMPORTANT: Let it listen across multiple pauses!
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      transcriptRef.current = finalTranscript;
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      if (event.error === 'not-allowed') {
        alert("Microphone access was denied. Please pop out the preview into a new tab (using the button in the top right), or ensure your browser allows microphone access for this site.");
        setIsListening(false);
        intentionalStopRef.current = true;
      } else if (event.error === 'no-speech') {
        if (!transcriptRef.current || transcriptRef.current.trim().length === 0) {
           alert("No speech was detected. The microphone timed out. Please try clicking the button and speaking again.");
        }
        setIsListening(false);
        intentionalStopRef.current = true;
      } else {
         alert('Error occurred during recording: ' + event.error);
         setIsListening(false);
         intentionalStopRef.current = true;
      }
    };

    recognition.onend = async () => {
      // If it wasn't an intentional stop by the user, and Chrome killed the continuous stream (often happens during long pauses)
      // We could restart, or we just process what we have. Let's process what's there and turn off the UI.
      setIsListening(false);
      if (transcriptRef.current && transcriptRef.current.trim().length > 0) {
        await processSpeechToFormWithAI(transcriptRef.current);
      }
    };

    try {
      recognition.start();
    } catch {
      console.error( );
      setIsListening(false);
    }
  };

  const processSpeechToFormWithAI = async () => {
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/extract-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) throw new Error('Server error during extraction');
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error("Invalid response from server"); }
      
      setFormData(prev => ({
        ...prev,
        ...Object.fromEntries(Object.entries(data).filter(([key, v]) => key && v !== null && v !== ''))
      }));

    } catch(err: any) {
      console.error(err);
      alert('Failed to extract form data from speech.');
    } finally {
      setIsProcessingAI(false);
    }
  };

  const fetchLeads = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('customer_followups')
      .select('*')
      .order('follow_up_datetime', { ascending: true });
      
    if (!error && data) {
      setLeads(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('customer_followups')
      .insert([{
        name: formData.name,
        contact_number: formData.contact_number,
        service_type: formData.service_type,
        service_charge: Number(formData.service_charge) || 0,
        amount_paid: Number(formData.amount_paid) || 0,
        requirement: formData.requirement,
        follow_up_datetime: formData.follow_up_datetime,
        notes: formData.notes,
        address: formData.address,
        city: formData.city,
        location_url: formData.location_url,
        status: 'Pending',
        project_status: formData.project_status,
        payment_status: formData.payment_status
      }]);

    if (error) {
      alert("Failed to create lead.");
      console.error(error);
    } else {
      setIsModalOpen(false);
      setFormData({
        name: '', contact_number: '', service_type: 'AC Service',
        service_charge: '', amount_paid: '', requirement: '', follow_up_datetime: '', notes: '', 
        address: '', city: '', location_url: '', project_status: 'Lead', payment_status: 'Unpaid'
      });
      fetchLeads();
    }
  };

  const handleUpdateLeadField = async (id: string, updates: Partial<WebDevLead>) => {
    const { error } = await supabase
      .from('customer_followups')
      .update(updates)
      .eq('id', id);
    if (!error) {
      fetchLeads();
    } else {
      alert("Failed to update status");
    }
  };

  const handleDeleteLead = async (id: string) => {
    const { error } = await supabase
      .from('customer_followups')
      .delete()
      .eq('id', id);
    if (!error) {
      fetchLeads();
    } else {
      alert("Failed to delete lead");
    }
  };

  const handleSendWhatsApp = async (lead: WebDevLead, recipientType: 'customer' | 'technician') => {
    const followUpDate = new Date(lead.follow_up_datetime);
    const time = followUpDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const date = followUpDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    // For WhatsApp Cloud API, you typically use Templates for pro-active alerts.
    // This logic assumes you have a template named 'followup_reminder' approved in Meta.
    // For this example, we'll try to send a template-based message.
    
    const number = recipientType === 'customer' ? lead.contact_number : process.env.VITE_ADMIN_PHONE || '919219345455';
    
    const payload = {
      number: number,
      isTemplate: true,
      templateName: "followup_reminder", // Replace with your approved template name
      languageCode: "en_US",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: lead.name },
            { type: "text", text: lead.service_type },
            { type: "text", text: `${date} at ${time}` }
          ]
        }
      ]
    };

    try {
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const text = await response.text();
      let resData;
      try { resData = JSON.parse(text); } catch { throw new Error("Invalid response from server"); }
      if (response.ok) {
        alert(`WhatsApp Utility Notification sent to ${recipientType}!`);
      } else {
        alert(`WhatsApp API Error: ${resData.details?.error?.message || resData.error}. Note: This requires Meta API setup.`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while sending WhatsApp.');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rescheduleData.lead) {
      await handleUpdateLeadField(rescheduleData.lead.id, { follow_up_datetime: rescheduleData.datetime });
      setRescheduleData({ lead: null, datetime: '' });
    }
  };

  const now = new Date();

  // Segmenting leads by the requested stages
  const pendingFollowUps = leads.filter(l => l.project_status === 'Lead');
  
  const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  
  // They explicitly said: "Those whose follow-up date and time are very past for follow-up should show at the top of this column."
  const futureLeads = pendingFollowUps
     .filter(l => new Date(l.follow_up_datetime) >= now)
     .sort((a, b) => new Date(a.follow_up_datetime).getTime() - new Date(b.follow_up_datetime).getTime()); // Closest time first
  
  // Find the single absolute NEXT lead (the closest one chronologically)
  const absoluteNextLead = futureLeads.length > 0 ? futureLeads[0] : null;
  // Make sure to remove it from the rest so we don't display it twice.
  const remainingFutureLeads = futureLeads.length > 0 ? futureLeads.slice(1) : [];

  const todaysUpcomingLeads = remainingFutureLeads.filter(l => isSameDay(new Date(l.follow_up_datetime), now));
  const laterUpcomingLeads = remainingFutureLeads.filter(l => !isSameDay(new Date(l.follow_up_datetime), now));
  
  // Get missed follow-ups (past), map them, and sort descending so the most overdue (oldest) are at the top
  const overdueLeads = pendingFollowUps
     .filter(l => new Date(l.follow_up_datetime) < now)
     .sort((a, b) => new Date(a.follow_up_datetime).getTime() - new Date(b.follow_up_datetime).getTime());

  const websitesBeingBuilt = leads.filter(l => l.project_status === 'In Progress');
  const websitesBuiltPendingPayment = leads.filter(l => l.project_status === 'Built');
  const completedProjects = leads.filter(l => l.project_status === 'Delivered');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Follow-up Manager</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Reminders & Customer Follow-up System</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <Plus size={16} /> New Follow-up
        </button>
      </div>

      {/* Navigation Sub-Tabs - Simplified */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button onClick={() => setActiveTab('Pipeline')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'Pipeline' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}>Current Reminders</button>
        <button onClick={() => setActiveTab('Dashboard')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'Dashboard' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}>Insights</button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-sm">Loading leads...</div>
      ) : (
        <div className="space-y-10">
          
          {/* Dashboard Tab */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                      <Phone size={20} />
                    </div>
                    <div className="text-3xl font-black text-gray-900">{pendingFollowUps.length}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Need Follow-up</div>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3">
                      <Briefcase size={20} />
                    </div>
                    <div className="text-3xl font-black text-gray-900">{websitesBeingBuilt.length}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Sites In Progress</div>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                      <Clock size={20} />
                    </div>
                    <div className="text-3xl font-black text-gray-900">{websitesBuiltPendingPayment.length}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Built (Pending Pay)</div>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-emerald-100 border-b-4 bg-emerald-50/10 shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle size={20} />
                    </div>
                    <div className="text-3xl font-black text-emerald-700">{completedProjects.length}</div>
                    <div className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mt-1">Fully Done & Paid</div>
                 </div>
              </div>

              {/* Financial & Targets Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-gray-200">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
                   <div className="relative z-10">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Revenue Performance</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                         <div>
                            <span className="block text-3xl font-black tracking-tighter">₹{leads.reduce((acc, l) => acc + (Number(l.service_charge) || 0), 0).toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Total Pipeline</span>
                         </div>
                         <div>
                            <span className="block text-3xl font-black tracking-tighter text-emerald-400">₹{leads.reduce((acc, l) => acc + (Number(l.amount_paid) || 0), 0).toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue Collected</span>
                         </div>
                         <div className="hidden md:block">
                            <span className="block text-3xl font-black tracking-tighter text-amber-400">₹{leads.filter(l => l.payment_status !== 'Paid').reduce((acc, l) => acc + ((Number(l.service_charge) || 0) - (Number(l.amount_paid) || 0)), 0).toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Outstanding</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Monthly Target</h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <span className="text-3xl font-black text-gray-900 leading-none">
                            {Math.min(100, Math.round((completedProjects.length / 50) * 100))}%
                         </span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {completedProjects.length} / 50 Services
                         </span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                           style={{ width: `${Math.min(100, (completedProjects.length / 50) * 100)}%` }}
                         ></div>
                      </div>
                      <p className="text-[9px] font-bold text-gray-400 leading-relaxed italic">
                        "Your current pace suggests you'll hit the monthly volume target."
                      </p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Pipeline Tab (Follow Ups) */}
          {activeTab === 'Pipeline' && (
            <div className="space-y-8">
            
              {/* Overdue Inquiries - Danger Section */}
              {overdueLeads.length > 0 && (
                <div className="space-y-4 mb-4">
                  <h3 className="text-sm border-b pb-3 border-rose-200 font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={18} /> Overdue / Missed Follow-ups
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {overdueLeads.map((lead) => (
                       <LeadCard 
                         key={lead.id} 
                         lead={lead} 
                         onReschedule={(lead) => setRescheduleData({ lead, datetime: lead.follow_up_datetime })} 
                         onDelete={handleDeleteLead} 
                         isUrgent={true} 
                         onSendWhatsApp={handleSendWhatsApp}
                       />
                    ))}
                  </div>
                </div>
              )}

              {/* Absolute NEXT Follow-up (Priority Highlights) */}
              {absoluteNextLead && (
                <div className="space-y-4 mb-8">
                  <h3 className="text-sm border-b pb-3 border-indigo-200 font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={18} className="animate-pulse" /> NEXT CUSTOMER TO CONTACT
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                     <LeadCard 
                       key={absoluteNextLead.id} 
                       lead={absoluteNextLead} 
                       onReschedule={(lead) => setRescheduleData({ lead, datetime: lead.follow_up_datetime })} 
                       onDelete={handleDeleteLead} 
                       isUrgent={false} 
                       highlightAsNext={true} 
                       onSendWhatsApp={handleSendWhatsApp}
                     />
                  </div>
                </div>
              )}
              
              {/* Today's Inquiries */}
              {todaysUpcomingLeads.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm border-b pb-3 border-gray-100 font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={18} /> Also Scheduled for Today
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {todaysUpcomingLeads.map((lead, index) => (
                       <LeadCard 
                         key={lead.id} 
                         lead={lead} 
                         onReschedule={(lead) => setRescheduleData({ lead, datetime: lead.follow_up_datetime })} 
                         onDelete={handleDeleteLead} 
                         isUrgent={false} 
                         highlightAsNext={false} 
                         sequenceIndex={index + 2} // offset because the Next lead was sequence 1
                         onSendWhatsApp={handleSendWhatsApp}
                       />
                    ))}
                  </div>
                </div>
              ) : (
                !absoluteNextLead || !isSameDay(new Date(absoluteNextLead.follow_up_datetime), now) ? 
                <div className="bg-indigo-50/50 rounded-2xl p-6 text-center border border-indigo-100 border-dashed">
                   <p className="text-xs font-bold text-indigo-400/80 uppercase tracking-widest">No more inquiries scheduled for today.</p>
                </div> : null
              )}

              <div className="space-y-4 mt-12">
                <h3 className="text-sm border-b pb-3 border-gray-100 font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={18} /> Upcoming Follow-ups (Later)
                </h3>
                {laterUpcomingLeads.length === 0 ? (
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No upcoming leads.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {laterUpcomingLeads.map((lead, index) => (
                       <LeadCard 
                         key={lead.id} 
                         lead={lead} 
                         onReschedule={(lead) => setRescheduleData({ lead, datetime: lead.follow_up_datetime })} 
                         onDelete={handleDeleteLead} 
                         isUrgent={false} 
                         sequenceIndex={todaysUpcomingLeads.length + index + 2} // Continue from today's list count
                         onSendWhatsApp={handleSendWhatsApp}
                       />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* New Lead Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Follow-up Reminder">
        
        <div className="pt-2">
           <button 
             type="button"
             onClick={toggleVoiceDictation} 
             disabled={isProcessingAI}
             className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all shadow-sm
               ${isListening ? 'bg-rose-100 text-rose-600 animate-pulse' : 
                 isProcessingAI ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
           >
             <Mic size={16} />
             {isListening ? 'Click here to Stop & Process Speech...' : isProcessingAI ? 'AI Extracting Facts...' : 'Auto-Fill with Voice'}
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-gray-100 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900" placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Number</label>
              <input type="text" required value={formData.contact_number} onChange={e => setFormData({...formData, contact_number: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900" placeholder="e.g. 9876543210" />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Type</label>
              <select required value={formData.service_type} onChange={e => setFormData({...formData, service_type: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900">
                <option value="AC Service">AC Service</option>
                <option value="Washing Machine">Washing Machine</option>
                <option value="Refrigerator">Refrigerator</option>
                <option value="Water Purifier">Water Purifier</option>
                <option value="Chimney">Chimney</option>
                <option value="Geyser">Geyser</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Charge (₹)</label>
              <input type="number" required value={formData.service_charge} onChange={e => setFormData({...formData, service_charge: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900" placeholder="e.g. 15000" />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Initial Payment (₹) (Optional)</label>
              <input type="number" value={formData.amount_paid} onChange={e => setFormData({...formData, amount_paid: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900" placeholder="e.g. 0" />
            </div>
            <div className="space-y-1 text-left md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Address</label>
              <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900" placeholder="e.g. House No, Street, Landmark" />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">City</label>
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900" placeholder="e.g. Bangalore" />
            </div>
            <div className="space-y-1 text-left md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Maps Location URL</label>
              <input type="text" value={formData.location_url} onChange={e => setFormData({...formData, location_url: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900" placeholder="Paste Google Maps link here..." />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Requirement (Scope)</label>
            <textarea required rows={2} value={formData.requirement} onChange={e => setFormData({...formData, requirement: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900" placeholder="Details of what they want..."></textarea>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Follow-Up</label>
            <AMPMDateTimePicker required={true} value={formData.follow_up_datetime} onChange={val => setFormData({...formData, follow_up_datetime: val})} />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Additional Notes</label>
            <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900" placeholder="Any context for the follow up..."></textarea>
          </div>

          <button type="submit" className="w-full bg-indigo-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-100 hover:bg-black transition-all mt-4">
            Set Reminder
          </button>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal isOpen={!!rescheduleData.lead} onClose={() => setRescheduleData({ lead: null, datetime: '' })} title="Reschedule Follow-up">
        <form onSubmit={handleRescheduleSubmit} className="space-y-4 pt-4">
           <div className="space-y-1 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Date & Time</label>
              <AMPMDateTimePicker required={true} value={rescheduleData.datetime} onChange={val => setRescheduleData({...rescheduleData, datetime: val})} />
           </div>
           <button type="submit" className="w-full bg-amber-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all mt-4">
              Confirm Reschedule
           </button>
        </form>
      </Modal>
    </div>
  );
};

const LeadCard = ({ lead, onReschedule, onDelete, isUrgent, highlightAsNext = false, sequenceIndex, onSendWhatsApp }: { lead: WebDevLead, onReschedule: (lead: WebDevLead) => void, onDelete: (id: string) => void, isUrgent: boolean, highlightAsNext?: boolean, sequenceIndex?: number, onSendWhatsApp: (lead: WebDevLead, type: 'customer' | 'technician') => void }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const followUpDate = new Date(lead.follow_up_datetime);
  const formattedDate = followUpDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formattedTime = followUpDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className={`rounded-3xl border transition-all hover:shadow-2xl hover:-translate-y-1 bg-white ${highlightAsNext ? 'border-indigo-500 ring-4 ring-indigo-100 relative shadow-xl' : isUrgent && lead.project_status === 'Lead' ? 'border-rose-400 border-2 shadow-rose-100/50' : 'border-gray-200'} shadow-sm flex flex-col justify-between h-full overflow-hidden`}>
      {highlightAsNext && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10"></div>
      )}
      
      {/* Prominent Colorful Time Selector Header (Requested by user) */}
      {lead.project_status === 'Lead' && (
      <div className={`px-6 py-5 border-b ${isUrgent ? 'bg-rose-50 border-rose-100' : highlightAsNext ? 'bg-indigo-600 border-indigo-700' : 'bg-gradient-to-b from-gray-50 to-white border-gray-100'} flex items-center justify-between`}>
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${isUrgent ? 'bg-rose-100 text-rose-600' : highlightAsNext ? 'bg-white/20 text-white backdrop-blur-md' : 'bg-white text-gray-700 font-bold border border-gray-200'}`}>
                <Clock size={20} className={isUrgent ? 'animate-pulse' : ''} />
             </div>
             <div>
               <h3 className={`text-2xl font-black tracking-tighter ${highlightAsNext ? 'text-white' : isUrgent ? 'text-rose-700' : 'text-gray-900'} leading-none`}>
                 {formattedTime}
               </h3>
               <span className={`text-[11px] font-bold uppercase tracking-widest ${highlightAsNext ? 'text-indigo-200' : isUrgent ? 'text-rose-500' : 'text-gray-500'}`}>
                 {formattedDate}
               </span>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onSendWhatsApp(lead, 'technician')}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all shadow-sm ${highlightAsNext ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100'}`}
              title="Notify Technician (WhatsApp)"
            >
              <BellRing size={16} />
            </button>
            <button 
              onClick={() => {
                const followUp = new Date(lead.follow_up_datetime);
                const time = followUp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                const date = followUp.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                
                const msg = `🆕 NEW ONLINE BOOKING\n` +
                           `───────────────────\n` +
                           `👤 Customer Info:\n` +
                           `Name: ${lead.name}\n` +
                           `Phone: ${lead.contact_number}\n\n` +
                           `🛠️ Service Details:\n` +
                           `Category: ${lead.service_type}\n` +
                           `Items: ${lead.requirement}\n` +
                           `Total Amount: ₹${lead.service_charge}\n\n` +
                           `📍 Address:\n` +
                           `City: ${lead.city || 'Bangalore'} -\n` +
                           `Detail: ${lead.address || ''}\n\n` +
                           (lead.location_url ? `🔗 Location: ${lead.location_url}\n\n` : '') +
                           `⏰ Schedule:\n` +
                           `Date: ${date}\n` +
                           `Time: ${time}\n\n` +
                           `───────────────────\n` +
                           `Sent via Sofiyan Home Service App`;
                
                window.open(`https://wa.me/919219345455?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all shadow-sm ${highlightAsNext ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100'}`}
              title="Forward to Admin (WhatsApp)"
            >
              <Share2 size={16} />
            </button>
            {isUrgent && <span className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md animate-pulse shadow-sm">OVERDUE</span>}
            {highlightAsNext && <span className="bg-white text-indigo-700 shadow-sm text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">1ST UP NEXT</span>}
            {!isUrgent && !highlightAsNext && sequenceIndex && <span className="bg-gray-100 text-gray-500 shadow-sm text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-gray-200">{getOrdinal(sequenceIndex)} UP NEXT</span>}
          </div>
      </div>
      )}

      <div className="p-6 pt-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="pr-4">
            <h4 className="text-xl font-black text-gray-900 leading-tight tracking-tight">{lead.name}</h4>
            <p className="text-[11px] font-black text-indigo-600 flex items-center gap-1.5 mt-2 bg-indigo-50/80 w-fit px-2.5 py-1 rounded-lg border border-indigo-100/50 uppercase tracking-widest">
              <Briefcase size={12} /> {lead.service_type}
            </p>
          </div>
          {lead.project_status !== 'Lead' && (
             <div className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border shadow-inner bg-gray-50 text-gray-700 border-gray-200">
               {lead.project_status}
             </div>
          )}
        </div>

        <div className="space-y-4 mb-5">
          <div className="flex items-center justify-between text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100">
                <DollarSign size={15} className="text-emerald-600" />
              </div>
              <span className="text-[14px] font-bold font-mono tracking-tight text-gray-700">₹{lead.service_charge}</span>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm">
                Paid: <span className="font-mono">₹{lead.amount_paid}</span>
            </div>
          </div>
          
          <div className="flex items-start gap-3 text-gray-700 bg-amber-50/30 p-3 rounded-2xl border border-amber-50">
            <div className="bg-amber-100 p-2 rounded-xl border border-amber-200 shrink-0">
               <FileText size={16} className="text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium leading-relaxed line-clamp-2 text-gray-800">{lead.requirement}</p>
              {(lead.address || lead.city || lead.location_url) && (
                <div className="mt-2 pt-2 border-t border-amber-100/50 flex flex-wrap gap-2">
                  {lead.address && (
                    <span className="text-[10px] w-full text-gray-500 font-medium mb-1">
                      {lead.address}
                    </span>
                  )}
                  {lead.city && (
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-amber-100 text-amber-600 font-bold uppercase tracking-widest">
                      {lead.city}
                    </span>
                  )}
                  {lead.location_url && (
                    <a href={lead.location_url} target="_blank" rel="noreferrer" className="text-[10px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-indigo-600 font-bold uppercase tracking-widest flex items-center gap-1">
                      Map Link
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          {lead.notes && (
            <div className="p-4 bg-indigo-50/50 rounded-2xl text-[12px] font-medium text-gray-700 italic border border-indigo-100 relative mt-4 shadow-sm">
              <span className="absolute -top-2.5 left-4 bg-indigo-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white border border-indigo-700 rounded-full shadow-sm">Important Notes</span>
              "{lead.notes}"
            </div>
          )}
        </div>

        <div className="flex gap-2.5 mt-auto pt-4 border-t border-gray-100 items-center">
          <a 
            href={`tel:${lead.contact_number.replace(/\D/g, '')}`}
            target="_top"
            className="w-11 h-11 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center hover:bg-gray-100 hover:text-indigo-600 hover:shadow-sm border border-gray-100 transition-all shrink-0"
            title="Call"
          >
            <Phone size={16} />
          </a>
          <a 
            onClick={( ) => {
               e.preventDefault();
               const cleanNum = lead.contact_number.replace(/\D/g, '');
               const waNum = cleanNum.length === 10 ? '91' + cleanNum : cleanNum;
               window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(`Hi ${lead.name}, regarding your ${lead.service_type} required...`)}`, '_blank', 'noopener,noreferrer');
            }}
            href="#"
            className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-100 hover:shadow-sm border border-emerald-100 transition-all shrink-0 cursor-pointer"
            title="WhatsApp Chat"
          >
            <MessageCircle size={16} />
          </a>
          
          {/* WhatsApp Utility Notify Button */}
          <button 
            onClick={() => onSendWhatsApp(lead, 'customer')}
            className="w-11 h-11 bg-green-50 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-100 hover:shadow-sm border border-green-100 transition-all shrink-0"
            title="WhatsApp Utility Alert"
          >
            <BellRing size={16} />
          </button>

          {/* Reschedule Button */}
          {lead.project_status === 'Lead' && (
            <button 
              onClick={() => onReschedule(lead)}
              className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center hover:bg-amber-100 hover:shadow-sm border border-amber-100 transition-all shrink-0"
              title="Reschedule Follow-up"
            >
              <Calendar size={16} />
            </button>
          )}

          {/* Delete/Cancel Button (With 2-step confirmation to evade iframe blocking) */}
          <div className="ml-auto">
             {isConfirmingDelete ? (
                <button 
                  onClick={() => onDelete(lead.id)}
                  onMouseLeave={() => setIsConfirmingDelete(false)}
                  className="w-auto px-4 h-11 bg-rose-600 text-white rounded-xl flex items-center justify-center hover:bg-rose-700 hover:shadow-md border border-rose-700 transition-all shrink-0 font-black text-[10px] uppercase tracking-widest animate-pulse"
                  title="Confirm Delete"
                >
                  DELETE?
                </button>
             ) : (
                <button 
                  onClick={() => setIsConfirmingDelete(true)}
                  className="w-11 h-11 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-100 hover:text-rose-700 hover:shadow-sm border border-rose-100 transition-all shrink-0"
                  title="Remove Lead"
                >
                  <Trash2 size={16} />
                </button>
             )}
          </div>
        </div>
        
        {/* Action Suggestions */}
        <div className="flex flex-col gap-2 mt-4 pt-1">
             <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                 <List size={10} /> Progress & Reminders
               </p>
               <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-700">
                     <div className="w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[8px]">1</div>
                     <span>Next Follow-up Call</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-400">
                     <div className="w-4 h-4 bg-indigo-200 text-indigo-600 rounded-full flex items-center justify-center text-[8px]">2</div>
                     <span>Requirement Finalization</span>
                  </div>
               </div>
             </div>
        </div>
      </div>
    </div>
  );
};
