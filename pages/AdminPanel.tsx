import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { ADMIN_PASSWORD, SERVICES } from '../constants';
import { Booking, Partner } from '../types';
import { Modal } from '../components/Modal';
import { 
  Lock, Users, Calendar, Activity, Clock, Phone, Loader2, Star,
  Search, Send, MapPin, CheckCircle, FileSpreadsheet, Plus, MessageCircle, Share2, Map as MapIcon,
  Sparkles, Award, TrendingUp, Eye, EyeOff, CheckCircle2, ChevronRight,
  UserPlus, ArrowLeft, ExternalLink, AlertCircle, FileText, PlusCircle,
  ArrowRightLeft, XCircle, Check, ChevronDown, ChevronUp, DollarSign
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getSignedAppFileUrl } from '../services/storageService';
import { BlogManager } from '../components/BlogManager';
import { PartnerManager } from '../components/PartnerManager';
import { FollowUpManager } from '../components/FollowUpManager';
import { InfluencerManager } from '../components/InfluencerManager';
import { 
  calculateHaversineDistance, 
  formatDistance, 
  resolveCoordinates, 
  isPartnerCategoryMatch,
  extractCoordsFromMapLink
} from '../services/geoService';

// Fixed time slots for scheduling visits and bookings
export const ADMIN_TIME_SLOTS = [
  "6:00 AM to 8:00 AM",
  "8:00 AM to 9:00 AM",
  "9:00 AM to 10:00 AM",
  "10:00 AM to 11:00 AM",
  "11:00 AM to 12:00 PM",
  "12:00 PM to 1:00 PM",
  "1:00 PM to 2:00 PM",
  "2:00 PM to 3:00 PM",
  "3:00 PM to 4:00 PM",
  "4:00 PM to 5:00 PM",
  "5:00 PM to 6:00 PM",
  "6:00 PM to 7:00 PM"
];

// Utility to automatically strip country code (+91, 91, 0) and remove spaces, dashes, etc.
export const cleanIndianMobileNumber = (val: string): string => {
  if (!val) return '';
  // 1. Remove all spaces, hyphens, brackets, dots
  let cleaned = val.replace(/[\s\-\(\)\.]/g, '');

  // 2. Strip country codes (+91, 0091, 91 prefix, leading 0)
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('0091')) {
    cleaned = cleaned.slice(4);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  } else if (cleaned.startsWith('91') && cleaned.length > 10) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  // 3. Keep purely digits
  cleaned = cleaned.replace(/\D/g, '');

  // 4. Extract standard 10-digit mobile number if longer
  if (cleaned.length > 10) {
    const last10 = cleaned.slice(-10);
    if (/^[6-9]/.test(last10)) {
      return last10;
    }
    return cleaned.slice(0, 10);
  }

  return cleaned;
};

export const AdminPanel: React.FC = () => {
  const { bookings, createBooking, updateBooking, partners, updatePartner, addPartner, fetchBookings, fetchPartners } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [mainTab, setMainTab] = useState<'Dashboard' | 'BlogManager' | 'PartnerManagement' | 'FollowUps' | 'InfluencerManagement'>('Dashboard');
  
  const [rescheduleData, setRescheduleData] = useState<{ booking: Booking | null, date: string, time: string }>({ 
    booking: null, date: '', time: '' 
  });

  const [dispatchBooking, setDispatchBooking] = useState<Booking | null>(null);
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
  const [partnerSearchResults, setPartnerSearchResults] = useState<any[]>([]);
  const [isSearchingPartners, setIsSearchingPartners] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showBeyondRadius, setShowBeyondRadius] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    booking: Booking;
    partner: any;
    actionType: 'whatsapp' | 'call' | 'assign';
  } | null>(null);
  const [assignmentNotice, setAssignmentNotice] = useState<string | null>(null);

  // Manual Partner Assignment State
  const [isManualAssignMode, setIsManualAssignMode] = useState(false);
  const [manualPartnerName, setManualPartnerName] = useState('');
  const [manualPartnerPhone, setManualPartnerPhone] = useState('');
  const [manualPartnerCategory, setManualPartnerCategory] = useState('');
  const [manualServiceType, setManualServiceType] = useState('');
  const [manualFormErrors, setManualFormErrors] = useState<{ name?: string; phone?: string; category?: string; serviceType?: string }>({});
  const [manualPendingConfirmation, setManualPendingConfirmation] = useState<{
    partnerName: string;
    partnerPhone: string;
    serviceCategory: string;
    serviceType: string;
    booking: Booking;
    waUrl: string;
  } | null>(null);
  const [isSubmittingManualAssign, setIsSubmittingManualAssign] = useState(false);

  const [currentAdminTab, setCurrentAdminTab] = useState<'Pending' | 'Quotations' | 'Forwarded' | 'Accepted' | 'Review' | 'Completed'>('Pending');

  // ==========================================
  // 1. Quotation Workflow State
  // ==========================================
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [quoteCustomerName, setQuoteCustomerName] = useState('');
  const [quoteCustomerPhone, setQuoteCustomerPhone] = useState('');
  const [quoteServiceCategory, setQuoteServiceCategory] = useState('Cleaning');
  const [quoteServiceType, setQuoteServiceType] = useState('');
  const [quoteVisitDate, setQuoteVisitDate] = useState('');
  const [quoteVisitTime, setQuoteVisitTime] = useState('');
  const [quoteLocationLink, setQuoteLocationLink] = useState('');
  const [quoteSearchQuery, setQuoteSearchQuery] = useState('');
  const [quoteSelectedPartner, setQuoteSelectedPartner] = useState<Partner | null>(null);
  const [showQuoteManualMore, setShowQuoteManualMore] = useState(false);
  const [quoteManualPartnerName, setQuoteManualPartnerName] = useState('');
  const [quoteManualPartnerPhone, setQuoteManualPartnerPhone] = useState('');
  const [quoteFormErrors, setQuoteFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingQuotation, setIsSubmittingQuotation] = useState(false);

  // ==========================================
  // 2. Manual Lead Workflow State
  // ==========================================
  const [isManualLeadModalOpen, setIsManualLeadModalOpen] = useState(false);
  const [mlServiceCategory, setMlServiceCategory] = useState('Cleaning');
  const [mlServiceType, setMlServiceType] = useState('');
  const [mlQuotationDescription, setMlQuotationDescription] = useState('');
  const [mlTotalServiceCharge, setMlTotalServiceCharge] = useState('');
  const [mlCustomerName, setMlCustomerName] = useState('');
  const [mlCustomerPhone, setMlCustomerPhone] = useState('');
  const [mlLocationLink, setMlLocationLink] = useState('');
  const [mlConfirmedDate, setMlConfirmedDate] = useState('');
  const [mlConfirmedTime, setMlConfirmedTime] = useState('');
  const [mlSearchQuery, setMlSearchQuery] = useState('');
  const [mlSelectedPartner, setMlSelectedPartner] = useState<Partner | null>(null);
  const [showMlManualMore, setShowMlManualMore] = useState(false);
  const [mlManualPartnerName, setMlManualPartnerName] = useState('');
  const [mlManualPartnerPhone, setMlManualPartnerPhone] = useState('');
  const [mlFormErrors, setMlFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingManualLead, setIsSubmittingManualLead] = useState(false);

  // ==========================================
  // 3. Switch Quotation to Confirmed Lead State
  // ==========================================
  const [switchBooking, setSwitchBooking] = useState<Booking | null>(null);
  const [switchEstimateDesc, setSwitchEstimateDesc] = useState('');
  const [switchTotalCharge, setSwitchTotalCharge] = useState('');
  const [switchConfirmedDate, setSwitchConfirmedDate] = useState('');
  const [switchConfirmedTime, setSwitchConfirmedTime] = useState('');
  const [switchFormErrors, setSwitchFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingSwitch, setIsSubmittingSwitch] = useState(false);

  const resetQuotationForm = () => {
    setQuoteCustomerName('');
    setQuoteCustomerPhone('');
    setQuoteServiceCategory('Cleaning');
    setQuoteServiceType('');
    setQuoteVisitDate('');
    setQuoteVisitTime('');
    setQuoteLocationLink('');
    setQuoteSearchQuery('');
    setQuoteSelectedPartner(null);
    setShowQuoteManualMore(false);
    setQuoteManualPartnerName('');
    setQuoteManualPartnerPhone('');
    setQuoteFormErrors({});
  };

  const resetManualLeadForm = () => {
    setMlServiceCategory('Cleaning');
    setMlServiceType('');
    setMlQuotationDescription('');
    setMlTotalServiceCharge('');
    setMlCustomerName('');
    setMlCustomerPhone('');
    setMlLocationLink('');
    setMlConfirmedDate('');
    setMlConfirmedTime('');
    setMlSearchQuery('');
    setMlSelectedPartner(null);
    setShowMlManualMore(false);
    setMlManualPartnerName('');
    setMlManualPartnerPhone('');
    setMlFormErrors({});
  };
  const [showPartnersDirectory, setShowPartnersDirectory] = useState(false);
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');
  const [directoryStatusFilter, setDirectoryStatusFilter] = useState<'all' | 'available' | 'busy' | 'pending' | 'on_hold' | 'blocked'>('all');

  // Influencer stats from bookings
  const influencerBookings = bookings.filter(b => !!b.appliedReferralCode);
  const influencerSales = influencerBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
  const influencerCommissions = Math.round(influencerSales * 0.25);

  const handleViewDocument = async (idProofUrl: string) => {
    try {
      const parsed = JSON.parse(idProofUrl);
      const docPath = parsed.aadhaarPhoto || parsed.profilePhoto || parsed.registrationFeeScreenshot || (parsed.businessPhotos && parsed.businessPhotos[0]);
      if (docPath) {
        const signedUrl = await getSignedAppFileUrl(docPath);
        if (signedUrl) {
          window.open(signedUrl, '_blank');
          return;
        }
      }
    } catch {
      // If it's a plain string
      const signedUrl = await getSignedAppFileUrl(idProofUrl);
      if (signedUrl) window.open(signedUrl, '_blank');
    }
  };

  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const handleCompleteBookingAndRate = async () => {
    if (!ratingBookingId) return;
    
    const targetBooking = bookings.find(b => b.id === ratingBookingId);
    if (!targetBooking) return;

    setIsSubmittingRating(true);
    try {
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          partner_rating: selectedRating
        })
        .eq('id', ratingBookingId);

      if (bookingError) throw bookingError;

      updateBooking({ ...targetBooking, status: 'completed', partner_rating: selectedRating });

      if (targetBooking.assignedPartnerId) {
        const currentPartner = partners.find(p => p.id === targetBooking.assignedPartnerId);
        if (currentPartner) {
          const oldReviewCount = currentPartner.review_count || 0;
          const oldRating = Number(currentPartner.rating) || 5.0;
          
          const newReviewCount = oldReviewCount + 1;
          const newRating = parseFloat(((oldRating * oldReviewCount + selectedRating) / newReviewCount).toFixed(2));
          const newJobsCount = (currentPartner.completedJobs || 0) + 1;

          await supabase
            .from('primary_partners')
            .update({
              rating: newRating,
              review_count: newReviewCount,
              completed_jobs: newJobsCount
            })
            .eq('id', currentPartner.id);
        }
      }

      alert("Lead Completed & Technician Rated successfully! 🎉");
      setRatingBookingId(null);
      setSelectedRating(5);
    } catch (err: any) {
      console.error("Error completing lead, rating:", err);
      alert("Failed to complete and rate lead: " + err.message);
    } finally {
      setIsSubmittingRating(false);
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

  const handleCancelBooking = async (booking: Booking) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    updateBooking({ ...booking, status: 'cancelled' });
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleData.booking) return;
    const updatedBooking: Booking = {
      ...rescheduleData.booking,
      date: rescheduleData.date,
      time: rescheduleData.time
    };
    updateBooking(updatedBooking);
    await supabase.from('bookings').update({ date: rescheduleData.date, time: rescheduleData.time }).eq('id', rescheduleData.booking.id);
    setRescheduleData({ booking: null, date: '', time: '' });
  };

  // Smart Technician Assignment Using Haversine Formula (20 KM Radius)
  const handlePartnerSearch = useCallback(async () => {
    setIsSearchingPartners(true);
    setHasSearched(true);
    try {
      if (!dispatchBooking) {
        setPartnerSearchResults([]);
        return;
      }

      const customerCoords = resolveCoordinates(dispatchBooking);
      const q = partnerSearchQuery.trim().toLowerCase();

      // Filter partners: Active/Available + Service Category Match + Haversine Distance <= 20 KM
      const computed = partners
        .filter(p => {
          // 1. Only display technicians whose status is active/available
          const isEligible = p.status === 'available' || !p.status || p.status === 'active';
          if (p.status === 'blocked' || p.status === 'pending') return false;
          if (!isEligible) return false;

          // 2. Whose registered service categories match customer requested service
          const isMatch = isPartnerCategoryMatch(
            p.categories,
            dispatchBooking.serviceCategory,
            dispatchBooking.subServiceName,
            dispatchBooking.cartItems
          );
          if (!isMatch) return false;

          // Optional text filter if admin specifically types into search bar
          if (q) {
            const nameMatch = p.name?.toLowerCase().includes(q);
            const phoneMatch = p.phone?.includes(q);
            const cityMatch = p.city?.toLowerCase().includes(q);
            const areaMatch = (p.service_areas || []).some(a => a.toLowerCase().includes(q));
            if (!nameMatch && !phoneMatch && !cityMatch && !areaMatch) return false;
          }

          return true;
        })
        .map(p => {
          const partnerCoords = resolveCoordinates(p);
          const distance = (customerCoords && partnerCoords)
            ? calculateHaversineDistance(
                customerCoords.lat,
                customerCoords.lng,
                partnerCoords.lat,
                partnerCoords.lng
              )
            : 99999;

          return {
            ...p,
            calculatedDistance: distance,
            formattedDistance: formatDistance(distance),
            isWithin20Km: distance <= 20
          };
        });

      // Strict 20 KM filter
      let finalPartners = computed.filter(p => p.calculatedDistance <= 20);

      // If no partners within 20km and showBeyondRadius was clicked, show all available category partners
      if (finalPartners.length === 0 && showBeyondRadius) {
        finalPartners = computed;
      }

      // Sort in ascending order of distance so that the closest technician appears first
      finalPartners.sort((a, b) => a.calculatedDistance - b.calculatedDistance);

      setPartnerSearchResults(finalPartners);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingPartners(false);
    }
  }, [partnerSearchQuery, dispatchBooking, partners, showBeyondRadius]);

  // When admin clicks "Assign Technician" or changes target lead
  const activeDispatchBookingId = dispatchBooking?.id;
  useEffect(() => {
    if (activeDispatchBookingId) {
      setPartnerSearchQuery(''); // Clear manual text filter so it doesn't block matches
      setShowBeyondRadius(false);
      setPendingConfirmation(null);
      // Run partner matching when a lead is opened
      handlePartnerSearch();
    } else {
      setPartnerSearchResults([]);
      setHasSearched(false);
      setPendingConfirmation(null);
      setIsManualAssignMode(false);
      setManualPartnerName('');
      setManualPartnerPhone('');
      setManualPartnerCategory('');
      setManualServiceType('');
      setManualFormErrors({});
      setManualPendingConfirmation(null);
    }
  }, [activeDispatchBookingId]);

  // Lead Confirmation Workflow: Contact partner and open confirmation prompt
  const handleInitiateContact = (partner: any, actionType: 'whatsapp' | 'call' | 'assign') => {
    if (!dispatchBooking) return;

    if (actionType === 'whatsapp' || actionType === 'assign') {
      const waText = `✨ *SOFIYAN HOME SERVICE - JOB ALERT* ✨\n\nHello *${partner.name}*, you have a new job inquiry nearby (${partner.formattedDistance || formatDistance(partner.calculatedDistance)})!\n\n📋 *JOB & CUSTOMER DETAILS*\n👤 *Customer Name:* ${dispatchBooking.customerName}\n📞 *Customer Phone:* ${dispatchBooking.contactNumber || 'Not available'}\n🛠️ *Service:* ${dispatchBooking.subServiceName || dispatchBooking.serviceCategory}\n⏰ *Schedule:* ${dispatchBooking.date} | ${dispatchBooking.time}\n📍 *Address:* ${dispatchBooking.address}, ${dispatchBooking.city} (${dispatchBooking.pinCode})\n🗺️ *Map Link:* ${dispatchBooking.location_link ? dispatchBooking.location_link : 'Not provided'}\n\n💵 *Payout:* ₹${dispatchBooking.price}\n\n🚀 *Please confirm if you can take this job.*`;
      window.open(`https://wa.me/91${partner.phone}?text=${encodeURIComponent(waText)}`, '_blank');
    } else if (actionType === 'call') {
      window.location.href = `tel:${partner.phone}`;
    }

    // Set confirmation prompt linked strictly to this lead and technician
    setPendingConfirmation({
      booking: dispatchBooking,
      partner: partner,
      actionType
    });
  };

