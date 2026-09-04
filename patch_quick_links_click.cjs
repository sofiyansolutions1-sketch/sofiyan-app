const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldOnClick = `                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        if (item.category) {
                          const targetService = SERVICES.find(s => s.name === item.category);
                          if (targetService) {
                            setSelectedService(targetService);
                          }
                        }
                      }}`;

const newOnClick = `                      onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        if (item.category) {
                          if (typeof window !== 'undefined' && (window as any).openCategoryView) {
                            (window as any).openCategoryView(item.category);
                          } else if (typeof window !== 'undefined' && (window as any).openCategoryModal) {
                            (window as any).openCategoryModal(item.category);
                          } else {
                            const targetService = SERVICES.find(s => s.name === item.category);
                            if (targetService) {
                              setSelectedService(targetService);
                            }
                          }
                        }
                      }}`;

if (content.includes(oldOnClick)) {
  content = content.replace(oldOnClick, newOnClick);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Successfully patched quick link click handler");
} else {
  console.log("Could not find the old click handler in CustomerPanel.tsx");
}
