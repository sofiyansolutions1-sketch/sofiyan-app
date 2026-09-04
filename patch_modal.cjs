const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldModal = `{/* See All Categories Modal */}
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
      </Modal>`;

const newModal = `{/* See All Categories Modal */}
      <Modal
        isOpen={isSeeAllModalOpen}
        onClose={() => setIsSeeAllModalOpen(false)}
        title="All Services & Appliances"
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
                     <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 border border-gray-100 shadow-sm">
                       <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                     </div>
                     <span className="text-xs font-medium text-gray-700 text-center">{c.name === 'WashingMachine' ? 'Washing Machine' : c.name}</span>
                   </div>
                 )
             })}
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-4">Small appliances</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-8">
             {['Chimney', 'Microwave', 'WaterPurifier', 'Geyser'].map(cat => {
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
                     <span className="text-xs font-medium text-gray-700 text-center">{c.name === 'WaterPurifier' ? 'RO/Water Purifier' : c.name}</span>
                   </div>
                 )
             })}
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4">Home services</h3>
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
          </div>
        </div>
      </Modal>`;

if (content.includes(oldModal)) {
    content = content.replace(oldModal, newModal);
    fs.writeFileSync('pages/CustomerPanel.tsx', content);
    console.log("Modal patched successfully");
} else {
    console.log("Could not find old modal code. Trying substring matching...");
    // Fallback if formatting was slightly different
    const startIdx = content.indexOf('{/* See All Categories Modal */}');
    const endIdx = content.indexOf('{renderProfileModal()}');
    if (startIdx !== -1 && endIdx !== -1) {
        content = content.substring(0, startIdx) + newModal + "\n\n      " + content.substring(endIdx);
        fs.writeFileSync('pages/CustomerPanel.tsx', content);
        console.log("Modal patched successfully via substring");
    } else {
        console.log("Failed to patch entirely.");
    }
}
