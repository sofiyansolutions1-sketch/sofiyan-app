import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, Home, Users, Lock, Menu, X, Facebook, Instagram, Youtube, Star, FileText } from 'lucide-react';
import { BUSINESS_NAME, CITY_DATA } from '../constants';
import { Modal } from './Modal';
import { CheckCircle, MapPin } from 'lucide-react';

const siteContent = {
  about: {
    title: "About Our Company",
    text: `Sofiyan Home Service Solutions is a growing home service platform built to create strong, long-term partnerships with skilled service professionals. We focus on connecting reliable technicians with genuine customers while ensuring fairness, transparency, and respect for everyone involved.<br><br>Our platform is designed to help service partners grow their work without worrying about marketing, customer acquisition, or payment security. We provide partners with regular job opportunities in their local areas, clear service details, and predefined pricing so they can focus fully on delivering quality service.<br><br>At Sofiyan Home Service Solutions, we believe in mutual growth. We value partner feedback, reward consistent performance, and promote top-rated technicians through our system.<br><br>We aim to build a professional ecosystem where trust, discipline, and quality service are the foundation.`
  },
  terms: {
    title: "Terms of Service",
    text: `By registering as a service partner with Sofiyan Home Service Solutions, you agree to comply with the following terms. Service partners are required to provide accurate personal and professional details during registration. All services must be performed with honesty and professionalism.<br><br>Partners are expected to reach the customer’s location on time and complete the assigned work with proper tools. Pricing must strictly follow the rates communicated through Sofiyan Home Service Solutions.<br><br>Payments to partners will be processed as per agreed payment cycles. Customer ratings and reviews will be used to evaluate partner performance. Consistent poor ratings may lead to suspension.`
  },
  privacy: {
    title: "Privacy Policy",
    text: `At Sofiyan Home Service Solutions, we respect your privacy. We collect only the information needed to work with you and provide services smoothly (Name, phone, address, work skills).<br><br>Your personal information is shared only when required, such as with customers for service work or payment processing. We do not sell or misuse your data.<br><br>We keep your information safe and secure. Partners must also keep their login details private. By joining us, you agree to this Privacy Policy.`
  },
  refund: {
    title: "Cancellation & Refund Policy",
    text: `We follow a Cash on Service payment model. If a customer cancels before the technician is assigned, no payment is applicable. If canceled after assignment, the company reviews the case.<br><br>Once service is completed and payment is collected in cash, no refund is applicable through the partner. Refund requests are handled by the company after verification. Partners are strictly instructed not to refund cash directly to customers without company approval.`
  },
  careers: {
    title: "Careers",
    text: `We are always looking to partner with dedicated, honest, and experienced individuals who want to grow their careers. By joining us, you get access to regular work opportunities, fair earnings, and a professional platform.<br><br>We value transparency and respect. Our system ensures clear job details and timely payments. Whether you are an electrician, plumber, or AC technician, Sofiyan Home Service Solutions offers a reliable platform for success.`
  },
  blogs: {
    title: "Our Blogs",
    text: `Welcome to the Sofiyan Home Service Solutions Blog. We regularly publish articles on electrician services, plumbing solutions, AC servicing tips, and home maintenance advice.<br><br>Our blogs also explain our Cash on Service payment method to ensure transparency. Stay updated with the latest home service trends and safety tips through our regularly updated blog section.`
  },
  contact_page: {
    title: "Get in Touch",
    text: `We’re here to help! If you have any questions or want to book a home service, feel free to get in touch. You can contact us for bookings, pricing, or feedback.<br><br>We follow a Cash on Service payment system. Whether it’s an electrical issue, plumbing work, or AC servicing, we are just a call or message away.`
  },
  delivery: {
    title: "Service & Delivery Policy",
    text: `Once a service request is placed, we assign a verified local technician based on availability. We aim for fast or same-day service. Technicians visit with proper tools.<br><br>We follow a Cash on Service payment policy. In case of delays, our support team will inform you in advance. Our goal is to deliver quality service while maintaining trust.`
  },
  sitemap: {
    title: "Sitemap & Support",
    text: `Customer satisfaction is our top priority. Contact us for home service bookings or support. If you face any issues, contact us immediately so we can resolve them promptly.<br><br>We follow a Cash on Service system for transparency.`
  }
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPanelMenuOpen, setIsPanelMenuOpen] = useState(false);
  const [activeContent, setActiveContent] = useState<keyof typeof siteContent | null>(null);
  const [userCity, setUserCity] = useState<string | null>(localStorage.getItem('preferredCity'));
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  // Preload City Images as early as possible
  React.useEffect(() => {
    CITY_DATA.forEach(city => {
      const img = new Image();
      img.src = city.img;
    });
  }, []);

  React.useEffect(() => {
    // Show city modal if none is selected
    if (!userCity) {
      setIsCityModalOpen(true);
    }

    // Listen for custom event if we want to update it from outside React
    const handleLocationUpdate = () => {
      setUserCity(localStorage.getItem('preferredCity'));
    };
    window.addEventListener('locationUpdated', handleLocationUpdate);
    window.addEventListener('cityUpdated', handleLocationUpdate);
    
    // Polyfill global openLocationModal to open our React City Modal
    (window as any).openLocationModal = () => setIsCityModalOpen(true);

    return () => {
      window.removeEventListener('locationUpdated', handleLocationUpdate);
      window.removeEventListener('cityUpdated', handleLocationUpdate);
    };
  }, [userCity]);

  const handleCitySelect = (cityName: string) => {
    setUserCity(cityName);
    localStorage.setItem('preferredCity', cityName);
    window.dispatchEvent(new Event('cityUpdated'));
    setIsCityModalOpen(false);
  };

  const openContent = (key: keyof typeof siteContent) => {
    setActiveContent(key);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeContent = () => {
    setActiveContent(null);
    document.body.style.overflow = 'unset'; // Restore background scrolling
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar - Visible on ALL pages for standardized navigation */}
      <nav className="bg-white border-b border-indigo-50 sticky top-0 z-40 shadow-sm block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                  <img 
                    src="https://i.postimg.cc/fW7TLq4Q/Whats-App-Image-2026-01-09-at-5-28-12-AM.jpg" 
                    alt="Sofiyan Home Service Solutions Logo" 
                    className="relative w-10 h-10 rounded-lg object-cover shadow-sm border border-white/50"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="font-black text-xl text-indigo-950 tracking-tighter uppercase">{BUSINESS_NAME}</span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-8">
              <button 
                onClick={() => setIsCityModalOpen(true)} 
                className="flex items-center space-x-1 text-indigo-900 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-4 py-2 rounded-full transition-all text-xs font-black border border-indigo-100 uppercase tracking-widest shadow-sm"
              >
                  <MapPin size={16} className="text-indigo-500" />
                  <span className="truncate max-w-[100px] xl:max-w-[150px]">{userCity || "Select City"}</span>
                  <i className="fas fa-chevron-down text-[10px] ml-1 opacity-50"></i>
              </button>
              <NavLink to="/" icon={<Home size={18} />} label="Home" />
              <NavLink to="/blogs" icon={<FileText size={18} />} label="Blogs" />
              <NavLink to="/partner" icon={<Users size={18} />} label="Partner" />
              <NavLink to="/admin" icon={<Lock size={18} />} label="Admin" />
              <a href="/influencer-portal.html" className="flex items-center space-x-1 text-white bg-indigo-950 hover:bg-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span>Influencer</span>
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden gap-3 relative">
              <button
                onClick={() => setIsPanelMenuOpen(!isPanelMenuOpen)}
                className={`p-2 rounded-xl border transition-all ${isPanelMenuOpen ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}
              >
                {isPanelMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Global Panel Menu Dropdown */}
              <AnimatePresence>
                {isPanelMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-indigo-50 overflow-hidden z-[60]"
                  >
                      <div className="p-2 space-y-1">
                          <Link 
                            to="/admin" 
                            onClick={() => setIsPanelMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 transition-colors group"
                          >
                              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                  <Lock size={16} />
                              </div>
                              <span className="text-xs font-black text-indigo-950 uppercase tracking-widest">Admin panel</span>
                          </Link>

                          <Link 
                            to="/partner" 
                            onClick={() => setIsPanelMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 transition-colors group"
                          >
                              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                  <Users size={16} />
                              </div>
                              <span className="text-xs font-black text-indigo-950 uppercase tracking-widest">Partner panel</span>
                          </Link>

                          <Link 
                            to="/blogs" 
                            onClick={() => setIsPanelMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 transition-colors group"
                          >
                              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                  <FileText size={16} />
                              </div>
                              <span className="text-xs font-black text-indigo-950 uppercase tracking-widest">Blog panel</span>
                          </Link>

                          <a 
                            href="/influencer-portal.html" 
                            onClick={() => setIsPanelMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 transition-colors group"
                          >
                              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                  <Star size={16} />
                              </div>
                              <span className="text-xs font-black text-indigo-950 uppercase tracking-widest">Influencer panel</span>
                          </a>
                      </div>
                      <div className="bg-indigo-950 p-4">
                          <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Navigation Center</p>
                          <p className="text-[10px] text-white/60 font-medium leading-tight tracking-tight uppercase">Switch Panels Instantly</p>
                      </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </nav>

      {/* Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Professional Footer (Fhocket Style) */}
      <footer className="bg-white text-gray-800 pt-16 pb-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Col 1: Brand */}
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-gray-950 uppercase tracking-tight">Sofiyan Home Service Solutions</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Your trusted partner for home services</p>
              
              <div className="mt-6">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Download App</p>
                <div className="flex gap-2">
                   {/* App Store Placeholder */}
                   <button className="bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs hover:opacity-80 transition-opacity w-32">
                      <div className="text-xl"></div>
                      <div className="flex flex-col items-start">
                        <span className="text-[0.6rem] leading-none">Download on the</span>
                        <span className="font-bold leading-none">App Store</span>
                      </div>
                   </button>
                   {/* Google Play Placeholder */}
                   <button className="bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs hover:opacity-80 transition-opacity w-32">
                      <div className="text-xl">▶</div>
                      <div className="flex flex-col items-start">
                        <span className="text-[0.6rem] leading-none">GET IT ON</span>
                        <span className="font-bold leading-none">Google Play</span>
                      </div>
                   </button>
                </div>
              </div>
            </div>

            {/* Col 2: Company */}
            <div>
              <h4 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.2em] mb-6 border-b-2 border-indigo-600 inline-block pb-1">Corporate</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><button onClick={() => openContent('about')} className="hover:text-indigo-600 font-bold transition-colors text-left w-full flex items-center gap-2">About Agency</button></li>
                <li><button onClick={() => openContent('terms')} className="hover:text-indigo-600 font-bold transition-colors text-left w-full flex items-center gap-2">Legal Terms</button></li>
                <li><button onClick={() => openContent('privacy')} className="hover:text-indigo-600 font-bold transition-colors text-left w-full flex items-center gap-2">Privacy Shield</button></li>
                <li><button onClick={() => openContent('refund')} className="hover:text-indigo-600 font-bold transition-colors text-left w-full flex items-center gap-2">Refund Policy</button></li>
                <li><button onClick={() => openContent('careers')} className="hover:text-indigo-600 font-bold transition-colors text-left w-full flex items-center gap-2">Career Hub</button></li>
              </ul>
            </div>

            {/* Col 3: For Customers */}
            <div>
              <h4 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.2em] mb-6 border-b-2 border-indigo-600 inline-block pb-1">Resources</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><button onClick={() => openContent('blogs')} className="hover:text-indigo-600 font-bold transition-colors text-left w-full flex items-center gap-2">Media Center</button></li>
                <li><button onClick={() => openContent('contact_page')} className="hover:text-indigo-600 font-bold transition-colors text-left w-full flex items-center gap-2">Help Desk</button></li>
                <li><button onClick={() => openContent('delivery')} className="hover:text-indigo-600 font-bold transition-colors text-left w-full flex items-center gap-2">Service Quality</button></li>
                <li><button onClick={() => openContent('sitemap')} className="hover:text-indigo-600 font-bold transition-colors text-left w-full flex items-center gap-2">Digital Map</button></li>
              </ul>
            </div>

            {/* Col 4: Contact Us */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b-2 border-gray-100 inline-block pb-1">Contact Us</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3 text-gray-900 font-medium">
                  <Phone size={16} className="text-gray-900 mt-0.5 flex-shrink-0" />
                  <span>+91 9219345455</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="break-all">sofiyansolutions1@gmail.com</span>
                </li>
                <li className="flex gap-4 mt-6">
                  <a href="https://www.instagram.com/sofiyansolutions/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-all"><Instagram size={20} /></a>
                  <a href="https://www.facebook.com/profile.php?id=61586535621069" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"><Facebook size={20} /></a>
                  <a href="https://www.youtube.com/@sofiyansolutions" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"><Youtube size={20} /></a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Sofiyan Home Service Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Content Modal Overlay */}
      {activeContent && (
        <div className="fixed inset-0 z-[100] bg-white animate-fadeIn overflow-y-auto">
          {/* Header of Modal */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-indigo-50 px-4 py-4 flex justify-between items-center z-10 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden shadow-indigo-100 shadow-lg border border-indigo-50">
                    <img 
                      src="https://i.postimg.cc/fW7TLq4Q/Whats-App-Image-2026-01-09-at-5-28-12-AM.jpg" 
                      alt="Logo" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                </div>
                <span className="font-black text-indigo-950 tracking-tighter uppercase text-sm">{BUSINESS_NAME}</span>
             </div>
             <button 
               onClick={closeContent}
               className="w-10 h-10 flex items-center justify-center bg-indigo-50 rounded-xl hover:bg-indigo-600 group transition-all"
             >
               <X size={20} className="text-indigo-600 group-hover:text-white transition-colors" />
             </button>
          </div>

          <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-5xl font-black text-indigo-950 mb-8 pb-4 border-b border-indigo-50 tracking-tighter uppercase">
              {siteContent[activeContent].title}
            </h1>
            <div 
              className="prose prose-lg prose-indigo max-w-none text-gray-600 leading-loose"
              dangerouslySetInnerHTML={{ __html: siteContent[activeContent].text }}
            />
            
             <div className="mt-16 pt-8 border-t border-indigo-50 text-center">
                <button 
                  onClick={closeContent}
                  className="px-10 py-4 bg-indigo-950 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-indigo-100"
                >
                  Back to Website
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Global City Selection Modal */}
      <Modal
          isOpen={isCityModalOpen}
          onClose={() => { if (userCity) setIsCityModalOpen(false); }}
          title="⚡ Select Operational Hub"
        >
           <div className="py-4">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-indigo-950 tracking-tighter uppercase mb-2">Regional Selection</h3>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] max-w-sm mx-auto">
                    Choose your geographic territory to begin deployment.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                 {CITY_DATA.map(city => (
                    <button
                       key={city.name}
                       onClick={() => handleCitySelect(city.name)}
                       className="group relative rounded-[2rem] overflow-hidden aspect-square shadow-xl shadow-indigo-100/50 border-2 border-transparent hover:border-indigo-600 transition-all transform hover:-translate-y-1 bg-indigo-50"
                    >
                       <img 
                          src={city.img} 
                          alt={city.name} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                          referrerPolicy="no-referrer"
                          loading="eager"
                          {...({ fetchpriority: "high" } as any)}
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-indigo-900/20 to-transparent flex flex-col justify-end p-4">
                          <p className="text-white font-black text-xs sm:text-sm tracking-widest uppercase">{city.name}</p>
                          <div className="w-10 h-0.5 bg-indigo-500 rounded-full mt-1.5 opacity-50 group-hover:w-full transition-all duration-500"></div>
                       </div>
                    </button>
                 ))}
              </div>
              <div className="mt-10 bg-indigo-950 p-6 rounded-[2rem] shadow-2xl shadow-indigo-200 border border-indigo-900 flex items-center gap-4">
                 <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
                    <CheckCircle size={24} />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Operational Truth</p>
                    <p className="text-[11px] text-white font-bold leading-relaxed italic opacity-80">
                        "Trusted by 50,000+ elite households for unparalleled quality home maintenance."
                    </p>
                 </div>
              </div>
           </div>
        </Modal>
    </div>
  );
};

const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        isActive 
          ? 'text-indigo-600 bg-indigo-50 shadow-inner' 
          : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
};
