import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Mail, Home, Users, Lock, Menu, X, Facebook, Twitter, Instagram, Linkedin, MapPin, ChevronRight, Youtube } from 'lucide-react';
import { BUSINESS_NAME, EMAIL, HELPLINE } from '../constants';

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
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeContent, setActiveContent] = useState<keyof typeof siteContent | null>(null);

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
      {/* Top Bar */}
      <div className="bg-indigo-900 text-white py-2 px-4 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1"><Phone size={14} /> {HELPLINE}</span>
            <span className="hidden sm:flex items-center gap-1"><Mail size={14} /> {EMAIL}</span>
          </div>
          <div className="font-semibold tracking-wide">Trusted Home Services</div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  S
                </div>
                <span className="font-bold text-xl text-gray-800 tracking-tight">{BUSINESS_NAME}</span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink to="/" icon={<Home size={18} />} label="Customer" />
              <NavLink to="/partner" icon={<Users size={18} />} label="Partner" />
              <NavLink to="/admin" icon={<Lock size={18} />} label="Admin" />
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-indigo-600 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)} label="Customer Panel" />
              <MobileNavLink to="/partner" onClick={() => setIsMenuOpen(false)} label="Partner Panel" />
              <MobileNavLink to="/admin" onClick={() => setIsMenuOpen(false)} label="Admin Panel" />
            </div>
          </div>
        )}
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
              <h3 className="text-xl font-extrabold text-indigo-900 uppercase tracking-wide">Sofiyan Home Service Solutions</h3>
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
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b-2 border-indigo-100 inline-block pb-1">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button onClick={() => openContent('about')} className="hover:text-indigo-600 transition-colors text-left w-full">About Us</button></li>
                <li><button onClick={() => openContent('terms')} className="hover:text-indigo-600 transition-colors text-left w-full">Terms of Service</button></li>
                <li><button onClick={() => openContent('privacy')} className="hover:text-indigo-600 transition-colors text-left w-full">Privacy Policy</button></li>
                <li><button onClick={() => openContent('refund')} className="hover:text-indigo-600 transition-colors text-left w-full">Cancellation & Refund</button></li>
                <li><button onClick={() => openContent('careers')} className="hover:text-indigo-600 transition-colors text-left w-full">Careers</button></li>
              </ul>
            </div>

            {/* Col 3: For Customers */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b-2 border-indigo-100 inline-block pb-1">For Customers</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button onClick={() => openContent('blogs')} className="hover:text-indigo-600 transition-colors text-left w-full">Our Blogs</button></li>
                <li><button onClick={() => openContent('contact_page')} className="hover:text-indigo-600 transition-colors text-left w-full">Contact Us</button></li>
                <li><button onClick={() => openContent('delivery')} className="hover:text-indigo-600 transition-colors text-left w-full">Service Policy</button></li>
                <li><button onClick={() => openContent('sitemap')} className="hover:text-indigo-600 transition-colors text-left w-full">Sitemap</button></li>
              </ul>
            </div>

            {/* Col 4: Contact Us */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b-2 border-indigo-100 inline-block pb-1">Contact Us</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <Phone size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>+91 9219345455</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
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
          <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex justify-between items-center z-10">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
                <span className="font-bold text-gray-900">{BUSINESS_NAME}</span>
             </div>
             <button 
               onClick={closeContent}
               className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
             >
               <X size={24} className="text-gray-800" />
             </button>
          </div>

          <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 pb-4 border-b border-gray-100">
              {siteContent[activeContent].title}
            </h1>
            <div 
              className="prose prose-lg prose-indigo max-w-none text-gray-600 leading-loose"
              dangerouslySetInnerHTML={{ __html: siteContent[activeContent].text }}
            />
            
             <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                <button 
                  onClick={closeContent}
                  className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
                >
                  Back to Website
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? 'text-indigo-600 bg-indigo-50' 
          : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
};

const MobileNavLink = ({ to, onClick, label }: { to: string; onClick: () => void; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-3 py-2 rounded-md text-base font-medium ${
        isActive
          ? 'text-indigo-600 bg-indigo-50'
          : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </Link>
  );
};