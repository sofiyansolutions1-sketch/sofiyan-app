const fs = require('fs');

const subServicePageCode = `import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SERVICES, PREDEFINED_AREAS } from '../constants';
import { Shield, Star, Clock, CheckCircle, Wrench, AlertTriangle, Zap, ThumbsUp, MapPin, ChevronDown, Phone, MessageCircle } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { useStore } from '../hooks/useStore';

export const SubServicePage = () => {
  const { cityUrl, serviceUrl, subServiceUrl } = useParams<{ cityUrl: string; serviceUrl: string; subServiceUrl: string }>();
  
  const addToCart = useStore(state => state.addToCart);

  // Parse URLs
  const activeCity = cityUrl ? cityUrl.charAt(0).toUpperCase() + cityUrl.slice(1).toLowerCase() : 'Bangalore';
  
  // Find service
  const service = SERVICES.find(s => s.name.replace(/\\s+/g, '-').toLowerCase() === serviceUrl?.toLowerCase() || s.name.toLowerCase() === serviceUrl?.toLowerCase());
  
  // Find sub-service
  const subService = service?.subServices?.find(s => s.name.replace(/\\s+/g, '-').toLowerCase() === subServiceUrl?.toLowerCase() || s.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() === subServiceUrl?.toLowerCase());

  const formattedService = service?.name || serviceUrl;
  const formattedSubService = subService?.name || subServiceUrl?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Areas
  const cityAreas = PREDEFINED_AREAS[activeCity] || [];

  // SEO
  useEffect(() => {
    if (activeCity && formattedSubService) {
      document.title = \`Best \${formattedSubService} in \${activeCity} | \${formattedService} | Sofiyan\`;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', \`Looking for top-rated \${formattedSubService} in \${activeCity}? Book reliable \${formattedService} services at your doorstep with Sofiyan. Verified professionals, transparent pricing.\`);
      
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', \`https://www.sofiyanhomeservice.com/\${activeCity.toLowerCase()}/\${serviceUrl?.toLowerCase()}/\${subServiceUrl?.toLowerCase()}\`);

      // Inject FAQ Schema
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.id = 'faq-schema';
      schemaScript.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": \`How much does \${formattedSubService} cost in \${activeCity}?\`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": \`The starting price for \${formattedSubService} in \${activeCity} is ₹\${subService?.price}. Exact pricing may vary based on the exact scope of work.\`
            }
          },
          {
            "@type": "Question",
            "name": \`How much time does the \${formattedSubService} take?\`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Typically, it takes about 45 to 60 minutes depending on the complexity of the job."
            }
          },
          {
            "@type": "Question",
            "name": "Do you provide a warranty on the service?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we provide a 30-day service guarantee on all our bookings."
            }
          }
        ]
      });
      
      const existingSchema = document.getElementById('faq-schema');
      if (existingSchema) existingSchema.remove();
      document.head.appendChild(schemaScript);
    }
  }, [activeCity, formattedService, formattedSubService, serviceUrl, subServiceUrl, subService?.price]);

  if (!service || !subService) {
    return <div className="min-h-screen flex items-center justify-center pt-20">Loading or not found...</div>;
  }

  const handleAddToCart = () => {
    addToCart(subService, service.name);
    if ((window as any).syncVanillaCartUI) {
      (window as any).syncVanillaCartUI();
    }
  };

  const handleBookNow = () => {
    handleAddToCart();
    if (typeof window !== 'undefined' && (window as any).renderCartSidebar) {
      (window as any).renderCartSidebar();
      const sidebar = document.getElementById('cart-sidebar');
      if (sidebar) sidebar.classList.remove('translate-x-full');
    }
  };

  const originalPrice = Math.round(subService.price * 1.35);

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
                {formattedSubService} <span className="text-indigo-600 block sm:inline">in {activeCity}</span>
              </h1>
              
              {/* 3. Short introduction focused on the local customer */}
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Are you looking for reliable and expert {formattedSubService.toLowerCase()} near you? Sofiyan connects you with top-rated, verified professionals in {activeCity} for seamless, hassle-free service right at your doorstep.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div>
                    <span className="text-2xl font-black text-gray-900">₹{subService.price}</span>
                    <span className="text-sm text-gray-400 line-through ml-2">₹{originalPrice}</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Duration</p>
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-1"><Clock size={14}/> 45 Mins</p>
                  </div>
                </div>
                {/* 7. Pricing or “Get a Quote” CTA */}
                <button 
                  onClick={handleBookNow}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto"
                >
                  Book Service Now
                </button>
              </div>
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
            
            {/* 4. Service overview and key benefits */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">About {formattedSubService}</h2>
              <div className="prose prose-lg text-gray-600">
                <p>
                  When it comes to {formattedSubService.toLowerCase()} in {activeCity}, quality and trust are paramount. Our expert team ensures that every job is done with precision, using the best tools and industry-standard practices. We understand the local conditions of {activeCity} and tailor our services to provide long-lasting solutions.
                </p>
                <p className="mt-4">
                  Whether it's a minor fix or a major overhaul, our professionals are equipped to handle it efficiently, saving you time and preventing future breakdowns.
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
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                      <AlertTriangle size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900">Hidden Costs</h3>
                  </div>
                  <p className="text-sm text-gray-600">Many local providers add unexpected material and labor charges at the end.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                      <Zap size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900">Sofiyan's Solution</h3>
                  </div>
                  <p className="text-sm text-gray-600">Transparent, upfront pricing. You know exactly what you pay before the work starts.</p>
                </div>
              </div>
            </section>

            {/* 6. Services/features included */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">What's Included in the Service?</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "End-to-end diagnostic and troubleshooting",
                  "Labor charges for the primary service",
                  "Basic cleaning of the work area post-service",
                  "30-day service warranty on workmanship",
                  "Safety checks and performance testing",
                  "Expert recommendations for maintenance"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <CheckCircle className="text-indigo-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-sm text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 11. FAQs */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  { q: \`How much does \${formattedSubService} cost in \${activeCity}?\`, a: \`The starting price for \${formattedSubService} in \${activeCity} is ₹\${subService.price}. Exact pricing may vary based on the specific scope of work and any additional parts required.\` },
                  { q: \`How much time does the service take?\`, a: "Typically, it takes about 45 to 60 minutes. However, complex repairs might take slightly longer." },
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
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-600">
                    <Wrench size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Standardized Tools</h4>
                    <p className="text-sm text-gray-500 mt-1">We use the best equipment.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                {/* 12. Strong final CTA */}
                <h4 className="font-bold text-gray-900 mb-4 text-center">Need Help Booking?</h4>
                <div className="flex flex-col gap-3">
                  <a href="tel:+919876543210" className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                    <Phone size={18} /> Call Us Now
                  </a>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold hover:bg-[#1ebd5a] transition-colors">
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
              <h3 className="text-xl font-bold text-white mb-3">Book Service</h3>
              <p className="text-slate-400 text-sm max-w-xs">Select your preferred date and time. Get instant confirmation.</p>
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
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">We provide {formattedSubService.toLowerCase()} across all major neighborhoods in {activeCity}.</p>
        
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
