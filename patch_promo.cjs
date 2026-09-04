const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCarousel = `const PromotionalCarousel: React.FC = () => {
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
    <div className="w-full mt-10 mb-8 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
      <div className="flex flex-col mb-3 sm:mb-6">
          <h2 className="text-[22px] sm:text-3xl font-bold text-gray-900 tracking-normal">In the spotlight</h2>
      </div>
      <style>
        {\`.scrollbar-hide::-webkit-scrollbar { display: none; }\`}
      </style>
      <div 
        ref={scrollRef} 
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {images.map((src, i) => (
          <div key={i} className="flex-none w-[93%] sm:w-[calc(33.333%-1rem)] snap-start relative rounded-xl overflow-hidden group">
            <img src={src} alt={\`In the spotlight \${i + 1}\`} className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
};`;

const newCarousel = `const PromotionalCarousel: React.FC = () => {
  const basePromos = [
    { src: "https://iili.io/nJFbxOQ.png", category: "Chimney" },
    { src: "https://iili.io/nJFbLkx.png", category: "Cleaning" },
    { src: "https://iili.io/nJFpFcu.png", category: "AC" },
    { src: "https://iili.io/nJFp4Hb.png", category: "WaterPurifier" },
    { src: "https://iili.io/nJFyBgn.png", category: "WashingMachine" }
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
        {\`.scrollbar-hide::-webkit-scrollbar { display: none; }\`}
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
            <img src={promo.src} alt={\`In the spotlight \${promo.category}\`} className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
};`;

if (content.includes(oldCarousel)) {
    content = content.replace(oldCarousel, newCarousel);
    fs.writeFileSync('pages/CustomerPanel.tsx', content);
    console.log("Patched PromotionalCarousel successfully.");
} else {
    console.log("Old carousel not found.");
}
