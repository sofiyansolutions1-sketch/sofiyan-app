const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const reviewsComponent = `

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
          {\`.scrollbar-hide::-webkit-scrollbar { display: none; }\`}
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
`;

const customerReviewsEnd = '];';
if (!content.includes('const ReviewsCarousel = () => {')) {
  // Insert component
  const searchStr = '];\n\nconst featuredServicesData = [';
  if (content.includes(searchStr)) {
    content = content.replace(searchStr, '];\n' + reviewsComponent + '\nconst featuredServicesData = [');
  } else {
    // try just after the array
    const parts = content.split('  }\n];');
    if (parts.length > 1) {
       content = parts[0] + '  }\n];\n' + reviewsComponent + '\n' + parts[1];
    }
  }
}

// Replace existing Reviews section
const sectionRegex = /\{\/\* Customer Reviews Section \*\/\}[\s\S]*?(?=\{\/\* Trust Metrics \/ Stats Section \*\/\}|<div className="max-w-\[1800px\] mx-auto mt-20">)/;
const match = content.match(sectionRegex);

if (match) {
  content = content.replace(sectionRegex, '{/* Customer Reviews Section */}\n        <ReviewsCarousel />\n\n        ');
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Patched reviews section");
} else {
  console.log("Could not find Reviews section to replace");
}

