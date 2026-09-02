const fs = require('fs');
let code = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const target = `                <button 
                  onClick={() => { setSelectedService(null); setIsBookingModalOpen(true); }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-green-700 transition-colors"
                >
                  View Cart ({cartItemCount})
                </button>`;

const replacement = `                <button 
                  onClick={() => { setSelectedService(null); window.dispatchEvent(new Event('sofiyan_open_side_cart')); }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-green-700 transition-colors"
                >
                  View Cart ({cartItemCount})
                </button>`;

code = code.replace(target, replacement);
fs.writeFileSync('pages/CustomerPanel.tsx', code);
console.log("Done");
