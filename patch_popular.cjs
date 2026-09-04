const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCards = `              {featuredServicesData.map((service, index) => (
                <div 
                   key={\`\${service.name}-\${index}\`} 
                   className="snap-start flex-shrink-0 w-48 sm:w-64 bg-white rounded-[2rem] shadow-lg shadow-indigo-100/30 border border-indigo-50/50 overflow-hidden group cursor-pointer relative transition-transform"
                >
                  <div className="relative h-32 sm:h-40 overflow-hidden">
                    <img src={service.img} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" referrerPolicy="no-referrer" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-indigo-950 text-[8px] font-black px-2 py-1 rounded-full flex items-center shadow-lg border border-indigo-100 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span> Open
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-black text-indigo-950 text-xs sm:text-sm mb-1 truncate uppercase tracking-tight" title={service.name}>{service.name}</h3>
                    <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 mb-3 h-7 overflow-hidden leading-tight uppercase tracking-wider">{service.desc}</p>
                    <div className="flex justify-between items-center bg-indigo-50/50 p-1.5 sm:p-2 rounded-xl border border-indigo-100/50">
                        <div className="pl-1">
                           <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest leading-none">STARTING</p>
                           <span className="font-black text-indigo-950 text-base sm:text-lg tracking-tighter">₹{service.price}</span>
                        </div>
                        <button 
                           onClick={() => handleFeaturedBooking(service.name, service.price)}
                          className="bg-indigo-950 text-white text-[9px] font-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg tracking-[0.05em] uppercase hover:bg-black transition-all shadow-md shadow-indigo-100"
                        >
                            Book Job
                        </button>
                    </div>
                  </div>
                </div>
              ))}`;

const newCards = `              {featuredServicesData.map((service, index) => (
                <div 
                   key={\`\${service.name}-\${index}\`} 
                   className="snap-start flex-shrink-0 w-[140px] sm:w-[220px] group cursor-pointer relative"
                   onClick={() => handleFeaturedBooking(service.name, service.price)}
                >
                  <div className="relative h-32 sm:h-44 w-full rounded-2xl overflow-hidden mb-3">
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
              ))}`;

if (content.includes(oldCards)) {
  content = content.replace(oldCards, newCards);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Cards patched successfully.");
} else {
  console.log("Could not find the old cards code.");
}
