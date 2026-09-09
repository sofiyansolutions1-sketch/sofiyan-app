import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SERVICES, PREDEFINED_AREAS } from '../constants';
import { Shield, Star, CheckCircle, Wrench, AlertTriangle, Zap, ThumbsUp, MapPin, ChevronDown, Phone, MessageCircle } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { useStore } from '../hooks/useStore';

export const ServicePage = () => {
  const { cityUrl, serviceUrl } = useParams<{ cityUrl: string; serviceUrl: string }>();
  const cart = useStore(state => state.cart);
  const addToCart = useStore(state => state.addToCart);

  // Parse URLs
  const adminPhone = ((import.meta as any).env.VITE_ADMIN_PHONE || '8115983887').replace(/\+/g, '');
  const activeCity = cityUrl ? cityUrl.charAt(0).toUpperCase() + cityUrl.slice(1).toLowerCase() : 'Bangalore';
  
  // Find service
  const service = SERVICES.find(s => s.name.replace(/\s+/g, '-').toLowerCase() === serviceUrl?.toLowerCase() || s.name.toLowerCase() === serviceUrl?.toLowerCase());
  
  const formattedService = service?.name || serviceUrl?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Areas
  const cityAreas = PREDEFINED_AREAS[activeCity] || [];

  

  if (!service) {
    return <div className="min-h-screen flex items-center justify-center pt-20">Loading or not found...</div>;
  }

  return (
    <div className="min-h-screen bg-white pt-20 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {/* 1. Breadcrumbs */}
        <Breadcrumb />
      </div>

      {/* Hero Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl p-8 md:p-12 border border-indigo-50">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm text-indigo-700 font-bold text-xs mb-6 uppercase tracking-wider border border-indigo-100">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                Top Rated in {activeCity}
              </div>
              
              {/* 2. SEO-friendly H1 */}
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                {formattedService} Services <span className="text-indigo-600 block sm:inline">in {activeCity}</span>
              </h1>
              
              {/* 3. Short introduction focused on the local customer */}
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Need professional {formattedService.toLowerCase()} near you? Sofiyan connects you with top-rated, verified experts in {activeCity} for seamless, hassle-free service right at your doorstep.
              </p>

            </div>
            <div className="flex-shrink-0 w-full lg:w-1/3">
               <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10"></div>
                 <h3 className="font-black text-gray-900 text-xl mb-4">Service Overview</h3>
                 <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={18} />
                      <span className="text-sm text-gray-700 font-medium">100% Satisfaction Guarantee</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={18} />
                      <span className="text-sm text-gray-700 font-medium">Verified Background Checked Techs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={18} />
                      <span className="text-sm text-gray-700 font-medium">Upfront Transparent Pricing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={18} />
                      <span className="text-sm text-gray-700 font-medium">Same Day Service Available</span>
                    </li>
                 </ul>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Main Content Left */}
          <div className="lg:col-span-2 space-y-16">
            
            
            {/* Sub-services List (Original Style) */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Available {formattedService} Options</h2>
              <div className="grid gap-3">
                {service.subServices.map((sub, index) => {
                   const srvSlug = service.name.toLowerCase().replace(/\s+/g, '-');
                   const subSlug = sub.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                   const linkUrl = `/${activeCity.toLowerCase()}/${srvSlug}/${subSlug}`;
                   
                   const cartItem = cart.find(c => c.id === sub.id);
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
                      onClick={() => window.location.href = linkUrl}
                      className="relative p-5 pt-7 border border-indigo-50 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center group overflow-hidden cursor-pointer"
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
                      
                      <div className="w-full sm:w-auto flex justify-end" onClick={(e) => e.stopPropagation()}>
                        {cartItem ? (
                          <div className="flex items-center gap-3 bg-indigo-50 rounded-xl border border-indigo-100 px-2 py-1.5 shadow-inner">
                              <button onClick={() => useStore.getState().updateQuantity(cartItem.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white hover:bg-indigo-100 rounded-lg text-indigo-700 shadow-sm transition-all"><span className="font-bold">-</span></button>
                              <span className="font-black text-indigo-900 w-6 text-center text-sm">{cartItem.quantity}</span>
                              <button onClick={() => useStore.getState().updateQuantity(cartItem.id, 1)} className="w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white shadow-sm transition-all"><span className="font-bold text-white">+</span></button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              addToCart(sub, service.name);
                              if ((window as any).syncVanillaCartUI) {
                                (window as any).syncVanillaCartUI();
                              }
                            }} 
                            className="bg-white border-2 border-indigo-100 text-indigo-700 font-black px-8 py-2.5 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 shadow-sm transition-all uppercase tracking-wider text-xs w-full sm:w-auto"
                          >
                            ADD
                          </button>
                        )}
                      </div>
                    </div>
                   );
                })}
              </div>
            </section>

            {/* 4. Service overview and key benefits */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">About {formattedService} in {activeCity}</h2>
              <div className="prose prose-lg text-gray-600">
                <p>
                  When it comes to {formattedService.toLowerCase()} in {activeCity}, quality and trust are paramount. Our expert team ensures that every job is done with precision, using the best tools and industry-standard practices. We understand the local conditions of {activeCity} and tailor our services to provide long-lasting solutions.
                </p>
              </div>
            </section>

            {/* 5. Problems customers face + our solutions */}
            <section className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-8 text-center tracking-tight">Common Problems & Our Solutions</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                      <AlertTriangle size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900">Unreliable Technicians</h3>
                  </div>
                  <p className="text-sm text-gray-600">Finding a trustworthy professional who shows up on time is a major headache.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                      <Zap size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900">Sofiyan's Solution</h3>
                  </div>
                  <p className="text-sm text-gray-600">We assign 100% verified, trained professionals who respect your time and home.</p>
                </div>
              </div>
            </section>

            {/* 11. FAQs */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  { q: `What areas do you serve in ${activeCity}?`, a: `We provide ${formattedService} across all major neighborhoods in ${activeCity}.` },
                  { q: `How much time does the service take?`, a: "Typically, it takes about 45 to 60 minutes depending on the specific job." },
                  { q: "Do you provide a warranty on the service?", a: "Yes, Sofiyan provides a 30-day service guarantee on all our bookings to ensure your complete peace of mind." },
                  { q: "Do I need to arrange any tools?", a: "No, our professionals carry their own standardized toolkit and basic equipment required for the job." }
                ].map((faq, idx) => (
                  <details key={idx} className="group bg-white border border-gray-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-5 text-gray-900 font-bold">
                      {faq.q}
                      <ChevronDown className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180 text-gray-500" />
                    </summary>
                    <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar Right */}
          <div className="space-y-8">
            
            {/* 8. Why Choose Us */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm sticky top-24">
              <h3 className="font-black text-xl text-gray-900 mb-6">Why Sofiyan?</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-600">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Verified Experts</h4>
                    <p className="text-sm text-gray-500 mt-1">Background checked professionals.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-600">
                    <ThumbsUp size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Guaranteed Quality</h4>
                    <p className="text-sm text-gray-500 mt-1">30 days rework assurance.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                {/* 12. Strong final CTA */}
                <h4 className="font-bold text-gray-900 mb-4 text-center">Need Help Booking?</h4>
                <div className="flex flex-col gap-3">
                  <a href={`tel:+91${adminPhone}`} className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                    <Phone size={18} /> Call Us Now
                  </a>
                  <a href={`https://wa.me/91${adminPhone}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold hover:bg-[#1ebd5a] transition-colors">
                    <MessageCircle size={18} /> WhatsApp Us
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 9. How It Works */}
      <div className="bg-slate-900 py-16 mt-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white mb-12 text-center tracking-tight">How Sofiyan Works</h2>
          <div className="grid sm:grid-cols-3 gap-8 text-center relative">
            <div className="hidden sm:block absolute top-12 left-[16.66%] right-[16.66%] h-0.5 bg-slate-800 -z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl mb-6 shadow-xl rotate-3">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Select Service</h3>
              <p className="text-slate-400 text-sm max-w-xs">Browse and select your preferred {formattedService.toLowerCase()} option.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl mb-6 shadow-xl -rotate-3">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Pro Arrives</h3>
              <p className="text-slate-400 text-sm max-w-xs">Our verified partner arrives on time with all necessary tools.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl mb-6 shadow-xl rotate-3">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Job Done</h3>
              <p className="text-slate-400 text-sm max-w-xs">Pay after the service is completed to your satisfaction.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 10. Service availability/location information */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Available Areas in {activeCity}</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">We provide {formattedService.toLowerCase()} across all major neighborhoods in {activeCity}.</p>
        
        {cityAreas.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-3">
            {cityAreas.map((area, idx) => (
              <span key={idx} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 font-medium">
                <MapPin size={14} className="text-indigo-600" />
                {area}
              </span>
            ))}
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-full font-medium">
            <MapPin size={18} /> Serving all areas in {activeCity}
          </div>
        )}
      </div>

    </div>
  );
};
