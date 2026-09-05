import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { SERVICES, CITY_DATA, PREDEFINED_AREAS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Service, SubService, CartItem } from '../types';
import { useStore } from '../hooks/useStore';
import { Modal } from '../components/Modal';
import { RateCardModal } from '../components/RateCardModal';
import { identifyPincode, fetchPincodesByArea, fetchAreasByPincode } from '../services/pincodeService';
import { Loader2, CheckCircle, MapPin, User, Phone, Star, Search, ChevronRight, ChevronLeft, Plus, Minus, Shield, ArrowRight, Trash2, FileText, Calendar, Clock, Map as MapIcon, Navigation, ShieldCheck, Lock, ShoppingCart, User as UserIcon, X, Gift, ShoppingBag, HelpCircle, Copy } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getSignedAppFileUrl } from '../services/storageService';

import { MapPicker } from '../components/MapPicker';
import { NearbyTechniciansBlock } from '../components/NearbyTechniciansBlock';

// Specific Customer Reviews Data
const customerReviews = [
  {
    name: "Rahul Sharma",
    img: "https://randomuser.me/api/portraits/men/43.jpg",
    rating: 5,
    text: "Mene pehli baar Sofiyan Home Service se electrician book kiya. Kaam bahut safai se kiya aur time par aaye. Highly recommended!"
  },
  {
    name: "Priya Venkatesh",
    img: "https://randomuser.me/api/portraits/women/43.jpg",
    rating: 5,
    text: "Very happy with the AC cleaning service. The team from Sofiyan Home Service was polite, professional, and wore uniforms."
  },
  {
    name: "Amit Malhotra",
    img: "https://randomuser.me/api/portraits/men/33.jpg",
    rating: 4,
    text: "Sofiyan Home Service is trustworthy. Pricing was clear, and the plumber fixed the leakage quickly without any hidden charges."
  },
  {
    name: "Sneha Gupta",
    img: "https://randomuser.me/api/portraits/women/61.jpg",
    rating: 5,
    text: "Kitchen deep cleaning was excellent! Sofiyan Home Service staff really worked hard. My kitchen looks brand new now."
  },
  {
    name: "Vikram Singh",
    img: "https://randomuser.me/api/portraits/men/29.jpg",
    rating: 5,
    text: "Best app for home repairs in my area. I use Sofiyan Home Service for all my electrical and plumbing needs. Very reliable."
  },
  {
    name: "Anjali Mehta",
    img: "https://randomuser.me/api/portraits/women/40.jpg",
    rating: 5,
    text: "Safe and secure for women customers. The professionals sent by Sofiyan Home Service were verified and very decent."
  }
];


