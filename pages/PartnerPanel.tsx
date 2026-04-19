import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { Partner, Booking } from '../types';
import { SERVICES, CITY_DATA, PREDEFINED_AREAS } from '../constants';
import { Modal } from '../components/Modal';
import { Briefcase, CheckCircle, MapPin, User, LogOut, Trash2, Upload, AlertCircle, Clock, Loader2, AlertTriangle, Star, Navigation, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';
import { fetchPincodesByArea, fetchAreasByPincode } from '../services/pincodeService';

const calculateDistanceKM = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRadian = (angle: number) => (Math.PI / 180) * angle;
  const earthRadius = 6371; // km
  const dLat = toRadian(lat2 - lat1);
  const dLon = toRadian(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadian(lat1)) * Math.cos(toRadian(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

export const PartnerPanel: React.FC = () => {
  const navigate = useNavigate();
  const { bookings, updateBooking, updatePartner } = useStore();
  
  // Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const submittingRef = useRef(false); 
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authData, setAuthData] = useState({ name: '', email: '', phone: '', password: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

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
  const [regStep, setRegStep] = useState<'city' | 'details'>('city');
  const [selectedAreasList, setSelectedAreasList] = useState<string[]>([]);
  const [editSelectedAreasList, setEditSelectedAreasList] = useState<string[]>([]);
  const [discoveredPincodesList, setDiscoveredPincodesList] = useState<string[]>([]);
  const [editDiscoveredPincodesList, setEditDiscoveredPincodesList] = useState<string[]>([]);
  const [fetchingPincodes, setFetchingPincodes] = useState(false);
  const [customAreaInput, setCustomAreaInput] = useState('');
  const [editCustomAreaInput, setEditCustomAreaInput] = useState('');
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [pincodeAreas, setPincodeAreas] = useState<string[]>([]);
  const [editPincodeError, setEditPincodeError] = useState<string | null>(null);
  const [editPincodeAreas, setEditPincodeAreas] = useState<string[]>([]);
  
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
    serviceAreas: '',
    categories: [] as string[],
    subCategories: [] as string[],
    lat: null as number | null,
    lng: null as number | null
  });

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editData, setEditData] = useState({
    phone: '',
    address: '',
    city: '',
    customCity: '',
    pincode: '',
    categories: [] as string[],
    subCategories: [] as string[],
    experience: '',
    gender: 'Male',
    lat: null as number | null,
    lng: null as number | null
  });

  const [isTrackingLocation, setIsTrackingLocation] = useState(false);

  const handleTrackLocation = (isEdit = false) => {
    if (!navigator.geolocation) {
      alert("Location tracking is not supported by your browser.");
      return;
    }
    setIsTrackingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (isEdit) {
            setEditData(prev => ({ ...prev, lat: position.coords.latitude, lng: position.coords.longitude }));
        } else {
            setRegData(prev => ({ ...prev, lat: position.coords.latitude, lng: position.coords.longitude }));
        }
        setIsTrackingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsTrackingLocation(false);
        alert("Unable to fetch location. Please ensure location permissions are granted.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const CATEGORY_LIST = ["Electrician", "Plumber", "Carpenters", "Cleaning & Pest Control", "Pooja", "Home Appliances"];
  const APPLIANCE_LIST = ["A.C. Service & Repair", "Air Cooler Repair", "Air Purifier", "Water Purifier (RO)", "Television", "Chimney Repair", "Geyser", "Washing Machine", "Refrigerator", "Mixer Grinder", "CCTV"];

  useEffect(() => {
    // Check Supabase Connection
    const checkConnection = async () => {
        try {
            const { error } = await supabase.from('primary_partners').select('count', { count: 'exact', head: true });
            if (error) {
                console.error("Supabase Connection Error:", error);
                if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.code === '401') {
                    setAuthError("Database Connection Failed: Invalid API Key. Please verify your Supabase credentials.");
                }
            }
        } catch (err) {
            console.error("Connection check failed:", err);
        }
    };
    checkConnection();

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

  const handleForgotPassword = async () => {
    if (!authData.email) {
        setAuthError("Please enter your email address to reset password.");
        return;
    }
    setIsSubmitting(true);
    setAuthError(null);
    setAuthMessage(null);
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(authData.email, {
            redirectTo: window.location.origin + '/partner',
        });
        if (error) throw error;
        setAuthMessage("Password reset link sent! Check your email.");
    } catch (error: any) {
        console.error("Reset Password Error:", error);
        setAuthError(error.message || "Failed to send reset link.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleAddArea = (area: string) => {
    if (area && !selectedAreasList.includes(area)) {
       setSelectedAreasList([...selectedAreasList, area]);
    }
  };

  const handleRemoveArea = (area: string) => {
      setSelectedAreasList(selectedAreasList.filter(a => a !== area));
  };

  const handleAddCustomArea = () => {
     if (customAreaInput.trim() && !selectedAreasList.includes(customAreaInput.trim())) {
         setSelectedAreasList([...selectedAreasList, customAreaInput.trim()]);
         setCustomAreaInput('');
     }
  };

  const handleEditAddArea = (area: string) => {
    if (area && !editSelectedAreasList.includes(area)) {
       setEditSelectedAreasList([...editSelectedAreasList, area]);
    }
  };

  const handleEditRemoveArea = (area: string) => {
      setEditSelectedAreasList(editSelectedAreasList.filter(a => a !== area));
  };

  const handleEditAddCustomArea = () => {
     if (editCustomAreaInput.trim() && !editSelectedAreasList.includes(editCustomAreaInput.trim())) {
         setEditSelectedAreasList([...editSelectedAreasList, editCustomAreaInput.trim()]);
         setEditCustomAreaInput('');
     }
  };

  useEffect(() => {
    const fetchPins = async () => {
      const computedAreasArray = selectedAreasList.map(a => a.trim()).filter(a => a.length > 0);
      if (computedAreasArray.length > 0) {
        setFetchingPincodes(true);
        const pins = await fetchPincodesByArea(computedAreasArray);
        setDiscoveredPincodesList(pins);
        setFetchingPincodes(false);
      } else {
        setDiscoveredPincodesList([]);
      }
    };
    fetchPins();
  }, [selectedAreasList]);

  useEffect(() => {
    const fetchEditPins = async () => {
      const computedAreasArray = editSelectedAreasList.map(a => a.trim()).filter(a => a.length > 0);
      if (computedAreasArray.length > 0) {
        setFetchingPincodes(true);
        const pins = await fetchPincodesByArea(computedAreasArray);
        setEditDiscoveredPincodesList(pins);
        setFetchingPincodes(false);
      } else {
        setEditDiscoveredPincodesList([]);
      }
    };
    fetchEditPins();
  }, [editSelectedAreasList]);

  useEffect(() => {
    const fetchReverse = async () => {
      const pin = regData.pincode;
      if (pin.length === 6) {
        setFetchingPincodes(true);
        const res = await fetchAreasByPincode(pin);
        setFetchingPincodes(false);
        if (res.success) {
           if (regData.city === 'Bangalore' && !res.isBangalore) {
               setPincodeError("It is a pin code outside of Bangalore city.");
               setPincodeAreas([]);
           } else {
               setPincodeError(null);
               setPincodeAreas(res.areas);
           }
        } else {
           setPincodeError("Invalid or unfound PIN code.");
           setPincodeAreas([]);
        }
      } else {
        setPincodeError(null);
        setPincodeAreas([]);
      }
    };
    fetchReverse();
  }, [regData.pincode, regData.city]);

  useEffect(() => {
    const fetchReverseEdit = async () => {
      const pin = editData.pincode;
      if (pin && pin.length === 6) {
        setFetchingPincodes(true);
        const res = await fetchAreasByPincode(pin);
        setFetchingPincodes(false);
        if (res.success) {
           if (editData.city === 'Bangalore' && !res.isBangalore) {
               setEditPincodeError("It is a pin code outside of Bangalore city.");
               setEditPincodeAreas([]);
           } else {
               setEditPincodeError(null);
               setEditPincodeAreas(res.areas);
           }
        } else {
           setEditPincodeError("Invalid or unfound PIN code.");
           setEditPincodeAreas([]);
        }
      } else {
        setEditPincodeError(null);
        setEditPincodeAreas([]);
      }
    };
    fetchReverseEdit();
  }, [editData.pincode, editData.city]);

  const syncUserWithStore = async (email: string) => {
    try {
        const { data } = await supabase
            .from('primary_partners')
            .select('*')
            .eq('email', email)
            .single();
        
        if (data) {
           const partner: Partner = {
               id: data.id,
               name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.name,
               first_name: data.first_name,
               last_name: data.last_name,
               email: data.email,
               phone: data.phone,
               gender: data.gender,
               address: data.address,
               pincode: data.pincode,
               city: data.city,
               lat: data.lat,
               lng: data.lng,
               categories: data.categories || [],
               sub_categories: data.sub_categories || [],
               experience: data.experience,
               status: data.status,
               earnings: data.earnings || 0,
               completedJobs: data.completed_jobs || 0,
               rating: data.rating || 0,
               review_count: data.review_count || 0,
               partner_type: 'Primary'
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
        const { error } = await supabase.auth.signInWithPassword({
          email: authData.email,
          password: authData.password,
        });

        if (error) throw error;
      }
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === 'string' ? error : 'Unknown error');
      const msg = errorMessage.toLowerCase();

      // Handle "User already registered" specifically without logging as error
      if (msg.includes("already registered") || msg.includes("user already exists")) {
        setAuthMode('signin');
        setAuthMessage("Account already exists. Please sign in with your password.");
        setAuthError(null);
        return;
      }

      console.error("Auth Error:", error);
      
      if (msg.includes("rate limit") || msg.includes("too many requests")) {
        setAuthError("System busy. Please wait a minute before trying again.");
      } else if (msg.includes("invalid login credentials") || msg.includes("invalid_grant")) {
        setAuthError("Incorrect email or password. If you just signed up, please confirm your email.");
      } else {
        setAuthError(errorMessage || "Authentication failed. Please try again.");
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

  useEffect(() => {
    // No longer need silent GPS capture
  }, [isRegistrationOpen]);

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
        const pLat = regData.lat;
        const pLng = regData.lng;

        // Auto-Discover Pincodes based on multiselect comma separated arrays
        const computedAreasArray = selectedAreasList.map(a => a.trim()).filter(a => a.length > 0);
        let discoveredPincodes: string[] = [];
        if (computedAreasArray.length > 0) {
            discoveredPincodes = await fetchPincodesByArea(computedAreasArray);
        }

        // Merge reverse resolved areas and pincodes
        const finalServiceAreas = Array.from(new Set([...computedAreasArray, ...pincodeAreas]));
        const finalServicePincodes = Array.from(new Set([...discoveredPincodes]));
        if (regData.pincode && regData.pincode.length === 6 && !pincodeError) {
             finalServicePincodes.push(regData.pincode);
        }

        console.log("🚀 SENDING PARTNER GPS TO SUPABASE:", pLat, pLng, "(Type:", typeof pLat, ")");

        const { error } = await supabase
           .from('primary_partners')
           .insert([
               { 
                   id: session.user.id,
                   name: `${regData.firstName} ${regData.lastName}`.trim(),
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
                   service_areas: finalServiceAreas,
                   service_pincodes: finalServicePincodes,
                   lat: pLat,
                   lng: pLng,
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

  const handleEditProfile = async () => {
    if (!currentUser?.email) return;
    setIsSubmitting(true);
    try {
        const { data, error } = await supabase
            .from('primary_partners')
            .select('*')
            .eq('email', currentUser.email)
            .single();
            
        if (error) throw error;
        
        setEditData({
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            customCity: '',
            pincode: data.pincode || '',
            categories: data.categories || [],
            subCategories: data.sub_categories || [],
            experience: data.experience || '',
            gender: data.gender || 'Male',
            lat: data.lat || null,
            lng: data.lng || null
        });
        setEditSelectedAreasList(Array.isArray(data.service_areas) ? data.service_areas : []);
        setIsEditingProfile(true);
    } catch (err: any) {
        console.error("Error fetching profile for edit:", err);
        alert("Failed to load profile details.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEditCategoryChange = (category: string) => {
    setEditData(prev => {
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

  const handleEditSubCategoryChange = (sub: string) => {
    setEditData(prev => {
        const isSelected = prev.subCategories.includes(sub);
        if (isSelected) {
            return { ...prev, subCategories: prev.subCategories.filter(s => s !== sub) };
        } else {
            return { ...prev, subCategories: [...prev.subCategories, sub] };
        }
    });
  };

  const submitProfileEdit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser?.id) return;

      let finalCityValue = editData.city;
      if (finalCityValue === 'Others') {
          finalCityValue = editData.customCity.trim();
          if (!finalCityValue) {
              alert("Please type your city name in the box provided.");
              return;
          }
      }

      setIsSubmitting(true);

      try {
        const pLat = editData.lat;
        const pLng = editData.lng;

        const computedAreasArray = editSelectedAreasList.map(a => a.trim()).filter(a => a.length > 0);
        let discoveredPincodes: string[] = [];
        if (computedAreasArray.length > 0) {
            discoveredPincodes = await fetchPincodesByArea(computedAreasArray);
        }

        // Merge reverse resolved areas and pincodes
        const finalServiceAreas = Array.from(new Set([...computedAreasArray, ...editPincodeAreas]));
        const finalServicePincodes = Array.from(new Set([...discoveredPincodes]));
        if (editData.pincode && editData.pincode.length === 6 && !editPincodeError) {
             finalServicePincodes.push(editData.pincode);
        }

        const { error } = await supabase
           .from('primary_partners')
           .update({ 
               phone: editData.phone,
               categories: editData.categories, 
               sub_categories: editData.subCategories, 
               experience: editData.experience,
               gender: editData.gender,
               address: editData.address,
               city: finalCityValue,
               pincode: editData.pincode,
               service_areas: finalServiceAreas,
               service_pincodes: finalServicePincodes,
               lat: pLat,
               lng: pLng
           })
           .eq('id', currentUser.id);

        if (error) throw error;

        await syncUserWithStore(currentUser.email);
        
        setIsEditingProfile(false);
        setNotification("Profile Updated Successfully!");

      } catch (error: any) {
        console.error("Error updating profile:", error);
        alert("Update failed: " + (error.message || "Unknown error"));
      } finally {
        setIsSubmitting(false);
      }
  };

  const handleAcceptLead = (booking: Booking) => {
    if (!currentUser) return;
    
    if (currentUser.status === 'blocked') {
      alert("🚫 Your account has been blocked. Please contact admin for support.");
      return;
    }
    
    if (currentUser.status === 'on_hold') {
      alert("⚠️ Your account is currently on hold. You cannot accept new jobs at this time.");
      return;
    }

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

         // Forwarding Logic: Inform Admin about the acceptance
         let servicesText = "Services";
         if (updatedBooking.cartItems && Array.isArray(updatedBooking.cartItems) && updatedBooking.cartItems.length > 0) {
           servicesText = updatedBooking.cartItems.map(item => `${item.name} (x${item.quantity || 1})`).join(', ');
         } else {
             servicesText = updatedBooking.subServiceName;
         }

         let waText = `✅ *LEAD ACCEPTED BY PARTNER* ✅\n\n`;
         waText += `*👤 PARTNER DETAILS*\n`;
         waText += `🛠️ *Name:* ${updatedPartner.name}\n`;
         waText += `📞 *Phone:* ${updatedPartner.phone}\n`;
         waText += `📍 *Base City:* ${updatedPartner.city}\n\n`;

         waText += `*📋 LEAD DETAILS*\n`;
         waText += `🎟️ *Order ID:* #${updatedBooking.id.substring(0,6).toUpperCase()}\n`;
         waText += `👤 *Customer:* ${updatedBooking.customerName}\n`;
         waText += `📞 *Customer Phone:* ${updatedBooking.contactNumber}\n`;
         waText += `📍 *Service Address:* ${updatedBooking.address}, ${updatedBooking.pinCode}\n`;
         waText += `🛠️ *Services:* ${servicesText}\n`;
         waText += `📅 *Schedule:* ${updatedBooking.date} | ${updatedBooking.time}\n`;
         waText += `💵 *Price:* ₹${updatedBooking.price}\n\n`;
         waText += `🔗 *Map:* ${updatedBooking.location_link || 'Not provided'}`;

         const encodedWaText = encodeURIComponent(waText);
         const adminWaLink = `https://wa.me/919219345455?text=${encodedWaText}`;
         
         // Trigger redirect after a short delay so the user sees the notification
         setTimeout(() => {
            window.open(adminWaLink, '_blank');
         }, 1500);

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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={authData.password}
                onChange={e => setAuthData({...authData, password: e.target.value})}
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.44 0 .87-.03 1.28-.09"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
                disabled={isSubmitting}
              >
                Forgot Password?
              </button>
            </div>

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
      if (!currentUser) return false;
      if (b.status !== 'pending' && b.status !== 'Forwarded') return false;

      // 1. Category Matching
      // We check if any of the partner's categories match the lead's service category
      const partnerCategories = currentUser.categories || [];
      const categoryMatch = partnerCategories.some(cat => 
        b.serviceCategory?.toLowerCase().includes(cat.toLowerCase()) || 
        cat.toLowerCase().includes(b.serviceCategory?.toLowerCase())
      );
      
      if (!categoryMatch) return false;

      // 2. Location Matching: Pincode or Area
      const partnerPincodes = currentUser.service_pincodes || [];
      const partnerAreas = currentUser.service_areas || [];
      
      const pincodeMatch = b.pinCode && partnerPincodes.includes(b.pinCode);
      const areaMatch = b.area && partnerAreas.some(a => a.toLowerCase() === b.area!.toLowerCase());

      return pincodeMatch || areaMatch;
  });

  const { total: modalTotal, commission: modalCommission } = paymentModal ? { total: paymentModal.price + extraWorks.reduce((a,c)=>a+c.price,0), commission: (paymentModal.price + extraWorks.reduce((a,c)=>a+c.price,0)) * 0.25 } : { total: 0, commission: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {currentUser?.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              Status: 
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                currentUser?.status === 'available' ? 'bg-green-100 text-green-700' : 
                currentUser?.status === 'busy' ? 'bg-blue-100 text-blue-700' :
                currentUser?.status === 'on_hold' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {currentUser?.status.replace('_', ' ').toUpperCase()}
              </span>
            </p>
            {currentUser?.rating !== undefined && (
              <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                <span className="text-xs font-bold text-yellow-700">{currentUser.rating.toFixed(1)}</span>
                <span className="text-xs text-yellow-600 ml-1">({currentUser.review_count || 0})</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleEditProfile}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors font-medium text-sm"
          >
            <User size={18} /> Edit Profile
          </button>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
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
                   {myActiveJob.cartItems && Array.isArray(myActiveJob.cartItems) ? (
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
                  {(myActiveJob.location_link || (myActiveJob.lat && myActiveJob.lng)) && (
                    <a 
                      href={myActiveJob.location_link || `https://www.google.com/maps?q=${myActiveJob.lat},${myActiveJob.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-rose-100 text-rose-600 font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 hover:bg-rose-200 transition border border-rose-200"
                    >
                      <Navigation size={18} /> Track Location
                    </a>
                  )}
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
                        {lead.cartItems && Array.isArray(lead.cartItems) ? lead.cartItems.map(i => i.name).join(', ') : lead.subServiceName}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">{lead.serviceCategory}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-6 border-t border-gray-50 pt-3">
                    <p className="flex items-center gap-2 font-medium">
                        <MapPin size={16} className="text-red-400" /> 
                        {lead.address} {lead.area ? `- ${lead.area}` : ''} - {lead.pinCode}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {lead.lat && lead.lng && currentUser?.lat && currentUser?.lng && (
                        <p className="flex items-center gap-2 font-black text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <Navigation size={12} className="animate-pulse" />
                          {calculateDistanceKM(currentUser.lat, currentUser.lng, lead.lat, lead.lng).toFixed(1)} KM AWAY
                        </p>
                      )}
                      {(lead.location_link || (lead.lat && lead.lng)) && (
                        <a 
                          href={lead.location_link || `https://www.google.com/maps?q=${lead.lat},${lead.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 font-black text-[10px] uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-200 transition-colors"
                        >
                          <Navigation size={12} />
                          Track Lead Location
                        </a>
                      )}
                    </div>
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
            
            {regStep === 'city' ? (
              <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
                 <div className="p-8">
                   <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                     <div>
                       <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Where do you work? 📍</h2>
                       <p className="text-gray-500 mt-1">Select your primary city to discover service areas.</p>
                     </div>
                     <button onClick={() => { setIsRegistrationOpen(false); handleSignOut(); }} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition">
                       <span className="sr-only">Close</span>
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                   </div>

                   <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                     {CITY_DATA.map((city) => (
                        <div 
                           key={city.name}
                           onClick={() => {
                              setRegData(prev => ({ ...prev, city: city.name }));
                              setRegStep('details');
                           }}
                           className="group cursor-pointer rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 relative bg-white"
                        >
                           <div className="h-32 overflow-hidden relative">
                              <img src={city.img} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/10 to-transparent"></div>
                              <div className="absolute bottom-3 left-3 text-white">
                                 <h3 className="font-bold text-lg leading-tight">{city.name}</h3>
                                 <p className="text-[10px] font-medium text-gray-200 uppercase tracking-wider">{city.areasCount} active areas</p>
                              </div>
                           </div>
                        </div>
                     ))}
                     
                     <div 
                        onClick={() => {
                           setRegData(prev => ({ ...prev, city: 'Others', customCity: '' }));
                           setRegStep('details');
                        }}
                        className="group cursor-pointer rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 bg-gray-50 flex flex-col items-center justify-center h-32"
                     >
                        <MapPin className="w-8 h-8 text-indigo-400 mb-2 group-hover:text-indigo-600 transition-colors" />
                        <h3 className="font-bold text-gray-700 text-sm">Other City</h3>
                     </div>
                   </div>
                 </div>
              </div>
            ) : (
            
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                   <div className="flex flex-col">
                      <button 
                        onClick={() => setRegStep('city')}
                        className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center mb-1 w-fit"
                      >
                         <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                         Back to Cities
                      </button>
                      <h2 className="text-2xl font-bold text-gray-800">Complete Your Partner Profile 🛠️</h2>
                   </div>
                   <button onClick={() => { setIsRegistrationOpen(false); handleSignOut(); }} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition">
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
                       <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Service Areas ({regData.city === 'Others' ? regData.customCity : regData.city})</h3>
                       
                       {regData.city === 'Others' && (
                           <input 
                               type="text" 
                               id="other-city-input" 
                               placeholder="Type your city name" 
                               className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none animate-fadeIn"
                               value={regData.customCity}
                               onChange={(e) => setRegData({...regData, customCity: e.target.value})}
                               required
                           />
                       )}

                       <div className="space-y-4">
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Available Areas</label>
                             <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                {(PREDEFINED_AREAS[regData.city] || []).filter(a => !selectedAreasList.includes(a)).map(area => (
                                   <div 
                                      key={area}
                                      onClick={() => handleAddArea(area)}
                                      className="bg-white border border-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-1 shadow-sm"
                                   >
                                      <Plus size={14} /> {area}
                                   </div>
                                ))}
                                {(PREDEFINED_AREAS[regData.city] || []).filter(a => !selectedAreasList.includes(a)).length === 0 && (
                                   <span className="text-sm text-gray-400 italic py-1">No predefined areas left to select.</span>
                                )}
                             </div>
                             
                             <div className="mt-4 flex gap-2">
                                <input 
                                   type="text"
                                   placeholder="Add a custom area..."
                                   className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                   value={customAreaInput}
                                   onChange={(e) => setCustomAreaInput(e.target.value)}
                                   onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                         e.preventDefault();
                                         handleAddCustomArea();
                                      }
                                   }}
                                />
                                <button
                                   type="button"
                                   onClick={handleAddCustomArea}
                                   className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700"
                                >
                                   Add
                                </button>
                             </div>
                          </div>

                          <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 min-h-[100px]">
                             <label className="block text-xs font-bold text-indigo-800 uppercase mb-2 flex items-center justify-between">
                                Selected Service Areas
                                <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">{selectedAreasList.length}</span>
                             </label>
                             {selectedAreasList.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-indigo-200 rounded-lg text-indigo-400 text-sm">
                                   Click '+' to add areas or type below.
                                </div>
                             ) : (
                                <div className="flex flex-wrap gap-2">
                                   {selectedAreasList.map(area => (
                                      <div 
                                         key={area}
                                         className="bg-indigo-600 text-white text-sm font-medium px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 group"
                                      >
                                         {area}
                                         <button 
                                            type="button" 
                                            onClick={() => handleRemoveArea(area)}
                                            className="w-4 h-4 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition"
                                         >
                                            <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                         </button>
                                      </div>
                                   ))}
                                </div>
                             )}
                          </div>
                          
                          <input 
                            type="number" 
                            placeholder="Other service area pin code" 
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none mt-2 ${pincodeError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                            value={regData.pincode}
                            onChange={(e) => setRegData({...regData, pincode: e.target.value})}
                          />
                          {pincodeError && <p className="text-red-500 text-xs mt-1 font-medium">{pincodeError}</p>}
                          {pincodeAreas.length > 0 && !pincodeError && (
                             <p className="text-emerald-600 text-xs mt-1 font-medium bg-emerald-50 p-1.5 rounded inline-block">
                                📍 Areas found: {pincodeAreas.join(', ')}
                             </p>
                          )}
                          
                          {/* Auto Discovered Pincodes Display */}
                          {selectedAreasList.length > 0 && (
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200 mt-2">
                               <label className="block text-xs font-bold text-green-800 uppercase mb-1 flex items-center justify-between">
                                  Auto-Fetched Pincodes
                                  {fetchingPincodes && <Loader2 className="w-3 h-3 animate-spin" />}
                               </label>
                               <div className="text-sm text-green-700">
                                  {fetchingPincodes ? (
                                      <span className="opacity-70">Fetching from India Post...</span>
                                  ) : discoveredPincodesList.length > 0 ? (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                         {discoveredPincodesList.map(pin => (
                                            <span key={pin} className="bg-green-200/50 text-green-800 px-2 py-0.5 rounded text-xs font-medium border border-green-300">
                                              {pin}
                                            </span>
                                         ))}
                                      </div>
                                  ) : (
                                      <span className="opacity-70">No pincodes found for selected areas.</span>
                                  )}
                               </div>
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Home Address</label>
                              <button 
                                type="button" 
                                onClick={() => handleTrackLocation(false)} 
                                disabled={isTrackingLocation || !!(regData.lat && regData.lng)}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-green-600 flex items-center gap-1"
                              >
                                {regData.lat && regData.lng ? '✓ Location Saved' : isTrackingLocation ? 'Locating...' : '📍 Auto-Detect Location'}
                              </button>
                            </div>
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
            )}
          </div>
        )}

      {isEditingProfile && (
          <div id="partner-edit-modal" className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center px-4 animate-fadeIn backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                   <h2 className="text-2xl font-bold text-gray-800">Edit Your Profile ✏️</h2>
                   <button onClick={() => setIsEditingProfile(false)} className="text-gray-400 hover:text-gray-600">
                     <span className="sr-only">Close</span>
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>

                <form onSubmit={submitProfileEdit} className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="tel" 
                        placeholder="Phone Number" 
                        required 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      />
                      <select 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={editData.gender}
                        onChange={(e) => setEditData({...editData, gender: e.target.value})}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <input 
                        type="number" 
                        placeholder="Work Experience (Years)" 
                        required 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={editData.experience}
                        onChange={(e) => setEditData({...editData, experience: e.target.value})}
                      />
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
                             className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                             checked={editData.categories.includes(cat)}
                             onChange={() => handleEditCategoryChange(cat)}
                           />
                           <span className="text-sm font-medium text-gray-700">{cat}</span>
                         </label>
                       ))}
                    </div>

                    {/* Conditional Sub-Categories */}
                    {editData.categories.includes("Home Appliances") && (
                      <div className="bg-blue-50 p-4 rounded-xl mt-4 border border-blue-100 animate-fadeIn">
                         <h4 className="text-sm font-bold text-blue-800 mb-3">Select Appliances you can repair:</h4>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                           {APPLIANCE_LIST.map((sub) => (
                             <label key={sub} className="flex items-center gap-2">
                               <input 
                                 type="checkbox" 
                                 className="w-4 h-4 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
                                 checked={editData.subCategories.includes(sub)}
                                 onChange={() => handleEditSubCategoryChange(sub)}
                               />
                               <span className="text-sm text-blue-700">{sub}</span>
                             </label>
                           ))}
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                     <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Service Areas ({editData.city === 'Others' ? editData.customCity : editData.city})</h3>
                       
                       {editData.city === 'Others' && (
                           <input 
                               type="text" 
                               id="edit-other-city-input" 
                               placeholder="Type your city name" 
                               className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none animate-fadeIn"
                               value={editData.customCity}
                               onChange={(e) => setEditData({...editData, customCity: e.target.value})}
                               required
                           />
                       )}

                       <div className="space-y-4">
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Available Areas in {editData.city}</label>
                             <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                {(PREDEFINED_AREAS[editData.city] || []).filter(a => !editSelectedAreasList.includes(a)).map(area => (
                                   <div 
                                      key={area}
                                      onClick={() => handleEditAddArea(area)}
                                      className="bg-white border border-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-1 shadow-sm"
                                   >
                                      <Plus size={14} /> {area}
                                   </div>
                                ))}
                                {(PREDEFINED_AREAS[editData.city] || []).filter(a => !editSelectedAreasList.includes(a)).length === 0 && (
                                   <span className="text-sm text-gray-400 italic py-1">No predefined areas left to select.</span>
                                )}
                             </div>
                             
                             <div className="mt-4 flex gap-2">
                                <input 
                                   type="text"
                                   placeholder="Add a custom area..."
                                   className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                   value={editCustomAreaInput}
                                   onChange={(e) => setEditCustomAreaInput(e.target.value)}
                                   onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                         e.preventDefault();
                                         handleEditAddCustomArea();
                                      }
                                   }}
                                />
                                <button
                                   type="button"
                                   onClick={handleEditAddCustomArea}
                                   className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700"
                                >
                                   Add
                                </button>
                             </div>
                          </div>

                          <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 min-h-[100px]">
                             <label className="block text-xs font-bold text-indigo-800 uppercase mb-2 flex items-center justify-between">
                                Selected Service Areas
                                <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">{editSelectedAreasList.length}</span>
                             </label>
                             {editSelectedAreasList.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-indigo-200 rounded-lg text-indigo-400 text-sm">
                                   Click '+' to add areas or type below.
                                </div>
                             ) : (
                                <div className="flex flex-wrap gap-2">
                                   {editSelectedAreasList.map(area => (
                                      <div 
                                         key={area}
                                         className="bg-indigo-600 text-white text-sm font-medium px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 group"
                                      >
                                         {area}
                                         <button 
                                            type="button" 
                                            onClick={() => handleEditRemoveArea(area)}
                                            className="w-4 h-4 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition"
                                         >
                                            <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                         </button>
                                      </div>
                                   ))}
                                </div>
                             )}
                          </div>
                          
                          <input 
                            type="number" 
                            placeholder="Other service area pin code" 
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none mt-2 ${editPincodeError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                            value={editData.pincode}
                            onChange={(e) => setEditData({...editData, pincode: e.target.value})}
                          />
                          {editPincodeError && <p className="text-red-500 text-xs mt-1 font-medium">{editPincodeError}</p>}
                          {editPincodeAreas.length > 0 && !editPincodeError && (
                             <p className="text-emerald-600 text-xs mt-1 font-medium bg-emerald-50 p-1.5 rounded inline-block">
                                📍 Areas found: {editPincodeAreas.join(', ')}
                             </p>
                          )}
                          
                          {/* Auto Discovered Pincodes Display */}
                          {editSelectedAreasList.length > 0 && (
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200 mt-2">
                               <label className="block text-xs font-bold text-green-800 uppercase mb-1 flex items-center justify-between">
                                  Auto-Fetched Pincodes
                                  {fetchingPincodes && <Loader2 className="w-3 h-3 animate-spin" />}
                               </label>
                               <div className="text-sm text-green-700">
                                  {fetchingPincodes ? (
                                      <span className="opacity-70">Fetching from India Post...</span>
                                  ) : editDiscoveredPincodesList.length > 0 ? (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                         {editDiscoveredPincodesList.map(pin => (
                                            <span key={pin} className="bg-green-200/50 text-green-800 px-2 py-0.5 rounded text-xs font-medium border border-green-300">
                                              {pin}
                                            </span>
                                         ))}
                                      </div>
                                  ) : (
                                      <span className="opacity-70">No pincodes found for selected areas.</span>
                                  )}
                               </div>
                            </div>
                          )}

                          <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Manual Address</label>
                            <button 
                              type="button" 
                              onClick={() => handleTrackLocation(true)} 
                              disabled={isTrackingLocation || !!(editData.lat && editData.lng)}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-green-600 flex items-center gap-1"
                            >
                              {editData.lat && editData.lng ? '✓ Location Saved' : isTrackingLocation ? 'Locating...' : '📍 Auto-Detect Location'}
                            </button>
                          </div>
                          <textarea 
                             placeholder="Full Address" 
                             required
                             rows={2}
                             className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                             value={editData.address}
                             onChange={(e) => setEditData({...editData, address: e.target.value})}
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
                    ) : 'Save Changes'}
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
                 {paymentModal.cartItems && Array.isArray(paymentModal.cartItems) ? (
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
                     for (const category of SERVICES) {
                         const found = category.subServices.find((s: any) => s.name === selectedServiceName);
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
                  {SERVICES.map((category) => (
                    <optgroup key={category.name} label={category.name}>
                      {category.subServices.map((s: any) => (
                         <option key={`${category.name}-${s.name}`} value={s.name}>{s.name} - ₹{s.price}</option>
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
               <div className="bg-white p-4 inline-block rounded-lg shadow-sm border border-gray-200 w-full">
                 <p className="font-medium text-gray-900 mb-3">Pay Commission via WhatsApp</p>
                 <a 
                   href="https://wa.me/919219345455" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                   </svg>
                   Contact Admin
                 </a>
               </div>
               
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