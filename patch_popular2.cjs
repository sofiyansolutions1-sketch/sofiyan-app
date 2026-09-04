const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const startIndex = content.indexOf('{featuredServicesData.map((service, index) => (');
const endIndexStr = '              ))}';
let endIndex = content.indexOf(endIndexStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const newCards = `{featuredServicesData.map((service, index) => (
                <div 
                   key={\`\${service.name}-\${index}\`} 
                   className="snap-start flex-shrink-0 w-[140px] sm:w-[220px] group cursor-pointer relative"
                   onClick={() => handleFeaturedBooking(service.name, service.price)}
                >
                  <div className="relative h-32 sm:h-44 w-full rounded-xl overflow-hidden mb-3">
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
`;
  content = content.substring(0, startIndex) + newCards + content.substring(endIndex);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Cards patched successfully part 2.");
} else {
  console.log("Could not find the bounds for cards. start=" + startIndex + " end=" + endIndex);
}
