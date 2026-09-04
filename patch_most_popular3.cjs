const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

// Replace MostPopularCarousel component
const oldCarousel = `interface MostPopularCarouselProps {
  onBook: (name: string, price: number) => void;
}
const MostPopularCarousel: React.FC<MostPopularCarouselProps> = ({ onBook }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div id="featured-services-section" className="w-full mt-12 mb-8 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto bg-white relative">
      <div className="flex flex-col mb-3 sm:mb-6">
        <h2 className="text-[22px] sm:text-3xl font-bold text-gray-900 tracking-normal text-left">Most Popular Services</h2>
      </div>
      <style>
        {\`.scrollbar-hide::-webkit-scrollbar { display: none; }\`}
      </style>
      <div 
        ref={scrollRef} 
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {featuredServicesData.map((service, index) => (
          <div 
            key={\`\${service.name}-\${index}\`} 
            className="flex-none w-[150px] sm:w-[260px] lg:w-[calc(20%-1.2rem)] snap-start relative group cursor-pointer"
            onClick={() => onBook(service.name, service.price)}
          >
            <div className="relative h-32 sm:h-48 w-full rounded-xl overflow-hidden mb-3">
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
  );
};`;

const newCarousel = `interface MostPopularCarouselProps {
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
        {\`.scrollbar-hide::-webkit-scrollbar { display: none; }\`}
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
              key={\`\${service.name}-\${index}\`} 
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
};`;

if (content.includes(oldCarousel)) {
  content = content.replace(oldCarousel, newCarousel);
} else {
    // try index of replacement
    const sIdx = content.indexOf('interface MostPopularCarouselProps {');
    const eIdx = content.indexOf('export const CustomerPanel: React.FC = () => {');
    if (sIdx !== -1 && eIdx !== -1) {
        content = content.substring(0, sIdx) + newCarousel + '\n\n' + content.substring(eIdx);
    } else {
        console.log("Failed to patch MostPopularCarousel");
    }
}

// Add state for Modal
const stateHook = `  const [bookingStep, setBookingStep] = useState<'form' | 'loading' | 'success'>('form');`;
if (content.includes(stateHook)) {
    content = content.replace(stateHook, `  const [bookingStep, setBookingStep] = useState<'form' | 'loading' | 'success'>('form');\n  const [isSeeAllModalOpen, setIsSeeAllModalOpen] = useState(false);`);
}

// Update invocation of MostPopularCarousel
const oldInvocation = `<MostPopularCarousel onBook={handleFeaturedBooking} />`;
if (content.includes(oldInvocation)) {
    content = content.replace(oldInvocation, `<MostPopularCarousel onBook={handleFeaturedBooking} onSeeAll={() => setIsSeeAllModalOpen(true)} />`);
}

// Add the modal HTML just above the Profile Modal
const modalCode = `
      {/* See All Categories Modal */}
      <Modal
        isOpen={isSeeAllModalOpen}
        onClose={() => setIsSeeAllModalOpen(false)}
        title="AC & Appliance Repair"
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
                     className="flex flex-col items-center gap-2 cursor-pointer group"
                     onClick={() => {
                        setIsSeeAllModalOpen(false);
                        if (typeof window !== 'undefined' && (window as any).openCategoryView) {
                            (window as any).openCategoryView(c.name);
                        } else if (typeof window !== 'undefined' && (window as any).openCategoryModal) {
                            (window as any).openCategoryModal(c.name);
                        }
                     }}
                   >
                     <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-xl p-3 flex items-center justify-center transition-transform group-hover:scale-105 border border-gray-100 shadow-sm">
                       <img src={c.image} alt={c.name} className="w-full h-full object-contain" />
                     </div>
                     <span className="text-[10px] sm:text-xs font-medium text-gray-700 text-center">{c.name === 'WashingMachine' ? 'Washing Machine' : c.name}</span>
                   </div>
                 )
             })}
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-4">Other appliances</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
             {['Chimney', 'Microwave', 'WaterPurifier'].map(cat => {
                 const c = categoryList.find(x => x.name === cat);
                 if(!c) return null;
                 return (
                   <div 
                     key={c.name} 
                     className="flex flex-col items-center gap-2 cursor-pointer group"
                     onClick={() => {
                        setIsSeeAllModalOpen(false);
                        if (typeof window !== 'undefined' && (window as any).openCategoryView) {
                            (window as any).openCategoryView(c.name);
                        } else if (typeof window !== 'undefined' && (window as any).openCategoryModal) {
                            (window as any).openCategoryModal(c.name);
                        }
                     }}
                   >
                     <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-xl p-3 flex items-center justify-center transition-transform group-hover:scale-105 border border-gray-100 shadow-sm">
                       <img src={c.image} alt={c.name} className="w-full h-full object-contain" />
                     </div>
                     <span className="text-[10px] sm:text-xs font-medium text-gray-700 text-center">{c.name === 'WaterPurifier' ? 'RO/Water Purifier' : c.name}</span>
                   </div>
                 )
             })}
          </div>
        </div>
      </Modal>

      {renderProfileModal()}`;

if (content.includes('{renderProfileModal()}')) {
    content = content.replace('{renderProfileModal()}', modalCode);
}

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Success patching.");
