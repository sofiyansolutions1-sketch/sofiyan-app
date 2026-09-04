const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldSpotlight = `  return (
    <div className="w-full mt-10 mb-8 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
      <div className="flex flex-col mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 uppercase tracking-tighter">In the spotlight</h2>
      </div>
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
            <img src={src} alt={\`In the spotlight \${i + 1}\`} className="w-full h-auto object-cover rounded-2xl shadow-sm transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );`;

const newSpotlight = `  return (
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
  );`;

if (content.includes(oldSpotlight)) {
  content = content.replace(oldSpotlight, newSpotlight);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Spotlight mobile UI updated successfully.");
} else {
  console.log("Could not find the old spotlight code.");
}
