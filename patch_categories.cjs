const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

// The new main categories definition
const mainCategoriesCode = `const mainCategories = [
    { id: "AC", name: "AC", image: "https://i.postimg.cc/s2SR2Pvz/Chat-GPT-Image-Mar-25-2026-06-17-17-PM.png" },
    { id: "Electrician", name: "Electrician", image: "https://i.postimg.cc/tCXRmc7V/Chat-GPT-Image-Mar-25-2026-06-17-31-PM.png" },
    { id: "Plumbing", name: "Plumbing", image: "https://i.postimg.cc/L5vSpHhY/Chat-GPT-Image-Mar-25-2026-06-17-26-PM.png" },
    { id: "Appliances", name: "Appliances", image: "https://i.postimg.cc/FsBtgCL8/Chat-GPT-Image-Mar-25-2026-06-17-13-PM.png" },
    { id: "Cleaning", name: "Cleaning", image: "https://i.postimg.cc/0Np241Gb/Chat-GPT-Image-Mar-25-2026-06-16-45-PM.png" }
];
`;

if (!content.includes('const mainCategories = [')) {
    content = content.replace('const categoryList = [', mainCategoriesCode + '\nconst categoryList = [');
}

// Find the rendering part
const renderRegex = /\{\/\* Categories Grid - Optimized for density like UC \*\/\}.*?(?=\{\/\* End Categories Grid \*\/\}|<div className="mt-28 py-20)/s;

const newRenderCode = `{/* Categories Grid - Optimized for density like UC */}
        {searchQuery ? (
          filteredCategories.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-8">
              {filteredCategories.map((category) => {
                const cleanRoute = \`/services/\${category.name.toLowerCase().replace(/\\s+/g, '-')}\`;
                return (
                <a
                  key={category.name}
                  href={cleanRoute}
                  onClick={(e) => {
                    e.preventDefault();
                    if ((window as any).openCategoryView) {
                      (window as any).openCategoryView(category.name);
                    } else if ((window as any).openCategoryModal) {
                      (window as any).openCategoryModal(category.name);
                    }
                  }}
                  className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg h-32 sm:h-48 cursor-pointer w-full transition-all duration-300 hover:shadow-indigo-200/50 hover:scale-[1.02] block border border-indigo-50 bg-white"
                >
                  <img 
                     src={category.image} 
                     alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-indigo-950 via-indigo-950/40 to-transparent p-2 sm:p-5 flex flex-col justify-end items-center h-full z-20">
                    <span className="text-white font-black text-[9px] sm:text-xs tracking-widest uppercase text-center leading-tight">
                      {category.name}
                    </span>
                  </div>
                </a>
              )})}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No categories available.</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-3 sm:gap-6">
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
                className="flex flex-col items-center gap-2 sm:gap-3 cursor-pointer group"
              >
                <div className="w-full aspect-[4/3] bg-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md border border-gray-100/50">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center group-hover:text-indigo-600 transition-colors">
                  {category.name}
                </span>
              </div>
            )})}
          </div>
        )}
        
        <PromotionalCarousel />`;

// Let's replace precisely by slicing.
const marker1 = '{/* Categories Grid - Optimized for density like UC */}';
const marker2 = '<PromotionalCarousel />';

const startIndex = content.indexOf(marker1);
const endIndex = content.indexOf(marker2) + marker2.length;

if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + newRenderCode + content.substring(endIndex);
    fs.writeFileSync('pages/CustomerPanel.tsx', content);
    console.log('Categories successfully updated.');
} else {
    console.log('Markers not found!');
}

