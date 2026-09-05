const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldClickHandler = `onClick={() => {
              const cat = promo.category;
              if (cat === 'AC' || cat === 'Electrician' || cat === 'Plumbing' || cat === 'Cleaning') {
                if (typeof window !== 'undefined' && (window as any).openCategoryView) {
                  (window as any).openCategoryView(cat);
                } else if (typeof window !== 'undefined' && (window as any).openCategoryModal) {
                  (window as any).openCategoryModal(cat);
                }
              } else {
                if (onApplianceClick) onApplianceClick();
              }
            }}`;

const newClickHandler = `onClick={() => {
              if (typeof window !== 'undefined' && (window as any).openCategoryView) {
                (window as any).openCategoryView(promo.category);
              } else if (typeof window !== 'undefined' && (window as any).openCategoryModal) {
                (window as any).openCategoryModal(promo.category);
              }
            }}`;

content = content.replace(oldClickHandler, newClickHandler);

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Promo click handler patched to directly open category view.");
