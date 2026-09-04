const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

// 1. Insert MostPopularCarousel component
const carouselCode = `
interface MostPopularCarouselProps {
  onBook: (name: string, price: number) => void;
}
const MostPopularCarousel: React.FC<MostPopularCarouselProps> = ({ onBook }) => {
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
    }, 3500); // slightly different interval to avoid syncing exactly with spotlight
    return () => clearInterval(timer);
  }, []);

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
};

export const CustomerPanel: React.FC = () => {`;

if (content.includes('export const CustomerPanel: React.FC = () => {')) {
  content = content.replace('export const CustomerPanel: React.FC = () => {', carouselCode);
}

// 2. Replace the old Most Popular Services section with <MostPopularCarousel onBook={handleFeaturedBooking} />
const startIndex = content.indexOf('<div id="featured-services-section" className="mt-12 mb-4 py-8 bg-white relative overflow-hidden">');
const endIndexStr = '        {/* Sticky Cart Footer */}';
const endIndex = content.indexOf(endIndexStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + '        <MostPopularCarousel onBook={handleFeaturedBooking} />\n\n' + content.substring(endIndex);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("MostPopular patched successfully.");
} else {
  console.log("Could not find bounds for replacement.");
}
