import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Modal } from './Modal';
import { 
  Plus, Search, Phone, MessageCircle, Calendar, Clock, DollarSign, 
  AlertCircle, CheckCircle, Briefcase, FileText, Mic, Trash2
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

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
    } catch (e) {
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

export const WebDevLeadsManager: React.FC = () => {
  const [leads, setLeads] = useState<WebDevLead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Pipeline' | 'ActiveProjects' | 'Completed' | 'Payments'>('Dashboard');
  const [rescheduleData, setRescheduleData] = useState<{ lead: WebDevLead | null, datetime: string }>({ lead: null, datetime: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    service_type: 'Website Development',
    service_charge: '',
    amount_paid: '',
    requirement: '',
    follow_up_datetime: '',
    notes: '',
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
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const processSpeechToFormWithAI = async (text: string) => {
    setIsProcessingAI(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Missing Gemini API Key in environment.');
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert AI assistant that flawlessly extracts customer lead information from messy, dictated speech.
User's raw, continuous speech transcript: "${text}"

Current system time is: ${new Date().toISOString()}

Extract the following information and return ONLY a pure JSON object. If a field isn't mentioned or is unclear, leave it null.
- name: (string) Customer's full name.
- contact_number: (string) Phone number, strip non-numeric characters.
- service_type: (string) Must be one of: "Website Development", "E-Commerce App", "Custom Software", "SEO & Marketing", or "Other". Map it best to their request.
- service_charge: (number) Extract the total quoted price/cost. Return as a number.
- amount_paid: (number) Extract any initial/advance payment made. Return as a number.
- requirement: (string) An excellent, professional summary of the project requirements and features requested.
- follow_up_datetime: (string) Convert any mentioned follow-up time into a local datetime string (YYYY-MM-DDTHH:mm format), interpreting words like "tomorrow", "next Monday", "in 3 days" accurately based on system time. If no explicit time is given but a day is, default to 10:00.
- notes: (string) Any additional context, personality traits, or instructions.

Remember, ONLY return a raw JSON object and NOTHING else.`;

      const response = await ai.models.generateContent({
         model: 'gemini-3.1-pro-preview',
         contents: prompt,
         config: {
           responseMimeType: 'application/json'
         }
      });
      
      const data = JSON.parse(response.text || '{}');
      setFormData(prev => ({
        ...prev,
        ...Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== null && v !== ''))
      }));

    } catch(err: any) {
      console.error(err);
      if (err?.message?.includes('429') || err?.message?.includes('quota') || err?.status === 'RESOURCE_EXHAUSTED' || err?.status === 429) {
          alert("AI Quota Exceeded API Limit: You have reached the usage limit for Google Voice AI on your current plan. Please wait before trying voice dictation again.");
      } else {
          alert('Failed to extract form data from speech.');
      }
    } finally {
      setIsProcessingAI(false);
    }
  };

  const fetchLeads = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('web_dev_leads')
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
      .from('web_dev_leads')
      .insert([{
        name: formData.name,
        contact_number: formData.contact_number,
        service_type: formData.service_type,
        service_charge: Number(formData.service_charge) || 0,
        amount_paid: Number(formData.amount_paid) || 0,
        requirement: formData.requirement,
        follow_up_datetime: formData.follow_up_datetime,
        notes: formData.notes,
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
        name: '', contact_number: '', service_type: 'Website Development',
        service_charge: '', amount_paid: '', requirement: '', follow_up_datetime: '', notes: '', project_status: 'Lead', payment_status: 'Unpaid'
      });
      fetchLeads();
    }
  };

  const handleUpdateLeadField = async (id: string, updates: Partial<WebDevLead>) => {
    const { error } = await supabase
      .from('web_dev_leads')
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
      .from('web_dev_leads')
      .delete()
      .eq('id', id);
    if (!error) {
      fetchLeads();
    } else {
      alert("Failed to delete lead");
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
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Web Dev CRM</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Advanced IT Lead Routing</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <Plus size={16} /> New Entry
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button onClick={() => setActiveTab('Dashboard')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition whitespace-nowrap ${activeTab === 'Dashboard' ? 'bg-gray-900 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>Overview</button>
        <button onClick={() => setActiveTab('Pipeline')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition whitespace-nowrap ${activeTab === 'Pipeline' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>Follow-ups</button>
        <button onClick={() => setActiveTab('ActiveProjects')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition whitespace-nowrap ${activeTab === 'ActiveProjects' ? 'bg-amber-500 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>In Progress</button>
        <button onClick={() => setActiveTab('Payments')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition whitespace-nowrap ${activeTab === 'Payments' ? 'bg-blue-500 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>Pending Payment</button>
        <button onClick={() => setActiveTab('Completed')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition whitespace-nowrap ${activeTab === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>Completed</button>
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
                         onUpdate={handleUpdateLeadField} 
                         onReschedule={(lead) => setRescheduleData({ lead, datetime: lead.follow_up_datetime })} 
                         onDelete={handleDeleteLead} 
                         isUrgent={true} 
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
                       onUpdate={handleUpdateLeadField} 
                       onReschedule={(lead) => setRescheduleData({ lead, datetime: lead.follow_up_datetime })} 
                       onDelete={handleDeleteLead} 
                       isUrgent={false} 
                       highlightAsNext={true} 
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
                         onUpdate={handleUpdateLeadField} 
                         onReschedule={(lead) => setRescheduleData({ lead, datetime: lead.follow_up_datetime })} 
                         onDelete={handleDeleteLead} 
                         isUrgent={false} 
                         highlightAsNext={false} 
                         sequenceIndex={index + 2} // offset because the Next lead was sequence 1
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
                         onUpdate={handleUpdateLeadField} 
                         onReschedule={(lead) => setRescheduleData({ lead, datetime: lead.follow_up_datetime })} 
                         onDelete={handleDeleteLead} 
                         isUrgent={false} 
                         sequenceIndex={todaysUpcomingLeads.length + index + 2} // Continue from today's list count
                       />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Projects Tab */}
          {activeTab === 'ActiveProjects' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                <Briefcase size={18} /> Websites Being Built
              </h3>
              {websitesBeingBuilt.length === 0 ? (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No active builds.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {websitesBeingBuilt.map(lead => <LeadCard key={lead.id} lead={lead} onUpdate={handleUpdateLeadField} onReschedule={(lead) => setRescheduleData({ lead, datetime: lead.follow_up_datetime })} onDelete={handleDeleteLead} isUrgent={false} />)}
                </div>
              )}
            </div>
          )}

          {/* Built, Pending Payment Tab */}
          {activeTab === 'Payments' && (
             <div className="space-y-4">
              <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={18} /> Built / Pending Payment
              </h3>
              {websitesBuiltPendingPayment.length === 0 ? (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No pending payments.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {websitesBuiltPendingPayment.map(lead => <LeadCard key={lead.id} lead={lead} onUpdate={handleUpdateLeadField} onReschedule={(lead) => setRescheduleData({ lead, datetime: lead.follow_up_datetime })} onDelete={handleDeleteLead} isUrgent={false} />)}
                </div>
              )}
            </div>
          )}

          {/* Completed Section (Fully Done) */}
          {activeTab === 'Completed' && completedProjects.length > 0 && (
            <div className="space-y-4 opacity-75">
              <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle size={18} /> Completed Leads
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedProjects.map(lead => <LeadCard key={lead.id} lead={lead} onUpdate={handleUpdateLeadField} onReschedule={(lead) => setRescheduleData({ lead, datetime: lead.follow_up_datetime })} onDelete={handleDeleteLead} isUrgent={false} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Lead Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Web Dev Lead">
        
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
                <option value="Website Development">Website Development</option>
                <option value="E-Commerce App">E-Commerce App</option>
                <option value="Custom Software">Custom Software</option>
                <option value="SEO & Marketing">SEO & Marketing</option>
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
            Generate Lead
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

const LeadCard = ({ lead, onUpdate, onReschedule, onDelete, isUrgent, highlightAsNext = false, sequenceIndex }: { lead: WebDevLead, onUpdate: (id: string, updates: Partial<WebDevLead>) => void, onReschedule: (lead: WebDevLead) => void, onDelete: (id: string) => void, isUrgent: boolean, highlightAsNext?: boolean, sequenceIndex?: number }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isLoggingPayment, setIsLoggingPayment] = useState(false);
  const [paymentAmt, setPaymentAmt] = useState('');

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
          {isUrgent && <span className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md animate-pulse shadow-sm">OVERDUE</span>}
          {highlightAsNext && <span className="bg-white text-indigo-700 shadow-sm text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">1ST UP NEXT</span>}
          {!isUrgent && !highlightAsNext && sequenceIndex && <span className="bg-gray-100 text-gray-500 shadow-sm text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-gray-200">{getOrdinal(sequenceIndex)} UP NEXT</span>}
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
            <p className="text-[13px] font-medium leading-relaxed line-clamp-3 text-gray-800">{lead.requirement}</p>
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
            onClick={(e) => {
               e.preventDefault();
               const cleanNum = lead.contact_number.replace(/\D/g, '');
               const waNum = cleanNum.length === 10 ? '91' + cleanNum : cleanNum;
               window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(`Hi ${lead.name}, regarding your ${lead.service_type} required...`)}`, '_blank', 'noopener,noreferrer');
            }}
            href="#"
            className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-100 hover:shadow-sm border border-emerald-100 transition-all shrink-0 cursor-pointer"
            title="WhatsApp"
          >
            <MessageCircle size={16} />
          </a>
          
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
        
        {/* Action Buttons based on status */}
        <div className="flex flex-col gap-2 mt-4 pt-1">
           {lead.project_status === 'Lead' && (
             <button 
               onClick={() => onUpdate(lead.id, { project_status: 'In Progress' })}
               className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-black hover:shadow-md transition-all shadow-sm"
             >
               Start Build Project
             </button>
           )}
           {lead.project_status === 'In Progress' && (
             <button 
               onClick={() => onUpdate(lead.id, { project_status: 'Built' })}
               className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 hover:shadow-md transition-all shadow-sm"
             >
               Mark as Built
             </button>
           )}
           {lead.project_status === 'Built' && (
             isLoggingPayment ? (
               <div className="flex gap-2">
                 <input 
                   type="number" 
                   value={paymentAmt}
                   onChange={e => setPaymentAmt(e.target.value)}
                   className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-900 text-center"
                   placeholder={`Total: ₹${lead.service_charge}`}
                   autoFocus
                 />
                 <button 
                   onClick={() => {
                     if (paymentAmt && !isNaN(Number(paymentAmt))) {
                        onUpdate(lead.id, { amount_paid: Number(paymentAmt), payment_status: 'Paid', project_status: 'Delivered', status: 'Completed' });
                     } else {
                        setIsLoggingPayment(false);
                     }
                   }}
                   className="bg-emerald-600 text-white px-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-sm"
                 >
                   Save
                 </button>
               </div>
             ) : (
               <button 
                 onClick={() => setIsLoggingPayment(true)}
                 className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-700 hover:shadow-md transition-all shadow-sm"
               >
                 Log Final Payment
               </button>
             )
           )}
           {lead.project_status === 'Delivered' && (
             <div className="w-full py-3.5 bg-gray-50 text-gray-400 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center border border-gray-200 border-dashed">
               Project Closed & Paid
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
