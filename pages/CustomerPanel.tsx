import React, { useState, useMemo, useEffect } from 'react';
import { SERVICES } from '../constants';
import { Service, SubService, Booking, CartItem } from '../types';
import { Modal } from '../components/Modal';
import { useStore } from '../hooks/useStore';
import { Loader2, CheckCircle, Calendar, MapPin, User, Phone, FileText, Star, Search, ChevronRight, Plus, Minus, Shield, ArrowRight, Trash2 } from 'lucide-react';
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
    { name: "Premium AC Service (Split)", price: 599, img: "https://i.postimg.cc/4dh6m6X0/Whats-App-Image-2026-01-12-at-11-13-39-PM.jpg", desc: "Expert AC deep cleaning & cooling solutions by Sofiyan." },
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
    { name: "Chimney Full Deep Cleaning", price: 2000, img: "https://i.postimg.cc/FFPQp0m9/Chat-GPT-Image-Jan-13-2026-04-35-34-AM.jpg", desc: "Dismantling & deep chemical wash for chimneys." },
    { name: "Sofa Cleaning (per seat)", price: 170, img: "https://i.postimg.cc/D0ZGk18T/Whats-App-Image-2026-01-12-at-11-52-40-PM.jpg", desc: "Shampooing & vacuuming for spotless sofas." },
    { name: "AC Water Leakage Repair", price: 599, img: "https://i.postimg.cc/442GJpmj/Whats-App-Image-2026-01-12-at-11-13-46-PM.jpg", desc: "Drainpipe blockages & leakage fixed instantly." },
    { name: "AC Shifting (other site)", price: 1699, img: "https://i.postimg.cc/zfwpJmFk/Whats-App-Image-2026-01-12-at-11-13-40-PM-(1).jpg", desc: "Safe uninstallation & shifting of your AC." },
    { name: "Full Home 1BHK", price: 4000, img: "https://i.postimg.cc/q7cP33QD/Whats-App-Image-2026-01-12-at-11-52-37-PM.jpg", desc: "Intensive 1BHK deep cleaning by Sofiyan experts." },
    { name: "Full Home 2BHK", price: 6000, img: "https://i.postimg.cc/026hC3cq/Whats-App-Image-2026-01-12-at-11-52-38-PM.jpg", desc: "Complete 2BHK sanitization & deep cleaning." },
    { name: "Full Home 3BHK", price: 9000, img: "https://i.postimg.cc/25xt6f8J/Whats-App-Image-2026-01-12-at-11-52-39-PM-(1).jpg", desc: "Premium 3BHK hygiene & deep clean service." },
    { name: "Full Home 4BHK", price: 13000, img: "https://i.postimg.cc/kg3Yv5VJ/Whats-App-Image-2026-01-12-at-11-52-39-PM.jpg", desc: "Extensive 4BHK cleaning for a sparkling home." },
    { name: "Water Tank Cleaning (1000L)", price: 749, img: "https://i.postimg.cc/fy2xJB6v/Chat-GPT-Image-Jan-13-2026-12-44-47-AM.jpg", desc: "Anti-bacterial water tank cleaning & treatment." }
];



