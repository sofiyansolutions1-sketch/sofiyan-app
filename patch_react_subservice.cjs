const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const targetStr = `                    <div
                      key={sub.id}
                      className="relative p-5 pt-7 border border-indigo-50 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center group overflow-hidden"
                    >`;

const newStr = `                    <div
                      key={sub.id}
                      onClick={() => {
                        const city = localStorage.getItem('preferredCity') || 'Bangalore';
                        const srvSlug = selectedService.name.toLowerCase().replace(/\\s+/g, '-');
                        const subSlug = sub.name.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                        window.location.href = '/' + city.toLowerCase() + '/' + srvSlug + '/' + subSlug;
                      }}
                      className="relative p-5 pt-7 border border-indigo-50 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center group overflow-hidden cursor-pointer"
                    >`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  
  // also need to stop propagation on the add to cart buttons
  content = content.replace('className="w-full sm:w-auto flex justify-end"', 'className="w-full sm:w-auto flex justify-end" onClick={(e) => e.stopPropagation()}');
  
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("CustomerPanel subservice click patched");
} else {
  console.log("Could not find the target React div in CustomerPanel.tsx");
}
