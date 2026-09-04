const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const insertion1 = `export const CustomerPanel: React.FC = () => {`;
const carouselCode = `
const PromotionalCarousel: React.FC = () => {
  const baseImages = [
    "https://iili.io/nJFbxOQ.png",
    "https://iili.io/nJFbLkx.png",
    "https://iili.io/nJFpFcu.png",
    "https://iili.io/nJFp4Hb.png",
    "https://iili.io/nJFyBgn.png"
  ];
  // Duplicate images for longer scroll before rewind
  const images = [...baseImages, ...baseImages]; 
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
    <div className="w-full mt-10 mb-4 px-4 sm:px-8 max-w-7xl mx-auto">
      <style>
        {\`.scrollbar-hide::-webkit-scrollbar { display: none; }\`}
      </style>
      <div 
        ref={scrollRef} 
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory rounded-2xl"
        style={{ scrollBehavior: 'smooth' }}
      >
        {images.map((src, i) => (
          <div key={i} className="flex-none w-[90%] sm:w-[calc(33.333%-1rem)] snap-center sm:snap-start relative rounded-2xl overflow-hidden group">
            <img src={src} alt={\`Promotional Offer \${i + 1}\`} className="w-full h-auto object-cover rounded-2xl shadow-sm border border-gray-100 transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CustomerPanel: React.FC = () => {`;

if (content.includes(insertion1)) {
  content = content.replace(insertion1, carouselCode);
} else {
  console.log("Could not find insertion1");
}

const insertion2 = `        )}

        {/* UPGRADED: Mobile-Friendly Manual Scroll Featured Services */}`;
const replacement2 = `        )}

        {/* Promotional Banner Carousel */}
        <PromotionalCarousel />

        {/* UPGRADED: Mobile-Friendly Manual Scroll Featured Services */}`;

if (content.includes(insertion2)) {
  content = content.replace(insertion2, replacement2);
} else {
  console.log("Could not find insertion2");
}

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Carousel successfully patched.");
