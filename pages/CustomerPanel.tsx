import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SERVICES, CITY_DATA, PREDEFINED_AREAS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Service, SubService, CartItem } from '../types';
import { Modal } from '../components/Modal';
import { RateCardModal } from '../components/RateCardModal';
import { identifyPincode, fetchPincodesByArea } from '../services/pincodeService';
import { Loader2, CheckCircle, MapPin, User, Phone, Star, Search, ChevronRight, ChevronLeft, Plus, Minus, Shield, ArrowRight, Trash2, FileText, Calendar, Clock, Map, Navigation, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';

// Specific Customer Reviews Data
const customerReviews = [
  {
    name: "Rahul Sharma",
    img: "https://randomuser.me/api/portraits/men/32.jpg", 
    rating: 5,
    text: "Mene pehli baar Sofiyan Home Service se electrician book kiya. Kaam bahut safai se kiya aur time par aaye. Highly recommended!"
  },
  {
    name: "Priya Venkatesh",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    text: "Very happy with the AC cleaning service. The team from Sofiyan Home Service was polite, professional, and wore uniforms."
  },
  {
    name: "Amit Malhotra",
    img: "https://randomuser.me/api/portraits/men/41.jpg",
    rating: 4,
    text: "Sofiyan Home Service is trustworthy. Pricing was clear, and the plumber fixed the leakage quickly without any hidden charges."
  },
  {
    name: "Sneha Gupta",
    img: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5,
    text: "Kitchen deep cleaning was excellent! Sofiyan Home Service staff really worked hard. My kitchen looks brand new now."
  },
  {
    name: "Vikram Singh",
    img: "https://randomuser.me/api/portraits/men/22.jpg",
    rating: 5,
    text: "Best app for home repairs in my area. I use Sofiyan Home Service for all my electrical and plumbing needs. Very reliable."
  },
  {
    name: "Anjali Mehta",
    img: "https://randomuser.me/api/portraits/women/54.jpg",
    rating: 5,
    text: "Safe and secure for women customers. The professionals sent by Sofiyan Home Service were verified and very decent."
  }
];

const featuredServicesData = [
    { name: "Premium AC Service (Split)", price: 499, img: "https://i.postimg.cc/4dh6m6X0/Whats-App-Image-2026-01-12-at-11-13-39-PM.jpg", desc: "Expert AC deep cleaning & cooling solutions by Sofiyan." },
    { name: "AC Basic Check-up/Cooling", price: 399, img: "https://i.postimg.cc/442GJpmj/Whats-App-Image-2026-01-12-at-11-13-46-PM.jpg", desc: "Quick AC diagnosis & minor repairs at your doorstep." },
    { name: "AC Power Issue Repair", price: 499, img: "https://i.postimg.cc/HnZhd0zF/Whats-App-Image-2026-01-12-at-11-13-48-PM.jpg", desc: "Safe and reliable AC electrical fault repair." },
    { name: "Switchbox installation", price: 349, img: "https://i.postimg.cc/BvbRbntk/Whats-App-Image-2026-01-13-at-1-49-12-AM.jpg", desc: "Certified electricians for safe board installations." },
    { name: "AC switchbox installation", price: 329, img: "https://i.postimg.cc/8cQYZdwP/Whats-App-Image-2026-01-13-at-1-49-13-AM-(1).jpg", desc: "Heavy-duty AC switchbox setup by experts." },
    { name: "Fan repair (any type)", price: 349, img: "https://i.postimg.cc/yY7QW8bc/Whats-App-Image-2026-01-13-at-1-49-09-AM.jpg", desc: "Noiseless & fast fan repair services by Sofiyan." },
    { name: "Fan installation", price: 249, img: "https://i.postimg.cc/V6y4wft7/Whats-App-Image-2026-01-13-at-1-49-09-AM-(1).jpg", desc: "Secure ceiling or wall fan fitting services." },
    { name: "Bulb/tubelight holder install", price: 149, img: "https://i.postimg.cc/7YBV6M7r/Whats-App-Image-2026-01-13-at-1-49-15-AM-(1).jpg", desc: "Quick lighting & holder setups for your home." },
    { name: "Auto Front Load Checkup", price: 249, img: "https://i.postimg.cc/26VDv5tt/Whats-App-Image-2026-01-12-at-10-42-57-PM.jpg", desc: "Advanced washing machine diagnostics by Sofiyan." },
    { name: "Washing machine servicing", price: 499, img: "https://i.postimg.cc/Xq4kmZ0L/Whats-App-Image-2026-01-12-at-10-42-59-PM.jpg", desc: "Complete drum cleaning & machine maintenance." },
    { name: "Basic Check-up/Error/Water", price: 349, img: "https://i.postimg.cc/52g61nFY/Whats-App-Image-2026-01-12-at-10-43-02-PM.jpg", desc: "Fix water leakage & error codes instantly." },
    { name: "Washing Machine Installation", price: 349, img: "https://i.postimg.cc/2yG7DzkS/Whats-App-Image-2026-01-12-at-10-43-01-PM-(1).jpg", desc: "Perfect leveling and plumbing setup for washers." },
    { name: "Motor Repair/Replacement", price: 599, img: "https://i.postimg.cc/cLCNgmbh/Whats-App-Image-2026-01-12-at-10-43-04-PM.jpg", desc: "Genuine spare parts & motor repair guarantee." },
    { name: "Fridge Power Issue", price: 349, img: "https://i.postimg.cc/wTh73WLF/Whats-App-Image-2026-01-12-at-7-49-01-AM-(1).jpg", desc: "Resolve refrigerator power & wiring faults." },
    { name: "Fridge No Cooling", price: 349, img: "https://i.postimg.cc/L4kp1GCG/Whats-App-Image-2026-01-12-at-7-49-01-AM.jpg", desc: "Restore your fridge's cooling with expert help." },
    { name: "AC Less/No Cooling Repair", price: 299, img: "https://i.postimg.cc/TYKknDCX/Whats-App-Image-2026-01-12-at-11-13-47-PM.jpg", desc: "Fast resolution for AC cooling drops & issues." },
    { name: "New internal wiring (per 5m)", price: 249, img: "https://i.postimg.cc/pLCY7QVt/Whats-App-Image-2026-01-13-at-1-49-18-AM.jpg", desc: "Concealed & safe house wiring by Sofiyan." },
    { name: "Inverter installation", price: 699, img: "https://i.postimg.cc/k57Kv2Wc/Whats-App-Image-2026-01-13-at-1-49-20-AM-(1).jpg", desc: "Professional power backup setup & wiring." },
    { name: "Inverter servicing", price: 349, img: "https://i.postimg.cc/Vsh9PLcS/Whats-App-Image-2026-01-13-at-1-49-21-AM.jpg", desc: "Battery health check & inverter maintenance." },
    { name: "Inverter repair", price: 299, img: "https://i.postimg.cc/Vsh9PLcS/Whats-App-Image-2026-01-13-at-1-49-21-AM.jpg", desc: "Fix inverter overloads & charging issues fast." },
    { name: "Full Gas Refill", price: 2599, img: "https://i.postimg.cc/5NZmL9PZ/Whats-App-Image-2026-01-12-at-11-13-43-PM-(1).jpg", desc: "Premium AC gas refill with leak testing." },
    { name: "AC Installation – Split", price: 1499, img: "https://i.postimg.cc/zfwpJmFk/Whats-App-Image-2026-01-12-at-11-13-40-PM-(1).jpg", desc: "Flawless split AC mounting & installation." },
    { name: "AC Installation – Window", price: 799, img: "https://i.postimg.cc/0Q8njttm/Whats-App-Image-2026-01-12-at-11-13-41-PM.jpg", desc: "Secure window AC fitting by verified pros." },
    { name: "Kitchen Deep Cleaning", price: 1599, img: "https://i.postimg.cc/SsfmkPwM/Whats-App-Image-2026-01-12-at-11-52-48-PM.jpg", desc: "Remove tough grease & stains completely." },
    { name: "Chimney Full Deep Cleaning", price: 1300, img: "https://i.postimg.cc/FFPQp0m9/Chat-GPT-Image-Jan-13-2026-04-35-34-AM.jpg", desc: "Dismantling & deep chemical wash for chimneys." },
    { name: "Sofa Cleaning", price: 499, img: "https://i.postimg.cc/D0ZGk18T/Whats-App-Image-2026-01-12-at-11-52-40-PM.jpg", desc: "Shampooing & vacuuming for spotless sofas." },
    { name: "AC Water Leakage Repair", price: 599, img: "https://i.postimg.cc/442GJpmj/Whats-App-Image-2026-01-12-at-11-13-46-PM.jpg", desc: "Drainpipe blockages & leakage fixed instantly." },
    { name: "AC Shifting (other site)", price: 1699, img: "https://i.postimg.cc/zfwpJmFk/Whats-App-Image-2026-01-12-at-11-13-40-PM-(1).jpg", desc: "Safe uninstallation & shifting of your AC." },
    { name: "Full Home 1BHK", price: 3499, img: "https://i.postimg.cc/q7cP33QD/Whats-App-Image-2026-01-12-at-11-52-37-PM.jpg", desc: "Intensive 1BHK deep cleaning by Sofiyan experts." },
    { name: "Full Home 2BHK", price: 3899, img: "https://i.postimg.cc/026hC3cq/Whats-App-Image-2026-01-12-at-11-52-38-PM.jpg", desc: "Complete 2BHK sanitization & deep cleaning." },
    { name: "Full Home 3BHK", price: 4799, img: "https://i.postimg.cc/25xt6f8J/Whats-App-Image-2026-01-12-at-11-52-39-PM-(1).jpg", desc: "Premium 3BHK hygiene & deep clean service." },
    { name: "Full Home 4BHK", price: 6199, img: "https://i.postimg.cc/kg3Yv5VJ/Whats-App-Image-2026-01-12-at-11-52-39-PM.jpg", desc: "Extensive 4BHK cleaning for a sparkling home." },
    { name: "Water Tank Cleaning (1000L)", price: 749, img: "https://i.postimg.cc/fy2xJB6v/Chat-GPT-Image-Jan-13-2026-12-44-47-AM.jpg", desc: "Anti-bacterial water tank cleaning & treatment." }
];



const categoryList = [
    { name: "AC", image: "https://i.postimg.cc/s2SR2Pvz/Chat-GPT-Image-Mar-25-2026-06-17-17-PM.png" },
    { name: "Electrician", image: "https://i.postimg.cc/tCXRmc7V/Chat-GPT-Image-Mar-25-2026-06-17-31-PM.png" },
    { name: "Plumbing", image: "https://i.postimg.cc/L5vSpHhY/Chat-GPT-Image-Mar-25-2026-06-17-26-PM.png" },
    { name: "WashingMachine", image: "https://i.postimg.cc/FsBtgCL8/Chat-GPT-Image-Mar-25-2026-06-17-13-PM.png" },
    { name: "Refrigerator", image: "https://i.postimg.cc/wxwng400/Chat-GPT-Image-Mar-25-2026-06-17-10-PM.png" },
    { name: "WaterPurifier", image: "https://i.postimg.cc/jj6k9MD8/Chat-GPT-Image-Mar-25-2026-06-17-06-PM.png" },
    { name: "Geyser", image: "https://i.postimg.cc/GhsKVXNY/Chat-GPT-Image-Jan-13-2026-03-40-08-AM.jpg" },
    { name: "Microwave", image: "https://i.postimg.cc/yddXPjcW/Chat-GPT-Image-Mar-25-2026-06-17-03-PM.png" },
    { name: "Television", image: "https://i.postimg.cc/Ss5hbvjM/Chat-GPT-Image-Mar-26-2026-07-07-43-PM.png" },
    { name: "Chimney", image: "https://i.postimg.cc/Gh528Qhy/Chat-GPT-Image-Mar-25-2026-06-16-57-PM.png" },
    { name: "Cleaning", image: "https://i.postimg.cc/0Np241Gb/Chat-GPT-Image-Mar-25-2026-06-16-45-PM.png" }
];

export const CustomerPanel: React.FC = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Advanced Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<'form' | 'loading' | 'success'>('form');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Rate Card Modal State
  const [isRateCardModalOpen, setIsRateCardModalOpen] = useState(false);
  const [activeRateCardCategory, setActiveRateCardCategory] = useState<string | null>(null);

  // Helper to map service name to rate card database key
  const getRateCardCategory = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name === 'ac' || name === 'ac repair' || name.includes('ac ')) return 'AC Service';
    if (name === 'washingmachine' || name.includes('washing')) return 'Washing Machine';
    if (name === 'refrigerator' || name.includes('refrigerat') || name.includes('fridge')) return 'Refrigerator';
    if (name === 'waterpurifier' || name.includes('water purifier') || name.includes('ro service')) return 'Water Purifier';
    return null;
  };

  // Blogs State
  const [latestBlogs, setLatestBlogs] = useState<any[]>([]);
  const blogScrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    area: '',
    locationLink: '',
    city: localStorage.getItem('preferredCity') || '',
    pincode: '',
    description: '',
    date: '',
    time: '',
    referralCode: '',
    lat: null as number | null,
    lng: null as number | null
  });

  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [isDetectingPincode, setIsDetectingPincode] = useState(false);
  const [isFetchingAreaPincode, setIsFetchingAreaPincode] = useState(false);

  // Sync city when localStorage changes (handled globally by Layout, but sync local formData)
  useEffect(() => {
    const handleCitySync = () => {
      const city = localStorage.getItem('preferredCity') || '';
      setFormData(prev => ({ ...prev, city }));
    };
    window.addEventListener('cityUpdated', handleCitySync);
    return () => window.removeEventListener('cityUpdated', handleCitySync);
  }, []);

  const handleTrackLocation = () => {
    if (!navigator.geolocation) {
      alert("Location tracking is not supported by your browser.");
      return;
    }
    setIsTrackingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
        
        setFormData(prev => ({
          ...prev,
          lat,
          lng,
          locationLink: googleMapsLink
        }));
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

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('title, slug, sub_heading, target_locations, created_at, content, meta_description, image_url')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data) {
          setLatestBlogs(data);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      }
    };
    fetchLatestBlogs();
  }, []);

  // Auto-scroll for latest blogs
  useEffect(() => {
    if (latestBlogs.length <= 1) return;
    
    const interval = setInterval(() => {
      if (blogScrollRef.current) {
        const container = blogScrollRef.current;
        const { scrollLeft, scrollWidth, clientWidth } = container;
        
        // Check if we've reached the end
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by one card width
          const cardWidth = container.children[0]?.clientWidth || 350;
          const gap = 24; // gap-6 is 24px
          container.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
        }
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [latestBlogs.length]);

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text ? text.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const formatLocations = (locations: string) => {
    if (!locations) return 'All Cities';
    const locArray = locations.split(',').map(l => l.trim());
    if (locArray.length > 2) {
      return `${locArray[0]}, ${locArray[1]} +${locArray.length - 2} more`;
    }
    return locations;
  };

  const getSnippet = (post: any) => {
    let snippet = post.sub_heading || post.meta_description || '';
    if (!snippet && post.content) {
      snippet = post.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';
    }
    return snippet;
  };

  const scrollBlogsLeft = () => {
    if (blogScrollRef.current) {
      const cardWidth = blogScrollRef.current.children[0]?.clientWidth || 350;
      blogScrollRef.current.scrollBy({ left: -(cardWidth + 24), behavior: 'smooth' });
    }
  };

  const scrollBlogsRight = () => {
    if (blogScrollRef.current) {
      const cardWidth = blogScrollRef.current.children[0]?.clientWidth || 350;
      blogScrollRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    }
  };

  // Auto-fill address from localStorage when booking modal opens
  useEffect(() => {
    (window as any).openReactCheckout = () => {
      setIsBookingModalOpen(true);
      setBookingStep('form');
    };

    if (isBookingModalOpen) {
      const savedLocation = sessionStorage.getItem('userLocation');
      if (savedLocation && !formData.city) {
        const city = savedLocation.split(',')[0].trim();
        setFormData(prev => ({ ...prev, city: city }));
      }
    }
    
    const handleLocationUpdate = () => {
      const savedLocation = sessionStorage.getItem('userLocation');
      if (savedLocation) {
        const city = savedLocation.split(',')[0].trim();
        setFormData(prev => ({ ...prev, city: city }));
      }
    };
    window.addEventListener('locationUpdated', handleLocationUpdate);
    return () => window.removeEventListener('locationUpdated', handleLocationUpdate);
  }, [isBookingModalOpen, formData.city]);

  // 1. Flatten all sub-services for Global Search & Featured Section
  const allSubServices = useMemo(() => {
    return SERVICES.flatMap(service => 
      service.subServices.map(sub => ({
        ...sub,
        categoryName: service.name,
        parentService: service
      }))
    );
  }, []);

  // 2. Search Logic for Dropdown
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allSubServices.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.categoryName.toLowerCase().includes(query)
    );
  }, [searchQuery, allSubServices]);

  // Grid Filtering Logic
  const filteredCategories = categoryList.filter(category => {
    const query = searchQuery.toLowerCase();
    if (category.name.toLowerCase().includes(query)) return true;
    
    // Check if any sub-service in this category matches the query
    const serviceData = SERVICES.find(s => s.name === category.name);
    if (serviceData && serviceData.subServices.some(sub => sub.name.toLowerCase().includes(query))) {
      return true;
    }
    return false;
  });

  // Cart Logic
  const addToCart = (sub: SubService, categoryName: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === sub.id);
      if (existing) {
        return prev.map(item => item.id === sub.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...sub, quantity: 1, categoryName }];
    });
  };

  useEffect(() => {
    (window as any).addServiceToCart = (id: string, name: string, price: number, categoryName: string) => {
      addToCart({ id, name, price }, categoryName);
    };
    (window as any).getReactCart = () => cart;
    (window as any).updateReactCartQuantity = (id: string, delta: number) => {
      setCart(prev => {
        const item = prev.find(i => i.id === id);
        if (!item) return prev;
        const newQty = item.quantity + delta;
        if (newQty <= 0) {
          return prev.filter(i => i.id !== id);
        }
        return prev.map(i => i.id === id ? { ...i, quantity: newQty } : i);
      });
    };
    return () => {
      delete (window as any).addServiceToCart;
      delete (window as any).getReactCart;
      delete (window as any).updateReactCartQuantity;
    };
  }, [cart]);

  // Sync vanilla UI when cart changes
  useEffect(() => {
    if ((window as any).renderCartSidebar) {
      (window as any).renderCartSidebar();
    }
    if ((window as any).syncVanillaCartUI) {
      (window as any).syncVanillaCartUI();
    }
  }, [cart]);

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Coupon Logic
  const validCoupons: Record<string, number> = {
      'GET20': 10, 'SAVE10': 10, 'EASY10': 10, 'QUICK10': 10,
      'CLEAN10': 10, 'SMART10': 10, 'SOFIYAN10': 10,
      'SUPER10': 10, 'MUMBAI10': 10, 'RELAX10': 10,
      'WELCOME10': 10, 'FIRST10': 10, 'BUMPER10': 10
  };

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const discountAmount = appliedCoupon ? Math.round((cartTotal * validCoupons[appliedCoupon]) / 100) : 0;
  const finalTotal = cartTotal - discountAmount;

  const handleApplyCoupon = (codeToApply?: string) => {
      const code = (codeToApply || couponCode).trim().toUpperCase();
      if (!code) return;

      if (validCoupons[code]) {
          setAppliedCoupon(code);
          setCouponCode(code);
          // Link coupon to referral code for influencer tracking
          setFormData(prev => ({ ...prev, referralCode: code }));
          const discount = Math.round((cartTotal * validCoupons[code]) / 100);
          setCouponMessage({ text: `🎉 Yay! Coupon applied. You saved ₹${discount}!`, type: 'success' });
      } else {
          // If not a valid discount code, we still treat it as a referral code
          // to attribute it to an influencer, even if there's no discount
          setAppliedCoupon(code); // We "apply" it as the code entered
          setCouponCode(code);
          setFormData(prev => ({ ...prev, referralCode: code }));
          setCouponMessage({ text: "✅ Referral code applied successfully!", type: 'success' });
      }
  };

  const removeCoupon = () => {
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponMessage(null);
      setFormData(prev => ({ ...prev, referralCode: '' }));
  };

  const handleBookService = (sub: SubService) => {
    addToCart(sub, selectedService?.name || 'General');
    // We don't open modal immediately anymore, we add to cart
  };

  // 3. Handle Direct Booking from Search Dropdown
  const handleDirectBooking = (item: typeof allSubServices[0]) => {
    addToCart(item, item.categoryName);
    if ((window as any).openCartSidebar) {
      (window as any).openCartSidebar();
    } else {
      setIsBookingModalOpen(true);
      setBookingStep('form');
    }
    setSearchQuery(''); 
  };
  
  // 4. Handle Direct Booking from Featured Section
  const handleFeaturedBooking = (name: string, price: number) => {
      const subService: SubService = {
          id: `featured-${Date.now()}`,
          name: name,
          price: price
      };
      addToCart(subService, "Featured Service");
      if ((window as any).openCartSidebar) {
        (window as any).openCartSidebar();
      } else {
        setIsBookingModalOpen(true);
        setBookingStep('form');
      }
  };


  // Time Slot Logic
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [minDate, setMinDate] = useState('');

  const formatAMPM = (hours: number) => {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour} ${ampm}`;
  };

  const updateAvailableTimeSlots = (dateInput: string) => {
    if (!dateInput) {
      setAvailableTimeSlots([]);
      return;
    }

    const selectedDate = new Date(dateInput);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare just dates

    // Business Hours: 9 AM (9) to 8 PM (20)
    const openHour = 9;
    const closeHour = 20;
    let startHourForSlots = openHour;

    // If the selected date is TODAY
    if (selectedDate.toDateString() === today.toDateString()) {
        const currentHour = new Date().getHours();
        // Add a 2-hour buffer so partners have time to reach
        startHourForSlots = Math.max(openHour, currentHour + 2); 
    }

    const slots = [];
    if (startHourForSlots >= closeHour) {
        // No slots left for today
    } else {
        for (let i = startHourForSlots; i < closeHour; i++) {
            slots.push(`${formatAMPM(i)} to ${formatAMPM(i + 1)}`);
        }
    }
    setAvailableTimeSlots(slots);
  };

  // Run this whenever the checkout modal is opened to block past dates
  useEffect(() => {
    if (isBookingModalOpen) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        
        const minDateStr = `${yyyy}-${mm}-${dd}`;
        setMinDate(minDateStr);
        
        // Clear previous selections
        setFormData(prev => ({ ...prev, date: '', time: '' }));
        setAvailableTimeSlots([]);
    }
  }, [isBookingModalOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'date') {
        updateAvailableTimeSlots(value);
        setFormData(prev => ({ ...prev, time: '' }));
    }
  };


  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    // Validate Location
    if (!formData.address.trim() && !formData.locationLink.trim()) {
      alert("Please provide either your full address or a map location link.");
      return;
    }

    if (!formData.time) {
      alert("Please select a time slot!");
      return;
    }

    setBookingStep('loading');

    try {
      const subServiceName = cart.map(i => `${i.name} (x${i.quantity})`).join(', ');
      const categoryName = cart.length === 1 ? cart[0].categoryName : 'Multiple Services';

      // 1. Upsert Customer Data
      let customerId = null;
      try {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .upsert([
            {
              full_name: formData.name,
              phone_number: formData.contact,
              address: formData.address,
              city: formData.city,
              pincode: formData.pincode
            }
          ], { onConflict: 'phone_number' })
          .select('id')
          .single();
          
        if (!customerError && customerData) {
          customerId = customerData.id;
        }
      } catch (e) {
        console.warn("Could not save to customers table, proceeding with booking anyway.", e);
      }

      // 2. Insert Booking Data
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            customer_id: customerId,
            customer_name: formData.name,
            contact_number: formData.contact,
            address: formData.address,
            area: formData.area,
            city: formData.city,
            pin_code: formData.pincode,
            cart_items: cart,
            price: finalTotal,
            date: formData.date,
            time: formData.time,
            status: 'pending',
            // Additional fields for admin tracking
            service_category: categoryName,
            sub_service_name: subServiceName,
            location_link: formData.locationLink,
            lat: formData.lat,
            lng: formData.lng,
            discount_amount: discountAmount,
            applied_referral_code: formData.referralCode ? formData.referralCode.toUpperCase() : null
          }
        ]);

      if (bookingError) throw bookingError;

      // Forward to WhatsApp
      try {
        const whatsappMsg = `*New Lead Received!*%0A%0A` +
          `*Customer:* ${formData.name}%0A` +
          `*Phone:* ${formData.contact}%0A` +
          `*Category:* ${categoryName}%0A` +
          `*Sub Services:* ${subServiceName}%0A` +
          `*Address:* ${formData.address}%0A` +
          `*Area:* ${formData.area || 'N/A'}%0A` +
          `*Pincode:* ${formData.pincode}%0A` +
          `*Date:* ${formData.date}%0A` +
          `*Time:* ${formData.time}%0A` +
          `*Total:* ₹${finalTotal}%0A%0A` +
          `*Location Link:* ${formData.locationLink || 'Not provided'}`;

        window.open(`https://wa.me/919219345455?text=${whatsappMsg}`, '_blank');
      } catch (e) {
        console.warn("WhatsApp forward failed", e);
      }

      // Success UI
      setBookingStep('success');
      setCart([]); 
      
      // NOTE: Removed local addBooking() call to strictly enforce usage of Supabase DB as the source of truth.

    } catch (error: any) {
      console.error('Booking Error:', error);
      alert('Failed to confirm booking: ' + (error.message || 'Unknown error'));
      setBookingStep('form');
    }
  };

  const resetFlow = () => {
    setIsBookingModalOpen(false);
    setSelectedService(null);
    setFormData({ name: '', contact: '', address: '', area: '', locationLink: '', city: '', pincode: '', description: '', date: '', time: '', referralCode: '', lat: null, lng: null });
  };

  return (
    <>
      {/* Mobile-Friendly Urban Company Style Hero Content */}
      <div className="bg-indigo-600 sm:bg-transparent pb-8 pt-6 sm:pt-8 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Version of Title (Hidden on small mobile) */}
          <div className="hidden sm:block text-center mb-10">
            <h1 className="text-4xl sm:text-6xl font-black text-indigo-950 mb-3 tracking-tighter uppercase leading-none">
              Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-950">Home Services</span>
            </h1>
            <p className="text-base sm:text-lg text-indigo-900/40 font-black uppercase tracking-[0.3em] max-w-2xl mx-auto">
              Elite Expertise Delivered Directly To Your Doorstep
            </p>
          </div>

          {/* Search Bar - Repositioned Above Banner for UC Style */}
          <div className="max-w-2xl mx-auto mb-6 sm:mb-10 relative z-30">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-indigo-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 sm:py-5 border-2 border-transparent sm:border-indigo-50 rounded-2xl sm:rounded-3xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 shadow-xl shadow-indigo-600/10 sm:shadow-indigo-100/50 transition-all hover:shadow-indigo-200/50 text-gray-900 font-extrabold"
              placeholder="Search for 'AC', 'Cleaning', 'Electrician'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Search Results Dropdown remains same */}
            {searchQuery && (
              <div className="absolute w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto animate-fadeIn overflow-hidden">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Suggested Results</div>
                    {searchResults.map((result) => (
                      <button
                        key={`${result.categoryName}-${result.id}`}
                        onClick={() => handleDirectBooking(result)}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0 flex justify-between items-center group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                            <Search size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 group-hover:text-indigo-700">{result.name}</p>
                            <p className="text-xs text-gray-500">in {result.categoryName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-600">₹{result.price}</span>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center">
                    <p className="text-gray-800 font-medium">No services found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* UC Style Promotional Banner - Tighter height for mobile above-the-fold */}
          <div className="max-w-4xl mx-auto rounded-3xl sm:rounded-[2.5rem] overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-indigo-950/60 to-transparent z-10"></div>
              <img 
                src="https://i.postimg.cc/W4bqsRYV/Whats-App-Image-2026-01-09-at-5-28-14-AM-(1).jpg" 
                alt="Pro Home Services Banner" 
                className="w-full h-40 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 z-20 flex flex-col justify-center p-5 sm:p-12">
                  <div className="inline-flex items-center gap-2 bg-indigo-600 text-white text-[8px] sm:text-[10px] font-black px-2 py-1 rounded-full mb-2 sm:mb-4 w-fit uppercase tracking-widest shadow-lg animate-bounce">
                      <Star size={8} className="fill-white" /> Pro Choice
                  </div>
                  <h2 className="text-xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-1 sm:mb-2">
                      Elite <span className="text-indigo-400">Restoration</span><br />
                      Summer Protocols
                  </h2>
                  <p className="text-indigo-200/80 text-[8px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-3 sm:mb-6">
                      High-Grade Sanitization Elite
                  </p>
                  <button className="bg-white text-indigo-950 px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-50 active:scale-95 transition-all w-fit border-b-2 sm:border-b-4 border-indigo-200">
                      View Rates
                  </button>
              </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8 mb-24">
        {/* Explore Labels - Reduced spacing */}
        <div className="flex items-center justify-between mb-4 sm:mb-12">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Catalog</span>
                <h3 className="text-2xl sm:text-3xl font-black text-indigo-950 uppercase tracking-tighter">Explore all services</h3>
            </div>
            <div className="hidden sm:flex gap-2">
               <div className="w-12 h-1 bg-indigo-600 rounded-full"></div>
               <div className="w-4 h-1 bg-indigo-200 rounded-full"></div>
               <div className="w-4 h-1 bg-indigo-100 rounded-full"></div>
            </div>
        </div>

        {/* Categories Grid - Optimized for density like UC */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-8">
            {filteredCategories.map((category) => {
              const cleanRoute = `/services/${category.name.toLowerCase().replace(/\s+/g, '-')}`;
              return (
              <a
                key={category.name}
                href={cleanRoute}
                onClick={(e) => {
                  if ((window as any).handleLinkClick) {
                    (window as any).handleLinkClick(e);
                  } else {
                    e.preventDefault();
                    if ((window as any).openCategoryView) {
                      (window as any).openCategoryView(category.name);
                    } else if ((window as any).openCategoryModal) {
                      (window as any).openCategoryModal(category.name);
                    }
                  }
                }}
                className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg h-32 sm:h-48 cursor-pointer w-full transition-all duration-300 hover:shadow-indigo-200/50 hover:scale-[1.02] block border border-indigo-50 bg-white"
              >
                <div className="absolute inset-0 bg-indigo-950 opacity-10 group-hover:opacity-0 transition-opacity z-10"></div>
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-indigo-950 via-indigo-950/40 to-transparent p-2 sm:p-5 flex flex-col justify-end items-center h-full z-20">
                  <span className="text-white font-black text-[9px] sm:text-xs tracking-widest uppercase text-center leading-tight">
                    {category.name}
                  </span>
                </div>
              </a>
            )})}
          </div>
        ) : (
          !searchQuery && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No categories available.</p>
            </div>
          )
        )}

        {/* UPGRADED: Mobile-Friendly Manual Scroll Featured Services */}
        <div id="featured-services-section" className="mt-12 mb-4 py-8 bg-white border-y border-indigo-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
          
          <div className="text-center mb-6 sm:mb-10 px-4">
            <h2 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Elite Selection</h2>
            <h3 className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tighter uppercase italic">Most Popular Services</h3>
          </div>
          
          <div className="relative w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4">
            <style>
                {`.scrollbar-hide::-webkit-scrollbar { display: none; }`}
            </style>
            <div className="flex gap-4 sm:gap-6 px-4 sm:px-8 w-max">
              {featuredServicesData.map((service, index) => (
                <div 
                  key={`${service.name}-${index}`} 
                  className="snap-start flex-shrink-0 w-48 sm:w-64 bg-white rounded-[2rem] shadow-lg shadow-indigo-100/30 border border-indigo-50/50 overflow-hidden group cursor-pointer relative transition-transform"
                >
                  <div className="relative h-32 sm:h-40 overflow-hidden">
                    <img src={service.img} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" referrerPolicy="no-referrer" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-indigo-950 text-[8px] font-black px-2 py-1 rounded-full flex items-center shadow-lg border border-indigo-100 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span> Open
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-black text-indigo-950 text-xs sm:text-sm mb-1 truncate uppercase tracking-tight" title={service.name}>{service.name}</h3>
                    <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 mb-3 h-7 overflow-hidden leading-tight uppercase tracking-wider">{service.desc}</p>
                    <div className="flex justify-between items-center bg-indigo-50/50 p-1.5 sm:p-2 rounded-xl border border-indigo-100/50">
                        <div className="pl-1">
                           <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest leading-none">STARTING</p>
                           <span className="font-black text-indigo-950 text-base sm:text-lg tracking-tighter">₹{service.price}</span>
                        </div>
                        <button 
                          onClick={() => handleFeaturedBooking(service.name, service.price)}
                          className="bg-indigo-950 text-white text-[9px] font-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg tracking-[0.05em] uppercase hover:bg-black transition-all shadow-md shadow-indigo-100"
                        >
                            Book Job
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Cart Footer */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-t border-indigo-100 shadow-[0_-20px_50px_rgba(79,70,229,0.12)] p-5 animate-slideUp">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="absolute -inset-1 bg-indigo-600 rounded-2xl blur opacity-20 animate-pulse"></div>
                  <div className="relative bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-indigo-200 text-lg">
                    {cartItemCount}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] leading-none mb-1.5">Selected Items</p>
                  <p className="text-2xl font-black text-indigo-950 tracking-tighter leading-none">₹{cartTotal}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if ((window as any).openCartSidebar) {
                    (window as any).openCartSidebar();
                  } else {
                    setIsBookingModalOpen(true); 
                    setBookingStep('form');
                  }
                }}
                className="bg-indigo-950 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center gap-3 shadow-2xl shadow-indigo-300 transform active:scale-95"
              >
                <span>Checkout Now</span>
                <ChevronRight size={18} className="stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* Customer Reviews Section */}
        <div className="mt-28 py-20 bg-indigo-50/30 -mx-4 sm:-mx-6 lg:-mx-8 border-y border-indigo-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200/20 blur-[100px] rounded-full"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-16">
                  <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-4">Customer Chronicles</h2>
                  <h3 className="text-4xl font-black text-indigo-950 tracking-tighter uppercase italic">Voice of Excellence</h3>
              </div>
              <div className="relative overflow-hidden group py-4">
                  <div className="flex space-x-4 animate-scroll w-max hover:[animation-play-state:paused]">
                      {[...customerReviews, ...customerReviews].map((review, index) => (
                          <div key={index} className="w-64 md:w-72 flex-shrink-0 bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
                              <div className="flex items-center gap-3 mb-3">
                                  <img src={review.img} alt={review.name} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-50" />
                                  <div>
                                      <h4 className="font-bold text-gray-900 text-sm">{review.name}</h4>
                                      <div className="flex text-yellow-400 gap-0.5">
                                          {[...Array(5)].map((_, i) => (
                                              <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                                          ))}
                                      </div>
                                  </div>
                              </div>
                              <p className="text-gray-600 text-xs leading-relaxed italic line-clamp-4">"{review.text}"</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
          <style>{`
              @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
              .animate-scroll { animation: scroll 30s linear infinite; }
              @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
              .animate-slideUp { animation: slideUp 0.3s ease-out; }
          `}</style>
        </div>

        {/* Trust Metrics / Stats Section */}
        <div className="py-8 bg-blue-50/30 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Your Trusted Home Experts
              </h2>
              <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                From quick repairs to complete home maintenance, we deliver reliable, top-quality services backed by verified professionals.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {/* Card 1: Availability */}
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md border border-gray-100 text-center transition-shadow duration-300">
                <h3 className="text-4xl font-extrabold text-blue-600 mb-2">24/7</h3>
                <p className="text-gray-600 font-medium">Booking Available</p>
              </div>

              {/* Card 2: Scale */}
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md border border-gray-100 text-center transition-shadow duration-300">
                <h3 className="text-4xl font-extrabold text-purple-600 mb-2">10,000+</h3>
                <p className="text-gray-600 font-medium">Happy Families</p>
              </div>

              {/* Card 3: Quality */}
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md border border-gray-100 text-center transition-shadow duration-300">
                <h3 className="text-4xl font-extrabold text-indigo-600 mb-2 flex justify-center items-center">
                  4.9 <i className="fas fa-star text-yellow-400 text-2xl ml-2 mb-1"></i>
                </h3>
                <p className="text-gray-600 font-medium">Average Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Articles Section */}
        {latestBlogs.length > 0 && (
          <div className="py-8 bg-white -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-end mb-6">
                <div className="max-w-2xl">
                  <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
                    Latest Home Service Guides
                  </h2>
                  <p className="text-lg text-gray-500">
                    Expert advice, home maintenance tips, and local insights.
                  </p>
                </div>
                <div className="hidden md:flex gap-3 mt-6 md:mt-0">
                  <button onClick={scrollBlogsLeft} className="p-3 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={scrollBlogsRight} className="p-3 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                <div 
                  ref={blogScrollRef}
                  id="home-blog-scroll-container"
                  className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 pt-4 hide-scrollbar"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {latestBlogs.map((post) => (
                    <article 
                      key={post.slug}
                      onClick={() => navigate(`/blog/${post.slug}`)}
                      className="snap-start shrink-0 w-[85vw] sm:w-[350px] bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 flex flex-col group cursor-pointer"
                    >
                      <div className="h-48 overflow-hidden relative bg-gray-50">
                        {post.image_url ? (
                          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 font-bold text-xl">{post.title.substring(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-800 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded shadow-sm">
                            {formatLocations(post.target_locations)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500 font-medium">
                          <span className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            {calculateReadingTime(post.content)}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-6 text-sm line-clamp-3 flex-grow leading-relaxed">
                          {getSnippet(post)}
                        </p>
                        
                        <div className="inline-flex items-center text-blue-600 text-sm font-semibold group-hover:text-blue-800 transition mt-auto">
                          Read Article 
                          <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <button 
                  onClick={() => navigate('/blogs')}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 transition-colors"
                >
                  View All Articles
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sub-service Selection Modal */}
        <Modal
          isOpen={!!selectedService && !isBookingModalOpen}
          onClose={() => setSelectedService(null)}
          title={selectedService?.name || 'Select Service'}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">Available services for {selectedService?.name}:</p>
              {selectedService?.name && getRateCardCategory(selectedService.name) && (
                <button
                  onClick={() => {
                    setActiveRateCardCategory(getRateCardCategory(selectedService.name!));
                    setIsRateCardModalOpen(true);
                  }}
                  className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1.5 bg-white border border-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all shadow-sm"
                >
                  <FileText size={16} />
                  {getRateCardCategory(selectedService.name)} Rate Card
                </button>
              )}
            </div>
            <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {selectedService?.subServices
                .filter(sub => !searchQuery || sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || selectedService.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((sub, index) => {
                  const cartItem = cart.find(c => c.id === sub.id);
                  
                  // Psychological Pricing Logic
                  const hash = sub.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index;
                  const discounts = [20, 25, 30, 40];
                  const discountPercentage = discounts[hash % discounts.length];
                  const fakeMRP = Math.round(sub.price / (1 - (discountPercentage / 100)));
                  const savings = fakeMRP - sub.price;
                  
                  const tags = [
                      { text: "🔥 Bestseller", classes: "bg-yellow-400 text-yellow-900" },
                      { text: "⚡ Limited Time Offer", classes: "bg-red-500 text-white" },
                      { text: "⭐ Top Rated", classes: "bg-blue-500 text-white" },
                      null
                  ];
                  const tag = tags[hash % tags.length];

                  return (
                    <div
                      key={sub.id}
                      className="relative p-5 pt-7 border border-indigo-50 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center group overflow-hidden"
                    >
                      {tag && (
                        <div className={`absolute top-0 left-0 ${tag.classes} text-[9px] font-black px-2.5 py-1 rounded-br-xl shadow-sm z-10 uppercase tracking-wider`}>
                          {tag.text}
                        </div>
                      )}
                      
                      <div className="flex-1 w-full mb-4 sm:mb-0 pr-4">
                        <h4 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors text-lg leading-tight mb-2">{sub.name}</h4>
                        
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-xl font-black text-indigo-950">₹{sub.price}</span>
                          <span className="text-xs text-slate-400 line-through">₹{fakeMRP}</span>
                          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-tighter">
                            {discountPercentage}% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1.5 bg-emerald-50/50 w-fit px-2 py-0.5 rounded-md border border-emerald-100/30">
                           <CheckCircle size={10} className="fill-emerald-600/10" /> Super Save: ₹{savings}
                        </p>
                      </div>
                      
                      <div className="w-full sm:w-auto flex justify-end">
                        {cartItem ? (
                          <div className="flex items-center gap-3 bg-indigo-50 rounded-xl border border-indigo-100 px-2 py-1.5 shadow-inner">
                              <button onClick={() => updateQuantity(cartItem.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white hover:bg-indigo-100 rounded-lg text-indigo-700 shadow-sm transition-all"><Minus size={14}/></button>
                              <span className="font-black text-indigo-900 w-6 text-center text-sm">{cartItem.quantity}</span>
                              <button onClick={() => updateQuantity(cartItem.id, 1)} className="w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white shadow-sm transition-all"><Plus size={14}/></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBookService(sub)}
                            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-900 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <Plus size={16} />
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <button onClick={() => setSelectedService(null)} className="text-gray-500 hover:text-gray-700 text-sm">Close</button>
              {cart.length > 0 && (
                <button 
                  onClick={() => { setSelectedService(null); setIsBookingModalOpen(true); }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-green-700 transition-colors"
                >
                  View Cart ({cartItemCount})
                </button>
              )}
            </div>
          </div>
        </Modal>

        {/* Booking Form Modal - Redesigned */}
        <Modal
          isOpen={isBookingModalOpen}
          onClose={() => { if(bookingStep !== 'loading') setIsBookingModalOpen(false); }}
          title={bookingStep === 'success' ? 'Booking Confirmed!' : '✨ Complete Your Booking'}
        >
          {bookingStep === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
              <p className="text-lg font-semibold text-gray-600">Processing your request...</p>
            </div>
          )}

          {bookingStep === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-8">
                Your booking has been confirmed. A partner will be assigned shortly.
              </p>
              <button
                onClick={resetFlow}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
              >
                Back to Home
              </button>
            </div>
          )}

          {bookingStep === 'form' && (
            <form id="checkout-modal" onSubmit={handleSubmitBooking} className="space-y-8">
              
              {/* Trust Banner */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 p-3.5 rounded-2xl flex items-center gap-3 text-xs sm:text-sm border border-emerald-100 shadow-sm">
                <div className="bg-emerald-100 p-1.5 rounded-lg">
                   <Shield size={18} className="fill-emerald-600/20" />
                </div>
                <span className="font-bold tracking-tight">100% Safe & Secure | ISO Certified Professionals</span>
              </div>

              {/* Cart Summary Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-indigo-950 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative bg-white border border-indigo-50 rounded-[2rem] p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.2em] flex items-center gap-2">
                       <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                       Service Dossier
                    </h4>
                    {(() => {
                      const cartRateCategory = cart.find(item => getRateCardCategory(item.categoryName))?.categoryName;
                      const matchedCategory = cartRateCategory ? getRateCardCategory(cartRateCategory) : null;
                      if (matchedCategory) {
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRateCardCategory(matchedCategory);
                              setIsRateCardModalOpen(true);
                            }}
                            className="text-[10px] font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg transition-all"
                          >
                            <FileText size={12} />
                            {matchedCategory} Rates
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100 group/item hover:bg-white hover:shadow-md transition-all">
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-sm leading-tight">{item.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                             <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">₹{item.price}</span>
                             <span className="text-[10px] text-gray-400 font-medium">x {item.quantity}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-inner">
                            <button type="button" onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-md text-gray-600 transition-colors">-</button>
                            <span className="text-xs font-black w-6 text-center text-indigo-900">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-md text-indigo-600 transition-colors">+</button>
                          </div>
                          <button type="button" onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Section - Inlined for better flow */}
                  <div className="mt-6 pt-6 border-t border-indigo-50">
                      <div className="bg-indigo-50/30 p-5 rounded-3xl border border-indigo-100/50">
                        <label className="block text-[9px] font-black text-indigo-900 uppercase tracking-[0.3em] mb-3 ml-1">Elite Coupons</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                placeholder="OFFER CODE" 
                                className="flex-1 bg-white border-2 border-indigo-50 rounded-2xl px-4 py-3 text-sm font-black uppercase outline-none focus:border-indigo-600 shadow-sm transition-all text-indigo-950 placeholder:text-indigo-100"
                                disabled={!!appliedCoupon}
                            />
                            {appliedCoupon ? (
                                <button type="button" onClick={removeCoupon} className="bg-rose-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black shadow-lg hover:bg-rose-700 active:scale-95 transition-all uppercase tracking-widest">REMOVE</button>
                            ) : (
                                <button type="button" onClick={() => handleApplyCoupon()} className="bg-indigo-950 text-white px-6 py-3 rounded-2xl text-[10px] font-black shadow-lg hover:bg-black active:scale-95 transition-all uppercase tracking-widest">APPLY</button>
                            )}
                        </div>
                        {couponMessage && (
                            <p className={`text-[11px] mt-2 font-bold px-2 py-1 rounded-md inline-block ${couponMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                {couponMessage.text}
                            </p>
                        )}
                        
                        {!appliedCoupon && (
                            <div className="mt-3">
                                <div className="flex flex-wrap gap-2">
                                    <span onClick={() => handleApplyCoupon('GET20')} className="cursor-pointer bg-white text-indigo-600 border-2 border-indigo-100 text-[10px] font-black px-3 py-1.5 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all shadow-sm">
                                        GET20
                                    </span>

                                    <span onClick={() => handleApplyCoupon('SAVE10')} className="cursor-pointer bg-white text-indigo-600 border-2 border-indigo-100 text-[10px] font-black px-3 py-1.5 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all shadow-sm">
                                        SAVE10
                                    </span>
                                </div>
                            </div>
                        )}
                      </div>
                  </div>

                  <div className="mt-5 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Cart Subtotal</span>
                          <span className="font-bold text-gray-900">₹{cartTotal}</span>
                      </div>
                      <AnimatePresence>
                        {discountAmount > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-xl border border-green-100"
                            >
                                <span className="font-bold text-green-700 text-xs">Discount Bonus ({appliedCoupon})</span>
                                <span className="font-black text-green-700">-₹{discountAmount}</span>
                            </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-indigo-100 mt-2">
                          <span className="font-black text-gray-900 uppercase tracking-tight">Final Payable</span>
                          <div className="text-right">
                             <span className="block font-black text-2xl text-indigo-600 drop-shadow-sm">₹{finalTotal}</span>
                             <span className="text-[9px] text-green-600 font-bold uppercase tracking-widest">Pricing Inclusive of Tax</span>
                          </div>
                      </div>
                  </div>
                </div>
              </div>

              {/* Customer Details Sections */}
              <div className="space-y-8">
                
                {/* Section 1: Contact Info Card */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-indigo-900 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                  <div className="relative bg-white border border-indigo-50 rounded-3xl p-6 shadow-sm">
                    <h4 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
                      <span className="bg-indigo-950 text-white w-7 h-7 rounded-xl flex items-center justify-center text-[10px] shadow-xl shadow-indigo-100">1</span>
                      Identity Protocols
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Full Identity</label>
                        <div className="relative group/input">
                          <User className="absolute left-4 top-4 text-indigo-200 group-focus-within/input:text-indigo-600 transition-colors" size={18} />
                          <input
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-indigo-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-black text-indigo-950 placeholder:font-normal placeholder:text-gray-300"
                            placeholder="Client Name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Secure Contact</label>
                        <div className="relative group/input">
                          <Phone className="absolute left-4 top-4 text-indigo-200 group-focus-within/input:text-indigo-600 transition-colors" size={18} />
                          <input
                            required
                            name="contact"
                            value={formData.contact}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-indigo-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-black text-indigo-950 placeholder:font-normal placeholder:text-gray-300"
                            placeholder="10-Digit Mobile"
                            pattern="[0-9]{10}"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Service Location Card */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-indigo-900 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                  <div className="relative bg-white border border-indigo-50 rounded-3xl p-6 shadow-sm">
                    <h4 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
                      <span className="bg-indigo-950 text-white w-7 h-7 rounded-xl flex items-center justify-center text-[10px] shadow-xl shadow-indigo-100">2</span>
                      Deployment Address
                    </h4>
                    
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Operational Venue</label>
                        <div className="relative group/input">
                          <MapPin className="absolute left-4 top-4 text-indigo-200 group-focus-within/input:text-indigo-600 transition-colors" size={18} />
                          <input
                            id="checkout-address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            onBlur={async () => {
                              if (!formData.pincode && formData.address) {
                                  setIsDetectingPincode(true);
                                  const foundPin = await identifyPincode(formData.address);
                                  if (foundPin) {
                                      setFormData(p => ({ ...p, pincode: foundPin }));
                                  }
                                  setIsDetectingPincode(false);
                              }
                            }}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-indigo-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-black text-indigo-950 placeholder:font-normal placeholder:text-gray-300"
                            placeholder="House / Building / Street / Pincode"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 my-2 w-full">
                        <div className="h-[2px] bg-indigo-50 flex-1"></div>
                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Safety First</span>
                        <div className="h-[2px] bg-indigo-50 flex-1"></div>
                      </div>

                      <div className="space-y-4">
                        {/* Unique Highlighted Location Button */}
                        <div className="relative group/loc">
                          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 animate-pulse group-hover/loc:opacity-40 transition duration-1000"></div>
                          <div className="relative bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm overflow-hidden ring-1 ring-indigo-50">
                             <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                                <div className="flex items-center gap-4">
                                   <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner border border-indigo-100/50">
                                      <motion.div
                                        animate={isTrackingLocation ? { rotate: 360 } : {}}
                                        transition={isTrackingLocation ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
                                      >
                                         <Navigation size={28} className="fill-indigo-600/10" />
                                      </motion.div>
                                   </div>
                                   <div className="text-center sm:text-left">
                                      <h5 className="font-black text-indigo-950 text-sm tracking-tight uppercase">Precision Geolocation</h5>
                                      <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mt-0.5 whitespace-nowrap">Instant Real-Time Sync</p>
                                   </div>
                                </div>

                                <button 
                                  type="button" 
                                  onClick={handleTrackLocation} 
                                  disabled={isTrackingLocation}
                                  className={`relative group/btn min-w-[200px] h-12 flex items-center justify-center gap-2 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 z-10 overflow-hidden ${
                                    formData.locationLink 
                                      ? 'bg-emerald-600 text-white shadow-emerald-100 border-b-4 border-emerald-800' 
                                      : 'bg-indigo-950 text-white shadow-indigo-200 hover:shadow-xl border-b-4 border-black'
                                  } shadow-lg`}
                                >
                                  {isTrackingLocation ? (
                                    <>
                                      <Loader2 className="animate-spin" size={20} />
                                      SYNCING...
                                    </>
                                  ) : formData.locationLink ? (
                                    <>
                                      <CheckCircle size={18} />
                                      LOCKED IN
                                    </>
                                  ) : (
                                    <>
                                       <MapPin size={18} className="fill-current/20" />
                                       AUTO-DETECT
                                       <motion.div 
                                         className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full"
                                         animate={{ translateX: ['-100%', '200%'] }}
                                         transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 1 }}
                                       />
                                    </>
                                  )}
                                </button>
                             </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pinned Navigation Point</label>
                          <div className="relative group/input">
                            <MapPin className="absolute left-3.5 top-3.5 text-rose-400 group-focus-within/input:text-rose-600 transition-colors" size={18} />
                            <input
                              type="url"
                              id="customerLocationLink"
                              name="locationLink"
                              value={formData.locationLink}
                              onChange={handleInputChange}
                              className="w-full pl-11 pr-4 py-3.5 bg-rose-50/30 border-2 border-rose-50 rounded-xl focus:bg-white focus:ring-4 focus:ring-rose-100 focus:border-rose-300 outline-none transition-all font-bold text-xs text-rose-900 placeholder:text-rose-200"
                              placeholder="Google Maps Sync Link"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current City</label>
                          <div className="relative group/input">
                              <MapPin className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within/input:text-indigo-600 transition-colors" size={18} />
                              <select
                                required
                                name="city"
                                value={formData.city}
                                onChange={(e) => {
                                   const newCity = e.target.value;
                                   setFormData(prev => ({ ...prev, city: newCity, area: '', pincode: '' }));
                                   localStorage.setItem('preferredCity', newCity);
                                   window.dispatchEvent(new Event('cityUpdated'));
                                }}
                                className="w-full pl-10 pr-8 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all appearance-none font-bold text-sm text-gray-900"
                              >
                                 <option value="">Select Region</option>
                                 {CITY_DATA.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                              </select>
                              <ChevronRight className="absolute right-4 top-4 rotate-90 text-gray-400 pointer-events-none" size={16} />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Local Area</label>
                          <div className="relative group/input">
                              <Map className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within/input:text-indigo-600 transition-colors" size={18} />
                              <select
                                required
                                name="area"
                                value={formData.area}
                                onChange={async (e) => {
                                   const newArea = e.target.value;
                                   setFormData(prev => ({ ...prev, area: newArea }));
                                   if (newArea) {
                                      setIsFetchingAreaPincode(true);
                                      try {
                                         const pins = await fetchPincodesByArea([newArea]);
                                         if (pins && pins.length > 0) {
                                            setFormData(prev => ({ ...prev, pincode: pins[0] }));
                                         }
                                      } finally {
                                         setIsFetchingAreaPincode(false);
                                      }
                                   }
                                }}
                                className="w-full pl-10 pr-8 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all appearance-none font-bold text-sm text-gray-900"
                                disabled={!formData.city}
                              >
                                 <option value="">Choose your area.</option>
                                 {formData.city && PREDEFINED_AREAS[formData.city] ? PREDEFINED_AREAS[formData.city].map(area => (
                                    <option key={area} value={area}>{area}</option>
                                 )) : (
                                    <option value="Other">Other</option>
                                 )}
                              </select>
                              <ChevronRight className="absolute right-4 top-4 rotate-90 text-gray-400 pointer-events-none" size={16} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1 flex items-center justify-between">
                          Postal Pin-Code
                          {(isDetectingPincode || isFetchingAreaPincode) && <span className="text-indigo-600 font-black lowercase flex items-center gap-1 animate-pulse"><Loader2 size={10} className="animate-spin" />syncing...</span>}
                        </label>
                        <div className="relative group/input">
                          <MapPin className="absolute left-4 top-4 text-indigo-300 group-focus-within/input:text-indigo-600 transition-colors" size={18} />
                          <input
                            required
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            disabled={isDetectingPincode || isFetchingAreaPincode}
                            className="w-full pl-12 pr-4 py-4 bg-indigo-50/10 border-2 border-indigo-100/30 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all disabled:opacity-60 font-black text-indigo-950 tracking-[0.2em] text-xl"
                            placeholder="------"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Schedule Card */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                  <div className="relative bg-white border border-orange-50 rounded-2xl p-5 shadow-sm">
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-5">
                      <span className="bg-orange-500 text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-md shadow-orange-200">3</span>
                      Time Slot
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Date</label>
                            <div className="relative">
                               <Calendar className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" size={18} />
                               <input 
                                   type="date" 
                                   name="date"
                                   value={formData.date}
                                   onChange={handleInputChange}
                                   min={minDate}
                                   className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-bold text-gray-900" 
                                   required 
                               />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Timing</label>
                            <div className="relative">
                               <Clock className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" size={18} />
                               <select 
                                   name="time"
                                   value={formData.time}
                                   onChange={handleInputChange}
                                   className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all appearance-none font-bold text-gray-900 text-[13px] sm:text-sm"
                                   required
                               >
                                   <option value="">Select</option>
                                   {availableTimeSlots.length === 0 ? (
                                       <option value="" disabled>Sold Out</option>
                                   ) : (
                                       availableTimeSlots.map(slot => (
                                           <option key={slot} value={slot}>{slot}</option>
                                       ))
                                   )}
                               </select>
                               <ChevronRight className="absolute right-4 top-4 rotate-90 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Extra Details Card */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-300 to-indigo-600 rounded-[2rem] blur opacity-5 transition duration-1000"></div>
                  <div className="relative bg-white border border-indigo-50 rounded-3xl p-6 shadow-sm">
                    <h4 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
                       <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                       Special Dispatch Info
                    </h4>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Service Directives</label>
                      <div className="relative group/input">
                          <FileText className="absolute left-4 top-4 text-indigo-200 group-focus-within/input:text-indigo-600 transition-colors" size={18} />
                          <input
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-indigo-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-black text-indigo-950 placeholder:font-normal placeholder:text-gray-300"
                            placeholder="Specific instructions for our team..."
                          />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-10 flex flex-col items-center">
                  <div className="w-full relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <button
                      type="submit"
                      className="relative w-full h-18 py-6 bg-indigo-950 text-white font-black text-xl rounded-2xl shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 overflow-hidden border-b-8 border-indigo-950 active:translate-y-2 active:border-b-0 uppercase tracking-tighter"
                    >
                      <Shield size={24} className="text-indigo-400 fill-indigo-400/20" />
                      <span>SECURE CONFIRMATION - ₹{finalTotal}</span>
                      <ArrowRight size={24} className="group-hover:translate-x-3 transition-transform" />
                      <motion.div 
                        className="absolute inset-0 bg-white/5 transform -skew-x-12 -translate-x-full"
                        animate={{ translateX: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                      />
                    </button>
                  </div>
                  <Link to="/blogs" className="mt-8 text-[9px] text-indigo-400 font-black uppercase tracking-[0.4em] flex items-center gap-2 hover:text-indigo-600 transition-colors">
                    <ShieldCheck size={14} className="text-emerald-500" /> MILITARY-GRADE ENCRYPTION ACTIVE
                  </Link>
              </div>
            </form>
          )}
        </Modal>

        {/* Rate Card Modal */}
        <RateCardModal 
          isOpen={isRateCardModalOpen} 
          onClose={() => setIsRateCardModalOpen(false)}
          category={activeRateCardCategory}
        />
      </div>
    </>
  );
};