export const CustomerPanel: React.FC = () => {
  const { addBooking } = useStore();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Advanced Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<'form' | 'loading' | 'success'>('form');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    city: '',
    pincode: '',
    description: '',
    date: '',
    time: ''
  });

  // Auto-fill address from localStorage when booking modal opens
  useEffect(() => {
    if (isBookingModalOpen) {
      const savedLocation = localStorage.getItem('savedCustomerLocation');
      if (savedLocation && !formData.address) {
        setFormData(prev => ({ ...prev, address: savedLocation }));
      }
    }
  }, [isBookingModalOpen]);

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
  const filteredServices = SERVICES.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.subServices.some(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  const handleBookService = (sub: SubService) => {
    addToCart(sub, selectedService?.name || 'General');
    // We don't open modal immediately anymore, we add to cart
  };

  // 3. Handle Direct Booking from Search Dropdown
  const handleDirectBooking = (item: typeof allSubServices[0]) => {
    addToCart(item, item.categoryName);
    setIsBookingModalOpen(true);
    setBookingStep('form');
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
      setIsBookingModalOpen(true);
      setBookingStep('form');
  };


  // Time Slot Logic
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [minDate, setMinDate] = useState('');

  const formatAMPM = (hours: number) => {
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    let strTime = hours.toString().padStart(2, '0') + ':00 ' + ampm;
    return strTime;
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
            slots.push(`${formatAMPM(i)} - ${formatAMPM(i + 1)}`);
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
    if (!formData.time) {
      alert("Please select a time slot!");
      return;
    }

    setBookingStep('loading');

    try {
      const subServiceName = cart.map(i => `${i.name} (x${i.quantity})`).join(', ');
      const categoryName = cart.length === 1 ? cart[0].categoryName : 'Multiple Services';

      // Insert into Supabase
      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            customer_name: formData.name,
            customer_phone: formData.contact,
            customer_address: formData.address,
            city: formData.city,
            location: localStorage.getItem('savedCustomerLocation') || '',
            pincode: formData.pincode,
            cart_items: cart,
            total_price: cartTotal,
            service_date: formData.date,
            service_time: formData.time,
            notes: formData.description,
            status: 'pending',
            // Additional fields for admin tracking
            service_category: categoryName,
            sub_service_name: subServiceName,
            commission_paid: false
          }
        ]);

      if (error) throw error;

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
    setFormData({ name: '', contact: '', address: '', city: '', pincode: '', description: '', date: '', time: '' });
  };

  return (
    <>
      {/* Customer Support Badge - New Position & Design */}
      <div className="w-full max-w-7xl mx-auto flex justify-start px-4 sm:px-6 lg:px-8 mt-4 md:mt-6 mb-[-1rem] relative z-10">
          <a href="tel:+919219345455" className="group flex items-center bg-white border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 rounded-full py-1.5 px-3 md:py-2 md:px-4 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-50 flex items-center justify-center mr-2 md:mr-3 group-hover:bg-indigo-100 transition-colors">
                  <i className="fas fa-headset text-indigo-600 text-sm md:text-lg animate-pulse"></i>
              </div>
              <div className="flex flex-col text-left">
                  <span className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-tight">Customer Support</span>
                  <span className="text-sm md:text-base font-extrabold text-gray-800 group-hover:text-indigo-600 transition-colors leading-tight">
                      9219345455
                  </span>
              </div>
              <div className="ml-2 pl-2 md:ml-3 md:pl-3 border-l border-gray-200 hidden sm:flex items-center">
                  <span className="text-[10px] md:text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-md">Call Now</span>
              </div>
          </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 mb-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Professional Home Services
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Expert help at your doorstep
          </p>
        </div>

        {/* Global Search Bar Section */}
        <div className="max-w-xl mx-auto mb-12 relative z-30">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 shadow-lg transition-all hover:shadow-xl text-gray-800"
            placeholder="Search for 'AC Service', 'Fan Repair', 'Cleaning'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Search Results Dropdown */}
          {searchQuery && (
            <div className="absolute w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto animate-fadeIn overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Suggested Services</div>
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
                  <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="text-gray-400" size={20} />
                  </div>
                  <p className="text-gray-800 font-medium">No services found</p>
                  <p className="text-gray-500 text-sm">Try searching for something else like "AC" or "Plumbing"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trust Badge Banner */}
        <div className="w-full flex justify-center mt-4 mb-6 px-2">
            <div className="flex flex-row items-center bg-white rounded-full shadow-sm border border-gray-100 py-2 px-2 sm:px-4 divide-x divide-gray-200 max-w-full overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>
                    {`.overflow-x-auto::-webkit-scrollbar { display: none; }`}
                </style>
                
                <div className="flex items-center px-2 sm:px-4 whitespace-nowrap text-[10px] sm:text-xs md:text-sm font-semibold text-gray-700">
                    <span className="w-1.5 h-1.5 md:w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span> 
                    24/7 Expert
                </div>
                
                <div className="flex items-center px-2 sm:px-4 whitespace-nowrap text-[10px] sm:text-xs md:text-sm font-semibold text-gray-700">
                    <i className="fas fa-check text-blue-600 mr-1.5 text-[10px] md:text-base"></i> 
                    100% Quality
                </div>
                
                <div className="flex items-center px-2 sm:px-4 whitespace-nowrap text-[10px] sm:text-xs md:text-sm font-semibold text-gray-700">
                    <i className="fas fa-bolt text-purple-600 mr-1.5 text-[10px] md:text-base"></i> 
                    Fast Booking
                </div>
                
            </div>
        </div>

        {/* Categories Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredServices.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service)}
                className="relative group rounded-xl overflow-hidden shadow-lg h-40 cursor-pointer w-full transition-shadow duration-300 hover:shadow-xl"
              >
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 flex justify-center items-end h-2/3">
                  <span className="text-white font-bold text-sm tracking-wide text-center drop-shadow-md">
                    {service.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          !searchQuery && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No categories available.</p>
            </div>
          )
        )}

        {/* NEW: Featured Services Auto-Scrolling Section with Custom Data */}
        <div id="featured-services-section" className="mt-16 mb-8 py-10 bg-gray-50 overflow-hidden">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Popular Services</h2>
          <div className="relative w-full overflow-hidden">
            {/* Double the list to create seamless infinite scroll */}
            <div className="flex gap-6 animate-scroll w-max">
              {[...featuredServicesData, ...featuredServicesData].map((service, index) => (
                <div key={`${service.name}-${index}`} className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden group cursor-pointer">
                  <div className="relative h-40 overflow-hidden">
                    <img src={service.img} alt={service.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    <div className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span> Available
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-sm mb-1 truncate" title={service.name}>{service.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 h-8 overflow-hidden leading-tight">{service.desc}</p>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-indigo-700 text-sm">₹{service.price}</span>
                        <button 
                          onClick={() => handleFeaturedBooking(service.name, service.price)}
                          className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                        >
                            Book Now
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
          <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 animate-slideUp">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  {cartItemCount}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="text-xl font-bold text-gray-900">₹{cartTotal}</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsBookingModalOpen(true); setBookingStep('form'); }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                View Cart & Book <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Customer Reviews Section */}
        <div className="mt-20 py-12 bg-blue-50 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">What Our Customers Say</h2>
              <div className="relative overflow-hidden group">
                  <div className="flex space-x-6 animate-scroll w-max hover:[animation-play-state:paused]">
                      {[...customerReviews, ...customerReviews].map((review, index) => (
                          <div key={index} className="w-80 md:w-96 flex-shrink-0 bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
                              <div className="flex items-center gap-4 mb-4">
                                  <img src={review.img} alt={review.name} className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100" />
                                  <div>
                                      <h4 className="font-bold text-gray-900 text-lg">{review.name}</h4>
                                      <div className="flex text-yellow-400 gap-0.5">
                                          {[...Array(5)].map((_, i) => (
                                              <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                                          ))}
                                      </div>
                                  </div>
                              </div>
                              <p className="text-gray-600 text-sm leading-relaxed italic">"{review.text}"</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
          <style>{`
              @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
              .animate-scroll { animation: scroll 40s linear infinite; }
              @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
              .animate-slideUp { animation: slideUp 0.3s ease-out; }
          `}</style>
        </div>

        {/* Trust Metrics / Stats Section */}
        <div className="py-16 bg-blue-50/30 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
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

        {/* Sub-service Selection Modal */}
        <Modal
          isOpen={!!selectedService && !isBookingModalOpen}
          onClose={() => setSelectedService(null)}
          title={selectedService?.name || 'Select Service'}
        >
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">Available services for {selectedService?.name}:</p>
            <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {selectedService?.subServices
                .filter(sub => !searchQuery || sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || selectedService.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((sub) => {
                  const cartItem = cart.find(c => c.id === sub.id);
                  return (
                    <div
                      key={sub.id}
                      className="p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all flex justify-between items-center group"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{sub.name}</h4>
                        <p className="text-sm text-gray-500 font-medium">₹{sub.price}</p>
                      </div>
                      
                      {cartItem ? (
                        <div className="flex items-center gap-3 bg-white rounded-lg border border-indigo-100 px-2 py-1 shadow-sm">
                            <button onClick={() => updateQuantity(cartItem.id, -1)} className="p-1 hover:bg-indigo-50 rounded text-indigo-600"><Minus size={16}/></button>
                            <span className="font-bold text-indigo-900 w-4 text-center">{cartItem.quantity}</span>
                            <button onClick={() => updateQuantity(cartItem.id, 1)} className="p-1 hover:bg-indigo-50 rounded text-indigo-600"><Plus size={16}/></button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBookService(sub)}
                          className="ml-4 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add
                        </button>
                      )}
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
            <form id="checkout-modal" onSubmit={handleSubmitBooking} className="space-y-6">
              
              {/* Trust Banner */}
              <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm border border-green-100">
                <Shield size={16} className="fill-current" />
                <span className="font-medium">100% Safe & Secure | Verified Professionals</span>
              </div>

              {/* Cart Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Order Summary</h4>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">₹{item.price} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-gray-600">-</button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-gray-600">+</button>
                        <button type="button" onClick={() => removeFromCart(item.id)} className="ml-2 text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total to Pay</span>
                  <span className="text-xl font-extrabold text-indigo-700">₹{cartTotal}</span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        required
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="10-digit mobile number"
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit mobile number"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Service Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      required
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="House No, Street, Landmark"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">City <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input
                          required
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                          placeholder="e.g. Mumbai"
                        />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Pincode</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input
                          required
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                          placeholder="e.g. 560001"
                        />
                    </div>
                  </div>

                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                        <input 
                            type="date" 
                            id="service-date" 
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            min={minDate}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time <span className="text-red-500">*</span></label>
                        <select 
                            id="selected-time-slot" 
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 bg-white outline-none" 
                            required
                        >
                            <option value="" disabled>Select Date First</option>
                            {availableTimeSlots.length === 0 && formData.date ? (
                                <option value="" disabled>No slots available</option>
                            ) : (
                                availableTimeSlots.map(slot => (
                                    <option key={slot} value={slot}>{slot}</option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Instructions (Optional)</label>
                  <div className="relative">
                      <FileText className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="Any specific needs..."
                      />
                  </div>
                </div>

              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] hover:from-green-600 hover:to-green-700 transition-all transform flex items-center justify-center gap-2"
              >
                Confirm Booking - ₹{cartTotal} <ArrowRight size={20} />
              </button>
            </form>
          )}
        </Modal>
      </div>
    </>
  );
};