const ReviewsCarousel = () => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let scrollInterval: NodeJS.Timeout;

    const startScroll = () => {
      scrollInterval = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          const child = scrollRef.current.children[0] as HTMLElement;
          const scrollAmount = child ? child.offsetWidth + 24 : 300; // 24 is gap-6

          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
        }
      }, 3500);
    };

    startScroll();

    const handleMouseEnter = () => clearInterval(scrollInterval);
    const handleMouseLeave = () => startScroll();

    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('mouseenter', handleMouseEnter);
      currentRef.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      clearInterval(scrollInterval);
      if (currentRef) {
        currentRef.removeEventListener('mouseenter', handleMouseEnter);
        currentRef.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div className="mt-28 py-20 bg-indigo-50/30 -mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200/20 blur-[100px] rounded-full"></div>
      
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col mb-8">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2 text-left">Customer Chronicles</h2>
            <h3 className="text-[22px] sm:text-4xl font-bold text-gray-900 tracking-normal text-left">Voice of Excellence</h3>
        </div>
        <style>
          {`.scrollbar-hide::-webkit-scrollbar { display: none; }`}
        </style>
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {customerReviews.map((review, index) => (
             <div 
               key={index} 
               className="flex-none w-[280px] md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] snap-start bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md"
             >
                <div className="flex items-center gap-4 mb-4">
                    <img src={review.img} alt={review.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-indigo-50" />
                    <div>
                        <h4 className="font-bold text-gray-900 text-base sm:text-lg">{review.name}</h4>
                        <div className="flex text-yellow-400 gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                            ))}
                        </div>
                    </div>
                </div>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed italic line-clamp-4">"{review.text}"</p>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
    { name: "Gas Leak Fix and Refilling", price: 2800, img: "https://i.postimg.cc/5NZmL9PZ/Whats-App-Image-2026-01-12-at-11-13-43-PM-(1).jpg", desc: "Premium AC gas refill with leak testing." },
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



const mainCategories = [
    { id: "AC", name: "AC", image: "https://iili.io/nJSqYJt.png" },
    { id: "Electrician", name: "Electrical", image: "https://iili.io/nJS1G9e.png" },
    { id: "Plumbing", name: "Plumbing", image: "https://iili.io/nJSl9VV.png" },
    { id: "Appliances", name: "Appliances", image: "https://iili.io/nJScxae.png" },
    { id: "Cleaning", name: "Cleaning", image: "https://iili.io/nJSaR1t.png" }
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

const getRateCardCategory = (name: string): string | null => {
  if (!name) return null;
  const clean = name.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.includes('ac') || clean.includes('aircon') || clean.includes('aircond')) return 'AC Service';
  if (clean.includes('washing') || clean.includes('washer')) return 'Washing Machine';
  if (clean.includes('refrigerator') || clean.includes('fridge')) return 'Refrigerator';
  if (clean.includes('purifier') || clean.includes('waterpurifier') || clean.includes('ro')) return 'Water Purifier';
  return null;
};


const PromotionalCarousel: React.FC<{onApplianceClick?: () => void}> = () => {
  const basePromos = [
    { src: "https://iili.io/nddEUI2.png", category: "AC" },
    { src: "https://iili.io/nddM2M7.png", category: "Plumbing" },
    { src: "https://iili.io/nddMsOx.png", category: "WashingMachine" },
    { src: "https://iili.io/nddVrLN.png", category: "WaterPurifier" },
    { src: "https://iili.io/nddWaQp.png", category: "Geyser" },
    { src: "https://iili.io/nddXfcX.png", category: "Chimney" },
    { src: "https://iili.io/nddXvxR.png", category: "Cleaning" }
  ];
  // Duplicate for longer scroll before rewind
  const promos = [...basePromos, ...basePromos]; 
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const firstChild = container.firstElementChild as HTMLElement;
        const gap = window.innerWidth < 640 ? 16 : 24;
        const scrollAmount = firstChild ? firstChild.offsetWidth + gap : container.clientWidth / 3;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (container.scrollLeft >= maxScroll - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full mt-10 mb-8 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
      <div className="flex flex-col mb-3 sm:mb-6">
          <h2 className="text-[22px] sm:text-3xl font-bold text-gray-900 tracking-normal">In the spotlight</h2>
      </div>
      <style>
        {`.scrollbar-hide::-webkit-scrollbar { display: none; }`}
      </style>
      <div 
        ref={scrollRef} 
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {promos.map((promo, i) => (
          <div 
            key={i} 
            className="flex-none w-[93%] sm:w-[calc(33.333%-1rem)] snap-start relative rounded-xl overflow-hidden group cursor-pointer"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).openCategoryView) {
                (window as any).openCategoryView(promo.category);
              } else if (typeof window !== 'undefined' && (window as any).openCategoryModal) {
                (window as any).openCategoryModal(promo.category);
              }
            }}
          >
            <img src={promo.src} alt={`In the spotlight ${promo.category}`} className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
};


interface MostPopularCarouselProps {
  onBook: (name: string, price: number) => void;
  onSeeAll: () => void;
}
const MostPopularCarousel: React.FC<MostPopularCarouselProps> = ({ onBook, onSeeAll }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 600 : 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div id="featured-services-section" className="w-full mt-12 mb-10 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto bg-white relative">
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <h2 className="text-[22px] sm:text-4xl font-bold text-gray-900 tracking-normal text-left">Appliance repair & service</h2>
        <button 
           onClick={onSeeAll} 
           className="px-4 py-1.5 sm:px-5 sm:py-2 bg-white border border-gray-200 rounded-lg text-indigo-700 font-medium text-sm hover:bg-gray-50 transition-colors shrink-0"
        >
          See all
        </button>
      </div>
      <style>
        {`.scrollbar-hide::-webkit-scrollbar { display: none; }`}
      </style>
      <div className="relative group/carousel">
        <button 
           onClick={() => scroll('left')} 
           className="absolute -left-5 top-[40%] -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-105 transition-all opacity-0 group-hover/carousel:opacity-100 hidden sm:flex"
        >
           <ChevronLeft size={20} />
        </button>
        <button 
           onClick={() => scroll('right')} 
           className="absolute -right-5 top-[40%] -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-105 transition-all opacity-0 group-hover/carousel:opacity-100 hidden sm:flex"
        >
           <ChevronRight size={20} />
        </button>

        <div 
          ref={scrollRef} 
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {featuredServicesData.map((service, index) => (
            <div 
              key={`${service.name}-${index}`} 
              className="flex-none w-[170px] sm:w-[280px] lg:w-[calc(20%-1.2rem)] snap-start relative group cursor-pointer"
              onClick={() => onBook(service.name, service.price)}
            >
              <div className="relative h-36 sm:h-56 w-full rounded-2xl overflow-hidden mb-3 bg-gray-100">
                <img src={service.img} alt={service.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col px-1">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1 line-clamp-2 leading-tight" title={service.name}>{service.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                   <span className="font-medium text-gray-900">★ 4.75</span>
                   <span className="text-[10px]">●</span>
                   <span className="text-gray-500 flex items-center gap-1"><span className="text-emerald-600 font-bold">⚡</span> Instant</span>
                </div>
                <span className="font-medium text-gray-900 text-sm">₹{service.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CustomerPanel: React.FC = () => {
  const { bookings, fetchBookings, updateBooking, partners } = useStore();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'bookings' | 'profile' | 'referral' | 'support'>('bookings');
  const [bookingSubTab, setBookingSubTab] = useState<'active' | 'delivered' | 'cancelled' | 'warranty'>('active');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Advanced Cart State with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sofiyan_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [useReferralBalance, setUseReferralBalance] = useState(false);
  const [bookingStep, setBookingStep] = useState<'form' | 'loading' | 'success'>('form');
  const [isSeeAllModalOpen, setIsSeeAllModalOpen] = useState(false);
  const [bookingOtp, setBookingOtp] = useState("");
  const [completedBookingId, setCompletedBookingId] = useState<string>('');
  const [lastBookedCategory, setLastBookedCategory] = useState<string>('');

  // Post-Service Review and Rating states
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  const [selectedTechnicianForProfile, setSelectedTechnicianForProfile] = useState<Partner | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [dismissedReviewBookingIds, setDismissedReviewBookingIds] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem('dismissed_review_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [customerPhone, setCustomerPhone] = useState(localStorage.getItem('customerPhone') || '');
  const [showHelplineBanner, setShowHelplineBanner] = useState(false);
  const [showNoTechnicianPopup, setShowNoTechnicianPopup] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCity, setCurrentCity] = useState(localStorage.getItem('preferredCity') || 'Bangalore');
  useEffect(() => {
    const handleCityUpdate = () => setCurrentCity(localStorage.getItem('preferredCity') || 'Bangalore');
    window.addEventListener('cityUpdated', handleCityUpdate);
    return () => window.removeEventListener('cityUpdated', handleCityUpdate);
  }, []);

  const { cityUrl } = useParams<{ cityUrl?: string }>();
  const activeCity = cityUrl ? cityUrl.charAt(0).toUpperCase() + cityUrl.slice(1).toLowerCase() : currentCity;

  // SEO Update logic
  useEffect(() => {
    if (activeCity) {
      document.title = `Best Home Services in ${activeCity} | AC, Plumbing, Electrician | Sofiyan`;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', `Looking for top-rated home services in ${activeCity}? Sofiyan Home Service offers expert AC repair, plumbing, electrical, and appliance repair in ${activeCity}. Book verified professionals today.`);
      
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', `https://www.sofiyanhomeservice.com/${activeCity.toLowerCase()}`);
    }
  }, [activeCity]);
  
  // Tonnage State
  const [tonnagePrompt, setTonnagePrompt] = useState<{ sub: SubService, category: string } | null>(null);
  
  // Rate Card Modal State
  const [isRateCardModalOpen, setIsRateCardModalOpen] = useState(false);
  const [activeRateCardCategory, setActiveRateCardCategory] = useState<string | null>(null);

  // Blogs State
  const [latestBlogs, setLatestBlogs] = useState<any[]>([]);
  const blogScrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('customer_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          locationLink: '',
          date: '',
          time: '',
          lat: null as number | null,
          lng: null as number | null
        };
      } catch {
        /* ignore */
      }
    }
    return {
      name: '',
      contact: localStorage.getItem('customerPhone') || '',
      address: '',
      area: '',
      locationLink: '',
      city: currentCity,
      pincode: '',
      description: '',
      date: '',
      time: '',
      referralCode: '',
      lat: null as number | null,
      lng: null as number | null
    };
  });

  useEffect(() => {
    localStorage.setItem('sofiyan_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('sofiyan_cart_changed'));
  }, [cart]);

  useEffect(() => {
    const handleOpenProfile = () => {
      setIsProfileOpen(true);
    };
    const handleOpenCart = () => {
      if (cart.length > 0) {
        setBookingStep('form');
        setIsBookingModalOpen(true); // Open the booking/cart summary modal
      } else {
        alert("Your cart is empty. Please select a service first!");
      }
    };

    const handleGlobalCartUpdate = () => {
      const saved = localStorage.getItem('sofiyan_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    };

    window.addEventListener('sofiyan_open_profile', handleOpenProfile);
    window.addEventListener('sofiyan_open_cart', handleOpenCart);
    window.addEventListener('sofiyan_global_cart_updated', handleGlobalCartUpdate);

    return () => {
      window.removeEventListener('sofiyan_open_profile', handleOpenProfile);
      window.removeEventListener('sofiyan_open_cart', handleOpenCart);
      window.removeEventListener('sofiyan_global_cart_updated', handleGlobalCartUpdate);
    };
  }, [cart]);

  useEffect(() => {
    let hasActive = false;
    let hasAny = false;
    if (customerPhone) {
        hasAny = bookings.some(b => b.contactNumber === customerPhone);
        hasActive = bookings.some(b => b.contactNumber === customerPhone && b.status !== 'completed' && b.status !== 'cancelled');
    }
    
    if (sessionStorage.getItem('justBooked') === 'true') {
       if (hasAny && !hasActive) {
           sessionStorage.removeItem('justBooked');
           setShowHelplineBanner(false);
       } else {
           setShowHelplineBanner(true);
       }
    } else {
       setShowHelplineBanner(hasActive);
    }
  }, [bookings, customerPhone]);

  // Automatic Real-time Review Popup Trigger:
  // As soon as technician collects payment and marks service as completed,
  // this automatically triggers the Rating & Feedback modal on the customer's page.
  useEffect(() => {
    const currentCustomerPhone = normalizePhone(formData.contact || localStorage.getItem('customerPhone') || customerPhone || '');
    if (!currentCustomerPhone) return;

    // Find any completed booking belonging to this user that doesn't have a rating yet
    const unratedBooking = bookings.find(b => {
      const bPhone = normalizePhone(b.contactNumber || '');
      return bPhone === currentCustomerPhone &&
             b.status === 'completed' &&
             !b.partner_rating &&
             !dismissedReviewBookingIds.includes(b.id);
    });

    if (unratedBooking && !selectedBookingForReview) {
      setSelectedBookingForReview(unratedBooking);
      setRatingInput(5);
      setCommentInput('');
    }
  }, [bookings, customerPhone, formData.contact, dismissedReviewBookingIds, selectedBookingForReview]);

  useEffect(() => {
    const { name, contact, address, area, pincode, city, referralCode } = formData;
    localStorage.setItem('customer_profile', JSON.stringify({ name, contact, address, area, pincode, city, referralCode }));
    if (contact) {
        localStorage.setItem('customerPhone', contact);
        setCustomerPhone(contact);
    }
  }, [formData]);

  const handleCancelBooking = async (b: any) => {
    if (b.status === 'in_progress' || b.otpVerified || b.status === 'completed') {
      alert('This service is already in progress and the OTP has been verified. Cancellation is locked.');
      return;
    }
    if (confirm('Are you sure you want to cancel this booking? Cancellation charges may apply as per terms.')) {
        await updateBooking({ ...b, status: 'cancelled' } as any);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedBookingForReview) return;
    setIsSubmittingReview(true);
    try {
      const bookingToUpdate: Booking = {
        ...selectedBookingForReview,
        partner_rating: ratingInput,
        partner_comment: commentInput.trim()
      };
      
      // 1. Save to Supabase Bookings table
      await updateBooking(bookingToUpdate);
      
      // 2. Compute and persist updated technician rating & review_count to Supabase primary_partners
      if (selectedBookingForReview.assignedPartnerId) {
        const technicianId = selectedBookingForReview.assignedPartnerId;
        const technician = partners.find(p => p.id === technicianId);
        if (technician) {
          // Aggregate all bookings for this technician including this newly submitted rating
          const siblingBookings = bookings
            .map(b => b.id === bookingToUpdate.id ? bookingToUpdate : b)
            .filter(b => b.assignedPartnerId === technicianId && b.partner_rating);
          
          const totalRating = siblingBookings.reduce((sum, b) => sum + (b.partner_rating || 0), 0);
          const reviewCount = siblingBookings.length;
          const avgRating = reviewCount > 0 ? parseFloat((totalRating / reviewCount).toFixed(2)) : ratingInput;

          await useStore.getState().updatePartner({
            ...technician,
            rating: avgRating,
            review_count: reviewCount
          });
        }
      }
      
      // Record as completed & dismissed
      const updatedDismissed = [...dismissedReviewBookingIds, selectedBookingForReview.id];
      setDismissedReviewBookingIds(updatedDismissed);
      sessionStorage.setItem('dismissed_review_ids', JSON.stringify(updatedDismissed));

      // Reset states and close review modal
      setSelectedBookingForReview(null);
      setRatingInput(5);
      setCommentInput('');
      alert('🎉 Thank you for your review! Your feedback and rating have been recorded in our verified technician directory.');
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDismissReview = () => {
    if (selectedBookingForReview) {
      const updatedDismissed = [...dismissedReviewBookingIds, selectedBookingForReview.id];
      setDismissedReviewBookingIds(updatedDismissed);
      sessionStorage.setItem('dismissed_review_ids', JSON.stringify(updatedDismissed));
      setSelectedBookingForReview(null);
    }
  };

  const renderProfileModal = () => {
    if (!isProfileOpen) return null;

    const normalizedCustomerPhone = normalizePhone(formData.contact || localStorage.getItem('customerPhone') || '');
    
    // Core user specific history tracking
    const myBookings = bookings.filter(b => {
      const normalizedBookingPhone = normalizePhone(b.contactNumber || '');
      return normalizedBookingPhone && normalizedCustomerPhone && normalizedBookingPhone === normalizedCustomerPhone;
    });

    const isBookingInWarranty = (b: any) => {
      if (b.status !== 'completed') return false;
      if (!b.date) return false;
      try {
        const serviceDate = new Date(b.date);
        if (isNaN(serviceDate.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const serviceDateZero = new Date(serviceDate);
        serviceDateZero.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - serviceDateZero.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 30;
      } catch {
        return false;
      }
    };

    const getWarrantyDetails = (b: any) => {
      if (!b.date) return { active: false, daysLeft: 0, endDateStr: '' };
      try {
        const serviceDate = new Date(b.date);
        if (isNaN(serviceDate.getTime())) return { active: false, daysLeft: 0, endDateStr: '' };
        
        const endDate = new Date(serviceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const serviceDateZero = new Date(serviceDate);
        serviceDateZero.setHours(0, 0, 0, 0);
        
        const diffTime = today.getTime() - serviceDateZero.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const daysLeft = 30 - diffDays;
        
        return {
          active: daysLeft >= 0 && daysLeft <= 30,
          daysLeft: Math.max(0, daysLeft),
          endDateStr: endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        };
      } catch {
        return { active: false, daysLeft: 0, endDateStr: '' };
      }
    };

    const activeBookingsList = myBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
    const deliveredBookingsList = myBookings.filter(b => b.status === 'completed');
    const cancelledBookingsList = myBookings.filter(b => b.status === 'cancelled');
    const warrantyBookingsList = myBookings.filter(b => isBookingInWarranty(b));

    const displayedBookings = 
      bookingSubTab === 'active' ? activeBookingsList :
      bookingSubTab === 'delivered' ? deliveredBookingsList :
      bookingSubTab === 'cancelled' ? cancelledBookingsList :
      warrantyBookingsList;

    const copyToClipboard = () => {
      const code = `REF-${formData.contact ? formData.contact.slice(-4) : 'NEW'}`.toUpperCase();
      navigator.clipboard.writeText(code);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    };

    // Primary admin support phone resolvers
    const adminRawPhone = import.meta.env.VITE_ADMIN_PHONE || '8115983887';
    const formattedAdminPhone = adminRawPhone.length === 10 
      ? `+91 ${adminRawPhone.slice(0, 5)} ${adminRawPhone.slice(5)}`
      : adminRawPhone.startsWith('91') && adminRawPhone.length === 12
        ? `+91 ${adminRawPhone.slice(2, 7)} ${adminRawPhone.slice(7)}`
        : adminRawPhone;

    // Smart referral sharing template messages
    const referralCode = formData.contact ? `REF-${formData.contact.slice(-4)}`.toUpperCase() : 'NEW';
    const websiteLink = `${window.location.origin}?ref=${referralCode}`;
    const whatsappShareMessage = `Hey! I am using *Sofiyan Home Service* for booking verified & expert technicians at home (AC Repair, Electrical, Plumbing, and Cleaning). 

Use my referral code to get a flat *₹100 DISCOUNT* on your first booking!

🎁 *Your Discount Code:* ${referralCode}
🔗 *Book Service Here:* ${websiteLink}

Directly book trusted services at your doorstep. Safe & reliable!`;

    const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappShareMessage)}`;
    const whatsappAdminChatUrl = `https://api.whatsapp.com/send?phone=${adminRawPhone.replace(/\+/g, '')}&text=${encodeURIComponent('Hi Support, I need help with my booking on Sofiyan Home Service.')}`;

    // Static FAQ data
    const faqs = [
      {
        q: "What is the booking cancellation policy?",
        a: "We offer completely free cancellation up to 2 hours before your scheduled time slot. You can cancel your lead directly from the 'My Bookings' tab, or contact our customer support."
      },
      {
        q: "How are technicians verified on your platform?",
        a: "Every professional technician undergoes extensive background checks, Aadhaar identity validation, and practical skill test vetting to ensure secure, damage-free, and high-quality services."
      },
      {
        q: "Are there any hidden costs or travel charges?",
        a: "Absolutely not! The pricing displayed on the app is inclusive of taxes and convenience charges. Standard rates are fully transparently specified on the platform."
      },
      {
        q: "Is there any warranty on repair jobs?",
        a: "Yes, Sofiyan Home Service offers an assured 30-day warranty on all electrical, plumbing, and AC repair jobs. If any issue reoccurs, we will fix it completely free of charge!"
      }
    ];

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-indigo-950/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-slate-50 w-full max-w-5xl h-full sm:h-[90vh] sm:max-h-[820px] rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transform transition-all animate-scaleIn border border-indigo-100">
          
          {/* LEFT SIDEBAR / TOP BAR - Profile Header & Tab Navigation */}
          <div className="w-full md:w-80 bg-white md:bg-indigo-50/40 text-indigo-950 flex flex-col shrink-0 p-4 sm:p-5 md:p-6 border-b md:border-b-0 md:border-r border-indigo-100">
            {/* Brand Title (Desktop) */}
            <div className="items-center gap-2 mb-5 hidden md:flex">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Customer Account Center</p>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white border border-indigo-100/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 mb-3 md:mb-5 shadow-xs">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center font-black text-white text-base sm:text-lg tracking-wider shadow-sm shrink-0">
                {formData.name ? formData.name.slice(0, 2).toUpperCase() : 'CU'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-indigo-950 text-sm sm:text-base truncate leading-tight">
                  {formData.name || 'Dear Client'}
                </h3>
                <p className="text-[11px] text-indigo-600 mt-0.5 font-bold truncate">
                  {formData.contact || 'No Contact Linked'}
                </p>
                <div className="inline-flex items-center gap-1 mt-1.5 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  <ShieldCheck size={11} className="text-emerald-600" />
                  <span className="text-[8px] font-black text-indigo-700 uppercase tracking-wider">Verified Client</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid - Desktop Only */}
            <div className="grid grid-cols-2 gap-2.5 mb-5 hidden md:grid">
              <div className="bg-white border border-indigo-100/80 rounded-xl p-3 text-center shadow-xs">
                <span className="block text-xl font-black text-indigo-600 leading-none">{myBookings.length}</span>
                <span className="text-[8px] text-indigo-950/60 font-black uppercase tracking-wider block mt-1">Bookings</span>
              </div>
              <div className="bg-white border border-indigo-100/80 rounded-xl p-3 text-center shadow-xs">
                <span className="block text-xl font-black text-emerald-600 leading-none">₹{referralBalance}</span>
                <span className="text-[8px] text-indigo-950/60 font-black uppercase tracking-wider block mt-1">Discounts</span>
              </div>
            </div>

            {/* TAB SELECTION - RESPONSIVE (Horizontal scroll on mobile, Vertical stack on desktop) */}
            <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0 custom-scrollbar shrink-0 select-none">
              <button
                onClick={() => setActiveProfileTab('bookings')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 sm:py-3 rounded-xl font-extrabold transition-all whitespace-nowrap text-xs shrink-0 ${
                  activeProfileTab === 'bookings'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white md:bg-transparent text-indigo-950/80 hover:bg-indigo-100/60 border border-indigo-100 md:border-transparent'
                }`}
              >
                <ShoppingBag size={15} className={activeProfileTab === 'bookings' ? 'text-white' : 'text-indigo-600'} />
                <span>My Bookings ({myBookings.length})</span>
              </button>

              <button
                onClick={() => setActiveProfileTab('profile')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 sm:py-3 rounded-xl font-extrabold transition-all whitespace-nowrap text-xs shrink-0 ${
                  activeProfileTab === 'profile'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white md:bg-transparent text-indigo-950/80 hover:bg-indigo-100/60 border border-indigo-100 md:border-transparent'
                }`}
              >
                <UserIcon size={15} className={activeProfileTab === 'profile' ? 'text-white' : 'text-indigo-600'} />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setActiveProfileTab('referral')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 sm:py-3 rounded-xl font-extrabold transition-all whitespace-nowrap text-xs shrink-0 ${
                  activeProfileTab === 'referral'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white md:bg-transparent text-indigo-950/80 hover:bg-indigo-100/60 border border-indigo-100 md:border-transparent'
                }`}
              >
                <Gift size={15} className={activeProfileTab === 'referral' ? 'text-white' : 'text-indigo-600'} />
                <span className="flex items-center gap-1.5">
                  Referral Program
                  {referralBalance > 0 && (
                    <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full">
                      ₹{referralBalance}
                    </span>
                  )}
                </span>
              </button>

              <button
                onClick={() => setActiveProfileTab('support')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 sm:py-3 rounded-xl font-extrabold transition-all whitespace-nowrap text-xs shrink-0 ${
                  activeProfileTab === 'support'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white md:bg-transparent text-indigo-950/80 hover:bg-indigo-100/60 border border-indigo-100 md:border-transparent'
                }`}
              >
                <HelpCircle size={15} className={activeProfileTab === 'support' ? 'text-white' : 'text-indigo-600'} />
                <span>Help & Support</span>
              </button>
            </div>

            {/* Desktop-Only Footer Close Button */}
            <div className="mt-auto pt-4 border-t border-indigo-100 hidden md:block">
              <button
                onClick={() => setIsProfileOpen(false)}
                className="w-full bg-white hover:bg-indigo-50 text-indigo-950 font-bold text-xs py-3 rounded-xl uppercase tracking-wider transition-all border border-indigo-200/80 active:scale-95 shadow-2xs"
              >
                Close Dashboard
              </button>
            </div>
          </div>

          {/* RIGHT VIEW PANEL - Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* View Panel Title Header */}
            <div className="border-b border-indigo-50 px-4 sm:px-6 py-3.5 sm:py-4 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                <h2 className="text-xs sm:text-sm font-black text-indigo-950 uppercase tracking-wider">
                  {activeProfileTab === 'bookings' && "Track Orders & Booking History"}
                  {activeProfileTab === 'profile' && "Manage Personal Details"}
                  {activeProfileTab === 'referral' && "Referral Program & Wallet"}
                  {activeProfileTab === 'support' && "Regional Help Center & Support"}
                </h2>
              </div>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="p-1.5 sm:p-2 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl transition-all border border-indigo-100 active:scale-95"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Dynamic Content Frame */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 bg-slate-50/60 custom-scrollbar">
              {activeProfileTab === 'bookings' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Segmented Sub-tabs for Bookings */}
                  <div className="flex gap-1 bg-white p-1 rounded-2xl overflow-x-auto shrink-0 select-none no-scrollbar border border-indigo-100/80 shadow-xs">
                    <button
                      onClick={() => setBookingSubTab('active')}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                        bookingSubTab === 'active'
                          ? 'bg-indigo-600 text-white shadow-xs font-black'
                          : 'text-indigo-950/60 hover:text-indigo-950'
                      }`}
                    >
                      <span>Active ({activeBookingsList.length})</span>
                    </button>
                    <button
                      onClick={() => setBookingSubTab('delivered')}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                        bookingSubTab === 'delivered'
                          ? 'bg-indigo-600 text-white shadow-xs font-black'
                          : 'text-indigo-950/60 hover:text-indigo-950'
                      }`}
                    >
                      <span>Delivered ({deliveredBookingsList.length})</span>
                    </button>
                    <button
                      onClick={() => setBookingSubTab('warranty')}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                        bookingSubTab === 'warranty'
                          ? 'bg-indigo-600 text-white shadow-xs font-black'
                          : 'text-indigo-950/60 hover:text-indigo-950'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        Warranty ({warrantyBookingsList.length})
                      </span>
                    </button>
                    <button
                      onClick={() => setBookingSubTab('cancelled')}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                        bookingSubTab === 'cancelled'
                          ? 'bg-indigo-600 text-white shadow-xs font-black'
                          : 'text-indigo-950/60 hover:text-indigo-950'
                      }`}
                    >
                      <span>Cancelled ({cancelledBookingsList.length})</span>
                    </button>
                  </div>

                  {displayedBookings.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-indigo-100/80 shadow-xs p-6 animate-scaleIn">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                        <ShoppingBag className="h-7 w-7 text-indigo-600" />
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-indigo-950">
                        {bookingSubTab === 'active' && "No active bookings yet"}
                        {bookingSubTab === 'delivered' && "No delivered leads yet"}
                        {bookingSubTab === 'warranty' && "No active warranties"}
                        {bookingSubTab === 'cancelled' && "No cancelled leads"}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed font-semibold">
                        {bookingSubTab === 'active' && "Securely log and manage your ongoing AC repair, plumbing, or electrical bookings right here."}
                        {bookingSubTab === 'delivered' && "Once your assigned service partner marks the job completed, it will appear here instantly."}
                        {bookingSubTab === 'warranty' && "All completed services are covered under a 30-day premium regional warranty protocol."}
                        {bookingSubTab === 'cancelled' && "Records of leads you or the support desk cancelled will be maintained here safely."}
                      </p>
                      {bookingSubTab === 'active' && (
                        <button
                          onClick={() => setIsProfileOpen(false)}
                          className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-3 rounded-xl uppercase tracking-wider transition-all shadow-sm active:scale-95"
                        >
                          Book a Service Now
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {displayedBookings.map(b => {
                        const assignedPartner = b.assignedPartnerId ? partners.find(p => p.id === b.assignedPartnerId) : null;
                        const hasPartner = !!b.assignedPartnerId;
                        const wDetails = getWarrantyDetails(b);

                        return (
                          <div
                            key={b.id}
                            className="bg-white rounded-2xl border border-indigo-100/90 shadow-xs relative overflow-hidden transition-all hover:shadow-sm animate-scaleIn p-4 sm:p-5"
                          >
                            {/* Booking Header */}
                            <div className="flex justify-between items-start gap-3 flex-wrap sm:flex-nowrap">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[9px] font-black text-indigo-950 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    ID: {b.id.split('-')[0].toUpperCase()}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-bold">
                                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Today'}
                                  </span>
                                </div>
                                <h4 className="font-black text-indigo-950 mt-1.5 text-sm sm:text-base">{b.serviceCategory}</h4>
                                <p className="text-xs text-slate-500 mt-0.5 font-semibold leading-relaxed">{b.subServiceName}</p>
                              </div>

                              <span
                                className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0 ${
                                  b.status === 'pending' || b.status === 'accepted' || b.status === 'Forwarded'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : b.status === 'in_progress'
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse'
                                    : b.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {b.status === 'pending' ? 'FINDING TECHNICIAN' : b.status === 'accepted' ? 'TECHNICIAN ASSIGNED' : b.status === 'in_progress' ? 'WORK IN PROGRESS' : b.status.toUpperCase()}
                              </span>
                            </div>

                            {/* Date, Time Slot & Total Billing */}
                            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 bg-indigo-50/40 border border-indigo-100/50 p-3 rounded-xl mt-3.5 text-xs font-semibold">
                              <div className="flex items-center gap-2 text-indigo-950">
                                <Calendar size={14} className="text-indigo-600 shrink-0" />
                                <span>{b.date} • {b.time}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-500 font-medium">Amount:</span>
                                <span className="text-indigo-950 font-black text-sm">₹{b.price}</span>
                              </div>
                            </div>

                            {/* Warranty Details Block (for Completed & Warranty Tabs) */}
                            {b.status === 'completed' && (
                              <div className={`mt-3.5 rounded-xl p-3.5 border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                                wDetails.active 
                                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <ShieldCheck size={16} className={wDetails.active ? "text-emerald-600" : "text-slate-400"} />
                                    <span className="font-extrabold text-xs text-indigo-950">
                                      {wDetails.active ? '30-Day Active Warranty' : 'Warranty Expired'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-bold mt-0.5 leading-none">
                                    {wDetails.active 
                                      ? `Coverage active until ${wDetails.endDateStr} (${wDetails.daysLeft} days left)` 
                                      : 'Standard 30-day protection window has closed'
                                    }
                                  </p>
                                </div>
                                {wDetails.active && (
                                  <a
                                    href={`https://api.whatsapp.com/send?phone=${adminRawPhone.replace(/\+/g, '')}&text=${encodeURIComponent(`Hi support! I want to raise a warranty service claim for Booking ID: ${b.id.split('-')[0].toUpperCase()} of ${b.serviceCategory}.`)}`}
                                    target="_blank"
                                    referrerPolicy="no-referrer"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] px-3.5 py-2 rounded-lg transition-all uppercase tracking-wider flex items-center gap-1.5 active:scale-95"
                                  >
                                    <span>Raise Claim</span>
                                  </a>
                                )}
                              </div>
                            )}

                            {/* VERIFIED TECHNICIAN ASSIGNED BLOCK */}
                            {b.status !== 'cancelled' && (
                              hasPartner ? (
                                <div className="mt-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5">
                                  <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                                    <div 
                                      className="flex items-center gap-3 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all min-w-0"
                                      onClick={() => assignedPartner && setSelectedTechnicianForProfile(assignedPartner)}
                                      title="Click to view Technician Profile"
                                    >
                                      {/* Technician Profile Bubble */}
                                      <div className="relative shrink-0">
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-indigo-600 border-2 border-white shadow-xs rounded-xl flex items-center justify-center font-black text-white uppercase text-sm">
                                          {b.assignedPartnerName ? b.assignedPartnerName.slice(0, 2) : "P"}
                                        </div>
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                                      </div>

                                      {/* Technician Professional Info */}
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <p className="font-extrabold text-indigo-950 text-xs sm:text-sm leading-tight truncate">
                                            {b.assignedPartnerName}
                                          </p>
                                          <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                            <ShieldCheck size={8} /> Verified
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-1">
                                          <div className="flex items-center gap-0.5 text-amber-500 font-black text-xs">
                                            <Star size={11} className="fill-amber-500 text-amber-500" />
                                            <span>{assignedPartner?.rating ? Number(assignedPartner.rating).toFixed(1) : "4.8"}</span>
                                          </div>
                                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                          <p className="text-[10px] text-slate-500 font-bold">{assignedPartner?.review_count || 0} Reviews</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Dial Call Button */}
                                    {b.status !== 'completed' && (
                                      <a
                                        href={`tel:${b.assignedPartnerPhone || '96029763'}`}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xs w-full sm:w-auto"
                                      >
                                        <Phone size={12} />
                                        <span>Call Partner</span>
                                      </a>
                                    )}
                                  </div>

                                  {/* Rating / Review Block */}
                                  {b.status === 'completed' && (
                                    <div className="mt-3 pt-3 border-t border-indigo-100">
                                      {b.partner_rating ? (
                                        <div className="bg-white p-3 rounded-xl border border-indigo-50 shadow-xs space-y-2">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider">Your Rating:</span>
                                              <span className="text-xs font-black text-amber-500">{b.partner_rating} ★</span>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                              {[1, 2, 3, 4, 5].map((star) => (
                                                <Star 
                                                  key={star} 
                                                  size={13} 
                                                  className={star <= (b.partner_rating || 0) ? "fill-amber-400 text-amber-400 shrink-0" : "text-slate-200 shrink-0"} 
                                                />
                                              ))}
                                            </div>
                                          </div>
                                          {b.partner_comment && (
                                            <p className="text-xs text-slate-700 font-medium italic bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                                              "{b.partner_comment}"
                                            </p>
                                          )}
                                          {assignedPartner && (
                                            <button
                                              type="button"
                                              onClick={() => setSelectedTechnicianForProfile(assignedPartner)}
                                              className="w-full text-[10px] font-bold text-indigo-600 hover:text-indigo-800 text-center py-1 flex items-center justify-center gap-1 transition-colors"
                                            >
                                              <span>View Technician Full Profile & All Reviews</span>
                                              <ChevronRight size={12} />
                                            </button>
                                          )}
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setSelectedBookingForReview(b);
                                            setRatingInput(5);
                                            setCommentInput('');
                                          }}
                                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm animate-pulse"
                                        >
                                          <Star size={14} className="fill-white text-white shrink-0" />
                                          <span>⭐ Rate Technician & Leave Feedback</span>
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                b.status !== 'completed' && (
                                  <div className="mt-3 bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                                      <Loader2 size={14} className="text-amber-600 animate-spin" />
                                    </div>
                                    <div>
                                      <h5 className="font-extrabold text-amber-900 text-xs">Matching with nearby technician...</h5>
                                      <p className="text-[10px] text-amber-700 mt-0.5 font-medium">Please wait. A regional professional is reviewing your request.</p>
                                    </div>
                                  </div>
                                )
                              )
                            )}

                            {/* OTP & Cancellation Protocol */}
                            <div className="flex gap-2.5 mt-3 pt-3 border-t border-indigo-50 flex-wrap sm:flex-nowrap">
                              {b.otp && (b.status === 'pending' || b.status === 'accepted' || b.status === 'Forwarded') && !b.otpVerified && (
                                <div className="flex-1 bg-indigo-50/70 border border-indigo-100 rounded-xl p-2.5 text-center flex flex-col justify-center min-w-[120px]">
                                  <p className="text-[8px] font-black text-indigo-900 uppercase tracking-wider leading-none mb-1">
                                    Start Service OTP
                                  </p>
                                  <p className="text-base font-black text-indigo-950 tracking-widest leading-none">
                                    {b.otp}
                                  </p>
                                  <p className="text-[8px] text-indigo-500 font-semibold mt-1">Share with technician at doorstep</p>
                                </div>
                              )}
                              {(b.status === 'pending' || b.status === 'accepted' || b.status === 'Forwarded') && !b.otpVerified && (
                                <button
                                  onClick={() => handleCancelBooking(b)}
                                  className="flex-1 text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all py-3 uppercase tracking-wider border border-rose-200/40 active:scale-95"
                                >
                                  Cancel Service Lead
                                </button>
                              )}
                              {(b.status === 'in_progress' || b.otpVerified) && (
                                <div className="w-full bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-2.5">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                                      <CheckCircle size={15} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-extrabold text-emerald-950 leading-tight">Service In Progress</p>
                                      <p className="text-[10px] text-emerald-700 font-medium truncate mt-0.5">
                                        OTP Verified • Technician started work (Cancellation locked)
                                      </p>
                                    </div>
                                  </div>
                                  <span className="shrink-0 text-[8px] font-black uppercase tracking-wider bg-emerald-200/80 text-emerald-900 px-2 py-1 rounded-md">
                                    OTP Verified
                                  </span>
                                </div>
                              )}
                              {b.status === 'cancelled' && (
                                <button
                                  onClick={() => {
                                    if (b.serviceCategory && b.serviceCategory !== 'Multiple Services') {
                                      const match = SERVICES.find(s => s.name === b.serviceCategory);
                                      if (match && match.subServices.length > 0) {
                                        addToCart(match.subServices[0], b.serviceCategory);
                                        setIsProfileOpen(false);
                                        window.dispatchEvent(new Event('sofiyan_open_side_cart'));
                                      } else {
                                        setIsProfileOpen(false);
                                      }
                                    } else {
                                      setIsProfileOpen(false);
                                    }
                                  }}
                                  className="flex-1 text-xs font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all py-3 uppercase tracking-wider active:scale-95 text-center border border-indigo-100"
                                >
                                  Rebook Service
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeProfileTab === 'profile' && (
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-indigo-100 shadow-xs space-y-5">
                  <div className="flex items-center gap-3 border-b border-indigo-50 pb-3.5">
                    <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                      <UserIcon size={16} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-indigo-950 text-sm">Personal Credentials</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Your profile updates are saved locally and dynamically synced</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Full Identity Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData((p: any) => ({ ...p, name: e.target.value }))}
                        className="w-full bg-slate-50/80 border border-indigo-100 rounded-xl px-3.5 py-2.5 font-bold text-indigo-950 outline-none focus:border-indigo-600 focus:bg-white transition-all text-xs sm:text-sm"
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Secure Contact Phone</label>
                      <input
                        type="text"
                        value={formData.contact}
                        onChange={e => setFormData((p: any) => ({ ...p, contact: e.target.value }))}
                        className="w-full bg-slate-50/80 border border-indigo-100 rounded-xl px-3.5 py-2.5 font-bold text-indigo-950 outline-none focus:border-indigo-600 focus:bg-white transition-all text-xs sm:text-sm"
                        placeholder="Your Mobile Number"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Street Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={e => setFormData((p: any) => ({ ...p, address: e.target.value }))}
                        className="w-full bg-slate-50/80 border border-indigo-100 rounded-xl px-3.5 py-2.5 font-bold text-indigo-950 outline-none focus:border-indigo-600 focus:bg-white transition-all text-xs sm:text-sm"
                        placeholder="Apartment, Street No., Area"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Target City</label>
                      <input
                        type="text"
                        value={formData.city}
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-500 outline-none text-xs sm:text-sm cursor-not-allowed"
                        placeholder="Target City"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Area Pincode</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={e => setFormData((p: any) => ({ ...p, pincode: e.target.value }))}
                        className="w-full bg-slate-50/80 border border-indigo-100 rounded-xl px-3.5 py-2.5 font-bold text-indigo-950 outline-none focus:border-indigo-600 focus:bg-white transition-all text-xs sm:text-sm"
                        placeholder="E.g. 560001"
                      />
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-2xl flex items-center gap-2.5 text-emerald-900 text-xs font-semibold">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>Your details are securely registered and linked to all your bookings.</span>
                  </div>
                </div>
              )}

              {activeProfileTab === 'referral' && (
                <div className="space-y-4">
                  {/* Referral Program Banner */}
                  <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-5 sm:p-6 rounded-2xl shadow-md relative overflow-hidden text-white border border-indigo-500/30">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center mb-3.5 shadow-inner">
                      <Gift size={20} className="text-amber-300" />
                    </div>

                    <h3 className="text-base sm:text-lg font-black uppercase tracking-wide mb-1.5 relative z-10">Refer & Earn Program</h3>
                    <p className="text-indigo-100 text-xs mb-5 relative z-10 leading-relaxed font-medium max-w-md">
                      Invite friends to try Sofiyan Home Service! They get flat <span className="text-white font-black">₹100 DISCOUNT</span> on their first booking, and you receive <span className="text-amber-300 font-black">₹100 DISCOUNT</span> credited to your account!
                    </p>

                    {/* Code Container */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between items-center relative z-10 gap-3">
                      <div>
                        <p className="text-[8px] uppercase font-black text-indigo-200 tracking-wider mb-0.5">Your Referral Code</p>
                        <span className="text-xl font-black tracking-widest text-white block">
                          {referralCode}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={copyToClipboard}
                          className="flex-1 sm:flex-initial text-xs font-black bg-white hover:bg-indigo-50 text-indigo-950 px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Copy size={13} />
                          <span>{copiedReferral ? 'Copied!' : 'Copy Code'}</span>
                        </button>

                        <a
                          href={whatsappShareUrl}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="flex-1 sm:flex-initial text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Navigation size={13} className="rotate-45" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Successful Referrals Tracker */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-100 shadow-xs">
                    <div className="flex items-center justify-between border-b border-indigo-50 pb-3 mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="text-emerald-600" size={18} />
                        <div>
                          <h4 className="font-extrabold text-indigo-950 text-sm">Successful Referrals</h4>
                          <p className="text-[10px] text-slate-500 font-medium">Monitor your invite earnings</p>
                        </div>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border border-emerald-200">
                        Total Earned: ₹{referralBalance}
                      </span>
                    </div>

                    {successfulReferrals.length === 0 ? (
                      <div className="text-center py-6 text-slate-400">
                        <Gift size={24} className="mx-auto text-slate-300 mb-1.5" />
                        <p className="text-xs font-bold text-slate-600">No successful referrals yet</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Earn ₹100 discount for every friend who completes a booking!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-indigo-50">
                        {successfulReferrals.map((r, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center font-black text-xs shrink-0">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="font-bold text-indigo-950 text-xs">
                                  {r.customerName || `Client ${idx + 1}`}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                  {r.serviceCategory} • {r.date}
                                </p>
                              </div>
                            </div>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                              ₹100 Unlocked
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeProfileTab === 'support' && (
                <div className="space-y-4">
                  {/* Regional Support Center Dial */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-indigo-100 shadow-xs text-center">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 border border-indigo-100">
                      <Phone size={20} />
                    </div>
                    <h4 className="font-black text-indigo-950 text-base">Sofiyan Regional Support Center</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed font-medium">
                      Need help rescheduling, requesting a custom quote, or raising a complaint? Get connected directly with our team.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2.5 justify-center mt-5">
                      <a
                        href={`tel:${adminRawPhone}`}
                        className="inline-flex bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 px-5 rounded-xl items-center justify-center gap-2 transition-all shadow-xs active:scale-95 w-full sm:w-auto"
                      >
                        <Phone size={13} />
                        <span>Call helpline: {formattedAdminPhone}</span>
                      </a>
                      
                      <a
                        href={whatsappAdminChatUrl}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="inline-flex bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-3 px-5 rounded-xl items-center justify-center gap-2 transition-all shadow-xs active:scale-95 w-full sm:w-auto"
                      >
                        <Navigation size={13} className="rotate-45" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Accordion FAQ Component Section */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-100 shadow-xs">
                    <h4 className="font-extrabold text-indigo-950 text-sm mb-3 border-b border-indigo-50 pb-2.5">Frequently Asked Questions</h4>
                    
                    <div className="space-y-2">
                      {faqs.map((faq, idx) => {
                        const isOpen = openFaqIndex === idx;
                        return (
                          <div 
                            key={idx} 
                            className="border border-indigo-50 rounded-xl overflow-hidden bg-slate-50/40"
                          >
                            <button
                              onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                              className="w-full text-left p-3 flex justify-between items-center gap-3 font-bold text-xs text-indigo-950 hover:bg-indigo-50/40 transition-colors"
                            >
                              <span>{faq.q}</span>
                              <ChevronRight 
                                size={14} 
                                className={`text-indigo-400 transition-transform shrink-0 ${isOpen ? 'rotate-90' : ''}`} 
                              />
                            </button>
                            
                            {isOpen && (
                              <div className="p-3 pt-0 bg-white text-xs text-slate-600 leading-relaxed font-medium">
                                {faq.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Safety & Quality Badging */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-xs flex items-start gap-3">
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-indigo-950 text-xs">Verified Professionals</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-medium">
                          Every assigned service technician undergoes background and skill verification.
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-xs flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                        <Clock size={18} />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-indigo-950 text-xs">Rescheduling Flexibility</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-medium">
                          Change your booking date or preferred slot up to 2 hours before the service begins.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [isDetectingPincode, setIsDetectingPincode] = useState(false);
  const [isFetchingAreaPincode, setIsFetchingAreaPincode] = useState(false);

  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  // Sync city when localStorage changes (handled globally by Layout, but sync local formData)
  useEffect(() => {
    const handleCitySync = () => {
      const city = localStorage.getItem('preferredCity') || '';
      setFormData((prev: any) => ({ ...prev, city }));
    };
    window.addEventListener('cityUpdated', handleCitySync);
    return () => window.removeEventListener('cityUpdated', handleCitySync);
  }, []);

  const handleTrackLocation = async () => {
    if (!navigator.geolocation) {
      alert("Location tracking is not supported by your browser.");
      return;
    }
    
    try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        if (permissionStatus.state === 'denied') {
            alert("Location access is currently blocked. Please tap the lock icon in your address bar and allow location access.");
            return;
        }
    } catch {
        console.warn("Permissions API not supported, continuing to native request");
    }

    setIsTrackingLocation(true);
    
    const fallbackTimeout = setTimeout(() => {
        setIsTrackingLocation(false);
        alert("Location request timed out. Please check your signal or enter address manually.");
    }, 15000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(fallbackTimeout);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        await handleConfirmMapLocation(lat, lng);
      },
      (error) => {
        clearTimeout(fallbackTimeout);
        console.error("Error getting location:", error);
        setIsTrackingLocation(false);
        let errorMessage = "Unable to fetch exact location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission was denied. Please allow location access in your browser settings to use Auto-detect.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please check if your device's GPS is enabled.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again in a moment.";
            break;
        }
        alert(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 14000, maximumAge: 0 }
    );
  };

  const handleConfirmMapLocation = async (lat: number, lng: number) => {
    setIsMapPickerOpen(false);
    setIsTrackingLocation(true);
    
    const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
    
    let newPincode = formData.pincode;
    let newArea = formData.area;
    let newCity = formData.city;
    let newAddress = formData.address;

    try {
       const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
          headers: { 'User-Agent': 'sofiyan-home-service/1.0.0' }
       });
       const data = await res.json();
       
       if (data && data.address) {
          const addr = data.address;
          
          if (data.display_name) {
              newAddress = data.display_name;
          }

          if (addr.postcode) {
              newPincode = addr.postcode;
          } else {
              const match = (data.display_name || '').match(/\b\d{6}\b/);
              if (match) newPincode = match[0];
          }

          if (newPincode && newPincode.length === 6) {
              const areaRes = await fetchAreasByPincode(newPincode);
              if (areaRes.success && areaRes.areas.length > 0) {
                  newArea = areaRes.areas[0];
                  let detectedCity = newCity;
                  if (areaRes.isBangalore) {
                      detectedCity = 'Bangalore';
                  } else if (newPincode.startsWith('110')) {
                      detectedCity = 'Delhi';
                  } else if (data.address && data.address.city) {
                      detectedCity = data.address.city;
                  } else if (data.address && data.address.state_district) {
                      detectedCity = data.address.state_district;
                  }

                  // Smart validation: if the selected city doesn't match the detected one
                  if (detectedCity && newCity) {
                      // Normalize for comparison
                      const normalizedDetected = detectedCity.toLowerCase();
                      const normalizedSelected = newCity.toLowerCase();
                      
                      if (!normalizedDetected.includes(normalizedSelected) && !normalizedSelected.includes(normalizedDetected)) {
                          alert(`Smart Location Update: We detected your location is in ${detectedCity}, but you selected ${newCity}. We have automatically updated your city to ${detectedCity} for accurate service assignment.`);
                          newCity = detectedCity;
                          localStorage.setItem('preferredCity', newCity);
                          window.dispatchEvent(new Event('cityUpdated'));
                      }
                  } else if (detectedCity) {
                      newCity = detectedCity;
                  }
              }
          } else if (addr.suburb || addr.neighbourhood || addr.residential) {
              const areaName = addr.suburb || addr.neighbourhood || addr.residential;
              newArea = areaName;
              const pins = await fetchPincodesByArea([areaName]);
              if (pins && pins.length > 0) {
                  newPincode = pins[0];
                  let detectedCity = newCity;
                  if (newPincode.startsWith('560')) detectedCity = 'Bangalore';
                  else if (newPincode.startsWith('110')) detectedCity = 'Delhi';
                  else if (data.address && data.address.city) detectedCity = data.address.city;
                  
                  // Smart validation
                  if (detectedCity && newCity) {
                      const normalizedDetected = detectedCity.toLowerCase();
                      const normalizedSelected = newCity.toLowerCase();
                      
                      if (!normalizedDetected.includes(normalizedSelected) && !normalizedSelected.includes(normalizedDetected)) {
                          alert(`Smart Location Update: We detected your location is in ${detectedCity}, but you selected ${newCity}. We have automatically updated your city to ${detectedCity}.`);
                          newCity = detectedCity;
                          localStorage.setItem('preferredCity', newCity);
                          window.dispatchEvent(new Event('cityUpdated'));
                      }
                  } else if (detectedCity) {
                      newCity = detectedCity;
                  }
              }
          }
       }
    } catch (err) {
       console.warn("Reverse geocoding failed", err);
    }

    setFormData((prev: any) => ({
      ...prev,
      lat,
      lng,
      locationLink: googleMapsLink,
      pincode: newPincode || prev.pincode,
      area: newArea || prev.area,
      city: newCity || prev.city,
      address: newAddress || prev.address
    }));
    setIsTrackingLocation(false);
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
          const resolved = await Promise.all(
            data.map(async (b) => {
              if (b.image_url) {
                const signed = await getSignedAppFileUrl(b.image_url);
                return { ...b, displayImageUrl: signed || b.image_url };
              }
              return { ...b, displayImageUrl: null };
            })
          );
          setLatestBlogs(resolved);
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
        setFormData((prev: any) => ({ ...prev, city: city }));
      }
    }
    
    const handleLocationUpdate = () => {
      const savedLocation = sessionStorage.getItem('userLocation');
      if (savedLocation) {
        const city = savedLocation.split(',')[0].trim();
        setFormData((prev: any) => ({ ...prev, city: city }));
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

  // Advanced Referral Calculations
  const normalizePhone = (phoneStr: string) => {
    if (!phoneStr) return '';
    return phoneStr.replace(/\D/g, '').slice(-10);
  };

  const currentReferralCode = useMemo(() => {
    return formData.contact ? `REF-${formData.contact.slice(-4)}`.toUpperCase() : '';
  }, [formData.contact]);

  const successfulReferrals = useMemo(() => {
    if (!currentReferralCode) return [];
    // Find bookings where b.appliedReferralCode is our referral code, excluding self-referral
    return bookings.filter(b => 
      b.appliedReferralCode && 
      b.appliedReferralCode.toUpperCase() === currentReferralCode &&
      normalizePhone(b.contactNumber || '') !== normalizePhone(formData.contact || '')
    );
  }, [bookings, currentReferralCode, formData.contact]);

  const referralBalance = useMemo(() => {
    return successfulReferrals.length * 100;
  }, [successfulReferrals]);

  // Pricing calculations incorporating both flat ₹100 referral coupons and referral wallet discounts
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.startsWith('REF-')) {
      return Math.min(100, cartTotal); // flat ₹100 discount for using a friend's referral code
    }
    const rate = validCoupons[appliedCoupon];
    return rate ? Math.round((cartTotal * rate) / 100) : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedCoupon, cartTotal]);

  const referralDiscount = useReferralBalance ? Math.min(referralBalance, cartTotal - discountAmount) : 0;
  const finalTotal = cartTotal - discountAmount - referralDiscount;

  const handleApplyCoupon = (codeToApply?: string) => {
      const code = (codeToApply || couponCode).trim().toUpperCase();
      if (!code) return;

      if (code.startsWith('REF-')) {
          setAppliedCoupon(code);
          setCouponCode(code);
          setFormData((prev: any) => ({ ...prev, referralCode: code }));
          setCouponMessage({ text: "🎉 Referral code applied! You get flat ₹100 off on this booking!", type: 'success' });
      } else if (validCoupons[code]) {
          setAppliedCoupon(code);
          setCouponCode(code);
          setFormData((prev: any) => ({ ...prev, referralCode: code }));
          const discount = Math.round((cartTotal * validCoupons[code]) / 100);
          setCouponMessage({ text: `🎉 Yay! Coupon applied. You saved ₹${discount}!`, type: 'success' });
      } else {
          // If not a valid discount code or referral code, we still treat it as a referral code
          setAppliedCoupon(code);
          setCouponCode(code);
          setFormData((prev: any) => ({ ...prev, referralCode: code }));
          setCouponMessage({ text: "✅ Code applied successfully!", type: 'success' });
      }
  };

  const removeCoupon = () => {
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponMessage(null);
      setFormData((prev: any) => ({ ...prev, referralCode: '' }));
  };

  // URL Query Parameter Listener for smart auto-applied referrals
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setCouponCode(refCode.toUpperCase());
      handleApplyCoupon(refCode.toUpperCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const handleBookService = (sub: SubService) => {
    if (sub.name === "Gas Leak Fix and Refilling") {
        setTonnagePrompt({ sub, category: selectedService?.name || 'AC' });
        return;
    }
    addToCart(sub, selectedService?.name || 'General');
    // We don't open modal immediately anymore, we add to cart
  };

  // 3. Handle Direct Booking from Search Dropdown
  const handleDirectBooking = (item: typeof allSubServices[0]) => {
    if (item.name === "Gas Leak Fix and Refilling") {
        setTonnagePrompt({ sub: { id: item.id, name: item.name, price: item.price }, category: item.categoryName });
        return;
    }
    addToCart(item, item.categoryName);
    window.dispatchEvent(new Event('sofiyan_open_side_cart'));
    setSearchQuery(''); 
  };
  
  // 4. Handle Direct Booking from Featured Section
  const handleFeaturedBooking = (name: string, price: number) => {
    if (name === "Gas Leak Fix and Refilling") {
        setTonnagePrompt({ sub: { id: `featured-${Date.now()}`, name, price }, category: "AC" });
        return;
    }
    const subService: SubService = {
          id: `featured-${Date.now()}`,
          name: name,
          price: price
      };
      addToCart(subService, "Featured Service");
      window.dispatchEvent(new Event('sofiyan_open_side_cart'));
  };

  const onTonnageSelect = (ton: string, price: number) => {
    if (tonnagePrompt) {
        const sub = {
            ...tonnagePrompt.sub,
            name: `${tonnagePrompt.sub.name} (${ton})`,
            price: price
        };
        addToCart(sub, tonnagePrompt.category);
        setTonnagePrompt(null);
        window.dispatchEvent(new Event('sofiyan_open_side_cart'));
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
        setFormData((prev: any) => ({ ...prev, date: '', time: '' }));
        setAvailableTimeSlots([]);
    }
  }, [isBookingModalOpen]);

  useEffect(() => {
    const fetchAreaByPin = async () => {
      if (formData.pincode && formData.pincode.length === 6 && !isNaN(Number(formData.pincode))) {
        setIsFetchingAreaPincode(true);
        try {
          const areaRes = await fetchAreasByPincode(formData.pincode);
          if (areaRes.success && areaRes.areas.length > 0) {
             setFormData((prev: any) => ({
               ...prev,
               area: areaRes.areas[0],
               city: areaRes.isBangalore ? 'Bangalore' : (formData.pincode.startsWith('110') ? 'Delhi' : prev.city)
             }));
          }
        } catch {
          console.warn("Could not fetch area from pin",);
        } finally {
          setIsFetchingAreaPincode(false);
        }
      }
    };
    
    // Only run if area is empty or user is currently typing the pincode and completes it
    const timer = setTimeout(() => {
        fetchAreaByPin();
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.pincode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));

    if (name === 'date') {
        updateAvailableTimeSlots(value);
        setFormData((prev: any) => ({ ...prev, time: '' }));
    }
  };


  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    // Validate Location
    const hasLocationLink = formData.locationLink.trim() !== '';
    const hasFullAddress = formData.address.trim() !== '' && formData.city.trim() !== '' && formData.area.trim() !== '' && formData.pincode.trim() !== '';

    if (!hasLocationLink && !hasFullAddress) {
      if (!formData.city.trim()) {
        alert("Please select your City OR paste a Google Maps Location Link.");
      } else if (!formData.address.trim()) {
        alert("Please provide your full address (flat/house no) OR paste a Google Maps Location Link.");
      } else if (!formData.area.trim()) {
        alert("Please select your Area/Locality OR paste a Google Maps Location Link.");
      } else if (!formData.pincode.trim()) {
        alert("Please enter your Pincode OR paste a Location Link.");
      }
      return;
    }

    if (!formData.time) {
      alert("Please select a time slot!");
      return;
    }

    setBookingStep('loading');

    // Auto-resolve Lat/Lng if not provided via MapPicker
    let finalLat = formData.lat;
    let finalLng = formData.lng;
    if (!finalLat || !finalLng) {
      try {
        const query = `${formData.address}, ${formData.area}, ${formData.city}, ${formData.pincode}`.trim();
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          finalLat = parseFloat(data[0].lat);
          finalLng = parseFloat(data[0].lon);
          // Update the local state so the NearbyTechniciansBlock gets the resolved coordinates
          setFormData(prev => ({ ...prev, lat: finalLat, lng: finalLng }));
        }
      } catch (err) {
        console.warn("Auto-geocoding failed:", err);
      }
    }

    try {
      const subServiceName = cart.map(i => `${i.name} (x${i.quantity})`).join(', ');
      const categoryName = cart.length === 1 ? cart[0].categoryName : 'Multiple Services';
      setLastBookedCategory(categoryName);

      // 1. Upsert Customer and Save Local Profile Details
      let customerId = null;
      try {
        // Explicitly persist contact & name details to ensure first-time bookings are recorded in local profile section immediately
        localStorage.setItem('customerPhone', formData.contact);
        localStorage.setItem('customer_profile', JSON.stringify({
          name: formData.name,
          contact: formData.contact,
          address: formData.address,
          area: formData.area,
          pincode: formData.pincode,
          city: formData.city,
          referralCode: formData.referralCode
        }));
        setCustomerPhone(formData.contact);

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
      } catch {
        console.warn("Could not save to customers table, proceeding with booking anyway.",);
      }

      // 2. Insert Booking Data
      let bookingError;
      
      try {
        // Group items by category
        const groupedCart = cart.reduce((acc, item) => {
          const category = item.categoryName || 'General';
          if (!acc[category]) acc[category] = [];
          acc[category].push(item);
          return acc;
        }, {} as Record<string, typeof cart>);

        for (const [category, items] of Object.entries(groupedCart)) {
          let insertSuccess = false;
          let result;
          let trackingId = '';
          let customUuid = '';
          const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
          
          // Try up to 3 times to avoid UUID collisions for our custom 4-digit ID
          for (let attempt = 0; attempt < 3; attempt++) {
              trackingId = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digits
              customUuid = `b0000000-0000-4000-8000-00000000${trackingId}`;
              
              result = await supabase
                .from('bookings')
                .insert([
                  {
                    id: customUuid,
                    customer_id: customerId,
                    customer_name: formData.name,
                    contact_number: formData.contact,
                    address: formData.address,
                    area: formData.area,
                    city: formData.city,
                    pin_code: formData.pincode,
                    cart_items: items.map((item, index) => index === 0 ? { ...item, system_otp: generatedOtp } : item),
                    price: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                    date: formData.date,
                    time: formData.time,
                    status: 'pending',
                    // Additional fields for admin tracking
                    service_category: category,
                    sub_service_name: items.map(i => `${i.name} (x${i.quantity})`).join(', '),
                    location_link: formData.locationLink,
                    lat: finalLat,
                    lng: finalLng,
                    discount_amount: 0, // Simplified for now as splitting discounts is complex
                    applied_referral_code: formData.referralCode ? formData.referralCode.toUpperCase() : null,
                  }
                ]).select('id').single();
                
              bookingError = result.error;
              if (!bookingError) {
                  insertSuccess = true;
                  break;
              } else if (bookingError.code !== '23505') { // If not a unique constraint violation, stop trying
                  break;
              }
          }

          if (insertSuccess && result && result.data) {
            setCompletedBookingId(prev => prev ? `${prev}, ${trackingId}` : trackingId);
            setBookingOtp(generatedOtp);
          }
        }
      } catch (err) {
        bookingError = err;
      }

      if (bookingError) {
         console.warn("Could not save booking to Supabase, continuing locally:", bookingError);
      }

            // Determine if there are nearby technicians
      const calculateDistance = (lat1?: number | null, lon1?: number | null, lat2?: number | null, lon2?: number | null): number => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
        return R * c;
      };

      const hasNearbyTechnician = partners.some(p => {
        if (p.status === 'blocked' || p.status === 'pending') return false;
        if (!p.categories?.includes(categoryName)) return false;
        if (formData.lat && formData.lng) {
          return calculateDistance(formData.lat, formData.lng, p.lat, p.lng) <= 10;
        } else {
          return p.city?.toLowerCase() === formData.city?.toLowerCase();
        }
      });

      if (!hasNearbyTechnician) {
        setShowNoTechnicianPopup(true);
        setShowHelplineBanner(true);

        // Forward to WhatsApp
        try {
          const templateMsg = `🆕 NEW ONLINE BOOKING (NO NEARBY TECH)\n` +
            `───────────────────\n` +
            `👤 Customer Info:\n` +
            `Name: ${formData.name}\n` +
            `Phone: ${formData.contact}\n\n` +
            `🛠️ Service Details:\n` +
            `Category: ${categoryName}\n` +
            `Items: ${subServiceName}\n` +
            `Total Amount: ₹${finalTotal}\n\n` +
            `📍 Address:\n` +
            `City: ${formData.city} -\n` +
            `Detail: ${formData.address}\n` +
            (formData.locationLink ? `🔗 Location: ${formData.locationLink}\n` : '') +
            `\n⏰ Schedule:\n` +
            `Date: ${formData.date}\n` +
            `Time: ${formData.time}\n` +
            `───────────────────\n` +
            `⚠️ NO TECHNICIANS IN 10KM RADIUS!\n` +
            `Sent via Sofiyan Home Service App`;
  
          // 1. Automatic send to admin via Server API
          const adminPhone = ((import.meta as any).env.VITE_ADMIN_PHONE || '8115983887').replace(/\+/g, '');
          
          fetch('/api/send-whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              number: adminPhone,
              message: templateMsg
            })
          }).catch(err => console.error("Auto WhatsApp Error:", err));
        } catch {
          console.warn("WhatsApp logic failed");
        }
      }

      // Success UI
      setBookingStep('success');
      sessionStorage.setItem('justBooked', 'true');
      localStorage.setItem('customerPhone', formData.contact);
      setCustomerPhone(formData.contact);
      setCart([]); 
      
      // Refetch from Supabase to update local store immediately
      fetchBookings().catch(err => console.error("Error refetching bookings:", err));

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

  if (isBookingModalOpen) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans animate-fadeIn">
        {/* Simple Header */}
        <header className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40">
           <div className="flex items-center gap-2">
             <Shield className="text-indigo-600" size={24} />
             <span className="font-black text-xl text-gray-900 tracking-tight leading-none pt-1">Secure Checkout</span>
           </div>
           <button onClick={resetFlow} className="text-xs sm:text-sm font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors bg-gray-100 hover:bg-indigo-50 px-3 py-1.5 rounded-lg">
             <ChevronLeft size={16} /> <span className="hidden sm:inline">Back</span>
           </button>
        </header>

        <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          {bookingStep === 'loading' && (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
              <p className="text-xl font-bold text-gray-600">Processing your booking securely...</p>
            </div>
          )}

          {bookingStep === 'success' && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center animate-fadeIn max-w-2xl mx-auto">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-green-50 rounded-full flex items-center justify-center mb-6 sm:mb-8 shadow-inner border-4 sm:border-8 border-green-100">
                <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mb-3 sm:mb-4 tracking-tight">Booking Confirmed!</h2>
              <p className="text-base sm:text-lg text-gray-600 mb-4 font-medium leading-relaxed px-4">
                Thank you for choosing Professional Home Services. Your request has been securely processed and a partner will reach out to you shortly.
              </p>
              {completedBookingId && (
                <div className="bg-indigo-50 border-2 border-indigo-100 px-6 py-4 rounded-2xl mb-8 sm:mb-10 inline-block">
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Your Booking ID</p>
                  <p className="text-xl font-black text-indigo-950 tracking-wider break-all">{completedBookingId}</p>
                </div>
              )}
              
              {completedBookingId && (
                <NearbyTechniciansBlock 
                  customerLat={formData.lat} 
                  customerLng={formData.lng} 
                  customerCity={formData.city} 
                  categoryName={lastBookedCategory} 
                  bookingId={completedBookingId} 
                />
              )}

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={resetFlow}
                  className="px-8 sm:px-10 py-4 sm:py-5 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-base sm:text-lg hover:bg-gray-50 transition-all active:scale-95"
                >
                  Return Home
                </button>
                <button
                  onClick={() => navigate('/track', { state: { bookingId: completedBookingId } })}
                  className="px-8 sm:px-10 py-4 sm:py-5 bg-indigo-600 text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 active:scale-95"
                >
                  Track Booking
                </button>
              </div>
            </div>
          )}

          {bookingStep === 'form' && (
            <form onSubmit={handleSubmitBooking} className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start relative pb-20">
              
              {/* Left Column: Form Fields */}
              <div className="flex-1 w-full space-y-6">
                 
                 {/* Identity */}
                 <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                       <span className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black border border-indigo-100">1</span>
                       Your Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                         <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white outline-none transition-all text-gray-900 font-medium" placeholder="Enter your full name" />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                         <input required name="contact" value={formData.contact} onChange={handleInputChange} pattern="[0-9]{10}" className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white outline-none transition-all text-gray-900 font-medium" placeholder="10-digit mobile number" />
                       </div>
                    </div>
                 </div>

                 {/* Current Location */}
                 <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                       <span className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black border border-indigo-100">2</span>
                       Current Location
                    </h3>
                                        <div className="relative bg-indigo-950 rounded-2xl p-5 shadow-lg border border-indigo-500/30 overflow-hidden group mb-4">
                       <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                       <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
                       <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-300 ring-1 ring-white/20 shadow-inner">
                                <Navigation size={22} className={isTrackingLocation ? "animate-spin text-white" : "group-hover:scale-110 transition-transform"} />
                             </div>
                             <div>
                                <h5 className="font-bold text-white text-sm tracking-tight mb-1">Use Current Location</h5>
                                <p className="text-[10px] text-indigo-300 font-medium leading-relaxed max-w-[200px]">One click to automatically fill your area & pincode.</p>
                             </div>
                          </div>
                          <button 
                            type="button"
                            onClick={handleTrackLocation} 
                            disabled={isTrackingLocation}
                            className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-indigo-400/50"
                          >
                            {isTrackingLocation ? 'DETECTING...' : formData.locationLink ? 'LOCKED' : 'AUTO-DETECT'}
                          </button>
                       </div>
                    </div>
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col gap-3">
                       <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Maps Location Link (Optional)</label>
                          <span className="text-[8px] font-bold text-white bg-indigo-600 px-2 py-0.5 rounded-full">RECOMMENDED</span>
                       </div>
                       <div className="relative group/input flex items-center">
                              <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within/input:text-indigo-600 transition-colors pointer-events-none" size={18} />
                              <input
                                name="locationLink"
                                value={formData.locationLink}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-28 py-3.5 bg-white border-2 border-indigo-50 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-300"
                                placeholder="Paste Google Maps link here..."
                              />
                              <button
                                type="button"
                                onClick={() => setIsMapPickerOpen(true)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm"
                              >
                                Adjust Pin
                              </button>
                           </div>
                       <p className="text-[10px] text-indigo-400 font-medium italic">* Providing a location link makes the "Service Address" section below optional.</p>
                    </div>
                 </div>

                 {/* Address */}
                 <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-3">
                           <span className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black border border-indigo-100">3</span>
                           Service Address
                        </h3>
                    </div>

                    <div className="space-y-5">
                       <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Address</label>
                         <input name="address" value={formData.address} onChange={handleInputChange} onBlur={async () => {      if (formData.address) {          setIsDetectingPincode(true);          const foundPin = await identifyPincode(formData.address);          if (foundPin) {             setFormData((p: any) => ({ ...p, pincode: foundPin }));                          try {                 const areaRes = await fetchAreasByPincode(foundPin);                 if (areaRes.success && areaRes.areas.length > 0) {                     setFormData((p: any) => ({                         ...p,                         area: areaRes.areas[0],                        city: areaRes.isBangalore ? 'Bangalore' : (foundPin.startsWith('110') ? 'Delhi' : p.city)                     }));                 }             } catch { /* ignore */ }         }         setIsDetectingPincode(false);      }  }} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white outline-none transition-all text-gray-900 font-medium" placeholder="House/Flat No, Street, Area" />
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">City</label>
                            <div className="relative">
                               <select name="city" value={formData.city} onChange={(e) => { const newCity = e.target.value; setFormData((prev: any) => ({ ...prev, city: newCity, area: '', pincode: '' })); localStorage.setItem('preferredCity', newCity); window.dispatchEvent(new Event('cityUpdated')); }} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-gray-900 appearance-none font-medium">
                                  <option value="">Select City</option>
                                  {CITY_DATA.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                               </select>
                               <ChevronRight className="absolute right-4 top-4 rotate-90 text-gray-400 pointer-events-none" size={16} />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Area / Locality</label>
                            <input name="area" value={formData.area} onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white outline-none transition-all text-gray-900 font-medium" placeholder="Enter your area" />
                          </div>
                       </div>
                       <div>
                         <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">Pincode {(isDetectingPincode || isFetchingAreaPincode) && <Loader2 size={12} className="animate-spin text-indigo-600" />}</label>
                         <input name="pincode" value={formData.pincode} onChange={handleInputChange} disabled={isDetectingPincode || isFetchingAreaPincode} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white outline-none transition-all disabled:opacity-50 text-gray-900 font-medium" placeholder="6-digit pincode" />
                       </div>
                    </div>
                 </div>

                 {/* Time Slot */}
                 <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                       <span className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black border border-indigo-100">4</span>
                       Preference Time
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                       <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Date</label>
                         <input type="date" required name="date" value={formData.date} onChange={handleInputChange} min={minDate} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-gray-900 font-medium" />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Time Slot</label>
                         <div className="relative">
                            <select required name="time" value={formData.time} onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-gray-900 appearance-none font-medium">
                               <option value="">Select Time</option>
                               {availableTimeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                            </select>
                            <ChevronRight className="absolute right-4 top-4 rotate-90 text-gray-400 pointer-events-none" size={16} />
                         </div>
                       </div>
                    </div>
                 </div>

                 {/* Extra Info */}
                 <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                       <span className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black border border-indigo-100">5</span>
                       Additional Info
                    </h3>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Instructions (Optional)</label>
                      <input name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white outline-none transition-all text-gray-900 font-medium" placeholder="Any specific requirements?" />
                    </div>
                 </div>

              </div>

              {/* Right Column: Order Summary (Sticky) */}
              <div className="w-full lg:w-[420px] lg:sticky lg:top-24 space-y-6">
                  
                  <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-indigo-100/40 border border-indigo-50">
                     <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight flex justify-between items-center">
                        Order Summary
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">{cartItemCount} Items</span>
                     </h3>
                     
                     <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                       {cart.map(item => (
                         <div key={item.id} className="flex justify-between items-start gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                           <div className="flex-1">
                             <p className="font-bold text-gray-800 text-sm leading-snug">{item.name}</p>
                             <div className="flex items-center gap-2 mt-2">
                               <button type="button" onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 bg-white shadow-sm border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 font-medium">-</button>
                               <span className="text-xs font-black text-indigo-900 min-w-[12px] text-center">{item.quantity}</span>
                               <button type="button" onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 bg-white shadow-sm border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 font-medium">+</button>
                               <button type="button" onClick={() => removeFromCart(item.id)} className="ml-3 text-red-500 hover:text-red-700 text-[10px] uppercase font-black tracking-widest bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors">Discard</button>
                             </div>
                           </div>
                           <span className="font-black text-indigo-600 shrink-0 text-base">₹{item.price * item.quantity}</span>
                         </div>
                       ))}
                     </div>

                     <div className="pt-6 border-t border-gray-100 space-y-5">
                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Promo Code</label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} disabled={!!appliedCoupon} placeholder="Enter Code" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none uppercase font-black text-indigo-950 placeholder-gray-400" />
                            {appliedCoupon ? (
                               <button type="button" onClick={removeCoupon} className="bg-red-50 text-red-600 border border-red-100 px-6 py-3 rounded-xl text-xs font-black uppercase hover:bg-red-100 transition-colors whitespace-nowrap active:scale-95">Remove</button>
                            ) : (
                               <button type="button" onClick={() => handleApplyCoupon()} className="bg-gray-900 text-white border border-gray-900 px-6 py-3 rounded-xl text-xs font-black uppercase hover:bg-black transition-colors shadow-lg shadow-gray-900/20 whitespace-nowrap active:scale-95">Apply</button>
                            )}
                          </div>
                          {couponMessage && <p className={`text-[11px] mt-2 font-bold ml-1 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{couponMessage.text}</p>}
                          
                          {!appliedCoupon && (
                            <div className="mt-3 flex gap-2">
                                <button type="button" onClick={() => handleApplyCoupon('GET20')} className="text-[10px] font-black px-3 py-1.5 rounded-lg border border-indigo-100 text-indigo-600 bg-white hover:bg-indigo-50 transition-colors uppercase tracking-widest shadow-sm">GET20</button>
                                <button type="button" onClick={() => handleApplyCoupon('SAVE10')} className="text-[10px] font-black px-3 py-1.5 rounded-lg border border-indigo-100 text-indigo-600 bg-white hover:bg-indigo-50 transition-colors uppercase tracking-widest shadow-sm">SAVE10</button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3 pt-2 px-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Subtotal</span>
                            <span className="font-bold text-gray-900 text-base">₹{cartTotal}</span>
                          </div>
                          {discountAmount > 0 && (
                            <AnimatePresence>
                               <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center text-sm text-emerald-600 font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                                 <span className="uppercase tracking-wider text-xs">Discount</span>
                                 <span className="text-base">-₹{discountAmount}</span>
                               </motion.div>
                            </AnimatePresence>
                          )}
                          <div className="flex justify-between items-end pt-5 border-t border-gray-200 mt-4">
                             <div>
                                <span className="block text-gray-900 font-black text-sm uppercase tracking-wider">Final Total</span>
                                <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Inc. of all taxes</span>
                             </div>
                             <span className="text-4xl font-black text-indigo-600 tracking-tighter leading-none">₹{finalTotal}</span>
                          </div>
                        </div>
                     </div>
                  </div>

                  <button type="submit" className="w-full bg-indigo-600 text-white text-lg font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-[0.98] uppercase tracking-wide flex items-center justify-center gap-2 group border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1">
                     <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
                     Confirm Booking
                  </button>

                  <p className="text-center text-xs font-bold text-gray-400 flex items-center justify-center gap-2 mt-4">
                     <Lock size={12} className="text-gray-400" />
                     Payments are secure and encrypted.
                  </p>
              </div>

            </form>
          )}
        </main>
      </div>
    );
  }

  return (
    <>
      {/* Tonnage Prompt Modal */}
      <Modal 
        isOpen={!!tonnagePrompt} 
        onClose={() => setTonnagePrompt(null)} 
        title="Select AC Tonnage"
      >
        <div className="space-y-4">
            <p className="text-gray-600 mb-4">Please select the tonnage of your AC to continue with Gas Leak Fix and Refilling service.</p>
            <div className="grid grid-cols-1 gap-3">
                <button 
                    onClick={() => onTonnageSelect("1 Ton", 2800)}
                    className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                >
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800">1 Ton AC</span>
                        <span className="text-sm text-gray-500">Standard 1 ton cooling capacity</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-indigo-600">₹2800</span>
                        <ChevronRight className="text-gray-400 group-hover:text-indigo-500" size={20} />
                    </div>
                </button>
                <button 
                    onClick={() => onTonnageSelect("1.5 Ton", 3200)}
                    className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                >
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800">1.5 Ton AC</span>
                        <span className="text-sm text-gray-500">Standard 1.5 ton cooling capacity</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-indigo-600">₹3200</span>
                        <ChevronRight className="text-gray-400 group-hover:text-indigo-500" size={20} />
                    </div>
                </button>
                <button 
                    onClick={() => onTonnageSelect("2 Ton", 3500)}
                    className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                >
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800">2 Ton AC</span>
                        <span className="text-sm text-gray-500">Heavy duty 2 ton cooling capacity</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-indigo-600">₹3500</span>
                        <ChevronRight className="text-gray-400 group-hover:text-indigo-500" size={20} />
                    </div>
                </button>
            </div>
        </div>
      </Modal>

      
      {/* Sticky Header Actions */}
      <div className="hidden sm:flex fixed top-20 right-4 sm:right-8 z-50 flex-col gap-3 pointer-events-none">
         <button onClick={() => setIsProfileOpen(true)} className="pointer-events-auto bg-white/90 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border border-gray-100 text-indigo-900 hover:scale-105 hover:bg-indigo-50 transition-all group">
            <UserIcon size={22} className="group-hover:text-indigo-600 transition-colors" />
         </button>
         <button onClick={() => window.dispatchEvent(new Event('sofiyan_open_side_cart'))} className="pointer-events-auto bg-indigo-950 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-900/30 border border-indigo-800 text-white hover:scale-105 transition-all relative">
            <ShoppingCart size={20} />
            {cart.length > 0 && (
               <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md animate-bounce">
                 {cart.length}
               </div>
            )}
         </button>
      </div>

      
      {/* See All Categories Modal */}
      <Modal
        isOpen={isSeeAllModalOpen}
        onClose={() => setIsSeeAllModalOpen(false)}
        title="AC & Appliance Repair"
        maxWidth="max-w-2xl"
      >
        <div className="p-4 sm:p-6 bg-white overflow-y-auto max-h-[70vh]">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Large appliances</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-8">
             {['AC', 'WashingMachine', 'Refrigerator', 'Television'].map(cat => {
                 const c = categoryList.find(x => x.name === cat);
                 if(!c) return null;
                 return (
                   <div 
                     key={c.name} 
                     className="flex flex-col items-center gap-3 cursor-pointer group"
                     onClick={() => {
                        setIsSeeAllModalOpen(false);
                        if (typeof window !== 'undefined' && (window as any).openCategoryView) {
                            (window as any).openCategoryView(c.name);
                        } else if (typeof window !== 'undefined' && (window as any).openCategoryModal) {
                            (window as any).openCategoryModal(c.name);
                        }
                     }}
                   >
                     <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#f4f5f6] rounded-[24px] overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:bg-[#ebebeb] mb-1">
                       <img src={c.image} alt={c.name} className="w-full h-full object-cover scale-[1.25] transition-transform duration-500 group-hover:scale-[1.35]" />
                     </div>
                     <span className="text-[13px] sm:text-[15px] font-medium text-gray-900 text-center leading-tight">{c.name === 'WashingMachine' ? 'Washing Machine' : c.name}</span>
                   </div>
                 )
             })}
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-4">Small appliances</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-8">
             {['Chimney', 'Microwave', 'WaterPurifier', 'Geyser'].map(cat => {
                 const c = categoryList.find(x => x.name === cat);
                 if(!c) return null;
                 return (
                   <div 
                     key={c.name} 
                     className="flex flex-col items-center gap-3 cursor-pointer group"
                     onClick={() => {
                        setIsSeeAllModalOpen(false);
                        if (typeof window !== 'undefined' && (window as any).openCategoryView) {
                            (window as any).openCategoryView(c.name);
                        } else if (typeof window !== 'undefined' && (window as any).openCategoryModal) {
                            (window as any).openCategoryModal(c.name);
                        }
                     }}
                   >
                     <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#f4f5f6] rounded-[24px] overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:bg-[#ebebeb] mb-1">
                       <img src={c.image} alt={c.name} className="w-full h-full object-cover scale-[1.25] transition-transform duration-500 group-hover:scale-[1.35]" />
                     </div>
                     <span className="text-[13px] sm:text-[15px] font-medium text-gray-900 text-center leading-tight">{c.name === 'WaterPurifier' ? 'RO/Water Purifier' : c.name}</span>
                   </div>
                 )
             })}
          </div>

          
        </div>
      </Modal>

      {renderProfileModal()}

      {/* Mobile-Friendly Urban Company Style Hero Content */}
      <div className="bg-indigo-600 sm:bg-transparent pb-8 pt-6 sm:pt-8 transition-all duration-500">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="w-full max-w-sm xs:max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto mb-5 sm:mb-10 px-2 sm:px-0 relative z-30">
            <div className="absolute inset-y-0 left-0 pl-5 sm:pl-6 flex items-center pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 sm:pl-14 pr-4 py-2.5 sm:py-4 border border-indigo-100 sm:border-2 sm:border-indigo-50 rounded-xl sm:rounded-3xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 shadow-md sm:shadow-xl shadow-indigo-600/5 sm:shadow-indigo-100/50 transition-all hover:shadow-indigo-200/50 text-xs sm:text-sm text-gray-950 font-bold"
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
          <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto rounded-3xl sm:rounded-[2.5rem] overflow-hidden relative group shadow-2xl">
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

      <div className="max-w-[1800px] mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8 mb-24">
        {/* Explore Labels - Reduced spacing */}
        <div className="flex items-center justify-between mb-4 sm:mb-12">
            <div className="flex flex-col">
                <h2 className="text-[22px] sm:text-3xl font-bold text-gray-900 tracking-normal">Explore all services</h2>
            </div>
            <div className="hidden sm:flex gap-2">
               <div className="w-12 h-1 bg-indigo-600 rounded-full"></div>
               <div className="w-4 h-1 bg-indigo-200 rounded-full"></div>
               <div className="w-4 h-1 bg-indigo-100 rounded-full"></div>
            </div>
        </div>

        {/* Categories Grid - Optimized for density like UC */}
        {searchQuery ? (
          filteredCategories.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-8">
              {filteredCategories.map((category) => {
                const cleanRoute = `/services/${category.name.toLowerCase().replace(/\s+/g, '-')}`;
                return (
                <a
                  key={category.name}
                  href={cleanRoute}
                  onClick={(e) => {
                    e.preventDefault();
                    if ((window as any).openCategoryView) {
                      (window as any).openCategoryView(category.name);
                    } else if ((window as any).openCategoryModal) {
                      (window as any).openCategoryModal(category.name);
                    }
                  }}
                  className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg h-32 sm:h-48 cursor-pointer w-full transition-all duration-300 hover:shadow-indigo-200/50 hover:scale-[1.02] block border border-indigo-50 bg-white"
                >
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
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No categories available.</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-8 max-w-5xl">
            {mainCategories.map((category) => {
              return (
              <div
                key={category.id}
                onClick={(e) => {
                  e.preventDefault();
                  if (category.id === 'Appliances') {
                    setIsSeeAllModalOpen(true);
                  } else {
                    if ((window as any).openCategoryView) {
                      (window as any).openCategoryView(category.id);
                    } else if ((window as any).openCategoryModal) {
                      (window as any).openCategoryModal(category.id);
                    }
                  }
                }}
                className="flex flex-col items-center gap-3 sm:gap-5 cursor-pointer group w-full"
              >
                <div className="w-full aspect-[16/9] bg-[#f4f5f6] rounded-[24px] sm:rounded-[32px] flex items-center justify-center transition-transform duration-300 group-hover:bg-[#ebebeb] overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover scale-[1.25] transition-transform duration-500 group-hover:scale-[1.35]"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[15px] sm:text-[18px] md:text-[20px] font-medium text-gray-900 text-center leading-tight">
                  {category.name}
                </span>
              </div>
            )})}
          </div>
        )}
        
        <PromotionalCarousel onApplianceClick={() => setIsSeeAllModalOpen(true)} />

        {/* UPGRADED: Mobile-Friendly Manual Scroll Featured Services */}
                <MostPopularCarousel onBook={handleFeaturedBooking} onSeeAll={() => setIsSeeAllModalOpen(true)} />

        {/* Sticky Cart Footer */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-t border-indigo-100 shadow-[0_-20px_50px_rgba(79,70,229,0.12)] p-5 animate-slideUp">
            <div className="max-w-[1800px] mx-auto flex items-center justify-between">
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
                  window.dispatchEvent(new Event('sofiyan_open_side_cart'));
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
        <ReviewsCarousel />

        {/* Trust Metrics / Stats Section */}
        <div className="py-8 bg-blue-50/30 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
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
                        {(post.displayImageUrl || post.image_url) ? (
                          <img src={post.displayImageUrl || post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
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

        
        {/* Quick Links Section */}
        {['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad', 'gurgaon', 'noida', 'varanasi', 'mau'].includes(activeCity.toLowerCase()) && (() => {
          const seoKeywords = {
            bangalore: [
              { label: "Home Cleaning Services in Bangalore", category: "Cleaning" },
              { label: "Electrician Services in Bangalore", category: "Electrician" },
              { label: "Plumber Services in Bangalore", category: "Plumbing" },
              { label: "AC Service & Repair in Bangalore", category: "AC Repair" },
              { label: "Appliance Repair Services in Bangalore", category: "Appliances" },
              { label: "Pest Control Services in Bangalore", category: "Pest Control" },
              { label: "Home Painting Services in Bangalore", category: "Painting" },
              { label: "Carpenter Services in Bangalore", category: "Carpentry" },
              { label: "Sofa & Carpet Cleaning in Bangalore", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Bangalore", category: "Cleaning" },
              { label: "RO & Water Purifier Service in Bangalore", category: "Appliances" },
              { label: "Washing Machine Repair in Bangalore", category: "Appliances" },
              { label: "Refrigerator Repair in Bangalore", category: "Appliances" },
              { label: "Geyser Repair & Service in Bangalore", category: "Appliances" },
              { label: "Handyman Services in Bangalore", category: "Carpentry" },
              { label: "Home Repair & Maintenance in Bangalore", category: "Cleaning" },
              { label: "Home Services Near Me in Bangalore", category: null }
            ],
            delhi: [
              { label: "Home Cleaning Services in Delhi", category: "Cleaning" },
              { label: "Deep Cleaning Services in Delhi", category: "Cleaning" },
              { label: "Electrician Services in Delhi", category: "Electrician" },
              { label: "Plumber Services in Delhi", category: "Plumbing" },
              { label: "Emergency Plumber in Delhi", category: "Plumbing" },
              { label: "AC Service & Repair in Delhi", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Delhi", category: "AC Repair" },
              { label: "Appliance Repair Services in Delhi", category: "Appliances" },
              { label: "Washing Machine Repair in Delhi", category: "Appliances" },
              { label: "Refrigerator Repair in Delhi", category: "Appliances" },
              { label: "Geyser Repair & Service in Delhi", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Delhi", category: "Appliances" },
              { label: "Pest Control Services in Delhi", category: "Pest Control" },
              { label: "Carpenter Services in Delhi", category: "Carpentry" },
              { label: "Home Painting Services in Delhi", category: "Painting" },
              { label: "Waterproofing Services in Delhi", category: "Painting" },
              { label: "Sofa & Carpet Cleaning in Delhi", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Delhi", category: "Cleaning" },
              { label: "Handyman & Home Repair Services in Delhi", category: "Carpentry" },
              { label: "Home Services Near Me in Delhi", category: null }
            ],
            mumbai: [
              { label: "Home Cleaning Services in Mumbai", category: "Cleaning" },
              { label: "Deep Cleaning Services in Mumbai", category: "Cleaning" },
              { label: "Electrician Services in Mumbai", category: "Electrician" },
              { label: "Emergency Electrician in Mumbai", category: "Electrician" },
              { label: "Plumber Services in Mumbai", category: "Plumbing" },
              { label: "Emergency Plumber & Plumbing Repair in Mumbai", category: "Plumbing" },
              { label: "AC Service & Repair in Mumbai", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Mumbai", category: "AC Repair" },
              { label: "Appliance Repair Services in Mumbai", category: "Appliances" },
              { label: "Washing Machine Repair in Mumbai", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Mumbai", category: "Appliances" },
              { label: "Geyser Repair & Service in Mumbai", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Mumbai", category: "Appliances" },
              { label: "Pest Control Services in Mumbai", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Mumbai", category: "Pest Control" },
              { label: "Carpenter Services in Mumbai", category: "Carpentry" },
              { label: "Home Painting Services in Mumbai", category: "Painting" },
              { label: "Waterproofing Services in Mumbai", category: "Painting" },
              { label: "Sofa & Carpet Cleaning in Mumbai", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Mumbai", category: "Cleaning" },
              { label: "Handyman & Home Repair Services in Mumbai", category: "Carpentry" },
              { label: "Home Services Near Me in Mumbai", category: null }
            ],
            hyderabad: [
              { label: "Home Cleaning Services in Hyderabad", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Hyderabad", category: "Cleaning" },
              { label: "Electrician Services in Hyderabad", category: "Electrician" },
              { label: "Emergency Electrician Services in Hyderabad", category: "Electrician" },
              { label: "Plumber Services in Hyderabad", category: "Plumbing" },
              { label: "Emergency Plumbing & Leakage Repair in Hyderabad", category: "Plumbing" },
              { label: "AC Service & Repair in Hyderabad", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Hyderabad", category: "AC Repair" },
              { label: "Appliance Repair Services in Hyderabad", category: "Appliances" },
              { label: "Washing Machine Repair in Hyderabad", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Hyderabad", category: "Appliances" },
              { label: "Geyser Repair & Service in Hyderabad", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Hyderabad", category: "Appliances" },
              { label: "Pest Control Services in Hyderabad", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Hyderabad", category: "Pest Control" },
              { label: "Carpenter Services in Hyderabad", category: "Carpentry" },
              { label: "Home Painting Services in Hyderabad", category: "Painting" },
              { label: "Waterproofing Services in Hyderabad", category: "Painting" },
              { label: "Sofa & Carpet Cleaning in Hyderabad", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Hyderabad", category: "Cleaning" },
              { label: "Handyman & Home Repair Services in Hyderabad", category: "Carpentry" },
              { label: "Home Services Near Me in Hyderabad", category: null }
            ],
            pune: [
              { label: "Home Cleaning Services in Pune", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Pune", category: "Cleaning" },
              { label: "Electrician Services in Pune", category: "Electrician" },
              { label: "Emergency Electrician in Pune", category: "Electrician" },
              { label: "Plumber Services in Pune", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Pune", category: "Plumbing" },
              { label: "AC Service & Repair in Pune", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Pune", category: "AC Repair" },
              { label: "Appliance Repair Services in Pune", category: "Appliances" },
              { label: "Washing Machine Repair in Pune", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Pune", category: "Appliances" },
              { label: "Geyser Repair & Service in Pune", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Pune", category: "Appliances" },
              { label: "Pest Control Services in Pune", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Pune", category: "Pest Control" },
              { label: "Carpenter Services in Pune", category: "Carpentry" },
              { label: "Home Painting Services in Pune", category: "Painting" },
              { label: "Waterproofing Services in Pune", category: "Painting" },
              { label: "Sofa & Carpet Cleaning in Pune", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Pune", category: "Cleaning" },
              { label: "Handyman & Home Repair Services in Pune", category: "Carpentry" },
              { label: "Home Services Near Me in Pune", category: null }
            ],
            chennai: [
              { label: "Home Cleaning Services in Chennai", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Chennai", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Chennai", category: "Cleaning" },
              { label: "Sofa & Carpet Cleaning in Chennai", category: "Cleaning" },
              { label: "Electrician Services in Chennai", category: "Electrician" },
              { label: "Emergency Electrician Services in Chennai", category: "Electrician" },
              { label: "Plumber Services in Chennai", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Chennai", category: "Plumbing" },
              { label: "AC Service & Repair in Chennai", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Chennai", category: "AC Repair" },
              { label: "Appliance Repair Services in Chennai", category: "Appliances" },
              { label: "Washing Machine Repair in Chennai", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Chennai", category: "Appliances" },
              { label: "Geyser Repair & Service in Chennai", category: "Appliances" },
              { label: "RO & Water Purifier Service in Chennai", category: "Appliances" },
              { label: "TV & Electronics Repair in Chennai", category: "Appliances" },
              { label: "Chimney Repair & Service in Chennai", category: "Appliances" },
              { label: "Pest Control Services in Chennai", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Chennai", category: "Pest Control" },
              { label: "Carpenter Services in Chennai", category: "Carpentry" },
              { label: "Home Painting Services in Chennai", category: "Painting" },
              { label: "Waterproofing Services in Chennai", category: "Painting" },
              { label: "Handyman & Home Repair Services in Chennai", category: "Carpentry" },
              { label: "Home Services Near Me in Chennai", category: null }
            ],
            kolkata: [
              { label: "Home Cleaning Services in Kolkata", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Kolkata", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Kolkata", category: "Cleaning" },
              { label: "Sofa & Carpet Cleaning in Kolkata", category: "Cleaning" },
              { label: "Electrician Services in Kolkata", category: "Electrician" },
              { label: "Emergency Electrician Services in Kolkata", category: "Electrician" },
              { label: "Plumber Services in Kolkata", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Kolkata", category: "Plumbing" },
              { label: "AC Service & Repair in Kolkata", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Kolkata", category: "AC Repair" },
              { label: "Appliance Repair Services in Kolkata", category: "Appliances" },
              { label: "Washing Machine Repair in Kolkata", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Kolkata", category: "Appliances" },
              { label: "Geyser Repair & Service in Kolkata", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Kolkata", category: "Appliances" },
              { label: "Microwave & TV Repair Services in Kolkata", category: "Appliances" },
              { label: "Pest Control Services in Kolkata", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Kolkata", category: "Pest Control" },
              { label: "Carpenter Services in Kolkata", category: "Carpentry" },
              { label: "Home Painting Services in Kolkata", category: "Painting" },
              { label: "Waterproofing Services in Kolkata", category: "Painting" },
              { label: "Handyman & Home Repair Services in Kolkata", category: "Carpentry" },
              { label: "Home Services Near Me in Kolkata", category: null }
            ],
            ahmedabad: [
              { label: "Home Cleaning Services in Ahmedabad", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Ahmedabad", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Ahmedabad", category: "Cleaning" },
              { label: "Sofa & Carpet Cleaning in Ahmedabad", category: "Cleaning" },
              { label: "Electrician Services in Ahmedabad", category: "Electrician" },
              { label: "Emergency Electrician Services in Ahmedabad", category: "Electrician" },
              { label: "Plumber Services in Ahmedabad", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Ahmedabad", category: "Plumbing" },
              { label: "AC Service & Repair in Ahmedabad", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Ahmedabad", category: "AC Repair" },
              { label: "Appliance Repair Services in Ahmedabad", category: "Appliances" },
              { label: "Washing Machine Repair in Ahmedabad", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Ahmedabad", category: "Appliances" },
              { label: "Geyser Repair & Service in Ahmedabad", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Ahmedabad", category: "Appliances" },
              { label: "TV & Electronics Repair in Ahmedabad", category: "Appliances" },
              { label: "Pest Control Services in Ahmedabad", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Ahmedabad", category: "Pest Control" },
              { label: "Carpenter Services in Ahmedabad", category: "Carpentry" },
              { label: "Home Painting Services in Ahmedabad", category: "Painting" },
              { label: "Waterproofing Services in Ahmedabad", category: "Painting" },
              { label: "Handyman & Home Repair Services in Ahmedabad", category: "Carpentry" },
              { label: "Home Services Near Me in Ahmedabad", category: null }
            ],
            gurgaon: [
              { label: "Home Cleaning Services in Gurgaon", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Gurgaon", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Gurgaon", category: "Cleaning" },
              { label: "Sofa & Carpet Cleaning in Gurgaon", category: "Cleaning" },
              { label: "Electrician Services in Gurgaon", category: "Electrician" },
              { label: "24x7 Emergency Electrician in Gurgaon", category: "Electrician" },
              { label: "Plumber Services in Gurgaon", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Gurgaon", category: "Plumbing" },
              { label: "AC Service & Repair in Gurgaon", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Gurgaon", category: "AC Repair" },
              { label: "Appliance Repair Services in Gurgaon", category: "Appliances" },
              { label: "Washing Machine Repair in Gurgaon", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Gurgaon", category: "Appliances" },
              { label: "Geyser Repair & Service in Gurgaon", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Gurgaon", category: "Appliances" },
              { label: "TV & Electronics Repair in Gurgaon", category: "Appliances" },
              { label: "Pest Control Services in Gurgaon", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Gurgaon", category: "Pest Control" },
              { label: "Carpenter Services in Gurgaon", category: "Carpentry" },
              { label: "Home Painting Services in Gurgaon", category: "Painting" },
              { label: "Waterproofing Services in Gurgaon", category: "Painting" },
              { label: "Handyman & Home Repair Services in Gurgaon", category: "Carpentry" },
              { label: "Home Services Near Me in Gurgaon", category: null }
            ],
            noida: [
              { label: "Home Cleaning Services in Noida", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Noida", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Noida", category: "Cleaning" },
              { label: "Sofa & Carpet Cleaning in Noida", category: "Cleaning" },
              { label: "Electrician Services in Noida", category: "Electrician" },
              { label: "Emergency Electrician Services in Noida", category: "Electrician" },
              { label: "Plumber Services in Noida", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Noida", category: "Plumbing" },
              { label: "AC Service & Repair in Noida", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Noida", category: "AC Repair" },
              { label: "Appliance Repair Services in Noida", category: "Appliances" },
              { label: "Washing Machine Repair in Noida", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Noida", category: "Appliances" },
              { label: "Geyser Repair & Service in Noida", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Noida", category: "Appliances" },
              { label: "TV & Electronics Repair in Noida", category: "Appliances" },
              { label: "Pest Control Services in Noida", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Noida", category: "Pest Control" },
              { label: "Carpenter Services in Noida", category: "Carpentry" },
              { label: "Home Painting Services in Noida", category: "Painting" },
              { label: "Waterproofing Services in Noida", category: "Painting" },
              { label: "Handyman & Home Repair Services in Noida", category: "Carpentry" },
              { label: "Home Services Near Me in Noida", category: null }
            ],
            varanasi: [
              { label: "Home Cleaning Services in Varanasi", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Varanasi", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Varanasi", category: "Cleaning" },
              { label: "Sofa & Carpet Cleaning in Varanasi", category: "Cleaning" },
              { label: "Electrician Services in Varanasi", category: "Electrician" },
              { label: "Emergency Electrician Services in Varanasi", category: "Electrician" },
              { label: "Plumber Services in Varanasi", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Varanasi", category: "Plumbing" },
              { label: "AC Service & Repair in Varanasi", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Varanasi", category: "AC Repair" },
              { label: "Appliance Repair Services in Varanasi", category: "Appliances" },
              { label: "Washing Machine Repair in Varanasi", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Varanasi", category: "Appliances" },
              { label: "Geyser Repair & Service in Varanasi", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Varanasi", category: "Appliances" },
              { label: "TV & Electronics Repair in Varanasi", category: "Appliances" },
              { label: "Pest Control Services in Varanasi", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Varanasi", category: "Pest Control" },
              { label: "Carpenter Services in Varanasi", category: "Carpentry" },
              { label: "Home Painting Services in Varanasi", category: "Painting" },
              { label: "Waterproofing Services in Varanasi", category: "Painting" },
              { label: "Handyman & Home Repair Services in Varanasi", category: "Carpentry" },
              { label: "Home Services Near Me in Varanasi", category: null }
            ],
            mau: [
              { label: "Home Cleaning Services in Mau", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Mau", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Mau", category: "Cleaning" },
              { label: "Sofa & Carpet Cleaning in Mau", category: "Cleaning" },
              { label: "Electrician Services in Mau", category: "Electrician" },
              { label: "Emergency Electrician Services in Mau", category: "Electrician" },
              { label: "Plumber Services in Mau", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Mau", category: "Plumbing" },
              { label: "AC Service & Repair in Mau", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Mau", category: "AC Repair" },
              { label: "Appliance Repair Services in Mau", category: "Appliances" },
              { label: "Washing Machine Repair in Mau", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Mau", category: "Appliances" },
              { label: "Geyser Repair & Service in Mau", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Mau", category: "Appliances" },
              { label: "TV & Electronics Repair in Mau", category: "Appliances" },
              { label: "Pest Control Services in Mau", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Mau", category: "Pest Control" },
              { label: "Carpenter Services in Mau", category: "Carpentry" },
              { label: "Home Painting Services in Mau", category: "Painting" },
              { label: "Waterproofing Services in Mau", category: "Painting" },
              { label: "Handyman & Home Maintenance in Mau", category: "Carpentry" },
              { label: "Home Repair Services in Mau", category: "Carpentry" },
              { label: "Home Services Near Me in Mau", category: null }
            ]
          };
          const currentKeywords = (seoKeywords as any)[activeCity.toLowerCase()];

          return (
            <div className="py-12 bg-white border-t border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 mt-12">
              <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight">Quick Links</h2>
                
                <div className="mb-10">
                  <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                    Provided Services Across Various Cities in India
                  </h3>
                  <div className="flex flex-wrap gap-x-8 gap-y-4">
                    {CITY_DATA.map(city => (
                      <Link 
                        key={city.name} 
                        to={`/${city.name.toLowerCase()}`} 
                        onClick={() => {
                          localStorage.setItem('preferredCity', city.name);
                          window.dispatchEvent(new Event('cityUpdated'));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 text-[15px] transition-colors group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform"></span>
                        {city.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {currentKeywords && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                      Other Services We Offer in {activeCity}
                    </h3>
                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                      {currentKeywords.map((item: any) => (
                        <Link 
                          key={item.label} 
                          to={`/${activeCity.toLowerCase()}`}
                          onClick={(e) => {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            if (item.category) {
                              if (typeof window !== 'undefined' && (window as any).openCategoryView) {
                                (window as any).openCategoryView(item.category);
                              } else if (typeof window !== 'undefined' && (window as any).openCategoryModal) {
                                (window as any).openCategoryModal(item.category);
                              } else {
                                const targetService = SERVICES.find(s => s.name === item.category);
                                if (targetService) {
                                  setSelectedService(targetService);
                                }
                              }
                            }
                          }}
                          className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 text-[15px] transition-colors group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform"></span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

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
                  onClick={() => { setSelectedService(null); window.dispatchEvent(new Event('sofiyan_open_side_cart')); }}
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
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600 mb-6">
                Your booking is placed successfully. A partner will be assigned shortly.
              </p>
              
              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl w-full mb-8 shadow-sm text-left">
                <h4 className="font-bold text-indigo-900 mb-2 text-lg">Customer Dashboard</h4>
                <p className="text-sm text-indigo-700 mb-4">Track your booking or contact our service center directly for any assistance.</p>
                {completedBookingId && (
                  <div className="bg-white border-2 border-indigo-100 px-4 py-3 rounded-xl mb-4 text-center">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Booking ID</p>
                    <p className="text-base font-black text-indigo-950 break-all">{completedBookingId}</p>
                  </div>
                )}
                {bookingOtp && (
                  <div className="bg-indigo-950 border-2 border-indigo-900 px-4 py-3 rounded-xl mb-4 text-center">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Service Start OTP</p>
                    <p className="text-2xl font-black text-white tracking-[0.2em]">{bookingOtp}</p>
                    <p className="text-[9px] text-indigo-300 mt-1 uppercase tracking-widest">Share with partner to start work</p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="tel:8115983887" className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-md">
                    <Phone size={18} /> Call Helpline (8115983887)
                  </a>
                  <button onClick={() => { setIsBookingModalOpen(false); navigate('/track', { state: { bookingId: completedBookingId } }) }} className="flex-1 bg-white border-2 border-indigo-200 text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-50 transition">
                    Track Booking
                  </button>
                </div>
              </div>
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
                <div className="relative bg-white border border-indigo-50 rounded-[2rem] p-4 sm:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
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
                      <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100 group/item hover:bg-white hover:shadow-md transition-all gap-3">
                        <div className="flex-1 w-full">
                          <p className="font-bold text-gray-800 text-sm leading-tight pr-2">{item.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                             <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">₹{item.price}</span>
                             <span className="text-[10px] text-gray-400 font-medium">x {item.quantity}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
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
                      <div className="bg-indigo-50/30 p-4 sm:p-5 rounded-3xl border border-indigo-100/50">
                        <label className="block text-[9px] font-black text-indigo-900 uppercase tracking-[0.3em] mb-3 ml-1">Elite Coupons</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input 
                                type="text" 
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                placeholder="OFFER CODE" 
                                className="flex-1 bg-white border-2 border-indigo-50 rounded-2xl px-4 py-3 text-sm font-black uppercase outline-none focus:border-indigo-600 shadow-sm transition-all text-indigo-950 placeholder:text-indigo-100 w-full"
                                disabled={!!appliedCoupon}
                            />
                            {appliedCoupon ? (
                                <button type="button" onClick={removeCoupon} className="w-full sm:w-auto bg-rose-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black shadow-lg hover:bg-rose-700 active:scale-95 transition-all uppercase tracking-widest whitespace-nowrap">REMOVE</button>
                            ) : (
                                <button type="button" onClick={() => handleApplyCoupon()} className="w-full sm:w-auto bg-indigo-950 text-white px-6 py-3 rounded-2xl text-[10px] font-black shadow-lg hover:bg-black active:scale-95 transition-all uppercase tracking-widest whitespace-nowrap">APPLY</button>
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
                      
                      {referralBalance > 0 && (
                            <div className="mt-4 p-4 bg-emerald-50/60 border border-emerald-100 rounded-3xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-700">
                                        <Gift size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Referral Balance</p>
                                        <p className="text-xs font-bold text-emerald-600">Available: ₹{referralBalance}</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={useReferralBalance} 
                                        onChange={(e) => setUseReferralBalance(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
                      )}
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
                      <AnimatePresence>
                        {referralDiscount > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex justify-between items-center bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100"
                            >
                                <span className="font-bold text-emerald-700 text-xs font-semibold">Referral Reward Discount</span>
                                <span className="font-black text-emerald-700">-₹{referralDiscount}</span>
                            </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-indigo-100 mt-2 gap-2">
                          <span className="font-black text-gray-900 uppercase tracking-tight text-xs sm:text-base">Final Payable</span>
                          <div className="text-right">
                             <span className="block font-black text-xl sm:text-2xl text-indigo-600 drop-shadow-sm">₹{finalTotal}</span>
                             <span className="text-[8px] sm:text-[9px] text-green-600 font-bold uppercase tracking-widest leading-none block mt-1">Pricing Inclusive of Tax</span>
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
                  <div className="relative bg-white border border-indigo-50 rounded-3xl p-4 sm:p-6 shadow-sm">
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

                {/* Section 2: Current Location Card */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-indigo-950 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                  <div className="relative bg-white border border-indigo-50 rounded-3xl p-4 sm:p-6 shadow-sm">
                    <h4 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
                      <span className="bg-indigo-950 text-white w-7 h-7 rounded-xl flex items-center justify-center text-[10px] shadow-xl shadow-indigo-100">2</span>
                      Current Location
                    </h4>
                    
                    <div className="space-y-6">
                        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col gap-3">
                           <div className="flex items-center justify-between">
                              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Maps Location Link (Optional)</label>
                              <span className="text-[8px] font-bold text-white bg-indigo-600 px-2 py-0.5 rounded-full">RECOMMENDED</span>
                           </div>
                           <div className="relative group/input flex items-center">
                              <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within/input:text-indigo-600 transition-colors pointer-events-none" size={18} />
                              <input
                                name="locationLink"
                                value={formData.locationLink}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-28 py-3.5 bg-white border-2 border-indigo-50 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-300"
                                placeholder="Paste Google Maps link here..."
                              />
                              <button
                                type="button"
                                onClick={() => setIsMapPickerOpen(true)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm"
                              >
                                Adjust Pin
                              </button>
                           </div>
                           <p className="text-[10px] text-indigo-400 font-medium italic">* Providing a location link makes the "Deployment Address" section above optional.</p>
                        </div>

                        {/* Precision detection from modal */}
                        <div className="relative bg-indigo-950 rounded-2xl p-4 shadow-lg border border-white/10">
                           <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                                    <Navigation size={20} className={isTrackingLocation ? "animate-spin" : ""} />
                                 </div>
                                 <div>
                                    <h5 className="font-bold text-white text-xs uppercase tracking-tight">Precision Geolocation</h5>
                                    <p className="text-[8px] text-indigo-300 font-black uppercase tracking-[0.2em]">Live Sync</p>
                                 </div>
                              </div>
                              <button 
                                type="button" 
                                onClick={handleTrackLocation} 
                                disabled={isTrackingLocation}
                                className="bg-white text-indigo-950 px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50"
                              >
                                {isTrackingLocation ? 'DETECTING...' : formData.locationLink ? 'LOCKED' : 'AUTO-DETECT'}
                              </button>
                           </div>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Schedule Card */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                  <div className="relative bg-white border border-orange-50 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-5">
                      <span className="bg-orange-500 text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-md shadow-orange-200">4</span>
                      Time Slot
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Section 3: Service Location Card */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-indigo-900 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                  <div className="relative bg-white border border-indigo-50 rounded-3xl p-4 sm:p-6 shadow-sm">
                    <h4 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
                      <span className="bg-indigo-950 text-white w-7 h-7 rounded-xl flex items-center justify-center text-[10px] shadow-xl shadow-indigo-100">3</span>
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
                              if (formData.address) {
                                  setIsDetectingPincode(true);
                                  const foundPin = await identifyPincode(formData.address);
                                  if (foundPin) {
                                      setFormData((p: any) => ({ ...p, pincode: foundPin }));
                                      try {
                                          const areaRes = await fetchAreasByPincode(foundPin);
                                          if (areaRes.success && areaRes.areas.length > 0) {
                                              setFormData((p: any) => ({
                                                  ...p,
                                                  area: areaRes.areas[0],
                                                  city: areaRes.isBangalore ? 'Bangalore' : (foundPin.startsWith('110') ? 'Delhi' : p.city)
                                              }));
                                          }
                                      } catch { /* ignore */ }
                                  }
                                  setIsDetectingPincode(false);
                              }
                            }}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-indigo-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-black text-indigo-950 placeholder:font-normal placeholder:text-gray-300"
                            placeholder="House / Building / Street / Pincode"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current City</label>
                          <div className="relative group/input">
                              <MapPin className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within/input:text-indigo-600 transition-colors" size={18} />
                              <select
                                name="city"
                                value={formData.city}
                                onChange={(e) => {
                                   const newCity = e.target.value;
                                   setFormData((prev: any) => ({ ...prev, city: newCity, area: '', pincode: '' }));
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
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Local Area (Tap to Select)</label>
                          <div className="relative">
                              {formData.city ? (
                                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50/50 rounded-xl border-2 border-gray-100">
                                      {(PREDEFINED_AREAS[formData.city] || []).map(area => (
                                          <button
                                              key={area}
                                              type="button"
                                              onClick={async () => {
                                                  setFormData((prev: any) => ({ ...prev, area }));
                                                  setIsFetchingAreaPincode(true);
                                                  try {
                                                      const pins = await fetchPincodesByArea([area]);
                                                      if (pins && pins.length > 0) {
                                                          setFormData((prev: any) => ({ ...prev, pincode: pins[0] }));
                                                      }
                                                  } finally {
                                                      setIsFetchingAreaPincode(false);
                                                  }
                                              }}
                                              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${formData.area === area ? 'bg-indigo-600 text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'}`}
                                          >
                                              {area}
                                          </button>
                                      ))}
                                      {!(PREDEFINED_AREAS[formData.city]?.length > 0) && (
                                          <span className="text-xs text-gray-400 p-2 font-medium">No predefined areas. Enter your pincode below.</span>
                                      )}
                                  </div>
                              ) : (
                                  <div className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-sm text-gray-400 flex items-center gap-2">
                                      <MapIcon className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                      Select a city first
                                  </div>
                              )}
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

                {/* Section 4: Extra Details Card */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-300 to-indigo-600 rounded-[2rem] blur opacity-5 transition duration-1000"></div>
                  <div className="relative bg-white border border-indigo-50 rounded-3xl p-4 sm:p-6 shadow-sm">
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

        {/* Map Picker Modal */}
        <MapPicker
          isOpen={isMapPickerOpen}
          onClose={() => setIsMapPickerOpen(false)}
          onConfirm={handleConfirmMapLocation}
          initialLat={formData.lat || undefined}
          initialLng={formData.lng || undefined}
        />

        {/* Post-Service Rating & Review Submission Modal */}
        <AnimatePresence>
          {selectedBookingForReview && (() => {
            const assignedTech = partners.find(p => p.id === selectedBookingForReview.assignedPartnerId);
            const techName = selectedBookingForReview.assignedPartnerName || assignedTech?.name || 'Verified Technician';
            const techRating = assignedTech?.rating || '4.9';
            const techReviewCount = assignedTech?.review_count || 0;

            const quickTags = [
              '⏱️ Came on time',
              '👍 Great quality work',
              '🤝 Very polite behavior',
              '🧹 Cleaned up after',
              '🌟 Highly recommended',
              '🔧 Fixed it perfectly'
            ];

            const toggleQuickTag = (tag: string) => {
              if (commentInput.includes(tag)) {
                setCommentInput(prev => prev.replace(tag, '').replace(/,\s*,/g, ',').replace(/^,\s*|\s*,\s*$/g, '').trim());
              } else {
                setCommentInput(prev => prev ? `${prev}, ${tag}` : tag);
              }
            };

            return (
              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col"
                >
                  {/* Top Header Banner with Technician Profile */}
                  <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 p-4 text-white relative shrink-0">
                    <button 
                      onClick={handleDismissReview}
                      className="absolute right-3 top-3 text-white/70 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition-all"
                      title="Remind me later"
                    >
                      <X size={16} />
                    </button>

                    <div className="flex items-center gap-3 pr-6">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl flex items-center justify-center font-black text-white uppercase text-base shadow-lg">
                          {techName.slice(0, 2)}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                          <CheckCircle size={8} className="text-white" />
                        </span>
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-black tracking-tight text-white truncate">{techName}</h3>
                          <span className="inline-flex items-center gap-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            <ShieldCheck size={8} /> Verified
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-indigo-100 font-bold">
                          <span className="flex items-center gap-0.5 text-amber-400">
                            <Star size={9} className="fill-amber-400 text-amber-400" />
                            {techRating}
                          </span>
                          <span className="w-0.5 h-0.5 bg-indigo-300/40 rounded-full"></span>
                          <span>{techReviewCount} Reviews</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 overflow-y-auto space-y-4 custom-scrollbar">
                    {/* Interactive 5-Star Selection */}
                    <div className="flex justify-center items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingInput(star)}
                          className="transition-all active:scale-90 focus:outline-none p-1"
                        >
                          <Star 
                            size={36} 
                            className={`transition-all duration-200 ${
                              star <= ratingInput 
                                ? "fill-amber-400 text-amber-400 drop-shadow-sm scale-110" 
                                : "text-slate-200 hover:text-amber-200"
                            }`} 
                          />
                        </button>
                      ))}
                    </div>

                    {/* Dynamic Rating Label */}
                    <div className="text-center h-5 flex items-center justify-center mb-1">
                      <motion.span 
                        key={ratingInput}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`inline-block text-[10px] font-black px-3 py-1 rounded-full shadow-sm ${
                          ratingInput === 5 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          ratingInput === 4 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          ratingInput === 3 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          ratingInput === 2 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {ratingInput === 1 ? '⭐ 1.0 - Needs Improvement' :
                         ratingInput === 2 ? '⭐ 2.0 - Below Average' :
                         ratingInput === 3 ? '⭐ 3.0 - Good Service' :
                         ratingInput === 4 ? '⭐ 4.0 - Very Good' :
                         '⭐ 5.0 - Outstanding! 😍'}
                      </motion.span>
                    </div>

                    {/* Quick Feedback Chips */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-center">
                        Tap to add quick feedback
                      </label>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {quickTags.map((tag) => {
                          const isSelected = commentInput.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleQuickTag(tag)}
                              className={`text-[10px] font-bold px-2 py-1.5 rounded-lg border transition-all active:scale-95 flex items-center gap-1 ${
                                isSelected 
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Review Textarea */}
                    <div className="space-y-1.5 pb-1">
                      <textarea
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Detailed Feedback (Optional)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all text-xs text-slate-800 font-medium h-20 resize-none leading-relaxed placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0 pb-safe">
                    <button
                      type="button"
                      onClick={handleDismissReview}
                      className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all active:scale-95"
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingReview}
                      onClick={handleSubmitReview}
                      className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-black text-[10px] uppercase tracking-wider rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      {isSubmittingReview ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} />
                          <span>Submit</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>

        {/* Technician Profile and Customer Reviews Modal */}
        <AnimatePresence>
          {selectedTechnicianForProfile && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-slideUp"
              >
                {/* Header Profile Info Banner */}
                <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-6 text-white relative">
                  <button 
                    onClick={() => setSelectedTechnicianForProfile(null)}
                    className="absolute right-4 top-4 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <X size={18} />
                  </button>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-full flex items-center justify-center font-black text-white uppercase text-xl shrink-0 shadow-lg animate-scaleIn">
                      {selectedTechnicianForProfile.name ? selectedTechnicianForProfile.name.slice(0, 2) : "P"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black tracking-tight">{selectedTechnicianForProfile.name}</h3>
                        <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                          <ShieldCheck size={8} /> Verified Partner
                        </span>
                      </div>
                      <p className="text-xs text-indigo-300 font-medium mt-1">
                        Professional Service Expert • {selectedTechnicianForProfile.city || "Mau Region"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scrollable Content Panel */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                  {/* Performance Key Metrics (Flat grid style - no cards inside cards) */}
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 p-4 rounded-2xl text-center">
                    <div>
                      <span className="block text-lg font-black text-indigo-950 leading-none">
                        {selectedTechnicianForProfile.rating ? Number(selectedTechnicianForProfile.rating).toFixed(1) : "4.8"} ★
                      </span>
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1">
                        Avg Rating
                      </span>
                    </div>
                    <div className="border-l border-slate-200/80">
                      <span className="block text-lg font-black text-indigo-950 leading-none">
                        {selectedTechnicianForProfile.review_count || "0"}
                      </span>
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1">
                        Reviews
                      </span>
                    </div>
                    <div className="border-l border-slate-200/80">
                      <span className="block text-lg font-black text-indigo-950 leading-none font-mono">
                        {selectedTechnicianForProfile.experience || "3+ Yrs"}
                      </span>
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1">
                        Experience
                      </span>
                    </div>
                    <div className="border-l border-slate-200/80">
                      <span className="block text-lg font-black text-indigo-950 leading-none">
                        {selectedTechnicianForProfile.completedJobs || "150+"}
                      </span>
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1">
                        Jobs Done
                      </span>
                    </div>
                  </div>

                  {/* Technician Professional Details */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-indigo-950 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                      Expertise & Regional Service Boundaries
                    </h4>
                    <div className="space-y-2 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center text-sm">🛠️</span>
                        <span>
                          <strong className="text-slate-800">Skills:</strong> {selectedTechnicianForProfile.categories?.join(', ') || 'Home Service Specialist'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-indigo-600 shrink-0" />
                        <span>
                          <strong className="text-slate-800">Service Area limits:</strong> {selectedTechnicianForProfile.service_areas?.join(', ') || 'All Local Regions'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Reviews Section */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-indigo-950 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex justify-between items-center">
                      <span>Verified Customer Reviews</span>
                      <span className="bg-indigo-50 text-indigo-700 text-[9px] px-2 py-0.5 rounded-full font-black">
                        {bookings.filter(b => b.assignedPartnerId === selectedTechnicianForProfile.id && b.partner_rating).length} Reviews
                      </span>
                    </h4>

                    {/* Filtered reviews rendering list */}
                    <div className="space-y-3.5">
                      {(() => {
                        const reviewsList = bookings.filter(
                          b => b.assignedPartnerId === selectedTechnicianForProfile.id && b.partner_rating
                        );

                        const maskCustomerName = (name: string) => {
                          if (!name) return "Verified Customer";
                          const parts = name.trim().split(" ");
                          if (parts.length > 1 && parts[1]) {
                            return `${parts[0]} ${parts[1][0]}.`;
                          }
                          return name;
                        };

                        if (reviewsList.length === 0) {
                          return (
                            <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                              <span className="text-2xl">📝</span>
                              <p className="text-xs text-slate-500 font-bold mt-2">No customer reviews yet</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                Be the first to rate this technician once your booking is completed!
                              </p>
                            </div>
                          );
                        }

                        return reviewsList.map((rev) => (
                          <div key={rev.id} className="bg-slate-50/40 border border-slate-100/55 p-4 rounded-2xl">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-extrabold text-slate-800 text-xs">
                                  {maskCustomerName(rev.customerName)}
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                                  Service Category: {rev.serviceCategory} • {rev.date}
                                </p>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    size={10} 
                                    className={star <= (rev.partner_rating || 0) ? "fill-amber-500 text-amber-500 shrink-0" : "text-slate-200 shrink-0"} 
                                  />
                                ))}
                              </div>
                            </div>
                            {rev.partner_comment && (
                              <p className="text-xs text-slate-600 font-semibold italic mt-2.5 bg-white p-2.5 rounded-xl border border-slate-50 shadow-sm leading-relaxed">
                                "{rev.partner_comment}"
                              </p>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                {/* Footer Modal Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedTechnicianForProfile(null)}
                    className="w-full py-3.5 bg-indigo-950 hover:bg-indigo-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-95"
                  >
                    Close Profile
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* No Technician Popup Modal */}
        <AnimatePresence>
          {showNoTechnicianPopup && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col p-6 text-center"
              >
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-black text-indigo-950 mb-2">No Nearby Technicians</h3>
                <p className="text-sm font-semibold text-slate-600 mb-6">
                  Currently, there are no technicians available within 10km of your location. Please contact our Customer Care for immediate assistance.
                </p>
                <div className="space-y-3">
                  <a 
                    href="tel:8115983887"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-95"
                  >
                    <Phone size={16} /> Call Customer Care
                  </a>
                  <button 
                    onClick={() => setShowNoTechnicianPopup(false)}
                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-widest rounded-2xl transition-all active:scale-95"
                  >
                    Close & Keep Waiting
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Floating Helpline Pill */}
        {showHelplineBanner && (
          <a 
            href="tel:8115983887" 
            className="helpline-container fixed bottom-24 right-4 sm:right-8 z-50 flex items-center bg-white rounded-full shadow-lg border border-indigo-100 cursor-pointer hover:scale-105 transition-all overflow-hidden p-1 pr-2.5"
            title="Call Helpline"
          >
            <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center shrink-0 shadow-sm animate-pulse">
               <Phone className="w-3 h-3 text-white" />
            </div>
            <span className="text-[9px] font-black text-indigo-950 uppercase tracking-widest ml-1">Help</span>
          </a>
        )}
      </div>
    </>
  );
};