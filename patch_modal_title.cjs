const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldModalStart = `title="All Services & Appliances"
      >
        <div className="p-4 sm:p-6 bg-white overflow-y-auto max-h-[70vh]">`;

const newModalStart = `title="AC & Appliance Repair"
      >
        <div className="p-4 sm:p-6 bg-white overflow-y-auto max-h-[70vh]">`;

content = content.replace(oldModalStart, newModalStart);

const homeServicesSection = `<h3 className="text-lg font-bold text-gray-900 mb-4">Home services</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
             {['Electrician', 'Plumbing', 'Cleaning'].map(cat => {
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
                     <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 border border-gray-100 shadow-sm">
                       <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                     </div>
                     <span className="text-xs font-medium text-gray-700 text-center">{c.name}</span>
                   </div>
                 )
             })}
          </div>`;

content = content.replace(homeServicesSection, '');
fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Modal patched to be Appliance only.");
