const fs = require('fs');
let code = fs.readFileSync('components/Layout.tsx', 'utf8');

const target = `              {/* Cart Button */}
              <button 
                onClick={() => window.dispatchEvent(new Event('sofiyan_open_cart'))} 
                className="bg-indigo-950 text-white hover:bg-black p-2 sm:p-2.5 rounded-xl transition-all relative flex items-center justify-center shadow-md shadow-indigo-900/10 active:scale-95 shrink-0"
                title="Cart / Checkout"
              >
                <span className="sr-only">Cart</span>
                <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center rounded-full border border-white shadow-sm scale-100 animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>`;

const replacement = `              {/* Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)} 
                className="bg-indigo-950 text-white hover:bg-black p-2 sm:p-2.5 rounded-xl transition-all relative flex items-center justify-center shadow-md shadow-indigo-900/10 active:scale-95 shrink-0"
                title="Cart / Checkout"
              >
                <span className="sr-only">Cart</span>
                <ShoppingCart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center rounded-full border border-white shadow-sm scale-100 animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>`;
code = code.replace(target, replacement);

fs.writeFileSync('components/Layout.tsx', code);
console.log("Done");
