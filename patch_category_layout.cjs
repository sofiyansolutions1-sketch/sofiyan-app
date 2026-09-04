const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

// Fix URLs in mainCategories
const oldCategoriesRegex = /const mainCategories = \[\s*\{ id: "AC".*?\{ id: "Cleaning".*?\];/s;
const newCategories = `const mainCategories = [
    { id: "AC", name: "AC", image: "https://iili.io/nJSqYJt.png" },
    { id: "Electrician", name: "Electrical", image: "https://iili.io/nJS1G9e.png" },
    { id: "Plumbing", name: "Plumbing", image: "https://iili.io/nJSl9VV.png" },
    { id: "Appliances", name: "Appliances", image: "https://iili.io/nJScxae.png" },
    { id: "Cleaning", name: "Cleaning", image: "https://iili.io/nJSaR1t.png" }
];`;
content = content.replace(oldCategoriesRegex, newCategories);

// Fix grid layout
const oldGrid = `<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-4 sm:gap-6 max-w-6xl">
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

const newGrid = `<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-8 max-w-5xl">
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
                className="flex flex-col items-center gap-3 sm:gap-5 cursor-pointer group w-full"
              >
                <div className="w-full aspect-[16/9] bg-[#f4f5f6] rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 flex items-center justify-center transition-transform duration-300 group-hover:bg-[#ebebeb] overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="h-20 sm:h-28 md:h-36 lg:h-40 object-contain transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[15px] sm:text-[18px] md:text-[20px] font-medium text-gray-900 text-center leading-tight">
                  {category.name}
                </span>
              </div>
            )})}
          </div>`;

content = content.replace(oldGrid, newGrid);

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Layout and images patched.");
