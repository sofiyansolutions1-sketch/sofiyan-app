const fs = require('fs');
let code = fs.readFileSync('components/Layout.tsx', 'utf8');

const importTarget = `import { Modal } from './Modal';
import { CheckCircle, MapPin } from 'lucide-react';`;
const importReplacement = `import { Modal } from './Modal';
import { CheckCircle, MapPin, Trash2, ShoppingCart } from 'lucide-react';`;
code = code.replace(importTarget, importReplacement);

const stateTarget = `  const [cartCount, setCartCount] = useState(() => {
    try {
      const saved = localStorage.getItem('sofiyan_cart');
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  });`;

const stateReplacement = `  const [cartItems, setCartItems] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('sofiyan_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartCount = cartItems.length;
  
  const updateQuantityGlobal = (itemId: string, delta: number) => {
    const saved = localStorage.getItem('sofiyan_cart');
    if (saved) {
        let items = JSON.parse(saved);
        items = items.map((i: any) => {
           if (i.id === itemId) {
              const newQty = i.quantity + delta;
              return newQty > 0 ? { ...i, quantity: newQty } : i;
           }
           return i;
        });
        localStorage.setItem('sofiyan_cart', JSON.stringify(items));
        window.dispatchEvent(new Event('sofiyan_cart_changed'));
    }
  };
  
  const removeFromCartGlobal = (itemId: string) => {
    const saved = localStorage.getItem('sofiyan_cart');
    if (saved) {
        let items = JSON.parse(saved);
        items = items.filter((i: any) => i.id !== itemId);
        localStorage.setItem('sofiyan_cart', JSON.stringify(items));
        window.dispatchEvent(new Event('sofiyan_cart_changed'));
    }
  };
`;
code = code.replace(stateTarget, stateReplacement);

const handleCartChangeTarget = `    const handleCartChange = () => {
      try {
        const saved = localStorage.getItem('sofiyan_cart');
        setCartCount(saved ? JSON.parse(saved).length : 0);
      } catch {
        setCartCount(0);
      }
    };`;
const handleCartChangeReplacement = `    const handleCartChange = () => {
      try {
        const saved = localStorage.getItem('sofiyan_cart');
        setCartItems(saved ? JSON.parse(saved) : []);
      } catch {
        setCartItems([]);
      }
    };`;
code = code.replace(handleCartChangeTarget, handleCartChangeReplacement);

const buttonTarget = `              {/* Cart Button */}
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
                  <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white text-[9px] sm:text-[10px] font-black rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>`;

const buttonReplacement = `              {/* Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)} 
                className="bg-indigo-950 text-white hover:bg-black p-2 sm:p-2.5 rounded-xl transition-all relative flex items-center justify-center shadow-md shadow-indigo-900/10 active:scale-95 shrink-0"
                title="Cart / Checkout"
              >
                <span className="sr-only">Cart</span>
                <ShoppingCart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white text-[9px] sm:text-[10px] font-black rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>`;
code = code.replace(buttonTarget, buttonReplacement);

const returnEndTarget = `    </div>
  );
};`;
const returnEndReplacement = `
      {/* Side Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-[110] shadow-2xl flex flex-col border-l border-indigo-100"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-indigo-50/50">
                <h3 className="font-black text-indigo-950 flex items-center gap-2">
                  <ShoppingCart className="text-indigo-600 w-5 h-5" />
                  Your Cart
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <ShoppingCart size={48} className="text-gray-300" />
                    <p className="text-gray-500 font-medium">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex flex-col bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-indigo-100 transition-colors">
                        <div className="flex justify-between items-start gap-3 mb-3">
                          <p className="font-bold text-gray-800 text-sm leading-tight">{item.name}</p>
                          <span className="font-black text-indigo-600 whitespace-nowrap">₹{item.price}</span>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                           <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                              <button onClick={() => updateQuantityGlobal(item.id, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-md text-gray-600 transition-colors font-medium">-</button>
                              <span className="text-xs font-black w-8 text-center text-indigo-950">{item.quantity}</span>
                              <button onClick={() => updateQuantityGlobal(item.id, 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-md text-gray-600 transition-colors font-medium">+</button>
                           </div>
                           <button onClick={() => removeFromCartGlobal(item.id)} className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                              <Trash2 size={18} />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {cartItems.length > 0 && (
                <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-500">Subtotal</span>
                    <span className="font-black text-xl text-indigo-950">
                      ₹{cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)}
                    </span>
                  </div>
                  <Link 
                    to="/" 
                    onClick={() => {
                        setIsCartOpen(false);
                        setTimeout(() => window.dispatchEvent(new Event('sofiyan_open_cart')), 100);
                    }}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 active:scale-95"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};`;
code = code.replace(returnEndTarget, returnEndReplacement);

fs.writeFileSync('components/Layout.tsx', code);
console.log("Done");
