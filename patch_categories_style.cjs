const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const regex = /<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-3 sm:gap-6">[\s\S]*?(?=<\/div>\s*\}\s*<PromotionalCarousel \/>)/;

const newGridCode = `<div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-8 max-w-4xl">
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
                className="flex flex-col items-center gap-3 sm:gap-4 cursor-pointer group"
              >
                <div className="w-full aspect-[4/3] max-w-[140px] bg-[#f4f5f6] rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 flex items-center justify-center transition-transform duration-300 group-hover:bg-[#ebebeb]">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[12px] sm:text-[14px] font-medium text-gray-900 text-center leading-tight">
                  {category.name}
                </span>
              </div>
            )})}
          </div>`;

content = content.replace(regex, newGridCode);
fs.writeFileSync('pages/CustomerPanel.tsx', content);
