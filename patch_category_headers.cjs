const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

// Patch "Explore all services"
const oldExplore = `<span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Catalog</span>
                <h3 className="text-2xl sm:text-3xl font-black text-indigo-950 uppercase tracking-tighter">Explore all services</h3>`;
const newExplore = `<h2 className="text-[22px] sm:text-3xl font-bold text-gray-900 tracking-normal">Explore all services</h2>`;

if (content.includes(oldExplore)) {
  content = content.replace(oldExplore, newExplore);
}

// Patch "Most Popular Services"
const oldPopular = `<div className="text-center mb-6 sm:mb-10 px-4">
            <h2 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Elite Selection</h2>
            <h3 className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tighter uppercase italic">Most Popular Services</h3>
          </div>`;
const newPopular = `<div className="flex flex-col mb-4 sm:mb-6 px-4 max-w-[1800px] mx-auto w-full">
            <h2 className="text-[22px] sm:text-3xl font-bold text-gray-900 tracking-normal text-left sm:text-center">Most Popular Services</h2>
          </div>`;

if (content.includes(oldPopular)) {
  content = content.replace(oldPopular, newPopular);
}

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Headers patched.");
