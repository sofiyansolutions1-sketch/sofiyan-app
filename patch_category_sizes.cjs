const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldGrid = `<div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6 max-w-4xl">
            {mainCategories.map((category) => {
              return (
              <div
                key={category.id}
                onClick={(e) => {
                  e.preventDefault();
                  if (category.id === 'Appliances') {
                    setIsSeeAllModalOpen(true);
                  } else {
                    if ((window as any).openCategoryView) {
                      (window as any).openCategoryView(category.id);
                    } else if ((window as any).openCategoryModal) {
                      (window as any).openCategoryModal(category.id);
                    }
                  }
                }}
                className="flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div className="w-full aspect-[4/3] max-w-[120px] bg-[#f4f5f6] rounded-[16px] p-3 flex items-center justify-center transition-transform duration-300 group-hover:bg-[#ebebeb]">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-10 h-10 sm:w-14 sm:h-14 object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[11px] sm:text-[13px] font-medium text-gray-800 text-center leading-tight">
                  {category.name}
                </span>
              </div>
            )})}
          </div>`;

const newGrid = `<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-4 sm:gap-6 max-w-6xl">
            {mainCategories.map((category) => {
              return (
              <div
                key={category.id}
                onClick={(e) => {
                  e.preventDefault();
                  if (category.id === 'Appliances') {
                    setIsSeeAllModalOpen(true);
                  } else {
                    if ((window as any).openCategoryView) {
                      (window as any).openCategoryView(category.id);
                    } else if ((window as any).openCategoryModal) {
                      (window as any).openCategoryModal(category.id);
                    }
                  }
                }}
                className="flex flex-col items-center gap-3 sm:gap-5 cursor-pointer group"
              >
                <div className="w-full aspect-[4/3] max-w-[180px] bg-[#f4f5f6] rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 flex items-center justify-center transition-transform duration-300 group-hover:bg-[#ebebeb]">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-14 h-14 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[13px] sm:text-[16px] font-medium text-gray-900 text-center leading-tight">
                  {category.name}
                </span>
              </div>
            )})}
          </div>`;

content = content.replace(oldGrid, newGrid);
fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Sizes patched.");