const isValidUUID = (val?: string | null): boolean => {
  if (!val || typeof val !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
};

  // Lead Confirmation Workflow: Handle Yes / No confirmation
  const handleConfirmLeadAssignment = async (confirmed: boolean) => {
    if (!pendingConfirmation) return;
    const { booking, partner } = pendingConfirmation;

    if (confirmed) {
      // Yes: Automatically assign the lead to that specific technician or service partner
      const safePartnerId = isValidUUID(partner.id) ? partner.id : undefined;
      const updatedBooking: Booking = {
        ...booking,
        status: 'Forwarded',
        assignedPartnerId: safePartnerId,
        assignedPartnerName: partner.name,
        assignedPartnerPhone: partner.phone,
        assignedPartnerArea: partner.city || partner.address || ''
      };

      markLeadAsViewed(booking.id);
      await updateBooking(updatedBooking);

      setAssignmentNotice(`✓ Lead confirmed & assigned to ${partner.name}! Moved to Dispatched.`);
      setPendingConfirmation(null);
      setDispatchBooking(null);
      setCurrentAdminTab('Forwarded');
      setTimeout(() => setAssignmentNotice(null), 6000);
    } else {
      // No: Do not assign the lead to that technician. Keep the lead available for other eligible technicians
      setAssignmentNotice(`Lead was not assigned to ${partner.name}. It remains open & available for other technicians.`);
      setPendingConfirmation(null);
      setTimeout(() => setAssignmentNotice(null), 5000);
    }
  };

  // Manual Partner Assignment Workflow: Forward Customer Details to New Partner via WhatsApp
  const handleManualPartnerForward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchBooking) return;

    const errors: { name?: string; phone?: string; category?: string; serviceType?: string } = {};

    const trimmedName = manualPartnerName.trim();
    if (!trimmedName) {
      errors.name = 'Please enter new partner name.';
    }

    const rawDigits = manualPartnerPhone.replace(/\D/g, '');
    let validPhone = '';
    if (rawDigits.length === 10 && /^[6-9]/.test(rawDigits)) {
      validPhone = rawDigits;
    } else if (rawDigits.length === 12 && rawDigits.startsWith('91') && /^[6-9]/.test(rawDigits.slice(2))) {
      validPhone = rawDigits.slice(2);
    } else if (rawDigits.length === 11 && rawDigits.startsWith('0') && /^[6-9]/.test(rawDigits.slice(1))) {
      validPhone = rawDigits.slice(1);
    } else {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    const trimmedCategory = (manualPartnerCategory || dispatchBooking.serviceCategory || 'General Service').trim();
    if (!trimmedCategory) {
      errors.category = 'Please enter service category.';
    }

    const trimmedServiceType = (manualServiceType || dispatchBooking.subServiceName || trimmedCategory).trim();
    if (!trimmedServiceType) {
      errors.serviceType = 'Please enter service type.';
    }

    if (Object.keys(errors).length > 0) {
      setManualFormErrors(errors);
      return;
    }

    setManualFormErrors({});
    setIsSubmittingManualAssign(true);

    try {
      const cleanPhone = validPhone;
      const priceNum = Number(dispatchBooking.price) || 0;
      const commission = Math.round(priceNum * 0.25);
      const customerLocLink = dispatchBooking.location_link || (dispatchBooking.lat && dispatchBooking.lng ? `https://www.google.com/maps?q=${dispatchBooking.lat},${dispatchBooking.lng}` : '');

      // Formulate WhatsApp message with Platform Commission: 25% per confirmed lead
      const waText = `✨ *SOFIYAN HOME SERVICE - JOB LEAD FORWARD* ✨\n\nHello *${trimmedName}*, a new customer lead has been forwarded to you!\n\n📋 *CUSTOMER & JOB DETAILS*\n👤 *Customer Name:* ${dispatchBooking.customerName}\n📞 *Customer Contact:* ${dispatchBooking.contactNumber || 'Not available'}\n🛠️ *Service Category:* ${trimmedCategory}\n🔧 *Service Type:* ${trimmedServiceType}\n📅 *Scheduled Date & Time:* ${dispatchBooking.date} | ${dispatchBooking.time}\n📍 *Customer Address:* ${dispatchBooking.address || ''}${dispatchBooking.city ? `, ${dispatchBooking.city}` : ''}${dispatchBooking.pinCode ? ` (${dispatchBooking.pinCode})` : ''}\n🗺️ *Location / Map Link:* ${customerLocLink || 'Not provided'}\n💵 *Total Lead Value:* ₹${dispatchBooking.price}\n💼 *Platform Commission:* 25% per confirmed lead (₹${commission})\n\n🚀 *Please contact the customer immediately to confirm your availability.*`;

      const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waText)}`;

      // Open WhatsApp to forward lead details
      try {
        window.open(waUrl, '_blank');
      } catch (err) {
        console.warn('Window open notice:', err);
      }

      // Immediately display confirmation prompt: “Has the new partner accepted this lead?”
      setManualPendingConfirmation({
        partnerName: trimmedName,
        partnerPhone: cleanPhone,
        serviceCategory: trimmedCategory,
        serviceType: trimmedServiceType,
        booking: dispatchBooking,
        waUrl
      });

    } catch (error: any) {
      console.error('Manual partner forward failed:', error);
      alert('Failed to forward lead: ' + (error?.message || 'Unknown error'));
    } finally {
      setIsSubmittingManualAssign(false);
    }
  };

  // Manual Partner Assignment: Handle Admin Confirmation ("Yes – Confirm Assignment" or "No – Not Accepted")
  const handleManualConfirmAssignment = async (confirmed: boolean) => {
    if (!manualPendingConfirmation) return;
    const { booking, partnerName, partnerPhone, serviceCategory, serviceType } = manualPendingConfirmation;

    if (confirmed) {
      // Yes – Confirm Assignment: Immediately assign the lead to the newly entered partner
      let resolvedPartnerId: string | undefined = undefined;

      // Save new partner in directory or use existing partner UUID
      try {
        const existingPartner = partners.find(p => p.phone?.replace(/\D/g, '').slice(-10) === partnerPhone);
        if (existingPartner && isValidUUID(existingPartner.id)) {
          resolvedPartnerId = existingPartner.id;
        } else {
          const newPartnerUUID = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
          const created = await addPartner({
            id: newPartnerUUID || '',
            name: partnerName,
            phone: partnerPhone,
            email: `partner_${partnerPhone}@sofiyan.com`,
            city: booking.city || 'Mau',
            address: booking.address || '',
            categories: [serviceCategory],
            status: 'available',
            earnings: 0,
            completedJobs: 0
          });
          if (created && isValidUUID(created.id)) {
            resolvedPartnerId = created.id;
          } else if (newPartnerUUID && isValidUUID(newPartnerUUID)) {
            resolvedPartnerId = newPartnerUUID;
          }
        }
      } catch (pErr) {
        console.warn('Notice saving manual partner directory entry:', pErr);
      }

      const updatedBooking: Booking = {
        ...booking,
        status: 'Forwarded',
        assignedPartnerId: resolvedPartnerId,
        assignedPartnerName: partnerName,
        assignedPartnerPhone: partnerPhone,
        assignedPartnerArea: booking.city || booking.area || 'Manual Assignment',
        serviceCategory: serviceCategory,
        subServiceName: serviceType
      };

      markLeadAsViewed(booking.id);
      await updateBooking(updatedBooking);

      setAssignmentNotice(`✓ Lead confirmed & assigned to ${partnerName}! Moved to Dispatched.`);
      setManualPendingConfirmation(null);
      setIsManualAssignMode(false);
      setDispatchBooking(null);
      setCurrentAdminTab('Forwarded');
      setTimeout(() => setAssignmentNotice(null), 7000);
    } else {
      // No – Not Accepted: Lead must not be marked as confirmed or assigned as an accepted lead
      setAssignmentNotice(`Lead was not assigned to ${partnerName}. It remains open & available for assignment.`);
      setManualPendingConfirmation(null);
      setTimeout(() => setAssignmentNotice(null), 5000);
    }
  };

  // =========================================================================
  // WORKFLOW HELPERS & HANDLERS: QUOTATION, SWITCH & MANUAL LEAD WORKFLOWS
  // =========================================================================

  // Helper to find or create partner in directory ensuring valid UUID
  const resolveOrAddPartnerHelper = async (name: string, phone: string, category: string): Promise<Partner> => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const existing = partners.find(p => p.phone?.replace(/\D/g, '').slice(-10) === cleanPhone);
    if (existing && isValidUUID(existing.id)) {
      return existing;
    }

    const newUUID = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
    const newPartner: Partner = {
      id: newUUID || '',
      name: name.trim(),
      phone: cleanPhone,
      email: `partner_${cleanPhone}@sofiyan.com`,
      city: 'Mau',
      address: '',
      categories: [category],
      status: 'available',
      earnings: 0,
      completedJobs: 0
    };

    try {
      const created = await addPartner(newPartner);
      if (created && isValidUUID(created.id)) return created;
    } catch (err) {
      console.warn('Notice saving partner to directory:', err);
    }
    return newPartner;
  };

  // Helper to compute 20 KM filtered eligible partners for a given category and maps location
  const getEligiblePartnersForWorkflow = (serviceCategory: string, locationLink: string, searchQuery: string) => {
    const coords = extractCoordsFromMapLink(locationLink);
    const q = searchQuery.trim().toLowerCase();

    const candidates = partners
      .filter(p => {
        const isEligible = p.status === 'available' || !p.status || p.status === 'active';
        if (p.status === 'blocked' || p.status === 'pending') return false;
        if (!isEligible) return false;

        const isMatch = isPartnerCategoryMatch(
          p.categories,
          serviceCategory,
          serviceCategory
        );
        if (!isMatch) return false;

        if (q) {
          const nameMatch = p.name?.toLowerCase().includes(q);
          const phoneMatch = p.phone?.includes(q);
          const cityMatch = p.city?.toLowerCase().includes(q);
          const areaMatch = (p.service_areas || []).some(a => a.toLowerCase().includes(q));
          if (!nameMatch && !phoneMatch && !cityMatch && !areaMatch) return false;
        }

        return true;
      })
      .map(p => {
        const partnerCoords = resolveCoordinates(p);
        const distance = (coords && partnerCoords)
          ? calculateHaversineDistance(coords.lat, coords.lng, partnerCoords.lat, partnerCoords.lng)
          : 99999;
        return {
          ...p,
          calculatedDistance: distance,
          formattedDistance: formatDistance(distance),
          isWithin20Km: distance <= 20
        };
      });

    if (coords) {
      const within20 = candidates.filter(p => p.calculatedDistance <= 20);
      within20.sort((a, b) => a.calculatedDistance - b.calculatedDistance);
      return { coords, partners: within20, allCount: candidates.length };
    } else {
      candidates.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      return { coords: null, partners: candidates, allCount: candidates.length };
    }
  };

  // 1. Submit Quotation Handler
  const handleQuotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const trimmedCustName = quoteCustomerName.trim();
    if (!trimmedCustName) errors.customerName = 'Customer Name is required.';

    const validCustPhone = cleanIndianMobileNumber(quoteCustomerPhone);
    if (!validCustPhone || validCustPhone.length !== 10 || !/^[6-9]/.test(validCustPhone)) {
      errors.customerPhone = 'Enter a valid 10-digit customer mobile number.';
    }

    const trimmedServiceType = quoteServiceType.trim() || quoteServiceCategory;
    if (!trimmedServiceType) errors.serviceType = 'Service type is required.';

    if (!quoteVisitDate) errors.visitDate = 'Visit date is required.';
    if (!quoteVisitTime) errors.visitTime = 'Visit time is required.';

    // Partner validation
    let resolvedPartner: Partner | null = null;
    if (showQuoteManualMore) {
      const trimmedPName = quoteManualPartnerName.trim();
      if (!trimmedPName) errors.manualPartnerName = 'Enter manual partner name.';

      const validManualPhone = cleanIndianMobileNumber(quoteManualPartnerPhone);
      if (!validManualPhone || validManualPhone.length !== 10 || !/^[6-9]/.test(validManualPhone)) {
        errors.manualPartnerPhone = 'Enter a valid 10-digit partner mobile number.';
      }
    } else {
      if (!quoteSelectedPartner) {
        errors.partner = 'Please select a partner from the 20 KM list or click "+ More" for manual assignment.';
      } else {
        resolvedPartner = quoteSelectedPartner;
      }
    }

    if (Object.keys(errors).length > 0) {
      setQuoteFormErrors(errors);
      return;
    }

    setQuoteFormErrors({});
    setIsSubmittingQuotation(true);

    try {
      // If manual partner, create/resolve partner
      if (showQuoteManualMore) {
        resolvedPartner = await resolveOrAddPartnerHelper(
          quoteManualPartnerName,
          quoteManualPartnerPhone,
          quoteServiceCategory
        );
      }

      if (!resolvedPartner) throw new Error('Partner could not be identified');

      const partnerPhoneClean = resolvedPartner.phone.replace(/\D/g, '').slice(-10);
      const coords = extractCoordsFromMapLink(quoteLocationLink);

      const newBookingId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0').slice(-12)}`;
      const newBooking: Booking = {
        id: newBookingId,
        customerName: trimmedCustName,
        contactNumber: validCustPhone,
        address: 'Inspection Site',
        city: 'Mau',
        serviceCategory: quoteServiceCategory,
        subServiceName: trimmedServiceType,
        date: quoteVisitDate,
        time: quoteVisitTime,
        price: '0',
        status: 'pending_quotation',
        location_link: quoteLocationLink.trim() || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
        assignedPartnerId: isValidUUID(resolvedPartner.id) ? resolvedPartner.id : undefined,
        assignedPartnerName: resolvedPartner.name,
        assignedPartnerPhone: partnerPhoneClean,
        assignedPartnerArea: resolvedPartner.city || 'Mau',
        createdAt: new Date().toISOString()
      };

      await createBooking(newBooking);

      // WhatsApp Message to Partner with 25% Platform Commission
      const waText = `✨ *SOFIYAN HOME SERVICE - QUOTATION VISIT / INSPECTION* ✨\n\nHello *${resolvedPartner.name}*, you have been assigned for a Customer Quotation Visit & Inspection!\n\n📋 *CUSTOMER & VISIT DETAILS*\n👤 *Customer Name:* ${trimmedCustName}\n📞 *Customer Phone:* ${validCustPhone}\n🛠️ *Service Requested:* ${trimmedServiceType} (${quoteServiceCategory})\n📅 *Visit Schedule:* ${quoteVisitDate} | ${quoteVisitTime}\n🗺️ *Customer Location Link:* ${quoteLocationLink.trim() || 'Not provided'}\n\n💼 *Platform Terms:* 25% Platform Commission on final confirmed booking value.\nℹ️ *Instructions:* Please inspect the site at the scheduled time and provide the final estimate to the customer/admin.\n\n🚀 *Please confirm your visit availability.*`;

      try {
        window.open(`https://wa.me/91${partnerPhoneClean}?text=${encodeURIComponent(waText)}`, '_blank');
      } catch (wErr) {
        console.warn('WhatsApp link open notice:', wErr);
      }

      setAssignmentNotice(`✓ Quotation visit created & assigned to ${resolvedPartner.name}! Placed in Pending Quotation.`);
      resetQuotationForm();
      setIsQuotationModalOpen(false);
      setCurrentAdminTab('Quotations');
      setTimeout(() => setAssignmentNotice(null), 7000);
    } catch (err: any) {
      console.error('Error submitting quotation:', err);
      alert('Failed to submit quotation: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSubmittingQuotation(false);
    }
  };

  // 2. Cancel Quotation Handler
  const handleCancelQuotation = async (booking: Booking) => {
    if (!window.confirm(`Are you sure you want to cancel the quotation for "${booking.customerName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      updateBooking({ ...booking, status: 'cancelled' });
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
      setAssignmentNotice(`Quotation for ${booking.customerName} has been cancelled.`);
      setTimeout(() => setAssignmentNotice(null), 5000);
    } catch (err: any) {
      alert('Failed to cancel quotation: ' + err.message);
    }
  };

  // 3. Open Switch Modal Handler
  const handleOpenSwitchModal = (booking: Booking) => {
    setSwitchBooking(booking);
    setSwitchEstimateDesc(booking.description || '');
    setSwitchTotalCharge(booking.price && booking.price !== '0' ? booking.price : '');
    setSwitchConfirmedDate(booking.date || '');
    setSwitchConfirmedTime(booking.time || '');
    setSwitchFormErrors({});
  };

  // 4. Switch (Confirm & Forward) Handler
  const handleSwitchConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchBooking) return;

    const errors: Record<string, string> = {};
    const trimmedDesc = switchEstimateDesc.trim();
    if (!trimmedDesc) errors.estimateDesc = 'Estimate / Scope description is required.';

    const totalChargeNum = parseFloat(switchTotalCharge);
    if (isNaN(totalChargeNum) || totalChargeNum <= 0) {
      errors.totalCharge = 'Enter a valid total service charge in ₹.';
    }

    if (!switchConfirmedDate) errors.confirmedDate = 'Confirmed date is required.';
    if (!switchConfirmedTime) errors.confirmedTime = 'Confirmed time is required.';

    if (Object.keys(errors).length > 0) {
      setSwitchFormErrors(errors);
      return;
    }

    setSwitchFormErrors({});
    setIsSubmittingSwitch(true);

    try {
      const commission = Math.round(totalChargeNum * 0.25);
      const partnerPayout = totalChargeNum - commission;

      const updatedBooking: Booking = {
        ...switchBooking,
        status: 'Forwarded',
        price: String(totalChargeNum),
        description: trimmedDesc,
        date: switchConfirmedDate,
        time: switchConfirmedTime
      };

      await updateBooking(updatedBooking);

      const targetPartnerPhone = (switchBooking.assignedPartnerPhone || '').replace(/\D/g, '').slice(-10);
      const partnerName = switchBooking.assignedPartnerName || 'Partner';
      const locLink = switchBooking.location_link || (switchBooking.lat && switchBooking.lng ? `https://www.google.com/maps?q=${switchBooking.lat},${switchBooking.lng}` : 'Not provided');

      // Formulate Confirmed Assignment WhatsApp message with 25% Platform Commission
      const waText = `✨ *SOFIYAN HOME SERVICE - JOB CONFIRMED & DISPATCHED* ✨\n\nHello *${partnerName}*, the quotation has been approved and the job is now confirmed!\n\n📋 *CONFIRMED JOB DETAILS*\n👤 *Customer Name:* ${switchBooking.customerName}\n📞 *Customer Phone:* ${switchBooking.contactNumber || 'Not available'}\n🛠️ *Service:* ${switchBooking.subServiceName || switchBooking.serviceCategory}\n📝 *Estimate / Scope of Work:* ${trimmedDesc}\n📅 *Confirmed Schedule:* ${switchConfirmedDate} | ${switchConfirmedTime}\n📍 *Address:* ${switchBooking.address || ''}${switchBooking.city ? `, ${switchBooking.city}` : ''}\n🗺️ *Customer Location Link:* ${locLink}\n\n💵 *Total Service Charge:* ₹${totalChargeNum}\n💼 *Platform Commission (25%):* ₹${commission}\n💰 *Partner Payout (75%):* ₹${partnerPayout}\n\n🚀 *Job is confirmed. Please arrive on time and complete the service.*`;

      if (targetPartnerPhone) {
        try {
          window.open(`https://wa.me/91${targetPartnerPhone}?text=${encodeURIComponent(waText)}`, '_blank');
        } catch (wErr) {
          console.warn('WhatsApp link open notice:', wErr);
        }
      }

      setAssignmentNotice(`✓ Quotation converted to Confirmed Lead & dispatched to ${partnerName}! Moved to Dispatched.`);
      setSwitchBooking(null);
      setCurrentAdminTab('Forwarded');
      setTimeout(() => setAssignmentNotice(null), 7000);
    } catch (err: any) {
      console.error('Error switching quotation:', err);
      alert('Failed to confirm and dispatch lead: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSubmittingSwitch(false);
    }
  };

  // 5. Submit Manual Lead Handler
  const handleManualLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const trimmedCustName = mlCustomerName.trim();
    if (!trimmedCustName) errors.customerName = 'Customer Name is required.';

    const validCustPhone = cleanIndianMobileNumber(mlCustomerPhone);
    if (!validCustPhone || validCustPhone.length !== 10 || !/^[6-9]/.test(validCustPhone)) {
      errors.customerPhone = 'Enter a valid 10-digit customer mobile number.';
    }

    const trimmedServiceType = mlServiceType.trim() || mlServiceCategory;
    if (!trimmedServiceType) errors.serviceType = 'Service type is required.';

    const trimmedDesc = mlQuotationDescription.trim();
    if (!trimmedDesc) errors.quotationDesc = 'Quotation / Job description is required.';

    const totalChargeNum = parseFloat(mlTotalServiceCharge);
    if (isNaN(totalChargeNum) || totalChargeNum <= 0) {
      errors.totalCharge = 'Enter a valid total service charge in ₹.';
    }

    if (!mlConfirmedDate) errors.confirmedDate = 'Confirmed date is required.';
    if (!mlConfirmedTime) errors.confirmedTime = 'Confirmed time is required.';

    // Partner validation
    let resolvedPartner: Partner | null = null;
    if (showMlManualMore) {
      const trimmedPName = mlManualPartnerName.trim();
      if (!trimmedPName) errors.manualPartnerName = 'Enter manual partner name.';

      const validManualPhone = cleanIndianMobileNumber(mlManualPartnerPhone);
      if (!validManualPhone || validManualPhone.length !== 10 || !/^[6-9]/.test(validManualPhone)) {
        errors.manualPartnerPhone = 'Enter a valid 10-digit partner mobile number.';
      }
    } else {
      if (!mlSelectedPartner) {
        errors.partner = 'Please select a partner from the 20 KM list or click "+ More" for manual assignment.';
      } else {
        resolvedPartner = mlSelectedPartner;
      }
    }

    if (Object.keys(errors).length > 0) {
      setMlFormErrors(errors);
      return;
    }

    setMlFormErrors({});
    setIsSubmittingManualLead(true);

    try {
      // If manual partner, create/resolve partner
      if (showMlManualMore) {
        resolvedPartner = await resolveOrAddPartnerHelper(
          mlManualPartnerName,
          mlManualPartnerPhone,
          mlServiceCategory
        );
      }

      if (!resolvedPartner) throw new Error('Partner could not be identified');

      const partnerPhoneClean = resolvedPartner.phone.replace(/\D/g, '').slice(-10);
      const coords = extractCoordsFromMapLink(mlLocationLink);

      const commission = Math.round(totalChargeNum * 0.25);
      const partnerPayout = totalChargeNum - commission;

      const newBookingId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0').slice(-12)}`;
      const newBooking: Booking = {
        id: newBookingId,
        customerName: trimmedCustName,
        contactNumber: validCustPhone,
        address: 'Direct Lead Location',
        city: 'Mau',
        serviceCategory: mlServiceCategory,
        subServiceName: trimmedServiceType,
        description: trimmedDesc,
        date: mlConfirmedDate,
        time: mlConfirmedTime,
        price: String(totalChargeNum),
        status: 'Forwarded',
        location_link: mlLocationLink.trim() || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
        assignedPartnerId: isValidUUID(resolvedPartner.id) ? resolvedPartner.id : undefined,
        assignedPartnerName: resolvedPartner.name,
        assignedPartnerPhone: partnerPhoneClean,
        assignedPartnerArea: resolvedPartner.city || 'Mau',
        createdAt: new Date().toISOString()
      };

      await createBooking(newBooking);

      // WhatsApp Message to Partner with 25% Platform Commission
      const waText = `✨ *SOFIYAN HOME SERVICE - JOB LEAD CONFIRMED & DISPATCHED* ✨\n\nHello *${resolvedPartner.name}*, a confirmed customer job lead has been directly assigned to you!\n\n📋 *CONFIRMED JOB DETAILS*\n👤 *Customer Name:* ${trimmedCustName}\n📞 *Customer Phone:* ${validCustPhone}\n🛠️ *Service:* ${trimmedServiceType} (${mlServiceCategory})\n📝 *Quotation / Scope of Work:* ${trimmedDesc}\n📅 *Confirmed Schedule:* ${mlConfirmedDate} | ${mlConfirmedTime}\n🗺️ *Customer Location Link:* ${mlLocationLink.trim() || 'Not provided'}\n\n💵 *Total Service Charge:* ₹${totalChargeNum}\n💼 *Platform Commission (25%):* ₹${commission}\n💰 *Partner Payout (75%):* ₹${partnerPayout}\n\n🚀 *Please contact the customer and arrive at the scheduled time.*`;

      try {
        window.open(`https://wa.me/91${partnerPhoneClean}?text=${encodeURIComponent(waText)}`, '_blank');
      } catch (wErr) {
        console.warn('WhatsApp link open notice:', wErr);
      }

      setAssignmentNotice(`✓ Manual confirmed lead created & dispatched to ${resolvedPartner.name}! Placed in Dispatched section.`);
      resetManualLeadForm();
      setIsManualLeadModalOpen(false);
      setCurrentAdminTab('Forwarded');
      setTimeout(() => setAssignmentNotice(null), 7000);
    } catch (err: any) {
      console.error('Error submitting manual lead:', err);
      alert('Failed to submit manual lead: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSubmittingManualLead(false);
    }
  };

  useEffect(() => {
    // Fresh fetch on Admin mount
    fetchBookings().catch(err => console.warn("Notice fetching bookings:", err?.message || err));
    fetchPartners().catch(err => console.warn("Notice fetching partners:", err?.message || err));

    // Live update backup interval
    const interval = setInterval(() => {
      fetchBookings().catch(err => console.warn("Notice fetching bookings:", err?.message || err));
      fetchPartners().catch(err => console.warn("Notice fetching partners:", err?.message || err));
    }, 12000); // Poll every 12 seconds

    return () => clearInterval(interval);
  }, [fetchBookings, fetchPartners]);

  // Tracking viewed/clicked leads (stored in localStorage)
  const [viewedLeadIds, setViewedLeadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('admin_viewed_lead_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const markLeadAsViewed = (bookingId: string) => {
    if (!viewedLeadIds.includes(bookingId)) {
      const updated = [...viewedLeadIds, bookingId];
      setViewedLeadIds(updated);
      try {
        localStorage.setItem('admin_viewed_lead_ids', JSON.stringify(updated));
      } catch {}
    }
  };

  const toggleLeadViewed = (e: React.MouseEvent, bookingId: string) => {
    e.stopPropagation();
    const updated = viewedLeadIds.includes(bookingId)
      ? viewedLeadIds.filter(id => id !== bookingId)
      : [...viewedLeadIds, bookingId];
    setViewedLeadIds(updated);
    try {
      localStorage.setItem('admin_viewed_lead_ids', JSON.stringify(updated));
    } catch {}
  };

  const markAllLeadsAsViewed = () => {
    const allIds = bookings.map(b => b.id);
    setViewedLeadIds(allIds);
    try {
      localStorage.setItem('admin_viewed_lead_ids', JSON.stringify(allIds));
    } catch {}
  };

  const [leadSearchTerm, setLeadSearchTerm] = useState('');

  // Helper: check if a lead has been assigned to a technician
  const isAssigned = (b: Booking) => {
    if (b.status === 'pending_quotation') return false;
    return b.status === 'Forwarded' || !!b.assignedPartnerId || !!b.assignedPartnerName;
  };

  const completedBookings = bookings.filter(b => b.status === 'completed');
  // Pending jobs are only those not yet assigned to any technician and not quotations
  const pendingJobs = bookings.filter(b => (b.status === 'pending' || !b.status) && !isAssigned(b) && b.status !== 'pending_quotation').length;
  // Dedicated Pending Quotations count
  const quotationJobs = bookings.filter(b => b.status === 'pending_quotation').length;
  // Dispatched jobs include all confirmed assigned leads
  const forwardedJobs = bookings.filter(b => (b.status === 'Forwarded' || isAssigned(b)) && b.status !== 'completed' && b.status !== 'accepted' && b.status !== 'in_progress' && b.status !== 'pending_quotation').length;
  const assignedJobs = bookings.filter(b => (isAssigned(b) || b.status === 'accepted' || b.status === 'in_progress') && b.status !== 'pending_quotation').length;
  const acceptedJobs = bookings.filter(b => b.status === 'accepted' || b.status === 'in_progress').length;
  const reviewJobs = bookings.filter(b => b.status === 'admin_review').length;
  const completedJobs = completedBookings.length;

  const unreadPendingCount = bookings.filter(b => (b.status === 'pending' || !b.status) && !isAssigned(b) && b.status !== 'pending_quotation' && !viewedLeadIds.includes(b.id)).length;

  const formatInquiryTime = (createdAt?: string, date?: string, time?: string) => {
    if (createdAt) {
      try {
        const d = new Date(createdAt);
        if (!isNaN(d.getTime())) {
          const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
          const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
          
          const diffMs = Date.now() - d.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60);
          const diffDays = Math.floor(diffHours / 24);

          let relative = '';
          if (diffMins < 1) relative = 'Just now';
          else if (diffMins < 60) relative = `${diffMins}m ago`;
          else if (diffHours < 24) relative = `${diffHours}h ago`;
          else relative = `${diffDays}d ago`;

          return { dateStr, timeStr, relative, full: `${dateStr}, ${timeStr}` };
        }
      } catch {}
    }
    return {
      dateStr: date || 'Recent',
      timeStr: time || '',
      relative: 'New',
      full: `${date || 'Recent'} ${time || ''}`
    };
  };

  const displayedBookings = bookings.filter(b => {
    // 1. Tab-based status filter:
    let matchesTab = false;
    if (currentAdminTab === 'Pending') {
      matchesTab = (b.status === 'pending' || !b.status) && !isAssigned(b) && b.status !== 'pending_quotation';
    } else if (currentAdminTab === 'Quotations') {
      matchesTab = b.status === 'pending_quotation';
    } else if (currentAdminTab === 'Forwarded') {
      matchesTab = (b.status === 'Forwarded' || isAssigned(b)) && b.status !== 'completed' && b.status !== 'accepted' && b.status !== 'in_progress' && b.status !== 'pending_quotation';
    } else if (currentAdminTab === 'Accepted') {
      matchesTab = b.status === 'accepted' || b.status === 'in_progress';
    } else if (currentAdminTab === 'Review') {
      matchesTab = b.status === 'admin_review';
    } else if (currentAdminTab === 'Completed') {
      matchesTab = b.status === 'completed';
    }

    if (!matchesTab) return false;

    // 2. Search filter
    if (leadSearchTerm.trim()) {
      const q = leadSearchTerm.trim().toLowerCase();
      const name = (b.customerName || '').toLowerCase();
      const phone = (b.contactNumber || '').toLowerCase();
      const service = (b.subServiceName || b.serviceCategory || '').toLowerCase();
      const area = (b.area || b.city || b.address || '').toLowerCase();
      const id = (b.id || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || service.includes(q) || area.includes(q) || id.includes(q);
    }

    return true;
  });

  // Parse appointment date & time string into a clean numerical timestamp for smart chronological proximity ordering
  const parseAppointmentTimestamp = (dateStr?: string, timeStr?: string): number => {
    if (!dateStr || !dateStr.trim()) return 0;

    let year = 1970, month = 0, day = 1;
    const cleanDate = dateStr.trim();

    if (cleanDate.includes('-')) {
      const parts = cleanDate.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else if (parts[2]?.length === 4) {
        // DD-MM-YYYY
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      }
    } else if (cleanDate.includes('/')) {
      const parts = cleanDate.split('/');
      if (parts[0].length === 4) {
        // YYYY/MM/DD
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else if (parts[2]?.length === 4) {
        // DD/MM/YYYY
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      }
    } else {
      const parsed = new Date(cleanDate);
      if (!isNaN(parsed.getTime())) {
        year = parsed.getFullYear();
        month = parsed.getMonth();
        day = parsed.getDate();
      }
    }

    // Default 9:00 AM if no time provided
    let hour = 9;
    let minute = 0;

    if (timeStr && timeStr.trim()) {
      const cleanTime = timeStr.trim().toLowerCase();
      // Match pattern like "4 pm to 5 pm", "11:30 am", "14:00"
      const match = cleanTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2] ? parseInt(match[2], 10) : 0;
        const meridiem = match[3];

        if (meridiem === 'pm' && h < 12) {
          h += 12;
        } else if (meridiem === 'am' && h === 12) {
          h = 0;
        }
        hour = h;
        minute = m;
      }
    }

    const result = new Date(year, month, day, hour, minute, 0, 0);
    return isNaN(result.getTime()) ? 0 : result.getTime();
  };

  const getAppointmentScheduleBadge = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return null;
    const ts = parseAppointmentTimestamp(dateStr, timeStr);
    if (!ts) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(ts);
    targetDate.setHours(0, 0, 0, 0);

    const diffMs = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { label: 'Today', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    } else if (diffDays === 1) {
      return { label: 'Tomorrow', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    } else if (diffDays === 2) {
      return { label: 'In 2 days', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    } else if (diffDays > 2) {
      return { label: `In ${diffDays} days`, color: 'bg-purple-100 text-purple-800 border-purple-200' };
    } else if (diffDays === -1) {
      return { label: 'Yesterday', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    } else {
      return { label: `${Math.abs(diffDays)}d ago`, color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  // Smart Sorting Logic:
  // For 'Forwarded' (Dispatched) section:
  // Chronological proximity order:
  // 1. Leads booked for TODAY appear at the very top.
  // 2. Leads booked for TOMORROW appear right behind them.
  // 3. Leads for day +2, day +3, etc. follow in exact parallel chronological order.
  // 4. Within the same day, earlier timeslots appear before later timeslots (e.g. 9 AM before 4 PM).
  // 5. Past appointments appear below active/future bookings.
  // For other tabs (e.g. Pending/New Leads):
  // Preserve newest inquiry received at the top (createdAt descending).
  displayedBookings.sort((a, b) => {
    if (currentAdminTab === 'Forwarded') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      const apptA = parseAppointmentTimestamp(a.date, a.time);
      const apptB = parseAppointmentTimestamp(b.date, b.time);

      const isUpcomingA = apptA >= startOfToday;
      const isUpcomingB = apptB >= startOfToday;

      // Both are upcoming (Today or Future): nearest slot comes first!
      if (isUpcomingA && isUpcomingB) {
        if (apptA !== apptB) return apptA - apptB;
      } else if (isUpcomingA && !isUpcomingB) {
        // A is upcoming/today, B is past -> A comes first!
        return -1;
      } else if (!isUpcomingA && isUpcomingB) {
        // B is upcoming/today, A is past -> B comes first!
        return 1;
      } else {
        // Both are in the past: most recent past first
        if (apptA !== apptB) return apptB - apptA;
      }

      // Tiebreaker: newest inquiry first
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;

      return (b.id || '').localeCompare(a.id || '');
    }

    // Default tabs (New Leads / Pending / Completed): Latest inquiry received strictly at the top
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeB !== timeA) return timeB - timeA;

    const dateA = a.date ? new Date(`${a.date} ${a.time || '00:00'}`).getTime() : 0;
    const dateB = b.date ? new Date(`${b.date} ${b.time || '00:00'}`).getTime() : 0;
    if (dateB !== dateA) return dateB - dateA;

    return (b.id || '').localeCompare(a.id || '');
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border-t-4 border-gray-900 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="text-gray-900" size={32} />
            </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Founder Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Access Key..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 transition-all text-center"
            />
            <button className="w-full bg-gray-950 text-white py-3 rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg">
              Unlock Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tighter leading-tight">FOUNDER DASHBOARD</h1>
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5 sm:mt-1">OPERATIONAL CONTROL CENTER</p>
        </div>
        <div className="flex flex-row flex-wrap w-full md:w-auto gap-2 sm:gap-2.5">
            {/* 1. Dedicated Quotation Button */}
            <button 
              onClick={() => {
                resetQuotationForm();
                setIsQuotationModalOpen(true);
              }}
              className="flex-1 md:flex-none justify-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-3.5 sm:px-4 py-2.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-violet-500/20 border border-violet-400/40 flex items-center gap-1.5 text-center active:scale-95 cursor-pointer"
              title="Create and send inspection quotation to partner"
            >
                <FileText size={14} className="shrink-0 text-violet-200" />
                <span>Quotation</span>
            </button>

            {/* 2. Dedicated Manual Lead Button */}
            <button 
              onClick={() => {
                resetManualLeadForm();
                setIsManualLeadModalOpen(true);
              }}
              className="flex-1 md:flex-none justify-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3.5 sm:px-4 py-2.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 border border-emerald-400/40 flex items-center gap-1.5 text-center active:scale-95 cursor-pointer"
              title="Create & directly dispatch confirmed lead to technician"
            >
                <PlusCircle size={14} className="shrink-0 text-emerald-200" />
                <span>Manual Lead</span>
            </button>

            <button 
              onClick={() => setMainTab('InfluencerManagement')}
              className="flex-1 md:flex-none justify-center bg-purple-50 text-purple-700 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition shadow-sm border border-purple-200 flex items-center gap-2 text-center"
            >
                <Sparkles size={14} className="shrink-0 text-amber-500" /> <span>Influencers Hub</span>
            </button>
            <button 
              onClick={() => setShowPartnersDirectory(true)}
              className="flex-1 md:flex-none justify-center bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition shadow-sm border border-indigo-100 flex items-center gap-2 text-center"
            >
                <Users size={14} className="shrink-0" /> <span>Technician Directory</span>
            </button>
            <button className="flex-1 md:flex-none justify-center bg-gray-100 text-gray-600 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition flex items-center gap-2 text-center">
                <FileSpreadsheet className="shrink-0" size={14} /> <span>Export Data</span>
            </button>
        </div>
      </div>

      <div className="flex space-x-1 mb-6 sm:mb-10 bg-gray-100 p-1 rounded-2xl w-full md:w-fit overflow-x-auto scrollbar-hide">
        <button onClick={() => setMainTab('Dashboard')} className={`flex-shrink-0 py-2.5 px-4 sm:px-6 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${mainTab === 'Dashboard' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Operational</button>
        <button onClick={() => setMainTab('InfluencerManagement')} className={`flex-shrink-0 py-2.5 px-4 sm:px-6 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1.5 ${mainTab === 'InfluencerManagement' ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md' : 'text-purple-700 bg-purple-50 hover:bg-purple-100'}`}>
          <Sparkles size={13} className={mainTab === 'InfluencerManagement' ? 'text-amber-300' : 'text-purple-600'} />
          <span>Influencers</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${mainTab === 'InfluencerManagement' ? 'bg-amber-400 text-gray-950' : 'bg-purple-200 text-purple-900'}`}>25%</span>
        </button>
        <button onClick={() => setMainTab('FollowUps')} className={`flex-shrink-0 py-2.5 px-4 sm:px-6 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${mainTab === 'FollowUps' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Follow-ups</button>
        <button onClick={() => setMainTab('BlogManager')} className={`flex-shrink-0 py-2.5 px-4 sm:px-6 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${mainTab === 'BlogManager' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Marketing</button>
        <button onClick={() => setMainTab('PartnerManagement')} className={`flex-shrink-0 py-2.5 px-4 sm:px-6 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${mainTab === 'PartnerManagement' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Supply</button>
      </div>

      {mainTab === 'FollowUps' && <FollowUpManager />}
      {mainTab === 'BlogManager' && <BlogManager />}
      {mainTab === 'PartnerManagement' && <PartnerManager />}
      {mainTab === 'InfluencerManagement' && <InfluencerManager />}

      {mainTab === 'Dashboard' && (
        <div className="space-y-10">
          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div onClick={() => setShowPartnersDirectory(true)} className="cursor-pointer">
              <StatCard 
                title="Active Partners" 
                value={partners.filter(p => p.status === 'available').length.toString()} 
                icon={<Users size={24} />} 
                color="text-gray-900" 
                bg="bg-gray-50"
              />
            </div>
            <StatCard 
              title="Pending Leads" 
              value={pendingJobs.toString()} 
              icon={<Clock size={24} />} 
              color="text-amber-600" 
              bg="bg-amber-50"
            />
            <StatCard 
              title="Assigned Leads" 
              value={assignedJobs.toString()} 
              icon={<Send size={24} />} 
              color="text-purple-600" 
              bg="bg-purple-50"
            />
            <StatCard 
              title="Completed Leads" 
              value={completedJobs.toString()} 
              icon={<CheckCircle size={24} />} 
              color="text-sky-600" 
              bg="bg-sky-50"
            />
          </div>

          {assignmentNotice && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-950 text-white font-bold text-xs flex items-center justify-between gap-3 shadow-lg shadow-indigo-500/20 border border-indigo-500/30 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>{assignmentNotice}</span>
              </div>
              <button 
                onClick={() => setAssignmentNotice(null)}
                className="text-indigo-300 hover:text-white text-xs font-black px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="px-5 sm:px-8 py-6 sm:py-8 border-b border-gray-100 flex flex-col gap-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-gray-900">Lead Registry</h3>
                    {unreadPendingCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        {unreadPendingCount} NEW UNSEEN
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                    Real-Time Service Traffic • Sorted Newest First • Auto-Dispatched
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="text"
                      placeholder="Search name, phone, area, ID..."
                      value={leadSearchTerm}
                      onChange={e => setLeadSearchTerm(e.target.value)}
                      className="w-full sm:w-64 pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  {unreadPendingCount > 0 && (
                    <button
                      onClick={markAllLeadsAsViewed}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors border border-emerald-200 flex items-center gap-1.5 shrink-0 shadow-sm"
                      title="Mark all new inquiries as viewed"
                    >
                      <Eye size={12} />
                      <span>Mark All Seen</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex bg-white rounded-2xl p-1 border border-gray-200 w-full overflow-x-auto scrollbar-hide">
                <button 
                    onClick={() => setCurrentAdminTab('Pending')} 
                    className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${currentAdminTab === 'Pending' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    <span>New Leads ({pendingJobs})</span>
                    {unreadPendingCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    )}
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Quotations')} 
                    className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${currentAdminTab === 'Quotations' ? 'bg-violet-600 text-white shadow-lg shadow-violet-100' : 'text-gray-500 hover:text-violet-600'}`}
                >
                    <FileText size={12} className={currentAdminTab === 'Quotations' ? 'text-violet-200' : 'text-gray-400'} />
                    <span>Pending Quotation ({quotationJobs})</span>
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Forwarded')} 
                    className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentAdminTab === 'Forwarded' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    Dispatched ({forwardedJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Accepted')} 
                    className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentAdminTab === 'Accepted' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    Accepted ({acceptedJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Review')} 
                    className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentAdminTab === 'Review' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    Review ({reviewJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Completed')} 
                    className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentAdminTab === 'Completed' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    Completed ({completedJobs})
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-8 space-y-4 min-h-[500px] bg-gray-50/30">
              {displayedBookings.map((booking, index) => {
                const isUnseen = !viewedLeadIds.includes(booking.id);
                const inquiryInfo = formatInquiryTime(booking.createdAt, booking.date, booking.time);

                return (
                <div 
                  key={booking.id} 
                  onClick={() => markLeadAsViewed(booking.id)}
                  className={`relative rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col cursor-pointer ${
                    isUnseen 
                      ? 'border-rose-400 bg-white shadow-md border-l-8 border-l-rose-500 ring-2 ring-rose-400/20 hover:shadow-lg' 
                      : 'border-emerald-400 bg-emerald-50/10 shadow-sm border-l-8 border-l-emerald-500 ring-1 ring-emerald-400/30 hover:shadow-md'
                  }`}
                >
                    {/* Top Status Banner: Prominently displaying SEEN or UNSEEN */}
                    {isUnseen ? (
                      <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-b border-rose-200/80 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                          </span>
                          <span className="text-[11px] font-black uppercase tracking-wider text-rose-700">
                            🔴 NEW LEAD (UNSEEN)
                          </span>
                          <span className="text-[10px] font-medium text-rose-500 hidden sm:inline">
                            • Click anywhere on this lead to mark as SEEN
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markLeadAsViewed(booking.id);
                          }} 
                          className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all"
                        >
                          <Eye size={12} className="text-emerald-600" /> Mark as Seen
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            SEEN BY ADMIN
                          </span>
                          <span className="text-[10px] font-medium text-emerald-700 hidden sm:inline">
                            • Reviewed & Checked
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-sm flex items-center gap-1 ring-1 ring-emerald-500">
                            <CheckCircle2 size={12} className="text-white" /> SEEN
                          </span>
                          <button 
                            type="button"
                            onClick={(e) => toggleLeadViewed(e, booking.id)} 
                            className="text-[10px] font-bold text-gray-400 hover:text-gray-700 hover:underline px-1.5 py-0.5 transition-colors"
                            title="Mark as unseen again"
                          >
                            Mark Unseen
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Content Columns Wrapper */}
                    <div className="flex flex-col md:flex-row flex-1">
                      {/* Left Column: Customer & Service Base Info */}
                      <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col">
                          <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                              <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full font-bold text-lg flex items-center justify-center shrink-0 ${
                                    isUnseen 
                                      ? 'bg-rose-600 text-white shadow-md shadow-rose-200 animate-pulse' 
                                      : 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                                  }`}>
                                      {index + 1}
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-base font-black text-gray-900">{booking.customerName}</h4>
                                        {isUnseen ? (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-500 text-white shadow-sm animate-pulse">
                                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                                            NEW INQUIRY (UNSEEN)
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200">
                                            <CheckCircle2 size={12} className="text-white" /> SEEN
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs font-semibold text-gray-600 flex items-center gap-1 mt-0.5">
                                          <Phone size={12} className="text-indigo-400" /> {booking.contactNumber}
                                      </p>
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                    booking.status === 'pending_quotation' ? 'bg-violet-100 text-violet-800 border border-violet-200' :
                                    booking.status === 'pending' || !booking.status ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                    booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                    'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                }`}>
                                    {booking.status === 'pending_quotation' ? 'Pending Quotation' : (booking.status || 'Pending')}
                                </span>
                              </div>
                          </div>

                        {/* Inquiry Timestamp Callout */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-slate-700 text-xs">
                            <Clock size={13} className="text-indigo-600 shrink-0" />
                            <span className="font-semibold text-[11px] text-gray-500">Inquiry Received:</span>
                            <span className="font-black text-[11px] text-slate-900">{inquiryInfo.full}</span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {inquiryInfo.relative}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-auto pt-3 border-t border-gray-50">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Service</p>
                                <p className="text-xs font-bold text-gray-800 line-clamp-2">{booking.subServiceName || booking.serviceCategory}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                  {booking.status === 'pending_quotation' ? 'Visit Schedule' : 'Appointment Schedule'}
                                </p>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                                      <Calendar size={12} className="text-indigo-500" /> {booking.date}
                                  </p>
                                  {(() => {
                                    const badge = getAppointmentScheduleBadge(booking.date, booking.time);
                                    if (!badge) return null;
                                    return (
                                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${badge.color}`}>
                                        {badge.label}
                                      </span>
                                    );
                                  })()}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{booking.time}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Address & Area</p>
                                <div className="flex items-start gap-1">
                                    <MapPin size={12} className="text-gray-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                        {booking.address ? booking.address : 'Address via Link'} 
                                        {booking.area && <span className="font-medium text-gray-900"> • {booking.area}</span>}
                                    </p>
                                </div>
                                {booking.location_link && (
                                    <a href={booking.location_link} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 mt-1.5 hover:underline w-max">
                                        <MapIcon size={10} /> View Map
                                    </a>
                                )}
                                {booking.description && (
                                    <div className="mt-2.5 p-2.5 rounded-xl bg-violet-50/80 border border-violet-100">
                                        <p className="text-[9px] font-black text-violet-700 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                          <FileText size={10} /> Quotation / Work Scope
                                        </p>
                                        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{booking.description}</p>
                                    </div>
                                )}
                                {booking.appliedReferralCode && (
                                    <div className="mt-3 pt-2 border-t border-purple-100 flex flex-wrap items-center justify-between gap-2 bg-purple-50/80 px-3 py-1.5 rounded-lg border border-purple-200/70">
                                        <div className="flex items-center gap-1.5">
                                            <Sparkles size={12} className="text-purple-600 shrink-0" />
                                            <span className="text-[11px] font-bold text-purple-900">
                                                Influencer Code: <span className="font-black text-purple-700 bg-white px-1.5 py-0.5 rounded border border-purple-200">{booking.appliedReferralCode}</span>
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                          25% Comm: ₹{Math.round((Number(booking.price) || 0) * 0.25).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions & Partner Details */}
                    <div className="w-full md:w-80 flex flex-col bg-gray-50/50">
                        <div className="p-5 flex-1 flex flex-col justify-center">
                            {/* Value & Direct Contact */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                                      {booking.status === 'pending_quotation' ? 'Quotation Value' : 'Est. Price'}
                                    </p>
                                    <p className="text-lg font-black text-emerald-600">
                                      {booking.status === 'pending_quotation' && (!booking.price || booking.price === '0') ? 'Pending Inspection' : `₹${booking.price}`}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <a 
                                      href={`tel:${booking.contactNumber}`} 
                                      onClick={() => markLeadAsViewed(booking.id)}
                                      className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm" 
                                      title="Call Customer"
                                    >
                                        <Phone size={14} />
                                    </a>
                                    <a 
                                      href={`https://wa.me/91${booking.contactNumber}?text=${encodeURIComponent(`Hello ${booking.customerName}, regarding your booking with Sofiyan Home Service...`)}`} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      onClick={() => markLeadAsViewed(booking.id)}
                                      className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm" 
                                      title="WhatsApp Customer"
                                    >
                                        <MessageCircle size={14} />
                                    </a>
                                    <button 
                                      onClick={() => {
                                        markLeadAsViewed(booking.id);
                                        const msg = `🆕 SOFIYAN HOME SERVICE - LEAD\n` +
                                                   `───────────────────\n` +
                                                   `👤 Customer Info:\n` +
                                                   `Name: ${booking.customerName}\n` +
                                                   `Phone: ${booking.contactNumber}\n\n` +
                                                   `🛠️ Service Details:\n` +
                                                   `Category: ${booking.serviceCategory}\n` +
                                                   `Items: ${booking.subServiceName}\n` +
                                                   `Status: ${booking.status}\n` +
                                                   `Amount: ₹${booking.price}\n\n` +
                                                   `📍 Address:\n` +
                                                   `City: ${booking.city || 'Mau'}\n` +
                                                   `Detail: ${booking.address || ''}\n\n` +
                                                   (booking.location_link ? `🔗 Location: ${booking.location_link}\n\n` : '') +
                                                   `⏰ Schedule:\n` +
                                                   `Date: ${booking.date}\n` +
                                                   `Time: ${booking.time}\n\n` +
                                                   `───────────────────\n` +
                                                   `Sent via Sofiyan Home Service App`;
                                        window.open(`https://wa.me/918115983887?text=${encodeURIComponent(msg)}`, '_blank');
                                    }} className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all shadow-sm" title="Forward to Admin WhatsApp">
                                        <Share2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Partner Details (if assigned or quotation) */}
                            {(booking.assignedPartnerName || booking.status === 'Forwarded' || booking.status === 'accepted' || booking.status === 'in_progress' || booking.status === 'pending_quotation') && (() => {
                                const pt = partners.find(p => p.id === booking.assignedPartnerId || p.phone === booking.assignedPartnerPhone || p.name === booking.assignedPartnerName);
                                const isQuote = booking.status === 'pending_quotation';
                                return (
                                    <div className={`${isQuote ? 'bg-violet-950 border border-violet-800/50' : 'bg-indigo-950'} rounded-xl p-3 mb-4 shadow-sm`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[9px] font-bold ${isQuote ? 'text-violet-300' : 'text-indigo-300'} uppercase tracking-wider`}>
                                              {isQuote ? 'Assigned Partner (Inspection)' : 'Dispatched Tech'}
                                            </span>
                                            <span className="text-[9px] font-bold text-emerald-400">{pt?.status === 'available' ? 'Active' : pt?.status || (isQuote ? 'Quotation' : 'Dispatched')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-6 h-6 rounded ${isQuote ? 'bg-violet-800' : 'bg-indigo-800'} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                                                {booking.assignedPartnerName ? booking.assignedPartnerName.charAt(0) : 'P'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h5 className="text-xs font-bold text-white truncate">{booking.assignedPartnerName}</h5>
                                                <p className={`text-[10px] ${isQuote ? 'text-violet-200' : 'text-indigo-200'} truncate`}>{booking.assignedPartnerPhone}</p>
                                            </div>
                                            <div className="flex gap-1.5 shrink-0">
                                                <a href={`tel:${booking.assignedPartnerPhone}`} className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center text-white transition-colors" title="Call Partner"><Phone size={10} /></a>
                                                <a href={`https://wa.me/91${booking.assignedPartnerPhone}?text=${encodeURIComponent(`Hello ${booking.assignedPartnerName}, regarding ${booking.customerName} for ${booking.subServiceName}: ${isQuote ? 'Quotation Inspection' : 'Confirmed Booking'}.`)}`} target="_blank" rel="noreferrer" className="w-7 h-7 bg-emerald-500 hover:bg-emerald-600 rounded flex items-center justify-center text-white transition-colors" title="WhatsApp Partner"><MessageCircle size={10} /></a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Primary Action Buttons: Pending Lead */}
                            {booking.status === 'pending' && (
                              <div className="flex flex-col sm:flex-row gap-2 w-full">
                                <button 
                                  onClick={() => {
                                    markLeadAsViewed(booking.id);
                                    setIsManualAssignMode(false);
                                    setDispatchBooking(booking);
                                  }} 
                                  className="flex-1 bg-indigo-600 text-white py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                                >
                                    <Send size={14} /> Assign Technician
                                </button>
                                <button 
                                  onClick={() => {
                                    markLeadAsViewed(booking.id);
                                    setDispatchBooking(booking);
                                    setIsManualAssignMode(true);
                                    setManualPartnerName('');
                                    setManualPartnerPhone('');
                                    setManualPartnerCategory(booking.serviceCategory || 'Cleaning');
                                    setManualServiceType(booking.subServiceName || booking.serviceCategory || 'General Service');
                                    setManualFormErrors({});
                                    setManualPendingConfirmation(null);
                                  }} 
                                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
                                  title="Manually assign an external partner to this lead"
                                >
                                    <UserPlus size={14} /> Manual Assignment
                                </button>
                              </div>
                            )}

                            {/* Primary Action Buttons: Pending Quotation (Switch & Cancel) */}
                            {booking.status === 'pending_quotation' && (
                              <div className="flex flex-col sm:flex-row gap-2 w-full">
                                <button 
                                  onClick={() => {
                                    markLeadAsViewed(booking.id);
                                    handleOpenSwitchModal(booking);
                                  }} 
                                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-violet-500/20 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                                  title="Convert quotation into a confirmed lead"
                                >
                                    <ArrowRightLeft size={14} /> Switch
                                </button>
                                <button 
                                  onClick={() => {
                                    markLeadAsViewed(booking.id);
                                    handleCancelQuotation(booking);
                                  }} 
                                  className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
                                  title="Cancel this quotation"
                                >
                                    <XCircle size={14} /> Cancel
                                </button>
                              </div>
                            )}
                            
                            {(booking.status === 'Forwarded' || booking.status === 'accepted' || booking.status === 'in_progress' || booking.status === 'admin_review') && (
                                <button 
                                  onClick={() => { 
                                    markLeadAsViewed(booking.id);
                                    setSelectedRating(5); 
                                    setRatingBookingId(booking.id); 
                                  }} 
                                  className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={14} /> Complete Job
                                </button>
                            )}
                            
                            {booking.status === 'completed' && (
                                <div className="space-y-1.5">
                                  <div className="w-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-between">
                                      <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-600" /> Completed</span>
                                      <span className="text-amber-600 font-extrabold flex items-center gap-0.5">
                                        {booking.partner_rating ? `User Rated: ${booking.partner_rating}★` : 'Awaiting User Rating'}
                                      </span>
                                  </div>
                                  {booking.partner_comment && (
                                    <p className="text-[11px] text-gray-600 italic bg-gray-50 p-2 rounded-lg border border-gray-100 line-clamp-2">
                                      "{booking.partner_comment}"
                                    </p>
                                  )}
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-gray-100/50 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-xs mt-auto">
                            <span className="text-[10px] font-semibold text-gray-400">ID: {booking.id.startsWith('b0000000-0000-4000-8000-00000000') ? booking.id.substring(32) : booking.id.substring(0,6) + '...'}</span>
                            <div className="flex gap-3">
                                <button 
                                  onClick={() => {
                                    markLeadAsViewed(booking.id);
                                    setRescheduleData({ booking, date: booking.date, time: booking.time });
                                  }} 
                                  className="text-gray-500 hover:text-indigo-600 font-bold flex items-center gap-1 transition-colors"
                                >
                                    <Calendar size={12} /> Reschedule
                                </button>
                                <button 
                                  onClick={() => {
                                    markLeadAsViewed(booking.id);
                                    handleCancelBooking(booking);
                                  }} 
                                  className="text-gray-500 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors"
                                >
                                    <Plus className="rotate-45" size={14} /> Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              ); })}
              {displayedBookings.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="text-gray-200" size={48} />
                    </div>
                    <p className="text-lg font-bold text-gray-400 uppercase tracking-widest">No Active Leads</p>
                    <p className="text-sm text-gray-400 mt-2">All operational channels are clear.</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals remain similarly structured but cleaner */}
      <Modal isOpen={!!rescheduleData.booking} onClose={() => setRescheduleData({ booking: null, date: '', time: '' })} title="Adjust Operations">
          <form onSubmit={handleRescheduleSubmit} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Date</label>
                    <input type="date" value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" required />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Appointment Time</label>
                    <input type="time" value={rescheduleData.time} onChange={e => setRescheduleData({...rescheduleData, time: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" required />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-black transition-all">Update Schedule</button>
          </form>
      </Modal>

      <Modal 
        isOpen={!!dispatchBooking} 
        onClose={() => { 
          setDispatchBooking(null); 
          setPartnerSearchResults([]); 
          setHasSearched(false); 
          setPendingConfirmation(null);
          setShowBeyondRadius(false);
          setIsManualAssignMode(false);
          setManualPartnerName('');
          setManualPartnerPhone('');
          setManualPartnerCategory('');
          setManualServiceType('');
          setManualFormErrors({});
          setManualPendingConfirmation(null);
        }} 
        title={isManualAssignMode ? "Manual Partner Assignment" : "Assign Technician (20 KM Smart Matching)"}
      >
        <div className="space-y-5 pt-2">
            {/* Target Lead Summary Header */}
            {dispatchBooking && (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-2xl border border-indigo-100 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Target Lead
                      </span>
                      <span className="font-extrabold text-indigo-950 text-sm">
                        {dispatchBooking.customerName}
                      </span>
                      <span className="text-gray-500 font-bold">({dispatchBooking.contactNumber || 'No phone'})</span>
                    </div>
                    <p className="text-gray-700 font-semibold mt-1">
                      🛠️ <span className="text-indigo-900 font-bold">{dispatchBooking.subServiceName || dispatchBooking.serviceCategory}</span> • 💵 ₹{dispatchBooking.price}
                    </p>
                    <p className="text-gray-500 font-medium text-[11px] mt-0.5">
                      📍 {dispatchBooking.address ? `${dispatchBooking.address}, ` : ''}{dispatchBooking.city || 'City'} {dispatchBooking.pinCode ? `(${dispatchBooking.pinCode})` : ''}
                    </p>
                  </div>
                  <div className="self-start sm:self-center shrink-0">
                    <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Activity size={11} /> Max 20 KM Radius
                    </span>
                  </div>
                </div>

                {/* Prominent, Responsive Mode Toggle Bar (No clipping) */}
                <div className="pt-2 border-t border-indigo-100/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <span className="text-[11px] text-indigo-800 font-semibold">
                    {!isManualAssignMode 
                      ? "Can't find a technician nearby? Assign any partner manually." 
                      : "Directly assign an external partner and forward lead details."}
                  </span>
                  {!isManualAssignMode ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualAssignMode(true);
                        setManualPartnerName('');
                        setManualPartnerPhone('');
                        setManualPartnerCategory(dispatchBooking.serviceCategory || 'Cleaning');
                        setManualServiceType(dispatchBooking.subServiceName || dispatchBooking.serviceCategory || 'General Service');
                        setManualFormErrors({});
                        setManualPendingConfirmation(null);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0"
                    >
                      <UserPlus size={14} />
                      <span>Manual Partner Assignment</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualAssignMode(false);
                        setManualPendingConfirmation(null);
                      }}
                      className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <ArrowLeft size={13} />
                      <span>Back to 20 KM Matching</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Manual Partner Assignment View vs 20 KM Workflow */}
            {isManualAssignMode ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                {manualPendingConfirmation ? (
                  /* Confirmation Prompt: “Has the new partner accepted this lead?” */
                  <div className="p-6 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl border-2 border-amber-400/50 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-400 text-indigo-950 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                        ?
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                          Partner Confirmation Check
                        </span>
                        <h4 className="text-lg sm:text-xl font-black text-white mt-0.5 leading-snug">
                          Has the new partner accepted this lead?
                        </h4>
                        <p className="text-xs text-indigo-200 mt-1">
                          Did <strong className="text-white">{manualPendingConfirmation.partnerName}</strong> confirm they will accept and execute this job?
                        </p>
                      </div>
                    </div>

                    {/* Summary of Lead & New Partner */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-indigo-200 border-b border-white/10 pb-2">
                        <span className="font-semibold">New Partner:</span>
                        <span className="font-black text-white">{manualPendingConfirmation.partnerName} (+91 {manualPendingConfirmation.partnerPhone})</span>
                      </div>
                      <div className="flex justify-between items-center text-indigo-200 border-b border-white/10 pb-2">
                        <span className="font-semibold">Category & Service Type:</span>
                        <span className="font-black text-emerald-300">
                          {manualPendingConfirmation.serviceCategory} • {manualPendingConfirmation.serviceType}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-indigo-200 border-b border-white/10 pb-2">
                        <span className="font-semibold">Customer Lead:</span>
                        <span className="font-black text-white">{manualPendingConfirmation.booking.customerName} ({manualPendingConfirmation.booking.contactNumber || 'No phone'})</span>
                      </div>
                      <div className="flex justify-between items-center text-indigo-200 border-b border-white/10 pb-2">
                        <span className="font-semibold">Schedule & Amount:</span>
                        <span className="font-black text-amber-300">
                          {manualPendingConfirmation.booking.date} | {manualPendingConfirmation.booking.time} • ₹{manualPendingConfirmation.booking.price}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-indigo-200">
                        <span className="font-semibold">Platform Commission:</span>
                        <span className="font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-400/30">
                          25% per confirmed lead (₹{Math.round((Number(manualPendingConfirmation.booking.price) || 0) * 0.25)})
                        </span>
                      </div>
                    </div>

                    {/* Quick Link to Re-open WhatsApp if needed */}
                    <div className="text-center">
                      <a
                        href={manualPendingConfirmation.waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-emerald-200 underline"
                      >
                        <MessageCircle size={14} />
                        <span>Re-open WhatsApp chat with {manualPendingConfirmation.partnerName}</span>
                      </a>
                    </div>

                    {/* Decision Buttons: Yes – Confirm Assignment / No – Not Accepted */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleManualConfirmAssignment(true)}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 px-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 border border-emerald-400/40"
                      >
                        <CheckCircle size={16} />
                        <span>Yes – Confirm Assignment</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleManualConfirmAssignment(false)}
                        className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 py-4 px-5 rounded-2xl font-black text-xs uppercase tracking-widest border border-rose-500/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span>✕ No – Not Accepted</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Manual Partner Assignment Form */
                  <form onSubmit={handleManualPartnerForward} className="space-y-4">
                    <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl text-xs text-amber-950 flex items-start gap-3">
                      <UserPlus size={18} className="text-amber-700 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-black uppercase tracking-wide text-[10px] text-amber-900">
                          Manual Partner Assignment Form
                        </p>
                        <p className="text-[11px] leading-relaxed text-amber-800">
                          Enter the details of the partner to assign. When you click <strong>Send, Confirm & Forward</strong>, all customer and job details along with the 25% platform commission will be forwarded via WhatsApp, and you will be asked to confirm their acceptance.
                        </p>
                      </div>
                    </div>

                    {/* Form Fields: New Partner Name, Partner Contact Number, Service Category, Service Type */}
                    <div className="space-y-3.5">
                      {/* 1. New Partner Name */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                          New Partner Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={manualPartnerName}
                          onChange={(e) => {
                            setManualPartnerName(e.target.value);
                            if (manualFormErrors.name) setManualFormErrors(prev => ({ ...prev, name: undefined }));
                          }}
                          placeholder="e.g. Ramesh Kumar / Star Solutions"
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none font-bold text-xs transition-all ${manualFormErrors.name ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-200' : 'border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500'}`}
                        />
                        {manualFormErrors.name && (
                          <p className="text-rose-600 text-[11px] font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {manualFormErrors.name}
                          </p>
                        )}
                      </div>

                      {/* 2. Partner Contact Number */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                          Partner Contact Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 select-none">
                            🇮🇳 +91
                          </span>
                          <input
                            type="tel"
                            value={manualPartnerPhone}
                            onPaste={(e) => {
                              e.preventDefault();
                              const text = e.clipboardData.getData('text');
                              setManualPartnerPhone(cleanIndianMobileNumber(text));
                              if (manualFormErrors.phone) setManualFormErrors(prev => ({ ...prev, phone: undefined }));
                            }}
                            onChange={(e) => {
                              setManualPartnerPhone(cleanIndianMobileNumber(e.target.value));
                              if (manualFormErrors.phone) setManualFormErrors(prev => ({ ...prev, phone: undefined }));
                            }}
                            placeholder="10-digit mobile number (e.g. 9876543210)"
                            maxLength={25}
                            className={`w-full pl-16 pr-4 py-3 bg-gray-50 border rounded-2xl outline-none font-bold text-xs transition-all ${manualFormErrors.phone ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-200' : 'border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500'}`}
                          />
                        </div>
                        {manualFormErrors.phone && (
                          <p className="text-rose-600 text-[11px] font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {manualFormErrors.phone}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 font-semibold mt-1">
                          Customer lead details will be dispatched directly to this WhatsApp number.
                        </p>
                      </div>

                      {/* 3. Service Category */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                          Service Category <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <select
                            value={manualPartnerCategory}
                            onChange={(e) => {
                              setManualPartnerCategory(e.target.value);
                              if (manualFormErrors.category) setManualFormErrors(prev => ({ ...prev, category: undefined }));
                            }}
                            className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none font-bold text-xs transition-all ${manualFormErrors.category ? 'border-rose-400 bg-rose-50/30' : 'border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500'}`}
                          >
                            {Array.from(new Set([
                              dispatchBooking.serviceCategory,
                              'Cleaning',
                              'AC',
                              'Electrical',
                              'Plumbing',
                              'Appliances',
                              'Painting',
                              'Carpentry',
                              'Other'
                            ].filter(Boolean))).map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={manualPartnerCategory}
                            onChange={(e) => {
                              setManualPartnerCategory(e.target.value);
                              if (manualFormErrors.category) setManualFormErrors(prev => ({ ...prev, category: undefined }));
                            }}
                            placeholder="Or type custom category..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        {manualFormErrors.category && (
                          <p className="text-rose-600 text-[11px] font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {manualFormErrors.category}
                          </p>
                        )}
                      </div>

                      {/* 4. Service Type */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                          Service Type <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={manualServiceType}
                          onChange={(e) => {
                            setManualServiceType(e.target.value);
                            if (manualFormErrors.serviceType) setManualFormErrors(prev => ({ ...prev, serviceType: undefined }));
                          }}
                          placeholder="e.g. Deep Cleaning, AC Repair, 1 BHK Furnished..."
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none font-bold text-xs transition-all ${manualFormErrors.serviceType ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-200' : 'border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500'}`}
                        />
                        {manualFormErrors.serviceType && (
                          <p className="text-rose-600 text-[11px] font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {manualFormErrors.serviceType}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Form Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={isSubmittingManualAssign}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white py-3.5 px-5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        {isSubmittingManualAssign ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Forwarding Details...</span>
                          </>
                        ) : (
                          <>
                            <MessageCircle size={16} />
                            <span>Send, Confirm & Forward</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualAssignMode(false);
                          setManualFormErrors({});
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 px-5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : pendingConfirmation ? (
              <div className="p-6 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl border-2 border-indigo-500/40 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-400 text-indigo-950 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                    ?
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                      Technician Confirmation Check
                    </span>
                    <h4 className="text-lg sm:text-xl font-black text-white mt-0.5 leading-snug">
                      Has the service partner confirmed this lead?
                    </h4>
                    <p className="text-xs text-indigo-200 mt-1">
                      Did <strong className="text-white">{pendingConfirmation.partner.name}</strong> confirm they will accept and execute this job?
                    </p>
                  </div>
                </div>

                {/* Lead & Technician Summary Box */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-indigo-200 border-b border-white/10 pb-2">
                    <span className="font-semibold">Technician:</span>
                    <span className="font-black text-white">{pendingConfirmation.partner.name} ({pendingConfirmation.partner.phone})</span>
                  </div>
                  <div className="flex justify-between items-center text-indigo-200 border-b border-white/10 pb-2">
                    <span className="font-semibold">Haversine Distance:</span>
                    <span className="font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-400/30">
                      📍 {pendingConfirmation.partner.formattedDistance || formatDistance(pendingConfirmation.partner.calculatedDistance)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-indigo-200 border-b border-white/10 pb-2">
                    <span className="font-semibold">Customer Lead:</span>
                    <span className="font-black text-white">{pendingConfirmation.booking.customerName} • {pendingConfirmation.booking.subServiceName}</span>
                  </div>
                  <div className="flex justify-between items-center text-indigo-200">
                    <span className="font-semibold">Schedule & Amount:</span>
                    <span className="font-black text-amber-300">
                      {pendingConfirmation.booking.date} | {pendingConfirmation.booking.time} • ₹{pendingConfirmation.booking.price}
                    </span>
                  </div>
                </div>

                {/* Decision Buttons: Yes / No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleConfirmLeadAssignment(true)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 px-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 border border-emerald-400/40"
                  >
                    <CheckCircle size={16} />
                    <span>✓ Yes, Partner Confirmed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmLeadAssignment(false)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-4 px-5 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>✕ No, Keep Available</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Search Bar within 20 KM Partners */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        value={partnerSearchQuery} 
                        onChange={e => setPartnerSearchQuery(e.target.value)} 
                        placeholder="Filter available technicians by name, phone, or skill..." 
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs" 
                      />
                    </div>
                    <button 
                      onClick={handlePartnerSearch} 
                      className="bg-indigo-900 text-white px-5 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-black transition-all"
                      title="Refresh 20 KM list"
                    >
                      <Search size={18} />
                    </button>
                </div>
                
                {/* List of Eligible Technicians within 20 KM */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {isSearchingPartners ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                          <Loader2 className="animate-spin text-indigo-600" size={32} />
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Calculating Haversine distances...
                          </p>
                        </div>
                    ) : (
                     partnerSearchResults.map((partner, index) => (
                        <div 
                          key={partner.id} 
                          className="p-5 border border-gray-200/80 rounded-3xl bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col gap-4 group relative"
                        >
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex items-center gap-3.5">
                                  <div className="relative">
                                    <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                        {partner.name?.charAt(0) || 'T'}
                                    </div>
                                    <span className="absolute -top-1.5 -left-1.5 bg-indigo-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                                      #{index + 1}
                                    </span>
                                  </div>

                                  <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-black text-gray-900 text-sm tracking-tight">{partner.name}</p>
                                        <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-black uppercase">
                                          ● Available
                                        </span>
                                      </div>

                                      {/* Exact Calculated Haversine Distance */}
                                      <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md border border-emerald-200">
                                          <MapPin size={11} className="text-emerald-700" />
                                          <span>{partner.formattedDistance || formatDistance(partner.calculatedDistance)}</span>
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                                          {partner.city || 'City'} • {partner.experience || '2'} yrs exp
                                        </span>
                                        {partner.rating && (
                                          <span className="text-[10px] font-black text-amber-600 flex items-center gap-0.5">
                                            <Star size={10} className="fill-amber-400 text-amber-400" /> {partner.rating}
                                          </span>
                                        )}
                                      </div>

                                      {/* Registered Categories Badges */}
                                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                        {partner.categories && Array.isArray(partner.categories) && partner.categories.map((cat: string) => (
                                          <span key={cat} className="text-[9px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-bold border border-gray-200">
                                            {cat}
                                          </span>
                                        ))}
                                      </div>
                                  </div>
                              </div>

                              {/* Phone and WhatsApp Action Buttons */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                 <button
                                   type="button"
                                   onClick={() => handleInitiateContact(partner, 'call')}
                                   className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm"
                                   title="Call Technician"
                                 >
                                    <Phone size={16} />
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => handleInitiateContact(partner, 'whatsapp')}
                                   className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm"
                                   title="Chat on WhatsApp"
                                 >
                                    <MessageCircle size={16} />
                                 </button>
                              </div>
                            </div>
                            
                            <button 
                                type="button"
                                onClick={() => handleInitiateContact(partner, 'assign')}
                                className="bg-indigo-950 hover:bg-indigo-900 text-white w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                            >
                              <span>Contact & Confirm Assignment</span>
                              <ChevronRight size={14} />
                            </button>
                        </div>
                    ))
                    )}

                    {hasSearched && !isSearchingPartners && partnerSearchResults.length === 0 && (
                        <div className="text-center py-10 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <MapPin className="mx-auto text-indigo-300 mb-3" size={40} />
                            <h6 className="font-black text-gray-800 text-sm">No Active Technicians Within 20 KM</h6>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4 font-medium">
                              No active technicians registered for "{dispatchBooking?.serviceCategory}" within the 20 km radius of the customer.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                              {!showBeyondRadius && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowBeyondRadius(true);
                                    handlePartnerSearch();
                                  }}
                                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                                >
                                  View All Available Technicians For This Category
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setIsManualAssignMode(true);
                                  setManualPartnerName('');
                                  setManualPartnerPhone('');
                                  setManualPartnerCategory(dispatchBooking?.serviceCategory || 'Cleaning');
                                  setManualServiceType(dispatchBooking?.subServiceName || dispatchBooking?.serviceCategory || 'General Service');
                                  setManualFormErrors({});
                                  setManualPendingConfirmation(null);
                                }}
                                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                              >
                                <UserPlus size={15} />
                                <span>Manual Partner Assignment</span>
                              </button>
                            </div>
                        </div>
                    )}
                </div>
              </>
            )}
        </div>
      </Modal>

      <Modal isOpen={showPartnersDirectory} onClose={() => setShowPartnersDirectory(false)} title="Technician Directory">
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center bg-indigo-950/5 p-4 rounded-2xl border border-indigo-950/5">
            <div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Partner Force</p>
              <h3 className="text-base font-black text-indigo-950 leading-none mt-1">
                {partners.filter(p => p.status === 'available').length} Available Professionals
              </h3>
            </div>
            <div className="flex -space-x-2">
               {partners.filter(p => p.status === 'available').slice(0, 5).map((p) => (
                 <div key={p.id} className="w-8 h-8 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-950 shadow-sm">
                   {p.name.charAt(0)}
                 </div>
               ))}
               {partners.filter(p => p.status === 'available').length > 5 && (
                 <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-indigo-100 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                   +{partners.filter(p => p.status === 'available').length - 5}
                 </div>
               )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 text-gray-400" size={14} />
              <input
                type="text"
                value={directorySearchQuery}
                onChange={(e) => setDirectorySearchQuery(e.target.value)}
                placeholder="Search technicians by name, skill, phone, pin code..."
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all placeholder-gray-400"
              />
            </div>
            
            {/* Status Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {[
                { label: 'All', value: 'all', count: partners.length },
                { label: 'Active', value: 'available', count: partners.filter(p => p.status === 'available').length },
                { label: 'Busy', value: 'busy', count: partners.filter(p => p.status === 'busy').length },
                { label: 'Pending', value: 'pending', count: partners.filter(p => p.status === 'pending').length },
                { label: 'On Hold', value: 'on_hold', count: partners.filter(p => p.status === 'on_hold').length },
                { label: 'Blocked', value: 'blocked', count: partners.filter(p => p.status === 'blocked').length },
              ].map((tab) => {
                const isSelected = directoryStatusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setDirectoryStatusFilter(tab.value as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                      isSelected 
                        ? 'bg-indigo-900 border-indigo-900 text-white font-extrabold shadow-md' 
                        : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid list container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {partners
              .filter(p => {
                if (directoryStatusFilter !== 'all' && p.status !== directoryStatusFilter) return false;
                if (directorySearchQuery.trim()) {
                  const q = directorySearchQuery.toLowerCase();
                  return (
                    p.name?.toLowerCase().includes(q) ||
                    p.phone?.includes(q) ||
                    p.city?.toLowerCase().includes(q) ||
                    p.pincode?.includes(q) ||
                    (p.categories || []).some(c => c.toLowerCase().includes(q)) ||
                    (p.sub_categories || []).some(sc => sc.toLowerCase().includes(q))
                  );
                }
                return true;
              })
              .sort((a, b) => {
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                if (ratingB !== ratingA) return ratingB - ratingA;
                const jobsA = a.completedJobs || 0;
                const jobsB = b.completedJobs || 0;
                if (jobsB !== jobsA) return jobsB - jobsA;
                const earnA = a.earnings || 0;
                const earnB = b.earnings || 0;
                return earnB - earnA;
              })
              .map((partner, index) => (
                <div 
                  key={partner.id} 
                  className="p-3 border border-gray-100 rounded-2xl bg-white hover:border-indigo-600/20 hover:shadow-md transition-all flex flex-col justify-between gap-3 group border-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5 min-w-0 relative">
                      {/* Status-colored visual circular avatar */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm border shadow-inner flex-shrink-0 ${
                        partner.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        partner.status === 'busy' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        partner.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        partner.status === 'on_hold' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                        'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {partner.name.charAt(0)}
                      </div>
                      {index < 3 && directoryStatusFilter === 'all' && !directorySearchQuery && (
                        <div className={`absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>
                          #{index + 1}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-black text-gray-900 tracking-tight leading-tight text-xs truncate max-w-[130px]" title={partner.name}>
                          {partner.name}
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 truncate">
                          {partner.city || 'Verified'} {partner.pincode && `| ${partner.pincode}`}
                        </p>
                      </div>
                    </div>
                    {/* Compact layout controls: call, whatsapp & status picker inline */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a 
                        href={`tel:${partner.phone}`}
                        className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center hover:bg-indigo-600 hover:text-white transition shadow-sm border border-indigo-100"
                      >
                        <Phone size={12} />
                      </a>
                      <a 
                        href={`https://wa.me/91${partner.phone}?text=${encodeURIComponent(`Hello ${partner.name}, from Sofiyan Home Service...`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-7 h-7 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center hover:bg-emerald-600 hover:text-white transition shadow-sm border border-emerald-100"
                      >
                        <MessageCircle size={12} />
                      </a>
                      
                      {/* Status inline editor */}
                      <select
                        value={partner.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as any;
                          try {
                            const { error } = await supabase
                              .from('primary_partners')
                              .update({ status: newStatus })
                              .eq('id', partner.id);
                            if (error) throw error;
                            updatePartner({ ...partner, status: newStatus });
                          } catch (err: any) {
                            alert("Failed to update status: " + err.message);
                          }
                        }}
                        className="text-[9px] font-bold border border-gray-200 rounded-lg px-1 py-1 bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-[72px]"
                      >
                        <option value="available">Active</option>
                        <option value="busy">Busy</option>
                        <option value="pending">Pending</option>
                        <option value="on_hold">On Hold</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                  </div>

                  {/* Profile data grid block */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[10px]">
                    {/* Col 1: Categories & Exp */}
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest block font-sans">Skills & Experience</p>
                      <div className="flex flex-wrap gap-1">
                        {(partner.categories || []).slice(0, 2).map((cat: string) => (
                          <span key={cat} className="text-[8px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded font-black uppercase tracking-wider">
                            {cat}
                          </span>
                        ))}
                      </div>
                      <p className="text-[9px] text-gray-500 font-bold">
                        {partner.experience ? `${partner.experience}` : 'Experienced'} {partner.age && `| Age: ${partner.age}`}
                      </p>
                    </div>

                    {/* Col 2: Business Stats & Verification */}
                    <div className="space-y-1 border-l border-gray-50 pl-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Quality score</span>
                        <div className="flex items-center gap-0.5">
                          <Star size={9} className="text-yellow-400 fill-current" />
                          <span className="font-extrabold text-gray-900">{partner.rating?.toFixed(1) || '5.0'}</span>
                          <span className="text-gray-400 text-[8px]">({partner.review_count || 0})</span>
                        </div>
                      </div>
                      <p className="font-mono text-[9px] text-indigo-900 font-bold block leading-none">
                        Completed: {partner.completedJobs || 0} jobs
                      </p>
                      <p className="text-[8px] font-black text-emerald-700 leading-none">
                        Payouts: ₹{partner.earnings || 0}
                      </p>
                    </div>
                  </div>

                  {/* Verifications and documents */}
                  <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-gray-50 mt-0.5">
                    {partner.aadhar_number ? (
                      <span className="text-emerald-700 bg-emerald-50/70 py-0.5 px-2 rounded-full font-black uppercase tracking-wider text-[8px] flex items-center gap-1 border border-emerald-100">
                        🛡️ Aadhaar Verified {partner.aadhar_number.replace(/.(?=.{4})/g, "•")}
                      </span>
                    ) : (
                      <span className="text-gray-400 bg-gray-50 py-0.5 px-2 rounded-full font-black uppercase tracking-wider text-[8px] flex items-center gap-1">
                        ⚠️ No Aadhaar Added
                      </span>
                    )}

                    {partner.id_proof_url ? (
                      <button 
                        onClick={() => handleViewDocument(partner.id_proof_url!)}
                        className="text-indigo-600 font-black hover:underline tracking-wider uppercase text-[8px] flex items-center gap-0.5 bg-indigo-50/50 hover:bg-indigo-50 py-0.5 px-2 rounded transition cursor-pointer"
                      >
                        📄 View Document
                      </button>
                    ) : (
                      <span className="text-[8px] text-gray-300 uppercase tracking-widest">No Document</span>
                    )}
                  </div>
                </div>
              ))}
            
            {partners.filter(p => {
              if (directoryStatusFilter !== 'all' && p.status !== directoryStatusFilter) return false;
              if (directorySearchQuery.trim()) {
                const q = directorySearchQuery.toLowerCase();
                return (
                  p.name?.toLowerCase().includes(q) ||
                  p.phone?.includes(q) ||
                  p.city?.toLowerCase().includes(q) ||
                  (p.categories || []).some(c => c.toLowerCase().includes(q))
                );
              }
              return true;
            }).length === 0 && (
              <div className="col-span-full py-12 text-center">
                 <Users className="mx-auto text-gray-100 mb-4 animate-bounce" size={48} />
                 <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Match Found</p>
                 <p className="text-xs text-gray-400 mt-2">Try adjusting your query or status selection.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={ratingBookingId !== null} onClose={() => setRatingBookingId(null)} title="Quality Control & Feedback Rating">
        <div className="space-y-6 pt-4 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 mb-2">
                <CheckCircle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 leading-none">Complete Booking Lead</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-2">Rate assigned technician service</p>
            </div>

            <div className="flex justify-center gap-3 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  className={`p-2 transition-transform hover:scale-110 active:scale-95 ${star <= selectedRating ? 'text-yellow-400' : 'text-gray-200'}`}
                >
                  <Star size={36} className={star <= selectedRating ? 'fill-current' : ''} />
                </button>
              ))}
            </div>

            <button
               onClick={handleCompleteBookingAndRate}
               disabled={isSubmittingRating}
               className="w-full bg-indigo-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md flex items-center justify-center gap-2"
            >
               {isSubmittingRating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Completion & Post Rating"}
            </button>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 1. QUOTATION MODAL: Create & Send Quotation with 20 KM Partner Matching  */}
      {/* ========================================================================= */}
      <Modal 
        isOpen={isQuotationModalOpen} 
        onClose={() => {
          setIsQuotationModalOpen(false);
          resetQuotationForm();
        }} 
        title="Create & Send Quotation"
      >
        <form onSubmit={handleQuotationSubmit} className="space-y-4 pt-2">
          {/* Header Description */}
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 p-3.5 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black text-violet-700 uppercase tracking-widest">Inspection Workflow</p>
              <h4 className="text-sm font-extrabold text-violet-950">Schedule Site Visit & Assign Partner</h4>
            </div>
            <span className="bg-violet-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider shrink-0 shadow-sm">
              25% Comm.
            </span>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Customer Name *</label>
              <input 
                type="text" 
                value={quoteCustomerName} 
                onChange={e => setQuoteCustomerName(e.target.value)} 
                placeholder="e.g. Ramesh Kumar" 
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all"
                required
              />
              {quoteFormErrors.customerName && <p className="text-[10px] text-rose-600 font-bold mt-1">{quoteFormErrors.customerName}</p>}
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Customer Contact Number *</label>
              <div className="flex">
                <span className="px-2.5 py-2.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-xs font-bold text-gray-600 select-none">+91</span>
                <input 
                  type="tel" 
                  value={quoteCustomerPhone} 
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text');
                    setQuoteCustomerPhone(cleanIndianMobileNumber(text));
                    if (quoteFormErrors.customerPhone) setQuoteFormErrors(prev => ({ ...prev, customerPhone: undefined }));
                  }}
                  onChange={e => {
                    setQuoteCustomerPhone(cleanIndianMobileNumber(e.target.value));
                    if (quoteFormErrors.customerPhone) setQuoteFormErrors(prev => ({ ...prev, customerPhone: undefined }));
                  }} 
                  placeholder="10-digit mobile number" 
                  maxLength={25}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-r-xl text-xs font-semibold focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all"
                  required
                />
              </div>
              {quoteFormErrors.customerPhone && <p className="text-[10px] text-rose-600 font-bold mt-1">{quoteFormErrors.customerPhone}</p>}
            </div>
          </div>

          {/* Service Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Service Category *</label>
              <select 
                value={quoteServiceCategory} 
                onChange={e => setQuoteServiceCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all"
              >
                {SERVICES.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Service Type *</label>
              <input 
                type="text" 
                value={quoteServiceType} 
                onChange={e => setQuoteServiceType(e.target.value)} 
                placeholder="e.g. Deep Home Cleaning (2 BHK)" 
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all"
                required
              />
              {quoteFormErrors.serviceType && <p className="text-[10px] text-rose-600 font-bold mt-1">{quoteFormErrors.serviceType}</p>}
            </div>
          </div>

          {/* Visit Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Visit Date *</label>
              <input 
                type="date" 
                value={quoteVisitDate} 
                onChange={e => setQuoteVisitDate(e.target.value)} 
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all"
                required
              />
              {quoteFormErrors.visitDate && <p className="text-[10px] text-rose-600 font-bold mt-1">{quoteFormErrors.visitDate}</p>}
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Visit Time *</label>
              <select 
                value={quoteVisitTime} 
                onChange={e => {
                  setQuoteVisitTime(e.target.value);
                  if (quoteFormErrors.visitTime) setQuoteFormErrors(prev => ({ ...prev, visitTime: undefined }));
                }} 
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all cursor-pointer"
                required
              >
                <option value="">Select Visit Time Slot</option>
                {ADMIN_TIME_SLOTS.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
              {quoteFormErrors.visitTime && <p className="text-[10px] text-rose-600 font-bold mt-1">{quoteFormErrors.visitTime}</p>}
            </div>
          </div>

          {/* Customer Location Link */}
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Customer Location Link (Google Maps)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="url" 
                value={quoteLocationLink} 
                onChange={e => setQuoteLocationLink(e.target.value)} 
                placeholder="https://maps.app.goo.gl/... or https://google.com/maps?q=..." 
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all"
              />
            </div>
            {extractCoordsFromMapLink(quoteLocationLink) && (
              <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <Check size={11} /> Coordinates extracted: {extractCoordsFromMapLink(quoteLocationLink)?.lat.toFixed(4)}, {extractCoordsFromMapLink(quoteLocationLink)?.lng.toFixed(4)} (20 KM auto-filtering active)
              </p>
            )}
          </div>

          {/* Partner Search & Selection Section */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-wider block">
                  Partner Search & Assignment (20 KM Radius)
                </label>
                <p className="text-[10px] text-gray-400 font-medium">Select eligible active technician nearby</p>
              </div>

              {/* Small "+ More" button for manual assignment */}
              <button 
                type="button" 
                onClick={() => {
                  setShowQuoteManualMore(!showQuoteManualMore);
                  if (!showQuoteManualMore) {
                    setQuoteSelectedPartner(null);
                  }
                }}
                className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 border ${
                  showQuoteManualMore 
                    ? 'bg-amber-100 text-amber-900 border-amber-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                }`}
              >
                <span>{showQuoteManualMore ? 'Hide More' : '+ More'}</span>
                {showQuoteManualMore ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>

            {/* Collapsible Manual Partner Assignment Fields */}
            {showQuoteManualMore ? (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 space-y-2.5 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold">
                  <UserPlus size={14} className="text-amber-700" />
                  <span>Manual Partner Assignment (Direct Entry)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[9px] font-black text-amber-800 uppercase tracking-wider block mb-0.5">Partner Name *</label>
                    <input 
                      type="text" 
                      value={quoteManualPartnerName} 
                      onChange={e => setQuoteManualPartnerName(e.target.value)} 
                      placeholder="e.g. Aslam Khan" 
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    {quoteFormErrors.manualPartnerName && <p className="text-[10px] text-rose-600 font-bold mt-0.5">{quoteFormErrors.manualPartnerName}</p>}
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-amber-800 uppercase tracking-wider block mb-0.5">Partner Contact Number *</label>
                    <div className="flex">
                      <span className="px-2 py-2 bg-amber-100/70 border border-r-0 border-amber-200 rounded-l-lg text-xs font-bold text-amber-900 select-none">+91</span>
                      <input 
                        type="tel" 
                        value={quoteManualPartnerPhone} 
                        onPaste={(e) => {
                          e.preventDefault();
                          const text = e.clipboardData.getData('text');
                          setQuoteManualPartnerPhone(cleanIndianMobileNumber(text));
                          if (quoteFormErrors.manualPartnerPhone) setQuoteFormErrors(prev => ({ ...prev, manualPartnerPhone: undefined }));
                        }}
                        onChange={e => {
                          setQuoteManualPartnerPhone(cleanIndianMobileNumber(e.target.value));
                          if (quoteFormErrors.manualPartnerPhone) setQuoteFormErrors(prev => ({ ...prev, manualPartnerPhone: undefined }));
                        }} 
                        placeholder="10-digit number" 
                        maxLength={25}
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-r-lg text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    {quoteFormErrors.manualPartnerPhone && <p className="text-[10px] text-rose-600 font-bold mt-0.5">{quoteFormErrors.manualPartnerPhone}</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Search Bar */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                  <input 
                    type="text" 
                    value={quoteSearchQuery} 
                    onChange={e => setQuoteSearchQuery(e.target.value)} 
                    placeholder="Search technician by name, phone, or area..." 
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                </div>

                {/* Selected Partner Banner */}
                {quoteSelectedPartner && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {quoteSelectedPartner.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                          {quoteSelectedPartner.name}
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Selected</span>
                        </p>
                        <p className="text-[10px] text-emerald-700 font-semibold">{quoteSelectedPartner.phone} • {quoteSelectedPartner.city || 'Mau'}</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setQuoteSelectedPartner(null)} 
                      className="text-[10px] font-bold text-gray-400 hover:text-rose-600 px-2 py-1"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* 20 KM Results List */}
                {(() => {
                  const { coords, partners: matchedList } = getEligiblePartnersForWorkflow(quoteServiceCategory, quoteLocationLink, quoteSearchQuery);
                  return (
                    <div className="max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar pr-1 border border-gray-100 rounded-xl p-1 bg-gray-50/50">
                      {matchedList.length > 0 ? (
                        matchedList.map(p => {
                          const isSelected = quoteSelectedPartner?.id === p.id;
                          return (
                            <div 
                              key={p.id} 
                              onClick={() => setQuoteSelectedPartner(p)}
                              className={`p-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                                isSelected 
                                  ? 'bg-violet-50 border-violet-300 ring-1 ring-violet-400' 
                                  : 'bg-white border-gray-100 hover:border-violet-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-900 font-bold text-xs flex items-center justify-center shrink-0">
                                  {p.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                                  <p className="text-[10px] text-gray-500 truncate">{p.phone} • {p.city || 'Mau'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {p.isWithin20Km && coords && (
                                  <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                                    {p.formattedDistance}
                                  </span>
                                )}
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md transition-all ${
                                  isSelected ? 'bg-violet-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-violet-100'
                                }`}>
                                  {isSelected ? 'Selected ✓' : 'Select'}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-4 text-center">
                          <p className="text-xs font-bold text-gray-400">No active partners found for "{quoteServiceCategory}" within 20 km.</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Click "+ More" above to enter a partner manually.</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
                {quoteFormErrors.partner && <p className="text-[10px] text-rose-600 font-bold mt-1">{quoteFormErrors.partner}</p>}
              </div>
            )}
          </div>

          {/* Platform Commission Disclosure Banner */}
          <div className="bg-violet-50 border border-violet-200 p-2.5 rounded-xl flex items-center justify-between text-[11px] font-medium text-violet-900">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-violet-600 shrink-0" />
              <span>Platform Commission: <strong>25%</strong> per confirmed lead</span>
            </span>
            <span className="text-[10px] font-bold text-violet-700 bg-white px-2 py-0.5 rounded border border-violet-200">Auto WhatsApp</span>
          </div>

          {/* Submit Action */}
          <button 
            type="submit" 
            disabled={isSubmittingQuotation}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-violet-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmittingQuotation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <FileText size={15} />
                <span>Submit Quotation & Send WhatsApp Alert</span>
              </>
            )}
          </button>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. MANUAL LEAD MODAL: Direct Lead Creation & Immediate Dispatch           */}
      {/* ========================================================================= */}
      <Modal 
        isOpen={isManualLeadModalOpen} 
        onClose={() => {
          setIsManualLeadModalOpen(false);
          resetManualLeadForm();
        }} 
        title="Direct Manual Lead Creation"
      >
        <form onSubmit={handleManualLeadSubmit} className="space-y-4 pt-2">
          {/* Header Description */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-3.5 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Direct Dispatch</p>
              <h4 className="text-sm font-extrabold text-emerald-950">Create Confirmed Lead & Dispatch Partner</h4>
            </div>
            <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider shrink-0 shadow-sm">
              Dispatched Section
            </span>
          </div>

          {/* Service & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Service Category *</label>
              <select 
                value={mlServiceCategory} 
                onChange={e => setMlServiceCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
              >
                {SERVICES.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Service Type *</label>
              <input 
                type="text" 
                value={mlServiceType} 
                onChange={e => setMlServiceType(e.target.value)} 
                placeholder="e.g. Sofa Cleaning 5 Seater" 
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                required
              />
              {mlFormErrors.serviceType && <p className="text-[10px] text-rose-600 font-bold mt-1">{mlFormErrors.serviceType}</p>}
            </div>
          </div>

          {/* Quotation Description */}
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Quotation Description / Scope of Work *</label>
            <textarea 
              value={mlQuotationDescription} 
              onChange={e => setMlQuotationDescription(e.target.value)} 
              rows={2}
              placeholder="e.g. Deep dry foam shampooing of 5 sofa seats, dust extraction, sanitization..." 
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
              required
            />
            {mlFormErrors.quotationDesc && <p className="text-[10px] text-rose-600 font-bold mt-0.5">{mlFormErrors.quotationDesc}</p>}
          </div>

          {/* Total Service Charge (₹) & Live 25% Commission Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Total Service Charge (₹) *</label>
              {mlTotalServiceCharge && Number(mlTotalServiceCharge) > 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  25% Comm: ₹{Math.round(Number(mlTotalServiceCharge) * 0.25)} | Partner: ₹{Number(mlTotalServiceCharge) - Math.round(Number(mlTotalServiceCharge) * 0.25)}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₹</span>
              <input 
                type="number" 
                value={mlTotalServiceCharge} 
                onChange={e => setMlTotalServiceCharge(e.target.value)} 
                placeholder="e.g. 1499" 
                min="1"
                className="w-full pl-8 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                required
              />
            </div>
            {mlFormErrors.totalCharge && <p className="text-[10px] text-rose-600 font-bold mt-1">{mlFormErrors.totalCharge}</p>}
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Customer Name *</label>
              <input 
                type="text" 
                value={mlCustomerName} 
                onChange={e => setMlCustomerName(e.target.value)} 
                placeholder="e.g. Amit Verma" 
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                required
              />
              {mlFormErrors.customerName && <p className="text-[10px] text-rose-600 font-bold mt-1">{mlFormErrors.customerName}</p>}
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Customer Contact Number *</label>
              <div className="flex">
                <span className="px-2.5 py-2.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-xs font-bold text-gray-600 select-none">+91</span>
                <input 
                  type="tel" 
                  value={mlCustomerPhone} 
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text');
                    setMlCustomerPhone(cleanIndianMobileNumber(text));
                    if (mlFormErrors.customerPhone) setMlFormErrors(prev => ({ ...prev, customerPhone: undefined }));
                  }}
                  onChange={e => {
                    setMlCustomerPhone(cleanIndianMobileNumber(e.target.value));
                    if (mlFormErrors.customerPhone) setMlFormErrors(prev => ({ ...prev, customerPhone: undefined }));
                  }} 
                  placeholder="10-digit mobile number" 
                  maxLength={25}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-r-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                  required
                />
              </div>
              {mlFormErrors.customerPhone && <p className="text-[10px] text-rose-600 font-bold mt-1">{mlFormErrors.customerPhone}</p>}
            </div>
          </div>

          {/* Location Link */}
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Customer Location Link (Google Maps)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="url" 
                value={mlLocationLink} 
                onChange={e => setMlLocationLink(e.target.value)} 
                placeholder="https://maps.app.goo.gl/... or https://google.com/maps?q=..." 
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
              />
            </div>
            {extractCoordsFromMapLink(mlLocationLink) && (
              <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <Check size={11} /> Coordinates extracted: {extractCoordsFromMapLink(mlLocationLink)?.lat.toFixed(4)}, {extractCoordsFromMapLink(mlLocationLink)?.lng.toFixed(4)} (20 KM auto-filtering active)
              </p>
            )}
          </div>

          {/* Confirmed Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Confirmed Date *</label>
              <input 
                type="date" 
                value={mlConfirmedDate} 
                onChange={e => setMlConfirmedDate(e.target.value)} 
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                required
              />
              {mlFormErrors.confirmedDate && <p className="text-[10px] text-rose-600 font-bold mt-1">{mlFormErrors.confirmedDate}</p>}
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Confirmed Time *</label>
              <select 
                value={mlConfirmedTime} 
                onChange={e => {
                  setMlConfirmedTime(e.target.value);
                  if (mlFormErrors.confirmedTime) setMlFormErrors(prev => ({ ...prev, confirmedTime: undefined }));
                }} 
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all cursor-pointer"
                required
              >
                <option value="">Select Confirmed Time Slot</option>
                {ADMIN_TIME_SLOTS.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
              {mlFormErrors.confirmedTime && <p className="text-[10px] text-rose-600 font-bold mt-1">{mlFormErrors.confirmedTime}</p>}
            </div>
          </div>

          {/* Partner Search & Selection Section */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-wider block">
                  Partner Search & Assignment (20 KM Radius)
                </label>
                <p className="text-[10px] text-gray-400 font-medium">Auto-filters active technicians within 20 km</p>
              </div>

              {/* Small "+ More" button for manual assignment */}
              <button 
                type="button" 
                onClick={() => {
                  setShowMlManualMore(!showMlManualMore);
                  if (!showMlManualMore) {
                    setMlSelectedPartner(null);
                  }
                }}
                className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 border ${
                  showMlManualMore 
                    ? 'bg-amber-100 text-amber-900 border-amber-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                }`}
              >
                <span>{showMlManualMore ? 'Hide More' : '+ More'}</span>
                {showMlManualMore ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>

            {/* Collapsible Manual Partner Assignment Fields */}
            {showMlManualMore ? (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 space-y-2.5 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold">
                  <UserPlus size={14} className="text-amber-700" />
                  <span>Manual Partner Assignment (Direct Entry)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[9px] font-black text-amber-800 uppercase tracking-wider block mb-0.5">Partner Name *</label>
                    <input 
                      type="text" 
                      value={mlManualPartnerName} 
                      onChange={e => setMlManualPartnerName(e.target.value)} 
                      placeholder="e.g. Aslam Khan" 
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    {mlFormErrors.manualPartnerName && <p className="text-[10px] text-rose-600 font-bold mt-0.5">{mlFormErrors.manualPartnerName}</p>}
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-amber-800 uppercase tracking-wider block mb-0.5">Partner Contact Number *</label>
                    <div className="flex">
                      <span className="px-2 py-2 bg-amber-100/70 border border-r-0 border-amber-200 rounded-l-lg text-xs font-bold text-amber-900 select-none">+91</span>
                      <input 
                        type="tel" 
                        value={mlManualPartnerPhone} 
                        onPaste={(e) => {
                          e.preventDefault();
                          const text = e.clipboardData.getData('text');
                          setMlManualPartnerPhone(cleanIndianMobileNumber(text));
                          if (mlFormErrors.manualPartnerPhone) setMlFormErrors(prev => ({ ...prev, manualPartnerPhone: undefined }));
                        }}
                        onChange={e => {
                          setMlManualPartnerPhone(cleanIndianMobileNumber(e.target.value));
                          if (mlFormErrors.manualPartnerPhone) setMlFormErrors(prev => ({ ...prev, manualPartnerPhone: undefined }));
                        }} 
                        placeholder="10-digit number" 
                        maxLength={25}
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-r-lg text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    {mlFormErrors.manualPartnerPhone && <p className="text-[10px] text-rose-600 font-bold mt-0.5">{mlFormErrors.manualPartnerPhone}</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Search Bar */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                  <input 
                    type="text" 
                    value={mlSearchQuery} 
                    onChange={e => setMlSearchQuery(e.target.value)} 
                    placeholder="Search technician by name, phone, or area..." 
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Selected Partner Banner */}
                {mlSelectedPartner && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {mlSelectedPartner.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                          {mlSelectedPartner.name}
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Selected</span>
                        </p>
                        <p className="text-[10px] text-emerald-700 font-semibold">{mlSelectedPartner.phone} • {mlSelectedPartner.city || 'Mau'}</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setMlSelectedPartner(null)} 
                      className="text-[10px] font-bold text-gray-400 hover:text-rose-600 px-2 py-1"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* 20 KM Results List */}
                {(() => {
                  const { coords, partners: matchedList } = getEligiblePartnersForWorkflow(mlServiceCategory, mlLocationLink, mlSearchQuery);
                  return (
                    <div className="max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar pr-1 border border-gray-100 rounded-xl p-1 bg-gray-50/50">
                      {matchedList.length > 0 ? (
                        matchedList.map(p => {
                          const isSelected = mlSelectedPartner?.id === p.id;
                          return (
                            <div 
                              key={p.id} 
                              onClick={() => setMlSelectedPartner(p)}
                              className={`p-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                                isSelected 
                                  ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400' 
                                  : 'bg-white border-gray-100 hover:border-emerald-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-900 font-bold text-xs flex items-center justify-center shrink-0">
                                  {p.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                                  <p className="text-[10px] text-gray-500 truncate">{p.phone} • {p.city || 'Mau'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {p.isWithin20Km && coords && (
                                  <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                                    {p.formattedDistance}
                                  </span>
                                )}
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md transition-all ${
                                  isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-emerald-100'
                                }`}>
                                  {isSelected ? 'Selected ✓' : 'Select'}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-4 text-center">
                          <p className="text-xs font-bold text-gray-400">No active partners found for "{mlServiceCategory}" within 20 km.</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Click "+ More" above to enter a partner manually.</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
                {mlFormErrors.partner && <p className="text-[10px] text-rose-600 font-bold mt-1">{mlFormErrors.partner}</p>}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button 
            type="submit" 
            disabled={isSubmittingManualLead}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmittingManualLead ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <PlusCircle size={15} />
                <span>Submit Lead & Dispatch to Dispatched Section</span>
              </>
            )}
          </button>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. SWITCH MODAL: Convert Quotation into Confirmed Lead                   */}
      {/* ========================================================================= */}
      <Modal 
        isOpen={switchBooking !== null} 
        onClose={() => {
          setSwitchBooking(null);
          setSwitchFormErrors({});
        }} 
        title="Switch Quotation to Confirmed Lead"
      >
        {switchBooking && (
          <form onSubmit={handleSwitchConfirm} className="space-y-4 pt-2">
            {/* Header info showing current quotation summary */}
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 p-3.5 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-violet-700 bg-white px-2 py-0.5 rounded border border-violet-200">
                  Target Quotation
                </span>
                <span className="text-xs font-extrabold text-violet-950">
                  {switchBooking.customerName} ({switchBooking.contactNumber})
                </span>
              </div>
              <p className="text-xs text-gray-700 font-semibold">
                🛠️ {switchBooking.subServiceName || switchBooking.serviceCategory} • 📍 {switchBooking.address || 'Address'} ({switchBooking.city || 'Mau'})
              </p>
              {switchBooking.assignedPartnerName && (
                <p className="text-[11px] text-violet-900 font-medium">
                  Assigned Partner: <strong>{switchBooking.assignedPartnerName}</strong> ({switchBooking.assignedPartnerPhone})
                </p>
              )}
            </div>

            {/* Exactly 3 Primary Fields */}
            {/* Field 1: Estimate Description */}
            <div>
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-wider block mb-1">
                1. Estimate Description (Scope of Work / Inclusions) *
              </label>
              <textarea 
                value={switchEstimateDesc} 
                onChange={e => setSwitchEstimateDesc(e.target.value)} 
                rows={3}
                placeholder="Detail the approved scope of work, labor, materials, and warranty..." 
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all"
                required
              />
              {switchFormErrors.estimateDesc && <p className="text-[10px] text-rose-600 font-bold mt-0.5">{switchFormErrors.estimateDesc}</p>}
            </div>

            {/* Field 2: Total Service Charge */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-wider block">
                  2. Total Service Charge (₹) *
                </label>
                {switchTotalCharge && Number(switchTotalCharge) > 0 && (
                  <span className="text-[10px] font-bold text-violet-800 bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                    25% Comm: ₹{Math.round(Number(switchTotalCharge) * 0.25)} | Partner: ₹{Number(switchTotalCharge) - Math.round(Number(switchTotalCharge) * 0.25)}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₹</span>
                <input 
                  type="number" 
                  value={switchTotalCharge} 
                  onChange={e => setSwitchTotalCharge(e.target.value)} 
                  placeholder="e.g. 2499" 
                  min="1"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-violet-950 focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all"
                  required
                />
              </div>
              {switchFormErrors.totalCharge && <p className="text-[10px] text-rose-600 font-bold mt-1">{switchFormErrors.totalCharge}</p>}
            </div>

            {/* Field 3: Confirmed Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-wider block mb-1">
                  3. Confirmed Date *
                </label>
                <input 
                  type="date" 
                  value={switchConfirmedDate} 
                  onChange={e => setSwitchConfirmedDate(e.target.value)} 
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all"
                  required
                />
                {switchFormErrors.confirmedDate && <p className="text-[10px] text-rose-600 font-bold mt-1">{switchFormErrors.confirmedDate}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-wider block mb-1">
                  Confirmed Time *
                </label>
                <select 
                  value={switchConfirmedTime} 
                  onChange={e => {
                    setSwitchConfirmedTime(e.target.value);
                    if (switchFormErrors.confirmedTime) setSwitchFormErrors(prev => ({ ...prev, confirmedTime: undefined }));
                  }} 
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all cursor-pointer"
                  required
                >
                  <option value="">Select Confirmed Time Slot</option>
                  {ADMIN_TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                {switchFormErrors.confirmedTime && <p className="text-[10px] text-rose-600 font-bold mt-1">{switchFormErrors.confirmedTime}</p>}
              </div>
            </div>

            {/* Platform Commission Disclosure Banner */}
            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-[11px] font-medium text-emerald-900">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>Move to <strong>Dispatched</strong> & send confirmed WhatsApp message</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">25% Commission</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setSwitchBooking(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmittingSwitch}
                className="flex-[2] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-violet-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingSwitch ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ArrowRightLeft size={15} />
                    <span>Confirm & Forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};


const StatCard = ({ title, value, icon, color, bg }: { title: string, value: string, icon: React.ReactNode, color: string, bg: string }) => (
  <div className="bg-white p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
    <div className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl ${bg} ${color} shadow-inner shrink-0 inline-flex`}>
      {/* Clone the icon to make it smaller on mobile if possible, or just let CSS scale it, but since it's ReactNode, we wrap it in a div that scales down */}
      <div className="transform scale-75 sm:scale-100 origin-center flex items-center justify-center">
        {icon}
      </div>
    </div>
    <div className="min-w-0 w-full mt-1 sm:mt-0">
      <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1 truncate">{title}</p>
      <h3 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tighter truncate">{value}</h3>
    </div>
  </div>
);
