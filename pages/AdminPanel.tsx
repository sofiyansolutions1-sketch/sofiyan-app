import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { ADMIN_PASSWORD } from '../constants';
import { Booking, Partner } from '../types';
import { Modal } from '../components/Modal';
import { Lock, Users, Calendar, DollarSign, Activity, Clock, User, Edit2, Trash2, Phone, Search, Send, MapPin, Loader2, CheckCircle, Undo, UserPlus, FileSpreadsheet, Info, UploadCloud, FileText, Plus, MessageCircle, Star } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getCoordinatesWithGemini } from '../services/geminiService';
import { BlogManager } from '../components/BlogManager';
import { PartnerManager } from '../components/PartnerManager';

const calculateDistanceKM = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const AdminPanel: React.FC = () => {
  const { bookings, updateBooking, partners, updatePartner } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [mainTab, setMainTab] = useState<'Dashboard' | 'BlogManager' | 'PartnerManagement'>('Dashboard');
  
  // Reschedule Modal State
  const [rescheduleData, setRescheduleData] = useState<{ booking: Booking | null, date: string, time: string }>({ 
    booking: null, date: '', time: '' 
  });

  // Partner Dispatch State
  const [dispatchBooking, setDispatchBooking] = useState<Booking | null>(null);
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
  const [partnerCategoryFilter, setPartnerCategoryFilter] = useState('');
  const [partnerStatusFilter, setPartnerStatusFilter] = useState('');
  const [partnerSearchResults, setPartnerSearchResults] = useState<any[]>([]);
  const [isSearchingPartners, setIsSearchingPartners] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Mini-CRM State
  const [currentAdminTab, setCurrentAdminTab] = useState<'Pending' | 'Forwarded'>('Pending');
  const [assignModalData, setAssignModalData] = useState<{ booking: Booking | null, partnerName: string, partnerPhone: string }>({ booking: null, partnerName: '', partnerPhone: '' });
  const [isAssigning, setIsAssigning] = useState(false);

  // Add GMB Partner State
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [newPartner, setNewPartner] = useState<{
    name: string;
    phone: string;
    services: string[];
    city: string;
    address: string;
    pincode: string;
  }>({
    name: '',
    phone: '',
    services: [],
    city: '',
    address: '',
    pincode: ''
  });
  const [isSavingPartner, setIsSavingPartner] = useState(false);
  const [showHomeAppliances, setShowHomeAppliances] = useState(false);

  // Smart Follow-Up CRM State
  const [crmLeads, setCrmLeads] = useState<any[]>([]);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({
    customer_name: '',
    phone_number: '',
    service_interested: '',
    follow_up_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchTodaysFollowUps = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('follow_up_date', today)
        .eq('status', 'Pending');
      
      if (error) {
        console.error("Error fetching leads:", error);
      } else if (data) {
        setCrmLeads(data);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodaysFollowUps();
    }
  }, [isAuthenticated]);

  const saveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('leads').insert([leadForm]);
      if (error) {
        alert('Error saving lead: ' + error.message);
      } else {
        alert('Lead saved successfully!');
        setShowAddLeadModal(false);
        setLeadForm({
          customer_name: '',
          phone_number: '',
          service_interested: '',
          follow_up_date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        fetchTodaysFollowUps();
      }
    } catch (err: any) {
      alert('Error saving lead: ' + err.message);
    }
  };

  const markLeadConverted = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: 'Converted' })
        .eq('id', leadId);
        
      if (error) {
        alert('Error updating lead: ' + error.message);
      } else {
        fetchTodaysFollowUps();
      }
    } catch (err: any) {
      alert('Error updating lead: ' + err.message);
    }
  };

  const toggleService = (service: string) => {
    setNewPartner(prev => {
      const services = prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service];
      return { ...prev, services };
    });
  };

  const saveSecondaryPartner = async () => {
    const { name, phone, services, city, address, pincode } = newPartner;

    if (!name.trim() || !phone.trim() || !city.trim() || !address.trim() || !pincode.trim() || services.length === 0) {
        alert("Please fill all required fields and select at least one service.");
        return;
    }

    setIsSavingPartner(true);

    try {
        // 2. Prepare Payload
        const partnerData = {
            name: name.trim(),
            phone: phone.trim(),
            city: city.trim(),
            status: 'available',
            categories: services, // Store services as array
            address: address.trim(),
            pincode: pincode.trim(),
            email: `${phone.trim()}@partner.com`, // Dummy email
            lat: 0,
            lng: 0,
            earnings: 0,
            completed_jobs: 0
        };

        // 3. Save to Supabase
        const { error } = await supabase.from('secondary_partners').insert([partnerData]);

        if (error) throw error;

        alert(`✅ Secondary Partner '${name}' saved successfully!`);
        
        // Reset form
        setNewPartner({ name: '', phone: '', services: [], city: '', address: '', pincode: '' });
        setShowHomeAppliances(false);
        setIsAddPartnerModalOpen(false);

    } catch (e: any) {
        console.error("Save Error:", e);
        alert("Error saving partner: " + e.message);
    } finally {
        setIsSavingPartner(false);
    }
  };

  // Bulk Upload State
  const [isCsvUploadModalOpen, setIsCsvUploadModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState({
    total: 0,
    processed: 0,
    success: 0,
    errors: [] as string[],
    isComplete: false,
    currentName: ''
  });

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result as string;
        await processCSVData(text);
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const processCSVData = async (csvText: string) => {
    // Basic CSV parser (splits by newline, then comma)
    const rows = csvText.split('\n').filter(row => row.trim().length > 0);
    if (rows.length < 2) { 
        alert("CSV is empty or missing data."); 
        return; 
    }

    // Show Modal
    setIsCsvUploadModalOpen(false);
    setIsBulkUploadModalOpen(true);
    
    // Assuming Row 0 is headers. Start from Row 1.
    const totalRows = rows.length - 1;
    let successCount = 0;
    const currentErrors: string[] = [];

    setBulkUploadProgress({
        total: totalRows,
        processed: 0,
        success: 0,
        errors: [],
        isComplete: false,
        currentName: ''
    });

    for (let i = 1; i <= totalRows; i++) {
        // Basic comma split (Note: won't handle commas inside quotes perfectly, keep CSV simple)
        const cols = rows[i].split(',').map(c => c.trim()); 
        
        // Expected Format: Name, Phone, Service Types, Address, Pincode
        if (cols.length >= 5) {
            const name = cols[0];
            const phone = cols[1];
            const services = cols[2];
            const address = cols[3];
            const pincode = cols[4];

            setBulkUploadProgress(prev => ({ ...prev, currentName: name }));

            try {
                // 1. Convert Address to GPS
                const query = `${address}, ${pincode}, Mumbai`;
                const coords = await getCoordinatesWithGemini(query);

                // STRICT PARSING: Ensure coords are numbers before sending to Supabase
                const pLat = coords && coords.lat && !isNaN(Number(coords.lat)) ? parseFloat(String(coords.lat)) : null;
                const pLng = coords && coords.lng && !isNaN(Number(coords.lng)) ? parseFloat(String(coords.lng)) : null;

                console.log("🚀 SENDING BULK PARTNER GPS TO SUPABASE:", pLat, pLng, "(Type:", typeof pLat, ")");

                // 2. Prepare Payload
                const partnerData = {
                    name: name,
                    phone: phone,
                    city: 'Mumbai',
                    status: 'available',
                    categories: services.split(',').map(s => s.trim()).filter(Boolean),
                    address: address,
                    pincode: pincode,
                    lat: pLat,
                    lng: pLng,
                    email: `${phone}@partner.com`, // Dummy email
                    earnings: 0,
                    completed_jobs: 0
                };

                // 3. Save to Supabase
                const { error } = await supabase.from('secondary_partners').insert([partnerData]);
                if (error) throw error;
                
                successCount++;

            } catch (err: any) {
                currentErrors.push(`Row ${i} (${name}): ${err.message || 'Failed'}`);
            }
        } else {
            currentErrors.push(`Row ${i}: Invalid format. Needs 5 columns.`);
        }

        // Update Progress Bar
        setBulkUploadProgress(prev => ({
            ...prev,
            processed: i,
            success: successCount,
            errors: [...currentErrors]
        }));

        // CRITICAL: 1.5 Second delay to protect free Geocoding API
        await sleep(1500); 
    }

    setBulkUploadProgress(prev => ({ ...prev, isComplete: true }));
  };

  const closeProgressModal = () => {
    setIsBulkUploadModalOpen(false);
    setBulkUploadProgress({
        total: 0,
        processed: 0,
        success: 0,
        errors: [],
        isComplete: false,
        currentName: ''
    });
  };

  const openAssignModal = (booking: Booking) => {
      setAssignModalData({
          booking,
          partnerName: booking.assignedPartnerName || '',
          partnerPhone: booking.assignedPartnerPhone || ''
      });
  };

  const closeAssignModal = () => {
      setAssignModalData({ booking: null, partnerName: '', partnerPhone: '' });
  };

  const submitLeadAssignment = async () => {
      const { booking, partnerName, partnerPhone } = assignModalData;
      if (!booking) return;

      if (!partnerName || !partnerPhone || partnerPhone.length < 10) {
          alert("❌ Please enter a valid Partner Name and a 10-digit Phone Number.");
          return;
      }

      setIsAssigning(true);

      try {
          const cleanPhone = partnerPhone.replace(/[^0-9]/g, '');

          // 1. Generate Professional WhatsApp Message
          let waText = `✨ *SOFIYAN HOME SERVICE - NEW ASSIGNMENT* ✨\n\n`;
          waText += `Hello *${partnerName}*, a new service request has been assigned to you:\n\n`;
          waText += `*1️⃣ CUSTOMER DETAILS*\n`;
          waText += `👤 *Name:* ${booking.customerName}\n`;
          waText += `📞 *Phone:* ${booking.contactNumber}\n`;
          waText += `📍 *City:* ${booking.city || ''} - ${booking.pinCode || ''}\n`;
          waText += `🏠 *Address:* ${booking.address || 'Not Provided'}\n`;
          waText += `🗺️ *Location Map:* ${booking.location_link ? booking.location_link : 'No link provided'}\n\n`;
          
          waText += `*2️⃣ SERVICE REQUIREMENTS*\n`;
          waText += `🛠️ *Services Required:*\n`;
          if (booking.cartItems && Array.isArray(booking.cartItems) && booking.cartItems.length > 0) {
              booking.cartItems.forEach(item => { waText += `👉 ${item.name} (Qty: ${item.quantity || 1})\n`; });
          } else {
              waText += `👉 ${booking.subServiceName}\n`;
          }
          if (booking.description) {
              waText += `📝 *Notes:* ${booking.description}\n`;
          }
          waText += `📅 *Preferred Date:* ${booking.date}\n`;
          waText += `⏰ *Preferred Time:* ${booking.time}\n\n`;
          waText += `💵 *Service Charge:* ₹${booking.price}\n\n`;
          
          waText += `🚀 *Please call the customer immediately to confirm!*`;

          // 2. Generate the WhatsApp Deep Link
          const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waText)}`;

          // 3. Update Database in Background
          supabase.from('bookings').update({
              status: 'Forwarded',
              assigned_partner_name: partnerName,
              assigned_partner_phone: cleanPhone
          }).eq('id', booking.id).then(({error}) => {
              if(error) console.error("DB Update Failed:", error);
          });

          // 4. Update UI and Open WhatsApp
          closeAssignModal();
          
          // Optimistic update
          updateBooking({
              ...booking,
              status: 'Forwarded',
              assignedPartnerName: partnerName,
              assignedPartnerPhone: cleanPhone
          });
          
          // Open WhatsApp in a new tab
          window.open(whatsappUrl, '_blank');

      } catch (e: any) {
          console.error("Format Error:", e);
          alert("Something went wrong while formatting the lead data.");
      } finally {
          setIsAssigning(false);
      }
  };



  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Access Denied: Incorrect Password");
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;

    // 1. If a partner was assigned, free them up
    if (booking.assignedPartnerId) {
      const partner = partners.find(p => p.id === booking.assignedPartnerId);
      if (partner) {
        const updatedPartner: Partner = { ...partner, status: 'available' };
        updatePartner(updatedPartner);
      }
    }

    // 2. Update booking status
    const updatedBooking: Booking = { 
      ...booking, 
      status: 'cancelled',
      assignedPartnerId: undefined, // Remove assignment
      assignedPartnerName: undefined,
      assignedPartnerPhone: undefined
    };
    
    // Optimistic update to hide from list immediately
    updateBooking(updatedBooking);
    
    // Force refresh to ensure list is filtered correctly
    setTimeout(() => {
        window.location.reload(); 
    }, 500);
  };

  const openRescheduleModal = (booking: Booking) => {
    setRescheduleData({ booking, date: booking.date, time: booking.time });
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleData.booking) return;

    const updatedBooking: Booking = {
      ...rescheduleData.booking,
      date: rescheduleData.date,
      time: rescheduleData.time
    };

    updateBooking(updatedBooking);
    setRescheduleData({ booking: null, date: '', time: '' });
  };

  const handleRevertToPending = async (booking: Booking) => {
    if (!window.confirm("Are you sure you want to revert this lead to 'Pending'? The current partner will be unassigned and you can assign a new one.")) {
        return;
    }

    try {
        // 1. If a partner was assigned, free them up
        if (booking.assignedPartnerId) {
          const partner = partners.find(p => p.id === booking.assignedPartnerId);
          if (partner) {
            const updatedPartner: Partner = { ...partner, status: 'available' };
            updatePartner(updatedPartner);
          }
        }

        // 2. Update Supabase: Set status back to Pending and remove the assigned partner
        const { error } = await supabase
            .from('bookings')
            .update({ 
                status: 'pending', 
                assigned_partner_id: null,
                assigned_partner_name: null,
                assigned_partner_phone: null
            })
            .eq('id', booking.id);
            
        if (error) throw error;
        
        alert('Lead is now Pending again! You can now search for a new partner.');
        
        // Force refresh to ensure list is filtered correctly
        window.location.reload();
        
    } catch (error) {
        console.error('Error reverting lead:', error);
        alert('Failed to update lead. Please check the console.');
    }
  };

    const handleRatePartner = async (booking: Booking) => {
        if (!booking.assignedPartnerId) return;
        const ratingStr = window.prompt('Rate the partner from 1 to 5:');
        if (!ratingStr) return;
        const rating = parseFloat(ratingStr);
        if (isNaN(rating) || rating < 1 || rating > 5) {
            alert('Invalid rating. Please enter a number between 1 and 5.');
            return;
        }

        try {
            const partner = partners.find(p => p.id === booking.assignedPartnerId);
            if (!partner) throw new Error('Partner not found');

            const newReviewCount = (partner.review_count || 0) + 1;
            const newRating = ((partner.rating || 0) * (partner.review_count || 0) + rating) / newReviewCount;

            const table = partner.partner_type === 'Primary' ? 'primary_partners' : 'secondary_partners';
            const { error } = await supabase
                .from(table)
                .update({ rating: newRating, review_count: newReviewCount })
                .eq('id', partner.id);

            if (error) throw error;
            updatePartner({ ...partner, rating: newRating, review_count: newReviewCount });
            alert('Partner rated successfully!');
        } catch (error) {
            console.error('Error rating partner:', error);
            alert('Failed to rate partner.');
        }
    };

  // Real Supabase Partner Search Logic
  const handlePartnerSearch = async () => {
    setIsSearchingPartners(true);
    setHasSearched(true);
    setPartnerSearchResults([]);

    try {
        const query = partnerSearchQuery.trim();
        
        let primaryQuery = supabase.from('primary_partners').select('*');
        let secondaryQuery = supabase.from('secondary_partners').select('*');
        
        if (query) {
            primaryQuery = primaryQuery.or(`pincode.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%`);
            secondaryQuery = secondaryQuery.or(`pincode.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%`);
        }

        if (partnerCategoryFilter) {
            primaryQuery = primaryQuery.contains('categories', [partnerCategoryFilter]);
            secondaryQuery = secondaryQuery.contains('categories', [partnerCategoryFilter]);
        }

        if (partnerStatusFilter) {
            primaryQuery = primaryQuery.eq('status', partnerStatusFilter);
            secondaryQuery = secondaryQuery.eq('status', partnerStatusFilter);
        }

        const [primaryRes, secondaryRes] = await Promise.all([primaryQuery, secondaryQuery]);
        
        if (primaryRes.error) throw primaryRes.error;
        if (secondaryRes.error) throw secondaryRes.error;

        const primaryData = (primaryRes.data || []).map((p: any) => ({ ...p, partner_type: 'Primary' }));
        const secondaryData = (secondaryRes.data || []).map((p: any) => ({ ...p, partner_type: 'Secondary' }));

        let results = [...primaryData, ...secondaryData];

        let bookingLat = dispatchBooking?.lat;
        let bookingLng = dispatchBooking?.lng;

        if (dispatchBooking && (!bookingLat || !bookingLng)) {
            const queryAddress = `${dispatchBooking.address}, ${dispatchBooking.pinCode}, ${dispatchBooking.city || ''}`;
            const coords = await getCoordinatesWithGemini(queryAddress);
            if (coords) {
                bookingLat = coords.lat;
                bookingLng = coords.lng;
            }
        }

        // If we have a booking with lat/lng, calculate distance and sort
        if (bookingLat && bookingLng) {
            results = results.map(partner => {
                if (partner.lat && partner.lng) {
                    const distance = calculateDistanceKM(bookingLat!, bookingLng!, partner.lat, partner.lng);
                    return { ...partner, distance };
                }
                return { ...partner, distance: Infinity };
            });

            // Filter within 10km if no manual query is provided
            if (!query) {
                results = results.filter(p => p.distance <= 10);
            }

            // Sort: Primary first, then by distance
            results.sort((a, b) => {
                const aType = a.partner_type === 'Primary' ? 0 : 1;
                const bType = b.partner_type === 'Primary' ? 0 : 1;
                if (aType !== bType) return aType - bType;
                return (a.distance || Infinity) - (b.distance || Infinity);
            });
        }

        setPartnerSearchResults(results);
    } catch (error) {
        console.error('Error searching partners:', error);
        alert('Failed to search partners. Please check connection.');
    } finally {
        setIsSearchingPartners(false);
    }
  };

  useEffect(() => {
    if (dispatchBooking) {
        setPartnerCategoryFilter(dispatchBooking.serviceCategory || '');
        handlePartnerSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatchBooking]);



  useEffect(() => {
    (window as any).assignPartnerToLead = async (leadId: string, partnerId: string, partnerName: string, partnerPhone: string) => {
      const booking = bookings.find(b => b.id === leadId);
      if (!booking) return;

      try {
          const cleanPhone = partnerPhone.replace(/[^0-9]/g, '');

          // 1. Generate Professional WhatsApp Message
          let waText = `✨ *SOFIYAN HOME SERVICE - NEW ASSIGNMENT* ✨\n\n`;
          waText += `Hello *${partnerName}*, a new service request has been assigned to you:\n\n`;
          waText += `*1️⃣ CUSTOMER DETAILS*\n`;
          waText += `👤 *Name:* ${booking.customerName}\n`;
          waText += `📞 *Phone:* ${booking.contactNumber}\n`;
          waText += `📍 *City:* ${booking.city || ''} - ${booking.pinCode || ''}\n`;
          waText += `🏠 *Address:* ${booking.address || 'Not Provided'}\n`;
          waText += `🗺️ *Location Map:* ${booking.location_link ? booking.location_link : 'No link provided'}\n\n`;
          
          waText += `*2️⃣ SERVICE REQUIREMENTS*\n`;
          waText += `🛠️ *Services Required:*\n`;
          if (booking.cartItems && Array.isArray(booking.cartItems) && booking.cartItems.length > 0) {
              booking.cartItems.forEach(item => { waText += `👉 ${item.name} (Qty: ${item.quantity || 1})\n`; });
          } else {
              waText += `👉 ${booking.subServiceName}\n`;
          }
          if (booking.description) {
              waText += `📝 *Notes:* ${booking.description}\n`;
          }
          waText += `📅 *Preferred Date:* ${booking.date}\n`;
          waText += `⏰ *Preferred Time:* ${booking.time}\n\n`;
          waText += `💵 *Service Charge:* ₹${booking.price}\n\n`;
          
          waText += `🚀 *Please call the customer immediately to confirm!*`;

          // 2. Generate the WhatsApp Deep Link
          const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waText)}`;

          // 3. Update Database in Background
          supabase.from('bookings').update({
              status: 'Forwarded',
              assigned_partner_id: partnerId,
              assigned_partner_name: partnerName,
              assigned_partner_phone: cleanPhone
          }).eq('id', booking.id).then(({error}) => {
              if(error) console.error("DB Update Failed:", error);
          });

          // Also update partner status to busy
          const partner = partners.find(p => p.id === partnerId);
          if (partner) {
              updatePartner({ ...partner, status: 'busy' });
          }

          // 4. Update UI and Open WhatsApp
          if ((window as any).closeMatchModal) {
              (window as any).closeMatchModal();
          }
          
          // Optimistic update
          updateBooking({
              ...booking,
              status: 'Forwarded',
              assignedPartnerId: partnerId,
              assignedPartnerName: partnerName,
              assignedPartnerPhone: cleanPhone
          });
          
          // Open WhatsApp in a new tab
          window.open(whatsappUrl, '_blank');

      } catch (e: any) {
          console.error("Format Error:", e);
          alert("Something went wrong while formatting the lead data.");
      }
    };
  }, [bookings, updateBooking, partners, updatePartner]);

  // Generate WhatsApp Message for Admin
  const getAdminWhatsAppLink = (booking: Booking) => {
      // 1. Format Services Text
      let servicesText = "Services";
      if (booking.cartItems && Array.isArray(booking.cartItems) && booking.cartItems.length > 0) {
        servicesText = booking.cartItems.map(item => `${item.name} (x${item.quantity || 1})`).join(', ');
      } else {
          servicesText = booking.subServiceName;
      }

      // 2. Create Attractive WhatsApp Message Template
      let waText = `✨ *SOFIYAN HOME SERVICE - NEW LEAD* ✨\n\n`;
      waText += `*1️⃣ CUSTOMER DETAILS*\n`;
      waText += `👤 *Name:* ${booking.customerName}\n`;
      waText += `📞 *Phone:* ${booking.contactNumber}\n`;
      waText += `📍 *City:* ${booking.city || 'N/A'} - ${booking.pinCode || 'N/A'}\n`;
      waText += `🏠 *Address:* ${booking.address || 'Not Provided'}\n`;
      waText += `🗺️ *Location Map:* ${booking.location_link ? booking.location_link : 'Not provided'}\n\n`;
      waText += `*2️⃣ SERVICE REQUIREMENTS*\n`;
      waText += `🛠️ *Services:* ${servicesText}\n`;
      if (booking.description) {
          waText += `📝 *Notes:* ${booking.description}\n`;
      }
      waText += `📅 *Preferred Date:* ${booking.date}\n`;
      waText += `⏰ *Preferred Time:* ${booking.time}\n\n`;
      waText += `💵 *Service Charge:* ₹${booking.price}\n\n`;
      waText += `📌 *Current Status:* ${booking.status.toUpperCase()}`;

      // Encode for URL
      const encodedWaText = encodeURIComponent(waText);
      // Admin's specific WhatsApp Number link
      return `https://wa.me/919219345455?text=${encodedWaText}`;
  };

  const renderPartnerCell = (booking: Booking) => {
    if (booking.assignedPartnerName) {
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-indigo-700 font-medium text-sm">
             <User size={14} /> {booking.assignedPartnerName}
          </div>
          {booking.assignedPartnerPhone ? (
             <a 
               href={`tel:${booking.assignedPartnerPhone}`} 
               className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-white hover:bg-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-100 transition-all shadow-sm"
             >
               <Phone size={12} className="fill-current" /> Call Partner
             </a>
          ) : (
             <span className="text-xs text-gray-400">No contact info</span>
          )}
        </div>
      );
    }

    if (!booking.assignedPartnerId) {
      return <span className="text-gray-400 italic text-xs">Waiting for partner...</span>;
    }

    const partner = partners.find(p => p.id === booking.assignedPartnerId);
    if (!partner) {
      return <span className="text-red-400 text-xs">Partner not found</span>;
    }

    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-indigo-700 font-medium text-sm">
           <User size={14} /> {partner.name}
        </div>
        {partner.phone ? (
           <a 
             href={`tel:${partner.phone}`} 
             className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-white hover:bg-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-100 transition-all shadow-sm"
           >
             <Phone size={12} className="fill-current" /> Call Partner
           </a>
        ) : (
           <span className="text-xs text-gray-400">No contact info</span>
        )}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border-t-4 border-indigo-900">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-4 rounded-full">
              <Lock className="w-8 h-8 text-gray-800" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter secure key..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
            />
            <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-colors">
              Unlock Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Stats Calculation
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((acc, curr) => acc + (curr.price * 0.25), 0);
  
  const pendingJobs = bookings.filter(b => b.status === 'pending').length;
  const completedJobs = bookings.filter(b => b.status === 'completed').length;

  const displayedBookings = bookings.filter(b => {
    if (currentAdminTab === 'Pending') return b.status === 'pending';
    if (currentAdminTab === 'Forwarded') return b.status === 'Forwarded' || b.status === 'accepted' || b.status === 'completed';
    return false;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Founder Dashboard</h1>
          <p className="text-gray-500">Overview of business performance</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setIsAddPartnerModalOpen(true)} 
              className="bg-indigo-800 text-white text-sm font-bold py-2 px-4 rounded hover:bg-indigo-900 flex items-center"
            >
              <UserPlus className="mr-2" size={16} /> Add GMB Partner
            </button>
            <input 
              type="file" 
              id="csv-upload-file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleCSVUpload} 
            />
            <button 
              onClick={() => setIsCsvUploadModalOpen(true)} 
              className="bg-green-700 text-white text-sm font-bold py-2 px-4 rounded hover:bg-green-800 flex items-center"
            >
              <FileSpreadsheet className="mr-2" size={16} /> Bulk Upload (CSV)
            </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setMainTab('Dashboard')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors ${
            mainTab === 'Dashboard'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Activity className="inline-block mr-2" size={18} />
          Dashboard
        </button>
        <button
          onClick={() => setMainTab('BlogManager')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors ${
            mainTab === 'BlogManager'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <FileText className="inline-block mr-2" size={18} />
          Blog Manager
        </button>
        <button
          onClick={() => setMainTab('PartnerManagement')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors ${
            mainTab === 'PartnerManagement'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Users className="inline-block mr-2" size={18} />
          Partner Management
        </button>
      </div>

      {mainTab === 'BlogManager' && <BlogManager />}
      {mainTab === 'PartnerManagement' && <PartnerManager />}

      {mainTab === 'Dashboard' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Total Commission" 
          value={`₹${totalRevenue.toFixed(2)}`} 
          icon={<DollarSign className="text-green-600" />} 
          bg="bg-green-50"
        />
        <StatCard 
          title="Active Partners" 
          value={partners.length.toString()} 
          icon={<Users className="text-blue-600" />} 
          bg="bg-blue-50"
        />
        <StatCard 
          title="Pending Jobs" 
          value={pendingJobs.toString()} 
          icon={<Activity className="text-orange-600" />} 
          bg="bg-orange-50"
        />
        <StatCard 
          title="Completed Jobs" 
          value={completedJobs.toString()} 
          icon={<Calendar className="text-purple-600" />} 
          bg="bg-purple-50"
        />
      </div>

      {/* Smart Follow-Up CRM Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Phone className="text-indigo-600" /> Today's Follow-ups
          </h2>
          <button 
            onClick={() => setShowAddLeadModal(true)} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" /> Add Lead
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crmLeads.map(lead => (
            <div key={lead.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{lead.customer_name}</h3>
                  <p className="text-indigo-600 font-medium text-sm">{lead.service_interested}</p>
                </div>
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-semibold">
                  Pending
                </span>
              </div>
              
              {lead.notes && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm text-gray-600 border border-gray-100">
                  {lead.notes}
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <a 
                  href={`tel:${lead.phone_number}`} 
                  className="flex-1 bg-green-50 text-green-700 py-2.5 rounded-lg flex justify-center items-center gap-2 hover:bg-green-100 font-medium transition"
                >
                  <Phone className="w-4 h-4" /> Call
                </a>
                <a 
                  href={`https://wa.me/91${lead.phone_number}?text=${encodeURIComponent(`Hello ${lead.customer_name}, aapne ${lead.service_interested} ke liye inquiry ki thi. Kya hum aaj service schedule karein?`)}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 bg-green-500 text-white py-2.5 rounded-lg flex justify-center items-center gap-2 hover:bg-green-600 font-medium transition shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
              
              <button 
                onClick={() => markLeadConverted(lead.id)} 
                className="w-full mt-3 border border-gray-200 text-gray-600 py-2.5 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-50 font-medium transition"
              >
                <CheckCircle className="w-4 h-4" /> Mark as Done/Converted
              </button>
            </div>
          ))}
          
          {crmLeads.length === 0 && (
            <div className="col-span-full bg-gray-50 p-10 text-center rounded-xl border border-dashed border-gray-300">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
              <p className="text-gray-500">No follow-ups scheduled for today.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Lead Management Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Lead Management</h3>
            <span className="text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full">
              {displayedBookings.length} Total Records
            </span>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b">
              <button 
                  onClick={() => setCurrentAdminTab('Pending')} 
                  className={`flex-1 py-3 text-center font-bold transition-colors ${currentAdminTab === 'Pending' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`}
              >
                  New Leads
              </button>
              <button 
                  onClick={() => setCurrentAdminTab('Forwarded')} 
                  className={`flex-1 py-3 text-center font-bold transition-colors ${currentAdminTab === 'Forwarded' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`}
              >
                  Forwarded
              </button>
          </div>

          <div className="p-4 bg-gray-50">
            {displayedBookings.map(booking => {
               const waLink = getAdminWhatsAppLink(booking);
               let servicesText = "Services";
               if (booking.cartItems && Array.isArray(booking.cartItems) && booking.cartItems.length > 0) {
                 servicesText = booking.cartItems.map(item => `${item.name} (x${item.quantity || 1})`).join(', ');
               } else {
                   servicesText = booking.subServiceName;
               }

               return (
                <div key={booking.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
                    <div className="flex justify-between items-center border-b pb-2 mb-2">
                        <span className="font-bold text-gray-800">#{booking.id.substring(0,6).toUpperCase()} - ₹{booking.price}</span>
                        <div className="flex space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold flex items-center
                                ${booking.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'}`}>
                                {booking.status.toUpperCase()}
                            </span>
                            {booking.status === 'completed' && booking.assignedPartnerId && (
                                <button 
                                    onClick={() => handleRatePartner(booking)}
                                    className="text-xs bg-yellow-50 text-yellow-600 px-3 py-1 rounded border border-yellow-200 hover:bg-yellow-100 font-bold flex items-center transition"
                                >
                                    <Star size={14} className="mr-1" /> Rate Partner
                                </button>
                            )}
                            <a href={waLink} target="_blank" rel="noopener noreferrer" title="Forward to Admin WhatsApp" className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded border border-green-200 hover:bg-green-100 font-bold flex items-center transition">
                                <Send size={14} className="mr-1" /> Forward
                            </a>
                            <button 
                                onClick={() => {
                                    if ((window as any).openInvoiceModal) {
                                        (window as any).openInvoiceModal(
                                            booking.id, 
                                            booking.assignedPartnerPhone || '', 
                                            booking.assignedPartnerName || 'Admin', 
                                            booking.customerName, 
                                            servicesText, 
                                            booking.price
                                        );
                                    }
                                }}
                                className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded border border-emerald-200 hover:bg-emerald-100 font-bold flex items-center transition"
                            >
                                🧾 Generate Bill
                            </button>
                        </div>
                    </div>
                    
                    <div className="mb-3 text-sm text-gray-700 space-y-1">
                        <p><User size={14} className="inline text-indigo-500 w-5 mr-1"/> <strong>Customer:</strong> {booking.customerName}</p>
                        <div className="flex space-x-2 mt-2 mb-3">
                            <a href={`tel:${booking.contactNumber}`} className="flex-1 bg-blue-100 text-blue-700 text-xs font-bold py-1.5 rounded text-center hover:bg-blue-200 flex items-center justify-center"><Phone size={12} className="mr-1"/> Call</a>
                            <a href={`https://wa.me/91${booking.contactNumber}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-100 text-green-700 text-xs font-bold py-1.5 rounded text-center hover:bg-green-200 flex items-center justify-center"><Send size={12} className="mr-1"/> Chat</a>
                        </div>
                        {booking.location_link && (
                            <a href={booking.location_link} target="_blank" rel="noopener noreferrer" className="block w-full bg-indigo-100 text-indigo-700 text-xs font-bold py-2 rounded text-center hover:bg-indigo-200 flex items-center justify-center mt-2 mb-2 border border-indigo-200">
                                📍 View Map (Google Maps)
                            </a>
                        )}
                        <p><MapPin size={14} className="inline text-red-500 w-5 mr-1"/> <strong>Address:</strong> {booking.address || 'Not Provided'}, {booking.city || ''} ({booking.pinCode})</p>
                        <p><Clock size={14} className="inline text-blue-500 w-5 mr-1"/> <strong>Time:</strong> {booking.date} | {booking.time}</p>
                        <p><Activity size={14} className="inline text-gray-500 w-5 mr-1"/> <strong>Job:</strong> {servicesText}</p>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        {booking.status === 'pending' ? (
                            <>
                                <p className="text-xs font-bold text-red-500">Action Required: Assign Partner</p>
                                <div className="mt-3 space-y-2">
                                    <button 
                                        onClick={() => openAssignModal(booking)}
                                        className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition flex justify-center items-center"
                                    >
                                        <Send className="mr-2" size={16} /> Assign & Forward (Manual)
                                    </button>
                                    <button 
                                        onClick={() => setDispatchBooking(booking)}
                                        className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition flex justify-center items-center"
                                    >
                                        <Search className="mr-2" size={16} /> Find Partner (DB Search)
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if ((window as any).openMatchModal) {
                                                (window as any).openMatchModal(booking.id, encodeURIComponent(JSON.stringify(booking)));
                                            }
                                        }}
                                        className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition flex justify-center items-center"
                                    >
                                        <Search className="mr-2" size={16} /> Smart Assign Partner
                                    </button>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button 
                                        onClick={() => openRescheduleModal(booking)}
                                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-100 font-bold transition"
                                        title="Reschedule"
                                    >
                                        Reschedule
                                    </button>
                                    <button onClick={() => handleCancelBooking(booking)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded border border-red-200 hover:bg-red-100 font-bold transition">
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (booking.status === 'accepted' || booking.status === 'Forwarded') ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-green-600 flex items-center"><CheckCircle size={14} className="mr-1"/> Partner Assigned</p>
                                    <div className="ml-4">{renderPartnerCell(booking)}</div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div className="flex gap-2 w-full justify-end">
                                        <button 
                                            onClick={() => {
                                                if ((window as any).openMatchModal) {
                                                    (window as any).openMatchModal(booking.id, encodeURIComponent(JSON.stringify(booking)));
                                                }
                                            }}
                                            className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded border border-red-200 hover:bg-red-100 font-bold transition flex items-center"
                                            title="Remove & Re-assign Partner"
                                        >
                                            <Trash2 size={14} className="mr-1" /> Remove & Re-assign
                                        </button>
                                        <button 
                                            onClick={() => openRescheduleModal(booking)}
                                            className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-100 font-bold transition flex items-center"
                                            title="Reschedule"
                                        >
                                            <Edit2 size={14} className="mr-1" /> Reschedule
                                        </button>
                                        <button 
                                            onClick={() => handleRevertToPending(booking)}
                                            className="text-xs bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded border border-yellow-200 hover:bg-yellow-100 font-bold transition flex items-center"
                                            title="Unassign partner and make pending"
                                        >
                                            <Undo size={14} className="mr-1" /> Make Pending
                                        </button>
                                        <button onClick={() => handleCancelBooking(booking)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded border border-red-200 hover:bg-red-100 font-bold transition flex items-center">
                                            <Trash2 size={14} className="mr-1" /> Cancel
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <span className="text-xs text-gray-400">No actions available</span>
                        )}
                    </div>
                </div>
               );
            })}
            {bookings.length === 0 && (
                <div className="text-center py-8 text-gray-400">No bookings yet</div>
            )}
          </div>
        </div>

        {/* Partners List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Partner Status</h3>
            <button 
              onClick={() => setIsCsvUploadModalOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition text-sm"
            >
              <UploadCloud className="w-4 h-4" /> Bulk Upload Partners
            </button>
          </div>
           <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Current Status</th>
                  <th className="px-6 py-3 text-center">Completed Jobs</th>
                </tr>
              </thead>
              <tbody>
                {partners.map(partner => (
                  <tr key={partner.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{partner.name}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin size={10} className="text-red-400"/> {partner.city || 'City N/A'}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-gray-600 font-mono text-xs">{partner.phone || '-'}</div>
                        <div className="text-xs text-indigo-600 mt-1 font-medium">
                            {partner.categories ? (Array.isArray(partner.categories) ? partner.categories.join(', ') : partner.categories) : 'N/A'}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{partner.email}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${partner.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {partner.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">{partner.completedJobs}</td>
                  </tr>
                ))}
                 {partners.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No partners registered</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      <Modal 
        isOpen={!!rescheduleData.booking} 
        onClose={() => setRescheduleData({ booking: null, date: '', time: '' })}
        title="Reschedule Booking"
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-4">
            <p><strong>Customer:</strong> {rescheduleData.booking?.customerName}</p>
            <p><strong>Service:</strong> {rescheduleData.booking?.subServiceName}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">New Date</label>
            <input 
              type="date" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={rescheduleData.date}
              onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">New Time</label>
            <input 
              type="time" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={rescheduleData.time}
              onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
             <button 
               type="button"
               onClick={() => setRescheduleData({ booking: null, date: '', time: '' })}
               className="flex-1 px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg"
             >
               Cancel
             </button>
             <button 
               type="submit"
               className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md"
             >
               Update Schedule
             </button>
          </div>
        </form>
      </Modal>

      {/* Partner Dispatch Modal - Upgraded with Real DB Search */}
      <Modal 
        isOpen={!!dispatchBooking} 
        onClose={() => setDispatchBooking(null)}
        title="Dispatch Lead"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-800 mb-4 border border-gray-200">
             <p className="font-bold">{dispatchBooking?.serviceCategory} Request</p>
             <p className="text-xs text-gray-500 mt-1"><MapPin size={12} className="inline mr-1"/>{dispatchBooking?.address} ({dispatchBooking?.pinCode})</p>
          </div>

          <div className="pt-2 border-t border-gray-100">
             <h4 className="text-sm font-bold text-gray-700 mb-2">Find Partner (Real-time Database)</h4>
             <div className="flex flex-col space-y-2 mb-3">
                 <div className="flex space-x-2">
                     <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input 
                          type="text" 
                          placeholder="Enter Area or Pincode" 
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                          value={partnerSearchQuery}
                          onChange={(e) => setPartnerSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handlePartnerSearch()}
                        />
                     </div>
                     <select
                        className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
                        value={partnerCategoryFilter}
                        onChange={(e) => setPartnerCategoryFilter(e.target.value)}
                     >
                        <option value="">All Categories</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="AC">AC</option>
                        <option value="WashingMachine">Washing Machine</option>
                        <option value="Refrigerator">Refrigerator</option>
                        <option value="WaterPurifier">Water Purifier</option>
                        <option value="Television">Television</option>
                        <option value="Microwave">Microwave</option>
                        <option value="Geyser">Geyser</option>
                        <option value="Chimney">Chimney</option>
                        <option value="Cleaning">Cleaning</option>
                     </select>
                     <select
                        className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
                        value={partnerStatusFilter}
                        onChange={(e) => setPartnerStatusFilter(e.target.value)}
                     >
                        <option value="">All Statuses</option>
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                     </select>
                     <button 
                        onClick={handlePartnerSearch}
                        disabled={isSearchingPartners}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[50px]"
                     >
                        {isSearchingPartners ? <Loader2 className="animate-spin w-4 h-4"/> : 'Go'}
                     </button>
                 </div>
             </div>
             
             <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {isSearchingPartners && (
                    <div className="text-center py-4">
                        <Loader2 className="animate-spin w-6 h-6 text-indigo-500 mx-auto"/>
                        <p className="text-xs text-gray-400 mt-2">Searching database...</p>
                    </div>
                )}

                {!isSearchingPartners && !hasSearched && (
                   <p className="text-xs text-gray-400 text-center py-4">Enter location to find registered partners.</p>
                )}

                {!isSearchingPartners && hasSearched && partnerSearchResults.length === 0 && (
                   <p className="text-xs text-red-500 text-center py-4">No registered partners found in this area.</p>
                )}

                {!isSearchingPartners && partnerSearchResults.length > 0 && (
                   partnerSearchResults.map(partner => {
                     return (
                        <div key={partner.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-indigo-50 transition-colors animate-fadeIn">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-bold text-gray-800">
                                        {partner.partner_type === 'Primary' ? `${partner.first_name} ${partner.last_name || ''}` : partner.name}
                                    </p>
                                    {partner.partner_type === 'Primary' ? (
                                        <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-200">⭐ Primary</span>
                                    ) : (
                                        <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-300">🗂️ Secondary (GMB)</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                                    <MapPin size={10} className="text-red-400"/> 
                                    {partner.city ? partner.city + ', ' : ''}{partner.address ? (partner.address.length > 25 ? partner.address.substring(0, 25) + '...' : partner.address) : 'Location NA'} - {partner.pincode}
                                </p>
                                {partner.distance !== undefined && partner.distance !== Infinity && (
                                    <p className="text-xs text-indigo-600 font-semibold mt-1">
                                        📍 {partner.distance.toFixed(1)} km away
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col space-y-2 items-end">
                                <a 
                                  href={`tel:${partner.phone}`} 
                                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded font-bold hover:bg-blue-200 transition flex items-center justify-center w-full" 
                                  title="Call Partner"
                                >
                                    <Phone size={12} className="mr-1" /> Call
                                </a>
                                <button 
                                  onClick={() => {
                                      setAssignModalData({
                                          booking: dispatchBooking,
                                          partnerName: partner.partner_type === 'Primary' ? `${partner.first_name} ${partner.last_name || ''}`.trim() : partner.name,
                                          partnerPhone: partner.phone || ''
                                      });
                                      setDispatchBooking(null);
                                  }}
                                  className="text-xs bg-green-600 text-white px-3 py-1.5 rounded font-bold hover:bg-green-700 transition flex items-center justify-center w-full" 
                                  title="Assign & WhatsApp Info"
                                >
                                    <Send size={12} className="mr-1" /> Assign & WhatsApp Info
                                </button>
                            </div>
                        </div>
                     );
                   })
                )}
             </div>
          </div>
        </div>
      </Modal>

      {/* Assign Partner Modal (Manual CRM) */}
      <Modal 
        isOpen={!!assignModalData.booking} 
        onClose={closeAssignModal}
        title="Assign Partner & Forward Lead"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-800 mb-4 border border-gray-200">
             <p className="font-bold">Assigning Lead #{assignModalData.booking?.id.substring(0,6).toUpperCase()}</p>
             <p className="text-xs text-gray-500 mt-1"><MapPin size={12} className="inline mr-1"/>{assignModalData.booking?.address} ({assignModalData.booking?.pinCode})</p>
          </div>

          <div className="space-y-3">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rahul Sharma" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={assignModalData.partnerName}
                  onChange={(e) => setAssignModalData({...assignModalData, partnerName: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner WhatsApp Number</label>
                <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        +91
                    </span>
                    <input 
                      type="tel" 
                      placeholder="9876543210" 
                      maxLength={10}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                      value={assignModalData.partnerPhone}
                      onChange={(e) => setAssignModalData({...assignModalData, partnerPhone: e.target.value.replace(/\D/g, '')})}
                    />
                </div>
             </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button 
               onClick={closeAssignModal}
               className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
             >
               Cancel
             </button>
             <button 
               onClick={submitLeadAssignment}
               disabled={isAssigning}
               className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md flex justify-center items-center transition disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {isAssigning ? (
                   <><Loader2 size={16} className="mr-2 animate-spin" /> Saving...</>
               ) : (
                   <><Send size={16} className="mr-2" /> Assign & Send</>
               )}
             </button>
          </div>
        </div>
      </Modal>

      {/* Add GMB Partner Modal */}
      <Modal 
        isOpen={isAddPartnerModalOpen} 
        onClose={() => setIsAddPartnerModalOpen(false)}
        title="Add Secondary Partner (GMB)"
      >
        <div className="space-y-4">
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name / Shop Name</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                      value={newPartner.name}
                      onChange={(e) => setNewPartner({...newPartner, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp Number</label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            +91
                        </span>
                        <input 
                          type="tel" 
                          maxLength={10}
                          className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                          value={newPartner.phone}
                          onChange={(e) => setNewPartner({...newPartner, phone: e.target.value.replace(/\D/g, '')})}
                        />
                    </div>
                </div>
                <div className="mb-3">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Select Expertise / Services</label>
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" value="Electrician" checked={newPartner.services.includes("Electrician")} onChange={() => toggleService("Electrician")} className="sec-expertise-cb w-4 h-4 text-indigo-600 rounded" /> <span className="text-gray-700">Electrician</span></label>
                        <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" value="Plumber" checked={newPartner.services.includes("Plumber")} onChange={() => toggleService("Plumber")} className="sec-expertise-cb w-4 h-4 text-indigo-600 rounded" /> <span className="text-gray-700">Plumber</span></label>
                        <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" value="Carpenters" checked={newPartner.services.includes("Carpenters")} onChange={() => toggleService("Carpenters")} className="sec-expertise-cb w-4 h-4 text-indigo-600 rounded" /> <span className="text-gray-700">Carpenters</span></label>
                        <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" value="Cleaning & Pest Control" checked={newPartner.services.includes("Cleaning & Pest Control")} onChange={() => toggleService("Cleaning & Pest Control")} className="sec-expertise-cb w-4 h-4 text-indigo-600 rounded" /> <span className="text-gray-700">Cleaning & Pest</span></label>
                        <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" value="Pooja" checked={newPartner.services.includes("Pooja")} onChange={() => toggleService("Pooja")} className="sec-expertise-cb w-4 h-4 text-indigo-600 rounded" /> <span className="text-gray-700">Pooja</span></label>
                        <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" value="Home Appliances" checked={showHomeAppliances} onChange={(e) => setShowHomeAppliances(e.target.checked)} className="sec-expertise-cb w-4 h-4 text-indigo-600 rounded" /> <span className="font-bold text-indigo-700">Home Appliances ▾</span></label>
                    </div>
                </div>

                {showHomeAppliances && (
                <div id="sub-appliances-menu" className="mb-3 bg-indigo-50 p-3 rounded-lg border border-indigo-100 transition-all duration-300">
                    <label className="block text-xs font-bold text-indigo-800 mb-2">Select Specific Appliances:</label>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-1">
                        <label className="flex items-center space-x-1 text-xs cursor-pointer"><input type="checkbox" value="AC repair and services" checked={newPartner.services.includes("AC repair and services")} onChange={() => toggleService("AC repair and services")} className="sec-expertise-cb w-3.5 h-3.5 text-indigo-500 rounded" /> <span className="text-gray-700">AC Repair</span></label>
                        <label className="flex items-center space-x-1 text-xs cursor-pointer"><input type="checkbox" value="water purifier" checked={newPartner.services.includes("water purifier")} onChange={() => toggleService("water purifier")} className="sec-expertise-cb w-3.5 h-3.5 text-indigo-500 rounded" /> <span className="text-gray-700">Water Purifier</span></label>
                        <label className="flex items-center space-x-1 text-xs cursor-pointer"><input type="checkbox" value="geyser" checked={newPartner.services.includes("geyser")} onChange={() => toggleService("geyser")} className="sec-expertise-cb w-3.5 h-3.5 text-indigo-500 rounded" /> <span className="text-gray-700">Geyser</span></label>
                        <label className="flex items-center space-x-1 text-xs cursor-pointer"><input type="checkbox" value="mixer grinder" checked={newPartner.services.includes("mixer grinder")} onChange={() => toggleService("mixer grinder")} className="sec-expertise-cb w-3.5 h-3.5 text-indigo-500 rounded" /> <span className="text-gray-700">Mixer Grinder</span></label>
                        <label className="flex items-center space-x-1 text-xs cursor-pointer"><input type="checkbox" value="air cooler repair" checked={newPartner.services.includes("air cooler repair")} onChange={() => toggleService("air cooler repair")} className="sec-expertise-cb w-3.5 h-3.5 text-indigo-500 rounded" /> <span className="text-gray-700">Air Cooler</span></label>
                        <label className="flex items-center space-x-1 text-xs cursor-pointer"><input type="checkbox" value="television" checked={newPartner.services.includes("television")} onChange={() => toggleService("television")} className="sec-expertise-cb w-3.5 h-3.5 text-indigo-500 rounded" /> <span className="text-gray-700">Television</span></label>
                        <label className="flex items-center space-x-1 text-xs cursor-pointer"><input type="checkbox" value="washing machine" checked={newPartner.services.includes("washing machine")} onChange={() => toggleService("washing machine")} className="sec-expertise-cb w-3.5 h-3.5 text-indigo-500 rounded" /> <span className="text-gray-700">Washing Machine</span></label>
                        <label className="flex items-center space-x-1 text-xs cursor-pointer"><input type="checkbox" value="CCTV camera" checked={newPartner.services.includes("CCTV camera")} onChange={() => toggleService("CCTV camera")} className="sec-expertise-cb w-3.5 h-3.5 text-indigo-500 rounded" /> <span className="text-gray-700">CCTV Camera</span></label>
                        <label className="flex items-center space-x-1 text-xs cursor-pointer"><input type="checkbox" value="air purifier" checked={newPartner.services.includes("air purifier")} onChange={() => toggleService("air purifier")} className="sec-expertise-cb w-3.5 h-3.5 text-indigo-500 rounded" /> <span className="text-gray-700">Air Purifier</span></label>
                        <label className="flex items-center space-x-1 text-xs cursor-pointer"><input type="checkbox" value="Chimney repair" checked={newPartner.services.includes("Chimney repair")} onChange={() => toggleService("Chimney repair")} className="sec-expertise-cb w-3.5 h-3.5 text-indigo-500 rounded" /> <span className="text-gray-700">Chimney Repair</span></label>
                        <label className="flex items-center space-x-1 text-xs cursor-pointer"><input type="checkbox" value="refrigerator repair & services" checked={newPartner.services.includes("refrigerator repair & services")} onChange={() => toggleService("refrigerator repair & services")} className="sec-expertise-cb w-3.5 h-3.5 text-indigo-500 rounded" /> <span className="text-gray-700">Refrigerator</span></label>
                    </div>
                </div>
                )}
                <div className="flex flex-col space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                        <input 
                          type="text" 
                          id="sec-partner-city"
                          placeholder="e.g. Mau" 
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                          value={newPartner.city}
                          onChange={(e) => setNewPartner({...newPartner, city: e.target.value})}
                        />
                    </div>
                    <div className="flex space-x-2">
                        <div className="w-2/3">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Area / Address</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Andheri West" 
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                              value={newPartner.address}
                              onChange={(e) => setNewPartner({...newPartner, address: e.target.value})}
                            />
                        </div>
                        <div className="w-1/3">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Pincode</label>
                            <input 
                              type="text" 
                              maxLength={6}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                              value={newPartner.pincode}
                              onChange={(e) => setNewPartner({...newPartner, pincode: e.target.value.replace(/\D/g, '')})}
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            <button 
              onClick={saveSecondaryPartner}
              disabled={isSavingPartner}
              className="w-full mt-5 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isSavingPartner ? (
                    <><Loader2 size={16} className="mr-2 animate-spin" /> Locating & Saving...</>
                ) : (
                    'Save Partner to Database'
                )}
            </button>
        </div>
      </Modal>

      {/* CSV Upload Modal */}
      <Modal isOpen={isCsvUploadModalOpen} onClose={() => setIsCsvUploadModalOpen(false)} title="Bulk Upload Partners (CSV)">
        <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                    <Info size={16} className="mr-2" /> Expected CSV Format
                </h4>
                <p className="text-sm text-blue-700 mb-2">
                    Your CSV file must have exactly these 5 columns in order:
                </p>
                <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1 font-mono bg-white p-2 rounded border border-blue-200">
                    <li>Name</li>
                    <li>Phone</li>
                    <li>Services (comma separated)</li>
                    <li>Address</li>
                    <li>Pincode</li>
                </ol>
                <p className="text-xs text-blue-600 mt-3">
                    Note: The system will automatically find the GPS coordinates for each address. This may take a few seconds per partner.
                </p>
            </div>

            <div className="flex justify-center items-center w-full">
                <label htmlFor="csv-upload-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">CSV files only</p>
                    </div>
                </label>
            </div>
            
            <div className="flex justify-end pt-4">
                <button 
                    onClick={() => setIsCsvUploadModalOpen(false)}
                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
      </Modal>

      {/* Bulk Upload Progress Modal */}
      {isBulkUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Uploading Partners...</h3>
                <p className="text-xs text-gray-500 mb-4">Please do not close this window. Processing addresses takes time.</p>
                
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
                    <div 
                        className="bg-indigo-600 h-4 rounded-full transition-all duration-300" 
                        style={{ width: `${bulkUploadProgress.total > 0 ? Math.round((bulkUploadProgress.processed / bulkUploadProgress.total) * 100) : 0}%` }}
                    ></div>
                </div>
                
                <p className="text-sm font-bold text-indigo-700 mb-1">
                    {bulkUploadProgress.processed} / {bulkUploadProgress.total} Processed
                </p>
                
                {!bulkUploadProgress.isComplete && bulkUploadProgress.currentName && (
                    <p className="text-xs text-gray-600 mb-4 animate-pulse">
                        Processing: {bulkUploadProgress.currentName}...
                    </p>
                )}

                {bulkUploadProgress.isComplete && (
                    <p className="text-sm font-bold text-green-600 mb-4">
                        ✅ Complete! Successfully added {bulkUploadProgress.success} out of {bulkUploadProgress.total} partners.
                    </p>
                )}

                <div className="mt-4 text-xs text-red-500 max-h-24 overflow-y-auto text-left space-y-1">
                    {bulkUploadProgress.errors.map((err, idx) => (
                        <p key={idx}>{err}</p>
                    ))}
                </div>
                
                {bulkUploadProgress.isComplete && (
                    <button 
                        onClick={closeProgressModal} 
                        className="mt-5 bg-gray-800 text-white font-bold py-2 px-6 rounded hover:bg-gray-900 transition"
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
      )}

      {/* Add Lead Modal */}
      <Modal 
        isOpen={showAddLeadModal} 
        onClose={() => setShowAddLeadModal(false)}
        title="Add New Lead"
      >
        <form onSubmit={saveLead} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input 
              type="text" 
              required
              value={leadForm.customer_name}
              onChange={(e) => setLeadForm({...leadForm, customer_name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input 
              type="tel" 
              required
              value={leadForm.phone_number}
              onChange={(e) => setLeadForm({...leadForm, phone_number: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="9876543210"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Interested In *</label>
            <input 
              type="text" 
              required
              value={leadForm.service_interested}
              onChange={(e) => setLeadForm({...leadForm, service_interested: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g., AC Repair, Plumbing"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date *</label>
            <input 
              type="date" 
              required
              value={leadForm.follow_up_date}
              onChange={(e) => setLeadForm({...leadForm, follow_up_date: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea 
              value={leadForm.notes}
              onChange={(e) => setLeadForm({...leadForm, notes: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Any specific requirements or details..."
              rows={3}
            ></textarea>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setShowAddLeadModal(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Save Lead
            </button>
          </div>
        </form>
      </Modal>

        </>
      )}

    </div>
  );
};

const StatCard = ({ title, value, icon, bg }: { title: string, value: string, icon: React.ReactNode, bg: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${bg} w-12 h-12 flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);